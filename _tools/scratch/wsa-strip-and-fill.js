/**
 * WSA visual-mismatch fix — per-module strip-and-fill (Path B-revised).
 *
 * Usage:
 *   node _tools/scratch/wsa-strip-and-fill.js <module-folder> [--dry-run]
 *
 * Example:
 *   node _tools/scratch/wsa-strip-and-fill.js m11-iis
 *
 * Config: see MODULE_CONFIGS below. Each entry lists:
 *   - stripSignatures: array of { sig, expected } — SVG first-<text> patterns
 *     to strip + grids to tag with .single-col
 *   - contentFills: array of { anchor, replacement } — sparse <p> slide fills
 *
 * Steps per run:
 *   1. Add .text-visual-grid.single-col CSS rule (idempotent — skipped if present)
 *   2. For each signature: combined strip+tag in one regex pass
 *   3. For each content fill: replace the unique sparse-sentence <p>
 *
 * Adds the CSS rule once per module; rerunning is safe.
 */
const fs = require('fs');
const path = require('path');

const MODULE_CONFIGS = {
    'm10-group-policy': {
        stripSignatures: [
            { sig: 'Loopback: user GPO follows the PC',           expected: 3 },
            { sig: 'GPMC workflow: create, edit, link',           expected: 3 },
            { sig: 'Security Filtering: limit GPO to specific',   expected: 1 },
            { sig: 'WMI Filters: GPO applies only if WMI',        expected: 1 },
            { sig: 'Preferences: tattooed settings, user can',    expected: 3 },
            { sig: 'Troubleshoot: gpresult, rsop, gpupdate',      expected: 2 },
        ],
        contentFills: [
            // S05 (post-strip anchor — sparse p remained after strip)
            { anchor: '<p>GPOs must be created in AD and then linked to sites, domains, or OUs to take effect.</p>',
              replacement: '<p>(filled in initial m10 commit — content is already in file)</p>' },
        ],
        // m10 was authored in its own first commit; content fills baked in there.
        skipContentFills: true,
    },
    'm11-iis': {
        stripSignatures: [
            { sig: 'Rule chain: allow + deny, top-down',          expected: 1 },  // S13
            { sig: 'Request Filter: drop bad requests at',        expected: 1 },  // S14
            { sig: 'W3C log: forensics + analytics source',       expected: 1 },  // S15
            { sig: 'Authentication deep dive: Windows Auth',      expected: 1 },  // S16
            { sig: 'Authorization Rules + Roles',                 expected: 1 },  // S17
            { sig: 'Request Filter: scenario matrix',             expected: 1 },  // S18
            { sig: 'IIS Manager: navigation map',                 expected: 1 },  // S20
            { sig: 'PowerShell WebAdministration module',         expected: 1 },  // S21
            { sig: 'Application initialization + idle timeout',   expected: 2 },  // S22+S23
        ],
        contentFills: [],
    },
    'm15-ad-sites': {
        stripSignatures: [
            { sig: 'Without map, clients hit random DC',                       expected: 1 },  // S05
            { sig: 'Site Links = configured replication paths',                expected: 1 },  // S06
            { sig: 'Replication: fast inside, scheduled between',              expected: 3 },  // S07+S08+S09
            { sig: 'Knowledge Consistency Checker auto-builds topology',       expected: 1 },  // S10
            { sig: 'Runs every 15 min, manages connection objects',            expected: 1 },  // S11
            { sig: 'Bridgehead = the one DC that handles intersite rep',       expected: 3 },  // S12+S13+S14
            { sig: 'ISTG picks lowest GUID DC by default',                     expected: 3 },  // S15+S16+S17
            { sig: 'Transitive replication path inference',                    expected: 1 },  // S18
            { sig: 'A→B + B→C means A→C automatically',                        expected: 1 },  // S19
        ],
        contentFills: [
            // S03 Subnets and Site Association — keep decoration (matches), fill sparse text
            {
                anchor: '<p>Subnets define IP address ranges and must be associated with sites for proper client-DC mapping.</p>',
                replacement: `<p>Subnets define IP address ranges. AD doesn&#39;t auto-discover which subnet belongs to which site — admins must REGISTER each subnet against a site, otherwise client→DC selection falls back to random.</p>

                    <ul>
                        <li><strong>Without mapping:</strong> a client looks up <code>_ldap._tcp.dc._msdcs.<em>domain</em></code> and gets every DC; it picks one essentially at random — possibly across a WAN link</li>
                        <li><strong>With mapping:</strong> the client&#39;s IP matches a registered subnet → site, and the response prefers DCs in that site (low-latency intra-site path)</li>
                        <li>One subnet maps to exactly one site; one site can hold many subnets</li>
                        <li>Branch-office subnets are the most commonly-forgotten — branch clients then hit corporate DCs and slow down logon</li>
                    </ul>

                    <div class="code-block">
<span class="comment"># Register a branch-office subnet against the Boston site</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">New-ADReplicationSubnet -Name "10.20.0.0/24" -Site "Boston"</span>

<span class="comment"># List unassigned-subnet warnings (clients hitting DCs without a site match)</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">Get-EventLog -LogName System -Source NETLOGON -Newest 50 | Where-Object Message -like "*no client site*"</span>
                    </div>` },
            // S07 Knowledge Consistency Checker — strip decoration AND fill sparse text
            {
                anchor: '<p>The KCC is an automatic process that creates and maintains the replication topology.</p>',
                replacement: `<p>The KCC is an automatic process that runs on every DC and builds the replication topology — the set of "connection objects" describing which DC pulls changes from which partner.</p>

                    <ul>
                        <li><strong>Runs every 15 minutes</strong> on each DC, evaluating local conditions and rebuilding connection objects as needed</li>
                        <li><strong>Intrasite topology:</strong> full mesh between DCs in the same site (or near-mesh with up to 3 hops max), no compression, change-notify driven (typically &lt; 1 minute)</li>
                        <li><strong>Intersite topology:</strong> spanning tree via bridgehead servers, compressed payload, scheduled (default 180 minutes)</li>
                        <li><strong>ISTG (Inter-Site Topology Generator):</strong> one DC per site is elected to handle intersite topology calculations on behalf of the site</li>
                    </ul>

                    <p>Manual intervention is rarely needed — admins typically only trigger a recalculation after major topology changes (new site, new DC, removed DC):</p>

                    <div class="code-block">
<span class="comment"># Force the KCC to recompute the topology immediately</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">repadmin /kcc</span>

<span class="comment"># Show the current ISTG for a site</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">repadmin /istg</span>
                    </div>` },
            // S12 Replication Troubleshooting — strip + fill sparse text
            {
                anchor: '<p>Use these tools and techniques to diagnose and resolve replication problems.</p>',
                replacement: `<p>When replication breaks, walk a three-layer diagnostic flow: confirm connectivity, then confirm replication is happening, then confirm objects are converging.</p>

                    <ul>
                        <li><strong>Connectivity</strong> — Can DCs reach each other? Time skew &lt; 5 min? DNS SRV records resolving? RPC ports (135 + dynamic) open?</li>
                        <li><strong>Replication</strong> — Are partners running? <code>repadmin /replsummary</code> shows global health; <code>repadmin /showrepl</code> shows per-partner USN + last-success time + error code.</li>
                        <li><strong>Convergence</strong> — Are objects actually arriving everywhere? Create a test user/group on one DC, then verify it appears on partner DCs.</li>
                    </ul>

                    <div class="code-block">
<span class="comment"># Global health: which DCs have inbound replication failures?</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">repadmin /replsummary</span>

<span class="comment"># Per-DC detail: who am I replicating from, when did it last succeed, what was the error?</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">repadmin /showrepl &lt;dc-name&gt;</span>

<span class="comment"># Test-suite view from MS&#39;s recommended tool</span>
<span class="prompt">PS C:\\&gt;</span> <span class="command">dcdiag /test:replications</span>
                    </div>

                    <div class="info-box">
                        <strong>Common root causes (in order of frequency):</strong> time skew, DNS SRV records, firewall (RPC dynamic ports), stale tombstone/lingering objects, USN rollback after improper restore.
                    </div>` },
        ],
    },
    'm14-advanced-networking': {
        stripSignatures: [
            { sig: 'Guest, Voice, IoT, Management',                       expected: 1 },  // S25
            { sig: 'Hyper-V Network Virtualization NVGRE/VXLAN',          expected: 1 },  // S27
            { sig: '3 profiles, 3 rule directions',                       expected: 1 },  // S28
            { sig: 'Program / Port / Predefined / Custom',                expected: 1 },  // S29
            { sig: 'Encrypt + authenticate L3 between hosts',             expected: 1 },  // S30
            { sig: 'QoS: prioritize traffic by app / port / DSCP',        expected: 2 },  // S31+S32
            { sig: 'New-NetQosPolicy by app/port + DSCP value',           expected: 1 },  // S33
        ],
        contentFills: [],
    },
    'm13-certificate-services': {
        stripSignatures: [
            { sig: 'Root + Policy + Issuing CAs',                       expected: 1 },  // S06
            { sig: 'Enterprise CA vs Standalone CA',                    expected: 1 },  // S07
            { sig: 'Install-WindowsFeature ADCS-Cert-Authority',        expected: 1 },  // S08
            { sig: 'CA + Web Enroll + NDES + OCSP',                     expected: 1 },  // S09
            { sig: 'Templates: cert blueprints stored in AD',           expected: 1 },  // S10
            { sig: 'Copy + modify + publish',                           expected: 1 },  // S11
            { sig: 'GPO + template ACL + scheduled refresh',            expected: 1 },  // S13
            { sig: 'https://ca/certsrv portal',                         expected: 1 },  // S14
            { sig: 'CSR upload, advanced requests',                     expected: 1 },  // S15
            { sig: 'CRL: list of revoked certs',                        expected: 1 },  // S16
            { sig: 'CRL Distribution Point + Authority Info Access',    expected: 1 },  // S17
            { sig: 'Online status check, no full CRL download',         expected: 1 },  // S18
            { sig: 'Personal, Trusted Root, Intermediate, Others',      expected: 1 },  // S19
            { sig: 'Private key escrow + KRA agent',                    expected: 1 },  // S20
            { sig: 'CA admin retrieves via certutil -getkey',           expected: 1 },  // S21
            { sig: 'Swiss-army CLI for AD CS operations',               expected: 1 },  // S22
        ],
        contentFills: [],
    },
    'm12-remote-desktop': {
        stripSignatures: [
            { sig: 'Timeouts, drives, printers, clipboard',       expected: 1 },  // S08
            { sig: 'Connection + Resource policies',              expected: 1 },  // S10
            { sig: 'NLA + TLS + cert pinning',                    expected: 1 },  // S11
            { sig: 'No client install, central updates, BYOD',    expected: 1 },  // S13
            { sig: 'Command-line args, file associations',        expected: 1 },  // S14
            { sig: 'Per-User CAL or Per-Device CAL',              expected: 1 },  // S15
            { sig: 'SSO + identity + Trusted Publisher',          expected: 1 },  // S16
            { sig: 'One VHDX per user, roams sessions',           expected: 1 },  // S17
            { sig: 'Size, share, exclusions, refresh',            expected: 1 },  // S18
            { sig: 'Session limits, drive maps, redirection',     expected: 1 },  // S19
            { sig: '.rdp files, command-line flags, credentials', expected: 1 },  // S20
            { sig: 'Connect, disconnect, shadow, logoff',         expected: 1 },  // S21
        ],
        contentFills: [],
    },
};

// ─── CLI ─────────────────────────────────────────────────────────────────
const moduleArg = process.argv[2];
const DRY = process.argv.includes('--dry-run');
if (!moduleArg || !MODULE_CONFIGS[moduleArg]) {
    console.log('usage: node wsa-strip-and-fill.js <module-folder> [--dry-run]');
    console.log('available modules:', Object.keys(MODULE_CONFIGS).join(', '));
    process.exit(1);
}
const cfg = MODULE_CONFIGS[moduleArg];
const FILE = `_app/houses/cloud/modules/wsa/${moduleArg}/cloud-presentation.module.html`;

let html = fs.readFileSync(FILE, 'utf8');
const originalLen = html.length;
const changes = [];

// ─── 1. Add CSS rule inside <style> (idempotent) ────────────────────────
const cssAnchor = '.text-visual-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr);';
const cssAdd = `.text-visual-grid.single-col { grid-template-columns: 1fr; }\n        ${cssAnchor}`;
if (html.includes(cssAnchor) && !html.includes('.text-visual-grid.single-col')) {
    html = html.replace(cssAnchor, cssAdd);
    changes.push('1. Added .text-visual-grid.single-col CSS rule');
} else if (html.includes('.text-visual-grid.single-col')) {
    changes.push('1. CSS rule already present (idempotent)');
}

// ─── 2+3. Combined strip + tag per signature ─────────────────────────────
let stripped = 0, tagged = 0;
const totalExpected = cfg.stripSignatures.reduce((a, x) => a + x.expected, 0);
for (const { sig, expected } of cfg.stripSignatures) {
    const escSig = sig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    changes.push(`2+3. Stripped ${matches.length}× "${sig.slice(0, 42)}…"`);
}
if (stripped !== totalExpected) {
    console.error(`Total stripped ${stripped} ≠ expected ${totalExpected}`);
    process.exit(1);
}
changes.push(`   Total: ${stripped} stripped, ${tagged} single-col tags`);

// ─── 4. Content fills ────────────────────────────────────────────────────
if (!cfg.skipContentFills && cfg.contentFills && cfg.contentFills.length) {
    for (const { anchor, replacement } of cfg.contentFills) {
        if (!html.includes(anchor)) {
            console.error('Anchor missing:', anchor.slice(0, 80));
            process.exit(1);
        }
        html = html.replace(anchor, replacement);
        changes.push(`4. Content-filled (anchor: "${anchor.slice(0, 60)}…")`);
    }
}

// ─── Summary + write ─────────────────────────────────────────────────────
console.log('Module:', moduleArg);
console.log('Changes:');
changes.forEach(c => console.log('  ' + c));
console.log(`Length: ${originalLen} → ${html.length} (Δ ${html.length - originalLen >= 0 ? '+' : ''}${html.length - originalLen})`);

if (DRY) { console.log('\n(dry run — no write)'); process.exit(0); }
fs.writeFileSync(FILE, html);
console.log('\n✓ Wrote ' + FILE);
