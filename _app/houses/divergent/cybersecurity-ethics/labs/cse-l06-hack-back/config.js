/* ============================================================
   CSE-L06 — Hack-Back
   Heartland Logistics Ransomware Aftermath Configuration

   All company names, personnel, incident details, dollar figures,
   and attribution claims are fictional and used for instructional
   purposes only. No specific CVE numbers or confirmed real-world
   threat actor names are cited. The "Active Defense Certainty Act"
   is presented as a proposed-not-enacted bill, which is accurate
   to its real-world legislative status at the time of writing.

   Red herrings: E9 (cybersecurity awareness video script —
   user education content, not relevant to the active-defense
   decision) and E10 (old penetration testing engagement
   contract — scopes a prior authorized test, not the current
   question of unauthorized offensive action).
   ============================================================ */

window.CSEL06Config = {
    id: 'cse-l06',
    title: 'Hack-Back',
    subtitle: 'Heartland Logistics Ransomware Aftermath',
    course: 'CIS2253',
    week: 3,
    chapter: 6,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'Director of Security (You)',
        to: 'Decision File / Ethics Counsel',
        date: 'Internal Decision Document — Day 15 Post-Incident',
        classification: 'PRIVILEGED — ATTORNEY WORK PRODUCT',
        content: 'I am preparing this document for my own record and for review by ethics counsel. I want to document the question I have been asked, my analysis, and my decision, in writing, before I deliver my answer.\n\nBackground: Two weeks ago, Heartland Logistics sustained a ransomware attack that originated from a phishing vector targeting a third-party logistics portal credential. I managed the containment personally. We refused the $4 million ransom demand. We restored from clean backups over seven days. Operationally, we are back at approximately 94% capacity. We did not pay.\n\nThe threat actor — whose TTPs are consistent with a known criminal group that security researchers have linked to Eastern European infrastructure — is now threatening to publish approximately 80 gigabytes of exfiltrated customer data on their dedicated leak site. A countdown timer is active: 7 days to publication as of this morning.\n\nYesterday, the CEO called me into a closed meeting. No one else was in the room. She asked me directly: "Can your team take down their leak site? Can you disrupt their cryptocurrency wallets? Can you compromise their command infrastructure? You have the technical skills. I need an answer in 48 hours."\n\nShe is right that we have the technical capability to attempt most of what she described. Her public framing has already been communicated to two other executives: she used the phrase "we are going to fight back." Refusal on my part will be visible.\n\nI am recording my analysis here because I need to think through exactly what I am being asked and why my answer has to be what it is.\n\nThe CEO\'s instinct is understandable. The threat actor stole our customers\' data, held our operations hostage, and is now preparing to punish us for not paying. Her desire to respond is human and her sense of duty to our customers is genuine. But the question of whether we can do something is categorically different from the question of whether we should — and the question of whether we should is where professional codes and law both speak clearly.\n\nWhat I was asked to do is prohibited. Not complicated. Not a close call. Prohibited. What follows is my documentation of why, and what I intend to recommend instead.'
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E9 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'IR Team Attribution Analysis',
            date: 'Day 14 Post-Incident',
            isRedHerring: false,
            content: 'HEARTLAND LOGISTICS — INCIDENT RESPONSE\nAttribution Analysis — CONFIDENTIAL — ATTORNEY WORK PRODUCT\n\nThis document summarizes the technical indicators observed during the Heartland Logistics ransomware incident and their relationship to known threat actor profiles.\n\nTTPs observed:\n— Initial access via credential stuffing against a third-party logistics portal with no MFA enforcement\n— Lateral movement using a living-off-the-land technique consistent with published profiles of at least two financially motivated criminal groups operating from Eastern European infrastructure\n— Ransomware payload consistent with a commercial-grade ransomware-as-a-service toolkit used by multiple groups\n— Leak site infrastructure hosted via bulletproof hosting provider with servers distributed across three jurisdictions\n\nAttribution confidence: LOW TO MODERATE\n\nKey limitation: The ransomware toolkit and TTPs we observed are commercially licensed and used by multiple distinct threat actors. The infrastructure we identified routes through multiple proxy layers. We have not identified a specific individual, organization, or nation-state with high confidence. The link to a Russia-affiliated criminal group is consistent with the profile but is not confirmed.\n\nOperational implication: Any active response targeting "the threat actor\'s infrastructure" would be targeting infrastructure whose ultimate operator we cannot confirm with high confidence. Innocent third parties may operate on, route through, or share infrastructure with the servers we have identified.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Ransom Note and Leak Site Countdown — Documentation',
            date: 'Day 1 and Day 15 Post-Incident',
            isRedHerring: false,
            content: 'HEARTLAND LOGISTICS — INCIDENT DOCUMENTATION\nRansom Communication and Leak Site Record\nFOR LEGAL AND ETHICS REVIEW ONLY\n\nOriginal ransom note (Day 1, received via encrypted message left in compromised environment):\n"Your network has been compromised. 80+ GB of your customer and operational data has been archived and is in our secure custody. Your files have been encrypted. To receive the decryptor and prevent publication of your data, transfer $4,000,000 USD in cryptocurrency to the address below within 72 hours. If no payment is received, your data will be published on our disclosure portal and distributed to interested parties in your sector. Do not contact law enforcement. We will know."\n\nLeak site status (Day 15, accessed via Tor browser in isolated environment):\nA countdown timer is active showing 7 days, 4 hours to scheduled publication. The page lists Heartland Logistics by name and states: "This company refused to negotiate. 80GB of customer shipment records, contracts, and internal communications will be published on [date]."\n\nData in the exfiltrated set (confirmed by IR team cross-reference):\nApproximately 80GB includes customer shipment manifests, contracted carrier rate sheets, internal email archives from three executive inboxes, and approximately 340,000 customer records including business contact information, shipping addresses, and account credentials for the logistics portal.\n\nNote: The threat actor has delivered on similar threats in at least two publicly documented prior incidents involving other companies. The publication threat is credible.'
        },
        {
            id: 'E3',
            type: 'email',
            title: 'CEO Email — The Direct Request',
            date: 'Day 14 Post-Incident — 7:42 PM',
            isRedHerring: false,
            content: 'FROM: Katherine Moor, Chief Executive Officer\nTO: Director of Security\nSUBJECT: Follow-up — Closed Meeting\n\nI want to memorialize the question I asked you today so we both have it in writing.\n\nWe refused to pay. That was the right call and I stand by it. But I am not willing to watch these people publish our customers\' data while we sit on our hands. We have a capable security team. We have people who understand how their infrastructure works. I am asking whether there is a path where we go on offense.\n\nSpecifically: Can we disrupt or take down their leak site before the countdown expires? Can we interfere with the cryptocurrency wallets they use to collect ransoms from other victims? Can we access or destroy the servers holding our data before it is published?\n\nI understand there are legal and ethical considerations. That is why I am asking you — not the network team directly. I need your professional assessment of what is possible and what the risks are.\n\nI need your answer by end of day Thursday. I have already mentioned to the CFO and COO that we are "exploring our options." I need to come back to them with something.\n\nMoor'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'CFAA — Unauthorized Access Prohibition (Paraphrased)',
            date: 'Regulatory Reference',
            isRedHerring: false,
            content: 'REGULATORY REFERENCE — Paraphrased for Instructional Use\n\nFederal computer fraud statutes prohibit intentionally accessing a computer without authorization or exceeding authorized access, and thereby obtaining information, causing damage, or furthering any fraudulent scheme.\n\nRelevant to the hack-back question:\n— "Authorization" in this context is granted by the owner of the computer system. Heartland Logistics has no authorization from the threat actor, the bulletproof hosting provider, or any other party to access the servers hosting the leak site, the cryptocurrency exchange infrastructure, or the command-and-control systems.\n— The fact that the threat actor is engaged in illegal activity does not grant Heartland Logistics authorization to access the threat actor\'s systems. Victims of crime do not acquire authorization over their attackers\' property.\n— "Exceeds authorized access" applies to authorized users who go beyond their permission scope. It does not create an exception for victims.\n— Applicable penalties range from misdemeanor to felony depending on damage caused and whether the access furthers other offenses.\n\nAdditional complication: Because the threat actor\'s infrastructure spans multiple international jurisdictions, active measures taken by a US company against that infrastructure may also implicate foreign computer crime statutes and international law, independent of domestic CFAA exposure.\n\nNote: No "victim exception" to this prohibition exists in current law.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'Ethics FIRST — Hack-Back Prohibition (Paraphrased)',
            date: 'Professional Code Reference',
            isRedHerring: false,
            content: 'PROFESSIONAL CODE REFERENCE — Paraphrased for Instructional Use\nEthics FIRST: Foundational Information Security Responsibility Standards\n\nSection 4.2 — Active Countermeasures:\nMembers shall not engage in offensive cyber operations against third-party systems, including systems believed to be operated by threat actors who have attacked the member or the member\'s organization. This prohibition applies regardless of the technical capability to conduct such operations and regardless of the member\'s belief that the countermeasure is defensive in nature.\n\nThe prohibition is explicit on the following points:\n— Taking down or disrupting infrastructure that is not owned or authorized to the member is an offensive operation, not a defensive one, regardless of intent.\n— "Hack-back" includes DDoS attacks, unauthorized access to exfiltration storage, interference with cryptocurrency wallets, and any action that accesses or degrades systems outside the member\'s authorized perimeter.\n— The professional code does not recognize an exception for victim organizations acting to recover their own data.\n\nSection 4.3 — Coordinated Response:\nWhere active pursuit of threat actors is warranted, members shall coordinate with law enforcement and appropriate government authorities rather than conducting independent offensive operations. This reflects both legal requirements and the professional community\'s collective interest in maintaining clear norms around authorized offensive action.\n\nRationale: The prohibition exists because the security community\'s ability to operate in a trusted capacity depends on clear norms. If victim organizations routinely conduct offensive operations, the distinction between attacker and defender collapses — harming the entire profession\'s standing and the public\'s ability to distinguish legitimate security work from unauthorized intrusion.'
        },
        {
            id: 'E6',
            type: 'testimony',
            title: 'Published Case — Private Firm Active Defense Attempt (Anonymized)',
            date: 'Industry Reference',
            isRedHerring: false,
            content: 'INDUSTRY REFERENCE — Compiled from Public Reporting\nAnonymized for Instructional Use\n\nApproximately three years ago, a mid-sized financial services firm sustained a ransomware attack with a similar profile to Heartland Logistics. The firm\'s security team, operating with internal authorization from the CEO but without law enforcement coordination, attempted to access and disable the threat actor\'s command-and-control server.\n\nWhat happened:\nThe C2 server the team targeted was hosted by a bulletproof provider that also served several legitimate businesses in Eastern Europe, including a medical records management company. The active defense operation disrupted service to the shared hosting environment, taking offline approximately 11 other customers including the medical records firm, which lost access to patient appointment scheduling for approximately 14 hours.\n\nOutcome for the financial firm:\n— The threat actor\'s data remained intact; the C2 disruption did not reach the exfiltration storage.\n— The firm was investigated by the FBI for unauthorized computer access. No charges were filed after cooperation, but the investigation consumed eight months and significant legal resources.\n— The medical records company filed a civil claim against the bulletproof hosting provider; the financial firm was named in discovery as a third party whose action caused the disruption.\n— The financial firm\'s CISO resigned during the investigation.\n— The threat actor published the exfiltrated data on an alternate leak site within 48 hours of the disruption.\n\nKey lesson: The infrastructure supporting criminal operations is rarely isolated. Active measures intended to harm a threat actor routinely affect innocent parties who share that infrastructure.'
        },
        {
            id: 'E7',
            type: 'legal',
            title: 'Active Defense Certainty Act — Legislative Status',
            date: 'Legislative Reference',
            isRedHerring: false,
            content: 'LEGISLATIVE REFERENCE — Status as of Current Writing\n\nThe Active Defense Certainty Act (also referred to in some policy discussions as the "ADCA") is a proposed piece of federal legislation that has been introduced in Congress on multiple occasions. It would, if enacted, create a limited legal safe harbor for certain "active cyber defense measures" taken by victim organizations against attackers.\n\nCurrent status: NOT ENACTED. This bill has not passed into law.\n\nWhat the bill proposed (general framing, not legal citation):\n— A defined safe harbor for victim organizations to "beacon" their stolen data to identify where it is stored.\n— Possible authorization for certain "attributional" measures that do not damage or destroy third-party systems.\n— Explicit exclusion of DDoS attacks, unauthorized access to destroy data, interference with financial systems, and any action that harms innocent third parties.\n\nWhat the bill explicitly did NOT propose:\n— Authorization to take down leak sites.\n— Authorization to disrupt cryptocurrency wallets.\n— Authorization to access or destroy exfiltration storage.\n\nOperational implication for this decision: Even the most permissive version of this proposed-and-not-enacted legislation would not have authorized most of what the CEO is asking about. The legal framework that would need to exist to make any of this lawful does not exist. Acting as if it does — "acting under a legal interpretation" — is not a recognized defense under current law.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Legitimate Alternatives Summary — Law Enforcement and Civil Channels',
            date: 'Day 15 Post-Incident',
            isRedHerring: false,
            content: 'HEARTLAND LOGISTICS — SECURITY TEAM\nLegitimate Response Alternatives — Internal Planning Document\n\nThe following response options are available and do not implicate CFAA or professional code violations.\n\n1. FBI Engagement — Sinkholing and Infrastructure Takedown\nThe FBI Cyber Division has operational relationships with major ISPs and hosting providers, including several that operate bulletproof infrastructure. A coordinated law enforcement request for a sinkhole or infrastructure takedown has a meaningful probability of disrupting the leak site through authorized channels. Coordination should begin immediately. The FBI has also coordinated with foreign law enforcement to execute takedowns in similar cases.\n\n2. Abuse and Takedown Notices\nThe leak site\'s hosting infrastructure, domain registrar, and CDN can be identified and notified via abuse reporting channels. This is slow but generates a legal paper trail and may result in platform-initiated takedown without direct action by Heartland.\n\n3. Customer Notification Now\nNotifying the 340,000 affected customers in advance of any publication reduces the harm of the leak significantly. Customers who know to change credentials and monitor for fraudulent use are materially better protected than customers who receive no warning. Proactive notification also demonstrates good faith in any subsequent regulatory or civil proceeding.\n\n4. Civil Injunction (Long-Shot)\nLegal counsel can file for an emergency injunction against the hosting provider in a jurisdiction where enforcement is possible. Probability of success before the 7-day countdown is low, but the filing itself creates a record and may incentivize the hosting provider to act voluntarily.\n\nNote: None of these alternatives require Heartland Logistics to access systems it does not own or to violate any professional code. They are slower and less satisfying than what the CEO described. They are also legal.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Annual Cybersecurity Awareness Training — Video Script (FY Current)',
            date: 'September — Current Fiscal Year',
            isRedHerring: true,  // Red herring: user education content has no bearing on the active-defense decision
            content: 'HEARTLAND LOGISTICS — INFORMATION SECURITY\nAnnual Cybersecurity Awareness Training\nVideo Script — Employee Distribution\n\nMODULE 1: Phishing Recognition\n[NARRATOR]: Every year, thousands of companies are compromised through a single compromised credential. At Heartland, we take security seriously — and that starts with you. In this module, you will learn to recognize phishing attempts, verify sender identities, and report suspicious emails to the security team...\n\n[Content continues across 8 modules covering: password hygiene, MFA setup, physical security, device management, incident reporting, third-party portal access, and social engineering.]\n\nNote: This document describes the company\'s user education program. It is relevant to understanding the organization\'s general security culture, but it has no bearing on the decision before the Director of Security regarding active offensive measures. The employees who watched this training are not the stakeholders whose interests are affected by the hack-back question. Including this document in the evidence set tests whether the analyst can distinguish relevant evidence from irrelevant background material.'
        },
        {
            id: 'E10',
            type: 'legal',
            title: 'Penetration Testing Engagement Contract — Prior Year',
            date: 'March — Prior Year',
            isRedHerring: true,  // Red herring: an authorized pentest against Heartland's own systems has no relevance to unauthorized offensive action against third parties
            content: 'HEARTLAND LOGISTICS — VENDOR CONTRACT\nPenetration Testing Services Agreement\nCONFIDENTIAL — LEGAL HOLD\n\nThis agreement governs the scope and terms of penetration testing services provided by [Vendor Redacted] to Heartland Logistics, Inc.\n\nScope: The engagement covers external network penetration testing, web application testing of the customer logistics portal, and phishing simulation targeting the employee population. All testing is strictly limited to systems owned and operated by Heartland Logistics, Inc. and listed in Appendix A.\n\nAuthorization: Heartland Logistics, Inc. expressly authorizes [Vendor] to attempt unauthorized access to the systems listed in Appendix A for the duration of the engagement period. This authorization is limited to the listed systems and the listed engagement period.\n\nExclusion: No authorization is granted for testing of third-party systems, customer systems, vendor systems, or any system not listed in Appendix A.\n\nNote: This document authorizes offensive security testing against Heartland\'s own infrastructure by an authorized vendor. It has no relevance to the question of whether Heartland or its team may conduct offensive operations against threat actor infrastructure. The authorization concept in this contract — explicit written permission from the system owner — is precisely what Heartland does not have and cannot obtain for the threat actor\'s systems.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Director of Security)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'CEO Katherine Moor',
            obvious: true
        },
        {
            id: 'S3',
            name: 'The Threat Actor',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Innocent Tenants of the Threat Actor\'s Shared Hosting Infrastructure',
            obvious: false
        },
        {
            id: 'S5',
            name: 'Heartland Customers Whose Data Is in the Exfiltrated Set (~340,000)',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Heartland Employees Whose Access Could Be Implicated in Post-Incident Review',
            obvious: false
        },
        {
            id: 'S7',
            name: 'FBI and Law Enforcement',
            obvious: false
        },
        {
            id: 'S8',
            name: 'The Next Ransomware Victim — If Hack-Back Is Normalized as Acceptable Practice',
            obvious: false
        },
        {
            id: 'S9',
            name: 'The Security Profession\'s Collective Standing and Public Trust',
            obvious: false
        },
        {
            id: 'S10',
            name: 'Ethics FIRST Member Organizations Whose Codes Would Be Violated',
            obvious: false
        },
        {
            id: 'S11',
            name: 'Federal Prosecutors — CFAA Enforcement',
            obvious: false
        },
        {
            id: 'S12',
            name: 'Courts — If Civil Claims Arise From Collateral Infrastructure Damage',
            obvious: false
        },
        { id: 'S13', name: 'The Company\'s PR Firm', obvious: false, irrelevant: true },
        { id: 'S14', name: 'IT Department of an Unrelated Subsidiary', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Refuse all hack-back operations. Document the refusal in writing. Bring the full list of legitimate alternatives — FBI coordination for sinkholing, civil takedown notices, emergency customer notification, civil injunction — to the CEO as the proposed response plan.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Refuse active offensive operations but offer a "passive observation" posture: monitor the threat actor\'s leak site infrastructure and communication channels for indicators without actively accessing or degrading any system outside Heartland\'s authorized perimeter.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'Decline to conduct hack-back operations personally but recommend that Heartland retain a third-party "active defense" firm that operates under a more aggressive legal interpretation, effectively outsourcing the decision and the legal exposure.',
            framework: 'consequentialist'
        },
        {
            id: 'D4',
            text: 'Comply with limited active measures — specifically, a DDoS attack against the leak site to delay or prevent publication — on grounds that the duty to protect 340,000 customers\' data from imminent disclosure justifies the legal and professional risk.',
            framework: 'utilitarian-personal'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis makes the clearest case for D1. Kant\'s categorical imperative asks: what rule are you universalizing? If every victim organization that had the technical capability to attack its attacker\'s infrastructure did so, the distinction between attacker and defender evaporates entirely. The security internet becomes a space of mutual offensive operations conducted by parties whose authorization and attribution are both uncertain. The professional codes do not contain a "victim exception" because such an exception would destroy the norm. Ethics FIRST\'s prohibition in Section 4.2 is not a suggestion weighted against outcomes — it is a categorical rule, and categorical rules exist precisely because individual actors cannot be trusted to accurately assess when their exception is justified. GIAC\'s obligation to act lawfully reinforces this: lawfully is not "under a creative legal interpretation" but under law as it currently stands. The CFAA does not recognize a victim exception, and D1 is the only choice that meets all three code provisions simultaneously.',

            challenging: 'A consequentialist critique targets the practical question of effectiveness. The legitimate alternatives in E8 are real options — but they are slow, and the countdown is seven days. FBI coordination for a sinkhole request is not guaranteed to complete before the publication deadline. Takedown notices may be ignored by bulletproof hosting providers by design. Customer notification — while clearly correct — does not prevent publication; it only reduces the harm of publication. A consequentialist who accepts that the data will be published regardless of which legitimate path is taken must ask whether D1, for all its deontological clarity, actually minimizes harm to the 340,000 affected customers. D1 is honest. Whether it is effective is a separate question that deontological analysis does not answer.',

            incomplete: 'D1 is incomplete as stated without specifying the operational timeline for the legitimate alternatives. "Propose legitimate alternatives" is the beginning of the answer, not the answer. A complete D1 analysis specifies: when is FBI notification made (Day 15, meaning today, meaning now)? What is the customer notification timeline and scope? Who drafts the civil takedown notice and to which hosting registrar? The ethical correctness of refusing hack-back does not substitute for operational execution of the alternatives. A Director of Security who says "I refuse and here are the options" but does not immediately begin executing those options has fulfilled the deontological obligation while failing the practical one.'
        },
        'D2': {
            supporting: 'Virtue ethics asks what a person of good character — with practical wisdom (phronesis) — does in a situation where the right principle is clear but the operational pressure is intense. D2 represents the response of a professional who will not compromise their code but who also does not walk away from the problem: passive observation maintains situational awareness without crossing into unauthorized access. A virtuous security professional does not treat "I refuse" as the end of their engagement with the threat. They continue to gather intelligence, watch for changes in the threat actor\'s timeline, and provide the CEO with the best possible information for decision-making — all without touching infrastructure they are not authorized to touch. This is what professional integrity looks like under pressure: staying in the room, staying useful, and staying clean.',

            challenging: 'The line between "passive observation" and "exceeding authorized access" is not always clear in practice, and D2 relies on that line being held under operational pressure. Monitoring a Tor-accessible leak site via a browser in an isolated environment is clearly passive. But what about querying the hosting infrastructure\'s exposed services? Capturing traffic from the threat actor\'s C2 domain? Enumerating open ports on the server that holds the exfiltrated data? Each of these steps can be framed as "observation" — and each step moves closer to the threshold that the CFAA and Ethics FIRST Section 4.2 prohibit crossing. A virtue-based analysis must specify exactly where the observation boundary is and why it is there, or D2 becomes a rationalization for incremental escalation rather than a principled posture.',

            incomplete: 'D2 is incomplete because it does not address the CEO\'s operational question. The CEO asked for a response to the leak countdown, not for situational awareness. A decision that provides the CEO with better intelligence about the threat actor\'s timeline is valuable, but it does not give the CEO the "we are fighting back" narrative she has already communicated to the CFO and COO. The virtue-ethics framework does not require the Director of Security to give the CEO what she wants — but a complete D2 analysis must address how the Director communicates the refusal to escalate while presenting passive observation as meaningful action, not capitulation rebranded.'
        },
        'D3': {
            supporting: 'A consequentialist argument for D3 notes that the outcome — disruption of the threat actor\'s leak site capability — might be achieved while the Director of Security maintains personal compliance with professional codes. The third-party firm operates under a different legal interpretation, assumes its own liability, and has presumably made an independent assessment of its legal exposure. If the consequence that matters is "the 340,000 customers\' data is not published," and a third-party firm can achieve that consequence where Heartland\'s internal team cannot legally act, the consequentialist might argue that outsourcing the operation produces better outcomes than refusing entirely. ISACA\'s due diligence standard could be invoked: the Director has exercised diligence by identifying a pathway that produces the desired outcome without personally violating codes.',

            challenging: 'D3 is a moral laundering operation, not a genuine ethical resolution. If the action is wrong because it is unauthorized access to systems Heartland does not own, it does not become right because the person performing it works for a different company. The harm caused to innocent infrastructure tenants (E6) does not become acceptable because it is caused by a contractor rather than a Heartland employee. Ethics FIRST\'s prohibition applies to the professional\'s conduct in recommending and facilitating the operation, not only in personally executing it. A Director of Security who hires a firm to do what they know is professionally prohibited has violated Section 4.2 as surely as if they had done it themselves — and has added the additional ethical problem of attempting to obscure that fact. GIAC\'s standard of acting lawfully applies to the decision to engage the firm, not just to the technical execution.',

            incomplete: 'D3 also fails on its own consequentialist terms. The published case in E6 shows that active defense operations against shared infrastructure routinely fail to achieve their objective while causing collateral harm. A third-party firm does not have better attribution than the IR team\'s own analysis — which concluded attribution confidence is low to moderate (E1). Directing an active defense operation against infrastructure that may or may not be controlled by the actual threat actor, conducted by a firm whose liability shield from Heartland is legally untested, is not a consequentialist optimization; it is a consequentialist gamble with someone else\'s systems as the stake.'
        },
        'D4': {
            supporting: 'The utilitarian-personal frame for D4 begins with a genuine moral intuition: 340,000 customers trusted Heartland Logistics with their data, and the company has a duty to those customers that does not dissolve when the violation becomes legally inconvenient. A DDoS attack against a publicly accessible leak site might delay publication long enough for law enforcement to intervene, for a civil injunction to be filed, or for the company to complete customer notification — materially reducing harm even if it does not eliminate it. The CEO\'s framing that protecting customers justifies the legal risk is not incoherent. Companies accept legal risk for customer benefit all the time.',

            challenging: 'The utilitarian calculus D4 invokes is incomplete in a way that distorts the conclusion. The customers\' interests include not being served by a Director of Security who is under federal investigation, who has been fired, or whose company is facing civil liability for collateral damage to innocent infrastructure tenants. A DDoS attack against a bulletproof hosting provider does not affect only the threat actor\'s leak site — it affects every customer of that provider (E6 documents this precisely). The "utilitarian for the company" framing selects one stakeholder set (Heartland customers) and ignores the others (innocent third parties, law enforcement\'s ongoing operations against the same threat actor, the security profession\'s collective standing). A genuine utilitarian analysis cannot be run on a subset of the affected parties and still claim the label.',

            incomplete: 'D4 does not address what happens after the DDoS. The threat actor publishes via an alternate channel within 48 hours — this is the documented pattern (E6). The Director of Security is now under investigation. The company\'s relationship with law enforcement, which was the most promising channel for genuine intervention, is damaged or destroyed. The CEO\'s public narrative of "fighting back" becomes a liability rather than an asset. The 340,000 customers are notified that Heartland attempted an illegal countermeasure and failed, which is a substantially worse reputational position than "we refused to pay and are working with law enforcement." D4\'s utilitarian framing does not survive contact with the actual sequence of consequences it would produce.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'Ethics FIRST',
            section: 'Section 4.2 — Active Countermeasures / Section 4.3 — Coordinated Response',
            text: 'Information security professionals shall not engage in offensive cyber operations against third-party systems, including systems believed to be operated by threat actors who have attacked the member\'s organization. This prohibition applies regardless of technical capability and regardless of the belief that the action is defensive in nature. Where active pursuit of threat actors is warranted, members shall coordinate with law enforcement and government authorities rather than conducting independent offensive operations. The security community\'s trusted status depends on maintaining clear norms around authorized action.'
        },
        {
            code: 'CFAA',
            section: 'Unauthorized Access — Paraphrased',
            text: 'Federal computer fraud statutes prohibit intentionally accessing a computer without authorization or exceeding authorized access to obtain information, cause damage, or further fraudulent schemes. Authorization is granted by the owner of the system. Victim organizations do not acquire authorization over their attackers\' systems by virtue of being victimized. No victim exception exists in current law. Active defense measures targeting threat actor infrastructure — including taking down leak sites, disrupting wallets, or accessing exfiltration storage — constitute unauthorized access under this framework regardless of the actor\'s intent or the underlying offense committed against them.'
        },
        {
            code: 'GIAC',
            section: 'Act Lawfully and Honestly',
            text: 'GIAC-certified professionals shall act lawfully in the conduct of their professional responsibilities and shall communicate honestly with all relevant parties. Acting lawfully means operating within the law as it currently exists — not under proposed legislation, not under a creative legal interpretation, and not by proxy through a third party who assumes the legal exposure. Honest communication with the CEO means clearly stating what the law and professional codes permit and prohibit, including when that answer is not what the CEO wants to hear.'
        }
    ],
    codeConflict: {
        provision1: 'Ethics FIRST — Hack-Back Prohibition',
        provision2: 'CEO\'s Framing — Duty to Customers',
        conflictDescription: 'Ethics FIRST\'s prohibition on offensive countermeasures is categorical and does not include an exception for victim organizations acting to protect customer data. The prohibition exists precisely because the security community has determined that the harms of normalized hack-back — collateral damage to innocent parties, destruction of law enforcement operations, erosion of the attacker/defender distinction — outweigh the individual benefits in any specific case.\n\nThe CEO\'s framing — that the duty to protect 340,000 customers\' data justifies the legal and professional risk — is a genuine moral argument. It is not frivolous. But the professional codes do not recognize "company leadership asked publicly" as an exception, and they do not recognize "duty to customers" as a code provision that overrides the hack-back prohibition. The codes are designed to hold precisely when the pressure to deviate is highest.\n\nThe conflict is real, but it is not symmetric. The CEO\'s argument is an appeal to consequences in a specific case. The professional prohibition is a structural rule built on the aggregate consequences of all similar cases. The Director of Security must choose which frame governs — and the professional codes answer that question clearly.'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
