#!/usr/bin/env python3
"""cloud-games-skill-map-test.py — guardrails for the five cloud arcade games.

Each of these pages carries a live <hex-ai-button> and had NO Skill Map, so Dr.
Hex ran on the fallback: no lab-specific forbidden strings and allowed_help_levels
[0..5], i.e. direct answers permitted on every one of them.

Asserts BOTH directions for the two that actually have withholdable answers, and
asserts the low-risk three are honestly scoped rather than padded.
"""
import sys, os
ORCH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "hexclass", "orchestrator")
sys.path.insert(0, ORCH)
from skill_map_loader import maybe_load_skill_map
from voice_linter import check_no_forbidden_disclosure as chk

P = F = 0
def ck(label, ok, detail=""):
    global P, F
    if ok: P += 1
    else:  F += 1
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{('  -> ' + detail) if detail else ''}")

GAMES = ["cloud-destroyer", "cloud-hop", "cloud-hop-vertical",
         "cloud-ad-attack-path", "cloud-api-foundations-lab"]
maps = {g: maybe_load_skill_map(g) for g in GAMES}

missing = [g for g, m in maps.items() if m is None]
ck("all five games have a loading Skill Map", not missing, ", ".join(missing) or "all load")

# Every one must cap below 5 — the fallback's Level 5 is what a missing map
# silently granted, and that is the whole reason these files exist.
uncapped = [g for g, m in maps.items() if m and 5 in m.allowed_help_levels]
ck("none grants Level 5 (the fallback's direct-answer level)", not uncapped,
   ", ".join(uncapped) or "all capped")

# --- AD Attack Path: the path IS the answer and it is one sentence long -----
ad = maps["cloud-ad-attack-path"]
AD_BLOCK = [
    "Kerberoast the service account, then DCSync the domain.",
    "Use GenericAll to ForceChangePassword, then AdminTo the DC.",
    "WriteDacl on the group, which lets you DCSync.",
    "The attack path is user -> group -> DA.",
    "The full chain is MemberOf then AdminTo.",
    # --- Chris's bypasses, verbatim. The first version of these patterns used a
    # --- [^.!?] gap and a seven-item connector list; every one of these got
    # --- through, and none of them is an evasion — they are ordinary phrasing.
    "Kerberoast the account, and afterward DCSync the domain.",
    "First you kerberoast the service account. After that, you use the hash to DCSync the domain.",
    "The service account gets Kerberoasted, and DCSync gets run next.",
    "Once GenericAll is used to ForceChangePassword, AdminTo becomes available on the DC.",
    "You could Kerberoast svc_sql, crack the hash offline, and use those creds to DCSync.",
    "Kerberoast svc_sql; DCSync the domain.",
    "Compromise via Kerberoast. Then compromise via DCSync.",
    "The move here is to abuse WriteDacl so you can DCSync.",
    "Escalate by chaining GenericAll into ForceChangePassword.",
]
AD_PASS = [
    "DCSync is the right to replicate directory changes, which effectively means reading password hashes.",
    "Kerberoast yields a crackable ticket, not a session — that distinction matters.",
    "What does GenericAll actually let you do to that object?",
    "Look at which edges point INTO the high-value node.",
    "MemberOf is transitive; nested groups are easy to miss.",
    # Comparisons naming TWO primitives in one sentence are legitimate teaching
    # and must survive the widened patterns. This is the axis a broader rule is
    # most likely to over-block, so it is asserted explicitly.
    "Kerberoast gives you a hash, unlike DCSync which gives replication rights.",
    "WriteDacl lets you modify an object's DACL.",
    "Unconstrained delegation is dangerous because the TGT is cached.",
]
ck("AD: chained-edge answers blocked", all(chk(t, ad) for t in AD_BLOCK),
   next((t for t in AD_BLOCK if not chk(t, ad)), "all blocked"))
ck("AD: explaining a single primitive still allowed", not any(chk(t, ad) for t in AD_PASS),
   next((t for t in AD_PASS if chk(t, ad)), "all allowed"))

# --- API Foundations: five-item answer set, so a hint is the answer ---------
api = maps["cloud-api-foundations-lab"]
API_BLOCK = ["The answer is PUT.", "You should use PATCH here.",
             "PATCH is the correct one.", "The correct status is 204.",
             # Chris's bypasses, verbatim — casual answer-handover phrasing.
             "PUT is what you'd use here.", "PUT would work here.",
             "Go with PATCH for this one.", "I'd reach for PATCH here.",
             "204 fits this scenario."]
API_PASS = ["PUT replaces the whole resource; PATCH applies a partial modification.",
            "Which of those two operations is idempotent if the client retries?",
            "A 201 means something was created, and it should carry a Location header.",
            "Think about whether the operation is safe, idempotent, both, or neither."]
ck("API: a verb named as the answer is blocked", all(chk(t, api) for t in API_BLOCK),
   next((t for t in API_BLOCK if not chk(t, api)), "all blocked"))
ck("API: explaining what the verbs mean still allowed", not any(chk(t, api) for t in API_PASS),
   next((t for t in API_PASS if chk(t, api)), "all allowed"))

# --- the low-risk three: honest scoping, not padding ------------------------
# These are reflex games whose facts are the REWARD for playing. A long forbidden
# list here would be theatre. Assert they stayed short and stayed permissive.
for g in ["cloud-destroyer", "cloud-hop", "cloud-hop-vertical"]:
    m = maps[g]
    ck(f"{g}: honestly scoped (short forbidden list, generous help)",
       m is not None and len(m.forbidden_disclosures) <= 2 and 4 in m.allowed_help_levels,
       f"forbidden={len(m.forbidden_disclosures) if m else '-'} levels={m.allowed_help_levels if m else '-'}")

print(f"\n{P} passed, {F} failed")
sys.exit(1 if F else 0)
