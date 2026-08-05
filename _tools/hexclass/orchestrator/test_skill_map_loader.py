"""
test_skill_map_loader.py — Unit tests for skill_map_loader.

Run:
    python3 test_skill_map_loader.py
"""

from __future__ import annotations

import os
import sys
import tempfile
import textwrap
from pathlib import Path

import yaml

from skill_map_loader import (
    LabSkillMap,
    SkillMapValidationError,
    _validate_skill_map,
    list_all_skill_maps,
    load_skill_map,
    maybe_load_skill_map,
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


def _make_valid_dict():
    return {
        "lab_id": "test-lab-01",
        "lab_name": "Test Lab",
        "primary_skill": {
            "layer": "Execution",
            "description": "Executes the command",
            "evidence_required": "Student runs the command successfully",
        },
        "assessed_artifact": {
            "type": "flag",
            "description": "Flag returned in response body",
        },
        "allowed_help_levels": [0, 1, 2, 3],
        "forbidden_disclosures": ["exact-command"],
        "transfer_prompt": "How would you defend against this?",
    }


# ─── validation ──────────────────────────────────────────────────────────


_section("validate: well-formed Skill Map loads")

sm = _validate_skill_map(_make_valid_dict(), source="test")
_expect(sm.lab_id == "test-lab-01", "lab_id parsed")
_expect(sm.primary_skill.layer == "Execution", "primary_skill.layer parsed")
_expect(sm.max_help_level == 3, "max_help_level = 3")
_expect(sm.secondary_skill is None, "secondary_skill is None when absent")
_expect(sm.flag_values == [], "flag_values empty when absent")
_expect(sm.walkthrough_text == "", "walkthrough_text empty when absent")


_section("validate: required fields enforced")

for missing in ("lab_id", "lab_name", "primary_skill", "assessed_artifact",
                "allowed_help_levels", "forbidden_disclosures", "transfer_prompt"):
    bad = _make_valid_dict()
    del bad[missing]
    try:
        _validate_skill_map(bad, source="test")
        _expect(False, f"missing '{missing}' raises")
    except SkillMapValidationError as e:
        _expect(missing in str(e), f"missing '{missing}' raises", str(e))


_section("validate: invalid layer enum")

bad = _make_valid_dict()
bad["primary_skill"]["layer"] = "Invented"
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "invalid layer enum raises")
except SkillMapValidationError as e:
    _expect("layer" in str(e), "invalid layer enum raises", str(e))


_section("validate: invalid artifact type enum")

bad = _make_valid_dict()
bad["assessed_artifact"]["type"] = "magic"
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "invalid artifact type raises")
except SkillMapValidationError as e:
    _expect("type" in str(e), "invalid artifact type raises", str(e))


_section("validate: help-level constraints")

bad = _make_valid_dict()
bad["allowed_help_levels"] = []
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "empty allowed_help_levels raises")
except SkillMapValidationError as e:
    _expect(True, "empty allowed_help_levels raises", str(e))

bad = _make_valid_dict()
bad["allowed_help_levels"] = [1, 2, 3]   # missing Level 0
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "missing Level 0 raises")
except SkillMapValidationError as e:
    _expect("Level 0" in str(e), "missing Level 0 raises", str(e))

bad = _make_valid_dict()
bad["allowed_help_levels"] = [0, 1, 9]
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "out-of-range help level raises")
except SkillMapValidationError as e:
    _expect("0-5" in str(e), "out-of-range help level raises", str(e))


_section("validate: forbidden_disclosures must be non-empty")

bad = _make_valid_dict()
bad["forbidden_disclosures"] = []
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "empty forbidden_disclosures raises")
except SkillMapValidationError as e:
    _expect("forbidden_disclosures" in str(e), "empty forbidden_disclosures raises", str(e))


_section("validate: transfer_prompt must contain ?")

bad = _make_valid_dict()
bad["transfer_prompt"] = "Explain the defensive technique."
try:
    _validate_skill_map(bad, source="test")
    _expect(False, "non-question transfer_prompt raises")
except SkillMapValidationError as e:
    _expect("?" in str(e), "non-question transfer_prompt raises", str(e))

# The house style is a question FOLLOWED BY directives. The rule used to be
# endswith('?') and silently disqualified 16 of 29 real maps for content like
# this. Locked in so the stricter rule cannot come back by accident.
mid = _make_valid_dict()
mid["transfer_prompt"] = (
    "What is your response? Name the specific attack their proposal enables "
    "and walk through ONE concrete exploit step. Then state which standard "
    "construction breaks the attack and why."
)
try:
    _validate_skill_map(mid, source="test")
    _expect(True, "question-then-directive transfer_prompt is accepted")
except SkillMapValidationError as e:
    _expect(False, "question-then-directive transfer_prompt is accepted", str(e))


_section("validate: secondary_skill optional + valid")

good = _make_valid_dict()
good["secondary_skill"] = {
    "layer": "Recognition",
    "description": "Recognizes the vulnerability",
    "evidence_required": "Student can explain why",
}
sm = _validate_skill_map(good, source="test")
_expect(sm.secondary_skill is not None, "secondary_skill parsed")
_expect(sm.secondary_skill.layer == "Recognition", "secondary_skill.layer")


# ─── loading from disk ───────────────────────────────────────────────────


_section("load: pilot Skill Maps load cleanly")

for lab_id in ("ala-l01-dead-cell-recovery", "key-aes", "pis-final"):
    try:
        sm = load_skill_map(lab_id)
        _expect(sm.lab_id == lab_id, f"{lab_id} loads", "")
    except Exception as e:
        _expect(False, f"{lab_id} loads", str(e))


_section("load: missing lab raises FileNotFoundError")

try:
    load_skill_map("does-not-exist-xyz")
    _expect(False, "missing lab raises")
except FileNotFoundError:
    _expect(True, "missing lab raises")


_section("load: maybe_load_skill_map returns None on missing")

result = maybe_load_skill_map("does-not-exist-xyz")
_expect(result is None, "maybe_load returns None")


_section("load: list_all returns all 3 pilots (plus any others)")

all_sms = list_all_skill_maps()
pilot_ids = {"ala-l01-dead-cell-recovery", "key-aes", "pis-final"}
found_ids = {sm.lab_id for sm in all_sms}
missing = pilot_ids - found_ids
_expect(not missing, f"all 3 pilots in list_all", f"missing: {missing}")


_section("integration: linter SkillMap conversion")

sm = load_skill_map("key-aes")
linter_sm = sm.to_linter_skill_map()
_expect(linter_sm.lab_id == "key-aes", "linter sm has lab_id")
_expect(
    "openssl enc -aes-256-cbc" in linter_sm.forbidden_disclosures,
    "linter sm has forbidden_disclosures",
)


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
