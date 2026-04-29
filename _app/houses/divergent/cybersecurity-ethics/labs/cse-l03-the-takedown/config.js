/* ============================================================
   CSE-L03 — The Takedown
   Strand Platform Election-Cycle Decision Configuration

   All company names, account names, dates, follower counts,
   and dollar figures are entirely fictional. Strand is a
   fictional social platform. @OpenForumNorth is a fictional
   account. Any resemblance to real platforms, accounts, or
   incidents is coincidental.

   Red herrings: E4 (account holder's hobbyist posts — real
   but entirely irrelevant to the CIB and content-moderation
   analysis) and E9 (competitor brand-safety marketing
   announcement — irrelevant to the platform's independent
   content-policy obligation).
   ============================================================ */

window.CSEL03Config = {
    id: 'cse-l03',
    title: 'The Takedown',
    subtitle: 'Strand Platform Election-Cycle Decision',
    course: 'CIS2253',
    week: 2,
    chapter: 3,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'Office of the CEO and General Counsel — Joint',
        to: 'You (Head of Trust and Safety)',
        date: 'October 2024',
        classification: 'CONFIDENTIAL -- TRUST AND SAFETY ESCALATION',
        content: 'This memo is issued jointly by the Chief Executive Officer and the General Counsel. It supersedes prior informal guidance and constitutes the official escalation record for the @OpenForumNorth matter.\n\nBackground: Strand is a US-based social platform with approximately 30 million monthly active users. We operate under a content policy framework that has been publicly published and is incorporated by reference into our terms of service. It is election season.\n\nThe account @OpenForumNorth has approximately 280,000 followers and generates engagement rates significantly above platform average. Over the past six weeks, this account has published a sustained series of posts claiming that voting machines used in three unnamed states are remotely accessible and subject to result manipulation. These claims are directly contradicted by the verified public statements of state election officials in those states, who have certified the security and integrity of their systems (see attached evidence file E3). The claims are, as far as legal counsel can determine, constitutionally protected speech under current First Amendment doctrine as applied to private platforms. We are not a state actor, and we have full legal authority under Section 230 of the Communications Decency Act to either leave the content up or remove it at our discretion.\n\nThe CIB Question: Our network integrity team has completed an analysis of @OpenForumNorth amplification patterns. The results are inconclusive. Certain amplification signals are consistent with coordinated inauthentic behavior — specifically, a cluster of low-activity accounts that repost within seconds of publication. However, those patterns are also consistent with a highly engaged domestic follower base using automated notification tools. We cannot attribute the account to a foreign influence operation with the evidence currently available to us (see attached evidence file E2).\n\nGovernment Signal: At an informal meeting with a liaison from a federal partner agency three days ago, the liaison stated verbally — and explicitly declined to commit anything to writing — that "based on signals we cannot share with you, this account may be connected to a foreign influence effort." The liaison did not name the account by name in that meeting, though the context made clear they were referring to @OpenForumNorth. No formal designation, no actionable intelligence, no documentation. We cannot verify, attribute, or act on this communication as a confirmed intelligence product.\n\nInstitutional Positions: The CEO\'s stated preference is minimum disruption. The head of policy has advised that removal will trigger congressional letters from one political party characterizing any takedown as ideological censorship. Legal has confirmed we have full authority to act either way.\n\nYou are being asked to make the Trust and Safety recommendation. The options are yours to analyze. The decision is yours to justify.'
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E4 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: '@OpenForumNorth — Recent Post Excerpts (Six-Week Sample)',
            date: '2024-10-01',
            isRedHerring: false,
            content: 'The following excerpts are drawn from the most-engaged posts published by @OpenForumNorth between September 12 and October 1, 2024. Engagement figures reflect combined likes, reposts, and replies at time of capture.\n\nPost dated September 14: "Voting machines in three states can be accessed remotely by anyone with the right credentials. Election officials know this. Why aren\'t they talking about it? #VoteSecure" — 41,000 engagements.\n\nPost dated September 19: "I asked a county IT administrator off the record. He wouldn\'t deny it. That\'s your answer. These machines are not secure." — 28,000 engagements.\n\nPost dated September 23: "Certified secure by the same officials who chose these vendors. Think about that." — 34,000 engagements.\n\nPost dated September 29: "Nothing has changed. If you vote on a touchscreen, your vote is a question mark." — 52,000 engagements.\n\nContent review notes: None of the posts contain explicit calls to action, threats, or statements that cross current platform incitement thresholds. The claims are not demonstrably false in the narrow legal sense — they are framed as inferences and questions rather than factual assertions. The posts link to no external sources. The "off the record" sourcing in the September 19 post is unverifiable. Election officials in the referenced states have publicly disputed all claims.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Network Integrity Team — CIB Signal Analysis (Inconclusive)',
            date: '2024-10-03',
            isRedHerring: false,
            content: 'STRAND NETWORK INTEGRITY — INTERNAL ANALYSIS MEMO\nAccount under review: @OpenForumNorth\nAnalysis window: August 1 — October 1, 2024\nConclusion: INCONCLUSIVE\n\nSignals consistent with coordinated inauthentic behavior: A cluster of 340 accounts with fewer than 50 lifetime posts each reposted @OpenForumNorth content within 90 seconds of publication on 12 of 18 sampled posts. The cluster accounts show no mutual follows among themselves and no content creation outside of reposts. These behavioral signatures are consistent with CIB network operation.\n\nSignals inconsistent with or undermining CIB attribution: The primary @OpenForumNorth account has operated continuously since 2019 and shows authentic historical engagement across political, hobbyist, and personal topics consistent with a real domestic user. The amplification cluster\'s response time, while rapid, is within the range achievable by domestic users with push notification alerts. No foreign IP registration, foreign language metadata, or known foreign influence network infrastructure has been identified in connection with the amplification cluster. Prior-generation CIB networks show IP homogeneity; this cluster is geographically dispersed across 22 US states.\n\nTeam assessment: We cannot attribute this account to a foreign influence operation with available evidence. We cannot rule out domestic organic coordination. Action based solely on this analysis is not supportable as a CIB finding.'
        },
        {
            id: 'E3',
            type: 'testimony',
            title: 'Election Officials — Public Statements on Voting System Security',
            date: '2024-09-26',
            isRedHerring: false,
            content: 'The following statements are drawn from official public communications issued by state election officials in the three states referenced implicitly in @OpenForumNorth posts. These are public record and have been shared publicly on official government domains.\n\nSecretary of State, State A (September 21 press briefing): "Our voting systems have undergone independent security audits by three separate firms in the past 18 months. No remote access capability of the kind being described on social media exists in our certified equipment. We are asking platform companies to label these claims with accurate context."\n\nDirector of Elections, State B (public letter, September 24): "Claims circulating online that our voting machines can be remotely manipulated are false. These systems are air-gapped. The security posture of our infrastructure has been certified by the federal Election Assistance Commission."\n\nState C Elections Board joint statement (September 27): "We have reviewed the specific technical claims being made on several social platforms. They are not consistent with the architecture of any equipment certified for use in our state. We urge voters to consult official sources."\n\nNote: These are official government statements, not platform-generated fact checks. Strand has not applied any label, flag, or interstitial to @OpenForumNorth posts despite the existence of these contradicting official statements.'
        },
        {
            id: 'E4',
            type: 'data',
            title: '@OpenForumNorth — Hobbyist and Personal Post History',
            date: '2024-09-01',
            isRedHerring: true,  // Red herring: the account's non-political posting history is irrelevant to the CIB analysis and the content-policy decision; authenticity of the account does not determine the harm of the content
            content: 'A review of @OpenForumNorth\'s full posting history shows an extensive pre-2023 record covering topics entirely unrelated to election integrity. The account posted regularly about amateur radio operation, including equipment reviews, frequency logs, and participation in emergency communications exercises. Additional posts cover weekend woodworking projects, a 2021 cross-country motorcycle trip documented in a multi-week thread, and commentary on regional high school sports.\n\nThe account\'s transition to election-focused content began in early 2023 and accelerated through 2024. The shift in topic coverage is notable but not unprecedented for accounts responding to a major election cycle. Network integrity analysts note that topic pivots of this kind are seen in both authentic domestic accounts and in accounts that change operational purpose after establishment — a technique known as "seasoning." The hobbyist posting history is therefore neither confirmatory nor exclusionary with respect to CIB attribution. It is presented here for completeness.\n\nNote: The personal authenticity of the account holder is a separate question from the harm and policy question. Whether @OpenForumNorth is operated by a genuine domestic individual does not determine whether the content is harmful, whether it violates policy, or whether the amplification cluster represents coordinated inauthentic behavior. This evidence should not substitute for the policy analysis.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'Legal Team — Section 230 Authority Analysis (CDA 230(c)(1) and 230(c)(2))',
            date: '2024-10-02',
            isRedHerring: false,
            content: 'STRAND LEGAL AFFAIRS — INTERNAL MEMORANDUM\nSubject: CDA Section 230 and Strand\'s Content Moderation Authority\nPrepared for: Trust and Safety Leadership\n\nSection 230(c)(1) of the Communications Decency Act states that no provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider. This provision is the core liability shield: Strand is not legally responsible for @OpenForumNorth\'s posts regardless of their content, provided Strand did not create or materially contribute to that content.\n\nSection 230(c)(2) provides a separate and distinct protection: no provider shall be held liable for any action voluntarily taken in good faith to restrict access to or availability of material that the provider considers to be obscene, lewd, lascivious, filthy, excessively violent, harassing, or otherwise objectionable, whether or not such material is constitutionally protected.\n\nThe operative legal conclusion: Strand has full legal authority to remove, downrank, label, or leave untouched the @OpenForumNorth account and its content. We are not the publisher of the content (230(c)(1)), and we are immunized from civil liability for any good-faith moderation action we take (230(c)(2)).\n\nWhat Section 230 does not answer: The existence of legal authority to act is distinct from whether acting is ethically, institutionally, or strategically correct. Legal can tell you what you are permitted to do. Legal cannot tell you what you should do.'
        },
        {
            id: 'E6',
            type: 'memo',
            title: 'Government Partner Liaison — Informal Meeting Summary (Paraphrased)',
            date: '2024-10-01',
            isRedHerring: false,
            content: 'INTERNAL MEETING NOTES — TRUST AND SAFETY (VERBAL SUMMARY, NOT VERBATIM)\nMeeting with: Federal partner agency liaison (name withheld per agency request)\nFormat: In-person, informal; no recording, no formal documentation requested by agency\n\nThe following is a paraphrase reconstructed immediately after the meeting by the Head of Trust and Safety and reviewed by General Counsel for accuracy.\n\nThe liaison stated that the agency has visibility into influence operations targeting the current election cycle across multiple platforms. The liaison indicated that, in their assessment, one or more accounts on Strand "might be" connected to a foreign influence effort, and that the signals they were drawing on were not shareable under classification constraints. When asked directly whether @OpenForumNorth was the account in question, the liaison did not confirm or deny by name but stated that the context should be sufficient for the platform to "take a look." No formal designation was made. No written intelligence product was provided or promised.\n\nLegal Affairs assessment: This communication does not constitute actionable intelligence. It cannot be used as documented grounds for a takedown decision. Acting on it creates a record in which a private platform took editorial action based on an unverifiable verbal suggestion from a government representative — a posture with significant First Amendment adjacency implications regardless of the platform\'s private legal status. If the account is later found not to be foreign-influenced, the decision would be indefensible to the public and to Congress.\n\nThe existence of this communication is documented here solely for the institutional record.'
        },
        {
            id: 'E7',
            type: 'data',
            title: 'Engagement Analytics — Organic vs. Amplified Reach Breakdown',
            date: '2024-10-03',
            isRedHerring: false,
            content: 'STRAND ANALYTICS — ACCOUNT REACH ANALYSIS\nAccount: @OpenForumNorth\nPeriod: September 1 — October 3, 2024\n\nTotal unique accounts reached (30-day): 4.1 million\nPrimary reach (direct followers): 280,000 (6.8% of total reach)\nSecondary reach (repost amplification): 3.82 million (93.2% of total reach)\n\nAmplification breakdown:\n— Organic repost chain (follows-of-followers, >72hr latency): 61% of secondary reach\n— Rapid-amplification cluster (0-90 second repost latency, 340-account group): 18% of secondary reach\n— Cross-platform citation (external links to @OpenForumNorth posts on third-party sites): 21% of secondary reach\n\nContext for interpretation: The rapid-amplification cluster accounts for 18% of secondary reach — representing approximately 688,000 unique accounts exposed primarily through that cluster. The organic repost chain represents the larger share of amplification and is behaviorally consistent with standard high-engagement domestic sharing patterns. The algorithmic recommendation engine has not been modified with respect to this account; it continues to receive standard treatment under Strand\'s relevance ranking.\n\nNote: Downranking the account in the recommendation algorithm would primarily affect secondary reach. Primary reach (direct followers) would be largely unaffected unless follower notification is also suppressed, which would require a separate policy decision.'
        },
        {
            id: 'E8',
            type: 'legal',
            title: 'Precedent Review — Prior Platform Takedown Decisions in Election Context',
            date: '2024-09-15',
            isRedHerring: false,
            content: 'STRAND POLICY TEAM — COMPARATIVE PRECEDENT SUMMARY\nPrepared for: Trust and Safety Review\n\nThe following summary covers publicly documented takedown and enforcement decisions made by comparable platforms in prior election cycles. All sourcing is from public announcements, congressional testimony, and published transparency reports.\n\nPrecedent A: A major social platform in 2022 removed over 2,400 accounts it publicly attributed to a state-sponsored influence network, citing its own internal CIB attribution process and publishing a detailed transparency report disclosing the operation\'s infrastructure and tactics. The platform noted that attribution was based on behavioral signals and infrastructure analysis, not on government designation.\n\nPrecedent B: A different platform in 2020 applied a "disputed claims" interstitial label to election-related posts that were contradicted by official sources, without removing the underlying posts. This approach faced criticism from both political parties — one side argued the labels were insufficient, the other argued they were partisan. The platform defended the approach as a content-neutral policy applied by automated policy criteria.\n\nPrecedent C: A platform in 2023 chose not to act on a government partner\'s informal suggestion regarding a specific set of accounts, stating publicly that it acts on its own CIB attribution process and does not take editorial direction from government agencies. Six months later, a foreign intelligence service publicly attributed those accounts to a state operation. The platform faced criticism for inaction but faced no legal liability.\n\nPattern: Platforms that took action based on documented internal CIB findings were better positioned legally and reputationally than those that acted on government suggestion alone or that refused to act at all when internal signals existed.'
        },
        {
            id: 'E9',
            type: 'news',
            title: 'Competitor Platform — Brand Safety Election Integrity Announcement',
            date: '2024-10-03',
            isRedHerring: true,  // Red herring: a competitor's marketing-adjacent policy announcement does not bear on Strand's independent content-policy obligation; following a competitor's posture is not an ethical framework
            content: 'PRESS RELEASE — VANTAGE SOCIAL (competitor platform, fictional)\nDate: October 3, 2024\n\nVantage Social today announced its Election Integrity Initiative for the 2024 cycle, including automatic removal of election-related content that is contradicted by official election authority statements, a dedicated election information hub, and a zero-tolerance policy for any account found to be operating with foreign government affiliation.\n\nVantage Social CEO Mira Okonkwo stated: "Platforms that serve American users have a responsibility to ensure that the information environment around elections is not weaponized. We are drawing a clear line."\n\nAnalyst comment (third-party technology newsletter): The announcement positions Vantage Social ahead of the election as a safety-first platform, a move likely designed to preempt advertiser pressure. Several major brand advertisers have privately signaled discomfort with election-related content controversy on platforms they fund through advertising. The Vantage announcement may create pressure on other platforms to announce similar stances.\n\nNote: This announcement was made the same day as the Strand Trust and Safety escalation memo. Strand has not publicly committed to any specific election-integrity policy stance. The competitor\'s announcement reflects its independent strategic and commercial calculus and does not constitute grounds for Strand to adopt an equivalent policy, nor does it provide any information about the @OpenForumNorth account specifically.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'User Reports — @OpenForumNorth Flagging Volume and Categories',
            date: '2024-10-02',
            isRedHerring: false,
            content: 'STRAND TRUST AND SAFETY — USER REPORT SUMMARY\nAccount: @OpenForumNorth\nReporting window: September 1 — October 2, 2024\n\nTotal user reports received: 3,841\nPrimary report categories:\n— "Misleading or false election information": 2,204 reports (57.4%)\n— "Foreign interference / inauthentic account": 891 reports (23.2%)\n— "Harassment or targeted narrative": 412 reports (10.7%)\n— "Other / unspecified": 334 reports (8.7%)\n\nNote on report quality: User reports are not themselves evidence of policy violation. The reporting population may include users motivated by political disagreement rather than genuine policy concern. However, volume and category concentration of this magnitude — 3,841 reports in 32 days, with 80.6% in two policy-adjacent categories — is statistically unusual and indicates a significant portion of the platform user base perceives the account as a trust and safety concern.\n\nComparison: Of Strand accounts with similar follower counts (200K-400K), the 90th percentile for reports received over a 30-day period is 287 reports. @OpenForumNorth is at the 99.9th percentile.\n\nPlatform response to date: Account has been reviewed three times by Trust and Safety first-tier reviewers. All three reviews concluded the content does not currently meet removal thresholds under existing policy. No enforcement action has been taken. No escalation to senior review occurred until this memo.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Head of Trust and Safety)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Strand CEO',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Strand General Counsel',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Strand Head of Policy',
            obvious: true
        },
        {
            id: 'S5',
            name: '@OpenForumNorth Account Holder',
            obvious: true
        },
        {
            id: 'S6',
            name: '@OpenForumNorth Followers (280K)',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Voters Who May Be Misled About Election Integrity',
            obvious: false
        },
        {
            id: 'S8',
            name: 'State Election Officials Whose Statements Contradict the Posts',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Federal Government Partner Agency',
            obvious: false
        },
        {
            id: 'S10',
            name: 'Congressional Oversight (Both Parties)',
            obvious: false
        },
        {
            id: 'S11',
            name: 'Civil Society Election-Integrity Organizations',
            obvious: false
        },
        {
            id: 'S12',
            name: 'Strand HR Department',
            obvious: false,
            irrelevant: true
        },
        {
            id: 'S13',
            name: 'Competitor Platform CEO (Vantage Social)',
            obvious: false,
            irrelevant: true
        }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Leave the account up. The speech is constitutionally protected, the CIB attribution is inconclusive, and removing a legal domestic political account without confirmed foreign-influence evidence is an overreach of platform authority.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Downrank but do not remove. Reduce algorithmic amplification of @OpenForumNorth content in the recommendation engine while preserving the speech for followers who actively seek it.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'Suspend the account pending a formal CIB review. Treat the government partner\'s unconfirmed signal as sufficient cause for a cautious temporary hold while Strand conducts deeper analysis.',
            framework: 'consequentialist'
        },
        {
            id: 'D4',
            text: 'Remove the account and publicly disclose the takedown decision with as much explanation as possible — including the existence of the government signal — without compromising the government partnership.',
            framework: 'utilitarian'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'Deontological reasoning most directly supports this choice. A rights-based analysis holds that the duty to protect free expression does not dissolve because the speech is inconvenient, high-engagement, or politically sensitive. Kant\'s categorical imperative asks: what if every platform removed legal political speech whenever a government representative verbally suggested it might be problematic? Universalized, that norm produces a world in which government agencies can effectively direct private platform censorship through off-the-record meetings — without accountability, attribution, or due process. The ACM Code of Ethics Section 1.1 directs professionals to contribute to society and human well-being, and a robust information environment — even one that includes contested claims — is foundational to democratic deliberation. The platform\'s published content policy (E5) governs. Until @OpenForumNorth crosses a documented threshold, the duty-based framework says: hold the line.',

            challenging: 'A consequentialist challenge is significant here. The engagement analytics (E7) show that the rapid-amplification cluster drove approximately 688,000 unique users to election-integrity content that is directly contradicted by official election authorities (E3). The deontological case for leaving the account up is strongest when the speaker\'s rights and the listener\'s access to accurate information are in reasonable balance. They are not in this case: algorithmic amplification means that @OpenForumNorth\'s reach extends to 4.1 million users, the large majority of whom were not seeking that content. The duty to protect speech does not include a duty to amplify it. A stakeholder analysis also complicates the deontological frame: S7 (voters who may be misled) have a competing deontological claim to accurate information about the mechanics of their own democracy. The rights analysis is not one-sided.\n\nA virtue ethics challenge also applies: a person of practical wisdom (phronesis) operating in an election context does not treat a verbal government signal (E6), 3,841 user reports (E10), and inconclusive-but-notable CIB signals (E2) as a complete non-event. The virtuous choice is not pure inaction — it is proportional, calibrated response. D1 does not compel inaction on amplification while permitting the speech itself to stand.',

            incomplete: 'This analysis answers the removal question but not the amplification question. D1 as stated resolves nothing about Strand\'s algorithmic recommendation behavior. The platform currently applies standard ranking to @OpenForumNorth (E7). Leaving the account up while continuing to actively amplify it to 4.1 million users — the large majority of whom did not follow the account — conflates speech preservation with algorithmic promotion. These are separable actions. A complete analysis of D1 must address whether the duty to protect speech extends to a duty to maintain current algorithmic amplification levels, and whether platform neutrality on content is the same thing as neutrality on distribution. It is not. Leaving that distinction unresolved renders the deontological defense incomplete.'
        },
        'D2': {
            supporting: 'Virtue ethics supports this choice as the response most consistent with proportionality, practical wisdom, and institutional integrity. Aristotle\'s framework asks not what rule applies in the abstract, but what a person of good character would do given the full complexity of the situation. The full situation includes: speech that is legal and may be authentic domestic content (E2, E4); speech that is contradicted by official government statements (E3); amplification patterns that are anomalous but inconclusive (E2, E7); and a government signal that is unverifiable and cannot be documented as grounds for removal (E6). A virtuous actor does not remove what cannot be attributed, and does not amplify what is demonstrably contradicted by authoritative sources. Downranking threads this needle. It preserves the speech for those who seek it (protecting S5 and S6) while reducing the platform\'s active role in propagating claims that election officials have publicly refuted (protecting S7 and S8). The platform\'s policy infrastructure (E5) explicitly preserves this option.',

            challenging: 'A deontological challenge: downranking without disclosure is a form of covert editorial action. S5 (the account holder) has no notice that the platform is suppressing their reach, and S6 (followers) may not receive content they have explicitly opted into. If Strand\'s commitment is to transparent governance, covert algorithmic suppression violates that duty even when the outcome is appealing. A stronger deontological critique points to the government signal (E6): if Strand downranks in response to the liaison\'s informal meeting — even without publicly acknowledging it — the platform has still allowed an unverifiable, unattributable government communication to direct its editorial behavior. The virtue of the action is undercut by the opacity of the process.\n\nA consequentialist challenge also applies: the engagement analytics (E7) show that 18% of @OpenForumNorth\'s total reach comes from the rapid-amplification cluster. Downranking the recommendation engine affects the organic secondary reach, which is 61% of secondary reach and behaviorally consistent with authentic domestic sharing. The people most affected by downranking may be the authentic domestic followers, not the amplification cluster. The expected harm-reduction effect of D2 is therefore less targeted than it appears.',

            incomplete: 'This choice does not address stakeholders S9 (government partner) or S10 (congressional oversight). The government liaison who made the informal verbal suggestion (E6) will observe whether any platform action follows their meeting. If Strand downranks but does not communicate with the partner agency, the agency may interpret silence as non-response and escalate through other channels. Conversely, if Strand does communicate its downranking decision to the agency, it has now created a documented record of coordinated action — which may be exactly the "government direction of platform editorial decisions" that the platform\'s legal team described as posing significant First Amendment adjacency risk (E6). D2 does not resolve that tension. The institutional integrity of the decision depends on whether Strand can explain it entirely on content-policy grounds without referencing the government signal, and the analysis does not yet establish whether that is possible given the timeline.'
        },
        'D3': {
            supporting: 'Consequentialist analysis supports this choice under a risk-minimization framing. The suspension is not a removal — it is a hold that creates time for Strand to gather better information before making an irreversible decision. The expected-value argument: if @OpenForumNorth is a foreign-influenced account, continued operation during a pending election creates ongoing harm to S7 (voters who may be misled) and S8 (election officials whose credibility is undermined). If the account is a genuine domestic actor, a temporary suspension pending formal review is a recoverable outcome — the account can be reinstated with an apology and explanation. The asymmetry of consequences favors caution when a government signal (E6), even an unverifiable one, points to potential foreign interference. Precedent C in the prior platform review (E8) showed that inaction in the face of government signals was reputationally costly when the accounts were later confirmed as foreign-operated. D3 prioritizes risk management for S7 over process purity.',

            challenging: 'The government signal (E6) is the entire empirical foundation for treating D3 differently from D1. Legal Affairs has explicitly advised that the informal verbal communication "does not constitute actionable intelligence" and that acting on it creates a record of government-directed private censorship (E6). Suspending the account based on a government signal that is classified, unattributable, and unverifiable does not merely risk reputational harm — it risks normalizing a practice in which government agencies can initiate platform enforcement actions through informal verbal channels while maintaining plausible deniability. Stakeholder S10 (congressional oversight) is not a monolith: one party will characterize suspension as justified security action; the other will characterize it as government-censorship of domestic political speech. The consequentialist analysis of D3 must honestly account for the downstream institutional harm, not just the immediate election-integrity benefit.\n\nACM Code 1.1 framing cuts both ways: contributing to society and human well-being includes preserving the institutional independence of platforms from government editorial direction. That independence is what gives platform moderation decisions their legitimacy. Suspending on the basis of E6 surrenders a portion of that independence in exchange for an uncertain security benefit.',

            incomplete: 'D3 defers the decision but does not define the review. "Suspend pending formal CIB review" is not a complete choice unless the review parameters are specified: what evidence threshold would result in reinstatement? What evidence threshold would result in removal? What is the timeline of the review, and who conducts it? In an election context, a suspension initiated fourteen days before the election and resolved afterward is functionally equivalent to removal for the election cycle — the harm to S5 and S6 is real regardless of the ultimate outcome. The consequentialist analysis must account for the time-sensitive nature of the suspension decision, and D3 does not currently do so. Without review criteria and timelines, D3 is a delay mechanism with unexamined downstream consequences rather than a genuine consequentialist calculation.'
        },
        'D4': {
            supporting: 'Utilitarian analysis supports this choice when the calculation is performed at the broadest institutional level rather than the individual-account level. The greatest good for the greatest number, in the election-integrity context, is a robust and trusted information environment in which platform decisions are transparent, grounded in explicit policy, and publicly accountable. Removing @OpenForumNorth and disclosing the decision — including, to the extent possible, the existence of a government partner signal — maximizes several utilities simultaneously: it protects S7 (voters) from ongoing exposure to content contradicted by election authorities (E3); it protects S8 (election officials) whose credibility is being undermined; it maintains platform accountability to S10 (congressional oversight) by creating a public record rather than a covert action; and it protects S11 (civil society election-integrity organizations) who have standing interest in platform transparency. The precedent review (E8) shows that platforms that took action based on documented policy grounds and published their reasoning were better positioned reputationally than those who acted covertly or not at all.',

            challenging: 'The deontological challenge is acute. Publicly disclosing the existence of the government signal — even in paraphrase — may harm the government partnership (S9) and deter future information-sharing in ways that are harmful in the next election cycle and beyond. The general counsel\'s memo (E6) explicitly flags that acting on the unverified signal creates a record that is "indefensible to the public and to Congress" if the account is later found not to be foreign-influenced. Full public disclosure of D4 does not solve this problem — it amplifies it. If Strand announces removal citing both policy grounds and a government signal, and the CIB attribution later proves incorrect, Strand has published a false implication about a domestic political speaker and documented its own susceptibility to unverifiable government influence.\n\nA virtue ethics challenge: the virtuous actor discloses what they know, not what they cannot confirm. D4 as stated requires Strand to publicly represent the government signal as a factor in the decision — a signal that legal affairs has advised is not attributable and cannot be verified (E6). Honesty about uncertainty is a virtue; premature certainty is not.',

            incomplete: 'The "publicly disclose the takedown decision with as much explanation as possible without compromising the government partnership" formulation contains an unresolved tension. The government liaison explicitly declined to commit anything to writing and stated that the underlying signals were classified (E6). Any public disclosure that is accurate — that is, that acknowledges the informal communication as a factor — may, in itself, compromise the government partnership, regardless of how carefully it is worded. And any public disclosure that omits the government signal as a factor is incomplete and potentially misleading. D4 does not resolve this tension. A complete utilitarian analysis requires the student to specify: what, precisely, would Strand disclose, and what would it withhold — and whether the resulting public statement is honest enough to deliver the claimed utility of transparency.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'Ethics FIRST',
            section: 'Coordinated Handling',
            text: 'Paraphrase: Security and trust-and-safety professionals operating at the intersection of government and platform environments shall handle sensitive communications through coordinated, documented channels. Informal verbal signals from government partners should be treated as preliminary and should not substitute for verifiable, attributable intelligence before consequential action is taken. Professionals must not allow unverifiable information to become the functional basis for enforcement decisions, even when the stated justification for classification is credible.'
        },
        {
            code: 'ACM Code',
            section: '1.1',
            text: 'Paraphrase: Computing professionals shall contribute to society and to human well-being, acknowledging that all people are stakeholders in computing. In platform governance contexts, human well-being includes both the integrity of the information environment and the preservation of free expression and access to information. When these values come into conflict, the professional must weigh them explicitly and transparently rather than defaulting to whichever is institutionally convenient.'
        },
        {
            code: 'NIST CSF',
            section: 'ID.GV-3',
            text: 'Paraphrase: Legal and regulatory requirements, including privacy and civil liberties obligations, shall be understood, managed, and incorporated into organizational governance. For platforms making content-moderation decisions with election-integrity implications, this includes awareness of both the platform\'s legal authority under applicable communications law and the civil-liberties dimensions of enforcement actions taken against constitutionally protected speech — including the distinction between legal authority and ethical obligation.'
        }
    ],
    codeConflict: {
        provision1: 'Ethics FIRST — Coordinated Handling',
        provision2: 'ACM Code 1.1',
        conflictDescription: 'Ethics FIRST coordinated handling instructs professionals to treat informal government signals as preliminary and to require verifiable, attributable intelligence before consequential action. Properly followed, this provision argues for caution: the government partner\'s verbal communication (E6) does not meet the documentation and attribution standard that would justify enforcement based on that signal.\n\nACM Code 1.1 requires contributing to human well-being — which, in this case, includes protecting the election information environment for millions of voters (S7). If the platform\'s independent societal-benefit judgment concludes that the content is harmful regardless of its origin, ACM 1.1 may support enforcement action that Ethics FIRST\'s coordination standard would delay or prevent.\n\nThe friction point is the government signal itself (E6). If Strand waits for a verifiable intelligence product — as Ethics FIRST coordinated handling requires — it may be acting too slowly for the election timeline. If it acts on its own ACM 1.1 societal-benefit judgment without the government signal, the decision is defensible but the government partnership has been effectively bypassed. And if it acts on the unverified signal while citing ACM 1.1 as the ethical cover, it has used one code provision to obscure its actual dependence on the other. Which obligation governs, and what must Strand actually be honest about when it explains its decision?'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
