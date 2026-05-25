"""
tests/test_output_filter.py — pins the flag-scrub behavior. Run on
hexclass:
    cd /opt/hexclass/orchestrator && .venv/bin/python tests/test_output_filter.py
"""
from __future__ import annotations

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from tools.output_filter import scrub_flags_from_output, FLAG_PATTERN  # noqa: E402


def run() -> int:
    fails: list[str] = []

    # Real-shaped flags must be scrubbed at student help levels
    REAL_LIKE = [
        "FLAG{abc_def_1234567890}",        # 20 chars inside
        "FLAG{a3f9_d51m_x07c_zz81}",       # 19 chars
        "Here's your answer: FLAG{hexworth_lab_py_01_flag_value_xkj9}",
        "FLAG{thisisalongerflagvalue}",    # 24 chars
        "FLAG{abc12345678}",               # 11 chars — just at the minimum real
    ]
    for r in REAL_LIKE:
        clean, scrubbed, matches = scrub_flags_from_output(r, help_level=2)
        if not scrubbed:
            fails.append(f"FALSE NEGATIVE (real-shaped not scrubbed at L2): {r!r}")
        elif "FLAG{" in clean:
            fails.append(f"SCRUB INCOMPLETE — replacement still contains flag: {clean!r}")
        else:
            print(f"  PASS  L2-scrub  {r[:60]}")

    # Teaching-example flags (under 10 chars inside) must pass through at L2
    TEACHING_EXAMPLES = [
        "Flags follow the FLAG{example} format.",          # 7 chars
        "An example flag looks like FLAG{xxxx}.",          # 4 chars
        "Example: FLAG{abc}.",                             # 3 chars
        "FLAG{your}",                                      # 4 chars
        "Look for a string in the format FLAG{secret}.",   # 6 chars
    ]
    for t in TEACHING_EXAMPLES:
        clean, scrubbed, _ = scrub_flags_from_output(t, help_level=2)
        if scrubbed:
            fails.append(f"FALSE POSITIVE (teaching example scrubbed at L2): {t!r}")
        else:
            print(f"  PASS  L2-pass   {t[:60]}")

    # At help_level=5 (instructor), even real-shaped flags pass through
    for r in REAL_LIKE:
        clean, scrubbed, _ = scrub_flags_from_output(r, help_level=5)
        if scrubbed:
            fails.append(f"L5 should not scrub: {r!r}")
        elif clean != r:
            fails.append(f"L5 mutated response: {r!r} -> {clean!r}")
        else:
            print(f"  PASS  L5-pass   {r[:60]}")

    # Edge cases
    edge_cases = [
        ("", 2, ""),
        (None, 2, ""),
        ("Just a normal answer with no flag", 2, "Just a normal answer with no flag"),
    ]
    for inp, hl, expected in edge_cases:
        clean, _, _ = scrub_flags_from_output(inp, help_level=hl)
        if clean != expected:
            fails.append(f"Edge case failed: scrub({inp!r}, hl={hl}) = {clean!r}, expected {expected!r}")
        else:
            print(f"  PASS  edge      ({inp!r}, hl={hl})")

    total = len(REAL_LIKE)*2 + len(TEACHING_EXAMPLES) + len(edge_cases)
    print()
    print(f"=== {total - len(fails)}/{total} pass, {len(fails)} fail ===")
    for f in fails:
        print(f"  {f}")
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(run())
