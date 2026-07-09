#!/bin/sh
. /opt/mission/env.systemctl-servicedesk 2>/dev/null
systemctl is-active hexweb >/dev/null 2>&1 && systemctl is-enabled hexweb >/dev/null 2>&1
