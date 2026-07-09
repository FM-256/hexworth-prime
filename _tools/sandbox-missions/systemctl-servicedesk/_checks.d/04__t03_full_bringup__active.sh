#!/bin/sh
. /opt/mission/env.systemctl-servicedesk 2>/dev/null
systemctl is-active hexqueue >/dev/null 2>&1
