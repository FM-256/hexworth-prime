/* ============================================================
   ETH-L03 -- The Snowden Files
   NSA PRISM Mass Surveillance Case Room Configuration

   All factual content is sourced from publicly documented
   events in the Edward Snowden NSA disclosures (2013):
   Snowden's extraction of approximately 1.5 million
   classified NSA documents beginning May 2013; the Guardian
   and Washington Post PRISM stories published June 6, 2013;
   Snowden's identity revealed June 9, 2013; FISA Court
   Section 215 bulk telephone records order against Verizon
   published June 6, 2013; Obama administration defense of
   the programs June 2013; Snowden granted temporary asylum
   in Russia August 1, 2013; USA FREEDOM Act signed into law
   June 2, 2015 restricting bulk collection; and Snowden
   charged under the Espionage Act June 21, 2013.

   Red herrings: E5 (Snowden's performance evaluations at
   NSA -- true but not germane to the ethical question of
   whether disclosure was justified) and E9 (Chelsea Manning
   comparison -- a distinct case with different facts,
   different target, and different methodology).
   ============================================================ */

const ETHL03Config = {
    id: 'eth-l03',
    title: 'The Snowden Files',
    subtitle: 'NSA PRISM Mass Surveillance Disclosures',
    course: 'CIS4253',
    week: 2,
    chapter: 4,
    duration: 30,
    accent: '#ff00ff',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'NSA Office of Compliance, Internal Systems Division',
        to: 'You (Senior Systems Administrator, NSA Hawaii Facility, Booz Allen Hamilton Contractor)',
        date: 'May 2013',
        classification: 'TOP SECRET // SI // ORCON // NOFORN',
        content: 'You have worked as an NSA systems administrator for four years, first as a direct NSA employee and now as a contractor through Booz Allen Hamilton. Your clearance level is Top Secret/SCI. Your access level is unusually broad -- you were granted an administrative role that allows you to query and retrieve documents across multiple NSA programs.\n\nOver the past several months, you have used that access to review the scope of the programs you administer. What you have found has changed how you understand the work you have been doing.\n\nSection 215 of the USA PATRIOT Act has been used to compel Verizon Business Network Services to hand over, on an ongoing daily basis, metadata for every call made on its network. Not calls involving terrorism suspects. Every call. The order covers all calls originating or terminating in the United States. The FISA Court order authorizing this program is classified. The public does not know it exists. Members of Congress who are not on the Intelligence Committees do not know it exists.\n\nPRISM is a different program. It is not metadata. Under PRISM, the NSA collects communications content -- emails, video chats, photos, stored files -- directly from the servers of Microsoft, Google, Facebook, Apple, and seven other major technology companies. The legal authority is Section 702 of the FISA Amendments Act. The companies know about it. They do not publicize it.\n\nXKEYSCORE is an analytical system that allows analysts to query communications content for any individual by name, email address, IP address, or telephone number. The scope of collection underlying XKEYSCORE is not fully known even within the NSA.\n\nThe Fourth Amendment to the US Constitution prohibits unreasonable searches and seizures and requires a particularized warrant based on probable cause. These programs do not use warrants. They do not require individualized suspicion. The FISA Court, which authorizes them, operates in secret and hears only the government\'s arguments.\n\nSenator Ron Wyden, a member of the Senate Intelligence Committee, has said publicly that Americans "would be stunned" if they knew how the PATRIOT Act was being interpreted. He cannot tell them what he knows -- because telling them would be a violation of his classified briefing obligations.\n\nYou are not a lawyer. You are a systems administrator with a Top Secret clearance and access to materials that, if the public knew about them, would fundamentally change the political debate over the balance between national security and civil liberties in the United States.\n\nYou have not yet done anything. You are deciding whether to.',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'legal',
            title: 'FISA Court Order -- Verizon Section 215 Bulk Collection',
            date: '2013-04-25',
            isRedHerring: false,
            content: 'UNITED STATES FOREIGN INTELLIGENCE SURVEILLANCE COURT\nDocket Number: BR 13-80\nTOP SECRET // SI // NOFORN\n\nIT IS HEREBY ORDERED that the Custodian of Records of Verizon Business Network Services Inc. on behalf of MCI Communication Services Inc. (Verizon Business Services) shall produce to the National Security Agency (NSA) upon service of this Order, and continue production on an ongoing daily basis thereafter for the duration of this Order, unless otherwise ordered by the Court, an electronic copy of the following tangible things: all call detail records or "telephony metadata" created by Verizon for communications (i) between the United States and abroad; or (ii) wholly within the United States, including local telephone calls.\n\nTelephony metadata includes comprehensive communications routing information, including but not limited to session identifying information (e.g., originating and terminating telephone number, International Mobile Subscriber Identity (IMSI) number, International Mobile station Equipment Identity (IMEI) number, etc.), trunk identifier, telephone calling card numbers, and time and duration of call.\n\nNote: This order does not require Verizon to produce the content of any communication. However, metadata at scale -- including who called whom, from what location, for how long, and at what time -- can be used to reconstruct social graphs, identify associations, and infer personal activities without access to call content. Privacy researchers describe metadata as often more revealing than content.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'NSA PRISM Program Slides -- Leaked Presentation',
            date: '2013-04-01',
            isRedHerring: false,
            content: 'NSA PRISM SLIDES (EXCERPTS)\nTOP SECRET // SI // ORCON // NOFORN\n\nSlide 1 -- PRISM Collection Details\nPRISM is a government code name for a data collection effort known officially by the SIGAD US-984XN.\n\nCollection directly from the servers of these US service providers:\nMicrosoft (start date 9/11/07)\nYahoo (3/12/08)\nGoogle (1/14/09)\nFacebook (6/3/09)\nPalTalk (12/7/09)\nYouTube (9/24/10)\nSkype (2/6/11)\nAOL (3/31/11)\nApple (10/2012)\n\nSlide 2 -- What Will You Receive in Collection?\nEmail / Chat -- video, voice\nVideos\nPhotos\nStored data\nVoIP\nFile transfers\nVideo Conferencing\nNotifications of target activity -- logins, etc.\nOnline Social Networking details\nSpecial requests\n\nNote: The technology companies named in the slides initially denied providing the NSA with "direct access" to their servers. Later reporting indicated that the government compelled the companies through court orders under FAA Section 702 and that the companies complied while constructing technical interfaces to facilitate the transfers. The distinction between "direct server access" and "compelled production through technical interface" became a significant definitional dispute in subsequent coverage.'
        },
        {
            id: 'E3',
            type: 'testimony',
            title: 'Snowden Interview -- The Guardian, June 2013',
            date: '2013-06-09',
            isRedHerring: false,
            content: 'INTERVIEW WITH EDWARD SNOWDEN\nThe Guardian, Glenn Greenwald and Ewen MacAskill\nHong Kong, June 6-9, 2013\n\n"The NSA has built an infrastructure that allows it to intercept almost everything. With this capability, the vast majority of human communications are automatically ingested without targeting. If I wanted to see your emails or your wife\'s phone, all I have to do is use intercepts. I can get your emails, passwords, phone records, credit cards.\n\nI don\'t want to live in a society that does these sort of things. I do not want to live in a world where everything I do and say is recorded. That is not something I am willing to support or live under.\n\nThe government has granted itself power it is not entitled to. There is no public oversight. The result is people like myself have the latitude to do things that would horrify Americans.\n\nI am not going to hide who I am because I know I have done nothing wrong."\n\nOn using internal channels: "The [NSA] Inspector General\'s office does not have the ability to investigate the Executive. It is subordinate to the Director of National Intelligence. Reporting to congressional oversight committees would require me to tell members of Congress classified information, which would itself be a crime. The systems of oversight that were supposed to protect us have been corrupted or made secret."\n\nNote: Snowden was a 29-year-old contractor at the time of disclosure. He had previously worked at the CIA and the NSA as both a direct employee and a contractor. He copied approximately 1.5 million documents over several months using his systems administrator access.'
        },
        {
            id: 'E4',
            type: 'testimony',
            title: 'Obama Administration Defense of Surveillance Programs',
            date: '2013-06-07',
            isRedHerring: false,
            content: 'PRESIDENT BARACK OBAMA\nStatement on National Security Programs\nJune 7, 2013\n\n"In the abstract, you can complain about Big Brother and how this is a potential program run amok, but when you actually look at the details, I think we\'ve struck the right balance.\n\nThey are not looking at people\'s name, and they are not looking at content. But by sifting through this so-called metadata, they may identify potential leads with respect to folks who might engage in terrorism.\n\nIf people can\'t trust not only the executive branch but also don\'t trust Congress, and don\'t trust federal judges, to make sure that we\'re abiding by the Constitution and due process and rule of law, then we\'re going to have some problems here.\n\nYou can\'t have 100 percent security and also then have 100 percent privacy and zero inconvenience. We\'re going to have to make some choices as a society."\n\nNote: Director of National Intelligence James Clapper had testified before Congress in March 2013 that the NSA did "not wittingly" collect data on millions of Americans. After Snowden\'s disclosures, Clapper acknowledged this testimony was "erroneous." He was not prosecuted for the false statement. Snowden cited Clapper\'s testimony as part of his rationale for going public rather than using internal channels.'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'Booz Allen Hamilton Performance Evaluation -- Snowden File',
            date: '2013-05-01',
            isRedHerring: true,  // Red herring: Snowden's job performance is irrelevant to whether the disclosure was ethically justified
            content: 'BOOZ ALLEN HAMILTON\nEmployee Performance Record\n\n[Note: Various media outlets reported on Snowden\'s employment history, including claims that he had exaggerated his qualifications and that his performance had been reviewed at Booz Allen Hamilton prior to the disclosure. NSA officials also stated that Snowden had misled colleagues about the purpose of his system queries.\n\nThis document is a red herring. Snowden\'s job performance, employment record, or whether he misrepresented his qualifications to his employer are not germane to the ethical question of whether the mass surveillance programs he disclosed were consistent with the Fourth Amendment and whether disclosure of secret programs to the public was ethically justified. Attacking the character of the whistleblower is a common rhetorical move in cases involving disclosures of government activity. The ethical evaluation of whether disclosure was justified must focus on the nature of the programs disclosed, not the personal attributes of the person who disclosed them.]'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'Espionage Act Charges -- Indictment of Edward Snowden',
            date: '2013-06-21',
            isRedHerring: false,
            content: 'UNITED STATES OF AMERICA v. EDWARD J. SNOWDEN\nCriminal Complaint\nEastern District of Virginia\n\nThe United States charges EDWARD J. SNOWDEN with the following offenses:\n\nCount 1: Theft of Government Property (18 U.S.C. 641)\nCount 2: Unauthorized Communication of National Defense Information (18 U.S.C. 793(d))\nCount 3: Willful Communication of Classified Communications Intelligence Information to an Unauthorized Person (18 U.S.C. 798(a)(3))\n\nThe maximum potential sentence on all counts exceeds 30 years in federal prison.\n\nNote: Counts 2 and 3 are charges under the Espionage Act, originally enacted in 1917. The Espionage Act does not contain a public interest defense or a whistleblower defense. A defendant cannot argue at trial that the disclosure was justified because the programs disclosed violated the Constitution. The only relevant fact at trial would be whether Snowden knowingly disclosed national defense information to an unauthorized person. Critics of the Espionage Act argue that applying it to public-interest disclosures to journalists conflates leaking to a foreign enemy with informing the American public about their own government\'s activities.'
        },
        {
            id: 'E7',
            type: 'legal',
            title: 'USA FREEDOM Act -- Congressional Response to Disclosures',
            date: '2015-06-02',
            isRedHerring: false,
            content: 'USA FREEDOM ACT\nPublic Law 114-23\nSigned by President Obama, June 2, 2015\n\nKey provisions:\n\n1. ENDS bulk collection of telephone metadata under Section 215 of the PATRIOT Act. The NSA may no longer collect telephone records in bulk. It may now obtain records only through specific selection terms -- a specific individual, account, address, or device.\n\n2. Requires the FISA Court to appoint a panel of amicus curiae to present the privacy side of arguments when the Court considers novel or significant legal interpretations.\n\n3. Requires the Director of National Intelligence to declassify and publish significant FISA Court opinions.\n\n4. Creates new reporting requirements for the number of orders issued, persons targeted, and estimated number of US persons affected by surveillance.\n\nNote: The passage of the USA FREEDOM Act -- representing the first significant legislative restriction on NSA surveillance authorities since the PATRIOT Act was enacted in 2001 -- was widely attributed to the public debate triggered by Snowden\'s disclosures. Senate Majority Leader Mitch McConnell opposed the Act. Senator Ron Wyden, who had attempted to raise public awareness about surveillance scope without disclosing classified information, supported it.'
        },
        {
            id: 'E8',
            type: 'testimony',
            title: 'Amnesty International Statement on Snowden',
            date: '2013-07-12',
            isRedHerring: false,
            content: 'AMNESTY INTERNATIONAL\nStatement: Edward Snowden Should Not Be Prosecuted\nJuly 12, 2013\n\n"Edward Snowden disclosed information about secret US surveillance programs that were violating human rights on a massive scale. The US government\'s surveillance activities, as revealed by Snowden, are incompatible with international human rights law -- particularly the right to privacy under Article 17 of the International Covenant on Civil and Political Rights.\n\nSnowden acted in the public interest to expose violations of human rights that were being committed in secret with no meaningful public or congressional oversight. Prosecuting him would be a punishment for whistleblowing, and would send a chilling message to others who might consider exposing human rights violations.\n\nWe call on the US government to drop all charges against Snowden and to guarantee him safe passage if he chooses to return to the United States."\n\nNote: The European Parliament passed a resolution in March 2014 calling on member states to grant Snowden asylum or diplomatic protection as a whistleblower. Snowden has remained in Russia since 2013. In September 2022, Russian President Vladimir Putin granted Snowden Russian citizenship. The Obama and Trump administrations both declined to offer Snowden clemency. The Biden administration maintained the same position.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Chelsea Manning Case -- Comparison of Disclosure Methods',
            date: '2013-08-21',
            isRedHerring: true,  // Red herring: Manning case involves different facts, different disclosures, different government systems -- comparison collapses meaningful distinctions
            content: 'CHELSEA MANNING -- WIKILEAKS DISCLOSURES\n\n[Note: Chelsea Manning, an Army intelligence analyst, disclosed approximately 750,000 classified and sensitive documents to WikiLeaks between 2009 and 2010. The documents included the "Collateral Murder" video of a 2007 Baghdad airstrike, Iraq War logs, Afghanistan War logs, and US State Department diplomatic cables. Manning was convicted under the Espionage Act in 2013 and sentenced to 35 years. Obama commuted her sentence in January 2017.\n\nThis document is a red herring. The Snowden and Manning cases are frequently compared but are factually distinct. Manning disclosed documents to an unauthorized third party (WikiLeaks) without review or redaction. Snowden disclosed documents to established journalists (Glenn Greenwald at the Guardian, Barton Gellman at the Washington Post) who made editorial judgments about what to publish and worked with the government on some pre-publication review. Manning\'s disclosures included battlefield operational records, diplomatic cables, and personnel files; Snowden\'s disclosures focused specifically on domestic surveillance programs.\n\nUsing the Manning comparison to evaluate Snowden\'s choices -- or vice versa -- obscures the specific facts and methods relevant to each case. The ethical evaluation must address what Snowden specifically did and why, not what another person in a different context did.]'
        },
        {
            id: 'E10',
            type: 'testimony',
            title: 'Tech Company Responses and NSA Reform Lobby',
            date: '2013-12-09',
            isRedHerring: false,
            content: 'OPEN LETTER -- REFORM GOVERNMENT SURVEILLANCE\nDecember 9, 2013\nSigned by: Apple, Google, Microsoft, Facebook, Twitter, LinkedIn, Yahoo, AOL\n\n"We understand that governments have a duty to protect their citizens. But this summer\'s revelations highlighted the urgent need to reform government surveillance practices worldwide. The balance in many countries has tipped too far in favor of the state and away from the rights of the individual -- rights that are enshrined in our Constitution. This undermines the freedoms we all cherish. It\'s time for a change.\n\nWe are calling on the US government to take the lead and make reforms that will allow people around the world to trust that their information is secure and protected from undue surveillance. We want assurance that the NSA is not hacking into our data centers, that legal process rather than technical subterfuge is used when seeking user data, and that we can publish more information about the requests we receive."\n\nNote: The joint letter was signed by the same companies identified in the PRISM slides (E2) as participants in the program. The companies\' position -- that they complied with legal orders while publicly calling for reform -- reflects the difficulty of their position: compelled by court order to cooperate, prohibited from disclosing the orders, and facing global user trust damage from the Snowden revelations. Following the disclosures, Facebook alone lost an estimated $3.5 billion in ad revenue from European users who changed privacy settings or stopped using the service.'
        }
    ],

    // -- Phase 3: Stakeholders --------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'American Citizens Subject to Mass Surveillance',
            obvious: true
        },
        {
            id: 'S2',
            name: 'NSA and the US Intelligence Community',
            obvious: true
        },
        {
            id: 'S3',
            name: 'The Journalists and Publications That Received the Files',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Technology Companies Named in PRISM',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Congressional Intelligence Committee Members Who Received Classified Briefings',
            obvious: true
        },
        {
            id: 'S6',
            name: 'US Allies Whose Intelligence-Sharing Relationships With NSA Were Disrupted',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Foreign Nationals Outside the US Whose Communications Were Collected Under PRISM',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Future Intelligence Community Contractors Who May Face Tightened Access After the Breach',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Terrorism Suspects and Criminal Networks Whose Communications Were Being Monitored',
            obvious: false
        },
        {
            id: 'S10',
            name: 'FISA Court Judges Whose Secret Legal Interpretations Were Exposed',
            obvious: false
        },
        { id: 'S11', name: 'Hawaiian Real Estate Market', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Booz Allen Hamilton Shareholders', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Snowden was fully justified in disclosing the programs publicly because the public\'s right to know about unconstitutional surveillance overrides the confidentiality obligation.',
            framework: 'consequentialist'
        },
        {
            id: 'D2',
            text: 'Snowden should have used available internal channels -- Inspector General, congressional oversight, legal counsel -- before going to journalists, even if those channels were imperfect.',
            framework: 'deontological'
        },
        {
            id: 'D3',
            text: 'The disclosure was ethically justified but the method was wrong: releasing documents to journalists without government review of operational security risks compounded the harm beyond what was necessary to inform the public.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'The leak caused net harm to national security that outweighs the public interest benefits: the disclosure of collection methods allowed foreign adversaries to adapt, closing intelligence windows that were actively preventing attacks.',
            framework: 'utilitarian-consequentialist'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'The consequentialist case for this decision is substantial. The direct outcome of Snowden\'s disclosures includes: the USA FREEDOM Act (E7), which ended bulk collection of telephone metadata for the first time since 2001; public awareness of PRISM, XKEYSCORE, and Section 215 bulk collection that was explicitly hidden from the American public; and a global debate that led to enhanced data protection legislation in the EU and elsewhere. The alternative -- remaining silent -- would have perpetuated programs that the FISA Court itself later found unconstitutional. The 9th Circuit Court of Appeals ruled in 2020 that the phone metadata program exposed by Snowden was illegal and that US officials who publicly claimed it was legal misled the American public. Consequentialist analysis requires weighing the actual outcomes, and the outcome here includes a legislative restriction on surveillance that would not have occurred without the disclosures.',

            challenging: 'The strongest challenge to D1 is not that disclosure was wrong but that the scope of disclosure was excessive. Snowden copied approximately 1.5 million documents. He disclosed to journalists documents about surveillance programs targeting foreign adversaries -- operations that had no bearing on American civil liberties but whose exposure damaged legitimate intelligence collection. The NSA\'s director stated that Snowden\'s disclosures caused "irreversible and significant" damage to intelligence collection capabilities. A consequentialist analysis cannot ignore those specific harms by focusing only on the domestic civil liberties benefits. The complete accounting must ask: could the same public interest outcome have been achieved with a narrower disclosure? If the answer is yes, then the overbreadth of the disclosure represents a consequentialist failure, even if the core disclosure was justified.',

            incomplete: 'This analysis addresses whether the public interest outcome justified disclosure but does not engage with the professional obligation Snowden held. He was not a journalist making an editorial judgment. He was an employee with a security clearance that he obtained through specific obligations, including a promise of confidentiality backed by criminal law. The ethical framework for evaluating his choice must account for the fact that the confidentiality obligation exists for legitimate reasons -- protecting sources, methods, and the security of people working in classified environments. Dismissing that obligation as overridden by public interest requires an argument about why his unilateral judgment that the programs were unconstitutional was reliable enough to override the legal framework for making that determination. The incomplete element is the failure to engage with the question of who gets to make the judgment call.'
        },
        'D2': {
            supporting: 'A deontological analysis grounded in institutional obligation supports this position. The classified information Snowden accessed was entrusted to him under specific legal and professional terms. The Inspector General process, congressional oversight, and legal counsel are not just procedural niceties -- they represent the institutional mechanisms through which democratic societies resolve disputes about the scope of government power without resorting to unilateral individual action. Snowden\'s argument that these channels were compromised -- because the IG reports to the DNI, because members of Congress are sworn to secrecy -- is not without merit. But the correct response to imperfect institutional channels is not to bypass them entirely but to exhaust them and document the failure. The duty to respect institutional processes is not contingent on the institutions being perfect.',

            challenging: 'Snowden specifically addresses this objection in his interview (E3). He notes that the Inspector General\'s office is subordinate to the Director of National Intelligence -- the person who authorized the programs. He notes that disclosing classified information to congressional staff would itself be a federal crime under the circumstances. Director Clapper had already testified falsely before Congress (E4) and faced no consequences. Senator Wyden was aware of the program and could not tell the public without violating his classified briefing obligations. Snowden\'s assessment that internal channels were not viable is not a rationalization; it is an accurate description of the institutional constraints the system itself had built. A deontological analysis that demands exhaustion of internal channels must grapple with the fact that those channels had been structurally eliminated for this category of issue.',

            incomplete: 'This analysis does not resolve what Snowden should have done after exhausting internal channels and finding them closed. If the answer is "accept that secret unconstitutional programs will continue indefinitely because the disclosure mechanisms for them have been classified," then the deontological position produces an outcome that is inconsistent with the constitutional principles it claims to protect. The incomplete element is the failure to specify the endpoint of the internal channels argument: what is the appropriate action when institutional channels are provably unavailable, and the harm being concealed is the systematic violation of Fourth Amendment rights at scale?'
        },
        'D3': {
            supporting: 'Virtue ethics supports this nuanced position as the one most consistent with practical wisdom. The programs Snowden disclosed were genuinely concerning from a civil liberties perspective -- bulk collection without individualized suspicion represents a qualitative shift in surveillance capability that the public was never given the opportunity to debate. Disclosure was warranted. But a person of practical wisdom would have made the disclosure in a manner that minimized collateral damage: working with news organizations to review documents for operational security risks before publication, limiting disclosure to domestic surveillance programs, and refusing to give documents about foreign intelligence collection to foreign governments. Snowden\'s choice to bring documents to journalists in Hong Kong and Russia -- and to meet with journalists from multiple countries -- went beyond the minimum necessary to achieve the public interest goal.',

            challenging: 'The virtue ethics critique of D3 cuts both ways. Snowden did in fact disclose to established journalists rather than releasing documents directly to the public. Glenn Greenwald at the Guardian and Barton Gellman at the Washington Post exercised editorial judgment about which documents to publish and when. The argument that the method was wrong depends on establishing that the journalists\' editorial decisions caused specific operational harm -- a claim that US officials have made but have not documented in public. The claim that more careful disclosure would have achieved the same public interest outcome while causing less harm is speculative. The virtue of restraint is a real value; the virtue of courage in the face of institutional wrongdoing is also a real value. This decision requires choosing which virtue takes precedence, and that choice is not obvious.',

            incomplete: 'D3 agrees that disclosure was justified but criticizes the method. This creates an obligation to specify what the correct method would have been. If the answer is "disclose only domestic surveillance programs to American news organizations after government review of operational security," then you must explain why that limited disclosure would have triggered the same legislative response (the USA FREEDOM Act) as the broader disclosures. The USA FREEDOM Act restricted telephone metadata collection -- a domestic program. But PRISM\'s Section 702 authorities, which are the broadest collection program, remain largely intact. The public policy outcome depends partly on the scope of disclosure. The incomplete element is the failure to trace the causal relationship between disclosure scope and policy outcome.'
        },
        'D4': {
            supporting: 'The national security objection to Snowden\'s disclosures is grounded in a specific consequentialist claim: that the intelligence value of the programs he exposed -- including active collection against foreign adversaries -- exceeded the civil liberties costs, and that exposing collection methods allowed adversaries to adapt in ways that closed intelligence windows used to prevent attacks. The NSA Director testified that specific surveillance capabilities were lost as foreign targets changed their communication methods after the disclosures. The House Intelligence Committee\'s classified report on damage assessment, not publicly released, reportedly identified specific intelligence losses. A complete consequentialist accounting must include those losses, not just the domestic civil liberties benefits.',

            challenging: 'This position has evidentiary problems. The specific intelligence losses from Snowden\'s disclosures have never been documented in public. The NSA\'s claims of "grave damage" have not been substantiated with specific examples that can be evaluated. Meanwhile, the public record contains a specific, documented harm from the programs Snowden disclosed: the bulk collection of telephone metadata on all Americans without individualized suspicion, which a federal appeals court ruled illegal in 2015. A consequentialist analysis that accepts classified assertions of intelligence losses while discounting documented violations of constitutional rights is not applying consequentialist reasoning symmetrically. The burden of proof for the national security harm claim is currently unmet.',

            incomplete: 'D4\'s consequentialist framing treats the question as a simple cost-benefit calculation: intelligence value lost versus civil liberties benefits gained. But this framing assumes that secret government surveillance of citizens is a legitimate starting point in the calculation rather than a constitutional violation that cannot be traded against security benefits. The Fourth Amendment is not a preference to be weighed against competing preferences; it is a legal constraint on government action. If the programs were unconstitutional -- as the 9th Circuit found -- they were not available for the government to use in the first place. The incomplete element is the failure to address whether unconstitutional programs belong in the consequentialist ledger at all.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.7',
            text: 'Honor confidentiality. Computing professionals are often entrusted with confidential information such as trade secrets, client data, personal information, and matters of national security. A computing professional should protect confidentiality except in cases where it is evidence of the violation of law, of organizational regulations, or of the Code. In these cases, the nature or contents of that information should not be disclosed except to appropriate authorities.'
        },
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. Computing professionals have an obligation to minimize unintended harm to the public, to co-workers, and to the individuals whose data they manage. When a harm is being perpetuated by an organization, and internal channels for addressing that harm have been exhausted or are unavailable, the computing professional has an obligation to consider external disclosure to appropriate parties.'
        },
        {
            code: 'IEEE',
            section: '7.4',
            text: 'Protect the public interest. Engineers shall hold paramount the safety, health, and welfare of the public. When a professional judgment is made that a technical system poses risks to the public -- including risks to civil liberties, privacy, and constitutional rights -- the professional has an obligation that supersedes organizational loyalty.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.7',
        provision2: 'ACM 1.2',
        conflictDescription: 'ACM 1.7 creates a confidentiality obligation that is not absolute: it permits disclosure when the confidential information is evidence of a violation of law. The PRISM and Section 215 programs were authorized by classified FISA Court orders -- they were not illegal at the time of disclosure in the conventional sense, even though a federal court later found the telephone metadata program unlawful.\n\nACM 1.2 creates an obligation to minimize harm to the public. The question is whether mass surveillance of American citizens without individualized suspicion constitutes a "harm" within the meaning of ACM 1.2, or whether it is a legitimate government function that, while controversial, does not rise to the level of harm that professional obligations can override.\n\nThe conflict is this: if the programs are "evidence of violation of law" within ACM 1.7, then disclosure to appropriate authorities is permitted. But who are the "appropriate authorities" when the programs are authorized by a secret court, defended by the executive branch, and cannot be discussed in public even by members of Congress who know about them? And if the programs are not technically illegal at the time of disclosure, does ACM 1.2\'s harm avoidance obligation provide independent grounds for disclosure -- or does it require a finding of illegality first?\n\nThis is not a resolved question. The Code provisions point in the same direction (disclose in cases of public harm) but disagree on the predicate conditions for that disclosure.'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
