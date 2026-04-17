/* ============================================================
   PIS-L07: Lab Isolation Protocol
   Principles of Information Security -- CTF Lab
   Network segmentation: VLANs, firewall rules, ACLs to isolate
   a compromised lab while keeping clean labs operational
   SY0-701: 3.1, 3.2
   ============================================================ */

const PISL07Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Lab Isolation Protocol',
    subtitle: 'Hexworth Containment -- Network Segmentation Emergency',
    description: 'A contagion breach in Lab 3 is spreading through shared network segments. Implement VLANs, ACLs, and firewall rules to isolate the compromised labs while keeping clean labs operational. Three objectives: segment the network, verify the isolation holds, confirm clean labs still communicate.',
    difficulty: 'Intermediate',
    estimatedTime: 45,
    accent: '#f97316',
    storageKey: 'hexworth_lab_pis_l07',
    registryId: 'pis-l07-lab-isolation-protocol',
    trackerKey: 'lab_pis_l07',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Network Operations Terminal -- BSL-3 Clearance',
            'Cisco IOS simulator: LOADED',
            'Network topology database: CONNECTED',
            'VLAN manager: ONLINE',
            'WARNING: CONTAINMENT BREACH DETECTED -- LAB 3'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'netops'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'At 03:47 UTC, automated sensors detected self-replicating contagion traffic on the Lab 3 segment. The pathogen has already spread to Lab 4. Labs 1, 2, and 5 are still clean. The facility network is currently flat -- all six labs share a single broadcast domain with no segmentation. That is why it is spreading. Your job is to implement the Lab Isolation Protocol: create VLANs, assign labs to segments, write the ACLs, and push the firewall rules before the contagion reaches clean labs.',
        scenario: 'The network consists of six lab segments plus an admin network. Compromised: Lab 3 (VLAN 30) and Lab 4 (VLAN 40). Clean and operational: Labs 1, 2, 5, 6. Admin network must maintain access to all labs for management. After segmentation: compromised VLANs must not reach clean VLANs. Clean labs must still communicate with each other and with admin. Run network-map to see the current topology. Use vlan create, acl add, and firewall-rule commands to implement isolation.',
        outro: 'Network segmentation complete. Labs 3 and 4 are isolated -- the contagion cannot cross VLAN boundaries. Clean labs 1, 2, 5, and 6 maintain full operational communication. Admin network retains management access across all segments. The pathogen is contained. This is why flat networks are a liability: a single breach can spread everywhere. Segmentation is your primary containment barrier.'
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'netops',
        hostname: 'net-mgmt-01',
        startDir: '/home/netops',
        welcome: 'Hexworth Containment -- Network Operations Terminal\nBSL-3 Clearance Active\n\n*** CRITICAL: CONTAINMENT BREACH IN PROGRESS ***\n  Compromised segments: Lab 3, Lab 4\n  Clean segments: Labs 1, 2, 5, 6 (at risk)\n  Current topology: FLAT (no segmentation)\n\nObjectives:\n  [1] Create VLANs and segment the network\n  [2] Verify compromised labs cannot reach clean labs\n  [3] Verify clean labs can still communicate\n\nType "network-map" to see current topology.\nType "help" for command reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'netops': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'LAB ISOLATION PROTOCOL -- NETOPS NOTES\n========================================\n\nNETWORK TOPOLOGY (current -- FLAT, no segmentation):\n  All labs on 10.0.0.0/16, single broadcast domain\n  Core switch: CORE-SW-01 (Cisco IOS simulated)\n  Firewall: FW-PERIMETER-01\n\nLAB ASSIGNMENTS:\n  Lab 1 -- Pathogen Storage (clean)     hosts: 10.0.1.10-20\n  Lab 2 -- Analysis Suite (clean)       hosts: 10.0.2.10-20\n  Lab 3 -- Breach Origin (COMPROMISED)  hosts: 10.0.3.10-20\n  Lab 4 -- Secondary (COMPROMISED)      hosts: 10.0.4.10-20\n  Lab 5 -- Sequencing Lab (clean)       hosts: 10.0.5.10-20\n  Lab 6 -- Containment R&D (clean)      hosts: 10.0.6.10-20\n  Admin -- Facility Admin Network       hosts: 10.0.100.10-20\n\nTARGET VLAN SCHEME:\n  VLAN 10  -- Lab 1  (10.0.1.0/24)\n  VLAN 20  -- Lab 2  (10.0.2.0/24)\n  VLAN 30  -- Lab 3  (10.0.3.0/24) [QUARANTINE]\n  VLAN 40  -- Lab 4  (10.0.4.0/24) [QUARANTINE]\n  VLAN 50  -- Lab 5  (10.0.5.0/24)\n  VLAN 60  -- Lab 6  (10.0.6.0/24)\n  VLAN 100 -- Admin  (10.0.100.0/24)\n\nACL REQUIREMENTS:\n  Block all traffic: VLAN 30 -> VLAN 10,20,50,60,100\n  Block all traffic: VLAN 40 -> VLAN 10,20,50,60,100\n  Block all traffic: VLAN 10,20,50,60 -> VLAN 30,40\n  Permit: admin VLAN 100 -> all VLANs (management access)\n  Permit: clean labs -> clean labs (operations must continue)\n\nCOMMANDS:\n  network-map                           Show current topology\n  vlan create <id> <name> <subnet>      Create a VLAN\n  acl add <name> <action> <src> <dst>   Add ACL entry\n  firewall-rule <action> <src> <dst>    Add firewall rule\n  verify-isolation                      Test compromised -> clean\n  verify-operations                     Test clean -> clean\n  show vlans                            List configured VLANs\n  show acls                             List configured ACLs\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'network-map\nshow vlans\n'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'network': {
                            type: 'dir',
                            children: {
                                'topology.conf': {
                                    type: 'file',
                                    content: '# HEXWORTH CONTAINMENT NETWORK TOPOLOGY\n# Last updated: 2026-04-09T03:47:00Z (breach detected)\n\n[core-switch]\ndevice: CORE-SW-01\nmodel: Cisco Catalyst 9300 (simulated)\nports: 48\nvlans_configured: NONE\nstatus: FLAT -- ALL LABS BRIDGED\n\n[firewall]\ndevice: FW-PERIMETER-01\nmodel: Palo Alto PA-3260 (simulated)\nrules_configured: 2 (default allow-out, default deny-in)\nstatus: NOT SEGMENTATION-AWARE\n\n[labs]\nlab1: 10.0.1.0/24 -- CLEAN -- 12 hosts active\nlab2: 10.0.2.0/24 -- CLEAN -- 8 hosts active\nlab3: 10.0.3.0/24 -- COMPROMISED -- contagion active on 14 hosts\nlab4: 10.0.4.0/24 -- COMPROMISED -- contagion spreading, 6 hosts infected\nlab5: 10.0.5.0/24 -- CLEAN -- 9 hosts active\nlab6: 10.0.6.0/24 -- CLEAN -- 5 hosts active\nadmin: 10.0.100.0/24 -- ADMIN -- 4 management hosts\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        vlans: {},          // id -> { name, subnet }
        acls: [],           // array of rule objects
        firewallRules: [],  // array of rule objects
        isolationVerified: false,
        operationsVerified: false
    },

    // Required VLANs that must be created (IDs)
    _requiredVlans: [10, 20, 30, 40, 50, 60, 100],

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // network-map -- display current network topology
        'network-map': function(args, term, engine) {
            const vlanCount = Object.keys(engine._state.vlans).length;
            const aclCount = engine._state.acls.length;
            const status = vlanCount >= 7 ? 'SEGMENTED' : 'FLAT (unsegmented)';

            return 'HEXWORTH CONTAINMENT -- NETWORK TOPOLOGY\n' + '='.repeat(50) + '\n\nCORE SWITCH: CORE-SW-01 (Cisco Catalyst 9300)\n  VLANs configured: ' + vlanCount + '/7\n  Status: ' + status + '\n\nFIREWALL: FW-PERIMETER-01 (Palo Alto PA-3260)\n  ACL rules: ' + aclCount + '\n  Firewall rules: ' + engine._state.firewallRules.length + '\n\nLAB SEGMENTS:\n  10.0.1.0/24  Lab 1 -- Pathogen Storage    [CLEAN]       ' + (engine._state.vlans[10] ? 'VLAN 10 OK' : 'NO VLAN') + '\n  10.0.2.0/24  Lab 2 -- Analysis Suite      [CLEAN]       ' + (engine._state.vlans[20] ? 'VLAN 20 OK' : 'NO VLAN') + '\n  10.0.3.0/24  Lab 3 -- Breach Origin       [COMPROMISED] ' + (engine._state.vlans[30] ? 'VLAN 30 OK' : 'NO VLAN') + '\n  10.0.4.0/24  Lab 4 -- Secondary Spread    [COMPROMISED] ' + (engine._state.vlans[40] ? 'VLAN 40 OK' : 'NO VLAN') + '\n  10.0.5.0/24  Lab 5 -- Sequencing Lab      [CLEAN]       ' + (engine._state.vlans[50] ? 'VLAN 50 OK' : 'NO VLAN') + '\n  10.0.6.0/24  Lab 6 -- Containment R&D     [CLEAN]       ' + (engine._state.vlans[60] ? 'VLAN 60 OK' : 'NO VLAN') + '\n  10.0.100.0/24 Admin -- Management          [ADMIN]       ' + (engine._state.vlans[100] ? 'VLAN 100 OK' : 'NO VLAN') + '\n\nSee ~/notes.txt for VLAN target scheme and command reference.';
        },

        // vlan create <id> <name> <subnet>
        'vlan': function(args, term, engine) {
            const sub = args[0];
            if (sub !== 'create') {
                return 'Usage: vlan create <id> <name> <subnet>\nExample: vlan create 30 quarantine-lab3 10.0.3.0/24';
            }

            const id = parseInt(args[1]);
            const name = args[2];
            const subnet = args[3];

            if (!id || !name || !subnet) {
                return 'Usage: vlan create <id> <name> <subnet>\nExample: vlan create 10 lab1-pathogen-storage 10.0.1.0/24\n\nRequired VLANs: 10, 20, 30, 40, 50, 60, 100';
            }

            const validVlans = {
                10:  '10.0.1.0/24',
                20:  '10.0.2.0/24',
                30:  '10.0.3.0/24',
                40:  '10.0.4.0/24',
                50:  '10.0.5.0/24',
                60:  '10.0.6.0/24',
                100: '10.0.100.0/24'
            };

            if (!validVlans[id]) {
                return `Error: VLAN ID ${id} is not in the containment VLAN scheme.\nValid IDs: 10, 20, 30, 40, 50, 60, 100`;
            }

            if (subnet !== validVlans[id]) {
                return `Error: Subnet mismatch for VLAN ${id}.\nExpected: ${validVlans[id]}\nGot: ${subnet}\nSee ~/notes.txt for the target VLAN scheme.`;
            }

            engine._state.vlans[id] = { name, subnet };

            const count = Object.keys(engine._state.vlans).length;
            let output = `VLAN ${id} created successfully.\n  Name:   ${name}\n  Subnet: ${subnet}\n  Status: Active on CORE-SW-01\n\nVLANs configured: ${count}/7`;

            // Award flag1 when all 7 VLANs are created AND at least one ACL exists
            if (count >= 7 && engine._state.acls.length > 0 && !engine._flag1Awarded) {
                engine._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[SEGMENTATION MILESTONE] All VLANs created with ACL rules. Network segmented. Flag unlocked.';
            } else if (count >= 7) {
                output += '\n\nAll 7 VLANs created. Now add ACL rules and firewall rules to enforce isolation.\nSee ~/notes.txt for ACL requirements.';
            }

            return output;
        },

        // acl add <name> <action> <src> <dst>
        'acl': function(args, term, engine) {
            const sub = args[0];
            if (sub !== 'add') {
                return 'Usage: acl add <name> <action> <src> <dst>\nActions: permit, deny\nExample: acl add QUARANTINE-LAB3 deny 10.0.3.0/24 10.0.1.0/24';
            }

            const name   = args[1];
            const action = (args[2] || '').toLowerCase();
            const src    = args[3];
            const dst    = args[4];

            if (!name || !action || !src || !dst) {
                return 'Usage: acl add <name> <action> <src> <dst>\nExample: acl add BLOCK-LAB3-TO-CLEAN deny 10.0.3.0/24 any';
            }

            if (action !== 'permit' && action !== 'deny') {
                return 'Error: action must be "permit" or "deny".';
            }

            engine._state.acls.push({ name, action, src, dst });

            let output = `ACL entry added:\n  Name:   ${name}\n  Action: ${action.toUpperCase()}\n  Source: ${src}\n  Dest:   ${dst}\n  Applied to: CORE-SW-01 and FW-PERIMETER-01\n\nTotal ACL entries: ${engine._state.acls.length}`;

            // Check flag1: all VLANs created + at least some ACLs present
            if (Object.keys(engine._state.vlans).length >= 7 && engine._state.acls.length >= 1 && !engine._flag1Awarded) {
                engine._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[SEGMENTATION MILESTONE] Network segmented with VLANs and ACL rules. Flag unlocked.';
            }

            return output;
        },

        // firewall-rule <action> <src> <dst>
        'firewall-rule': function(args, term, engine) {
            const action = (args[0] || '').toLowerCase();
            const src    = args[1];
            const dst    = args[2];

            if (!action || !src || !dst) {
                return 'Usage: firewall-rule <action> <src> <dst>\nActions: allow, deny, drop\nExample: firewall-rule deny 10.0.3.0/24 10.0.1.0/24\nExample: firewall-rule allow 10.0.100.0/24 any';
            }

            if (!['allow', 'deny', 'drop'].includes(action)) {
                return 'Error: action must be "allow", "deny", or "drop".';
            }

            engine._state.firewallRules.push({ action, src, dst });

            let output = `Firewall rule added:\n  Action: ${action.toUpperCase()}\n  Source: ${src}\n  Dest:   ${dst}\n  Status: Pushed to FW-PERIMETER-01\n\nTotal firewall rules: ${engine._state.firewallRules.length}`;

            // Check flag1 trigger here too
            if (Object.keys(engine._state.vlans).length >= 7 && engine._state.acls.length >= 1 && !engine._flag1Awarded) {
                engine._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[SEGMENTATION MILESTONE] Network segmented with VLANs and ACL rules. Flag unlocked.';
            }

            return output;
        },

        // show vlans -- list configured VLANs
        'show': function(args, term, engine) {
            const sub = args[0];

            if (sub === 'vlans') {
                const vlans = engine._state.vlans;
                if (Object.keys(vlans).length === 0) {
                    return 'No VLANs configured.\nUse: vlan create <id> <name> <subnet>';
                }
                let lines = ['CONFIGURED VLANs -- CORE-SW-01', '='.repeat(40)];
                for (const [id, v] of Object.entries(vlans)) {
                    lines.push(`  VLAN ${id.padEnd(5)} ${v.subnet.padEnd(20)} ${v.name}`);
                }
                lines.push(`\nTotal: ${Object.keys(vlans).length}/7 required VLANs`);
                return lines.join('\n');
            }

            if (sub === 'acls') {
                if (engine._state.acls.length === 0) {
                    return 'No ACL entries configured.\nUse: acl add <name> <action> <src> <dst>';
                }
                let lines = ['CONFIGURED ACL RULES', '='.repeat(40)];
                engine._state.acls.forEach((r, i) => {
                    lines.push(`  ${String(i+1).padEnd(3)} ${r.action.padEnd(8)} src:${r.src.padEnd(18)} dst:${r.dst}  [${r.name}]`);
                });
                lines.push(`\nTotal entries: ${engine._state.acls.length}`);
                return lines.join('\n');
            }

            if (sub === 'firewall') {
                if (engine._state.firewallRules.length === 0) {
                    return 'No firewall rules configured.\nUse: firewall-rule <action> <src> <dst>';
                }
                let lines = ['FIREWALL RULES -- FW-PERIMETER-01', '='.repeat(40)];
                engine._state.firewallRules.forEach((r, i) => {
                    lines.push(`  Rule ${i+1}: ${r.action.toUpperCase().padEnd(8)} ${r.src.padEnd(20)} -> ${r.dst}`);
                });
                return lines.join('\n');
            }

            return 'Usage: show vlans | show acls | show firewall';
        },

        // verify-isolation -- test that compromised labs cannot reach clean labs
        'verify-isolation': function(args, term, engine) {
            // Requires at least 7 VLANs and deny rules for lab3/lab4 subnets
            const vlanReady = Object.keys(engine._state.vlans).length >= 7;
            const hasQuarantineRules = engine._state.acls.some(r =>
                r.action === 'deny' && (r.src.includes('10.0.3') || r.src.includes('10.0.4') || r.src.includes('vlan30') || r.src.includes('vlan40') || r.src.toLowerCase().includes('lab3') || r.src.toLowerCase().includes('lab4'))
            ) || engine._state.firewallRules.some(r =>
                (r.action === 'deny' || r.action === 'drop') && (r.src.includes('10.0.3') || r.src.includes('10.0.4'))
            );

            if (!vlanReady) {
                return 'ISOLATION VERIFICATION -- FAILED\n' + '='.repeat(40) + '\nPre-check failed: VLANs not fully configured.\nRequired: 7 VLANs configured. Current: ' + Object.keys(engine._state.vlans).length + '\n\nCreate all VLANs first with: vlan create <id> <name> <subnet>';
            }

            if (!hasQuarantineRules) {
                return 'ISOLATION VERIFICATION -- FAILED\n' + '='.repeat(40) + '\nPre-check failed: No deny ACL rules found for Lab 3 or Lab 4 subnets.\n\nYou must add ACL entries blocking 10.0.3.0/24 and 10.0.4.0/24 from reaching clean labs.\nExample: acl add BLOCK-LAB3 deny 10.0.3.0/24 10.0.1.0/24\nSee ~/notes.txt for full ACL requirements.';
            }

            // Passed -- simulate verification traffic
            engine._state.isolationVerified = true;

            let output = 'ISOLATION VERIFICATION -- RUNNING\n' + '='.repeat(50) + '\n\nSimulating probe traffic from compromised segments...\n\n  Lab 3 (10.0.3.15) --> Lab 1 (10.0.1.10): [BLOCKED by ACL] DENIED\n  Lab 3 (10.0.3.15) --> Lab 2 (10.0.2.10): [BLOCKED by ACL] DENIED\n  Lab 3 (10.0.3.15) --> Lab 5 (10.0.5.10): [BLOCKED by ACL] DENIED\n  Lab 3 (10.0.3.15) --> Lab 6 (10.0.6.10): [BLOCKED by ACL] DENIED\n  Lab 4 (10.0.4.12) --> Lab 1 (10.0.1.10): [BLOCKED by ACL] DENIED\n  Lab 4 (10.0.4.12) --> Lab 2 (10.0.2.10): [BLOCKED by ACL] DENIED\n  Lab 4 (10.0.4.12) --> Lab 5 (10.0.5.10): [BLOCKED by ACL] DENIED\n  Lab 4 (10.0.4.12) --> Lab 6 (10.0.6.10): [BLOCKED by ACL] DENIED\n  Lab 3 (10.0.3.15) --> Admin (10.0.100.10): [BLOCKED by ACL] DENIED\n  Lab 4 (10.0.4.12) --> Admin (10.0.100.10): [BLOCKED by ACL] DENIED\n\nRESULT: ISOLATION CONFIRMED\n  Compromised labs cannot reach any clean segment.\n  Contagion is contained at VLAN boundary.\n';

            if (!engine._flag2Awarded) {
                engine._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n[ISOLATION MILESTONE] Compromised labs verified isolated from clean labs. Flag unlocked.';
            }

            return output;
        },

        // verify-operations -- confirm clean labs still communicate
        'verify-operations': function(args, term, engine) {
            if (!engine._state.isolationVerified) {
                return 'OPERATIONS VERIFICATION -- BLOCKED\nMust verify isolation first.\nRun: verify-isolation';
            }

            const hasPermitRules = engine._state.acls.some(r => r.action === 'permit') ||
                engine._state.firewallRules.some(r => r.action === 'allow') ||
                // If the analyst only denied quarantine subnets, clean-to-clean is implicitly allowed
                engine._state.acls.some(r => r.action === 'deny' && (r.src.includes('10.0.3') || r.src.includes('10.0.4')));

            if (!hasPermitRules) {
                return 'OPERATIONS VERIFICATION -- INCOMPLETE\nNo permit rules or deny-only rules found.\nEnsure clean lab communication is either explicitly permitted\nor that your ACLs only deny the quarantined subnets.\n\nExample (implicit allow): only block 10.0.3.0/24 and 10.0.4.0/24\nExample (explicit): acl add PERMIT-CLEAN-LABS permit 10.0.1.0/24 10.0.2.0/24';
            }

            engine._state.operationsVerified = true;

            let output = 'OPERATIONS VERIFICATION -- RUNNING\n' + '='.repeat(50) + '\n\nSimulating operational traffic between clean labs...\n\n  Lab 1 (10.0.1.10) --> Lab 2 (10.0.2.10): PERMITTED\n  Lab 1 (10.0.1.10) --> Lab 5 (10.0.5.10): PERMITTED\n  Lab 1 (10.0.1.10) --> Lab 6 (10.0.6.10): PERMITTED\n  Lab 2 (10.0.2.10) --> Lab 5 (10.0.5.10): PERMITTED\n  Lab 2 (10.0.2.10) --> Lab 6 (10.0.6.10): PERMITTED\n  Lab 5 (10.0.5.10) --> Lab 6 (10.0.6.10): PERMITTED\n  Admin (10.0.100.10) --> Lab 1 (10.0.1.10): PERMITTED (management)\n  Admin (10.0.100.10) --> Lab 3 (10.0.3.10): PERMITTED (management)\n  Admin (10.0.100.10) --> Lab 4 (10.0.4.10): PERMITTED (management)\n\nRESULT: OPERATIONS CONFIRMED\n  Clean labs: full inter-lab communication functional.\n  Admin network: management access to all segments intact.\n  Facility operations are not degraded by segmentation.\n\nFACILITY STATUS: CONTAINED AND OPERATIONAL\n';

            if (!engine._flag3Awarded) {
                engine._flag3Awarded = true;
                engine.awardFlag('flag3');
                output += '\n[OPERATIONS MILESTONE] Clean lab communications verified. Facility fully operational. Flag unlocked.';
            }

            return output;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'NETWORK OPERATIONS TERMINAL -- COMMAND REFERENCE\n\n  network-map                           Show current network topology\n  vlan create <id> <name> <subnet>      Create a VLAN (IDs: 10,20,30,40,50,60,100)\n  acl add <name> <action> <src> <dst>   Add ACL rule (actions: permit, deny)\n  firewall-rule <action> <src> <dst>    Add firewall rule (actions: allow, deny, drop)\n  verify-isolation                      Test compromised labs cannot reach clean labs\n  verify-operations                     Test clean labs still communicate\n  show vlans                            List configured VLANs\n  show acls                             List configured ACL rules\n  show firewall                         List firewall rules\n  cat <file>                            Read a file\n  ls <path>                             List directory\n\nSee ~/notes.txt for topology details and ACL requirements.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l07-lab-isolation-protocol_flag1_network_segmented}',
            label: 'Network Segmented',
            description: 'Created all 7 VLANs and added ACL rules to enforce isolation.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l07-lab-isolation-protocol_flag2_isolation_verified}',
            label: 'Isolation Verified',
            description: 'Confirmed compromised labs (3 and 4) cannot reach clean lab segments.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l07-lab-isolation-protocol_flag3_operations_maintaine}',
            label: 'Operations Maintained',
            description: 'Confirmed clean labs retain full inter-lab communication.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Start with network-map to see the current flat topology. Then create all 7 VLANs per the scheme in ~/notes.txt. VLAN IDs must match the scheme exactly: 10 for Lab 1, 20 for Lab 2, 30 for Lab 3 (quarantine), 40 for Lab 4 (quarantine), 50, 60, 100 for admin.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For isolation, you need deny ACL rules where the source is the compromised subnet (10.0.3.0/24 or 10.0.4.0/24). The verify-isolation command checks for these deny rules. Example: acl add BLOCK-LAB3-TO-CLEAN deny 10.0.3.0/24 10.0.1.0/24',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For verify-operations to pass, you need at least one permit rule or your ACLs must only block the quarantined subnets (implicitly allowing everything else). The admin VLAN (100) must retain access to all labs. Once isolation is verified, run verify-operations.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '3.2', description: 'Apply infrastructure security best practices', skill: 'Implementing VLAN segmentation and ACLs to create isolated network zones' },
            { flagId: 'flag2', objective: '3.1', description: 'Compare and contrast security implications of different architecture models', skill: 'Verifying that micro-segmentation prevents lateral movement between network zones' },
            { flagId: 'flag3', objective: '3.2', description: 'Apply infrastructure security best practices', skill: 'Designing segmentation that maintains operational continuity while enforcing isolation' }
        ]
    }

};
