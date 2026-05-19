#!/usr/bin/env bash
# regen.sh — regenerate walkthrough PDFs from .md sources with wrap-fix CSS.
#
# Problem this solves:
#   WeasyPrint at default font + portrait wraps long shell commands
#   (openssl, curl, etc.) at hyphen boundaries. When PDF rendering
#   wraps INSIDE a flag like `-in`, the line ends with `-` and the next
#   line starts with `in`. Copy-paste collapses the line break into a
#   space, producing `- in`. Lab terminals reject this with "Wrong
#   input file" / "Wrong key file" errors. Discovered on PIS-L06 step 3
#   on 2026-05-19.
#
# Fix: render at 8pt code font on A4 landscape. The 130–140 char commands
# in PIS labs fit on one line, so the wrap never happens.
#
# Usage:
#   _tools/walkthrough-pdf/regen.sh <file.md>           # single file
#   _tools/walkthrough-pdf/regen.sh <dir>               # all *-SOLUTION.md in dir
#   _tools/walkthrough-pdf/regen.sh --verify <file.pdf> # check ONE pdf for wraps
#   _tools/walkthrough-pdf/regen.sh --help              # show this header
#
# Requires: pandoc, weasyprint, pdfinfo, pdftotext.
#
# Exit codes:
#   0  success — all PDFs generated and verified wrap-free
#   1  pandoc/weasyprint/poppler missing OR a generated PDF still has wraps
#   2  input path doesn't exist
#   3  CSS asset missing

set -e

CSS_PATH="/home/eq/hexworth-shared/Solutions/_assets/walkthrough-pdf.css"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die()  { echo "ERROR: $*" >&2; exit "${2:-1}"; }
log()  { echo "[walkthrough-pdf] $*"; }
warn() { echo "[walkthrough-pdf] WARN: $*" >&2; }

# --- show help and exit if no args or --help ---
if [ $# -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    sed -n '2,/^$/p' "$0" | sed 's/^# \?//'
    exit 0
fi

# --- preflight: tools present ---
for tool in pandoc weasyprint pdfinfo pdftotext; do
    command -v "$tool" >/dev/null 2>&1 || die "$tool not found in PATH. Install: pandoc + weasyprint + poppler-utils."
done

# --- preflight: CSS asset present ---
[ -f "$CSS_PATH" ] || die "CSS asset missing at $CSS_PATH. Restore it before running this tool." 3

# --- verify mode: check one PDF for wrap-broken commands ---
if [ "$1" = "--verify" ]; then
    [ -n "${2:-}" ] || die "--verify needs a PDF path."
    [ -f "$2" ] || die "PDF not found: $2" 2
    wraps=$(pdftotext -layout "$2" - 2>/dev/null \
            | awk '/^(openssl|sudo|curl|gpg|ssh-keygen|wget|scp|rsync)/ && /-$/' \
            | wc -l)
    if [ "$wraps" -gt 0 ]; then
        echo "FAIL: $2 has $wraps wrap-broken command line(s):"
        pdftotext -layout "$2" - | awk '/^(openssl|sudo|curl|gpg|ssh-keygen|wget|scp|rsync)/ && /-$/'
        exit 1
    fi
    echo "OK: $2 — no wrap-broken commands."
    exit 0
fi

# --- regen mode: figure out if input is a file or a directory ---
input="$1"
[ -e "$input" ] || die "Input path not found: $input" 2

if [ -d "$input" ]; then
    # Sweep all *-SOLUTION.md in the directory.
    mapfile -t mds < <(find "$input" -maxdepth 1 -type f -name "*-SOLUTION.md" | sort)
    [ ${#mds[@]} -gt 0 ] || die "No *-SOLUTION.md files under $input"
    log "Sweeping ${#mds[@]} walkthroughs in $input"
else
    mds=("$input")
fi

# --- regen each file ---
fail=0
for md in "${mds[@]}"; do
    base=$(basename "$md" .md)
    # Title extraction: prefer PIS-LNN / ETH-LNN style prefix from filename.
    labid=$(echo "$base" | grep -oE "^[A-Z]+-L[0-9]+" || true)
    if [ -n "$labid" ]; then
        title="$labid Walkthrough"
    else
        # Fallback: use the first H1 of the .md.
        title=$(grep -m1 "^# " "$md" | sed 's/^# //' || echo "$base")
    fi
    out="${md%.md}.pdf"
    if pandoc "$md" -o "$out" \
        --pdf-engine=weasyprint \
        --css="$CSS_PATH" \
        -M title="$title" 2>/dev/null; then
        # Verify the generated PDF has no wraps.
        wraps=$(pdftotext -layout "$out" - 2>/dev/null \
                | awk '/^(openssl|sudo|curl|gpg|ssh-keygen|wget|scp|rsync)/ && /-$/' \
                | wc -l)
        pages=$(pdfinfo "$out" 2>/dev/null | awk '/^Pages:/ {print $2}')
        if [ "$wraps" -gt 0 ]; then
            warn "$out — generated but $wraps wrap-broken command line(s). Verify font size + page orientation in $CSS_PATH."
            fail=1
        else
            log "OK $(basename "$out") (pages=$pages, title=\"$title\")"
        fi
    else
        warn "pandoc failed for $md"
        fail=1
    fi
done

exit $fail
