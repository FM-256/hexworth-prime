/* ================================================================
   JS-46 / WAR ZONE -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid -- 121 cells.
   ENEMY-HEAVY GRID. 8 enemies dominate the field. The student must
   develop a SYSTEMATIC approach to clearing dense hostile territory.

   DESIGN RATIONALE:
   - 11x11 grid with 8 enemies -- the most enemies in any JS mission
   - Only 2 holes + 2 fires as secondary obstacles
   - 12 total obstacles but ENEMY-dominated
   - Student can't randomly navigate -- must systematically clear zones
   - Enemies placed to create "kill zones" -- clusters that must be cleared
   - 4 servers behind enemy lines -- can't reach them without fighting through
   - Forces tactical thinking: clear enemies first, then explore

   JS SKILL: Systematic threat elimination
   - Array methods to filter and count enemy nodes
   - Priority-based handling: enemies first, then environmental hazards
   - .filter() to separate enemies from other threats
   - .sort() to prioritize nearest enemies
   - Systematic grid clearing: scan -> fight all enemies -> move -> repeat

   REFERENCE SOLUTION:
     async function warZone() {
         const results = await agent.scan();

         // Prioritize: enemies first, then hazards, then movement
         const enemies = results.filter(n => n.name.includes('ENEMY'));
         const hazards = results.filter(n => n.name.includes('HOLE') || n.name.includes('FIRE'));
         const safe = results.filter(n => !enemies.includes(n) && !hazards.includes(n));

         // Clear all enemies first
         for (const { direction } of enemies) {
             await agent.fight(direction);
         }

         // Handle environmental hazards
         for (const { name, direction } of hazards) {
             name.includes('HOLE')
                 ? await agent.jump(direction)
                 : await agent.extinguish(direction);
         }

         // Then move to safe nodes
         for (const { direction } of safe) {
             await agent.move(direction);
         }
     }
     warZone();

   WHY WAR ZONE:
   - Tests priority-based decision making under pressure
   - 8 enemies require organized clearing, not ad-hoc responses
   - Real-world parallel: incident response triage, vulnerability remediation
   - Array methods (.filter, .sort) become essential tools, not optional

   GRID LAYOUT (11x11):
     [start]    [empty]    [enemy-1]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [enemy-2]  [empty]    [server-a] [empty]    [empty]    [enemy-3]  [empty]    [wall]
     [empty]    [hole-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [enemy-4]  [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [enemy-5]  [empty]    [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [enemy-6]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [enemy-7]  [empty]    [empty]    [server-d] [empty]
     [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [enemy-8]  [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   8 enemies + 2 holes + 2 fires = 12 obstacles. Enemy-dominated war zone.
   ================================================================ */

var JS_46_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-46',
    title: 'JS-46 / WAR ZONE',
    subtitle: 'Eight hostiles. Systematic elimination required.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'enemy-1',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'enemy-2',  'empty',    'server-a', 'empty',    'empty',    'enemy-3',  'empty',    'wall'],
            /* Row 2  */ ['empty',    'hole-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 3  */ ['empty',    'empty',    'empty',    'empty',    'enemy-4',  'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 4  */ ['empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty'],
            /* Row 5  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'enemy-5',  'empty',    'empty',    'server-c', 'empty',    'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'enemy-6',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'enemy-7',  'empty',    'empty',    'server-d', 'empty'],
            /* Row 8  */ ['empty',    'hole-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'enemy-8',  'empty',    'empty',    'empty'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',           abbr: 'GTW', ip: '10.460.1.1',   desc: 'War zone perimeter -- heavy contact expected',        ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco ISR 4451' },

        /* 5 target servers -- behind enemy lines */
        'server-a': { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.460.1.10',  desc: 'Forward observation post -- intel server',            ports: ['22/SSH', '443/HTTPS', '514/SYSLOG'],      os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.460.1.11',  desc: 'Tactical operations center -- command server',        ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.460.1.12',  desc: 'Communications hub -- encrypted relay',               ports: ['22/SSH', '443/HTTPS', '5060/SIP'],        os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.460.1.13',  desc: 'Logistics server -- supply chain management',         ports: ['22/SSH', '443/HTTPS', '3000/GRAFANA'],    os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.460.1.14',  desc: 'Extraction coordinator -- evac planning',             ports: ['22/SSH', '443/HTTPS', '9090/PROMETHEUS'], os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',         abbr: 'EXT', ip: '10.460.1.99',  desc: 'Extraction point -- war zone cleared',                ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 8 enemies -- the war zone */
        'enemy-1':  { label: 'ENEMY SCOUT',        abbr: 'SCT', ip: null, desc: 'Forward scout -- fight to neutralize',                          ports: [] },
        'enemy-2':  { label: 'ENEMY SNIPER',       abbr: 'SNP', ip: null, desc: 'Network sniper -- fight to neutralize',                         ports: [] },
        'enemy-3':  { label: 'ENEMY DRONE',        abbr: 'DRN', ip: null, desc: 'Surveillance drone -- fight to neutralize',                     ports: [] },
        'enemy-4':  { label: 'ENEMY GUARD',        abbr: 'GRD', ip: null, desc: 'Zone guard -- fight to neutralize',                             ports: [] },
        'enemy-5':  { label: 'ENEMY CAPTAIN',      abbr: 'CPT', ip: null, desc: 'Enemy captain -- fight to neutralize',                          ports: [] },
        'enemy-6':  { label: 'ENEMY SABOTEUR',     abbr: 'SAB', ip: null, desc: 'Network saboteur -- fight to neutralize',                       ports: [] },
        'enemy-7':  { label: 'ENEMY OPERATOR',     abbr: 'OPR', ip: null, desc: 'Hostile operator -- fight to neutralize',                       ports: [] },
        'enemy-8':  { label: 'ENEMY COMMANDER',    abbr: 'CMD', ip: null, desc: 'Zone commander -- fight to neutralize',                         ports: [] },

        /* 2 holes -- jump required */
        'hole-1':   { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Blast crater -- jump to cross',                                ports: [] },
        'hole-2':   { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Infrastructure collapse -- jump to cross',                     ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Ordnance fire -- extinguish to pass',                          ports: [] },
        'fire-2':   { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Scorched earth blaze -- extinguish to pass',                   ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: enemy-heavy */
    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4', 'enemy-5', 'enemy-6', 'enemy-7', 'enemy-8']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 tactical servers',                    check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'COMBAT -- Neutralize all 8 hostiles',                       check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3") && nodesDiscovered.has("enemy-4") && nodesDiscovered.has("enemy-5") && nodesDiscovered.has("enemy-6") && nodesDiscovered.has("enemy-7") && nodesDiscovered.has("enemy-8")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle environmental hazards',                  check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 4+ integrity remaining',                         check: 'integrity >= 4' }
    ],

    /* 10 integrity -- 12 obstacles, 8 of them enemies */
    integrity: 10,

    /* -- Completion screen -- */
    completion: {
        title: 'WAR ZONE',
        subtitle: 'Eight hostiles neutralized. War zone cleared. Systematic combat proven.',
        storageKey: 'hexworth_operator_js46'
    }
};
