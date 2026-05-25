"""
output_filter.py — scrub flag-shaped strings from model responses before
they reach a student.

Last-line defense (Nancy review 2026-05-25): everything else can fail —
the system prompt could be ignored, a jailbreak could land, RAG could
return a chunk with a flag, hallucination could invent one — but this
filter looks at the FINAL output text and refuses to ship flag-shaped
content to students.

What we scrub
-------------
Pattern: `FLAG\\{[^}]{10,}\\}`

Threshold of 10 comes from the actual flag_registry distribution:
  Total flags scanned: 910
  In FLAG{...} format: 116
  Inner-content length: min=11, p5=13, median=44, p95=58, max=59

So 10 char minimum is one less than the smallest real flag, blocking
all real flags while letting short teaching examples ("FLAG{example}",
"FLAG{xxxx}") through. The model can still reference the FORMAT without
emitting a real value.

What we don't scrub (known gaps)
---------------------------------
- Bare-string flags (794 of 910 flags in flag_registry are NOT in
  FLAG{...} format — they're arbitrary alphanumeric values). These
  can't be regex-blocked without false-positive collisions with normal
  English. Defer to model-side defenses.
- Multi-character spread-out flags ("F L A G { ... }"). Future
  defense — character-stripping pre-scan.

Help-level gate
---------------
Scrubbing only applies at help_level <= 4 (students + most ladder
positions). At help_level == 5 (instructor mode), responses pass
through unmodified. This is a deliberate trust delegation — if a
malicious user obtains an instructor token, the scrub is gone. The
threat model assumes the auth layer is sound.
"""
from __future__ import annotations

import re

FLAG_PATTERN = re.compile(r"FLAG\{[^}]{10,}\}", re.IGNORECASE)

# Bare-string flag patterns (cyber-tier 2026-05-25):
# 794 of 910 flags in flag_registry are NOT in FLAG{...} format —
# they're raw alphanumeric values. Catching these by regex without
# false-positive on normal English is hard. We use shape heuristics:
#  - HEX_ / HEXWORTH_ / CTF_ prefix + 8+ alphanumeric
#  - Long random-looking strings: 16+ chars with mixed case + digit
#    AND no English word at length >= 5
#
# This list grows as new flag schemas are added. False positives are
# preferable to leaks at this layer — the canned refusal is graceful.
_BARE_FLAG_PATTERNS = [
    # Common CTF flag prefixes
    re.compile(r"\b(?:HEX|HEXWORTH|CTF|FLAG|HW)[_\-]\w{8,}\b"),
    # Long mixed-case+digit string without English (heuristic)
    # Match 20+ chars, must contain digit, must contain letter,
    # cannot contain space (a flag wouldn't have spaces)
    re.compile(r"\b(?=\w*\d)(?=\w*[A-Za-z])[A-Za-z0-9_\-]{20,}\b"),
]

CANNED_REFUSAL = (
    "I noticed my response was about to share a flag value directly — "
    "I can't do that, even by accident. Run the lab and the flag will "
    "appear when you complete the objective. If you're stuck, ask me a "
    "guiding question about the technique instead."
)


def scrub_flags_from_output(
    response_text: str,
    *,
    help_level: int,
) -> tuple[str, bool, list[str]]:
    """
    Returns (clean_text, was_scrubbed, matched_substrings).

    If `help_level >= 5` or no match: passthrough.
    Otherwise: returns the canned refusal and the list of matched
    flag-shaped substrings.

    Two-layer detection (cyber-tier 2026-05-25):
     1. Braced FLAG{...} format with 10+ chars inside (real-flag minimum)
     2. Bare-string patterns (HEX_xxxx, HEXWORTH_xxxx, 20+ char mixed
        alphanumeric strings with both digits and letters)

    False positives on (2) are accepted as graceful degradation —
    the canned refusal is benign to a legitimate student.
    """
    if not response_text or help_level >= 5:
        return (response_text or "", False, [])
    matches: list[str] = []
    matches.extend(FLAG_PATTERN.findall(response_text))
    for pat in _BARE_FLAG_PATTERNS:
        matches.extend(pat.findall(response_text))
    if not matches:
        return (response_text, False, [])
    return (CANNED_REFUSAL, True, matches)
