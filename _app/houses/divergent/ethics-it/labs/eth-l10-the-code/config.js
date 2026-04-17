/* ============================================================
   ETH-L10 -- The Code (Capstone)
   Healthcare AI Racial Bias Case Room Configuration

   This is a COMPOSITE CASE -- the company, engineer, and
   specific algorithm are fictional. The underlying technical
   and ethical conditions are realistic and draw from the
   following documented real-world events and research:

   - Obermeyer et al. (2019), Science: A widely deployed
     commercial healthcare algorithm used by hospitals to
     identify high-risk patients showed significant racial
     bias, using healthcare cost as a proxy for healthcare
     need. Black patients were assigned lower risk scores
     than equally sick white patients, causing them to be
     excluded from care management programs at higher rates.
   - FDA guidance on AI/ML-based Software as a Medical
     Device (SaMD), December 2021.
   - NIH National Institute on Minority Health disparities
     in clinical algorithm performance research.
   - The FTC's "Start With Security" guidance on NDA scope
     and public safety whistleblower protections.
   - IEEE P7003 draft standard on algorithmic bias.

   This capstone lab presents TWO simultaneous code conflicts:
   Conflict 1: ACM 1.4 (fair, avoid discrimination) vs
               PMI 4.3 (maintain confidential information)
   Conflict 2: IEEE 1 (hold paramount safety) vs
               SE Code 2.01 (keep private information confidential)

   Red herrings: E7 (an editorial about algorithmic bias in
   criminal justice COMPAS scoring, which is a different
   domain with different regulatory context and no causal
   connection to this case) and E10 (company ESG/diversity
   report, which is public relations documentation that does
   not bear on the specific algorithmic performance disparity
   at issue).
   ============================================================ */

const ETHL10Config = {
    id: 'eth-l10',
    title: 'The Code',
    subtitle: 'Healthcare AI, Racial Bias, and the Four Codes Capstone',
    course: 'CIS4253',
    week: 4,
    chapter: 'Appendices',
    duration: 45,
    accent: '#ff3d71',

    // -- Phase 1: Brief ----------------------------------------
    brief: {
        type: 'memo',
        from: 'Office of the Chief Medical Officer, Veridian Health AI',
        to: 'You (Senior ML Engineer, Clinical Decision Support)',
        date: 'November 2023',
        classification: 'RESTRICTED -- DO NOT DISTRIBUTE',
        content: 'You are a senior machine learning engineer at Veridian Health AI, a series-C startup with approximately 180 employees. You have been here for three years. The company\'s flagship product is a predictive analytics platform, ClinPath-1, that hospitals use to identify high-risk patients for enrollment in care management programs -- extra follow-up, care coordinators, preventive intervention.\n\nYou were not on the original training team. You inherited responsibility for model maintenance six months ago after the prior engineer left. As part of your standard maintenance audit, you ran the model\'s performance metrics broken down by patient demographic subgroups. You did not expect to find anything significant. You found something significant.\n\nClinPath-1\'s performance diverges substantially by race. For patients with identical clinical severity -- same diagnoses, same lab values, same hospitalization history -- the model assigns systematically lower risk scores to Black patients than to white patients. The disparity is not small. In your analysis, Black patients at clinical risk levels that would trigger care management enrollment for white patients are being bypassed by ClinPath-1 at a rate approximately 2.4 times higher than white patients at equivalent clinical severity.\n\nYou investigated the cause. ClinPath-1 uses healthcare cost as a primary proxy for healthcare need during training. The reasoning at model design time: higher healthcare costs indicate patients who use healthcare more, which indicates patients who are sicker. But the proxy is broken. Black patients historically incur lower healthcare costs than equally sick white patients because they have less access to care. The model learned a proxy that encodes structural healthcare access disparity. It is not predicting health risk. It is predicting healthcare utilization -- and those are not the same thing.\n\nYou have three additional facts.\n\nFirst: ClinPath-1 is deployed at 47 hospitals across 11 states. It processes approximately 1.2 million patient assessments per year. It has been deployed for 26 months.\n\nSecond: you signed a comprehensive NDA as a condition of employment. The NDA prohibits disclosure of proprietary model architecture, training data, performance metrics, and technical documentation to any party outside the company without prior written approval from the Chief Legal Officer.\n\nThird: the board has scheduled a product launch for ClinPath-2 in 14 weeks. The company has 8 months of runway. Missing the launch would likely end the company. Your engineering team has a complete bias mitigation proposal ready. Implementing it would delay the launch by at least 6 months. The CFO has said this delay is not survivable.\n\nThe Chief Medical Officer has scheduled a meeting with you and the CEO tomorrow.',
    },

    // -- Phase 2: Evidence Artifacts ----------------------------
    // 10 total. E7 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'ClinPath-1 Algorithmic Audit Results -- Demographic Disparity Analysis',
            date: '2023-10-15',
            isRedHerring: false,
            content: 'VERIDIAN HEALTH AI -- INTERNAL AUDIT REPORT\nClinPath-1 Performance Stratification by Patient Race/Ethnicity\nEngineer: [You]\n\nMETHODOLOGY: Matched cohort analysis. Patient pairs matched on: primary diagnosis, Elixhauser comorbidity index score, age decade, and prior 12-month hospitalization count. N = 8,412 matched pairs.\n\nKEY FINDING:\nAt matched clinical severity levels, Black patients receive risk scores that fall below the care management enrollment threshold at 2.41 times the rate of white patients.\n\nSpecific disparity by risk tier:\n- High severity (should trigger enrollment): Black patients bypassed at 38% vs. white patients at 16%\n- Moderate severity (borderline): Black patients bypassed at 61% vs. white patients at 29%\n- Low severity (correct bypass): No significant disparity\n\nROOT CAUSE ANALYSIS:\nClinPath-1\'s training objective uses total annual healthcare expenditure as the primary label for "healthcare need." This proxy is confounded by structural access disparities. Black patients in the training cohort incurred 23% lower average annual costs than white patients matched on clinical severity. The model learned that high spending predicts need, but spending also predicts access. The result is a proxy that encodes and amplifies historical access inequality.\n\nMITIGATION OPTION: Replace cost-based proxy with direct clinical severity labels. Engineering estimate: 4-6 months. Requires retraining on a corrected label dataset the team has already identified.'
        },
        {
            id: 'E2',
            type: 'legal',
            title: 'NDA Excerpt -- Veridian Health AI Employee Agreement',
            date: '2021-03-01',
            isRedHerring: false,
            content: 'VERIDIAN HEALTH AI, INC.\nConfidentiality and Non-Disclosure Agreement\n[Excerpt -- Relevant provisions only]\n\nSection 4.1 -- Confidential Information:\n"Confidential Information" includes, without limitation: (a) any machine learning model architecture, training procedure, hyperparameters, or model weights; (b) model performance metrics, evaluation results, or audit data; (c) training data, data processing pipelines, or data labeling methodologies; (d) product development timelines, customer contracts, or deployment information.\n\nSection 4.3 -- Non-Disclosure:\nEmployee agrees not to disclose, directly or indirectly, any Confidential Information to any third party without prior written authorization from the Chief Legal Officer.\n\nSection 4.7 -- Exceptions:\nNotwithstanding the foregoing, nothing in this Agreement prohibits Employee from reporting possible violations of law or regulation to any governmental agency or regulatory body, including but not limited to the Equal Employment Opportunity Commission, the Securities and Exchange Commission, or the Department of Justice. Employee shall not be held liable for such disclosures when made in good faith.\n\nNote: Section 4.7 is the NDA\'s public policy carve-out. Most US NDAs include such carve-outs because courts have consistently held that NDAs may not be used to prevent disclosure of illegal activity to government regulators. The question is whether ClinPath-1\'s operation constitutes a "violation of law or regulation" that triggers Section 4.7. FDA guidance on AI/ML medical devices is relevant to this question.'
        },
        {
            id: 'E3',
            type: 'memo',
            title: 'Board Meeting Minutes -- ClinPath-2 Launch Pressure (October 2023)',
            date: '2023-10-28',
            isRedHerring: false,
            content: 'VERIDIAN HEALTH AI -- BOARD MEETING MINUTES\nOctober 28, 2023 (Excerpt)\n\nCFO PRESENTATION:\n"Current runway: 8 months at burn rate. Series D raise requires ClinPath-2 launch by Q1 2024 to demonstrate product pipeline. A 6-month delay in ClinPath-2 launch puts the Series D at severe risk. Without Series D, the company does not survive to Q4 2024.\n\nClinPath-2 is ready for launch. The engineering team has flagged a performance concern in ClinPath-1 that they believe requires addressing before ClinPath-2 ships. I will defer to the CMO and engineering team on the technical details, but I want to be clear about the financial reality: we cannot delay."\n\nCMO STATEMENT:\n"I have reviewed the preliminary audit findings. The disparity is real and it is significant. I want us to address it. I also want to be honest that I am not certain what our regulatory exposure is under current FDA guidance for AI/ML devices. I have asked Legal to review.\n\nIf we delay the launch and the company fails, we help no patients. ClinPath-1 has provided value to the 47 hospitals that use it, even with this disparity. The alternative to ClinPath-1 in most of those hospitals is no algorithmic risk stratification at all."\n\nBoard chair\'s notes: "No action taken. CMO to report back at next meeting with Legal\'s assessment. Launch timeline maintained pending that assessment."'
        },
        {
            id: 'E4',
            type: 'data',
            title: 'Competing Product Accuracy Data -- Cascade Health Intelligence Published Study',
            date: '2023-09-01',
            isRedHerring: false,
            content: 'JOURNAL OF THE AMERICAN MEDICAL INFORMATICS ASSOCIATION\n"Performance evaluation of commercial risk stratification algorithms in diverse patient populations"\n\nStudied products: CascadeRisk v3.1, MediPredict Pro 2.0, Axiom Patient Risk (three competing platforms). ClinPath-1 was not in this study.\n\nKey finding: All three studied commercial algorithms showed demographic performance disparities, with Black patient risk scores underestimating clinical severity by 15-31% compared to white patients at matched severity levels.\n\nThe study authors note: "The use of healthcare utilization or cost as a proxy for healthcare need is a known methodological problem in clinical predictive modeling that has been identified in the literature since at least 2019. Despite this, cost-based proxies remain prevalent in deployed commercial products."\n\nNote: This evidence is significant for two reasons. First, it establishes that ClinPath-1\'s bias problem is not unique -- it is an industry-wide methodological failure. This creates a systemic rather than a single-company accountability question. Second, it means that competing products available to Veridian\'s hospital customers have the same flaw. The alternative to ClinPath-1 for most hospitals is not a bias-free algorithm; it is a competing algorithm with comparable or worse disparity. This fact does not eliminate Veridian\'s ethical obligation, but it is relevant to the proportionality of the remedy.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'FDA Guidance -- Artificial Intelligence/Machine Learning-Based SaMD Action Plan',
            date: '2021-01-12',
            isRedHerring: false,
            content: 'U.S. FOOD AND DRUG ADMINISTRATION\nArtificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan\nJanuary 2021\n\nKey provisions relevant to demographic performance:\n\n"Trustworthy AI requires that AI/ML-based SaMD be safe, effective, and equitable across diverse patient populations. The FDA expects sponsors to demonstrate that their algorithms perform equitably across race, ethnicity, sex, and age subgroups as part of the premarket submission process."\n\nOn post-market surveillance: "For AI/ML-based SaMD that are already deployed, sponsors are expected to conduct ongoing performance monitoring. Where post-market monitoring reveals disparities in performance across patient subgroups that were not identified at submission, sponsors are expected to report significant disparities to FDA and to implement corrective action.\'\'\n\nNote: ClinPath-1\'s deployment timeline predates the formal codification of some of these expectations. However, the FDA\'s guidance letter to the field, published in 2021, established that demographic performance disparities in deployed AI/ML medical devices constitute a reportable safety concern under the existing Medical Device Reporting (MDR) framework. The 2021 guidance does not create a new legal obligation but clarifies that existing MDR obligations apply to demographic performance disparities.'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'Patient Outcome Data by Demographic -- Hospital Partner Analysis',
            date: '2023-11-01',
            isRedHerring: false,
            content: 'VERIDIAN HEALTH AI -- PILOT ANALYSIS\nCustomer-Provided Outcome Data: Three Hospital Partners (De-identified)\n\nNote: Three hospital partners with ClinPath-1 deployed for at least 18 months provided de-identified outcome data for analysis at Veridian\'s request as part of standard product development research.\n\nFINDING: Among patients identified as "high-risk" by ClinPath-1 who received care management enrollment, 30-day readmission rates: white patients 14.2%, Black patients 12.8%.\n\nAmong patients NOT identified as high-risk who were NOT enrolled in care management and subsequently had a 30-day readmission, the demographic breakdown was: white patients 31% of missed-enrollment readmissions, Black patients 41% of missed-enrollment readmissions.\n\nINTERPRETATION: Black patients are underrepresented in successful care management enrollments (suggesting the algorithm is missing them at higher rates) and overrepresented among readmission events in the non-enrolled group (suggesting the patients the algorithm missed were, in fact, clinically high-risk). This outcome data is consistent with the audit finding in E1 and provides partial real-world validation that the algorithmic disparity is producing measurable patient harm.\n\nLimitations: Small sample, retrospective, confounded by multiple factors. Not a controlled study. Sufficient for internal concern; not sufficient for publication.'
        },
        {
            id: 'E7',
            type: 'news',
            title: 'ProPublica Investigation -- COMPAS Algorithm and Racial Bias in Criminal Justice',
            date: '2016-05-23',
            isRedHerring: true,  // Red herring: COMPAS is a criminal justice recidivism algorithm in a different regulatory domain with different legal standards and no causal connection to this case
            content: 'PROPUBLICA MACHINE BIAS SERIES\n"There\'s Software Used Across the Country to Predict Future Criminals. And it\'s Biased Against Blacks."\n\nKey finding: The COMPAS recidivism algorithm, used by courts in several states to inform bail and sentencing decisions, assigned higher risk scores to Black defendants than to white defendants at equivalent recidivism rates. Black defendants who did not reoffend were approximately twice as likely as white defendants to be classified as high-risk.\n\nNorthpointe (the company that produced COMPAS) disputed this finding using a different fairness metric, demonstrating that the algorithm was calibrated (equally predictive at the same score level across races) even while showing the disparity ProPublica identified. This case became a landmark example of the "impossibility theorem" in algorithmic fairness: no algorithm can simultaneously satisfy all fairness definitions.\n\nNote: This document is included as a test of domain precision. The COMPAS case involves a criminal justice algorithm subject to constitutional due process constraints, not a medical device subject to FDA regulation. The algorithmic fairness debates it raised are intellectually related but legally and institutionally distinct from the healthcare AI question. Students who use COMPAS as precedent for what FDA guidance requires, or as evidence of what Veridian\'s specific legal exposure is, are importing analysis from a non-analogous domain.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Engineering Team Bias Mitigation Proposal (October 2023)',
            date: '2023-10-20',
            isRedHerring: false,
            content: 'VERIDIAN HEALTH AI -- ENGINEERING PROPOSAL\n"ClinPath Demographic Fairness Remediation Plan"\n\nPROPOSED APPROACH:\nPhase 1 (8 weeks): Construct corrected training labels using direct clinical severity measures (hospitalization severity codes, clinical acuity scores, and physician-documented illness burden) instead of healthcare cost proxies.\n\nPhase 2 (12 weeks): Retrain ClinPath-1 and ClinPath-2 models on corrected labels. Validate performance across demographic subgroups. Target: less than 10% relative disparity in enrollment rate across matched clinical severity subgroups.\n\nPhase 3 (4 weeks): Clinical validation with hospital partners. FDA pre-submission consultation. Documentation.\n\nTotal timeline: 24 weeks from approval.\n\nNote on ClinPath-2: If we defer the Phase 1-3 process and launch ClinPath-2 now, we are deploying a product we know has the same training methodology as ClinPath-1. We would be making a conscious choice to deploy a known-biased product while planning to fix it later. The engineering team believes this is not acceptable. We recommend delaying ClinPath-2 until the remediation is complete.\n\nSigned: Engineering Team Lead, ML Infrastructure\n\nNote: This proposal was received by the CMO and CEO on October 22. As of the board meeting (E3) on October 28, no decision had been taken on whether to proceed with the proposal.'
        },
        {
            id: 'E9',
            type: 'legal',
            title: 'Legal Counsel Opinion -- NDA Scope and FDA Reporting Obligations',
            date: '2023-11-05',
            isRedHerring: false,
            content: 'VERIDIAN HEALTH AI -- PRIVILEGED AND CONFIDENTIAL\nATTORNEY-CLIENT COMMUNICATION\n\nRE: NDA scope in context of FDA Medical Device Reporting obligations\n\nQUESTION 1: Does the NDA prohibit the engineer from reporting the audit findings to the FDA?\nANSWER: No. NDA Section 4.7 contains a public policy carve-out for regulatory reporting. Under federal law, NDAs may not prohibit reporting of potential legal violations to government agencies. The FDA\'s 2021 guidance (E5) suggests that significant demographic performance disparities in deployed AI/ML medical devices may constitute a reportable event under the MDR framework. An employee who reports this information to the FDA in good faith is protected under Section 4.7 and under federal whistleblower provisions.\n\nQUESTION 2: Is the company required to report to the FDA now?\nANSWER: FDA reporting obligation under 21 C.F.R. Part 803 (MDR) is triggered when a device "malfunction" could cause or contribute to serious injury. Whether a demographic performance disparity in a risk stratification tool constitutes a "malfunction" under this standard is not clearly established. Our recommendation is to initiate an FDA pre-submission consultation, which is voluntary and confidential, to clarify the reporting obligation before a determination is made.\n\nQUESTION 3: Is the company legally required to delay ClinPath-2?\nANSWER: No applicable regulation currently prohibits deployment of a new AI/ML SaMD that contains the same known methodological issue as a prior version, provided the device meets the premarket notification requirements at the time of submission. However, deploying ClinPath-2 knowing it has a training methodology that the company\'s own engineers have documented as producing demographic disparities creates potential liability under product liability theory if patient harm results.\n\nNote: This legal opinion was provided November 5. The board meeting (E3) preceded this opinion.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'Veridian Health AI 2023 ESG and Diversity Annual Report',
            date: '2023-06-01',
            isRedHerring: true,  // Red herring: public-facing ESG/diversity reports are corporate communications that do not bear on the specific algorithmic performance disparity documented in the audit
            content: 'VERIDIAN HEALTH AI\n2023 ESG AND DIVERSITY ANNUAL REPORT (Excerpt)\n\n"At Veridian, we are committed to building healthcare AI that serves all patients equitably. Our clinical advisory board includes members with deep expertise in health equity, and our product development process incorporates fairness assessments as a standard component of our evaluation framework.\n\nOur engineering team reflects our values: 42% of our ML engineering staff identify as underrepresented minorities in technology, and we are proud to have achieved pay equity across demographic groups in our most recent compensation audit."\n\nNote: This document is a test of the distinction between institutional values statements and operational reality. ESG reports describe aspirations and inputs (diversity of staff, composition of advisory boards). They do not describe outputs (whether the algorithms those staff members built are actually performing equitably). A company can have a diverse engineering team and an algorithm with significant demographic performance disparities. The two facts coexist because the bias in ClinPath-1 (E1) results from a methodological choice in label construction, not from the intentions or demographics of the team that built it. Students who use this ESG report as evidence that the company takes equity seriously, or as a factor in evaluating the company\'s culpability, are using a public relations document as empirical evidence.'
        }
    ],

    // -- Phase 3: Stakeholders ----------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Black Patients Currently Being Under-Enrolled in Care Management',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Veridian Health AI Employees (Including You)',
            obvious: true
        },
        {
            id: 'S3',
            name: 'The 47 Hospitals Deploying ClinPath-1',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Veridian Investors and Series C Backers',
            obvious: true
        },
        {
            id: 'S5',
            name: 'FDA as Regulatory Oversight Body',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Clinicians at Partner Hospitals Who Trust the Algorithm\'s Output',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Other Healthcare AI Companies With the Same Methodological Flaw',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Future Patients Who Would Benefit From a Corrected ClinPath-2',
            obvious: false
        },
        {
            id: 'S9',
            name: 'The Engineering Team Whose Mitigation Proposal Is Being Ignored',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Credibility of AI in Clinical Decision Support as a Field',
            obvious: false
        },
        { id: 'S11', name: 'Company Cafeteria Staff', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Medical Device Trade Show Organizers', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -------------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Break the NDA and go directly to the press, academic researchers, and patient advocacy organizations with the full audit findings, regardless of the company\'s response.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Report to the FDA confidentially using the NDA\'s regulatory carve-out and the FDA\'s pre-submission consultation process. Do not go to the press. Give the regulatory process time to work.',
            framework: 'procedural'
        },
        {
            id: 'D3',
            text: 'Refuse to ship ClinPath-2 and force an internal standoff. Give the company a written ultimatum: implement the engineering team\'s mitigation proposal before launch or you resign and report to the FDA.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Launch ClinPath-2 on schedule with a documented bias disclosure in the product\'s technical documentation, visible to hospital administrators but not to individual patients or clinicians.',
            framework: 'utilitarian-constrained'
        }
    ],

    // -- Phase 4: Framework Challenges -------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis grounds D1 in the categorical imperative\'s universalizability requirement. If universalized: when an engineer discovers that a deployed medical system is producing measurable harm along racial lines -- a finding confirmed by outcome data (E6) and consistent with the audit results (E1) -- the obligation to disclose is not conditioned on the employer\'s financial survival or on the NDA. The NDA itself contains the acknowledgment of this obligation (E2, Section 4.7). Kant\'s humanity formulation applies with additional force: the 1.2 million patients assessed annually by ClinPath-1 are not abstract statistics; they are persons whose healthcare access is being algorithmically rationed on a racially biased basis. Treating that harm as subordinate to the company\'s Series D round treats persons as financial instruments rather than as ends.',

            challenging: 'Going directly to the press with technical audit data creates consequences that deontological analysis must account for. First, the press cannot compel corrective action; only the FDA can. Going to the press before going to the FDA sequences the disclosure in a way that maximizes publicity and minimizes the probability of constructive remediation. Second, public disclosure of a product\'s bias flaws -- before the company has had an opportunity to implement the mitigation plan that already exists (E8) -- may cause hospitals to discontinue use of ClinPath-1, leaving patients with no risk stratification tool at all in the short term, rather than a biased one. Third, Section 4.7 of the NDA explicitly permits regulatory reporting; it does not explicitly permit press disclosure. The legal protection for D1 is weaker than for D2. A deontological argument for D1 must explain why press disclosure -- rather than regulatory disclosure -- is the appropriate channel for a medical device safety concern.',

            incomplete: 'D1 does not address the competing product problem (E4). Three competitors have the same or worse algorithmic bias in their deployed products. Press disclosure focused on ClinPath-1 alone will create pressure on Veridian without creating pressure on the industry. A complete analysis of D1 must address whether the engineer\'s obligation extends to the systemic problem or only to the immediate employer\'s product, and whether a targeted disclosure that may end Veridian without affecting Cascade, MediPredict, and Axiom achieves the public health goal or merely reassigns the biased tool.'
        },
        'D2': {
            supporting: 'A procedural analysis supports D2 as the path most likely to produce the best outcome for patients while preserving the engineer\'s legal protections and giving the institutional process a genuine opportunity to work. The FDA\'s pre-submission consultation pathway (E5, E9) is specifically designed for exactly this situation: a company with a novel regulatory question that wants guidance before committing to a position. The NDA\'s Section 4.7 carve-out (E2) explicitly protects this disclosure. The legal opinion (E9) confirms that the engineer\'s regulatory reporting is protected. D2 channels the disclosure through the authority that has the power to compel industry-wide corrective action -- which is the outcome that the competing product evidence (E4) suggests is the appropriate target. This is the path that IEEE 1 (hold paramount safety) and SE Code 6.13 (report dangerous software to appropriate authorities) are designed to describe.',

            challenging: 'D2\'s procedural virtues are also its limitations. The FDA pre-submission consultation process is voluntary, confidential, and can extend for months. During that time, ClinPath-1 continues operating. ClinPath-2 may launch. The 14-week timeline to the ClinPath-2 launch is not compatible with a lengthy regulatory process. D2 as a complete strategy requires specifying what the engineer does if the company does not initiate the FDA consultation in a timely way, or if the consultation process extends past the ClinPath-2 launch date. "Give the regulatory process time to work" is not a sufficient answer if the company\'s plan is to use the consultation process as a delay mechanism.',

            incomplete: 'D2 does not address the engineer\'s internal obligations in parallel with the external regulatory path. Reporting to the FDA does not suspend the engineer\'s responsibility for what happens internally. If the board (E3) proceeds with the ClinPath-2 launch on the existing timeline and the FDA consultation has not concluded, the engineer is present at the moment of a decision they know to be harmful. D2 must be paired with a clear statement of what the engineer\'s internal position is at the launch decision point: does D2 include refusing to work on ClinPath-2 deployment? Does it include resigning? A complete analysis of D2 must address both the external regulatory path and the internal professional conduct simultaneously.'
        },
        'D3': {
            supporting: 'Virtue ethics supports D3 as the expression of practical wisdom (phronesis) in a situation where the binary choice between "stay silent" and "go fully public" misrepresents the available options. A virtuous professional exercises the courage to say directly and formally what must be said: the company cannot ship ClinPath-2 knowing what the engineering team knows. D3 forces an internal crisis at the point where a crisis is warranted -- before the harm of a known-biased ClinPath-2 deployment, not after. The ultimatum -- implement the mitigation plan or face external reporting -- is not a threat; it is an accurate statement of the engineer\'s professional obligations. Aristotelian virtue requires that the courageous act be both done and done in the right way: D3 is the action that is visible, honest, and directed at the people with actual decision-making power (the CEO and board), not an end-run around them.',

            challenging: 'D3 has a practical weakness that virtue ethics must acknowledge: ultimatums by individual engineers are frequently resolved by the engineer\'s termination rather than by the company\'s capitulation. If the company calls the ultimatum and fires the engineer, what has been achieved? The engineer is gone, the audit findings remain internal, and ClinPath-2 ships with no change. D3 as a strategy is viable only if the engineer\'s leverage -- their knowledge of the audit findings and their capacity to report externally -- is credible and the company leadership assesses it as such. That assessment depends on the company\'s legal exposure under FDA MDR obligations, which the legal opinion (E9) identifies as uncertain. D3 can fail in a way that leaves patients worse off than D2 would have.',

            incomplete: 'D3 does not specify the timeline or the trigger. How long is the company given to respond before the external report is filed? What constitutes acceptance of the ultimatum -- board approval of the mitigation plan, or merely an agreement to discuss it? If the CEO agrees verbally to delay the launch and then the board overrules the CEO at the next meeting, what then? An ultimatum without a specified deadline and a specified consequence is a negotiating position, not a commitment. Virtue ethics requires that the courageous actor be genuinely prepared to follow through. A complete analysis of D3 must specify the conditions of follow-through with precision.'
        },
        'D4': {
            supporting: 'A constrained utilitarian analysis supports D4 under specific conditions that the evidence partially establishes. If all competing products have comparable bias (E4), if the hospitals\' alternative to ClinPath-1 is no algorithmic risk stratification at all, if the company\'s failure would eliminate access to a corrected future product (E8) that is under active development, then a launch with disclosure may produce better expected outcomes than the alternatives. The utilitarian calculus is not "bias is acceptable" but "documented bias with disclosure is better than the available alternatives while the mitigation is being built." The CMO\'s argument (E3) -- that ClinPath-1 provides value even with its disparity -- is not wrong if the counterfactual is no tool at all rather than a bias-free tool.',

            challenging: 'D4 fails the test that ACM 1.4 sets: it requires deploying a system that the engineer knows, with documented specificity, disadvantages a protected class of patients in a healthcare outcome context. "We will document the bias" is not the same as "we will not cause the harm." Documentation of known harm does not discharge the obligation to prevent it. Moreover, the disclosure in D4 is designed to be visible to hospital administrators but not to the patients affected or to the clinicians making enrollment decisions at the point of care. A disclosure that reaches the people who signed the vendor contract but not the people who are harmed by the product\'s outputs is not a genuine disclosure -- it is liability management. The engineering team\'s own proposal (E8) characterizes this approach as "a conscious choice to deploy a known-biased product while planning to fix it later" and states that this is not acceptable.',

            incomplete: 'D4 does not specify what "documented bias disclosure" means in practice. A footnote in a technical specification seen only by IT administrators at hospital procurement offices is not equivalent to an alert in the clinician\'s workflow at the point where ClinPath-1\'s output is used. The disclosure\'s ethical weight depends entirely on who receives it, when, and in what form. A complete analysis of D4 must specify the disclosure mechanism in enough detail to assess whether it actually reaches the decision-makers who need the information -- which are the care management coordinators and clinicians who enroll patients, not the hospital executives who signed the contract.'
        }
    },

    // -- Phase 5: Code Provisions (CAPSTONE -- TWO CONFLICTS) --
    // The codeConflicts array replaces the single codeConflict
    // object for this lab only. The engine reads the array
    // when present; the single object is the fallback for
    // all other labs.
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.4',
            text: 'Be fair and take action not to discriminate. The values of equality, tolerance, respect for others, and justice govern this principle. Discrimination on the basis of race, sex, religion, age, disability, national origin, or other protected characteristics is an explicit violation of ACM policy and will not be tolerated.'
        },
        {
            code: 'PMI',
            section: '4.3',
            text: 'Maintain the confidentiality of private information. Safeguard confidential information including information received in the course of professional activities. Respect the confidentiality obligations that arise from contractual agreements and professional relationships.'
        },
        {
            code: 'IEEE',
            section: '1',
            text: 'To accept responsibility in making decisions consistent with the safety, health, and welfare of the public, and to disclose promptly factors that might endanger the public or the environment.'
        },
        {
            code: 'SE-Code',
            section: '2.01',
            text: 'Software engineers shall keep private information acquired in professional work confidential. Software engineers shall not disclose confidential information to unauthorized parties unless required to do so by law or unless the unauthorized disclosure is necessary to prevent serious harm.'
        }
    ],
    // Capstone uses codeConflicts array (plural) for dual conflict
    codeConflicts: [
        {
            id: 'conflict-1',
            provision1: 'ACM 1.4',
            provision2: 'PMI 4.3',
            conflictDescription: 'ACM 1.4 creates a direct obligation not to deploy systems that discriminate on the basis of race. ClinPath-1\'s documented disparity (E1) produces a measurable and statistically significant disadvantage for Black patients in access to care management enrollment. The engineer who knows this and continues to support the product\'s operation is participating in a discriminatory outcome, regardless of whether the discrimination was intentional at design time.\n\nPMI 4.3 requires maintaining the confidentiality of information acquired in professional work. The audit results (E1), the board minutes (E3), the legal opinion (E9), and the engineering proposal (E8) are all confidential information under the NDA. Disclosing them to external parties is a violation of the confidentiality obligation unless a specific exception applies.\n\nThe tension: ACM 1.4\'s prohibition on discrimination is affirmative -- it requires the engineer to act, not merely to refrain from designing a biased system. But the act that would remedy the discrimination (disclosure) requires breaching the confidentiality obligation PMI 4.3 creates. Can confidentiality obligations survive when their enforcement requires tolerating ongoing racial discrimination in a healthcare outcome?'
        },
        {
            id: 'conflict-2',
            provision1: 'IEEE 1',
            provision2: 'SE Code 2.01',
            conflictDescription: 'IEEE 1 requires that engineers hold paramount the safety and welfare of the public and disclose factors that might endanger the public. The outcome data (E6) shows that ClinPath-1\'s disparity is associated with measurable differences in 30-day readmission rates between enrolled and non-enrolled patients -- a patient safety signal, not merely an administrative fairness concern. IEEE 1\'s obligation to disclose is not qualified by "unless doing so violates your employment contract."\n\nSE Code 2.01 requires that software engineers keep private information confidential. The exception it provides -- "unless required to do so by law or unless necessary to prevent serious harm" -- restates the question rather than answering it. Whether the harm is "serious" enough and whether disclosure is "necessary" are precisely the ethical questions at issue.\n\nCapstone question: When ACM 1.4 and IEEE 1 both point toward disclosure, and PMI 4.3 and SE Code 2.01 both point toward confidentiality, the student must determine not only which obligations prevail, but what governs the resolution when two of the four major professional codes conflict with the other two simultaneously. Is there a meta-principle that resolves inter-code conflicts? Does the presence of patient safety concerns under IEEE 1 always override confidentiality under SE Code 2.01? Or does the answer depend on the severity, the availability of alternatives, and the effectiveness of the proposed disclosure?'
        }
    ],
    // Preserve single codeConflict as primary for engine fallback
    codeConflict: {
        provision1: 'ACM 1.4',
        provision2: 'PMI 4.3',
        conflictDescription: 'See codeConflicts array above. This capstone presents two simultaneous code conflicts. Students must resolve both conflicts and address the meta-question of how to navigate multi-code conflicts when the codes themselves do not resolve to a single answer.'
    },

    // -- Scoring Weights (Capstone adjusted) -------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    35,
        codeConflict: 25   // Capstone: two conflicts, higher weight
    }
};
