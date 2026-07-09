#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
pgrep -f "hexlab_report_[d]aemon" >/dev/null
