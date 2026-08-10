#!/usr/bin/env node
/**
 * lagrange-terminal-test.js: LagrangeTerminal command behaviour.
 *
 * @catalog what    Verifies the LAGRANGE EDGE ground-segment console: physics derivations,
 * @catalog what    SDLS refusal, provenance on every telemetry read, and inheritance.
 * @catalog run     node _tools/qa/cold-horizon/lagrange-terminal-test.js
 * @catalog status  TOOL
 *
 * Loads the real component in a jsdom-free harness by stubbing the two parent classes, so
 * this tests LagrangeTerminal's OWN behaviour without dragging 5,000 lines of LinuxTerminal
 * into scope. The inheritance CHAIN is asserted separately (see the fall-through test) rather
 * than assumed: a console that silently stopped inheriting nmap would still pass every
 * space-command test, which is exactly the wrong-surface failure this box has hit before.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = '/home/eq/ai-content/hexworth-prime/_app';
let pass = 0, fail = 0;
function check(name, cond, detail) {
    if (cond) { pass++; console.log(`  PASS  ${name}${detail ? '  -> ' + detail : ''}`); }
    else { fail++; console.log(`  FAIL  ${name}${detail ? '  -> ' + detail : ''}`); }
}

/* Minimal stand-ins for the two ancestors. They record what falls through to them, which is
   how the inheritance test can prove a non-space command actually reaches the parent. */
const fellThrough = [];
const src = `
class LinuxTerminal {
    constructor(o) { this.opts = o || {}; this.commandHistory = []; this.historyIndex = 0; }
    _parseCommand(line) { const p = line.split(/\\s+/); return { cmd: p[0], args: p.slice(1) }; }
    execute(line) { fellThrough.push(line); return 'PARENT:' + line; }
}
class SecurityTerminal extends LinuxTerminal {}
` + fs.readFileSync(path.join(ROOT, 'components/LagrangeTerminal.js'), 'utf8')
  + '\n;globalThis.__LT = LagrangeTerminal; globalThis.__ST = SecurityTerminal;';

const sandbox = { console, module: { exports: {} }, fellThrough };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const LagrangeTerminal = sandbox.__LT;

console.log('\n  physics, derived not hardcoded');
const t = new LagrangeTerminal({});
check('round-trip light time at 326,000 km is the real ~2.18 s floor',
      Math.abs(t.rtlt() - 2.175) < 0.01, t.rtlt().toFixed(3) + ' s');
check('the floor MOVES when range changes (it is a derivation, not a constant)',
      t.rtlt(700000) > t.rtlt(326000), `${t.rtlt(326000).toFixed(2)} -> ${t.rtlt(700000).toFixed(2)}`);
check('one-way is exactly half of round-trip', Math.abs(t.rtlt() - 2 * t.owlt()) < 1e-9);

console.log('\n  provenance is attached to every reading');
const tm = t.execute('tm');
check('a telemetry read names the link it arrived by', /via ka-1/.test(tm));
check('...and the clock that stamped it', /clock MOC-NTP/.test(tm));
check('...and the authority that signed it', /signed astraea-platform-ca/.test(tm));
check('...and states the reading is stale by at least the light-time floor',
      /at least 2\.\d+ s/.test(tm));
const ir = t.execute('tm IR-SURVEY');
check('the out-of-band IR reading resolves to a DIFFERENT link, clock and signer',
      /via rsv-opt/.test(ir) && /clock RSV-RTC/.test(ir) && /signed rsv-payload-attest/.test(ir));
check('an unknown point fails with the list of real ones, not silently',
      /no such telemetry point/.test(t.execute('tm NOPE')) && /TH-1/.test(t.execute('tm NOPE')));

console.log('\n  SDLS gates the uplink at the frame layer');
const tc = t.execute('tc SAFE_MODE');
check('an unauthenticated telecommand is REFUSED', /REFUSED at the frame layer/.test(tc));
check('...and the refusal is attributed to the LINK, before the spacecraft evaluated it',
      /BEFORE the\s+spacecraft evaluated/.test(tc));
check('sdls explains why rather than just reporting NO',
      /authenticated : NO/.test(t.execute('sdls')) && /no authenticated session/.test(t.execute('sdls')));
const authed = new LagrangeTerminal({ platform: Object.assign(
    LagrangeTerminal.defaultPlatform(), { sdls: { authenticated: true, suite: 'AES-256-GCM', spi: 12 } }) });
check('an AUTHENTICATED link accepts the same command (the gate discriminates)',
      /ACCEPTED for uplink/.test(authed.execute('tc SAFE_MODE')));
check('...and still bounds the ack by light time',
      /cannot return sooner than 2\.\d+ s/.test(authed.execute('tc SAFE_MODE')));

console.log('\n  ranging is a distance measurement, which is the point');
const r = t.execute('ranging');
check('ranging says plainly it is not a clock reading', /not a clock reading/.test(r));
check('ranging names the impossible-round-trip test mission 3 turns on',
      /it is impossible/.test(r));
check('ranging accepts an explicit range and recomputes', /700,000 km/.test(t.execute('ranging 700000')));

console.log('\n  passes distinguish "not visible" from "silent"');
const p = t.execute('pass');
check('pass output separates geometry from platform health', /not silent, it is not visible/.test(p));
check('the current window is marked', /^> /m.test(p));

console.log('\n  frames');
check('TM frames show contiguous sequence counts', /seq 18822/.test(t.execute('frames')));
check('...and refuse to overclaim what contiguity proves',
      /says nothing about whether/.test(t.execute('frames')));
check('TC frames show the rejected, unauthenticated uplink attempts',
      /REJECTED/.test(t.execute('frames --tc')));

console.log('\n  inheritance actually works (not assumed)');
fellThrough.length = 0;
const out = t.execute('nmap 10.0.0.1');
check('a NON-space command falls through to the parent chain',
      out === 'PARENT:nmap 10.0.0.1' && fellThrough.length === 1, fellThrough[0]);
check('a space command does NOT reach the parent',
      (fellThrough.length === 1) && !!t.execute('pass') && fellThrough.length === 1);
check('LagrangeTerminal really is a SecurityTerminal', t instanceof sandbox.__ST);

console.log('\n  the lexical-class trap is not reintroduced');
check('the component does not attach itself to window',
      !/window\.LagrangeTerminal\s*=/.test(fs.readFileSync(path.join(ROOT, 'components/LagrangeTerminal.js'), 'utf8')));

console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
