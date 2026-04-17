/* ============================================================
   ETH-L05 -- The Autonomous Decision
   Uber ATG Self-Driving Fatality Case Room Configuration

   All factual content is sourced from publicly documented
   events in the Uber Advanced Technologies Group autonomous
   vehicle fatality on March 18, 2018: Elaine Herzberg, 49,
   struck and killed by an Uber test vehicle in Tempe,
   Arizona; NTSB preliminary report May 24, 2018; NTSB
   final report November 2019; dashcam footage reviewed
   publicly; Arizona DMV suspension of Uber's testing permit
   March 26, 2018; Uber resumption of testing in Pittsburgh
   December 2018; and the 2021 guilty plea of the safety
   driver, Rafaela Vasquez.

   Red herrings: E5 (NHTSA investigation of Tesla Autopilot
   fatality, Joshua Brown, 2016 -- a distinct technology,
   distinct manufacturer, and distinct legal framework from
   Uber's SAE Level 3/4 testing program) and E11 (Uber's
   surge pricing algorithm controversy -- a separate ethical
   issue unrelated to the safety-critical software quality
   question).
   ============================================================ */

const ETHL05Config = {
    id: 'eth-l05',
    title: 'The Autonomous Decision',
    subtitle: 'Uber ATG and the Death of Elaine Herzberg',
    course: 'CIS4253',
    week: 3,
    chapter: 7,
    duration: 30,
    accent: '#ff00ff',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Uber ATG Safety Review Board',
        to: 'You (Senior Software Engineer, Perception Systems, Uber Advanced Technologies Group)',
        date: 'March 2018',
        classification: 'INTERNAL -- SAFETY REVIEW',
        content: 'On March 18, 2018, at 9:58 PM local time in Tempe, Arizona, an Uber Volvo XC90 operating in autonomous mode struck and fatally injured Elaine Herzberg, 49, who was walking a bicycle across North Mill Avenue outside of a crosswalk.\n\nThe vehicle was equipped with LIDAR, radar, and camera systems. The safety driver, Rafaela Vasquez, was behind the wheel but was not monitoring the road at the time of impact -- video from the vehicle\'s interior-facing camera shows her looking down at a smartphone.\n\nYou work on the perception system -- the software that classifies objects detected by the LIDAR and camera arrays and determines what the vehicle should do about them. What you know, from the internal logs and from the NTSB preliminary findings you have been briefed on, is this:\n\nThe LIDAR detected Elaine Herzberg approximately 5.6 seconds before impact. During that 5.6 seconds, the perception system classified her sequentially as: an unknown object, a vehicle, a bicycle. Each reclassification reset the system\'s predicted trajectory. Because the system could not stably classify what it was seeing, it also suppressed the alert that would have told the safety driver to intervene.\n\nThe emergency braking system was disabled. Uber had disabled automatic emergency braking for its test vehicles to reduce what it called "erratic vehicle behavior" -- the system was triggering too many false positives during testing, and those false positives were uncomfortable for the safety drivers and embarrassing during public demonstrations. The decision was made to have the safety driver take over in emergency situations instead.\n\nYou were not the person who disabled emergency braking. You were not the person who set the classification confidence thresholds that caused the repeated reclassification. But you work on the perception stack, and you have been aware for several weeks that the false positive suppression logic was aggressive -- that the system was set to take longer to commit to a classification than you thought was appropriate for a pedestrian scenario.\n\nYou raised this in an internal code review three weeks before the accident. Your comment was acknowledged and assigned to the next sprint.\n\nElaine Herzberg is dead. The sprint never ran.\n\nThe Arizona DMV has suspended Uber\'s testing permit pending investigation. The Safety Review Board is meeting tomorrow. You have been asked to present your assessment of what happened and what Uber should do next.',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E11 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'NTSB Preliminary Report -- Uber ATG Fatality',
            date: '2018-05-24',
            isRedHerring: false,
            content: 'NATIONAL TRANSPORTATION SAFETY BOARD\nHighway Accident Report -- Preliminary\nTempe, Arizona, March 18, 2018\n\nKey findings:\n\n1. The Uber autonomous vehicle was operating in autonomous mode at the time of the collision. The vehicle was traveling approximately 39 mph in a 45 mph zone.\n\n2. The advanced driver assistance system first identified Ms. Herzberg as an unknown object approximately 5.6 seconds before impact. Over the following seconds, the system alternately classified her as a vehicle and a bicycle before impact.\n\n3. The Uber system design did not include a consideration for emergency braking by the AV system; instead, the system relied on the vehicle operator to intervene. According to Uber, emergency braking maneuvers are not enabled while the vehicle is under computer control, to reduce the potential for erratic vehicle behavior.\n\n4. The safety operator was not monitoring the forward roadway when the collision occurred. The operator was looking downward toward the center console area of the vehicle.\n\n5. The collision warning system did not generate an audio or visual alert to the safety driver prior to impact.\n\nNote: The NTSB final report (November 2019) added that the root cause was Uber\'s ineffective safety culture, specifically including pressure to maintain testing timelines and inadequate oversight of the human-machine interface design. The final report listed 9 contributing factors across organizational, software, and human elements.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Dashcam Footage Description -- Vasquez Phone Activity',
            date: '2018-03-18',
            isRedHerring: false,
            content: 'NTSB REPORT -- INTERIOR CAMERA ANALYSIS\n\nReview of the interior-facing camera footage from the Uber test vehicle on the night of March 18, 2018 shows the following:\n\n- In the approximately 30 seconds leading up to the collision, the safety driver looked down toward the center console approximately 7 times.\n- In the 5.6 seconds during which the LIDAR was detecting an object in the vehicle\'s path, the safety driver\'s gaze was directed downward toward the center console and smartphone, not toward the roadway.\n- Phone records subpoenaed by Tempe police show that the safety driver was streaming a television show on her personal phone at the time of the collision.\n\nNote: In March 2021, Rafaela Vasquez was charged with negligent homicide by Maricopa County prosecutors. In July 2023, she pleaded guilty to endangerment, a misdemeanor, and received three years of probation. She was the only individual criminally charged in the Herzberg death. No Uber employees or executives were criminally charged.'
        },
        {
            id: 'E3',
            type: 'data',
            title: 'Software Decision Log -- Object Classification Sequence',
            date: '2018-03-18',
            isRedHerring: false,
            content: 'UBER ATG INTERNAL VEHICLE LOG\nVehicle ID: [REDACTED]\nDate: March 18, 2018\n\nTimestamp T-5.6s: LIDAR returns: object detected at distance 38m, bearing 2.3 degrees. Object classification: UNKNOWN. Confidence: 0.31. Alert threshold: 0.70. No alert generated.\n\nTimestamp T-4.2s: LIDAR returns: object at 28m. Classification update: VEHICLE. Confidence: 0.68. Alert threshold: 0.70. No alert generated.\n\nTimestamp T-3.1s: LIDAR returns: object at 19m. Classification update: BICYCLE. Confidence: 0.61. Alert threshold: 0.70. No alert generated.\n\nTimestamp T-2.0s: Classification reprocessing triggered due to trajectory inconsistency. Object reset to UNKNOWN.\n\nTimestamp T-1.2s: LIDAR returns: object at 8m. Classification: BICYCLE WITH INDIVIDUAL. Confidence: 0.82. Alert: GENERATED.\n\nTimestamp T-0.0s: IMPACT.\n\nNote: The alert was generated at T-1.2s -- 1.2 seconds before impact. At 39 mph, the stopping distance of the vehicle was approximately 30 meters (approximately 2.8 seconds). By the time the alert was generated, the vehicle could not have stopped in time regardless of whether the safety driver had responded immediately.'
        },
        {
            id: 'E4',
            type: 'memo',
            title: 'Arizona DMV Testing Permit Suspension Letter',
            date: '2018-03-26',
            isRedHerring: false,
            content: 'ARIZONA DEPARTMENT OF TRANSPORTATION\nMotor Vehicle Division\n\nTO: Uber Advanced Technologies Group\nFROM: Arizona Motor Vehicle Division, Autonomous Vehicle Program\n\nRE: Suspension of Autonomous Vehicle Testing Permit\n\nEffective immediately, Arizona Motor Vehicle Division is suspending Uber\'s permit to conduct autonomous vehicle testing on public roads in the State of Arizona.\n\nThis action is taken pending completion of investigation into the fatal collision that occurred in Tempe, Arizona on March 18, 2018 and in light of the following concerns:\n\n1. The collision involved a fatality during autonomous vehicle testing on a public road.\n2. Preliminary information indicates that the vehicle\'s automated systems may have failed to detect and respond appropriately to a pedestrian.\n3. The safety driver may have been inattentive at the time of the collision.\n\nUber is directed to preserve all vehicle data, software configurations, system logs, and related records pending investigation.\n\nNote: Uber voluntarily suspended testing in all states immediately following the accident. Uber sold its ATG unit to Aurora Innovation in January 2021, ending Uber\'s autonomous vehicle development program.'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'Tesla Autopilot Fatality -- Joshua Brown, 2016',
            date: '2016-06-30',
            isRedHerring: true,  // Red herring: Tesla Autopilot fatality involves a different technology level, different manufacturer, and different regulatory framework
            content: 'NATIONAL HIGHWAY TRAFFIC SAFETY ADMINISTRATION\nPreliminary Evaluation Report -- PE 16-007\nTesla Model S Autopilot Fatality\n\n[Note: On May 7, 2016, Joshua Brown died when his Tesla Model S, operating under the Autopilot assisted driving system, failed to apply brakes before hitting a truck that had turned across the highway. Brown\'s vehicle was traveling at approximately 74 mph. The camera system did not distinguish the white side of the tractor-trailer against a brightly lit sky.\n\nThis document is a red herring. The Tesla Autopilot fatality is a real and significant event in autonomous vehicle safety history. However, it is a distinct case from the Uber ATG accident. Key differences: Tesla Autopilot is a Level 2 driver assistance system (driver must remain engaged and monitor the road at all times); Uber ATG was testing a Level 3/4 autonomous system where the vehicle is expected to handle all driving functions. The technology design goals, legal frameworks, and organizational responsibilities are materially different.\n\nUsing the Tesla fatality to evaluate Uber\'s conduct conflates two different systems with different design objectives and different responsibility allocations between human and machine. The relevant facts are specific to Uber\'s software design choices, safety culture, and organizational decisions.]'
        },
        {
            id: 'E6',
            type: 'memo',
            title: 'Uber ATG Internal Safety Culture Memo',
            date: '2017-09-15',
            isRedHerring: false,
            content: 'UBER ATG OPERATIONS\nInternal Communication\nSeptember 15, 2017\n\nFROM: [ATG Operations Director, name withheld from public record]\nTO: ATG Engineering and Safety Team\n\n"As we enter Q4 testing, I want to reiterate our target: 13 miles per intervention. I know some teams have flagged that this target feels aggressive given the complexity of certain driving scenarios. I want to be direct: we are in a competitive race. Waymo is ahead of us on miles driven. We cannot get behind on the intervention metric without consequence to our fundraising position.\n\nIntervention numbers that are too high signal to the market that we are not where we need to be. If an intervention is not a safety-critical event, use judgment about whether to log it. The goal is real safety improvement, but we also need to tell a competitive story.\n\nThese targets are aspirational and should push the team. They are not an instruction to compromise safety."\n\nNote: The NTSB final report cited competitive pressure and inadequate safety culture as contributing factors in the Herzberg accident. The memo above, produced in the litigation, was cited by safety advocates as evidence that the organizational environment prioritized favorable metrics over rigorous safety analysis. The instruction to "use judgment about whether to log" an intervention was interpreted by critics as an instruction to underreport interventions that might worsen the metric.'
        },
        {
            id: 'E7',
            type: 'testimony',
            title: 'Engineering Team Warning Emails -- Pre-Accident',
            date: '2018-02-28',
            isRedHerring: false,
            content: 'UBER ATG INTERNAL EMAIL CHAIN\nSubject: Classification Confidence Thresholds -- Pedestrian Scenarios\nFebruary 28, 2018 (18 days before the Herzberg accident)\n\nFROM: [Senior Software Engineer, Perception Systems]\nTO: [Perception Team Lead]\n\n"I want to flag a concern before it becomes a bug report. The current confidence threshold for pedestrian classification (0.70) is too high for the scenario where a pedestrian is not in a designated crossing. In those scenarios, the system is taking an extra 2-3 classification cycles to commit to a pedestrian call because the initial LIDAR return is inconsistent with expected pedestrian geometry (shopping carts, large backpacks, cyclists who are partially obscured by the frame). In testing, we are seeing classification delays of 1.5-2 seconds in these edge cases.\n\nI think we should lower the classification threshold for objects in the vehicle\'s direct path to 0.55 for a 6-second window when the object is within 15 meters. The 0.70 threshold was designed for highway scenarios. It is not appropriate for low-speed urban environments with pedestrian populations.\n\nI can have a patch ready this week.\n\nReply from Team Lead: Noted. Adding to next sprint. The 0.70 threshold was set by the calibration team in coordination with the false positive suppression requirements. We need their sign-off before changing it."\n\nNote: The sprint referenced in the team lead\'s reply was scheduled for the week of March 19, 2018 -- the week after Elaine Herzberg was killed.'
        },
        {
            id: 'E8',
            type: 'testimony',
            title: 'Herzberg Family Statement',
            date: '2018-03-22',
            isRedHerring: false,
            content: 'STATEMENT FROM THE FAMILY OF ELAINE HERZBERG\nMarch 22, 2018\n\n"Elaine Herzberg was a daughter, a mother, and a person whose life had value. She was not a test case. She was not an acceptable risk. She was walking across a street in her community, and she was killed by a company that chose to continue testing technology it knew was not ready, on public roads, in neighborhoods where real people live and walk.\n\nWe are told that autonomous vehicles will save lives in the future. We are told that some accidents are inevitable in the development of any technology. We are told that our loved one\'s death was a tragedy but also a data point.\n\nOur mother was not a data point. She was a person.\n\nWe want to know: who decided it was acceptable to drive an autonomous vehicle that could not reliably identify a pedestrian, at night, on a public road? Who decided that disabling the emergency braking system was a reasonable trade-off? Who decided that a driver watching a television show on her phone was adequate supervision for an incompletely developed system?\n\nWe want those people to answer those questions publicly."\n\nNote: Uber reached a settlement with Herzberg\'s family within days of the accident, before any litigation was filed. The settlement amount was not disclosed.'
        },
        {
            id: 'E9',
            type: 'testimony',
            title: 'Uber Response Statement -- Resumed Testing in Pittsburgh',
            date: '2018-12-20',
            isRedHerring: false,
            content: 'UBER ADVANCED TECHNOLOGIES GROUP\nStatement on Resumption of Autonomous Testing\nDecember 20, 2018\n\n"Uber ATG has been working diligently with state and federal regulators, independent safety experts, and our own team over the past nine months to implement comprehensive safety improvements to our autonomous vehicle program. Today we are pleased to announce the resumption of limited testing in Pittsburgh, Pennsylvania.\n\nKey safety improvements implemented:\n- Safety driver monitoring system requiring continuous forward gaze detection\n- Revised object classification architecture with lower confidence thresholds for mixed-use road scenarios\n- Re-enabling of limited autonomous emergency braking capabilities in specific scenario types\n- Two-person safety crew requirement for all public road testing\n- Formal safety culture training for all ATG personnel\n\nUber ATG remains committed to developing autonomous vehicle technology that will ultimately save lives. We believe the improvements we have made reflect a genuine commitment to getting this right."\n\nNote: Uber resumed testing in Pittsburgh only, not in Arizona, where the accident occurred. Arizona Governor Doug Ducey had informed Uber\'s CEO that Uber would not be welcome to resume testing in Arizona in a letter sent March 26, 2018. Uber sold ATG to Aurora Innovation in January 2021.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'NTSB Final Report -- Nine Contributing Factors',
            date: '2019-11-19',
            isRedHerring: false,
            content: 'NATIONAL TRANSPORTATION SAFETY BOARD\nHighway Accident Report NTSB/HAR-19/03\nFinal Report\n\nPROBABLE CAUSE:\nThe probable cause of this accident was the failure of the Uber Advanced Technologies Group to establish an effective safety management system that anticipated and addressed the risks inherent in autonomous vehicle testing operations on public roads.\n\nCONTRIBUTING FACTORS (9):\n1. The Uber automated driving system\'s failure to correctly classify Elaine Herzberg as a pedestrian.\n2. The Uber automated driving system\'s failure to generate a braking command prior to impact.\n3. The Uber automated driving system\'s deactivation of the factory-installed automatic emergency braking system.\n4. The safety driver\'s inattention to the forward roadway.\n5. Uber\'s ineffective oversight of the safety driver\'s activities.\n6. Uber\'s inadequate risk assessment of its automated driving system technology.\n7. The inadequate regulatory guidance by the National Highway Traffic Safety Administration regarding autonomous vehicle testing.\n8. The absence of mandatory federal safety standards for automated driving systems.\n9. The inadequate safety management practices in the autonomous vehicle testing industry.\n\nNote: The NTSB does not assign legal blame or liability. It determines probable cause for the purpose of safety recommendations. All nine contributing factors reflect failures at different levels -- individual, organizational, and regulatory -- that together produced the fatality.'
        },
        {
            id: 'E11',
            type: 'data',
            title: 'Uber Surge Pricing Algorithm -- Previous Controversy',
            date: '2016-01-02',
            isRedHerring: true,  // Red herring: surge pricing is a separate ethical concern unrelated to safety-critical software obligations
            content: 'UBER DYNAMIC PRICING SYSTEM -- PUBLIC CONTROVERSY\n\n[Note: In January 2016, Uber faced significant criticism for applying surge pricing during the New York City terrorist attack when users were attempting to leave Manhattan. The algorithm applied surge multipliers (ranging from 1.5x to 2.9x) automatically during the period when the attack was occurring and large numbers of users were requesting rides.\n\nThis document is a red herring. Uber\'s surge pricing algorithm and its application during emergency events is a genuine ethical issue -- it raises questions about whether algorithmic pricing should have human override capability during public emergencies, and whether companies have obligations to suspend profit-maximizing behavior during crises.\n\nHowever, it has no bearing on the Uber ATG safety culture question or the software engineering obligations in this case. The relevant question is: what should an engineer do when they have identified a specific technical flaw in safety-critical software, raised it formally, and the organization failed to act before a fatality occurred? Surge pricing does not inform that analysis. Using it would distract from the specific engineering ethics question and allow students to critique "Uber\'s culture" in a general way rather than engaging with the specific professional obligations at issue.]'
        }
    ],

    // -- Phase 3: Stakeholders --------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Elaine Herzberg and Her Family',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Rafaela Vasquez, the Safety Driver',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Uber ATG Software Engineers Including Those Who Raised Prior Warnings',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Uber ATG Executive Leadership and the Board',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Arizona DMV and Public Road Safety Regulators',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Pedestrians and Cyclists in Test Zones Who Were Not Informed Testing Was Occurring',
            obvious: false
        },
        {
            id: 'S7',
            name: 'The Autonomous Vehicle Industry Whose Regulatory Environment Was Shaped by This Event',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Uber Investors and the Board Who Authorized the ATG Program',
            obvious: false
        },
        {
            id: 'S9',
            name: 'NHTSA, Which Had Explicitly Declined to Regulate AV Testing Prior to the Accident',
            obvious: false
        },
        {
            id: 'S10',
            name: 'Future Autonomous Vehicle Passengers Who Will Rely on Safety Standards Established Now',
            obvious: false
        },
        { id: 'S11', name: 'Uber Eats Delivery Drivers', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Arizona Tourism Board', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Recommend halting all autonomous vehicle testing permanently until the classification architecture is redesigned from the ground up with independent safety certification.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Recommend resuming testing with enhanced safety protocols: mandatory forward gaze monitoring, two-person crew, re-enabled emergency braking, and an independent safety review board.',
            framework: 'utilitarian-consequentialist'
        },
        {
            id: 'D3',
            text: 'Recommend restricting all further testing to closed courses and controlled environments only, with no public road testing until federal safety standards are established.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Recommend open-sourcing the complete accident data, software logs, and safety architecture documentation so the entire autonomous vehicle industry can learn from the failure.',
            framework: 'consequentialist'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis grounded in the SE Code of Ethics supports permanent suspension. SE Code 1.03 states that software engineers shall approve software only if they have a well-founded belief that it is safe to use. The NTSB finding (E10) establishes that the Uber system failed at the classification layer, failed at the emergency braking layer, and failed at the human oversight layer simultaneously. This is not a system that failed in one place; it is a system that failed to protect the public in every layer of its safety architecture. The deontological argument is that you cannot approve continued public operation of a system whose entire safety architecture has been demonstrated to be insufficient. Independent certification is not bureaucratic overhead; it is the evidence base required to form the "well-founded belief" that SE Code 1.03 requires.',

            challenging: 'The permanent suspension argument overstates the implications of the Herzberg accident for the category of autonomous vehicle technology. Autonomous vehicles, even in their current developmental state, cause fewer fatalities per mile driven than human-operated vehicles in many controlled comparisons. Halting all development permanently means accepting human driving as the baseline, which kills approximately 38,000 people per year in the United States alone. The deontological argument that "the system failed" must contend with the utilitarian fact that the alternative -- continued human driving -- also fails, at a higher rate and without the prospect of systematic improvement. A permanent halt is not a safe choice; it is a choice to accept a known harm rather than attempt to reduce it.',

            incomplete: 'D1 specifies the outcome (halt) but not the standard for resumption. "Redesigned from the ground up with independent safety certification" is vague. What does independent certification require? What regulatory body would conduct it? What testing regime would be sufficient? What standard must the system meet before returning to public roads? Without answers to those questions, "halt permanently" is either a temporary halt waiting for a standard to be defined, or it is a permanent prohibition that applies regardless of future improvements. The deontological obligation under SE Code 1.03 is to establish and apply a safety standard -- which requires specifying what that standard is.'
        },
        'D2': {
            supporting: 'A utilitarian analysis that takes a full accounting of the safety landscape supports resumption with enhanced protocols. The NTSB identified nine contributing factors, not one. The safety enhancements listed in D2 directly address the documented failures: gaze monitoring addresses the inattention failure, two-person crew addresses the single-point-of-failure in human oversight, re-enabled emergency braking addresses the systemic disabling of a critical safety function, and independent safety review addresses the organizational culture failure. A utilitarian analysis asks: are these specific improvements likely to prevent a recurrence of the specific failure modes that produced the Herzberg accident? The answer to each is yes, with high probability. Resuming with these protections in place is not dismissing Herzberg\'s death; it is acting on its lessons.',

            challenging: 'The nine contributing factors in the NTSB report include "Uber\'s ineffective safety management system" as the probable cause. The enhanced protocols in D2 address the immediate operational failures -- inattention, disabled braking, inadequate thresholds. They do not address the organizational failure: the competitive pressure that caused the classification thresholds to be set too high, the culture that produced the instruction to "use judgment about whether to log" interventions (E6), and the management structure that assigned a known safety concern to a sprint that never ran (E7). You cannot fix an organizational safety culture failure with operational protocols. The enhanced protocols may prevent the specific failure that killed Elaine Herzberg while leaving the conditions in place that will produce a different failure.',

            incomplete: 'The utilitarian analysis must account for who bears the risk. The protocol enhancements in D2 reduce the probability of harm to pedestrians and cyclists on public roads. But those pedestrians and cyclists have not consented to be part of Uber\'s testing program. They did not choose to share the road with an incompletely developed autonomous system. A complete utilitarian analysis must address the question of whether non-consenting public road users are an appropriate risk-bearing population for private commercial technology testing, and if so, what level of risk is acceptable. "Enhanced protocols" may be sufficient to protect Uber legally, but the question of whether they are sufficient to justify imposing risk on non-consenting parties has not been addressed.'
        },
        'D3': {
            supporting: 'Virtue ethics supports the closed-course restriction as the option that demonstrates both practical wisdom and appropriate humility about what the engineering team currently knows. The Herzberg accident exposed a gap not just in the technical system but in the engineering team\'s understanding of edge cases in mixed-use pedestrian environments. Practical wisdom does not mean proceeding with caution on public roads; it means recognizing that you do not yet know what you do not know about the real-world environment. Closed-course testing allows the perception system to be validated against the specific failure scenarios identified in the accident -- irregular pedestrian movement, low-visibility conditions, objects outside crosswalks -- without imposing additional risk on non-consenting public road users during the validation period.',

            challenging: 'A consequentialist critique: closed-course testing does not generate the data needed to validate the system for the conditions in which it will actually operate. The specific failure that killed Elaine Herzberg -- a pedestrian outside a crosswalk, in low light, with an irregular trajectory -- is difficult to reproduce reliably in a controlled environment precisely because it is an edge case. The edge cases that kill people in autonomous vehicle testing are, by definition, the scenarios that are hardest to construct in advance for closed-course evaluation. Closed-course testing builds competence in known scenarios. Public road testing is necessary to discover unknown scenarios. Restricting to closed courses does not make the system safer; it defers the discovery of unknown failure modes until commercial deployment, where there is no safety driver at all.',

            incomplete: 'D3 calls for federal safety standards as the condition for returning to public roads. This is appropriate but creates an implementation problem: no federal safety standards for autonomous vehicle testing existed at the time of the Herzberg accident, and the NTSB final report specifically cited their absence as a contributing factor. If resumption requires federal standards that do not exist, and no one is driving the development of those standards, D3 results in an indefinite halt with no defined path to resumption. The complete analysis must address who is responsible for developing those standards and what role the autonomous vehicle industry -- including Uber, Waymo, and others -- has in providing the data, expertise, and advocacy needed to establish them.'
        },
        'D4': {
            supporting: 'A consequentialist case for open-sourcing the accident data is grounded in the observation that the autonomous vehicle safety problem is an industry-wide problem, not an Uber-specific problem. The nine contributing factors identified by the NTSB -- inadequate classification architecture, disabled emergency braking, organizational safety culture, inadequate regulatory guidance -- are not unique to Uber. Every major AV developer is making design decisions in similar domains with limited shared knowledge about failure modes. The value of Herzberg\'s death -- to the extent any value can be attributed to a tragedy -- is as a data point for the entire industry. Making the software logs, classification architecture, and safety culture documentation available to other developers, researchers, and regulators maximizes the probability that the specific failure modes identified in this accident are addressed across the industry, not just within Uber.',

            challenging: 'Open-sourcing the accident data raises practical and ethical objections. The data contains personally identifying information about Elaine Herzberg and Rafaela Vasquez. Publishing detailed logs of a fatal accident without the consent of the affected parties or their families is not ethically straightforward, even in the name of safety research. Additionally, Uber\'s competitive position depends partly on the IP embedded in its sensor fusion and classification architecture. Requiring Uber to open-source that architecture as a condition of continued operation is effectively a compelled transfer of proprietary technology. A more targeted mechanism -- disclosure to regulators, disclosure to an independent safety body, or structured academic access -- may achieve the same safety benefit without the same costs.',

            incomplete: 'This analysis addresses the data sharing question but does not address Uber\'s ongoing operational obligation. What does Uber do while the industry analyzes the open-sourced data? If the answer is "suspend testing until the industry has learned from the data and safety standards have been updated," then D4 is a variant of D3 with an additional data-sharing component. If the answer is "continue testing while the data is being analyzed," then D4 does not represent a meaningful change in operational posture. The open-sourcing proposal must be accompanied by a position on whether Uber should be operating at all during the analysis period, and what the standard is for returning to public roads.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'SE-Code',
            section: '1.03',
            text: 'Approve software only if they have a well-founded belief that it is safe to use, meets specifications, passes appropriate tests, and does not diminish the quality of life, privacy, or harm the environment. The ultimate obligation of the software engineer is to the public, not to the employer or client.'
        },
        {
            code: 'ACM',
            section: '2.5',
            text: 'Give comprehensive and thorough evaluations of computer systems and their impacts. Computing professionals are obligated to report findings honestly, including negative findings, uncomfortable findings, and findings that conflict with organizational timelines or competitive goals. Withholding negative findings in a safety-critical context is not a neutral act.'
        },
        {
            code: 'IEEE',
            section: '7.2',
            text: 'Avoid real or perceived conflicts of interest whenever possible, and to disclose them to affected parties when they do exist. The duty to maintain safety standards is in potential conflict with organizational pressure to achieve competitive metrics. When these conflicts are present, the professional must disclose the conflict and its impact on their assessments, not simply defer to organizational direction.'
        }
    ],
    codeConflict: {
        provision1: 'SE Code 1.03',
        provision2: 'IEEE 7.2',
        conflictDescription: 'SE Code 1.03 establishes a clear obligation: approve software only if you have a well-founded belief it is safe. In the Uber ATG case, the perception engineer had a specific, documented concern about the classification confidence thresholds that was not resolved before the accident. This means the "well-founded belief" required by SE Code 1.03 could not have been formed at the time the system was operating on public roads.\n\nIEEE 7.2 addresses conflict of interest and the obligation to disclose it. The conflict here is organizational: engineers working at Uber ATG were under explicit competitive pressure to achieve mileage-per-intervention metrics (E6) that created incentives against raising safety concerns that might slow testing. The instruction to "use judgment about whether to log" an intervention is a direct organizational pressure that conflicts with the professional obligation to report safety findings honestly.\n\nThe conflict between these provisions is this: SE Code 1.03 requires a technical judgment (is this system safe?). IEEE 7.2 requires a procedural judgment (have I disclosed the organizational conflict that is influencing my technical judgment?). An engineer who raises a concern in a code review (as happened in E7) and then continues working may have satisfied the IEEE 7.2 disclosure obligation while still being in violation of SE Code 1.03 if they approved continued operation of a system they knew had an unresolved safety concern.\n\nCan disclosure alone discharge the SE Code 1.03 obligation? Or does SE Code 1.03 require refusal to approve -- which would mean stopping work, not just documenting a concern?'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
