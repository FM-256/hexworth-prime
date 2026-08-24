#!/usr/bin/env python3
"""Rewrite the sprint packet's command blocks so a student can type them and have them work.

WHY POSITIONAL, NOT TEXT-KEYED
    A text-keyed replacement corrupted Mission 3 on 2026-08-23: Mission 1 and Mission 3 contained
    identical source lines, so Mission 1's replacement text landed in Mission 3 as well. Every
    edit here is addressed by paragraph INDEX, and the script verifies the expected text is at
    that index before touching it. If the document shifts, it refuses rather than guessing.

WHAT IT FIXES (all measured on a cold instance, see sprint-student-walkthrough.sh)
    * The packet told students to `cp project1_index.html` / `python3 project4_honeypot.py` for
      files that were on NO instance. Assets are now baked at /opt/sprint-assets/ and the packet
      points there.
    * Mission 2 said "use SFTP from an approved peer" and never said how the peer authenticates.
      sshd reported passwordauthentication=no, so it was undoable. Steps added.
    * `print(flask.__version__)` emits a DeprecationWarning that reads like an error to a student.

@catalog what    patch the student sprint packet's command blocks (positional, verified)
@catalog run     python3 _tools/openstack-bridge/patch-sprint-packet.py [--check]
@catalog status  TOOL
"""
import copy
import sys
from pathlib import Path

from docx import Document
from docx.text.paragraph import Paragraph

SHARE = Path.home() / "hexworth-shared" / "openstack"
TARGETS = [
    "OpenStack_Cloud_Security_Sprint_Student_Missions_v2.docx",
    "OpenStack_Cloud_Security_Sprint_Student_Missions_v2 (1).docx",
    "OpenStack_Cloud_Security_Sprint_Student_Missions_v2 (2).docx",
]

# (index, expected_substring_at_that_index, new_text)
REPLACE = [
    (19, "# 1. Start the web server:",  "# Your project files are ALREADY on the instance, in /opt/sprint-assets/"),
    (20, "systemctl enable --now nginx", "sudo systemctl enable --now nginx                      # 1. start the web server"),
    (21, "sudo cp project1_index.html",  "cp /opt/sprint-assets/project1_index.html ~/          # 2. copy the page to your home"),
    (22, "curl http://127.0.0.1",        "curl http://127.0.0.1                                 # 5. prove it works LOCALLY first"),
    (24, "PARTNER",                      "# 6. Now from your PARTNER's instance (peers reach you on 'shared'):"),
    (81, "flask.__version__",            "python3 -c \"import flask; print('flask is installed')\"  # 1. confirm flask is present"),
    (83, "/path/to/project3_api.py",     "cp /opt/sprint-assets/project3_api.py app.py           # 3. copy the supplied API"),
    (104, "python3 project4_honeypot.py", "python3 project4_honeypot.py                  # 2. run it (leave this terminal open)"),
    (105, "# In another terminal",        "# 3. In a SECOND terminal on your own instance, watch the log:"),
    (106, "tail -f honeypot.log",         "tail -f ~/honeypot.log"),
    (108, "Authorized partner only",      "# 4. On your PARTNER's instance (authorized partner only):"),
]

# (index_to_insert_after, [new lines])  -- applied bottom-up so earlier indices stay valid
INSERT_AFTER = [
    (21, ["nano ~/project1_index.html                             # 3. put YOUR name in it",
          "sudo cp ~/project1_index.html /var/www/html/index.html # 4. publish it"]),
    # Mission 2: the SFTP half of the mission had no commands at all.
    (64, ["",
          "# SFTP DROP: your partner uploads a file to YOUR instance.",
          "# On YOUR instance, give the ubuntu account a password your partner can use:",
          "sudo passwd ubuntu",
          "",
          "# Then, on your PARTNER's instance:",
          "sftp ubuntu@<YOUR_PRIVATE_IP>",
          "# at the sftp> prompt:   put <your-file>      then:   bye"]),
    (108, ["cp /opt/sprint-assets/project4_generate_traffic.sh ~/",
           "chmod +x ~/project4_generate_traffic.sh"]),
]

# (index, expected_substring, [lines]) -- inserted BEFORE the anchor.
# Needed because an inserted paragraph clones the STYLE of the one it is cloned from. Anchoring
# Mission 4's first line to "the paragraph before the command" cloned prose (index 103 is the
# "PAIR UP -- REQUIRED" line), and the command silently rendered as body text instead of code.
# Cloning the command paragraph itself is what keeps the Code style.
INSERT_BEFORE = [
    (104, "python3 project4_honeypot.py",
     ["cd ~ && cp /opt/sprint-assets/project4_honeypot.py .   # 1. copy the honeypot"]),
]


def insert_after(par: Paragraph, text: str) -> Paragraph:
    """Clone a paragraph (keeping its Code style) and put `text` in the clone."""
    new_el = copy.deepcopy(par._p)
    par._p.addnext(new_el)
    np = Paragraph(new_el, par._parent)
    for r in np.runs[1:]:
        r._element.getparent().remove(r._element)
    if np.runs:
        np.runs[0].text = text
    else:
        np.add_run(text)
    return np


def insert_before(par: Paragraph, text: str) -> Paragraph:
    """Clone a paragraph and put the clone ABOVE it, so the clone inherits that paragraph's style."""
    new_el = copy.deepcopy(par._p)
    par._p.addprevious(new_el)
    np = Paragraph(new_el, par._parent)
    for r in np.runs[1:]:
        r._element.getparent().remove(r._element)
    if np.runs:
        np.runs[0].text = text
    else:
        np.add_run(text)
    return np


def set_text(par: Paragraph, text: str) -> None:
    """Replace a paragraph's text without disturbing its style."""
    for r in par.runs[1:]:
        r._element.getparent().remove(r._element)
    if par.runs:
        par.runs[0].text = text
    else:
        par.add_run(text)


def patch(path: Path, check_only: bool) -> bool:
    doc = Document(str(path))
    paras = doc.paragraphs

    # Verify EVERY anchor before changing anything -- a half-applied patch is worse than none.
    anchors = [(i, e) for i, e, _ in REPLACE] + [(i, e) for i, e, _ in INSERT_BEFORE]
    for idx, expect in anchors:
        if idx >= len(paras):
            print(f"  ✗ {path.name}: index {idx} out of range ({len(paras)} paragraphs)")
            return False
        if expect not in paras[idx].text:
            print(f"  ✗ {path.name}: anchor mismatch at [{idx}], expected {expect!r}, "
                  f"found {paras[idx].text[:60]!r}")
            return False
    if check_only:
        print(f"  ✓ {path.name}: all {len(anchors)} anchors match")
        return True

    # Replacements first: they address ORIGINAL indices, so nothing may have shifted yet.
    for idx, _, new in REPLACE:
        set_text(paras[idx], new)

    # Then every insertion, bottom-up across BOTH lists together -- a higher index processed first
    # cannot disturb a lower one. Mixing the two lists in separate passes would corrupt the order.
    inserts = ([(idx, "after", lines) for idx, lines in INSERT_AFTER]
               + [(idx, "before", lines) for idx, _, lines in INSERT_BEFORE])
    for idx, where, lines in sorted(inserts, key=lambda t: -t[0]):
        if where == "after":
            for line in reversed(lines):
                insert_after(paras[idx], line)
        else:
            for line in lines:                       # before-inserts keep natural order
                insert_before(paras[idx], line)

    doc.save(str(path))
    n_ins = sum(len(l) for _, l in INSERT_AFTER) + sum(len(l) for _, _, l in INSERT_BEFORE)
    print(f"  ✓ {path.name}: {len(REPLACE)} replaced, {n_ins} inserted")
    return True


if __name__ == "__main__":
    check = "--check" in sys.argv
    ok = all(patch(SHARE / name, check) for name in TARGETS)
    sys.exit(0 if ok else 1)
