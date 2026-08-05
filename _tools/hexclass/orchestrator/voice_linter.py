"""
voice_linter.py — Pre-send response validation for Dr. Hex.

Implements the BLOCK-tier and WARN-tier checks from
_docs/operations/dr-hex-production-stability.md §2.

Pure module. No FastAPI, no Firestore, no model calls. Imported by the
orchestrator and run on every outbound Dr. Hex response BEFORE the
response reaches the student.

Two modes of operation per check:
  BLOCK    → caller should regenerate the response (the linter detected
             a rule violation that would harm the student or violate
             constitution.md MUST NOT rules)
  WARN     → caller should emit telemetry to dr_hex_quality_observations
             and continue (the linter detected stylistic drift)

Typical call:
    result = lint_response(
        text=model_output,
        session_state=session_state,
        lab_skill_map=skill_map_or_none,
    )
    if result.blocking_violations:
        # regenerate; pass result.regeneration_hint into the prompt
        ...
    for warning in result.warnings:
        # emit to dr_hex_quality_observations
        ...
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from typing import Optional


# Zero-false-positive-risk BLOCK codes promoted to enforce-mode. If any
# of these fires on a Dr. Hex response, the orchestrator replaces the
# response with VOICE_LINTER_REFUSAL rather than serving the offending
# content. The other BLOCK codes (help_level_present, no_fake_casual)
# stay in observe-only mode until their FP rate is characterized in
# production.
ENFORCE_BLOCK_CODES = frozenset({
    "no_emoji",
    "no_flag_value",
    "no_walkthrough_paste",
    "no_forbidden_disclosure",
    "no_lived_experience",
})

# Canned refusal returned when an enforce-mode BLOCK fires.
# Matches the LOCKOUT_REFUSAL / JAILBREAK_REFUSAL idiom — calm, terse,
# Constitution-aligned. Does not name the specific violation (avoids
# teaching the attack).
VOICE_LINTER_REFUSAL = (
    "Something in my response didn't pass my own check. Try rephrasing "
    "the question, or work through the lab step-by-step and ask me about "
    "the specific output you're seeing."
)


# ─── public types ────────────────────────────────────────────────────────


@dataclass
class LintViolation:
    """A single rule violation detected in a Dr. Hex response."""
    code: str               # e.g. "no_emoji"
    severity: str           # "BLOCK" or "WARN"
    message: str            # human-readable description
    excerpt: str = ""       # short excerpt of offending content (≤120 chars)


@dataclass
class LintResult:
    """Aggregate result of linting one response."""
    violations: list[LintViolation] = field(default_factory=list)

    @property
    def blocking_violations(self) -> list[LintViolation]:
        return [v for v in self.violations if v.severity == "BLOCK"]

    @property
    def warnings(self) -> list[LintViolation]:
        return [v for v in self.violations if v.severity == "WARN"]

    @property
    def blocked(self) -> bool:
        return any(v.severity == "BLOCK" for v in self.violations)

    @property
    def regeneration_hint(self) -> str:
        """Concise hint to inject into the regeneration prompt."""
        if not self.blocking_violations:
            return ""
        bullets = "\n".join(f"- {v.code}: {v.message}" for v in self.blocking_violations)
        return f"Previous response was rejected by voice linter:\n{bullets}\nRegenerate within Dr. Hex constitution rules."


@dataclass
class SessionState:
    """Session-level state the linter needs to make frequency-based decisions."""
    humility_disclaimer_count: int = 0   # times "I'm a model"/"verify what I say" appeared
    curiosity_marker_count: int = 0      # times "huh"/"interesting" appeared
    response_count: int = 0              # total Dr. Hex responses this session
    intervention_count: int = 0          # responses classified as "mentoring" not idle/refusal


@dataclass
class LabSkillMap:
    """The subset of Lab Skill Map data the linter needs."""
    lab_id: str
    flag_values: list[str] = field(default_factory=list)
    walkthrough_text: str = ""
    forbidden_disclosures: list[str] = field(default_factory=list)
    allowed_help_levels: list[int] = field(default_factory=lambda: [0, 1, 2, 3, 4, 5])


# ─── compiled patterns (module-level for perf) ───────────────────────────


# Emoji detection: cover the main Unicode emoji blocks. Not perfect but
# catches the common cases (😀 family, 🤖, 🎉, 🔥, etc.). Variation
# selectors and ZWJ are also blocked because they only appear in emoji
# sequences in our context.
_EMOJI_RANGES = [
    (0x1F600, 0x1F64F),   # Emoticons
    (0x1F300, 0x1F5FF),   # Misc Symbols & Pictographs
    (0x1F680, 0x1F6FF),   # Transport & Map
    (0x1F700, 0x1F77F),   # Alchemical
    (0x1F780, 0x1F7FF),   # Geometric Shapes Extended
    (0x1F800, 0x1F8FF),   # Supplemental Arrows-C
    (0x1F900, 0x1F9FF),   # Supplemental Symbols & Pictographs
    (0x1FA00, 0x1FA6F),   # Chess
    (0x1FA70, 0x1FAFF),   # Symbols & Pictographs Extended-A
    (0x2600, 0x26FF),     # Misc Symbols (☀ ★ ☎ etc.)
    (0x2700, 0x27BF),     # Dingbats (✂ ✈ ✓ etc.)
    (0x2300, 0x23FF),     # Misc Technical (some emoji here)
    (0x25A0, 0x25FF),     # Geometric Shapes (some emoji)
    (0x2B00, 0x2BFF),     # Misc Symbols and Arrows (⭐ ⬆ ⬇ etc.)
]


def _is_emoji_char(ch: str) -> bool:
    cp = ord(ch)
    for lo, hi in _EMOJI_RANGES:
        if lo <= cp <= hi:
            return True
    return False


# Fake-casual / manufactured-roughness markers. Targets actual chat-slang
# patterns we don't want Dr. Hex producing.
_FAKE_CASUAL_PATTERNS = [
    (re.compile(r"\blol\b", re.IGNORECASE), "lol"),
    (re.compile(r"\bidk\b", re.IGNORECASE), "idk"),
    (re.compile(r"\btbh\b", re.IGNORECASE), "tbh"),
    (re.compile(r"\bimho\b", re.IGNORECASE), "imho"),
    (re.compile(r"\bngl\b", re.IGNORECASE), "ngl"),
    (re.compile(r"\bn00b\b", re.IGNORECASE), "n00b"),
    (re.compile(r"\bha+\b", re.IGNORECASE), "haha"),
    # Three-dot trailing hesitation: ". . ." or "..." at end of sentence
    (re.compile(r"\.\.\.\s*[a-z]"), "hesitation ellipsis"),
    (re.compile(r"\bso like\b", re.IGNORECASE), "so like"),
    (re.compile(r"\bsorta\b", re.IGNORECASE), "sorta"),
    (re.compile(r"\bkinda\b", re.IGNORECASE), "kinda"),
    (re.compile(r"\bgonna\b", re.IGNORECASE), "gonna"),
    (re.compile(r"\bwanna\b", re.IGNORECASE), "wanna"),
]


# Personal-praise phrases — point at the student, not the work.
_PERSONAL_PRAISE_PATTERNS = [
    re.compile(r"\bgreat question\b", re.IGNORECASE),
    re.compile(r"\bgood (job|work)\b", re.IGNORECASE),
    re.compile(r"\bwell done\b", re.IGNORECASE),
    re.compile(r"\byou'?re (so |such )?(smart|amazing|brilliant|awesome|clever)\b", re.IGNORECASE),
    re.compile(r"\byou'?re doing (great|amazing|awesome|fantastic)\b", re.IGNORECASE),
    re.compile(r"\blove (that|how) you\b", re.IGNORECASE),
    re.compile(r"\bi'?m (so )?proud of you\b", re.IGNORECASE),
    re.compile(r"\bnice job\b", re.IGNORECASE),
    re.compile(r"\bexcellent job\b", re.IGNORECASE),
    re.compile(r"\bbeautiful (work|reasoning)\b", re.IGNORECASE),
]


# Hedging markers — used for density count, not block.
_HEDGING_PATTERNS = [
    re.compile(r"\bmight\b", re.IGNORECASE),
    re.compile(r"\bperhaps\b", re.IGNORECASE),
    re.compile(r"\bpossibly\b", re.IGNORECASE),
    re.compile(r"\bi (think|believe)\b", re.IGNORECASE),
    re.compile(r"\bcould be\b", re.IGNORECASE),
    re.compile(r"\bmay be\b", re.IGNORECASE),
    re.compile(r"\bnot entirely sure\b", re.IGNORECASE),
    re.compile(r"\bsort of\b", re.IGNORECASE),
    re.compile(r"\bkind of\b", re.IGNORECASE),
]


# Humility-disclaimer markers — session-frequency-limited.
_HUMILITY_PATTERNS = [
    re.compile(r"\bi(?:'|')?m (just )?(a |an )?(language )?model\b", re.IGNORECASE),
    re.compile(r"\bverify what i say\b", re.IGNORECASE),
    re.compile(r"\bi can be wrong\b", re.IGNORECASE),
    re.compile(r"\btreat what i say\b", re.IGNORECASE),
]


# Lived-experience / autobiographical-framing markers. Constitution §16.1
# forbids Dr. Hex from claiming personal history. Pattern observations
# about labs ("students often miss") are allowed; first-person memory or
# biography is not.
# Codex 2026-05-25 "operational mythology slippery slope" prompted this check.
_LIVED_EXPERIENCE_PATTERNS = [
    re.compile(r"\bi remember (when |learning |seeing )", re.IGNORECASE),
    re.compile(r"\bi used to (find|think|believe|do|run)", re.IGNORECASE),
    re.compile(r"\bback when i\b", re.IGNORECASE),
    re.compile(r"\bwhen i was (learning|young|in school|studying)", re.IGNORECASE),
    re.compile(r"\bi'?ve been (doing|working|practicing) (this|that|with)", re.IGNORECASE),
    re.compile(r"\bin my experience\b", re.IGNORECASE),
    re.compile(r"\bi'?ve seen this (myself|firsthand|in person|so many times)", re.IGNORECASE),
    re.compile(r"\bmy favorite (lab|part|memory|exercise)\b", re.IGNORECASE),
    re.compile(r"\bi (felt|loved|hated|enjoyed) (this|that|those)", re.IGNORECASE),
    re.compile(r"\bi (was|am) (excited|nervous|proud|happy|scared)", re.IGNORECASE),
]


# Curiosity markers — session-frequency-limited (Constitution §12 guardrail).
_CURIOSITY_PATTERNS = [
    re.compile(r"\bhuh\b\.?", re.IGNORECASE),
    re.compile(r"\binteresting\b", re.IGNORECASE),
    re.compile(r"\bthat'?s odd\b", re.IGNORECASE),
    re.compile(r"\bshouldn'?t have happened\b", re.IGNORECASE),
    re.compile(r"\bnow i want to know\b", re.IGNORECASE),
]


# Help Level phrases — counts as "level announced".
_HELP_LEVEL_PATTERNS = [
    re.compile(r"\blevel [0-5]\b", re.IGNORECASE),
    re.compile(r"\bi'?ll give (you )?direction\b", re.IGNORECASE),
    re.compile(r"\bi can point you (at|toward)\b", re.IGNORECASE),
    re.compile(r"\bi'?m stepping in more directly\b", re.IGNORECASE),
    re.compile(r"\bi (won'?t|will not) help with (that|this)\b", re.IGNORECASE),
    re.compile(r"\bi'?d rather hand you the walkthrough\b", re.IGNORECASE),
    re.compile(r"\byou'?re close enough that i can be more specific\b", re.IGNORECASE),
    re.compile(r"\bnot this one\b", re.IGNORECASE),
]


# Idle/refusal/non-mentoring response markers — these responses are
# allowed to not announce a Help Level.
_NON_MENTORING_PATTERNS = [
    re.compile(r"^\s*(yes|no|right|correct|exactly|confirmed)\.?\s*$", re.IGNORECASE),
    re.compile(r"\bwhat do you want to think through\b", re.IGNORECASE),
    re.compile(r"\bwhere did you stop making progress\b", re.IGNORECASE),
    re.compile(r"\bi (don'?t|do not) have good context\b", re.IGNORECASE),
    re.compile(r"\bsomething'?s degraded on my side\b", re.IGNORECASE),
]


# ─── sentence / word counting ────────────────────────────────────────────


_WORD_RE = re.compile(r"\b[\w']+\b")
_SENTENCE_RE = re.compile(r"[.!?]+(?:\s|$)")


def _count_words(text: str) -> int:
    return len(_WORD_RE.findall(text))


def _count_sentences(text: str) -> int:
    # Trim whitespace, count terminators that end a sentence
    return max(1, len(_SENTENCE_RE.findall(text.strip())))


# ─── BLOCK-tier checks ───────────────────────────────────────────────────


def check_no_emoji(text: str) -> Optional[LintViolation]:
    for ch in text:
        if _is_emoji_char(ch):
            return LintViolation(
                code="no_emoji",
                severity="BLOCK",
                message=f"Response contains emoji character U+{ord(ch):04X}",
                excerpt=ch,
            )
    return None


def check_no_flag_value(text: str, skill_map: Optional[LabSkillMap]) -> Optional[LintViolation]:
    if not skill_map or not skill_map.flag_values:
        return None
    norm = text.lower()
    for flag in skill_map.flag_values:
        if flag and len(flag) >= 4 and flag.lower() in norm:
            return LintViolation(
                code="no_flag_value",
                severity="BLOCK",
                message=f"Response contains the lab's flag value (length={len(flag)})",
                excerpt=flag[:120],
            )
    return None


def check_no_walkthrough_paste(text: str, skill_map: Optional[LabSkillMap], min_run: int = 80) -> Optional[LintViolation]:
    """Detect a verbatim run of `min_run` chars from the walkthrough."""
    if not skill_map or not skill_map.walkthrough_text:
        return None
    wt = skill_map.walkthrough_text
    if len(wt) < min_run:
        return None
    # Walk the walkthrough in min_run-char windows; check for verbatim substring.
    for i in range(0, len(wt) - min_run + 1, max(1, min_run // 4)):
        window = wt[i:i + min_run]
        if window in text:
            return LintViolation(
                code="no_walkthrough_paste",
                severity="BLOCK",
                message=f"Response contains a {min_run}-char verbatim run from the walkthrough",
                excerpt=window[:120],
            )
    return None


def check_no_forbidden_disclosure(text: str, skill_map: Optional[LabSkillMap]) -> Optional[LintViolation]:
    if not skill_map:
        return None
    norm = text.lower()
    for forbidden in skill_map.forbidden_disclosures:
        f = forbidden.strip()
        if not f:
            continue

        # Opt-in regex entries, marked with a leading `re:`.
        #
        # Plain substring matching cannot express "a decision verb near TH-2,
        # in either order". Adversarial testing of the cold-horizon map found
        # that ordinary word reordering walked straight through an enumerated
        # list on the first attempt: "go with TH-2" defeats "trust TH-2", and
        # "TH-3 and TH-1 share" defeats "TH-1 and TH-3 share". An LLM has no
        # reason to prefer the author's word order, so enumerating phrasings is
        # a losing game for anything but a literal secret.
        #
        # Backward compatible on purpose: every existing Skill Map uses plain
        # strings and is untouched. Patterns are compiled at LOAD time by
        # skill_map_loader, so an invalid pattern fails validation loudly rather
        # than silently never matching — a check that reports clean because it
        # could not run is worse than no check.
        if f.lower().startswith("re:"):
            pattern = f[3:].strip()
            if not pattern:
                continue
            try:
                if re.search(pattern, norm, re.IGNORECASE):
                    return LintViolation(
                        code="no_forbidden_disclosure",
                        severity="BLOCK",
                        message=f"Response matches forbidden disclosure pattern from Lab Skill Map: '{pattern[:60]}'",
                        excerpt=pattern[:120],
                    )
            except re.error:
                # Unreachable in practice: skill_map_loader compiles every `re:`
                # entry at load time and rejects the map if it fails.
                #
                # Be honest about what this branch does — it is FAIL-OPEN for
                # this entry, not fail-closed. `continue` skips the check, so a
                # response that the pattern would have blocked is allowed
                # through. An earlier comment here claimed "fail CLOSED", which
                # was wrong and is exactly the kind of label that makes a
                # reviewer stop looking. Kept permissive deliberately: crashing
                # the lint pass would drop every OTHER check on the reply too,
                # which is a worse failure. The real defence is the loader.
                continue
            continue

        if len(f) >= 4 and f.lower() in norm:
            return LintViolation(
                code="no_forbidden_disclosure",
                severity="BLOCK",
                message=f"Response contains forbidden disclosure from Lab Skill Map: '{f[:60]}'",
                excerpt=f[:120],
            )
    return None


def check_help_level_present(text: str) -> Optional[LintViolation]:
    """If the response looks like mentoring intervention (not idle/refusal),
    it must announce a Help Level or use a recognized stance phrase."""
    # If response is short (<25 words), don't require a level — likely a
    # quick redirect or yes/no.
    if _count_words(text) < 25:
        return None
    # If response matches a non-mentoring pattern, exempt.
    for pat in _NON_MENTORING_PATTERNS:
        if pat.search(text):
            return None
    # Look for a Help Level marker.
    for pat in _HELP_LEVEL_PATTERNS:
        if pat.search(text):
            return None
    return LintViolation(
        code="help_level_present",
        severity="BLOCK",
        message="Mentoring-length response (≥25 words) lacks Help Level announcement",
        excerpt=text[:120],
    )


def check_no_fake_casual(text: str) -> Optional[LintViolation]:
    for pat, label in _FAKE_CASUAL_PATTERNS:
        m = pat.search(text)
        if m:
            return LintViolation(
                code="no_fake_casual",
                severity="BLOCK",
                message=f"Response contains fake-casual marker: '{label}'",
                excerpt=m.group(0)[:120],
            )
    return None


def check_no_lived_experience(text: str) -> Optional[LintViolation]:
    """Block first-person autobiographical/lived-experience claims.

    Pattern observations about labs ("students often miss the SUID bit")
    are allowed by Constitution §16.1. First-person history claims are
    NOT. This check blocks the latter.
    """
    for pat in _LIVED_EXPERIENCE_PATTERNS:
        m = pat.search(text)
        if m:
            return LintViolation(
                code="no_lived_experience",
                severity="BLOCK",
                message=f"Response contains autobiographical / lived-experience framing: '{m.group(0)}'",
                excerpt=m.group(0)[:120],
            )
    return None


# ─── WARN-tier checks ────────────────────────────────────────────────────


def check_response_word_count(text: str, threshold: int = 175) -> Optional[LintViolation]:
    n = _count_words(text)
    if n > threshold:
        return LintViolation(
            code="response_word_count",
            severity="WARN",
            message=f"Response is {n} words (threshold {threshold})",
        )
    return None


def check_sentence_count(text: str, threshold: int = 8) -> Optional[LintViolation]:
    n = _count_sentences(text)
    if n > threshold:
        return LintViolation(
            code="sentence_count",
            severity="WARN",
            message=f"Response has {n} sentences (threshold {threshold})",
        )
    return None


def check_personal_praise(text: str) -> Optional[LintViolation]:
    matches = []
    for pat in _PERSONAL_PRAISE_PATTERNS:
        m = pat.search(text)
        if m:
            matches.append(m.group(0))
    if matches:
        return LintViolation(
            code="forbidden_phrase_hit",
            severity="WARN",
            message=f"Personal-praise phrase(s) detected: {matches}",
            excerpt="; ".join(matches)[:120],
        )
    return None


def check_hedging_density(text: str, threshold: int = 3) -> Optional[LintViolation]:
    count = 0
    for pat in _HEDGING_PATTERNS:
        count += len(pat.findall(text))
    if count > threshold:
        return LintViolation(
            code="hedging_density",
            severity="WARN",
            message=f"{count} hedging markers in one response (threshold {threshold})",
        )
    return None


def check_humility_frequency(text: str, session: SessionState) -> tuple[Optional[LintViolation], int]:
    """Returns (violation_or_none, new_disclaimer_count_for_this_response)."""
    this_response = 0
    for pat in _HUMILITY_PATTERNS:
        if pat.search(text):
            this_response += 1
            break  # one count per response, even if multiple markers
    new_total = session.humility_disclaimer_count + this_response
    if new_total > 1:
        return (
            LintViolation(
                code="humility_disclaimer_frequency",
                severity="WARN",
                message=f"Session now at {new_total} model-humility disclaimers (target: ≤1/session + context triggers)",
            ),
            this_response,
        )
    return (None, this_response)


def check_curiosity_frequency(text: str, session: SessionState) -> tuple[Optional[LintViolation], int]:
    """Returns (violation_or_none, new_curiosity_count_for_this_response)."""
    this_response = 0
    for pat in _CURIOSITY_PATTERNS:
        if pat.search(text):
            this_response += 1
            break
    new_total = session.curiosity_marker_count + this_response
    # >20% of responses should not contain curiosity markers
    if session.response_count >= 5:
        ratio = new_total / max(1, session.response_count + 1)
        if ratio > 0.2:
            return (
                LintViolation(
                    code="curiosity_marker_frequency",
                    severity="WARN",
                    message=f"Curiosity-marker ratio is {ratio:.0%} of responses (target: ≤20%)",
                ),
                this_response,
            )
    return (None, this_response)


# ─── orchestrator entry point ────────────────────────────────────────────


def lint_response(
    text: str,
    session_state: Optional[SessionState] = None,
    lab_skill_map: Optional[LabSkillMap] = None,
) -> LintResult:
    """Run all checks. Returns the aggregate LintResult.

    The caller is responsible for:
      - Regenerating when `result.blocked` is True
      - Emitting `result.warnings` to telemetry
      - Updating `session_state` based on the returned per-response counts
        (the linter MAY mutate session_state for frequency-tracking
        checks; see implementation note below)

    Implementation note: humility/curiosity frequency checks need
    session_state to decide. The linter does NOT mutate session_state;
    the caller should do that explicitly using the returned increments.
    """
    if session_state is None:
        session_state = SessionState()

    result = LintResult()

    # BLOCK-tier
    for chk in (
        check_no_emoji(text),
        check_no_flag_value(text, lab_skill_map),
        check_no_walkthrough_paste(text, lab_skill_map),
        check_no_forbidden_disclosure(text, lab_skill_map),
        check_no_fake_casual(text),
        check_no_lived_experience(text),
        check_help_level_present(text),
    ):
        if chk:
            result.violations.append(chk)

    # WARN-tier
    for chk in (
        check_response_word_count(text),
        check_sentence_count(text),
        check_personal_praise(text),
        check_hedging_density(text),
    ):
        if chk:
            result.violations.append(chk)

    hum_v, _hum_inc = check_humility_frequency(text, session_state)
    if hum_v:
        result.violations.append(hum_v)

    cur_v, _cur_inc = check_curiosity_frequency(text, session_state)
    if cur_v:
        result.violations.append(cur_v)

    return result


def update_session_state(
    session_state: SessionState,
    text: str,
    was_intervention: bool,
) -> None:
    """Caller-invoked update of session counters after a response is sent.

    The linter doesn't mutate state itself (keeps the lint function pure).
    This helper centralizes the counter logic.
    """
    session_state.response_count += 1
    if was_intervention:
        session_state.intervention_count += 1
    if any(p.search(text) for p in _HUMILITY_PATTERNS):
        session_state.humility_disclaimer_count += 1
    if any(p.search(text) for p in _CURIOSITY_PATTERNS):
        session_state.curiosity_marker_count += 1
