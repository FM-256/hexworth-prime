# Lab Skill Maps

Per-lab artifacts that operationalize Dr. Hex's "preserve the challenge" rule.
Spec: `_docs/operations/dr-hex-lab-skill-map.md`.

## What lives here

One YAML file per lab, named `<lab_id>.yaml`. Each file declares what
skill layer the lab is assessing and what Dr. Hex may / may not disclose
about that lab.

## Schema

See `dr-hex-lab-skill-map.md` §3 for the full spec. Minimum fields:

```yaml
lab_id:        <canonical lab id matching ContentCatalog>
lab_name:      <human-readable name>
primary_skill:
  layer:       Recognition | Hypothesis | Execution | Transfer
  description: <one sentence>
  evidence_required: <one sentence>
assessed_artifact:
  type:        flag | command | exploit-payload | written-explanation | configuration
  description: <one sentence>
allowed_help_levels:
  - 0 | 1 | 2 | 3 | 4 | 5
forbidden_disclosures:
  - <string Dr. Hex must never produce verbatim>
transfer_prompt: |
  <one-question metacognitive prompt for the celebrating state>
```

Optional fields: `secondary_skill`, `flag_values`, `walkthrough_text`.

## Loading

Python loader at `_tools/hexclass/orchestrator/skill_map_loader.py`:

```python
from skill_map_loader import load_skill_map
sm = load_skill_map("ala-l01-dead-cell-recovery")
# sm is a LabSkillMap dataclass; raises if file missing or schema invalid
```

## Validator

EduScan validator `SKILL-MAP-001` lives at
`_tools/eduscan/validators/syntax/skill-map.js`. Runs in the normal
EduScan pipeline. Severity HIGH for labs missing a Skill Map (Dr. Hex
cannot operate correctly on them).
