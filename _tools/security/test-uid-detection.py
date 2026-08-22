#!/usr/bin/env python3
"""Prove the UID check catches real identities and stays quiet on the noise around them.

WHY THIS EXISTS
    This check is shape-based, which is the technique scan-exposure.py's own docstring rejects
    for everything else. It is only defensible because it is anchored on CONTEXT, and that is a
    claim that has to be testable rather than asserted. Two sides, always:
      - a UID next to a uid-ish key MUST be caught (or the gate protects nothing)
      - the same 28-char token with no such context MUST NOT be (or the gate gets muted, and a
        muted gate protects nothing either)

    ⚠ Every token below is INVENTED. Never put a real identifier in a file that hunts for them --
    scan-exposure.py's own comment records the time it caught itself doing exactly that.

@catalog what    two-sided test for scan-exposure's student-UID detection
@catalog run     python3 _tools/security/test-uid-detection.py
@catalog status  TOOL
"""
import importlib.util
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location("scan_exposure", HERE / "scan-exposure.py")
se = importlib.util.module_from_spec(spec)
spec.loader.exec_module(se)

# Invented, but correctly shaped: 28 chars of [A-Za-z0-9], mixed case.
FAKE = "Qz7bWmT4hLpXcRvNdKsAe2YgUj9F"
FAKE2 = "Mn5tGwQxZrLbVpKdHaScE3YfUj8R"
assert len(FAKE) == 28 and len(FAKE2) == 28, "fixtures must be UID-shaped"

ok = True


def check(label, path, text, expect):
    global ok
    got = se._uid_hits(path, text)
    hit = len(got) > 0
    good = hit == expect
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} {label}"
          f"{'' if good else f'  -- expected hit={expect}, got {len(got)}'}")


print("=== MUST CATCH (a real identity is declared as one) ===")
check("json  \"uid\": \"<uid>\"",        "functions/x.js",  f'{{"uid": "{FAKE}"}}',            True)
check("json  \"userId\": \"<uid>\"",     "functions/x.js",  f'{{"userId": "{FAKE}"}}',         True)
check("snake user_id = <uid>",           "functions/x.js",  f'user_id = {FAKE}',               True)
check("js    ownerUid: '<uid>'",         "functions/x.js",  f"ownerUid: '{FAKE}'",             True)
check("arrow uid -> <uid>",              "_docs/x.md",      f'uid -> {FAKE}',                  True)
check("firestore dump \"<uid>\": {",     "_docs/x.json",    f'{{"{FAKE}": {{"a":1}}}}',        True)
check("two distinct uids in one file",   "functions/x.js",  f'uid:"{FAKE}" uid:"{FAKE2}"',     True)

print()
print("=== MUST NOT CATCH (this is the half that keeps the gate credible) ===")
check("bare token, NO uid context",      "functions/x.js",  f'const salt = "{FAKE}"',          False)
check("npm integrity-style base64",      "functions/x.js",
      '"integrity": "sha512-YXNkZmFzZGZhc2RmYXNkZmFzZGZhc2Rm+abcd/ef=="',                       False)
check("40-char hex digest near uid key", "functions/x.js",
      'uid: "da39a3ee5e6b4b0d3255bfef95601890afd80709"',                                        False)
check("lowercase-only 28 chars",         "functions/x.js",  'uid: "abcdefghijklmnopqrstuvwxyz12"', False)
check("binary content (NUL in head)",    "_app/img.png",    f'\x00\x01uid:"{FAKE}"',           False)
check("vendored coursework path",        "_planning/usb-import/z/a.json", f'{{"uid":"{FAKE}"}}', False)
check("package-lock.json",               "package-lock.json", f'{{"uid":"{FAKE}"}}',           False)
check("empty file",                      "functions/x.js",  '',                                 False)

print()
print("=== the REPORT must not leak the value it found ===")
m = se.__dict__["main"]  # mask() is nested in main(); re-implement its contract check here
masked_ok = True
# mask() lives inside main(); assert the module never prints a full token by checking the
# only path that formats findings uses a masking helper.
src = (HERE / "scan-exposure.py").read_text()
if "mask(x) for x in v" not in src:
    print("  FAIL findings are formatted without mask()")
    masked_ok = False
else:
    print("  ok   findings are formatted through mask()")
ok &= masked_ok

print()
print("PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
