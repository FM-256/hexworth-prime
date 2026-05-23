"""
hex_ai_orchestrator — help-level ladder

The Help Level enforces the platform's pedagogy: AI guides thinking,
does NOT replace it. The persona changes voice; help level changes
the *ceiling on how much answer leaks through*. Persona is layered
on TOP of help-level, never around it.

Ladder (educator-controlled):
  0 — Refuse / redirect. "Not yet — try X first."
  1 — Conceptual. "This is in the realm of {topic}; revisit lecture N."
  2 — Directional. "Look at the {window/log/file} where {event} happens."
  3 — Tactical. "Try {specific approach}. What do you see?"
  4 — Near-solution. "You're one step off — check {specific thing}."
  5 — Full explanation. Instructor mode only; never default.

Help-level escalation rules (deterministic for v0.0.1):
  - Default level: 2 (Directional) for students
  - Bump +1 if failed_attempts on this objective ≥ 3
  - Bump +1 if hint_used_in_last_5_min for this objective
  - CAP at 4 for students; only role=instructor can hit 5
  - Floor at 0 — never go below operator-set level
"""


LEVEL_DEFINITIONS = {
    0: {
        "label": "Refuse / redirect",
        "system_prompt_suffix": (
            "HELP LEVEL 0 — REFUSE: Do not answer the question. Redirect the student "
            "to the prerequisite material or earlier exercise. Be kind but firm. "
            "One sentence."
        ),
    },
    1: {
        "label": "Conceptual",
        "system_prompt_suffix": (
            "HELP LEVEL 1 — CONCEPTUAL: Name the topic area or principle the question "
            "touches. Do NOT give a method, location, or specific tool. Point at the "
            "lecture/chapter/skill they need to revisit. Max 2 sentences."
        ),
    },
    2: {
        "label": "Directional",
        "system_prompt_suffix": (
            "HELP LEVEL 2 — DIRECTIONAL: Point the student at the right place in the "
            "system to look (a window, log file, command category, network layer). "
            "Do NOT tell them what to TYPE; tell them where to LOOK. Ask one guiding "
            "question. Max 3 sentences."
        ),
    },
    3: {
        "label": "Tactical",
        "system_prompt_suffix": (
            "HELP LEVEL 3 — TACTICAL: Suggest a specific approach or command CATEGORY "
            "(not the exact command) and what to observe in the output. Acceptable: "
            "'use a packet capture tool and look at the SYN-ACK handshake'. NOT acceptable: "
            "'run `tcpdump -i eth0 port 80 -w cap.pcap`'. Max 4 sentences."
        ),
    },
    4: {
        "label": "Near-solution",
        "system_prompt_suffix": (
            "HELP LEVEL 4 — NEAR-SOLUTION: The student has earned a substantial nudge. "
            "Give the specific tool/command/file/value AND why, but stop ONE STEP before "
            "the final answer. They must still execute the last step themselves."
        ),
    },
    5: {
        "label": "Full explanation",
        "system_prompt_suffix": (
            "HELP LEVEL 5 — INSTRUCTOR MODE: Full solution explanation, walkthrough, "
            "and rationale. Use only when role=instructor and student visibility is OFF."
        ),
    },
}


def resolve_help_level(
    base_level: int = 2,
    failed_attempts: int = 0,
    hint_used_recently: bool = False,
    role: str = "student",
) -> tuple[int, str]:
    """
    Apply deterministic escalation rules.

    Returns (effective_level, system_prompt_suffix).
    """
    # Floor at 0, cap at 4 for students (only instructors can hit 5)
    level = max(0, base_level)

    if failed_attempts >= 3:
        level += 1
    if hint_used_recently:
        level += 1

    if role == "student":
        level = min(level, 4)
    elif role == "instructor":
        level = min(level, 5)
    else:
        level = min(level, 4)

    spec = LEVEL_DEFINITIONS.get(level, LEVEL_DEFINITIONS[2])
    return level, spec["system_prompt_suffix"]
