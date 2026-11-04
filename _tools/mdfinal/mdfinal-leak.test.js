#!/usr/bin/env node
/**
 * mdfinal-leak.test.js — R5: nothing a client receives discloses the key, the fault or a hidden pick.
 *
 * @catalog what    MD-100 final leak suite: every window and the initial state across 12 classes
 * @catalog what    before and after handover, hidden-value canary, derived key coverage, WO review,
 * @catalog what    lockout test (forbidden tokens typed into every input), fuzzed console commands.
 * @catalog run     node _tools/mdfinal/mdfinal-leak.test.js
 * @catalog status  TOOL
 *
 * EVERYTHING GOES THROUGH THE SERVICE (mdfinal-exam.js), so the runtime scanner is exercised on
 * every payload: a disclosure there is an 'internal' refusal, which this suite counts as a failure.
 * The STRICT pass then re-scans each payload with the $s exemption switched off: on honest fixtures
 * (the walk never types a forbidden token) no student-text slot may carry a pattern, which shows no
 * server-authored secret is hiding behind a $s tag. The canary is the key's own hidden values
 * (fault KB, driver inf, decoy IP, profile id, unused BitLocker ids and passwords): none may appear
 * in anything sent before handover.
 */
const kit = require('./mdfinal-test-kit.js');
const SK = require('./mdfinal-svc-kit.js');
const W = require('./mdfinal-walk.js');
const EXAM = kit.req('mdfinal-exam.js');
const CORE = kit.req('mdfinal-core.js');
const CLIENT = kit.req('mdfinal-client.js');
const VIEWS = kit.req('mdfinal-views.js');
const GUI = kit.req('mdfinal-gui.js');
const HO = kit.req('mdfinal-handover.js');
const t = kit.harness('mdfinal-leak');
const EX = SK.EX;

/* Paths the address-bar windows are rendered at, per state. */
function viewParams(win, wo) {
    if (win === 'regedit') { return [{}, { key: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate' }, { key: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' },
                                     { key: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e967-e325-11ce-bfc1-08002be10318}' }, { key: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\MerVpnHelper' }]; }
    if (win === 'explorer') { return [{}, { path: 'C:\\' }, { path: 'D:\\' }, { path: 'E:\\' }, { path: 'F:\\' }, { path: wo.share.path }, { path: wo.confidentialPath }]; }
    return [{}];
}

/* Every window the current screen offers, at every address, through the service; plus the
 * initial state (a resume). Returns the payloads; a thrown 'internal' is a scanner hit. */
async function sweep(f, label, sink) {
    const payloads = [];
    const doc = EXAM.fromDocument(await f.st.get(f.sid));
    for (const w of VIEWS.WINDOW_NAMES) {
        if (!GUI.screenAllows(doc.state, w)) { continue; }
        for (const p of viewParams(w, doc.state.wo)) {
            try { payloads.push((await EXAM.renderWindow(f.st, { sessionId: f.sid, window: w, params: p }, f.o)).view); }
            catch (e) { t.check(false, label + ': window ' + w + ' ' + JSON.stringify(p) + ' -> ' + e.code + ' ' + e.message); }
        }
    }
    payloads.push((await EXAM.startExam(f.st, { studentId: doc.studentId, examId: EX }, f.o)).initialState);
    if (sink) { payloads.forEach((x) => sink.push(x)); }
    return payloads;
}

/* The strict scan: $s nodes unwrapped, so their values are pattern-checked too. */
function strict(v) {
    return CLIENT.findDisclosures(JSON.parse(JSON.stringify(v, (k, x) => (CLIENT.isS(x) ? x.$s : x))), 'strict');
}

/* The key's hidden values that must not appear before handover. */
function canaries(key, made) {
    const c = [key.fault.kb, key.fault.driverInf, key.fault.decoyIp, key.profile];
    key.bitlocker.ids.slice(made).forEach((x) => c.push(x));
    key.bitlocker.passwords.slice(made).forEach((x) => c.push(x));
    return c.filter(Boolean);
}

/* Console forms a curious student tries before handover (state reads and dumps). */
const FUZZ = ['Get-VM', 'Get-VMHardDiskDrive -VMName MER-WS', 'pnputil /enum-drivers', 'Get-HotFix', 'Get-WindowsDriver -Online', 'Get-Service',
    'Get-ScheduledTask', 'Get-Process', 'Get-Content C:\\Windows\\System32\\drivers\\etc\\hosts', 'ipconfig /all', 'nslookup lsync-app01.meridian.local',
    'reg query HKLM\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e967-e325-11ce-bfc1-08002be10318}', 'manage-bde -protectors -get C:', 'manage-bde -status',
    'Get-BitLockerVolume', 'Get-WinEvent -LogName System', 'wevtutil qe System', 'slmgr /dlv', 'systeminfo', 'Get-ComputerInfo', 'dism /online /get-packages',
    'Get-AppxPackage', 'Get-AppxProvisionedPackage -Online', 'Get-CimInstance Win32_Product', 'set', 'Get-ChildItem Env:', 'Get-Variable', '$PSVersionTable',
    'whoami /all', 'Get-LocalUser | Format-List *', 'Get-NetIPConfiguration | ConvertTo-Json', 'Get-ItemProperty HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
    'Get-Item HKLM:\\SYSTEM\\CurrentControlSet\\Services\\* | Select-Object *', 'Get-Content F:\\*', 'Get-ChildItem F:\\', 'Get-ChildItem D:\\ -Recurse',
    'schtasks /query', 'sc query', 'Get-ComputerRestorePoint', 'netsh advfirewall firewall show rule name=all'];

(async () => {
    /* ═══ coverage derived from the engine, not remembered ═══════════════════════════════════ */
    {
        const keys = new Set();
        for (let v = 0; v < 4; v++) {
            const r = W.perfect('leak-cov-' + v, [0, v], { skipRepair: true, skipP8: true });
            Object.keys(r.state.fault).forEach((k) => keys.add(k));
        }
        /* reviewed exemptions: ticketId is shown on the ticket; kb is also an action parameter name
         * (settings/update-uninstall), the fault KB's VALUE is canaried before handover below, and
         * after handover it is the evidence the student is meant to find in Update history */
        const REVIEWED = ['ticketId', 'kb'];
        const uncovered = [...keys].filter((k) => REVIEWED.indexOf(k) < 0 && CLIENT.FORBIDDEN_KEYS.indexOf(k) < 0);
        t.check(uncovered.length === 0, 'every key on the fault record is forbidden or a reviewed exemption: missing ' + uncovered.join(','));
        ['fault', 'hotfix', 'keep', 'ledger', 'answerKey', 'snapshot', 'regScratch'].forEach((k) => t.check(CLIENT.FORBIDDEN_KEYS.indexOf(k) >= 0, 'forbidden: ' + k));
        const guiWins = Object.keys(GUI.WINDOWS).sort().join(',');
        t.check(VIEWS.WINDOW_NAMES.slice().sort().join(',') === guiWins, 'every GUI window has a renderer and every renderer a window');
    }

    /* ═══ WO review: a new WO key or subkey fails until someone decides it is student prose ══════ */
    {
        const PINNED = ['build.build', 'build.version', 'confidentialPath', 'consumerApp', 'defenderExclusion', 'disks.archiveAtLocation0', 'disks.archiveGB',
            'disks.archiveManifest', 'disks.cGB', 'disks.dLabel', 'disks.poolGB', 'disks.resiliencyProse', 'disks.spacesLabel', 'disks.spacesLetter', 'editionRule',
            'group', 'hostname', 'join.domain', 'join.joinAccount', 'join.type', 'join.workgroup', 'lob.fqdn', 'lob.host', 'lob.name', 'lob.port', 'mak',
            'network.dns', 'network.dnsNames', 'network.gateway', 'network.ip', 'network.kms', 'network.lobRemoteSubnet', 'network.mask', 'network.prefix',
            'performance.pagefileMB', 'power.acDisplayMin', 'power.acSleepMin', 'power.dcDisplayMin', 'power.dcSleepMin', 'power.planName',
            'privacy.advertisingId', 'privacy.diagnosticData', 'privacy.findMyDevice', 'privacy.inking', 'privacy.location', 'privacy.tailored',
            'requirements', 'retailCoa', 'secondMember.fullName', 'secondMember.name', 'share.name', 'share.path', 'technician', 'ticket', 'timeZone',
            'updates.activeHours', 'updates.cumulativeKb', 'updates.featureDeferralDays', 'updates.qualityDeferralDays', 'user.fullName', 'user.name',
            'vm.dynamicMemory', 'vm.startupMemoryMB', 'vm.vcpu', 'vm.vhdxGB'];
        const seen = new Set(), raw = new Set();
        for (let p = 0; p < 3; p++) {
            for (let v = 0; v < 4; v++) {
                const { state } = W.sitting('leak-wo-' + p + v, [p, v]);
                Object.keys(state.wo).forEach((k) => {
                    raw.add(k);
                    const x = state.wo[k];
                    if (x && typeof x === 'object' && !Array.isArray(x)) { Object.keys(x).forEach((s) => raw.add(k + '.' + s)); }
                });
                const pw = CLIENT.projectWo(state.wo);
                Object.keys(pw).forEach((k) => {
                    const x = pw[k];
                    if (x && typeof x === 'object' && !Array.isArray(x)) { Object.keys(x).forEach((s) => seen.add(k + '.' + s)); } else { seen.add(k); }
                });
            }
        }
        const got = [...seen].sort();
        t.check(JSON.stringify(got) === JSON.stringify(PINNED.slice().sort()), 'projected WO keys are exactly the reviewed set: +' + got.filter((k) => PINNED.indexOf(k) < 0).join(',') + ' -' + PINNED.filter((k) => got.indexOf(k) < 0).join(','));
        /* a raw key or subkey that does not leave must be a reviewed withholding (a top-level key
         * that is an object leaves as its subkeys, so it is not itself in `seen`) */
        const reviewedWithheld = ['performance.highImpact', 'performance.startupCandidates'];
        const leavesAsSubkeys = (k) => k.indexOf('.') < 0 && Object.prototype.hasOwnProperty.call(CLIENT.WO_KEYS, k) && got.some((s) => s.indexOf(k + '.') === 0);
        const unreviewed = [...raw].filter((k) => !seen.has(k) && !leavesAsSubkeys(k) && reviewedWithheld.indexOf(k) < 0);
        t.check(unreviewed.length === 0, 'every withheld WO key is a reviewed decision: ' + unreviewed.join(','));
        t.check(reviewedWithheld.every((k) => raw.has(k) && !seen.has(k)), '(could fail) the reviewed withholdings exist in the WO and are withheld');
    }

    /* ═══ 12 classes through the service: scanner, strict pass, canary ═══════════════════════════ */
    let payloadCount = 0;
    for (let p = 0; p < 3; p++) {
        for (let v = 0; v < 4; v++) {
            const uid = SK.naturalUid(p, v, 'leak-');
            const rec = SK.record(() => W.perfect(uid, null));
            const key = rec.out.key;
            const cut = rec.calls.findIndex((c) => c[0] === 'handover');
            const pre = rec.calls.slice(0, cut), post = rec.calls.slice(cut);
            const f = await SK.started(uid);
            const label = 'class ' + p + v;
            const before = [], after = [], outputs = [];
            await sweep(f, label + ' fresh', before);
            const refusedPre = await SK.replayInto(f.st, f.sid, pre, f.o, f.c, (call, r) => {
                outputs.push(r && (r.out !== undefined ? r.out : r.result ? r.result.msg : r));
            });
            t.check(refusedPre === 0, label + ': pre-handover replay refused nothing');
            await sweep(f, label + ' built', before);
            for (const line of FUZZ) {
                const r = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line }, f.o);
                outputs.push(r.out);
            }
            const doc = EXAM.fromDocument(await f.st.get(f.sid));
            const made = doc.state.bitlocker ? doc.state.bitlocker.C.made : 0;
            const text = JSON.stringify(before) + JSON.stringify(outputs);
            const hits = canaries(key, made).filter((c) => text.indexOf(c) >= 0);
            t.check(hits.length === 0, label + ': no hidden value appears before handover (' + hits.length + ' found)');
            const rp = doc.state.bitlocker && doc.state.bitlocker.C.protectors.filter((x) => x.type === 'RecoveryPassword')[0];
            t.check(!!rp && text.indexOf(rp.password) >= 0, label + ': (could fail) the created protector\'s password IS visible, so the canary search reads the payloads');
            /* the handover alone, then the symptom as the student first meets it */
            await SK.replayInto(f.st, f.sid, post.slice(0, 1), f.o, f.c);
            const broken = await sweep(f, label + ' handed over', after);
            /* diagnostic evidence reaches the student only through its ledgered action, never a view
             * (server-authored text only: the student's own saved answers may hold it later) */
            const serverText = JSON.stringify(broken, (k, x) => (CLIENT.isS(x) ? '' : x));
            const evidence = { V1: '0x0000007b', V2: key.fault.kb, V3: 'msynchlp', V4: key.fault.decoyIp }[key.variant];
            t.check(serverText.indexOf(evidence) < 0, label + ': the ' + key.variant + ' diagnostic evidence is in no window view');
            const probe = { V1: ['eventvwr', 'query', { log: 'System' }], V2: ['taskmgr', 'run', { target: 'ms-settings:windowsupdate-history' }],
                            V3: ['taskmgr', 'view', {}], V4: ['notepad', 'hosts-open', {}] }[key.variant];
            let shown = '';
            if (key.variant === 'V1') {
                /* WinRE has no Event Viewer: the symptom is the stop screen the recovery view repeats */
                const wr = (await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'winre' }, f.o)).view;
                t.check(wr.stopCode === 'INACCESSIBLE_BOOT_DEVICE' && /ran into a problem/.test(wr.stopScreen || ''), label + ': V1 shows the stop code on the recovery screen');
                const FA = kit.req('mdfinal-faults.js');
                const live = EXAM.fromDocument(await f.st.get(f.sid)).state;
                t.check(wr.stopCode.length <= kit.req('mdfinal-answers.js').FIELDS.I2.max && FA.evidenceSet(live, key).indexOf(FA.normEvidence(wr.stopCode)) >= 0,
                    label + ': the token as shown fits I2 and is an accepted answer');
                shown = null;
            } else if (key.variant === 'V2') {
                await EXAM.runAction(f.st, { sessionId: f.sid, window: probe[0], action: probe[1], params: probe[2] }, f.o);
                shown = (await EXAM.runAction(f.st, { sessionId: f.sid, window: 'settings', action: 'update-history', params: {} }, f.o)).result.msg;
            } else {
                shown = (await EXAM.runAction(f.st, { sessionId: f.sid, window: probe[0], action: probe[1], params: probe[2] }, f.o)).result.msg;
            }
            if (shown !== null) { t.check(shown.indexOf(evidence) >= 0, label + ': (could fail) ' + key.variant + '\'s evidence string is real: its action shows it'); }
            await SK.replayInto(f.st, f.sid, post.slice(1), f.o, f.c);
            await sweep(f, label + ' after repair', after);
            const all = before.concat(after);
            payloadCount += all.length;
            const strictHits = [];
            all.forEach((x, i) => { const s = strict(x); if (s.length) { strictHits.push(i + ':' + s.map((h) => h.path + ' ' + h.why).join(';')); } });
            t.check(strictHits.length === 0, label + ': strict pass ($s unwrapped) finds nothing: ' + strictHits.slice(0, 3).join(' | '));
            const markers = JSON.stringify(all).match(/"(fault|hotfix|keep|ledger|answerKey|snapshot|variant)":/g);
            t.check(!markers, label + ': no marker key in any payload: ' + (markers || []).join(','));
            const ticket = after.filter((x) => x && x.ticket).length;
            t.check(ticket > 0, label + ': (could fail) the ticket is shown after handover');
        }
    }
    t.check(payloadCount > 500, 'payloads scanned: ' + payloadCount);

    /* ═══ lockout: forbidden tokens typed into every input; everything still renders and runs ═════ */
    {
        const uid = SK.naturalUid(0, 0, 'lock-');
        const rec = SK.record(() => { const { state, key } = W.sitting(uid); W.p1Gui(state, key); W.p23Gui(state, key); W.p45Gui(state, key); W.p6Gui(state, key); return null; });
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls, f.o, f.c);
        const T = 'mdf-v2 mdp-c hexworth/mdfinal "fault": 1';
        const acts = [
            ['settings', 'rename', { name: 'MDF-V1' }],
            ['lusrmgr', 'user-new', { name: 'mdf-v3', fullName: T, password: 'Pass-1234!' }],
            ['lusrmgr', 'group-new', { name: 'mdp-a', description: T }],
            ['lusrmgr', 'group-add', { group: 'mdp-a', member: 'mdf-v3' }],
            ['explorer', 'new-folder', { path: 'D:\\mdf-v4' }],
            ['explorer', 'share', { path: 'D:\\mdf-v4', name: 'mdp-b' }],
            ['explorer', 'security-grant', { path: 'D:\\mdf-v4', principal: 'mdp-a', rights: 'Modify', type: 'Allow' }],
            ['explorer', 'security-grant', { path: 'D:\\mdf-v4', principal: 'MERIDIAN\\mdf-v1', rights: 'Read', type: 'Allow' }],
            ['explorer', 'share-perm', { name: 'mdp-b', principal: 'MERIDIAN\\mdf-v1', right: 'Read', type: 'Allow' }],
            ['wf', 'rule-new', { name: T, direction: 'Inbound', action: 'Allow', protocol: 'TCP', localPort: '4444', profile: 'Domain', remoteAddress: 'Any', enabled: true }],
            ['power', 'create-plan', { name: T, basedOn: 'Balanced', acDisplay: 10 }],
            ['defender', 'exclusion-add', { path: 'D:\\mdf-v1' }],
            ['sysprops', 'protection', { on: true }],
            ['sysprops', 'restore-point', { name: T }],
            ['notepad', 'hosts-save', { text: '10.0.0.9 mdf-v1.example\n' }],
            ['regedit', 'new-key', { key: 'HKLM\\SOFTWARE\\mdf-v1' }],
            ['regedit', 'set', { key: 'HKLM\\SOFTWARE\\mdf-v1', name: 'mdp-b', type: 'REG_SZ', data: T }],
            ['asbuilt', 'save', { field: 'B1', value: T }],
            ['apps', 'install-msi', { path: 'C:\\LabFiles\\LedgerSync_2.4_x86.msi', server: 'mdp-a', port: '1' }]
        ];
        let ok = 0;
        for (const [w, a, p] of acts) {
            try { const r = await EXAM.runAction(f.st, { sessionId: f.sid, window: w, action: a, params: p }, f.o); if (r.result.ok) { ok++; } else { console.log('  lockout action not applied: ' + w + '/' + a + ': ' + r.result.msg); } }
            catch (e) { t.check(false, 'lockout: ' + w + '/' + a + ' threw ' + e.code + ' ' + e.message); }
        }
        t.check(ok >= acts.length - 3, 'lockout: the token-laden inputs were accepted (' + ok + '/' + acts.length + ')');
        for (const line of ['Set-Content F:\\mdf-v1.txt "mdp-a hexworth/mdfinal"', 'mdf-v1', 'Write-Output "mdp-b"', 'New-LocalUser -Name mdf-v4 -NoPassword', 'Get-LocalUser mdf-v3']) {
            try { await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line }, f.o); }
            catch (e) { t.check(false, 'lockout: command ' + line + ' threw ' + e.code); }
        }
        await EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'B1', value: 'mdf-v1' }, f.o);
        const views = await sweep(f, 'lockout');
        const extra = [];
        for (const p of [{ path: 'D:\\mdf-v4' }, { path: 'F:\\' }]) { extra.push((await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'explorer', params: p }, f.o)).view); }
        extra.push((await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'regedit', params: { key: 'HKLM\\SOFTWARE\\mdf-v1' } }, f.o)).view);
        const js = JSON.stringify(views.concat(extra));
        ['MDF-V1', 'mdf-v3', 'mdp-a', 'mdp-b', 'mdf-v4', 'mdf-v1.txt', 'hexworth/mdfinal'].forEach((tok) => t.check(js.indexOf(tok) >= 0, 'lockout: (could fail) "' + tok + '" reached a rendered window'));
        const hits = views.concat(extra).map((x) => CLIENT.findDisclosures(x, 'l')).filter((x) => x.length);
        t.check(hits.length === 0, 'lockout: the runtime scanner passes every window with the tokens in it');
        const strictCount = views.concat(extra).filter((x) => strict(x).length).length;
        t.check(strictCount > 0, 'lockout: (could fail) with $s unwrapped the same windows DO match, so the exemption is what lets them through');
        /* and the handover still works with everything above in the lab */
        const h = await EXAM.handover(f.st, { sessionId: f.sid, confirm: true }, f.o);
        t.check(h.handedOver === true, 'lockout: handover works');
        await sweep(f, 'lockout after handover');
        t.check(typeof HO.handover === 'function', '(module loaded)');
    }

    /* ═══ views are read only, and services.msc lists no kernel driver (mutation survivors) ════════ */
    {
        let mutated = 0;
        for (let p = 0; p < 3; p++) {
            const { state, key } = W.sitting('ro-' + p, [p, 0]);
            const phases = [() => null, () => W.p1Gui(state, key), () => { W.p23Gui(state, key); W.p45Gui(state, key); W.p6Gui(state, key); }, () => HO.handover(state, key)];
            for (const go of phases) {
                go();
                for (const w of VIEWS.WINDOW_NAMES) {
                    if (!GUI.screenAllows(state, w)) { continue; }
                    for (const prm of viewParams(w, state.wo)) {
                        const before = JSON.stringify(state);
                        VIEWS.render(state, w, prm);
                        if (JSON.stringify(state) !== before) { mutated++; if (mutated < 4) { console.log('  render mutated state: ' + w); } }
                    }
                }
            }
        }
        t.check(mutated === 0, 'no render changes the state it is given, at any phase (' + mutated + ')');
        const r = W.perfect('drv-1', [0, 0], { skipRepair: true, skipP8: true });
        GUI.act(r.state, 'winre', 'startup-settings', { option: 4 }, { key: r.key });
        t.check(r.state.screen === 'desktop' && r.state.sys.safeMode === true, '(fixture) V1 in Safe Mode on the desktop');
        t.check(!!r.state.sys.services.mbafilt, '(could fail) the boot-start filter driver has a service entry');
        const sv = VIEWS.render(r.state, 'services', {}).view.services.map((x) => x.name);
        t.check(sv.indexOf('mbafilt') < 0 && sv.indexOf('Dnscache') >= 0, 'services.msc lists services, not the boot-start driver');
    }

    /* ═══ the brief's task list says what, never which startup apps; it scans clean ════════════ */
    {
        let named = 0, dirty = 0, count = 0;
        for (let p = 0; p < 3; p++) {
            for (let v = 0; v < 4; v++) {
                const { state } = W.sitting('brief-' + p + v, [p, v]);
                const init = CLIENT.toInitialState(state);
                count += init.tasks.length;
                const js = JSON.stringify(init.tasks) + JSON.stringify(init.rules);
                state.wo.performance.startupCandidates.forEach((n) => { if (js.indexOf(n) >= 0) { named++; } });
                if (CLIENT.findDisclosures(init, 'init').length || strict(init).length) { dirty++; }
                t.check((state.wo.network.kms ? 1 : 0) === (/KMS host/.test(js) ? 1 : 0), 'brief ' + p + v + ': a KMS host is printed exactly when the WO has one');
                const plain = init.tasks.map((x) => x.text).join('\n');
                t.check(plain.indexOf(state.wo.hostname) >= 0 && plain.indexOf(state.wo.share.path) >= 0 && plain.indexOf(String(state.wo.performance.pagefileMB)) >= 0, 'brief ' + p + v + ': (could fail) the tasks carry the WO values');
            }
        }
        t.check(named === 0, 'no task or rule names a startup candidate (' + named + ')');
        t.check(dirty === 0 && count === 12 * 30, 'the initial state with its brief scans clean on 12 classes (' + count + ' tasks)');
    }

    /* ═══ the brief covers every graded part and every penalty (Nancy D6: no test tied the brief to
     * CHECKS). Each entry lists the strings an honest student needs to read in the task text to earn
     * that part; a CHECKS part or penalty with no entry fails, so a new row needs a brief line. ═══ */
    {
        const CH = kit.req('mdfinal-checks.js');
        const tz = (id) => kit.req('mdfinal-os.js').TIME_ZONES.find((z) => z.id === id).display;
        const COVER = {
            '1.1:gen2': () => ['Windows 11 hardware requirements natively'], '1.1:vtpm': () => ['no Setup bypasses'],
            '1.1:cpu-ram': (w) => [w.vm.startupMemoryMB + ' MB of startup memory (static', w.vm.vcpu + ' virtual processors'], '1.1:vhdx': (w) => [w.vm.vhdxGB + ' GB OS virtual hard disk'],
            '1.2:build': (w) => ['Windows 11 ' + w.build.version + ' (build ' + w.build.build + ')'], '1.2:edition': () => ['edition the requirements call for'],
            '1.3:target-explicit': () => ['Install Windows on the new OS disk', 'Create the Windows partition yourself'], '1.3:c-size': (w) => ['C: at ' + w.disks.cGB + ' GB'],
            '1.4:account': (w) => ['local technician administrator ' + w.technician], '1.4:privacy': () => ['all six privacy settings', 'required diagnostic data only'],
            '1.4:key': () => ['Activate Windows as the licensing requirement says'], '1.4:licensed': () => ['Activate Windows'],
            '2.1:hostname': (w) => ['Name the PC ' + w.hostname], '2.1:timezone': (w) => [tz(w.timeZone)], '2.1:cu': (w) => [w.updates.cumulativeKb + ' cumulative update and complete its restart'],
            '2.2:plan': (w) => ['"' + w.power.planName + '" and make it the active plan'], '2.2:ac-display': (w) => ['Plugged in: turn off the display after ' + w.power.acDisplayMin],
            '2.2:ac-sleep': (w) => ['sleep after ' + w.power.acSleepMin + ' minutes'], '2.3:dc-display': (w) => ['On battery: turn off the display after ' + w.power.dcDisplayMin],
            '2.3:dc-sleep': (w) => ['sleep after ' + w.power.dcSleepMin + ' minutes'],
            '3.1:user': (w) => [w.user.name + ' (' + w.user.fullName + ')'], '3.1:standard': (w) => [w.user.name + ' is not an administrator'],
            '3.1:password-flags': () => ['passwords never expire', 'not made to change them at next sign-in'], '3.1:group': (w) => ['local group ' + w.group],
            '3.1:members': (w) => ['exactly two members: ' + w.user.name + ' and ' + w.secondMember.name], '3.2:always-notify': () => ['always notify'],
            '3.3:membership': (w) => [w.join.type === 'domain' ? 'Join the ' + w.join.domain + ' domain' : 'in the workgroup ' + w.join.workgroup],
            '4.1:ip': (w) => ['Static IPv4 ' + w.network.ip], '4.1:prefix': (w) => ['/' + w.network.prefix + ' (mask ' + w.network.mask + ')'], '4.1:gateway': (w) => ['gateway ' + w.network.gateway],
            '4.1:dns1': (w) => ['DNS ' + w.network.dns[0] + ' then'], '4.1:dns2': (w) => ['then ' + w.network.dns[1]],
            '4.2:rule': (w) => ['TCP ' + w.lob.port + '. Allow it inbound'], '4.2:profiles': (w) => [w.join.type === 'domain' ? 'Domain and Private profiles' : 'Private profile', 'never Public'],
            '4.2:remote': (w) => ['from ' + w.network.lobRemoteSubnet + ' only'], '4.2:category': () => ['not on a public network'],
            '4.3:enabled': () => ['Allow Remote Desktop connections'], '4.3:rdu': (w) => [w.user.name + ' may sign in remotely'],
            '4.4:share': (w) => ['Share ' + w.share.path + ' as ' + w.share.name], '4.4:no-everyone': () => ['Everyone has no share permission'],
            '4.4:group-share': (w) => [w.group + ' may change files at share level'], '4.4:effective': () => ['Modify access over the network'],
            '5.1:d-space': () => ['Create D: in all of the free space on the OS disk'], '5.1:d-format': (w) => ['NTFS, label ' + w.disks.dLabel],
            '5.1:pool': () => ['both blank pool disks into one storage pool'], '5.1:resiliency': (w) => [w.disks.resiliencyProse],
            '5.1:spaces-volume': (w) => ['letter ' + w.disks.spacesLetter + ':, NTFS, label ' + w.disks.spacesLabel],
            '5.2:method': () => ['XTS-AES 256'], '5.2:protection': () => ['Encrypt C: with BitLocker'], '5.2:tpm': () => ['unlocked by the TPM'], '5.2:rp': () => ['with a recovery password'],
            '5.2:usb-backup': () => ['Save the BitLocker recovery key to TECH-USB'],
            '5.3:inheritance': (w) => ['On ' + w.confidentialPath + ': it no longer inherits permissions'], '5.3:no-users': () => ['Users and Authenticated Users have no access'],
            '5.3:group-rx': (w) => [w.group + ' can read and run files'],
            '5.4:signatures': () => ['Update the Defender signatures'], '5.4:exclusion': (w) => ['Exclude ' + w.defenderExclusion + ' and nothing else'],
            '6.1:msi-x64': () => ['LedgerSync_2.4_x64.msi', 'the 64-bit package'], '6.1:server': (w) => ['server ' + w.lob.fqdn], '6.1:port': (w) => ['on port ' + w.lob.port],
            '6.1:appx-user': (w) => ['Remove ' + w.consumerApp + ' for the user'], '6.1:appx-provisioned': () => ['from the image, so new users do not get it'],
            '6.2:feature': (w) => ['Defer feature updates ' + w.updates.featureDeferralDays + ' days'], '6.2:quality': (w) => ['quality updates ' + w.updates.qualityDeferralDays + ' days by policy'],
            '6.2:active-hours': () => ['Active hours '], '6.3:startup-1': () => ['Disable the startup apps with a High startup impact'], '6.3:startup-2': () => ['Disable the startup apps with a High startup impact'],
            '6.3:pagefile': (w) => ['fixed page file on C: of ' + w.performance.pagefileMB + ' MB', 'not system managed'],
            '7.1:resolved': () => ['find the cause, fix it'], '7.1:no-regression': () => ['without breaking the build'],
            '8.1:b1': () => ['recovery-password protector ID (its first 8 characters)'], '8.1:b2': () => ["C:'s encryption method"],
            '8.2:i1': () => ['root-cause category'], '8.2:i2': () => ['the evidence identifier you found'], '8.2:i3': () => ['how you verified the fix'],
            'P1-archive': () => ['Do not modify, format or delete it'], 'P1-secureboot': () => ['Keep Secure Boot on'],
            'P3-administrator': () => ['built-in Administrator and Guest stay disabled'], 'P3-guest': () => ['built-in Administrator and Guest stay disabled'],
            'P3-extra-admin': (w) => ['The only local administrators are ' + w.technician], 'P4-firewall-off': () => ['All firewall profiles stay on'],
            'P4-nla-off': () => ['Network Level Authentication'], 'P4-smb1': () => ['SMB 1.0 stays off'], 'P4-everyone-full': () => ['Everyone has no share permission'],
            'P5-realtime-off': () => ['Real-time protection stays on'], 'P6-keep-list': () => ['Calculator, Microsoft Store and Notepad stay', 'SecurityHealth stays enabled']
        };
        const ids = CH.CHECKS.reduce((a, c) => a.concat(c.parts.map((x) => c.id + ':' + x.id)), []).concat(CH.PENALTIES.map((x) => x.id));
        const unmapped = ids.filter((id) => !COVER[id]);
        t.check(unmapped.length === 0, 'every graded part and penalty has a brief entry: missing ' + unmapped.join(','));
        const missing = [];
        for (let p = 0; p < 3; p++) {
            for (let v = 0; v < 4; v++) {
                const { state } = W.sitting('cover-' + p + v, [p, v]);
                const init = CLIENT.toInitialState(state);
                const text = init.tasks.map((x) => x.text).join('\n') + '\n' + init.rules.join('\n');
                ids.forEach((id) => (COVER[id] ? COVER[id](init.wo) : []).forEach((s) => { if (text.indexOf(s) < 0) { missing.push(p + '' + v + ' ' + id + ': ' + s); } }));
                const ed = kit.req('mdfinal-core.js').buildAnswerKey('cover-' + p + v, EX, { secret: kit.TEST_SECRET });
                t.check(init.keyTable.length === Object.keys(kit.req('mdfinal-pc.js').GVLK).length, 'brief ' + p + v + ': the key table lists every edition, revealing none');
                t.check(/penalty you already incurred .* still counts/.test(init.rules.join(' ')), 'brief ' + p + v + ': the rules say penalties survive a restart');
            }
        }
        t.check(missing.length === 0, 'the brief states every graded requirement on 12 classes: ' + missing.slice(0, 4).join(' | '));
    }

    /* ═══ the scanner itself: $s nodes are exactly { $s: string }, keys are still checked ═══════ */
    {
        t.check(CLIENT.findDisclosures({ a: { $s: 'mdf-v1' } }).length === 0, 'scanner: a $s value is exempt from patterns');
        t.check(CLIENT.findDisclosures({ a: 'mdf-v1' }).length === 1, 'scanner: the same value outside $s is caught');
        t.check(CLIENT.findDisclosures({ a: { $s: 'x', fault: 1 } }).length === 1, 'scanner: a $s node with another key is malformed');
        t.check(CLIENT.findDisclosures({ a: { $s: { fault: 1 } } }).length === 1, 'scanner: a $s node holding an object is malformed');
        t.check(CLIENT.findDisclosures({ a: { $s: 'x'.repeat(VIEWS.S_MAX + 1) } }).length === 1, 'scanner: an over-long $s is malformed');
        t.check(CLIENT.findDisclosures([{ deep: [{ snapshot: {} }] }]).length === 1, 'scanner: a forbidden key at depth is caught');
        t.check(CLIENT.findDisclosures({ msg: 'x "keep": true' }).length === 1, 'scanner: a serialised marker in a string is caught');
    }

    /* ═══ the generator never puts an internal id in state (why msg echoes are pattern-exempt) ═════ */
    {
        let found = 0;
        for (let p = 0; p < 3; p++) {
            for (let v = 0; v < 4; v++) {
                const r = W.perfect('leak-ids-' + p + v, [p, v], { skipRepair: true });
                const js = JSON.stringify(r.state) + JSON.stringify(r.snapshot);
                CLIENT.PATTERNS.forEach((pt) => { if (pt.why !== 'serialised marker' && pt.re.test(js)) { found++; } });
            }
        }
        t.check(found === 0, 'no fault id, profile id or HMAC domain exists anywhere in state (' + found + ')');
        t.check(CORE.PROFILES.every((pr) => /^mdp-[abc]$/.test(pr.id)), '(could fail) the profile ids are mdp-a..c, so the search above can match them');
    }

    t.done();
})().catch((e) => { console.log('FATAL ' + (e && e.stack)); process.exitCode = 2; });
