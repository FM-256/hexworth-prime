#!/bin/bash
# HexTalk QC. Proves both directions in real python3 against the SHIPPED page:
#   adversarial -- argmax (non-sampling) and a uniform model must FAIL
#   walkthrough -- a correct reference implementation must PASS, repeatedly
#   numbers     -- every figure rendered on the page must be TRUE
#   ceiling     -- the disclosed limit must stay disclosed
#
# Built with the doctrine Gates 2-4 paid for across eight review rounds:
#   - measure against what SHIPS, never a convenient harness (HexNet shipped three
#     false claims that way)
#   - parse rendered figures out of the page and compare digit for digit, rather
#     than against constants maintained by hand (Nancy broke the hand-typed version)
#   - scope the ceiling check to the RENDERED string, not the whole file (Chris
#     found a false PASS where a non-rendered comment satisfied it)
#   - a stochastic check must have its false-fail rate MEASURED, not sampled once
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LAB="$ROOT/_app/houses/ai/cortex/labs/hextalk-bigram.lab.html"
W=$(mktemp -d)

# Extract the CORPUS block straight from the page so the corpus is never duplicated
# by hand. qc-hextoken phase 3 hand-duplicates its literals and Chris flagged it as
# latent drift; this gate does not repeat that.
python3 - "$LAB" "$W" <<'PY'
import re, sys
h = open(sys.argv[1]).read(); out = sys.argv[2]
m = re.search(r"var CORPUS = \[(.*?)\]\.join\('\\n'\);", h, re.S)
if not m:
    print("FATAL: cannot extract CORPUS from the page"); raise SystemExit(1)
parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
open(out + '/corpus.py', 'w').write('\n'.join(p.replace("\\'", "'") for p in parts))
PY
[ -s "$W/corpus.py" ] || { echo "FATAL: extracted corpus is empty"; rm -rf "$W"; exit 1; }

# Reference implementation -- the correct build the lab asks for.
cat > "$W/ref.py" <<'PY'
import math, random
counts = [[0] * V for _ in range(V)]
for a, b in zip(CORPUS, CORPUS[1:]):
    counts[STOI[a]][STOI[b]] += 1

def probabilities(smoothing):
    out = []
    for row in counts:
        t = sum(row) + smoothing * V
        out.append([(c + smoothing) / t for c in row])
    return out

P = probabilities(1.0)
UNIFORM = [[1.0 / V] * V for _ in range(V)]

def nll(table):
    tot = n = 0
    for a, b in zip(CORPUS, CORPUS[1:]):
        tot += -math.log(table[STOI[a]][STOI[b]]); n += 1
    return tot / n

def perplexity(table): return math.exp(nll(table))

def sample_index(row, temperature):
    if temperature != 1.0:
        adj = [p ** (1.0 / temperature) for p in row]
        s = sum(adj); row = [a / s for a in adj]
    r = random.random(); acc = 0.0
    for j, p in enumerate(row):
        acc += p
        if r <= acc: return j
    return len(row) - 1

def generate(n, temperature, start=" "):
    cur, out = STOI[start], []
    for _ in range(n):
        j = sample_index(P[cur], temperature)
        out.append(ITOS[j]); cur = j
    return "".join(out)

REAL_PAIRS = {(a, b) for a, b in zip(CORPUS, CORPUS[1:])}
def real_pair_share(text):
    pairs = list(zip(text, text[1:]))
    return sum(1 for p in pairs if p in REAL_PAIRS) / len(pairs)
PY

echo "── [1/4] ADVERSARIAL: non-sampling and untrained models must FAIL ──"
# Cheat A: argmax instead of sampling. This is the mistake the lab warns about, and
# challenge 4's "not deterministic" check exists specifically to catch it.
cat "$W/corpus.py" "$W/ref.py" > "$W/a.py"
cat >> "$W/a.py" <<'PY'
def sample_index(row, temperature):        # argmax -- no randomness at all
    return max(range(len(row)), key=lambda j: row[j])
a, b = generate(80, 1.0), generate(80, 1.0)
print("CHEAT_A_DETERMINISTIC:", a == b)
PY
if ! python3 "$W/a.py" 2>&1 | grep -q "CHEAT_A_DETERMINISTIC: True"; then
  echo "  GATE BROKEN: argmax was not detected as deterministic"; rm -rf "$W"; exit 1
fi
echo "  cheat A (argmax, never samples) is deterministic and fails the sampling check"

# Cheat B: a uniform model dressed as trained. Must not reach bigram perplexity.
cat "$W/corpus.py" "$W/ref.py" > "$W/b.py"
cat >> "$W/b.py" <<'PY'
print(f"CHEAT_B_PPL:{perplexity(UNIFORM):.2f}")
PY
BP=$(python3 "$W/b.py" | sed -n 's/.*CHEAT_B_PPL:\([0-9.]*\).*/\1/p')
if python3 -c "raise SystemExit(0 if abs($BP - 10.75) < 0.6 else 1)"; then
  echo "  GATE BROKEN: an untrained model reached the bigram perplexity band"; rm -rf "$W"; exit 1
fi
echo "  cheat B (untrained uniform model, perplexity $BP) cannot reach the bigram band"

echo "── [2/4] WALKTHROUGH: the correct build must PASS ──"
cat "$W/corpus.py" "$W/ref.py" > "$W/w.py"
cat >> "$W/w.py" <<'PY'
print(f"  vocabulary: {V}")
print(f"  pairs counted: {sum(sum(r) for r in counts)} expect {len(CORPUS)-1}")
assert sum(sum(r) for r in counts) == len(CORPUS) - 1
assert counts[STOI['t']][STOI['h']] > 0 and counts[STOI['t']][STOI['q']] == 0
assert all(abs(sum(r) - 1.0) < 1e-9 for r in P)
assert sum(1 for r in probabilities(0.0) for p in r if p == 0.0) > 0
assert sum(1 for r in P for p in r if p == 0.0) == 0
assert 0.0 < P[STOI['q']][STOI['x']] < 0.05
print(f"  uniform perplexity: {perplexity(UNIFORM):.2f}")
print(f"  bigram  perplexity: {perplexity(P):.2f}")
assert set(generate(300, 1.0)) <= set(CHARS)
PY
python3 "$W/w.py" || { echo "GATE FAILED: the correct build does not pass."; rm -rf "$W"; exit 1; }

# A stochastic check must have its false-fail rate MEASURED. HexNet shipped a gate
# that failed honest learners 5% of runs because it was sampled exactly once.
cat "$W/corpus.py" "$W/ref.py" > "$W/f.py"
cat >> "$W/f.py" <<'PY'
random.seed(20260730)
N = 60
det  = sum(1 for _ in range(N) if generate(80, 1.0) == generate(80, 1.0))
cold = sum(1 for _ in range(N)
           if not (sum(real_pair_share(generate(300, 0.2)) for _ in range(5)) / 5 >
                   sum(real_pair_share(generate(300, 5.0)) for _ in range(5)) / 5 + 0.25))
warm = sum(1 for _ in range(N)
           if (sum(real_pair_share(generate(300, 0.2)) for _ in range(5)) / 5) < 0.80)
print(f"  false-fail 'not deterministic' on a CORRECT build: {det}/{N}")
print(f"  false-fail 'cold plays safer'   on a CORRECT build: {cold}/{N}")
print(f"  false-fail 'cold >= 80%'        on a CORRECT build: {warm}/{N}")
raise SystemExit(0 if det == 0 and cold == 0 and warm == 0 else 1)
PY
python3 "$W/f.py" || { echo "GATE FAILED: a graded check is flaky -- it would fail honest learners at random."; rm -rf "$W"; exit 1; }

echo "── [3/4] EVERY NUMBER THE PAGE CLAIMS ──"
# Parse the rendered figures out of the page and compare digit for digit against
# fresh execution. Not against constants kept in sync by hand.
cat "$W/corpus.py" "$W/ref.py" > "$W/n.py"
cat >> "$W/n.py" <<'PY'
import os, re
page = open(os.environ['HEXTALK_LAB']).read()
bad = []

m = re.search(r"vocabulary\s+(\d+) characters", page)
if not m: bad.append("cannot find the claimed vocabulary size")
elif int(m.group(1)) != V: bad.append(f"page says vocabulary {m.group(1)}, measured {V}")

pu, pb = perplexity(UNIFORM), perplexity(P)
m = re.search(r"uniform \(untrained\) perplexity\s+([\d.]+)", page)
if not m: bad.append("cannot find the claimed uniform perplexity")
elif abs(float(m.group(1)) - pu) > 0.01: bad.append(f"page says uniform {m.group(1)}, measured {pu:.2f}")

m = re.search(r"bigram perplexity \(add-1\)\s+([\d.]+)", page)
if not m: bad.append("cannot find the claimed bigram perplexity")
elif abs(float(m.group(1)) - pb) > 0.05: bad.append(f"page says bigram {m.group(1)}, measured {pb:.2f}")

m = re.search(r"improvement\s+([\d.]+)x", page)
if not m: bad.append("cannot find the claimed improvement factor")
elif abs(float(m.group(1)) - pu / pb) > 0.05: bad.append(f"page says {m.group(1)}x, measured {pu/pb:.2f}x")

# The temperature table the page renders to students, checked at its own stated temps.
random.seed(4242)
def share_at(t, trials=8):
    return sum(real_pair_share(generate(300, t)) for _ in range(trials)) / trials
for temp, claim in re.findall(r"temp (\d+\.\d+) &rarr; ([\d.]+)% real pairs", page):
    got = share_at(float(temp)) * 100
    if abs(got - float(claim)) > 6:
        bad.append(f"page says temp {temp} -> {claim}% real pairs, measured {got:.1f}%")
    else:
        print(f"  temp {temp}: page claims {claim}% real pairs, measured {got:.1f}%")

print(f"  vocabulary {V}; uniform {pu:.2f} (= vocab size); bigram {pb:.2f}; {pu/pb:.2f}x")
if bad:
    for b in bad: print("  FAIL: " + b)
    raise SystemExit(1)
PY
HEXTALK_LAB="$LAB" python3 "$W/n.py" || { echo "GATE FAILED: a number rendered to students is not true."; rm -rf "$W"; exit 1; }

echo "── [4/4] CEILING HONESTY: the disclosed limit must stay disclosed ──"
python3 - "$LAB" <<'PY' || { echo "GATE FAILED: the page's honesty text drifted."; rm -rf "$W"; exit 1; }
import re, sys
page = open(sys.argv[1]).read()
# Scope to the RENDERED string. Chris found a false PASS in the sibling gate where a
# non-rendered doctrine comment satisfied a whole-file grep.
m = re.search(r"var CEILING\s*=(.*?);\s*\n", page, re.S)
if not m:
    print("  FAIL: cannot locate the CEILING string to check"); raise SystemExit(1)
ceiling = "".join(re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1)))
if len(ceiling) < 80:
    print(f"  FAIL: extracted CEILING looks wrong ({len(ceiling)} chars)"); raise SystemExit(1)
# Overclaim scan stays page-wide on purpose: a comment overclaim steers the next edit,
# which is exactly how the CEILING overclaim propagated from HexNet into HexToken.
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
echo "── HEXTALK QC PASSED: cheats rejected, correct build passes, page numbers true ──"
