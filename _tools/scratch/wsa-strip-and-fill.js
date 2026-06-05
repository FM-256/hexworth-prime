/**
 * WSA m10 visual-mismatch fix per Path B-revised (Nancy-approved with corrections).
 *
 * Usage: node _tools/scratch/wsa-strip-and-fill.js [--dry-run]
 *
 * Steps:
 *   1. Add `.text-visual-grid.single-col { grid-template-columns: 1fr; }` to <style>
 *   2. Strip 13 mismatched <div class="tv-visual">...</div> blocks identified by
 *      their SVG's first <text> signature (each signature = one mismatched topic)
 *   3. Tag each affected parent grid with `single-col`
 *   4. Author content fill for the 3 sparse slides (S05, S08, S14)
 *
 * Sparse-slide content has been Nancy-reviewed:
 *   - S05: "two separate concerns" framing (not "two SEPARATE objects")
 *   - S08: MS16-072 "user logon DACL evaluation" (not "downloads") + explicit PowerShell example
 *   - S14: three-layer Reach/Winning/Application diagnostic flow
 */
const fs = require('fs');
const path = require('path');

const FILE = '_app/houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html';
const DRY = process.argv.includes('--dry-run');

let html = fs.readFileSync(FILE, 'utf8');
const originalLen = html.length;
const changes = [];

// ─── 1. Add CSS rule inside <style> ──────────────────────────────────────
const cssAnchor = '.text-visual-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr);';
const cssAdd = `.text-visual-grid.single-col { grid-template-columns: 1fr; }\n        ${cssAnchor}`;
if (html.includes(cssAnchor) && !html.includes('.text-visual-grid.single-col')) {
    html = html.replace(cssAnchor, cssAdd);
    changes.push('1. Added .text-visual-grid.single-col CSS rule');
}

// ─── 2. Strip mismatched tv-visual blocks by SVG <text> signature ───────
// Each entry: unique-enough first <text> from the SVG, mapped to expected occurrence count.
const STRIP_SIGNATURES = [
    { sig: 'Loopback: user GPO follows the PC',           expected: 3 },  // S05+S06+S07
    { sig: 'GPMC workflow: create, edit, link',           expected: 3 },  // S08+S09+S10
    { sig: 'Security Filtering: limit GPO to specific',   expected: 1 },  // S11
    { sig: 'WMI Filters: GPO applies only if WMI',        expected: 1 },  // S12
    { sig: 'Preferences: tattooed settings, user can',    expected: 3 },  // S14+S15+S16
    { sig: 'Troubleshoot: gpresult, rsop, gpupdate',      expected: 2 },  // S17+S18
];
const totalExpected = STRIP_SIGNATURES.reduce((a, x) => a + x.expected, 0);

// Combined strip + tag per signature. Find the WHOLE text-visual-grid wrapper that
// contains a tv-visual matching this signature, then in the replacement:
//  - drop the tv-visual block
//  - add `single-col` to the wrapper class
// This guarantees we only tag grids whose tv-visual we actually stripped.
let stripped = 0, tagged = 0;
for (const { sig, expected } of STRIP_SIGNATURES) {
    const escSig = sig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Pattern: <div class="text-visual-grid">[text...<tv-text>...</tv-text>...]<tv-visual containing SIG>...</tv-visual>[whitespace]</div>
    // We capture (1) everything between grid-open and tv-visual-open, then drop tv-visual block.
    const re = new RegExp(
        `<div class="text-visual-grid">((?:(?!<div class="text-visual-grid">).)*?)<div class="tv-visual">\\s*<svg[^>]*>(?:(?!</svg>).)*?<text[^>]*>${escSig}[^<]*</text>(?:(?!</svg>).)*?</svg>\\s*</div>\\s*</div>`,
        'gs'
    );
    const matches = [...html.matchAll(re)];
    if (matches.length !== expected) {
        console.error(`MISMATCH for signature "${sig}": expected ${expected}, found ${matches.length}`);
        process.exit(1);
    }
    html = html.replace(re, '<div class="text-visual-grid single-col">$1</div>');
    stripped += matches.length;
    tagged += matches.length;
    changes.push(`2+3. Stripped ${matches.length}× "${sig.slice(0, 40)}…" + tagged single-col`);
}
if (stripped !== totalExpected) {
    console.error(`Total stripped ${stripped} ≠ expected ${totalExpected}`);
    process.exit(1);
}
changes.push(`   Total: ${stripped} stripped, ${tagged} single-col tags`);

// ─── 4. Content fill for 3 sparse slides ─────────────────────────────────
// All authored content matches Nancy's technical corrections.

// Content fill: replace just the unique sparse-sentence <p>, leaving wrapper untouched.
// Anchors are short unique strings, not full block matches — avoids whitespace fragility.

// S05
const s05_old = '<p>GPOs must be created in AD and then linked to sites, domains, or OUs to take effect.</p>';
const s05_new = `<p>A GPO and its link are separate concerns: the GPO lives in its own GPC (under <code>CN=Policies</code> in AD) + GPT (in SYSVOL); linking it means writing the <code>gpLink</code> attribute onto an OU, domain, or site container.</p>

                    <ul>
                        <li><strong>Create:</strong> <code>New-GPO</code> defines the policy object in the domain</li>
                        <li><strong>Link:</strong> <code>New-GPLink</code> attaches that GPO to a scope (site, domain, or OU)</li>
                        <li>An unlinked GPO exists but applies to nothing</li>
                        <li>A GPO can be linked to many scopes; deleting the link doesn&#39;t delete the GPO</li>
                    </ul>

                    <div class="code-block">
<span class="comment"># Create the GPO (defines what)</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">New-GPO -Name "SEC-Workstation-Baseline" -Comment "Security baseline for workstations"</span>

<span class="comment"># Link it to where it applies (writes gpLink on the target OU)</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">New-GPLink -Name "SEC-Workstation-Baseline" -Target "OU=Workstations,DC=hexworth,DC=local"</span>
                    </div>

                    <div class="info-box">
                        <strong>Tip:</strong> Test by creating a Test OU, linking the new GPO there, moving a test machine into the OU, and running <code>gpupdate /force</code> on that machine before linking to production scopes.
                    </div>`;
if (!html.includes(s05_old)) { console.error('S05 anchor missing'); process.exit(1); }
html = html.replace(s05_old, s05_new);
changes.push('4a. Content-filled S05 (Creating and Linking GPOs)');

// S08
const s08_old = '<p>Security filtering restricts which users or computers a GPO applies to within its linked scope.</p>';
const s08_new = `<p>Security filtering restricts WHICH users or computers a linked GPO actually applies to, beyond the scope of the link itself.</p>

                    <ul>
                        <li>By default, every linked GPO applies to <strong>&#34;Authenticated Users&#34;</strong> (everyone in the domain)</li>
                        <li>To target a specific group: remove Authenticated Users from Security Filtering, add your target group</li>
                        <li>The target group needs BOTH <strong>Read</strong> AND <strong>Apply Group Policy</strong> permissions</li>
                    </ul>

                    <p><strong>Common use case:</strong> a &#34;Marketing Workstation Restrictions&#34; GPO is linked to the entire Workstations OU but should only apply to Marketing-team machines. Solution: replace Authenticated Users with the <code>Marketing-Computers</code> AD group in Security Filtering.</p>

                    <div class="info-box">
                        <strong>Server 2012 R2+ (MS16-072):</strong> If you remove Authenticated Users from Security Filtering, the computer account (or <code>Domain Computers</code>) still needs <strong>Read</strong> permission — NOT GpoApply — so the machine can evaluate the GPO&#39;s DACL during user logon. Without it, user-side policy silently fails. The GUI adds this automatically; in PowerShell:
                        <div class="code-block">
<span class="prompt">PS C:\\&gt;</span> <span class="command">Set-GPPermission -Name "Marketing-Restrictions" -TargetName "Domain Computers" -TargetType Group -PermissionLevel GpoRead</span>
                        </div>
                    </div>`;
if (!html.includes(s08_old)) { console.error('S08 anchor missing'); process.exit(1); }
html = html.replace(s08_old, s08_new);
changes.push('4b. Content-filled S08 (Security Filtering)');

// S14
const s14_old = '<p>When policies don&#39;t apply as expected, use these diagnostic approaches.</p>';
const s14_alt = "<p>When policies don't apply as expected, use these diagnostic approaches.</p>";
const s14_new = `<p>When policies don&#39;t apply as expected, walk the diagnostic flow: confirm the GPO is reaching the machine, confirm the right policies are winning, then confirm the settings are being applied.</p>

                    <p><strong>Three layers to check, in order:</strong></p>
                    <ol>
                        <li><strong>Reach</strong> — Is the GPO downloading to the machine? <code>gpupdate /force</code> forces a refresh; <code>gpresult /r</code> shows what GPOs the machine actually sees.</li>
                        <li><strong>Winning policy</strong> — When multiple GPOs target the same setting, which one is winning? <code>gpresult /h report.html</code> shows the resolved settings AND which GPO contributed each.</li>
                        <li><strong>Application</strong> — If the right GPO is winning but the setting still doesn&#39;t take effect, check Event Viewer: <em>Applications and Services Logs → Microsoft → Windows → GroupPolicy → Operational</em>.</li>
                    </ol>

                    <div class="info-box">
                        <strong>Use the flow, not the checklist:</strong> the next two slides cover specific commands. The diagnostic flow above tells you WHICH command to reach for, not which command to memorize.
                    </div>`;
if (html.includes(s14_old)) {
    html = html.replace(s14_old, s14_new);
} else if (html.includes(s14_alt)) {
    html = html.replace(s14_alt, s14_new);
} else {
    console.error('S14 anchor missing (tried both entity + raw quote forms)');
    process.exit(1);
}
changes.push('4c. Content-filled S14 (Troubleshooting Group Policy)');

// ─── Summary + write ─────────────────────────────────────────────────────
console.log('Changes:');
changes.forEach(c => console.log('  ' + c));
console.log(`Length: ${originalLen} → ${html.length} (Δ ${html.length - originalLen >= 0 ? '+' : ''}${html.length - originalLen})`);

if (DRY) {
    console.log('\n(dry run — no write)');
    process.exit(0);
}

fs.writeFileSync(FILE, html);
console.log('\n✓ Wrote ' + FILE);
