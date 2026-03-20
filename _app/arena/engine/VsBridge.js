/* ============================================================
   CTF ARENA — VsBridge.js
   Event Bridge for Competitive Red vs Blue Matches

   PURPOSE:
   In VS mode, Red team and Blue team play simultaneously in the
   same scenario. This bridge translates Red team terminal actions
   into real-time SIEM alerts on Blue team's console, and Blue
   team containment actions into restrictions on Red team's access.

   HOW IT WORKS:
   1. Red types a command in their terminal
   2. VsBridge.onRedAction() evaluates the command
   3. If it maps to a detectable event, VsBridge writes to Firestore
   4. Blue team's real-time listener picks up the event
   5. Event appears as a SIEM alert in Blue's MonitoringDashboard

   Going the other direction:
   1. Blue executes a containment action (firewall block, revoke creds)
   2. VsBridge.onBlueAction() writes containment state to Firestore
   3. Red team's listener picks up the containment change
   4. Red's command handler checks containment before executing

   REQUIRES: CoOpSync.js (must be initialized in VS mode)

   @version 1.0.0
   @feature AR-29
   ============================================================ */

const VsBridge = (function() {
    'use strict';

    let _active = false;
    let _teamId = null;       // 'alpha' (Red) or 'bravo' (Blue)
    let _sessionRef = null;
    let _eventsRef = null;
    let _containmentRef = null;
    let _eventUnsubscribe = null;
    let _containmentUnsubscribe = null;
    let _onSiemAlert = null;      // Blue team callback
    let _onContainment = null;    // Red team callback
    let _containmentState = {
        firewallBlocked: false,
        credsRevoked: false,
        hostIsolated: false,
        sessionKilled: false
    };

    // ────────────────────────────────────────────────
    // EVENT MAPPING
    // Maps Red team terminal commands to SIEM alert types.
    // Each pattern tests the command string and produces
    // an alert object for the Blue team.
    // ────────────────────────────────────────────────

    const RED_EVENT_MAP = [
        {
            pattern: /nmap\s/i,
            generate: function(cmd) {
                return {
                    type: 'PORT_SCAN',
                    severity: 'MEDIUM',
                    source: 'IDS',
                    title: 'Port scan detected from external IP',
                    detail: 'Nmap SYN scan targeting nexus-web01. Multiple ports probed.',
                    src_ip: '10.10.99.7',
                    dst_ip: '10.10.14.20',
                    mitre: 'T1046'
                };
            }
        },
        {
            pattern: /gobuster|dirb|nikto|ffuf/i,
            generate: function(cmd) {
                return {
                    type: 'DIR_ENUM',
                    severity: 'MEDIUM',
                    source: 'WAF',
                    title: 'Directory enumeration detected',
                    detail: 'Automated directory brute-force against nexus-web01. High request volume from single IP.',
                    src_ip: '10.10.99.7',
                    dst_ip: '10.10.14.20',
                    mitre: 'T1083'
                };
            }
        },
        {
            pattern: /curl.*file:|curl.*\.\.\//i,
            generate: function(cmd) {
                return {
                    type: 'LFI_ATTEMPT',
                    severity: 'HIGH',
                    source: 'WAF',
                    title: 'Local File Inclusion attempt detected',
                    detail: 'Directory traversal payload in /lookup endpoint. Attempting to read system files.',
                    src_ip: '10.10.99.7',
                    dst_ip: '10.10.14.20',
                    mitre: 'T1190'
                };
            }
        },
        {
            pattern: /curl.*\/etc\/(passwd|shadow|hosts)|curl.*config/i,
            generate: function(cmd) {
                return {
                    type: 'SENSITIVE_FILE_ACCESS',
                    severity: 'CRITICAL',
                    source: 'FIM',
                    title: 'Sensitive file accessed via web application',
                    detail: 'Configuration or system file read through SSRF/LFI. Possible credential exposure.',
                    src_ip: '10.10.99.7',
                    dst_ip: '10.10.14.20',
                    mitre: 'T1005'
                };
            }
        },
        {
            pattern: /ssh\s/i,
            generate: function(cmd) {
                return {
                    type: 'SSH_LOGIN',
                    severity: 'HIGH',
                    source: 'AUTH',
                    title: 'SSH login from external IP',
                    detail: 'Successful SSH authentication for devops account from unauthorized external address.',
                    src_ip: '10.10.99.7',
                    dst_ip: '10.10.14.20',
                    mitre: 'T1078'
                };
            }
        },
        {
            pattern: /sudo\s/i,
            generate: function(cmd) {
                return {
                    type: 'PRIVILEGE_ESCALATION',
                    severity: 'CRITICAL',
                    source: 'AUTH',
                    title: 'Privilege escalation detected',
                    detail: 'User devops executed sudo command. NOPASSWD policy allowed elevation without authentication.',
                    src_ip: '10.10.14.20',
                    dst_ip: '10.10.14.20',
                    mitre: 'T1548'
                };
            }
        },
        {
            pattern: /ssh.*10\.10\.1|ssh.*dev|ssh.*pivot/i,
            generate: function(cmd) {
                return {
                    type: 'LATERAL_MOVEMENT',
                    severity: 'CRITICAL',
                    source: 'NETWORK',
                    title: 'Lateral movement to internal server',
                    detail: 'SSH connection from nexus-web01 to nexus-dev01. Possible pivot using compromised credentials.',
                    src_ip: '10.10.14.20',
                    dst_ip: '10.10.14.21',
                    mitre: 'T1021.004'
                };
            }
        },
        {
            pattern: /cat.*rd_|cat.*secret|cat.*confidential|exfil|scp.*185/i,
            generate: function(cmd) {
                return {
                    type: 'DATA_EXFILTRATION',
                    severity: 'CRITICAL',
                    source: 'DLP',
                    title: 'Potential data exfiltration detected',
                    detail: 'Sensitive files accessed on nexus-dev01. Data transfer to external IP 185.220.101.47 suspected.',
                    src_ip: '10.10.14.21',
                    dst_ip: '185.220.101.47',
                    mitre: 'T1041'
                };
            }
        }
    ];

    // ────────────────────────────────────────────────
    // INITIALIZATION
    // ────────────────────────────────────────────────

    /**
     * Initialize the bridge for a VS session.
     * Called after CoOpSync.init() and joinSession().
     *
     * @param {string} teamId - 'alpha' (Red) or 'bravo' (Blue)
     * @param {object} sessionRef - Firestore document reference for the session
     */
    function init(teamId, sessionRef) {
        _teamId = teamId;
        _sessionRef = sessionRef;

        var fs = window.firebaseFirestore;
        _eventsRef = fs.collection(sessionRef, 'bridge_events');
        _containmentRef = fs.doc(sessionRef, 'bridge_state/containment');

        _active = true;

        // Blue team: listen for Red events
        if (_teamId === 'bravo') {
            _eventUnsubscribe = fs.onSnapshot(
                fs.query(_eventsRef, fs.orderBy('timestamp', 'asc')),
                function(snapshot) {
                    snapshot.docChanges().forEach(function(change) {
                        if (change.type === 'added' && _onSiemAlert) {
                            _onSiemAlert(change.doc.data());
                        }
                    });
                }
            );
        }

        // Red team: listen for containment changes
        if (_teamId === 'alpha') {
            _containmentUnsubscribe = fs.onSnapshot(_containmentRef, function(doc) {
                if (doc.exists()) {
                    _containmentState = doc.data();
                    if (_onContainment) {
                        _onContainment(_containmentState);
                    }
                }
            });
        }

        // Initialize containment doc if it doesn't exist (host creates it)
        if (_teamId === 'alpha') {
            fs.setDoc(_containmentRef, _containmentState, { merge: true });
        }

        console.log('[VS-BRIDGE] Initialized for team: ' + _teamId);
    }

    // ────────────────────────────────────────────────
    // RED TEAM → BLUE TEAM (Event Generation)
    // ────────────────────────────────────────────────

    /**
     * Called by BoxEngine when Red team executes a command.
     * Evaluates the command against the event map and writes
     * matching events to Firestore for Blue team to receive.
     *
     * @param {string} command - The terminal command Red typed
     * @returns {boolean} true if an event was generated
     */
    function onRedAction(command) {
        if (!_active || _teamId !== 'alpha') return false;

        var generated = false;
        for (var i = 0; i < RED_EVENT_MAP.length; i++) {
            if (RED_EVENT_MAP[i].pattern.test(command)) {
                var alert = RED_EVENT_MAP[i].generate(command);
                alert.timestamp = Date.now();
                alert.raw_command = command.substring(0, 80); // Truncate for privacy

                var fs = window.firebaseFirestore;
                fs.addDoc(_eventsRef, alert).catch(function(e) {
                    console.warn('[VS-BRIDGE] Failed to write event:', e);
                });

                generated = true;
                break; // One event per command
            }
        }
        return generated;
    }

    // ────────────────────────────────────────────────
    // BLUE TEAM → RED TEAM (Containment Actions)
    // ────────────────────────────────────────────────

    /**
     * Called when Blue team executes a containment action.
     * Writes the containment state to Firestore, which Red
     * team's listener picks up and enforces.
     *
     * @param {string} action - 'firewall' | 'creds' | 'isolate' | 'kill'
     * @returns {boolean} true if the action was valid
     */
    function onBlueAction(action) {
        if (!_active || _teamId !== 'bravo') return false;

        var updated = false;
        var update = {};

        switch (action) {
            case 'firewall':
                update.firewallBlocked = true;
                updated = true;
                break;
            case 'creds':
                update.credsRevoked = true;
                updated = true;
                break;
            case 'isolate':
                update.hostIsolated = true;
                updated = true;
                break;
            case 'kill':
                update.sessionKilled = true;
                updated = true;
                break;
        }

        if (updated) {
            var fs = window.firebaseFirestore;
            fs.updateDoc(_containmentRef, update).catch(function(e) {
                console.warn('[VS-BRIDGE] Failed to write containment:', e);
            });
        }

        return updated;
    }

    // ────────────────────────────────────────────────
    // RED TEAM: CHECK CONTAINMENT BEFORE EXECUTING
    // ────────────────────────────────────────────────

    /**
     * Called by Red team's command handler before executing.
     * Returns a denial message if Blue has contained the action,
     * or null if the action is still allowed.
     *
     * @param {string} command - The command Red is trying to execute
     * @returns {string|null} Denial message or null if allowed
     */
    function checkContainment(command) {
        if (!_active || _teamId !== 'alpha') return null;

        // Firewall blocked — no network commands work
        if (_containmentState.firewallBlocked) {
            if (/nmap|curl|wget|ssh|scp|nc|ping/i.test(command)) {
                return '[CONNECTION REFUSED] Firewall rule applied by SOC — your IP has been blocked.';
            }
        }

        // Credentials revoked — SSH fails
        if (_containmentState.credsRevoked) {
            if (/ssh/i.test(command)) {
                return '[AUTH FAILED] Credentials have been revoked by the SOC team. Access denied.';
            }
        }

        // Host isolated — nothing reaches the target
        if (_containmentState.hostIsolated) {
            if (/curl|ssh|nmap|scp|wget/i.test(command)) {
                return '[NETWORK UNREACHABLE] Target host has been isolated from the network by the SOC.';
            }
        }

        // Session killed — everything fails
        if (_containmentState.sessionKilled) {
            return '[SESSION TERMINATED] Your session has been killed by the SOC. Game over.';
        }

        return null;
    }

    /**
     * Check if Blue team has achieved full containment.
     * Returns true if all containment actions are complete.
     */
    function isFullyContained() {
        return _containmentState.firewallBlocked &&
               _containmentState.credsRevoked &&
               _containmentState.hostIsolated;
    }

    // ────────────────────────────────────────────────
    // CALLBACKS
    // ────────────────────────────────────────────────

    /**
     * Register callback for Blue team to receive SIEM alerts.
     * Called with the alert object when Red performs a detectable action.
     */
    function onSiemAlert(callback) {
        _onSiemAlert = callback;
    }

    /**
     * Register callback for Red team to receive containment updates.
     * Called with the containment state object when Blue takes action.
     */
    function onContainmentChange(callback) {
        _onContainment = callback;
    }

    // ────────────────────────────────────────────────
    // CLEANUP
    // ────────────────────────────────────────────────

    function destroy() {
        if (_eventUnsubscribe) _eventUnsubscribe();
        if (_containmentUnsubscribe) _containmentUnsubscribe();
        _active = false;
        _teamId = null;
        _sessionRef = null;
        _eventsRef = null;
        _containmentRef = null;
        _onSiemAlert = null;
        _onContainment = null;
        _containmentState = {
            firewallBlocked: false,
            credsRevoked: false,
            hostIsolated: false,
            sessionKilled: false
        };
        console.log('[VS-BRIDGE] Destroyed');
    }

    // ────────────────────────────────────────────────
    // PUBLIC API
    // ────────────────────────────────────────────────

    return {
        init: init,
        onRedAction: onRedAction,
        onBlueAction: onBlueAction,
        checkContainment: checkContainment,
        isFullyContained: isFullyContained,
        onSiemAlert: onSiemAlert,
        onContainmentChange: onContainmentChange,
        getContainmentState: function() { return Object.assign({}, _containmentState); },
        isActive: function() { return _active; },
        getTeam: function() { return _teamId; },
        destroy: destroy
    };

})();
