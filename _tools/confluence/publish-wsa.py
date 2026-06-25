#!/usr/bin/env python3
"""
Publish the WSA solutions manual to Confluence (KBA space), grouped under two
"Cloud — WSA ..." parent pages:

  Quiz Solutions Manual (2981889)
    └─ Cloud — WSA Quiz Solutions          ← 19 quiz-solution pages
  Solutions and Walkthroughs Registry (1736712)
    └─ Cloud — WSA Lab Walkthroughs        ← 38 GUI/PS walkthroughs + course-level + capstone

Source of truth: ~/hexworth-shared/Solutions/WSA/*.md  (pages from .md, .docx attached).
Idempotent + resumable: a state file records title->{id,url,docx} so re-runs skip
already-created pages and never duplicate. Dedupe also checks Confluence by exact title.

Usage:
  publish-wsa.py groups     # create/ensure the 2 group pages
  publish-wsa.py sample      # groups + M01 (quiz, GUI, PS) — verify render before the batch
  publish-wsa.py all         # groups + every WSA doc
"""
import os, sys, json, re, time, importlib.util
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
WSA = os.path.expanduser("~/hexworth-shared/Solutions/WSA")
STATE_PATH = os.path.join(HERE, "wsa-confluence-state.json")
QUIZ_MANUAL_PARENT = "2981889"      # Quiz Solutions Manual
REGISTRY_PARENT = "1736712"         # Solutions and Walkthroughs Registry

# Load the existing publish-solution.py module (hyphen in name -> load by path).
_spec = importlib.util.spec_from_file_location("pub", os.path.join(HERE, "publish-solution.py"))
pub = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pub)
CREDS = pub.load_creds()
SITE = CREDS["site"].rstrip("/")
AUTH = (CREDS["email"], CREDS["token"])

# Canonical module topics (from the quiz-solution H1s) — used for uniform titles.
TOPICS = {
    "M01": "Server Installation and Configuration", "M02": "Active Directory & Identity",
    "M03": "Storage & File Services", "M04": "Hyper-V Virtualization",
    "M05": "Containers & Nano Server", "M06": "Failover Clustering",
    "M07": "Monitoring & Management", "M08": "DNS & Name Resolution",
    "M09": "DHCP Services", "M10": "Group Policy", "M11": "IIS & Web Services",
    "M12": "Remote Desktop Services", "M13": "Certificate Services",
    "M14": "Advanced Networking", "M15": "AD Sites and Replication",
    "M16": "Backup and Disaster Recovery", "M17": "Windows Firewall & Security",
    "M18": "PowerShell Automation", "M19": "Troubleshooting & Migration",
}
# Explicit titles for the non-module (course-level + capstone) docs.
COURSE = {
    "WSA-Gauntlet_WALKTHROUGH.md": "Cloud — WSA Skills Gauntlet (Walkthrough)",
    "WSA-Gauntlet-Advanced_WALKTHROUGH.md": "Cloud — WSA Advanced Skills Gauntlet (Walkthrough)",
    "WSA-Comprehensive-Review_ANSWERS.md": "Cloud — WSA Comprehensive Review (Faculty Answer Key)",
    "WSA-Midterm-Outpost_WALKTHROUGH.md": "Cloud — WSA Midterm: OUTPOST Simulation (Walkthrough)",
    "Capstone/Capstone_WALKTHROUGH.md": "Cloud — WSA FAILSAFE Capstone (Walkthrough)",
}

def load_state():
    """Load the resume/dedupe state (title -> {id,url,docx}); empty skeleton if absent."""
    return json.load(open(STATE_PATH)) if os.path.exists(STATE_PATH) else {"pages": {}, "groups": {}}

def save_state(s):
    """Persist state to disk after every page so a mid-batch failure is resumable."""
    json.dump(s, open(STATE_PATH, "w"), indent=2)

def find_exact(title):
    """Return the page id if a page with this exact title exists in KBA, else None."""
    cql = f'space = KBA AND title = "{title}"'
    res = pub.req(CREDS, "/wiki/rest/api/content/search", params={"cql": cql, "limit": 5})
    for r in res.get("results", []):
        if r["title"] == title:
            return r["id"]
    return None

def ensure_page(md_path, title, parent_id, state, kind):
    """Create the page if absent (idempotent by title), record in state. Returns id."""
    pages = state["pages"]
    if title in pages and pages[title].get("id"):
        return pages[title]["id"]
    existing = find_exact(title)
    if existing:
        pages[title] = {"id": existing, "kind": kind, "md": md_path, "url": f"{SITE}/wiki/spaces/KBA/pages/{existing}", "docx": pages.get(title, {}).get("docx")}
        save_state(state); print(f"  EXISTS  {title} (id={existing})"); return existing
    res = pub.cmd_publish(CREDS, md_path, parent_id, title)
    pages[title] = {"id": res["id"], "kind": kind, "md": md_path, "url": f"{SITE}/wiki{res['_links']['webui']}", "docx": None}
    save_state(state); time.sleep(0.4); return res["id"]

def attach_docx(page_id, docx_path, title, state):
    """Attach the matching .docx to the page (idempotent: re-upload makes a new version)."""
    if not os.path.exists(docx_path):
        print(f"    [docx missing] {docx_path}"); return False
    if state["pages"].get(title, {}).get("docx"):
        return True
    url = f"{SITE}/wiki/rest/api/content/{page_id}/child/attachment"
    ctype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    with open(docx_path, "rb") as fh:
        r = requests.post(url, headers={"X-Atlassian-Token": "nocheck"}, auth=AUTH,
                          files={"file": (os.path.basename(docx_path), fh, ctype)},
                          data={"comment": "Editable Word version of this solution", "minorEdit": "true"}, timeout=120)
    if r.status_code in (200, 201):
        state["pages"][title]["docx"] = os.path.basename(docx_path); save_state(state)
        print(f"    docx attached ({os.path.basename(docx_path)})"); return True
    print(f"    [docx FAIL {r.status_code}] {r.text[:140]}"); return False

# --- group page intro bodies (written to temp .md, published once) ---
GROUP_INTRO = {
    "quiz": ("Cloud — WSA Quiz Solutions",
             "# Cloud — WSA Quiz Solutions\n\nFaculty answer keys for the **Windows Server Administration** (CTS1328C / AZ-800) module quizzes, M01–M19. Each child page holds the full per-question solution; the editable Word version is attached to each page.\n"),
    "walk": ("Cloud — WSA Lab Walkthroughs",
             "# Cloud — WSA Lab Walkthroughs\n\nFaculty walkthroughs for the **Windows Server Administration** (CTS1328C / AZ-800) labs — GUI and PowerShell for M01–M19, plus the Midterm, Skills Gauntlet, Advanced Gauntlet, Comprehensive Review, and FAILSAFE Capstone. The editable Word version is attached to each page.\n"),
}

def ensure_group(key, parent_id, state):
    """Create (or find by title) a 'Cloud — WSA ...' group page under the given parent; return its id."""
    if state["groups"].get(key, {}).get("id"):
        return state["groups"][key]["id"]
    title, body = GROUP_INTRO[key]
    existing = find_exact(title)
    if existing:
        state["groups"][key] = {"id": existing, "title": title}; save_state(state)
        print(f"GROUP EXISTS {title} (id={existing})"); return existing
    tmp = os.path.join(HERE, f"_wsa_group_{key}.md")
    open(tmp, "w").write(body)
    res = pub.cmd_publish(CREDS, tmp, parent_id, title)
    os.remove(tmp)
    state["groups"][key] = {"id": res["id"], "title": title}; save_state(state)
    time.sleep(0.4); return res["id"]

def build_manifest():
    """Scan the WSA folder -> list of (md_path, docx_path, title, group_key, kind)."""
    items = []
    for fn in sorted(os.listdir(WSA)):
        if not fn.endswith(".md"):
            continue
        md = os.path.join(WSA, fn); docx = md[:-3] + ".docx"
        m = re.match(r"WSA-(M\d\d)-", fn)
        if fn.endswith("-Quiz-SOLUTIONS.md") and m:
            t = f"Cloud — WSA-{m.group(1)}: {TOPICS[m.group(1)]} (Quiz Solutions)"
            items.append((md, docx, t, "quiz", "quiz"))
        elif fn.endswith("_GUILab_WALKTHROUGH.md") and m:
            t = f"Cloud — WSA-{m.group(1)}: {TOPICS[m.group(1)]} (GUI Lab Walkthrough)"
            items.append((md, docx, t, "walk", "gui"))
        elif fn.endswith("_PSLab_WALKTHROUGH.md") and m:
            t = f"Cloud — WSA-{m.group(1)}: {TOPICS[m.group(1)]} (PowerShell Lab Walkthrough)"
            items.append((md, docx, t, "walk", "ps"))
        elif fn in COURSE:
            items.append((md, docx, COURSE[fn], "walk", "course"))
    # Capstone (in subfolder)
    cap = os.path.join(WSA, "Capstone", "Capstone_WALKTHROUGH.md")
    if os.path.exists(cap):
        items.append((cap, cap[:-3] + ".docx", COURSE["Capstone/Capstone_WALKTHROUGH.md"], "walk", "course"))
    return items

def write_pagemap(state):
    """Emit wsa-walkthrough-pages.md: the title -> page-id map (ALA-style) for future updates."""
    lines = ["# WSA Solutions Manual — Confluence page map\n",
             "Source: `~/hexworth-shared/Solutions/WSA/`. Pages published from `.md`; `.docx` attached.\n",
             "To edit a page after changing the `.md` (do NOT re-publish — that duplicates):",
             "`python3 _tools/confluence/publish-solution.py update <page_id> <md_file>`\n",
             f"Group pages: Quiz = {state['groups'].get('quiz',{}).get('id')} | Walkthroughs = {state['groups'].get('walk',{}).get('id')}\n",
             "| Title | Page ID | docx |", "|-------|---------|------|"]
    for title, info in sorted(state["pages"].items()):
        lines.append(f"| {title} | {info['id']} | {'yes' if info.get('docx') else 'no'} |")
    open(os.path.join(HERE, "wsa-walkthrough-pages.md"), "w").write("\n".join(lines) + "\n")

def process(items, state):
    """Ensure both group pages, then publish each item + attach its .docx, then write the page-map."""
    parents = {"quiz": ensure_group("quiz", QUIZ_MANUAL_PARENT, state),
               "walk": ensure_group("walk", REGISTRY_PARENT, state)}
    ok = 0
    for md, docx, title, gkey, kind in items:
        pid = ensure_page(md, title, parents[gkey], state, kind)
        attach_docx(pid, docx, title, state)
        ok += 1
    write_pagemap(state)
    print(f"\nprocessed {ok} pages. state: {STATE_PATH}")

def main():
    """CLI entry: groups | sample (M01 only) | all — build manifest and publish."""
    mode = sys.argv[1] if len(sys.argv) > 1 else "sample"
    state = load_state()
    if mode == "groups":
        ensure_group("quiz", QUIZ_MANUAL_PARENT, state)
        ensure_group("walk", REGISTRY_PARENT, state)
        print("groups ready:", json.dumps(state["groups"]))
        return
    items = build_manifest()
    if mode == "sample":
        items = [it for it in items if "WSA-M01-" in it[0]]  # M01 quiz+GUI+PS
    elif mode != "all":
        print("usage: publish-wsa.py [groups|sample|all]"); sys.exit(1)
    print(f"mode={mode}: {len(items)} child pages")
    process(items, state)

if __name__ == "__main__":
    main()
