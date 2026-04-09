/* ═══════════════════════════════════════════════════════════════════
   OWS-04: Operation Iron Gate — Port Terminal System Compromise
   ═══════════════════════════════════════════════════════════════════ */
const IronGateConfig = {
    id: 'ows-04-iron-gate', title: 'OPERATION IRON GATE', storageKey: 'hexworth_ows04', registryId: 'ows-04-iron-gate',
    startScore: 1000, clockStart: 6, clockRatio: 60, accentColor: '#a855f7', minConnectionsToSubmit: 6,
    devices: ['tos', 'gate', 'customs', 'iam', 'drayage'],
    pages: [
        { id: 'hub', label: 'Hub', href: 'index.html' }, { id: 'tos', label: 'Terminal OS', href: 'tos.html' },
        { id: 'gate', label: 'Gate Logs', href: 'gate.html' }, { id: 'customs', label: 'Customs', href: 'customs.html' },
        { id: 'iam', label: 'Port IAM', href: 'iam.html' }, { id: 'drayage', label: 'Drayage', href: 'drayage.html' },
        { id: 'caseboard', label: 'CaseBoard', href: 'caseboard.html' }
    ],
    evidence: {
        'tos-fake-appointments': { title: 'TOS: Fraudulent Gate Appointments', detail: '3 gate appointments created by gate-clerk-r.santos at 02:15 AM \u2014 outside his shift (06:00-14:00).', source: 'tos', category: 'digital' },
        'tos-eir-signatures':    { title: 'TOS: Digital EIR Signatures', detail: 'Equipment Interchange Receipts for all 3 containers digitally signed by r.santos during the 02:15 AM session.', source: 'tos', category: 'documents' },
        'gt-camera':             { title: 'Gate Camera: Truck Matches Pacific Dray', detail: 'Truck at gate for MSCU7742891 has plates matching Pacific Dray LLC registration. Company is 6 weeks old.', source: 'gate', category: 'physical' },
        'cs-post-customs':       { title: 'Customs: Theft After CBP Release', detail: 'All 3 containers cleared customs inspection and were released. Theft occurred during yard-to-gate transfer.', source: 'customs', category: 'documents' },
        'iam-remote-login':      { title: 'IAM: Santos Logged In From Home', detail: 'r.santos account accessed from residential IP in Compton at 02:15 AM. Not from port terminal.', source: 'iam', category: 'digital' },
        'iam-santos-shift':      { title: 'IAM: Login Outside Shift Hours', detail: 'Santos works 06:00-14:00. The 02:15 AM login is nearly 4 hours before his shift. No overtime authorized.', source: 'iam', category: 'digital' },
        'dr-pacific-dray':       { title: 'Drayage: Pacific Dray LLC \u2014 Shell Company', detail: 'Pacific Dray registered 6 weeks ago. 1 truck. Registered to A. Reyes (Santos\' brother-in-law). TWIC card approved 5 weeks ago.', source: 'drayage', category: 'people' },
        'dr-twic-expedited':     { title: 'Drayage: Expedited TWIC Card for Reyes', detail: 'A. Reyes received expedited TWIC processing (5 weeks vs normal 8-12). Application submitted same week as Pacific Dray registration.', source: 'drayage', category: 'people' },
        'rh-harbor-express':     { title: 'Harbor Express \u2014 Not Involved', detail: 'The assigned drayage company (Harbor Express) never dispatched trucks for these containers. They are victims of the fraudulent appointments.', source: 'drayage', category: 'people', isRedHerring: true }
    },
    connections: [
        { id: 'conn-fraud-appt', label: 'Fraudulent Appointments: Created at 02:15 AM outside shift', from: 'tos-fake-appointments', to: 'iam-santos-shift' },
        { id: 'conn-remote', label: 'Remote Access: Santos logged in from home IP', from: 'iam-remote-login', to: 'tos-fake-appointments' },
        { id: 'conn-shell', label: 'Shell Company: Pacific Dray = Santos brother-in-law', from: 'dr-pacific-dray', to: 'dr-twic-expedited' },
        { id: 'conn-camera', label: 'Gate Camera: Truck matches Pacific Dray registration', from: 'gt-camera', to: 'dr-pacific-dray' },
        { id: 'conn-eir', label: 'EIR Signatures: Digitally signed during off-hours session', from: 'tos-eir-signatures', to: 'iam-remote-login' },
        { id: 'conn-post-customs', label: 'Post-Customs: Theft after CBP release during yard transfer', from: 'cs-post-customs', to: 'tos-fake-appointments' },
        { id: 'conn-3containers', label: 'Coordinated: 3 containers, same vessel, same night', from: 'tos-fake-appointments', to: 'tos-eir-signatures' },
        { id: 'conn-insider', label: 'Insider: Santos is the gate clerk who enabled everything', from: 'iam-remote-login', to: 'dr-pacific-dray' }
    ],
    // Flags server-side only (Firestore flag_registry/ows-04-iron-gate)
    flagConnections: {
        'conn-insider': 'insider',
        'conn-shell': 'shell',
        'conn-fraud-appt': 'method'
    },

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },
    triggers: {
        threats: [], tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Check the TOS gate appointment log. Who created the appointments and when?', condition: function(s) { return s.openedFiles.length >= 3; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'PORT SECURITY DIRECTOR', text: 'Analyst \u2014 3 shipping containers ($12M electronics) vanished from the yard. TOS says they were picked up by authorized trucks. The drayage companies say they never sent trucks. Someone gamed the terminal system. Find the insider.', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
