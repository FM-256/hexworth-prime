#!/usr/bin/env python3
"""Block personal identifiers and real node addresses from entering the PUBLIC repo.

WHY THIS EXISTS
    FM-256/hexworth-prime is PUBLIC (isPrivate:false, 1 fork, 4 stars). That was believed to be
    private on 2026-08-16, and the belief was load-bearing: an audit that day found the
    operator's personal email in 22 tracked files and served live from
    hexworth.com/components/FirebaseAuth.js, plus 3 of 6 real tailnet node addresses across 22
    files. An anonymous curl read all of it.

    One-time cleanup decays -- six weeks later something else gets committed. The AI-attribution
    hook has held for months precisely because it RUNS rather than relying on vigilance. This is
    the same shape for the same reason.

WHAT IT DOES *NOT* FLAG, deliberately
    The repo is a security-teaching platform, so it is FULL of credential-shaped strings that
    are supposed to be there: ~29k RFC1918 lab addresses, 70 sample SSH keys, 78 token-shaped
    CTF fixtures, 47 PRIVATE KEY headers in arena boxes. A scanner that flags those gets muted
    within a week and then protects nothing. This flags ONLY:
      - the operator's personal identifiers (read from a PRIVATE file, never hardcoded here)
      - tailnet addresses that match REAL nodes (cross-referenced, not pattern-matched)
    Everything else is teaching content and is none of this script's business.

    ⚠ The allowlist source lives OUTSIDE the repo on purpose. A scanner that hardcodes the
    secrets it is looking for publishes them on its first commit.

@catalog what    block personal identifiers / real node IPs from the public repo
@catalog run     python3 _tools/security/scan-exposure.py [--staged]
@catalog status  GATE
"""

from __future__ import annotations

import argparse
import os
import pathlib
import re
import subprocess
import sys

PRIVATE_DIR = pathlib.Path(os.path.expanduser("~/hexworth-infra-private"))

# Paths whose whole PURPOSE is to be a fidelity record or a coupled fixture. Redacting a backup
# destroys the thing it exists to preserve, so these are reported separately, never auto-failed.
EXEMPT = (
    "_tools/deploy/rules-backups/",
)

# Files that ALREADY carried an identifier when the gate was written. The gate blocks NEW
# introductions while this is worked down -- a gate that fires on 26 pre-existing files gets
# muted within a week and then protects nothing.
BASELINE_FILE = pathlib.Path(__file__).with_name("exposure-baseline.txt")


def baseline() -> set[str]:
    if not BASELINE_FILE.exists():
        return set()
    return {ln.strip() for ln in BASELINE_FILE.read_text().splitlines()
            if ln.strip() and not ln.startswith("#")}


def private_needles() -> tuple[set[str], set[str]]:
    """Read what to look for from OUTSIDE the repo. Returns (emails, node_ips)."""
    if not PRIVATE_DIR.is_dir():
        return set(), set()
    blob = ""
    for p in PRIVATE_DIR.rglob("*"):
        if p.is_file():
            try:
                blob += p.read_text(errors="ignore")
            except OSError:
                continue
    emails = set(re.findall(r"[A-Za-z0-9._%+-]+@(?:gmail|outlook|yahoo|proton(?:mail)?)\.[a-z]+",
                            blob, re.I))
    # 100.64.0.0/10 is the CGNAT range tailnets use. Only addresses ACTUALLY recorded as ours.
    ips = {ip for ip in re.findall(r"\b100\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", blob)}
    return {e.lower() for e in emails}, ips


def scan(paths: list[str], emails: set[str], ips: set[str],
         known: set[str] | None = None) -> tuple[list, list]:
    """Split matches into NEW (hard-fail) and already-known/exempt (report-only).

    `known` is the baseline backlog. A file in it still gets reported -- silence would let the
    backlog rot invisibly -- but it does not fail the gate, so only regressions block.
    """
    known = known or set()
    hard, exempt = [], []
    for f in paths:
        try:
            txt = pathlib.Path(f).read_text(errors="ignore")
        except (OSError, IsADirectoryError):
            continue
        low = txt.lower()
        found = [e for e in emails if e in low]
        # Match the bare local-part too: a byline like "Owner: operator (<local-part>)" carries
        # the same identity as the full address, and a redaction pass keyed on the '@' form
        # walks straight past it -- which is exactly what happened on 2026-08-16.
        # ⚠ NEVER write a real identifier into this file as an example. A scanner that hardcodes
        # what it hunts publishes it on first commit; this comment previously did that, and the
        # gate caught itself.
        found += [e.split("@")[0] for e in emails
                  if e.split("@")[0] not in [x.split("@")[0] for x in found]
                  and e.split("@")[0] in low]
        found += [ip for ip in ips if ip in txt]
        if found:
            already = f.startswith(EXEMPT) or f in known
            (exempt if already else hard).append((f, sorted(set(found))))
    return hard, exempt


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--staged", action="store_true",
                    help="scan only files staged for commit (pre-commit use)")
    args = ap.parse_args()

    emails, ips = private_needles()
    if not emails and not ips:
        # Fail LOUD, not open. A scanner that silently passes because it could not load its
        # allowlist is worse than no scanner: it reports green while checking nothing.
        print("✗ scan-exposure: no allowlist found at ~/hexworth-infra-private — CANNOT VERIFY")
        return 2

    if args.staged:
        out = subprocess.run(["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
                             capture_output=True, text=True).stdout
    else:
        out = subprocess.run(["git", "ls-files"], capture_output=True, text=True).stdout
    paths = [p for p in out.splitlines() if p.strip()]

    known = baseline()
    hard, exempt = scan(paths, emails, ips, known=known)

    def mask(v: str) -> str:
        """Never print a full identifier. The REPORT must not become the leak."""
        if "@" in v:
            return v[:2] + "***@" + v.split("@")[1]
        if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", v):
            return re.sub(r"\.\d{1,3}\.\d{1,3}$", ".x.x", v)
        # bare local-part: masked too. It printed in full on first run, which would have piped a
        # real identifier into CI logs and terminal scrollback.
        return v[:2] + "***"

    if exempt:
        # Printed IN FULL, never truncated. Truncating the backlog is how a backlog rots: the
        # count stays reassuringly small on screen while the real number grows underneath.
        print(f"  {len(exempt)} known file(s) still carry an identifier (baseline/backups) — "
              f"reported, not failing. THIS LIST SHOULD ONLY SHRINK:")
        for f, v in exempt:
            print(f"      {f}  [{', '.join(mask(x) for x in v)}]")
    if hard:
        print(f"✗ scan-exposure: {len(hard)} file(s) carry a personal identifier or real node "
              f"address, and this repo is PUBLIC:")
        for f, v in hard:
            print(f"      {f}  [{', '.join(mask(x) for x in v)}]")
        print("  Values are masked here on purpose. Put the real one in hexworth-infra-private")
        print("  and reference it, or migrate the identity -- see operator-identity.md.")
        return 1

    print(f"✓ scan-exposure: {len(paths)} tracked file(s) clean "
          f"({len(emails)} identifier(s), {len(ips)} node address(es) checked)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
