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

echo "── [1/4] ADVERSARIAL: broken codecs must FAIL ──"
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

echo "── [2/4] WALKTHROUGH: the correct build must PASS ──"
cat "$W/ref.py" "$W/roundtrip.py" > "$W/r.py"
echo 'roundtrip(CharTokenizer("the quick brown fox jumps over the lazy dog"))' >> "$W/r.py"
OUT=$(python3 "$W/r.py" 2>&1); echo "$OUT" | sed 's/^/  /'
echo "$OUT" | grep -q "ROUNDTRIP PASS" || { echo "GATE FAILED: correct codec does not pass."; rm -rf "$W"; exit 1; }

echo "── [3/4] EVERY NUMBER THE PAGE CLAIMS ──"
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
# ── [4/4] CEILING HONESTY ────────────────────────────────────────────────────────
# Nancy, 2026-07-30: phase 1 only tested cheats INSIDE the roundtrip harness -- both
# still built a real tokenizer. It never tried the attack a student would actually
# reach for: delete everything, print the expected literals. She did, and passed all
# four challenges in under five minutes.
#
# That attack CANNOT be blocked -- grading matches stdout, so printing the pass string
# is always sufficient. This is inherent to client-side grading, not a HexToken bug.
# So this phase does not try to stop it. It proves the hole is REAL, then enforces that
# the page keeps DISCLOSING it. If someone later restores a "cannot pass" style claim,
# this fails the build.
echo "── [4/4] CEILING HONESTY: the disclosed limit must stay disclosed ──"
python3 - "$LAB" <<'PY2' || { echo "GATE FAILED: the page's honesty text drifted."; rm -rf "$W"; exit 1; }
import re, sys
page = open(sys.argv[1]).read()

# Grading matches stdout, so a literal print always satisfies an output check. Nancy
# demonstrated it: five print statements passed all four challenges. That cannot be
# fixed client-side, so this gate does not try. It enforces DISCLOSURE instead.
checks = len(re.findall(r"check\s*:\s*function", page))
reads_code = len(re.findall(r"check\s*:\s*function\s*\(\s*out\s*,\s*code", page))
print(f"  {checks} graded checks, {reads_code} inspect source; {checks - reads_code} read stdout only")
if checks == 0:
    print("  FAIL: no graded checks found -- gate cannot verify anything"); raise SystemExit(1)

# Any "cannot pass" claim must be hedged with "by accident".
bad = [m.strip() for m in re.findall(r"[^.]*cannot pass[^.]*\.", page)
       if "by accident" not in m.lower()]
if bad:
    print(f"  FAIL: claims a defense it cannot enforce -> {bad[0][:90]}"); raise SystemExit(1)

# CEILING must keep stating the real limit.
needed = ["we grade what your code prints", "not tamper-proof"]
missing = [n for n in needed if n.lower() not in page.lower()]
if missing:
    print(f"  FAIL: CEILING no longer discloses the limit; missing {missing}"); raise SystemExit(1)
print("  page discloses the ceiling honestly and claims no defense it cannot enforce")
PY2

rm -rf "$W"
echo "── HEXTOKEN QC PASSED: broken codecs rejected, correct build passes, page numbers true ──"
