/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-gui.js — stage 5: the seven GUI windows, as server-side models and actions.
 *
 * Spec: section 10 extension 5 ("New GUI windows: Firewall, wireless controller, NOC, rack view
 *       (cable replace), question panel, change request form, incident log"), plus section 8 for
 *       the change-request and device-restore rules.
 *
 * THESE RETURN DATA, NOT HTML. `render()` hands back the rows and fields a window contains and the
 * page decides how to draw them. The server owns truth and the browser owns presentation, which is
 * the same division the terminal uses -- and the reason a fix made in a GUI is visible to the
 * grader without any synchronisation: there is one copy of the state and both surfaces mutate it.
 *
 * WHY THESE WINDOWS EXIST AT ALL. Six faults cannot be repaired from a terminal, because spec
 * section 3 gives MER-FW01 and MER-WLC01 web access only, and S1B's fix is physically replacing a
 * cable. Stage 4's test names those six; this file is what closes them:
 *     S1B  rack view        replace the patch cable
 *     S6B  firewall         add the missing IPsec phase-2 entry
 *     S7A  firewall         add the missing outbound NAT rule
 *     S7B  firewall         repoint the port forward
 *     S11A wireless         map the guest SSID to the right VLAN
 *     S11B wireless         space the 2.4 GHz channels
 *
 * EVERY ACTION IS LOGGED, and the log is what stage 6 grades sequence against: the spec gives full
 * credit for a fix only when a change request for that ticket was filed BEFORE the change. That is
 * a comparison of two positions in the event log, so the positions have to be recorded as they
 * happen; neither can be reconstructed from the final state.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = require('./netfinal-topology.js');
    var CORE = require('./netfinal-core.js');
    var FAULTS = require('./netfinal-faults.js');
    var reach = CORE.reach, tables = CORE.tables, ip = CORE.ip;

    var WINDOWS = ['firewall', 'wireless', 'noc', 'rack', 'questions', 'change-requests', 'incident-log'];

    function ep(state, name) { return state.endpoints.filter(function (e) { return e.name === name; })[0]; }
    function logEvent(state, kind, device, detail) {
        state.events = state.events || [];
        state.events.push({ t: state.events.length, actor: device, kind: kind, detail: detail });
        return state.events.length - 1;
    }

    /* ── FIREWALL (pfSense-shaped) ────────────────────────────────────────────────────────────── */
    function renderFirewall(state) {
        return {
            title: 'MER-FW01 — pfSense',
            interfaces: [
                { name: 'WAN', address: state.params.wan.fwIp, mask: state.params.wan.mask,
                  up: ((state.ports['MER-FW01'] || {}).WAN || {}).up !== false },
                { name: 'LAN', address: TOPO.FIXED_NETS.transit.fw, mask: state.params.transit.mask,
                  up: ((state.ports['MER-FW01'] || {}).LAN || {}).up !== false },
                { name: 'DMZ', address: TOPO.FIXED_NETS.dmz.fw, mask: state.params.dmz.mask,
                  up: ((state.ports['MER-FW01'] || {}).DMZ || {}).up !== false }
            ],
            natOutbound: state.nat.outbound.map(function (r, i) {
                return { index: i, source: r.src, translation: state.params.wan.fwIp, iface: r.iface };
            }),
            portForwards: state.nat.portForwards.map(function (f, i) {
                return { index: i, iface: 'WAN', proto: f.proto, wanPort: f.wanPort,
                         target: f.toIp + ':' + f.toPort };
            }),
            ipsec: {
                tunnelUp: state.ipsec.tunnelUp,
                /* The tunnel being UP while a phase-2 entry is missing is S6B's whole deception:
                 * the status page says healthy and one network still cannot cross. */
                phase2: state.ipsec.phase2.map(function (p, i) {
                    return { index: i, local: p.local, remote: p.remote, state: 'installed' };
                })
            },
            natState: tables.natTable(state).map(function (r) {
                return { proto: r.proto, inside: r.inside, outside: r.outside, destination: r.dest };
            })
        };
    }

    var FW_ACTIONS = {
        'nat-add-outbound': function (state, p) {
            if (!ip.parseCidr(p.src)) { return { ok: false, reason: 'not a network in CIDR form: ' + p.src }; }
            if (state.nat.outbound.some(function (r) { return r.src === p.src; })) {
                return { ok: false, reason: 'an outbound rule for ' + p.src + ' already exists' };
            }
            state.nat.outbound.push({ src: p.src, translateTo: 'wan', iface: 'WAN' });
            return { ok: true, message: 'Outbound NAT rule added for ' + p.src };
        },
        'nat-remove-outbound': function (state, p) {
            var before = state.nat.outbound.length;
            state.nat.outbound = state.nat.outbound.filter(function (r, i) { return i !== Number(p.index); });
            return before === state.nat.outbound.length
                ? { ok: false, reason: 'no rule at index ' + p.index }
                : { ok: true, message: 'Outbound NAT rule removed' };
        },
        'portforward-set': function (state, p) {
            var f = state.nat.portForwards.filter(function (x) { return x.wanPort === Number(p.wanPort); })[0];
            if (!f) { return { ok: false, reason: 'no port forward on WAN port ' + p.wanPort }; }
            if (ip.toInt(p.toIp) === null) { return { ok: false, reason: 'not an address: ' + p.toIp }; }
            f.toIp = p.toIp;
            if (p.toPort) { f.toPort = Number(p.toPort); }
            return { ok: true, message: 'Port forward WAN:' + f.wanPort + ' now targets ' + f.toIp + ':' + f.toPort };
        },
        'ipsec-add-phase2': function (state, p) {
            if (!ip.parseCidr(p.local) || !ip.parseCidr(p.remote)) {
                return { ok: false, reason: 'phase 2 needs a local and a remote network in CIDR form' };
            }
            if (state.ipsec.phase2.some(function (x) { return x.local === p.local && x.remote === p.remote; })) {
                return { ok: false, reason: 'that phase-2 entry already exists' };
            }
            state.ipsec.phase2.push({ local: p.local, remote: p.remote });
            return { ok: true, message: 'Phase 2 installed: ' + p.local + ' <-> ' + p.remote };
        },
        'ipsec-remove-phase2': function (state, p) {
            var before = state.ipsec.phase2.length;
            state.ipsec.phase2 = state.ipsec.phase2.filter(function (x, i) { return i !== Number(p.index); });
            return before === state.ipsec.phase2.length
                ? { ok: false, reason: 'no phase-2 entry at index ' + p.index }
                : { ok: true, message: 'Phase 2 entry removed' };
        },
        /* Diagnostics > Ping, sourced from an interface. The spec names the firewall's diagnostic
         * ping as a reach() caller, so it is one. */
        'diag-ping': function (state, p) {
            var src = 'MER-FW01';
            var r = reach(state, src, p.target, { proto: 'icmp' });
            return { ok: true, message: r.ok ? '1 packets transmitted, 1 received, 0% packet loss'
                : 'Request timed out — ' + (r.failedAt ? 'L' + r.failedAt.layer + ': ' + r.failedAt.reason : 'no route'),
                reachOk: r.ok };
        },
        /* Diagnostics > Test from WAN. Spec section 10: "The firewall window needs one page the
         * chapter labs do not have: Diagnostics > Test from WAN, which runs reach(internet, wan,
         * { proto: 'tcp', port }) for question 40B." */
        'diag-test-from-wan': function (state, p) {
            var port = Number(p.port);
            if (!port) { return { ok: false, reason: 'a TCP port is required' }; }
            var r = reach(state, CORE.constants.OUTSIDE, state.params.wan.fwIp, { proto: 'tcp', port: port });
            return {
                ok: true, reachOk: r.ok,
                message: r.ok
                    ? 'Connected to ' + state.params.wan.fwIp + ':' + port + ' from outside'
                    : 'Connection to ' + state.params.wan.fwIp + ':' + port + ' failed — '
                      + (r.failedAt ? 'L' + r.failedAt.layer + ': ' + r.failedAt.reason : 'refused')
            };
        }
    };

    /* ── WIRELESS CONTROLLER (UniFi-shaped) ──────────────────────────────────────────────────── */
    function renderWireless(state) {
        var clientsOf = function (ssid) {
            return state.endpoints.filter(function (e) { return e.ssid === ssid; }).map(function (e) {
                return { name: e.name, mac: e.mac, address: e.ip,
                         vlan: e.vlanEffective || e.vlan, ap: e.ap };
            });
        };
        return {
            title: 'MER-WLC01 — UniFi Network',
            ssids: state.ssids.map(function (s) {
                return { name: s.name, vlan: s.vlan, aps: s.aps.slice(),
                         dnsOverride: s.dnsOverride, clients: clientsOf(s.name).length };
            }),
            accessPoints: ['AP-1', 'AP-2', 'AP-3'].map(function (a) {
                var e = ep(state, a);
                var ch = state.wireless.apChannels[a];
                /* Retries are DERIVED from whether a neighbour shares the channel, so S11B's
                 * evidence ("high retries") follows from the fault rather than being narrated.
                 *
                 * `shared` STAYS LOCAL. It used to be returned as `coChannelWith`, and Chris was
                 * right that this handed over the diagnosis: the spec's evidence for S11B is "the AP
                 * list, with retry counters", and the skill is reading the channel column across
                 * rows and noticing two match. Naming the colliding partner in the payload is the
                 * conclusion, not the evidence. The retry rate is a legitimate signal; the answer
                 * is not. */
                var shared = Object.keys(state.wireless.apChannels)
                    .filter(function (o) { return o !== a && state.wireless.apChannels[o] === ch; });
                return {
                    name: a, address: e ? e.ip : null, mac: e ? e.mac : null,
                    band24Channel: ch, switch: e ? e.switch : null, port: e ? e.port : null,
                    retriesPct: shared.length ? 34 : 3
                };
            }),
            clients: state.ssids.reduce(function (acc, s) { return acc.concat(clientsOf(s.name)); }, [])
        };
    }

    var WLC_ACTIONS = {
        'ssid-set-vlan': function (state, p) {
            var s = state.ssids.filter(function (x) { return x.name === p.ssid; })[0];
            if (!s) { return { ok: false, reason: 'no SSID named ' + p.ssid }; }
            var v = Number(p.vlan);
            if (!state.subnets[v]) { return { ok: false, reason: 'VLAN ' + p.vlan + ' does not exist' }; }
            /* NOT THE MANAGEMENT VLAN. Spec constraint 2 protects VLAN 99 from every fault, and a
             * controller that let a student bridge an SSID onto it would hand them a way to break
             * the thing the whole exam depends on staying reachable. A real controller would allow
             * it; this one is a teaching instrument and the protection is worth more than the
             * fidelity. No exploit was proven -- VLAN 99 has no DHCP service -- so this is
             * hardening, closed because it costs one condition. */
            if (v === 99) {
                return { ok: false, reason: 'VLAN 99 is the management network and cannot carry an SSID' };
            }
            s.vlan = v;
            CORE.resolveLeases(state);
            return { ok: true, message: p.ssid + ' now maps to VLAN ' + v + '. Clients will re-associate.' };
        },
        'ap-set-channel': function (state, p) {
            /* Was `apChannels.hasOwnProperty(p.ap)` -- right in intent, but called ON the object,
             * so a map that ever carried its own `hasOwnProperty` key would break the guard. */
            if (own(state.wireless.apChannels, p.ap) === undefined) {
                return { ok: false, reason: 'no AP named ' + p.ap };
            }
            var ch = Number(p.channel);
            /* 1-14 is the band; the controller accepts any of them, because choosing a non-
             * overlapping set is the lesson and a UI that refused 2 would teach it for the student. */
            if (!(ch >= 1 && ch <= 14)) { return { ok: false, reason: 'channel must be 1-14 on 2.4 GHz' }; }
            CORE.setOwn(state.wireless.apChannels, p.ap, ch);
            return { ok: true, message: p.ap + ' set to 2.4 GHz channel ' + ch };
        }
    };

    /* ── NOC (LibreNMS-shaped) ───────────────────────────────────────────────────────────────── */
    function renderNoc(state) {
        var poll = tables.snmpPollStatus(state);
        var alerts = [];
        poll.forEach(function (r) {
            if (!r.polled) {
                alerts.push({ id: 'poll-' + r.device, severity: 'critical',
                    text: r.device + ' unreachable (SNMP)', device: r.device, acked: !!r.acked });
            }
        });
        state.faults.forEach(function (f) {
            if (!f.active || !f.applied) { return; }
            /* S8A arrives as a NOC alert rather than a ticket, per spec section 6. The alert text
             * comes from the fault's own log line, so it cannot drift from the fault. */
            /* ALERT IDS USE THE TICKET, NOT THE FAULT ID. These read 'alert-S8A' and 'alert-S12B',
             * which names the variant in a window the student is meant to read -- the exact thing
             * spec section 9 forbids, shipped in the id of the alert itself. The leak scanner caught
             * it on the session payload. The ticket id is already the student-facing handle and the
             * mapping back to a slot stays server-side. */
            if (f.id === 'S8A') {
                var l = FAULTS.VARIANTS.S8A.logs(state, f)[0];
                alerts.push({ id: 'alert-' + f.ticketId, severity: 'critical', text: l.text, device: 'MER-NOC01' });
            }
            if (f.slot === 'S12' && f.variant === 'B') {
                alerts.push({ id: 'alert-' + f.ticketId, severity: 'warning',
                    text: 'MeridianSW-02 interface flaps (timestamps out of range)', device: 'MeridianSW-02' });
            }
        });
        /* THE SEEDED DECOY, presented exactly like a real alert. One of six, drawn at generate
         * time; it is NOISE, and triaging it as noise is the graded skill, so the window must not
         * mark it differently from a genuine alert. `why` is carried for the answer key and is
         * never rendered to the student -- it lives in the topology beside the text so the two
         * cannot drift. */
        var decoyDef = (TOPO.NOC_DECOYS || []).filter(function (d) {
            return d.id === (state.monitoring && state.monitoring.decoyAlert);
        })[0];
        if (decoyDef) {
            alerts.push({ id: decoyDef.id, severity: 'warning', text: decoyDef.text, device: null });
        }
        var acked = state.ackedAlerts || {};
        alerts = alerts.map(function (a) { return Object.assign({}, a, { acked: !!acked[a.id] }); });
        return {
            title: 'MER-NOC01 — LibreNMS',
            alerts: alerts,
            pollStatus: poll,
            devices: TOPO.DEVICES.map(function (d) {
                var addr = state.devices[d.id] ? state.devices[d.id].mgmtIp : null;
                return { name: d.id, role: d.role, address: addr,
                         icmp: addr ? reach(state, 'MER-NOC01', addr, { proto: 'icmp' }).ok : false };
            }),
            clocks: TOPO.DEVICES.filter(function (d) { return !!state.devices[d.id].ntp; })
                .map(function (d) { return tables.clockStatus(state, d.id); })
        };
    }

    var NOC_ACTIONS = {
        'ack-alert': function (state, p) {
            state.ackedAlerts = state.ackedAlerts || {};
            /* ASK setOwn, DO NOT RE-LIST ITS RULES. This hand-checked `p.id === '__proto__'` and
             * then ignored setOwn's return -- so `constructor` and `prototype` passed the hand-check,
             * were refused by setOwn, and the student was told "Alert constructor acknowledged" while
             * nothing was recorded. A guard whose refusal the caller ignores is not a guard, and a
             * caller that duplicates the guard's rules will always be the stale copy. */
            if (typeof p.id !== 'string' || !p.id) {
                return { ok: false, reason: 'not an alert id: ' + p.id };
            }
            if (!CORE.setOwn(state.ackedAlerts, p.id, true)) {
                return { ok: false, reason: 'not an alert id: ' + p.id };
            }
            return { ok: true, message: 'Alert ' + p.id + ' acknowledged' };
        }
    };

    /* ── RACK VIEW ───────────────────────────────────────────────────────────────────────────── */
    function renderRack(state) {
        var rows = [];
        Object.keys(state.ports).sort().forEach(function (dev) {
            Object.keys(state.ports[dev]).sort().forEach(function (pn) {
                var p = state.ports[dev][pn];
                if (p.virtual) { return; }
                var occupant = state.endpoints.filter(function (e) { return e.switch === dev && e.port === pn; })[0];
                rows.push({
                    device: dev, port: pn, mode: p.mode, vlan: p.vlan === undefined ? null : p.vlan,
                    admin: p.shutdown ? 'down' : 'up',
                    link: p.shutdown ? 'down' : (p.up === false ? 'no link' : 'up'),
                    duplex: p.duplex, speed: p.speed,
                    /* The cable's health, which is what the rack view is FOR: S1B is a damaged
                     * patch cable and this is the only surface that shows it as a cable rather
                     * than as a counter. */
                    cable: p.up === false ? 'disconnected' : (p.errorRate > 0 ? 'degraded' : 'ok'),
                    connectedTo: occupant ? occupant.name : null
                });
            });
        });
        return { title: 'Rack view — Meridian Corp', ports: rows };
    }

    var RACK_ACTIONS = {
        'replace-cable': function (state, p) {
            /* TWO client keys, two own-property lookups. `device:'constructor', port:'assign'`
             * resolved to the real `Object.assign` function, and the lines below then set
             * `errorRate` and `up` ON THE SHARED BUILTIN -- outside this student's session entirely,
             * in whatever warm instance was serving other students. Harmless in its effect; not in
             * its class, which is why it is fixed rather than noted. */
            var port = own(own(state.ports, p.device) || {}, p.port);
            if (!port) { return { ok: false, reason: 'no port ' + p.port + ' on ' + p.device }; }
            if (port.errorRate === 0 && port.up !== false) {
                /* Replacing a healthy cable is allowed and costs nothing but time. Refusing it
                 * would tell the student the cable was fine, which is the diagnosis. */
                return { ok: true, message: 'Replaced the patch cable on ' + p.device + ' ' + p.port
                    + '. Counters reset; no change in error rate.' };
            }
            port.errorRate = 0;
            port.up = true;
            return { ok: true, message: 'Replaced the patch cable on ' + p.device + ' ' + p.port
                + '. Link up, error counters clear.' };
        },
        'reseat-cable': function (state, p) {
            var port = own(own(state.ports, p.device) || {}, p.port);
            if (!port) { return { ok: false, reason: 'no port ' + p.port + ' on ' + p.device }; }
            /* Reseating clears a disconnection but NOT damage, which is the distinction between
             * S1B and a cable that was merely loose. */
            if (port.up === false) { port.up = true; return { ok: true, message: 'Reseated; link came up.' }; }
            return { ok: true, message: 'Reseated. No change.' };
        }
    };

    /* ── CHANGE REQUESTS ─────────────────────────────────────────────────────────────────────── */
    /* The OSI layers this exam grades against. One list, read by the incident-log view AND by both
     * layer form fields, because the value is String()-compared against the catalog layer in Q43 and
     * against the change request's layer in every one of the twelve fix questions. A free-text field
     * feeding an exact comparison is a trap, not an input. */
    var GRADED_LAYERS = [1, 2, 3, 4, 7];

    var CR_FIELDS = ['ticket', 'rootCause', 'layer', 'plannedChange', 'rollback'];

    function renderChangeRequests(state) {
        return {
            title: 'Change request form',
            fields: CR_FIELDS,
            /* Spec section 8: "The form never blocks the student from making a change; it only
             * affects credit." So nothing here validates against the answer key. */
            submitted: (state.changeRequests || []).map(function (c) {
                return { ticket: c.ticket, rootCause: c.rootCause, layer: c.layer,
                         plannedChange: c.plannedChange, rollback: c.rollback, atEvent: c.atEvent };
            })
        };
    }

    var CR_ACTIONS = {
        'submit': function (state, p) {
            var missing = CR_FIELDS.filter(function (f) { return !p[f] || !String(p[f]).trim(); });
            if (missing.length) { return { ok: false, reason: 'these fields are required: ' + missing.join(', ') }; }
            state.changeRequests = state.changeRequests || [];
            var rec = {};
            CR_FIELDS.forEach(function (f) { rec[f] = String(p[f]).trim(); });
            /* The POSITION in the event log is the credit-bearing fact: full marks only when the
             * request precedes the change that made the fix pass. Recorded here because it cannot
             * be recovered from the final state afterwards. */
            rec.atEvent = Math.max(0, (state.events || []).length - 1);   // its own event
            state.changeRequests.push(rec);
            return { ok: true, message: 'Change request filed for ' + rec.ticket, atEvent: rec.atEvent };
        }
    };

    /* ── INCIDENT LOG ────────────────────────────────────────────────────────────────────────── */
    var LOG_FIELDS = ['ticket', 'symptom', 'layer', 'rootCause', 'fix', 'verification'];

    function renderIncidentLog(state) {
        return {
            title: 'Incident log',
            fields: LOG_FIELDS,
            /* The layer is graded (spec section 6's conflict pairs exist so it is unambiguous), so
             * the field is offered as a closed list rather than free text. ACTION_SCHEMA reads the
             * same constant, so the form the page builds cannot disagree with the list this view
             * advertises -- it did, briefly: the renderer documented a closed list while the schema
             * shipped a free-text input, and a student typing "Layer 2" instead of "2" lost points on
             * a graded comparison that does nothing but String()-compare. */
            layerOptions: GRADED_LAYERS,
            /* AND SO IS THE TICKET, for the same reason. Q43 compares an entry's layer to the
             * catalog layer, Q44 checks its evidence against a command the event log shows was run
             * for that incident, and Q45 hands three resolved incidents to an instructor -- 25 of
             * the 200 points, all of which need the entry correlated to a slot. Free text could not
             * be correlated at all. The options are the student's own ticket ids, which they can
             * read off the ticket queue; the id-to-slot mapping stays server-side. */
            ticketOptions: (state.tickets || []).map(function (t) { return { id: t.id, kind: t.kind }; }),
            entries: (state.incidentLog || []).slice()
        };
    }

    var LOG_ACTIONS = {
        'submit': function (state, p) {
            if (!p.ticket) { return { ok: false, reason: 'a ticket is required' }; }
            /* CLOSED LIST, mirroring `layer`. An entry naming a ticket that does not exist cannot
             * be graded against anything, so it is refused at the form rather than silently scoring
             * zero later -- the student finds out now, which is the difference between a form and
             * a trap. */
            var known = (state.tickets || []).map(function (t) { return t.id; });
            if (known.indexOf(String(p.ticket).trim()) < 0) {
                return { ok: false, reason: 'unknown ticket ' + p.ticket + '. Choose one of: ' + known.join(', ') };
            }
            /* One entry per ticket (spec Q43: "one entry per resolved ticket", pro-rated across 12).
             * A resubmission REPLACES, so a student can correct an entry without the grader seeing
             * two conflicting claims for one incident. */
            state.incidentLog = (state.incidentLog || []).filter(function (x) {
                return x.ticket !== String(p.ticket).trim();
            });
            var rec = {};
            LOG_FIELDS.forEach(function (f) { rec[f] = p[f] === undefined ? '' : String(p[f]).trim(); });
            rec.atEvent = Math.max(0, (state.events || []).length - 1);
            state.incidentLog.push(rec);
            return { ok: true, message: 'Logged incident for ' + rec.ticket };
        }
    };

    /* ── QUESTION PANEL ──────────────────────────────────────────────────────────────────────── */
    function renderQuestions(state) {
        /* The 50 definitions are stage 6. The panel is the shell the spec asks for in extension 7:
         * free navigation, all questions listed with answered state. */
        var defs = state.questions || [];
        var answers = state.answers || {};
        return {
            title: 'Questions',
            sequential: false,
            total: defs.length,
            answered: Object.keys(answers).length,
            items: defs.map(function (q) {
                return { id: q.id, phase: q.phase, points: q.points, prompt: q.prompt,
                         kind: q.kind, answered: answers[q.id] !== undefined };
            })
        };
    }

    var Q_ACTIONS = {
        'answer': function (state, p) {
            if (!p.id) { return { ok: false, reason: 'a question id is required' }; }
            /* THE ID MUST BE A QUESTION THAT EXISTS. It was any string, so `questionId:'q999'` was
             * accepted and stored: 200 junk answers took the session document from 60KB to 247KB,
             * and every call rewrites the whole document, so around 900 would breach Firestore's 1MiB
             * limit and leave the student unable to write to their own exam, mid-sitting, with no
             * recovery. The grader never reads these keys -- it iterates the answer KEY's fifty --
             * so no score was ever at risk; the damage was a student bricking their own session and a
             * progress counter that read "200 / 50".
             *
             * Same family as the examId format check and the unclamped `minutes`: a client value
             * trusted into stored state. Validated against the bank, not against a pattern. */
            if (!QUESTION_IDS[p.id]) { return { ok: false, reason: 'no question with id ' + p.id }; }
            state.answers = state.answers || {};
            /* Stored verbatim and ungraded. Grading happens server-side at submission, so an answer
             * that is wrong must not be revealed as wrong while the exam is running. */
            CORE.setOwn(state.answers, p.id,
                { value: p.value, atEvent: Math.max(0, (state.events || []).length - 1) });
            return { ok: true, message: 'Answer recorded for ' + p.id };
        }
    };

    /* ═══ A CLIENT STRING MUST NEVER REACH A PROTOTYPE ═══════════════════════════════════════════
     *
     * `own(obj, key)` returns the value ONLY if the object owns that key. Every lookup below that is
     * indexed by something the student sent goes through it.
     *
     * WHY, in full, because this was the worst defect in the build. The dispatch tables were plain
     * objects indexed directly by the request's `window` and `action`:
     *
     *     var fn = RENDERERS[window];  if (!fn) { ...reject... }
     *     var set = ACTIONS[window];   var fn = set[action];
     *
     * `RENDERERS['constructor']` is not falsy. It is the inherited `Object` constructor, so the guard
     * passed and `fn(state)` became `Object(state)` -- which for an object argument returns that same
     * object, unwrapped. And in `act`, `ACTIONS['constructor']` is `Object`, whose `assign` is the
     * real `Object.assign`, so `fn(state, params)` became `Object.assign(state, params)`: a live
     * shallow merge of arbitrary client JSON into the stored exam state, which `withSession` then
     * persisted. One ordinary netfinalAction call returned all twelve faults with their exact target
     * host/switch/port, the exam-start baseline and `meta.seedStr`, and wrote an attacker key into
     * the session document. Reproduced end to end, twice.
     *
     * `window:'firewall', action:'constructor'` was independently enough, so allowlisting `window`
     * alone would not have closed it -- which is why this is a helper applied everywhere rather than
     * one check in one place.
     *
     * The shell's command trie was always safe from this, and for the right reason: it computes
     * `Object.keys(node)` and only ever indexes with a key drawn from that list. That is the pattern;
     * this helper is how the rest of the engine gets it. */
    /* ONE DEFINITION, in netfinal-core.js, which every module already requires. This was a local
     * copy here, and a local copy is how `restoreDevice` in netfinal-faults.js kept the same defect
     * through the commit that claimed to fix it at the root. */
    var own = CORE.own;
    var setOwn = CORE.setOwn;

    /* Every question id the bank defines, as an own-property map, and prototype-less so the lookup
     * below needs no guard. Derived from the bank, so it cannot drift from it.
     *
     * THE COMMENT HERE USED TO CLAIM THIS WAS "required lazily" to avoid a require cycle. It is not
     * lazy -- the IIFE runs the moment this module is first loaded -- and the cycle it claimed to
     * avoid does not exist: netfinal-shell.js never requires this file, and only netfinal-exam.js
     * does. It happens to work, but a future reader would have trusted a deferral guarantee that was
     * not there. Corrected rather than left, because a comment that misdescribes its own mechanism is
     * worse than no comment. */
    var QUESTION_IDS = (function () {
        var out = Object.create(null);
        require('./netfinal-questions.js').QUESTIONS.forEach(function (q) { out[q.id] = true; });
        return out;
    })();

    /* ── DISPATCH ────────────────────────────────────────────────────────────────────────────── */
    var RENDERERS = {
        firewall: renderFirewall, wireless: renderWireless, noc: renderNoc, rack: renderRack,
        questions: renderQuestions, 'change-requests': renderChangeRequests, 'incident-log': renderIncidentLog
    };
    var ACTIONS = {
        firewall: FW_ACTIONS, wireless: WLC_ACTIONS, noc: NOC_ACTIONS, rack: RACK_ACTIONS,
        questions: Q_ACTIONS, 'change-requests': CR_ACTIONS, 'incident-log': LOG_ACTIONS
    };

    function render(state, window) {
        var fn = own(RENDERERS, window);
        if (!fn) { return { error: 'no window named ' + window }; }
        var view = fn(state);
        /* The forms travel WITH the data, so the page never has to know which window has which
         * actions. Rendered under a reserved key the page treats as controls rather than as a table;
         * `_actions` is prefixed so it cannot collide with a renderer's own field. */
        var forms = actionSchema(state, window);
        if (forms.length) { view._actions = forms; }
        /* DEVICE RESTORE is not in ACTIONS -- it lives on the device menu and has its own callable --
         * so it needs its own declaration or the page has no way to offer it. It is graded (free and
         * logged, and it re-grants amnesty for what was already broken at exam start), and it is the
         * only way back from a change that made things worse, so a student with no restore control
         * can paint themselves into a corner with no exit. Offered on the rack, where the hardware
         * is. */
        if (window === 'rack') {
            view._restore = { label: 'Restore a device to its exam-start configuration',
                              devices: Object.keys(state.ports || {}).sort() };
        }
        return view;
    }

    function act(state, window, action, params) {
        var set = own(ACTIONS, window);
        if (!set) { return { ok: false, reason: 'no window named ' + window }; }
        /* LOGGED BEFORE THE ACTION RUNS, for two reasons. The action needs its own event index to
         * exist -- a change request records the position it was filed at, and that position is
         * compared against the fix's -- and an action that is REJECTED is still evidence of what
         * the student tried, which the spec wants for sequence grading and integrity review.
         * Logging afterwards skipped every rejection and left both positions sharing a number. */
        var idx = logEvent(state, 'gui', window, action + ' ' + JSON.stringify(params || {}));
        var fn = own(set, action);
        if (!fn) {
            state.events[idx].detail += ' [rejected: no such action]';
            return { ok: false, reason: window + ' has no action ' + action };
        }
        var res = fn(state, params || {});
        if (!res.ok) { state.events[idx].detail += ' [rejected: ' + res.reason + ']'; }
        else { FAULTS.recordProgress(state, idx); }
        return res;
    }

    /* Device restore lives on the device menu, not in a window, but it is a GUI affordance and it
     * is graded (free, logged), so it is exposed here rather than in the shell. */
    function restore(state, device) {
        /* restoreDevice logs the restore and stamps progress itself, so this does not do it again:
         * calling recordProgress twice would stamp against two different event indices and the
         * later one would win, which is the wrong answer by one. */
        return FAULTS.restoreDevice(state, device);
    }


    /* ═══ THE ACTION SCHEMA ═══════════════════════════════════════════════════════════════════════
     * What each window's actions are called, what they take, and what to label the fields.
     *
     * WHY THE SERVER DECLARES THIS. The exam page shipped as a read-only table dumper: it rendered
     * every window's data and offered no way to act on any of it. Fifteen actions existed and the
     * page reached exactly one. That made `change-requests/submit` and `incident-log/submit`
     * unreachable, and both are GRADED -- the incident log's layer field is the graded answer for
     * Q43/44, and a change request filed before the fix is the difference between full credit and
     * three of six on every one of the twelve fix questions. The firewall, wireless and rack repairs
     * had no path at all, so the faults they fix were unfixable from the browser.
     *
     * The fix is not a hardcoded list of forms in the page. The page already holds no lab logic, and
     * a copy of the action set would be a second source of truth that drifts the first time someone
     * adds an action -- the page would keep rendering the old set and nobody would see a thing. So
     * the engine declares the forms, the render includes them, and the page builds inputs from what
     * it is handed. A new action appears in the UI because it exists, not because someone remembered.
     *
     * `schemaGaps()` below is the ledger: it reports any action with no schema and any schema with no
     * action, and the gui suite asserts it is empty. An action that cannot be reached is as broken as
     * one that does not exist, and this is the check that says so.
     * ═══════════════════════════════════════════════════════════════════════════════════════════ */
    var ACTION_SCHEMA = {
        firewall: {
            'nat-add-outbound': { label: 'Add outbound NAT rule', params: [
                { name: 'src', label: 'Source network (CIDR)', placeholder: '10.0.20.0/24' } ] },
            'nat-remove-outbound': { label: 'Remove outbound NAT rule', params: [
                { name: 'index', label: 'Rule number (as listed above)', placeholder: '0' } ] },
            'portforward-set': { label: 'Edit a port forward', params: [
                { name: 'wanPort', label: 'WAN port', placeholder: '443' },
                { name: 'toIp', label: 'Forward to address', placeholder: '10.0.30.20' },
                { name: 'toPort', label: 'Forward to port', placeholder: '443', optional: true } ] },
            'ipsec-add-phase2': { label: 'Add IPsec phase 2', params: [
                { name: 'local', label: 'Local network (CIDR)', placeholder: '10.0.30.0/24' },
                { name: 'remote', label: 'Remote network (CIDR)', placeholder: '192.168.90.0/24' } ] },
            'ipsec-remove-phase2': { label: 'Remove IPsec phase 2', params: [
                { name: 'index', label: 'Entry number (as listed above)', placeholder: '0' } ] },
            'diag-ping': { label: 'Ping from the firewall', params: [
                { name: 'target', label: 'Target address or name', placeholder: '8.8.8.8' } ] },
            'diag-test-from-wan': { label: 'Test a port from the WAN side', params: [
                { name: 'port', label: 'TCP port', placeholder: '443' } ] }
        },
        wireless: {
            'ssid-set-vlan': { label: 'Map an SSID to a VLAN', params: [
                { name: 'ssid', label: 'SSID', options: function (st) {
                    return (st.ssids || []).map(function (x) { return x.name; }); } },
                { name: 'vlan', label: 'VLAN id', placeholder: '99' } ] },
            'ap-set-channel': { label: 'Set an AP radio channel', params: [
                { name: 'ap', label: 'Access point', options: function (st) {
                    return Object.keys((st.wireless && st.wireless.apChannels) || {}); } },
                { name: 'channel', label: '2.4 GHz channel', placeholder: '1, 6 or 11' } ] }
        },
        noc: {
            'ack-alert': { label: 'Acknowledge an alert', params: [
                { name: 'id', label: 'Alert', options: function (st) {
                    var v = renderNoc(st);
                    return (v.alerts || []).map(function (a) { return a.id; }); } } ] }
        },
        rack: {
            'replace-cable': { label: 'Replace a patch cable', params: [
                { name: 'device', label: 'Device', options: function (st) {
                    return Object.keys(st.ports || {}); } },
                { name: 'port', label: 'Port', placeholder: 'Fa0/8' } ] },
            'reseat-cable': { label: 'Reseat a patch cable', params: [
                { name: 'device', label: 'Device', options: function (st) {
                    return Object.keys(st.ports || {}); } },
                { name: 'port', label: 'Port', placeholder: 'Fa0/8' } ] }
        },
        questions: {
            /* The question panel has its own callable, so rendering a second form for it would give
             * the student two controls that disagree about what they answered. Declared so the
             * ledger sees it covered, and marked internal so no form is built. */
            'answer': { label: 'Answer a question', internal: true, params: [
                { name: 'id', label: 'Question id' }, { name: 'value', label: 'Answer' } ] }
        },
        'change-requests': {
            'submit': { label: 'File a change request', params: [
                { name: 'ticket', label: 'Ticket', options: function (st) {
                    return (st.tickets || []).map(function (t) { return t.id; }); } },
                { name: 'rootCause', label: 'Root cause', textarea: true },
                { name: 'layer', label: 'OSI layer', options: function () { return GRADED_LAYERS; } },
                { name: 'plannedChange', label: 'Planned change', textarea: true },
                { name: 'rollback', label: 'Rollback plan', textarea: true } ] }
        },
        'incident-log': {
            'submit': { label: 'Record an incident-log entry', params: [
                { name: 'ticket', label: 'Ticket', options: function (st) {
                    return (st.tickets || []).map(function (t) { return t.id; }); } },
                { name: 'symptom', label: 'Symptom', textarea: true },
                { name: 'layer', label: 'OSI layer', options: function () { return GRADED_LAYERS; } },
                { name: 'rootCause', label: 'Root cause', textarea: true },
                { name: 'fix', label: 'Fix applied', textarea: true },
                { name: 'verification', label: 'How you verified it', textarea: true } ] }
        }
    };

    /* The forms for one window, with option lists resolved against THIS lab. Option lists are the
     * reason this takes state: a student should pick a real ticket from a list, not retype an id
     * they half-remember and lose credit to a typo. */
    function actionSchema(state, window) {
        var set = own(ACTION_SCHEMA, window) || {};
        return Object.keys(set).filter(function (k) { return !set[k].internal; }).map(function (name) {
            var def = set[name];
            return {
                action: name,
                label: def.label || name,
                params: (def.params || []).map(function (prm) {
                    var out = {
                        name: prm.name,
                        label: prm.label || prm.name,
                        placeholder: prm.placeholder || '',
                        optional: !!prm.optional,
                        textarea: !!prm.textarea
                    };
                    if (typeof prm.options === 'function') {
                        var opts = prm.options(state) || [];
                        out.options = opts.filter(function (o) { return o !== null && o !== undefined; })
                            .map(String);
                    }
                    return out;
                })
            };
        });
    }

    /* THE LEDGER. Any action with no schema is unreachable from the UI; any schema with no action is
     * a form that will always be rejected. Both are defects and both are silent, so the gui suite
     * asserts this returns nothing. */
    function schemaGaps() {
        var gaps = [];
        Object.keys(ACTIONS).forEach(function (w) {
            Object.keys(ACTIONS[w]).forEach(function (a) {
                if (!(ACTION_SCHEMA[w] && ACTION_SCHEMA[w][a])) { gaps.push('action without a schema: ' + w + '/' + a); }
            });
        });
        Object.keys(ACTION_SCHEMA).forEach(function (w) {
            Object.keys(ACTION_SCHEMA[w]).forEach(function (a) {
                if (!(ACTIONS[w] && ACTIONS[w][a])) { gaps.push('schema without an action: ' + w + '/' + a); }
            });
        });
        return gaps;
    }

    module.exports = {
        WINDOWS: WINDOWS, render: render, act: act, restore: restore,
        fields: { changeRequest: CR_FIELDS, incidentLog: LOG_FIELDS },
        actionNames: Object.keys(ACTIONS).reduce(function (acc, w) { acc[w] = Object.keys(ACTIONS[w]); return acc; }, {}),
        actionSchema: actionSchema, schemaGaps: schemaGaps, own: own
    };
})();
