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
    flag-shaped substrings (for audit logging — do NOT log to log
    aggregators that might end up student-visible).
    """
    if not response_text or help_level >= 5:
        return (response_text or "", False, [])
    matches = FLAG_PATTERN.findall(response_text)
    if not matches:
        return (response_text, False, [])
    return (CANNED_REFUSAL, True, matches)
