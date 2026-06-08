"""
skill_map_loader.py — YAML loader + validator for per-lab Skill Maps.

Reads `_app/lab-skill-maps/<lab_id>.yaml` and returns a LabSkillMap
dataclass that the orchestrator and voice_linter can consume.

Spec: `_docs/operations/dr-hex-lab-skill-map.md`

Validation is strict — a malformed Skill Map raises rather than silently
defaulting. Dr. Hex's correct behavior depends on accurate Skill Map data.
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml


# ─── repo path discovery ─────────────────────────────────────────────────


def _repo_root() -> Optional[Path]:
    """Find the hexworth-prime repo root by walking up from this file.

    Returns None if the repo layout can't be found (e.g. running from a
    deployed-only directory like /opt/hexclass/orchestrator without the
    rest of the repo). Callers must check for None and degrade gracefully.
    """
    here = Path(__file__).resolve()
    for parent in [here, *here.parents]:
        if (parent / "_app" / "lab-skill-maps").is_dir():
            return parent
    return None


def skill_maps_dir() -> Optional[Path]:
    """Resolve the lab-skill-maps directory.

    Resolution order:
      1. HEX_SKILL_MAPS_DIR env var (deployed-orchestrator override)
      2. <repo>/_app/lab-skill-maps (dev / local runs)
      3. None if neither exists

    When None is returned, every public load function degrades gracefully
    (load_skill_map raises FileNotFoundError, maybe_load_skill_map and
    list_all_skill_maps return [] / None).
    """
    env_override = os.environ.get("HEX_SKILL_MAPS_DIR")
    if env_override:
        p = Path(env_override)
        if p.is_dir():
            return p
        return None
    root = _repo_root()
    if root is None:
        return None
    return root / "_app" / "lab-skill-maps"


# ─── types ───────────────────────────────────────────────────────────────


VALID_LAYERS = {"Recognition", "Hypothesis", "Execution", "Transfer"}
VALID_HELP_LEVELS = {0, 1, 2, 3, 4, 5}
VALID_ARTIFACT_TYPES = {
    "flag",
    "command",
    "exploit-payload",
    "written-explanation",
    "configuration",
}


@dataclass
class SkillLayer:
    layer: str                       # Recognition | Hypothesis | Execution | Transfer
    description: str
    evidence_required: str


@dataclass
class AssessedArtifact:
    type: str                        # flag | command | exploit-payload | written-explanation | configuration
    description: str


@dataclass
class PhaseScaffold:
    """A phase-aware Level-3 hint scaffold.

    Authored per-lab in YAML under `phase_scaffolds:` keyed by phase_id
    (e.g. `phase_1`, `phase_2`...). Each entry names the phase and provides
    a hint that describes the METHOD (not the answer) appropriate for a
    student stuck in that phase.

    Injected into the system prompt by compose_system_prompt() when:
      (1) the active context provides a matching `phase_id`, AND
      (2) the session's current_help_level >= 3 (Level-3 is the lowest
          level at which method-revealing hints are permitted), AND
      (3) the lab's allowed_help_levels includes 3 or higher (per-lab
          policy ceiling).

    Phase IDs must follow `phase_<int>` naming. The orchestrator does NOT
    enforce phase ordering — the frontend is responsible for telemetry-
    derived phase detection.

    Added 2026-06-08 for #83 (phase_scaffolds wiring). Prior to this
    change the field was authored on disk but unparsed (LOAD-BEARING GATE
    failure case per the Dr. Hex autoloop spec).
    """
    name: str
    hint: str


@dataclass
class LabSkillMap:
    """The full per-lab Skill Map artifact."""
    lab_id: str
    lab_name: str
    primary_skill: SkillLayer
    assessed_artifact: AssessedArtifact
    allowed_help_levels: list[int]
    forbidden_disclosures: list[str]
    transfer_prompt: str

    # Optional fields
    secondary_skill: Optional[SkillLayer] = None
    flag_values: list[str] = field(default_factory=list)
    walkthrough_text: str = ""
    phase_scaffolds: dict[str, PhaseScaffold] = field(default_factory=dict)

    @property
    def max_help_level(self) -> int:
        return max(self.allowed_help_levels) if self.allowed_help_levels else 0

    def to_linter_skill_map(self):
        """Convert to the LabSkillMap shape expected by voice_linter.py."""
        # Local import to avoid coupling skill_map_loader → voice_linter at module load
        from voice_linter import LabSkillMap as LinterSkillMap
        return LinterSkillMap(
            lab_id=self.lab_id,
            flag_values=list(self.flag_values),
            walkthrough_text=self.walkthrough_text,
            forbidden_disclosures=list(self.forbidden_disclosures),
            allowed_help_levels=list(self.allowed_help_levels),
        )


class SkillMapValidationError(ValueError):
    """Raised when a Skill Map YAML file is malformed or incomplete."""
    pass


# ─── validation ──────────────────────────────────────────────────────────


def _require_field(data: dict, path: str, key: str, expected_type: type | tuple[type, ...]) -> object:
    if key not in data:
        raise SkillMapValidationError(f"{path}: missing required field '{key}'")
    val = data[key]
    if not isinstance(val, expected_type):
        type_name = (
            expected_type.__name__
            if isinstance(expected_type, type)
            else " or ".join(t.__name__ for t in expected_type)
        )
        raise SkillMapValidationError(
            f"{path}.{key}: expected {type_name}, got {type(val).__name__}"
        )
    return val


def _parse_skill_layer(data: dict, path: str) -> SkillLayer:
    layer = _require_field(data, path, "layer", str)
    if layer not in VALID_LAYERS:
        raise SkillMapValidationError(
            f"{path}.layer: must be one of {sorted(VALID_LAYERS)}, got '{layer}'"
        )
    description = _require_field(data, path, "description", str).strip()
    evidence = _require_field(data, path, "evidence_required", str).strip()
    if not description:
        raise SkillMapValidationError(f"{path}.description: must not be empty")
    if not evidence:
        raise SkillMapValidationError(f"{path}.evidence_required: must not be empty")
    return SkillLayer(layer=layer, description=description, evidence_required=evidence)


def _parse_assessed_artifact(data: dict, path: str) -> AssessedArtifact:
    artifact_type = _require_field(data, path, "type", str)
    if artifact_type not in VALID_ARTIFACT_TYPES:
        raise SkillMapValidationError(
            f"{path}.type: must be one of {sorted(VALID_ARTIFACT_TYPES)}, got '{artifact_type}'"
        )
    description = _require_field(data, path, "description", str).strip()
    if not description:
        raise SkillMapValidationError(f"{path}.description: must not be empty")
    return AssessedArtifact(type=artifact_type, description=description)


def _validate_skill_map(data: dict, source: str) -> LabSkillMap:
    if not isinstance(data, dict):
        raise SkillMapValidationError(f"{source}: top-level must be a YAML mapping, got {type(data).__name__}")

    lab_id = _require_field(data, source, "lab_id", str).strip()
    lab_name = _require_field(data, source, "lab_name", str).strip()
    if not lab_id:
        raise SkillMapValidationError(f"{source}.lab_id: must not be empty")
    if not lab_name:
        raise SkillMapValidationError(f"{source}.lab_name: must not be empty")

    primary_data = _require_field(data, source, "primary_skill", dict)
    primary = _parse_skill_layer(primary_data, f"{source}.primary_skill")

    secondary = None
    if "secondary_skill" in data and data["secondary_skill"] is not None:
        secondary_data = _require_field(data, source, "secondary_skill", dict)
        secondary = _parse_skill_layer(secondary_data, f"{source}.secondary_skill")

    artifact_data = _require_field(data, source, "assessed_artifact", dict)
    artifact = _parse_assessed_artifact(artifact_data, f"{source}.assessed_artifact")

    raw_levels = _require_field(data, source, "allowed_help_levels", list)
    if not raw_levels:
        raise SkillMapValidationError(f"{source}.allowed_help_levels: must contain at least one level")
    levels: list[int] = []
    for i, lv in enumerate(raw_levels):
        if not isinstance(lv, int):
            raise SkillMapValidationError(
                f"{source}.allowed_help_levels[{i}]: expected int, got {type(lv).__name__}"
            )
        if lv not in VALID_HELP_LEVELS:
            raise SkillMapValidationError(
                f"{source}.allowed_help_levels[{i}]: must be 0-5, got {lv}"
            )
        levels.append(lv)
    if 0 not in levels:
        raise SkillMapValidationError(
            f"{source}.allowed_help_levels: must include Level 0 (every lab must be able to refuse direct-answer requests)"
        )

    raw_forbidden = _require_field(data, source, "forbidden_disclosures", list)
    forbidden = []
    for i, item in enumerate(raw_forbidden):
        if not isinstance(item, str):
            raise SkillMapValidationError(
                f"{source}.forbidden_disclosures[{i}]: expected string, got {type(item).__name__}"
            )
        s = item.strip()
        if s:
            forbidden.append(s)
    if not forbidden:
        raise SkillMapValidationError(
            f"{source}.forbidden_disclosures: must list at least one forbidden string (use Level 0 + empty list if truly nothing is forbidden, but be explicit)"
        )

    transfer_prompt = _require_field(data, source, "transfer_prompt", str).strip()
    if not transfer_prompt:
        raise SkillMapValidationError(f"{source}.transfer_prompt: must not be empty")
    if not transfer_prompt.endswith("?"):
        raise SkillMapValidationError(
            f"{source}.transfer_prompt: must be a question ending in '?'"
        )

    # Optional fields
    flag_values: list[str] = []
    if "flag_values" in data and data["flag_values"]:
        raw_flags = data["flag_values"]
        if not isinstance(raw_flags, list):
            raise SkillMapValidationError(f"{source}.flag_values: expected list, got {type(raw_flags).__name__}")
        for i, fv in enumerate(raw_flags):
            if not isinstance(fv, str):
                raise SkillMapValidationError(
                    f"{source}.flag_values[{i}]: expected string, got {type(fv).__name__}"
                )
            flag_values.append(fv.strip())

    walkthrough_text = ""
    if "walkthrough_text" in data and data["walkthrough_text"] is not None:
        wt = data["walkthrough_text"]
        if not isinstance(wt, str):
            raise SkillMapValidationError(f"{source}.walkthrough_text: expected string, got {type(wt).__name__}")
        walkthrough_text = wt

    # phase_scaffolds: optional dict of phase_id → {name, hint}. Authored
    # per-lab; parsed here so it's a runtime-readable surface (no longer a
    # trap field for the Dr. Hex autoloop). Phase-aware injection happens
    # in main.compose_system_prompt; see #83.
    phase_scaffolds: dict[str, PhaseScaffold] = {}
    if "phase_scaffolds" in data and data["phase_scaffolds"] is not None:
        raw_phases = data["phase_scaffolds"]
        if not isinstance(raw_phases, dict):
            raise SkillMapValidationError(
                f"{source}.phase_scaffolds: expected mapping, got {type(raw_phases).__name__}"
            )
        for phase_id, phase_data in raw_phases.items():
            if not isinstance(phase_id, str):
                raise SkillMapValidationError(
                    f"{source}.phase_scaffolds: key must be string, got {type(phase_id).__name__}"
                )
            phase_path = f"{source}.phase_scaffolds.{phase_id}"
            if not isinstance(phase_data, dict):
                raise SkillMapValidationError(
                    f"{phase_path}: expected mapping with name+hint, got {type(phase_data).__name__}"
                )
            name = _require_field(phase_data, phase_path, "name", str).strip()
            hint = _require_field(phase_data, phase_path, "hint", str).strip()
            if not name:
                raise SkillMapValidationError(f"{phase_path}.name: must not be empty")
            if not hint:
                raise SkillMapValidationError(f"{phase_path}.hint: must not be empty")
            phase_scaffolds[phase_id] = PhaseScaffold(name=name, hint=hint)

    return LabSkillMap(
        lab_id=lab_id,
        lab_name=lab_name,
        primary_skill=primary,
        secondary_skill=secondary,
        assessed_artifact=artifact,
        allowed_help_levels=levels,
        forbidden_disclosures=forbidden,
        transfer_prompt=transfer_prompt,
        flag_values=flag_values,
        walkthrough_text=walkthrough_text,
        phase_scaffolds=phase_scaffolds,
    )


# ─── public API ──────────────────────────────────────────────────────────


# Per-request mtime-keyed cache for parsed Skill Maps.
#
# Without this, the orchestrator re-reads + re-parses YAML on every chat
# turn — a wasted 1-20 ms per request (OS page cache hides most of it,
# but 7-map production + planned 1500+ adds up). Keying on (path, mtime)
# means a newly-promoted Skill Map is picked up automatically on its
# next request without restarting the orchestrator.
#
# Dict-based not @lru_cache because mtime changes invalidate; the cache
# is bounded only by the number of unique lab_ids served (~7 today,
# capped at ~2500 even in the most-promoted future state).
_skill_map_cache: dict[tuple[str, int], LabSkillMap] = {}


def load_skill_map(lab_id: str) -> LabSkillMap:
    """Load and validate the Skill Map for the given lab_id.

    Raises FileNotFoundError if the YAML file does not exist (or if no
    skill-maps directory is configured), SkillMapValidationError if the
    file is malformed.

    Cached by (resolved-path, mtime_ns). Re-reads when the file is
    modified — operators promoting a Skill Map from _drafts/ get the
    new content on the next request without restarting the orchestrator.
    """
    d = skill_maps_dir()
    if d is None:
        raise FileNotFoundError(
            f"No Skill Map for '{lab_id}': skill-maps directory not configured "
            f"(set HEX_SKILL_MAPS_DIR env var or run from inside the repo)"
        )
    path = d / f"{lab_id}.yaml"
    if not path.is_file():
        raise FileNotFoundError(f"No Skill Map found for lab_id '{lab_id}' (expected {path})")
    mtime_ns = path.stat().st_mtime_ns
    cache_key = (str(path), mtime_ns)
    cached = _skill_map_cache.get(cache_key)
    if cached is not None:
        return cached
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    parsed = _validate_skill_map(data, source=path.name)
    _skill_map_cache[cache_key] = parsed
    return parsed


def maybe_load_skill_map(lab_id: str) -> Optional[LabSkillMap]:
    """Soft-load — returns None if the Skill Map is missing or malformed.

    Use in the orchestrator's chat-init path where missing Skill Maps
    should degrade gracefully (Dr. Hex falls back to generic posture)
    rather than crash the session. Validation errors are logged at
    WARNING level; truly missing files are silent."""
    try:
        return load_skill_map(lab_id)
    except FileNotFoundError:
        return None
    except SkillMapValidationError as exc:
        import logging
        logging.getLogger("hex_ai_orchestrator").warning(
            "Skill Map for %s failed validation: %s", lab_id, exc
        )
        return None


def list_all_skill_maps() -> list[LabSkillMap]:
    """Walk the skill-maps directory and return every parseable map.

    Used by the EduScan validator and by the bootstrap audit script.
    Logs (but does not raise on) individual failures. Returns empty list
    if no skill-maps directory is configured.
    """
    out: list[LabSkillMap] = []
    d = skill_maps_dir()
    if d is None or not d.is_dir():
        return out
    for entry in sorted(d.iterdir()):
        if entry.suffix.lower() not in (".yaml", ".yml"):
            continue
        try:
            with open(entry, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            out.append(_validate_skill_map(data, source=entry.name))
        except (yaml.YAMLError, SkillMapValidationError, OSError) as exc:
            sys.stderr.write(f"[skill_map_loader] skipped {entry.name}: {exc}\n")
    return out


# ─── CLI ─────────────────────────────────────────────────────────────────


def _main_cli() -> int:
    """Bare-bones CLI for inspecting Skill Maps from the shell.

    Usage:
        python3 skill_map_loader.py list
        python3 skill_map_loader.py show <lab_id>
        python3 skill_map_loader.py validate    # validate every YAML in the dir, exit nonzero on any failure
    """
    import argparse, json
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list")
    show = sub.add_parser("show")
    show.add_argument("lab_id")
    sub.add_parser("validate")
    args = p.parse_args()

    if args.cmd == "list":
        for sm in list_all_skill_maps():
            print(f"{sm.lab_id:50}  {sm.primary_skill.layer:14}  max-help={sm.max_help_level}")
        return 0

    if args.cmd == "show":
        sm = load_skill_map(args.lab_id)
        out = {
            "lab_id": sm.lab_id,
            "lab_name": sm.lab_name,
            "primary_skill": vars(sm.primary_skill),
            "secondary_skill": vars(sm.secondary_skill) if sm.secondary_skill else None,
            "assessed_artifact": vars(sm.assessed_artifact),
            "allowed_help_levels": sm.allowed_help_levels,
            "max_help_level": sm.max_help_level,
            "forbidden_disclosures": sm.forbidden_disclosures,
            "transfer_prompt": sm.transfer_prompt,
            "flag_values_count": len(sm.flag_values),
            "walkthrough_text_length": len(sm.walkthrough_text),
        }
        print(json.dumps(out, indent=2))
        return 0

    if args.cmd == "validate":
        d = skill_maps_dir()
        failures = 0
        loaded = 0
        for entry in sorted(d.iterdir()):
            if entry.suffix.lower() not in (".yaml", ".yml"):
                continue
            try:
                with open(entry, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                _validate_skill_map(data, source=entry.name)
                loaded += 1
                print(f"  PASS  {entry.name}")
            except (yaml.YAMLError, SkillMapValidationError, OSError) as exc:
                failures += 1
                print(f"  FAIL  {entry.name}: {exc}")
        print(f"\n{loaded} loaded · {failures} failed")
        return 1 if failures else 0

    return 2


if __name__ == "__main__":
    raise SystemExit(_main_cli())
