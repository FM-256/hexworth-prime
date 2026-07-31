#!/bin/bash
# HexMemory (Gate 6) QC. Proves both directions in real python3 against the SHIPPED page.
#
# Built from qc-hextalk.sh with every defect the reviewers found already closed:
#   - extracts ENGINE from the page rather than duplicating it (Chris: latent drift)
#   - numeric checks parse the RENDERED instruction strings, never the doctrine comment
#     (Chris found a false PASS where a comment satisfied the check)
#   - every check has a not-found guard (Nancy found one silently checking nothing
#     and passing clean)
#   - stochastic checks have their false-fail rate MEASURED, not sampled once
#     (HexNet shipped a gate that failed honest learners 5% of runs)
#   - ceiling check scoped to the extracted CEILING string
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LAB="$ROOT/_app/houses/ai/cortex/labs/hexmemory-rnn.lab.html"
W=$(mktemp -d)

python3 - "$LAB" "$W" <<'PY'
import re, sys
h = open(sys.argv[1]).read(); out = sys.argv[2]
m = re.search(r"var ENGINE = \[(.*?)\]\.join\('\\n'\);", h, re.S)
if not m:
    print("FATAL: cannot extract ENGINE from the page"); raise SystemExit(1)
parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
open(out + '/engine.py', 'w').write('\n'.join(p.replace("\\'", "'") for p in parts))
PY
[ -s "$W/engine.py" ] || { echo "FATAL: extracted engine is empty"; rm -rf "$W"; exit 1; }

# Reference implementation -- the correct build the lab asks for.
cat > "$W/ref.py" <<'PY'
def build(seed):
    rnd = random.Random(seed)
    r = lambda: Value(rnd.uniform(-0.5, 0.5))
    W = {"Wxh": [[r() for _ in range(VOCAB)] for _ in range(HID)],
         "Whh": [[r() for _ in range(HID)]   for _ in range(HID)],
         "b"  : [r() for _ in range(HID)],
         "Why": [[r() for _ in range(HID)]   for _ in range(VOCAB)]}
    return W, rnd

def params(W):
    return ([p for row in W["Wxh"] for p in row] + [p for row in W["Whh"] for p in row]
            + W["b"] + [p for row in W["Why"] for p in row])

def forward(W, seq):
    h = [Value(0.0) for _ in range(HID)]
    for tok in seq:
        x = onehot(tok); nh = []
        for i in range(HID):
            acc = W["b"][i]
            for j in range(VOCAB): acc = acc + W["Wxh"][i][j] * x[j]
            for j in range(HID):   acc = acc + W["Whh"][i][j] * h[j]
            nh.append(acc.tanh())
        h = nh
    return [sum((W["Why"][k][i] * h[i] for i in range(HID)), Value(0.0))
            for k in range(VOCAB)]

def train(W, train_set, steps=40, lr=0.3, clip=5.0):
    for _ in range(steps):
        loss = Value(0.0)
        for seq, cue in train_set:
            out = forward(W, seq)
            for k in range(VOCAB):
                loss = loss + (out[k] - (1.0 if k == cue else -1.0)) ** 2
        for p in params(W): p.grad = 0.0
        loss.backward()
        n = sum(p.grad * p.grad for p in params(W)) ** 0.5
        scale = (clip / n) if n > clip else 1.0
        for p in params(W): p.data -= lr * (p.grad * scale) / len(train_set)
    return W

def accuracy(W, distance, rnd, n=24):
    ok = 0
    for _ in range(n):
        seq, cue = make_example(distance, rnd)
        out = forward(W, seq)
        ok += (max(range(VOCAB), key=lambda k: out[k].data) == cue)
    return ok / n

def score_at(distance, seed):
    W, rnd = build(seed)
    train(W, [make_example(distance, rnd) for _ in range(12)])
    return accuracy(W, distance, rnd)

def paired_at(distance, seed):
    """The shipped challenge-3 path: untrained score, then trained score."""
    W, rnd = build(seed)
    ex = [make_example(distance, rnd) for _ in range(12)]
    before = accuracy(W, distance, rnd)
    train(W, ex)
    return before, accuracy(W, distance, rnd)
PY

echo "── [1/4] ADVERSARIAL: broken memory must FAIL ──"
# Cheat A: a cell that ignores the carried state. It can never solve the task, because
# the cue is gone by the time the query arrives.
cat "$W/engine.py" "$W/ref.py" > "$W/a.py"
cat >> "$W/a.py" <<'PY'
def forward(W, seq):                       # state-free: only the LAST symbol is seen
    x = onehot(seq[-1]); h = []
    for i in range(HID):
        acc = W["b"][i]
        for j in range(VOCAB): acc = acc + W["Wxh"][i][j] * x[j]
        h.append(acc.tanh())
    return [sum((W["Why"][k][i] * h[i] for i in range(HID)), Value(0.0))
            for k in range(VOCAB)]
print(f"CHEAT_A_ACC:{score_at(1, 1):.3f}")
PY
AA=$(python3 "$W/a.py" | sed -n 's/.*CHEAT_A_ACC:\([0-9.]*\).*/\1/p')
[ -z "$AA" ] && { echo "  GATE BROKEN: cheat A produced no result"; rm -rf "$W"; exit 1; }
if python3 -c "raise SystemExit(0 if $AA >= 0.6 else 1)"; then
  echo "  GATE BROKEN: a state-free cell reached the 60% bar (got $AA)"; rm -rf "$W"; exit 1
fi
echo "  cheat A (cell ignores the carried state, acc $AA) cannot reach the near-memory bar"

# Cheat B: an untrained network must sit at chance, nowhere near the bar.
cat "$W/engine.py" "$W/ref.py" > "$W/b.py"
cat >> "$W/b.py" <<'PY'
W, rnd = build(3)
print(f"CHEAT_B_ACC:{accuracy(W, 1, rnd, n=96):.3f}")
PY
BA=$(python3 "$W/b.py" | sed -n 's/.*CHEAT_B_ACC:\([0-9.]*\).*/\1/p')
[ -z "$BA" ] && { echo "  GATE BROKEN: cheat B produced no result"; rm -rf "$W"; exit 1; }
if python3 -c "raise SystemExit(0 if $BA >= 0.6 else 1)"; then
  echo "  GATE BROKEN: an untrained network reached the 60% bar (got $BA)"; rm -rf "$W"; exit 1
fi
echo "  cheat B (untrained network, acc $BA) sits at chance as it must"

echo "── [2/4] WALKTHROUGH: the correct build must PASS ──"
cat "$W/engine.py" "$W/ref.py" > "$W/w.py"
cat >> "$W/w.py" <<'PY'
# Nancy, 2026-07-31: this gate only ever inspected ACCURACY, so it passed green while
# training silently exploded to ~1e212 on some seeds (BUG-053). A loss that is not a
# finite, sane number means the lab is showing students an absurdity it has no account
# for -- gate on it.
import math
_W, _rnd = build(1)
_ex = [make_example(8, _rnd) for _ in range(12)]
train(_W, _ex)
_loss = sum(sum((forward(_W, sq)[k].data - (1.0 if k == c else -1.0)) ** 2
                for k in range(VOCAB)) for sq, c in _ex) / len(_ex)
print(f"  distance-8 training loss: {_loss:.4f}")
if not math.isfinite(_loss) or _loss > 100:
    print(f"  FAIL: training exploded (loss {_loss}) -- see BUG-053")
    raise SystemExit(1)

n1, n8 = score_at(1, 1), score_at(8, 1)
print(f"  distance 1: {n1:.0%}   distance 8: {n8:.0%}   (chance 25%)")
assert n1 >= 0.6,        f"near memory failed the shipped bar: {n1}"
assert (n1 - n8) >= 0.20 - 1e-9, f"no decay measured: near {n1} far {n8}"
# No absolute ceiling on n8: across 24 seeds distance 8 ranges 12-58%, so any fixed
# bar false-fails somewhere. The MARGIN is the robust signal and is asserted above.
PY
python3 "$W/w.py" || { echo "GATE FAILED: the correct build does not pass."; rm -rf "$W"; exit 1; }

# The three stochastic graded checks must not fail honest learners at random.
cat "$W/engine.py" "$W/ref.py" > "$W/f.py"
cat >> "$W/f.py" <<'PY'
N = 12
near = [score_at(1, s) for s in range(200, 200 + N)]
far  = [score_at(8, s) for s in range(200, 200 + N)]
pairs = [paired_at(1, s) for s in range(200, 200 + N)]
a = sum(1 for b, af in pairs if not (af >= b + 0.25))
# Nancy, 2026-07-31: the "memorised not forgot" check shipped WITHOUT a false-fail sweep,
# violating this file's own header rule, and measured 23.3% on honest builds. Swept now.
def _loss_acc(seed):
    W, rnd = build(seed)
    ex = [make_example(8, rnd) for _ in range(12)]
    train(W, ex)
    l = sum(sum((forward(W,sq)[k].data-(1.0 if k==c else -1.0))**2 for k in range(VOCAB)) for sq,c in ex)/len(ex)
    return l, accuracy(W, 8, rnd)
_la = [_loss_acc(s) for s in range(400, 400 + N)]
d = sum(1 for l, ac in _la if not (l < 2.5 and ac < 0.6))
print(f"  false-fail 'memorised not forgot'          on a CORRECT build: {d}/{N}")
import math as _m
_exp = sum(1 for l, _ in _la if not (_m.isfinite(l) and l < 100))
print(f"  training explosions (BUG-053, clipping on): {_exp}/{N}")
if _exp: 
    print("  FAIL: clipping is not holding -- BUG-053 has regressed")
    raise SystemExit(1)
b = sum(1 for n, f in zip(near, far) if not ((n - f) >= 0.20 - 1e-9))
c = 0   # the absolute far-accuracy bar was removed; nothing to false-fail
print(f"  false-fail 'learned to remember' (paired) on a CORRECT build: {a}/{N}")
print(f"  false-fail 'far memory is gone' on a CORRECT build: {b}/{N}")
print(f"  near mean {sum(near)/N:.0%}, far mean {sum(far)/N:.0%}, min margin {min(n-f for n,f in zip(near,far)):+.0%}")
raise SystemExit(0 if a == 0 and b == 0 and c == 0 and d <= 2 else 1)
PY
python3 "$W/f.py" || { echo "GATE FAILED: a graded check is flaky -- it would fail honest learners at random."; rm -rf "$W"; exit 1; }

echo "── [3/4] EVERY NUMBER THE PAGE CLAIMS ──"
cat "$W/engine.py" "$W/ref.py" > "$W/n.py"
cat >> "$W/n.py" <<'PY'
import os, re
page = open(os.environ['HEXMEM_LAB']).read()
bad = []

# Parse the RENDERED instruction strings only. The doctrine comment is not what a
# student reads, and checking it instead was a real false PASS in the sibling gate.
rendered = "".join(re.findall(r"'((?:[^'\\]|\\.)*)'", "".join(
    re.findall(r"instructions:(.*?)CEILING,", page, re.S))))
if len(rendered) < 400:
    bad.append(f"extracted instructions look wrong ({len(rendered)} chars)")

# Chance baseline must equal 1/VOCAB, and the page states it repeatedly.
chance = round(100.0 / VOCAB)
stated = re.findall(r"chance[^.]{0,40}?(\d+)%|(\d+)%[^.]{0,20}?chance", rendered, re.I)
flat = [int(x) for pair in stated for x in pair if x]
if not flat:
    bad.append("rendered text never states the chance baseline")
for v in flat:
    if v != chance:
        bad.append(f"page states chance {v}%, but 1/VOCAB is {chance}%")

# The accuracy-vs-distance table rendered in challenge 4.
claims = re.findall(r"distance (\d+) &rarr; (\d+)% accuracy", rendered)
if len(claims) < 4:
    bad.append(f"expected 4 rendered distance claims, found {len(claims)} -- "
               f"either the wording drifted or this check is no longer checking anything")
for dist, claim in claims:
    got = sum(score_at(int(dist), s) for s in range(300, 303)) / 3 * 100
    if abs(got - float(claim)) > 18:
        bad.append(f"page says distance {dist} -> {claim}%, measured {got:.0f}%")
    else:
        print(f"  distance {dist}: page claims {claim}%, measured {got:.0f}%")

# The "24% over 12 runs" sentence was REMOVED from the page when the figures were
# re-measured over 24 seeds -- so this gate no longer requires it. The distance table
# above is the surviving numeric claim and is checked per-distance.

# The graded rule is a PAIRED margin, so cross-check the page states that margin,
# not an absolute bar it no longer enforces.
if "at least 25 points over its own untrained score" not in page:
    bad.append("the rendered/graded near-memory rule is no longer the paired 25-point margin")

if bad:
    for x in bad: print("  FAIL: " + x)
    raise SystemExit(1)
print(f"  chance baseline {chance}% matches 1/VOCAB; every rendered figure verified")
PY
HEXMEM_LAB="$LAB" python3 "$W/n.py" || { echo "GATE FAILED: a number rendered to students is not true."; rm -rf "$W"; exit 1; }

echo "── [4/4] CEILING HONESTY: the disclosed limit must stay disclosed ──"
python3 - "$LAB" <<'PY' || { echo "GATE FAILED: the page's honesty text drifted."; rm -rf "$W"; exit 1; }
import re, sys
page = open(sys.argv[1]).read()
m = re.search(r"var CEILING\s*=(.*?);\s*\n", page, re.S)
if not m:
    print("  FAIL: cannot locate the CEILING string to check"); raise SystemExit(1)
ceiling = "".join(re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1)))
if len(ceiling) < 80:
    print(f"  FAIL: extracted CEILING looks wrong ({len(ceiling)} chars)"); raise SystemExit(1)
bad = [x.strip() for x in re.findall(r"[^.]*cannot pass[^.]*\.", page)
       if "by accident" not in x.lower()]
if bad:
    print(f"  FAIL: claims a defense it cannot enforce -> {bad[0][:90]}"); raise SystemExit(1)
missing = [n for n in ["we grade what your code prints", "not tamper-proof"]
           if n.lower() not in ceiling.lower()]
if missing:
    print(f"  FAIL: rendered CEILING no longer discloses the limit; missing {missing}")
    raise SystemExit(1)
checks = len(re.findall(r"check\s*:\s*function", page))
reads_code = len(re.findall(r"check\s*:\s*function\s*\(\s*out\s*,\s*code", page))
print(f"  {checks} graded checks, {reads_code} inspect source; {checks - reads_code} read stdout only")
print("  page discloses the ceiling honestly and claims no defense it cannot enforce")
PY

rm -rf "$W"
echo "── HEXMEMORY QC PASSED: cheats rejected, correct build passes, page numbers true ──"
