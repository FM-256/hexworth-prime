#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
! pgrep -f "hexlab_runaway_[m]iner" >/dev/null
