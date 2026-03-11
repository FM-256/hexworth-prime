/* ================================================================
   PYTHON-03 / GRID IRON -- Mission Config
   ================================================================
   OT/ICS network: data diode bypass, corrupt firmware patch.
   5 objectives, 2 traps (hmi, rtu), 2 gates.
   ================================================================ */

var PYTHON_03_CONFIG = {
    id: 'python-03',
    title: 'PYTHON-03 / GRID IRON',
    subtitle: 'OT network infiltration and firmware recovery',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',

    grid: {
        rows: 4, cols: 5,
        cells: [
            ['historian',   'empty',       'hmi',        'empty',        'wall'],
            ['empty',       'plc-north',   'empty',      'data-diode',   'eng-ws'],
            ['scada',       'corrupt-seg', 'plc-south',  'empty',        'wall'],
            ['wall',        'rtu',         'wall',       'sensor-net',   'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'historian':   { label: 'HISTORIAN',       abbr: 'HST', ip: '192.168.100.10',  desc: 'Process data historian',            ports: ['22/SSH','502/MODBUS','1433/MSSQL'],            os: 'Windows Server 2019' },
        'hmi':         { label: 'HMI',             abbr: 'HMI', ip: '192.168.100.20',  desc: 'Human-machine interface',           ports: ['80/HTTP','502/MODBUS','44818/ENIP'],           os: 'FactoryTalk SE v13' },
        'plc-north':   { label: 'PLC-NORTH',       abbr: 'PLN', ip: '192.168.100.31',  desc: 'Programmable logic controller',     ports: ['502/MODBUS','44818/ENIP'],                     os: 'Allen-Bradley L83' },
        'data-diode':  { label: 'DATA-DIODE',      abbr: 'DIO', ip: '192.168.100.254', desc: 'Unidirectional security gateway',   ports: ['443/HTTPS-MGMT'],                              os: 'Waterfall Unidirectional', vuln: 'CVE-2024-4410', vulnDesc: 'Misconfigured data diode allows bidirectional traffic' },
        'eng-ws':      { label: 'ENG-WORKSTATION', abbr: 'EWS', ip: '192.168.100.99',  desc: 'Engineering programming station',   ports: ['22/SSH','3389/RDP','44818/ENIP'],              os: 'Windows 11 IoT Enterprise' },
        'scada':       { label: 'SCADA',           abbr: 'SCA', ip: '192.168.100.40',  desc: 'SCADA master server',               ports: ['22/SSH','502/MODBUS','20000/DNP3'],            os: 'Ignition SCADA 8.1' },
        'plc-south':   { label: 'PLC-SOUTH',       abbr: 'PLS', ip: '192.168.100.32',  desc: 'Programmable logic controller',     ports: ['502/MODBUS','44818/ENIP'],                     os: 'Siemens S7-1500' },
        'rtu':         { label: 'RTU',             abbr: 'RTU', ip: '192.168.100.50',  desc: 'Remote terminal unit',              ports: ['502/MODBUS','20000/DNP3'],                     os: 'SEL-3530 RTAC' },
        'sensor-net':  { label: 'SENSOR-NET',      abbr: 'SNT', ip: '192.168.100.60',  desc: 'Distributed sensor network',        ports: ['161/SNMP','47808/BACNET'],                     os: 'Yokogawa CENTUM VP' },
        'corrupt-seg': { label: 'CORRUPT-SEG',     abbr: 'CRP', ip: '192.168.100.70',  desc: 'Corrupted firmware segment',        ports: ['502/MODBUS-ERR','44818/ENIP-FAULT'],           os: 'Corrupted Firmware [UNRESPONSIVE]', vuln: 'CVE-2024-3122', vulnDesc: 'Siemens S7 firmware integrity bypass via unsigned update channel' }
    },

    traps: ['hmi', 'rtu'],

    gates: {
        'data-diode':  { requires: 'nmap',  flag: 'firewallBypassed',   vuln: 'CVE-2024-4410', vulnDesc: 'Misconfigured data diode allows bidirectional traffic' },
        'corrupt-seg': { requires: 'patch',  flag: 'corruptSegPatched',  vuln: 'CVE-2024-3122', vulnDesc: 'Siemens S7 firmware integrity bypass via unsigned update channel' }
    },

    objectives: [
        { id: 'obj_0', label: 'NODES DISCOVERED -- 5 OT nodes mapped',              check: 'nodesDiscovered.size >= 5' },
        { id: 'obj_1', label: 'PLC SCANNED -- nmap scan complete',                   check: 'nmapTargets.has("plc-north") || nmapTargets.has("plc-south")' },
        { id: 'obj_2', label: 'DATA DIODE BYPASSED -- access granted',               check: 'firewallBypassed' },
        { id: 'obj_3', label: 'WORKSTATION REACHED -- mission objective complete',   check: 'nodesDiscovered.has("eng-ws")' },
        { id: 'obj_4', label: 'CORRUPT SEGMENT PATCHED -- firmware restored',        check: 'corruptSegPatched' }
    ],

    integrity: 3,

    completion: {
        title: 'GRID IRON',
        subtitle: 'OT network secured. Workstation reached.',
        storageKey: 'hexworth_operator_python03'
    }
};
