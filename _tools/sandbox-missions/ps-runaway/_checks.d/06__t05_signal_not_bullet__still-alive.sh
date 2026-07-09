#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
pgrep -f hexlab_logger_svc >/dev/null
