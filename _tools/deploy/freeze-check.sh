#!/usr/bin/env bash
#
# @catalog what    Content-hash freeze check that SEES gitignored paths, which git status cannot
# @catalog run     _tools/deploy/freeze-check.sh snapshot _tools/hexos _app/hex  |  freeze-check.sh verify
# @catalog status  TOOL
#
# WHY THIS EXISTS (task 337, 2026-09-03)
# -------------------------------------
# I told the operator the tree was frozen before a Nancy round. It was not: four reviewer probe
# files sat in _tools/hexos the whole time. My check was `git status --short -- _tools/hexos`,
# which printed nothing, and I read "prints nothing" as "nothing is there."
#
# `_tools/` is gitignored (.gitignore:48). For an ignored path git status is silent BY DESIGN.
# And `--ignored` does not rescue it: that flag lists what IS ignored, never what CHANGED, because
# git keeps no baseline for a file it does not track. So for these paths there is no git question
# whose answer is "did this change since I looked?" -- the baseline has to be ours. Hence sha256.
#
# FAIL CLOSED. Everything here is built so that the ONLY way to print FROZEN is to have actually
# compared a well-formed baseline against a freshly-hashed disk. Round 1 of this script did not
# hold that line: Nancy truncated the manifest to 0 bytes and `verify` printed
# "FROZEN: 0 file(s) under [] byte-identical to snapshot" and exited 0, while a real modification
# sat on disk undetected. The watched list came back empty, hashing zero paths produced nothing,
# and "nothing equals nothing" satisfied the comparison vacuously. A gate that answers "frozen"
# when its own baseline has evaporated is worse than no gate, because it launders an assertion
# into a receipt. Every degraded-baseline path below now exits 2 (ERROR), never 0.
#
# The three exit codes are a contract callers depend on:
#   0 = compared, and identical      1 = compared, and DIFFERENT      2 = could not compare
# Never collapse 2 into 0.

set -uo pipefail

# FREEZE_ROOT / FREEZE_MANIFEST exist so freeze-check.selftest.sh can drive this script against a
# throwaway tree and a throwaway baseline. Without them the self-test would have to overwrite the
# real manifest to test it, which means the act of testing the gate destroys the gate's own state.
# Not for operational use: leave both unset and the defaults below are the repo and its manifest.
ROOT="${FREEZE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
MANIFEST="${FREEZE_MANIFEST:-$ROOT/_tools/deploy/.freeze-manifest}"
LOCKDIR="$MANIFEST.lock"

die() { echo "  ERROR: $*" >&2; exit 2; }

# Paths that legitimately churn while a suite runs, and would make every verify a false alarm.
# Kept narrow on purpose: over-pruning here recreates the exact blindness this tool removes.
is_noise() {
    case "$1" in
        */node_modules/*|*/.git/*|*/__pycache__/*|*.pyc) return 0 ;;
        # The manifest AND every scratch file this script writes beside it. Watching _tools/deploy
        # (where the manifest lives) otherwise makes the tool report its own temp files as changes
        # -- verify would print "+ .freeze-manifest.now.1456473" and never come back clean.
        */.freeze-manifest*)                             return 0 ;;
        */.deploy-in-progress)                           return 0 ;;
        *)                                               return 1 ;;
    esac
}

# Hash every regular file under the given paths -- find, NOT git ls-files, because git ls-files
# omits exactly the ignored files this tool exists to watch. Output format is EXACTLY
# 64 hex chars + two spaces + path, which the parser relies on by fixed offset so that paths
# containing spaces survive intact (round 1 used `awk '{print $2}'` and reported a file named
# "probe file.js" as "probe", a path the operator cannot act on).
hash_paths() {
    local p f
    for p in "$@"; do
        while IFS= read -r -d '' f; do
            is_noise "$f" && continue
            # A newline inside a filename would forge a second manifest line and could be used to
            # mask a deletion. The manifest is line-based, so refuse rather than mis-compare.
            case "$f" in *$'\n'*) die "unsupported filename (embedded newline): ${f#"$ROOT"/}" ;; esac
            # Normalise the recorded path so the SAME tree yields the SAME baseline however the
            # watched path was spelled. `snapshot .` walks "$ROOT/./one.js" and `snapshot sub`
            # walks "$ROOT/sub/two.js"; without stripping the "./" the first spelling records
            # "./one.js" and the second "one.js", so re-snapshotting with the other spelling
            # reports every file as added and removed at once -- a diff that is pure noise.
            rel="${f#"$ROOT"/}"; rel="${rel#./}"
            printf '%s  %s\n' "$(sha256sum "$f" | cut -d' ' -f1)" "$rel"
        done < <(find "$ROOT/$p" -type f -print0 2>/dev/null)
    done | LC_ALL=C sort
}

# Load "path -> hash" from well-formed manifest lines into the named associative array.
# Any malformed line is fatal: a partially-parsed baseline is a corrupt baseline.
load_into() {
    local -n _map="$1"; local src="$2" line h p n=0
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        case "$line" in '#'*) continue ;; esac
        h="${line:0:64}"
        [[ "$h" =~ ^[0-9a-f]{64}$ ]] || die "malformed manifest line (bad hash): ${line:0:80}"
        [ "${line:64:2}" = "  " ]    || die "malformed manifest line (bad separator): ${line:0:80}"
        p="${line:66}"
        [ -n "$p" ]                  || die "malformed manifest line (empty path)"
        _map["$p"]="$h"; n=$((n+1))
    done < "$src"
    [ "$n" -gt 0 ] || die "manifest contains zero file entries -- baseline is empty or truncated"
}

# Take the snapshot lock, or explain precisely why we could not.
#
# Two failures were reported against the round-2 lock and both are handled here:
#   (a) a SIGKILL/OOM mid-snapshot bypasses the EXIT trap, leaving a lock directory with no owner.
#       The old code then failed forever with "another snapshot is in progress" until a human
#       found and rmdir'd it -- reintroducing exactly the manual state-checking this tool exists
#       to remove. We now record the holder's pid and reclaim the lock if that pid is not running.
#   (b) mkdir can fail for reasons that have nothing to do with contention (read-only filesystem,
#       permission denied, disk full). Reporting those as "another snapshot is in progress" sends
#       the operator hunting for a process that does not exist. We distinguish them.
#
# Reclaiming is safe against a live holder because the pid is checked with kill -0 first. It is
# NOT safe against pid reuse in principle; that is accepted, because the alternative is a tool
# that wedges permanently after any unclean death, and the blast radius of a wrong reclaim is a
# torn manifest that `verify` rejects as malformed (exit 2), not a false FROZEN.
acquire_lock() {
    if mkdir "$LOCKDIR" 2>/dev/null; then
        echo $$ > "$LOCKDIR/pid"
        return 0
    fi
    [ -d "$LOCKDIR" ] || die "cannot create lock at ${LOCKDIR#"$ROOT"/} (permission denied, read-only filesystem, or disk full)"

    local holder; holder="$(cat "$LOCKDIR/pid" 2>/dev/null || true)"
    if [ -n "$holder" ] && kill -0 "$holder" 2>/dev/null; then
        die "another snapshot is in progress (holder pid $holder, lock: ${LOCKDIR#"$ROOT"/})"
    fi

    echo "  reclaiming stale lock (holder pid ${holder:-unrecorded} is not running)" >&2
    rm -f "$LOCKDIR/pid"
    rmdir "$LOCKDIR" 2>/dev/null || die "could not clear stale lock at ${LOCKDIR#"$ROOT"/}"
    mkdir "$LOCKDIR" 2>/dev/null || die "lost a race to reclaim the stale lock; re-run"
    echo $$ > "$LOCKDIR/pid"
}

cmd="${1:-}"; shift 2>/dev/null || true

case "$cmd" in
snapshot)
    [ $# -gt 0 ] || { echo "usage: freeze-check.sh snapshot <path> [path...]" >&2; exit 2; }

    # Two concurrent snapshots racing on one manifest is how a torn baseline gets written.
    # mkdir is atomic on every filesystem we run on, so it is the lock.
    acquire_lock
    tmp="$MANIFEST.tmp.$$"
    trap 'rm -f "$LOCKDIR/pid" "$tmp"; rmdir "$LOCKDIR" 2>/dev/null' EXIT

    # Refuse to baseline a path that is not there. A baseline over a missing path is how you
    # later "verify" a freeze that never covered anything.
    for p in "$@"; do
        [ -e "$ROOT/$p" ] || die "cannot snapshot missing path: $p"
    done

    { echo "# watched: $*"; hash_paths "$@"; } > "$tmp" || die "hashing failed; manifest left unchanged"

    # Validate the CANDIDATE before it becomes the baseline, so a disk-full or killed run can
    # never install an empty manifest that later reads as a clean freeze.
    declare -A _probe=(); load_into _probe "$tmp"
    n=${#_probe[@]}

    cp "$tmp" "$MANIFEST" || die "could not install manifest"
    cmp -s "$tmp" "$MANIFEST" || die "manifest write verification failed"
    echo "  frozen: $n file(s) across $# path(s): $*"
    echo "  manifest: ${MANIFEST#"$ROOT"/}"
    ;;

verify)
    [ -f "$MANIFEST" ] || die "no snapshot -- run 'freeze-check.sh snapshot <paths>' first"
    [ -s "$MANIFEST" ] || die "manifest is empty (0 bytes) -- baseline destroyed, refusing to report frozen"

    header="$(head -1 "$MANIFEST")"
    case "$header" in
        '# watched: '*) ;;
        *) die "manifest header missing or corrupt -- refusing to report frozen" ;;
    esac
    watched="${header#\# watched: }"
    [ -n "${watched// /}" ] || die "manifest names no watched paths -- refusing to report frozen"

    declare -A OLD=(); load_into OLD "$MANIFEST"

    # A watched path that has vanished gets its own labeled failure. Routing it through the
    # generic buckets printed "+ _tools/deploy" (reads as "a file was added"), which is exactly
    # backwards from "the whole watched path is gone" during an incident.
    gone=0
    for p in $watched; do
        if [ ! -e "$ROOT/$p" ]; then
            echo "  NOT FROZEN -- watched path no longer exists: $p"
            gone=1
        fi
    done
    [ "$gone" -eq 1 ] && exit 1

    # shellcheck disable=SC2086
    now_tmp="$MANIFEST.now.$$"
    trap 'rm -f "$now_tmp"' EXIT
    hash_paths $watched > "$now_tmp" || die "re-hashing failed"
    declare -A NEW=(); load_into NEW "$now_tmp"

    added=(); modified=(); removed=()
    for p in "${!NEW[@]}"; do
        if [ -z "${OLD[$p]+x}" ]; then added+=("$p")
        elif [ "${OLD[$p]}" != "${NEW[$p]}" ]; then modified+=("$p"); fi
    done
    for p in "${!OLD[@]}"; do
        [ -z "${NEW[$p]+x}" ] && removed+=("$p")
    done

    na=${#added[@]}; nc=${#modified[@]}; nr=${#removed[@]}
    if [ $((na+nc+nr)) -eq 0 ]; then
        echo "  FROZEN: ${#NEW[@]} file(s) under [$watched] byte-identical to snapshot"
        exit 0
    fi
    echo "  NOT FROZEN -- $na added, $nc modified, $nr removed under [$watched]"
    for p in "${added[@]:-}";    do [ -n "$p" ] && echo "    + $p"; done
    for p in "${modified[@]:-}"; do [ -n "$p" ] && echo "    M $p"; done
    for p in "${removed[@]:-}";  do [ -n "$p" ] && echo "    - $p"; done
    exit 1
    ;;
*)
    echo "usage: freeze-check.sh {snapshot <path>...|verify}" >&2
    exit 2
    ;;
esac
