"""
drift_detector.py, AI-27 voice-drift detector for Dr. Hex.

Implements the post-session sampler described in
_docs/operations/dr-hex-production-stability.md §4. Reuses pattern
constants from voice_linter.py so the two modules stay in sync.

7 metrics tracked per response, then aggregated across a session:

  1. response_word_count
  2. response_sentence_count
  3. praise_density        praise-phrase hits per 100 words
  4. hedging_density       hedging-marker hits per 100 words
  5. help_level_absent     1 if mentoring-length response has no help-level announcement, else 0
  6. rhetorical_balancing  "on one hand", "on the other hand", "both X and Y" markers per 100 words
  7. emotional_language    therapist-style empathy markers per 100 words

Aggregation: simple averages over the per-response samples in the
session window (default 5 recent responses). A drift_score is the
weighted sum of metric breaches; thresholds and weights match the
prod-stability doc's calibration intent (tuned conservative; intent is
"trip when 2+ metrics breach simultaneously").

Pure module. No Firestore, no asyncio. Imported by main.py which feeds
samples in as Dr. Hex emits responses. When drift_score exceeds
DRIFT_EMIT_THRESHOLD, main.py forwards a drhex-q-persona-drift
observation via tools.quality_log (the AI-26 bridge).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional


# Reuse voice_linter pattern constants where possible. Imported lazily
# inside the helpers so this module loads even if voice_linter isn't
# importable (e.g. for unit tests). For new patterns specific to drift
# (rhetorical balancing, emotional language) we define them here.

# Rhetorical-balancing markers, Constitution anti-pattern "Wall of Text" /
# essay-AI prose drift.
_RHETORICAL_BALANCING_PATTERNS = [
    re.compile(r"\bon (the )?one hand\b", re.IGNORECASE),
    re.compile(r"\bon the other hand\b", re.IGNORECASE),
    re.compile(r"\bboth\s+\w+\s+and\s+\w+\b", re.IGNORECASE),
    re.compile(r"\bthat said\b", re.IGNORECASE),
    re.compile(r"\bhowever,?\s+(it'?s|there'?s|the)\b", re.IGNORECASE),
    re.compile(r"\bin other words,?\s", re.IGNORECASE),
    re.compile(r"\bthat being said,?\s", re.IGNORECASE),
]

# Emotional-language / therapist-style markers, Constitution anti-pattern
# "Therapist" drift.
_EMOTIONAL_LANGUAGE_PATTERNS = [
    re.compile(r"\bi hear you\b", re.IGNORECASE),
    re.compile(r"\byour (feelings?|frustrations?) (are|is) (valid|understandable)\b", re.IGNORECASE),
    re.compile(r"\bthat must (be|feel) (frustrating|hard|tough|disappointing)\b", re.IGNORECASE),
    re.compile(r"\bit'?s okay to (feel|be) (frustrated|stuck|lost|confused)\b", re.IGNORECASE),
    re.compile(r"\btake a (deep )?breath\b", re.IGNORECASE),
    re.compile(r"\bremember to be kind to yourself\b", re.IGNORECASE),
    re.compile(r"\byou'?re doing (great|amazing|wonderfully|so well)\b", re.IGNORECASE),
]

# Praise-phrase markers (drift toward sycophancy). Overlaps with
# voice_linter's BLOCK check but the drift metric is DENSITY not
# presence: a single praise hit per response is acceptable, frequent
# praise across many responses is drift.
_PRAISE_DENSITY_PATTERNS = [
    re.compile(r"\bgreat question\b", re.IGNORECASE),
    re.compile(r"\b(amazing|excellent|fantastic|wonderful) (work|job|reasoning|thinking|insight)\b", re.IGNORECASE),
    re.compile(r"\byou'?re (so |really |very )?(close|smart|clever|sharp)\b", re.IGNORECASE),
    re.compile(r"\bgood (catch|eye|instinct)\b", re.IGNORECASE),
]


@dataclass
class ResponseMetrics:
    """Per-response signal extraction. Pure function output of
    score_response(). Feeds the session aggregator."""
    word_count: int = 0
    sentence_count: int = 0
    praise_hits: int = 0
    hedging_hits: int = 0
    rhetorical_balancing_hits: int = 0
    emotional_hits: int = 0
    help_level_absent: int = 0  # 0 or 1
    is_mentoring_length: bool = False  # True if eligible for help_level check


@dataclass
class SessionDriftScore:
    """Aggregation of metrics over a session window. Output of
    session_drift_score()."""
    n_responses: int = 0
    avg_word_count: float = 0.0
    avg_sentence_count: float = 0.0
    praise_density_per_100w: float = 0.0
    hedging_density_per_100w: float = 0.0
    rhetorical_balancing_per_100w: float = 0.0
    emotional_per_100w: float = 0.0
    help_level_absent_rate: float = 0.0  # 0.0 to 1.0
    drift_score: float = 0.0
    breached_metrics: list[str] = field(default_factory=list)

    @property
    def should_emit(self) -> bool:
        return self.drift_score >= DRIFT_EMIT_THRESHOLD


# Per-metric breach thresholds (calibrated conservative; tighten with data).
# Threshold "verbose response" matches voice_linter.check_response_word_count
# (175 word-count BLOCK threshold). Drift uses 130 as the per-response
# AVERAGE breach point since occasional long responses are fine.
WORD_COUNT_AVG_THRESHOLD = 130.0
SENTENCE_COUNT_AVG_THRESHOLD = 6.0
PRAISE_DENSITY_THRESHOLD_PER_100W = 0.6     # ~1 praise-phrase per 167 words
HEDGING_DENSITY_THRESHOLD_PER_100W = 2.5    # frequent hedging
RHETORICAL_DENSITY_THRESHOLD_PER_100W = 1.0
EMOTIONAL_DENSITY_THRESHOLD_PER_100W = 0.5
HELP_LEVEL_ABSENT_RATE_THRESHOLD = 0.40     # 40%+ of mentoring responses missing level

# Per-metric breach weights. Sum of breached weights = drift_score.
METRIC_WEIGHTS = {
    "avg_word_count":          0.6,
    "avg_sentence_count":      0.4,
    "praise_density":          1.0,   # sycophancy is a Constitution anti-pattern
    "hedging_density":         0.6,
    "rhetorical_balancing":    0.5,
    "emotional_language":      1.0,   # therapist anti-pattern
    "help_level_absent_rate":  1.0,   # Constitution Law 4
}

# When drift_score >= this value, main.py should emit a
# drhex-q-persona-drift observation. Two simultaneous strong-weight
# breaches will clear this; single breaches usually will not.
DRIFT_EMIT_THRESHOLD = 1.5

# Minimum responses needed in the session window before the aggregator
# is considered meaningful. Below this, return drift_score=0 to avoid
# false positives on cold-start sessions.
MIN_SESSION_RESPONSES = 3

# Maximum session window (most recent N responses considered). Older
# responses are excluded; this is a sliding window, not a forever count.
SESSION_WINDOW_RESPONSES = 5


def _count_pattern_hits(text: str, patterns: list[re.Pattern]) -> int:
    """Count total non-overlapping matches across a list of patterns."""
    total = 0
    for p in patterns:
        total += len(p.findall(text))
    return total


def _count_words(text: str) -> int:
    return len(re.findall(r"\b[\w']+\b", text))


def _count_sentences(text: str) -> int:
    if not text or not text.strip():
        return 0
    return max(1, len(re.findall(r"[.!?]+(?:\s|$)", text)))


def _is_mentoring_length(text: str, word_count: int) -> bool:
    """Mirror voice_linter.check_help_level_present: response >=25 words
    AND not matching a non-mentoring pattern is "mentoring" length."""
    if word_count < 25:
        return False
    try:
        from voice_linter import _NON_MENTORING_PATTERNS
        for p in _NON_MENTORING_PATTERNS:
            if p.search(text):
                return False
    except ImportError:
        # If voice_linter isn't importable (unit-test sandbox), default
        # to "mentoring" so we err on the side of flagging missing
        # help-level announcements.
        pass
    return True


def _help_level_announced(text: str) -> bool:
    try:
        from voice_linter import _HELP_LEVEL_PATTERNS
        for p in _HELP_LEVEL_PATTERNS:
            if p.search(text):
                return True
    except ImportError:
        return True  # fail-safe in test contexts
    return False


def _hedging_hits(text: str) -> int:
    try:
        from voice_linter import _HEDGING_PATTERNS
        return _count_pattern_hits(text, _HEDGING_PATTERNS)
    except ImportError:
        return 0


def score_response(text: str) -> ResponseMetrics:
    """Extract per-response drift signals. Pure function. Caller
    accumulates results across the session window."""
    if not text:
        return ResponseMetrics()
    wc = _count_words(text)
    sc = _count_sentences(text)
    is_mentoring = _is_mentoring_length(text, wc)
    help_absent = 1 if (is_mentoring and not _help_level_announced(text)) else 0
    return ResponseMetrics(
        word_count=wc,
        sentence_count=sc,
        praise_hits=_count_pattern_hits(text, _PRAISE_DENSITY_PATTERNS),
        hedging_hits=_hedging_hits(text),
        rhetorical_balancing_hits=_count_pattern_hits(text, _RHETORICAL_BALANCING_PATTERNS),
        emotional_hits=_count_pattern_hits(text, _EMOTIONAL_LANGUAGE_PATTERNS),
        help_level_absent=help_absent,
        is_mentoring_length=is_mentoring,
    )


def session_drift_score(metrics: list[ResponseMetrics]) -> SessionDriftScore:
    """Aggregate per-response metrics into a session-level drift score.

    Uses a sliding window of the most-recent SESSION_WINDOW_RESPONSES.
    Returns drift_score=0 if window has fewer than MIN_SESSION_RESPONSES."""
    window = metrics[-SESSION_WINDOW_RESPONSES:] if metrics else []
    n = len(window)
    if n < MIN_SESSION_RESPONSES:
        return SessionDriftScore(n_responses=n)

    total_words = sum(m.word_count for m in window) or 1  # avoid div-by-zero
    total_mentoring = sum(1 for m in window if m.is_mentoring_length) or 0

    avg_wc = sum(m.word_count for m in window) / n
    avg_sc = sum(m.sentence_count for m in window) / n
    praise_density = (sum(m.praise_hits for m in window) / total_words) * 100.0
    hedging_density = (sum(m.hedging_hits for m in window) / total_words) * 100.0
    rhetorical_density = (sum(m.rhetorical_balancing_hits for m in window) / total_words) * 100.0
    emotional_density = (sum(m.emotional_hits for m in window) / total_words) * 100.0
    if total_mentoring > 0:
        absent_rate = sum(m.help_level_absent for m in window if m.is_mentoring_length) / total_mentoring
    else:
        absent_rate = 0.0

    breaches: list[str] = []
    score = 0.0

    def _check(name: str, value: float, threshold: float) -> None:
        nonlocal score
        if value >= threshold:
            breaches.append(name)
            score += METRIC_WEIGHTS.get(name, 0.0)

    _check("avg_word_count", avg_wc, WORD_COUNT_AVG_THRESHOLD)
    _check("avg_sentence_count", avg_sc, SENTENCE_COUNT_AVG_THRESHOLD)
    _check("praise_density", praise_density, PRAISE_DENSITY_THRESHOLD_PER_100W)
    _check("hedging_density", hedging_density, HEDGING_DENSITY_THRESHOLD_PER_100W)
    _check("rhetorical_balancing", rhetorical_density, RHETORICAL_DENSITY_THRESHOLD_PER_100W)
    _check("emotional_language", emotional_density, EMOTIONAL_DENSITY_THRESHOLD_PER_100W)
    _check("help_level_absent_rate", absent_rate, HELP_LEVEL_ABSENT_RATE_THRESHOLD)

    return SessionDriftScore(
        n_responses=n,
        avg_word_count=avg_wc,
        avg_sentence_count=avg_sc,
        praise_density_per_100w=praise_density,
        hedging_density_per_100w=hedging_density,
        rhetorical_balancing_per_100w=rhetorical_density,
        emotional_per_100w=emotional_density,
        help_level_absent_rate=absent_rate,
        drift_score=score,
        breached_metrics=breaches,
    )


def format_drift_observation(score: SessionDriftScore) -> str:
    """Build the one-line observation field for the quality dashboard.
    Summarises which metrics breached so the operator can scan-triage."""
    if not score.breached_metrics:
        return f"drift_score={score.drift_score:.2f} over {score.n_responses} responses (no metric breaches)"
    parts = [f"{m}" for m in score.breached_metrics]
    return f"drift_score={score.drift_score:.2f} over {score.n_responses} responses; breached: {', '.join(parts)}"
