#!/bin/sh
. /opt/mission/env.systemctl-servicedesk 2>/dev/null
systemctl is-enabled hexreportd >/dev/null 2>&1
