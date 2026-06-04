#!/usr/bin/env bash
# regen.sh — regenerate walkthrough PDF + HTML from .md sources.
#
# This script produces TWO outputs per markdown source:
#   <name>.pdf   — A4 landscape, 8pt code font, wrap-safe shell commands.
#                  For print + clipboard-safe copy/paste in classroom.
#   <name>.html  — Browser-friendly, self-contained, embedded CSS,
#                  auto-generated TOC, syntax-highlighted code blocks.
#                  Single file — can be emailed or shared without
#                  external dependencies.
#
# (Script path preserved as `_tools/walkthrough-pdf/` for backward
#  compatibility with existing references — it produces both formats
#  now, not PDF only.)
#
# Problem PDF generation solves:
#   WeasyPrint at default font + portrait wraps long shell commands
#   (openssl, curl, etc.) at hyphen boundaries. When PDF rendering
#   wraps INSIDE a flag like `-in`, the line ends with `-` and the next
#   line starts with `in`. Copy-paste collapses the line break into a
#   space, producing `- in`. Lab terminals reject this with "Wrong
#   input file" / "Wrong key file" errors. Discovered on PIS-L06 step 3
#   on 2026-05-19.
#
#   Fix: render at 8pt code font on A4 landscape. The 130–140 char
#   commands in PIS labs fit on one line, so the wrap never happens.
#
# Why HTML too:
#   Operators / instructors want to share walkthroughs by email, embed
#   in a course portal, or open in a browser without PDF readers.
#   HTML is the universal-share format. Added 2026-06-04 after the
#   PIS-FINAL Patient Zero polish marathon — students needed a third
#   format alongside the .md source and the .pdf print copy.
#
# Usage:
#   regen.sh <file.md>                  generate <file>.pdf AND <file>.html
#   regen.sh <dir>                      sweep all *-SOLUTION.md in dir
#   regen.sh --pdf-only <file-or-dir>   PDF only (legacy behavior)
#   regen.sh --html-only <file-or-dir>  HTML only
#   regen.sh --verify <file.pdf>        check ONE pdf for wrap-broken commands
#   regen.sh --help                     show this header
#
# Requires: pandoc, weasyprint, pdfinfo, pdftotext.
#
# Exit codes:
#   0  success — all outputs generated (and PDFs verified wrap-free)
#   1  tooling missing OR a generated PDF still has wraps OR pandoc failed
#   2  input path doesn't exist
#   3  CSS asset missing

set -e

CSS_PDF="/home/eq/hexworth-shared/Solutions/_assets/walkthrough-pdf.css"
CSS_HTML="/home/eq/hexworth-shared/Solutions/_assets/walkthrough-html.css"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die()  { echo "ERROR: $*" >&2; exit "${2:-1}"; }
log()  { echo "[walkthrough-regen] $*"; }
warn() { echo "[walkthrough-regen] WARN: $*" >&2; }

# --- show help and exit if no args or --help ---
if [ $# -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    sed -n '2,/^$/p' "$0" | sed 's/^# \?//'
    exit 0
fi

# --- parse format-selection flags ---
DO_PDF=1
DO_HTML=1
case "$1" in
    --pdf-only)  DO_HTML=0; shift ;;
    --html-only) DO_PDF=0;  shift ;;
esac
[ $# -ge 1 ] || die "After format flag, give a .md file or directory."

# --- preflight: tools present ---
need_tools=(pandoc)
[ $DO_PDF  -eq 1 ] && need_tools+=(weasyprint pdfinfo pdftotext)
for tool in "${need_tools[@]}"; do
    command -v "$tool" >/dev/null 2>&1 || die "$tool not found in PATH. Install: pandoc + weasyprint + poppler-utils."
done

# --- preflight: CSS assets present (only the ones we'll use) ---
[ $DO_PDF  -eq 1 ] && { [ -f "$CSS_PDF" ]  || die "PDF CSS missing at $CSS_PDF. Restore it before running this tool." 3; }
[ $DO_HTML -eq 1 ] && { [ -f "$CSS_HTML" ] || die "HTML CSS missing at $CSS_HTML. Restore it before running this tool." 3; }

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

    # --- PDF ---
    if [ $DO_PDF -eq 1 ]; then
        out_pdf="${md%.md}.pdf"
        if pandoc "$md" -o "$out_pdf" \
            --pdf-engine=weasyprint \
            --css="$CSS_PDF" \
            -M title="$title" 2>/dev/null; then
            wraps=$(pdftotext -layout "$out_pdf" - 2>/dev/null \
                    | awk '/^(openssl|sudo|curl|gpg|ssh-keygen|wget|scp|rsync)/ && /-$/' \
                    | wc -l)
            pages=$(pdfinfo "$out_pdf" 2>/dev/null | awk '/^Pages:/ {print $2}')
            if [ "$wraps" -gt 0 ]; then
                warn "$out_pdf — generated but $wraps wrap-broken command line(s). Verify font size + page orientation in $CSS_PDF."
                fail=1
            else
                log "OK $(basename "$out_pdf") (pages=$pages)"
            fi
        else
            warn "pandoc PDF failed for $md"
            fail=1
        fi
    fi

    # --- HTML ---
    if [ $DO_HTML -eq 1 ]; then
        out_html="${md%.md}.html"
        if pandoc "$md" -o "$out_html" \
            --standalone \
            --embed-resources \
            --toc \
            --toc-depth=3 \
            --highlight-style=tango \
            --metadata title="$title" \
            --css="$CSS_HTML" 2>/dev/null; then
            bytes=$(wc -c < "$out_html")
            log "OK $(basename "$out_html") (${bytes} bytes, self-contained)"
        else
            warn "pandoc HTML failed for $md"
            fail=1
        fi
    fi
done

exit $fail
