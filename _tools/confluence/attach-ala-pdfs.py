"""
Attach the 13 generated ALA walkthrough PDFs to their Confluence walkthrough pages
(KBA space, children of the Solutions & Walkthroughs Registry). Page IDs from
ala-walkthrough-pages.md. Idempotent-ish: first attach creates the file; re-runs create a
new version of the same-named attachment (Confluence Cloud handles name collisions on the
collection endpoint). Each upload is independent — one failure does not abort the batch.
"""
import os, json, sys
import requests

CREDS = json.load(open(os.path.expanduser('~/.config/confluence/credentials.json')))
SITE = CREDS['site'].rstrip('/')
AUTH = (CREDS['email'], CREDS['token'])
ALA = os.path.expanduser('~/hexworth-shared/Solutions/Advanced Linux Administration')

# (PDF filename, Confluence page id) — from _tools/confluence/ala-walkthrough-pages.md
PAGES = {
    'ALA-L01-Dead-Cell-Recovery-SOLUTION.pdf': '28344322',
    'ALA-L02-Grid-Handshake-SOLUTION.pdf': '28311554',
    'ALA-L03-Signal-in-the-Noise-SOLUTION.pdf': '28311571',
    'ALA-L04-Lockdown-Protocol-SOLUTION.pdf': '28377089',
    'ALA-L05-The-Insider-SOLUTION.pdf': '28409857',
    'ALA-L06-Field-Assembly-SOLUTION.pdf': '28442626',
    'ALA-L07-Name-Authority-SOLUTION.pdf': '28442644',
    'ALA-L08-The-Night-Shift-SOLUTION.pdf': '28540930',
    'ALA-L09-Poisoned-Records-SOLUTION.pdf': '28606466',
    'ALA-L10-Ghost-in-the-Cell-SOLUTION.pdf': '28540948',
    'ALA-L11-Flatline-SOLUTION.pdf': '28639234',
    'ALA-L12-Full-Cell-Audit-SOLUTION.pdf': '28672002',
    'ALA-Hunt1-Website-Down-SOLUTION.pdf': '28672019',
    'ALA-Final-Cell-Sigma-Commissioning-SOLUTION.pdf': '34275330',
}

# Upload one PDF as a Confluence attachment on the given page. POSTs to the page's
# child/attachment collection endpoint (nocheck token required for non-browser uploads);
# returns the requests.Response so the caller can report status.
def attach(pdf_name, page_id):
    path = os.path.join(ALA, pdf_name)
    url = f"{SITE}/wiki/rest/api/content/{page_id}/child/attachment"
    headers = {'X-Atlassian-Token': 'nocheck'}
    with open(path, 'rb') as fh:
        files = {'file': (pdf_name, fh, 'application/pdf')}
        data = {'comment': 'Professional PDF walkthrough (auto-generated from the solution markdown)',
                'minorEdit': 'true'}
        r = requests.post(url, headers=headers, auth=AUTH, files=files, data=data, timeout=90)
    return r

only = sys.argv[1:]  # optionally restrict to given pdf filenames (e.g. a single test attach)
ok, fail = 0, 0
for name, pid in PAGES.items():
    if only and name not in only:
        continue
    try:
        r = attach(name, pid)
        if r.status_code in (200, 201):
            ok += 1; print(f"OK    {name} -> page {pid}")
        else:
            fail += 1; print(f"FAIL  {name} -> page {pid}  [{r.status_code}] {r.text[:160]}")
    except Exception as e:
        fail += 1; print(f"ERROR {name} -> page {pid}: {e}")
print(f"\nattached: {ok} | failed: {fail}")
