#!/usr/bin/env bash
# Make sure the monitoring stack is actually running, and say so if it was not.
#
# @catalog what    Ensures prometheus (and its siblings) are running on neon. Belt-and-braces over
# @catalog what    docker's restart policy, which demonstrably failed once.
# @catalog run     _tools/monitoring/neon/ensure-monitoring-up.sh   (systemd timer on neon, and on boot)
# @catalog status  GATE
#
# WHY THIS EXISTS
# 2026-08-20 power loss: prometheus was `Exited (255)` and did NOT come back, while all thirteen
# sibling containers on the same host, with the IDENTICAL `unless-stopped` policy, did. It started
# cleanly by hand seconds later with no error, so it was never restarted rather than failing to
# start. Its own logs contain nothing from that boot, and the docker journal has no entries for
# the window, so the exact cause is UNKNOWN.
#
# That uncertainty is the argument for this script rather than against it. A restart policy that
# silently failed once and cannot be explained is not something to rely on for the component whose
# absence disables every alert on the platform: with prometheus down, no rules evaluate, so the
# monitoring system cannot report its own outage. It stayed down from 03:22 until a human went
# looking, and nothing anywhere went red.
#
# This does not replace the restart policy. It is a second, dumber mechanism that assumes nothing
# about why the first one did not fire.
#
# NOT a healthcheck-and-restart loop: it only STARTS what is not running. A container that is up
# but wedged is a different problem, and killing it from here would fight docker's own restart
# handling and could mask that failure as a restart loop.
set -u

CONTAINERS="${MONITORING_CONTAINERS:-prometheus alertmanager grafana loki}"
started=""

for c in $CONTAINERS; do
    # Skip cleanly if a container simply does not exist on this host, so the same script can run
    # on a machine with a subset of the stack without reporting phantom failures.
    docker inspect "$c" >/dev/null 2>&1 || continue
    state=$(docker inspect "$c" --format '{{.State.Status}}' 2>/dev/null)
    [ "$state" = "running" ] && continue
    if docker start "$c" >/dev/null 2>&1; then
        started="$started $c"
        logger -t ensure-monitoring "STARTED $c (was: $state)" 2>/dev/null || true
        echo "  started $c (was $state)"
    else
        logger -t ensure-monitoring "FAILED to start $c (was: $state)" 2>/dev/null || true
        echo "  FAILED to start $c (was $state)" >&2
    fi
done

# Report the fact of a rescue, loudly and to a place a human sees. A silent fix here would turn a
# recurring failure into a permanent invisible one — the script would paper over the very defect
# it exists to expose, and nobody would ever learn why the restart policy is unreliable.
if [ -n "$started" ]; then
    echo "  RESCUED:$started — the restart policy did not do this. Investigate before assuming it is fixed."
    exit 1        # non-zero so a timer/CI surfaces it rather than logging success
fi

echo "  all monitoring containers already running"
exit 0
