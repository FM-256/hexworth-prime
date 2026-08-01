#!/bin/bash
# HexGrad QC. Extracts the lab's VERIFICATION BLOCK straight from the page and runs it
# against (a) a correct reference engine, which must pass, and (b) the two shortcuts a
# learner would actually try, which must fail.
#
# Same doctrine as the OpenStack labs: a walkthrough proves the lab is COMPLETABLE; only
# an adversarial pass proves it is not BEATABLE. Both, or it does not ship.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LAB="$ROOT/_app/houses/ai/cortex/labs/hexgrad-engine.lab.html"
W=$(mktemp -d)
python3 - "$LAB" "$W/verify.py" <<'PY'
import re, sys
h = open(sys.argv[1]).read()
m = re.search(r"var VERIFY = \[(.*?)\]\.join\('\\n'\);", h, re.S)
parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
open(sys.argv[2], 'w').write('\n'.join(p.replace("\\'", "'") for p in parts))
PY
cp "$ROOT/_tools/model-forge/hexgrad-reference.py" "$W/ref.py"

echo "── [1/2] ADVERSARIAL: shortcuts must FAIL ──"
# Cheat A: print the answer, build nothing.
printf 'import math\nprint("GRADCHECK 6/6")\n' > "$W/cheatA.py"
if grep -qE 'class[[:space:]]+Value' "$W/cheatA.py"; then echo "  CHEAT A structural check WRONGLY passes"; exit 1; fi
echo "  cheat A (print the answer) rejected by structural checks"
# Cheat B: the += -> = accumulation bug, which is the bug the lab teaches.
sed 's/self\.grad += other\.data \* out\.grad/self.grad = other.data * out.grad/' "$W/ref.py" > "$W/cheatB_engine.py"
cat "$W/cheatB_engine.py" "$W/verify.py" > "$W/cheatB.py"
if python3 "$W/cheatB.py" 2>&1 | grep -q "GRADCHECK 6/6"; then
  echo "  CHEAT B PASSED -- the accumulation bug is not detected. Lab is broken."; exit 1
fi
echo "  cheat B (grad = instead of +=) rejected by GRADCHECK"

echo "── [2/2] WALKTHROUGH: the correct engine must PASS ──"
cat "$W/ref.py" "$W/verify.py" > "$W/ref_full.py"
OUT=$(python3 "$W/ref_full.py" 2>&1)
echo "$OUT" | sed 's/^/  /'
if ! echo "$OUT" | grep -q "GRADCHECK 6/6"; then
  echo "GATE FAILED: a correct engine does not pass. The lab is uncompletable."; rm -rf "$W"; exit 1
fi
rm -rf "$W"

# [3/3] THE JAVASCRIPT HALF. Steps 1 and 2 above extract and run the page's PYTHON verification
# block. accumulates() and builtRealEngine() are JAVASCRIPT, living in the challenge tests[] arrays,
# and nothing here touched them -- so this gate could print PASSED with the JS grading broken.
# Nancy raised that as taskboard #256, and it is not hypothetical: the FIRST accumulates() matched
# only `.grad +=` and therefore FAILED an honest engine that wrote `self.grad = self.grad + x` and
# scored GRADCHECK 6/6. A false negative blocks a learner who did everything right.
echo "── [3/3] JS GRADING: honest spellings credited, shortcuts rejected ──"
if ! node "$ROOT/_tools/model-forge/qc-js-checks.js" "$LAB"; then
  echo "GATE FAILED: the lab's JavaScript grading regressed."; exit 1
fi

echo "── HEXGRAD QC PASSED: shortcuts rejected, the correct build passes, JS grading intact ──"
