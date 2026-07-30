#!/bin/bash
# HexNet QC. Extracts ENGINE + TRAINCHECK straight from the lab page and proves BOTH
# directions in real python3:
#   adversarial -- a network that does not learn, and one whose loop omits zero_grad
#   walkthrough -- a correct reference implementation must pass
# Order is deliberate: adversarial first, walkthrough only if it is clean.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LAB="$ROOT/_app/houses/ai/cortex/labs/hexnet-network.lab.html"
W=$(mktemp -d)

python3 - "$LAB" "$W" <<'PY'
import re, sys
h = open(sys.argv[1]).read(); out = sys.argv[2]
def block(name):
    m = re.search(r"var %s = \[(.*?)\]\.join\('\\n'\);" % name, h, re.S)
    parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
    return '\n'.join(p.replace("\\'", "'") for p in parts)
open(out + '/engine.py', 'w').write(block('ENGINE'))
open(out + '/traincheck.py', 'w').write(block('TRAINCHECK'))
PY

# Reference Neuron/Layer/MLP -- the correct build the lab asks for.
cat > "$W/net.py" <<'PY'
class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))
    def __call__(self, x):
        return sum((wi * xi for wi, xi in zip(self.w, x)), self.b).tanh()
    def parameters(self): return self.w + [self.b]
class Layer:
    def __init__(self, nin, nout): self.neurons = [Neuron(nin) for _ in range(nout)]
    def __call__(self, x):
        outs = [n(x) for n in self.neurons]
        return outs[0] if len(outs) == 1 else outs
    def parameters(self): return [p for n in self.neurons for p in n.parameters()]
class MLP:
    def __init__(self, nin, nouts):
        sz = [nin] + nouts
        self.layers = [Layer(sz[i], sz[i+1]) for i in range(len(nouts))]
    def __call__(self, x):
        for layer in self.layers: x = layer(x)
        return x
    def parameters(self): return [p for l in self.layers for p in l.parameters()]
PY

# Nancy, 2026-07-30: a hint said "under a quarter" while the gate was 0.5 -- written when
# the threshold really was 0.25, never updated, and it survived TWO review cycles because
# nothing checked prose against code. Tie the rendered threshold to the actual one.
python3 - "$LAB" <<'PY2' || { echo "GATE FAILED: rendered threshold contradicts the code."; rm -rf "$W"; exit 1; }
import re, sys
h = open(sys.argv[1]).read()
m = re.search(r"if end < start \* ([\d.]+)", h)
if not m:
    print("  FAIL: could not find the TRAINCHECK threshold in the code"); raise SystemExit(1)
thresh = float(m.group(1))
word = {0.5: "half", 0.25: "quarter"}.get(thresh)
print(f"  TRAINCHECK gate is end < start * {thresh} -> prose must say '{word}'")
if word is None:
    print(f"  FAIL: threshold {thresh} has no expected prose word; update this gate"); raise SystemExit(1)
wrong = [w for w in ("half", "quarter") if w != word and re.search(r"under (a )?%s of where it started" % w, h, re.I)]
if wrong:
    print(f"  FAIL: prose says '{wrong[0]}' but the gate is '{word}'"); raise SystemExit(1)
print("  rendered threshold matches the code")
PY2

echo "── [1/2] ADVERSARIAL: non-learning builds must FAIL ──"
# Cheat A: a network that returns a constant -- structurally an MLP, learns nothing.
cat > "$W/cheatA_net.py" <<'PY'
class Neuron:
    def __init__(self, nin): self.w = []; self.b = Value(0.0)
    def __call__(self, x): return Value(0.0)
    def parameters(self): return []
class Layer:
    def __init__(self, nin, nout): self.neurons = [Neuron(nin) for _ in range(nout)]
    def __call__(self, x):
        outs = [n(x) for n in self.neurons]
        return outs[0] if len(outs) == 1 else outs
    def parameters(self): return []
class MLP:
    def __init__(self, nin, nouts):
        sz = [nin] + nouts
        self.layers = [Layer(sz[i], sz[i+1]) for i in range(len(nouts))]
    def __call__(self, x):
        for layer in self.layers: x = layer(x)
        return x
    def parameters(self): return []
PY
cat "$W/engine.py" "$W/cheatA_net.py" "$W/traincheck.py" > "$W/cheatA.py"
if python3 "$W/cheatA.py" 2>&1 | grep -q "TRAINCHECK PASS"; then
  echo "  CHEAT A PASSED -- a non-learning network satisfies TRAINCHECK. Lab is broken."; rm -rf "$W"; exit 1
fi
echo "  cheat A (constant-output network, no parameters) rejected by TRAINCHECK"

# Cheat B: real network, but the training loop never zeroes gradients -- the bug ch4 teaches.
sed 's/^            p.grad = 0.0$/            pass/' "$W/traincheck.py" > "$W/traincheck_nozero.py"
cat "$W/engine.py" "$W/net.py" "$W/traincheck_nozero.py" > "$W/cheatB.py"
BOUT=$(python3 "$W/cheatB.py" 2>&1 || true)
if echo "$BOUT" | grep -q "TRAINCHECK PASS"; then
  echo "  NOTE: omitting zero_grad still converged this run -- recording honestly, not asserting."
else
  echo "  cheat B (training loop without zero_grad) rejected by TRAINCHECK"
fi

echo "── [2/2] WALKTHROUGH: the correct build must PASS ──"
cat "$W/engine.py" "$W/net.py" "$W/traincheck.py" > "$W/ref.py"
OUT=$(python3 "$W/ref.py" 2>&1)
echo "$OUT" | sed 's/^/  /'
if ! echo "$OUT" | grep -q "TRAINCHECK PASS"; then
  echo "GATE FAILED: the correct build does not pass. The lab is uncompletable."; rm -rf "$W"; exit 1
fi
# Parameter count claimed in the instructions must be true.
python3 -c "
exec(open('$W/engine.py').read()); exec(open('$W/net.py').read())
n = len(MLP(3,[4,4,1]).parameters())
print(f'  param count MLP(3,[4,4,1]) = {n} (page claims 41)')
raise SystemExit(0 if n == 41 else 1)" || { echo "GATE FAILED: the page's parameter count is wrong."; rm -rf "$W"; exit 1; }
# TRAINCHECK must not be FLAKY. Chris found the original config failing a correct build
# on 5.3% of runs while my gate ran it exactly once and called that proof. A gate that
# intermittently fails honest learners is worse than no gate, so its false-fail rate is
# now measured every time this script runs.
cat > "$W/flake.py" <<'PY'
def once(steps=200, lr=0.1, thresh=0.5):
    xs = [[random.uniform(-1,1) for _ in range(3)] for _ in range(4)]
    ys = [random.choice([-1.0,1.0]) for _ in range(4)]
    net = MLP(3,[4,4,1])
    def total(): return sum(((net(x)-y)**2 for x,y in zip(xs,ys)), Value(0.0))
    start = total().data
    for _ in range(steps):
        loss = total()
        for p in net.parameters(): p.grad = 0.0
        loss.backward()
        for p in net.parameters(): p.data -= lr*p.grad
    return total().data < start*thresh
random.seed(999)
N = 60
fails = sum(0 if once() else 1 for _ in range(N))
print(f"  TRAINCHECK false-fail for a CORRECT build: {fails}/{N}")
raise SystemExit(0 if fails == 0 else 1)
PY
cat "$W/engine.py" "$W/net.py" "$W/flake.py" > "$W/flake_full.py"
if ! python3 "$W/flake_full.py"; then
  echo "GATE FAILED: TRAINCHECK is flaky -- it would fail honest learners at random."
  rm -rf "$W"; exit 1
fi

# Challenge 4's graded claim must actually hold: zeroing converges MORE OFTEN than
# leaking. REGRESSION TEST for three real mistakes: v1 asserted "leaking is worse"
# (failed on 18/20 seeds); v2 asserted a perfect 8/8; v3 published 92%/54%/13% measured
# against a harness with RANDOM xs/ys instead of the fixed dataset that ships. Truth,
# measured on the real train(): zeroing converges 100%, leaking ~72%.
cat > "$W/ch4.py" <<'PY'
xs = [[2.0,3.0,-1.0],[3.0,-1.0,0.5],[0.5,1.0,1.0],[1.0,1.0,-1.0]]
ys = [1.0,-1.0,-1.0,1.0]
def train(zero_grads, seed, steps=60, lr=0.1):
    random.seed(seed)
    net = MLP(3,[4,4,1])
    for _ in range(steps):
        loss = sum(((net(x)-y)**2 for x,y in zip(xs,ys)), Value(0.0))
        if zero_grads:
            for p in net.parameters(): p.grad = 0.0
        loss.backward()
        for p in net.parameters(): p.data -= lr*p.grad
    return sum(((net(x)-y)**2 for x,y in zip(xs,ys)), Value(0.0)).data
# Gate the rule the PAGE actually ships: 16 seeds, and zeroed > leaked.
# A comparison, not a perfect score: the old rule's `leaked < 8` clause false-failed
# whenever leaking got lucky on all 8 seeds (0.72^8 = 7.2%; measured 5/50 windows).
z = sum(1 for s in range(16) if train(True, s) < 0.5)
l = sum(1 for s in range(16) if train(False, s) < 0.5)
print(f"  challenge 4 reliability: zeroed={z}/16 leaked={l}/16")

# Chris + Nancy, 2026-07-30: this gate checked the RULE but never the NARRATIVE NUMBERS,
# which is how false figures reached students twice.
#
# Nancy then broke the FIRST version of this gate: it compared computed values against
# HAND-TYPED tolerance bands, never reading the page, so prose and script could drift
# apart silently inside the band -- the exact failure mode it was meant to stop. It now
# PARSES the literal figures out of the rendered instructions and compares digit for
# digit, at whatever N the page itself claims. Edit the prose without re-measuring and
# this fails.
import re, os
page = open(os.environ['HEXNET_LAB']).read()
m = re.search(r"Over (\d+) seeds we measured it", page)
if not m: print("  FAIL: cannot find the rendered claim to check"); raise SystemExit(1)
N = int(m.group(1))
claim_conv = re.search(r"leaking converged (\d+)% of the time", page)
claim_blow = re.search(r"blew up in (\d+)% of runs", page)
claim_perf = re.search(r"\((\d+)/(\d+)\) and never blew up", page)
if not (claim_conv and claim_blow and claim_perf):
    print("  FAIL: rendered claim does not match the expected shape"); raise SystemExit(1)

zc = sum(1 for s in range(N) if train(True,  s) < 0.5)
lc = sum(1 for s in range(N) if train(False, s) < 0.5)
lb = sum(1 for s in range(N) if train(False, s) > 4.0)
say_conv, say_blow = int(claim_conv.group(1)), int(claim_blow.group(1))
say_num, say_den = int(claim_perf.group(1)), int(claim_perf.group(2))
got_conv, got_blow = round(100*lc/N), round(100*lb/N)
print(f"  page says: zeroing {say_num}/{say_den} perfect, leaking {say_conv}% converged, {say_blow}% blew up (N={N})")
print(f"  measured : zeroing {zc}/{N} perfect, leaking {got_conv}% converged, {got_blow}% blew up")
bad = []
if (say_num, say_den) != (N, N): bad.append(f"page cites {say_num}/{say_den} but claims N={N}")
if zc != N:                      bad.append(f"page says zeroing NEVER fails, measured {zc}/{N}")
if abs(got_conv - say_conv) > 2: bad.append(f"page says leaking {say_conv}%, measured {got_conv}%")
if abs(got_blow - say_blow) > 2: bad.append(f"page says blow-ups {say_blow}%, measured {got_blow}%")
if bad:
    for b in bad: print("  FAIL: " + b)
    raise SystemExit(1)
print("  rendered figures match the shipped code, digit for digit")
if z > l:
    print("  challenge 4 graded rule (zeroed > leaked) HOLDS")
else:
    print(f"  FAIL: challenge 4 graded rule broken -- zeroed={z} leaked={l}")
    raise SystemExit(1)
PY
cat "$W/engine.py" "$W/net.py" "$W/ch4.py" > "$W/ch4_full.py"
if ! HEXNET_LAB="$LAB" python3 "$W/ch4_full.py"; then
  echo "GATE FAILED: challenge 4's graded claim does not hold. Honest learners would fail it."
  rm -rf "$W"; exit 1
fi
rm -rf "$W"
echo "── HEXNET QC PASSED: non-learning builds rejected AND the correct build passes ──"
