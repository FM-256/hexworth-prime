/* ═══════════════════════════════════════════════════════════════════
   OWS-05: Operation Blind Spot — Double Brokering Fraud Ring
   ═══════════════════════════════════════════════════════════════════ */
const BlindSpotConfig = {
    id: 'ows-05-blind-spot', title: 'OPERATION BLIND SPOT', storageKey: 'hexworth_ows05', registryId: 'ows-05-blind-spot',
    startScore: 1000, clockStart: 8, clockRatio: 60, accentColor: '#ec4899', minConnectionsToSubmit: 7,
    devices: ['dispatch', 'carrier', 'financial', 'email', 'loadboard'],
    pages: [
        { id: 'hub', label: 'Hub', href: 'index.html' }, { id: 'dispatch', label: 'Dispatch', href: 'dispatch.html' },
        { id: 'carrier', label: 'Carriers', href: 'carrier.html' }, { id: 'financial', label: 'Accounting', href: 'financial.html' },
        { id: 'email', label: 'Email', href: 'email.html' }, { id: 'loadboard', label: 'Load Board', href: 'loadboard.html' },
        { id: 'caseboard', label: 'CaseBoard', href: 'caseboard.html' }
    ],
    evidence: {
        'dp-thompson-shifts':  { title: 'Dispatch: All 47 Loads on Thompson Shifts', detail: 'All 47 affected loads were dispatched during shifts worked by dispatcher k.thompson. No other dispatcher has any affected loads.', source: 'dispatch', category: 'digital' },
        'dp-notify-deleted':   { title: 'Dispatch: Carrier Notifications Deleted Before Send', detail: 'Carrier A (legitimate) notification was deleted from dispatch queue before it was sent. Carrier B (shell) received the load info instead.', source: 'dispatch', category: 'digital' },
        'em-typosquat':        { title: 'Email: Typosquat Domain (nfp-carriers.com)', detail: 'Thompson has a secondary email alias kt.dispatch@nfp-carriers.com (typosquat of real nfp-partners.com). Used to send fake rate confirmations.', source: 'email', category: 'digital' },
        'em-complaints':       { title: 'Email: Thompson Handled All Complaints', detail: 'Customer complaints about "wrong driver" were all handled by Thompson. Marked as "resolved: carrier substitution approved" \u2014 shipper never approved.', source: 'email', category: 'communications' },
        'cr-6-shells':         { title: 'Carrier: 6 Shell Carriers \u2014 Sequential MC#s', detail: '6 shell carriers registered within 90 days. MC numbers in sequential range. Same registered agent in Savannah, GA.', source: 'carrier', category: 'digital' },
        'cr-same-agent':       { title: 'Carrier: Same Registered Agent Address', detail: 'All 6 shell carriers list "Peachtree Business Services, 447 Bull St, Savannah GA" as registered agent. Virtual office.', source: 'carrier', category: 'digital' },
        'fn-quickfund':        { title: 'Financial: All Invoices Through QuickFund Capital', detail: 'All 6 shell carriers assigned invoices to QuickFund Capital (factors within 24 hours, 5% fee). Rapid cash-out.', source: 'financial', category: 'financial' },
        'fn-quickfund-owner':  { title: 'Financial: QuickFund Traces to Thompson Spouse', detail: 'QuickFund Capital bank account traces to business registered to K. Thompson\u2019s spouse (L. Thompson).', source: 'financial', category: 'financial' },
        'lb-dat-hotspot':      { title: 'Load Board: Loads Posted from Thompson Hotspot', detail: '47 loads appeared on external DAT board 5-15 min after internal posting. Posted from IP matching Thompson\u2019s personal mobile hotspot.', source: 'loadboard', category: 'digital' },
        'lb-timing':           { title: 'Load Board: External Post Always After Internal', detail: 'Every affected load was posted externally 5-15 minutes after internal assignment. Never before. Consistent with manual re-posting.', source: 'loadboard', category: 'digital' },
        'rh-carrier-error':    { title: 'Carrier Error Theory', detail: 'Initial theory: legitimate carriers were subcontracting without authorization. But Carrier A says they never received the dispatch notification.', source: 'dispatch', category: 'people', isRedHerring: true }
    },
    connections: [
        { id: 'conn-single', label: 'Single Dispatcher: All 47 loads on Thompson shifts', from: 'dp-thompson-shifts', to: 'dp-notify-deleted' },
        { id: 'conn-typosquat', label: 'Typosquat Email: nfp-carriers.com mimics nfp-partners.com', from: 'em-typosquat', to: 'dp-thompson-shifts' },
        { id: 'conn-shells', label: 'Shell Network: 6 carriers with sequential MC#s', from: 'cr-6-shells', to: 'cr-same-agent' },
        { id: 'conn-factoring', label: 'Factoring Concentration: All invoices through QuickFund', from: 'fn-quickfund', to: 'cr-6-shells' },
        { id: 'conn-ownership', label: 'QuickFund Ownership: Traces to Thompson spouse', from: 'fn-quickfund-owner', to: 'fn-quickfund' },
        { id: 'conn-external', label: 'External Posting: Loads posted from Thompson hotspot', from: 'lb-dat-hotspot', to: 'lb-timing' },
        { id: 'conn-suppress', label: 'Complaint Suppression: Thompson closed all complaints', from: 'em-complaints', to: 'dp-thompson-shifts' },
        { id: 'conn-notify', label: 'Notification Deleted: Real carrier never notified', from: 'dp-notify-deleted', to: 'em-typosquat' },
        { id: 'conn-pipeline', label: 'Full Pipeline: Intercept -> shell carrier -> factoring -> spouse', from: 'dp-thompson-shifts', to: 'fn-quickfund-owner' }
    ],
    // Flags server-side only (Firestore flag_registry/ows-05-blind-spot)
    flagConnections: {
        'conn-single': 'insider',
        'conn-shells': 'scheme',
        'conn-ownership': 'cashout'
    },

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },
    triggers: {
        threats: [], tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Check the dispatch board. Which dispatcher handled all 47 affected loads?', condition: function(s) { return s.openedFiles.length >= 3; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'NFP COMPLIANCE OFFICER', text: 'Analyst \u2014 47 loads over 6 months were picked up by carriers NFP never authorized. $2.3M in claims. The legitimate carriers say they were never dispatched. Someone inside is re-brokering loads. Find the insider, find the money.', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
