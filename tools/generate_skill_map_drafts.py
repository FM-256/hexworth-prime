"""
Generate draft Lab Skill Map YAMLs for every lab page that doesn't have one.

Walks `_app/houses/**/*.{lab,box,quiz,applet,exam}.html` + dispatch boxes,
extracts the lab_id + title, and writes a draft Skill Map to
`_app/lab-skill-maps/_drafts/<lab_id>.yaml`.

DRAFTS ARE NOT LOADED IN PRODUCTION. The orchestrator's skill_map_loader
walks the root of `_app/lab-skill-maps/`, not the `_drafts/` subdirectory.
Operators review drafts, refine forbidden_disclosures + transfer_prompts
per lab, then move the file up one level.

Default heuristics (operator-overridable):
  *.lab.html        → primary_skill.layer = Execution
  *.box.html        → primary_skill.layer = Recognition (troubleshooting)
  *.quiz.html       → primary_skill.layer = Recognition
  *.applet.html     → primary_skill.layer = Execution
  *.exam.html       → primary_skill.layer = Transfer
  *.module.html     → SKIP (typically reading content, no graded artifact)

Generic forbidden_disclosures (baseline anti-leak — operator extends
per-lab):
  "the flag is FLAG{"
  "the answer is FLAG{"
  "the solution is FLAG{"

Usage:
  python3 tools/generate_skill_map_drafts.py                  # dry run
  python3 tools/generate_skill_map_drafts.py --apply          # write
  python3 tools/generate_skill_map_drafts.py --apply --limit 50
"""
from __future__ import annotations

import re
import sys
from pathlib import Path


REPO = Path(__file__).resolve().parent.parent
APP = REPO / "_app"
OUT_DIR = REPO / "_app" / "lab-skill-maps" / "_drafts"

SKIP_SUFFIXES = {".module.html", ".presentation.html", ".textbook.html"}
LAB_SUFFIXES = {".lab.html", ".box.html", ".quiz.html", ".applet.html",
                ".tool.html", ".exam.html"}

# Heuristic primary_skill.layer per content type
LAYER_BY_SUFFIX = {
    ".lab.html":    ("Execution",   "Performs the required commands/sequence to solve the lab."),
    ".box.html":    ("Recognition", "Identifies the issue from symptoms in the troubleshooting scenario."),
    ".quiz.html":   ("Recognition", "Identifies the correct concept from quiz options."),
    ".applet.html": ("Execution",   "Uses the interactive applet to produce the correct outcome."),
    ".tool.html":   ("Execution",   "Applies the tool correctly to the scenario."),
    ".exam.html":   ("Transfer",    "Applies concepts across topics to a novel scenario."),
}

# Artifact type per suffix
ARTIFACT_BY_SUFFIX = {
    ".lab.html":    "flag",
    ".box.html":    "flag",
    ".quiz.html":   "flag",
    ".applet.html": "flag",
    ".tool.html":   "command",
    ".exam.html":   "written-explanation",
}

# Allowed Help Levels per suffix (defaults — operator overrides for sensitive labs)
LEVELS_BY_SUFFIX = {
    ".lab.html":    [0, 1, 2, 3, 4],
    ".box.html":    [0, 1, 2, 3, 4],
    ".quiz.html":   [0, 1, 2],          # quizzes graded — restrict to concept-only
    ".applet.html": [0, 1, 2, 3, 4],
    ".tool.html":   [0, 1, 2, 3, 4, 5],
    ".exam.html":   [0, 1, 2],          # exams strictly graded
}


def derive_lab_id(path: Path) -> str | None:
    """lab_id from filename suffix OR (for directory-style labs) parent dir name."""
    filename = path.name
    for suffix in LAB_SUFFIXES:
        if filename.endswith(suffix):
            return filename[: -len(suffix)]
    # Directory-style lab: index.html under */labs/<name>/ etc.
    if filename == "index.html":
        parent = path.parent.name
        for segment in path.parts[:-2]:
            if segment in ("labs", "boxes", "applets", "exams"):
                if parent and parent not in ("labs", "boxes", "applets", "exams"):
                    return parent
    return None


def derive_lab_suffix(path: Path) -> str | None:
    """Returns the LAB_SUFFIXES key OR a synthetic key for directory-style labs."""
    filename = path.name
    for suffix in LAB_SUFFIXES:
        if filename.endswith(suffix):
            return suffix
    if filename == "index.html":
        # Map directory-style labs to a suffix for the heuristic tables.
        # Use the parent-of-parent directory's last segment to classify.
        for i, segment in enumerate(path.parts[:-2]):
            if segment == "labs":
                return ".lab.html"
            if segment == "boxes":
                return ".box.html"
            if segment == "applets":
                return ".applet.html"
            if segment == "exams":
                return ".exam.html"
    return None


def extract_title(content: str, fallback: str) -> str:
    m = re.search(r"<title>([^<]+)</title>", content, re.IGNORECASE)
    if m:
        t = m.group(1).strip()
        # Strip site-name suffixes
        for sep in (" | ", " — ", " - "):
            if sep in t:
                t = t.split(sep)[0].strip()
        if t:
            return t
    # Fallback: first H1
    m = re.search(r"<h1[^>]*>([^<]+)</h1>", content, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return fallback


def yaml_quote(s: str) -> str:
    """Conservative single-line YAML string quoting. Escapes embedded quotes."""
    if not s:
        return '""'
    if any(c in s for c in '"\'`\\\n\r:') or s.startswith((' ', '-')):
        return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'
    return s


def make_draft(lab_id: str, lab_name: str, suffix: str) -> str:
    layer, description = LAYER_BY_SUFFIX[suffix]
    artifact_type = ARTIFACT_BY_SUFFIX[suffix]
    levels = LEVELS_BY_SUFFIX[suffix]
    return f"""# DRAFT Skill Map for: {lab_name}
#
# Auto-generated by tools/generate_skill_map_drafts.py — heuristic
# defaults. Operator must:
#   1. Review the chosen primary_skill.layer (heuristic from file suffix)
#   2. Add lab-specific forbidden_disclosures (e.g., the exact graded
#      command/payload/syntax that students must derive themselves)
#   3. Refine the transfer_prompt to be lab-specific
#   4. Move this file from _drafts/ up to _app/lab-skill-maps/
#      (the loader only picks up files in the root of that directory)

lab_id: {yaml_quote(lab_id)}
lab_name: {yaml_quote(lab_name)}

primary_skill:
  layer: {layer}
  description: {yaml_quote(description)}
  evidence_required: "Student successfully completes the lab's graded artifact."

assessed_artifact:
  type: {artifact_type}
  description: "Graded artifact produced by the student during the lab."

allowed_help_levels:
{chr(10).join('  - ' + str(lv) for lv in levels)}

forbidden_disclosures:
  - "the flag is FLAG{{"
  - "the answer is FLAG{{"
  - "the solution is FLAG{{"
  # TODO operator: add lab-specific forbidden items here (the exact graded
  # command/payload/syntax that students must derive themselves).

transfer_prompt: |
  What did you learn in this lab that you can apply to a different problem in the same domain?
"""


def walk_labs(root: Path):
    if not root.is_dir():
        return
    for p in root.rglob("*.html"):
        # Skip archive / drafts
        if "/_archive/" in str(p) or "/_drafts/" in str(p):
            continue
        if "/admin/" in str(p):
            continue
        name = p.name
        if any(name.endswith(s) for s in SKIP_SUFFIXES):
            continue
        # Case 1: filename has a lab suffix (key-aes.lab.html, pis-final.exam.html)
        if any(name.endswith(s) for s in LAB_SUFFIXES):
            yield p
            continue
        # Case 2: directory-style lab — index.html inside */labs/<lab-name>/
        # or */boxes/<box-name>/ etc. Lab_id derived from parent dir name.
        if name == "index.html":
            parts = p.parts
            # Look for /labs/<name>/index.html or /boxes/<name>/index.html
            for i, segment in enumerate(parts[:-2]):
                if segment in ("labs", "boxes", "applets", "exams") and i + 2 < len(parts):
                    # parts[i+1] = lab name, parts[i+2] = "index.html"
                    yield p
                    break


def main() -> int:
    args = sys.argv[1:]
    apply = "--apply" in args
    limit = None
    if "--limit" in args:
        i = args.index("--limit")
        if i + 1 < len(args):
            limit = int(args[i + 1])

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing per-lab Skill Map ids — don't redraft those
    existing_root = REPO / "_app" / "lab-skill-maps"
    existing_ids = {
        p.stem for p in existing_root.glob("*.yaml")
        if p.parent == existing_root  # ignore subdirs
    }
    print(f"existing maps in production: {len(existing_ids)} ({sorted(existing_ids)})")
    print()

    by_house = {}
    skipped_existing = 0
    skipped_no_id = 0
    written = 0
    would_write = 0

    for root in (APP / "houses", APP / "dispatch"):
        for p in walk_labs(root):
            lab_id = derive_lab_id(p)
            if not lab_id:
                skipped_no_id += 1
                continue
            if lab_id in existing_ids:
                skipped_existing += 1
                continue

            suffix = derive_lab_suffix(p)
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            title = extract_title(content, fallback=lab_id)

            # House from path
            parts = p.relative_to(APP).parts
            house = parts[1] if parts[0] == "houses" and len(parts) > 1 else "dispatch"
            by_house[house] = by_house.get(house, 0) + 1

            out_path = OUT_DIR / f"{lab_id}.yaml"
            if out_path.exists():
                continue
            if limit is not None and (written + would_write) >= limit:
                break

            draft = make_draft(lab_id, title, suffix)
            if apply:
                out_path.write_text(draft, encoding="utf-8")
                written += 1
            else:
                would_write += 1

    print(f"{'WROTE' if apply else 'WOULD WRITE'}: {written if apply else would_write} draft Skill Maps")
    print(f"skipped — already in production: {skipped_existing}")
    print(f"skipped — no lab_id derivable:  {skipped_no_id}")
    print()
    print("By house:")
    for h, n in sorted(by_house.items(), key=lambda x: -x[1]):
        print(f"  {h:14} {n}")
    print()
    if not apply:
        print("Re-run with --apply to write the drafts to _app/lab-skill-maps/_drafts/")
    else:
        print(f"Drafts at {OUT_DIR.relative_to(REPO)} — operator reviews + moves to parent.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
