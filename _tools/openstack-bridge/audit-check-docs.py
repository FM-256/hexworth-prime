#!/usr/bin/env python3
"""Find checks that grade students on requirements their lab page never states.

WHY THIS EXISTS
    On 2026-08-24 the OpenStack IaC capstone's check 25 was failing every student. It asserts
    `manifest_version == 1` and a non-empty `networks`. The lab page mentioned neither: the string
    `manifest_version` appeared ZERO times. Students who did the taught work correctly, stripping
    UUIDs and translating flavors to size classes, were marked incomplete for two keys nobody told
    them about. It was found by reading one student's live sandbox, which is not a strategy.

    So: does any OTHER check do this?

WHY THE FIRST ATTEMPT WAS WORTHLESS
    A regex over `cmd:` captured 7 of 38 checks, because `cmd` is a multi-line template literal.
    It reported almost nothing and could have been read as "almost nothing is wrong". A parser
    that silently covers 18% of the input is worse than no parser: it produces a clean-looking
    answer to a question it never asked. This one balances braces and reports its own coverage.

WHAT IT DOES
    1. Parses every { id, desc, cmd } from lab-manager/server.js by brace balancing.
    2. Decodes any base64 payload inside cmd, so python assertions are visible.
    3. Extracts the tokens a check REQUIRES: file paths, and literal strings it greps for.
    4. Maps check ids to lab pages via each page's own data-check attributes (exact, not guessed).
    5. Reports every required token absent from the page text.

    A hit is a CANDIDATE, not a verdict. Some tokens are internal (a device name, a temp path).
    Read each one. The point is a short list to read, instead of one student's sandbox.

@catalog what    find checks grading on requirements the lab page never documents
@catalog run     python3 _tools/openstack-bridge/audit-check-docs.py <server.js>
@catalog status  TOOL
"""
import base64
import html
import re
import sys
from pathlib import Path

APP = Path(__file__).resolve().parents[2] / "_app"

# (check id, token) pairs that are NOT defects, each with the reason it is not one. Without this
# the same two lines reappear on every run and the tool trains you to skim past its own output.
# Keyed on the exact token, so if one of these ever shows up as a genuine student requirement
# somewhere else, it is still reported. Reviewed 2026-08-24 by reading the check source.
NOT_A_DEFECT = {
    (20, "::/0"): "IPv6 twin of 0.0.0.0/0 inside a NEGATIVE condition: the check FAILS you if a "
                  "rule is world-open. The page documents 0.0.0.0/0. No student ever types ::/0.",
    (22, "string"): "from `typeof sb.cidr === 'string'`, an internal type guard, not a value a "
                    "student produces.",
}


def parse_checks(src: str):
    """Every { id: N, desc: ..., cmd: ... } block, found by balancing braces."""
    out = []
    for m in re.finditer(r"\{\s*id:\s*(\d+)\s*,", src):
        start = m.start()
        depth, i, in_tick = 0, start, False
        while i < len(src):
            c = src[i]
            if c == "`" and src[i - 1] != "\\":
                in_tick = not in_tick
            elif not in_tick:
                if c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    if depth == 0:
                        break
            i += 1
        block = src[start:i + 1]
        desc = re.search(r"desc:\s*'([^']*)'", block) or re.search(r'desc:\s*"([^"]*)"', block)
        cmd = re.search(r"cmd:\s*`(.*?)`\s*\}", block, re.S)
        # Checks come in TWO kinds and conflating them hid half the set. `cmd:` runs a shell
        # command in the student's container (file-based work). `fn:` is a JS predicate over
        # live cloud state fetched server-side. The first version only understood `cmd:`, so 19
        # of 34 parsed with an empty command and were silently skipped while the tool still
        # printed a confident "0 candidates".
        # Two arrow forms. `=> { ... }` has a body; `=> expr` does not, and requiring braces
        # left 7 student-facing checks unaudited while the tool reported a confident result.
        fn = (re.search(r"fn:\s*\((.*?)\)\s*=>\s*\{(.*)\}\s*\}?\s*$", block, re.S)
              or re.search(r"fn:\s*\((.*?)\)\s*=>\s*(.*?)\s*\}\s*$", block, re.S))
        out.append({
            "id": int(m.group(1)),
            "desc": desc.group(1) if desc else "",
            "cmd": cmd.group(1) if cmd else "",
            "fn": fn.group(2) if fn else "",
            "kind": "cmd" if cmd else ("fn" if fn else "unknown"),
        })
    return out


def expand(cmd: str) -> str:
    """Inline any base64 payload so its assertions are greppable."""
    text = cmd
    for b in re.findall(r"[A-Za-z0-9+/]{40,}={0,2}", cmd):
        try:
            text += "\n" + base64.b64decode(b).decode("utf-8", "replace")
        except Exception:
            pass
    return text


def requirements(cmd: str):
    """What the check demands, as GROUPS of alternatives.

    A group is satisfied if the page documents ANY member. That distinction is the whole
    difference between a useful report and noise: check 28 greps
    `no changes|nothing to do|unchanged|0 created`, so a student needs exactly one of them.
    Flagging `0 created` as undocumented, when three alternatives are documented, invents a
    defect. The first version of this tool did exactly that.
    """
    t = expand(cmd)
    groups = []
    for path in set(re.findall(r"/home/student/[A-Za-z0-9_./-]+", t)):
        # pages write the tilde form; the check writes the absolute one. Same requirement.
        groups.append({path, path.replace("/home/student/", "~/"),
                       path.rsplit("/", 1)[-1]})
    for pat in re.findall(r"grep -[a-zA-Z]*q[a-zA-Z]*E?\s+[\"']([^\"']+)[\"']", t):
        alts = {p.strip() for p in pat.split("|") if len(p.strip()) > 2}
        if alts:
            groups.append(alts)
    for key in set(re.findall(r"m\.get\('([A-Za-z_]+)'\)", t)) | set(re.findall(r"sv\.get\('([A-Za-z_]+)'\)", t)):
        groups.append({key})
    # shell variables are internal plumbing, never something a student is told to produce
    return [g for g in groups if not any(x.startswith("$") for x in g)]


def fn_requirements(fn: str):
    """Best effort for `fn:` predicates: the literal values and state keys they insist on.

    A live-state predicate cannot hide a magic filename, but it CAN hide a required value
    (status must be ACTIVE, a network must be owned) that the page never mentions.
    """
    groups = []
    for lit in set(re.findall(r"===\s*'([^']{2,})'", fn)):
        groups.append({lit, lit.lower(), lit.capitalize()})
    return groups


# What a line CREATES, by target, not by "a creating verb appeared somewhere on this line".
#
# The first version asked whether a line contained both a creating token and the filename. That
# passes a mutation it must fail: deleting `nano ~/project/stack.json` from the capstone left
#   { ...; python3 ~/project/apply.py ~/project/stack.json; } > ~/project/apply-twice.txt
# which has a `>` and the word stack.json on the same line, so the audit called stack.json
# "created" while it was only ever READ there. A redirect to a different file is not creation of
# this one. Targets are now extracted and compared.
CREATE_TARGETS = [
    re.compile(r">>?\s*([^\s;|&)]+)"),                       # redirect target
    re.compile(r"\b(?:nano|vim?|touch|tee)\s+([^\s;|&)]+)"),  # editor / tee target
    re.compile(r"\b(?:cp|mv)\s+\S+\s+([^\s;|&)]+)"),         # copy / move destination
    re.compile(r"\bcurl\s+-o\s*([^\s;|&)]+)"),
    re.compile(r"\bwget\s+-O\s*([^\s;|&)]+)"),
]


def created_by(line: str):
    """Every path this line actually brings into being."""
    out = set()
    for rx in CREATE_TARGETS:
        out |= set(rx.findall(line))
    return out


def cmd_blocks(raw: str):
    """Everything a student is shown to TYPE, in any of the markups the pages actually use.

    Reading only `<div class="cmd">` reported two false positives against the OpenStack hub,
    which puts its commands in `<div class="lab-monitor__how">Try: <code>...</code></div>`. The
    instructions were right there. Narrowing an extractor to one page's convention and then
    reporting on seven pages is how an audit invents defects.

    Including every `<code>` stays precise because a match ALSO requires a CREATORS verb on the
    same line, so a bare `<code>~/notes/servers.txt</code>` mention still counts as prose.
    """
    out = [html.unescape(m) for m in re.findall(r'<div class="cmd">(.*?)</div>', raw, re.S)]
    out += [html.unescape(m) for m in re.findall(r'<code[^>]*>(.*?)</code>', raw, re.S)]
    out += [html.unescape(m) for m in re.findall(r'class="lab-monitor__how">(.*?)</div>', raw, re.S)]
    return out


def creation_audit(checks, pages):
    """Every file a grader READS must be CREATED by an instruction the page actually gives.

    This is the gap the token audit cannot see. On 2026-08-24 the IaC capstone graded
    ~/project/stack.json while the page only ever mentioned the path: no step told anyone to
    write it, and step 4 then ran an applier against a file nobody had been asked to create.
    A filename appearing in prose, or inside a command that READS it, is not an instruction.
    """
    findings = []
    for c in checks:
        if c["kind"] != "cmd":
            continue
        needed = set(re.findall(r"/home/student/[A-Za-z0-9_./-]+", expand(c["cmd"])))
        if not needed:
            continue
        for p, ids in pages.items():
            if c["id"] not in ids:
                continue
            blocks = cmd_blocks(p.read_text(errors="replace"))
            for path in needed:
                forms = {path, path.replace("/home/student/", "~/"), path.rsplit("/", 1)[-1]}
                created = any(
                    any(t.rstrip("'\"") in forms or t.rstrip("'\"").endswith("/" + path.rsplit("/", 1)[-1])
                        for t in created_by(line))
                    for b in blocks for line in b.split("\n")
                )
                if not created:
                    findings.append((c["id"], p.name, path, c["desc"]))
    return findings


# Paths a command CONSUMES. These must already exist when the line runs.
CONSUMERS = [
    re.compile(r"\b(?:cat|less|head|tail|source|\.)\s+([^\s;|&)]+)"),
    re.compile(r"\bpython3?\s+([^\s;|&)-][^\s;|&)]*\.py)"),
    re.compile(r"\bbash\s+([^\s;|&)]+\.sh)"),
    re.compile(r"\./([^\s;|&)]+\.sh)"),
]


def self_consistency_audit(pages):
    """Within ONE page: does it run anything it never told the student to create?

    apply.py was referenced three times in the capstone (`python3 ~/project/apply.py ...`) and
    no step ever said to write it. The check-driven audit could not see it, because no CHECK
    reads apply.py: only the page's own commands do. Same defect as stack.json, invisible to a
    tool that only looks at what the grader touches.
    """
    findings = []
    for p in sorted(pages):
        blocks = cmd_blocks(p.read_text(errors="replace"))
        made, used = set(), {}
        for b in blocks:
            for line in b.split("\n"):
                if line.strip().startswith("#"):
                    continue
                for t in created_by(line):
                    made.add(t.rstrip("'\"").rsplit("/", 1)[-1])
                for rx in CONSUMERS:
                    for t in rx.findall(line):
                        used.setdefault(t.rstrip("'\"").rsplit("/", 1)[-1], t)
        for base, shown in used.items():
            if base not in made:
                findings.append((p.name, shown))
    return findings


def page_text(p: Path) -> str:
    raw = p.read_text(errors="replace")
    return html.unescape(re.sub(r"<[^>]+>", " ", raw)) + " " + raw


def main():
    src = Path(sys.argv[1]).read_text(errors="replace")
    checks = parse_checks(src)
    kinds = {}
    for c in checks:
        kinds[c["kind"]] = kinds.get(c["kind"], 0) + 1
    print(f"  parsed {len(checks)} check definitions: "
          + ", ".join(f"{v} {k}" for k, v in sorted(kinds.items())))
    if kinds.get("unknown"):
        print(f"  WARNING: {kinds['unknown']} check(s) matched NEITHER cmd: nor fn: and were NOT audited")

    # exact page -> check-id map, from the pages themselves
    pages = {}
    for f in APP.rglob("*.html"):
        ids = {int(x) for x in re.findall(r'data-check="(\d+)"', f.read_text(errors="replace"))}
        if ids:
            pages[f] = ids
    print(f"  {len(pages)} pages declare check ids\n")

    findings = 0
    for c in checks:
        owners = [p for p, ids in pages.items() if c["id"] in ids]
        if not owners:
            continue
        groups = requirements(c["cmd"]) if c["kind"] == "cmd" else fn_requirements(c["fn"])
        if not groups:
            continue
        for p in owners:
            txt = page_text(p)
            # a group counts as documented if ANY of its alternatives appears
            unmet = [g for g in groups
                     if not any(alt in txt for alt in g)
                     and not any((c["id"], alt) in NOT_A_DEFECT for alt in g)]
            if unmet:
                findings += 1
                print(f"  CHECK {c['id']:>3}  {p.name}")
                print(f"     desc   : {c['desc'][:76]}")
                for g in unmet[:4]:
                    print(f"     absent : {' OR '.join(sorted(g)[:3])}")
    print(f"\n  candidates to read: {findings}")

    print("\n  === does the page TELL the student to create every file it is graded on? ===")
    created = creation_audit(checks, pages)
    for cid, page, path, desc in created:
        print(f"  CHECK {cid:>3}  {page}")
        print(f"     graded on : {path}")
        print(f"     desc      : {desc[:70]}")
        print(f"     PROBLEM   : no command block on that page creates it")
    print(f"  files graded but never created by an instruction: {len(created)}")

    print("\n  === does a page RUN anything it never told the student to write? ===")
    self_c = self_consistency_audit(pages)
    for page, path in self_c:
        print(f"  {page}")
        print(f"     runs      : {path}")
        print(f"     PROBLEM   : no command on that page creates it")
    print(f"  files run but never created: {len(self_c)}")
    if NOT_A_DEFECT:
        print(f"  ({len(NOT_A_DEFECT)} known non-defect(s) suppressed; see NOT_A_DEFECT for why)")


if __name__ == "__main__":
    main()
