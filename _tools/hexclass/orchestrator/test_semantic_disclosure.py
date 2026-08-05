#!/usr/bin/env python3
"""test_semantic_disclosure.py — trigger logic and failure paths.

SCOPE, STATED HONESTLY: this does NOT test whether the model judges correctly.
That cannot be unit-tested and must be validated from shadow-mode logs against
real traffic before the guard is promoted to enforce. What IS tested here is
everything that is mine: the recall trigger, the tolerant parser, and above all
that every failure direction is fail-OPEN and counted.
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import semantic_disclosure as sd

P = F = 0
def ck(label, ok, detail=""):
    global P, F
    P, F = (P+1, F) if ok else (P, F+1)
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{('  -> ' + detail) if detail else ''}")

AD = sd.SemanticGuard(
    answer_summary="Kerberoast the service account, then DCSync the domain.",
    trigger_terms=["kerberoast", "dcsync", "genericall", "writedacl", "attack path"])

print("-- TRIGGER: high recall is the goal, false positives are acceptable --")
for t in ["Kerberoast then DCSync.", "kerberoast the account",
          "I'd say the attack path starts at the workstation.",
          "DCSync is a replication right.",
          "WriteDacl lets you modify a DACL."]:
    ck(f"triggers on {t[:38]!r}", sd.should_check(t, AD))
ck("unrelated text does NOT trigger",
   not sd.should_check("Subnetting splits a network into smaller broadcast domains.", AD))
ck("no guard means never trigger", not sd.should_check("Kerberoast then DCSync.", None))
ck("guard without answer_summary is disabled",
   not sd.should_check("Kerberoast", sd.SemanticGuard(answer_summary="", trigger_terms=["kerberoast"])))

print("\n-- PARSER: tolerant, but never invents a verdict --")
ck("parses clean JSON", sd._parse('{"discloses": true, "why": "names the chain"}').discloses is True)
ck("parses JSON wrapped in prose",
   sd._parse('Sure! {"discloses": false, "why": "explains only"} hope that helps').discloses is False)
ck("rejects non-boolean discloses", sd._parse('{"discloses": "yes"}') is None)
ck("rejects missing field", sd._parse('{"why": "no verdict"}') is None)
ck("rejects empty", sd._parse("") is None)

print("\n-- FAILURE DIRECTION: fail OPEN, and count it --")
class Boom:
    async def post(self, *a, **k): raise TimeoutError("judge slow")
class Garbage:
    async def post(self, *a, **k):
        class R:
            def json(self): return {"message": {"content": "I think maybe yes?"}}
        return R()
class Says:
    def __init__(self, v): self.v = v
    async def post(self, *a, **k):
        v = self.v
        class R:
            def json(self): return {"message": {"content": '{"discloses": %s, "why": "t"}' % ("true" if v else "false")}}
        return R()

before = sd.counters()["fail_open"]
r1 = asyncio.run(sd.judge_disclosure("x", AD, client=Boom()))
ck("timeout fails OPEN (does not block the student)", r1.discloses is False and r1.failed_open)
r2 = asyncio.run(sd.judge_disclosure("x", AD, client=Garbage()))
ck("unparseable reply fails OPEN", r2.discloses is False and r2.failed_open)
ck("both fail-opens were COUNTED", sd.counters()["fail_open"] == before + 2,
   f"{before} -> {sd.counters()['fail_open']}")

r3 = asyncio.run(sd.judge_disclosure("x", AD, client=Says(True)))
ck("a positive verdict is reported as disclosing", r3.discloses is True and not r3.failed_open)
r4 = asyncio.run(sd.judge_disclosure("x", AD, client=Says(False)))
ck("a negative verdict is reported as clean", r4.discloses is False and not r4.failed_open)

print("\n-- MODE: shadow is the default and must not be enforce --")
ck("default mode is shadow (never silently enforcing)", sd.MODE in ("shadow", "off"), f"MODE={sd.MODE}")
ck("evaluate() skips when no guard declared",
   asyncio.run(sd.evaluate("Kerberoast then DCSync", None)) is None)
ck("evaluate() skips when trigger does not fire",
   asyncio.run(sd.evaluate("Subnetting is unrelated.", AD, client=Says(True))) is None)
res = asyncio.run(sd.evaluate("Kerberoast then DCSync", AD, client=Says(True)))
ck("evaluate() runs the judge when triggered", res is not None and res.discloses)

print(f"\n{P} passed, {F} failed")
sys.exit(1 if F else 0)
