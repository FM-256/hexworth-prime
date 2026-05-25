"""
test_voice_linter.py — Unit tests for the Dr. Hex voice linter.

Run from the orchestrator directory:
    python3 test_voice_linter.py

Or with pytest if available:
    pytest test_voice_linter.py -v

Pure-Python tests — no orchestrator runtime needed.
"""

from __future__ import annotations
import sys

from voice_linter import (
    LabSkillMap,
    LintResult,
    SessionState,
    check_help_level_present,
    check_hedging_density,
    check_humility_frequency,
    check_curiosity_frequency,
    check_no_emoji,
    check_no_fake_casual,
    check_no_flag_value,
    check_no_forbidden_disclosure,
    check_no_lived_experience,
    check_no_walkthrough_paste,
    check_personal_praise,
    check_response_word_count,
    check_sentence_count,
    lint_response,
    update_session_state,
)


_PASS = 0
_FAIL = 0
_FAILS: list[str] = []


def _expect(cond, label: str, detail: str = "") -> None:
    global _PASS, _FAIL
    if cond:
        _PASS += 1
        print(f"  PASS  {label}")
    else:
        _FAIL += 1
        msg = f"{label}{(': ' + detail) if detail else ''}"
        _FAILS.append(msg)
        print(f"  FAIL  {msg}")


def _section(title: str) -> None:
    print(f"\n── {title} " + "─" * (60 - len(title)))


# ─── BLOCK-tier ──────────────────────────────────────────────────────────


_section("BLOCK: no_emoji")

_expect(check_no_emoji("Good catch. What's next?") is None, "clean text passes")
_expect(check_no_emoji("Great work! 🎉") is not None, "🎉 detected")
_expect(check_no_emoji("Nice 🤖 hi") is not None, "🤖 detected")
_expect(check_no_emoji("test ⭐ here") is not None, "⭐ detected")
_expect(check_no_emoji("normal text with — em dash") is None, "em dash not flagged as emoji")


_section("BLOCK: no_flag_value")

sm = LabSkillMap(
    lab_id="test-01",
    flag_values=["FLAG{test_abc_123}"],
)
_expect(
    check_no_flag_value("Try thinking about input flow.", sm) is None,
    "response without flag passes",
)
_expect(
    check_no_flag_value("The flag is FLAG{test_abc_123}.", sm) is not None,
    "literal flag detected",
)
_expect(
    check_no_flag_value("The flag is FLAG{TEST_abc_123}.", sm) is not None,
    "case-insensitive flag detected",
)
_expect(
    check_no_flag_value("Try thinking about input flow.", None) is None,
    "no skill map → no flag check",
)


_section("BLOCK: no_forbidden_disclosure")

sm2 = LabSkillMap(
    lab_id="sqli-01",
    forbidden_disclosures=["' OR 1=1--", "exact sql query text"],
)
_expect(
    check_no_forbidden_disclosure("Think about what happens with the quote character.", sm2) is None,
    "clean response passes",
)
_expect(
    check_no_forbidden_disclosure("The payload is ' OR 1=1--", sm2) is not None,
    "literal forbidden payload detected",
)


_section("BLOCK: no_walkthrough_paste")

sm3 = LabSkillMap(
    lab_id="lab-3",
    walkthrough_text=("Step 1: Run nmap with the -sS flag against the target. "
                      "Step 2: Identify the open ports. Step 3: Use curl to "
                      "fetch the index page from the web server."),
)
_expect(
    check_no_walkthrough_paste("Try scanning the target with nmap.", sm3) is None,
    "paraphrase passes",
)
_expect(
    check_no_walkthrough_paste(
        "Here's a thought: Step 1: Run nmap with the -sS flag against the target. Step 2: Identify the open ports.",
        sm3,
    ) is not None,
    "verbatim 80+ char paste detected",
)


_section("BLOCK: no_fake_casual")

_expect(
    check_no_fake_casual("That command will fail. Try a different port.") is None,
    "clean response passes",
)
_expect(
    check_no_fake_casual("yeah lol that's a tricky one") is not None,
    "'lol' detected",
)
_expect(
    check_no_fake_casual("idk maybe try the SYN scan") is not None,
    "'idk' detected",
)
_expect(
    check_no_fake_casual("hmm... wait actually") is not None,
    "ellipsis hesitation detected",
)
_expect(
    check_no_fake_casual("you're gonna want to use sudo") is not None,
    "'gonna' detected",
)


_section("BLOCK: no_lived_experience (Codex mythology guard)")

# Pattern observations OK (Constitution §16.1)
_expect(
    check_no_lived_experience("Students often miss the SUID bit on this one.") is None,
    "pattern observation about students passes",
)
_expect(
    check_no_lived_experience("That assumption breaks more labs than you'd think.") is None,
    "pattern observation about labs passes",
)
_expect(
    check_no_lived_experience("This is one of the patient-zero labs in the curriculum.") is None,
    "pattern observation about the curriculum passes",
)

# First-person lived experience NOT OK
_expect(
    check_no_lived_experience("I remember when I was learning this.") is not None,
    "'I remember when I was learning' blocked",
)
_expect(
    check_no_lived_experience("Back when I started doing this kind of work...") is not None,
    "'Back when I started' blocked",
)
_expect(
    check_no_lived_experience("In my experience, this approach works.") is not None,
    "'in my experience' blocked",
)
_expect(
    check_no_lived_experience("My favorite part of this lab is the recovery step.") is not None,
    "'My favorite part of this lab' blocked",
)
_expect(
    check_no_lived_experience("I used to find this hard too.") is not None,
    "'I used to find this hard' blocked",
)


_section("BLOCK: help_level_present")

# Short responses are exempt
_expect(
    check_help_level_present("Where did you stop making progress?") is None,
    "short response (<25 words) exempt",
)

# Non-mentoring exemptions
_expect(
    check_help_level_present("I don't have good context on this lab right now. The walkthrough doc will be more reliable than I will be on this question. Check with your instructor if you're stuck.") is None,
    "graceful-degradation exempt",
)

# Mentoring without Help Level should block
mentoring_no_level = (
    "Look at your scan output carefully. The third line tells you something "
    "important about how the service is configured. Most students miss this "
    "and end up trying random payloads when the answer is sitting in the "
    "scan they already ran. Walk through it line by line and tell me what "
    "you see."
)
_expect(
    check_help_level_present(mentoring_no_level) is not None,
    "long mentoring response without Help Level blocked",
)

# Mentoring WITH Help Level passes
mentoring_with_level = (
    "I'll give direction, not the answer. Look at your scan output carefully. "
    "The third line tells you something important about how the service is "
    "configured. Walk through it line by line and tell me what you see."
)
_expect(
    check_help_level_present(mentoring_with_level) is None,
    "long mentoring response with 'I'll give direction' passes",
)


# ─── WARN-tier ───────────────────────────────────────────────────────────


_section("WARN: response_word_count")

_expect(
    check_response_word_count("short response") is None,
    "short response passes",
)
long_text = ("word " * 200).strip()
_expect(
    check_response_word_count(long_text) is not None,
    "200-word response flagged",
)


_section("WARN: sentence_count")

_expect(
    check_sentence_count("One. Two. Three.") is None,
    "3 sentences passes",
)
many = ". ".join([f"Sentence {i}" for i in range(12)]) + "."
_expect(
    check_sentence_count(many) is not None,
    "12 sentences flagged",
)


_section("WARN: personal_praise")

_expect(
    check_personal_praise("Good catch on the SUID bit.") is None,
    "work-anchored 'Good catch' passes",
)
_expect(
    check_personal_praise("Great question! Let's think about it.") is not None,
    "'Great question' flagged",
)
_expect(
    check_personal_praise("You're so smart for thinking of that.") is not None,
    "'You're so smart' flagged",
)
_expect(
    check_personal_praise("You're doing amazing.") is not None,
    "'You're doing amazing' flagged",
)


_section("WARN: hedging_density")

_expect(
    check_hedging_density("This command targets the wrong port.") is None,
    "no hedging passes",
)
hedge_heavy = "It might be that perhaps the issue could be related to what I think might be a possible configuration problem that I believe could possibly cause this."
_expect(
    check_hedging_density(hedge_heavy) is not None,
    "hedge-heavy text flagged",
)


_section("WARN: humility_frequency")

ss = SessionState()
v, _ = check_humility_frequency("Some normal mentoring response.", ss)
_expect(v is None, "no humility marker → no warning")

v, _ = check_humility_frequency("I'm a language model — verify what I say.", ss)
_expect(v is None, "first humility disclaimer OK (count starts at 0, this one = 1)")

ss.humility_disclaimer_count = 1
v, _ = check_humility_frequency("I'm a model. Verify what I say.", ss)
_expect(v is not None, "second humility disclaimer flagged (>1 per session)")


_section("WARN: curiosity_frequency")

ss = SessionState(response_count=10, curiosity_marker_count=2)
v, _ = check_curiosity_frequency("That output is interesting.", ss)
# new_total = 2 + 1 = 3 ; ratio = 3/11 = 27% — flag
_expect(v is not None, "curiosity at 27% of responses flagged")

ss2 = SessionState(response_count=10, curiosity_marker_count=1)
v, _ = check_curiosity_frequency("That output is interesting.", ss2)
# new_total = 2 ; ratio = 2/11 = 18% — pass
_expect(v is None, "curiosity at 18% of responses passes")


# ─── integration ─────────────────────────────────────────────────────────


_section("integration: lint_response — clean")

clean = "I'll give direction, not the answer. Look at the third line of your scan."
r = lint_response(clean)
_expect(not r.blocked, "clean mentoring response not blocked")
_expect(len(r.warnings) == 0, "clean mentoring response has no warnings")


_section("integration: lint_response — multiple blocking")

bad = "lol yeah great question 🎉 just try ' OR 1=1-- and you're amazing"
bad_sm = LabSkillMap(
    lab_id="test",
    forbidden_disclosures=["' OR 1=1--"],
)
r = lint_response(bad, lab_skill_map=bad_sm)
codes = {v.code for v in r.violations}
_expect("no_emoji" in codes, "emoji detected in mixed-bad response")
_expect("no_fake_casual" in codes, "lol detected in mixed-bad response")
_expect("no_forbidden_disclosure" in codes, "forbidden disclosure detected")
_expect("forbidden_phrase_hit" in codes, "personal praise detected")
_expect(r.blocked, "mixed-bad response blocked")


_section("integration: regeneration_hint format")

bad2 = "🎉 lol that's amazing!"
r = lint_response(bad2)
hint = r.regeneration_hint
_expect("no_emoji" in hint, "regen hint mentions no_emoji")
_expect("no_fake_casual" in hint, "regen hint mentions no_fake_casual")
_expect(r.blocked, "regen-hint case is blocked")


_section("integration: update_session_state")

ss = SessionState()
update_session_state(ss, "I'm a language model — verify what I say.", was_intervention=True)
_expect(ss.response_count == 1, "response_count incremented")
_expect(ss.intervention_count == 1, "intervention_count incremented")
_expect(ss.humility_disclaimer_count == 1, "humility_disclaimer_count incremented")
_expect(ss.curiosity_marker_count == 0, "curiosity_marker_count not incremented")


_section("integration: graceful-degradation passes")

graceful = (
    "I don't have good context on this lab right now. The walkthrough "
    "doc at /houses/matrix/adv-linux/labs/lab-04/walkthrough.html will "
    "be more reliable than I will be. Check with your instructor if "
    "you're still stuck after reading it."
)
r = lint_response(graceful)
_expect(not r.blocked, "graceful-degradation response not blocked")


# ─── summary ─────────────────────────────────────────────────────────────


print()
print("─" * 60)
total = _PASS + _FAIL
print(f"  {_PASS}/{total} pass · {_FAIL} fail")
if _FAILS:
    print("  failures:")
    for f in _FAILS:
        print(f"    - {f}")
sys.exit(1 if _FAIL else 0)
