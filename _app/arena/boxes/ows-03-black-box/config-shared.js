/* ═══════════════════════════════════════════════════════════════════
   OWS-03: Operation Black Box — ELD/Telematics Platform Breach
   ═══════════════════════════════════════════════════════════════════ */
const BlackBoxConfig = {
    id: 'ows-03-black-box', title: 'OPERATION BLACK BOX', storageKey: 'hexworth_ows03', registryId: 'ows-03-black-box',
    startScore: 1000, clockStart: 6, clockRatio: 60, accentColor: '#06b6d4', minConnectionsToSubmit: 5,
    devices: ['eld', 'api', 'manifest', 'cameras', 'network'],
    pages: [
        { id: 'hub', label: 'Hub', href: 'index.html' }, { id: 'eld', label: 'ELD/Telematics', href: 'eld.html' },
        { id: 'api', label: 'API Audit', href: 'api.html' }, { id: 'manifest', label: 'Manifests', href: 'manifest.html' },
        { id: 'cameras', label: 'Cameras', href: 'cameras.html' }, { id: 'network', label: 'Cloud Logs', href: 'network.html' },
        { id: 'caseboard', label: 'CaseBoard', href: 'caseboard.html' }
    ],
    evidence: {
        'eld-hos-prediction':  { title: 'ELD: HOS Break Predictions Queried', detail: 'Compromised API queried /v1/hos/available_hours for all trucks on I-5 corridor. Predicted mandatory 30-min breaks within the hour.', source: 'eld', category: 'digital' },
        'eld-5-thefts':        { title: 'ELD: 5 Thefts at Predicted Break Locations', detail: 'All 5 thefts occurred during predicted HOS mandatory breaks on I-5. Attacker knew exactly when drivers would stop.', source: 'eld', category: 'digital' },
        'api-github-key':      { title: 'API: Key Exposed in Public GitHub Repo', detail: 'API key kt_api_4eC39HqLyjWDar... found in pacific-coast-carriers/fleet-integration repo. Committed Oct 2025, never rotated.', source: 'api', category: 'digital' },
        'api-vietnam-requests': { title: 'API: 2,400+ Daily Requests from Vietnam VPN', detail: 'API key making requests from IP 103.152.xx.xx (Vietnam). Endpoints: /v1/vehicles/location and /v1/hos/available_hours only.', source: 'api', category: 'digital' },
        'api-manifest-access':  { title: 'API: Manifest Queries Identified Pharma Pallets', detail: 'Attacker queried /v1/shipments/{id}/manifest to identify which pallets contained pharmaceuticals in mixed loads.', source: 'api', category: 'digital' },
        'mn-pallet-targeting':  { title: 'Manifest: Only Pharma Pallets Taken', detail: 'In all 5 thefts, only pharmaceutical pallets were removed from mixed loads. Attacker knew pallet positions and contents.', source: 'manifest', category: 'physical' },
        'cm-sprinter-van':     { title: 'Camera: Same White Sprinter at 4 of 5 Truck Stops', detail: 'White Mercedes Sprinter van (plate partially obscured) visible at 4 of 5 theft locations, arriving 5-10 min after target truck.', source: 'cameras', category: 'physical' },
        'nw-s3-manifests':     { title: 'Cloud: 47 Manifests Downloaded from S3', detail: 'CloudTrail shows compromised API key accessed s3://pcc-manifests/ directly. 47 manifest PDFs downloaded.', source: 'network', category: 'digital' },
        'rh-insider-theory':   { title: 'Insider Theory', detail: 'Initial suspicion of driver collusion. But drivers were asleep during thefts (per ELD logs). They are victims, not accomplices.', source: 'eld', category: 'people', isRedHerring: true }
    },
    connections: [
        { id: 'conn-github', label: 'GitHub Exposure: API key in public repo', from: 'api-github-key', to: 'api-vietnam-requests' },
        { id: 'conn-hos', label: 'HOS Prediction: Attacker calculated break windows', from: 'eld-hos-prediction', to: 'eld-5-thefts' },
        { id: 'conn-gps', label: 'GPS Correlation: 5 thefts at predicted locations', from: 'eld-5-thefts', to: 'api-vietnam-requests' },
        { id: 'conn-pallet', label: 'Pallet Targeting: Manifests identified pharma', from: 'api-manifest-access', to: 'mn-pallet-targeting' },
        { id: 'conn-sprinter', label: 'Sprinter Van: Same vehicle at 4 locations', from: 'cm-sprinter-van', to: 'eld-5-thefts' },
        { id: 'conn-s3', label: 'Cloud Access: 47 manifests downloaded via API key', from: 'nw-s3-manifests', to: 'api-manifest-access' },
        { id: 'conn-vuln', label: 'Root Cause: Unrotated API key enabled everything', from: 'api-github-key', to: 'nw-s3-manifests' }
    ],
    // Flags server-side only (Firestore flag_registry/ows-03-black-box)
    flagConnections: {
        'conn-github': 'rootcause',
        'conn-hos': 'targeting',
        'conn-sprinter': 'vehicle'
    },

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },
    triggers: {
        threats: [], tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Check the API access audit. Look for requests from unusual IP addresses.', condition: function(s) { return s.openedFiles.length >= 3; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'VP OPERATIONS', text: 'Analyst \u2014 5 pharmaceutical loads stolen at truck stops on I-5 in 4 weeks. Only pharma pallets taken from mixed loads. The thieves know our schedules, our stops, and our cargo. Find the leak.', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
