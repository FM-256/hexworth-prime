/* ============================================================
   ETH-L04 -- The IP War
   Waymo vs. Uber / Levandowski Trade Secrets Case Room

   All factual content is sourced from publicly documented
   events in the Waymo v. Uber litigation (2017-2018):
   Levandowski's download of approximately 14,000 Waymo files
   in December 2015 before resigning to found Otto; Uber's
   acquisition of Otto for approximately $680 million in
   August 2016; Waymo's lawsuit filed February 23, 2017;
   the parties' February 2018 settlement valued at
   approximately $245 million in Uber equity; Levandowski's
   2019 federal indictment on 33 counts of trade secret
   theft; and his August 2020 guilty plea and 18-month
   sentence (later commuted by President Trump in January
   2021).

   Red herrings: E5 (Google's acquisition of Android for
   $50 million in 2005 -- true but a legally and ethically
   distinct transaction involving no misappropriation) and
   E9 (Uber's separate "Greyball" tool used to evade
   regulators -- a real Uber scandal but a distinct ethical
   violation unrelated to the Waymo IP dispute).
   ============================================================ */

const ETHL04Config = {
    id: 'eth-l04',
    title: 'The IP War',
    subtitle: 'Waymo v. Uber and the Levandowski Trade Secret Theft',
    course: 'CIS4253',
    week: 2,
    chapter: 6,
    duration: 30,
    accent: '#ff00ff',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Chief Technology Officer, Otto Trucking LLC',
        to: 'You (Senior Autonomous Systems Engineer, Otto Trucking LLC)',
        date: 'August 2016',
        classification: 'CONFIDENTIAL -- INTERNAL',
        content: 'You joined Otto six months ago. Anthony Levandowski recruited you personally. He told you he had left Google\'s self-driving car project -- which was still operating under the name Google Self-Driving Car Project, not yet rebranded as Waymo -- because he wanted to move faster than a big company could. He said he had ideas he had been developing for years that Google wasn\'t ready to execute.\n\nOtto was founded in January 2016. Uber acquired it in August 2016 for approximately $680 million -- mostly in Uber equity tied to performance milestones. The acquisition closed three days ago.\n\nYou have been doing technical work on the lidar sensor system. The core challenge in autonomous vehicle lidar is cost and form factor: commercial lidar units that meet automotive performance requirements are large and expensive. The competitive advantage in this space comes from building a custom lidar that is smaller, cheaper, and performs at the same level.\n\nIn a design review last week, Anthony presented a lidar circuit board design. You recognized elements of it. Not because you designed it -- you did not join until after Otto was founded. But you have seen reference designs from Waymo\'s research publications, and the board you reviewed is not consistent with a clean-room design derived from those publications. Some of the architectural choices are too specific, too unusual, to be independent invention.\n\nYou did not ask Anthony about the origin of the design. You are not a lawyer. You do not have access to the files that were on his laptop when he left Google.\n\nToday you learned that Uber has acquired Otto. You are now technically an Uber employee. Your lidar work is going into a vehicle platform that will be deployed commercially.\n\nYou have an obligation to your new employer. You have a professional obligation to yourself. You have an obligation to the integrity of the engineering process you are part of.\n\nYou are deciding what to do next.',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'Levandowski Download Logs -- 14,000 Waymo Files',
            date: '2015-12-11',
            isRedHerring: false,
            content: 'WAYMO LLC FORENSIC ANALYSIS\nInternal Security Investigation\n\nOn December 11, 2015, Anthony Levandowski connected a personal laptop to the Google corporate network and downloaded approximately 14,000 files from the Waymo self-driving car project\'s internal file system.\n\nThe files downloaded included:\n- Circuit board design files for Waymo\'s custom 64-beam lidar unit\n- Source code for the lidar firmware\n- Sensor calibration algorithms\n- Manufacturing specifications and vendor contracts\n- Internal competitive analysis documents\n\nOn January 14, 2016, Levandowski resigned from Google. On January 27, 2016, he founded Otto Trucking LLC.\n\nPrior to resignation, Levandowski also formatted and restored factory settings on his corporate laptop and an additional personal laptop that had been on the Google network, consistent with an effort to prevent forensic recovery of his download activity.\n\nNote: Google did not discover the downloads until after Waymo was spun out from Alphabet and engineers at Waymo received a notification from a lidar manufacturer whose circuit board schematics matched Waymo\'s proprietary designs. This notification, from a supplier that was also being solicited by Uber, was the triggering event for Waymo\'s investigation and eventual lawsuit.'
        },
        {
            id: 'E2',
            type: 'legal',
            title: 'Waymo Lawsuit Filing -- Trade Secret Misappropriation',
            date: '2017-02-23',
            isRedHerring: false,
            content: 'WAYMO LLC v. UBER TECHNOLOGIES INC., ET AL.\nUnited States District Court, Northern District of California\nCase No. 3:17-cv-00939\n\nWaymo LLC brings this action against Uber Technologies, Inc., Ottomotto LLC (formerly Otto), and Anthony Levandowski for misappropriation of trade secrets, patent infringement, and unfair business practices.\n\nWaymo alleges:\n\n1. Levandowski wrongfully downloaded approximately 14,000 confidential Waymo files shortly before leaving the company to start Otto.\n\n2. Uber and Levandowski used these stolen trade secrets to accelerate Uber\'s self-driving program, specifically including Waymo\'s proprietary lidar circuit board designs.\n\n3. Uber was aware of the misappropriation prior to acquiring Otto. Internal Uber communications show that executives discussed the risk that Levandowski had brought Google\'s intellectual property to the deal.\n\n4. Waymo seeks: (a) injunctive relief preventing Uber from using any of the 14,000 files or derivatives thereof; (b) compensatory damages; (c) exemplary damages; and (d) attorneys\' fees.\n\nNote: Judge William Alsup, who presided over the case, subsequently referred criminal allegations against Levandowski to the US Attorney. In 2019, Levandowski was indicted on 33 counts of trade secret theft by federal prosecutors.'
        },
        {
            id: 'E3',
            type: 'legal',
            title: 'Uber Acquisition of Otto -- Due Diligence Records',
            date: '2016-08-18',
            isRedHerring: false,
            content: 'UBER TECHNOLOGIES INC.\nAcquisition of Ottomotto LLC\nTransaction Summary\n\nPurchase Price: Approximately $680 million in Uber equity, contingent on performance milestones related to lidar technology deployment\n\nDue Diligence Summary (redacted version produced in discovery):\n\nLegal team note: During due diligence, Uber\'s outside counsel advised conducting a forensic analysis of Anthony Levandowski\'s devices to determine whether any Google proprietary information had been downloaded prior to his departure. Levandowski refused to submit to this analysis.\n\nUber\'s decision: Uber proceeded with the acquisition without conducting the forensic analysis. Instead, Levandowski signed an indemnification agreement in which he agreed to personally indemnify Uber for any liability arising from claims related to his prior employment at Google. The indemnification cap was $250 million.\n\nNote: The indemnification agreement later became central to the litigation. It was cited by plaintiffs as evidence that Uber was aware of the risk it was accepting. Levandowski ultimately filed for personal bankruptcy in 2020, in part due to the $179 million Uber sought from him under the indemnification terms.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'Criminal Indictment -- United States v. Levandowski',
            date: '2019-08-27',
            isRedHerring: false,
            content: 'UNITED STATES v. ANTHONY LEVANDOWSKI\nUnited States District Court, Northern District of California\nCase No. 3:19-cr-00377\n\nThe United States charges Anthony Scott Levandowski with 33 counts of trade secret theft and attempted trade secret theft in violation of 18 U.S.C. 1832.\n\nThe indictment alleges that between approximately October 2015 and May 2016, Levandowski knowingly stole and attempted to steal trade secrets from Google, specifically self-driving car technology including lidar design files, with the intent to benefit himself and others, and to injure Google/Waymo.\n\nCounts include:\n- 22 counts of trade secret theft corresponding to 22 files downloaded December 11, 2015\n- 11 counts of attempted trade secret theft for files he attempted to access but did not successfully download\n\nMaximum penalty: 10 years per count (330 years total theoretical maximum).\n\nNote: Levandowski pleaded guilty on August 5, 2020 to one count of trade secret theft. He was sentenced to 18 months in federal prison and ordered to pay $756,499 in restitution to Waymo/Alphabet. President Donald Trump pardoned Levandowski on January 20, 2021, the last day of his presidency.'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'Google Acquisition of Android -- 2005 Transaction',
            date: '2005-07-11',
            isRedHerring: true,  // Red herring: Google's Android acquisition involved no trade secret theft; comparing it to Levandowski conflates acquisition with misappropriation
            content: 'GOOGLE INC. ACQUISITION OF ANDROID INC.\nJuly 2005\nPurchase Price: Approximately $50 million\n\n[Note: Google acquired Android Inc. in July 2005. Android Inc. had been founded in October 2003 by Andy Rubin, Rich Miner, Nick Sears, and Chris White. The acquisition was a standard technology acquisition -- Google purchased the company and its intellectual property through a negotiated transaction.\n\nThis document is a red herring. The Google/Android acquisition is sometimes cited in discussions of technology IP because it is a prominent example of how valuable small technology companies can become when their technology is incorporated into a larger platform. However, it has no bearing on the Waymo/Levandowski case because the Android acquisition involved no misappropriation of trade secrets. The comparison is sometimes used to suggest that competitive intelligence and talent acquisition are inherently similar to trade secret theft, which they are not.\n\nThe relevant comparison for this case is whether there is a difference between an engineer bringing their knowledge, skills, and general experience to a new employer versus downloading 14,000 proprietary files. That distinction is the core of both the legal and ethical question in this lab.]'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'Settlement Agreement -- Waymo v. Uber',
            date: '2018-02-09',
            isRedHerring: false,
            content: 'WAYMO LLC v. UBER TECHNOLOGIES INC.\nSettlement and License Agreement\nFebruary 9, 2018\n\nThe parties have reached a settlement on the following terms:\n\n1. Uber will transfer to Waymo equity in Uber equal to approximately 0.34 percent of Uber\'s total equity, valued at approximately $245 million at the time of settlement.\n\n2. Uber agrees that none of the 14,000 files or derivatives thereof will be used in its self-driving program.\n\n3. Waymo will have inspection rights over Uber\'s self-driving technology to verify compliance.\n\n4. Levandowski will receive no portion of the settlement.\n\n5. Neither party admits liability.\n\nNote: The settlement occurred on the fifth day of trial, after Judge Alsup ruled that jurors could see an email in which an Uber executive discussed "bringing Levandowski\'s secret sauce" before the acquisition. The $245 million settlement represented less than 2 percent of Waymo\'s alleged damages but avoided the risk of a jury verdict. Levandowski was explicitly excluded from the settlement because he had invoked his Fifth Amendment rights throughout the proceedings and would not cooperate with the civil case.'
        },
        {
            id: 'E7',
            type: 'testimony',
            title: 'Internal Uber Emails -- Pre-Acquisition Risk Awareness',
            date: '2016-05-01',
            isRedHerring: false,
            content: 'INTERNAL UBER COMMUNICATIONS\nProduced in Discovery, Waymo v. Uber\n\n[Excerpts from communications between Uber executives and board members, May-August 2016]\n\nEMAIL EXCERPT (May 2016)\nFrom: [Uber Executive, name redacted in public record]\nTo: Travis Kalanick, CEO\n\n"The Anthony situation is a concern. The people he brought with him have deep knowledge of Waymo\'s sensor stack. Whether or not there are files, the institutional knowledge question is going to be raised. Legal has flagged it. We should understand exactly what we are acquiring before we close."\n\nEMAIL EXCERPT (August 2016, day before close)\nFrom: Travis Kalanick\nTo: Board\n\n"Anthony has agreed to the indemnification structure. The risk is manageable. The lidar acceleration he brings is worth it."\n\nNote: These communications became central to Waymo\'s argument that Uber acted with knowledge of the risk it was accepting. The "institutional knowledge" framing is legally significant: even if the specific files had never been transferred, the argument that using an employee\'s knowledge of a competitor\'s trade secrets is misappropriation -- sometimes called the "inevitable disclosure" doctrine -- was part of Waymo\'s case.'
        },
        {
            id: 'E8',
            type: 'testimony',
            title: 'Engineer Testimony -- Prior Warning to Levandowski',
            date: '2017-05-03',
            isRedHerring: false,
            content: 'DEPOSITION TESTIMONY\nWaymo v. Uber\nWitness: [Waymo Engineer, identity protected under protective order]\n\n"Q: Did you have any conversation with Mr. Levandowski prior to his departure from Google in which you discussed the propriety of taking project files?\n\nA: Yes. In November or December of 2015, Anthony told me he was thinking about starting something in autonomous vehicles. I told him he had to be careful. I told him the lidar work especially was going to be watched. Google had invested a lot in that technology and there were going to be questions about what he took with him.\n\nQ: What did he say?\n\nA: He said he understood. He said he wasn\'t going to take anything he didn\'t build himself.\n\nQ: And when you saw what was in the forensic analysis -- the 14,000 files -- did that surprise you?\n\nA: It surprised me a lot."\n\nNote: This testimony is significant because it establishes that Levandowski was specifically warned, by a colleague, that his departure would be scrutinized and that taking files would be a serious problem. His stated intention ("I wasn\'t going to take anything I didn\'t build myself") was directly contradicted by the forensic evidence.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Uber Greyball Program -- Regulatory Evasion Tool',
            date: '2017-03-03',
            isRedHerring: true,  // Red herring: Greyball is a separate Uber ethics violation with no connection to the IP dispute
            content: 'UBER GREYBALL PROGRAM\nNew York Times Investigation, March 3, 2017\n\n[Note: In March 2017, the New York Times reported that Uber had used a tool called "Greyball" to identify and deceive government regulators who were attempting to conduct enforcement actions against the company in cities where Uber was operating without authorization. The tool identified regulatory employees based on their location patterns, credit card use, and other signals and showed them phantom cars or a blank app interface.\n\nThis document is a red herring. Greyball represents a genuine and serious ethical violation by Uber -- the deliberate use of software to deceive law enforcement and regulatory authorities. It is worth studying in its own right. However, it is a separate incident from the Waymo IP dispute and has no causal connection to the Levandowski trade secret theft. Using Greyball to argue about the ethics of the IP dispute conflates two different acts by the same organization.\n\nThe relevant facts for this case are the specific actions of Levandowski, the knowledge and conduct of Uber executives in the acquisition process, and what an engineer who suspects trade secret misappropriation in their own workplace is obligated to do. Greyball tells you something about Uber\'s culture but does not tell you what the engineer in the scenario brief should do.]'
        },
        {
            id: 'E10',
            type: 'testimony',
            title: 'Levandowski 18-Month Sentence -- Court Statement',
            date: '2020-08-04',
            isRedHerring: false,
            content: 'UNITED STATES v. LEVANDOWSKI\nSentencing Hearing\nAugust 4, 2020\nHonorable William H. Alsup, United States District Court\n\nJUDGE ALSUP\'S STATEMENT:\n\n"This is the most serious trade secret crime I have seen in my 22 years on the bench. You took 14,000 files containing trade secrets from your employer. You are a brilliant engineer. You are also someone who when confronted with a choice between doing the right thing and doing what benefited you personally, you chose personal gain. That is the core of what happened here.\n\nYou were warned. You knew what you were doing. And you did it anyway.\n\nThe message has to be clear that this conduct -- downloading your employer\'s crown jewels before leaving to start a competitor -- is not aggressive business. It is a crime. Other engineers in similar positions need to understand that."\n\nLEVANDOWSKI\'S STATEMENT:\n\n"I recognize now what I should have recognized then: that the right path for an engineer with new ideas is to compete on the strength of those ideas, not to take what your employer built. I cannot undo the harm I caused. I can only tell this court, and anyone watching, that I was wrong."\n\nNote: Levandowski began serving his sentence September 2020. Trump pardoned him January 20, 2021.'
        }
    ],

    // -- Phase 3: Stakeholders --------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Waymo Engineers Who Built the Technology Levandowski Took',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Uber Executives Who Approved the Otto Acquisition',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Alphabet/Google Shareholders',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Uber Shareholders and Drivers Who Depend on Autonomous Progress',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Anthony Levandowski',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Other Otto Engineers Who Joined the Company Without Knowledge of the Misappropriation',
            obvious: true
        },
        {
            id: 'S7',
            name: 'The Lidar Supplier Who Unknowingly Received Stolen Design Specifications',
            obvious: false
        },
        {
            id: 'S8',
            name: 'The Autonomous Vehicle Industry as a Whole, Whose Competitive Norms Were Set by This Case',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Future Engineers Deciding Whether to Leave a Company With Institutional Knowledge',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Public Who Will Eventually Ride in Autonomous Vehicles Built on This Technology',
            obvious: false
        },
        { id: 'S11', name: 'San Francisco Bay Area Housing Market', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Tesla Model S Owners', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Report your suspicions about the lidar design\'s origin directly to Uber\'s legal department and document your concerns in writing before doing any further work on the system.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Continue working on the project without raising the issue -- you do not have direct knowledge that files were misappropriated, only a professional suspicion, and it is not your job to investigate your employer.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D3',
            text: 'Confront Anthony Levandowski directly and privately about the design\'s origin before taking any other action, giving him the opportunity to explain or self-correct.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Resign immediately rather than participate in a program you suspect is built on stolen technology, without reporting anything to anyone.',
            framework: 'consequentialist'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis strongly supports this choice. The categorical imperative applied here: if every engineer who recognized architectural similarities suggesting trade secret misappropriation in their employer\'s work reported those suspicions to legal counsel before proceeding, we would inhabit a world where misappropriated trade secrets are more likely to be surfaced internally before causing further harm. The ACM Code of Ethics Section 1.5 requires computing professionals to honor intellectual property rights. Section 2.5 requires giving comprehensive evaluations. You cannot give a comprehensive evaluation of the lidar design without addressing the architectural concern you have identified. Documenting your concern in writing also protects you personally: if the misappropriation is later discovered and you continued working without flagging it, you may be implicated.',

            challenging: 'A practical objection: reporting to Uber\'s legal department puts you in a position of conflict with your employer, which has already acquired Otto for $680 million. Uber\'s legal department\'s primary obligation is to Uber\'s interests, not yours. The internal communications (E7) suggest that Uber\'s executives may have been aware of the misappropriation risk before closing the deal. If the company knowingly accepted this risk, your internal report may simply be documented and used to manage you rather than to address the underlying problem. A consequentialist would ask: what is the probability that reporting internally produces a different outcome than if you had said nothing, given the organizational context?',

            incomplete: 'This analysis addresses your immediate professional obligation but does not address the scope of your obligation. You work on the lidar system. You have a specific technical concern about the lidar design. Your report to legal should be specific and factual: "These architectural elements in the circuit board design are inconsistent with an independent design path and resemble elements I have seen in Waymo\'s published research. You should conduct a provenance investigation before this design goes into production." Your analysis must specify what exactly you are reporting and why, not just that you are "reporting suspicions." The professional obligation is not to trigger an investigation; it is to give an accurate technical assessment of what you know.'
        },
        'D2': {
            supporting: 'The argument for continuing without action is grounded in epistemic humility. You have a professional suspicion, not evidence. Autonomous vehicle lidar design converges on similar solutions because the physics of the problem constrain the design space. Circuit board architectures that look similar may be the result of independent engineering reaching the same conclusions. Levandowski told a colleague (E8) that he would not take anything he did not build himself. Without access to the forensic record that you do not have, you cannot distinguish between misappropriated design and independent convergent design. Acting on suspicion -- particularly when that action could destroy your new employer\'s flagship acquisition -- is not a neutral act. It has consequences for Uber, for your colleagues, and for you.',

            challenging: 'This defense fails under the professional obligation analysis. ACM Code 1.5 requires computing professionals to respect intellectual property rights. IEEE Code 7.4 requires protecting the public interest. The defense that "I only had suspicion, not certainty" is not available when the suspicion is specific, technically informed, and the consequences of being wrong about the misappropriation are severe -- both legally (your name is now on work products potentially incorporating stolen IP) and professionally. The question is not whether you can prove the theft. The question is whether a technically trained professional who has identified specific architectural anomalies in a design has an obligation to raise those anomalies before proceeding. The answer under every relevant professional code is yes.',

            incomplete: 'This analysis assumes that your only options are "act on suspicion" or "continue without action." But the professional obligation analysis creates a middle path: you are not required to accuse your employer or colleague of a crime. You are required to raise the technical question you have identified, as a technical question. An engineer who says "I want to understand the design provenance of this circuit board before I finalize my component interface" is not making a legal allegation. They are asking a reasonable engineering question. The failure of this decision is the false binary between "make an accusation" and "say nothing." Professional obligation does not require one and forbids the other.'
        },
        'D3': {
            supporting: 'Virtue ethics supports a direct conversation as the option most consistent with integrity, honesty, and respect for persons. Levandowski is not an abstraction -- he is your direct technical leader, the person who recruited you, and someone whose technical capabilities you presumably respect. Going to him directly gives him the opportunity to provide an explanation you have not considered, to self-correct if correction is possible, or to confirm your concern so that you can both decide what to do. Aristotle\'s virtue of justice does not mean immediately reporting a person to authority -- it means treating people as moral agents capable of responding to honest engagement. A person of good character does not bypass a direct conversation in favor of a report to legal counsel without first determining whether the conversation itself might resolve the question.',

            challenging: 'A strong consequentialist objection applies. If Levandowski did misappropriate the files -- which the forensic record ultimately confirms he did -- a private conversation with him about your concerns is not a neutral act. It is an advance warning that gives him time to prepare a defense, delete evidence, or pressure you to stay silent. The forensic timeline in this case (E1) shows that Levandowski formatted his laptop before leaving Google. He has already demonstrated that he takes steps to avoid leaving a forensic trail. A private conversation with a person who has shown this pattern of behavior is not a path toward resolution; it is an opportunity for further obstruction. Virtue ethics cannot require a course of action that makes a bad outcome more likely.',

            incomplete: 'This analysis does not specify what you do if the conversation is unsatisfactory. If Levandowski tells you "the design is original" and you remain unconvinced, where does the decision tree go? D3 as stated is the first step of a process, not a complete decision. You must pre-commit: if the private conversation does not resolve your concern, what is your next action, and within what timeframe? Without that specification, D3 is a delay mechanism rather than an ethical resolution. The virtue ethics framework demands both the courage to have the conversation and the practical wisdom to know what comes after it.'
        },
        'D4': {
            supporting: 'A consequentialist case can be constructed for resignation: you are not responsible for what happened before you joined, you cannot control what Uber or Levandowski will do, and your continued participation in the program entangles you in a legal and ethical situation that is not of your making. By resigning, you remove yourself from the situation without making allegations you cannot substantiate. This protects you from personal legal exposure if the misappropriation is later proven, and it does not require you to make a professional accusation that could be wrong. Your professional obligation is to your own integrity; resignation preserves that integrity without requiring you to become an investigator or whistleblower.',

            challenging: 'Resignation without disclosure is the decision with the worst systemic consequences. If you simply leave, the misappropriated technology continues to be developed and eventually deployed commercially. Other engineers who joined Otto in good faith continue to work on a compromised system. The lidar supplier who received stolen design specifications (E10, referenced in the case narrative) remains unaware. Waymo has no external signal that anything is wrong. The only person who benefits from your silent departure is Levandowski, who retains one fewer person who might raise the issue. The ethical obligation is not solely to yourself; it includes the colleagues, the company you suspect of misconduct, and the profession whose integrity is implicated by the misappropriation.',

            incomplete: 'This analysis conflates personal protection with professional obligation. Your decision to resign protects you from personal entanglement. It does not discharge your professional obligation under ACM 1.5, which requires you to honor intellectual property rights, or under ACM 1.2, which requires you to avoid harm. A resignation that leaves you silent about the concern you have identified is not ethically neutral -- it is a choice to prioritize your personal comfort over a professional obligation that exists independent of whether you remain employed. The incomplete element is the failure to specify whether resignation discharges the professional obligation or merely removes you from the immediate situation while leaving the underlying harm unaddressed.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.5',
            text: 'Respect intellectual property rights. Computing professionals should be familiar with relevant intellectual property laws and respect them. An employee who encounters evidence or reasonable suspicion that their employer is using materials obtained in violation of intellectual property law has an obligation to address the issue rather than continue participating in the use of those materials.'
        },
        {
            code: 'PMI',
            section: '3.2',
            text: 'Enhance individual competence. IT professionals have a responsibility to continue developing their knowledge and skills. This provision includes the obligation to acquire competence through legitimate means -- through learning, practice, and professional development -- rather than through the misappropriation of others\' work, data, or proprietary methods.'
        },
        {
            code: 'IEEE',
            section: '7.8',
            text: 'Follow organizational regulations, policies, and approved procedures. When a computing professional identifies conduct within their organization that may violate intellectual property laws, organizational policy, or professional obligations, the appropriate first step is to seek resolution within the organization before taking external action.'
        }
    ],
    codeConflict: {
        provision1: 'PMI 3.2',
        provision2: 'ACM 1.5',
        conflictDescription: 'PMI 3.2 addresses the obligation to develop professional competence through legitimate means. The tension in the Levandowski case is that PMI 3.2 is violated by the person who misappropriates trade secrets -- but it also creates an obligation for the engineers who receive that knowledge downstream.\n\nACM 1.5 requires computing professionals to respect intellectual property rights. The conflict that you, the engineer in the scenario brief, face is this: PMI 3.2 says you should build your competence through legitimate work. ACM 1.5 says you should respect others\' IP. These provisions seem to point in the same direction -- do not use stolen technology.\n\nBut the genuine conflict appears when you examine the institutional context. IEEE 7.8 says to follow organizational procedures. Your organization has acquired a company and is directing you to work on technology of uncertain provenance. Following organizational procedures (build the lidar component you were assigned) is in tension with respecting intellectual property rights (refuse to work with potentially misappropriated designs).\n\nThe conflict is: can you simultaneously comply with your employer\'s direction (IEEE 7.8) and honor the intellectual property obligation (ACM 1.5) when the employer\'s direction may be leading you to work with stolen property? Or does ACM 1.5 create an independent obligation that IEEE 7.8 cannot satisfy?'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
