#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
pgrep -f "hexlab_logger_[s]vc" >/dev/null
