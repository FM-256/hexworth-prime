/* ============================================================
   gui-ne10-monitoring.config.js
   NE-10: Network Operations — SNMP & Syslog Monitoring GUI Lab
   Hexworth Prime — Network+ Course
   2026-03-30

   SCENARIO: NOC technician at Crestline Industries. The
   monitoring dashboard is showing alerts from multiple devices.
   Investigate each alert using the SNMP Manager and Syslog
   Viewer, determine severity, and recommend corrective actions.
   Log all findings in the Incident Log.
   ============================================================ */

const GUI_NE10_MONITORING_CONFIG = {

    id: 'gui-ne10-monitoring',
    title: 'NE-10 Lab: SNMP & Syslog Monitoring',
    subtitle: 'Investigate network alerts, classify severity levels, and recommend corrective actions',
    duration: 2100, // 35 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 3.1: Given a scenario, use the appropriate statistics and sensors to ensure network availability',
        'N10-009 3.2: Explain the purpose of organizational documents and policies',
        'N10-009 3.3: Explain high availability and disaster recovery concepts and summarize which is the best solution'
    ],

    scoring: {
        taskPoints: 50,
        timeBonus: 100,
        maxScore: 600
    },

    /* -- Known Domains (for nslookup/ping resolution) -------- */
    knownDomains: {
        'sw1.crestline.local':      '10.10.1.1',
        'sw2.crestline.local':      '10.10.1.2',
        'rtr1.crestline.local':     '10.10.0.1',
        'rtr2.crestline.local':     '10.10.0.2',
        'srv1.crestline.local':     '10.10.2.10',
        'syslog.crestline.local':   '10.10.2.20',
        'nms.crestline.local':      '10.10.2.25',
        'noc.crestline.local':      '10.10.2.30'
    },

    /* -- Desktop Icons --------------------------------------- */
    desktop: [
        {
            id: 'snmp-manager',
            label: 'SNMP\nManager',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'SNMP Manager — Crestline NOC Dashboard',
                sections: [
                    /* -- Device Inventory -------------------- */
                    {
                        id: 'snmp-devices',
                        label: 'Device Inventory',
                        group: 'Devices',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'SNMP Community',
                                statePath: 'webMgmt.snmp.community',
                                default: 'Read: crestline-ro | Write: crestline-rw | Version: SNMPv2c'
                            },
                            {
                                type: 'table',
                                label: 'Managed Devices',
                                statePath: 'webMgmt.snmp.deviceTable',
                                columns: [
                                    { key: 'hostname',  label: 'Hostname' },
                                    { key: 'ip',        label: 'IP Address' },
                                    { key: 'type',      label: 'Type' },
                                    { key: 'status',    label: 'Status' },
                                    { key: 'uptime',    label: 'Uptime' },
                                    { key: 'alerts',    label: 'Alerts' }
                                ]
                            }
                        ]
                    },
                    /* -- OID Browser ------------------------- */
                    {
                        id: 'snmp-oid',
                        label: 'OID Browser',
                        group: 'Devices',
                        fields: [
                            {
                                type: 'select',
                                label: 'Select Device',
                                statePath: 'webMgmt.snmp.selectedDevice',
                                options: [
                                    { value: '',       label: '-- Select Device --' },
                                    { value: 'sw1',    label: 'SW1 — Core-Switch-1 (10.10.1.1)' },
                                    { value: 'sw2',    label: 'SW2 — Core-Switch-2 (10.10.1.2)' },
                                    { value: 'rtr1',   label: 'RTR1 — Edge-Router-1 (10.10.0.1)' },
                                    { value: 'rtr2',   label: 'RTR2 — Edge-Router-2 (10.10.0.2)' },
                                    { value: 'srv1',   label: 'SRV1 — File-Server-1 (10.10.2.10)' }
                                ]
                            },
                            {
                                type: 'table',
                                label: 'SNMP OID Values',
                                statePath: 'webMgmt.snmp.oidTable',
                                columns: [
                                    { key: 'oid',       label: 'OID' },
                                    { key: 'name',      label: 'Name' },
                                    { key: 'value',     label: 'Value' },
                                    { key: 'status',    label: 'Status' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const snmp = state.webMgmt.snmp;
                            const dev = snmp.selectedDevice;

                            const deviceOIDs = {
                                'sw1': [
                                    { oid: '1.3.6.1.2.1.1.1.0',       name: 'sysDescr',           value: 'Cisco IOS C3750X 15.2(4)E10',  status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.3.0',       name: 'sysUpTime',          value: '45d 12h 33m 18s',               status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.5.0',       name: 'sysName',            value: 'Core-Switch-1',                 status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.24', name: 'ifOperStatus.Fa0/24', value: 'down(2)',                       status: 'CRITICAL' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.1',  name: 'ifOperStatus.Gi0/1', value: 'up(1)',                          status: 'OK' },
                                    { oid: '1.3.6.1.4.1.9.2.1.57.0', name: 'avgBusy5',           value: '18%',                            status: 'OK' },
                                    { oid: '1.3.6.1.4.1.9.9.48.1.1.1.6.1', name: 'ciscoMemoryPoolFree', value: '182,456,320 bytes',       status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.1.0',      name: 'ifNumber',            value: '52',                            status: 'OK' }
                                ],
                                'sw2': [
                                    { oid: '1.3.6.1.2.1.1.1.0',       name: 'sysDescr',           value: 'Cisco IOS C3750X 15.2(4)E10',  status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.3.0',       name: 'sysUpTime',          value: '45d 12h 31m 05s',               status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.5.0',       name: 'sysName',            value: 'Core-Switch-2',                 status: 'OK' },
                                    { oid: '1.3.6.1.2.1.17.7.1.2.2', name: 'dot1qTpFdbStatus',   value: 'MAC flapping VLAN 10',           status: 'WARNING' },
                                    { oid: '1.3.6.1.4.1.9.2.1.57.0', name: 'avgBusy5',           value: '22%',                            status: 'OK' },
                                    { oid: '1.3.6.1.4.1.9.9.48.1.1.1.6.1', name: 'ciscoMemoryPoolFree', value: '174,231,552 bytes',       status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.1',  name: 'ifOperStatus.Gi0/1', value: 'up(1)',                          status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.1.0',      name: 'ifNumber',            value: '52',                            status: 'OK' }
                                ],
                                'rtr1': [
                                    { oid: '1.3.6.1.2.1.1.1.0',       name: 'sysDescr',           value: 'Cisco IOS ISR4331 16.12.4',    status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.3.0',       name: 'sysUpTime',          value: '112d 08h 14m 52s',              status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.5.0',       name: 'sysName',            value: 'Edge-Router-1',                 status: 'OK' },
                                    { oid: '1.3.6.1.4.1.9.2.1.57.0', name: 'avgBusy5',           value: '95%',                            status: 'CRITICAL' },
                                    { oid: '1.3.6.1.4.1.9.2.1.58.0', name: 'avgBusy1',           value: '97%',                            status: 'CRITICAL' },
                                    { oid: '1.3.6.1.4.1.9.9.48.1.1.1.6.1', name: 'ciscoMemoryPoolFree', value: '41,238,528 bytes',        status: 'WARNING' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.1',  name: 'ifOperStatus.Gi0/0', value: 'up(1)',                          status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.2',  name: 'ifOperStatus.Gi0/1', value: 'up(1)',                          status: 'OK' }
                                ],
                                'rtr2': [
                                    { oid: '1.3.6.1.2.1.1.1.0',       name: 'sysDescr',           value: 'Cisco IOS ISR4331 16.12.4',    status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.3.0',       name: 'sysUpTime',          value: '112d 08h 12m 30s',              status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.5.0',       name: 'sysName',            value: 'Edge-Router-2',                 status: 'OK' },
                                    { oid: '1.3.6.1.4.1.9.2.1.57.0', name: 'avgBusy5',           value: '12%',                            status: 'OK' },
                                    { oid: '1.3.6.1.2.1.15.3.1.2',   name: 'bgpPeerState',       value: 'idle(1)',                        status: 'CRITICAL' },
                                    { oid: '1.3.6.1.2.1.15.3.1.16',  name: 'bgpPeerFsmEstTime',  value: '0 seconds',                     status: 'CRITICAL' },
                                    { oid: '1.3.6.1.4.1.9.9.48.1.1.1.6.1', name: 'ciscoMemoryPoolFree', value: '198,450,176 bytes',       status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.1',  name: 'ifOperStatus.Gi0/0', value: 'up(1)',                          status: 'OK' }
                                ],
                                'srv1': [
                                    { oid: '1.3.6.1.2.1.1.1.0',       name: 'sysDescr',           value: 'Linux srv1 5.15.0 Ubuntu Server', status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.3.0',       name: 'sysUpTime',          value: '203d 04h 55m 12s',              status: 'OK' },
                                    { oid: '1.3.6.1.2.1.1.5.0',       name: 'sysName',            value: 'File-Server-1',                 status: 'OK' },
                                    { oid: '1.3.6.1.2.1.25.2.3.1.6', name: 'hrStorageUsed./dev/sda1', value: '489,127,936 / 500,000,000 (98%)', status: 'CRITICAL' },
                                    { oid: '1.3.6.1.2.1.25.3.3.1.2', name: 'hrProcessorLoad',    value: '34%',                            status: 'OK' },
                                    { oid: '1.3.6.1.2.1.25.2.3.1.6.2', name: 'hrStorageUsed./dev/sdb1', value: '102,400,000 / 1,000,000,000 (10%)', status: 'OK' },
                                    { oid: '1.3.6.1.2.1.25.2.2.0',   name: 'hrMemorySize',       value: '16,384 MB (42% used)',           status: 'OK' },
                                    { oid: '1.3.6.1.2.1.2.2.1.8.1',  name: 'ifOperStatus.eth0',  value: 'up(1)',                          status: 'OK' }
                                ]
                            };

                            if (dev && deviceOIDs[dev]) {
                                snmp.oidTable = deviceOIDs[dev];

                                if (dev === 'sw1')  snmp.sw1Browsed = true;
                                if (dev === 'sw2')  snmp.sw2Browsed = true;
                                if (dev === 'rtr1') snmp.rtr1Browsed = true;
                                if (dev === 'rtr2') snmp.rtr2Browsed = true;
                                if (dev === 'srv1') snmp.srv1Browsed = true;
                            }
                        }
                    },
                    /* -- SNMP Traps Received ----------------- */
                    {
                        id: 'snmp-traps',
                        label: 'SNMP Traps',
                        group: 'Alerts',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Trap Receiver',
                                statePath: 'webMgmt.snmp.trapReceiver',
                                default: 'nms.crestline.local:162 (UDP) -- 5 traps pending review'
                            },
                            {
                                type: 'table',
                                label: 'Received Traps',
                                statePath: 'webMgmt.snmp.trapTable',
                                columns: [
                                    { key: 'time',      label: 'Timestamp' },
                                    { key: 'source',    label: 'Source' },
                                    { key: 'trapOid',   label: 'Trap OID' },
                                    { key: 'type',      label: 'Trap Type' },
                                    { key: 'severity',  label: 'Severity' },
                                    { key: 'message',   label: 'Message' }
                                ]
                            }
                        ]
                    },
                    /* -- Alert Triage ------------------------ */
                    {
                        id: 'snmp-triage',
                        label: 'Alert Triage',
                        group: 'Alerts',
                        fields: [
                            {
                                type: 'select',
                                label: 'Select Alert to Investigate',
                                statePath: 'webMgmt.snmp.selectedAlert',
                                options: [
                                    { value: '',         label: '-- Select Alert --' },
                                    { value: 'alert1',   label: 'ALERT-1: SW1 Port Fa0/24 linkDown' },
                                    { value: 'alert2',   label: 'ALERT-2: RTR1 CPU Threshold Exceeded (95%)' },
                                    { value: 'alert3',   label: 'ALERT-3: SRV1 Disk /dev/sda1 at 98%' },
                                    { value: 'alert4',   label: 'ALERT-4: SW2 MAC Flapping on VLAN 10' },
                                    { value: 'alert5',   label: 'ALERT-5: RTR2 BGP Neighbor DOWN' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Alert Details',
                                statePath: 'webMgmt.snmp.alertDetails',
                                default: 'Select an alert above to view details'
                            },
                            {
                                type: 'info',
                                label: 'Root Cause Analysis',
                                statePath: 'webMgmt.snmp.alertRCA',
                                default: '--'
                            },
                            {
                                type: 'info',
                                label: 'Recommended Action',
                                statePath: 'webMgmt.snmp.alertAction',
                                default: '--'
                            }
                        ],
                        onSave(state) {
                            const snmp = state.webMgmt.snmp;
                            const alert = snmp.selectedAlert;

                            const alertData = {
                                'alert1': {
                                    details: 'Device: Core-Switch-1 (10.10.1.1) | Trap: linkDown (1.3.6.1.6.3.1.1.5.3) | Interface: FastEthernet0/24 | ifOperStatus changed from up(1) to down(2) | Time: 2026-03-30 02:14:33 UTC | Connected device: AP-Floor3-West (802.11ac Access Point)',
                                    rca: 'Port Fa0/24 transitioned to DOWN state. Possible causes: cable failure, connected device powered off, SFP/transceiver issue, or port administratively shut down. The connected access point (AP-Floor3-West) serves 47 wireless clients on the 3rd floor.',
                                    action: '1. Check physical cable connection at patch panel and AP. 2. Verify AP power (PoE or local power supply). 3. Run "show interface Fa0/24" to check for CRC errors or input errors. 4. If cable fault, replace patch cable. 5. If AP failure, swap with spare unit. Priority: HIGH — 47 wireless users affected.'
                                },
                                'alert2': {
                                    details: 'Device: Edge-Router-1 (10.10.0.1) | Trap: cpuThresholdExceeded | OID: 1.3.6.1.4.1.9.2.1.57.0 (avgBusy5) = 95% | 1-min avg: 97% | Normal baseline: 15-25% | Threshold: 80% | Duration: 12 minutes sustained',
                                    rca: 'CPU utilization at 95% for 12+ minutes. Possible causes: routing loop causing excessive route recalculation, DDoS attack generating high packet rate, misconfigured ACL causing process-switching instead of CEF, memory leak in IOS process, or BGP table explosion from peer misconfiguration.',
                                    action: '1. Run "show processes cpu sorted" to identify the top process consuming CPU. 2. Check "show ip route summary" for abnormal route count. 3. Verify CEF is enabled ("show ip cef"). 4. Check for ACL hits on process-switched traffic. 5. If DDoS suspected, enable NetFlow and check top talkers. Priority: CRITICAL — affects all traffic through this edge router.'
                                },
                                'alert3': {
                                    details: 'Device: File-Server-1 (10.10.2.10) | Trap: storageThresholdExceeded | OID: 1.3.6.1.2.1.25.2.3.1.6 | Partition: /dev/sda1 (/) | Used: 489 GB / 500 GB (98%) | Secondary disk /dev/sdb1: 102 GB / 1 TB (10%) | Inode usage: 72%',
                                    rca: 'Root partition /dev/sda1 at 98% capacity. At current growth rate (~2 GB/day from log files), partition will be 100% full in approximately 24 hours. When full, services will fail to write logs, temp files, and may crash. Secondary disk /dev/sdb1 has 898 GB free but is mounted at /data, not /.',
                                    action: '1. Immediately clear old log files: check /var/log for rotatable logs. 2. Run "du -sh /var/log/*" to identify largest consumers. 3. Verify logrotate is configured and running. 4. Move large static files to /dev/sdb1 (/data). 5. Long-term: expand root partition or add LVM volume. Priority: CRITICAL — 24-hour window before service failure.'
                                },
                                'alert4': {
                                    details: 'Device: Core-Switch-2 (10.10.1.2) | Trap: macFlapping | VLAN: 10 (Users) | MAC: 00:1A:2B:3C:4D:99 | Flapping between ports Gi0/12 and Gi0/18 | Frequency: 45 flaps in last 60 seconds | STP state: Both ports Forwarding',
                                    rca: 'MAC address 00:1A:2B:3C:4D:99 is being learned on two different switch ports alternately. This indicates a Layer 2 loop — likely a rogue switch or hub connected between ports Gi0/12 and Gi0/18, creating a bridging loop. STP may be disabled or misconfigured on the rogue device. This will cause broadcast storms, CAM table instability, and network degradation.',
                                    action: '1. Immediately shut down one of the flapping ports ("shutdown" on Gi0/18). 2. Trace the physical cable path from Gi0/12 and Gi0/18 to find the loop. 3. Check for unauthorized switches/hubs. 4. Enable BPDU Guard and Port Security to prevent future loops. 5. Verify STP is running correctly: "show spanning-tree vlan 10". Priority: HIGH — broadcast storm risk affects entire VLAN 10.'
                                },
                                'alert5': {
                                    details: 'Device: Edge-Router-2 (10.10.0.2) | Trap: bgpBackwardTransition (1.3.6.1.2.1.15.3.1.2) | BGP Peer: 203.0.113.1 (AS 64512 — ISP Transit) | State: Idle | Previous State: Established | Hold Time Expired | Last error: Hold Timer Expired (code 4, subcode 0)',
                                    rca: 'BGP neighbor 203.0.113.1 transitioned from Established to Idle. The "Hold Timer Expired" error indicates the router did not receive a BGP keepalive within the hold time (default 180s). Possible causes: ISP-side router failure, WAN link between RTR2 and ISP down, interface flap, or MTU mismatch causing keepalives to be dropped.',
                                    action: '1. Check WAN interface status: "show interface Gi0/0". 2. Ping the BGP peer IP 203.0.113.1. 3. Check "show ip bgp summary" for last state change time. 4. Verify "show ip bgp neighbors 203.0.113.1" for detailed error. 5. Contact ISP NOC if WAN link is UP but BGP still idle. 6. Check if RTR1 BGP is taking over (failover). Priority: CRITICAL — potential loss of internet redundancy.'
                                }
                            };

                            if (alert && alertData[alert]) {
                                const ad = alertData[alert];
                                snmp.alertDetails = ad.details;
                                snmp.alertRCA = ad.rca;
                                snmp.alertAction = ad.action;

                                if (alert === 'alert1') snmp.alert1Investigated = true;
                                if (alert === 'alert2') snmp.alert2Investigated = true;
                                if (alert === 'alert3') snmp.alert3Investigated = true;
                                if (alert === 'alert4') snmp.alert4Investigated = true;
                                if (alert === 'alert5') snmp.alert5Investigated = true;
                            }
                        }
                    }
                ]
            }
        },
        {
            id: 'syslog-viewer',
            label: 'Syslog\nViewer',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Syslog Viewer — syslog.crestline.local',
                sections: [
                    /* -- Syslog Severity Reference ----------- */
                    {
                        id: 'syslog-reference',
                        label: 'Severity Reference',
                        group: 'Reference',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Syslog Severity Levels (RFC 5424)',
                                statePath: 'webMgmt.syslog.severityRef',
                                columns: [
                                    { key: 'level',    label: 'Level' },
                                    { key: 'keyword',  label: 'Keyword' },
                                    { key: 'desc',     label: 'Description' },
                                    { key: 'example',  label: 'Example' }
                                ]
                            }
                        ]
                    },
                    /* -- All Syslog Entries ------------------- */
                    {
                        id: 'syslog-all',
                        label: 'All Entries',
                        group: 'Logs',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Log Source',
                                statePath: 'webMgmt.syslog.source',
                                default: 'syslog.crestline.local:514 (UDP) -- Facility: local7 -- Last 20 entries'
                            },
                            {
                                type: 'table',
                                label: 'Syslog Messages',
                                statePath: 'webMgmt.syslog.allEntries',
                                columns: [
                                    { key: 'timestamp', label: 'Timestamp' },
                                    { key: 'severity',  label: 'Sev' },
                                    { key: 'host',      label: 'Host' },
                                    { key: 'facility',  label: 'Facility' },
                                    { key: 'message',   label: 'Message' }
                                ]
                            }
                        ]
                    },
                    /* -- Filter by Severity ------------------- */
                    {
                        id: 'syslog-filter',
                        label: 'Filter by Severity',
                        group: 'Logs',
                        fields: [
                            {
                                type: 'select',
                                label: 'Show Severity Level',
                                statePath: 'webMgmt.syslog.filterLevel',
                                options: [
                                    { value: '',   label: '-- Show All --' },
                                    { value: '0',  label: '0 - Emergency' },
                                    { value: '1',  label: '1 - Alert' },
                                    { value: '2',  label: '2 - Critical' },
                                    { value: '3',  label: '3 - Error' },
                                    { value: '4',  label: '4 - Warning' },
                                    { value: '5',  label: '5 - Notice' },
                                    { value: '6',  label: '6 - Informational' },
                                    { value: '7',  label: '7 - Debug' }
                                ]
                            },
                            {
                                type: 'table',
                                label: 'Filtered Results',
                                statePath: 'webMgmt.syslog.filteredEntries',
                                columns: [
                                    { key: 'timestamp', label: 'Timestamp' },
                                    { key: 'severity',  label: 'Sev' },
                                    { key: 'host',      label: 'Host' },
                                    { key: 'facility',  label: 'Facility' },
                                    { key: 'message',   label: 'Message' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Filter Summary',
                                statePath: 'webMgmt.syslog.filterSummary',
                                default: 'Select a severity level and click Apply'
                            }
                        ],
                        onSave(state) {
                            const sl = state.webMgmt.syslog;
                            const level = sl.filterLevel;
                            const all = sl.allEntries || [];

                            if (!level && level !== '0') {
                                sl.filteredEntries = all;
                                sl.filterSummary = 'Showing all ' + all.length + ' entries';
                            } else {
                                sl.filteredEntries = all.filter(function(e) { return e.severity === level; });
                                var keywords = ['Emergency','Alert','Critical','Error','Warning','Notice','Informational','Debug'];
                                sl.filterSummary = 'Showing ' + sl.filteredEntries.length + ' entries at severity ' + level + ' (' + keywords[parseInt(level)] + ')';

                                if (level === '2') sl.filteredCritical = true;
                                if (level === '4') sl.filteredWarning = true;
                            }
                        }
                    },
                    /* -- Severity Classification -------------- */
                    {
                        id: 'syslog-classify',
                        label: 'Classify Events',
                        group: 'Analysis',
                        fields: [
                            {
                                type: 'select',
                                label: 'SW1 linkDown: What is the correct severity?',
                                statePath: 'webMgmt.syslog.classifySW1',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '0',  label: '0 - Emergency' },
                                    { value: '1',  label: '1 - Alert' },
                                    { value: '2',  label: '2 - Critical' },
                                    { value: '3',  label: '3 - Error' },
                                    { value: '4',  label: '4 - Warning' },
                                    { value: '5',  label: '5 - Notice' },
                                    { value: '6',  label: '6 - Informational' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'RTR1 CPU 95%: What is the correct severity?',
                                statePath: 'webMgmt.syslog.classifyRTR1',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '0',  label: '0 - Emergency' },
                                    { value: '1',  label: '1 - Alert' },
                                    { value: '2',  label: '2 - Critical' },
                                    { value: '3',  label: '3 - Error' },
                                    { value: '4',  label: '4 - Warning' },
                                    { value: '5',  label: '5 - Notice' },
                                    { value: '6',  label: '6 - Informational' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'SRV1 Disk 98%: What is the correct severity?',
                                statePath: 'webMgmt.syslog.classifySRV1',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '0',  label: '0 - Emergency' },
                                    { value: '1',  label: '1 - Alert' },
                                    { value: '2',  label: '2 - Critical' },
                                    { value: '3',  label: '3 - Error' },
                                    { value: '4',  label: '4 - Warning' },
                                    { value: '5',  label: '5 - Notice' },
                                    { value: '6',  label: '6 - Informational' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'SW2 MAC Flapping: What is the correct severity?',
                                statePath: 'webMgmt.syslog.classifySW2',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '0',  label: '0 - Emergency' },
                                    { value: '1',  label: '1 - Alert' },
                                    { value: '2',  label: '2 - Critical' },
                                    { value: '3',  label: '3 - Error' },
                                    { value: '4',  label: '4 - Warning' },
                                    { value: '5',  label: '5 - Notice' },
                                    { value: '6',  label: '6 - Informational' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'RTR2 BGP Down: What is the correct severity?',
                                statePath: 'webMgmt.syslog.classifyRTR2',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '0',  label: '0 - Emergency' },
                                    { value: '1',  label: '1 - Alert' },
                                    { value: '2',  label: '2 - Critical' },
                                    { value: '3',  label: '3 - Error' },
                                    { value: '4',  label: '4 - Warning' },
                                    { value: '5',  label: '5 - Notice' },
                                    { value: '6',  label: '6 - Informational' }
                                ]
                            }
                        ],
                        onSave(state) {
                            var sl = state.webMgmt.syslog;
                            // SW1 linkDown = 4 (Warning) — single port, not system-wide
                            // RTR1 CPU 95% = 1 (Alert) — immediate action needed, affects all routing
                            // SRV1 Disk 98% = 2 (Critical) — imminent service failure
                            // SW2 MAC Flapping = 4 (Warning) — potential loop, not yet causing outage
                            // RTR2 BGP Down = 2 (Critical) — routing protocol failure
                            var correct = 0;
                            if (sl.classifySW1 === '4') correct++;
                            if (sl.classifyRTR1 === '1') correct++;
                            if (sl.classifySRV1 === '2') correct++;
                            if (sl.classifySW2 === '4') correct++;
                            if (sl.classifyRTR2 === '2') correct++;

                            sl.classificationScore = correct;
                            sl.classificationComplete = correct >= 4; // allow 1 mistake
                        }
                    }
                ]
            }
        },
        {
            id: 'network-map',
            label: 'Network\nMap',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Network Map — Crestline Industries',
                sections: [
                    {
                        id: 'netmap-topology',
                        label: 'Topology',
                        group: 'Map',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Network Topology (Text View)',
                                statePath: 'webMgmt.netmap.topology',
                                default: '[INTERNET] --- [ISP: AS 64512 / 203.0.113.1] --- [RTR2: 10.10.0.2] ---+--- [RTR1: 10.10.0.1] --- [WAN/MPLS]\n                                                                         |\n                                                              [SW1: 10.10.1.1] --- [SW2: 10.10.1.2]\n                                                                 |    |    |          |    |    |\n                                                               Fa0/1-23  Fa0/24     Gi0/12 Gi0/18\n                                                               (Users)  (AP-Floor3)  (Flapping!)\n                                                                         |\n                                                              [SRV1: 10.10.2.10] --- [Syslog: 10.10.2.20] --- [NMS: 10.10.2.25]'
                            },
                            {
                                type: 'info',
                                label: 'Device Status Summary',
                                statePath: 'webMgmt.netmap.statusSummary',
                                default: 'SW1: 1 port DOWN (Fa0/24) | SW2: MAC flapping VLAN 10 | RTR1: CPU 95% CRITICAL | RTR2: BGP peer IDLE | SRV1: Disk 98% CRITICAL'
                            },
                            {
                                type: 'info',
                                label: 'SNMP Monitoring',
                                statePath: 'webMgmt.netmap.snmpInfo',
                                default: 'All devices configured for SNMPv2c | Community: crestline-ro (read) / crestline-rw (write) | Trap destination: nms.crestline.local:162 | Syslog destination: syslog.crestline.local:514'
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 'incident-log',
            label: 'Incident\nLog',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Incident Log — NOC Shift Report',
                sections: [
                    {
                        id: 'incident-report',
                        label: 'Shift Report',
                        group: 'Documentation',
                        fields: [
                            {
                                type: 'text',
                                label: 'Highest Priority Alert (device + issue)',
                                statePath: 'webMgmt.incident.highestPriority',
                                placeholder: 'Which alert requires immediate action?'
                            },
                            {
                                type: 'select',
                                label: 'SNMP Version in Use',
                                statePath: 'webMgmt.incident.snmpVersion',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'v1',     label: 'SNMPv1' },
                                    { value: 'v2c',    label: 'SNMPv2c' },
                                    { value: 'v3',     label: 'SNMPv3' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'What protocol transports syslog messages?',
                                statePath: 'webMgmt.incident.syslogTransport',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'tcp', label: 'TCP port 514' },
                                    { value: 'udp', label: 'UDP port 514' },
                                    { value: 'http', label: 'HTTP port 80' },
                                    { value: 'ssh', label: 'SSH port 22' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'What port does SNMP traps use?',
                                statePath: 'webMgmt.incident.snmpTrapPort',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: '161', label: 'UDP 161' },
                                    { value: '162', label: 'UDP 162' },
                                    { value: '514', label: 'UDP 514' },
                                    { value: '443', label: 'TCP 443' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'How many total alerts are in CRITICAL state?',
                                statePath: 'webMgmt.incident.criticalCount',
                                placeholder: 'Number of critical alerts'
                            },
                            {
                                type: 'select',
                                label: 'Security concern: Which SNMP improvement would you recommend?',
                                statePath: 'webMgmt.incident.snmpRecommendation',
                                options: [
                                    { value: '',         label: '-- Select --' },
                                    { value: 'v3',       label: 'Upgrade to SNMPv3 (authentication + encryption)' },
                                    { value: 'acl',      label: 'Add ACL to restrict SNMP access' },
                                    { value: 'disable',  label: 'Disable SNMP entirely' },
                                    { value: 'public',   label: 'Change community string to "public"' }
                                ]
                            }
                        ],
                        onSave(state) {
                            var inc = state.webMgmt.incident;
                            var correct = 0;

                            // Highest priority: RTR1 CPU (affects all routing) or SRV1 disk (imminent failure)
                            if (inc.highestPriority && (inc.highestPriority.toLowerCase().includes('rtr1') || inc.highestPriority.toLowerCase().includes('router') || inc.highestPriority.toLowerCase().includes('cpu'))) correct++;
                            if (inc.snmpVersion === 'v2c') correct++;
                            if (inc.syslogTransport === 'udp') correct++;
                            if (inc.snmpTrapPort === '162') correct++;
                            if (inc.criticalCount && inc.criticalCount.trim() === '3') correct++;
                            if (inc.snmpRecommendation === 'v3') correct++;

                            inc.reportScore = correct;
                            inc.reportComplete = correct >= 5;
                        }
                    }
                ]
            }
        },
        {
            id: 'cmd',
            label: 'Command\nPrompt',
            icon: 'terminal',
            window: 'cmd'
        }
    ],

    /* -- Initial State --------------------------------------- */
    initialState: {
        adapters: [
            {
                name: 'Ethernet0',
                description: 'Intel(R) I219-LM Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: false,
                ip: '10.10.2.30',
                mask: '255.255.255.0',
                gateway: '10.10.0.1',
                dns: ['10.10.2.20'],
                mac: '00:1A:2B:CC:DD:EE',
                speed: '1 Gbps',
                duplex: 'Full Duplex',
                driver: 'Intel Corporation',
                driverVersion: '12.19.1.37',
                irq: '11'
            }
        ],
        services: [
            { name: 'SNMP Agent',          status: 'running', startup: 'Automatic' },
            { name: 'Syslog Service',      status: 'running', startup: 'Automatic' },
            { name: 'DNS Client',          status: 'running', startup: 'Automatic' },
            { name: 'Windows Firewall',    status: 'running', startup: 'Automatic' },
            { name: 'NMS Collector',       status: 'running', startup: 'Automatic' }
        ],
        connectivity: {
            gateway: true,
            internet: true,
            dns: true
        },
        webMgmt: {
            snmp: {
                community: 'Read: crestline-ro | Write: crestline-rw | Version: SNMPv2c',
                trapReceiver: 'nms.crestline.local:162 (UDP) -- 5 traps pending review',
                selectedDevice: '',
                selectedAlert: '',
                alertDetails: 'Select an alert above to view details',
                alertRCA: '--',
                alertAction: '--',
                oidTable: [],
                sw1Browsed: false,
                sw2Browsed: false,
                rtr1Browsed: false,
                rtr2Browsed: false,
                srv1Browsed: false,
                alert1Investigated: false,
                alert2Investigated: false,
                alert3Investigated: false,
                alert4Investigated: false,
                alert5Investigated: false,
                deviceTable: [
                    { hostname: 'Core-Switch-1',   ip: '10.10.1.1',   type: 'L3 Switch',  status: 'WARNING',  uptime: '45d 12h', alerts: '1 (linkDown)' },
                    { hostname: 'Core-Switch-2',   ip: '10.10.1.2',   type: 'L3 Switch',  status: 'WARNING',  uptime: '45d 12h', alerts: '1 (MAC flap)' },
                    { hostname: 'Edge-Router-1',   ip: '10.10.0.1',   type: 'Router',     status: 'CRITICAL', uptime: '112d 08h', alerts: '1 (CPU 95%)' },
                    { hostname: 'Edge-Router-2',   ip: '10.10.0.2',   type: 'Router',     status: 'CRITICAL', uptime: '112d 08h', alerts: '1 (BGP DOWN)' },
                    { hostname: 'File-Server-1',   ip: '10.10.2.10',  type: 'Server',     status: 'CRITICAL', uptime: '203d 04h', alerts: '1 (Disk 98%)' }
                ],
                trapTable: [
                    { time: '2026-03-30 02:14:33', source: '10.10.1.1 (SW1)',   trapOid: '1.3.6.1.6.3.1.1.5.3',            type: 'linkDown',             severity: 'WARNING',  message: 'Interface Fa0/24 operationally DOWN' },
                    { time: '2026-03-30 02:18:47', source: '10.10.0.1 (RTR1)',  trapOid: '1.3.6.1.4.1.9.9.109.1.1.1.1.8', type: 'cpuThresholdExceeded', severity: 'CRITICAL', message: 'CPU 5-min avg exceeded threshold: 95% (threshold: 80%)' },
                    { time: '2026-03-30 02:22:01', source: '10.10.2.10 (SRV1)', trapOid: '1.3.6.1.2.1.25.2.3.1.6',         type: 'storageThreshold',    severity: 'CRITICAL', message: '/dev/sda1 usage at 98% — 489 GB / 500 GB' },
                    { time: '2026-03-30 02:25:15', source: '10.10.1.2 (SW2)',   trapOid: '1.3.6.1.2.1.17.7.1.2.2',         type: 'macFlapping',         severity: 'WARNING',  message: 'MAC 00:1A:2B:3C:4D:99 flapping between Gi0/12 and Gi0/18 on VLAN 10' },
                    { time: '2026-03-30 02:31:58', source: '10.10.0.2 (RTR2)',  trapOid: '1.3.6.1.2.1.15.3.1.2',           type: 'bgpBackwardTransition', severity: 'CRITICAL', message: 'BGP peer 203.0.113.1 (AS 64512) state: Idle — Hold Timer Expired' }
                ]
            },
            syslog: {
                source: 'syslog.crestline.local:514 (UDP) -- Facility: local7 -- Last 20 entries',
                filterLevel: '',
                filteredEntries: [],
                filteredCritical: false,
                filteredWarning: false,
                filterSummary: 'Select a severity level and click Apply',
                classifySW1: '',
                classifyRTR1: '',
                classifySRV1: '',
                classifySW2: '',
                classifyRTR2: '',
                classificationScore: 0,
                classificationComplete: false,
                severityRef: [
                    { level: '0', keyword: 'Emergency',     desc: 'System is unusable',                     example: 'Kernel panic, total system failure' },
                    { level: '1', keyword: 'Alert',         desc: 'Immediate action needed',                example: 'Database corruption, loss of primary ISP' },
                    { level: '2', keyword: 'Critical',      desc: 'Critical conditions',                    example: 'Hardware failure, disk full imminent' },
                    { level: '3', keyword: 'Error',         desc: 'Error conditions',                       example: 'Interface CRC errors, authentication failure' },
                    { level: '4', keyword: 'Warning',       desc: 'Warning conditions',                     example: 'Config change, port flapping, approaching threshold' },
                    { level: '5', keyword: 'Notice',        desc: 'Normal but significant',                 example: 'User login, protocol up/down transition' },
                    { level: '6', keyword: 'Informational', desc: 'Informational messages',                 example: 'ACL permit, interface statistics, scheduled task' },
                    { level: '7', keyword: 'Debug',         desc: 'Debug-level messages',                   example: 'Packet dumps, STP calculations, OSPF hello timers' }
                ],
                allEntries: [
                    { timestamp: '2026-03-30 02:12:01', severity: '6', host: 'SW1',   facility: 'local7', message: 'STP: VLAN 1 Root bridge election complete, SW1 is root' },
                    { timestamp: '2026-03-30 02:13:45', severity: '5', host: 'RTR1',  facility: 'local7', message: 'OSPF-5-ADJCHG: Neighbor 10.10.0.2 on Gi0/1 is Full' },
                    { timestamp: '2026-03-30 02:14:33', severity: '4', host: 'SW1',   facility: 'local7', message: 'LINK-3-UPDOWN: Interface FastEthernet0/24, changed state to down' },
                    { timestamp: '2026-03-30 02:14:34', severity: '4', host: 'SW1',   facility: 'local7', message: 'LINEPROTO-5-UPDOWN: Line protocol on Fa0/24, changed state to down' },
                    { timestamp: '2026-03-30 02:15:01', severity: '6', host: 'SRV1',  facility: 'local7', message: 'CRON: (root) CMD (/usr/sbin/logrotate /etc/logrotate.conf)' },
                    { timestamp: '2026-03-30 02:16:22', severity: '7', host: 'RTR2',  facility: 'local7', message: 'BGP: 203.0.113.1 sending keepalive, holdtime 180s remaining' },
                    { timestamp: '2026-03-30 02:18:47', severity: '1', host: 'RTR1',  facility: 'local7', message: 'CPU-1-ALERT: 5-min CPU utilization 95% exceeded threshold 80%' },
                    { timestamp: '2026-03-30 02:19:01', severity: '3', host: 'RTR1',  facility: 'local7', message: 'ROUTING-3-ERROR: BGP process consuming 62% of CPU cycles' },
                    { timestamp: '2026-03-30 02:20:15', severity: '4', host: 'RTR1',  facility: 'local7', message: 'SYS-4-MEMALLOC: Memory allocation of 2048 bytes failed in Pool Processor' },
                    { timestamp: '2026-03-30 02:22:01', severity: '2', host: 'SRV1',  facility: 'local7', message: 'DISK-2-CRITICAL: /dev/sda1 usage 98% (489 GB / 500 GB) — service impact imminent' },
                    { timestamp: '2026-03-30 02:22:30', severity: '4', host: 'SRV1',  facility: 'local7', message: 'DISK-4-WARNING: Write latency on /dev/sda1 exceeded 200ms threshold' },
                    { timestamp: '2026-03-30 02:23:05', severity: '6', host: 'SRV1',  facility: 'local7', message: 'SSHD: Accepted publickey for admin from 10.10.2.30 port 52341' },
                    { timestamp: '2026-03-30 02:25:15', severity: '4', host: 'SW2',   facility: 'local7', message: 'SW_MATM-4-MACFLAP_NOTIF: MAC 001a.2b3c.4d99 flapping between Gi0/12 and Gi0/18 in VLAN 10' },
                    { timestamp: '2026-03-30 02:25:45', severity: '4', host: 'SW2',   facility: 'local7', message: 'SW_MATM-4-MACFLAP_NOTIF: 45 MAC flaps in 60 seconds on VLAN 10' },
                    { timestamp: '2026-03-30 02:27:01', severity: '6', host: 'SW1',   facility: 'local7', message: 'CDP-6-NEIGHBOR: Device SW2 on interface Gi0/1 is up' },
                    { timestamp: '2026-03-30 02:29:33', severity: '7', host: 'RTR2',  facility: 'local7', message: 'BGP: 203.0.113.1 hold timer expired (180s), no keepalive received' },
                    { timestamp: '2026-03-30 02:31:58', severity: '2', host: 'RTR2',  facility: 'local7', message: 'BGP-2-CRITICAL: Peer 203.0.113.1 (AS 64512) state changed from Established to Idle' },
                    { timestamp: '2026-03-30 02:32:10', severity: '3', host: 'RTR2',  facility: 'local7', message: 'BGP-3-NOTIFICATION: sent to neighbor 203.0.113.1 4/0 (hold time expired)' },
                    { timestamp: '2026-03-30 02:33:01', severity: '5', host: 'RTR1',  facility: 'local7', message: 'BGP-5-NOTICE: Prefix count from AS 64512 via RTR2 dropped to 0 — failover active' },
                    { timestamp: '2026-03-30 02:35:00', severity: '6', host: 'NMS',   facility: 'local7', message: 'SNMP-6-POLL: Completed polling cycle for 5 devices, 5 alerts outstanding' }
                ]
            },
            netmap: {
                topology: '[INTERNET] --- [ISP: AS 64512 / 203.0.113.1] --- [RTR2: 10.10.0.2] ---+--- [RTR1: 10.10.0.1] --- [WAN/MPLS]\n                                                                         |\n                                                              [SW1: 10.10.1.1] --- [SW2: 10.10.1.2]\n                                                                 |    |    |          |    |    |\n                                                               Fa0/1-23  Fa0/24     Gi0/12 Gi0/18\n                                                               (Users)  (AP-Floor3)  (Flapping!)\n                                                                         |\n                                                              [SRV1: 10.10.2.10] --- [Syslog: 10.10.2.20] --- [NMS: 10.10.2.25]',
                statusSummary: 'SW1: 1 port DOWN (Fa0/24) | SW2: MAC flapping VLAN 10 | RTR1: CPU 95% CRITICAL | RTR2: BGP peer IDLE | SRV1: Disk 98% CRITICAL',
                snmpInfo: 'All devices configured for SNMPv2c | Community: crestline-ro (read) / crestline-rw (write) | Trap destination: nms.crestline.local:162 | Syslog destination: syslog.crestline.local:514'
            },
            incident: {
                highestPriority: '',
                snmpVersion: '',
                syslogTransport: '',
                snmpTrapPort: '',
                criticalCount: '',
                snmpRecommendation: '',
                reportScore: 0,
                reportComplete: false
            }
        }
    },

    /* -- 10 Tasks -------------------------------------------- */
    tasks: [
        /* -- Task 1: Open SNMP Manager ----------------------- */
        {
            id: 'task-01-open-snmp',
            title: '1. Open the SNMP Manager',
            description: 'Double-click the "SNMP Manager" icon to open the NOC dashboard. Review the Device Inventory to see all 5 managed devices and their current alert status.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* -- Task 2: Browse SW1 OIDs ------------------------- */
        {
            id: 'task-02-browse-sw1',
            title: '2. Browse SW1 OIDs — Find the Down Port',
            description: 'Navigate to OID Browser. Select SW1 (Core-Switch-1) and click Apply. Review the SNMP OID values. Find the interface with ifOperStatus = down(2). Note the OID 1.3.6.1.2.1.2.2.1.8.24 — this is the standard MIB-II ifOperStatus OID for interface Fa0/24.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.snmp.sw1Browsed',
                value: true
            }
        },
        /* -- Task 3: Browse RTR1 OIDs — CPU Alert ------------ */
        {
            id: 'task-03-browse-rtr1',
            title: '3. Browse RTR1 OIDs — Investigate CPU Alert',
            description: 'Select RTR1 (Edge-Router-1) in the OID Browser and click Apply. The avgBusy5 OID (1.3.6.1.4.1.9.2.1.57.0) shows 95% CPU utilization. This is a Cisco private MIB OID under the enterprise tree (1.3.6.1.4.1.9 = Cisco). Note memory is also low.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.snmp.rtr1Browsed',
                value: true
            }
        },
        /* -- Task 4: Browse SRV1 OIDs — Disk Critical -------- */
        {
            id: 'task-04-browse-srv1',
            title: '4. Browse SRV1 OIDs — Disk Storage Critical',
            description: 'Select SRV1 (File-Server-1) in the OID Browser and click Apply. The hrStorageUsed OID (1.3.6.1.2.1.25.2.3.1.6) shows /dev/sda1 at 98%. This uses the Host Resources MIB (RFC 2790). Note the secondary disk /dev/sdb1 has 90% free space.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.snmp.srv1Browsed',
                value: true
            }
        },
        /* -- Task 5: Investigate Alert 2 — RTR1 CPU ---------- */
        {
            id: 'task-05-investigate-rtr1',
            title: '5. Investigate Alert: RTR1 CPU Threshold Exceeded',
            description: 'Navigate to Alert Triage. Select "ALERT-2: RTR1 CPU Threshold Exceeded (95%)" and click Apply. Read the root cause analysis and recommended actions. This is the highest severity alert — it affects all traffic routed through RTR1.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.snmp.alert2Investigated',
                value: true
            }
        },
        /* -- Task 6: Investigate Alert 5 — BGP Down ---------- */
        {
            id: 'task-06-investigate-bgp',
            title: '6. Investigate Alert: RTR2 BGP Neighbor DOWN',
            description: 'Select "ALERT-5: RTR2 BGP Neighbor DOWN" in Alert Triage and click Apply. The BGP backward transition trap (1.3.6.1.2.1.15.3.1.2) indicates the peer relationship with ISP dropped. Hold Timer Expired means no keepalives received in 180 seconds.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.snmp.alert5Investigated',
                value: true
            }
        },
        /* -- Task 7: Open Syslog and filter Critical ---------- */
        {
            id: 'task-07-syslog-critical',
            title: '7. Filter Syslog for Critical Events',
            description: 'Open the Syslog Viewer. Navigate to "Filter by Severity". Select severity level 2 (Critical) and click Apply. You should see 2 critical entries: SRV1 disk and RTR2 BGP. Critical (level 2) means hardware or service failure is imminent.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.syslog.filteredCritical',
                value: true
            }
        },
        /* -- Task 8: Filter Warning events -------------------- */
        {
            id: 'task-08-syslog-warning',
            title: '8. Filter Syslog for Warning Events',
            description: 'Change the severity filter to level 4 (Warning) and click Apply. Warnings include the SW1 port down, RTR1 memory allocation failure, SRV1 write latency, and SW2 MAC flapping. Warning (level 4) means abnormal conditions that may lead to errors.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.syslog.filteredWarning',
                value: true
            }
        },
        /* -- Task 9: Classify all 5 alerts -------------------- */
        {
            id: 'task-09-classify',
            title: '9. Classify Alert Severity Levels',
            description: 'Navigate to "Classify Events" in the Syslog Viewer. For each of the 5 alerts, select the correct syslog severity level based on what you learned. Think carefully: a single port down is different from a routing protocol failure or imminent disk full. Click Apply when done.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.syslog.classificationComplete',
                value: true
            }
        },
        /* -- Task 10: Complete Incident Log ------------------- */
        {
            id: 'task-10-incident-log',
            title: '10. Complete the Incident Log',
            description: 'Open the Incident Log. Fill in: highest priority alert (RTR1 CPU), SNMP version in use (v2c), syslog transport (UDP 514), SNMP trap port (162), number of CRITICAL alerts (3), and the recommended SNMP security improvement (SNMPv3). Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.incident.reportComplete',
                value: true
            }
        }
    ]
};
