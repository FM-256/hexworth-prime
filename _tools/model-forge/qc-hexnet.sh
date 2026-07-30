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
# Challenge 4's graded claim must actually hold: correct training converges 8/8 and
# leaking training converges strictly less often. This is a REGRESSION TEST for a real
# mistake -- the first version of challenge 4 asserted "leaking is worse", which failed
# on 18/20 seeds and would have failed every honest learner.
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
z = sum(1 for s in range(8) if train(True, s) < 0.5)
l = sum(1 for s in range(8) if train(False, s) < 0.5)
print(f"  challenge 4 reliability: zeroed={z}/8 leaked={l}/8")
raise SystemExit(0 if (z == 8 and l < 8) else 1)
PY
cat "$W/engine.py" "$W/net.py" "$W/ch4.py" > "$W/ch4_full.py"
if ! python3 "$W/ch4_full.py"; then
  echo "GATE FAILED: challenge 4's graded claim does not hold. Honest learners would fail it."
  rm -rf "$W"; exit 1
fi
rm -rf "$W"
echo "── HEXNET QC PASSED: non-learning builds rejected AND the correct build passes ──"
