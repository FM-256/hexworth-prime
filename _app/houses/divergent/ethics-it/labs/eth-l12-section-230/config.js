/* ============================================================
   ETH-L12 -- The Speech Question
   Section 230 of the CDA / Platform Moderation Case Room

   This case is the Freedom of Expression case from the Week 2
   lecture (Civil War vs Light Yagami framework pairing). It
   replaces no single Supreme Court decision; the relevant law
   is the statute itself -- 47 U.S.C. § 230, the "26 words that
   built the internet" -- read against the precedent cases that
   shape its current interpretation (Stratton Oakmont v.
   Prodigy, 1995; Zeran v. AOL, 4th Cir. 1997; Force v.
   Facebook, 2d Cir. 2019; Twitter v. Taamneh, U.S. 2023; Moody
   v. NetChoice, U.S. 2024).

   Scenario: the student is a senior engineer at a major social
   media platform whose moderation pipeline has downranked a
   post by a verified medical professional with vaccine-skeptic
   content. The user has sued under a state common-carrier
   social-media law (Texas HB 20 / Florida SB 7072 pattern).
   The student must decide, as the engineer, what the
   moderation system should do -- with the specific post and
   with future posts of the same shape.

   Lecture framework pairing: Captain America: Civil War
   (Tony's accountability position vs Steve's no-centralized-
   judgment position) and Light Yagami (the warning about
   anyone -- however well-intentioned -- becoming the sole
   arbiter of acceptable speech).

   Code anchors: ACM 1.2 (Avoid harm), ACM 1.4 (Be fair and
   take action not to discriminate), ACM 3.1 (Public good
   central concern), ACM 2.3 (Know and respect existing rules
   pertaining to professional work). Conflict: ACM 1.2 vs
   ACM 1.4.

   Red herrings: E5 (DMCA § 512 -- a separate statutory
   immunity regime for copyright that students often conflate
   with § 230 because both are platform immunities; the legal
   tests, the notice-and-takedown mechanisms, and the
   defendant identities are distinct) and E9 (state-level
   child online safety act, e.g., KOSA-style or California
   AB 2273 pattern -- a real and active area of platform
   regulation but a different statutory regime aimed at
   minors, not the § 230 publisher-versus-distributor
   question).
   ============================================================ */

const ETHL12Config = {
    id: 'eth-l12',
    title: 'The Speech Question',
    subtitle: 'Section 230, Algorithmic Moderation, and a Lawsuit Over a Downranked Post',
    course: 'CIS4253',
    week: 2,
    chapter: 4,
    duration: 30,
    accent: '#a855f7',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Director, Trust & Safety Engineering, BridgeView Inc.',
        to: 'You (Senior Engineer, Content Moderation Pipeline)',
        date: 'October 2024',
        classification: 'INTERNAL -- LEGAL PRIVILEGED -- MODERATION PIPELINE',
        content: 'We have a lawsuit filed this week in the Eastern District of Texas. A verified physician on our platform is suing BridgeView under the state\'s social-media common-carrier statute, alleging that we unlawfully downranked her posts about vaccine policy. Her account is not banned. The posts are not removed. They have been demoted in the recommendation algorithm based on a misinformation classifier output, and our amplification system stopped surfacing them on the For You feed.\n\nThe legal framing is the now-familiar one. The plaintiff says she has a right to viewpoint-neutral access to the platform\'s amplification systems. Her complaint invokes the state statute that the Supreme Court remanded in Moody v. NetChoice (2024). It also alleges that algorithmic downranking is a form of "publishing" that strips us of Section 230 immunity, citing the line of cases that have started to test that boundary post-Force v. Facebook (2d Cir. 2019).\n\nA second front: the same week, we received a letter from the Attorney General of a different state demanding that we REMOVE -- not downrank, remove -- this physician\'s posts and others like them under that state\'s public-health misinformation statute. That letter does not say "or face liability under Section 230." It says "or face state enforcement under our consumer protection authority for failing to enforce your stated misinformation policy."\n\nThe technical situation: our moderation pipeline ingests user reports (1,247 reports in the first 24 hours on this physician\'s most-flagged post), runs them through a classifier ensemble (this post: 67 percent "medical-misinformation potential," 12 percent "harassment," 3 percent "election-related"), and produces a moderation score that downstream rankers consume. A score above 0.55 downranks; above 0.80 the post is removed; below 0.45 the post is amplified normally. This post sits at 0.67.\n\nWhy I am writing to you: the legal team is preparing a Section 230 motion to dismiss the Texas lawsuit. They have asked engineering to support that motion with documentation of the pipeline. But they have ALSO asked engineering for a recommendation on the broader question: should the pipeline keep the post downranked, restore it, or remove it? And -- separately -- should we change how the moderation score is computed, how it is documented to the user, and what appeal process the user has?\n\nThe Section 230 question is the LEGAL question. The pipeline question is the ENGINEERING question. They are not the same question, and the engineering team has been asked to take a position on both.',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'legal',
            title: 'Section 230 of the Communications Decency Act -- 47 U.S.C. § 230',
            date: '1996-02-08',
            isRedHerring: false,
            content: '47 U.S.C. § 230 -- Protection for private blocking and screening of offensive material\n\n(c) PROTECTION FOR "GOOD SAMARITAN" BLOCKING AND SCREENING OF OFFENSIVE MATERIAL\n\n(1) TREATMENT OF PUBLISHER OR SPEAKER\n\nNo provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider.\n\n(2) CIVIL LIABILITY\n\nNo provider or user of an interactive computer service shall be held liable on account of--\n\n(A) any action voluntarily taken in good faith to restrict access to or availability of material that the provider or user considers to be obscene, lewd, lascivious, filthy, excessively violent, harassing, or otherwise objectionable, whether or not such material is constitutionally protected; or\n\n(B) any action taken to enable or make available to information content providers or others the technical means to restrict access to material described in paragraph (1).\n\nNote: These are the "26 words that built the internet" -- the 26-word formulation refers to (c)(1). Section 230 was enacted in 1996 as part of the Communications Decency Act. The (c)(1) clause prevents the platform from being treated as the publisher of user content; the (c)(2) clause provides a separate immunity for good-faith moderation decisions. The two clauses do different work. Most contemporary Section 230 fights are about the scope of (c)(1) -- in particular, whether algorithmic recommendation or amplification is "publishing" outside the immunity, or is the kind of decision (c)(2) was designed to protect.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Moderation Pipeline Output for the Flagged Post',
            date: '2024-10-14',
            isRedHerring: false,
            content: 'MODERATION PIPELINE TRACE -- POST ID redacted-7f3a91\nPipeline: bridgeview.moderation.v4.7\n\nUSER REPORTS\n  Total reports (24h): 1,247\n  Report reason distribution:\n    "Misinformation - medical / health"          812\n    "Harassment - targeted"                      183\n    "Violates platform rules - other"            142\n    "Spam"                                        87\n    "Disagreement / I do not like this"           23 (auto-filtered, no moderation weight)\n\nCLASSIFIER ENSEMBLE OUTPUTS\n  med-misinfo-v3:        0.67 (positive)\n  harassment-v2:         0.12 (negative)\n  election-context-v1:   0.03 (negative)\n  policy-violation-v4:   0.41 (subthreshold)\n\nCOMBINED MODERATION SCORE: 0.67\nACTION TAKEN: downrank (range 0.55-0.80)\n  - Removed from For You feed amplification\n  - Removed from Trending eligibility\n  - Retained on Following feed (no demotion within explicit follower graph)\n  - Reply boost suppressed\n\nMODEL CARD NOTES (med-misinfo-v3)\n  Training data: 2.3M labeled examples from PubMed, CDC, WHO, JAMA disclosures, and platform-historical labeled corpus\n  Labeling protocol: medical reviewer agreement >= 2 of 3 on ground truth set\n  Known failure modes: high false-positive rate on nuanced clinical disagreement (e.g., dosing recommendations differing from guidelines); high false-positive rate on policy-adjacent speech that is not itself misinformation\n  Last bias audit: 2024-Q2, posted to internal model registry\n\nNote: The classifier produces a probability. The pipeline produces an action. The CHOICE of threshold (0.55) is a human decision, made by the Trust & Safety policy team in coordination with engineering. The CHOICE of which actions follow each threshold band -- downrank, remove, amplify normally -- is also a human decision. The classifier itself does not enforce policy. The pipeline does.'
        },
        {
            id: 'E3',
            type: 'legal',
            title: 'Stratton Oakmont v. Prodigy -- The Case That Motivated Section 230',
            date: '1995-05-24',
            isRedHerring: false,
            content: 'STRATTON OAKMONT, INC. v. PRODIGY SERVICES CO., 1995 WL 323710 (N.Y. Sup. Ct. 1995)\n\nProdigy was a 1990s online service that hosted user bulletin boards. On one of its boards, an anonymous user posted defamatory statements about the brokerage firm Stratton Oakmont. Stratton sued Prodigy for libel.\n\nThe New York Supreme Court held: Prodigy was liable as a "publisher" of the third-party content. The reasoning: Prodigy had publicly marketed itself as a moderated, family-friendly service. It had content guidelines. It used software filters and employed Board Leaders to review posts. Because it exercised editorial control, it was a publisher rather than a passive distributor. As a publisher, it bore publisher\'s liability for the defamatory statements.\n\nNote: The Stratton Oakmont decision created a moderation paradox. Distinct from Cubby v. CompuServe (1991), which had held that a passive online service was NOT liable for user content because it did not moderate, Stratton Oakmont held that a moderated service WAS liable because it did moderate. The result was that any platform faced a binary choice: moderate nothing (escape liability under Cubby) or moderate at the cost of publisher liability (under Stratton). Congress enacted Section 230 in 1996 specifically to remove this disincentive to moderation -- to allow platforms to engage in "good faith" moderation without thereby becoming publishers of everything they hosted. The "26 words that built the internet" exist because Stratton Oakmont made unmoderated platforms the safer legal choice.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'Zeran v. America Online -- The Scope of Section 230 Immunity',
            date: '1997-11-12',
            isRedHerring: false,
            content: 'ZERAN v. AMERICA ONLINE, INC., 129 F.3d 327 (4th Cir. 1997)\n\nIn the aftermath of the 1995 Oklahoma City bombing, an anonymous AOL user posted offers to sell offensive t-shirts mocking the bombing, listing Kenneth Zeran\'s home phone number as the contact. Zeran began receiving threatening calls. He notified AOL repeatedly. AOL took down each individual post but did not prevent the user from re-posting under different anonymous identities. Zeran sued AOL for distributor liability -- arguing that once AOL was on notice of the defamatory content, it became liable as a distributor (a doctrine separate from publisher liability).\n\nThe Fourth Circuit, Judge Wilkinson writing, held: Section 230 immunizes the interactive computer service against ALL claims that treat it as the publisher of third-party content. The court read "publisher" broadly to include distributor liability as well as primary publisher liability. AOL was immune under § 230(c)(1) regardless of notice.\n\nThe Wilkinson opinion: "Section 230 was enacted, in part, to maintain the robust nature of Internet communication and, accordingly, to keep government interference in the medium to a minimum.... Faced with potential liability for each message republished by their services, interactive computer service providers might choose to severely restrict the number and type of messages posted. Congress considered the weight of the speech interests implicated and chose to immunize service providers to avoid any such restrictive effect."\n\nNote: Zeran is the foundational broad-reading of Section 230. For two decades after Zeran, Section 230 immunity was treated by federal courts as nearly absolute for any claim arising from third-party user content, including claims based on the platform\'s alleged failure to remove content after notice. The boundary cases that have eroded this absolute reading (Roommates.com, 2008; Force v. Facebook, 2d Cir. 2019; Twitter v. Taamneh, 2023) all turn on whether the platform did something OTHER than merely host or remove content -- whether the platform CONTRIBUTED to the content or its harm in some way that is not "publishing."'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'DMCA Section 512 -- Copyright Notice-and-Takedown Safe Harbor',
            date: '1998-10-28',
            isRedHerring: true,  // Red herring: distinct statutory immunity for copyright, with notice-and-takedown structure 230 does not have
            content: '17 U.S.C. § 512 -- LIMITATIONS ON LIABILITY RELATING TO MATERIAL ONLINE\n\nEnacted as Title II of the Digital Millennium Copyright Act of 1998, Section 512 establishes a separate statutory safe harbor for online service providers from copyright infringement claims arising from user content. The structure of the immunity is fundamentally different from Section 230:\n\nUnlike Section 230, the § 512 safe harbor is conditional. To qualify, a platform must:\n\n(a) Designate a registered agent for receiving infringement notices;\n(b) Respond expeditiously to "takedown notices" that meet the statutory specificity requirements;\n(c) Implement a "repeat infringer" termination policy;\n(d) Provide a counter-notice procedure for users whose content was removed; and\n(e) Not have actual knowledge of infringement or financial benefit from infringement it could control.\n\nThe Section 512 regime is the source of the notice-and-takedown infrastructure that platforms operate today for copyright. It is also the source of the "DMCA strike" mechanism familiar to creators on user-generated-content platforms.\n\n[Note: This document is a red herring. Section 512 and Section 230 are different statutory immunities with different structures, different defendants, different procedures, and different policy purposes. Section 230 is broad and unconditional for third-party content; Section 512 is narrow and conditional for copyright. A student analyzing the Section 230 lawsuit in this case may be tempted to import the notice-and-takedown framework of Section 512 into the analysis. That is a category error. The Texas social-media law lawsuit is about whether algorithmic downranking is "publishing" under Section 230. It is not about copyright. It is not about notice. Section 512 has nothing to say about the question.]'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'Moody v. NetChoice -- 2024 Remand on State Social-Media Laws',
            date: '2024-07-01',
            isRedHerring: false,
            content: 'MOODY v. NETCHOICE, LLC, 603 U.S. 707 (2024)\n\nIn 2021, Texas (HB 20) and Florida (SB 7072) enacted social-media laws restricting the ability of large platforms to moderate user content. Both laws were challenged on First Amendment grounds. The Fifth Circuit upheld Texas\'s law; the Eleventh Circuit struck down most of Florida\'s. The Supreme Court took both cases.\n\nIn July 2024, the Court (Justice Kagan writing for the majority) vacated both lower-court decisions and remanded. The Court declined to decide the facial First Amendment question. Its reasoning: the lower courts had analyzed only a narrow subset of the platforms\' content-moderation activities -- those resembling traditional editorial choices -- and had not considered the full range of moderation activities the state laws would regulate, including direct-message screening and personalized algorithmic ranking. The Court instructed the lower courts to do the proper First Amendment analysis on remand.\n\nThe Court signaled, without holding, two things: (1) traditional moderation activities of the major social-media platforms are likely to enjoy First Amendment protection comparable to that of a newspaper\'s editorial choices; and (2) the analytical question is which specific activities the state law actually reaches, not whether platforms in general have First Amendment rights.\n\nNote: Moody did not resolve the legal status of state social-media regulation. It put the lower courts back to work on the facial challenge. As of fall 2024, the Fifth and Eleventh Circuit cases were on remand. The Texas lawsuit in our scenario is filed under a state statute of the HB 20 / SB 7072 type, and it relies on the unresolved status of that body of law. Whatever Section 230\'s textual scope, the First Amendment overlay -- whether platforms have an editorial right to moderate or curate at all -- is the live constitutional question.'
        },
        {
            id: 'E7',
            type: 'technical',
            title: 'BridgeView Moderation Policy and Appeals SOP',
            date: '2024-09-01',
            isRedHerring: false,
            content: 'BRIDGEVIEW TRUST & SAFETY -- MODERATION POLICY OVERVIEW\nDocument: TSE-POL-014, Revision 12 (effective 2024-09-01)\n\nMODERATION HIERARCHY\n  Tier 1 -- Removal: Content is taken off the platform. User may appeal once.\n  Tier 2 -- Downrank: Content remains accessible by direct link or follower feed but is removed from amplification surfaces (For You, Trending, recommendation push).\n  Tier 3 -- Friction: Content is interstitial-warned but otherwise unaltered.\n  Tier 4 -- Amplify normally: No moderation action.\n\nAPPEALS PROCESS\n  Tier 1 (Removal): User notified in product, may file one appeal via web form. Decision target 7 days. ~5,200 appeals/week. Reversal rate: ~12 percent.\n  Tier 2 (Downrank): User NOT notified of action. No appeals process. (NOTE: this is the policy currently under engineering review.)\n  Tier 3 (Friction): User informed at posting; can submit a context note.\n  Tier 4: No notice given (none applicable).\n\nTRANSPARENCY POSTURE\n  Aggregate moderation statistics published quarterly in the Trust & Safety Transparency Report.\n  Per-user notifications: ON for Tier 1, OFF for Tier 2 (this is the gap).\n  Classifier model cards: published on dev-docs portal, no version-pin.\n  Threshold values: NOT published externally.\n\nINTERNAL DISAGREEMENT (logged in policy review notes, Aug 2024)\n  Engineering position: Tier 2 downrank without user notification is inconsistent with the platform\'s stated commitment to transparency, and is the surface area most exposed to the Section 230 / state-statute challenges. Recommend Tier 2 notification + appeal path.\n  Trust & Safety operations position: Tier 2 downrank notification would 10x the appeals volume and is operationally unsupportable at current headcount.\n  Legal position: Tier 2 silent downrank is consistent with Section 230 doctrine as currently understood (no notice required for editorial decisions). Recommend not changing.\n  Status: Unresolved. The policy stands.'
        },
        {
            id: 'E8',
            type: 'legal',
            title: 'Twitter v. Taamneh -- The Algorithm-Recommendation Question',
            date: '2023-05-18',
            isRedHerring: false,
            content: 'TWITTER, INC. v. TAAMNEH, 598 U.S. 471 (2023)\n\nThe family of a victim of a 2017 ISIS-claimed attack in Istanbul sued Twitter, Facebook, and Google, alleging that the platforms\' algorithmic amplification of ISIS-related content constituted aiding and abetting an act of international terrorism under the Anti-Terrorism Act (18 U.S.C. § 2333). The case reached the Supreme Court alongside Gonzalez v. Google, which had presented the question whether Section 230 immunity covers algorithmic recommendations.\n\nThe Court, Justice Thomas writing, held: the platforms\' generic algorithmic recommendation, applied uniformly to all content of similar type, does not amount to aiding and abetting under the federal aiding-and-abetting standard. The platforms had not "consciously and culpably participated" in the terrorist act. The decision was unanimous.\n\nThe Court declined to reach the Section 230 question in either case. By resolving Taamneh on the underlying aiding-and-abetting elements rather than on Section 230 immunity, the Court left the algorithmic-amplification-as-publishing question unresolved.\n\nNote: Taamneh is the case where the Supreme Court could have decided whether Section 230 immunity extends to algorithmic recommendation, and chose not to. The lower courts -- principally the Second Circuit in Force v. Facebook (2019) -- have held that 230 does extend to algorithmic amplification, on the reasoning that the algorithm is part of the "publishing" function that 230 protects. The contrary argument is that the algorithm CONTRIBUTES to the content (selects, ranks, amplifies) in a way that is materially different from passive hosting, and so falls outside the 230 immunity. The plaintiff in the Texas lawsuit in our scenario is testing exactly this argument: downranking is a publishing-level decision and is therefore something the platform DID, not something it merely hosted.'
        },
        {
            id: 'E9',
            type: 'legal',
            title: 'State Child Online Safety Acts -- Minor-Specific Regulatory Regime',
            date: '2022-09-15',
            isRedHerring: true,  // Red herring: different statutory regime aimed at minors, not the publisher/distributor question at issue here
            content: 'STATE-LEVEL CHILD ONLINE SAFETY LEGISLATION\n\nBeginning with California\'s Age-Appropriate Design Code Act (AB 2273, signed September 2022) and accelerating across multiple states through 2023-2024, a body of state statutes has imposed platform obligations specific to minor users. The general pattern:\n\n(a) Platforms likely to be accessed by minors must conduct Data Protection Impact Assessments.\n(b) Default privacy settings for minors must be the most protective option.\n(c) Algorithmic systems that target minors are subject to additional disclosure and minimization rules.\n(d) "Dark patterns" -- design choices that nudge minors toward less protective settings -- are restricted.\n\nAt the federal level, the Kids Online Safety Act (KOSA) was pending in Congress through 2023-2024 in various drafts. State versions of KOSA-style obligations have been enacted independently.\n\n[Note: This document is a red herring. State child online safety acts target a specific population (minors) and a specific harm (developmental and privacy harm to children) under a different statutory rationale than the Section 230 / state common-carrier framework at issue in the Texas lawsuit. The specific student-error mechanism: a student tempted to fold KOSA-style obligations into the analysis is likely making one of two moves. Move (a): treating the state child-safety regime as evidence that "states regulate platform content design" and inferring that the Texas social-media law in the brief is a similar mode of regulation -- but the child-safety regime regulates platform conduct toward a protected population, while the Texas common-carrier law regulates platform conduct as a content-neutral viewpoint-discrimination question. The Supreme Court in Moody signaled that those are analyzed under different constitutional frameworks. Move (b): treating the data-protection-impact-assessment requirements of state child-safety law as a template the engineer should adopt for the Section 230 moderation pipeline -- a procedural design choice that is reasonable on its own engineering merits, but does not answer the constitutional question the lawsuit raises. The lawsuit in our scenario was filed by an adult physician about a non-minor-specific moderation decision. Importing the child-safety framework into the Section 230 analysis conflates population-protected regulation with content-neutral common-carrier regulation, which are different legal regimes.]'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'Industry Moderation-Transparency Practice -- Post-Moody Snapshot',
            date: '2024-09-30',
            isRedHerring: false,
            content: 'TRUST & SAFETY TRANSPARENCY PRACTICE -- INDUSTRY SNAPSHOT (Fall 2024)\n\nA cross-platform review of moderation transparency practices, drawn from each platform\'s published Transparency Report or equivalent disclosure:\n\nMETA (Facebook, Instagram, Threads)\n  Downrank notification: NO (consistent with industry default)\n  Aggregate downrank statistics: published quarterly\n  Oversight Board: independent body, can review specific moderation decisions, decisions binding on Meta for the specific content\n  Appeals: available for removal decisions; not for downrank\n\nGOOGLE (YouTube)\n  Downrank notification: NO\n  Aggregate "limited features" statistics: published quarterly\n  Appeals: available for removal and demonetization; not for ranking changes\n\nX / TWITTER\n  Downrank notification: Partial -- "visibility filtering" on a per-account basis was made user-visible in early 2024 for accounts flagged at certain severity; per-post downrank generally not disclosed\n  Aggregate statistics: published, frequency varies\n  Appeals: available for account-level actions; not for individual post ranking\n\nTIKTOK\n  Downrank notification: NO; "not eligible for the For You feed" status is visible on the post\'s ranking eligibility view inside Creator Center for verified accounts\n  Appeals: available for removal; not for ranking\n\nREDDIT\n  Downrank notification: NO at platform-wide level; subreddit-level moderation is publicly logged via Mod Log in most communities\n  Aggregate statistics: published\n\nEMERGING PATTERN -- POST-MOODY ENGINEERING RESPONSE\n  Several platforms have begun publishing model cards for the principal classifiers in the moderation pipeline (Meta, Google).\n  Two platforms have piloted "per-post moderation receipts" that explain why a specific user\'s specific post was demoted (X, in early 2024; TikTok, in limited testing).\n  No major platform has yet implemented a Tier 2 (downrank) user-visible appeals path comparable to the Tier 1 (removal) appeals process.\n\nNote: The industry default in 2024 is silent downrank -- the user does not learn that their post was demoted, does not learn what classifier produced what score, and has no formal appeal. Engineering teams across multiple platforms have flagged this as an emerging transparency liability. The pressure point is not the moderation itself; it is the lack of due process around the moderation.'
        }
    ],

    // -- Stakeholders ----------------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'The Plaintiff Physician Whose Posts Were Downranked',
            obvious: true
        },
        {
            id: 'S2',
            name: 'The 1,247 Users Who Reported the Post in 24 Hours',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Downstream Readers Whose For You Feed Surfaces Health Content',
            obvious: true
        },
        {
            id: 'S4',
            name: 'BridgeView Engineering Team Building and Operating the Moderation Pipeline',
            obvious: true
        },
        {
            id: 'S5',
            name: 'State Attorneys General Asking the Platform Both to Moderate Less and to Moderate More',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Federal Trade Commission and Other Federal Regulators of Online Platforms',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Civil Liberties Communities Concerned About Both Over- and Under-Moderation',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Trust & Safety Operations Staff Handling Appeals at Current Headcount',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Engineers in Future Moderation Roles Reading the Pipeline You Build',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Future Version of the Engineer Whose Reputation Will Be Tied to the Pipeline They Designed When Section 230 Was Still Unsettled',
            obvious: false
        },
        { id: 'S11', name: 'BridgeView\'s Outside Brand-Marketing Agency', obvious: false, irrelevant: true },
        { id: 'S12', name: 'BridgeView\'s On-Site Cafeteria Vendor', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Produce the technical declaration for the legal team and stop there. Compute the personal-utility math: writing a separate engineering memo arguing that the Tier 2 silent-downrank policy is engineering-fragile -- in the middle of active litigation, on a record opposing counsel will obtain in discovery -- has a high probability of personal cost (becoming the engineer cited against your own employer in pleadings; becoming a name in trial exhibits; becoming a hiring-committee question at every future role) and a low probability of changing the policy (Trust & Safety has heard the engineering position three times in the last six months and the policy stands). High cost, low marginal benefit. The personal-utility calculation prefers the technical declaration alone.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D2',
            text: 'Restore the post (raise its moderation score below the 0.55 threshold), AND propose a pipeline change: every Tier 2 downrank produces a user-visible "moderation receipt" explaining the score, the classifier components, and offering a one-click appeal that routes to a Tier 2 appeals queue. The post-specific decision is reversed; the systemic change reduces the unaccountability that the lawsuit (and the Light Yagami lens) is actually about.',
            framework: 'consequentialist'
        },
        {
            id: 'D3',
            text: 'Remove the post entirely. The platform has a published misinformation policy; the post is flagged by 1,247 user reports; the medical-misinformation classifier returns 0.67. The policy exists for a reason: downstream readers exposed to medical misinformation are harmed in measurable ways. Consistent application of the published rule is the moral act. The Texas lawsuit is a separate question that the platform should defend on its merits.',
            framework: 'deontological'
        },
        {
            id: 'D4',
            text: 'Document the engineering team\'s structural objection to the pipeline as currently designed -- and resign from the moderation team. The role itself, not this specific post, is the issue. Any moderation system at platform scale either over-moderates (silences speech) or under-moderates (amplifies harm), and the silent-downrank policy is the version of moderation that no public-facing accountability mechanism can constrain. The test: ten years from now, would you defend the design of this pipeline in any podcast, in any congressional hearing, to any future plaintiff? If the answer is uncertain, the answer is the design itself.',
            framework: 'virtue'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'The personal-utility math is straightforward and defensible. Estimate the probability that one more engineering memo changes the Tier 2 downrank policy: low. The internal record shows engineering has already raised the position three times in the last six months and the policy stands. Estimate the probability that the same memo, produced during active litigation, lands in opposing counsel\'s discovery production: high. Estimate the probability that the memo is cited in trial exhibits, deposition prep, or appellate briefing: high if the case proceeds. Estimate the career cost of becoming the named engineer in those exhibits: career-defining (it does not disappear from your background-check footprint when the case closes). Marginal benefit: low. Marginal personal cost: high. The personal-utility-maximizing move is to produce the technical declaration the legal team needs, accurate and without spin, and to keep the broader policy position out of the litigation record where it cannot help the case and can demonstrably hurt the career.',

            challenging: 'The personal-utility math collapses under the same critique that disposed of D1 in Carpenter. It treats your career as a fixed asset to be protected, computes expected outcomes around that asset, and arrives at the conclusion that least disturbs the asset. But the policy gap (Tier 2 silent downrank, no notice, no appeals path) is exactly the engineering-fragile surface that the lawsuit -- and the Light Yagami lens from the lecture -- is naming. The engineer who has the technical knowledge to see the gap, and who computes that putting it in writing has personal cost during litigation, has not actually been neutral. They have chosen the policy of silent downrank by their silence. Civil War\'s Tony Stark position is that ratifying-by-silence is the failure mode of the unaccountable engineer. The personal-utility frame ratifies whatever default exists; it cannot generate the moral content that changes the default.',

            incomplete: 'The math in D1 assumes the technical declaration is a neutral artifact. It is not. A declaration that describes the pipeline as more deterministic than it is (e.g., "the classifier returns a score and the action follows") understates the human-decision content of the threshold and policy choices, and helps the Section 230 defense. A declaration that describes the pipeline as more discretionary than it is (e.g., "every action is a human-reviewed editorial choice") undermines the defense by acknowledging editorial control of the Stratton Oakmont kind. The declaration is a written position whether it intends to be or not. D1\'s personal-utility math does not specify which declaration is being produced or how its authorial choices are being made; without that, the "low personal cost" estimate is undercounted, because the wrong declaration is a different career risk than the right one.'
        },
        'D2': {
            supporting: 'A consequentialist case for "restore the post AND add the receipt + appeals path" is the strongest available read of the lecture\'s framework pairing. Civil War (Tony vs Steve) says the tension is the answer: build a moderation system that BOTH operates the misinformation policy (Tony, accountability) AND gives the user notice, transparency, and appeals (Steve, no centralized unilateral judgment). Light Yagami says watch out for whoever resolves the tension: the unaccountability of the silent downrank is the Death-Note-at-scale failure, regardless of whether the underlying classification is correct. The post-specific decision is small (one post moves from 0.67 to 0.45); the systemic change is what addresses the underlying ethical content. It is the design move that survives a Section 230 doctrinal shift in either direction.',

            challenging: 'Two consequentialist objections cut the other way. First, the post-specific restoration is a category error of its own: an individual moderation decision should not be reversed because of a lawsuit, because that gives every well-resourced plaintiff a private right to inverse-moderation. The integrity of the pipeline depends on the pipeline -- including its mistakes -- being applied consistently. Reversing one post because it generated a lawsuit creates worse incentives than leaving it. Second, the "receipt + appeals path" recommendation has been on the table internally for months. The Trust & Safety operations team has documented that the appeals volume would 10x at current headcount. The consequentialist analysis owes an answer to "where do the appeals reviewers come from?" Recommending the change without recommending the staffing model is incomplete consequentialism -- it weighs the speech-side benefit without weighing the operational cost.',

            incomplete: 'D2 does not specify the boundary between the post-specific reversal and the systemic redesign. If the reversal happens only for this post (because of the lawsuit), that is the bad precedent the challenging argument names. If the reversal happens for all posts in the same score band (because the threshold is being recalibrated), that is a policy change with downstream effects on hundreds of thousands of posts whose ranking was set by the same threshold. The decision conflates "fix this case" and "fix the pipeline." They are not the same act and they have different costs. D2 needs to specify which one is being recommended -- and, if both, in what order.'
        },
        'D3': {
            supporting: 'A deontological analysis grounds the decision in a categorical obligation, not in outcomes or evidence-strength. The platform has made a public commitment, in its published Community Guidelines, that it does not host medical misinformation. That commitment is a promise -- a promise to current users, to prospective users, to advertisers, to regulators, to the public who chose to use the platform in part because of its stated rules. The duty to keep the promise exists independently of whether this specific post produced 1,247 reports or 12; independently of whether the classifier confidence is 0.67 or 0.45. If the published commitment means anything, it generates a duty on the platform (and on the engineer who operates the platform\'s enforcement systems) to enforce it. The deontological move is not "apply the rule because consistent application produces good outcomes"; it is "the platform made a promise, the promise generates a duty, the engineer\'s role is to execute the duty." If the threshold or the rule itself is wrong, the deontological response is to change the rule before the next request, not to selectively underenforce it on a post-by-post basis.',

            challenging: 'D3 inherits the Light Yagami problem the lecture warned about. The "rule" being applied is not a public statute; it is a classifier output, produced by a model trained on a labeled corpus that has known biases against clinical disagreement (per the model card in E2). The rule\'s consistency is a procedural consistency, not a substantive one. Applying it strictly is not the same as applying it correctly. Removing the post on the strength of a 0.67 confidence -- in a domain where the model card itself flags high false-positive rates on nuanced clinical disagreement -- ratifies whatever bias is in the model. The engineer who applies the rule strictly cannot at the same time disclaim responsibility for what the rule\'s strict application produces. Iroh\'s future-you question lands here: is the version of you who removed a verified physician\'s vaccine policy critique on a 0.67 model output one you would defend on any podcast?',

            incomplete: 'D3 specifies the removal but does not specify what the engineer says to the policy team about the model. If you remove the post AND tell the policy team that the model\'s known false-positive rate on clinical disagreement is the engineering risk you need addressed, you have done the deontological act and the engineering act. If you remove the post AND say nothing, you have done only the procedural act. The framework demands clarity about whether the rule-application is accompanied by the rule-critique. D3 as written is silent on the second half, which is where most of the ethical content actually lives.'
        },
        'D4': {
            supporting: 'Virtue ethics, in Iroh\'s formulation, asks what kind of professional you become through the systems you help build. Moderation pipelines at platform scale are designed by small teams, operated against billions of posts, and have systemic effects -- amplification, suppression, attention reallocation -- that no individual decision can be traced back to. The lecture\'s warning about Light Yagami is the warning that any system of unilateral, unaccountable judgment becomes the failure mode of its operator, however well-intentioned the operator is. If you cannot defend the design of this pipeline to the version of you ten years from now -- not the post-specific decisions, but the pipeline itself, its silence, its absence of appeals, its black-box thresholds -- then the role is the issue, and staying in the role makes you part of the failure. Resignation, accompanied by disclosure, is the recognition that the design table itself is the wrong table.',

            challenging: 'Resignation without disclosure makes the pipeline worse. Your departure leaves no one in the role who has thought about the Iroh question. The next engineer treats the pipeline as established practice and the gap you would have surfaced (the Tier 2 silent downrank, the unmoderated thresholds, the absence of user notice) is not surfaced. The Trust & Safety operations objection (10x appeals volume) goes unanswered because the engineer who could have proposed the operational redesign has left. Virtue ethics, applied here, has the same failure mode as in Carpenter: leaving is the version that is easiest to defend in your own narrative; staying and changing the design is the version that actually changes what gets shipped. Civil War\'s Steve Rogers chose the harder version of refusal -- not by leaving the table, but by refusing to sign the document. The harder virtue move at the platform is to stay and to refuse to ship the pipeline you cannot defend.',

            incomplete: 'D4 specifies the resignation but does not specify what it is accompanied by. A silent resignation discharges nothing. A disclosed resignation -- to engineering leadership, to industry peers, to civil liberties counsel, to the Trust & Safety transparency report -- is a different act with different downstream consequences. The decision also does not address the active lawsuit. The pipeline is being litigated NOW. The engineer who resigns before the litigation is over (a) loses standing as a witness with current technical knowledge, and (b) leaves the operational team without the engineer who was prepared to argue the position. Virtue ethics demands clarity about WHICH version of the resignation is being chosen and WHEN. D4 leaves that unspecified.'
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
            section: '1.4',
            text: 'Be fair and take action not to discriminate. The values of equality, tolerance, respect for others, and justice govern this principle. Fairness requires that even careful decision processes provide some avenue for redress of grievances. Computing professionals should foster fair participation of all people, including those of underrepresented groups. Prejudicial discrimination on the basis of age, color, disability, ethnicity, family status, gender identity, labor union membership, military status, nationality, race, religion or belief, sex, sexual orientation, or any other inappropriate factor is an explicit violation of the Code.'
        },
        {
            code: 'ACM',
            section: '3.1',
            text: 'Ensure that the public good is the central concern during all professional computing work. People -- including users, customers, colleagues, and others affected directly or indirectly -- should always be the central concern in computing. The public good should always be an explicit consideration when evaluating tasks associated with research, requirements analysis, design, implementation, testing, validation, deployment, maintenance, retirement, and disposal.'
        },
        {
            code: 'ACM',
            section: '2.3',
            text: 'Know and respect existing rules pertaining to professional work. Rules include local, regional, national, and international laws and regulations, as well as any policies and procedures of the organizations to which the professional belongs. Computing professionals must abide by these rules unless there is a compelling ethical justification to do otherwise. Rules that are judged unethical should be challenged. A computing professional should consider challenging the rule through existing channels before violating the rule.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.2',
        provision2: 'ACM 1.4',
        conflictDescription: 'ACM 1.2 (Avoid harm) and ACM 1.4 (Be fair and take action not to discriminate) are the two provisions in primary tension in the Section 230 moderation question, and the lecture\'s Civil War framework maps directly onto the conflict. ACM 3.1 (Public good as the central concern) functions as the resolution lens through which the tension is read, and ACM 2.3 (Know and respect existing rules pertaining to professional work) defines the procedural baseline against which any engineering response is measured. All four are active in the analysis.\n\nACM 1.2 (Avoid harm) supports moderation. Downstream readers of medical misinformation are harmed in measurable ways: medical misinformation contributes to vaccine hesitancy, suboptimal treatment decisions, and -- in the aggregate -- excess mortality during public health events. The harm is real, the harm is to identifiable third parties, and the platform\'s moderation pipeline is the mechanism that exists to reduce it. The Avoid Harm principle does not stop at the user whose post is downranked; it includes everyone the post would have reached.\n\nACM 1.4 (Be fair / no discrimination) supports the user. The plaintiff physician\'s posts are clinical disagreements with public-health guidance. They are speech on a matter of public concern, by a credentialed professional, with a verifiable basis in the published medical literature (whether or not the platform\'s classifier agrees). Be Fair requires that the platform\'s moderation pipeline not effectively discriminate against viewpoints whose holders disagree with majority medical guidance -- a category that, in the public-health context, sometimes turns out to be right (the medical consensus on lipid hypothesis, on the safety of certain medications, and on the timing of public-health interventions has been revised, sometimes substantially, on subsequent evidence). Be Fair also requires "some avenue for redress of grievances" -- which the platform\'s Tier 2 downrank policy explicitly does not provide.\n\nACM 3.1 (Public good) is the test that breaks the 1.2-vs-1.4 deadlock. Neither principle is dominant in the abstract; each is dominant relative to the public-good consequences of privileging it. If the public-good case for moderation is concrete (population-level harm with demonstrable causal mechanism, e.g., during an active outbreak), ACM 1.2 controls. If the public-good case is contested or contestable (an evolving scientific question where viewpoint suppression risks foreclosing the correction process that science depends on), ACM 1.4 controls. The Civil War framework operates here: Tony Stark\'s position reads ACM 1.2 + ACM 3.1 jointly (moderation prevents downstream harm, the public good requires accountability for that harm). Steve Rogers\' position reads ACM 1.4 + ACM 3.1 jointly inverted (centralized judgment of speech is the public-good harm; the absence of moderation\'s downside is preferable to the certainty of suppression\'s downside).\n\nACM 2.3 (Know and respect existing rules) is the procedural floor that distinguishes ACM 1.2 / 1.4 analysis from D1\'s personal-utility lane-compliance argument. ACM 2.3 directs the engineer to abide by organizational rules unless there is a compelling ethical justification to do otherwise -- and specifies that rules judged unethical should be challenged through existing channels before being violated. D1 invokes the first half of ACM 2.3 (abide by rules) as cover for staying silent on the policy gap; the substantive ACM 1.2 / 1.4 / 3.1 analysis is the "compelling ethical justification" half of 2.3 that D1 omits. ACM 2.3 specifies HOW to raise the concern (challenge through existing channels); the other ACM principles specify WHAT the concern is.\n\nThe Light Yagami warning hovers over the whole analysis: whichever provision you privilege, the design choice produces a unilateral moderation pipeline whose accountability mechanisms (or absence thereof) the engineer is responsible for. The conflict cannot be dissolved by picking a side; it can only be designed AROUND by building the appeals path, the receipt, the transparency mechanism that lets both principles operate in tension rather than at the expense of each other.'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
