#!/usr/bin/env node
/*
 * build-aplus-core1-final.js -- A+ Core 1 (220-1101) FINAL EXAM builder for Blackboard Ultra.
 *
 * Sources (all platform-vetted, nothing invented from thin air):
 *   D1-D3: the 123-question midterm bank (forge-aplus-core1-midterm-domains-1-3.html EXAM_DATA;
 *          each question carries correct index + explanation + source chapter).
 *   D4:    8 MC conversions of ch08-cloud's reveal Q&As (stems + correct answers verbatim from
 *          the chapter; distractors authored, same-category, no throwaways).
 *   D5:    22 fresh MC authored 1:1 against ch11/ch12 teaching facts (each question's
 *          explanation cites the fact it is grounded in).
 *
 * Outputs (into --out DIR):
 *   aplus-core1-final-POOL-75.txt        Blackboard tab-delimited question upload (75-Q pool)
 *   aplus-core1-final-FIXED-50.txt       Blackboard tab-delimited (curated fixed 50)
 *   aplus-core1-final-POOL-75-qti.zip    QTI 2.1 package (Ultra import)
 *   aplus-core1-final-FIXED-50-qti.zip   QTI 2.1 package (Ultra import)
 *   ANSWER-KEY.md                        instructor key: answer + explanation + source per Q
 *
 * Blueprint (220-1101 weights): pool 75 = D1 11 / D2 15 / D3 19 / D4 8 / D5 22;
 * fixed 50 = D1 7 / D2 10 / D3 13 / D4 5 / D5 15.
 * Selection from the bank is DETERMINISTIC (even spread across source chapters, stable order),
 * so re-running the script reproduces the identical exam.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
    : path.join(__dirname, 'out');

// ── Load the vetted midterm bank ─────────────────────────────────────────────
const examSrc = fs.readFileSync(path.join(ROOT,
    '_app/houses/forge/applets/comptia-aplus/core-1/exams/forge-aplus-core1-midterm-domains-1-3.html'), 'utf8');
const start = examSrc.indexOf('var EXAM_DATA = {');
const tail = examSrc.slice(start + 16);
let depth = 0, end = 0;
for (let i = 0; i < tail.length; i++) {
    if (tail[i] === '{') depth++;
    else if (tail[i] === '}') { depth--; if (!depth) { end = i + 1; break; } }
}
const BANK = JSON.parse(tail.slice(0, end));

// Deterministic even-spread selection: round-robin across source chapters in stable order.
function selectSpread(questions, n) {
    const byCh = {};
    questions.forEach((q) => { (byCh[q.source] = byCh[q.source] || []).push(q); });
    const chapters = Object.keys(byCh).sort();
    const picked = [];
    let i = 0;
    while (picked.length < n) {
        const ch = chapters[i % chapters.length];
        if (byCh[ch].length) picked.push(byCh[ch].shift());
        i++;
        if (i > 10000) break;
    }
    return picked;
}

const domains = Object.fromEntries(BANK.domains.map((d) => [d.id, d.questions]));

// ── D4: ch08 cloud/virtualization conversions (stems + answers from the chapter) ──
const D4 = [
    { question: "A company uses AWS to run virtual servers and manages their own operating systems and applications. Which cloud service model is this?", options: ["PaaS", "IaaS", "SaaS", "DaaS"], correct: 1, explanation: "IaaS: the provider supplies virtual infrastructure; the customer manages OS and applications (ch08 reveal Q1).", source: "ch08" },
    { question: "A technician's hypervisor runs directly on server hardware with no underlying operating system. Which hypervisor type is this?", options: ["Type 2 (hosted)", "Container runtime", "Type 1 (bare metal)", "Application virtualization"], correct: 2, explanation: "Type 1 (bare metal) runs directly on hardware with no host OS layer (ch08 reveal Q2).", source: "ch08" },
    { question: "A developer uses VirtualBox on a Windows laptop to run a Linux VM for testing. Which hypervisor type is in use?", options: ["Type 1 (bare metal)", "Type 2 (hosted)", "Firmware hypervisor", "Terminal services"], correct: 1, explanation: "Type 2: VirtualBox runs on top of the Windows host OS (ch08 reveal Q2, set 2).", source: "ch08" },
    { question: "An organization needs resources that scale up instantly during a product launch and scale back down afterward. Which cloud characteristic describes this?", options: ["Resource pooling", "Measured service", "On-demand self-service", "Rapid elasticity"], correct: 3, explanation: "Rapid elasticity: resources scale dynamically on demand (ch08 reveal set 2 Q1).", source: "ch08" },
    { question: "A customer pays for Google Workspace per user per month, and the provider manages everything below the application. Which service model is this?", options: ["SaaS", "IaaS", "PaaS", "On-premises licensing"], correct: 0, explanation: "SaaS: subscription-based, provider manages the whole stack, the user just uses the application (ch08 reveal set 2 Q5).", source: "ch08" },
    { question: "Which DNS record type points webmail.example.com at the real mail server's hostname as an alias?", options: ["A", "MX", "CNAME", "TXT"], correct: 2, explanation: "CNAME creates an alias from webmail to the canonical hostname (ch08 reveal set 2 Q4).", source: "ch08" },
    { question: "A load balancer distributes requests across three web servers and one server fails. What happens to incoming traffic?", options: ["It is automatically rerouted to the two healthy servers", "All traffic is dropped until the server is repaired", "Traffic queues on the failed server", "The load balancer keeps sending one third of requests to the failed server"], correct: 0, explanation: "The load balancer detects the failure and reroutes traffic to the remaining healthy servers automatically (ch08 reveal set 2 Q3).", source: "ch08" },
    { question: "Which network appliance combines firewall, IDS/IPS, antivirus, and VPN functions in a single device?", options: ["Proxy server", "Load balancer", "Spam gateway", "UTM (Unified Threat Management)"], correct: 3, explanation: "UTM unifies multiple security features onto a single platform (ch08 reveal set 2 Q6).", source: "ch08" },
];

// ── D5: authored 1:1 against ch11/ch12 teaching facts ────────────────────────
const D5 = [
    { question: "In the six-step troubleshooting methodology, which step comes immediately after establishing a theory of probable cause?", options: ["Document findings", "Test the theory to determine the cause", "Establish a plan of action", "Verify full system functionality"], correct: 1, explanation: "The fixed order is Identify -> Establish theory -> Test theory -> Plan -> Verify -> Document (ch11).", source: "ch11" },
    { question: "A user reports their PC crashes randomly. According to the troubleshooting methodology, what is part of Step 1, before any change is made?", options: ["Reinstalling the operating system", "Swapping the RAM", "Creating a backup", "Updating all drivers"], correct: 2, explanation: "Backup before any change: creating a backup is part of Step 1 and is never optional (ch11).", source: "ch11" },
    { question: "Why does the troubleshooting methodology require changing only one variable at a time?", options: ["It is faster than making several changes", "Multiple simultaneous changes prevent root-cause identification", "Vendors require it for warranty claims", "It reduces the number of reboots needed"], correct: 1, explanation: "Multiple simultaneous changes prevent root cause identification and make future troubleshooting harder (ch11).", source: "ch11" },
    { question: "A technician has verified full system functionality after a repair. According to the methodology, what makes the process complete?", options: ["Closing the ticket immediately", "Billing the customer", "Documenting findings, actions, and outcomes", "Scheduling a follow-up visit"], correct: 2, explanation: "Documentation is never optional; an undocumented fix is an incomplete fix (ch11).", source: "ch11" },
    { question: "A technically simple fix is identified on a corporate workstation. What must the technician check before implementing it?", options: ["Whether corporate policy requires approval first", "Whether the fix can be automated", "Whether the user has admin rights", "Whether a newer model is available"], correct: 0, explanation: "Corporate policy compliance is part of the methodology: check whether approval is required before implementing any fix (ch11).", source: "ch11" },
    { question: "A desktop emits a burning smell and visible smoke. What is the required FIRST action?", options: ["Run hardware diagnostics", "Power off immediately", "Check Event Viewer", "Reseat the expansion cards"], correct: 1, explanation: "Burning smell, smoke, sparks, grinding HDD, and swollen batteries all require immediate power-off before any diagnostics (ch11).", source: "ch11" },
    { question: "At POST, a machine produces continuous beeping. Which component does this classically indicate?", options: ["Video card", "CPU", "RAM", "Power supply"], correct: 2, explanation: "Continuous beeping = RAM; 1 long + 2-3 short = video; no beep + no display = CPU or motherboard (ch11).", source: "ch11" },
    { question: "At POST, a machine produces one long beep followed by two short beeps. Which subsystem should the technician suspect?", options: ["Video", "Memory", "Keyboard controller", "Storage"], correct: 0, explanation: "1 long + 2-3 short beeps = video, per the standard beep-code mapping taught in ch11.", source: "ch11" },
    { question: "A PC completes POST with one short beep. What does this indicate?", options: ["Imminent drive failure", "A normal, successful POST", "A failing CMOS battery", "An overheating CPU"], correct: 1, explanation: "One short beep at POST = success (ch11).", source: "ch11" },
    { question: "A system BSODs and freezes randomly, and all software explanations have been exhausted. Which tool does the chapter recommend next?", options: ["chkdsk", "Disk Defragmenter", "MemTest86", "System Restore"], correct: 2, explanation: "RAM failures mimic software problems; when software is ruled out, test RAM with MemTest86 (ch11).", source: "ch11" },
    { question: "A laptop battery is visibly swollen. What is the correct handling?", options: ["Discharge it fully before continuing to use it", "Stop use immediately, do not charge, dispose at an electronics recycler", "Charge it only with the OEM charger", "Freeze it to reduce the swelling"], correct: 1, explanation: "Swollen batteries are a fire hazard: stop use, never charge, recycle properly. No exceptions (ch12).", source: "ch12" },
    { question: "An HDD begins making rhythmic clicking and grinding noises. What should the technician do FIRST?", options: ["Run a surface defragmentation", "Back up the data immediately", "Update the storage driver", "Lower the drive's spin speed in firmware"], correct: 1, explanation: "Grinding or clicking from an HDD means imminent failure: back up immediately (ch12).", source: "ch12" },
    { question: "A drive reports S.M.A.R.T. status 'caution' but still functions normally. What is the correct response?", options: ["Replace the drive now", "Ignore it until errors appear", "Reformat the drive", "Disable S.M.A.R.T. monitoring"], correct: 0, explanation: "S.M.A.R.T. caution status = replace the drive now, even if it still functions (ch12).", source: "ch12" },
    { question: "A laser printer produces pages with toner that smears when touched. Which component has failed?", options: ["Transfer corona", "Cleaning blade", "Fuser", "Pickup rollers"], correct: 2, explanation: "Laser symptoms map to imaging steps: smearing = fuser (ch12).", source: "ch12" },
    { question: "A laser printer outputs ghost images of the previous page on each new page. Which component is at fault?", options: ["Fuser", "Primary corona", "Cleaning blade", "Duplex assembly"], correct: 2, explanation: "Ghosting = cleaning blade (ch12).", source: "ch12" },
    { question: "A laser printer prints completely blank pages. Which failure does the chapter associate with this symptom?", options: ["Transfer corona or HVPS", "Fuser overtemperature", "Dirty pickup rollers", "Low-quality paper"], correct: 0, explanation: "Blank page = transfer corona or HVPS; all-black = primary corona (ch12).", source: "ch12" },
    { question: "An inkjet printer's output quality suddenly degrades. What does the chapter say to do FIRST?", options: ["Replace the print head assembly", "Replace the ink cartridge", "Reinstall the printer driver", "Run a firmware update"], correct: 1, explanation: "Inkjet: the cartridge is almost always the problem; replace it first (ch12).", source: "ch12" },
    { question: "Print jobs are stuck in the Windows queue and will not clear. What is the standard fix sequence?", options: ["Restart the PC twice", "Stop the Print Spooler, delete the files in the spool PRINTERS folder, restart the Print Spooler", "Reinstall the printer driver, then power-cycle the printer", "Clear the browser cache and re-add the printer"], correct: 1, explanation: "Stop Print Spooler, delete C:\\Windows\\System32\\spool\\PRINTERS contents, restart the spooler (ch12).", source: "ch12" },
    { question: "A workstation has the address 169.254.10.7. What does this indicate?", options: ["A static address on a private LAN", "A DHCP failure: APIPA self-assignment", "A valid DNS-assigned address", "A VPN tunnel endpoint"], correct: 1, explanation: "APIPA (169.254.x.x) is always a DHCP failure indicator, never a valid configuration (ch12).", source: "ch12" },
    { question: "Following the chapter's ping troubleshooting sequence, a technician has successfully pinged 127.0.0.1 and the machine's own IP. What is the NEXT target?", options: ["A remote public IP", "The DNS server by hostname", "The default gateway", "The DHCP server"], correct: 2, explanation: "Ping in sequence: 127.0.0.1 -> own IP -> gateway -> remote IP -> hostname; each step isolates a layer (ch12).", source: "ch12" },
    { question: "A technician must trace a specific cable run through a wall to find its far end. Which tool is designed for this?", options: ["Cable certifier", "Tone generator and probe", "Loopback plug", "Crimper"], correct: 1, explanation: "Tone generator and probe traces cables; a cable tester verifies continuity; a certifier validates against TIA/EIA performance standards (ch12).", source: "ch12" },
    { question: "Which tool validates that an installed cable run meets TIA/EIA performance standards, rather than just checking pin-to-pin continuity?", options: ["Cable certifier", "Tone probe", "Punchdown tool", "Multimeter"], correct: 0, explanation: "Cable certifier validates performance against TIA/EIA standards; the cable tester only verifies continuity (ch12).", source: "ch12" },
];

// ── Assemble pool 75 + fixed 50 ──────────────────────────────────────────────
const POOL_SPEC = { mobile: 11, networking: 15, hardware: 19 };
const FIXED_SPEC = { mobile: 7, networking: 10, hardware: 13, cloud: 5, troubleshooting: 15 };
const pool = [];
for (const [dom, n] of Object.entries(POOL_SPEC)) {
    selectSpread(domains[dom].slice(), n).forEach((q) => pool.push({ domain: dom, ...q }));
}
D4.forEach((q) => pool.push({ domain: 'cloud', ...q }));
D5.forEach((q) => pool.push({ domain: 'troubleshooting', ...q }));

const fixed = [];
for (const [dom, n] of Object.entries(FIXED_SPEC)) {
    fixed.push(...pool.filter((q) => q.domain === dom).slice(0, n));
}

// ── Sanity gates ─────────────────────────────────────────────────────────────
function assertClean(list, label) {
    const stems = new Set();
    const dist = [0, 0, 0, 0];
    for (const q of list) {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) throw new Error(label + ': malformed ' + q.question);
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) throw new Error(label + ': bad correct on ' + q.question);
        if (/\t|\n/.test(q.question + q.options.join(''))) throw new Error(label + ': tab/newline inside text: ' + q.question.slice(0, 60));
        const key = q.question.toLowerCase().replace(/\W+/g, ' ').trim();
        if (stems.has(key)) throw new Error(label + ': duplicate stem: ' + q.question.slice(0, 60));
        stems.add(key);
        dist[q.correct]++;
    }
    return dist;
}
const poolDist = assertClean(pool, 'pool');
const fixedDist = assertClean(fixed, 'fixed');
console.log('pool 75 by domain:', Object.entries(pool.reduce((a, q) => (a[q.domain] = (a[q.domain] || 0) + 1, a), {})));
console.log('pool correct-index distribution A/B/C/D:', poolDist);
console.log('fixed 50 correct-index distribution A/B/C/D:', fixedDist);

// ── Blackboard tab-delimited TXT ─────────────────────────────────────────────
function toTxt(list) {
    return list.map((q) => {
        const cells = ['MC', q.question];
        q.options.forEach((opt, i) => { cells.push(opt, i === q.correct ? 'Correct' : 'Incorrect'); });
        return cells.join('\t');
    }).join('\n') + '\n';
}

// ── QTI 2.1 package ──────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function itemXml(q, id) {
    const choices = q.options.map((opt, i) =>
        `      <simpleChoice identifier="C${i}">${esc(opt)}</simpleChoice>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
    identifier="${id}" title="${esc(q.question.slice(0, 60))}" adaptive="false" timeDependent="false">
  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
    <correctResponse><value>C${q.correct}</value></correctResponse>
  </responseDeclaration>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue><value>0</value></defaultValue>
  </outcomeDeclaration>
  <itemBody>
    <choiceInteraction responseIdentifier="RESPONSE" shuffle="true" maxChoices="1">
      <prompt>${esc(q.question)}</prompt>
${choices}
    </choiceInteraction>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
</assessmentItem>`;
}
function testXml(ids, title) {
    const refs = ids.map((id) => `        <assessmentItemRef identifier="R-${id}" href="items/${id}.xml"/>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" identifier="TEST" title="${esc(title)}">
  <testPart identifier="PART1" navigationMode="nonlinear" submissionMode="individual">
    <assessmentSection identifier="S1" title="${esc(title)}" visible="true">
${refs}
    </assessmentSection>
  </testPart>
</assessmentTest>`;
}
function manifestXml(ids, pkgId, title) {
    const itemRes = ids.map((id) =>
        `    <resource identifier="RES-${id}" type="imsqti_item_xmlv2p1" href="items/${id}.xml"><file href="items/${id}.xml"/></resource>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" identifier="${pkgId}">
  <metadata><schema>IMS Content</schema><schemaversion>1.1.3</schemaversion></metadata>
  <organizations/>
  <resources>
    <resource identifier="RES-TEST" type="imsqti_test_xmlv2p1" href="assessment.xml"><file href="assessment.xml"/></resource>
${itemRes}
  </resources>
</manifest>`;
}
function buildQti(list, dirName, title) {
    const dir = path.join(OUT, dirName);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, 'items'), { recursive: true });
    const ids = list.map((q, i) => {
        const id = 'Q' + String(i + 1).padStart(3, '0');
        fs.writeFileSync(path.join(dir, 'items', id + '.xml'), itemXml(q, id));
        return id;
    });
    fs.writeFileSync(path.join(dir, 'assessment.xml'), testXml(ids, title));
    fs.writeFileSync(path.join(dir, 'imsmanifest.xml'), manifestXml(ids, dirName, title));
    execSync(`cd ${JSON.stringify(dir)} && zip -qr ../${dirName}.zip imsmanifest.xml assessment.xml items`);
    return dirName + '.zip';
}

// ── Answer key doc ───────────────────────────────────────────────────────────
function keyDoc(list, title) {
    const L = 'ABCD';
    let md = `# ${title} -- Instructor Answer Key\n\nGenerated ${new Date().toISOString().slice(0, 10)} by _tools/blackboard-export/build-aplus-core1-final.js (deterministic; re-run reproduces byte-identical output).\n\n`;
    list.forEach((q, i) => {
        md += `**Q${i + 1} [${q.domain}/${q.source}]** ${q.question}\n`;
        q.options.forEach((opt, j) => { md += `  - ${j === q.correct ? '**' + L[j] + '. ' + opt + '  <-- CORRECT**' : L[j] + '. ' + opt}\n`; });
        md += `  - *Why:* ${q.explanation || '(bank question; explanation in source bank)'}\n\n`;
    });
    return md;
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'aplus-core1-final-POOL-75.txt'), toTxt(pool));
fs.writeFileSync(path.join(OUT, 'aplus-core1-final-FIXED-50.txt'), toTxt(fixed));
buildQti(pool, 'aplus-core1-final-POOL-75-qti', 'A+ Core 1 Final Exam Pool (75)');
buildQti(fixed, 'aplus-core1-final-FIXED-50-qti', 'A+ Core 1 Final Exam (50)');
fs.writeFileSync(path.join(OUT, 'ANSWER-KEY-POOL-75.md'), keyDoc(pool, 'A+ Core 1 Final Pool (75)'));
fs.writeFileSync(path.join(OUT, 'ANSWER-KEY-FIXED-50.md'), keyDoc(fixed, 'A+ Core 1 Final Exam (Fixed 50)'));
console.log('written to', OUT, ':', fs.readdirSync(OUT).join(', '));
