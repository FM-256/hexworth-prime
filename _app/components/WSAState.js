/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WSAState.js - Central State Store for Windows Server Administration Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hexworth Prime - House of Cloud
 * Course: WSA (Windows Server Administration)
 *
 * A Redux-inspired state management system that synchronizes state between
 * PSTerminal.js (PowerShell commands) and GUISimulator.js (GUI interactions).
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INSIGHT: Why Central State?                                                 │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ In real Windows Server, actions via GUI (e.g., ADUC) and PowerShell         │
 * │ affect the SAME underlying system. If you create a user in ADUC, it         │
 * │ immediately appears in Get-ADUser output.                                   │
 * │                                                                             │
 * │ WSAState replicates this behavior - both interfaces share one truth:        │
 * │                                                                             │
 * │   ┌─────────────┐         ┌───────────┐         ┌─────────────┐            │
 * │   │ PSTerminal  │ ──────► │  WSAState │ ◄────── │GUISimulator │            │
 * │   │(PowerShell) │ dispatch│  (Store)  │ dispatch│   (GUI)     │            │
 * │   └─────────────┘         └─────┬─────┘         └─────────────┘            │
 * │         ▲                       │                      ▲                   │
 * │         │         subscribe     │    subscribe         │                   │
 * │         └───────────────────────┴──────────────────────┘                   │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * Version: 1.0.0
 * Created: January 30, 2026
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const WSAState = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION TYPES
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // Actions are plain objects describing what happened. They have a type
    // (string constant) and a payload (the data for the change).
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Action Pattern                                                 │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Actions follow the Flux/Redux pattern:                                  │
    // │                                                                         │
    // │ { type: 'AD_CREATE_USER', payload: { samAccountName: 'jsmith', ... } }  │
    // │                                                                         │
    // │ The 'source' field helps with debugging - you can see if a change       │
    // │ came from PowerShell or GUI.                                            │
    // └─────────────────────────────────────────────────────────────────────────┘

    const ActionTypes = {
        // ─────────────────────────────────────────────────────────────────────
        // Active Directory Actions
        // ─────────────────────────────────────────────────────────────────────
        AD_CREATE_USER: 'AD_CREATE_USER',
        AD_UPDATE_USER: 'AD_UPDATE_USER',
        AD_DELETE_USER: 'AD_DELETE_USER',
        AD_ENABLE_USER: 'AD_ENABLE_USER',
        AD_DISABLE_USER: 'AD_DISABLE_USER',
        AD_UNLOCK_USER: 'AD_UNLOCK_USER',
        AD_RESET_PASSWORD: 'AD_RESET_PASSWORD',

        AD_CREATE_GROUP: 'AD_CREATE_GROUP',
        AD_UPDATE_GROUP: 'AD_UPDATE_GROUP',
        AD_DELETE_GROUP: 'AD_DELETE_GROUP',
        AD_ADD_MEMBER: 'AD_ADD_MEMBER',
        AD_REMOVE_MEMBER: 'AD_REMOVE_MEMBER',

        AD_CREATE_OU: 'AD_CREATE_OU',
        AD_UPDATE_OU: 'AD_UPDATE_OU',
        AD_DELETE_OU: 'AD_DELETE_OU',
        AD_MOVE_OBJECT: 'AD_MOVE_OBJECT',

        AD_CREATE_COMPUTER: 'AD_CREATE_COMPUTER',
        AD_UPDATE_COMPUTER: 'AD_UPDATE_COMPUTER',
        AD_DELETE_COMPUTER: 'AD_DELETE_COMPUTER',

        // ─────────────────────────────────────────────────────────────────────
        // Storage Actions
        // ─────────────────────────────────────────────────────────────────────
        STORAGE_INIT_DISK: 'STORAGE_INIT_DISK',
        STORAGE_CLEAR_DISK: 'STORAGE_CLEAR_DISK',
        STORAGE_SET_DISK_ONLINE: 'STORAGE_SET_DISK_ONLINE',
        STORAGE_SET_DISK_OFFLINE: 'STORAGE_SET_DISK_OFFLINE',

        STORAGE_CREATE_PARTITION: 'STORAGE_CREATE_PARTITION',
        STORAGE_DELETE_PARTITION: 'STORAGE_DELETE_PARTITION',
        STORAGE_RESIZE_PARTITION: 'STORAGE_RESIZE_PARTITION',

        STORAGE_FORMAT_VOLUME: 'STORAGE_FORMAT_VOLUME',
        STORAGE_SET_DRIVE_LETTER: 'STORAGE_SET_DRIVE_LETTER',

        STORAGE_CREATE_SHARE: 'STORAGE_CREATE_SHARE',
        STORAGE_DELETE_SHARE: 'STORAGE_DELETE_SHARE',
        STORAGE_UPDATE_SHARE: 'STORAGE_UPDATE_SHARE',

        // ─────────────────────────────────────────────────────────────────────
        // Hyper-V Actions
        // ─────────────────────────────────────────────────────────────────────
        VM_CREATE: 'VM_CREATE',
        VM_DELETE: 'VM_DELETE',
        VM_START: 'VM_START',
        VM_STOP: 'VM_STOP',
        VM_RESTART: 'VM_RESTART',
        VM_SUSPEND: 'VM_SUSPEND',
        VM_RESUME: 'VM_RESUME',
        VM_CHECKPOINT: 'VM_CHECKPOINT',
        VM_RESTORE_CHECKPOINT: 'VM_RESTORE_CHECKPOINT',
        VM_DELETE_CHECKPOINT: 'VM_DELETE_CHECKPOINT',
        VM_UPDATE: 'VM_UPDATE',

        VMSWITCH_CREATE: 'VMSWITCH_CREATE',
        VMSWITCH_DELETE: 'VMSWITCH_DELETE',
        VMSWITCH_UPDATE: 'VMSWITCH_UPDATE',

        // ─────────────────────────────────────────────────────────────────────
        // Service Actions
        // ─────────────────────────────────────────────────────────────────────
        SERVICE_START: 'SERVICE_START',
        SERVICE_STOP: 'SERVICE_STOP',
        SERVICE_RESTART: 'SERVICE_RESTART',
        SERVICE_SET_STARTUP: 'SERVICE_SET_STARTUP',

        // ─────────────────────────────────────────────────────────────────────
        // State Management Actions
        // ─────────────────────────────────────────────────────────────────────
        STATE_INIT: 'STATE_INIT',
        STATE_RESET: 'STATE_RESET',
        STATE_MERGE: 'STATE_MERGE',

        // ─────────────────────────────────────────────────────────────────────
        // Lab/Objective Actions
        // ─────────────────────────────────────────────────────────────────────
        OBJECTIVE_COMPLETE: 'OBJECTIVE_COMPLETE',
        OBJECTIVE_RESET: 'OBJECTIVE_RESET',
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE STRUCTURE
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Default state shape - matches PSTerminal.js state structure
     */
    const defaultState = {
        // ─────────────────────────────────────────────────────────────────────
        // Active Directory Objects
        // ─────────────────────────────────────────────────────────────────────
        adUsers: {},        // Key: SamAccountName, Value: User object
        adGroups: {},       // Key: Name, Value: Group object
        adComputers: {},    // Key: Name, Value: Computer object
        adOUs: {},          // Key: Name, Value: OU object

        // ─────────────────────────────────────────────────────────────────────
        // Storage
        // ─────────────────────────────────────────────────────────────────────
        disks: {},          // Key: Number, Value: Disk object
        partitions: {},     // Key: "DiskNumber-PartitionNumber", Value: Partition
        volumes: {},        // Key: DriveLetter, Value: Volume object
        shares: {},         // Key: Name, Value: Share object

        // ─────────────────────────────────────────────────────────────────────
        // Hyper-V
        // ─────────────────────────────────────────────────────────────────────
        vms: {},            // Key: Name, Value: VM object
        vmSwitches: {},     // Key: Name, Value: VMSwitch object
        vmCheckpoints: {},  // Key: "VMName-CheckpointName", Value: Checkpoint

        // ─────────────────────────────────────────────────────────────────────
        // Services
        // ─────────────────────────────────────────────────────────────────────
        services: {},       // Key: Name, Value: Service object

        // ─────────────────────────────────────────────────────────────────────
        // Cluster (for future modules)
        // ─────────────────────────────────────────────────────────────────────
        clusterNodes: {},   // Key: Name, Value: Node object
        clusterResources: {},

        // ─────────────────────────────────────────────────────────────────────
        // Filesystem (optional - primarily in PSTerminal)
        // ─────────────────────────────────────────────────────────────────────
        fs: {},

        // ─────────────────────────────────────────────────────────────────────
        // Lab Configuration
        // ─────────────────────────────────────────────────────────────────────
        moduleId: null,
        objectives: [],
        objectivesCompleted: {},

        // ─────────────────────────────────────────────────────────────────────
        // Metadata
        // ─────────────────────────────────────────────────────────────────────
        domain: 'hexworth.local',
        hostname: 'DC01',
        initialized: false,
        lastAction: null,
    };

    // The current state (mutable internally, immutable externally)
    let state = JSON.parse(JSON.stringify(defaultState));

    // Subscribers list
    let subscribers = [];

    // Action history for debugging
    let actionHistory = [];
    const MAX_HISTORY = 100;

    // ═══════════════════════════════════════════════════════════════════════════
    // REDUCERS
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // Reducers are pure functions that take the current state and an action,
    // then return a new state. They should never mutate the input state.
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Reducer Pattern                                                │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Pure functions are predictable - same input always gives same output.   │
    // │ This makes debugging easier and enables features like time-travel       │
    // │ debugging (stepping through past states).                               │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Main reducer - delegates to sub-reducers based on action type
     */
    function rootReducer(currentState, action) {
        const { type, payload } = action;

        // Handle state management actions first
        switch (type) {
            case ActionTypes.STATE_INIT:
                return {
                    ...currentState,
                    ...payload,
                    initialized: true,
                };

            case ActionTypes.STATE_RESET:
                return JSON.parse(JSON.stringify(defaultState));

            case ActionTypes.STATE_MERGE:
                return deepMerge(currentState, payload);
        }

        // Delegate to domain-specific reducers
        let newState = { ...currentState };

        if (type.startsWith('AD_')) {
            newState = adReducer(newState, action);
        } else if (type.startsWith('STORAGE_')) {
            newState = storageReducer(newState, action);
        } else if (type.startsWith('VM') || type.startsWith('VMSWITCH')) {
            newState = hyperVReducer(newState, action);
        } else if (type.startsWith('SERVICE_')) {
            newState = serviceReducer(newState, action);
        } else if (type.startsWith('OBJECTIVE_')) {
            newState = objectiveReducer(newState, action);
        }

        // Track last action
        newState.lastAction = {
            type,
            timestamp: Date.now(),
            source: action.source || 'unknown',
        };

        return newState;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Active Directory Reducer
    // ─────────────────────────────────────────────────────────────────────────

    function adReducer(state, action) {
        const { type, payload } = action;

        switch (type) {
            // ─────────────────────────────────────────────────────────────────
            // User Actions
            // ─────────────────────────────────────────────────────────────────
            case ActionTypes.AD_CREATE_USER: {
                const key = payload.SamAccountName || payload.samAccountName;
                return {
                    ...state,
                    adUsers: {
                        ...state.adUsers,
                        [key]: normalizeUser(payload),
                    },
                };
            }

            case ActionTypes.AD_UPDATE_USER: {
                const key = payload.SamAccountName || payload.samAccountName;
                const existing = state.adUsers[key];
                if (!existing) return state;
                return {
                    ...state,
                    adUsers: {
                        ...state.adUsers,
                        [key]: { ...existing, ...payload },
                    },
                };
            }

            case ActionTypes.AD_DELETE_USER: {
                const key = payload.SamAccountName || payload.samAccountName || payload;
                const { [key]: removed, ...remaining } = state.adUsers;
                return {
                    ...state,
                    adUsers: remaining,
                };
            }

            case ActionTypes.AD_ENABLE_USER: {
                const key = payload.SamAccountName || payload.samAccountName || payload;
                const user = state.adUsers[key];
                if (!user) return state;
                return {
                    ...state,
                    adUsers: {
                        ...state.adUsers,
                        [key]: { ...user, Enabled: true },
                    },
                };
            }

            case ActionTypes.AD_DISABLE_USER: {
                const key = payload.SamAccountName || payload.samAccountName || payload;
                const user = state.adUsers[key];
                if (!user) return state;
                return {
                    ...state,
                    adUsers: {
                        ...state.adUsers,
                        [key]: { ...user, Enabled: false },
                    },
                };
            }

            case ActionTypes.AD_UNLOCK_USER: {
                const key = payload.SamAccountName || payload.samAccountName || payload;
                const user = state.adUsers[key];
                if (!user) return state;
                return {
                    ...state,
                    adUsers: {
                        ...state.adUsers,
                        [key]: { ...user, LockedOut: false },
                    },
                };
            }

            case ActionTypes.AD_RESET_PASSWORD: {
                const key = payload.SamAccountName || payload.samAccountName;
                const user = state.adUsers[key];
                if (!user) return state;
                return {
                    ...state,
                    adUsers: {
                        ...state.adUsers,
                        [key]: {
                            ...user,
                            PasswordLastSet: new Date().toISOString(),
                            LockedOut: payload.unlock ? false : user.LockedOut,
                        },
                    },
                };
            }

            // ─────────────────────────────────────────────────────────────────
            // Group Actions
            // ─────────────────────────────────────────────────────────────────
            case ActionTypes.AD_CREATE_GROUP: {
                const key = payload.Name || payload.name;
                return {
                    ...state,
                    adGroups: {
                        ...state.adGroups,
                        [key]: normalizeGroup(payload),
                    },
                };
            }

            case ActionTypes.AD_UPDATE_GROUP: {
                const key = payload.Name || payload.name;
                const existing = state.adGroups[key];
                if (!existing) return state;
                return {
                    ...state,
                    adGroups: {
                        ...state.adGroups,
                        [key]: { ...existing, ...payload },
                    },
                };
            }

            case ActionTypes.AD_DELETE_GROUP: {
                const key = payload.Name || payload.name || payload;
                const { [key]: removed, ...remaining } = state.adGroups;
                return {
                    ...state,
                    adGroups: remaining,
                };
            }

            case ActionTypes.AD_ADD_MEMBER: {
                const groupKey = payload.GroupName || payload.groupName || payload.Identity;
                const memberKey = payload.MemberName || payload.memberName || payload.Members;
                const group = state.adGroups[groupKey];
                if (!group) return state;

                const members = Array.isArray(memberKey) ? memberKey : [memberKey];
                const currentMembers = group.Members || [];
                const newMembers = [...new Set([...currentMembers, ...members])];

                // Also update user's MemberOf
                const updatedUsers = { ...state.adUsers };
                members.forEach(member => {
                    if (updatedUsers[member]) {
                        const userMemberOf = updatedUsers[member].MemberOf || [];
                        if (!userMemberOf.includes(groupKey)) {
                            updatedUsers[member] = {
                                ...updatedUsers[member],
                                MemberOf: [...userMemberOf, groupKey],
                            };
                        }
                    }
                });

                return {
                    ...state,
                    adGroups: {
                        ...state.adGroups,
                        [groupKey]: { ...group, Members: newMembers },
                    },
                    adUsers: updatedUsers,
                };
            }

            case ActionTypes.AD_REMOVE_MEMBER: {
                const groupKey = payload.GroupName || payload.groupName || payload.Identity;
                const memberKey = payload.MemberName || payload.memberName || payload.Members;
                const group = state.adGroups[groupKey];
                if (!group) return state;

                const members = Array.isArray(memberKey) ? memberKey : [memberKey];
                const currentMembers = group.Members || [];
                const newMembers = currentMembers.filter(m => !members.includes(m));

                // Also update user's MemberOf
                const updatedUsers = { ...state.adUsers };
                members.forEach(member => {
                    if (updatedUsers[member]) {
                        const userMemberOf = updatedUsers[member].MemberOf || [];
                        updatedUsers[member] = {
                            ...updatedUsers[member],
                            MemberOf: userMemberOf.filter(g => g !== groupKey),
                        };
                    }
                });

                return {
                    ...state,
                    adGroups: {
                        ...state.adGroups,
                        [groupKey]: { ...group, Members: newMembers },
                    },
                    adUsers: updatedUsers,
                };
            }

            // ─────────────────────────────────────────────────────────────────
            // OU Actions
            // ─────────────────────────────────────────────────────────────────
            case ActionTypes.AD_CREATE_OU: {
                const key = payload.Name || payload.name;
                return {
                    ...state,
                    adOUs: {
                        ...state.adOUs,
                        [key]: normalizeOU(payload),
                    },
                };
            }

            case ActionTypes.AD_UPDATE_OU: {
                const key = payload.Name || payload.name;
                const existing = state.adOUs[key];
                if (!existing) return state;
                return {
                    ...state,
                    adOUs: {
                        ...state.adOUs,
                        [key]: { ...existing, ...payload },
                    },
                };
            }

            case ActionTypes.AD_DELETE_OU: {
                const key = payload.Name || payload.name || payload;
                const { [key]: removed, ...remaining } = state.adOUs;
                return {
                    ...state,
                    adOUs: remaining,
                };
            }

            case ActionTypes.AD_MOVE_OBJECT: {
                // Moving objects between OUs updates their DistinguishedName
                const { objectType, objectName, targetOU } = payload;
                const stateKey = `ad${objectType}s`;
                const obj = state[stateKey]?.[objectName];
                if (!obj) return state;

                const domain = state.domain || 'hexworth.local';
                const dcPath = domain.split('.').map(d => `DC=${d}`).join(',');
                const newDN = `CN=${objectName},OU=${targetOU},${dcPath}`;

                return {
                    ...state,
                    [stateKey]: {
                        ...state[stateKey],
                        [objectName]: { ...obj, DistinguishedName: newDN },
                    },
                };
            }

            // ─────────────────────────────────────────────────────────────────
            // Computer Actions
            // ─────────────────────────────────────────────────────────────────
            case ActionTypes.AD_CREATE_COMPUTER: {
                const key = payload.Name || payload.name;
                return {
                    ...state,
                    adComputers: {
                        ...state.adComputers,
                        [key]: normalizeComputer(payload),
                    },
                };
            }

            case ActionTypes.AD_UPDATE_COMPUTER: {
                const key = payload.Name || payload.name;
                const existing = state.adComputers[key];
                if (!existing) return state;
                return {
                    ...state,
                    adComputers: {
                        ...state.adComputers,
                        [key]: { ...existing, ...payload },
                    },
                };
            }

            case ActionTypes.AD_DELETE_COMPUTER: {
                const key = payload.Name || payload.name || payload;
                const { [key]: removed, ...remaining } = state.adComputers;
                return {
                    ...state,
                    adComputers: remaining,
                };
            }

            default:
                return state;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Storage Reducer
    // ─────────────────────────────────────────────────────────────────────────

    function storageReducer(state, action) {
        const { type, payload } = action;

        switch (type) {
            case ActionTypes.STORAGE_INIT_DISK: {
                const diskNum = payload.DiskNumber || payload.Number;
                const disk = state.disks[diskNum];
                if (!disk) return state;
                return {
                    ...state,
                    disks: {
                        ...state.disks,
                        [diskNum]: {
                            ...disk,
                            PartitionStyle: payload.PartitionStyle || 'GPT',
                            OperationalStatus: 'Online',
                        },
                    },
                };
            }

            case ActionTypes.STORAGE_SET_DISK_ONLINE: {
                const diskNum = payload.DiskNumber || payload.Number || payload;
                const disk = state.disks[diskNum];
                if (!disk) return state;
                return {
                    ...state,
                    disks: {
                        ...state.disks,
                        [diskNum]: { ...disk, OperationalStatus: 'Online' },
                    },
                };
            }

            case ActionTypes.STORAGE_SET_DISK_OFFLINE: {
                const diskNum = payload.DiskNumber || payload.Number || payload;
                const disk = state.disks[diskNum];
                if (!disk) return state;
                return {
                    ...state,
                    disks: {
                        ...state.disks,
                        [diskNum]: { ...disk, OperationalStatus: 'Offline' },
                    },
                };
            }

            case ActionTypes.STORAGE_CREATE_PARTITION: {
                const { DiskNumber, Size, DriveLetter } = payload;
                const partitionKey = `${DiskNumber}-${Object.keys(state.partitions).filter(k => k.startsWith(`${DiskNumber}-`)).length + 1}`;
                return {
                    ...state,
                    partitions: {
                        ...state.partitions,
                        [partitionKey]: {
                            DiskNumber,
                            PartitionNumber: parseInt(partitionKey.split('-')[1]),
                            Size: Size || 0,
                            DriveLetter: DriveLetter || null,
                            Type: 'Basic',
                        },
                    },
                };
            }

            case ActionTypes.STORAGE_FORMAT_VOLUME: {
                const { DriveLetter, FileSystem, FileSystemLabel, Size } = payload;
                const existing = state.volumes[DriveLetter] || {};
                return {
                    ...state,
                    volumes: {
                        ...state.volumes,
                        [DriveLetter]: {
                            ...existing,
                            DriveLetter,
                            FileSystem: FileSystem || 'NTFS',
                            FileSystemLabel: FileSystemLabel || 'New Volume',
                            Size: Size || existing.Size || 0,
                            HealthStatus: 'Healthy',
                            DriveType: 'Fixed',
                        },
                    },
                };
            }

            case ActionTypes.STORAGE_CREATE_SHARE: {
                const key = payload.Name || payload.name;
                return {
                    ...state,
                    shares: {
                        ...state.shares,
                        [key]: {
                            Name: key,
                            Path: payload.Path || payload.path,
                            Description: payload.Description || '',
                            ShareType: 'Standard',
                        },
                    },
                };
            }

            case ActionTypes.STORAGE_DELETE_SHARE: {
                const key = payload.Name || payload.name || payload;
                const { [key]: removed, ...remaining } = state.shares;
                return {
                    ...state,
                    shares: remaining,
                };
            }

            default:
                return state;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Hyper-V Reducer
    // ─────────────────────────────────────────────────────────────────────────

    function hyperVReducer(state, action) {
        const { type, payload } = action;

        switch (type) {
            case ActionTypes.VM_CREATE: {
                const key = payload.Name || payload.name;
                const memStartup = payload.MemoryStartup || payload.MemoryStartupBytes || 1073741824;
                return {
                    ...state,
                    vms: {
                        ...state.vms,
                        [key]: {
                            Name: key,
                            State: 'Off',
                            CPUUsage: 0,
                            MemoryAssigned: memStartup,
                            MemoryStartup: memStartup,
                            MemoryDemand: 0,
                            MemoryStatus: 'OK',
                            Uptime: '0.00:00:00',
                            Status: 'Operating normally',
                            Generation: payload.Generation || 2,
                            Version: '9.0',
                            Path: payload.Path || `D:\\VMs\\${key}`,
                        },
                    },
                };
            }

            case ActionTypes.VM_DELETE: {
                const key = payload.Name || payload.name || payload;
                const { [key]: removed, ...remaining } = state.vms;
                return {
                    ...state,
                    vms: remaining,
                };
            }

            case ActionTypes.VM_START: {
                const key = payload.Name || payload.name || payload;
                const vm = state.vms[key];
                if (!vm) return state;
                return {
                    ...state,
                    vms: {
                        ...state.vms,
                        [key]: {
                            ...vm,
                            State: 'Running',
                            CPUUsage: 5,
                            MemoryDemand: Math.floor(vm.MemoryAssigned * 0.5),
                        },
                    },
                };
            }

            case ActionTypes.VM_STOP: {
                const key = payload.Name || payload.name || payload;
                const vm = state.vms[key];
                if (!vm) return state;
                return {
                    ...state,
                    vms: {
                        ...state.vms,
                        [key]: {
                            ...vm,
                            State: 'Off',
                            CPUUsage: 0,
                            MemoryDemand: 0,
                            Uptime: '0.00:00:00',
                        },
                    },
                };
            }

            case ActionTypes.VM_CHECKPOINT: {
                const vmName = payload.VMName || payload.Name;
                const checkpointName = payload.SnapshotName || `${vmName} - ${new Date().toISOString()}`;
                const checkpointKey = `${vmName}-${checkpointName}`;
                return {
                    ...state,
                    vmCheckpoints: {
                        ...state.vmCheckpoints,
                        [checkpointKey]: {
                            VMName: vmName,
                            Name: checkpointName,
                            CreationTime: new Date().toISOString(),
                            ParentCheckpointName: null,
                        },
                    },
                };
            }

            case ActionTypes.VMSWITCH_CREATE: {
                const key = payload.Name || payload.name;
                return {
                    ...state,
                    vmSwitches: {
                        ...state.vmSwitches,
                        [key]: {
                            Name: key,
                            SwitchType: payload.SwitchType || 'Internal',
                            AllowManagementOS: payload.AllowManagementOS !== false,
                        },
                    },
                };
            }

            default:
                return state;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Service Reducer
    // ─────────────────────────────────────────────────────────────────────────

    function serviceReducer(state, action) {
        const { type, payload } = action;
        const key = payload.Name || payload.name || payload;
        const service = state.services[key];

        if (!service && type !== ActionTypes.SERVICE_SET_STARTUP) return state;

        switch (type) {
            case ActionTypes.SERVICE_START:
                return {
                    ...state,
                    services: {
                        ...state.services,
                        [key]: { ...service, Status: 'Running' },
                    },
                };

            case ActionTypes.SERVICE_STOP:
                return {
                    ...state,
                    services: {
                        ...state.services,
                        [key]: { ...service, Status: 'Stopped' },
                    },
                };

            case ActionTypes.SERVICE_RESTART:
                return {
                    ...state,
                    services: {
                        ...state.services,
                        [key]: { ...service, Status: 'Running' },
                    },
                };

            case ActionTypes.SERVICE_SET_STARTUP:
                if (!service) return state;
                return {
                    ...state,
                    services: {
                        ...state.services,
                        [key]: { ...service, StartType: payload.StartType },
                    },
                };

            default:
                return state;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Objective Reducer
    // ─────────────────────────────────────────────────────────────────────────

    function objectiveReducer(state, action) {
        const { type, payload } = action;

        switch (type) {
            case ActionTypes.OBJECTIVE_COMPLETE: {
                const id = payload.id || payload;
                return {
                    ...state,
                    objectivesCompleted: {
                        ...state.objectivesCompleted,
                        [id]: {
                            completed: true,
                            timestamp: Date.now(),
                            source: payload.source || 'unknown',
                        },
                    },
                };
            }

            case ActionTypes.OBJECTIVE_RESET:
                return {
                    ...state,
                    objectivesCompleted: {},
                };

            default:
                return state;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Normalize user object to consistent structure
     */
    function normalizeUser(payload) {
        const domain = state.domain || 'hexworth.local';
        const dcPath = domain.split('.').map(d => `DC=${d}`).join(',');
        const samName = payload.SamAccountName || payload.samAccountName || payload.Name;

        return {
            SamAccountName: samName,
            Name: payload.Name || `${payload.GivenName || ''} ${payload.Surname || ''}`.trim() || samName,
            GivenName: payload.GivenName || '',
            Surname: payload.Surname || '',
            UserPrincipalName: payload.UserPrincipalName || `${samName}@${domain}`,
            DistinguishedName: payload.DistinguishedName || `CN=${payload.Name || samName},CN=Users,${dcPath}`,
            Enabled: payload.Enabled !== false,
            LockedOut: payload.LockedOut || false,
            PasswordExpired: payload.PasswordExpired || false,
            PasswordLastSet: payload.PasswordLastSet || new Date().toISOString(),
            MemberOf: payload.MemberOf || ['Domain Users'],
            Department: payload.Department || '',
            Title: payload.Title || '',
            Description: payload.Description || '',
            EmailAddress: payload.EmailAddress || '',
        };
    }

    /**
     * Normalize group object to consistent structure
     */
    function normalizeGroup(payload) {
        const domain = state.domain || 'hexworth.local';
        const dcPath = domain.split('.').map(d => `DC=${d}`).join(',');
        const name = payload.Name || payload.name;

        return {
            Name: name,
            SamAccountName: payload.SamAccountName || name,
            DistinguishedName: payload.DistinguishedName || `CN=${name},CN=Users,${dcPath}`,
            GroupScope: payload.GroupScope || 'Global',
            GroupCategory: payload.GroupCategory || 'Security',
            Description: payload.Description || '',
            Members: payload.Members || [],
        };
    }

    /**
     * Normalize OU object to consistent structure
     */
    function normalizeOU(payload) {
        const domain = state.domain || 'hexworth.local';
        const dcPath = domain.split('.').map(d => `DC=${d}`).join(',');
        const name = payload.Name || payload.name;

        return {
            Name: name,
            DistinguishedName: payload.DistinguishedName || `OU=${name},${dcPath}`,
            Description: payload.Description || '',
            ProtectedFromAccidentalDeletion: payload.ProtectedFromAccidentalDeletion !== false,
        };
    }

    /**
     * Normalize computer object to consistent structure
     */
    function normalizeComputer(payload) {
        const domain = state.domain || 'hexworth.local';
        const dcPath = domain.split('.').map(d => `DC=${d}`).join(',');
        const name = payload.Name || payload.name;

        return {
            Name: name,
            DNSHostName: payload.DNSHostName || `${name}.${domain}`,
            DistinguishedName: payload.DistinguishedName || `CN=${name},CN=Computers,${dcPath}`,
            Enabled: payload.Enabled !== false,
            OperatingSystem: payload.OperatingSystem || '',
            OperatingSystemVersion: payload.OperatingSystemVersion || '',
            IPv4Address: payload.IPv4Address || '',
        };
    }

    /**
     * Deep merge utility for STATE_MERGE action
     */
    function deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Dispatch an action to modify state
     *
     * @param {Object} action - Action object with type and payload
     * @returns {Object} The action that was dispatched
     *
     * @example
     * WSAState.dispatch({
     *     type: 'AD_CREATE_USER',
     *     payload: { SamAccountName: 'jsmith', Name: 'John Smith' },
     *     source: 'gui'
     * });
     */
    function dispatch(action) {
        if (!action || !action.type) {
            console.error('WSAState: dispatch requires action with type');
            return null;
        }

        // Add timestamp and source if not present
        const fullAction = {
            ...action,
            timestamp: action.timestamp || Date.now(),
            source: action.source || 'unknown',
        };

        // Store in history
        actionHistory.push(fullAction);
        if (actionHistory.length > MAX_HISTORY) {
            actionHistory.shift();
        }

        // Apply reducer
        const prevState = state;
        state = rootReducer(state, fullAction);

        // Notify subscribers
        subscribers.forEach(callback => {
            try {
                callback(state, prevState, fullAction);
            } catch (e) {
                console.error('WSAState subscriber error:', e);
            }
        });

        return fullAction;
    }

    /**
     * Subscribe to state changes
     *
     * @param {Function} callback - Function called on state change: (newState, prevState, action)
     * @returns {Function} Unsubscribe function
     *
     * @example
     * const unsubscribe = WSAState.subscribe((state, prevState, action) => {
     *     console.log('State changed:', action.type);
     *     updateUI(state);
     * });
     */
    function subscribe(callback) {
        if (typeof callback !== 'function') {
            console.error('WSAState: subscribe requires a function');
            return () => {};
        }

        subscribers.push(callback);

        // Return unsubscribe function
        return function unsubscribe() {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Get current state (immutable copy)
     *
     * @returns {Object} Copy of current state
     */
    function getState() {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * Get a specific slice of state
     *
     * @param {string} key - State key (e.g., 'adUsers', 'vms')
     * @returns {Object} Copy of that state slice
     */
    function getSlice(key) {
        if (state[key] === undefined) {
            console.warn(`WSAState: Unknown state key "${key}"`);
            return null;
        }
        return JSON.parse(JSON.stringify(state[key]));
    }

    /**
     * Initialize state with base data
     *
     * @param {Object} initialData - Initial state data
     */
    function init(initialData = {}) {
        dispatch({
            type: ActionTypes.STATE_INIT,
            payload: initialData,
            source: 'init',
        });
    }

    /**
     * Reset state to defaults
     */
    function reset() {
        dispatch({
            type: ActionTypes.STATE_RESET,
            payload: null,
            source: 'reset',
        });
    }

    /**
     * Get action history (for debugging)
     *
     * @returns {Array} Copy of action history
     */
    function getHistory() {
        return [...actionHistory];
    }

    /**
     * Create action helper - returns action creators for each type
     */
    function createAction(type) {
        return function(payload, source = 'unknown') {
            return dispatch({ type, payload, source });
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVENIENCE ACTION CREATORS
    // ═══════════════════════════════════════════════════════════════════════════

    const actions = {
        // AD Users
        createUser: (user, source) => dispatch({ type: ActionTypes.AD_CREATE_USER, payload: user, source }),
        updateUser: (user, source) => dispatch({ type: ActionTypes.AD_UPDATE_USER, payload: user, source }),
        deleteUser: (samAccountName, source) => dispatch({ type: ActionTypes.AD_DELETE_USER, payload: samAccountName, source }),
        enableUser: (samAccountName, source) => dispatch({ type: ActionTypes.AD_ENABLE_USER, payload: samAccountName, source }),
        disableUser: (samAccountName, source) => dispatch({ type: ActionTypes.AD_DISABLE_USER, payload: samAccountName, source }),
        unlockUser: (samAccountName, source) => dispatch({ type: ActionTypes.AD_UNLOCK_USER, payload: samAccountName, source }),
        resetPassword: (data, source) => dispatch({ type: ActionTypes.AD_RESET_PASSWORD, payload: data, source }),

        // AD Groups
        createGroup: (group, source) => dispatch({ type: ActionTypes.AD_CREATE_GROUP, payload: group, source }),
        deleteGroup: (name, source) => dispatch({ type: ActionTypes.AD_DELETE_GROUP, payload: name, source }),
        addMember: (data, source) => dispatch({ type: ActionTypes.AD_ADD_MEMBER, payload: data, source }),
        removeMember: (data, source) => dispatch({ type: ActionTypes.AD_REMOVE_MEMBER, payload: data, source }),

        // AD OUs
        createOU: (ou, source) => dispatch({ type: ActionTypes.AD_CREATE_OU, payload: ou, source }),
        deleteOU: (name, source) => dispatch({ type: ActionTypes.AD_DELETE_OU, payload: name, source }),

        // VMs
        createVM: (vm, source) => dispatch({ type: ActionTypes.VM_CREATE, payload: vm, source }),
        startVM: (name, source) => dispatch({ type: ActionTypes.VM_START, payload: name, source }),
        stopVM: (name, source) => dispatch({ type: ActionTypes.VM_STOP, payload: name, source }),
        checkpointVM: (data, source) => dispatch({ type: ActionTypes.VM_CHECKPOINT, payload: data, source }),

        // Services
        startService: (name, source) => dispatch({ type: ActionTypes.SERVICE_START, payload: name, source }),
        stopService: (name, source) => dispatch({ type: ActionTypes.SERVICE_STOP, payload: name, source }),

        // Objectives
        completeObjective: (id, source) => dispatch({ type: ActionTypes.OBJECTIVE_COMPLETE, payload: { id, source }, source }),
        resetObjectives: (source) => dispatch({ type: ActionTypes.OBJECTIVE_RESET, payload: null, source }),
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════

    return {
        // Core API
        dispatch,
        subscribe,
        getState,
        getSlice,
        init,
        reset,
        getHistory,

        // Action types (for external use)
        ActionTypes,

        // Convenience action creators
        actions,
        createAction,
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WSAState;
}
