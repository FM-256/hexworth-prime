"""
Extract the salvageable case-file content from the 12 malformed orphan project pages
(the duplicate-document defect: a truncated new-format cover prepended onto a complete
older-format body). The REAL content lives in the second fragment. This pulls, per page,
the metadata + every body section so the repair generator can re-emit a single clean
case-file document. Dumps JSON to /tmp/orphan-content.json for review before rebuild.
"""
import re, json, html

PROJ = '/home/eq/ai-content/hexworth-prime/_app/projects/'
ORPHANS = ['cloud-ec2-first-server','cloud-oracle-free-vm','cloud-s3-static-site',
           'darkarts-kali-setup','forge-home-lab','forge-virtualbox-first-vm',
           'forge-vmware-first-vm','shield-firewall-iptables','starter-calculator',
           'starter-first-repo','starter-github-profile','starter-portfolio-site']

def grab(pat, s, flags=re.S):
    m = re.search(pat, s, flags)
    return m.group(1).strip() if m else None

out = {}
for name in ORPHANS:
    txt = open(PROJ + name + '.html', encoding='utf-8').read()
    # Work only on the real content fragment (after the SECOND <body>).
    bodies = [m.start() for m in re.finditer(r'<body>', txt)]
    frag = txt[bodies[-1]:] if len(bodies) >= 2 else txt

    rec = {}
    rec['house_name'] = grab(r'<span class="cf-house-name">(.*?)</span>', frag)
    rec['house_domain'] = grab(r'<span class="cf-house-domain">(.*?)</span>', frag)
    rec['subject'] = grab(r'<h1 class="cf-subject">(.*?)</h1>', frag)
    rec['diff'] = grab(r'cf-badge-diff">(.*?)</span>', frag)
    rec['time'] = grab(r'cf-badge-time">(.*?)</span>', frag)
    rec['xp'] = grab(r'cf-badge-xp">(.*?)</span>', frag)
    rec['case_ref'] = grab(r'cf-header-ref">(.*?)</span>', txt)  # header ref is in fragment 1

    # Mission Brief paragraphs
    mb = grab(r'Mission Brief</div>\s*<div class="cf-prose">(.*?)</div>\s*</div>', frag)
    rec['mission'] = re.findall(r'<p>(.*?)</p>', mb, re.S) if mb else []

    # Requirements
    req = grab(r'(?:Agent Requirements|Requirements)</div>\s*<ul class="cf-req-list">(.*?)</ul>', frag)
    rec['requirements'] = [x.strip() for x in re.findall(r'<li>(.*?)</li>', req, re.S)] if req else []

    # Phases — position-based: split the evidence board on each title marker so nested
    # divs / checkpoint wrappers don't confuse a greedy card regex (fixes s3 + kali merge).
    titles = list(re.finditer(r'cf-evidence-title">(.*?)</div>', frag, re.S))
    phases = []
    for i, t in enumerate(titles):
        start = t.end()
        end = titles[i + 1].start() if i + 1 < len(titles) else len(frag)
        chunk = frag[start:end]
        desc = grab(r'cf-evidence-desc">(.*?)</div>', chunk)
        cp_title = grab(r'Checkpoint:?\s*(.*?)</div>', chunk)
        cp_items = re.findall(r'<li>(.*?)</li>', chunk, re.S)
        phases.append({'title': t.group(1).strip(), 'desc': (desc or '').strip(),
                       'checkpoint_title': cp_title,
                       'checkpoint_items': [x.strip() for x in cp_items]})
    rec['phases'] = phases

    # Asset Manifest
    am = grab(r'Asset Manifest</div>\s*<div class="cf-manifest">(.*?)</div>\s*</div>', frag)
    rec['assets'] = [x.strip() for x in re.findall(r'cf-manifest-item">(.*?)</div>', am)] if am else []

    # Expected Outcomes
    eo = grab(r'Expected Outcomes</div>\s*<ul class="cf-debrief-list">(.*?)</ul>', frag)
    rec['outcomes'] = [x.strip() for x in re.findall(r'<li>(.*?)</li>', eo, re.S)] if eo else []

    rec['has_related_training'] = 'Related Training' in frag
    out[name] = rec

open('/tmp/orphan-content.json', 'w').write(json.dumps(out, indent=2))
# Print a compact summary for review.
for name, r in out.items():
    print(f"\n===== {name} =====")
    print(f"  house={r['house_name']} / {r['house_domain']}  subj={r['subject']}")
    print(f"  diff={r['diff']} time={r['time']} xp={r['xp']} caseref={r['case_ref']} relTraining={r['has_related_training']}")
    print(f"  mission paras={len(r['mission'])}  reqs={len(r['requirements'])}  phases={len(r['phases'])}  assets={len(r['assets'])}  outcomes={len(r['outcomes'])}")
    for i, p in enumerate(r['phases'], 1):
        print(f"    P{i}: {p['title']}  | checkpoint: {p['checkpoint_title']} ({len(p['checkpoint_items'])} items)")
