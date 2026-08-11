/**
 * ===============================================================================
 * LagrangeTerminal.js - Space ground-segment console for the LAGRANGE EDGE world
 * ===============================================================================
 *
 * Hexworth Prime - House of Cloud / Arena
 *
 * EXTENDS SecurityTerminal (which extends LinuxTerminal), because a ground segment
 * IS a Linux box with network tools, and a student should be able to run nmap and
 * tcpdump against it exactly as they would anywhere else. Seven terminals already
 * exist on this platform; this is an eighth COMMAND SET, not an eighth engine.
 *
 * ── WHY A SIMULATED TARGET STILL TEACHES A REAL SKILL ───────────────────────────
 * The operator chose a simulated target to start. The risk with any simulation is
 * that it only ever reflects what we scripted, so the student learns our fiction
 * rather than the domain. The defence here is PROVENANCE.
 *
 * Every reading this console returns carries how it arrived: which link it came
 * down, which clock stamped it, which authority signed it. That is not decoration.
 * It is the same vocabulary the box's trust ledger already uses for independence,
 * and interrogating it is the actual skill: two readings that agree are one reading
 * if they share a link, a clock and a signer. That transfers to real systems even
 * though this spacecraft does not exist.
 *
 * ── PROVENANCE LEDGER (the box's own standard: REAL / EXTRAPOLATED / INVENTED) ──
 * REAL, and citable:
 *   - CCSDS Space Packet Protocol and TM/TC Space Data Link Protocols. Frame
 *     structure, APIDs, virtual channels and sequence counts follow the standard.
 *   - CCSDS 355.0-B Space Data Link Security (SDLS): authentication is a property
 *     of the link, and an unauthenticated telecommand is refused at the frame layer.
 *   - Two-way ranging and light-time as a physical bound. At ~326,000 km the round
 *     trip cannot be shorter than ~2.18 s. This is the mechanic mission 3 already
 *     turns into evidence, and it is a distance measurement, not a clock reading.
 *   - AOS/LOS pass windows: a ground station sees a platform only when geometry
 *     allows, so "no telemetry" and "no contact" are different claims.
 * EXTRAPOLATED:
 *   - ASTRAEA-9's specific bus layout, APID assignments and station list. Plausible
 *     for a cislunar edge-compute platform; not any real spacecraft.
 * INVENTED:
 *   - The mission fiction, operator names and the incident itself.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────────
 *   const term = new LagrangeTerminal({
 *       container: '#terminalOutput',
 *       inputElement: '#commandInput',
 *       user: 'ir-lead', hostname: 'moc-jax',
 *       platform: ColdHorizonConfig.forMission(9)   // optional; falls back to a default
 *   });
 *
 * NOTE ON GLOBALS: `class LagrangeTerminal` is a top-level LEXICAL binding, exactly
 * like SecurityTerminal and LinuxTerminal. It is NOT a property of `window`, so a
 * guard written as `if (window.LagrangeTerminal)` is permanently false. Use
 * `typeof LagrangeTerminal !== 'undefined'`. This trap has bitten this codebase
 * before and is recorded in memory as the lexical-const window guard.
 */

class LagrangeTerminal extends SecurityTerminal {
    constructor(options = {}) {
        super(options);

        /* The platform under observation. A mission passes its own config so the
           console reports THAT mission's evidence; without one we fall back to a
           default so the component is usable standalone (and testable). */
        this.platform = options.platform || LagrangeTerminal.defaultPlatform();

        /* Light-time is derived from range, never stored as a constant, because the
           whole point of mission 3 is that the floor is a consequence of distance.
           A student who changes the range must see the floor move. */
        this.rangeKm = this.platform.rangeKm || 326000;

        /* Commands this console owns. Everything else falls through to
           SecurityTerminal (nmap, tcpdump, dig) and then to LinuxTerminal. */
        this.spaceCommands = ['pass', 'tm', 'tc', 'frames', 'ranging', 'sdls', 'link', 'lehelp',
                              'help', 'clear', 'whoami'];

        /* THE SORTIE HAND-OFF. A flown sortie leaves an observation in storage and the console
           adds it as a source. This is the two-phase mission shape: fly out and measure the
           thing with your own instrument, then reason about it at the desk.

           The RSV survey is not a reward for finishing a game. It is the ONLY reading in this
           box that shares no link, no clock and no signing authority with the platform, and
           the console cannot produce it because the console is downstream of the platform.
           You have to go and look.

           It unlocks a SOURCE, never credit: the flag is still compared server-side, so
           forging this key buys a telemetry row and no points. */
        this.sortie = LagrangeTerminal.readSortie();
        if (this.sortie && this.sortie.observation) {
            this.platform.telemetry = this.platform.telemetry.concat([this.sortie.observation]);
        }
    }

    /* The inherited fallback says "This console provides security tooling. Try sechelp",
       which is MISDIRECTION here: sechelp lists nmap and tcpdump, not the ground segment. A
       student who typed `ls` was pointed at the wrong manual.

       And it must not pretend to be a shell. This console has no filesystem, deliberately:
       everything it reports arrived through a link, a clock and a signing authority, which is
       the entire lesson. Inventing an `ls` over a fake directory would be the one thing this
       box tells students never to trust, built into the console itself. So shell commands are
       NAMED as shell commands and redirected, rather than faked or silently refused. */
    _executeFallback(cmd, args, raw) {
        if (!cmd) return '';
        const SHELL = ['ls', 'pwd', 'cd', 'cat', 'less', 'more', 'head', 'tail', 'rm', 'cp',
                       'mv', 'mkdir', 'touch', 'grep', 'find', 'ps', 'top', 'chmod', 'vi', 'nano'];
        if (SHELL.indexOf(cmd) !== -1) {
            return `<span class="lt-error">${this._escape(cmd)}: not a shell</span>\n` +
                   `This is the ground segment console, not a host. It has no filesystem to ` +
                   `list: everything here arrived over a link, on a clock, under a signing ` +
                   `authority, and it is reported with all three.\n\n` +
                   `Try <span class="lt-command">lehelp</span> for what this console does, or ` +
                   `<span class="lt-command">tm</span> to read telemetry with its provenance.`;
        }
        return `<span class="lt-error">${this._escape(cmd)}: command not found</span>\n` +
               `Try <span class="lt-command">lehelp</span> for the ground segment commands, or ` +
               `<span class="lt-command">sechelp</span> for the network tooling.`;
    }

    /** The observation a flown sortie left behind, or null. Never throws: a console that
        cannot read storage must still work, it just has fewer sources. */
    static readSortie() {
        try {
            if (typeof localStorage === 'undefined') return null;
            var raw = localStorage.getItem('hexworth_le01_sortie');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    /* ── physical constants and derivations ─────────────────────────────────── */

    static get C_KM_S() { return 299792.458; }   // speed of light, km/s

    /** One-way light time in seconds for a range in km. */
    owlt(km) { return (km || this.rangeKm) / LagrangeTerminal.C_KM_S; }

    /** Round-trip light time: the floor no command/ack pair can beat. */
    rtlt(km) { return 2 * this.owlt(km); }

    /* ── the default platform, used when no mission config is supplied ──────── */

    static defaultPlatform() {
        return {
            name: 'ASTRAEA-9',
            callSign: 'COLD HORIZON',
            rangeKm: 326000,
            /* Links carry the provenance a reading inherits. Two readings down the
               same link are not two readings for corroboration purposes. */
            links: [
                { id: 'ka-1', name: 'Ka-band primary', station: 'DSS-JAX',
                  clock: 'MOC-NTP', authority: 'astraea-platform-ca', up: true },
                { id: 's-omni', name: 'S-band omni (survival)', station: 'DSS-JAX',
                  clock: 'PLAT-CLK-A', authority: 'astraea-fsw-attest', up: true },
                { id: 'rsv-opt', name: 'RSV optical payload', station: 'RSV-1',
                  clock: 'RSV-RTC', authority: 'rsv-payload-attest', up: true }
            ],
            /* Telemetry points. `via` names the link, which is what makes two points
               dependent or independent. */
            telemetry: [
                { point: 'TH-1', desc: 'HELIOS-7 thermal channel 1', value: '41.2 C', via: 'ka-1' },
                { point: 'TH-2', desc: 'HELIOS-7 thermal channel 2', value: '41.4 C', via: 'ka-1' },
                { point: 'TH-3', desc: 'HELIOS-7 thermal channel 3', value: '58.9 C', via: 'ka-1' }
            ],
            /* Pass windows. "No telemetry" during LOS is not the same claim as
               "the platform is silent", and the console must let a student tell
               those apart rather than collapsing both into an empty reading. */
            passes: [
                { station: 'DSS-JAX', aos: '04:02Z', los: '07:48Z', state: 'past' },
                { station: 'DSS-JAX', aos: '09:16Z', los: '13:02Z', state: 'current' },
                { station: 'DSS-MAD', aos: '14:31Z', los: '18:10Z', state: 'future' }
            ],
            /* SDLS: authenticated is a property of the LINK, and it is what decides
               whether a telecommand is accepted at the frame layer. */
            sdls: { authenticated: false, suite: 'AES-256-GCM', spi: 12,
                    reason: 'no authenticated session established this pass' }
        };
    }

    /* ── dispatch, mirroring SecurityTerminal's own shape ───────────────────── */

    execute(command) {
        const trimmed = (command || '').trim();
        if (!trimmed) return;
        const parsed = this._parseCommand(trimmed);
        const cmd = (parsed.cmd || '').toLowerCase();
        const args = parsed.args || [];
        if (this.spaceCommands.includes(cmd)) {
            const output = this._executeSpaceCommand(cmd, args);
            this.commandHistory.push(trimmed);
            this.historyIndex = this.commandHistory.length;
            /* _displayOutput is the platform's render hook, the one lab pages override
               (SecurityTerminal.js: "Display output (can be overridden by lab pages)").
               This called a non-existent this._render at first, guarded by a typeof check,
               so every space command computed the right text and put NOTHING on screen.
               The unit test did not catch it because it asserts the RETURN value; a command
               that returns correctly and renders nowhere passes that test perfectly. */
            this._displayOutput(trimmed, output);
            return output;
        }
        return super.execute(command);
    }

    _executeSpaceCommand(cmd, args) {
        switch (cmd) {
            case 'lehelp':  return this._cmdHelp();
            case 'pass':    return this._cmdPass();
            case 'link':    return this._cmdLink();
            case 'tm':      return this._cmdTm(args);
            case 'tc':      return this._cmdTc(args);
            case 'frames':  return this._cmdFrames(args);
            case 'ranging': return this._cmdRanging(args);
            case 'sdls':    return this._cmdSdls();
            /* Commands the PROMPT owes the user. It renders `ir-lead@moc-jax:~$`, a Unix shell
               prompt with a home directory in it, so a student types these before reading any
               help text. They cost nothing and their absence read as a broken console. */
            case 'help':    return this._cmdHelp();          // nobody guesses "lehelp" first
            case 'clear':   return '__LE_CLEAR__';
            case 'whoami':  return `${this.user || 'ir-lead'}\nIncident response lead, ` +
                                   `delegated commercial operator authority. Not state authority, ` +
                                   `and not the only certificate ASTRAEA-9 will accept.`;
            default:        return `lagrange: unknown command: ${cmd}`;
        }
    }

    /* ── commands ───────────────────────────────────────────────────────────── */

    _cmdHelp() {
        return [
            'LAGRANGE EDGE ground segment console',
            '',
            '  pass                 upcoming and current AOS/LOS windows',
            '  link                 downlink status and what each link carries',
            '  tm [point]           read telemetry, WITH the provenance it arrived by',
            '  tc <command>         send a telecommand (SDLS-gated)',
            '  frames [--tc]        inspect CCSDS frames on the current virtual channel',
            '  ranging              two-way ranging fix and the light-time floor',
            '  sdls                 Space Data Link Security state for this link',
            '',
            'Linux and network tools (ls, cat, grep, nmap, tcpdump, dig) work as usual.',
            '',
            'Two readings that agree are ONE reading if they share a link, a clock and',
            'a signer. Every output below tells you which.'
        ].join('\n');
    }

    _cmdPass() {
        const rows = this.platform.passes.map(p => {
            const mark = p.state === 'current' ? '>' : ' ';
            return `${mark} ${p.station.padEnd(9)} AOS ${p.aos}   LOS ${p.los}   ${p.state}`;
        });
        return ['Pass windows (station geometry, not platform health):', ...rows, '',
                'During LOS the platform is not silent, it is not visible. Those are',
                'different findings and only one of them is evidence of a fault.'].join('\n');
    }

    _cmdLink() {
        const rows = this.platform.links.map(l =>
            `  ${l.id.padEnd(8)} ${l.up ? 'UP  ' : 'DOWN'} ${l.name.padEnd(26)} ` +
            `station=${l.station}  clock=${l.clock}  signer=${l.authority}`);
        return ['Downlinks:', ...rows, '',
                `Round-trip light time at ${this.rangeKm.toLocaleString()} km: ` +
                `${this.rtlt().toFixed(2)} s. Every reading below is at least that old.`].join('\n');
    }

    _cmdTm(args) {
        const want = (args[0] || '').toUpperCase();
        const points = want
            ? this.platform.telemetry.filter(t => t.point.toUpperCase() === want)
            : this.platform.telemetry;
        if (!points.length) {
            if (want === 'IR-SURVEY' && !this.sortie) {
                return 'tm: IR-SURVEY is not available from this console.\n\n' +
                       'The infrared survey is taken from the RSV, off-platform. Nothing at this\n' +
                       'desk can produce it, because everything here arrives through ASTRAEA-9.\n' +
                       'Fly the Line of Sight sortie and it will appear as a source.';
            }
            return `tm: no such telemetry point: ${args[0]}\n` +
                   `available: ${this.platform.telemetry.map(t => t.point).join(', ')}`;
        }
        const linkById = id => this.platform.links.find(l => l.id === id) || {};
        const rows = points.map(t => {
            const l = linkById(t.via);
            return `  ${t.point.padEnd(10)} ${String(t.value).padEnd(9)} ${t.desc}\n` +
                   `             via ${l.id || '?'} | clock ${l.clock || '?'} | ` +
                   `signed ${l.authority || '?'}`;
        });
        var tail = [`Age at receipt: at least ${this.rtlt().toFixed(2)} s. Nothing here is current.`];
        /* Say what is MISSING and why. Silently listing three platform channels would let a
           player conclude they have three sources, when they have one source counted three
           times: TH-1, TH-2 and TH-3 all arrive on ka-1, on one clock, under one signature. */
        if (!this.sortie) {
            tail.push('');
            tail.push('NO OUT-OF-BAND SOURCE ON RECORD. Every reading above came down the same');
            tail.push('link, on the same clock, under the same signature. They can agree with');
            tail.push('each other all day and still be one source.');
            tail.push('Fly the Line of Sight sortie and measure HELIOS-7 yourself.');
        }
        return ['Telemetry (value, then how it reached you):', ...rows, '', ...tail].join('\n');
    }

    _cmdSdls() {
        const s = this.platform.sdls || {};
        return [
            'Space Data Link Security (CCSDS 355.0-B):',
            `  authenticated : ${s.authenticated ? 'YES' : 'NO'}`,
            `  suite         : ${s.suite || 'none'}`,
            `  SPI           : ${s.spi != null ? s.spi : 'none'}`,
            s.authenticated ? '' : `  reason        : ${s.reason || 'unknown'}`,
            '',
            'Authentication is a property of the LINK, not of the operator who typed',
            'the command. A valid session proves the frame was not forged in transit.',
            'It does not establish who sat at the console.'
        ].filter(Boolean).join('\n');
    }

    _cmdTc(args) {
        const cmdText = args.join(' ').trim();
        if (!cmdText) return 'tc: usage: tc <command>   (example: tc SAFE_MODE)';
        const s = this.platform.sdls || {};
        if (!s.authenticated) {
            return [
                `tc: REFUSED at the frame layer: ${cmdText}`,
                '',
                'The link has no authenticated SDLS session, so this telecommand cannot',
                'be accepted. This is a link-layer refusal and it happened BEFORE the',
                'spacecraft evaluated what you asked for.',
                '',
                'Run `sdls` to see why.'
            ].join('\n');
        }
        return [`tc: ACCEPTED for uplink: ${cmdText}`, '',
                `Ack cannot return sooner than ${this.rtlt().toFixed(2)} s from now.`,
                'An acknowledgement timestamped sooner than that did not come from the',
                'platform, whatever the log says.'].join('\n');
    }

    _cmdFrames(args) {
        const tc = args.includes('--tc');
        const kind = tc ? 'TC' : 'TM';
        const rows = tc
            ? ['  VC0  seq 00412  APID 0x0A1  SDLS: unauthenticated  REJECTED',
               '  VC0  seq 00413  APID 0x0A1  SDLS: unauthenticated  REJECTED']
            : ['  VC0  seq 18822  APID 0x101  TH-1 41.2 C   signed astraea-platform-ca',
               '  VC0  seq 18823  APID 0x101  TH-2 41.4 C   signed astraea-platform-ca',
               '  VC0  seq 18824  APID 0x101  TH-3 58.9 C   signed astraea-platform-ca'];
        return [`CCSDS ${kind} frames, current virtual channel:`, ...rows, '',
                'Sequence counts are contiguous, so nothing was dropped on this channel.',
                'Contiguity proves the CHANNEL is intact. It says nothing about whether',
                'the values were correct when they were sampled.'].join('\n');
    }

    _cmdRanging(args) {
        const km = Number(args[0]) || this.rangeKm;
        const rt = this.rtlt(km);
        return [
            'Two-way ranging fix:',
            `  measured range   : ${km.toLocaleString()} km`,
            `  one-way light    : ${this.owlt(km).toFixed(3)} s`,
            `  round-trip floor : ${rt.toFixed(3)} s`,
            '',
            'This is a DISTANCE measurement, not a clock reading. It cannot be moved by',
            'editing a timestamp, which is what makes it usable as evidence when two',
            'logs disagree about when something happened.',
            '',
            `Any command/ack pair in the logs separated by less than ${rt.toFixed(2)} s is`,
            'not slow, it is impossible.'
        ].join('\n');
    }
}

// Export for use (Node tests). In the browser this is a lexical class binding and is
// deliberately NOT attached to window; see the note at the top of this file.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LagrangeTerminal;
}
