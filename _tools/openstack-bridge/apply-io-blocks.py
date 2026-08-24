#!/usr/bin/env python3
"""Prototype the command/expected-output pattern on ONE page: the Cloud Security Sprint.

DESIGN, and the constraint that shapes it
    Every defect found on 2026-08-24 shared a root cause: a student could not tell success from
    failure at the step where it happened. `apt update` exits 0 with no network. A server reports
    created and then goes ERROR. Check 25 failed silently for months.

    So each command gets an EXPECT line. But never a pasted transcript: real output carries UUIDs,
    IP addresses and timestamps, all of which drift, and a stale expected-output block is a fresh
    lie on the page -- the same failure as "instances have no internet", which was true yesterday
    and false today. Only the INVARIANT goes on the page: the one token that proves it worked.

    Three parts per command:
      the command            what you type
      EXPECT                 the invariant that proves it worked
      IF NOT                 what the common wrong answer MEANS, which is where the teaching is

    Where a grader check exists, EXPECT is taken from the check so the page and the grader cannot
    drift apart. That drift is what produced all three capstone defects today.
"""
import re
import sys
from pathlib import Path

LABS = Path("_app/houses/cloud/openstack/labs")

# Every EXPECT below is taken from what the GRADER asserts, or from a string the page itself
# tells the student to write. None of them is my own guess about behaviour: that is the mistake
# that put "fails immediately" on the sprint page when a security-group drop is a timeout.
#
# Most of these pages already carry a primitive expectation in a comment ("# WAIT for: ACTIVE").
# What none of them carries is the DIAGNOSIS: what the wrong answer means. That is the half that
# saves a student twenty minutes of looking at the wrong layer, so it is the half worth adding.
PAGE_PAIRS = {
 "cloud-openstack-cinder-live.lab.html": [
   ("openstack volume show lab-vol -f value -c status   # WAIT for: in-use",
    "in-use  (check 4 reads this exact state out of attach-proof.txt)",
    "still available means the attach did not take; error usually means the server was not ACTIVE yet"),
   ("openstack volume show lab-vol -f value -c status   # WAIT for: available (detach is not ",
    "available  (check 5 reads this state out of detach-proof.txt)",
    "still in-use means the detach has not finished: it is not instant, wait and ask again"),
 ],
 "cloud-openstack-launch-chain-live.lab.html": [
   # Both of these lines live in the SAME command block, and one io block can only follow a
   # block, so they are stated together rather than silently dropping the second.
   #
   # NO invented fallback. An earlier version said a wrong flavor meant "the create fell back to
   # a default". OpenStack does no such thing: an unknown flavor fails the create outright, and
   # this page's own next paragraph already teaches that a wrong flavor lands in ERROR. The
   # flavor is hardcoded here, so the only way it differs is that someone edited the line.
   ("openstack server show chain-vm -f value -c addresses  # must not be empty",
    "an address on a network (check 16), and flavor m1.nano (check 15)",
    "an empty address means you booted with no network: the disk runs and nothing can reach it. "
    "The flavor is hardcoded in the command above, so a different one means it was edited: "
    "re-run with --flavor m1.nano exactly"),
 ],
 "cloud-openstack-neutron-live.lab.html": [
   ("openstack router show lab5-router -f value -c external_gateway_info",
    "a network_id, not None  (check 23 needs the gateway AND a subnet interface)",
    "None means the external gateway was never set: the router exists but leads nowhere"),
   ("openstack server show lab5-vm -f value -c addresses   # must show lab5-net",
    "lab5-net  (check 24 wants a machine actually ON your network)",
    "a shared network here means you built lab5-net and then booted somewhere else"),
 ],
 "cloud-openstack-secgroup-live.lab.html": [
   ("openstack server show guard-vm -f value -c security_groups   # web-sg must appear",
    "web-sg  (check 20 tests that the group is ATTACHED, not merely created)",
    "only 'default' means the rule you wrote guards nothing: it exists, on no machine"),
 ],
 "cloud-openstack-rescue-live.lab.html": [
   ("openstack volume show orphan-vol -f value -c status   # WAIT for: available",
    "available  (the volume outlived the server, which is the whole lesson)",
    "in-use means the detach has not finished, or you deleted the server without detaching first"),
 ],
 "cloud-openstack-project-iac.lab.html": [
   ("openstack server list        # empty when you are done",
    "no rows at all  (check 27 compares what is standing against your pre-destroy baseline)",
    "a server still listed means teardown is incomplete, and 27 will judge you against a stack that never died"),
 ],
}

PAGE = LABS / "cloud-openstack-security-sprint.lab.html"

CSS = """        /* command / expected-output pairs. EXPECT carries the invariant ONLY: no UUIDs,
           no addresses, no timestamps, because those drift and a stale expectation is a lie
           the page tells on every load. */
        .io { margin: 6px 0 14px; }
        .io__expect, .io__ifnot {
            font-family: 'Consolas', monospace; font-size: 0.8rem;
            padding: 6px 14px; border-left: 3px solid; border-radius: 0 6px 6px 0;
        }
        .io__expect { color: var(--success); border-color: var(--success);
                      background: rgba(34, 197, 94, 0.06); }
        .io__ifnot  { color: var(--warn); border-color: var(--warn);
                      background: rgba(245, 158, 11, 0.06); margin-top: 3px; }
        .io__label { font-weight: 700; letter-spacing: 0.06em; margin-right: 8px; }
"""

# (anchor already on the page, EXPECT, IF NOT)
PAIRS = [
    ("curl http://127.0.0.1                                   # 5. prove it locally FIRST",
     "your own name, from the page you just edited",
     "the stock nginx welcome page means you edited a copy but published the original"),
    ("nmap -Pn -p 22,80 &lt;YOUR_PRIVATE_IP&gt;   # -Pn: ICMP is closed by default here",
     "22/tcp open  ssh    and    80/tcp open  http",
     "filtered means the security group has not allowed your partner; closed means nothing is listening"),
    ("curl http://127.0.0.1:5000/health",
     '{"status":"healthy"}',
     "connection refused means the app died when you closed the terminal: run it inside tmux"),
    # Mission 4's "prove the block worked" is the page's climax and the closest analog to the
    # silent failures this whole feature exists to prevent. It was left as prose while Mission 1's
    # cosmetic check got two boxes: an inversion of risk, not a curated shortlist. The wording is
    # grounded in a measurement taken the same day, not theory: with a leftover broad rule in
    # place the partner still got HTTP 200 while the block looked applied; after removing every
    # matching rule the retry returned HTTP 000, stopped at Neutron before reaching the guest.
    #
    # NO TEMPORAL CLAIM. An earlier version said the retry "fails immediately". A security-group
    # block is a silent DROP, which presents as a TIMEOUT, and the page itself teaches two
    # missions earlier that `filtered` means the security group has not allowed your partner:
    # the slow case. project4_generate_traffic.sh passes no --max-time and was never instrumented
    # for timing, so there was no measurement behind the word. Saying "times out or is refused"
    # is true in both environments and consistent with what the page already taught.
    ("openstack security group rule delete &lt;RULE_ID&gt;",
     "the partner's retry times out or is refused, and honeypot.log gains NO new lines",
     "traffic still arriving means a BROADER rule still allows it: list every rule on that port, "
     "not just the one you added last"),
    ("cat /srv/clouddrop/proof.txt",
     "Cinder survived",
     "no such file means you mounted the wrong device, or reformatted the volume and destroyed it"),
]


def build(html: str) -> str:
    if ".io__expect" not in html:
        html = html.replace("        .footer { text-align: center;", CSS + "        .footer { text-align: center;", 1)
    for anchor, expect, ifnot in PAIRS:
        if anchor not in html:
            print(f"  ANCHOR MISSING, skipped: {anchor[:52]}")
            continue
        # The anchor is not always the LAST line of its command block. On most lab pages it sits
        # mid-block, so the io block must go after the block's CLOSING tag, not after the anchor
        # line. Assuming anchor+"</div>" existed crashed on the first page that was not the
        # sprint, which is what happens when a helper is written against a single example.
        a_at = html.index(anchor)
        close = html.index("</div>", a_at) + len("</div>")
        if 'class="io"' in html[close:close + 60]:
            print(f"  already has an io block, skipped: {anchor[:44]}")
            continue
        # The io block is a SIBLING that follows the closed cmd div. An earlier version tried to
        # split the cmd block and left `<div class="cmd" style="display:none">` hanging open,
        # which took div balance from 57/57 to 73/69 and would have nested every later section
        # inside a hidden div. Append after the closer; never reopen.
        io = ('\n                <div class="io">\n'
              f'                    <div class="io__expect"><span class="io__label">EXPECT</span>{expect}</div>\n'
              f'                    <div class="io__ifnot"><span class="io__label">IF NOT</span>{ifnot}</div>\n'
              '                </div>')
        html = html[:close] + io + html[close:]
    return html


def audit(html: str) -> int:
    """An EXPECT that contains a UUID, an IP or a timestamp is guaranteed to rot. Refuse it."""
    bad = 0
    for m in re.findall(r'class="io__expect">.*?</div>', html, re.S):
        for pat, why in [(r"[0-9a-f]{8}-[0-9a-f]{4}-", "a UUID"),
                         (r"\b\d{1,3}(\.\d{1,3}){3}\b", "an IP address"),
                         (r"\b20\d\d-\d\d-\d\d", "a timestamp")]:
            if re.search(pat, m):
                print(f"  REJECT: an EXPECT contains {why}, which will drift: {m[:70]}")
                bad += 1
    return bad


def apply_to(path: Path, pairs, write: bool) -> bool:
    """Apply one page's pairs. Returns True if anything changed."""
    global PAIRS
    saved, PAIRS = PAIRS, pairs
    try:
        src = path.read_text()
        out = build(src)
        if audit(out):
            print(f"  {path.name}: REFUSING, an expectation would go stale")
            return False
        if out.count("<div") != out.count("</div>"):
            print(f"  {path.name}: REFUSING, div balance broken")
            return False
        from html.parser import HTMLParser
        HTMLParser().feed(out)
        changed = out != src
        if write and changed:
            path.write_text(out)
        print(f"  {path.name}: {out.count('class=\"io__expect\"')} pair(s), "
              f"divs {out.count('<div')}/{out.count('</div>')}"
              f"{' WRITTEN' if (write and changed) else ' (no change)'}")
        return changed
    finally:
        PAIRS = saved


if __name__ == "__main__":
    if "--all" in sys.argv:
        w = "--write" in sys.argv
        for name, pairs in PAGE_PAIRS.items():
            apply_to(LABS / name, pairs, w)
        sys.exit(0)
    src = PAGE.read_text()
    out = build(src)
    if audit(out):
        sys.exit("  refusing to write: an expectation would go stale")
    # Balance is asserted here, not assumed: this script exists to edit HTML, so it must prove
    # it did not break the document it edited.
    before_o, before_c = src.count("<div"), src.count("</div>")
    after_o, after_c = out.count("<div"), out.count("</div>")
    print(f"  div balance before: {before_o}/{before_c}   after: {after_o}/{after_c}")
    if after_o != after_c:
        sys.exit("  refusing to write: div balance broken")
    from html.parser import HTMLParser
    HTMLParser().feed(out)

    if "--write" in sys.argv:
        PAGE.write_text(out)
        print("  written")
    else:
        # Count real blocks, not CSS declarations. out.count('io__expect') also matches the two
        # stylesheet rules and reported 6 for 4 blocks: a metric that overstates its own work.
        added = out.count('class="io__expect"')
        print(f"  dry run only. io blocks that would be added: {added} (PAIRS defines {len(PAIRS)})")
