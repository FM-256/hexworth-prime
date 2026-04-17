/* ============================================================
   ETH-L08 -- The Whistleblower
   Frances Haugen / Facebook Papers Case Room Configuration

   All factual content is sourced from publicly documented
   events in the Frances Haugen / Facebook Papers disclosure
   (2021): Haugen's departure from Facebook in May 2021;
   her filing of eight complaints with the SEC in September
   2021; her congressional testimony October 5, 2021; the
   Wall Street Journal's "Facebook Files" series published
   September 13-17, 2021; the "Facebook Papers" released to
   Congress; internal research showing Instagram's negative
   impact on teen mental health; and the company's decision
   not to implement the algorithmic changes its own research
   recommended.

   Red herrings: E5 (Meta's subsequent announcement of
   parental controls in 2022, which is a remedial action
   taken after and in response to the Haugen disclosures,
   not evidence relevant to the original ethical question)
   and E9 (the 2017 Harvard study on social media and
   teen depression, which is independent academic research
   that predates and does not involve Facebook's internal
   data -- using it as evidence of what Facebook knew
   conflates external academic literature with internal
   findings).
   ============================================================ */

const ETHL08Config = {
    id: 'eth-l08',
    title: 'The Whistleblower',
    subtitle: 'Frances Haugen and the Facebook Papers',
    course: 'CIS4253',
    week: 4,
    chapter: 10,
    duration: 30,
    accent: '#ff6b35',

    // -- Phase 1: Brief ----------------------------------------
    brief: {
        type: 'memo',
        from: 'Civic Integrity Team, Facebook',
        to: 'You (Product Manager, Integrity and Well-Being)',
        date: 'May 2021',
        classification: 'CONFIDENTIAL -- INTERNAL ONLY',
        content: 'You are a product manager on Facebook\'s Integrity and Well-Being team. You joined in 2019, specifically to work on problems you cared about: making social media less harmful. You have a background in data science and civic technology. You believed Facebook\'s stated commitment to doing research and fixing problems.\n\nOver the past eighteen months you have seen that gap between what the company says publicly and what its internal research shows. You have read the research. You have been in the rooms.\n\nOn Instagram specifically: Facebook\'s internal researchers conducted a study that found Instagram is harmful to a substantial subset of its teenage users, particularly teenage girls. The research documented that Instagram worsens body image issues, increases social comparison, and correlates with higher rates of anxiety and depression among teenage girls who are heavy users. Thirty-two percent of teenage girls said that when they felt bad about their bodies, Instagram made them feel worse. The research identified that the platform\'s own algorithmic recommendation system drives users -- particularly younger users -- toward content that reinforces negative self-perception.\n\nThe research team proposed a set of algorithmic changes that would reduce the recommendation of body-comparison content to teenage users. The changes were tested. They worked. They also reduced engagement metrics.\n\nThe changes were not implemented. The business case for protecting engagement won.\n\nYou also have access to internal studies on how Facebook\'s algorithmic amplification of outrage and divisive content increases political polarization. The research team knew. Proposals to address it were advanced and subsequently shelved when they were projected to reduce user engagement and time on platform.\n\nYou are leaving the company. You are trying to decide what to do with what you know.\n\nA colleague of yours -- Frances Haugen -- has already made her decision. She is leaving too. She has been talking to a lawyer about filing complaints with the SEC. She has copies of internal documents. She has asked if you want to be involved.',
    },

    // -- Phase 2: Evidence Artifacts ----------------------------
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'Facebook Internal Research -- "Teen Mental Health" (2019)',
            date: '2019-03-13',
            isRedHerring: false,
            content: 'FACEBOOK INTERNAL RESEARCH DECK\n"Well-Being Research: Instagram and Teen Mental Health"\nPresenter: [REDACTED], Core Data Science\n\nKey findings:\n\n"Teens blame Instagram for increases in the rate of anxiety and depression among this age group. This reaction was unprompted and consistent across all groups."\n\n"Among US teens who reported suicidal thoughts, 13 percent of British users and 6 percent of American users traced the desire to kill themselves to Instagram."\n\n"Thirty-two percent of teen girls said that when they felt bad about their bodies, Instagram made them feel worse."\n\n"The problem: algorithmic recommendations push users toward idealized body image content because high-engagement content in this category receives outsized distribution. The recommendation system does not distinguish between content that drives engagement through aspiration versus content that drives engagement through social comparison and insecurity."\n\nRecommendations:\n(1) Adjust ranking algorithm to reduce distribution of body-comparison content to users under 18\n(2) Introduce friction for accounts with high negative-sentiment response rates\n(3) Improve reporting tools for users experiencing distress\n\nNote: Recommendations (1) and (2) were not implemented. Internal analysis projected a 2-4% reduction in engagement time for teen users if implemented. Recommendation (3) was implemented in a limited form.'
        },
        {
            id: 'E2',
            type: 'legal',
            title: 'Haugen SEC Complaint -- Summary of Allegations (September 2021)',
            date: '2021-09-13',
            isRedHerring: false,
            content: 'COMPLAINT TO THE U.S. SECURITIES AND EXCHANGE COMMISSION\nFiled by: Frances Haugen (via counsel)\nDate: September 13, 2021\n\nAllegation 1: Facebook misrepresented in public statements and regulatory filings the state of its knowledge regarding Instagram\'s effects on teen mental health. Specifically, Facebook publicly stated that its research on teen well-being was inconclusive while possessing internal research (documented in at least six internal studies from 2019-2021) that showed consistent, statistically significant negative effects for a significant subset of teen users.\n\nAllegation 2: Facebook suppressed internal research findings that projected negative effects on engagement from implementing algorithmic safeguards for teen users, then represented to the public and to Congress that no effective intervention had been identified.\n\nAllegation 3: Facebook\'s public statements that it prioritizes user safety over engagement are contradicted by documented internal decision-making records showing that proposed safety interventions were rejected when they were projected to reduce engagement metrics.\n\nRemedies requested: SEC investigation into potential violations of securities law through material misrepresentation to investors and the public.'
        },
        {
            id: 'E3',
            type: 'testimony',
            title: 'Frances Haugen Congressional Testimony -- Senate Commerce Committee (October 2021)',
            date: '2021-10-05',
            isRedHerring: false,
            content: 'TESTIMONY OF FRANCES HAUGEN\nSenate Commerce Committee, Science, and Transportation\nSubcommittee on Consumer Protection, Product Safety, and Data Security\n\n"Facebook knows -- in acute detail -- that its products harm children, stoke division, and weaken our democracy. Company leadership knows how to make Facebook and Instagram safer but won\'t make the necessary changes because they have put their astronomical profits before people.\n\nI am here today because I believe Facebook\'s products harm children, stoke division, and weaken our democracy. The company\'s leadership knows how to make Facebook and Instagram safer but won\'t make the necessary changes because they have put their astronomical profits before people.\n\nAmerican technology companies are not inherently evil. I believe Mark Zuckerberg genuinely wants his company to operate for the good of society. But Facebook is stuck in a feedback loop of profits over safety.\n\nThe solution, as with all previous social media hazards, is transparency and oversight. The Facebook Papers show that Facebook is aware of the harms its platform causes. Independent researchers need access to that data."\n\n[Senator Amy Klobuchar: "You believe this is a public health crisis?"]\n\n"I believe the effects we are seeing on children -- and especially on teenage girls -- are consistent with what we would classify as a public health crisis, yes."'
        },
        {
            id: 'E4',
            type: 'memo',
            title: 'Facebook Response to the Wall Street Journal Investigation (September 2021)',
            date: '2021-09-17',
            isRedHerring: false,
            content: 'FACEBOOK OFFICIAL RESPONSE\nTo: Media inquiries re: WSJ "Facebook Files" series\n\n"The Wall Street Journal\'s reporting mischaracterizes our research. The research shows a nuanced picture of teenage experience on our platforms. While some teens report negative experiences, many teens also report positive ones: connection, community, support. Our research is ongoing and we take the well-being of our users seriously.\n\nWe have invested heavily in well-being features and we continue to develop tools that give teens and their parents more control over their experience.\n\nThe suggestion that we suppress findings or refuse to act on our research is false. We publish our well-being research and we implement changes based on that research regularly.\n\nWe are proud of the work our teams do and we believe the Journal\'s characterization of our culture is fundamentally inaccurate."\n\nNote: This statement was issued in response to internal documents Haugen provided to the Wall Street Journal. The statement\'s claim that Facebook "publishes its well-being research" conflicted with the documented fact that the 2019 Teen Mental Health research deck (E1) was internal-only and was not published. The claim that Facebook "implements changes based on that research" was contradicted by the internal records showing the algorithmic recommendations from that same deck were not implemented.'
        },
        {
            id: 'E5',
            type: 'news',
            title: 'Meta Announces Instagram Parental Supervision Tools (March 2022)',
            date: '2022-03-16',
            isRedHerring: true,  // Red herring: parental controls announced after and in response to the Haugen disclosures are not evidence bearing on the original ethical question
            content: 'META NEWSROOM\nMarch 16, 2022\n\nMeta today announced a new suite of parental supervision tools for Instagram, allowing parents to set daily time limits, see who their teens are following, and receive notifications when their teen reports an account or piece of content.\n\nThe features will roll out to users in the US, UK, Ireland, Canada, Australia, and New Zealand starting in March 2022.\n\n"We want to make sure parents and teens feel confident and safe on Instagram," said Adam Mosseri, Head of Instagram.\n\nNote: These tools were announced approximately six months after Haugen\'s congressional testimony and were widely attributed in part to the regulatory and public pressure generated by that testimony. Using this document as evidence of Facebook\'s internal response to its research conflates two different time periods. These tools were not under development in 2019-2021 as a result of the internal research; they were developed in 2021-2022 as a result of external pressure. Students who cite this document as evidence of good-faith internal response to the research are working with a false timeline.'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'Instagram Algorithm Documentation -- Engagement Ranking System',
            date: '2020-08-01',
            isRedHerring: false,
            content: 'INSTAGRAM ENGINEERING -- RANKING ALGORITHM OVERVIEW\n(Internal documentation, not for external distribution)\n\nInstagram\'s Feed, Reels, and Explore ranking system uses machine learning to predict the probability that a given user will take a specific action on a piece of content (like, comment, share, spend time viewing). Content is ranked by a composite score weighted across these predicted actions.\n\nKey inputs to ranking:\n- Historical engagement patterns for this user\n- Content characteristics (format, topic, account type)\n- Predicted action probabilities based on similar user cohorts\n\nThe system is optimized for engagement as the primary objective. There is no penalty applied to content that generates negative-valence engagement (e.g., engagement driven by envy, outrage, or distress) versus positive-valence engagement (e.g., engagement driven by connection, joy, or inspiration). Both are treated as equivalent signals.\n\nNote: The internal research team proposed adding a "well-being signal" to the ranking system that would distinguish between engagement types and reduce distribution of high-negative-valence content. This proposal was discussed in two product reviews in 2020 and was not advanced to implementation. The primary objection in both reviews was projected impact on engagement time metrics.'
        },
        {
            id: 'E7',
            type: 'news',
            title: 'Comparison: Tobacco Industry Suppression of Health Research (Historical)',
            date: '2021-10-05',
            isRedHerring: false,
            content: 'ANALOGY INVOKED IN CONGRESSIONAL TESTIMONY -- TOBACCO INDUSTRY RESEARCH SUPPRESSION\n\nDuring her Senate testimony, Haugen explicitly compared Facebook\'s handling of internal health research to the tobacco industry\'s suppression of evidence linking smoking to cancer.\n\nHistorical record for comparison:\nIn 1953, the CEOs of seven major tobacco companies met and agreed to fund the Tobacco Industry Research Committee, which was publicly framed as independent research into smoking and health. Internal documents released during the 1990s litigation showed that the real purpose was to manufacture scientific uncertainty about findings the companies already knew to be true. Internal Brown and Williamson documents from 1963 state explicitly: "We are, then, in the business of selling nicotine, an addictive drug." The company continued to publicly deny that nicotine was addictive until 1998.\n\nThe structural parallel Haugen argued: Facebook\'s internal research established harm. The company did not suppress the research from existence -- it left it in internal presentations. But the company did not publish it, did not act on its recommendations, and publicly characterized its research as inconclusive while internally knowing otherwise.\n\nAnalytical note: The tobacco comparison is apt in structure but differs in severity. Tobacco caused approximately 480,000 deaths per year in the US. Instagram\'s documented harms are significant but have not been causally linked to population-level mortality at a comparable scale. Students should engage with both the parallels and the limits of the comparison.'
        },
        {
            id: 'E8',
            type: 'email',
            title: 'Internal Employee Dissent Messages -- Workplace (2021)',
            date: '2021-09-14',
            isRedHerring: false,
            content: 'FACEBOOK WORKPLACE POSTS -- INTERNAL EMPLOYEE FORUM\n(Documents released as part of the Facebook Papers)\n\nSELECTED POSTS following the WSJ "Facebook Files" publication:\n\nEmployee A: "I have been here for six years. I genuinely believe we have tried to do the right thing on integrity. But reading these stories, I have to ask myself whether our internal escalation paths are working. When research finds something serious and nothing happens for two years, that is a process failure we should all be asking hard questions about."\n\nEmployee B: "The framing that we choose profits over safety is too simple. The framing that we always prioritize safety is also too simple. The honest answer is that we have an engagement optimization system that is very hard to modify and a safety team that is trying to work within it. That does not make what happened okay. It means the problem is structural."\n\nEmployee C: "I support Frances. I do not support how this was handled externally. There were internal channels that were not exhausted. But I also understand why someone who has seen what she has seen would conclude the internal channels were not going to work."\n\nNote: These posts reflect the genuine complexity of insider knowledge situations. The employee reactions range from defensive to self-critical to qualified support for Haugen\'s action. They do not represent an official company position.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Harvard School of Public Health Study -- Social Media and Teen Depression (2017)',
            date: '2017-11-01',
            isRedHerring: true,  // Red herring: independent academic research does not bear on what Facebook knew from its own internal data
            content: 'JOURNAL OF ADOLESCENT HEALTH\n"Association between social media use and depression among U.S. young adults"\nHarvard T.H. Chan School of Public Health (2017)\n\nKey finding: Young adults who visited social media platforms more frequently were 2.7 times more likely to have high levels of depressive symptoms compared to those who visited least frequently, after adjusting for demographic characteristics.\n\nStudy design: Cross-sectional survey of 1,787 US adults ages 19-32.\n\nPlatforms studied: Facebook, YouTube, Twitter, Google+, Instagram, Snapchat, Reddit, Tumblr, Pinterest, Vine, LinkedIn.\n\nLimitations acknowledged by authors: Cross-sectional design cannot establish causality. Possible reverse causation: people who are already depressed may use social media more.\n\nNote: This is a legitimate academic study. It is not evidence of what Facebook knew from its internal data. Facebook\'s internal research (E1) is significant precisely because it comes from first-party data with access to algorithmic variables that external researchers cannot see. Students who use this external study as evidence of Facebook\'s internal knowledge are making a logical error: the company could not have known about a Harvard study\'s findings before it was published, and the company\'s obligation to act is based on its own internal research, not external academic literature.'
        },
        {
            id: 'E10',
            type: 'memo',
            title: 'Nick Clegg Memo -- "You and the Algorithm: It\'s Complicated" (March 2021)',
            date: '2021-03-31',
            isRedHerring: false,
            content: 'MEMO: "You and the Algorithm: It\'s Complicated"\nFROM: Nick Clegg, VP of Global Affairs, Facebook\n\n"Algorithms are used across the internet, in everything from search engines to streaming services to dating apps, to help surface content that is relevant and engaging. Facebook and Instagram are no different.\n\nWhat we have found is that our algorithms are better at giving people what they want than what is necessarily good for them or for society. If left unchecked, algorithms are driven by what is engaging. But engaging is not always what is true, or what is healthy.\n\nWe know that there are problems here. We are working on them. But we are also a company with billions of users. Changes to core systems require careful testing. We do not always get it right."\n\nNote: This memo was published publicly. It is significant for two reasons. First, it represents an implicit acknowledgment by a senior Facebook official that the algorithmic engagement optimization system has known negative consequences. Second, it was published approximately six months before Haugen\'s congressional testimony -- meaning the company had publicly acknowledged algorithmic harm while simultaneously declining to implement the research-backed recommendations in E1. Students should consider what this gap between public acknowledgment and internal action reveals about organizational accountability.'
        }
    ],

    // -- Phase 3: Stakeholders ----------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Teenage Girls Using Instagram',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Frances Haugen Personally',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Facebook / Meta Shareholders',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Facebook Internal Researchers Who Conducted the Studies',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Facebook Product and Engineering Teams',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Parents of Teenagers Who Use Instagram',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Future Whistleblowers at Other Tech Companies',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Competing Platforms That Published Their Well-Being Research',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Mental Health Professionals and Pediatricians',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Credibility of Internal Corporate Research as a Governance Mechanism',
            obvious: false
        },
        { id: 'S11', name: 'Oculus VR Hardware Engineers', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Facebook Marketplace Sellers', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -------------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Haugen was right to go public with internal documents. When internal research shows harm to a vulnerable population and the company suppresses it, external disclosure is the only path to accountability.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Haugen should have exhausted every available internal channel -- up to and including the board of directors -- before going external. She left the company without creating a formal documented escalation record.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'The internal research was preliminary, correlational, and subject to interpretation. Leaking pre-publication research without allowing the normal scientific review process is itself an ethical violation.',
            framework: 'epistemic'
        },
        {
            id: 'D4',
            text: 'Individual whistleblowing is the wrong mechanism. The right answer is mandatory research transparency -- a federal requirement that platforms publish their internal safety research -- so whistleblowing is unnecessary.',
            framework: 'consequentialist-policy'
        }
    ],

    // -- Phase 4: Framework Challenges -------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis supports Haugen\'s action under Kant\'s formulation of the categorical imperative as applied to professional disclosure. If universalized: when a professional possesses documented evidence that an employer is causing harm to a vulnerable population and has chosen business metrics over remediation, that professional has an obligation to report the evidence to appropriate authorities. Haugen did not sell the documents; she filed formal SEC complaints (a legally defined disclosure pathway) and testified before Congress. She did not disclose trade secrets unrelated to harm; she disclosed harm-specific research and internal decision records. The ACM Code of Ethics 1.1 requires computing professionals to contribute to society and human well-being and to avoid actions that are contrary to those goals. The scope of the obligation is not bounded by the employer\'s preference.',

            challenging: 'A competing deontological argument, grounded in the duty to honor commitments, challenges this position. Haugen signed a nondisclosure agreement as a condition of employment. The NDA is a voluntary contractual commitment, and duties of promise-keeping have their own deontological weight. The question is not whether the NDA legally permitted disclosure -- SEC whistleblower complaints may receive legal protection -- but whether the commitment itself, made voluntarily, creates a moral constraint that competes with the duty to disclose harm. A Kantian analysis of promise-keeping would hold that breaking a promise requires that the competing obligation be not merely stronger but categorically overriding. Haugen\'s argument that it was is credible given the scale of the harm, but the internal escalation record matters: a promise broken after all available alternatives were exhausted is more defensible than a promise broken when other paths remained.',

            incomplete: 'This analysis must address the scope question. Haugen provided documents to the Wall Street Journal, to Congress, and to approximately seventeen US states\' attorneys general. The breadth of the disclosure -- particularly the Wall Street Journal publication -- raises a question about proportionality. The SEC complaint is a targeted disclosure to a regulatory body with jurisdiction. Congressional testimony is a legal proceeding with recognized public interest protections. But broad media disclosure of internal corporate documents is a different category of action. A complete analysis must assess whether the Journal disclosure was necessary to achieve the accountability goal or whether the SEC and congressional pathways would have been sufficient -- and whether the broader disclosure caused harms of its own (to employees named in documents, to ongoing investigations, to the stock price of a company in which millions of ordinary shareholders hold retirement accounts).'
        },
        'D2': {
            supporting: 'Virtue ethics supports this position by framing the question as one of practical wisdom (phronesis) rather than rule application. A virtuous professional uses all available tools before escalating in ways that cause collateral damage. Haugen had access to Workplace (internal social) posts (E8), which show that other employees shared her concerns and were raising them internally. She had access to the VP-level acknowledgment in the Clegg memo (E10) that the algorithmic harm problem was recognized at senior levels. She could have escalated formally through HR, through Facebook\'s ethical escalation pathways, or by requesting a meeting with the audit committee of the board -- a committee with explicit governance responsibility for risk. The absence of a documented internal escalation record weakens the moral case for external disclosure, not because internal channels would have worked, but because exhausting them is part of what makes the decision defensible.',

            challenging: 'This argument assumes that internal channels at Facebook were capable of producing meaningful action on this issue. The documentary record does not support that assumption. The 2019 research (E1) was presented through proper internal channels. Its recommendations were reviewed in product meetings. They were rejected for business reasons -- twice (E6). The employees quoted in E8 describe a structural problem with escalation pathways. The Clegg memo (E10) shows that senior leadership acknowledged the problem publicly while declining to act on the internal recommendations. Arguing that Haugen should have tried harder internally requires specifying what she should have done differently and why it would have succeeded where two years of properly-channeled internal research had failed.',

            incomplete: 'This position needs to be more specific about what "exhausting internal channels" means operationally. "Escalating to the board" is not a procedure -- it is a description of a destination. What is the actual pathway? Does Facebook\'s governance structure provide a mechanism for a mid-level product manager to bring a research suppression concern directly to the audit committee? If not, then recommending that path is recommending something that does not exist. A complete analysis must describe the actual available escalation paths and assess their realistic probability of success given the documented organizational history of this specific issue.'
        },
        'D3': {
            supporting: 'An epistemic-responsibility argument supports a weaker version of this position. Science has a methodology for a reason. The 2019 internal research (E1) is a correlational study. It establishes association between Instagram use and reported negative mental health outcomes among teenage girls. It does not establish causality. Reverse causation -- teenagers who are already experiencing mental health difficulties use Instagram more -- is a genuine methodological concern that the internal research does not fully address. When Haugen testified before Congress that Instagram "causes harm," she was making a causal claim that her evidence supports weakly. The misrepresentation of the research\'s evidentiary weight in public testimony is itself an ethical issue that this analysis does not exempt simply because the underlying concern is legitimate.',

            challenging: 'This argument is technically accurate but strategically misused as a defense of inaction. The internal researchers (E1) did not claim proof of causation. They claimed a consistent, statistically significant association with documented algorithmic mechanisms that could plausibly explain the association. The question is not whether the evidence rises to publication-ready certainty, but whether a company that possesses this evidence has an obligation to (a) conduct further research to establish causal direction and (b) take precautionary action consistent with the evidence\'s weight. The tobacco industry\'s decades-long use of "the science is uncertain" as a reason to delay action is precisely the structural parallel Haugen invoked (E7). "Correlation is not causation" is a scientific statement. Deployed to prevent protective action in the face of consistent evidence of harm to a vulnerable population, it is an evasion.',

            incomplete: 'This argument does not engage with the specific complaint Haugen made that is clearest and most well-supported: not that the research is certain, but that Facebook publicly represented its research as inconclusive while internally possessing consistent findings pointing in a specific direction. The epistemic argument about research standards is relevant to whether Facebook was required to act. It is not relevant to whether Facebook was permitted to publicly misrepresent what the research showed. The SEC complaints (E2) are about securities fraud and material misrepresentation, not about whether the science was complete. A complete analysis must address the misrepresentation claim separately from the harm-causation claim.'
        },
        'D4': {
            supporting: 'A structural consequentialism analysis supports mandatory transparency as the superior mechanism. Whistleblowing is a high-cost, high-variance intervention that depends on a single individual\'s willingness to sacrifice their career and legal safety. The outcomes are unpredictable: Haugen\'s disclosures generated enormous media attention but no legislation had passed as of the time of her testimony. By contrast, a legal requirement that platforms publish their internal safety research -- modeled on the tobacco industry\'s Master Settlement Agreement, which required public release of internal documents -- would make the information routinely available without requiring any individual to take personal risk. The EU\'s Digital Services Act (2022) moves in exactly this direction by requiring large platforms to assess and mitigate systemic risks. That is a structural solution.',

            challenging: 'The legislative reform argument, while valid as a policy prescription, does not answer the ethical question facing Haugen in 2021. Mandatory transparency requirements were not law in May 2021. The harm was occurring. The research was being suppressed. A policy argument about what Congress should do in the future does not resolve what a professional with current knowledge of ongoing harm is obligated to do today. PMI 2.1 requires that project managers provide accurate and truthful representations to stakeholders. Haugen\'s position is that her employer was providing false representations to external stakeholders (the public, regulators, investors). The obligation under 2.1 does not contain a "wait for a legislative solution" exception.',

            incomplete: 'This analysis assumes that mandatory transparency legislation would be effective and politically achievable. Neither assumption is established. Tech platform lobbying has been highly effective at preventing or diluting federal privacy legislation in the US, and as of Haugen\'s testimony no comparable law had passed after more than five years of public advocacy. Even accepting the desirability of the legislative solution, the analysis must address the gap period: what should professionals with knowledge of harm do while waiting for a legislative framework that may take years, if it arrives at all? A complete analysis must propose either a bridge mechanism or acknowledge the harm that occurs in the legislative gap.'
        }
    },

    // -- Phase 5: Code Provisions ------------------------------
    codeProvisions: [
        {
            code: 'PMI',
            section: '2.1',
            text: 'Provide accurate and truthful representations in all communications to stakeholders, including reports, analyses, and assessments. A project manager must not knowingly allow material misrepresentations to stand in communications to stakeholders, customers, or the public.'
        },
        {
            code: 'IEEE',
            section: '7.8',
            text: 'Follow organizational regulations, policies, and approved procedures. When a situation arises where organizational requirements conflict with professional obligations, the engineer shall seek to resolve the conflict within the organization before resorting to external action.'
        }
    ],
    codeConflict: {
        provision1: 'PMI 2.1',
        provision2: 'IEEE 7.8',
        conflictDescription: 'PMI 2.1 requires that professionals not allow material misrepresentations to stand in communications to stakeholders. Facebook\'s public characterization of its internal research as "inconclusive" while possessing consistent internal findings pointing to specific harms is a material misrepresentation -- one that Haugen was in a position to know about and could have corrected.\n\nIEEE 7.8 requires following organizational procedures and seeking internal resolution before taking external action. The organizational procedure at Facebook was to let Product leadership make decisions about whether research recommendations were implemented. That procedure produced a documented outcome: the recommendations were not implemented.\n\nThe conflict: when the organizational procedure for resolving professional concerns is the same procedure that produced the violation of PMI 2.1, can IEEE 7.8 coexist with PMI 2.1? At what point does following the internal procedure become complicity in the misrepresentation? The Haugen case forces a direct confrontation with the question of whether internal channels can ever be fully "exhausted" when the person who would need to act on an escalation is the same person who approved the original decision to suppress the research.'
    },

    // -- Scoring Weights ---------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
