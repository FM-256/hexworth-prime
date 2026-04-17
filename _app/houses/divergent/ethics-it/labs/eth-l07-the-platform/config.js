/* ============================================================
   ETH-L07 -- The Platform
   Cambridge Analytica / Facebook Data Harvesting Case Room Configuration

   All factual content is sourced from publicly documented
   events in the Cambridge Analytica / Facebook scandal (2014-2019):
   Aleksandr Kogan's "thisisyourdigitallife" personality quiz app;
   Facebook API permissions that allowed harvesting friends' data
   without explicit consent prior to 2015 policy change; Christopher
   Wylie whistleblower disclosure to The Guardian and The New York
   Times in March 2018; FTC consent decree and $5 billion fine
   July 2019; Cambridge Analytica's confirmed work on the 2016
   Trump campaign and the Brexit Leave campaign; and the EU's
   General Data Protection Regulation, which took effect May 2018.

   Red herrings: E4 (Facebook's 2021 name change to Meta, which
   is a corporate rebranding unrelated to the data harvesting
   question) and E10 (the Internet Research Agency / Russia
   disinformation campaign, which used Facebook's advertising
   platform but is legally and ethically distinct from the
   Cambridge Analytica data harvesting violation).
   ============================================================ */

const ETHL07Config = {
    id: 'eth-l07',
    title: 'The Platform',
    subtitle: 'Cambridge Analytica and Facebook',
    course: 'CIS4253',
    week: 4,
    chapter: 9,
    duration: 30,
    accent: '#00cfff',

    // -- Phase 1: Brief ----------------------------------------
    brief: {
        type: 'memo',
        from: 'Policy and Product Integrity Team, Facebook',
        to: 'You (Senior Platform Policy Engineer)',
        date: 'March 2018',
        classification: 'CONFIDENTIAL -- INTERNAL ONLY',
        content: 'You are a senior engineer on Facebook\'s Platform Policy team. You have been at the company since 2013. Your job is to define and enforce the rules that govern how third-party developers access Facebook\'s Graph API -- the interface that allows apps to pull user data with the user\'s permission.\n\nYou know the API history well. Before April 2015, Facebook\'s platform allowed an app like a quiz or game to request not only the installing user\'s data but also the data of all of that user\'s friends -- without those friends ever seeing the permission request. The logic was that friend data made apps more social and more engaging. Engineering leadership believed this was a feature, not a liability.\n\nIn April 2015, after internal reviews flagged the risk, Facebook changed its API policy. Apps could no longer harvest friends\' data without explicit consent from each friend. The change was the right call. But it was prospective. It did not retroactively void data already collected under the old rules.\n\nNow it is March 2018, and The Guardian and The New York Times are about to publish a story. Aleksandr Kogan, a Cambridge University researcher, built a personality quiz app called "thisisyourdigitallife" in 2014. Approximately 270,000 Facebook users installed the app and authorized it under the pre-2015 API. That authorization, under the rules that existed at the time, extended to the data of all of their Facebook friends. Kogan harvested the profiles of approximately 87 million users.\n\nKogan sold that data to a company called Cambridge Analytica. Cambridge Analytica used it to build psychographic profiles and conduct political microtargeting on behalf of the 2016 Trump presidential campaign and the Brexit Leave campaign.\n\nFacebook learned that Kogan had transferred the data to Cambridge Analytica in 2015. The company asked Cambridge Analytica to certify that the data had been deleted. Cambridge Analytica provided that certification. Facebook accepted it without auditing.\n\nYou now know the certification was false. The data was not deleted. It was used.\n\nThe story publishes in 48 hours. You have been asked to brief the executive team on what the policy team\'s exposure is, what the company should say, and what it should do next.',
    },

    // -- Phase 2: Evidence Artifacts ----------------------------
    // 10 total. E4 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'legal',
            title: 'Facebook API Terms of Service -- Friend Data Permissions (2014)',
            date: '2014-01-01',
            isRedHerring: false,
            content: 'FACEBOOK PLATFORM POLICY -- SECTION 3 (as in effect 2014)\n\nYou may request the following user data from a user who has authorized your application. In addition, with the user\'s permission, you may request data about the user\'s friends who also use Facebook, subject to the following conditions:\n\n(a) Friend data may only be used to improve the user\'s experience within your application.\n(b) You may not sell or transfer friend data to any third party.\n(c) You may not use friend data for advertising or other commercial purposes outside the context of the authorizing application.\n\nNote: The friend data permission was popularly known as the "friends permission" in the developer community. In practice, Facebook did not audit developer compliance with the use-restriction clauses at (a), (b), and (c). The permission was granted based on the developer\'s self-reported use case at the time of app registration. No post-hoc verification existed.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Kogan App Authorization Flow -- "thisisyourdigitallife" (2014)',
            date: '2014-06-01',
            isRedHerring: false,
            content: 'APPLICATION: thisisyourdigitallife\nDEVELOPER: Aleksandr Kogan (Global Science Research Ltd.)\nINSTALLS: Approximately 270,000 Facebook users\n\nPERMISSIONS REQUESTED AT INSTALLATION:\n- Your name, profile picture, age, sex, networks, user ID, list of friends, current location\n- Friends\' likes\n- Friends\' birthdays and education history\n- Friends\' locations\n\nDISCLOSURE TO INSTALLING USER:\n"By proceeding, you agree to allow this app to access your information and the information of your friends as described above for the purpose of academic research."\n\nDISCLOSURE TO FRIENDS OF INSTALLING USERS:\nNone. Friends of the 270,000 installing users did not receive any notification that their data was being accessed.\n\nDATA HARVESTED:\nApproximately 87 million unique profiles, predominantly US users.\n\nNote: The gap between 270,000 installers and 87 million harvested profiles reflects the average Facebook user\'s friend count at the time (approximately 338 friends), minus overlap. Each installer authorized data collection for all of their friends simultaneously.'
        },
        {
            id: 'E3',
            type: 'testimony',
            title: 'Christopher Wylie Whistleblower Statement -- The Guardian (March 2018)',
            date: '2018-03-17',
            isRedHerring: false,
            content: 'STATEMENT BY CHRISTOPHER WYLIE\nFormer Director of Research, Cambridge Analytica\n\n"I want to be clear about what happened. We exploited Facebook to harvest millions of people\'s profiles. And built models to exploit what we knew about them and target their inner demons. That is a grossly unethical experiment on the American electorate, run by a psychology professor with a Facebook account and a billionaire\'s check book.\n\nSteve Bannon\'s vision was to build an arsenal of psychological weapons and then deploy them. He wanted to fight a culture war in America."\n\nOn the data collection process: "Kogan was a Facebook insider. He knew how to use the platform. He built an app that could harvest not just the data of the people who downloaded it but all their friends as well. So if you downloaded the app, I could get everything about you and all your friends too. At that point the data was lawful. Facebook\'s platform allowed it."\n\nOn Cambridge Analytica\'s use of the data: "We built profiles on the US electorate, matched it against voter rolls, against other commercial databases, to create individual-level psychographic targeting. We could deliver different messages to different people based on their psychological profile. That is not what the data was collected for."'
        },
        {
            id: 'E4',
            type: 'news',
            title: 'Facebook Rebrands as Meta -- October 2021',
            date: '2021-10-28',
            isRedHerring: true,  // Red herring: corporate rebranding is legally and ethically irrelevant to the 2014-2018 data harvesting question
            content: 'PRESS RELEASE -- META PLATFORMS, INC.\nOctober 28, 2021\n\nFacebook, Inc. today announced it is changing its corporate name to Meta Platforms, Inc. to reflect its focus on building the metaverse.\n\n"We are a company that builds technology to connect people, and the metaverse is the next frontier," said Mark Zuckerberg.\n\nThe Facebook social media platform retains its name. The holding company\'s stock ticker changes from FB to META.\n\nNote: This document is included as a test of analytical focus. The rebranding occurred three years after the Cambridge Analytica story and has no legal, ethical, or causal connection to the data harvesting practices at issue. Students who cite the rebranding as evidence of accountability, evasion, or ethical significance are conflating a corporate governance decision with the underlying privacy violation. The rebranding is irrelevant to the question of what obligations existed in 2014-2018.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'FTC Consent Decree and $5 Billion Fine -- July 2019',
            date: '2019-07-24',
            isRedHerring: false,
            content: 'FEDERAL TRADE COMMISSION\nIn the Matter of Facebook, Inc.\nDocket No. C-4365\n\nFINAL ORDER\n\nThe Federal Trade Commission has determined that Facebook violated its 2012 consent decree with the FTC by sharing user data with third parties without adequate notice and consent.\n\nSPECIFIC FINDINGS:\n(1) Facebook\'s platform design allowed third-party apps to access friends\' data without those friends receiving notice or having the opportunity to consent.\n(2) Facebook\'s representation to users that they controlled who could see their information was deceptive under Section 5 of the FTC Act.\n(3) Facebook\'s acceptance of Cambridge Analytica\'s data deletion certification without independent verification was inadequate given the scale of the violation.\n\nREMEDY:\nCivil penalty: $5 billion (the largest penalty in FTC history at the time).\nFacebook is required to implement a comprehensive privacy program with independent third-party assessments every two years.\nMark Zuckerberg must personally certify compliance with the new privacy program quarterly.\n\nNote: The $5 billion fine, while historically large in absolute terms, represented approximately three weeks of Facebook\'s revenue at the time. Critics argued the penalty was insufficient to deter future violations.'
        },
        {
            id: 'E6',
            type: 'email',
            title: 'Cambridge Analytica Internal Emails -- Project Ripon (2014)',
            date: '2014-11-03',
            isRedHerring: false,
            content: 'FROM: Alexander Nix, CEO\nTO: Project Ripon Team\nSUBJECT: Data deliverable from GSR\n\nTeam,\n\nWe have received the first tranche of the GSR dataset. 30 million profiles as of today, growing to an expected 50M+ by Q1. The psychographic modeling work that [REDACTED] has been developing can now be tested at real scale.\n\nKey message for the client: we are not targeting voters based on demographics. We are targeting them based on personality. An "agreeable" voter in a swing county is not the same as a "neurotic" voter in a swing county. They need different messages. We can deliver those different messages now.\n\nDo not reference "Facebook data" in any external communications. Reference only "consumer data" or "lifestyle and consumer data." The sourcing is proprietary and not for disclosure.\n\nNix\n\n[Note: Alexander Nix was suspended from Cambridge Analytica in March 2018 following undercover reporting by Channel 4 News in the UK in which he appeared to offer to set up honey traps and spread disinformation for potential clients. He denied wrongdoing. Cambridge Analytica filed for insolvency in May 2018.]'
        },
        {
            id: 'E7',
            type: 'news',
            title: 'Guardian / NYT Investigation -- "How Trump Consultants Exploited the Facebook Data of Millions" (March 2018)',
            date: '2018-03-17',
            isRedHerring: false,
            content: 'THE GUARDIAN / THE NEW YORK TIMES\nMarch 17, 2018\n\nKey findings from the joint investigation:\n\n1. Cambridge Analytica harvested private information from the Facebook profiles of more than 50 million users without their permission in the United States, United Kingdom, and elsewhere -- the largest data breach in Facebook\'s history. (Note: subsequent analysis revised the figure to 87 million.)\n\n2. The data was collected through a personality quiz app called "thisisyourdigitallife" built by Cambridge University researcher Aleksandr Kogan. The app collected not only the data of the 270,000 users who authorized it, but the data of all their Facebook friends, exploiting a now-closed loophole in Facebook\'s API.\n\n3. Facebook was told in 2015 that the data had been transferred to Cambridge Analytica. Facebook demanded deletion but did not verify it.\n\n4. Cambridge Analytica used the data on behalf of the Ted Cruz presidential campaign in 2016, and later on behalf of the Donald Trump campaign, to identify persuadable voters and target them with individualized political messages.\n\n5. Steve Bannon, then-executive chairman of Breitbart News, was an early backer of Cambridge Analytica and a member of its board.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Facebook App Review Process -- Internal Audit (2014)',
            date: '2014-09-01',
            isRedHerring: false,
            content: 'FACEBOOK PLATFORM INTEGRITY -- INTERNAL REVIEW SUMMARY\n\nApp Review Process (as of 2014):\n\nDevelopers who request sensitive permissions (including the friends data permission) are required to submit their app for review. The review evaluates:\n(a) Whether the stated use case is consistent with Platform Policy\n(b) Whether the app\'s user interface accurately represents the data being collected\n(c) Whether the app violates Facebook community standards\n\nLimitations identified in this review:\n- App Review evaluates stated use case, not actual data flows after approval\n- No mechanism exists to audit what developers do with data after collection\n- The friends data permission is reviewed as a single grant; there is no per-friend consent mechanism\n- Enforcement of the "academic research only" restriction relies on developer self-reporting\n- Approximately 40,000 apps have been approved for the friends data permission as of Q3 2014\n\nRecommendation: The current App Review framework does not provide meaningful enforcement of the use-restriction terms in Section 3 of the Platform Policy. A risk-based audit program targeting high-install apps with broad data permissions is recommended.\n\nAction taken: No action recorded as of this document date.'
        },
        {
            id: 'E9',
            type: 'legal',
            title: 'EU General Data Protection Regulation -- Article 6 and Recital 42 (Effective May 2018)',
            date: '2018-05-25',
            isRedHerring: false,
            content: 'REGULATION (EU) 2016/679 (GDPR)\n\nArticle 6 -- Lawfulness of processing:\nProcessing shall be lawful only if and to the extent that at least one of the following applies:\n(a) the data subject has given consent to the processing of his or her personal data for one or more specific purposes;\n...\n(f) processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject.\n\nRecital 42: Consent should not be regarded as freely given if the data subject has no genuine or free choice or is unable to refuse or withdraw consent without detriment.\n\nKey implication for the Facebook case: Under GDPR, the consent obtained from the 270,000 app installers does not constitute valid consent for the 87 million friends whose data was collected without notification. Processing personal data on the basis of a third party\'s consent, where the data subject received no disclosure and had no opportunity to object, is unlawful under Article 6.\n\nThe Irish Data Protection Commission (Facebook\'s EU lead supervisory authority) opened a formal investigation into Facebook\'s data sharing practices in May 2018. The investigation is ongoing as of this document date.'
        },
        {
            id: 'E10',
            type: 'news',
            title: 'Senate Intelligence Committee Report -- Russian IRA Advertising on Facebook (2017)',
            date: '2017-10-31',
            isRedHerring: true,  // Red herring: Russian IRA disinformation used Facebook's ad platform but is legally distinct from the Cambridge Analytica data harvesting violation
            content: 'SENATE INTELLIGENCE COMMITTEE -- HEARING ON SOCIAL MEDIA AND FOREIGN INFLUENCE\n\nFacebook General Counsel Colin Stretch testified that the Internet Research Agency (IRA), a Russian government-linked disinformation operation, purchased approximately 3,000 ads on Facebook between 2015 and 2017 at a total cost of approximately $100,000. These ads were designed to inflame social divisions in the United States.\n\nThe IRA also created approximately 470 Facebook pages and accounts that generated organic (non-paid) content. These pages accumulated approximately 80,000 posts and reached an estimated 126 million Americans.\n\nNote: This document tests whether students conflate two distinct Facebook controversies. The IRA advertising campaign used Facebook\'s legitimate advertising targeting tools and did not involve the unauthorized harvesting of user data. It is a separate ethical and legal question from the Cambridge Analytica case. Students who use this document to support arguments about Cambridge Analytica\'s conduct are making a category error -- the IRA did not use Cambridge Analytica\'s data, and Cambridge Analytica did not work for the Russian government.'
        }
    ],

    // -- Phase 3: Stakeholders ----------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'The 87 Million Facebook Users Whose Data Was Harvested',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Facebook Engineers Who Built and Maintained the API',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Facebook Shareholders',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Cambridge Analytica Clients (Trump Campaign, Brexit Leave Campaign)',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Third-Party Developers Who Used the API Legitimately',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Voters Targeted by Psychographic Microtargeting',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Future Regulatory Bodies Writing Platform Privacy Law',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Academic Researchers Who Use Legitimate Social Data',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Competing Social Platforms Whose API Policies Were Stricter',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Credibility of Democratic Elections as an Institution',
            obvious: false
        },
        { id: 'S11', name: 'Facebook Gaming Streamers', obvious: false, irrelevant: true },
        { id: 'S12', name: 'WhatsApp Users in India', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -------------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Facebook should have banned Aleksandr Kogan\'s app and revoked the friends data API permission the moment internal review flagged the risk in 2014, regardless of whether any violation had occurred yet.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'The 270,000 users who installed the app consented to the data collection, and that consent extended to their friends under the platform terms in effect at the time -- so no ethical violation occurred.',
            framework: 'contractarian'
        },
        {
            id: 'D3',
            text: 'The core problem is data brokers and the secondary data market, not Facebook\'s API design. Targeting the platform for what third parties do with data misidentifies where accountability should fall.',
            framework: 'utilitarian-structural'
        },
        {
            id: 'D4',
            text: 'Platform liability for third-party misuse of APIs requires legislative reform. The ethics question is what law Congress should pass, not what Facebook should have done under existing rules.',
            framework: 'consequentialist-policy'
        }
    ],

    // -- Phase 4: Framework Challenges -------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis supports this position with force. Kant\'s principle of treating persons as ends rather than means applies directly: the 87 million friends whose data was harvested were never asked, never notified, and had no mechanism to object. The question is not whether the API terms permitted the collection -- they did. The question is whether those terms were compatible with a duty to treat users as autonomous agents rather than as data points attached to someone else\'s permission grant. The internal audit (E8) identified the risk in 2014 and recommended a risk-based audit program. Facebook took no action. The duty to act is not contingent on a violation having already occurred when the risk is this clearly identified.',

            challenging: 'The deontological framing overstates the clarity of the 2014 situation. The API\'s friends permission had been in place since 2010 and had enabled a large class of legitimate apps. A preemptive ban on the basis of risk would have affected tens of thousands of developers who were using the permission for its intended purpose. The precautionary principle does not straightforwardly command action that imposes certain harms -- loss of legitimate app functionality, developer trust -- in order to prevent speculative harms. The audit (E8) recommended a targeted risk-based approach, not a blanket ban. There is a consequentialist case that the targeted approach Facebook eventually adopted in 2015 was the right action at the wrong time -- the error was latency, not direction.',

            incomplete: 'This position identifies what Facebook should have done but does not address the accountability question for what Facebook did do. The engineering team that received the 2014 audit recommendation and took no action was not the same group as the legal team that accepted the unverified deletion certification in 2015. An analysis of D1 that focuses only on the API design decision omits the second and independently significant failure: having discovered the violation in 2015, Facebook chose a self-certification process over an audit. Even if D1 is wrong about preemptive banning, the 2015 decision to accept Cambridge Analytica\'s word without verification -- documented in the FTC findings (E5) -- stands as a distinct ethical failure that your analysis must address.'
        },
        'D2': {
            supporting: 'A contractarian defense of this position is available. John Locke\'s consent theory holds that obligations are created by voluntary agreement. The installing users agreed, explicitly, to allow the app to access their friends\' data. Facebook\'s platform terms disclosed this permission. Under the rules in force in 2014, users who found this unacceptable had the option to restrict their data in privacy settings or to not use Facebook at all. The argument that third-party consent is insufficient relies on a norm -- per-person consent for each data access -- that was not legally required under US law in 2014 and was not part of Facebook\'s stated terms of service (E1).',

            challenging: 'This defense fails under scrutiny for several reasons. First, the installing users\' consent was for "academic research" -- not political microtargeting. The consent was obtained under a false use-case representation (E2). Consent to one purpose does not constitute consent to a materially different purpose. Second, Rawls\'s contractarian framework would ask: what privacy rules would people agree to from behind a veil of ignorance, not knowing whether they would be the installing user or the friend? From that position, a rule allowing one person to authorize mass data collection on everyone in their social network -- without any notice to those people -- is not one rational agents would choose. Third, GDPR (E9) codified exactly this analysis into law.',

            incomplete: 'This analysis ignores the 2015 knowledge event entirely. Even if the initial 2014 collection was defensible under consent doctrine, Facebook knew by 2015 that the data had been transferred to Cambridge Analytica for commercial political purposes -- a use that was prohibited by both the API terms (E1) and the misrepresented purpose of the app (E2). At that point, the consent-based defense is irrelevant. The company had actual knowledge of a use-restriction violation and chose to verify remediation through a self-certification. The FTC (E5) specifically found this acceptance of unverified certification to be inadequate. That failure is not a consent question; it is a negligence and enforcement question that this decision does not address.'
        },
        'D3': {
            supporting: 'This structural critique has genuine analytical merit. Cambridge Analytica did not stop at the data it received from Kogan. According to the company\'s own internal emails (E6), the team appended additional commercial data to the Facebook-sourced profiles to create a more comprehensive targeting dataset. The secondary data market -- companies that aggregate purchase history, location data, consumer behavior, and public records -- is a parallel surveillance infrastructure that exists entirely independently of Facebook. A platform-only analysis of the Cambridge Analytica case allows the data broker industry, which enabled the same targeting capabilities through different channels, to escape scrutiny entirely. Locating accountability at Facebook alone may be the easier political argument but is the less accurate systemic analysis.',

            challenging: 'This argument functions as a diffusion-of-responsibility defense. The claim that "the real problem is elsewhere" does not reduce Facebook\'s accountability for its own choices. Facebook built the API. Facebook failed to audit the friends permission (E8). Facebook accepted an unverified deletion certification (E5). Each of those is an independent decision made by Facebook engineers and executives, not by data brokers. The systemic critique is accurate -- the data broker industry is also ethically problematic -- but accuracy about the systemic context does not create a limit on accountability at the individual actor level. Under ACM 2.6, computing professionals have an obligation to give comprehensive assessments of systems and their impacts. Facebook\'s engineers were in the best position to assess how their API would be used and failed to do so.',

            incomplete: 'D3 is an argument about where regulatory attention should be directed, not a complete ethical analysis of the platform\'s obligations. You are a Facebook policy engineer, not a lobbyist shaping regulatory priorities. Your professional obligation under ACM 1.6 (respect privacy) does not contain a "unless the systemic problem is bigger than your employer" exception. A complete analysis must address both the systemic argument and the company-specific obligations simultaneously. Arguing that data brokers are the real problem does not tell you what the Platform Policy team should have done with the 2014 internal audit recommendation (E8).'
        },
        'D4': {
            supporting: 'A policy-consequentialist analysis supports this framing. The Cambridge Analytica case exposed a structural gap: existing US privacy law in 2014 did not require per-person consent for social graph data. Facebook was operating within the legal framework that Congress had established. If the legal framework was inadequate -- and the subsequent bipartisan consensus suggests it was -- the ethical responsibility for the inadequacy rests primarily with legislators and secondarily with regulators. The GDPR (E9) demonstrates that legislative reform is effective: EU law now clearly requires the consent standards that would have prevented the Kogan collection, and Facebook modified its API globally in response. The lesson of the Cambridge Analytica case may be less about what Facebook should have done under existing law and more about what legal standards are necessary to prevent recurrence.',

            challenging: 'Legal compliance is a floor, not a ceiling for ethical behavior. ACM 1.6 states that computing professionals have an obligation to respect privacy regardless of whether current law requires it. The internal audit (E8) identified the friends data permission as a structural risk and recommended action in 2014. Facebook did not require legislative direction to know that collecting data on 87 million people who did not consent to collection created a privacy risk; it required the organizational will to act on its own analysis. The argument that ethics reduces to legislative compliance implies that the ethical engineers of 2014 should have simply waited for Congress. That conclusion is not defensible under any professional code of ethics in computing.',

            incomplete: 'D4 does not address the 2015 knowledge event. The argument for legislative reform is about prospective design standards -- what rules should govern API permissions going forward. It does not address what Facebook should have done in 2015 when it learned that Cambridge Analytica had violated the existing terms and retained data it had certified as deleted. The FTC (E5) specifically addressed this: the acceptance of unverified certification was independently inadequate regardless of the underlying API permission question. Legislative reform does not retroactively resolve the question of what to do with a known, ongoing violation of existing terms.'
        }
    },

    // -- Phase 5: Code Provisions ------------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.6',
            text: 'Respect privacy. The responsibility of computing professionals includes respecting and preserving the privacy of individuals. This includes taking precautions to prevent re-identification of anonymized data and taking reasonable steps to ensure data is not used in ways that conflict with the reasonable expectations of the individuals to whom it belongs.'
        },
        {
            code: 'ACM',
            section: '2.6',
            text: 'Perform work only in areas of competence, and only after giving comprehensive evaluations of computer systems and their impacts. Computing professionals should ensure that potential negative impacts are identified and communicated clearly to appropriate parties before deployment.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.6',
        provision2: 'ACM 2.6',
        conflictDescription: 'ACM 1.6 creates an obligation to proactively protect user privacy -- including friends of users who never consented to data collection. ACM 2.6 creates an obligation to assess how systems and APIs can be abused before that abuse occurs.\n\nThe Facebook case presents a failure of both simultaneously. The friends data API violated 1.6 because it enabled collection without the data subjects\' knowledge. It violated 2.6 because Facebook engineers had the information (E8) to understand how the permission could be abused but did not act on that assessment.\n\nThe tension between the two provisions is not that they conflict with each other -- they point in the same direction here. The tension is about organizational accountability: when the engineering team that produced the 2014 audit is not the same team that makes the policy decision to take no action, who is responsible? Can an engineer\'s obligation under 2.6 to "communicate clearly to appropriate parties" be discharged by writing a report that is then ignored? Or does the obligation persist until the harm is prevented?'
    },

    // -- Scoring Weights ---------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
