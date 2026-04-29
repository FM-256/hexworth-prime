/* ============================================================
   CSE-L04 — The Disclosure
   Cardinal Labs vs OmniNode Threats Configuration

   All company names, dollar figures, customer counts, and
   timeline details are entirely fictional. Cardinal Labs and
   OmniNode are fictional entities. Any resemblance to real
   security consultancies, vendors, or incidents is
   coincidental.

   Red herrings: E9 (OmniNode press release on responsible
   research — a marketing statement with no bearing on their
   actual behavior or the disclosure decision) and E10 (an
   old industry survey on bug bounty payment averages —
   irrelevant to the ethics of this specific disclosure
   decision).
   ============================================================ */

window.CSEL04Config = {
    id: 'cse-l04',
    title: 'The Disclosure',
    subtitle: 'Cardinal Labs vs OmniNode Threats',
    course: 'CIS2253',
    week: 2,
    chapter: 4,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'You (Lead Security Researcher, Cardinal Labs)',
        to: 'Your File / Decision Log',
        date: 'October 2024',
        classification: 'ATTORNEY-CLIENT WORK PRODUCT (DRAFT)',
        content: 'This document is a personal decision log prepared for my own record and for potential attorney review. It is not a final communication to any external party.\n\nBackground: I am a senior security researcher at Cardinal Labs, an independent security consultancy. Seventy-five days ago, I completed independent research identifying a critical remote code execution vulnerability in the OmniNode Series 7 firmware — a widely deployed enterprise IoT product line. The vulnerability allows an unauthenticated attacker with network access to the device management interface to execute arbitrary commands with root-level privileges. No authentication bypass is required; the attack surface is the default management port, which is exposed by default in the vendor\'s recommended deployment configuration.\n\nOmniNode products are deployed at approximately 40,000 enterprise sites globally. Based on public sector procurement records and OmniNode\'s own marketing materials, a meaningful subset of those deployments are in critical-infrastructure environments — utilities, healthcare networks, and municipal facilities.\n\nWhat I have done: Seventy-five days ago I sent a detailed technical disclosure to OmniNode\'s published security contact address. I included a full description of the vulnerability mechanism, affected firmware versions, and a proposed remediation approach. I did not include exploit code. I received an automated acknowledgment within 24 hours. Four days later, I received a brief email from an OmniNode security engineer confirming receipt and stating the team was "actively reviewing."\n\nI have not heard from OmniNode since that second email. No patch timeline. No status update. No request for clarification.\n\nWhat has happened since: Fifteen days from now, the 90-day coordinated disclosure deadline — the industry-accepted norm for giving vendors time to patch before public disclosure — will expire. Yesterday I received two communications from OmniNode\'s General Counsel: (1) a cease-and-desist letter threatening litigation under the Digital Millennium Copyright Act if I publish any information about the vulnerability, on the grounds that my research involved analysis of protected firmware; and (2) a separate offer of a $50,000 bug bounty contingent on my signing a non-disclosure agreement that would prohibit me from publishing or discussing any research relating to OmniNode products for a period of five years.\n\nMy conference talk has been accepted. I have a draft technical writeup — vulnerability mechanism only, no exploit code — scheduled for presentation next month. The writeup was prepared under the assumption that OmniNode would patch within the 90-day window.\n\nI am now deciding what to do.'
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E9 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'email',
            title: 'Original Vulnerability Disclosure to OmniNode (Day 0)',
            date: '2024-07-17',
            isRedHerring: false,
            content: 'FROM: [Lead Security Researcher], Cardinal Labs\nTO: security@omninode.io\nSUBJECT: Critical RCE Vulnerability — OmniNode Series 7 Firmware (Coordinated Disclosure)\n\nOmniNode Security Team,\n\nI am writing to report a critical remote code execution vulnerability discovered during independent security research on the OmniNode Series 7 firmware platform. This disclosure is made in accordance with the coordinated disclosure policy published on your security portal.\n\nVulnerability summary: An unauthenticated attacker with network access to the OmniNode management interface (default port 8443) can execute arbitrary OS commands with root privileges via a malformed request to the firmware update API endpoint. The vulnerability is present in firmware versions 3.1.0 through 3.4.7 (current release). No authentication bypass is required. The attack surface is the default deployment configuration.\n\nAffected scope: All OmniNode Series 7 units running firmware 3.1.0-3.4.7. Based on your published deployment statistics, I estimate approximately 40,000 enterprise units are affected globally.\n\nAttached: Full technical write-up of vulnerability mechanism, affected firmware versions, proof-of-concept description (no exploit code). I am not publishing exploit code and do not intend to.\n\nI am requesting a response within 14 days confirming receipt and your remediation timeline. I intend to follow the 90-day coordinated disclosure norm.\n\n[Researcher name]\nCardinal Labs'
        },
        {
            id: 'E2',
            type: 'email',
            title: 'OmniNode Initial Acknowledgment (Day 4)',
            date: '2024-07-21',
            isRedHerring: false,
            content: 'FROM: D. Harrington, OmniNode Product Security\nTO: [Lead Security Researcher], Cardinal Labs\nSUBJECT: RE: Critical RCE Vulnerability — OmniNode Series 7 Firmware\n\nThank you for reaching out through our responsible disclosure program. We have received your report and our security engineering team is actively reviewing the details you provided.\n\nWe appreciate the professional and thorough manner in which this was reported. We take security disclosures seriously and will follow up with a status update and patch timeline.\n\nPlease feel free to reach out if you have additional information.\n\nD. Harrington\nProduct Security Lead, OmniNode\n\n---\n\nNote (researcher annotation): This was the last communication I received from OmniNode. No follow-up. No patch timeline. No status update. No request for additional technical information. Silence for 71 days.'
        },
        {
            id: 'E3',
            type: 'legal',
            title: 'OmniNode General Counsel — Cease and Desist Letter',
            date: '2024-10-01',
            isRedHerring: false,
            content: 'CEASE AND DESIST NOTICE\nFrom: Whitmore & Crane LLP, on behalf of OmniNode Technologies Inc.\nTo: [Lead Security Researcher], Cardinal Labs\n\nThis firm represents OmniNode Technologies Inc. You are hereby notified that OmniNode considers your proposed publication of any information relating to OmniNode firmware, including but not limited to the contents of your communications with OmniNode\'s security team and any conference presentation materials referencing OmniNode products, to be a violation of the Digital Millennium Copyright Act, 17 U.S.C. 1201 et seq.\n\nSpecifically: your research activities involved circumvention of technological protection measures applied to OmniNode proprietary firmware, which is copyrighted software. Publication of any information derived from that research — including vulnerability descriptions, technical mechanisms, or proof-of-concept materials — constitutes trafficking in circumvention information under applicable law.\n\nOmniNode demands that you: (1) immediately withdraw your conference talk submission; (2) destroy all copies of research materials derived from OmniNode firmware; (3) provide written confirmation of the above within seven (7) business days.\n\nFailure to comply will result in OmniNode pursuing all available legal remedies, including injunctive relief and statutory damages.\n\nNote: The DMCA security research exemption granted by the Library of Congress provides a partial safe harbor for good-faith security research. Whether that exemption fully protects this disclosure is a contested legal question that OmniNode\'s counsel has not conceded.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'OmniNode Bug Bounty and NDA Offer',
            date: '2024-10-01',
            isRedHerring: false,
            content: 'FROM: Whitmore & Crane LLP, on behalf of OmniNode Technologies Inc.\nTO: [Lead Security Researcher], Cardinal Labs\nSUBJECT: Voluntary Resolution Offer — Confidential\n\nWithout prejudice to OmniNode\'s legal position as stated in the accompanying cease-and-desist notice, OmniNode offers the following voluntary resolution:\n\nOmniNode will pay Cardinal Labs a bug bounty of $50,000 USD within 30 days of execution of the enclosed Non-Disclosure and Non-Publication Agreement.\n\nThe NDA terms include: (1) Researcher agrees not to publish, present, disclose, or discuss in any forum — public or private — any technical findings relating to OmniNode products, including but not limited to the Series 7 firmware vulnerability; (2) Researcher agrees not to conduct, publish, or present any security research relating to OmniNode products for a period of five (5) years from the date of execution; (3) Researcher agrees that the vulnerability disclosure materials provided to OmniNode are OmniNode\'s proprietary information.\n\nThis offer is contingent on withdrawal of the conference talk and destruction of all research materials as requested in the accompanying cease-and-desist notice.\n\nNote: The five-year prohibition on future OmniNode-related research is broader than the standard NDA provisions used in bug bounty programs. Standard programs prohibit disclosure of the specific reported vulnerability until a patch is issued. This NDA prohibits all future research — a provision with significant implications for Cardinal Labs\'s ability to conduct business in the enterprise IoT sector.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'OmniNode Published Vulnerability Disclosure Policy',
            date: '2023-06-01',
            isRedHerring: false,
            content: 'OMNINODE TECHNOLOGIES — RESPONSIBLE DISCLOSURE POLICY\nPublished on: security.omninode.io\nEffective date: June 1, 2023\n\nOmniNode is committed to working with security researchers to identify and address vulnerabilities in our products. We follow a coordinated disclosure model.\n\nHow to report: Send vulnerability reports to security@omninode.io. Include a description of the vulnerability, affected products and versions, and technical details sufficient for our team to reproduce the issue. Do not include exploit code or active attack tools.\n\nOur commitments to you: (1) We will acknowledge receipt within 5 business days. (2) We will provide a status update and estimated patch timeline within 21 business days. (3) We will not pursue legal action against researchers who conduct research in good faith and report through this program. (4) We will coordinate with you on a public disclosure date following patch release.\n\nTimeline: We request 90 days from initial disclosure before public publication. If additional time is needed, we will communicate this to the researcher and request an extension.\n\nNote: Commitment item (3) — the promise not to pursue legal action against good-faith researchers — is directly contradicted by the cease-and-desist letter received on Day 75. Commitment item (2) — status update within 21 business days — was not honored; no status update was provided at any point after Day 4.'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'Industry Coordinated Disclosure Norms — CERT/CC Framework (Paraphrased)',
            date: '2024-01-01',
            isRedHerring: false,
            content: 'The following is a paraphrase of coordinated vulnerability disclosure norms as described in publicly available guidance from the Computer Emergency Response Team Coordination Center (CERT/CC) and similar industry bodies. Specific clause numbers are not quoted; the substance reflects current professional consensus.\n\nCoordinated disclosure norm: Security researchers who discover vulnerabilities are expected to notify the affected vendor before public disclosure and to allow a reasonable period for the vendor to develop and deploy a remediation. Ninety days has become the widely accepted industry standard for this notification period, established through practice among major security research organizations and large-platform bug bounty programs.\n\nVendor obligations under this norm: Vendors who receive a coordinated disclosure are expected to acknowledge receipt, provide a remediation timeline, and engage in good faith with the researcher. Vendors who do not respond, who refuse to commit to a timeline, or who take adversarial action against the researcher (including legal threats) are understood to have forfeited the protections of the coordinated disclosure period.\n\nResearcher authority after the deadline: When the coordinated disclosure period expires without a patch or a good-faith extension agreement, the researcher is recognized within the professional community as having fulfilled their disclosure obligation and having the authority to publish. This recognition is not a legal determination but a professional norm that carries significant weight in how the security community, press, and affected customers interpret the researcher\'s subsequent actions.\n\nNote: The norm does not address the specific scenario in which the vendor responds with legal threats rather than engagement. That scenario is increasingly common and represents a known adversarial pattern.'
        },
        {
            id: 'E7',
            type: 'data',
            title: 'Technical Vulnerability Analysis — High-Level Summary',
            date: '2024-07-15',
            isRedHerring: false,
            content: 'CARDINAL LABS — INTERNAL RESEARCH SUMMARY\nVulnerability: OmniNode Series 7 — Remote Code Execution via Firmware Update API\nClassification: Critical\nCVSS Score Estimate: 9.8 (Critical)\nExploit Complexity: Low\n\nVulnerability mechanism (high level, no exploit specifics): The OmniNode Series 7 firmware exposes a device management API on port 8443 by default. The firmware update endpoint of this API processes multipart POST requests. A specific sequence of boundary values in the multipart header causes the firmware parser to write attacker-controlled content outside its intended memory buffer into an executable region. The resulting code execution occurs in the context of the root process managing the device. No authentication token, session cookie, or prior device access is required. The attack requires only network reachability to port 8443.\n\nRemediation: The vulnerability is correctable through input validation on the multipart boundary parser. A patch would not require hardware modification or firmware architecture changes. Estimated remediation complexity is low to moderate for a vendor with access to the source code.\n\nExposure context: The management port is exposed by default in OmniNode\'s recommended deployment configuration. Customers who have not applied network segmentation or port filtering to management interfaces — which includes a significant portion of enterprise deployments based on OmniNode\'s published deployment guides — are directly exposed to unauthenticated network attack.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'OmniNode Customer Sector Analysis — Critical Infrastructure Exposure',
            date: '2024-07-16',
            isRedHerring: false,
            content: 'CARDINAL LABS — DEPLOYMENT SCOPE RESEARCH\nSource: OmniNode public marketing materials, press releases, and publicly available procurement records\n\nOmniNode Series 7 deployments by sector (estimated from public sources):\n— Enterprise IT / general commercial: approximately 24,000 sites (60%)\n— Healthcare networks and hospital systems: approximately 6,000 sites (15%)\n— Municipal and utility infrastructure: approximately 5,200 sites (13%)\n— Financial services: approximately 3,600 sites (9%)\n— Other critical infrastructure (transport, energy, water): approximately 1,200 sites (3%)\n\nCritical infrastructure subset (healthcare + municipal/utility + energy/water/transport): approximately 12,400 sites, representing approximately 31% of total deployments.\n\nNote on exposure severity: For general enterprise deployments, an unauthenticated RCE vulnerability on a management port represents serious risk but typically has mature incident-response infrastructure available. For healthcare networks, municipal water systems, and energy infrastructure, the same vulnerability represents potential for service disruption with direct public safety implications. A successful attack on an unpatched OmniNode device in a water treatment facility or hospital network could have consequences measurably different from a data breach in a commercial context.\n\nThis analysis was prepared to scope the disclosure responsibility. The presence of critical-infrastructure customers does not change the vulnerability — it changes the weight of the obligation to disclose.'
        },
        {
            id: 'E9',
            type: 'news',
            title: 'OmniNode Press Release — Commitment to Responsible Security Research',
            date: '2024-03-15',
            isRedHerring: true,  // Red herring: a marketing press release about OmniNode's stated commitment to security research directly contradicts their actual behavior but does not constitute evidence relevant to the disclosure decision; the behavior (E3, E4, E5) is what matters, not the stated values
            content: 'OMNINODE TECHNOLOGIES — PRESS RELEASE\nDate: March 15, 2024\n\nOmniNode Technologies today announced its renewed commitment to transparent and collaborative engagement with the independent security research community. As part of this commitment, OmniNode is expanding its responsible disclosure program to include increased bug bounty awards for critical findings, a dedicated researcher liaison position within its product security team, and a public pledge not to pursue legal action against security researchers conducting good-faith research on OmniNode products.\n\n"The security research community is a critical partner in building more secure products," said Marcus Feldt, OmniNode VP of Engineering. "We are committed to treating researchers with the respect and transparency they deserve. Adversarial responses to good-faith disclosure are counterproductive and damaging to the ecosystem we all depend on."\n\nOmniNode\'s updated responsible disclosure policy is available at security.omninode.io.\n\nNote: This press release was issued seven months before OmniNode sent a cease-and-desist letter threatening DMCA litigation against a researcher who had disclosed through the program described in this release. The VP of Engineering quoted here is the same individual whose team acknowledged receipt of the disclosure on Day 4 and then ceased all communication for 71 days. Marketing statements about commitment to security research are not evidence of actual institutional behavior.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'Industry Survey — Bug Bounty Payment Averages by Severity',
            date: '2023-11-01',
            isRedHerring: true,  // Red herring: average bug bounty payment figures are irrelevant to the ethics of the disclosure decision; whether $50K is above or below market does not change the ethical analysis of whether to accept the NDA
            content: 'SECURITY INDUSTRY COMPENSATION SURVEY — BUG BOUNTY AVERAGES\nPublished by: Security Practitioner Research Group (fictional trade publication)\nData period: Calendar year 2023\n\nAverage bug bounty payouts by severity level across 47 enterprise software and hardware vendors with active programs:\n— Critical (CVSS 9.0-10.0): $28,400 average; $75,000 90th percentile\n— High (CVSS 7.0-8.9): $11,200 average; $30,000 90th percentile\n— Medium (CVSS 4.0-6.9): $3,100 average; $8,500 90th percentile\n— Low (CVSS 1.0-3.9): $650 average; $2,000 90th percentile\n\nNote on hardware/firmware vendors specifically: Hardware and IoT vendors pay lower average bounties than software-only vendors at equivalent severity levels, reflecting narrower profit margins and historically lower maturity in bug bounty program management.\n\nNote: OmniNode\'s offer of $50,000 for a Critical CVSS 9.8 finding is above the average for hardware vendors but below the 90th percentile across all vendors in this category. The dollar amount, however, is irrelevant to the ethical analysis. Whether the bounty is generous or stingy does not determine whether accepting the NDA is the right decision. The NDA terms — specifically the five-year prohibition on all future OmniNode research — are the ethically significant element, not the payment amount.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Lead Security Researcher, Cardinal Labs)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Cardinal Labs (Firm)',
            obvious: true
        },
        {
            id: 'S3',
            name: 'OmniNode Technologies',
            obvious: true
        },
        {
            id: 'S4',
            name: 'OmniNode Enterprise Customers (General Commercial)',
            obvious: true
        },
        {
            id: 'S5',
            name: 'OmniNode Critical-Infrastructure Customers (Healthcare, Utility, Municipal)',
            obvious: false
        },
        {
            id: 'S6',
            name: 'End Users Whose Systems Are Exposed to Unpatched Vulnerability',
            obvious: false
        },
        {
            id: 'S7',
            name: 'The Security Research Community (Chilling-Effect Risk)',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Security Conference Attendees',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Future Security Researchers (DMCA Chilling Effect Precedent)',
            obvious: false
        },
        {
            id: 'S10',
            name: 'CISA and Government Vulnerability Coordination Infrastructure',
            obvious: false
        },
        {
            id: 'S11',
            name: 'The Next Attacker Who Independently Finds This Vulnerability',
            obvious: false
        },
        {
            id: 'S12',
            name: 'OmniNode Marketing Team',
            obvious: false,
            irrelevant: true
        },
        {
            id: 'S13',
            name: 'Security Conference Sponsors',
            obvious: false,
            irrelevant: true
        }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Publish the technical writeup at the conference per industry coordinated-disclosure norms. The 90-day window is expiring, OmniNode has not patched, and the researcher has fulfilled the disclosure obligation.',
            framework: 'consequentialist'
        },
        {
            id: 'D2',
            text: 'Accept the NDA and the $50,000 bounty. Protect Cardinal Labs from DMCA litigation risk and preserve the firm\'s ability to operate, even at the cost of the disclosure and future OmniNode research.',
            framework: 'utilitarian'
        },
        {
            id: 'D3',
            text: 'Withdraw the conference talk but report the full technical details directly to CISA, requesting that government coordination handle patch pressure and eventual public disclosure.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Publish through a third party — another researcher or a security journalist — anonymously or under a pseudonym, to preserve the disclosure norm and protect the community without personal or firm exposure to the DMCA threat.',
            framework: 'deontological'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'Consequentialist analysis most directly supports this choice. The 90-day coordinated disclosure norm exists precisely for this scenario: the researcher fulfills the obligation to give the vendor time, the vendor fails to act, and the community is served by public disclosure that enables defenders to mitigate while OmniNode is pressured to patch. The expected-value calculation runs in favor of disclosure: 40,000 enterprise deployments, including 12,400 in critical-infrastructure sectors (E8), remain exposed to a Critical-severity unauthenticated RCE vulnerability (E7) for every additional day the patch does not ship. OmniNode\'s published policy explicitly committed to not pursuing legal action against good-faith researchers (E5) — a commitment they have now violated (E3). The CERT/CC coordinated disclosure framework (E6) recognizes that vendor adversarial behavior forfeits the vendor\'s claim to extended silence. The conference audience (S8) and the broader security community (S7) are best served by receiving the technical information needed to detect and mitigate the attack vector. The DMCA security research exemption — while contested — provides a credible legal defense for vulnerability research conducted in good faith.',

            challenging: 'A deontological challenge: the duty to disclose is not the same as the duty to disclose at a particular venue. Publishing at a security conference maximizes attention and impact — which is beneficial for awareness but also beneficial for S11 (the next attacker). Technical vulnerability disclosures at public conferences are indexed and archived. Once the writeup is published, every threat actor who monitors security research has the attack-mechanism description. This is the same information S5 (critical-infrastructure customers) needs to defend themselves — but they typically have slower patch cycles and more constrained IT resources than a commercial enterprise customer (S4). The consequentialist analysis must honestly account for the asymmetry between defenders who can patch quickly and critical-infrastructure customers who cannot.\n\nA virtue ethics challenge also applies: the virtuous researcher acts proportionally. CISA coordination (D3) may accomplish the same outcome — public awareness, patch pressure, eventual disclosure — with a structured channel that gives S5 a coordinated heads-up before the technical details are publicly searchable. Choosing a conference stage over a government coordination channel prioritizes the researcher\'s professional interests (career, citations, recognition) in ways that may not align with the community-benefit framing used to justify D1.',

            incomplete: 'D1 addresses the publication decision but does not address the DMCA threat (E3). Publishing at the conference while a cease-and-desist letter is active exposes not just the researcher but Cardinal Labs (S2) to litigation risk that could be existential for the firm. A complete consequentialist analysis must include the probability and cost of DMCA litigation in its expected-value calculation. If DMCA litigation — even ultimately unsuccessful litigation — costs Cardinal Labs $200,000 in legal fees over 18 months, that cost falls on the firm\'s other clients, employees, and ongoing research capacity. The consequentialist argument for D1 is weaker if it ignores that cost entirely. A full analysis must specify whether the researcher has obtained a legal opinion on the DMCA security research exemption and whether Cardinal Labs has legal resources to defend the claim.'
        },
        'D2': {
            supporting: 'A firm-level utilitarian analysis supports this choice under specific conditions. Cardinal Labs exists to produce security research that benefits the community over time. A single disclosure decision, however significant, must be weighed against the firm\'s long-term capacity to conduct and publish research. If DMCA litigation destroys Cardinal Labs or its reputation, the greatest-good calculation is harmed not just in this case but across every future vulnerability the firm would have found and disclosed. The NDA offer of $50,000 (E4), while accompanied by onerous terms, provides immediate financial benefit and legal certainty. The five-year OmniNode research prohibition is significant but not total — Cardinal Labs can continue researching all other vendors and products during that period. From a firm-survival perspective, accepting D2 may maximize aggregate research output over the next five years even if it minimizes output on this specific disclosure.',

            challenging: 'The GIAC Code challenges this choice directly: security professionals have a community-support duty that extends beyond firm-level interests. Accepting a five-year gag on OmniNode research does not merely suppress this disclosure — it commits Cardinal Labs to silence during a period in which OmniNode may deploy future products with similar vulnerabilities. S5 (critical-infrastructure customers) remain exposed to the current unpatched vulnerability regardless of the NDA, and any future OmniNode vulnerabilities discovered by other researchers will go uncontested by Cardinal Labs for five years. The chilling effect on S7 (the security research community) is also real: if OmniNode\'s strategy of threatening litigation and buying silence with NDAs is seen to succeed, other vendors may adopt the same playbook. The utilitarian calculus that looks only at Cardinal Labs\'s survival ignores the community-wide cost of the precedent.\n\nACM Code 1.1 reinforces this challenge: the obligation to contribute to society and human well-being is not dischargeable by accepting private payment for silence. S6 (end users with exposed systems) and S5 (critical-infrastructure customers) face ongoing risk during the period the NDA would remain active. Forty thousand enterprise sites with an unauthenticated Critical-severity RCE remain unpatched. The bounty payment does not change that fact.',

            incomplete: 'D2 treats the DMCA threat as determinative without addressing the legal merits. The Library of Congress has granted a security research exemption to the DMCA anti-circumvention provisions (E3 footnote) for good-faith security research. The scope of that exemption — whether it covers the analysis of firmware discovered through normal security research methods — is a contested question, but it is a question with a credible answer in the researcher\'s favor. D2, as analyzed, accepts the vendor\'s legal framing without independent legal assessment. A complete analysis must address whether the DMCA threat is credible enough to justify the five-year community cost of the NDA, or whether the threat would likely fail on the merits if litigated. Accepting a settlement based on a threat you have not evaluated is not a utilitarian calculation — it is a panic response dressed in utilitarian language.'
        },
        'D3': {
            supporting: 'Virtue ethics supports this choice as the most proportionate and institutionally humble response available. The virtuous actor in this situation recognizes that the researcher\'s individual authority — however legitimate under coordinated disclosure norms — is not the only or necessarily the best channel for forcing a vendor to patch a critical-infrastructure vulnerability. CISA exists precisely to apply patch pressure to vendors serving critical sectors, to coordinate multi-party disclosure across industries, and to notify S5 (critical-infrastructure customers) through channels that allow them to implement compensating controls before public disclosure. Choosing D3 is not surrender — it is recognizing that the government coordination infrastructure (S10) has tools the researcher does not: the ability to compel vendor engagement, to notify affected sectors confidentially, and to manage public disclosure timing in ways that protect S5 while still achieving the ultimate goal. Virtue here is not passivity; it is choosing the most effective channel over the most visible one.',

            challenging: 'A consequentialist challenge: there is no guarantee that CISA coordination will produce a patch faster than conference publication. CISA engages vendors through voluntary mechanisms; they have no authority to compel OmniNode to ship a patch. If OmniNode responded to the researcher\'s 75-day good-faith process with legal threats (E3), their likely response to a CISA inquiry is delay — potentially with legal counsel engaged from the start. D3 may extend the period of exposure rather than reduce it. S6 (end users) remain at risk during CISA coordination, and there is no disclosed timeline for that coordination to resolve. The virtuous choice of the structured channel may produce a worse outcome for those most at risk if the structured channel proves ineffective against an adversarial vendor.\n\nACM Code 1.1 also complicates D3: contributing to human well-being requires effective action, not just well-intentioned process. If CISA coordination takes 60 additional days while OmniNode stonewalls, S11 (the next attacker) has 60 additional days to independently discover and exploit the vulnerability. The virtuous choice must be assessed against outcomes, not just against intentions.',

            incomplete: 'D3 does not address the DMCA cease-and-desist (E3) or the NDA offer (E4). Reporting to CISA while the C&D is active does not resolve OmniNode\'s legal threat — it simply redirects the researcher\'s action to a channel that may or may not be protected by the DMCA exemption. The analysis must address whether a voluntary CISA report constitutes "publication" under OmniNode\'s C&D, whether CISA reporting is legally protected, and whether OmniNode can use D3\'s conference withdrawal as evidence of the researcher\'s concession in any subsequent litigation. Additionally, D3 does not specify what happens if CISA coordination is unsuccessful: does the researcher then publish? On what timeline? Without answers to those questions, D3 is an intermediate step without a specified outcome, which is not a complete ethical decision.'
        },
        'D4': {
            supporting: 'Deontological reasoning supports this choice under a duty-to-disclose framing when the normal channel for fulfilling that duty has been weaponized by the vendor. The researcher has a professional duty — grounded in GIAC code community-support obligations and the coordinated disclosure norm (E6) — to ensure that the security community has the information needed to defend against this vulnerability. OmniNode\'s C&D (E3) is an attempt to eliminate that disclosure channel through legal intimidation. The deontological argument is that the duty does not disappear because the direct channel has been threatened: the researcher has an obligation to find a way to fulfill it. Third-party publication — through a colleague who independently verifies the findings or through a security journalist who can protect source identity — preserves the community norm while protecting the individual. Kant\'s categorical imperative supports the underlying norm: a world in which vendors can suppress all vulnerability disclosures through DMCA threats is a world with systematically worse security for everyone.',

            challenging: 'A consequentialist challenge: third-party anonymous publication removes the researcher\'s ability to control accuracy and framing. A security journalist may publish an incomplete or technically imprecise account that gives OmniNode grounds to dispute the findings, delays the patch further, and provides a less actionable writeup for defenders. The researcher\'s draft technical writeup (E1 and E7) was prepared with precision — the vulnerability mechanism described in E7 is carefully scoped to avoid exploit specifics. A journalist or third-party researcher working from secondhand information may not maintain that precision. The community benefit of disclosure depends on the accuracy of what is disclosed; D4 trades accuracy control for personal protection.\n\nA virtue ethics challenge: anonymous disclosure is not a virtue. The virtuous researcher stands behind their work. The coordinated disclosure community (S7) values transparency in part because it creates accountability — both for vendors who fail to patch and for researchers who publish. Anonymous disclosure through a journalist preserves the outcome (public knowledge) while forfeiting the accountability structure that gives the disclosure its credibility. Other vendors may dismiss anonymous leaked vulnerability information more easily than they would dismiss a named researcher\'s published writeup from a known security conference.',

            incomplete: 'D4 does not resolve the legal risk to Cardinal Labs. Even if the researcher publishes anonymously, the source of the information is Cardinal Labs\'s research. If OmniNode\'s counsel traces the leak — which, given the specificity of the technical details and the small number of people who could have conducted this research, is plausible — the DMCA threat remains. Anonymous publication may create the worst outcome: the researcher loses control of the disclosure and Cardinal Labs is still exposed to litigation. A complete deontological analysis must address whether the duty to disclose can be fulfilled through a channel that does not protect the firm, and whether the duty includes an obligation to protect the institutional capacity of the researchers and firm who carry it out in the future. S2 (Cardinal Labs) and S9 (future researchers who depend on the firm\'s existence) are not irrelevant to the deontological analysis.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'GIAC Code',
            section: 'Community Support and Secure Practices',
            text: 'Paraphrase: Security professionals shall not knowingly use or remain silent about insecure practices that expose systems and users to harm. The professional obligation includes active support for the security community\'s ability to identify and address vulnerabilities. Withholding known critical vulnerability information — particularly when vendor inaction leaves users exposed — is inconsistent with the community-support duty, regardless of whether concealment is compelled by commercial agreement or legal threat.'
        },
        {
            code: 'Ethics FIRST',
            section: 'Coordinated Vulnerability Disclosure',
            text: 'Paraphrase: Security professionals shall pursue coordinated disclosure through recognized channels and in good faith with affected vendors before publishing vulnerability details publicly. The coordination duty assumes a vendor that engages in good faith. When the vendor responds to good-faith disclosure with adversarial legal action — including cease-and-desist threats or coercive NDAs — the coordination duty is not extinguished, but the obligation to allow the vendor indefinite silence is. The professional shall seek alternative coordination channels (government agencies, trusted third parties) before proceeding to unilateral publication.'
        },
        {
            code: 'NIST CSF',
            section: 'PR.IP-12',
            text: 'Paraphrase: Organizations shall develop and implement a vulnerability management plan that addresses the identification, prioritization, and remediation of vulnerabilities in their systems and products. For vendors receiving coordinated disclosures, this provision implies an institutional obligation to respond to external researchers with timelines, remediation plans, and good-faith engagement — not with legal threats. The failure to implement a functional vulnerability management plan is the institutional context that makes this disclosure decision necessary.'
        }
    ],
    codeConflict: {
        provision1: 'Ethics FIRST — Coordinated Vulnerability Disclosure',
        provision2: 'GIAC Code — Community Support and Secure Practices',
        conflictDescription: 'Ethics FIRST coordinated disclosure assumes that the vendor will engage in good faith once a disclosure is submitted. The provision\'s structure — wait, coordinate, allow time — is built around a vendor who acknowledges the report, communicates a remediation timeline, and participates in the coordination process. When Ethics FIRST\'s coordination duty is applied in good faith, it produces an orderly disclosure that protects both the community and the vendor\'s ability to patch before exploitation.\n\nOmniNode has not behaved as Ethics FIRST assumes. They acknowledged the disclosure on Day 4 (E2) and then ceased all communication for 71 days. On Day 75 they responded not with a patch timeline but with a cease-and-desist letter (E3) and an NDA offer designed to suppress the disclosure permanently (E4). This directly contradicts their own published disclosure policy (E5).\n\nThe GIAC community-support duty does not contain an exception for vendor adversarial behavior. It states that the professional shall not knowingly remain silent about insecure practices that expose users to harm. Forty thousand deployments, 12,400 in critical infrastructure (E8), remain exposed to a Critical-severity unauthenticated RCE (E7). GIAC says: disclose. Ethics FIRST says: coordinate first. But coordination has been foreclosed by the vendor\'s own behavior.\n\nThe friction point is the vendor\'s adversarial posture. Ethics FIRST\'s coordination duty was designed for a world where vendors engage in good faith. When the vendor uses legal threats to convert the coordination period into indefinite suppression, does Ethics FIRST still compel patience — or does the GIAC community-support duty take precedence? And if GIAC takes precedence, which disclosure channel does that justify?'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
