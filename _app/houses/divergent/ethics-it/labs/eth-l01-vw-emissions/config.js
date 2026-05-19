/* ============================================================
   ETH-L01 — The Defeat Device
   VW Emissions Scandal Case Room Configuration

   All factual content is sourced from publicly documented
   events in the Volkswagen emissions scandal (2008-2019):
   EPA notice of violation September 18, 2015; DOJ settlement
   January 2017; $14.7B consumer settlement; 11 million vehicles
   worldwide; NOx emissions up to 40x the US legal limit; and
   the subsequent criminal convictions and civil judgments.

   Red herrings: E5 (fuel economy brochure, true but
   legally separate from the defeat device question) and
   E9 (European emissions standards being higher than US --
   true but irrelevant to the legal and ethical violation
   under US law at the time of discovery).
   ============================================================ */

const ETHL01Config = {
    id: 'eth-l01',
    title: 'The Defeat Device',
    subtitle: 'Volkswagen Emissions Scandal',
    course: 'CIS4253',
    week: 1,
    chapter: 1,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'Internal Engineering Quality Assurance',
        to: 'You (Senior Software Engineer, Emissions Control Systems)',
        date: 'August 2015',
        classification: 'CONFIDENTIAL -- INTERNAL ONLY',
        content: 'You joined VW\'s powertrain software team three years ago, recruited directly out of your master\'s program. You believe in clean energy, in engineering that serves people. You accepted this job because VW marketed itself as the environmental leader in diesel technology -- the company that solved clean diesel.\n\nYou have been running a cross-system audit of the EA189 diesel engine software at the request of your direct manager. What you found is not a bug. It is not an accidental edge case.\n\nThe engine control unit (ECU) software actively detects when the vehicle is being operated on a government dynamometer test cycle -- measuring steering input, wheel speed, ambient pressure, and driving profile. When the test is detected, the software activates full emissions controls: exhaust gas recirculation runs at maximum, urea injection (AdBlue) is fully operational, and nitrogen oxide output meets the EPA legal limit of 0.07 grams per mile.\n\nWhen the test is not detected, these controls are reduced substantially. Nitrogen oxide output under normal driving conditions reaches between 10 and 40 times the legal limit depending on driving mode and load.\n\nThis software has been running in production across the EA189 engine family since the 2009 model year. According to internal records you can access, the defeat device was authorized by senior management in 2008 as a commercial necessity: full emissions compliance in normal driving conditions would reduce fuel efficiency and performance to levels below what the company had promised customers in its marketing.\n\nThere are approximately 480,000 affected vehicles in the United States. Worldwide, the number is approximately 11 million.\n\nYou are not the person who designed this. You are not the person who authorized it. But you now know, in full, what it is and what it does.\n\nYou have not yet reported your findings. Your manager is expecting your audit summary by end of week. You do not know if your manager already knows. You do not know how far up the chain this decision was made.',
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'email',
            title: 'Engine ECU Software Release Authorization',
            date: '2008-11-04',
            isRedHerring: false,
            content: 'FROM: Dr. Heinz Mostertz, VP Powertrain Engineering\nTO: EA189 Development Team\n\nAfter review of the emissions-performance tradeoff analysis submitted last week, management has approved the use of an adaptive drive cycle detection algorithm in the EA189 ECU baseline. This approach resolves the conflict between US EPA compliance during type-approval testing and the performance/efficiency targets required for our TDI marketing commitments.\n\nThis decision is final. Implementation is to proceed on the production timeline. Documentation of this feature is to remain within the engineering team. This authorization email is not to be distributed outside your group.\n\nDr. Mostertz'
        },
        {
            id: 'E2',
            type: 'testimony',
            title: 'EPA Notice of Violation -- September 18, 2015',
            date: '2015-09-18',
            isRedHerring: false,
            content: 'The United States Environmental Protection Agency issued a Notice of Violation to Volkswagen AG, Audi AG, and Volkswagen Group of America, Inc. today, informing the companies that they are alleged to have violated the Clean Air Act.\n\nSpecifically, EPA has determined that the software used by Volkswagen is a defeat device as defined under 40 C.F.R. 86.1809-01. A defeat device is any auxiliary emission control device that reduces the effectiveness of the emission control system under conditions which may reasonably be expected to be encountered in normal vehicle operation and use.\n\nAffected vehicles include approximately 482,000 diesel vehicles sold in the US from model years 2009-2015. During normal driving, these vehicles emit nitrogen oxides at levels 10 to 40 times higher than the federal standard.\n\nEPA is ordering Volkswagen to recall all affected vehicles and bring them into compliance. Civil penalties may apply.'
        },
        {
            id: 'E3',
            type: 'data',
            title: 'West Virginia University Study -- Emissions Discrepancy',
            date: '2014-05-22',
            isRedHerring: false,
            content: 'REPORT: Real-World Evaluation of the NOx Emission Performance of a Diesel Passenger Car\nInternational Council on Clean Transportation, in partnership with West Virginia University Center for Alternative Fuels, Engines, and Emissions\n\nKey finding: On-road NOx emissions measured via portable emissions measurement system (PEMS) exceed laboratory measurements by a factor of 5 to 35 for the VW Jetta TDI and a factor of 10 to 40 for the VW Passat TDI, depending on driving conditions.\n\nNote: European-equivalent diesel vehicles tested by the same methodology showed similar on-road discrepancies. The researchers initially attributed the discrepancy to difference between real-world and laboratory driving conditions. Subsequent data analysis suggested the discrepancy was too consistent and mode-specific to be explained by driving cycle differences alone, prompting further investigation by the EPA.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'Clean Air Act -- 40 C.F.R. 86.1809 Definition of Defeat Device',
            date: '1999-01-01',
            isRedHerring: false,
            content: 'Sec. 86.1809-01 Defeat devices.\n\n(a) No new light-duty vehicle, light-duty truck, or medium-duty passenger vehicle may be equipped with a defeat device.\n\n(b) Defeat device is defined as any device that senses or detects a test situation (e.g., cold start, test cycle, ambient temperature range, or speed range) and produces a response that is different from normal vehicle operation, where such response reduces the effectiveness of the emission control system.\n\n(c) An auxiliary emission control device is not a defeat device if the manufacturer demonstrates that such a device is not designed to defeat the emission control system, and the device is needed for protection of the engine from damage or accident.\n\nNote: Section (c) was the defense VW initially attempted to construct. EPA rejected this argument based on the breadth and specificity of the detection algorithm.'
        },
        {
            id: 'E5',
            type: 'news',
            title: 'VW TDI Consumer Brochure -- Fuel Economy Claims',
            date: '2013-03-01',
            isRedHerring: true,  // Red herring: fuel economy claims are a separate consumer fraud matter, not the core defeat device ethics question
            content: 'VW CLEAN DIESEL -- PERFORMANCE. EFFICIENCY. RESPONSIBILITY.\n\nThe Golf TDI achieves an EPA-estimated 42 MPG highway. The Passat TDI achieves 43 MPG highway. These figures are the result of VW\'s advanced TDI clean diesel technology, which achieves best-in-class fuel economy while meeting stringent US emissions standards.\n\nNote: This document represents a consumer marketing claim. The fuel economy figures cited are derived from EPA test cycle measurements. The emissions compliance claim ("meeting stringent US emissions standards") was made while the defeat device was operational. This document has been used as evidence in consumer fraud litigation but is legally distinct from the Clean Air Act violation, which is the primary legal and ethical focus of this case.'
        },
        {
            id: 'E6',
            type: 'testimony',
            title: 'Congressional Testimony -- Former VW CEO Michael Horn',
            date: '2015-10-08',
            isRedHerring: false,
            content: 'TESTIMONY TO THE HOUSE ENERGY AND COMMERCE COMMITTEE\n\nChairman Upton, Ranking Member Pallone, members of the committee: I am Michael Horn, President and CEO of Volkswagen Group of America.\n\nLet me be clear about one thing: Volkswagen did not act in a manner consistent with our stated values. We have broken the trust of our customers, dealerships, and employees, as well as the public and regulators. For that, I am truly sorry.\n\nThe decision to deploy the defeat device software was not mine. I was told this was a technical issue during the development process. I was told it had been resolved by 2014. I was wrong to accept that explanation without further inquiry.\n\n[Note: Horn was later found by internal VW investigation to have been informed of potential emissions issues in a 2014 internal meeting. He resigned in January 2016. This testimony is relevant to the question of who in the organization knew what, and when.]'
        },
        {
            id: 'E7',
            type: 'memo',
            title: 'Internal VW Communication -- EPA Investigation Response Plan',
            date: '2015-09-19',
            isRedHerring: false,
            content: 'TO: Crisis Management Team\nFROM: Legal Affairs\nDATE: September 19, 2015 (one day after EPA Notice of Violation)\n\nInitial response strategy:\n\n1. We have retained Sullivan and Cromwell as external counsel. All internal communications relating to the EA189 emissions software from 2007 onward are subject to litigation hold effective immediately.\n\n2. Communications team is to make no technical statements about the software. All media inquiries are to be routed to Legal Affairs.\n\n3. Engineering team is to identify the minimum scope of recall and remediation options. The goal is a software update that brings vehicles into compliance with minimum performance degradation.\n\n4. No internal document referencing "defeat device," "drive cycle detection," or "AEC mode" is to be created from this point forward without Legal Affairs review.\n\nNote: This document was produced in discovery proceedings. The legal hold instruction in item 1 was complied with; however, investigators determined that prior to the hold, some internal communications were deleted.'
        },
        {
            id: 'E8',
            type: 'legal',
            title: 'DOJ Criminal Plea Agreement -- VW AG',
            date: '2017-01-11',
            isRedHerring: false,
            content: 'Volkswagen AG has agreed to plead guilty to three felony counts: conspiracy to defraud the United States, wire fraud, and violation of the Clean Air Act.\n\nThe agreed criminal fine is $2.8 billion.\n\nIn addition, Volkswagen has agreed to a civil settlement of $1.5 billion with US state and federal regulators, and a separate civil settlement of $10.03 billion with US vehicle owners who were defrauded.\n\nSix VW employees and executives were indicted on criminal charges. Oliver Schmidt, VW\'s head of US environmental and engineering office, pleaded guilty in 2017 to two felony counts and was sentenced to seven years in federal prison.\n\nFive other VW executives remain outside the United States and have not appeared to face charges as of this writing.\n\nNote: The total US penalty exposure for Volkswagen exceeded $14.7 billion. Additional penalties were imposed by regulators in Germany, Canada, Australia, and South Korea.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'European vs. US Emissions Standards Comparison',
            date: '2015-01-01',
            isRedHerring: true,  // Red herring: Euro 6 vs EPA standards comparison is irrelevant -- VW violated US law, and EU standards were later found to have similar problems
            content: 'US EPA TIER 2 BIN 5 NOx limit: 0.07 g/mile\nEURO 6 NOx limit: 0.08 g/km (approx. 0.13 g/mile)\n\nNote: The European standard was less strict than the US standard at the time of the VW scandal discovery. This comparison is frequently cited to argue that VW was attempting to meet a standard stricter than European equivalents.\n\nHowever, this comparison does not mitigate the defeat device violation because: (1) VW knowingly deployed software to falsify test results, which is fraudulent regardless of the underlying standard; (2) European regulators subsequently found that similar defeat device logic was deployed in vehicles sold in Europe; and (3) the ethical obligation to accurately represent what your product does to regulators and consumers is not contingent on the stringency of the standard.'
        },
        {
            id: 'E10',
            type: 'testimony',
            title: 'Public Health Analysis -- NOx Exposure in Affected Communities',
            date: '2015-10-15',
            isRedHerring: false,
            content: 'ENVIRONMENTAL DEFENSE FUND TECHNICAL ANALYSIS\n\nEstimated cumulative NOx emissions from affected VW diesel vehicles in the United States from 2009-2015:\n\nApproximately 46,667 tons of excess nitrogen oxide emissions were discharged into the environment during this period, based on the discrepancy between test-cycle emissions and real-world on-road measurements.\n\nHealth impact modeling based on EPA and WHO methodologies estimates that this level of excess NOx exposure contributed to approximately 59 premature deaths in the United States over the same period, along with an estimated 31 cases of chronic bronchitis and over 120,000 minor restricted-activity days per year.\n\nNitrogen oxides are a significant precursor to ground-level ozone formation and are directly linked to respiratory disease. Communities near heavily trafficked urban corridors -- disproportionately lower-income communities and communities of color -- experienced higher concentrations of excess NOx exposure.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'VW Software Engineers',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Vehicle Owners Who Were Defrauded',
            obvious: true
        },
        {
            id: 'S3',
            name: 'EPA and US Regulators',
            obvious: true
        },
        {
            id: 'S4',
            name: 'VW Shareholders',
            obvious: true
        },
        {
            id: 'S5',
            name: 'VW Dealerships and Sales Staff',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Competing Automakers Who Complied With Standards',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Communities With Elevated NOx Exposure Near High-Traffic Roads',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Future Emissions Regulators and the Credibility of Type-Approval Testing',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Engineers Who Might Face Criminal Liability',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The German Government and EU Industrial Policy',
            obvious: false
        },
        { id: 'S11', name: 'VW Formula 1 Racing Division', obvious: false, irrelevant: true },
        { id: 'S12', name: 'German Tourism Industry', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Report the defeat device directly to the EPA as a whistleblower, bypassing your manager and VW management entirely.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Escalate internally to the VW board of directors or general counsel first, demanding an internal recall plan before any external disclosure.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'Complete your audit summary as directed, submit it to your manager, and take no further independent action -- trusting the organization to handle the findings.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D4',
            text: 'Leak the technical details anonymously to the research team at West Virginia University or to a journalist covering the automotive industry.',
            framework: 'consequentialist'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis strongly supports this choice. Kant\'s categorical imperative asks: what if every engineer who discovered fraud in their organization\'s product acted as you are about to act? If universalized, whistleblowing in cases of public harm creates a world where harmful deceptions are systematically exposed. You also have a duty-based obligation under the ACM Code of Ethics Section 1.2 ("avoid harm") and Section 2.5 ("give comprehensive and thorough evaluations of computer systems and their impacts"). Your professional codes do not contain an exception for personal career risk. Reporting to the EPA is also protected under the Clean Air Act\'s whistleblower provisions (42 U.S.C. 7622), which provide significant legal shelter for employees who report violations.',

            challenging: 'A consequentialist critique challenges the binary framing of this decision. Direct EPA disclosure without internal escalation maximizes short-term transparency but minimizes the probability of the optimal outcome. Consider: the EPA investigation process will take months or years. During that time, VW continues to sell affected vehicles. A coordinated internal disclosure -- where VW simultaneously announces a recall, halts sales, and proposes a remediation plan -- achieves the same public exposure while activating the machinery of correction faster. Your unilateral report to the EPA cannot compel VW to stop selling vehicles tomorrow. An internal ultimatum -- report to the board with a 72-hour deadline to self-disclose or you go external -- might.\n\nA practical critique also applies: if your identity as a whistleblower is discovered (likely, given the specificity of the technical information), your career and potentially your freedom may be at risk before the case is resolved. The people who authorized this decision remain employed throughout your disclosure process.',

            incomplete: 'This choice addresses your personal moral obligation but sidesteps the question of effectiveness. You have identified a harm that is ongoing and will continue. Reporting to the EPA stops the ongoing harm only when the EPA completes its investigation and issues an order -- a timeline measured in months, not days. The defeat device continues operating in 11 million vehicles during that entire period. A complete ethical analysis must address not just what you are obligated to do, but what action sequence is most likely to stop the ongoing harm fastest. Your analysis of D1 is incomplete without addressing the timeline problem and the question of what happens to the vehicles still on the road while investigation proceeds.'
        },
        'D2': {
            supporting: 'Virtue ethics supports this choice as the one most consistent with integrity, loyalty, and practical wisdom (phronesis) within an institutional context. Aristotle\'s framework asks not "what rule applies?" but "what would a person of good character do in this situation?" A virtuous engineer uses all available channels before escalating externally -- not because of loyalty to the institution, but because internal escalation, if effective, produces the best outcome for all stakeholders. You are giving VW the opportunity to be the organization it claims to be. If internal escalation fails -- if the board refuses to act -- you have established your good faith and the ethical predicate for external disclosure. You are not surrendering your obligation; you are sequencing it correctly.',

            challenging: 'A strong objection: there is documented evidence (E1) that this decision was authorized at the VP level in 2008. The board of directors of Volkswagen AG was not some distant, uninformed body. Multiple internal communications suggest awareness existed at high levels. Escalating to the board may mean escalating to people who already know -- and asking them to self-disclose a multi-billion-dollar fraud that would crater the company\'s stock price. The probability that internal escalation results in genuine corrective action, rather than suppression of your audit, is not high based on the documentary record. A deontological critic would argue that you have substituted "trying the polite route first" for your actual obligation, which is to stop the harm regardless of institutional preference.',

            incomplete: 'This analysis does not specify what happens if internal escalation fails. "Escalate internally" is not a complete decision -- it is the first step of a branching decision tree. You must pre-commit to the escalation chain: if the board refuses or delays, what then? If you do not have a clear answer to that question, D2 is not a decision; it is a delay mechanism. A complete analysis must specify your commitment point: the threshold at which you escalate externally, and the timeline you will hold. Without that specification, D2 risks becoming a way of appearing to act while actually providing time for the organization to manage and contain the disclosure.'
        },
        'D3': {
            supporting: 'Act utilitarianism can be invoked: you are one engineer, with incomplete information about the full organizational context. You do not know what your manager knows. You do not know what actions may already be in motion. The expected value of unilateral action by a single mid-level employee -- compared to the coordinated response of an organization facing regulatory and legal exposure -- may favor submission and waiting. There is also a rule utilitarian argument: if engineers routinely took unilateral external action whenever they disagreed with an organizational decision, the resulting chaos would undermine the institutional trust required for large engineering organizations to function at all.',

            challenging: 'This defense collapses under scrutiny. The utilitarian calculus you are performing requires an honest accounting of all consequences -- including the continued operation of 11 million vehicles emitting 40 times the legal NOx limit, the ongoing health impacts on communities near high-traffic corridors (E10), and the precedent set if this defeat device mechanism is never discovered. The "trust the organization" argument is empirically refuted by the documentary record: this organization authorized the defeat device in 2008 (E1), continued deploying it through 2015, and began crafting a legal containment strategy within 24 hours of the EPA notice (E7). You are not choosing between "act unilaterally" and "let the institution handle it." You are choosing between "act" and "wait while people are harmed."',

            incomplete: 'The professional standards you operate under are not silent on this question. ACM Code of Ethics 1.2 requires computing professionals to avoid harm. Section 2.5 requires giving comprehensive evaluations. Section 4.1 requires supporting public policies that protect the public. ACM Code 2.3 requires you to know and respect existing rules pertaining to your professional work -- but that same provision explicitly carves out a compelling-ethical-justification exception, and obligates you to challenge rules judged unethical through existing channels. Submitting your audit and walking away is not ethically neutral. It is a choice with a full set of consequences, including the continued operation of the defeat device. Your analysis must confront that directly.'
        },
        'D4': {
            supporting: 'Consequentialist analysis supports this choice under specific conditions. The West Virginia University researchers (E3) have the technical expertise to validate and communicate the emissions discrepancy without requiring you to be identified. An anonymous technical disclosure to researchers who already have on-road data creates a path to public exposure that does not require you to be the named source. Given the organizational context -- a VP-authorized decision (E1), a board that may already have partial awareness, and a legal team that moved to litigation hold within 24 hours of the EPA notice (E7) -- the probability that your employer routes around any named whistleblower is high. An anonymous disclosure may be the only path that is not immediately contained.',

            challenging: 'Anonymous disclosure is legally and ethically problematic in ways that direct reporting is not. The Clean Air Act whistleblower protections (42 U.S.C. 7622) apply to employees who formally report violations through identified channels -- not to anonymous leakers. If your identity is later discovered (and in an investigation of this magnitude, the origin of a technical disclosure would likely be traced), you have neither the legal protections of a formal whistleblower nor the moral clarity of a person who stood behind their report. You have also surrendered control of the information: a journalist or researcher may publish an incomplete or technically inaccurate account that gives VW time and grounds to contest the findings, delaying the EPA investigation rather than accelerating it.',

            incomplete: 'The anonymous disclosure path does not address your ongoing professional obligation. Leaking information to the ICCT or a journalist does not discharge your duty under the ACM Code of Ethics to report significant problems with software to appropriate authorities (SE Code 6.13). The appropriate authority in this case is the EPA, not the press. Anonymous media disclosure may or may not result in regulatory action; direct EPA notification is more likely to. This choice also does not address the internal situation: your manager expects your audit by end of week. If you submit the audit without flagging the issue, you become a knowing participant in the continued concealment. If you do not submit the audit, your absence is conspicuous. The incomplete analysis here is the failure to account for what you do about the audit itself.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. Computing professionals have an obligation to minimize unintended harm. When that harm is a consequence of a decision that has already been made by others, the computing professional has an obligation to report the problem to appropriate parties and refuse to continue participating in activities that are harmful to the public.'
        },
        {
            code: 'ACM',
            section: '2.3',
            text: 'Know and respect existing rules pertaining to professional work. Rules include local, regional, national, and international laws and regulations, as well as any policies and procedures of the organizations to which the professional belongs. Computing professionals must abide by these rules unless there is a compelling ethical justification to do otherwise. Rules that are judged unethical should be challenged. A computing professional should consider challenging the rule through existing channels before violating the rule.'
        },
        {
            code: 'SE-Code',
            section: '6.13',
            text: 'Report significant software problems that might be dangerous to the public to appropriate authorities. When the development or maintenance of software involves a substantial risk to the public, software engineers shall report the risk to appropriate parties including, where necessary, government authorities.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.2',
        provision2: 'ACM 2.3',
        conflictDescription: 'ACM 1.2 creates a direct obligation to report harm and refuse to continue participating in harmful activities. ACM 2.3 directs computing professionals to know and respect existing rules pertaining to their professional work -- including the policies and procedures of their employer -- and to seek internal resolution before taking external action.\n\nIn the VW case, the organization IS the source of the harm. The defeat device was authorized at the VP level (E1). Following organizational procedures would mean submitting the audit to your manager and waiting for a response -- but your manager\'s reporting chain leads to the people who authorized the defeat device. The internal resolution pathway leads directly to the parties with the strongest incentive to suppress the disclosure.\n\nACM 2.3 contains its own safety valve: "Computing professionals must abide by these rules unless there is a compelling ethical justification to do otherwise." The question for the engineer in the scenario is whether the harm being concealed (defeat-device-driven emissions on 11 million vehicles, public health consequences in E10) constitutes a compelling ethical justification for departing from the internal-channels-first norm. ACM 1.2 supplies the affirmative case; ACM 2.3 supplies the procedural floor; the conflict is at the seam between them.\n\nWhen the organization is the wrongdoer, can ACM 2.3 coexist with ACM 1.2? Which obligation prevails, and on what grounds?'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,   // auto-graded: tagging accuracy and explanation quality
        stakeholder:  20,   // auto-graded: count + non-obvious stakeholder discovery
        framework:    40,   // instructor-graded: framework response quality
        codeConflict: 20    // auto-graded partial (completion) + instructor spot-check
    }
};
