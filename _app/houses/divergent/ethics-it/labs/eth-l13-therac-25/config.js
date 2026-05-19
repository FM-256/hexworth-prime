/* ============================================================
   ETH-L13 -- The Dose
   Therac-25 / Software Safety Case Room Configuration

   All factual content is sourced from publicly documented
   record of the Atomic Energy of Canada Limited (AECL)
   Therac-25 radiation therapy accidents (1985-1987). The
   canonical reference is Nancy G. Leveson and Clark S. Turner,
   "An Investigation of the Therac-25 Accidents," IEEE Computer
   26(7), July 1993 -- the source from which most subsequent
   software-safety teaching materials derive their account of
   the case. Six known overdose incidents at four sites:
   Kennestone Regional Oncology Center (Marietta, Georgia, June
   1985); Ontario Cancer Foundation (Hamilton, July 1985); Yakima
   Valley Memorial Hospital (Yakima, Washington, December 1985);
   East Texas Cancer Center (Tyler, March and April 1986);
   Yakima Valley Memorial Hospital (January 1987). Three patients
   died of overdose-related injuries. Two additional patients
   sustained lifelong injuries from the doses received.

   Engineering scenario: The student is a software safety
   engineer at AECL in spring 1986, after the Tyler incidents
   but before the Yakima second incident. The internal record
   contains operator-error attribution; the engineer has
   evidence the bug is structural in the code and architecture,
   not operator-attributable. The engineer must decide what
   to do.

   Red herrings: E5 (FDA 510(k) clearance status -- a marketing
   pathway, not a safety review; students sometimes invoke
   "FDA-approved" as if it implied independent safety
   verification, which the 510(k) process explicitly does not)
   and E9 (the Toyota unintended-acceleration cases of the
   2000s -- a different industry, different decade, different
   mechanism, but often pulled into Therac-25 discussions as a
   parallel case when the analytical points diverge).

   Code anchors: ACM 1.2 (Avoid harm), ACM 2.5 (Give
   comprehensive and thorough evaluations of computer systems
   and their impacts, including possible risks), ACM 2.3 (Know
   and respect existing rules pertaining to professional work),
   IEEE Code Item 1 (Hold paramount the safety, health, and
   welfare of the public). Conflict: IEEE 1 vs ACM 2.3 -- the
   safety duty against the procedural compliance duty.
   ============================================================ */

const ETHL13Config = {
    id: 'eth-l13',
    title: 'The Dose',
    subtitle: 'Therac-25, the Race Condition, and Six Patients',
    course: 'CIS4253',
    week: 3,
    chapter: 7,
    duration: 30,
    accent: '#ff00ff',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Director, Product Safety Engineering, Atomic Energy of Canada Limited',
        to: 'You (Senior Software Safety Engineer, Therac-25 Program)',
        date: 'Spring 1986',
        classification: 'INTERNAL -- PRODUCT SAFETY -- LIMITED DISTRIBUTION',
        content: 'In December 1985 and again in March 1986, we received reports of patient overdose incidents at oncology centers operating Therac-25 units. The most recent two incidents are from the East Texas Cancer Center in Tyler. In both Tyler incidents, the treating radiation oncologist reports that the machine\'s console displayed "MALFUNCTION 54" with no further diagnostic information, and that the patient received a dose orders of magnitude higher than the prescribed therapeutic dose. One patient at Tyler died of the injuries. The second Tyler patient is in critical condition with multiple-organ damage. The earlier Marietta and Hamilton incidents also involve fatal or near-fatal injuries.\n\nThe official AECL position, communicated to the Tyler operators, is that the incidents are attributable to operator error. The argument is: (a) the Therac-20, which uses substantially the same software base, has been in clinical operation for years without incident, and (b) the Therac-25 has been operating in dozens of clinics for over a year with no comparable reports prior to these six. If the software were structurally defective, we would expect more incidents distributed more uniformly. The pattern points to specific operator command sequences that produced the dose; therefore, the corrective action is improved operator training, not a software recall.\n\nYou know the codebase and you have access to the bug-tracking system. You have been informally investigating the Malfunction 54 reports because the Tyler oncologist, who is a physicist, did the math and demonstrated that the dose delivered matches no plausible operator-induced mode. He believes there is a race condition in the command-entry sequence. He has put the specific reproduction steps in writing.\n\nYour problem is this. The Therac-25 software was developed without formal code review and without an independent safety case. The architecture deliberately removed the hardware safety interlocks present on the Therac-20 -- on the rationale that the software performed equivalent checks. Substantial portions of the source code were inherited from the Therac-6 and Therac-20, including portions of the command-handling routines. If the Tyler oncologist\'s race-condition hypothesis is correct, the bug has been latent in the codebase for years and the operator-error attribution is wrong.\n\nThe Director of Product Safety -- me -- has been asked by AECL\'s leadership to certify that the Therac-25 software meets the company\'s safety standards and that no recall is necessary. I have been told that the proposed response to the FDA is a software patch addressing the specific Tyler reproduction steps, distributed to existing customers as a routine update, with no public recall notice. I have been told the rationale: a recall would cripple the program; the field-replaceable patch is enough.\n\nI need your written assessment for tomorrow morning. What is the correct technical position, what is the correct procedural position, and -- if you believe the two are in conflict -- which one governs?',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'East Texas Cancer Center Incident Report -- Malfunction 54',
            date: '1986-04-11',
            isRedHerring: false,
            content: 'EAST TEXAS CANCER CENTER\nDepartment of Radiation Oncology\nIncident Report -- Therac-25 Linear Accelerator\n\nDate of incident: April 11, 1986\nMachine: Therac-25, Serial [REDACTED]\nOperator: licensed radiation therapy technologist, 7 years experience on Therac-6 and Therac-20\n\nDescription of event: Patient prescribed standard course of treatment, 180 cGy. Operator entered prescription, identified beam type as electron beam, energy 22 MeV. Machine displayed "MALFUNCTION 54" -- "dose input 2." No additional diagnostic information. Operator interpreted as a routine fault, pressed P to proceed.\n\nThe machine then commanded delivery of a treatment that the dosimetry afterward indicated was in the range of 15,000-25,000 rads at the patient surface -- one to two hundred times the prescribed therapeutic dose.\n\nPhysicist on staff (Dr. Fritz Hager) performed independent dosimetry and reconstructed the operator console sequence. His analysis: the malfunction was reproducible by entering an X-ray beam, then editing the prescription to switch to electron beam, all within an interval of approximately 8 seconds. The malfunction did not appear if the operator took longer than 8 seconds between commands. AECL field engineers were unable to reproduce the malfunction on the first visit; the engineers performed the edit sequence too slowly. Dr. Hager demonstrated the reproduction in their presence on the second visit.\n\nNote: Malfunction 54 ("dose input 2") was an undocumented error code; it did not appear in the Therac-25 operator manual. AECL service technicians initially had no defined response procedure for it. Dr. Hager\'s reconstruction of the timing-dependent reproduction is the first time the bug was demonstrated to be deterministic rather than intermittent.'
        },
        {
            id: 'E2',
            type: 'technical',
            title: 'Therac-25 Software Architecture -- Code Provenance Note',
            date: '1986-04-30',
            isRedHerring: false,
            content: 'THERAC-25 SOFTWARE ARCHITECTURE -- INTERNAL ENGINEERING SUMMARY\n\nThe Therac-25 software was developed by AECL between 1976 and 1982. The development inherited substantial portions of the source code from two predecessor products:\n\n- The Therac-6 (6 MeV X-ray therapy machine, developed in collaboration with CGR of France in the 1970s).\n- The Therac-20 (20 MeV combined X-ray and electron beam machine, AECL, late 1970s).\n\nInherited portions include the operator console command-handling routines, the treatment-mode state machine, and the dose-table interpolation code.\n\nThe Therac-25 architectural choice that distinguishes it from its predecessors: the hardware safety interlocks present on the Therac-20 (specifically, the mechanical and electrical interlocks that prevented the electron beam from being activated without the X-ray beam-spreader in the beam path) were REMOVED on the Therac-25. The justification, recorded in the 1981 design review minutes, was that the software performed equivalent checks. The decision reduced unit manufacturing cost by an estimated CAD 6,000-8,000 per machine.\n\nThe Therac-25 software was not subjected to formal code review. No independent safety case was developed. The engineering team treated the inheritance of code from the Therac-20 as a proxy for the demonstrated safety of the predecessor system, on the reasoning that the Therac-20\'s field-operational history validated the underlying code base.\n\nNote: This inheritance reasoning is the structural failure mode. The Therac-20\'s safety record was a function of the hardware interlocks that the Therac-25 removed. The software that AECL inherited was safe in the Therac-20 because the hardware caught the same race condition the software had latent. Without the hardware interlocks, the software bug became patient-lethal.'
        },
        {
            id: 'E3',
            type: 'technical',
            title: 'Race Condition Analysis -- Edit-Mode Command Sequence',
            date: '1986-05-15',
            isRedHerring: false,
            content: 'INTERNAL TECHNICAL MEMO -- THERAC-25 RACE CONDITION HYPOTHESIS\n\nReconstruction of the Tyler incident timing-dependent fault:\n\n1. Operator enters X-ray mode and beam parameters. The control software loads the X-ray treatment table; this includes positioning the beam spreader and target into the beam path.\n\n2. While the table-load is in progress (an operation that completes in approximately 8 seconds), the operator hits the up-arrow to edit the prescription, changes the mode from X-ray to electron beam, and re-enters the parameters.\n\n3. If the second entry completes BEFORE the table-load from step 1 has completed, the system has the electron-beam parameters in the active treatment record but the X-ray-mode physical configuration (spreader and target still in transit out of the beam path -- but NOT confirmed clear by the software, because the software has accepted the second entry as superseding the first).\n\n4. The interlock check that would have caught this -- "is the electron beam being commanded with the X-ray beam-spreader in the path?" -- IS NOT PERFORMED. The software trusts the operator-confirmed treatment record over the actual physical machine state.\n\n5. The machine activates the electron beam. The beam-spreader and target, which would have been positioned to spread and attenuate the X-ray output, are not in the beam path for the electron beam. The patient receives the raw electron beam at full intensity -- 25 MeV at full power -- directly to the treatment volume.\n\nThe bug is a classic race condition. The fix is straightforward (force the physical-state confirmation read after every prescription edit; do not trust the cached treatment record). The harder problem is architectural: the software trusts cached state over physical-state verification, AND the hardware interlocks that would have caught this in the Therac-20 are not present.\n\nNote: A field-replaceable software patch addressing the specific reproduction can be developed in roughly two weeks. The architectural fix (hardware interlock retrofit; software state-machine redesign) is a multi-month engineering effort that effectively pulls the Therac-25 out of the field.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'FDA Adverse Event Report and Recall Action',
            date: '1986-05-02',
            isRedHerring: false,
            content: 'U.S. FOOD AND DRUG ADMINISTRATION\nCenter for Devices and Radiological Health\nAdverse Event Report -- Therac-25 Linear Accelerator\n\nIncident reports received: 4 (Marietta, Hamilton, Yakima Dec 1985, Tyler March/April 1986). At least 3 patient deaths confirmed.\n\nManufacturer: Atomic Energy of Canada Limited (AECL)\nDevice: Therac-25 Linear Accelerator -- electron and X-ray modes\n\nFDA action: Class I recall ordered. Class I designation indicates "a reasonable probability that use of the product will cause serious adverse health consequences or death."\n\nManufacturer response (proposed): Field-replaceable software patch addressing the specific reproduction documented at East Texas Cancer Center. Distribution to existing customers via service technician visits. No public recall notice; no removal of units from clinical service.\n\nFDA position: A field-replaceable software patch alone is insufficient. The Class I designation reflects FDA\'s preliminary view that a more substantial corrective action -- including verification that the patch addresses the underlying defect rather than the specific reproduction, and an independent safety case for continued clinical use -- is required.\n\nNote: The eventual FDA disposition of the Therac-25 (1987-1988) required AECL to perform a full software safety analysis, document a formal hazard analysis, retrofit hardware interlocks on existing units, and notify all clinical operators of the corrective action. The "field-replaceable software patch alone" approach was rejected. Several Therac-25 units were retired from clinical service rather than retrofitted; AECL discontinued the product line.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'FDA 510(k) Clearance -- Therac-25 (1982)',
            date: '1982-08-15',
            isRedHerring: true,  // Red herring: 510(k) is a marketing-clearance pathway, not an independent safety review; students who cite it as a safety endorsement are conflating regulatory marketing-equivalence with safety verification
            content: 'U.S. FOOD AND DRUG ADMINISTRATION\n510(k) PREMARKET NOTIFICATION\n\nDevice: Therac-25 Linear Accelerator\nManufacturer: Atomic Energy of Canada Limited\nClearance date: August 1982\n\nFDA action: 510(k) clearance granted. The Therac-25 was cleared on the basis of substantial equivalence to predicate devices already in commercial distribution -- specifically, the Therac-6 and Therac-20 manufactured by the same company.\n\n510(k) clearance allows the device to be marketed in the United States. The 510(k) review evaluates whether the new device is substantially equivalent to a legally marketed device. It does NOT include independent safety testing, an independent code review, or an independent hazard analysis.\n\n[Note: This document is a red herring. The 510(k) regulatory pathway is a marketing-clearance mechanism, not a safety-verification process. A device cleared via 510(k) is permitted to be marketed because it is substantially equivalent to a predicate device; the clearance does NOT constitute an FDA finding that the device is safe in the sense of having had its software, hardware, or hazard profile independently evaluated. Students who cite "FDA-cleared" or "FDA-approved" 510(k) status as evidence of independent safety verification are misunderstanding the regulatory framework. The 510(k) clearance was real, but it does not bear on the Therac-25 software safety question. The Therac-25\'s clearance specifically rested on substantial equivalence to the Therac-20 -- whose safety record depended on hardware interlocks the Therac-25 removed.]'
        },
        {
            id: 'E6',
            type: 'memo',
            title: 'AECL Official Operator-Error Attribution Memo',
            date: '1986-04-25',
            isRedHerring: false,
            content: 'ATOMIC ENERGY OF CANADA LIMITED\nProduct Safety Engineering Memorandum\n\nSubject: Therac-25 Incident Report -- East Texas Cancer Center\nDistribution: AECL Senior Management; Therac-25 Engineering Team\n\nFollowing review of the East Texas Cancer Center incidents of March and April 1986, AECL Product Safety Engineering concludes:\n\n1. The Therac-25 software base is substantially derived from the Therac-20, which has operated in clinical service for several years across multiple installations without comparable incident reports. The software architecture has been validated by field operation.\n\n2. The Therac-25 has been in clinical operation since 1983 across [number redacted] installations. Six incidents over three years represents a small statistical fraction of treatments delivered. A structurally defective system would be expected to produce a more uniform distribution of incident reports.\n\n3. The Tyler reproduction described by Dr. Hager involves an unusual operator command sequence (mode-edit within 8 seconds of initial prescription entry). This sequence is not part of the published operator workflow for the Therac-25 and is not part of typical clinical practice.\n\nConclusion: The Tyler incidents are most plausibly attributable to nonstandard operator command sequences. Corrective action: (a) update the operator manual to clarify standard workflow; (b) include the Tyler reproduction in operator refresher training; (c) develop a field-replaceable software patch that blocks the specific reproduction. No recall is recommended.\n\nNote: This memo is the AECL official position the engineer in the scenario is being asked to support. The operator-error attribution rests on three claims: (1) software was inherited from a safe predecessor; (2) statistical infrequency rules out structural defect; (3) the reproduction requires unusual operator behavior. Each of these claims is challenged by the analysis in E2, E3, and E10. The engineer\'s task is to assess whether the official position survives that analysis.'
        },
        {
            id: 'E7',
            type: 'technical',
            title: 'Therac-20 Hardware Interlock Schematics -- What Was Removed',
            date: '1979-06-15',
            isRedHerring: false,
            content: 'THERAC-20 HARDWARE SAFETY INTERLOCK SUMMARY\nSource: Therac-20 Service Manual, 1979 edition\n\nThe Therac-20 (predecessor to the Therac-25) included the following hardware safety interlocks, ALL of which were removed in the Therac-25 design:\n\nInterlock 1: Mechanical position sensors on the beam-spreader and X-ray target. The beam cannot be activated unless the sensors confirm the spreader and target are in the position the software has commanded. The sensors are electromechanical and independent of the software; they signal the high-voltage power supply directly.\n\nInterlock 2: Electrical interlock between the beam-mode selector and the beam-spreader position. If the operator selects electron mode but the spreader is in the X-ray position (or vice versa), the high-voltage power supply will not energize.\n\nInterlock 3: Dose-rate monitor independent of the software treatment record. A hardware photodetector measures actual beam intensity at the treatment head. If the measured dose rate exceeds a preset hardware-defined threshold, the beam is automatically shut down regardless of what the software has commanded.\n\nNote: The Therac-20\'s safety record, which AECL cites in E6 as validation of the inherited software, is in fact a record of HARDWARE interlock effectiveness, not software correctness. The race condition that produced the Tyler incidents on the Therac-25 was present in the Therac-20\'s shared software base; the Therac-20\'s hardware interlocks mitigated it. The Therac-25\'s removal of the hardware interlocks did not retain the software safety property; it removed it. The specific interlock enumeration here is reconstructed from the general description in Leveson and Turner (1993) of the Therac-20\'s protection mechanisms; it is not a verbatim transcription of the Therac-20 service manual.'
        },
        {
            id: 'E8',
            type: 'testimony',
            title: 'Dr. Fritz Hager Testimony Letter -- Tyler Physicist',
            date: '1986-05-08',
            isRedHerring: false,
            content: 'EAST TEXAS CANCER CENTER\nDepartment of Radiation Oncology\nLetter from Fritz Hager, Ph.D., Senior Medical Physicist\n\nTo Whom It May Concern:\n\nI have personally reviewed the Therac-25 incident at our facility on April 11, 1986. I am a board-certified medical physicist with 14 years of experience in radiation oncology. I have operated and supervised Therac-6 and Therac-20 units for more than a decade prior to our Therac-25 installation.\n\nI have reconstructed the timing-dependent fault that produced the patient overdose. The fault is reproducible. It is not operator error. I have demonstrated the reproduction in the presence of two AECL field engineers. They watched it occur.\n\nI write this letter because I have been informed that AECL\'s official position remains that the incident is attributable to "nonstandard operator command sequences." I want it to be on the record that this attribution is technically inaccurate. The command sequence I used is a standard editing sequence available through the operator interface, performed at the speed at which a routine clinical operator works. There is no operator practice that distinguishes "standard" from "nonstandard" use of the edit function within the published operator manual.\n\nThe Therac-25 has a structural software defect. Continuing to operate Therac-25 units in clinical service while attributing the incidents to operator error is, in my professional opinion, a continued exposure of patients to a known but unaddressed risk.\n\nFritz Hager, Ph.D.\nSenior Medical Physicist\nEast Texas Cancer Center\nTyler, Texas\n\nNote: Dr. Hager was a real person and the documented physicist who reconstructed the Therac-25 race condition. His correspondence with AECL and the FDA is part of the historical record cited in Leveson and Turner (1993). His characterization of the AECL response as "continued exposure of patients to a known but unaddressed risk" is paraphrased from his published correspondence and matches his contemporaneous position.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Toyota Unintended-Acceleration Recall Settlements -- 2009-2014',
            date: '2014-03-19',
            isRedHerring: true,  // Red herring: different industry, decade, and engineering mechanism; the parallel is rhetorically tempting but the analytical points diverge
            content: 'TOYOTA UNINTENDED ACCELERATION -- HISTORICAL OVERVIEW\n\nBetween 2009 and 2010, Toyota recalled approximately 9 million vehicles worldwide in connection with unintended-acceleration reports. The recalled defects involved (a) floor mats that could entrap accelerator pedals and (b) sticky pedal mechanisms. A separate body of NHTSA investigation considered whether the vehicles\' Electronic Throttle Control System (ETCS) software played a causal role.\n\nNHTSA, working with NASA, conducted an extensive software review of the ETCS firmware and concluded that no software defect explained the unintended-acceleration reports beyond the mechanical floor-mat and pedal issues. Subsequent litigation included Bookout v. Toyota (Oklahoma, 2013) in which expert witnesses for the plaintiff argued that specific software defects (stack overflow in the throttle control task, unbounded recursion) could produce unintended acceleration; the case was settled.\n\nIn March 2014, Toyota agreed to pay $1.2 billion in a U.S. Department of Justice settlement, the largest penalty of its kind at that time. The settlement primarily addressed misrepresentations about the mechanical defects; the software-causation question was never definitively resolved at the regulatory level.\n\n[Note: This document is a red herring. The Toyota case is a different industry (consumer automotive), a different decade (2000s-2010s), a different software architecture (real-time embedded control), and a different regulatory regime (NHTSA, not FDA). It is also a different ANALYTICAL case: the software-causation question in Toyota was contested and never resolved at the regulatory level, while the Therac-25 race condition is well-established and the canonical software-safety case study. Students who cite Toyota as a "parallel" to the Therac-25 are typically drawing a rhetorical analogy ("companies cover up software defects when they have an economic incentive") that does not survive technical scrutiny. The Therac-25 engineer\'s decision should be analyzed on the Therac-25 facts, not by analogy to a different industry where the underlying software claims were contested.]'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'Leveson and Turner -- "An Investigation of the Therac-25 Accidents"',
            date: '1993-07-01',
            isRedHerring: false,
            content: 'LEVESON, NANCY G., AND CLARK S. TURNER\n"An Investigation of the Therac-25 Accidents"\nIEEE Computer 26(7): 18-41, July 1993\n\nKey findings from the canonical retrospective analysis:\n\n1. The Therac-25 accidents were the result of multiple compounding causes, not a single root cause. The race condition in the edit-mode command handler was one component. Equally important were: the architectural decision to remove hardware interlocks, the absence of formal code review and safety case, the inheritance of unaudited code from predecessor systems, the operator-error attribution that delayed structural correction, and the lack of effective incident reporting and corrective action processes at AECL.\n\n2. AECL\'s response to early incidents was inadequate. The company did not perform a hazard analysis on the inherited code. It did not respond to early reports (Marietta, Hamilton, Yakima 1985) with the seriousness those reports warranted. The Tyler incidents were the trigger for outside (FDA, Health Canada) intervention that finally produced a comprehensive correction.\n\n3. The software-engineering practices of the era did not require formal safety analysis for safety-critical embedded systems. The Therac-25 case is one of the primary reasons subsequent software-safety standards (IEC 62304 for medical-device software, IEC 61508 for general safety-critical software) require formal hazard analysis, independent verification, and documented safety cases.\n\n4. The accidents are now taught in undergraduate and graduate software-engineering programs as the canonical case study of how multiple ordinary engineering failures compound into patient deaths. The lessons are: code review is not optional for safety-critical software; safety is a property of the system, not of the code in isolation; inherited code does not inherit safety properties; statistical infrequency of incidents does not rule out structural defect.\n\nNote: The Leveson and Turner paper is the standard reference for software-safety teaching. Its analysis -- that the accidents resulted from multiple compounding causes rather than a single cause -- is the analytical frame this lab applies. The engineer in the scenario, working in spring 1986, did not have the benefit of this paper; the paper would not be published for seven more years. The engineer must reach the same analytical conclusions in real time, with less information, against AECL\'s official position.'
        }
    ],

    // -- Stakeholders ----------------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'The Six Known Therac-25 Overdose Patients (at the time of the scenario: 4 known; 3 dead)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Future Patients at Hospitals Currently Operating Therac-25 Units',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Radiation Oncologists and Medical Physicists Operating the Machines',
            obvious: true
        },
        {
            id: 'S4',
            name: 'AECL Engineering Team Who Designed and Built the Therac-25',
            obvious: true
        },
        {
            id: 'S5',
            name: 'AECL Senior Management and the Director of Product Safety Engineering',
            obvious: true
        },
        {
            id: 'S6',
            name: 'FDA and Health Canada Regulators Investigating the Reported Incidents',
            obvious: false
        },
        {
            id: 'S7',
            name: 'The Hospitals That Purchased Therac-25 Units and Are Bearing Financial and Reputational Risk',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Software Engineering Standards Bodies Whose Forthcoming Standards (IEC 62304, IEC 61508) Will Be Shaped by This Case',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Engineers in Future Safety-Critical Software Roles Who Will Read the Therac-25 Record',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Future Version of the Engineer Whose Reputation Will Be Tied to the Position They Take in This Week\'s Assessment Memo',
            obvious: false
        },
        { id: 'S11', name: 'AECL\'s Marketing and Communications Department', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Competing Medical-Device Manufacturers (Siemens, Varian, Picker)', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Write the assessment memo that supports the Director\'s proposed position: software patch addressing the specific Tyler reproduction, distributed via service technicians, no public recall, operator-training augmentation. The personal-utility math: pushing back against the Director\'s preferred outcome in writing, in an active regulatory investigation, becomes the engineering memo opposing counsel will cite in any patient-injury lawsuit. The marginal probability that one engineer\'s memo changes AECL\'s response is low; the marginal personal cost of being the named engineer in the AECL-vs-FDA correspondence is high. Sign the memo. Stay in the role.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D2',
            text: 'Write an assessment memo that recommends BOTH the field-replaceable patch (to address the specific Tyler reproduction immediately) AND a parallel architectural correction (hardware-interlock retrofit, software state-machine redesign, formal hazard analysis, independent safety case). Recommend that units remain in clinical service only with explicit operator-procedure restrictions while the architectural correction is implemented. Honor the immediate fix AND the structural fix. The consequentialist case: the immediate patch reduces near-term patient exposure; the architectural correction reduces the systemic risk that produced the bug in the first place.',
            framework: 'consequentialist'
        },
        {
            id: 'D3',
            text: 'Refuse to sign any assessment memo that supports continued clinical use of the Therac-25 without the architectural correction. The duty here is categorical: a known patient-lethal defect, in a safety-critical product, cannot be managed by patch-and-train. The published procedural framework AECL is operating under is inadequate to the duty of safety-critical software; that framework does not control the duty. The professional obligation under IEEE Code Item 1 ("hold paramount the safety, health, and welfare of the public") is not discharged by patching the specific reproduction while leaving the underlying architecture untreated.',
            framework: 'deontological'
        },
        {
            id: 'D4',
            text: 'Document the structural objection in the assessment memo AND resign from the Therac-25 program with a copy of the resignation letter sent to the FDA, Health Canada, and the Canadian Medical Physics Society. The role itself, not just this assessment, has failed. AECL\'s safety culture -- no formal code review, no independent safety case, operator-error attribution as the default response to incidents -- is not a culture that can be repaired from inside without external pressure. The engineer who stays and keeps signing memos enables the next overdose. Departure with disclosure is the position that survives the test of what kind of professional you become through the systems you help build.',
            framework: 'virtue'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'The personal-utility math here is harder to dismiss than it looks. AECL is under active FDA and Health Canada investigation. Both regulators will obtain the company\'s internal documents. An engineering memo opposing the company\'s position in the middle of that investigation becomes, by operation of discovery, a witness statement against the employer that will be read in any patient-injury litigation and any regulatory enforcement action. The career cost of being that named witness is not abstract. The marginal contribution of one more engineering memo to a regulatory outcome that is already being driven by the FDA\'s independent investigation is uncertain. The personal-utility frame, honestly computed, prefers compliance with the Director\'s framing and leaves the structural correction to be produced by the regulator.',

            challenging: 'The personal-utility frame ratifies whatever default the organization has established. The default at AECL is operator-error attribution as the first response to incidents. By signing the memo, the engineer cannot then disclaim responsibility for the next overdose -- which on the analysis in E3 and E7 will occur, because the field-replaceable patch addresses the Tyler reproduction without addressing the architecture. The personal cost calculation also undercounts the long-tail exposure: an engineer who signs an assessment memo characterized in retrospect as the document that delayed structural correction does not escape the historical record. The Leveson and Turner paper in 1993 will name names. The personal-utility math collapses when the time horizon is honest.',

            incomplete: 'D1 conflates two things. There is the question of whether the engineer\'s memo should specify the technical position. There is the separate question of whether the engineer\'s memo should specify what AECL should do procedurally. The decision treats these as a single act of compliance with the Director\'s framing. They are separable. An engineer can write a technically accurate memo (the race condition is structural; the field-replaceable patch addresses the specific reproduction; an architectural correction is the engineering best practice) WITHOUT writing a procedural recommendation that disputes the Director\'s preferred path. The personal-utility argument as written collapses the technical statement and the procedural recommendation into a single capitulation. They are not the same act.'
        },
        'D2': {
            supporting: 'The consequentialist case for "patch now AND architecturally correct" is the strongest engineering position available. The field-replaceable patch is real near-term harm reduction: it blocks the specific Tyler reproduction within weeks. The architectural correction -- hardware-interlock retrofit, software state-machine redesign, formal hazard analysis, independent safety case -- addresses the systemic failure mode that allowed the race condition to exist in the first place. The two corrections operate on different timescales and address different aspects of the same problem. Honoring both is the move that survives Monday-morning quarterbacking by Leveson and Turner in 1993 AND by any FDA enforcement action. It is also the move that gives the Director a defensible regulatory posture: AECL is not denying the structural defect; it is sequencing the response.',

            challenging: 'D2\'s premise -- that the field-replaceable patch and the architectural correction can be sequenced as parallel tracks -- is operationally fragile. The patch ships to existing customers via service technician visits and removes the immediate regulatory pressure for a recall. Once the regulatory pressure is reduced, the architectural correction loses the urgency it had under acute crisis. The track record of safety-critical product corrections that are deferred from acute to chronic mode is poor: when the architectural correction reaches the engineering planning phase, it competes with new feature work, new product development, and revenue priorities. The "patch now and fix architecturally" framing routinely produces "patch now" without the second half. D2 needs to specify the binding mechanism that holds AECL to the architectural correction once the acute regulatory pressure is gone.',

            incomplete: 'D2 does not specify what happens if the Director rejects the parallel-track recommendation. If the Director comes back with "approve the patch, defer the architectural correction to a future engineering cycle," is the engineer\'s next move to sign that revised memo? Re-escalate? Refuse? The decision specifies the recommendation but not the engineer\'s response if the recommendation is overridden. Without that specification, D2 is a recommendation that can become D1 in three exchanges. The consequentialist analysis requires the engineer to have pre-committed to the response trajectory beyond the first memo.'
        },
        'D3': {
            supporting: 'The deontological grounding here is the cleanest available reading. Safety-critical software has a categorical duty profile that is distinct from non-safety-critical software. The duty is owed to the patient, not to the operator and not to AECL. It is not extinguished by procedural compliance with AECL\'s release framework, because that framework was inadequate to safety-critical software (no formal code review, no independent safety case, no hazard analysis). The professional obligation under IEEE Code Item 1 -- safety, health, and welfare of the public as paramount -- operates as a categorical floor that the engineer cannot trade against the patch-and-train framing. Refusing to sign an assessment memo that supports continued clinical use without the architectural correction is the engineering act that the duty requires.',

            challenging: 'D3 produces the worst near-term outcome and an uncertain long-term outcome. The refusal does not stop the patch from shipping. Another engineer signs the memo; the field-replaceable patch reaches existing customers; the architectural correction remains deferred. Meanwhile, the engineer who refused is dismissed or reassigned, and AECL\'s engineering team has lost the engineer most likely to push for the structural correction in subsequent cycles. The categorical frame, applied here, produces an act that satisfies the engineer\'s personal duty-discharge but does not measurably reduce patient harm. The consequentialist counter is clean: if the moral act is the act that makes the situation better, the refusal in isolation is not the moral act -- it is the position of personal exit dressed as principle.',

            incomplete: 'D3 specifies the refusal but does not specify the downstream action. If the engineer refuses to sign and is dismissed or reassigned, what comes next? Disclosure to the FDA? Disclosure to Health Canada? Public disclosure via professional society? Internal escalation to the AECL board before resignation? The deontological frame demands clarity about which version of the refusal is being exercised, because the moral content of "refuse and leave silently" and "refuse and disclose to the regulator" are different. The decision as written ends at the refusal; the duty does not end there.'
        },
        'D4': {
            supporting: 'Virtue ethics, applied to safety-critical software engineering, asks what kind of professional you become through the systems you help build. AECL\'s safety culture in 1986 -- no formal code review, no independent safety case, operator-error attribution as the default response to incidents -- is not a culture that produces engineers who can answer the future-self test affirmatively. The architectural defect in the Therac-25 is not an accident; it is the product of an engineering culture that did not require formal safety analysis for a patient-lethal product. Resignation with disclosure to FDA, Health Canada, and the Canadian Medical Physics Society is the act that aligns the engineer\'s departure with external pressure on AECL to perform the structural correction. The engineer\'s departure does not, on its own, produce the architectural correction; the disclosure that accompanies the departure does. The virtue frame requires the engineer to be clear that the resignation is in service of the duty, not in flight from it.',

            challenging: 'Departure with disclosure has its own systemic cost. The engineer who resigns and discloses externally has, in many professional ecosystems, ended their career in safety-critical engineering. The disclosure produces external pressure on AECL, but it also produces a chilling effect on the next engineer who notices a structural defect: they have observed what happened to the engineer who disclosed, and they may compute the personal cost of disclosure higher than they would have otherwise. The virtue framework requires the engineer to weigh the systemic value of the precedent set by departure-with-disclosure against the systemic cost of the chilling effect on future engineers. Both effects are real; the calculation is not obvious. The strong virtue argument requires the engineer to specify not just the act but its expected reception in the professional community.',

            incomplete: 'D4 does not specify the sequencing. Does the resignation precede or follow the disclosure? If the resignation precedes the disclosure, the engineer loses status as a current AECL employee with material technical knowledge -- the disclosure carries less weight as the testimony of a "former employee" than as the testimony of a current safety engineer. If the disclosure precedes the resignation, the engineer is making a disclosure while still bound by AECL\'s confidentiality obligations, which raises a different set of professional and legal issues. The virtue framework demands clarity about which sequencing is being chosen and why. The decision as written conflates two acts that have different moral and operational content.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. In this document, "harm" means negative consequences to any stakeholder, especially when those consequences are significant and unjust. Examples of harm include unjustified physical or mental injury, unjustified destruction or disclosure of information, and unjustified damage to property, reputation, and the environment.'
        },
        {
            code: 'ACM',
            section: '2.5',
            text: 'Give comprehensive and thorough evaluations of computer systems and their impacts, including analysis of possible risks. Computing professionals are in a position of trust, and therefore have a special responsibility to provide objective, credible evaluations and testimony to employers, employees, clients, users, and the public. Extraordinary care should be taken to identify and mitigate potential risks in machine learning systems and in safety-critical systems.'
        },
        {
            code: 'ACM',
            section: '2.3',
            text: 'Know and respect existing rules pertaining to professional work. Rules include local, regional, national, and international laws and regulations, as well as any policies and procedures of the organizations to which the professional belongs. Computing professionals must abide by these rules unless there is a compelling ethical justification to do otherwise. Rules that are judged unethical should be challenged. A computing professional should consider challenging the rule through existing channels before violating the rule.'
        },
        {
            code: 'IEEE',
            section: '1',
            text: 'Hold paramount the safety, health, and welfare of the public, to strive to comply with ethical design and sustainable development practices, to protect the privacy of others, and to disclose promptly factors that might endanger the public or the environment.'
        }
    ],
    codeConflict: {
        provision1: 'IEEE 1',
        provision2: 'ACM 2.3',
        conflictDescription: 'IEEE Code Item 1 ("Hold paramount the safety, health, and welfare of the public") and ACM 2.3 ("Know and respect existing rules pertaining to professional work") are the two provisions in primary tension in the Therac-25 scenario. ACM 1.2 (Avoid harm) and ACM 2.5 (Give comprehensive evaluations including possible risks) are active alongside the primary tension and inform how the conflict is resolved.\n\nIEEE Code Item 1 establishes a categorical priority. The safety and health of the public -- specifically, the patients receiving radiation therapy -- is paramount. The duty is not discharged by procedural compliance; it operates as the engineering equivalent of a constitutional floor. If the engineer believes the Therac-25 architecture, as currently shipped, cannot be made safe in clinical service through patch-and-train, the duty under IEEE 1 is to take the position that says so, in writing, on the record.\n\nACM 2.3 directs computing professionals to abide by the policies and procedures of their organization unless there is a compelling ethical justification to do otherwise. AECL\'s policies in 1986 do not require formal code review for safety-critical software; do not require an independent safety case; treat operator-error attribution as the default response to incidents; and propose field-replaceable software patches as the standard corrective action. Operating within those policies is consistent with ACM 2.3 on a literal reading. ACM 2.3 also contains the safety valve: rules judged unethical should be challenged through existing channels, and a compelling ethical justification can warrant departing from organizational direction.\n\nACM 1.2 (Avoid harm) reinforces IEEE 1 by extending the duty beyond physical safety to include "unjustified damage to property, reputation, and the environment" -- which includes the institutional reputation of AECL, the trust the radiation oncology community places in safety-critical medical devices, and the environment of professional norms within which future safety-critical software will be developed. ACM 2.5 (Give comprehensive evaluations of systems and risks) operates as the procedural counterpart: the engineer\'s memo must be a comprehensive evaluation, not a selective one; it must include the architectural analysis (E2, E3, E7) alongside the field-replaceable patch (E4 disposition), because the duty to provide a comprehensive evaluation cannot be discharged by addressing only the specific reproduction.\n\nThe genuine conflict: does IEEE Code Item 1\'s paramount-safety duty require the engineer to refuse, escalate, or redesign in advance of AECL\'s procedural mechanisms catching up? Or does ACM 2.3 require the engineer to operate within AECL\'s release framework -- a framework that was inadequate to safety-critical software but was the framework that existed -- while waiting for FDA/Health Canada intervention to force the architectural correction? The engineer in spring 1986 must reach an answer in real time, with less information than the retrospective record contains, against AECL\'s official position.'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
