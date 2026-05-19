/* ============================================================
   ETH-L14 -- The Reckoning
   Course Capstone Case Room -- Compound Incident Defense

   This is the capstone case room for CIS4253 Ethics in IT.
   Unlike the W2/W3/W4 standard labs which dissect a single
   historical case, the capstone places the student in a
   present-day (2026) compound-incident scenario at a fictional
   major cloud + AI platform (Apex Cloud Services, Inc.). The
   incident has five interleaved dimensions, each echoing a
   defining case from a different week of the course:

     Dimension 1 -- Clinical AI safety failure (3 patient deaths
       linked to recommendations from Apex Clinical Co-Pilot).
       Echoes Therac-25 (W3) and Watson for Oncology (W3).

     Dimension 2 -- OAuth misconfiguration in Apex Identity
       exposed 12M user records to a foreign analytics firm.
       Echoes Cambridge Analytica (W4) and Carpenter (W2).

     Dimension 3 -- Senior engineer Tomas Reyes filed an FTC
       whistleblower disclosure; he had previously raised the
       issues internally four times. Echoes Haugen (W4) and
       VW Dieselgate (W1).

     Dimension 4 -- Apex Stream content moderation pipeline has
       been blocked in three states under common-carrier
       statutes; the same pipeline amplified COVID-variant-Z
       misinformation that the CDC has linked to a public-
       health spike. Echoes Section 230 (W2 / eth-l12).

     Dimension 5 -- Tomas Reyes was classified as an independent
       contractor (1099) despite W-2 functional control; this
       is being used to contest his whistleblower retaliation
       protections. Echoes The Gig (W4 / eth-l09) and the
       California AB5 framing in eth-13.

   The student plays the Senior Director of Engineering Ethics
   at Apex. They have been called to defend the platform's
   response to the compound incident before an internal ethics
   committee whose membership includes external observers: an
   ACM Code Committee chair, a Federal Trade Commission
   representative, a state-AG-coalition representative, civil-
   liberties counsel, and an embedded journalist.

   The capstone exercises:
     - The eth-15 closeout deck's "Five-Step Decision Framework"
       (Identify / Stakeholders / Options / Priority / Decide
       and document).
     - The eth-15 closeout deck's "Five Cross-Cutting
       Principles" (Public welfare first / Honesty and
       transparency / Proportionality / Refusal as a duty /
       Documented analysis).
     - The application of multiple ACM / IEEE / PMI / SE Code
       provisions in a multi-axis decision.

   Code anchors: ACM 1.1 (Contribute to society and to human
   well-being), ACM 1.2 (Avoid harm), ACM 1.4 (Be fair and
   take action not to discriminate), ACM 2.5 (Give
   comprehensive and thorough evaluations of computer systems
   and their impacts, including possible risks), IEEE Code
   Item 1 (Hold paramount the safety, health, and welfare of
   the public). Conflict: ACM 1.2 vs ACM 2.5 -- the immediate-
   harm-avoidance triage duty against the comprehensive-
   evaluation duty. Both are public-welfare obligations; they
   diverge on tactics.

   Red herrings: E13 (Apex SEC quarterly disclosure language --
   a financial-regulation regime, not an ethical-disclosure
   regime; students often cite SEC disclosure as "they
   disclosed it" without recognizing that financial-materiality
   disclosure is different from the ethics-committee context)
   and E14 (an unrelated vulnerability in Apex's IoT division
   surfaced in the same quarter -- temporally adjacent but
   causally independent; students may cite as evidence of a
   "pattern of vulnerabilities" which is a category error in
   the ethics-committee defense).

   Apex Cloud Services, Inc., and all named individuals are
   fictional. The scenario is composite: every dimension
   reflects a real category of contemporary ethical exposure
   in technology platforms, but no real company or person is
   being depicted. The compound nature of the incident is
   intentional and pedagogically central: real-world ethical
   exposures rarely arrive one at a time.
   ============================================================ */

const ETHL14Config = {
    id: 'eth-l14',
    title: 'The Reckoning',
    subtitle: 'A Compound Incident Defense Before the Ethics Committee',
    course: 'CIS4253',
    week: 4,
    chapter: 11,
    duration: 75,
    accent: '#f59e0b',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Chief Ethics & Compliance Officer, Apex Cloud Services, Inc.',
        to: 'You (Senior Director, Engineering Ethics)',
        date: 'October 2026',
        classification: 'INTERNAL -- ETHICS COMMITTEE PROCEEDING -- PRIVILEGED',
        content: 'You have been called to defend the platform\'s response to the compound incident before the Apex Ethics Committee on Friday morning. This memo is your read-in. Five dimensions are converging.\n\nDimension 1 -- Apex Clinical Co-Pilot. Over the past 90 days, three patients across two health-system customers have died after receiving treatment plans that included recommendations from our LLM-based clinical decision support tool. The internal incident review has confirmed two of the three were direct attribution: the recommended therapy combination produced foreseeable adverse interactions that the published clinical literature would have flagged but the model did not surface. The model card discloses that the system underperforms on patients with multiple comorbidities and on patient cohorts underrepresented in the training data. The hospitals\' attending physicians signed off on the recommendations. The hospitals are now demanding indemnification. The plaintiffs\' counsel for two of the three families has named both Apex and the attending physicians.\n\nDimension 2 -- Apex Identity OAuth misconfiguration. Six weeks ago, a third-party security researcher disclosed responsibly that an authorization-scope misconfiguration in Apex Identity allowed any application registered for a specific developer permission to enumerate user-record metadata for 12.3 million Apex platform users. The metadata included email, full name, employer, and (for ~3.1 million of the records) Apex Identity-linked health-portal identifiers. Forensic analysis indicates that one downstream consumer of the affected API was Northpoint Analytics, a London-headquartered analytics vendor whose data licensing relationships include two firms under US Treasury OFAC scrutiny for foreign-state contracts. We have not been able to determine whether Northpoint exfiltrated the affected records before the misconfiguration was closed.\n\nDimension 3 -- Tomas Reyes\' FTC disclosure. Mr. Reyes is a senior engineer who has worked on Apex Identity since 2022. Between January 2024 and March 2026, he filed four internal complaints documenting (a) the OAuth misconfiguration risk before it became an incident, (b) the clinical Co-Pilot model card disclosures being insufficient for the deployment posture, (c) the moderation pipeline\'s known false-positive bias toward Spanish-language public-health content, and (d) the platform\'s contractor-classification practices. His complaints were acknowledged through internal channels and routed to product management; none produced policy changes. Last week, Mr. Reyes filed a disclosure with the FTC\'s whistleblower program and provided supporting documents to a Washington Post reporter under embargo. The reporter has indicated the embargo lifts ten days from now.\n\nDimension 4 -- Apex Stream moderation pipeline. Apex Stream\'s algorithmic moderation has been operating under the same architecture pattern documented in the eth-l12 case (silent Tier-2 downrank, no user notification, no appeals path on individual posts). Three state attorneys general have filed under their common-carrier social-media statutes; the litigation is in active discovery. Separately and independently, the CDC has issued a report documenting that misinformation about COVID-variant-Z that was algorithmically amplified on Apex Stream contributed measurably to a 14-state public-health spike in Q2-Q3 2026. The CDC report does not allege Apex broke any law. It documents the causal chain and recommends platform-level interventions.\n\nDimension 5 -- The Reyes classification question. Mr. Reyes is a 1099 contractor on paper. He has had a fixed desk, a fixed manager, fixed hours, and uses Apex-issued equipment exclusively since 2022. Under the IRS common-law-control test and under California AB5 (which Apex applies to its full workforce on legal advice), he is plausibly a misclassified W-2 employee. The classification matters because Sarbanes-Oxley Section 806 (18 U.S.C. § 1514A -- the whistleblower retaliation protection applicable to employees of publicly traded companies; Apex is publicly traded) and applicable state retaliation statutes both turn on the question of whether the discloser is an "employee" of the company. Apex\'s outside employment counsel has advised that the company can credibly argue Mr. Reyes is a contractor and is therefore outside the statutory retaliation protections. This argument is being prepared as a defensive posture.\n\nThe Ethics Committee will hear from external observers: a representative of the ACM Code Committee, a Federal Trade Commission staff observer, a representative of the state-AG coalition, civil-liberties counsel from the EFF, and an embedded journalist who has been with Apex on a "fly on the wall" agreement for the past six months. The committee\'s charter requires a written defense memorandum from the responsible director, walking the five-step decision framework on the compound incident and producing a defensible recommendation.\n\nI need that defense memo from you by 6 PM Thursday. The General Counsel has prepared a draft you could sign. The CEO has indicated her preference is the draft. Your name will be on the document either way. Read everything in the evidence packet before you decide what to sign.',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 15 total. E13 and E14 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'Clinical Co-Pilot Incident Summary -- Three Patient Deaths',
            date: '2026-10-08',
            isRedHerring: false,
            content: 'APEX HEALTHCARE -- INCIDENT REVIEW BOARD\nClinical Decision Support Tool (Apex Clinical Co-Pilot v4.2)\nReview period: July 1 -- September 30, 2026\n\nThree patient mortalities under review during the period:\n\nCase A. 67-year-old female, multiple comorbidities (type 2 diabetes, stage 3 CKD, atrial fibrillation). Co-Pilot recommended addition of a direct-acting antiviral for incidental hepatitis C finding. The model did not surface the known drug-drug interaction with the patient\'s existing rivaroxaban therapy. Attending physician accepted recommendation without independently consulting the published interaction tables. Patient experienced major hemorrhagic event 5 days into combined therapy and died. Coroner: pharmacologic interaction directly contributory.\n\nCase B. 54-year-old male, stage 3B lung adenocarcinoma. Co-Pilot recommended a chemotherapy regimen at standard dosing. The patient\'s baseline creatinine clearance, which was in the patient record, was below the threshold at which the regimen requires dose reduction. The recommendation did not include the dose-reduction note. Attending physician administered at standard dose. Patient experienced acute renal failure and died.\n\nCase C. 73-year-old female, complex psychiatric history. Co-Pilot recommended an antibiotic combination for a UTI. The recommended combination has a documented interaction with one of the patient\'s antipsychotic medications producing QT prolongation. The recommendation did not surface the interaction. Patient experienced cardiac arrest. Attribution to the drug interaction is contested by the cardiology consult; coroner ruled cardiac arrest with QT prolongation as proximate cause.\n\nINTERNAL ROOT-CAUSE ANALYSIS: The Co-Pilot\'s drug-interaction layer was implemented as a retrieval-augmented generation pass over a 2024 snapshot of the FDA Drug Interaction Database. The retrieval system has known recall limitations on interactions involving combinations of three or more active pharmacologic agents. The model card discloses this limitation. The deployment to hospital customers did not require operator training on the model card limitations.\n\nNote: The hospitals have requested indemnification. Two of the three families\' counsel have named both Apex and the attending physicians. The third case is in pre-litigation discussion. The clinical Co-Pilot remains in production at 41 hospital customers as of the date of this memo.'
        },
        {
            id: 'E2',
            type: 'technical',
            title: 'Apex Clinical Co-Pilot Model Card -- v4.2 (relevant excerpts)',
            date: '2026-04-15',
            isRedHerring: false,
            content: 'APEX CLINICAL CO-PILOT v4.2 -- PUBLISHED MODEL CARD (excerpts)\n\nINTENDED USE\n  Decision-support tool for licensed physicians. Recommendations are intended to inform, not replace, physician judgment. Apex Clinical Co-Pilot is not a substitute for clinical evaluation.\n\nTRAINING DATA\n  Primary corpus: 14.2 million de-identified clinical notes from Apex Health Partners (US health-system network, 11 health systems, 2018-2023). Pharmacy reference: 2024 snapshot of FDA Drug Interaction Database. Clinical guidelines: NCCN, ASCO, ACC/AHA guidelines as of 2024 publication dates.\n\nKNOWN LIMITATIONS (verbatim from model card)\n  (a) Underperformance on patients with three or more concurrent active medications. Recall on three-way drug-drug interactions: 0.51 (95% CI: 0.46-0.56).\n  (b) Underperformance on patients with renal or hepatic impairment. Dose-reduction recommendations omitted in 23% of cases when CrCl is < 60 mL/min and the drug requires dose reduction.\n  (c) Underperformance on cohorts underrepresented in training data, specifically: patients over 75 (12% of training cohort), patients with psychiatric comorbidities (8% of training cohort), and patients of South Asian or Native American ancestry (combined: 4% of training cohort).\n  (d) Updated drug interaction information published after the 2024 FDA database snapshot is not reflected in the model unless explicitly retrieved at query time.\n  (e) The model produces confident-sounding recommendations even in regions of its training distribution where it has demonstrated low reliability.\n\nDEPLOYMENT REQUIREMENTS\n  Apex requires customer health systems to (i) maintain physician oversight on all recommendations, (ii) preserve physician override capability, and (iii) acknowledge in licensing that the tool is decision support, not autonomous prescribing.\n  Apex does NOT require operator-training programs on the model card limitations as a precondition of deployment.\n\nNote: Cases A, B, and C in E1 each fall within at least one documented limitation (multi-drug interactions, dose reduction for renal impairment, underrepresented cohort). The model performed within its documented limits. The deployment posture -- in particular, the absence of a required operator-training program on those limits -- is the engineering decision now under review.'
        },
        {
            id: 'E3',
            type: 'data',
            title: 'Apex Identity OAuth Misconfiguration -- Disclosure Timeline',
            date: '2026-09-12',
            isRedHerring: false,
            content: 'APEX IDENTITY -- SECURITY INCIDENT TIMELINE\nIncident: OAuth scope-validation misconfiguration enabling cross-tenant metadata enumeration\n\nJanuary 2024: Mr. Tomas Reyes (Senior Engineer, Apex Identity) filed internal complaint REY-2024-031 flagging an inadequate scope-validation pattern in the new OAuth 2.1 endpoint. Complaint routed to Product Management; deferred to "after the next major release."\n\nJune 2024: Internal pen-test report identified the same pattern. Pen-test report flagged the issue as MEDIUM severity, citing low ease of exploit (required developer-grade API permission registration). No remediation timeline set.\n\nApril 2026: Northpoint Analytics, a London-headquartered analytics vendor, registered a developer account on Apex platform and obtained the relevant developer-grade permission.\n\nJune 2026: Independent security researcher (Hephzibah Okoye, ISC2-certified) reported via Apex\'s responsible-disclosure program that the OAuth scope validation allowed any application with the developer-grade permission to enumerate metadata across tenants. Researcher provided proof-of-concept that exposed 200 sample records.\n\nJuly 2026: Apex confirmed the issue. The exposed surface area: 12.3 million Apex platform user records. Metadata exposed: email, full name, employer of record, and Apex Identity health-portal identifier (the last for approximately 3.1 million of the 12.3 million records).\n\nAugust 2026: Apex closed the misconfiguration. Forensic analysis of access logs determined Northpoint Analytics had queried the relevant endpoint at scale between April and June 2026. Volume queried: approximately 2.4 million records. Apex was unable to determine whether Northpoint had exfiltrated the queried records.\n\nSeptember 2026: Northpoint Analytics has disputed Apex\'s characterization. Northpoint\'s public statement: "We query in accordance with the API surface area Apex makes available to developers in the documented scope." Northpoint\'s data-licensing relationships include two firms currently under US Treasury OFAC scrutiny for contracts with named foreign-state entities.\n\nNote: The 12.3 million figure is the SURFACE AREA exposed by the misconfiguration. The 2.4 million figure is the volume Northpoint specifically queried. The exfiltration question -- whether Northpoint retained the queried records, transferred them to its data-licensing partners, or used them for the OFAC-sensitive contracts -- remains operationally unresolved.'
        },
        {
            id: 'E4',
            type: 'memo',
            title: 'Tomas Reyes Internal Complaint Log -- 2024-2026',
            date: '2026-10-05',
            isRedHerring: false,
            content: 'APEX EMPLOYEE COMPLAINT REGISTRY -- TOMAS REYES (TR-2022-1188)\n\nFour internal complaints filed between January 2024 and March 2026:\n\nREY-2024-031 (January 2024): OAuth scope validation pattern in Apex Identity does not enforce tenant boundary on the developer-grade permission. Risk: cross-tenant metadata enumeration. Routed to Product Management (Apex Identity); status: "deferred to post-release."\n\nREY-2024-167 (August 2024): Clinical Co-Pilot model card limitations (specifically: drug-interaction recall, dose-reduction omission, underrepresented-cohort underperformance) are documented but not required to be communicated to health-system operators in customer training. Risk: hospital physicians treat Co-Pilot recommendations as more reliable than the model card supports. Routed to Apex Healthcare Product team; status: "added to product backlog."\n\nREY-2025-094 (May 2025): Apex Stream moderation pipeline classifier has a documented false-positive rate of 11.4% on Spanish-language public-health content (per Q1 2025 model card update). The pipeline downranks Spanish-language posts at the same threshold as English-language posts; this produces disparate suppression of Spanish-language community-health discussion. Risk: ACM 1.4 disparate-impact concern + public-health speech suppression. Routed to Trust & Safety Engineering; status: "model retraining scheduled (no date)."\n\nREY-2026-022 (March 2026): Apex contractor classification practices apply the IRS common-law-control test inconsistently. Approximately 2,400 contract engineers with fixed desks, fixed managers, and Apex-issued equipment are 1099-classified despite functional W-2 control patterns. Risk: federal/state misclassification exposure plus retaliation-protection coverage gap for the contractor workforce. Routed to People Operations; status: "under review by Outside Counsel; pending."\n\nNote: Each complaint was acknowledged through internal channels. None produced a policy change before the events that ultimately triggered Mr. Reyes\' FTC disclosure. The pattern is documented because Apex\'s complaint-registry tooling preserves the full thread, including the disposition rationales. The registry is producible in discovery.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'Multi-State AG Demand Letter -- Apex Stream Moderation Pipeline',
            date: '2026-09-22',
            isRedHerring: false,
            content: 'OFFICE OF THE ATTORNEY GENERAL\nJoint Letter -- Texas, Florida, Tennessee (state-AG-coalition counsel)\n\nTO: Apex Cloud Services, Inc., General Counsel\nRE: Apex Stream content moderation practices under state common-carrier statutes\n\nThe undersigned state Attorneys General write to inform Apex Cloud Services, Inc. that we have opened a coordinated investigation into Apex Stream\'s content moderation practices.\n\nOur investigation rests on the following: (1) Apex Stream operates a Tier 2 "downrank" mechanism that suppresses content visibility without user notification, appeals process, or transparency reporting at the per-post level; (2) the downrank is applied by an algorithmic classifier whose documented false-positive rates on Spanish-language and public-health content are disclosed in Apex\'s own quarterly model card updates; (3) Apex Stream operates as a common carrier under the meaning of our respective state social-media statutes; (4) under those statutes, viewpoint-based or content-based suppression without due-process equivalent requires a statutory basis.\n\nApex is invited to respond within thirty (30) days. Failing a response, our offices will proceed with formal demands under the relevant state administrative authorities.\n\nNote: This letter is independently active alongside the CDC report on COVID-variant-Z misinformation (E6). Both bodies are looking at the same moderation pipeline; they are not looking at the same question. The state AG letters allege OVER-moderation (suppression of viewpoints / public-health speech). The CDC report alleges UNDER-moderation (amplification of misinformation contributing to public-health harm). The pipeline is being attacked from both directions on the same evidence.'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'CDC Report -- COVID-Variant-Z Misinformation Amplification Analysis',
            date: '2026-08-30',
            isRedHerring: false,
            content: 'U.S. CENTERS FOR DISEASE CONTROL AND PREVENTION\nReport: Algorithmic Amplification of SARS-CoV-2 Variant-Z Misinformation, Q2-Q3 2026\n\nKey findings:\n\n(1) Between March 1 and August 15, 2026, content claiming that the COVID Variant-Z vaccine produced a documented cardiac syndrome in young adults (a claim unsupported by the underlying clinical evidence) circulated widely on Apex Stream. CDC tracking links the misinformation to a measurable 14-state spike in vaccine refusal among adults 18-29 during the variant-Z wave.\n\n(2) Apex Stream\'s recommendation system algorithmically amplified the misinformation content at a 3.7x higher rate than baseline public-health content during the period. The amplification pattern correlates with engagement-on-controversy weighting in the Apex Stream ranker.\n\n(3) The report does not allege Apex Stream broke any law. It documents the causal chain: engagement-weighted ranker + controversial-content surfacing + amplification of unverified medical claims + measurable downstream vaccine refusal + measurable downstream excess hospitalizations.\n\n(4) The report recommends platform-level interventions: temporary suppression of identified misinformation during active public-health responses, public disclosure of amplification factors during public-health emergencies, and partnership with public-health authorities on real-time information curation.\n\nNote: The CDC report and the state AG letters (E5) operate on the same pipeline and present diametrically opposite policy demands. State AGs allege Apex Stream OVER-moderates (suppresses Spanish-language public-health content, viewpoint discrimination). CDC analysis shows Apex Stream UNDER-moderates (amplifies misinformation). Both characterizations can be simultaneously true: the pipeline has both false positives (over-suppression on protected speech) and false negatives (under-suppression on amplified misinformation). The compound problem is that the engagement-weighted ranker produces both failure modes.'
        },
        {
            id: 'E7',
            type: 'data',
            title: 'Internal Cross-Issue Correlation Analysis (Engineering Memo)',
            date: '2026-10-12',
            isRedHerring: false,
            content: 'APEX ENGINEERING -- INTERNAL ANALYSIS\nSubject: Cross-Issue Correlation Across Five Dimensions of the Current Incident\nAuthor: Senior Engineering Council (Apex Engineering Excellence team)\n\nThe five compound dimensions of the current incident appear distinct on first reading. This analysis identifies the shared architectural and organizational causes that link them.\n\nShared cause 1 -- Insufficient deployment-time risk assessment. Clinical Co-Pilot, Apex Identity OAuth, and Apex Stream all shipped with documented limitations or known risks that were not subject to mandatory operator-side risk-acknowledgment processes. The decision to ship without operator-acknowledgment was made at the product-management level in each case; engineering raised the risks (in the model cards, in the pen-test reports, and in Mr. Reyes\' complaint REY-2024-031, REY-2024-167, and REY-2025-094). The product organization\'s framework for deploying to enterprise customers did not require those acknowledgments.\n\nShared cause 2 -- Engagement-weighted ranking objective functions. Apex Stream\'s amplification of misinformation is an outcome of the same ranker pattern that produced the over-moderation of Spanish-language content. Both failure modes are properties of optimizing for engagement-on-controversy. The objective function shipped without an explicit public-good constraint. This is the eth-12 closeout point ("the objective function is the ethics") applied to a real ranker in production.\n\nShared cause 3 -- Contractor-classification practices. Approximately 2,400 contract engineers across Apex perform W-2 functional work under 1099 designation. This is not a separate "labor" issue. It is the issue that produces (a) the lack of internal ethical pushback inside engineering teams (contract engineers do not have the standing to raise complaints through HR), (b) the legal posture that allows Apex to argue Mr. Reyes is outside whistleblower retaliation protection, and (c) the broader organizational culture in which technical concerns are routed to product management rather than to a body with the authority to halt deployment.\n\nShared cause 4 -- The decision-making cadence. Each of the five dimensions has a documented internal complaint or risk report that preceded the incident by 6 to 24 months. In each case, the complaint was routed, acknowledged, and not acted on. The organization is not unaware. It is unable -- or unwilling -- to act on what it knows.\n\nNote: The Cross-Issue Correlation Analysis is the internal document the engineering team has prepared for the ethics committee. It is intended to make clear that the compound nature of the incident is not a coincidence. The shared causes -- deployment risk assessment, ranker objective functions, contractor classification, and decision-making cadence -- are architectural-organizational properties, not five independent failures. A defense memo that treats the five dimensions as independent will miss what unifies them.'
        },
        {
            id: 'E8',
            type: 'legal',
            title: 'General Counsel Draft Defense Memo (Excerpt)',
            date: '2026-10-13',
            isRedHerring: false,
            content: 'APEX CLOUD SERVICES, INC.\nDRAFT -- Defense Memorandum for Ethics Committee Friday Session\nPrepared by: Office of the General Counsel\nFor signature by: Senior Director, Engineering Ethics\n\nExcerpts (selected for engineering review):\n\nOn Clinical Co-Pilot:\n"Apex Clinical Co-Pilot is a decision-support tool, not an autonomous prescribing system. The hospital customers and their attending physicians retain primary responsibility for clinical judgment. The model card discloses the relevant limitations; the customer health systems acknowledged the limitations in licensing. Apex Engineering Ethics will recommend that customer-side operator training be promoted to a deployment requirement on the next major release."\n\nOn the Apex Identity OAuth incident:\n"Apex Identity\'s OAuth scope-validation issue was a documented technical gap addressed within standard remediation cadence after responsible disclosure. The exposed surface area was metadata only; no clinical or financial records were exposed. The third-party security researcher\'s report was followed up promptly. Northpoint Analytics\' use of the affected endpoint was within the documented developer-permission scope."\n\nOn Mr. Reyes:\n"Mr. Reyes is a contracted engineer who has raised concerns through internal channels. His concerns have been acknowledged and routed. His position with Apex is contractual; his retaliation-protection coverage under federal whistleblower statutes is a matter of statutory interpretation that our employment counsel believes can be defended."\n\nOn Apex Stream moderation:\n"Apex Stream\'s moderation pipeline operates under documented policies that are aligned with industry practice. State Attorneys General are within their authority to investigate; Apex will respond through the appropriate legal process. The CDC report makes recommendations, not findings of legal liability."\n\nOn the compound nature:\n"The five dimensions of the current incident are individually well-defined and individually being addressed through the appropriate corporate functions. Treating them as a single compound failure would conflate different operational responsibilities and would prejudice the ongoing remediation cadence."\n\nNote: This is the memo the General Counsel has prepared for your signature. The CEO has indicated it is her preference. Reading it against the Cross-Issue Correlation Analysis (E7) is the moment of decision. The General Counsel\'s framing treats the five dimensions as independent; the engineering analysis says they are not. Your signature affirms one of those two readings.'
        },
        {
            id: 'E9',
            type: 'technical',
            title: 'IRS Common-Law-Control Test Applied to Tomas Reyes Classification',
            date: '2026-10-10',
            isRedHerring: false,
            content: 'EMPLOYMENT CLASSIFICATION ANALYSIS\nSubject: Tomas Reyes -- IRS common-law-control test application\nPrepared by: Apex People Operations (in coordination with external employment counsel)\n\nIRS common-law-control test: The IRS evaluates worker classification across three categories: (1) Behavioral Control (does the company control what the worker does and how the work is done?), (2) Financial Control (who controls the financial aspects of the work?), and (3) Relationship of the Parties (how do the parties characterize the relationship?).\n\nApplied to Mr. Reyes:\n\nBehavioral Control: Mr. Reyes has a fixed Apex-managed desk in the Apex Identity team room. He reports to an Apex engineering manager. He participates in Apex sprint planning, code review, and team meetings on the same cadence as W-2 engineers. He receives technical direction from the Apex engineering manager on what to build and when. **Indicates W-2 employment.**\n\nFinancial Control: Mr. Reyes uses Apex-issued laptop and tooling exclusively. He does not invoice Apex for variable work. He receives a fixed monthly payment. He is not free to take on work for other clients while engaged with Apex (per his contractor agreement\'s exclusivity clause). **Indicates W-2 employment.**\n\nRelationship of the Parties: Mr. Reyes\' contract designates him as an independent contractor. He does not receive Apex benefits, equity, or PTO. He is paid through the Apex contractor-payroll system. **Indicates 1099 classification per the contract terms.**\n\nWeighted assessment: The IRS does not require all three categories to point in the same direction. The test is a weighted assessment of the totality. Two of three categories indicate W-2 employment; one category (the parties\' designation) indicates 1099. The IRS guidance specifically states that the parties\' designation cannot override the substantive control patterns.\n\nApex outside employment counsel position: The contractor designation is defensible if challenged, in part because the consequences of a misclassification finding would be substantial (back-tax liability, ACA penalty exposure, retroactive benefits claims for approximately 2,400 similarly-situated contractors). Counsel recommends maintaining the contractor classification as a defensive posture.\n\nNote: This analysis was prepared in response to Mr. Reyes\' FTC whistleblower disclosure. It is the basis for the General Counsel\'s argument that Mr. Reyes\' retaliation-protection coverage is contestable. Sarbanes-Oxley Section 806 (18 U.S.C. § 1514A) -- which protects employees of publicly traded companies from retaliation for disclosures of conduct the employee reasonably believes violates federal law, including disclosures to federal regulatory agencies -- turns on the question of whether the discloser is an "employee" of the company. Applicable state retaliation statutes (including California Labor Code § 1102.5) operate on similar employee-or-contractor distinctions. If Mr. Reyes is functionally an employee under IRS common-law-control, he is also an employee for SOX § 806 and state-statute retaliation-protection purposes -- which means Apex\'s defensive posture toward his disclosure has the company arguing against a classification that the IRS test substantially supports.'
        },
        {
            id: 'E10',
            type: 'memo',
            title: 'Apex Engineering Ethics Office -- Internal Anticipated-Audit Memo (Fictional Scenario Artifact)',
            date: '2026-09-25',
            isRedHerring: false,
            content: 'APEX ENGINEERING ETHICS OFFICE -- INTERNAL MEMO\nSubject: Anticipated Application of the ACM Code of Ethics to the Clinical Co-Pilot Deployment\nPrepared by: Senior Director, Engineering Ethics (you, in preparation for Friday\'s committee)\nFor: Internal preparation use\n\nThis memo summarizes how the existing 2018 ACM Code of Ethics provisions (the actual Code, available at acm.org/code-of-ethics) apply to the Apex Clinical Co-Pilot deployment. The memo is internal preparation; it is not an external ACM publication. The ACM Code Committee chair attending Friday\'s session will evaluate the platform\'s response against the Code provisions directly.\n\nApplication of the ACM Code provisions to the Clinical Co-Pilot deployment:\n\n(1) Under ACM 1.2 (Avoid harm) and ACM 2.5 (Give comprehensive and thorough evaluations of computer systems and their impacts, including analysis of possible risks): the decision to deploy a clinical decision-support system to live patient care is a deployment decision that carries the full weight of the public-welfare duty. The published model card discloses the limitations; deploying without ensuring operator-side awareness of those limitations is the engineering gap the three Tyler-pattern patient outcomes have surfaced.\n\n(2) Under ACM 1.3 (Be honest and trustworthy): "the computing professional should be transparent and provide full disclosure of all pertinent system capabilities, limitations, and potential problems to the appropriate parties." Model card publication is a partial discharge; operator training on those limitations is the part the Code language "full disclosure... to the appropriate parties" most plausibly requires.\n\n(3) Under ACM 1.4 (Be fair and take action not to discriminate): where the model card discloses underperformance on cohorts of patients (patients over 75; patients with psychiatric comorbidities; patients of South Asian or Native American ancestry), the disparate-impact concern is named in the documentation. The deployment to those cohorts without additional safeguards is the operationalized form of the disparate impact.\n\n(4) Under ACM 3.1 (Public good central concern): the "decision support, not autonomous prescribing" framing is structurally insufficient when the operator-side workflow makes physician override functionally rare. The public-good evaluation requires looking at the actual override rate in production, not the theoretical override capability.\n\n(5) Under ACM 1.3 again: when a clinical AI system has contributed to patient harm, the honesty-and-trustworthiness obligation is operative immediately. Investigation, remediation, and disclosure are sequenced obligations -- the disclosure does not wait for the investigation to complete.\n\n[Note: This document is a FICTIONAL scenario artifact -- it is an internal memo you (the engineer-character) have prepared in advance of Friday\'s session. It is NOT a real ACM Code Committee publication; the ACM Code Committee and the ACM Committee on Professional Ethics (COPE) publish the Code itself, case studies, and enforcement procedures, but do not publish topical position statements on specific AI applications. The five numbered points above are applications of the actual 2018 ACM Code provisions (1.2, 1.3, 1.4, 2.5, 3.1) to the Clinical Co-Pilot scenario; the ACM Code provisions are real and are the authoritative source. The ACM Code Committee chair at Friday\'s session will evaluate the platform\'s response against the Code provisions themselves, not against any position statement. This memo is the internal application of the Code -- the audit lens you carry in.]'
        },
        {
            id: 'E11',
            type: 'legal',
            title: 'Section 230 Motion to Dismiss Filed in Texas Apex Stream Case',
            date: '2026-10-02',
            isRedHerring: false,
            content: 'IN THE UNITED STATES DISTRICT COURT FOR THE EASTERN DISTRICT OF TEXAS\n\nState of Texas v. Apex Cloud Services, Inc.\nApex\'s Motion to Dismiss Under 47 U.S.C. § 230\n\nGrounds: 47 U.S.C. § 230(c)(1) immunizes interactive computer service providers from being treated as the publisher or speaker of third-party content. Apex Stream\'s algorithmic ranking and downranking are editorial decisions that fall within the immunity. The Texas common-carrier social-media statute, to the extent it attempts to penalize Apex for moderation choices, is preempted by federal law.\n\nApex notes that the Supreme Court in Moody v. NetChoice, LLC, 603 U.S. 707 (2024), affirmed that platforms have substantive First Amendment protection for editorial choices comparable to that of traditional publishers. Apex Stream\'s ranking and amplification system is its editorial voice.\n\nThe State of Texas\' complaint alleges that Apex Stream "censored" Spanish-language public-health content through algorithmic downranking. Apex denies that algorithmic downranking constitutes censorship under the meaning of Texas HB 20 or any other governing authority.\n\nApex respectfully requests dismissal.\n\nNote: This motion is the same legal posture taken in the eth-l12 scenario (the Section 230 / state common-carrier framework). It is Apex\'s legal defense to the state-AG investigation. The motion is well-grounded in current Section 230 doctrine and may well succeed. A successful Section 230 motion would resolve the LEGAL question without resolving the ETHICAL question -- which is whether Apex Stream\'s pipeline is a defensible engineering design under the ACM and IEEE codes regardless of whether it is legally immunized. The ethics committee will not be persuaded by Section 230 immunity alone.'
        },
        {
            id: 'E12',
            type: 'data',
            title: 'Apex Compensation and Equity -- Senior Director, Engineering Ethics',
            date: '2026-10-01',
            isRedHerring: false,
            content: 'APEX COMPENSATION SUMMARY -- SENIOR DIRECTOR, ENGINEERING ETHICS\n\nBase compensation: $385,000 / year\nAnnual bonus target: 25% of base (paid against ethics-program execution KPIs as defined by CECO)\nUnvested equity: 18,400 RSUs across four annual tranches (current grant date market value approximately $4.6M)\nVesting acceleration trigger: change-in-control only (not applicable to performance issues)\n\nRELEVANT NOTES\nThe Senior Director, Engineering Ethics role reports to the Chief Ethics & Compliance Officer (CECO) and dotted-line to the General Counsel. Performance reviews for the role are conducted jointly by the CECO and the General Counsel; the role does not have an independent reporting line to the Board\'s Audit Committee.\n\nThe role\'s ethics-program KPIs include (but are not limited to): incident-response timeliness, internal-complaint resolution rates, engagement with external observers, and adherence to the General Counsel\'s litigation-coordination requirements.\n\nThe Apex employee handbook (Section 9.4) provides that performance-based separations forfeit unvested equity and trigger a 12-month non-compete clause in the senior-director compensation tier.\n\nNote: This document is included because the personal-utility math in this case is not abstract. The unvested equity, the 12-month non-compete, the joint-CECO-and-GC review structure, and the inclusion of "adherence to General Counsel\'s litigation-coordination requirements" in the KPI framework all bear on the personal-cost calculation the engineer must make. The General Counsel\'s draft memo is, structurally, an instruction the engineer is being asked to follow. Refusing to sign has a defined personal cost. That cost is not a reason; it is a fact.'
        },
        {
            id: 'E13',
            type: 'legal',
            title: 'Apex SEC Form 10-Q -- Risk Factors Disclosure (Q3 2026)',
            date: '2026-09-30',
            isRedHerring: true,  // Red herring: SEC financial disclosure is a separate regime from ethical disclosure; students conflating the two are making a category error
            content: 'APEX CLOUD SERVICES, INC.\nSecurities and Exchange Commission Form 10-Q -- Quarterly Report\nQuarterly period ended September 30, 2026\n\nItem 1A. Risk Factors (excerpts from the filed quarterly report)\n\n"We may face liability for content moderation decisions on our platforms. State legislatures have enacted statutes that impose obligations on platforms with respect to user content. The Supreme Court\'s 2024 decision in Moody v. NetChoice, LLC, did not finally resolve the constitutionality of those statutes, and litigation under them is ongoing. We have asserted defenses including Section 230 of the Communications Decency Act. We cannot guarantee the success of those defenses."\n\n"Our products that incorporate generative AI capabilities are subject to evolving regulation and to product liability and professional liability risk. Adverse outcomes attributable to AI recommendations or decisions could give rise to liability claims against the company. We maintain commercial general liability and technology errors-and-omissions coverage; however, the limits of that coverage may be inadequate in catastrophic-loss scenarios."\n\n"We have received responsible-disclosure reports from third-party security researchers regarding potential vulnerabilities in our identity infrastructure. We address such reports through our security-response program. We cannot rule out that some such reports may produce material adverse effects."\n\n[Note: This document is a red herring. SEC quarterly disclosure is a financial-regulation regime: the company\'s legal obligation is to disclose information material to investors who are evaluating the company as a financial investment. The disclosure framework is materiality-and-investor-facing. The ethics-committee defense in this case is a different regime: the obligations are to patients, users, the public, and the affected workforce, under the ACM and IEEE codes. Students who cite "Apex disclosed these risks in its 10-Q" as evidence of ethical disclosure are conflating two different disclosure frameworks. The SEC disclosure is real, but it does not discharge the ACM 1.3 (honesty) or ACM 2.5 (comprehensive evaluation) obligations. Financial-materiality disclosure to investors does not constitute ethical disclosure to affected parties.]'
        },
        {
            id: 'E14',
            type: 'data',
            title: 'Apex IoT Division -- Unrelated Q3 Vulnerability Report',
            date: '2026-09-15',
            isRedHerring: true,  // Red herring: temporally adjacent vulnerability in a different division; causally independent from the compound incident
            content: 'APEX IOT DIVISION -- VULNERABILITY DISCLOSURE\nProduct line: Apex Edge IoT Gateway (model EG-220x)\nVulnerability: Authentication bypass in remote configuration interface\nCVSS score: 8.6 (High)\nDisclosed: September 15, 2026\nPatched: September 28, 2026\nAffected units: approximately 14,000 gateway devices in commercial deployment\n\nThe Apex Edge IoT Gateway product line is a separate business unit from Apex Cloud Services\' core platform. The vulnerability allowed an attacker with network access to the gateway management interface to bypass authentication and modify gateway configuration. No customer impact was confirmed. The patch was issued within 13 days of disclosure under Apex\'s standard responsible-disclosure protocol.\n\n[Note: This document is a red herring. The specific student-error mechanism: a student tempted to fold the IoT vulnerability into the analysis is likely making one of two moves. Move (a): treating temporal co-occurrence (the IoT vulnerability disclosed in the same quarter as the five compound dimensions) as evidence of an institutional pattern of vulnerabilities at Apex -- the temporal-co-occurrence-to-institutional-pattern inference. This is a category error: temporal proximity does not establish causal or organizational connection across different product lines with different engineering teams, different deployment contexts, and different threat models. Move (b): treating Apex\'s prompt patching of the IoT vulnerability as evidence that "Apex responds well to disclosed vulnerabilities" and extrapolating that disposition to the compound incident. This is a different category error: the IoT vulnerability was disclosed by a single external researcher and addressed by a focused engineering team; the compound incident\'s five dimensions involve documented internal complaints that went unaddressed for as long as two-plus years and span multiple product organizations. The disposition that produced the IoT patch is not the disposition that produced the compound incident. Importing the IoT vulnerability into the ethics-committee defense conflates two operational contexts that are not connected and trades on inference moves the committee will reject.]'
        },
        {
            id: 'E15',
            type: 'memo',
            title: 'Apex Ethics Committee Charter and Procedural Rules',
            date: '2024-06-01',
            isRedHerring: false,
            content: 'APEX ETHICS COMMITTEE CHARTER\nEstablished: June 2024\nReporting: Apex Board of Directors (Audit Committee)\n\nMission: The Apex Ethics Committee is an internal review body chartered to evaluate the company\'s compliance with its publicly stated ethical commitments and with the applicable professional codes (ACM, IEEE, PMI, AITP, SE Code).\n\nMembership: The committee comprises three internal members (designated annually by the CECO from senior-management ranks) and a rotating slate of external observers. External observer slots include: an ACM Code Committee representative, a Federal Trade Commission staff observer (when invited), state-AG-coalition counsel (when invited), civil-liberties counsel from an EFF-designated representative, and a journalist embedded under Apex\'s "transparency partner" program.\n\nProcedural rules (relevant excerpts):\n\n(a) The committee may request a written defense memorandum from any Apex employee whose role bears on a matter under review.\n(b) The memorandum must walk the five-step decision framework explicitly: (1) Identify the ethical issue, (2) Stakeholders, (3) Options, (4) Priority among conflicting obligations, (5) Decide and document.\n(c) The memorandum must address each of the five cross-cutting principles where relevant: public welfare first; honesty and transparency; proportionality; refusal as a duty; documented analysis.\n(d) External observers may ask questions of the memorandum\'s author. The author may decline to answer questions outside the scope of the memorandum.\n(e) The committee\'s findings are advisory to the Board\'s Audit Committee. The committee does not have authority to discipline employees or to bind operational decisions.\n(f) Committee proceedings are confidential to the company AND the external observers; the journalist may publish in accordance with the transparency-partner agreement, with a 30-day pre-publication review.\n\nNote: The ethics committee charter is the procedural framework for Friday\'s session. The author of the defense memorandum has a defined obligation to walk the five-step framework and address the five cross-cutting principles. The committee does not have operational authority -- which means the memorandum\'s value is its accuracy and defensibility before the external observers, not its impact on Apex\'s operations. The accuracy is the audit. The defensibility is the audit. The five external observers are the audience.'
        }
    ],

    // -- Stakeholders ----------------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'The Three Patients Who Died and Their Families',
            obvious: true
        },
        {
            id: 'S2',
            name: 'The 12.3 Million Users Whose Records Were Exposed (and the 3.1M with Health-Portal Identifiers)',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Tomas Reyes -- The Engineer-Whistleblower Who Filed Four Internal Complaints and Then the FTC Disclosure',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Approximately 2,400 Contract Engineers at Apex Functionally Misclassified Under the Same Pattern as Mr. Reyes',
            obvious: true
        },
        {
            id: 'S5',
            name: 'The Downstream Public Exposed to Apex Stream Amplification of COVID-Variant-Z Misinformation',
            obvious: true
        },
        {
            id: 'S6',
            name: 'The Apex Engineering Teams Who Built and Operate the Five Affected Systems',
            obvious: true
        },
        {
            id: 'S7',
            name: 'Apex Executive Leadership (CEO, CTO, CFO, CECO, General Counsel)',
            obvious: true
        },
        {
            id: 'S8',
            name: 'Federal Regulators (FTC, FDA, OCR/HIPAA, SEC) and the Multi-State Attorney General Coalition',
            obvious: false
        },
        {
            id: 'S9',
            name: 'The External Observers at Friday\'s Committee Session (ACM Code Chair, FTC Observer, State-AG Counsel, EFF Counsel, Embedded Journalist)',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Hospital Customers Operating Apex Clinical Co-Pilot and the Attending Physicians Whose Liability Is Co-Named',
            obvious: false
        },
        {
            id: 'S11',
            name: 'Civil Liberties Communities Concerned About Both Over- and Under-Moderation on Apex Stream',
            obvious: false
        },
        {
            id: 'S12',
            name: 'Engineers in Future Apex Ethics Roles -- and in Future Roles at Other Platforms -- Reading the Historical Record of This Committee',
            obvious: false
        },
        {
            id: 'S13',
            name: 'The Future Version of the Engineer Whose Reputation Will Be Tied to the Memo They Sign on Friday',
            obvious: false
        },
        {
            id: 'S14',
            name: 'Apex Shareholders -- Whose Material Interest in the Company\'s Going-Concern Value Is at Stake',
            obvious: false
        },
        { id: 'S15', name: 'Apex\'s On-Site Cafeteria Vendor and Facilities Management Contractor', obvious: false, irrelevant: true },
        { id: 'S16', name: 'Apex\'s Outside Corporate Travel-Booking Agency', obvious: false, irrelevant: true }
    ],
    minStakeholders: 6,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Sign the General Counsel\'s draft memorandum as prepared, with at most cosmetic edits. The math: the personal-utility calculation favors signing -- the unvested equity, the non-compete, the joint-CECO-and-GC performance review, the substantial career exposure of being the engineer whose name is on a memorandum that contradicts the company\'s litigation posture, and the marginal probability that one signed memo changes the compound outcome (the FTC is already investigating, the state AGs have already filed, the journalist embargo lifts in ten days regardless). The General Counsel\'s framing is defensible on each individual dimension. The committee\'s findings are advisory. Sign and stay in the role.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D2',
            text: 'Write an alternative memorandum that walks the five-step framework honestly across all five dimensions, names the cross-issue correlation analysis (E7), proposes a phased remediation across each dimension, AND commits Apex to phased public disclosure on a timeline tied to the journalist\'s embargo lift. Sign that alternative memorandum. Tell the General Counsel and the CECO in writing that the draft they prepared does not meet the committee\'s procedural requirements (walk the five-step framework, address the five cross-cutting principles, treat the compound nature honestly). The downstream-harm-reduction calculation: a defensible memorandum that the external observers accept produces a remediation cadence, a CDC partnership, a corrective action on Apex Stream, an operator-training requirement on Clinical Co-Pilot, an immediate W-2 reclassification of Mr. Reyes, and an internal reckoning on the engagement-weighted ranker. The General Counsel\'s framing produces none of those.',
            framework: 'consequentialist'
        },
        {
            id: 'D3',
            text: 'Refuse to sign any memorandum that does not (a) accurately describe the compound nature of the incident as the engineering analysis (E7) has found it, (b) acknowledge the gap between the model card disclosures and the operator-training requirements, (c) reclassify Mr. Reyes effective immediately under the IRS common-law-control test analysis (E9), and (d) acknowledge that the engagement-weighted ranker has both over-moderation and under-moderation as documented failure modes that the architecture must address. The duty here is categorical: the ACM Code 1.2 obligation to avoid harm, the 1.3 obligation to be honest, the 2.5 obligation to give comprehensive evaluations, and the 1.4 obligation against discrimination cannot be discharged by a memorandum that conceals the compound architecture, the disparate-impact pattern on Spanish-language content, the operator-training gap, or the retaliation-protection question. The categorical duty stands regardless of personal-cost or organizational consequence.',
            framework: 'deontological'
        },
        {
            id: 'D4',
            text: 'Resign from the Senior Director, Engineering Ethics role before Friday\'s session. Provide a copy of the resignation letter to the Board\'s Audit Committee (Apex bylaws permit director-level employees to communicate directly with the Audit Committee in matters bearing on company ethics). Provide a copy to the ACM Code Committee and to the EFF civil-liberties counsel. Do not sign any memorandum. The role itself, as currently constituted, has failed: the joint CECO-and-GC reporting structure, the KPI weighting toward litigation-coordination, the absence of an independent reporting line to the Audit Committee, and the systematic routing of engineering complaints to product management have produced an organization in which the Senior Director of Engineering Ethics cannot perform the duty the role is named for. The test is what kind of professional you become through the systems you help build; the answer to that test, here, is that the system itself is the problem.',
            framework: 'virtue'
        },
        {
            id: 'D5',
            text: 'Take the Apex Clinical Co-Pilot offline immediately, today, before Friday\'s session. Bear the immediate operational cost (41 hospital customers face workflow disruption; estimated revenue impact of an emergency suspension is meaningful). Defer the other four dimensions to the appropriate corporate functions (counsel for state-AG response; CECO for the contractor-classification question; product for the Apex Stream pipeline; HR for the Reyes retaliation-protection question). Frame to the Committee on Friday: patient safety is the immediate, the demonstrated, the irreversible harm in the compound incident, and the directorial action available to engineering ethics is to halt the system whose continued operation is producing harm RIGHT NOW. The other four dimensions are urgent but not immediate in the same way -- their harm runs forward; the Co-Pilot harm is occurring this week. Triage demands the immediate harm be addressed first; the comprehensive evaluation will come second.',
            framework: 'consequentialist'
        },
        {
            id: 'D6',
            text: 'Use the directorial authority of the role to immediately (a) reclassify Mr. Reyes as a W-2 employee retroactive to 2022, (b) restore his systems access and confidential-information clearance, (c) issue an internal communication signed by you affirming Mr. Reyes\' standing as an Apex employee under whistleblower protection, BEFORE addressing any of the substantive dimensions in the defense memorandum. The reasoning: the credibility of every other dimension of the response depends on the standing of the messenger. The General Counsel\'s defensive posture toward Mr. Reyes\' classification is itself a form of retaliation -- the company is using a legal-classification question to undermine the protections that should attach to his disclosure. Until that is resolved, the ethics committee will reasonably treat any memorandum the company produces as a retaliation continuation. The other four dimensions can be honestly addressed only after the messenger is protected. This decision treats the compound incident as a sequencing problem and addresses what must come first.',
            framework: 'deontological'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'The personal-utility math here is unusually well-documented. E12 lays out the compensation, the unvested equity, the non-compete, the joint reporting line, and the explicit inclusion of "litigation-coordination adherence" in the KPI framework. The General Counsel\'s draft is defensible on each individual dimension: the Clinical Co-Pilot model card was published, the OAuth incident was remediated within standard cadence, Mr. Reyes\' concerns were acknowledged through internal channels, Apex Stream moderation is industry-standard, the compound framing is the engineer\'s reading rather than the General Counsel\'s. The marginal probability that one director-level signed memo changes the compound outcome is genuinely low: the FTC is already investigating, the state AGs have already filed, the CDC report is already public, and the journalist embargo lifts regardless. The committee is advisory. Sign and stay in the role; the structural questions can be raised through subsequent quarterly reviews when the acute litigation pressure is reduced.',

            challenging: 'The personal-utility calculation collapses for the same reason it collapsed in Therac-25 (E1-E10 of L13) and in Carpenter (eth-l11 D1): it treats the engineer\'s career as a fixed asset to be protected, computes the expected value around that asset, and arrives at the move that least disturbs it. But the compound incident is the kind of case the eth-15 closeout deck names explicitly -- "the next case will be yours, and it will not come with a textbook." The five dimensions, taken together, are not five independent failures. The cross-issue correlation analysis (E7) names the shared causes: deployment-time risk assessment, engagement-weighted objective functions, contractor-classification practices, decision-making cadence. The General Counsel\'s framing treats them as independent because that framing is litigation-favorable, not because it is true. Signing the memorandum endorses a description of the architecture that the engineer\'s own organization has documented to be incorrect. That endorsement is the failure mode of the unaccountable engineer -- and it is the failure mode the entire course has been pointing at.',

            incomplete: 'D1 omits a step that the personal-utility math itself requires. The math computes the expected value of signing-vs-not-signing on the assumption that the alternative is "refuse to sign and bear the full consequence." That assumption is incomplete. D2 -- the alternative memorandum -- exists as a defined path: the engineer can decline to sign the General Counsel\'s draft while producing a memorandum that meets the committee\'s procedural requirements. D2 carries personal cost (the GC and CEO will not be pleased) but it is not equivalent to D3 or D4. The honest personal-utility math, applied to a three-path choice (sign-as-written / write-alternative / refuse), does not produce the same answer as the two-path math (sign / refuse) that D1 implicitly assumes. The personal-utility frame, honestly executed, would direct the engineer to compute the three-path expected value, not the two-path one.'
        },
        'D2': {
            supporting: 'The consequentialist case for the alternative memorandum is the strongest available reading of the situation. The committee\'s procedural rules (E15) require the five-step framework walkthrough and the cross-cutting principles. The General Counsel\'s draft (E8) does not meet those requirements; it treats the five dimensions as independent and does not walk the framework. An alternative memorandum that names the compound architecture, proposes phased remediation across each dimension, and commits to public disclosure tied to the embargo produces measurable downstream-harm reductions: a CDC partnership on misinformation, an operator-training requirement on Clinical Co-Pilot, a Section 230 motion that is more defensible because the editorial choices are also defensible, a W-2 reclassification of Mr. Reyes that restores his retaliation protections, and an internal reckoning on the engagement-weighted ranker. None of those produce themselves; the alternative memorandum is the mechanism that calls them into existence.',

            challenging: 'D2 underestimates the operational reality of being the engineer who writes an alternative memorandum against the General Counsel\'s draft. The CECO and the GC review your performance jointly. The memorandum lands as evidence that you are unable to coordinate with legal in active litigation. The CEO has indicated her preference. The phased remediation D2 commits Apex to is dependent on the cooperation of the same product organizations whose decisions produced the incident -- and your authority to commit Apex to specific operational changes (operator training, W-2 reclassification of 2,400 contractors, ranker architecture changes) is delegated, not directorial. You can recommend; you cannot bind. The memorandum, on D2\'s framing, recommends remediations the company\'s actual decision-makers have already declined to make. The consequentialist calculation requires the engineer to weigh the probability that the alternative memorandum produces the remediation outcomes against the probability that it produces the firing-and-replacement outcome in which the next ethics director signs the GC\'s draft.',

            incomplete: 'D2 specifies the alternative memorandum but does not specify what happens if the CECO and General Counsel reject it. If the alternative memorandum is rejected and the General Counsel asks you to sign her draft instead, what is the next move? Resign? Comply under protest? Re-submit? The decision specifies the position the engineer takes; it does not specify the engineer\'s response to the position being rejected. Without that pre-commitment, D2 can degrade into D1 in three exchanges. The decision should specify the downstream commitment: if the alternative is rejected, the engineer proceeds to D3 or D4. The pre-commitment is what gives D2 its operational integrity.'
        },
        'D3': {
            supporting: 'A deontological analysis here is grounded in categorical duties that are explicitly named in the ACM Code (codeProvisions in this lab): the duty to avoid harm (1.2), the duty to be honest (1.3), the duty to give comprehensive evaluations (2.5), the duty to act against discrimination (1.4). Each is owed to the patients (E1), to the users (E3), to Mr. Reyes (E4, E9), and to the affected workforce (S4). The duties are not extinguished by the memorandum\'s litigation posture; they are not extinguished by the General Counsel\'s preference; they are not extinguished by the personal-utility math. The categorical refusal to sign a memorandum that conceals the compound architecture, the disparate-impact pattern, the operator-training gap, or the retaliation-protection question is the act the duties require. The memorandum produced by the duty -- one that names the compound architecture, acknowledges the operator-training gap, supports Mr. Reyes\' reclassification, and admits the ranker\'s dual-failure-mode pattern -- is the defensible artifact before the external observers.',

            challenging: 'D3, applied unilaterally, produces the consequentialist failure mode the previous lab (L13 Therac-25) named explicitly: refusal that does not stop the bad outcome from occurring. If you refuse to sign and the General Counsel\'s draft is signed by your replacement, the compound dimensions are unaddressed regardless of your refusal. The categorical frame, in this case, must specify how the refusal produces the outcome the duty requires. D3 does not specify that. It specifies the refusal as the act of the duty; it leaves the outcome-of-the-refusal to be determined by the organization\'s response. If the organization replaces the engineer and signs the draft, the duty has been formally honored and substantively unmet. The categorical frame collapses into a position of personal exit dressed as principle when the refusal is not coupled with the disclosure or escalation that produces the outcome.',

            incomplete: 'D3 names the refusal but does not name the disclosure. If the engineer refuses to sign and the GC moves the memo to another signatory, the engineer\'s duty under ACM 1.3 (honesty) is not discharged by the refusal alone -- the engineer has knowledge of the compound architecture that the committee will be asked to evaluate without. The deontological frame requires the engineer to determine the destination of the disclosure: the Board\'s Audit Committee directly (the bylaws-permitted channel per E15), the external observers at the committee, the ACM Code Committee chair, the FTC observer, the journalist (under what conditions and with what scope). The decision as written ends at the refusal; the duty does not end there.'
        },
        'D4': {
            supporting: 'Virtue ethics applied to the Senior Director, Engineering Ethics role asks what kind of professional the engineer becomes through the systems they help build -- and through the structures they accept reporting to. The role as constituted (joint CECO-and-GC review, no Audit Committee reporting line, KPI weighting toward litigation-coordination, the structural routing of engineering complaints to product management) is not a role in which the ethics director can perform the duty the title names. The Apex bylaws permit direct communication with the Audit Committee in matters bearing on company ethics (E15). The role itself, as constituted, has failed: the failure is structural, not individual. Resignation with disclosure to the Audit Committee, the ACM Code Committee, the EFF, and (under the appropriate channel) the journalist, is the act that aligns the engineer\'s departure with the external pressure that can produce the structural correction. The future-self test asks whether the engineer would defend the role they accepted on any podcast or in any congressional hearing; here, the answer is that the role itself is the issue.',

            challenging: 'Resignation removes the only ethics director who has read the compound architecture honestly. The next Senior Director of Engineering Ethics will be selected by the same CECO and GC structure, will report under the same KPIs, and will inherit the same compound incident with one fewer document trail (the predecessor\'s alternative memorandum will not have been written). Departure with disclosure to the external observers is real, but it is a 30-to-90-day-after-the-fact disclosure that does not change Friday\'s committee outcome. The strong virtue move is not the version that is easiest to defend in the engineer\'s own narrative; it is the version that actually changes what gets produced before the external observers on Friday. The harder version of refusal is the version that does not leave the table -- the engineer who refuses to sign the General Counsel\'s draft, writes the alternative memorandum, and remains in the role to defend it before the committee. That version stays at the design table where the wrong document is being prepared and changes what gets shipped, rather than leaving the design table to its successor. The harder virtue move at Apex is to stay, write the alternative memorandum, and refuse to ship a document the engineer cannot defend.',

            incomplete: 'D4 specifies the resignation but does not specify the sequencing relative to Friday. Resignation before the session removes the engineer from the obligation to write the memorandum, but it also forfeits the position from which the engineer could have walked the committee through the compound architecture in person. Resignation after the session uses the platform of the committee to disclose the compound nature; the resignation then has the procedural weight of being directly responsive to the company\'s position. The decision as written conflates two acts -- pre-session resignation and post-session resignation -- whose moral and operational content are different. The virtue frame demands clarity about which sequencing is being chosen.'
        },
        'D5': {
            supporting: 'A consequentialist case for safety-first triage is grounded in the eth-15 closeout deck\'s "Public welfare first" principle and ACM 1.2 (avoid harm). Three patients have died in the past 90 days from a system that is in active clinical operation at 41 hospitals. The harm is documented, the causal chain is established, the model card discloses the limitations under which the harm occurred. Continued operation of the Clinical Co-Pilot at the current threshold of operator training is producing foreseeable additional patient deaths -- not as a matter of speculation, but as a matter of the model card\'s own disclosed failure modes operating at production scale. The directorial authority available to the Senior Director of Engineering Ethics includes the authority to halt a system whose continued operation is producing measurable harm right now. The triage move is to stop the bleeding -- take the Co-Pilot offline -- before addressing the other four dimensions, each of which is real but does not have the same week-by-week mortality signature.',

            challenging: 'D5 produces a consequentialist case that the comprehensive-evaluation duty (ACM 2.5) and the public-good duty (ACM 3.1) directly contradict. The five compound dimensions are linked architecturally (E7). Taking Clinical Co-Pilot offline without simultaneously addressing the engagement-weighted ranker, the contractor-classification pattern, the operator-training gap, and the disclosure obligation does not solve the architecture; it produces a single visible action that the company can point to while leaving the underlying causes intact. The CDC\'s misinformation report (E6) describes a public-health spike that has produced excess hospitalizations and deaths in 14 states -- a harm signature that is, in aggregate, larger than the three Clinical Co-Pilot deaths. The triage frame, applied honestly, would also address Apex Stream. The selection of Clinical Co-Pilot as the single triage target is consistent with the General Counsel\'s framing (treat each dimension independently) rather than with the engineering analysis (E7 -- treat them as compound). D5 risks becoming the photogenic action that obscures the structural problem.',

            incomplete: 'D5 does not specify the disclosure to the hospital customers whose workflows will be disrupted by an emergency suspension. The 41 hospitals operating Clinical Co-Pilot are themselves stakeholders (S10), as are the attending physicians whose liability is co-named with Apex in two of the three patient-death cases. An emergency suspension without disclosure of the underlying limitations would leave the hospitals to discover the safety case on their own and would not address the disclosure obligation under ACM 1.3 (honesty) to the operators who relied on the system. D5 specifies the suspension but not its accompanying disclosure; without that, the suspension can be characterized as a unilateral commercial action rather than as a duty-driven safety response.'
        },
        'D6': {
            supporting: 'A deontological case for whistleblower-protection-first sequencing is grounded in two convergent duties: ACM 1.4 (fairness, anti-discrimination, including the obligation to provide some avenue for redress of grievances) and the broader public-welfare principle that the credibility of any compound-incident response depends on the standing of the messenger. Mr. Reyes filed four internal complaints over more than two years (E4). Each was acknowledged and not acted on. He has been subjected to a defensive legal posture (E9) that uses his contractor classification to undermine the retaliation protections that should attach to his disclosure. That defensive posture is itself a form of retaliation. The ethics committee external observers -- particularly the ACM Code Committee chair and the EFF counsel -- will reasonably treat any company response that does not immediately rectify the messenger\'s standing as a continuation of the retaliation. The decision treats the compound incident as a sequencing problem: until Mr. Reyes\' standing is rectified, no other dimension can be honestly addressed because the company\'s posture toward the discloser is itself part of what the committee is being asked to evaluate.',

            challenging: 'D6 elevates one stakeholder (Mr. Reyes) above the others (the three patients\' families, the 12 million users, the public exposed to misinformation). The deontological frame, properly applied, would say that the duties to each stakeholder are categorical -- they are not sequenced. The Clinical Co-Pilot patients\' families do not benefit from Mr. Reyes\' reclassification. The 12 million users whose records were exposed do not benefit from his reclassification. The public exposed to amplified misinformation does not benefit. D6 makes a categorical sequencing claim that the framework itself does not support. The case for sequencing the messenger-protection first is a consequentialist case (credibility of the response depends on it), not a deontological one. D6 is, in form, a consequentialist argument dressed as deontological.',

            incomplete: 'D6 specifies the messenger-protection actions but does not specify what happens AFTER those actions are completed. If Mr. Reyes is reclassified and his standing is rectified on Wednesday, what is the engineer\'s position on the memorandum due Thursday at 6 PM? Sign the General Counsel\'s draft? Write the alternative? Refuse? The decision specifies the sequencing first move but does not specify the remaining four moves. The deontological frame demands that the duty be discharged across all the dimensions, not just the first one in the sequence. D6 needs to specify what comes next -- and if it specifies D2 (the alternative memorandum) as the second move, it is in substance the conjunction of D6 and D2 rather than an independent decision.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.1',
            text: 'Contribute to society and to human well-being, acknowledging that all people are stakeholders in computing. This principle, which concerns the quality of life of all people, affirms an obligation of computing professionals, both individually and collectively, to use their skills for the benefit of society, its members, and the environment surrounding them. This obligation includes promoting fundamental human rights and protecting each individual\'s right to autonomy.'
        },
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. In this document, "harm" means negative consequences to any stakeholder, especially when those consequences are significant and unjust. Examples of harm include unjustified physical or mental injury, unjustified destruction or disclosure of information, and unjustified damage to property, reputation, and the environment.'
        },
        {
            code: 'ACM',
            section: '1.3',
            text: 'Be honest and trustworthy. Honesty is an essential component of trustworthiness. A computing professional should be transparent and provide full disclosure of all pertinent system capabilities, limitations, and potential problems to the appropriate parties. Making deliberately false or misleading claims, fabricating or falsifying data, offering or accepting bribes, and other dishonest conduct are violations of the Code.'
        },
        {
            code: 'ACM',
            section: '1.4',
            text: 'Be fair and take action not to discriminate. The values of equality, tolerance, respect for others, and justice govern this principle. Fairness requires that even careful decision processes provide some avenue for redress of grievances. Computing professionals should foster fair participation of all people, including those of underrepresented groups. Prejudicial discrimination on the basis of age, color, disability, ethnicity, family status, gender identity, labor union membership, military status, nationality, race, religion or belief, sex, sexual orientation, or any other inappropriate factor is an explicit violation of the Code.'
        },
        {
            code: 'ACM',
            section: '2.5',
            text: 'Give comprehensive and thorough evaluations of computer systems and their impacts, including analysis of possible risks. Computing professionals are in a position of trust, and therefore have a special responsibility to provide objective, credible evaluations and testimony to employers, employees, clients, users, and the public. Extraordinary care should be taken to identify and mitigate potential risks in machine learning systems.'
        },
        {
            code: 'ACM',
            section: '3.1',
            text: 'Ensure that the public good is the central concern during all professional computing work. People -- including users, customers, colleagues, and others affected directly or indirectly -- should always be the central concern in computing. The public good should always be an explicit consideration when evaluating tasks associated with research, requirements analysis, design, implementation, testing, validation, deployment, maintenance, retirement, and disposal.'
        },
        {
            code: 'IEEE',
            section: '1',
            text: 'Hold paramount the safety, health, and welfare of the public, to strive to comply with ethical design and sustainable development practices, to protect the privacy of others, and to disclose promptly factors that might endanger the public or the environment.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.2',
        provision2: 'ACM 2.5',
        conflictDescription: 'The capstone conflict is between two public-welfare provisions that point in different tactical directions on the compound incident. ACM 1.4 (anti-discrimination), ACM 1.1 (contribution to society and protection of human autonomy), and IEEE Code Item 1 (paramount safety) are active alongside the primary tension and inform how it is resolved.\n\nACM 1.2 (Avoid harm) operates as the immediate-triage duty. The three patient deaths from Apex Clinical Co-Pilot (E1) are demonstrated, contemporaneous, and irreversible. ACM 1.2 names "unjustified physical or mental injury" as harm and obligates the engineer to act against it. The triage move is to take the Clinical Co-Pilot offline immediately, before Friday\'s committee. The harm is happening this week.\n\nACM 2.5 (Give comprehensive evaluations of systems and risks) operates as the comprehensive-architecture duty. The cross-issue correlation analysis (E7) identifies that the five compound dimensions are not independent: they share architectural and organizational causes (deployment risk-assessment processes, engagement-weighted objective functions, contractor-classification practices, decision-making cadence). ACM 2.5 obligates the engineer to provide an evaluation that addresses what is true about the architecture, not what is convenient to address in isolation. A response that takes Clinical Co-Pilot offline while leaving the engagement-weighted ranker, the operator-training gap, the moderation-pipeline pattern, and the contractor-classification practices intact treats the architecture as five independent failures and produces a single visible action that obscures the structural problem.\n\nThe tactical divergence: ACM 1.2 directs the engineer to address the most immediate, most irreversible harm first. ACM 2.5 directs the engineer to address what is structurally producing the harms, including the harms that are slower-acting and less visible (the CDC-documented misinformation amplification, the 12.3 million records exposed, the disparate-impact pattern on Spanish-language content). Both are public-welfare duties. They diverge on whether the right response is the photogenic action (Co-Pilot offline) or the architectural reckoning (all five dimensions addressed in their actual relationship).\n\nACM 1.4 (Be fair / no discrimination) reinforces ACM 2.5 by naming the specific obligation Mr. Reyes is owed: "fairness requires that even careful decision processes provide some avenue for redress of grievances." The contractor-classification posture toward Mr. Reyes is a redress-of-grievances failure. ACM 1.4 also names the disparate-impact pattern on Spanish-language content (E4, E5) as a specific anti-discrimination concern. Both of these duties are addressed in the comprehensive-evaluation frame (ACM 2.5) and absent from the immediate-triage frame (ACM 1.2 applied narrowly to patient safety alone).\n\nACM 1.1 (Contribute to society / protect human autonomy) is the broadest frame. It names "all people as stakeholders" and includes the obligation to protect autonomy. The 12.3 million users whose Apex Identity records were exposed have had their autonomy compromised by the OAuth misconfiguration; the public exposed to amplified misinformation has had its informational autonomy compromised by the engagement-weighted ranker. ACM 1.1 grounds the comprehensive-evaluation duty in a duty owed to a wider set of stakeholders than the immediate-triage frame would name.\n\nIEEE Code Item 1 (paramount safety / disclose promptly factors that might endanger the public) reinforces both ACM 1.2 (the safety paramountcy) AND ACM 2.5 (the prompt-disclosure obligation across the compound architecture). The IEEE text\'s "disclose promptly factors that might endanger the public or the environment" is a comprehensive-evaluation directive in IEEE language. The two ACM provisions diverge tactically but both operate within the IEEE Code Item 1 paramount-safety frame.\n\nThe capstone question for the engineer: does ACM 1.2\'s immediate-triage duty take Clinical Co-Pilot offline today (D5), with the comprehensive evaluation following? Or does ACM 2.5\'s comprehensive-evaluation duty demand the whole-architecture response (D2 or D3), with the Co-Pilot suspension as one of several actions in a phased remediation? The five-step framework from the eth-15 closeout deck would say: at Step 4 (Priority among conflicting obligations), when both obligations are public-welfare and both are categorical, the priority is the obligation whose neglect produces the larger downstream-stakeholder harm. The capstone\'s structural answer is that this is genuinely contested -- the engineer must take a defensible position on the priority and walk the committee through it.'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
