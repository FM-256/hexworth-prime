#!/bin/bash
# HexToken QC. Extracts the ROUNDTRIP block from the page and proves both directions,
# AND verifies every NUMBER the page asserts (vocab 27, unknown-rate > 0, char seq
# more than 3x word seq). Gate 3 shipped a page claim that measurement contradicted;
# this gate exists so a claim can never be written without being checked.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LAB="$ROOT/_app/houses/ai/cortex/labs/hextoken-vocabulary.lab.html"
W=$(mktemp -d)
python3 - "$LAB" "$W/roundtrip.py" <<'PY'
import re, sys
h = open(sys.argv[1]).read()
m = re.search(r"var ROUNDTRIP = \[(.*?)\]\.join\('\\n'\);", h, re.S)
parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
open(sys.argv[2], 'w').write('\n'.join(p.replace("\\'", "'") for p in parts))
PY

cat > "$W/ref.py" <<'PY'
class CharTokenizer:
    def __init__(self, text):
        chars = sorted(set(text))
        self.stoi = {c: i for i, c in enumerate(chars)}
        self.itos = {i: c for c, i in self.stoi.items()}
    def encode(self, s): return [self.stoi[c] for c in s]
    def decode(self, ids): return "".join(self.itos[i] for i in ids)
PY

echo "── [1/3] ADVERSARIAL: broken codecs must FAIL ──"
# Cheat A: encode returns something decode cannot invert (a classic off-by-one).
cat > "$W/cheatA.py" <<'PY'
class CharTokenizer:
    def __init__(self, text):
        chars = sorted(set(text))
        self.stoi = {c: i for i, c in enumerate(chars)}
        self.itos = {i: c for c, i in self.stoi.items()}
    def encode(self, s): return [self.stoi[c] + 0 for c in s]
    def decode(self, ids): return "".join(self.itos.get(i - 1, "?") for i in ids)
PY
cat "$W/cheatA.py" "$W/roundtrip.py" > "$W/a.py"
echo 'roundtrip(CharTokenizer("the quick brown fox jumps over the lazy dog"))' >> "$W/a.py"
if python3 "$W/a.py" 2>&1 | grep -q "ROUNDTRIP PASS"; then
  echo "  CHEAT A PASSED -- a non-invertible codec satisfies ROUNDTRIP. Lab is broken."; rm -rf "$W"; exit 1
fi
echo "  cheat A (decode not the inverse of encode) rejected"
# Cheat B: decode ignores ids entirely and returns a constant.
cat > "$W/cheatB.py" <<'PY'
class CharTokenizer:
    def __init__(self, text):
        chars = sorted(set(text))
        self.stoi = {c: i for i, c in enumerate(chars)}
        self.itos = {i: c for c, i in self.stoi.items()}
    def encode(self, s): return [self.stoi[c] for c in s]
    def decode(self, ids): return "the lazy fox"
PY
cat "$W/cheatB.py" "$W/roundtrip.py" > "$W/b.py"
echo 'roundtrip(CharTokenizer("the quick brown fox jumps over the lazy dog"))' >> "$W/b.py"
if python3 "$W/b.py" 2>&1 | grep -q "ROUNDTRIP PASS"; then
  echo "  CHEAT B PASSED -- a constant-returning decode satisfies ROUNDTRIP. Lab is broken."; rm -rf "$W"; exit 1
fi
echo "  cheat B (decode returns a constant) rejected"

echo "── [2/3] WALKTHROUGH: the correct build must PASS ──"
cat "$W/ref.py" "$W/roundtrip.py" > "$W/r.py"
echo 'roundtrip(CharTokenizer("the quick brown fox jumps over the lazy dog"))' >> "$W/r.py"
OUT=$(python3 "$W/r.py" 2>&1); echo "$OUT" | sed 's/^/  /'
echo "$OUT" | grep -q "ROUNDTRIP PASS" || { echo "GATE FAILED: correct codec does not pass."; rm -rf "$W"; exit 1; }

echo "── [3/3] EVERY NUMBER THE PAGE CLAIMS ──"
python3 - <<'PY' || { echo "GATE FAILED: a number asserted on the page is wrong."; exit 1; }
CORPUS = "the quick brown fox jumps over the lazy dog"
v = len(sorted(set(CORPUS)))
print(f"  page claims vocab 27 -> actual {v}")
assert v == 27, v
TRAIN = ("the quick brown fox jumps over the lazy dog "
         "the dog barks and the fox runs away fast")
HELDOUT = "a clever fox outwits the sleeping hound"
words = sorted(set(TRAIN.split()))
stoi = {w: i for i, w in enumerate(words + ["<unk>"])}
w_ids = [stoi.get(w, stoi["<unk>"]) for w in HELDOUT.split()]
unk = sum(1 for i in w_ids if i == stoi["<unk>"]) / len(w_ids)
c_len = len(HELDOUT)
print(f"  page claims char seq > 3x word seq -> {c_len} vs {len(w_ids)}")
assert c_len > len(w_ids) * 3, (c_len, len(w_ids))
print(f"  page claims a nonzero unknown-rate -> {unk:.0%}")
assert unk > 0, unk
PY
rm -rf "$W"
echo "── HEXTOKEN QC PASSED: broken codecs rejected, correct build passes, page numbers true ──"
