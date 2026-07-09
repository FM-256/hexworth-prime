#!/bin/sh
. /opt/mission/env.systemctl-servicedesk 2>/dev/null
! systemctl is-enabled legacyd >/dev/null 2>&1
