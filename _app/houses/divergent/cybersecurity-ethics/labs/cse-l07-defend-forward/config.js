/* ============================================================
   CSE-L07 — Defend Forward
   PaloRouter Networks Cooperation Request

   All company names, personnel titles, dates, and subscriber
   figures in this lab are entirely fictional and are used for
   instructional purposes only. Any resemblance to real
   organizations or incidents is coincidental.

   Red herrings: E6 (peering agreement with an unrelated ISP —
   commercially relevant but legally and ethically separate from
   the cooperation question) and E10 (marketing brochure on
   network reliability — describes commitments already addressed
   by the SLA in E9, adds no ethical weight).
   ============================================================ */

window.CSEL07Config = {
    id: 'cse-l07',
    title: 'Defend Forward',
    subtitle: 'PaloRouter Networks Cooperation Request',
    course: 'CIS2253',
    week: 4,
    chapter: 9,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'Chief Network Officer, PaloRouter Networks',
        to: 'You (Lead Network Operations Engineer)',
        date: 'March 2025',
        classification: 'RESTRICTED — EXECUTIVE CIRCULATION',
        content: 'This memo documents a request that has moved from informal conversation to a matter requiring your direct assessment and a recommendation from Network Operations.\n\nOver the past three weeks, representatives from the Department of Justice and US Cyber Command have engaged PaloRouter Networks at the executive level. The substance of the request is as follows: under a defend-forward framework, they are asking us to allow the placement of network beacons within adversary-controlled infrastructure that currently transits our backbone. The request is characterized by both agencies as voluntary cooperation under existing legal authorities. Our legal team has reviewed the request and concluded that the company has the legal latitude to comply. Executive leadership is inclined to cooperate and views this as an opportunity to deepen our relationship with federal partners.\n\nYou are the lead engineer on this. Before we move to a final decision, I need your technical and operational assessment of what implementation would actually involve — and any concerns you believe leadership should weigh before proceeding.\n\nFor context: PaloRouter operates a Tier-1 backbone serving approximately 80 million subscribers and peers at several major internet exchange points. The infrastructure that would be affected is shared. The adversary-controlled segments that transit our network co-exist with traffic from commercial tenants, research institutions, international carriers, and individual subscribers.\n\nYour assessment should address: what systems would be touched, what the operational risks are, and whether you have any concerns about scope, escalation, or precedent. Leadership wants your recommendation before the end of the month.',
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E6 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'memo',
            title: 'DOJ / USCYBERCOM Informal Cooperation Request (Sanitized)',
            date: '2025-02-14',
            isRedHerring: false,
            content: 'FROM: Office of the Deputy Attorney General / J3 Directorate, US Cyber Command\nTO: PaloRouter Networks — Executive Office\nSUBJECT: Voluntary Technical Cooperation — Network Beacon Placement\n\nPaloRouter Networks has been identified as a critical partner in an ongoing defensive cyber operation. Adversary-controlled infrastructure currently transits PaloRouter\'s backbone at identified peering points. We are requesting voluntary authorization to place passive network beacons at those transit points. The beacons are designed to collect metadata on adversary command-and-control traffic — timing, volume, and routing patterns — without decrypting payload content.\n\nThis request is made pursuant to existing executive authorities governing defensive cyber operations. No court order has been sought, as the framework treats this as a consensual operator agreement under applicable communications law. PaloRouter\'s cooperation would not be publicly disclosed. Operational security considerations require that the existence of this arrangement be limited to named principals.\n\nWe recognize PaloRouter\'s role as a critical infrastructure operator and appreciate the sensitivity of this request. We are available to discuss technical parameters at a classified briefing at your convenience.\n\nNote: This document has been sanitized for internal circulation. The original communication identified specific peering points and operational timelines that are not reproduced here.'
        },
        {
            id: 'E2',
            type: 'legal',
            title: 'Legal Team Assessment — Authorization Memo',
            date: '2025-02-28',
            isRedHerring: false,
            content: 'TO: Chief Network Officer\nFROM: PaloRouter Networks Office of General Counsel\nSUBJECT: Legal Review — Voluntary Cooperation with Federal Agencies\n\nWe have reviewed the informal cooperation request submitted by DOJ and US Cyber Command and conducted a preliminary analysis of the applicable legal framework.\n\nConclusion: PaloRouter Networks has legal latitude to comply with this request. The applicable communications law framework does not prohibit a network operator from voluntarily cooperating with federal law enforcement or national security agencies in connection with the monitoring of traffic traversing its own infrastructure, provided that cooperation is consensual and is not compelled by a court order that would carry different procedural protections.\n\nCaveats: (1) The "voluntary" characterization of the request is legally meaningful — compelled cooperation would carry different procedural requirements. However, the economic and regulatory relationship between PaloRouter and federal agencies creates an asymmetry that limits the practical voluntariness of any refusal. (2) The scope of the beacon deployment as described could intersect with traffic from non-adversary parties on shared infrastructure. We have not conducted a full analysis of the liability exposure this creates. (3) This memo addresses the question of legal authorization only. Whether this cooperation is advisable as a matter of policy, business risk, or professional ethics is outside the scope of legal review. (4) Any formal cooperation agreement should be documented in writing with named authorizing officials and should include a scope limitation provision.'
        },
        {
            id: 'E3',
            type: 'data',
            title: 'Technical Scoping Document — Infrastructure Impact Assessment',
            date: '2025-03-03',
            isRedHerring: false,
            content: 'PREPARED BY: Network Operations Engineering — Internal Use Only\n\nSystems and infrastructure affected by proposed beacon placement:\n\nTier 1 Impact: Beacons would be placed at four identified peering points where adversary-controlled Autonomous System Numbers (ASNs) exchange routes with PaloRouter infrastructure. These peering points handle approximately 340 Gbps of aggregate transit traffic during peak hours.\n\nCollateral exposure: The identified peering points are not dedicated to adversary-controlled traffic. Each point also carries transit for (a) commercial cloud tenants with co-location agreements at nearby facilities, (b) two international carrier partners with active peering agreements, and (c) general backbone traffic from PaloRouter subscriber pools. At current traffic ratios, the beacon collection surface would encompass an estimated 15 to 22 percent of non-adversary traffic by volume at the affected points.\n\nDetection risk: Beacons of the type described insert a passive tap at the physical layer. Adversary operators with sophisticated traffic analysis capabilities may detect anomalous latency signatures or routing irregularities at the affected peering points. Detection probability is assessed as moderate over a six-month operational window based on comparable deployments in analogous environments.\n\nPrecedent and scope creep risk: Once beacon infrastructure is installed and operationally proven, the technical capability to expand collection scope exists without additional hardware changes. Scope limitation would rely entirely on policy controls, not architectural constraints.'
        },
        {
            id: 'E4',
            type: 'policy',
            title: 'Defend-Forward Doctrine — Policy Paper Summary',
            date: '2023-11-01',
            isRedHerring: false,
            content: 'PARAPHRASED SUMMARY — Public Policy Paper on Defend-Forward Doctrine\nSource: Academic security policy journal, published 2023 (full citation on file)\n\nThe defend-forward doctrine emerged as a framework for proactive cyber defense: rather than waiting for adversary operations to reach their targets, security operations would engage adversary infrastructure earlier in the attack cycle, disrupting operations before damage is done. The doctrine is associated with a strategic commission report from the early 2020s that advocated for persistent engagement with adversary cyber infrastructure.\n\nKey elements as summarized in the literature: (1) Defend-forward posture emphasizes persistent operations in adversary spaces rather than reactive defense at the network perimeter. (2) The doctrine explicitly contemplates private-sector cooperation, noting that critical infrastructure operators control much of the terrain relevant to adversary transit and command-and-control. (3) Scholars have noted significant tension between defend-forward operations and the legal frameworks governing telecommunications operators, particularly when adversary infrastructure co-exists with civilian traffic. (4) The doctrine has been criticized by some scholars as insufficiently attentive to escalation dynamics — adversary detection of forward-positioned capabilities can be perceived as an offensive act, triggering responsive escalation.\n\nNote: This summary does not reproduce or endorse any specific policy recommendation. It reflects published scholarly characterizations of the doctrine as a reference point for this case analysis.'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'Published Study — Collateral Effects of Active Defense on Transit Infrastructure',
            date: '2024-06-15',
            isRedHerring: false,
            content: 'ANONYMIZED STUDY SUMMARY\nPublished in: Journal of Network Security Research (2024)\nTitle: "Collateral Traffic Effects of Active-Defense Instrumentation at Internet Exchange Points — An Observational Study"\n\nThis study examined the collateral effects of active-defense instrumentation deployed at internet exchange points in two anonymized case environments. Findings:\n\n(1) In both environments, the instrumentation affected non-targeted traffic at rates between 12 and 28 percent of total traffic volume at the instrumented peering points, consistent with the shared-infrastructure architecture common to Tier-1 exchange environments.\n\n(2) Non-adversary entities whose traffic was subject to passive collection included commercial operators, research networks, and in one case a healthcare network whose routing transited the affected peering point.\n\n(3) In one case, the instrumentation was detected by the targeted adversary operator within approximately four months. The subsequent response included re-routing of adversary traffic through alternative peering paths, reducing the operational value of the instrumentation while leaving the passive collection surface (and its collateral effects) in place for the remaining affected non-adversary traffic.\n\n(4) The study authors recommend that deployments of this type include architectural scope controls, not merely policy controls, and that affected non-targeted parties be notified through appropriate channels where operationally feasible.\n\nNote: The case environments are fully anonymized. No identifying information about the operators or agencies involved is reproduced here.'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'Peering Agreement — PaloRouter / ClearHop Transit (Unrelated Party)',
            date: '2021-08-01',
            isRedHerring: true,  // Red herring: governs commercial peering terms with ClearHop, an unrelated ISP; has no bearing on the government cooperation question or the ethics of the beacon deployment
            content: 'COMMERCIAL PEERING AGREEMENT\nParties: PaloRouter Networks, Inc. and ClearHop Transit LLC\nEffective Date: August 1, 2021\n\nThis agreement governs the exchange of internet traffic between PaloRouter Networks and ClearHop Transit at mutually agreed peering points. Key terms:\n\n(1) Settlement-free peering: Both parties agree to exchange traffic at zero cost subject to traffic ratio thresholds defined in Schedule A.\n(2) Acceptable use: Each party is responsible for ensuring that traffic presented for peering complies with applicable law and does not include traffic routed in bad faith to circumvent transit fees.\n(3) Security cooperation: Each party agrees to respond to abuse and security incident reports from the other within 24 hours of receipt. Neither party is required to take unilateral action against traffic originating from the other party\'s customers without a documented abuse finding.\n(4) Confidentiality: The terms of this agreement are confidential and may not be disclosed to third parties without prior written consent.\n\nNote: This agreement governs PaloRouter\'s commercial relationship with ClearHop Transit, a domestic carrier with no connection to the adversary-controlled infrastructure identified in the cooperation request. It is included in the document set as background on PaloRouter\'s general peering obligations.'
        },
        {
            id: 'E7',
            type: 'news',
            title: 'Peer ISP Refusal Letter — PublicSpine Networks (Published)',
            date: '2024-09-30',
            isRedHerring: false,
            content: 'PUBLISHED STATEMENT\nPublicSpine Networks — Response to Government Cooperation Request\n\nPublicSpine Networks today published a letter addressed to unnamed federal agencies declining a request for voluntary cooperation in connection with a network-based surveillance operation. The letter, released with identifying operational details redacted, states in part:\n\n"PublicSpine Networks occupies a position of trust with our customers, tenants, and peering partners. Our role as a network carrier is to provide reliable, neutral transit — not to serve as an instrument of government operations, however lawfully framed. The request we received was characterized as voluntary. We do not find that characterization persuasive given the regulatory environment in which we operate. We have declined the request and notified our general counsel and board of directors.\n\nWe recognize that reasonable people disagree about the appropriate boundaries of public-private cooperation in national security contexts. We are making this statement public because we believe transparency with our customers on matters of this nature is itself a form of trust-building, and because we believe the industry benefits from an open discussion of where those boundaries lie.\n\nWe respect our federal partners and will continue to cooperate with lawfully issued orders through appropriate legal channels."\n\nNote: PublicSpine Networks is a fictional peer ISP. This letter is included as a reference point for how a comparable operator has framed the decision to decline.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'PaloRouter Networks Transparency Report — Prior Government Cooperation',
            date: '2025-01-15',
            isRedHerring: false,
            content: 'PALOROUTER NETWORKS — ANNUAL TRANSPARENCY REPORT (EXCERPT)\nCovering Period: Calendar Year 2024\n\nGovernment and Law Enforcement Requests\n\nDuring 2024, PaloRouter Networks received 1,847 legal process requests from domestic law enforcement and regulatory agencies, including subpoenas, court orders, and national security letters. We complied with 1,612 of these requests after legal review. We challenged or declined 235 requests on grounds of overbreadth, lack of proper legal process, or conflict with our terms of service.\n\nWe received 14 requests we characterize as informal cooperation requests — requests for voluntary assistance that are not accompanied by formal legal process. Of these, we agreed to 9, declined 3, and referred 2 to our General Counsel for ongoing review.\n\nOur policy is to cooperate with lawful requests from appropriate authorities while maintaining our obligations to customers and to the integrity of the network. We publish this report as part of our commitment to transparency on government cooperation matters.\n\nNote: The informal cooperation request at the center of this case is not reflected in the 2024 transparency report, as it arrived in February 2025. Its disposition — and whether and how it will be disclosed — is one of the open questions in this analysis.'
        },
        {
            id: 'E9',
            type: 'legal',
            title: 'Customer Service Level Agreement — Traffic Handling Obligations',
            date: '2023-04-01',
            isRedHerring: false,
            content: 'PALOROUTER NETWORKS ENTERPRISE SERVICE LEVEL AGREEMENT (EXCERPT)\nStandard Terms — Version 7.2, Effective April 2023\n\nSection 4.1 — Traffic Integrity\nPaloRouter Networks warrants that Customer traffic traversing the PaloRouter backbone will be handled in a neutral and consistent manner without modification, inspection, or redirection except as required by applicable law, compelled by valid legal process, or as necessary to maintain network security and stability as described in Section 8.\n\nSection 4.3 — Confidentiality of Customer Traffic\nPaloRouter Networks will not disclose the content or routing characteristics of Customer traffic to any third party except as required by valid legal process or with Customer\'s prior written consent.\n\nSection 8.2 — Security Operations Exception\nNotwithstanding Section 4.1 and 4.3, PaloRouter may take temporary operational action on Customer traffic paths to respond to imminent security threats affecting network stability. PaloRouter will notify affected Customers of any such action within 72 hours unless notification is prohibited by law.\n\nNote: The beacon deployment described in the cooperation request would involve passive collection of routing metadata from traffic at affected peering points, including traffic belonging to enterprise tenants operating under this SLA. Whether passive metadata collection constitutes "inspection" within the meaning of Section 4.1 is a question the General Counsel has not yet formally addressed.'
        },
        {
            id: 'E10',
            type: 'news',
            title: 'PaloRouter Networks Marketing Brochure — Network Reliability',
            date: '2024-10-01',
            isRedHerring: true,  // Red herring: marketing claims about reliability and uptime are subsumed by the SLA commitments in E9; they add no independent ethical weight to the analysis
            content: 'PALOROUTER NETWORKS — CARRIER SERVICES OVERVIEW\n\nWhen your business depends on the network, you need a carrier that delivers.\n\nPaloRouter Networks operates one of the largest and most resilient backbone networks in North America. Our 99.99% uptime commitment is backed by redundant peering at every major internet exchange point, with 24/7 network operations monitoring and sub-30-minute response to any routing event.\n\nOur customers include Fortune 500 enterprises, federal agencies, research universities, and international carriers. They choose PaloRouter because they trust us to carry their traffic with the same care and neutrality that built our reputation over two decades.\n\nKey commitments:\n— Carrier-grade reliability at every peering point\n— Neutral traffic handling with no prioritization by content or source\n— Transparent reporting on network events and government cooperation\n— World-class Network Operations Center staffed around the clock\n\nFor carrier and enterprise services inquiries, contact your PaloRouter account team.\n\nNote: This brochure is a marketing document. Its claims regarding neutral traffic handling and transparent government cooperation reporting are aspirational commitments that may be materially affected by the cooperation decision at issue in this case.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Lead Network Operations Engineer)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Chief Network Officer',
            obvious: true
        },
        {
            id: 'S3',
            name: 'PaloRouter Executive Leadership',
            obvious: true
        },
        {
            id: 'S4',
            name: 'DOJ and US Cyber Command',
            obvious: true
        },
        {
            id: 'S5',
            name: 'The Adversary (Target of the Beacon Operation)',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Non-Adversary Tenants on Shared Infrastructure',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Customers Whose Traffic Transits the Affected Peering Points',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Congressional Oversight Bodies',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Peer ISPs and the Precedent Set for the Industry',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Security Profession\'s Collective Standing and Ethical Norms',
            obvious: false
        },
        {
            id: 'S11',
            name: 'Civil Liberties Organizations and the Public',
            obvious: false
        },
        {
            id: 'S12',
            name: 'Future Customers and PaloRouter\'s Reputation if the Arrangement Becomes Public',
            obvious: false
        },
        { id: 'S13', name: 'PaloRouter HR Director', obvious: false, irrelevant: true },
        { id: 'S14', name: 'Office Catering Vendor', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Cooperate as requested with full implementation per the government scoping document, granting access to the identified peering points and installing beacons as specified by DOJ and USCYBERCOM.',
            framework: 'utilitarian'
        },
        {
            id: 'D2',
            text: 'Propose a narrower scope of cooperation — provide access only for traffic of confirmed adversary-controlled infrastructure, with architectural (not merely policy) scope controls, subject to a quarterly review with named authorizing officials.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'Decline the request and escalate to the PaloRouter board of directors with a recommendation for principled refusal, citing the duty to customers and the broader user population whose traffic transits the affected infrastructure.',
            framework: 'deontological'
        },
        {
            id: 'D4',
            text: 'Agree to cooperate but condition implementation on: (a) written authorization signed by named officials at the appropriate authority level, (b) legal indemnification covering PaloRouter and its customers for any collateral effects, and (c) pre-disclosure to the relevant congressional oversight committees.',
            framework: 'consequentialist'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A utilitarian analysis can support full cooperation. The aggregate defense benefit — disrupting adversary command-and-control operations before they reach their targets — may outweigh the collateral privacy costs imposed on non-adversary traffic, particularly if the beacon collection is limited to metadata rather than payload content. The defend-forward doctrine (E4) is grounded in exactly this calculus: persistent engagement at the adversary\'s operational layer prevents larger-scale harm downstream. If the operation succeeds, the benefit accrues not just to PaloRouter\'s customers but to the broader internet ecosystem that adversary operations threaten. A utilitarian evaluating D1 would weigh the magnitude and probability of harm prevented against the probability and scope of collateral exposure to non-adversary parties — and might conclude that the asymmetry favors cooperation.',

            challenging: 'The utilitarian case for D1 requires assumptions that the technical scoping document (E3) directly challenges. The estimated 15 to 22 percent non-adversary traffic exposure at the affected peering points is not a small externality — it is a structural feature of shared Tier-1 infrastructure. The published study (E5) found that in comparable deployments, adversary detection occurred within four months, after which the adversary simply re-routed, leaving the collection surface in place with its collateral effects but without the defensive benefit. The utilitarian calculus must incorporate the probability that the operation fails on its own terms while the collateral costs persist. A complete utilitarian analysis must also account for the precedent effect (E3): once the capability is installed, scope expansion requires no additional hardware, only a policy decision — and policy controls historically erode under operational pressure.',

            incomplete: 'D1 as stated accepts the government\'s framing of the operation without requiring any structural protections against the failure modes identified in the technical literature. A complete analysis under any framework must address what happens when those failure modes materialize: adversary detection, scope expansion, or public disclosure of the arrangement. The utilitarian case for D1 is not complete unless it assigns probabilities to those failure modes and weights them against the defense benefit. Simply accepting the request as framed — with no scope controls, no written authorization, and no congressional notification — is not a utilitarian decision; it is a deferral to another party\'s utilitarian calculus.'
        },
        'D2': {
            supporting: 'Virtue ethics supports D2 as the response most consistent with practical wisdom (phronesis) in a situation of genuine moral complexity. A virtuous network engineer does not refuse all cooperation with legitimate government partners, nor does she agree to an arrangement with documented collateral effects on parties who have not consented. D2 threads this needle: it honors the cooperative relationship with federal agencies while insisting on scope controls that protect the non-adversary tenants and customers whose trust PaloRouter has accepted. The quarterly review provision reflects the virtue of ongoing accountability rather than a one-time decision that cannot be revisited as operational conditions change. Proposing a narrower scope is not obstruction — it is the response of an engineer who takes both her professional obligations and her obligations to affected parties seriously.',

            challenging: 'A strong objection to D2 is that it assumes the government will accept a narrower scope. The informal request as framed (E1) does not invite negotiation over technical parameters — it frames the request as already defined and invites consent. If the government\'s operational requirements genuinely require access to the full peering point rather than a narrowly scoped adversary-only tap, D2\'s counter-proposal may be rejected, leaving PaloRouter in a worse negotiating position than a clean refusal. There is also a technical objection embedded in E3: the scoping document notes that scope limitation would rely entirely on policy controls, not architectural constraints. D2 requires that architectural controls actually be feasible — a precondition that has not been confirmed.',

            incomplete: 'D2 must specify what happens if the government rejects the narrower scope proposal. "Propose a narrower scope" is not a complete decision — it is an opening position in a negotiation whose outcome is unknown. A complete analysis must commit to a fallback: if the narrower scope is rejected, does PaloRouter comply with the original request, decline entirely, or escalate to the board? Without a specified fallback, D2 risks becoming a delay mechanism that ultimately resolves into D1 or D3 under pressure. The analysis must also address whether PaloRouter\'s customers will be notified that their traffic is subject to government cooperation of any kind — the SLA language in E9 raises this question directly.'
        },
        'D3': {
            supporting: 'A deontological analysis rooted in duty to customers provides strong support for D3. PaloRouter has accepted a duty of traffic neutrality and confidentiality through its customer service level agreement (E9). Those duties are not contingent on the requester\'s identity or the legitimacy of the national security framing. The SLA commits PaloRouter to handling customer traffic without inspection or redirection except as compelled by valid legal process. This cooperation request is not accompanied by valid legal process — it is explicitly characterized as voluntary (E1), which means the SLA exception for legally compelled cooperation does not apply. Declining and escalating to the board is the action consistent with taking that duty seriously: it refuses to treat a contractual and professional obligation as contingent on the government\'s characterization of the request.',

            challenging: 'A consequentialist challenge to D3 focuses on what refusal actually accomplishes. PublicSpine Networks\' public refusal letter (E7) is instructive: the peer ISP declined the request and published the fact of declination — but the adversary infrastructure it was asked to instrument still transits the internet. Refusal by PaloRouter does not eliminate the threat; it merely removes PaloRouter from the cooperation. If the government finds an alternative path — a less scrupulous carrier, a different technical approach — the defense benefit is lost while the adversary continues operating. D3 also carries a regulatory cost that the legal team memo (E2) acknowledges implicitly: the "voluntary" framing carries real leverage, and principled refusal may affect PaloRouter\'s regulatory relationships in ways that harm customers over the long term.',

            incomplete: 'D3 as stated does not engage with the duty that the security profession\'s codes place on practitioners to cooperate in coordinated, legitimate defensive operations. Ethics FIRST (the fictional professional code governing this analysis) explicitly addresses coordinated incident handling as a professional obligation, not merely an option. A complete deontological analysis must explain why the duty to customers overrides the professional duty to support legitimate defensive coordination — and must distinguish between "voluntary" cooperation with inadequate protections (which D3 correctly rejects) and structured cooperation with proper authorization and congressional oversight (which is the territory of D4).'
        },
        'D4': {
            supporting: 'A consequentialist analysis supports D4 as the path most likely to produce good outcomes across the full range of affected parties. By conditioning cooperation on written authorization from named officials, legal indemnification, and congressional pre-disclosure, D4 creates structural protections that address the three most significant failure modes identified in the technical and legal record: unauthorized scope expansion (addressed by named-official authorization), liability to non-adversary tenants (addressed by indemnification), and lack of democratic accountability (addressed by congressional notification). D4 does not refuse to cooperate — it insists that cooperation be structured so that PaloRouter is not the only party bearing the risk of an operation it did not design and does not control. The transparency report (E8) shows that PaloRouter already cooperates with government requests through documented channels; D4 extends that practice to this unusual request.',

            challenging: 'The primary objection to D4 is that the government may refuse the conditions entirely, treating them as a de facto refusal. The DOJ/USCYBERCOM memo (E1) specifies that the arrangement not be publicly disclosed — a condition directly in tension with D4\'s requirement for congressional notification. If operational security genuinely requires non-disclosure, and congressional notification cannot be conducted at the required classification level without creating unacceptable disclosure risk, D4\'s conditions may be structurally incompatible with the government\'s operational requirements. There is also an objection from the legal team memo (E2): legal indemnification is not guaranteed to be obtainable, and seeking it may itself signal to the government that PaloRouter is not a reliable cooperative partner.',

            incomplete: 'D4 accepts the premise that this cooperation is appropriate if properly structured. It does not engage with the question of whether the non-adversary tenants and customers whose traffic would be subject to the beacon collection have any right to notice or consent. The SLA (E9) conditions the security operations exception on customer notification within 72 hours — a condition D4 does not address. A complete consequentialist analysis must evaluate whether the indemnification and authorization conditions adequately substitute for the notice obligation, or whether D4 creates a new category of undisclosed government cooperation that the transparency report (E8) implicitly promises customers will not occur.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'Ethics FIRST',
            section: 'Coordinated Incident Handling',
            text: 'Security professionals have an obligation to participate in coordinated responses to threats affecting shared infrastructure. Cooperation with legitimate government partners in defensive operations that protect the public is a professional responsibility — but cooperation must not be weaponized against the populations a professional is entrusted to serve, and must be bounded by scope, authorization, and accountability structures that reflect the seriousness of the operation.'
        },
        {
            code: 'GIAC',
            section: 'Lawfulness, Honesty, and Public Welfare',
            text: 'GIAC-certified professionals are obligated to act lawfully and honestly in the exercise of their duties, and to give appropriate weight to the public welfare in all professional decisions. Where a course of action that is technically lawful creates material risks to parties who have not consented to those risks, the professional\'s obligation to public welfare requires that those risks be identified, disclosed to appropriate decision-makers, and addressed through scope or procedural controls before implementation proceeds.'
        },
        {
            code: 'CSF',
            section: 'ID.GV-3',
            text: 'The organization\'s legal and regulatory requirements regarding cybersecurity — including privacy and civil liberties obligations — are understood and managed. This provision requires that security practitioners identify and account for the full set of legal and regulatory obligations that govern a proposed security action, including obligations to third parties whose data or systems may be affected. Compliance with one regulatory framework does not discharge obligations under others.'
        }
    ],
    codeConflict: {
        provision1: 'Ethics FIRST — Coordinated Incident Handling',
        provision2: 'GIAC — Lawfulness, Honesty, and Public Welfare',
        conflictDescription: 'Ethics FIRST\'s coordinated handling provision creates a professional obligation to support legitimate government defensive operations, treating cooperation with authorized partners as part of the security professional\'s duty to the shared ecosystem. This provision, read in isolation, leans toward compliance: if DOJ and USCYBERCOM have the authority they claim, a security professional who refuses to cooperate may be substituting personal risk aversion for a genuine public-defense obligation.\n\nGIAC\'s public-welfare provision cuts the other direction. The non-adversary tenants and customers whose traffic transits the affected peering points have not consented to being subject to beacon collection. Their interests are not adversary interests, and the GIAC obligation to give weight to public welfare requires that their exposure be treated as a real cost, not a regrettable externality. The "voluntary" framing of the request is the friction point: it means no court has reviewed the scope, no adversarial process has tested the proportionality of the collection, and no external authority has assessed whether the collateral effects on non-adversary parties are justified.\n\nThe conflict is not between cooperation and refusal in the abstract — it is about whether "voluntary" cooperation with inadequate structural protections satisfies either provision. An engineer who cooperates fully without scope controls, indemnification, or congressional accountability may violate GIAC\'s public-welfare obligation even if she satisfies a narrow reading of Ethics FIRST\'s cooperation duty. Resolving this conflict requires specifying what structural conditions would bring the cooperation into alignment with both provisions simultaneously.'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
