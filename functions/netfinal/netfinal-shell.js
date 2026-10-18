/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-shell.js — stage 4: terminal contexts and the command set.
 *
 * Spec: section 5 ("Terminal contexts", "Command set and accepted variants", "Logs") of
 *       ~/hexworth-shared/etwork essential final/
 *       "Network+ Final Exam — Meridian Corp Operations Lab Design Spec.md".
 *
 * ONE ENTRY POINT: exec(state, session, line) -> { out, session }. The session holds the context
 * stack and nothing else; all authority lives in `state`. That split is what lets stage 7 resume an
 * exam after a refresh by replaying nothing at all — the server already holds both.
 *
 * SERVER-ONLY, like the rest of the core. Commands are evaluated here and the page renders the
 * returned text, so what a student sees and what the grader reads are the same computation. A
 * client-side parser would be a second implementation of the network's behaviour.
 *
 * SHOW COMMANDS READ DERIVED TABLES; CONFIG COMMANDS MUTATE CONFIG. No command writes a table and
 * no command caches one. That is why `show mac address-table` changes the moment a trunk's allowed
 * list changes, with nothing to invalidate — the spec's golden-output criterion ("every command
 * returns output that changes when the relevant state changes") is a property of the architecture
 * rather than a thing to remember.
 *
 * WHAT PREFIX MATCHING MEANS HERE. IOS accepts the shortest UNAMBIGUOUS prefix of every keyword, so
 * `sh ip int br` is `show ip interface brief` and `sh ip` is an error because `interface` and
 * `route` both follow. Implemented as a trie walk over the registered command words, which means
 * ambiguity is computed from what is actually registered rather than from a hand-maintained list of
 * abbreviations that would drift the moment a command is added.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = require('./netfinal-topology.js');
    var CORE = require('./netfinal-core.js');
    var FAULTS = require('./netfinal-faults.js');
    var reach = CORE.reach, tables = CORE.tables, ip = CORE.ip;

    /* ── interface name normalisation ──────────────────────────────────────────────────────────────
     * Spec: "Interface names normalize to one form for grading: Fa0/7, FastEthernet0/7, and fa 0/7
     * are the same interface." Done once, here, so no command and no grader has to care. */
    var IF_FORMS = [
        [/^fast ?ethernet ?/i, 'Fa'], [/^fa ?/i, 'Fa'],
        [/^gigabit ?ethernet ?/i, 'Gi'], [/^gig ?/i, 'Gi'], [/^gi ?/i, 'Gi'],
        [/^ethernet ?/i, 'Eth'], [/^vlan ?/i, 'Vlan']
    ];
    function normIface(raw) {
        if (!raw) return null;
        var s = String(raw).trim().replace(/\s+/g, ' ');
        for (var i = 0; i < IF_FORMS.length; i++) {
            if (IF_FORMS[i][0].test(s)) {
                var rest = s.replace(IF_FORMS[i][0], '').replace(/\s+/g, '');
                return IF_FORMS[i][1] + rest;
            }
        }
        return s.replace(/\s+/g, '');
    }

    /* ── session ───────────────────────────────────────────────────────────────────────────────────
     * A stack of contexts. The bottom is always ADMIN-WS01; `ssh` pushes, `exit` pops. IOS adds
     * modes within one device (user exec -> privileged -> global config -> interface config), which
     * are properties of the top frame rather than separate frames, because `exit` from interface
     * config must land in global config and not log the student out. */
    function newSession() {
        return { stack: [{ device: 'ADMIN-WS01', platform: 'windows11', mode: 'host' }], editor: null };
    }
    function top(session) { return session.stack[session.stack.length - 1]; }

    function prompt(state, session) {
        var f = top(session);
        if (session.editor) return '';
        var host = f.device;
        if (f.platform === 'windows11') return 'C:\\Users\\student> ';
        if (f.platform === 'ubuntu24') return 'student@' + host.toLowerCase() + ':~$ ';
        /* IOS prompt encodes the mode, which is the only cue a student has for where they are. */
        if (f.mode === 'user') return host + '> ';
        if (f.mode === 'enable') return host + '# ';
        if (f.mode === 'config') return host + '(config)# ';
        if (f.mode === 'config-if') return host + '(config-if)# ';
        return host + '# ';
    }

    /* ── prefix matching ──────────────────────────────────────────────────────────────────────────
     * Walks the registered keywords. Returns the full words, or an error naming the ambiguity, so
     * the student sees what IOS would print rather than a generic failure. */
    function resolveWords(tokens, tree) {
        var words = [], node = tree, i = 0, badToken = null;
        while (i < tokens.length) {
            var t = tokens[i];
            var keys = Object.keys(node).filter(function (k) { return k !== '$' && k !== '$args'; });
            if (!keys.length) break;
            var exact = keys.filter(function (k) { return k === t.toLowerCase(); });
            var pref = exact.length ? exact : keys.filter(function (k) { return k.indexOf(t.toLowerCase()) === 0; });
            /* STOPPING BECAUSE A TOKEN MATCHED NOTHING is a different error from RUNNING OUT of
             * tokens, and IOS says so: `show bananas` is "% Invalid input detected at '^' marker."
             * while `sh ip` is "% Incomplete command." The two tell a student different things --
             * one means "that word is wrong", the other "keep typing" -- so the parser has to keep
             * them apart rather than flatten both into whichever message it reaches first. */
            if (!pref.length) { badToken = t; break; }
            if (pref.length > 1) {
                /* THE CANDIDATES ARE LISTED, which real IOS does not do -- it prints the bare
                 * "% Ambiguous command" and leaves you to guess. A deliberate divergence: this is a
                 * teaching platform, and a student who types `sh i` learns something from seeing
                 * that `interfaces` and `ip` collided. The abbreviation rule is the lesson; making
                 * them hunt for which word was short is not. */
                return { error: '% Ambiguous command: "' + tokens.slice(0, i + 1).join(' ') + '"'
                                + '  (could be: ' + pref.sort().join(', ') + ')',
                         ambiguous: pref.sort() };
            }
            words.push(pref[0]);
            node = node[pref[0]];
            i++;
            if (node.$) {
                /* A terminal node: the rest of the line is arguments, unless a deeper keyword also
                 * matches -- which is why `show ip route static` can extend `show ip route`. */
                var deeper = Object.keys(node).filter(function (k) { return k !== '$' && k !== '$args'; });
                if (!deeper.length || i >= tokens.length) break;
                var more = deeper.filter(function (k) { return k.indexOf((tokens[i] || '').toLowerCase()) === 0; });
                if (!more.length) break;
            }
        }
        if (!node.$) {
            return badToken !== null
                ? { error: "% Invalid input detected at '^' marker.", invalidToken: badToken, words: words }
                : { error: '% Incomplete command.', words: words };
        }
        return { words: words, handler: node.$, args: tokens.slice(i) };
    }

    function buildTree(spec) {
        var tree = {};
        Object.keys(spec).forEach(function (cmd) {
            var node = tree;
            cmd.split(' ').forEach(function (w) {
                node[w] = node[w] || {};
                node = node[w];
            });
            node.$ = spec[cmd];
        });
        return tree;
    }

    /* ── small shared renderers ────────────────────────────────────────────────────────────────── */
    function pad(s, n) { s = String(s === null || s === undefined ? '' : s); return s + ' '.repeat(Math.max(0, n - s.length)); }
    function table(headers, widths, rows) {
        var out = [headers.map(function (h, i) { return pad(h, widths[i]); }).join('').replace(/\s+$/, '')];
        rows.forEach(function (r) {
            out.push(r.map(function (c, i) { return pad(c, widths[i]); }).join('').replace(/\s+$/, ''));
        });
        return out.join('\n');
    }
    function nodeOf(state, name) {
        return CORE.buildIndex(state).byName[String(name).toUpperCase()];
    }
    function epOf(state, name) {
        return state.endpoints.filter(function (e) { return e.name === name; })[0];
    }
    /* The host a frame is running on, as something reach() accepts. */
    function selfName(session) { return top(session).device; }

    function devPorts(state, dev) { return state.ports[dev] || {}; }
    function macDots(m) {
        return m.toLowerCase().replace(/:/g, '').replace(/(.{4})(.{4})(.{4})/, '$1.$2.$3');
    }
    function trunkPortsOf(state, dev) {
        var ports = devPorts(state, dev);
        return Object.keys(ports).filter(function (pn) { return ports[pn].mode === 'trunk'; }).sort();
    }

    /* ═══ IOS: SHOW COMMANDS ══════════════════════════════════════════════════════════════════════
     * Each reads a derived table or the config and formats it. Nothing caches, which is why a fix
     * shows up in the very next command with nothing to invalidate -- the spec's golden-output
     * criterion is a property of the architecture rather than a thing to remember. */
    var IOS_SHOW = {};

    IOS_SHOW['show mac address-table'] = function (state, f, args) {
        var rows = tables.macTable(state, f.device);
        var a = args.map(function (x) { return x.toLowerCase(); });
        if (a[0] === 'address' && a[1]) {
            var want = a[1].replace(/[.:]/g, '');
            rows = rows.filter(function (r) { return r.mac.replace(/[.:]/g, '').toLowerCase() === want; });
        } else if (a[0] === 'interface' && a[1]) {
            var wi = normIface(args.slice(1).join(' '));
            rows = rows.filter(function (r) { return r.port === wi; });
        } else if (a[0] === 'vlan' && a[1]) {
            rows = rows.filter(function (r) { return r.vlan === Number(a[1]); });
        }
        var head = '          Mac Address Table\n-------------------------------------------\n';
        if (!rows.length) { return head + '\nTotal Mac Addresses for this criterion: 0'; }
        var body = table(['Vlan', 'Mac Address', 'Type', 'Ports'], [10, 20, 10, 12],
            rows.map(function (r) { return [r.vlan, macDots(r.mac), r.type.toLowerCase(), r.port]; }));
        return head + '\n' + body + '\nTotal Mac Addresses for this criterion: ' + rows.length;
    };

    /* S3's primary evidence. The ALLOWED list and the ACTIVE list are printed separately because
     * that difference IS the diagnosis: a VLAN can be allowed on one end and absent on the other. */
    IOS_SHOW['show interfaces trunk'] = function (state, f) {
        var ports = devPorts(state, f.device);
        var trunks = trunkPortsOf(state, f.device);
        if (!trunks.length) { return ''; }
        var head = table(['Port', 'Mode', 'Encapsulation', 'Status', 'Native vlan'], [12, 10, 16, 14, 12],
            trunks.map(function (pn) {
                var st = ports[pn].shutdown ? 'disabled' : (ports[pn].up === false ? 'notconnect' : 'trunking');
                return [pn, 'on', '802.1q', st, ports[pn].native || 1];
            }));
        var allowed = table(['Port', 'Vlans allowed on trunk'], [12, 44],
            trunks.map(function (pn) { return [pn, ports[pn].allowed.join(',')]; }));
        return head + '\n\n' + allowed;
    };

    /* S2's evidence: which ports sit in which VLAN. */
    IOS_SHOW['show vlan brief'] = function (state, f) {
        var ports = devPorts(state, f.device);
        var byVlan = {};
        Object.keys(ports).forEach(function (pn) {
            var p = ports[pn];
            if (p.mode !== 'access' || p.virtual) { return; }
            (byVlan[p.vlan === null ? 'unassigned' : p.vlan] = byVlan[p.vlan === null ? 'unassigned' : p.vlan] || []).push(pn);
        });
        var rows = Object.keys(byVlan).sort(function (a, b) { return Number(a) - Number(b); }).map(function (v) {
            var name = (state.subnets[v] && state.subnets[v].name) || (v === 'unassigned' ? 'unassigned' : 'VLAN' + v);
            return [v === 'unassigned' ? '-' : v, name.replace(/\s+/g, '-'), 'active', byVlan[v].join(', ')];
        });
        return table(['VLAN', 'Name', 'Status', 'Ports'], [8, 22, 10, 50], rows);
    };

    /* S1's evidence. Counters come from interfaceCounters, which reads the PORT -- so a damaged
     * access-port cable is visible here, which is the whole reason physical state lives on ports. */
    IOS_SHOW['show interfaces'] = function (state, f, args) {
        var wantErrors = /counters?\s+err/i.test(args.join(' '));
        var name = normIface(args.filter(function (a) { return !/^counters?$|^errors?$/i.test(a); }).join(' '));
        var ports = devPorts(state, f.device);
        var names = name ? [name] : Object.keys(ports).sort();
        var out = [];
        names.forEach(function (pn) {
            var p = ports[pn];
            if (!p) { out.push('% Invalid interface ' + pn); return; }
            var c = tables.interfaceCounters(state, f.device, pn, state.examElapsedSec || 0);
            var admin = p.shutdown ? 'administratively down' : 'up';
            var line = p.shutdown ? 'down' : (p.up === false ? 'down' : 'up');
            if (wantErrors) {
                out.push(pn + ' is ' + admin + ', line protocol is ' + line);
                out.push('  ' + c.duplex.charAt(0).toUpperCase() + c.duplex.slice(1) + '-duplex, ' + c.speed + 'Mb/s');
                out.push('  Input errors: ' + c.inputErrors + ', CRC: ' + c.crc
                    + ', frame: 0, overrun: 0, ignored: 0');
                out.push('  Output errors: 0, collisions: 0, late collisions: ' + c.lateCollisions);
                return;
            }
            out.push(pn + ' is ' + admin + ', line protocol is ' + line);
            out.push('  Hardware is FastEthernet, address is ' + macDots(state.devices[f.device].mac || '00:00:00:00:00:00'));
            out.push('  MTU 1500 bytes, BW ' + c.speed * 1000 + ' Kbit/sec, DLY 100 usec');
            out.push('  ' + c.duplex.charAt(0).toUpperCase() + c.duplex.slice(1) + '-duplex, ' + c.speed + 'Mb/s, media type is 10/100BaseTX');
            out.push('  ' + c.packets + ' packets input, ' + (c.packets * 94) + ' bytes');
            out.push('     Received 0 broadcasts, 0 runts, 0 giants');
            out.push('     ' + c.inputErrors + ' input errors, ' + c.crc + ' CRC, 0 frame, 0 overrun');
            out.push('  ' + c.packets + ' packets output, ' + (c.packets * 88) + ' bytes');
            out.push('     0 output errors, 0 collisions, ' + c.lateCollisions + ' late collisions');
        });
        return out.join('\n');
    };

    IOS_SHOW['show ip interface brief'] = function (state, f) {
        var rows = [];
        if (f.device === 'MeridianRTR-01') {
            Object.keys(state.svis).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (v) {
                var s = state.svis[v];
                rows.push([s.iface, s.ip, 'YES', 'manual', s.shutdown ? 'administratively down' : 'up', s.shutdown ? 'down' : 'up']);
            });
            rows.push(['Gi0/1', TOPO.FIXED_NETS.transit.rtr, 'YES', 'manual', 'up', 'up']);
            rows.push(['Gi0/0', 'unassigned', 'YES', 'unset', 'up', 'up']);
        } else {
            rows.push(['Vlan99', state.devices[f.device].mgmtIp, 'YES', 'manual', 'up', 'up']);
            var ports = devPorts(state, f.device);
            Object.keys(ports).sort().forEach(function (pn) {
                if (ports[pn].virtual) { return; }
                rows.push([pn, 'unassigned', 'YES', 'unset', ports[pn].shutdown ? 'administratively down' : 'up',
                    ports[pn].shutdown || ports[pn].up === false ? 'down' : 'up']);
            });
        }
        return table(['Interface', 'IP-Address', 'OK?', 'Method', 'Status', 'Protocol'], [22, 18, 6, 10, 24, 10], rows);
    };

    IOS_SHOW['show ip route'] = function (state, f, args) {
        var rs = tables.routeTable(state, f.device);
        if ((args[0] || '').toLowerCase().indexOf('stat') === 0) {
            rs = rs.filter(function (r) { return r.kind === 'static'; });
        }
        var out = ['Codes: C - connected, S - static, L - local', ''];
        rs.forEach(function (r) {
            var code = r.kind === 'connected' ? 'C' : 'S';
            if (r.prefix === 0) {
                out.push('S*    0.0.0.0/0 [1/0] via ' + r.nextHop);
                return;
            }
            out.push(code + '     ' + r.dest + '/' + r.prefix
                + (r.kind === 'connected' ? ' is directly connected, ' + r.iface
                                          : ' [1/0] via ' + r.nextHop + ', ' + r.iface));
        });
        return out.join('\n');
    };

    IOS_SHOW['show ip arp'] = function (state, f) {
        var rows = tables.arpTable(state, f.device).map(function (r) {
            return ['Internet', r.ip, r.age === null ? '-' : r.age, macDots(r.mac), 'ARPA', r.iface];
        });
        return table(['Protocol', 'Address', 'Age(min)', 'Hardware Addr', 'Type', 'Interface'], [11, 18, 11, 18, 7, 14], rows);
    };

    IOS_SHOW['show access-lists'] = function (state, f) {
        var sets = state.acls[f.device] || {};
        var names = Object.keys(sets);
        if (!names.length) { return ''; }
        var out = [];
        names.forEach(function (n) {
            var acl = sets[n];
            out.push('Extended IP access list ' + acl.name);
            acl.lines.forEach(function (l) {
                var parts = ['    ' + l.seq, l.action, l.proto,
                    l.src === 'any' ? 'any' : l.src, l.dst === 'any' ? 'any' : l.dst];
                if (l.dstPort !== undefined && l.dstPort !== null) { parts.push('eq ' + l.dstPort); }
                var s = parts.join(' ');
                if (l.hits) { s += ' (' + l.hits + ' matches)'; }
                out.push(s);
            });
            acl.applied.forEach(function (a) {
                out.push('        applied to ' + a.iface + ' ' + a.dir);
            });
        });
        return out.join('\n');
    };

    IOS_SHOW['show logging'] = function (state, f) {
        var lines = FAULTS.allLogs(state).filter(function (l) { return l.device === f.device; });
        if (!lines.length) { return 'Syslog logging: enabled\n\n(no messages)'; }
        return 'Syslog logging: enabled (0 messages dropped)\n\nLog Buffer (8192 bytes):\n'
            + lines.map(function (l) { return l.text; }).join('\n');
    };

    IOS_SHOW['show snmp community'] = function (state, f) {
        var d = state.devices[f.device];
        if (!d || !d.snmp) { return '% SNMP agent not enabled'; }
        return 'Community name: ' + d.snmp.community + ' (ro)'
            + (d.snmp.authFailures ? '\nAuthentication failures: ' + d.snmp.authFailures : '');
    };

    IOS_SHOW['show clock'] = function (state, f) {
        var n = state.devices[f.device] && state.devices[f.device].ntp;
        if (!n) { return '*00:00:00.000 UTC Mon Jan 1 1900'; }
        /* Deliberately derived from the offset rather than a real clock, so the output is
         * deterministic and S12B's "timestamps years out of date" is reproducible. */
        var base = 1760000000;
        var t = base - (n.synchronized ? 0 : n.offsetSec);
        var d = new Date(t * 1000);
        return (n.synchronized ? '' : '*') + d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
            + ' UTC' + (n.synchronized ? '' : '  (clock is UNSYNCHRONIZED)');
    };

    IOS_SHOW['show ntp status'] = function (state, f) {
        var n = state.devices[f.device] && state.devices[f.device].ntp;
        if (!n) { return '%NTP is not enabled.'; }
        return 'Clock is ' + (n.synchronized ? 'synchronized' : 'unsynchronized')
            + ', stratum ' + (n.synchronized ? 3 : 16) + ', reference is ' + n.server
            + '\nnominal freq is 250.0000 Hz, actual freq is 250.0000 Hz'
            + '\nreference time is ' + n.server + ', offset ' + n.offsetSec + '.000 sec';
    };

    IOS_SHOW['show running-config'] = function (state, f, args) {
        var out = ['Building configuration...', '', 'hostname ' + f.device, '!'];
        var wantIf = null;
        if ((args[0] || '').toLowerCase().indexOf('int') === 0) { wantIf = normIface(args.slice(1).join(' ')); }
        var emitSvi = function (v) {
            var svi = state.svis[v];
            out.push('interface ' + svi.iface);
            out.push(' encapsulation dot1Q ' + v);
            /* The MASK lives here and nowhere else a student can see it: `show ip interface brief`
             * prints addresses only, which is exactly why S5A's evidence is the running config. */
            out.push(' ip address ' + svi.ip + ' ' + svi.mask);
            if (svi.shutdown) { out.push(' shutdown'); }
            out.push('!');
        };
        var emitPort = function (pn) {
            var p = state.ports[f.device][pn];
            out.push('interface ' + pn);
            if (p.mode === 'access' && p.vlan) { out.push(' switchport mode access'); out.push(' switchport access vlan ' + p.vlan); }
            if (p.mode === 'trunk') { out.push(' switchport mode trunk'); out.push(' switchport trunk allowed vlan ' + p.allowed.join(',')); }
            if (p.duplex && p.duplex !== 'full') { out.push(' duplex ' + p.duplex); }
            if (p.duplexForced) { out.push(' duplex ' + p.duplex); }
            if (p.shutdown) { out.push(' shutdown'); }
            out.push('!');
        };
        if (wantIf) {
            var m = String(wantIf).match(/^Gi0\/0\.(\d+)$/);
            if (m && state.svis[Number(m[1])]) { out = ['Building configuration...', '']; emitSvi(Number(m[1])); return out.join('\n'); }
            if ((state.ports[f.device] || {})[wantIf]) { out = ['Building configuration...', '']; emitPort(wantIf); return out.join('\n'); }
            return '% Invalid interface ' + wantIf;
        }
        if (f.device === 'MeridianRTR-01') {
            Object.keys(state.svis).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (v) { emitSvi(Number(v)); });
            (state.routes[f.device] || []).filter(function (r) { return r.kind === 'static'; }).forEach(function (r) {
                out.push('ip route ' + ip.toStr(r.dest) + ' ' + ip.prefixToMask(r.prefix) + ' ' + r.nextHop);
            });
            var sets = state.acls[f.device] || {};
            Object.keys(sets).forEach(function (n) {
                out.push('ip access-list extended ' + n);
                sets[n].lines.forEach(function (l) {
                    out.push(' ' + l.seq + ' ' + l.action + ' ' + l.proto + ' ' + l.src + ' ' + l.dst
                        + (l.dstPort ? ' eq ' + l.dstPort : ''));
                });
                out.push('!');
            });
        } else {
            Object.keys(state.ports[f.device] || {}).sort().forEach(function (pn) {
                if (!state.ports[f.device][pn].virtual) { emitPort(pn); }
            });
        }
        var d = state.devices[f.device];
        if (d && d.snmp) { out.push('snmp-server community ' + d.snmp.community + ' RO'); }
        if (d && d.ntp) { out.push('ntp server ' + d.ntp.server); }
        out.push('end');
        return out.join('\n');
    };

    IOS_SHOW['show arp'] = function (state, f, args) { return IOS_SHOW['show ip arp'](state, f, args); };
    IOS_SHOW['show vlan'] = function (state, f, args) { return IOS_SHOW['show vlan brief'](state, f, args); };
    IOS_SHOW['show ip access-lists'] = function (state, f, args) { return IOS_SHOW['show access-lists'](state, f, args); };
    IOS_SHOW['show lldp neighbors detail'] = function (state, f, args) { return IOS_SHOW['show cdp neighbors detail'](state, f, args); };

    IOS_SHOW['show cdp neighbors detail'] = function (state, f) {
        var out = [];
        state.links.forEach(function (l) {
            var near = null, far = null;
            if (l.a[0] === f.device) { near = l.a[1]; far = l.b; }
            else if (l.b[0] === f.device) { near = l.b[1]; far = l.a; }
            if (!near) { return; }
            var d = state.devices[far[0]];
            out.push('-------------------------');
            out.push('Device ID: ' + far[0]);
            out.push('Entry address(es):');
            out.push('  IP address: ' + (d ? d.mgmtIp : 'unknown'));
            out.push('Platform: ' + (d ? d.platform : 'unknown') + ',  Capabilities: Router Switch');
            out.push('Interface: ' + near + ',  Port ID (outgoing port): ' + far[1]);
        });
        return out.length ? out.join('\n') : '% No CDP neighbours';
    };

    /* ═══ DIAGNOSTICS: ping, traceroute, name lookup ══════════════════════════════════════════════
     * All three call reach(), which is the spec's requirement ("ping, tracert, nslookup/dig, the
     * firewall's diagnostic ping, router ping ... source, and every fix grader call reach()"). That
     * is what makes the evidence a student gathers and the state a grader reads the same thing. */
    function renderPing(state, src, dst, opts) {
        var r = reach(state, src, dst, opts || {});
        var shown = (r.dns && r.dns.answer) ? (dst + ' [' + r.dns.answer + ']') : dst;
        if (r.ok) {
            /* The reply line is built BEFORE repeating it. Written inline, `.repeat(4)` bound to
             * the trailing literal alone and lines 2-4 lost their "Reply from <addr>" prefix. */
            var reply = 'Reply from ' + (r.dns ? r.dns.answer : dst) + ': bytes=32 time<1ms TTL=128';
            return 'Pinging ' + shown + ' with 32 bytes of data:\n'
                + [reply, reply, reply, reply].join('\n')
                + '\n\nPing statistics: Sent = 4, Received = 4, Lost = 0 (0% loss)';
        }
        var why = r.failedAt ? ('L' + r.failedAt.layer + ' at ' + (r.failedAt.device || 'source') + ': ' + r.failedAt.reason) : 'unknown';
        /* The reason is printed. A real ping would not say this much, but the spec wants students to
         * get "real evidence of where a path breaks", and hiding it behind a generic timeout would
         * make several faults indistinguishable from each other. */
        return 'Pinging ' + shown + ' with 32 bytes of data:\n'
            + ['Request timed out.', 'Request timed out.', 'Request timed out.', 'Request timed out.'].join('\n')
            + '\n\nPing statistics: Sent = 4, Received = 0, Lost = 4 (100% loss)\n'
            + '  [diagnostic] ' + why;
    }

    function renderTrace(state, src, dst, opts) {
        var r = reach(state, src, dst, opts || {});
        var out = ['Tracing route to ' + dst + (r.dns ? ' [' + r.dns.answer + ']' : '') + ' over a maximum of 30 hops:', ''];
        (r.hops || []).forEach(function (h, i) {
            if (i === 0) { return; }     // the origin is not a hop
            out.push('  ' + i + '    <1 ms   <1 ms   <1 ms  ' + h.ip + '  [' + h.device + ']');
        });
        /* Spec: "tracert prints hops[] and stops at failedAt." The stop line names the device and
         * the layer, which is what makes tracert the fastest way to localise a fault. */
        if (!r.ok) {
            var n = Math.max(1, (r.hops || []).length);
            out.push('  ' + n + '    *        *        *     Request timed out.');
            out.push('');
            out.push('Trace stopped at ' + (r.failedAt.device || src)
                + ' (layer ' + r.failedAt.layer + (LAYER_NAME[r.failedAt.layer] ? ', ' + LAYER_NAME[r.failedAt.layer] : '') + '): '
                + r.failedAt.reason);
        } else {
            out.push('');
            out.push('Trace complete.');
        }
        return out.join('\n');
    }

    function renderLookup(state, src, name, server) {
        var node = nodeOf(state, src);
        var resolver = server || (node && node.dns) || state.dns.server;
        var probe = Object.assign({}, node, { dns: resolver });
        var idx = CORE.buildIndex(state);
        /* Resolution is asked of reach() indirectly: a name lookup is a path to the resolver plus a
         * zone read, and reach() already does both. Calling it with the NAME gives both answers. */
        var r = reach(state, src, name, { proto: 'udp', port: 53 });
        var out = ['Server:  ' + resolver, 'Address:  ' + resolver + '#53', ''];
        if (r.dns && r.dns.answer) {
            out.push('Name:    ' + name);
            out.push('Address: ' + r.dns.answer);
            if (r.dns.serial) { out.push('(zone serial ' + r.dns.serial + ')'); }
            return out.join('\n');
        }
        var reason = r.failedAt ? r.failedAt.reason : 'lookup failed';
        out.push('*** ' + resolver + " can't find " + name + ': ' + (/NXDOMAIN/.test(reason) ? 'Non-existent domain' : reason));
        return out.join('\n');
    }

    var LAYER_NAME = { 1: 'physical', 2: 'data link', 2.5: 'data link / network', 3: 'network',
                       3.5: 'network / transport', 4: 'transport', 7: 'application' };

    /* ═══ WINDOWS ═════════════════════════════════════════════════════════════════════════════════ */
    var WIN = {};

    WIN['ipconfig'] = function (state, f, args) {
        var e = epOf(state, f.device);
        var all = /\/all/i.test(args.join(' '));
        var out = ['Windows IP Configuration', ''];
        if (all) {
            out.push('   Host Name . . . . . . . . . . . . : ' + f.device);
            out.push('   DNS Suffix Search List. . . . . . : ' + state.dns.origin);
            out.push('');
        }
        out.push('Ethernet adapter Ethernet0:');
        out.push('');
        if (all) {
            out.push('   Description . . . . . . . . . . . : Intel(R) Ethernet Connection');
            out.push('   Physical Address. . . . . . . . . : ' + (e ? e.mac.replace(/:/g, '-') : ''));
            out.push('   DHCP Enabled. . . . . . . . . . . : ' + (e && e.dhcp ? 'Yes' : 'No'));
        }
        if (!e || !e.ip) { out.push('   Media State . . . . . . . . . . . : Media disconnected'); return out.join('\n'); }
        var apipa = /^169\.254\./.test(e.ip);
        out.push('   IPv4 Address. . . . . . . . . . . : ' + e.ip + (apipa ? '(Preferred)  [Autoconfiguration]' : '(Preferred)'));
        out.push('   Subnet Mask . . . . . . . . . . . : ' + e.mask);
        out.push('   Default Gateway . . . . . . . . . : ' + (e.gw || ''));
        if (all) {
            out.push('   DHCP Server . . . . . . . . . . . : ' + (e.lease ? e.lease.server : ''));
            out.push('   DNS Servers . . . . . . . . . . . : ' + (e.dns || ''));
            out.push('   Lease Obtained. . . . . . . . . . : ' + (e.lease ? e.lease.pool : 'none'));
        }
        return out.join('\n');
    };

    /* Registered as `arp`, not `arp -a`. The two-word key meant the parser walked 'arp' then tried
     * to prefix-match '-d' against '-a' and failed, so `arp -d *` -- which spec section 5 lists as
     * accepted, and which question 41's proof REQUIRES -- was "not recognized". Found by the
     * stage-6 perfect run scoring 41 at half credit for a missing prerequisite. */
    WIN['arp'] = function (state, f, args) {
        if (/^-d/.test(args[0] || '')) {
            /* `arp -d *` clears the cache. The cache is DERIVED, so clearing it is a no-op on state
             * and the next read re-learns -- which is exactly what the S4A graded state describes:
             * after arp -d *, WS01 learns the real gateway MAC once the rogue's port is shut. */
            return '';
        }
        var rows = tables.arpTable(state, f.device).map(function (r) {
            return [r.ip, r.mac.toLowerCase().replace(/:/g, '-'), r.gateway || r.spoofed || r.duplicate ? 'dynamic' : 'dynamic'];
        });
        var e = epOf(state, f.device);
        return 'Interface: ' + (e ? e.ip : '') + ' --- 0x5\n'
            + table(['  Internet Address', 'Physical Address', 'Type'], [22, 22, 10], rows);
    };

    WIN['route print'] = function (state, f) {
        var e = epOf(state, f.device);
        if (!e || !e.ip) { return 'No usable routes.'; }
        var net = ip.toStr(ip.networkOf(ip.toInt(e.ip), ip.maskToPrefix(e.mask)));
        var rows = [
            ['0.0.0.0', '0.0.0.0', e.gw || 'On-link', e.ip, '25'],
            [net, e.mask, 'On-link', e.ip, '281'],
            ['127.0.0.0', '255.0.0.0', 'On-link', '127.0.0.1', '331']
        ];
        return 'IPv4 Route Table\n===========================================================================\nActive Routes:\n'
            + table(['Network Destination', 'Netmask', 'Gateway', 'Interface', 'Metric'], [22, 18, 18, 18, 8], rows);
    };

    WIN['ping'] = function (state, f, args) {
        var target = args.filter(function (a) { return !/^-/.test(a); })[0];
        if (!target) { return 'Usage: ping <target>'; }
        return renderPing(state, f.device, target, { proto: 'icmp' });
    };
    WIN['tracert'] = function (state, f, args) {
        var target = args.filter(function (a) { return !/^-/.test(a); })[0];
        if (!target) { return 'Usage: tracert <target>'; }
        return renderTrace(state, f.device, target, { proto: 'icmp' });
    };
    WIN['nslookup'] = function (state, f, args) {
        if (!args[0]) { return 'Default Server:  ' + ((epOf(state, f.device) || {}).dns || state.dns.server); }
        return renderLookup(state, f.device, args[0], args[1]);
    };
    /* THE SPEC'S "ALSO ACCEPTED" COLUMN (section 5). Each is the same handler under the other name,
     * because a student who types the documented alternative has answered the question. */
    WIN['netstat'] = function (state, f, args) {
        if (/^-r/.test(args[0] || '')) { return WIN['route print'](state, f, args); }
        return 'netstat: only -r is implemented in this lab';
    };
    WIN['pathping'] = function (state, f, args) { return WIN['tracert'](state, f, args); };
    WIN['resolve-dnsname'] = function (state, f, args) { return WIN['nslookup'](state, f, args); };

    /* ═══ FILES ON THE LINUX SERVER ═══════════════════════════════════════════════════════════════
     * RENDERED FROM STATE, never stored as the source of truth. `cat` shows the current config
     * because it is generated from the same fields the services read, so a config file and the
     * running service can never disagree about what was configured -- only about what was LOADED,
     * which is S10B's distinction and is modelled separately by dns.zoneFile versus dns.loaded.
     *
     * Saving parses the handful of fields the faults touch back into state. A full config parser
     * would be a second implementation of the schema; a narrow one that reports what it did not
     * understand is honest and is what the validators (`named-checkzone`, `kea-dhcp4 -t`) exist to
     * complain about. */
    var KEA_CONF = '/etc/kea/kea-dhcp4.conf';
    var ZONE_FILE = '/etc/bind/db.meridian.local';
    var LEASE_FILE = '/var/lib/kea/kea-leases4.csv';

    /* The on-disk view: live config with any pending edit laid over it, because that is what a
     * file actually contains after a save and before a restart. */
    function keaOnDisk(state, v) {
        var live = state.dhcp.subnets[v];
        var pend = (state.dhcp.pending || {})[v];
        if (!pend) { return live; }
        return { vlan: live.vlan, subnet: live.subnet, pool: pend.pool || live.pool,
                 routers: pend.routers || live.routers, dns: live.dns };
    }

    function renderKea(state) {
        var subs = Object.keys(state.dhcp.subnets).sort(function (a, b) { return Number(a) - Number(b); });
        var out = ['{', '  "Dhcp4": {', '    "interfaces-config": { "interfaces": [ "eth0" ] },',
                   '    "valid-lifetime": 3600,', '    "subnet4": ['];
        subs.forEach(function (v, i) {
            var c = keaOnDisk(state, v);
            out.push('      {');
            out.push('        "id": ' + v + ',');
            out.push('        "subnet": "' + c.subnet + '",');
            out.push('        "pools": [ { "pool": "' + c.pool.start + ' - ' + c.pool.end + '" } ],');
            out.push('        "option-data": [');
            out.push('          { "name": "routers", "data": "' + c.routers + '" },');
            out.push('          { "name": "domain-name-servers", "data": "' + c.dns + '" }');
            out.push('        ]' + (state.dhcp.reservations.filter(function (r) { return r.vlan === Number(v); }).length ? ',' : ''));
            var res = state.dhcp.reservations.filter(function (r) { return r.vlan === Number(v); });
            if (res.length) {
                out.push('        "reservations": [');
                res.forEach(function (r, j) {
                    out.push('          { "hw-address": "' + r.mac.toLowerCase() + '", "ip-address": "' + r.ip + '"'
                        + (r.options ? ', "option-data": [ { "name": "routers", "data": "' + r.options.routers + '" } ]' : '')
                        + ' }' + (j < res.length - 1 ? ',' : ''));
                });
                out.push('        ]');
            }
            out.push('      }' + (i < subs.length - 1 ? ',' : ''));
        });
        out.push('    ]', '  }', '}');
        return out.join('\n');
    }

    function renderZone(state) {
        var z = state.dns.zoneFile;
        var out = ['$TTL 3600',
            '@       IN  SOA ns1.' + state.dns.origin + '. admin.' + state.dns.origin + '. (',
            '            ' + z.serial + ' ; serial',
            '            3600 ; refresh', '            600 ; retry',
            '            604800 ; expire', '            3600 ) ; minimum',
            '@       IN  NS  ns1.' + state.dns.origin + '.', ''];
        z.records.forEach(function (r) {
            out.push(pad(r.name, 16) + 'IN  ' + r.type + '   ' + r.target);
        });
        return out.join('\n');
    }

    function renderLeases(state) {
        var out = ['address,hwaddr,client_id,valid_lifetime,expire,subnet_id,fqdn_fwd,fqdn_rev,hostname'];
        tables.dhcpLeases(state).forEach(function (l) {
            out.push([l.ip, l.mac.toLowerCase(), '', 3600, 1760003600, l.vlan, 0, 0, l.host.toLowerCase()].join(','));
        });
        return out.join('\n');
    }

    function renderFile(state, device, path) {
        if (device === 'MER-SRV01' && path === KEA_CONF) { return renderKea(state); }
        if (device === 'MER-SRV01' && path === ZONE_FILE) { return renderZone(state); }
        if (device === 'MER-SRV01' && path === LEASE_FILE) { return renderLeases(state); }
        if (path === '/var/log/syslog') {
            return FAULTS.allLogs(state).filter(function (l) { return l.device === device; })
                .map(function (l) { return 'Oct 17 09:14:02 ' + device.toLowerCase() + ' ' + l.facility + ': ' + l.text; })
                .join('\n');
        }
        var own = (state.devices[device] || {}).files || {};
        return own[path] !== undefined ? own[path] : null;
    }

    /* Parse an edited file back into state. Returns what it understood and what it did not, so a
     * student who mangles the syntax learns from the validator rather than from silence. */
    function saveFile(state, device, path, text) {
        var applied = [], ignored = [];
        if (device === 'MER-SRV01' && path === KEA_CONF) {
            var subs = {};
            var current = null;
            text.split('\n').forEach(function (line) {
                var m = line.match(/"id"\s*:\s*(\d+)/);
                if (m) { current = Number(m[1]); return; }
                var p = line.match(/"pool"\s*:\s*"([\d.]+)\s*-\s*([\d.]+)"/);
                if (p && current !== null) {
                    subs[current] = subs[current] || {};
                    subs[current].pool = { start: p[1], end: p[2] };
                    applied.push('VLAN ' + current + ' pool ' + p[1] + ' - ' + p[2]);
                    return;
                }
                var r = line.match(/"name"\s*:\s*"routers"\s*,\s*"data"\s*:\s*"([\d.]+)"/);
                if (r && current !== null && !/hw-address/.test(line)) {
                    subs[current] = subs[current] || {};
                    subs[current].routers = r[1];
                    applied.push('VLAN ' + current + ' routers ' + r[1]);
                }
            });
            /* THE EDIT GOES TO A PENDING CONFIG, NOT TO LIVE STATE. Writing it straight through
             * made a saved file take effect immediately, which contradicts the spec's own rule --
             * "a service does not use a changed file until it is reloaded or restarted" -- and
             * contradicted the warning this very function prints. Kea now has the same two-copy
             * shape DNS already had (zoneFile versus loaded), so the lesson holds in both places
             * instead of only the one where a fault happened to teach it. */
            state.dhcp.pending = state.dhcp.pending || {};
            Object.keys(subs).forEach(function (v) {
                if (!state.dhcp.subnets[v]) { ignored.push('VLAN ' + v + ' is not a configured subnet'); return; }
                state.dhcp.pending[v] = state.dhcp.pending[v] || {};
                if (subs[v].pool) { state.dhcp.pending[v].pool = subs[v].pool; }
                if (subs[v].routers) { state.dhcp.pending[v].routers = subs[v].routers; }
            });
            state.devices[device].files = state.devices[device].files || {};
            state.devices[device].files[path] = text;
            state.devices[device].keaDirty = true;
            return { applied: applied, ignored: ignored };
        }
        if (device === 'MER-SRV01' && path === ZONE_FILE) {
            var serial = null, recs = [];
            text.split('\n').forEach(function (line) {
                var sm = line.match(/(\d{6,})\s*;\s*serial/);
                if (sm) { serial = Number(sm[1]); return; }
                var rm = line.match(/^(\S+)\s+IN\s+(A)\s+([\d.]+)\s*$/);
                if (rm) { recs.push({ name: rm[1], type: rm[2], target: rm[3] }); }
            });
            if (serial === null) { ignored.push('no serial found in the SOA'); }
            else { state.dns.zoneFile.serial = serial; applied.push('serial ' + serial); }
            if (recs.length) { state.dns.zoneFile.records = recs; applied.push(recs.length + ' A records'); }
            state.devices[device].files = state.devices[device].files || {};
            state.devices[device].files[path] = text;
            return { applied: applied, ignored: ignored };
        }
        state.devices[device] = state.devices[device] || {};
        state.devices[device].files = state.devices[device].files || {};
        state.devices[device].files[path] = text;
        return { applied: ['written'], ignored: [] };
    }

    /* ═══ LINUX ═══════════════════════════════════════════════════════════════════════════════════ */
    var LIN = {};

    LIN['ip addr'] = function (state, f) {
        var d = state.devices[f.device];
        var pfx = d.mask ? ip.maskToPrefix(d.mask) : 24;
        return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n'
            + '    inet 127.0.0.1/8 scope host lo\n'
            + '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n'
            + '    link/ether ' + (d.mac || '') + ' brd ff:ff:ff:ff:ff:ff\n'
            + '    inet ' + d.mgmtIp + '/' + pfx + ' brd + scope global eth0';
    };

    LIN['arp'] = function (state, f, args) {
        if (/^-n/.test(args[0] || '')) { return LIN['ip neigh'](state, f, args); }
        return 'arp: use -n in this lab';
    };
    LIN['ip neigh'] = function (state, f) {
        return tables.arpTable(state, f.device).map(function (r) {
            return r.ip + ' dev eth0 lladdr ' + r.mac.toLowerCase() + ' REACHABLE';
        }).join('\n') || '(empty)';
    };

    LIN['ss -tulpn'] = function (state, f) {
        var svc = state.services[f.device] || { tcp: [], udp: [] };
        var rows = [];
        (svc.tcp || []).forEach(function (p) { rows.push(['tcp', 'LISTEN', '0', '128', '0.0.0.0:' + p, '0.0.0.0:*']); });
        (svc.udp || []).forEach(function (p) { rows.push(['udp', 'UNCONN', '0', '0', '0.0.0.0:' + p, '0.0.0.0:*']); });
        return table(['Netid', 'State', 'Recv-Q', 'Send-Q', 'Local Address:Port', 'Peer Address:Port'],
            [8, 9, 9, 9, 24, 20], rows);
    };

    LIN['dig'] = function (state, f, args) {
        var name = args.filter(function (a) { return !/^@/.test(a) && !/^[-+]/.test(a); })[0];
        var srv = (args.filter(function (a) { return /^@/.test(a); })[0] || '').replace('@', '') || null;
        if (!name) { return '; usage: dig <name> [@server]'; }
        var r = reach(state, f.device, name, { proto: 'udp', port: 53 });
        var head = '; <<>> DiG 9.18 <<>> ' + args.join(' ') + '\n;; QUESTION SECTION:\n;' + name + '.\t\tIN\tA\n';
        if (r.dns && r.dns.answer) {
            return head + '\n;; ANSWER SECTION:\n' + name + '.\t3600\tIN\tA\t' + r.dns.answer
                + '\n\n;; SERVER: ' + (srv || state.dns.server) + '#53\n;; status: NOERROR';
        }
        var reason = r.failedAt ? r.failedAt.reason : 'failure';
        return head + '\n;; status: ' + (/NXDOMAIN/.test(reason) ? 'NXDOMAIN' : 'SERVFAIL')
            + '\n;; ' + reason;
    };

    LIN['cat'] = function (state, f, args) {
        var path = args[0];
        if (!path) { return 'cat: missing operand'; }
        var txt = renderFile(state, f.device, path);
        return txt === null ? 'cat: ' + path + ': No such file or directory' : txt;
    };
    LIN['tail'] = function (state, f, args) {
        var n = 10, rest = args.slice();
        var ni = rest.indexOf('-n');
        if (ni >= 0) { n = Number(rest[ni + 1]) || 10; rest.splice(ni, 2); }
        var txt = renderFile(state, f.device, rest[0]);
        if (txt === null) { return 'tail: cannot open ' + rest[0]; }
        var lines = txt.split('\n');
        return lines.slice(Math.max(0, lines.length - n)).join('\n');
    };
    LIN['grep'] = function (state, f, args) {
        var pat = args[0], path = args[1];
        var txt = renderFile(state, f.device, path);
        if (txt === null) { return 'grep: ' + path + ': No such file or directory'; }
        var re;
        try { re = new RegExp(pat, 'i'); } catch (e) { return 'grep: invalid pattern'; }
        return txt.split('\n').filter(function (l) { return re.test(l); }).join('\n');
    };

    LIN['journalctl -u'] = function (state, f, args) {
        var unit = (args[0] || '').replace(/\.service$/, '');
        var lines = FAULTS.allLogs(state).filter(function (l) {
            return l.device === f.device && (!unit || l.facility.indexOf(unit.split('-')[0]) === 0 || unit.indexOf(l.facility) === 0);
        });
        if (!lines.length) { return '-- No entries --'; }
        return lines.map(function (l) { return 'Oct 17 09:14:02 ' + f.device.toLowerCase() + ' ' + l.facility + '[812]: ' + l.text; }).join('\n');
    };

    LIN['systemctl'] = function (state, f, args) {
        var verb = (args[0] || '').toLowerCase(), unit = (args[1] || '').replace(/\.service$/, '');
        var d = state.devices[f.device];
        if (verb === 'status') {
            var loaded = unit.indexOf('named') === 0 || unit.indexOf('bind') === 0
                ? 'zone serial ' + state.dns.loaded.serial
                : (d.keaDirty ? 'config on disk is NEWER than the running config' : 'config loaded');
            return '* ' + unit + '.service - ' + unit + '\n   Loaded: loaded\n   Active: active (running)\n   Status: ' + loaded;
        }
        if (verb === 'restart' || verb === 'reload') {
            if (unit.indexOf('kea') === 0) {
                /* Adopting the pending config IS the restart. Nothing else applies it. */
                Object.keys(state.dhcp.pending || {}).forEach(function (v) {
                    if (!state.dhcp.subnets[v]) { return; }
                    var pend = state.dhcp.pending[v];
                    if (pend.pool) { state.dhcp.subnets[v].pool = pend.pool; }
                    if (pend.routers) { state.dhcp.subnets[v].routers = pend.routers; }
                });
                state.dhcp.pending = {};
                d.keaDirty = false;
                CORE.resolveLeases(state);
                return '';   /* systemctl is silent on success, which is itself a lesson */
            }
            if (unit.indexOf('named') === 0 || unit.indexOf('bind') === 0) {
                var did = FAULTS.reloadZone(state);
                return did ? '' : '';   /* also silent: only `dig` reveals whether the serial moved */
            }
            return '';
        }
        return 'Unknown operation ' + verb;
    };

    LIN['rndc reload'] = function (state) {
        var did = FAULTS.reloadZone(state);
        return did ? 'server reload successful' : 'server reload successful';
    };

    LIN['named-checkzone'] = function (state, f, args) {
        var zone = args[0] || state.dns.origin;
        var txt = renderFile(state, f.device, args[1] || ZONE_FILE);
        if (txt === null) { return 'zone ' + zone + ': file not found'; }
        if (!/\d{6,}\s*;\s*serial/.test(txt)) { return 'zone ' + zone + ': SOA serial missing\nFAILED'; }
        var bad = txt.split('\n').filter(function (l) {
            return /^\S+\s+IN\s+A\s+/.test(l) && !/^\S+\s+IN\s+A\s+(\d{1,3}\.){3}\d{1,3}\s*$/.test(l);
        });
        if (bad.length) { return 'zone ' + zone + ': not a valid address: ' + bad[0].trim() + '\nFAILED'; }
        return 'zone ' + zone + '/IN: loaded serial ' + state.dns.zoneFile.serial + '\nOK';
    };

    LIN['kea-dhcp4 -t'] = function (state, f, args) {
        var txt = renderFile(state, f.device, args[0] || KEA_CONF);
        if (txt === null) { return 'Unable to open ' + (args[0] || KEA_CONF); }
        /* Validates the ON-DISK config, not the running one. Checking the running config would make
         * the validator useless for its only purpose: telling you whether it is safe to restart. */
        var probe = JSON.parse(JSON.stringify(state));
        Object.keys(probe.dhcp.pending || {}).forEach(function (v) {
            if (!probe.dhcp.subnets[v]) { return; }
            var pend = probe.dhcp.pending[v];
            if (pend.pool) { probe.dhcp.subnets[v].pool = pend.pool; }
            if (pend.routers) { probe.dhcp.subnets[v].routers = pend.routers; }
        });
        var probs = FAULTS.checkInvariants(probe).filter(function (i) { return i.id === 'dhcp-pools-sane'; });
        if (probs.length) { return 'Error: configuration error: ' + probs[0].detail; }
        return 'Config checked. No errors.';
    };

    LIN['ping'] = function (state, f, args) {
        var target = args.filter(function (a) { return !/^-/.test(a); })[0];
        if (!target) { return 'ping: usage error'; }
        return renderPing(state, f.device, target, { proto: 'icmp' });
    };
    LIN['ifconfig'] = function (state, f, args) {
        return '(ifconfig is deprecated; use `ip addr`)\n' + LIN['ip addr'](state, f, args);
    };
    LIN['netstat'] = function (state, f, args) {
        if (/tul/.test(args.join(''))) { return LIN['ss -tulpn'](state, f, args); }
        return 'netstat: use -tulpn in this lab';
    };
    LIN['host'] = function (state, f, args) { return LIN['dig'](state, f, args); };
    LIN['traceroute'] = function (state, f, args) {
        var target = args.filter(function (a) { return !/^-/.test(a); })[0];
        return renderTrace(state, f.device, target, { proto: 'icmp' });
    };

    /* ═══ IOS: CONFIG COMMANDS ════════════════════════════════════════════════════════════════════
     * Every expected fix in the catalog is reachable from here. These mutate CONFIG only; the
     * derived tables and reach() pick the change up on the next read, so there is nothing to
     * invalidate and no way for a fix to be visible to the grader but not to the student. */
    var IOS_CONF = {};

    function requireIf(state, session) {
        var f = top(session);
        if (f.mode !== 'config-if' || !f.iface) { return null; }
        return f;
    }

    IOS_CONF['switchport access vlan'] = function (state, session, args) {
        var f = requireIf(state, session);
        if (!f) { return '% Command rejected: not in interface configuration mode'; }
        var v = Number(args[0]);
        if (!state.subnets[v]) { return '% VLAN ' + args[0] + ' does not exist'; }
        var p = (state.ports[f.device] || {})[f.iface];
        if (!p) { return '% Invalid interface'; }
        p.mode = 'access';
        p.vlan = v;
        delete p.allowed;
        CORE.resolveLeases(state);
        return '';
    };

    IOS_CONF['switchport trunk allowed vlan'] = function (state, session, args) {
        var f = requireIf(state, session);
        if (!f) { return '% Command rejected: not in interface configuration mode'; }
        var p = (state.ports[f.device] || {})[f.iface];
        if (!p || p.mode !== 'trunk') { return '% Command rejected: the interface is not a trunk'; }
        var verb = (args[0] || '').toLowerCase();
        var listOf = function (s) {
            if (!s) { return []; }
            if (s.toLowerCase() === 'all') { return [10, 20, 30, 40, 99]; }
            var out = [];
            String(s).split(',').forEach(function (part) {
                var m = part.match(/^(\d+)-(\d+)$/);
                if (m) { for (var i = Number(m[1]); i <= Number(m[2]); i++) { out.push(i); } }
                else if (/^\d+$/.test(part)) { out.push(Number(part)); }
            });
            return out;
        };
        var nums;
        if (verb === 'add') { nums = p.allowed.concat(listOf(args[1])); }
        else if (verb === 'remove') {
            var drop = listOf(args[1]);
            nums = p.allowed.filter(function (v) { return drop.indexOf(v) < 0; });
        } else { nums = listOf(args[0]); }
        var uniq = {};
        nums.forEach(function (n) { uniq[n] = true; });
        p.allowed = Object.keys(uniq).map(Number).sort(function (a, b) { return a - b; });
        CORE.resolveLeases(state);
        return '';
    };

    IOS_CONF['duplex'] = function (state, session, args) {
        var f = requireIf(state, session);
        if (!f) { return '% Command rejected: not in interface configuration mode'; }
        var p = (state.ports[f.device] || {})[f.iface];
        var want = (args[0] || '').toLowerCase();
        if (['auto', 'full', 'half'].indexOf(want) < 0) { return '% Invalid input'; }
        /* `auto` negotiates, and in this lab every endpoint is capable of full -- which is the whole
         * point of S1A: `duplex auto` and `duplex full` both resolve the mismatch. */
        p.duplex = want === 'half' ? 'half' : 'full';
        delete p.duplexForced;
        return '';
    };

    IOS_CONF['shutdown'] = function (state, session) {
        var f = requireIf(state, session);
        if (!f) { return '% Command rejected: not in interface configuration mode'; }
        (state.ports[f.device] || {})[f.iface].shutdown = true;
        CORE.resolveLeases(state);
        return '';
    };
    IOS_CONF['no shutdown'] = function (state, session) {
        var f = requireIf(state, session);
        if (!f) { return '% Command rejected: not in interface configuration mode'; }
        (state.ports[f.device] || {})[f.iface].shutdown = false;
        CORE.resolveLeases(state);
        return '';
    };

    IOS_CONF['ip address'] = function (state, session, args) {
        var f = requireIf(state, session);
        if (!f) { return '% Command rejected: not in interface configuration mode'; }
        var addr = args[0], mask = args[1];
        if (ip.toInt(addr) === null || ip.toInt(mask) === null) { return '% Invalid input detected'; }
        /* A sub-interface carries an SVI; a switch port does not take an address in this lab. */
        var m = String(f.iface).match(/^Gi0\/0\.(\d+)$/);
        if (!m || !state.svis[Number(m[1])]) { return '% IP addresses are not configurable on this interface'; }
        var svi = state.svis[Number(m[1])];
        svi.ip = addr;
        svi.mask = mask;
        /* The connected route follows the mask, which is what makes S5A's /25 repair complete. */
        var pfx = ip.maskToPrefix(mask);
        (state.routes['MeridianRTR-01'] || []).forEach(function (r) {
            if (r.vlan === Number(m[1])) {
                r.prefix = pfx;
                r.dest = ip.networkOf(ip.toInt(addr), pfx);
                r.cidr = ip.toStr(r.dest) + '/' + pfx;
            }
        });
        return '';
    };

    IOS_CONF['ntp server'] = function (state, session, args) {
        var f = top(session);
        if (f.mode !== 'config') { return '% Command rejected: not in global configuration mode'; }
        if (ip.toInt(args[0]) === null) { return '% Invalid input detected'; }
        var idx = CORE.buildIndex(state);
        var reachable = !!idx.byIp[args[0]] && reach(state, f.device, args[0], { proto: 'udp', port: 123 }).ok;
        /* Synchronisation is an OUTCOME of pointing at a server that answers, not of typing the
         * command. Pointing at the decommissioned address leaves the clock unsynchronised, which is
         * what keeps S12B's wrong fix wrong. */
        state.devices[f.device].ntp = {
            server: args[0],
            synchronized: reachable,
            offsetSec: reachable ? 0 : (state.devices[f.device].ntp ? state.devices[f.device].ntp.offsetSec : 0)
        };
        return '';
    };

    IOS_CONF['snmp-server community'] = function (state, session, args) {
        var f = top(session);
        if (f.mode !== 'config') { return '% Command rejected: not in global configuration mode'; }
        if (!args[0]) { return '% Incomplete command'; }
        state.devices[f.device].snmp = { community: args[0], authFailures: 0 };
        return '';
    };

    IOS_CONF['ip route'] = function (state, session, args) {
        var f = top(session);
        if (f.mode !== 'config') { return '% Command rejected: not in global configuration mode'; }
        var net = args[0], mask = args[1], nh = args[2];
        if (ip.toInt(net) === null || ip.toInt(mask) === null || ip.toInt(nh) === null) { return '% Invalid input detected'; }
        var pfx = ip.maskToPrefix(mask);
        var dest = ip.networkOf(ip.toInt(net), pfx);
        var rs = state.routes[f.device] = state.routes[f.device] || [];
        var hit = rs.filter(function (r) { return r.kind === 'static' && r.dest === dest && r.prefix === pfx; })[0];
        if (hit) { hit.nextHop = nh; }
        else { rs.push({ dest: dest, prefix: pfx, cidr: ip.toStr(dest) + '/' + pfx, kind: 'static', nextHop: nh, iface: 'Gi0/1' }); }
        return '';
    };
    IOS_CONF['no ip route'] = function (state, session, args) {
        var f = top(session);
        if (f.mode !== 'config') { return '% Command rejected: not in global configuration mode'; }
        var pfx = ip.maskToPrefix(args[1]);
        var dest = ip.networkOf(ip.toInt(args[0]), pfx);
        state.routes[f.device] = (state.routes[f.device] || []).filter(function (r) {
            return !(r.kind === 'static' && r.dest === dest && r.prefix === pfx);
        });
        return '';
    };

    /* ACL editing, which is what S8 needs. IOS named-ACL semantics: enter the list, then `no <seq>`
     * removes a line and `<seq> permit|deny ...` inserts one at that sequence. Reordering is done by
     * renumbering, exactly as a student would on real kit. */
    IOS_CONF['ip access-list extended'] = function (state, session, args) {
        var f = top(session);
        if (f.mode !== 'config') { return '% Command rejected: not in global configuration mode'; }
        var name = args[0];
        if (!name) { return '% Incomplete command'; }
        state.acls[f.device] = state.acls[f.device] || {};
        if (!state.acls[f.device][name]) {
            state.acls[f.device][name] = { name: name, applied: [], lines: [] };
        }
        f.mode = 'config-acl';
        f.acl = name;
        return '';
    };

    function aclLineFromTokens(state, toks) {
        /* `<seq> permit|deny <proto> <src> <dst> [eq <port>]`, with `any` and CIDR accepted. */
        var seq = Number(toks[0]);
        if (!seq) { return null; }
        var action = (toks[1] || '').toLowerCase();
        if (action !== 'permit' && action !== 'deny') { return null; }
        var proto = (toks[2] || 'ip').toLowerCase();
        var src = toks[3] || 'any', dst = toks[4] || 'any';
        var line = { seq: seq, action: action, proto: proto, src: src, dst: dst, hits: 0 };
        var eqi = toks.indexOf('eq');
        if (eqi > 0 && toks[eqi + 1]) { line.dstPort = Number(toks[eqi + 1]); }
        return line;
    }

    /* ═══ exec ════════════════════════════════════════════════════════════════════════════════════
     * The single entry point. Tokenises, resolves the command by prefix against the tree for the
     * CURRENT context, and dispatches. Mode transitions and the context stack are handled before
     * the trees, because `exit` means something different in each.
     *
     * Every command is evaluated here, on the server, which is why the exam page can be a renderer.
     * `events` records what was typed: stage 6 grades change requests and stage 7 wants telemetry,
     * and both need the transcript rather than a reconstruction of it. */
    var TREES = {
        windows: buildTree(WIN),
        ubuntu: buildTree(LIN),
        iosShow: buildTree(IOS_SHOW),
        iosConf: buildTree(IOS_CONF)
    };

    function record(state, session, line, out) {
        state.events = state.events || [];
        var idx = state.events.length;
        state.events.push({ t: idx, actor: top(session).device, kind: 'command', detail: line });
        /* A fix made by TYPING is stamped against the command that made it, exactly as a GUI fix is
         * stamped against its click. The change-request credit rule compares those positions, so a
         * fix typed at a terminal and a fix clicked in a window have to be measured the same way. */
        FAULTS.recordProgress(state, idx);
        return out;
    }

    function sshTo(state, session, target) {
        var idx = CORE.buildIndex(state);
        var addr = target.replace(/^.*@/, '');
        var entry = idx.byIp[addr] || idx.byName[addr.toUpperCase()];
        var from = top(session).device;
        if (!entry) {
            return 'ssh: connect to host ' + addr + ' port 22: No route to host';
        }
        var node = entry.node || entry;
        var dest = node.ip || addr;
        /* The timeout is computed by reach(), per the spec: "An SSH attempt to an unreachable
         * address times out, computed by reach()". So losing a path loses your shell, which is why
         * the management path is protected by an invariant rather than by hope. */
        var r = reach(state, from, dest, { proto: 'tcp', port: 22 });
        if (!r.ok) {
            return 'ssh: connect to host ' + addr + ' port 22: '
                + (r.failedAt && r.failedAt.layer === 4 ? 'Connection refused' : 'Connection timed out')
                + '\n  [diagnostic] L' + (r.failedAt ? r.failedAt.layer : '?') + ': ' + (r.failedAt ? r.failedAt.reason : '');
        }
        var dev = state.devices[node.name];
        if (!dev) { return 'ssh: ' + addr + ' is not a managed device'; }
        var plat = dev.platform;
        var frame = { device: node.name, platform: plat, mode: 'host' };
        if (/^ios/.test(plat)) { frame.mode = 'user'; }
        session.stack.push(frame);
        return plat === 'ubuntu24'
            ? 'Welcome to Ubuntu 24.04.1 LTS\nLast login: Thu Oct 17 09:02:11 2026'
            : '';
    }

    function execIos(state, session, line, tokens) {
        var f = top(session);
        var first = (tokens[0] || '').toLowerCase();

        /* Mode transitions first. `exit` from a config mode steps out one level; from user or
         * enable it closes the session, which is the behaviour students expect from real kit. */
        if ('enable'.indexOf(first) === 0 && first.length >= 2 && f.mode === 'user') { f.mode = 'enable'; return ''; }
        if ('disable'.indexOf(first) === 0 && first.length >= 4 && f.mode === 'enable') { f.mode = 'user'; return ''; }
        if ('configure'.indexOf(first) === 0 && first.length >= 4) {
            if (f.mode !== 'enable') { return '% Invalid input detected at \'^\' marker.'; }
            f.mode = 'config';
            return 'Enter configuration commands, one per line.  End with CNTL/Z.';
        }
        if (first === 'end') {
            if (f.mode === 'config' || f.mode === 'config-if' || f.mode === 'config-acl') { f.mode = 'enable'; delete f.iface; delete f.acl; return ''; }
        }
        if (first === 'exit') {
            if (f.mode === 'config-if' || f.mode === 'config-acl') { f.mode = 'config'; delete f.iface; delete f.acl; return ''; }
            if (f.mode === 'config') { f.mode = 'enable'; return ''; }
            if (session.stack.length > 1) { session.stack.pop(); return 'Connection closed.'; }
            return '';
        }
        if ('interface'.indexOf(first) === 0 && first.length >= 3 && (f.mode === 'config' || f.mode === 'config-if')) {
            var want = normIface(tokens.slice(1).join(' '));
            var isPort = (state.ports[f.device] || {})[want];
            var isSvi = /^Gi0\/0\.\d+$/.test(want) && state.svis[Number(want.split('.')[1])];
            if (!isPort && !isSvi) { return '% Invalid interface ' + want; }
            f.mode = 'config-if';
            f.iface = want;
            return '';
        }
        if (first === 'write' || (first === 'copy' && /run/.test(tokens[1] || ''))) {
            /* Accepted and not required: the spec grades the running config. */
            return 'Building configuration...\n[OK]';
        }

        /* ACL line editing inside config-acl. */
        if (f.mode === 'config-acl') {
            var acl = state.acls[f.device][f.acl];
            if (first === 'no' && /^\d+$/.test(tokens[1] || '')) {
                var seq = Number(tokens[1]);
                var before = acl.lines.length;
                acl.lines = acl.lines.filter(function (l) { return l.seq !== seq; });
                return acl.lines.length === before ? '% Sequence number ' + seq + ' not found' : '';
            }
            if (/^\d+$/.test(first)) {
                var ln = aclLineFromTokens(state, tokens);
                if (!ln) { return '% Invalid input detected'; }
                acl.lines = acl.lines.filter(function (l) { return l.seq !== ln.seq; }).concat([ln])
                    .sort(function (a, b) { return a.seq - b.seq; });
                return '';
            }
        }

        /* Then the command trees for the current mode. */
        if (f.mode === 'config' || f.mode === 'config-if' || f.mode === 'config-acl') {
            var rc = resolveWords(tokens, TREES.iosConf);
            if (rc.error) { return /Incomplete|Ambiguous/.test(rc.error) ? rc.error : '% Invalid input detected at \'^\' marker.'; }
            return rc.handler(state, session, rc.args);
        }
        if (f.mode === 'enable' || f.mode === 'user') {
            /* `ping <ip> source <if>` -- the router's sourced ping, which the spec names as S7A's
             * evidence because it proves the path works from one VLAN and not another. */
            if ('ping'.indexOf(first) === 0 && first.length >= 2) {
                var target = tokens[1];
                var si = tokens.indexOf('source');
                if (si > 0 && tokens[si + 1]) {
                    var srcIf = normIface(tokens.slice(si + 1).join(' '));
                    var m = String(srcIf).match(/^Gi0\/0\.(\d+)$/);
                    if (!m || !state.svis[Number(m[1])]) { return '% Invalid source interface'; }
                    var vlan = Number(m[1]);
                    /* Source from a host in that VLAN, since the SVI itself is the router. */
                    var inVlan = state.endpoints.filter(function (e) {
                        return (e.vlanEffective || e.vlan) === vlan && e.ip && !/^169\.254\./.test(e.ip);
                    })[0];
                    if (!inVlan) { return 'Sending 5, 100-byte ICMP Echos to ' + target + '\n.....\nSuccess rate is 0 percent (0/5)'; }
                    var rr = reach(state, inVlan.name, target, { proto: 'icmp' });
                    return 'Sending 5, 100-byte ICMP Echos to ' + target + ', timeout is 2 seconds:\n'
                        + 'Packet sent with a source address of ' + state.svis[vlan].ip + '\n'
                        + (rr.ok ? '!!!!!\nSuccess rate is 100 percent (5/5)'
                                 : '.....\nSuccess rate is 0 percent (0/5)\n  [diagnostic] L'
                                   + rr.failedAt.layer + ': ' + rr.failedAt.reason);
                }
                var r2 = reach(state, f.device, target, { proto: 'icmp' });
                return 'Sending 5, 100-byte ICMP Echos to ' + target + ', timeout is 2 seconds:\n'
                    + (r2.ok ? '!!!!!\nSuccess rate is 100 percent (5/5)'
                             : '.....\nSuccess rate is 0 percent (0/5)\n  [diagnostic] L'
                               + r2.failedAt.layer + ': ' + r2.failedAt.reason);
            }
            if ('traceroute'.indexOf(first) === 0 && first.length >= 4) {
                return renderTrace(state, f.device, tokens[1], { proto: 'icmp' });
            }
            var rs = resolveWords(tokens, TREES.iosShow);
            if (rs.error) { return /Incomplete|Ambiguous/.test(rs.error) ? rs.error : '% Invalid input detected at \'^\' marker.'; }
            if (f.mode === 'user' && /^show (running|access|logging|snmp)/.test(rs.words.join(' '))) {
                return '% Invalid input detected at \'^\' marker.';   // privileged only
            }
            return rs.handler(state, f, rs.args);
        }
        return '% Invalid input detected at \'^\' marker.';
    }

    function exec(state, session, rawLine) {
        var line = String(rawLine === undefined ? '' : rawLine).trim();
        if (!line) { return { out: '', session: session }; }

        /* The editor swallows everything until :wq / ^X, which is how `sudo nano <file>` behaves in
         * spec section 5. The buffer lives on the session, not on state, because an abandoned edit
         * must not survive a refresh as a half-written config. */
        if (session.editor) {
            /* EX-MODE SUBSTITUTION, because appending is not editing. The buffer model treats a
             * typed line as a new line, which is right for writing a file and useless for changing
             * one value in a forty-line config -- and retyping the whole config is not what any
             * student or admin does. `:%s/old/new/` is what vi actually offers, so it is what this
             * offers; the nano-style window belongs to stage 5's GUI. */
            var subm = line.match(/^:(%?)s([/|#])(.+?)\2(.*?)\2(g?)\s*$/);
            if (subm) {
                var whole = subm[1] === '%', pat = subm[3], rep = subm[4], all = subm[5] === 'g';
                var re;
                try { re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), all ? 'g' : ''); }
                catch (e) { return { out: 'E486: Pattern not found: ' + pat, session: session }; }
                /* `%` MEANS THE WHOLE BUFFER AND ITS ABSENCE MEANS ONE LINE, which is what vi does.
                 * The flag was captured and never read, so `:s/a/b/` silently behaved like `:%s/a/b/`
                 * -- contradicting this file's own comment. With no cursor concept, the bare form
                 * acts on the FIRST matching line, which is the closest honest equivalent. */
                var hits = 0;
                session.editor.buffer = session.editor.buffer.map(function (l) {
                    if (!whole && hits > 0) { return l; }
                    if (!re.test(l)) { return l; }
                    hits++;
                    re.lastIndex = 0;
                    /* The replacement is ESCAPED TOO. Passed raw, a value containing `$` would hit
                     * JS's replacement-pattern syntax ($&, $1) instead of being inserted literally,
                     * which contradicts the "literal substitution" this claims to offer. No current
                     * answer contains `$`, so this was latent rather than broken. */
                    return l.replace(re, rep.replace(/\$/g, '$$$$'));
                });
                return { out: hits ? hits + ' substitution' + (hits === 1 ? '' : 's') + ' on ' + hits + ' line' + (hits === 1 ? '' : 's')
                                   : 'E486: Pattern not found: ' + pat, session: session };
            }
            if (/^(:wq|:x|\^X|save)$/i.test(line)) {
                var ed = session.editor;
                var res = saveFile(state, ed.device, ed.path, ed.buffer.join('\n'));
                session.editor = null;
                var msg = 'Wrote ' + ed.path;
                if (res.applied.length) { msg += '\n  applied: ' + res.applied.join('; '); }
                if (res.ignored.length) { msg += '\n  NOT understood: ' + res.ignored.join('; '); }
                msg += '\n  (the service still uses its old config until it is reloaded or restarted)';
                return { out: record(state, session, line, msg), session: session };
            }
            if (/^(:q!?|\^C|abort)$/i.test(line)) { session.editor = null; return { out: 'Edit abandoned.', session: session }; }
            session.editor.buffer.push(line);
            return { out: '', session: session };
        }

        var tokens = line.split(/\s+/);
        var f = top(session);
        var first = tokens[0].toLowerCase();

        /* ssh / telnet work from any platform. */
        if (first === 'ssh' || first === 'telnet') {
            var tgt = tokens.filter(function (t) { return t !== 'ssh' && t !== 'telnet' && !/^-/.test(t); })[0];
            if (!tgt) { return { out: 'usage: ' + first + ' [user@]host', session: session }; }
            return { out: record(state, session, line, sshTo(state, session, tgt)), session: session };
        }

        if (/^ios/.test(f.platform)) {
            return { out: record(state, session, line, execIos(state, session, line, tokens)), session: session };
        }

        if (first === 'exit' || first === 'logout') {
            if (session.stack.length > 1) { session.stack.pop(); return { out: 'Connection to host closed.', session: session }; }
            return { out: '', session: session };
        }

        if (f.platform === 'ubuntu24') {
            if (first === 'sudo') { tokens = tokens.slice(1); first = (tokens[0] || '').toLowerCase(); }
            if (first === 'nano' || first === 'vi' || first === 'vim') {
                var path = tokens[1];
                if (!path) { return { out: first + ': missing filename', session: session }; }
                var txt = renderFile(state, f.device, path);
                if (txt === null) { txt = ''; }
                session.editor = { device: f.device, path: path, buffer: txt.split('\n') };
                return { out: '--- editing ' + path + ' (' + txt.split('\n').length + ' lines). Type the new contents, then :wq to save or :q! to abandon. ---\n' + txt, session: session };
            }
            var rl = resolveWords(tokens, TREES.ubuntu);
            if (rl.error) { return { out: rl.ambiguous ? rl.error : first + ': command not found', session: session }; }
            return { out: record(state, session, line, rl.handler(state, f, rl.args)), session: session };
        }

        /* Windows. */
        var rw = resolveWords(tokens, TREES.windows);
        if (rw.error) {
            return { out: rw.ambiguous ? rw.error : "'" + tokens[0] + "' is not recognized as an internal or external command.", session: session };
        }
        return { out: record(state, session, line, rw.handler(state, f, rw.args)), session: session };
    }

    module.exports = {
        exec: exec, newSession: newSession, prompt: prompt, normIface: normIface,
        renderFile: renderFile, saveFile: saveFile,
        commands: { windows: Object.keys(WIN), ubuntu: Object.keys(LIN), iosShow: Object.keys(IOS_SHOW), iosConf: Object.keys(IOS_CONF) },
        _i: { resolveWords: resolveWords, buildTree: buildTree, table: table, top: top,
              renderPing: renderPing, renderTrace: renderTrace, renderLookup: renderLookup,
              IOS_SHOW: IOS_SHOW, WIN: WIN, LIN: LIN, IOS_CONF: IOS_CONF }
    };
})();
