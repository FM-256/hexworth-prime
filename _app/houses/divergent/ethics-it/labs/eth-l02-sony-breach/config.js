/* ============================================================
   ETH-L02 -- The Sony Breach
   Sony Pictures Hack Case Room Configuration

   All factual content is sourced from publicly documented
   events in the Sony Pictures Entertainment cyberattack
   (November 2014): FBI attribution to North Korea December
   19, 2014; release of approximately 100 terabytes of
   internal data including unreleased films, executive salary
   data, personal employee information, and confidential email
   chains; The Interview release controversy and subsequent
   digital release December 25, 2014; Obama administration
   executive order sanctioning North Korea January 2, 2015;
   and Sony's $8 million cybersecurity settlement with
   employees in 2015.

   Red herrings: E5 (MPAA's "Project Goliath" anti-piracy
   lobbying revealed in leaked emails -- true but legally
   separate from the data breach and intervention question)
   and E11 (Sony's prior 2011 PlayStation Network breach --
   true but a distinct incident from a different business
   unit and a different threat actor).
   ============================================================ */

const ETHL02Config = {
    id: 'eth-l02',
    title: 'The Sony Breach',
    subtitle: 'Sony Pictures Hack and the North Korea Incident',
    course: 'CIS4253',
    week: 1,
    chapter: 3,
    duration: 30,
    accent: '#ff00ff',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Office of the Chief Information Security Officer, Sony Pictures Entertainment',
        to: 'You (Senior Information Security Analyst, Sony Pictures Entertainment)',
        date: 'November 25, 2014',
        classification: 'CONFIDENTIAL -- INCIDENT RESPONSE',
        content: 'You have been part of the Sony Pictures security team for four years. On November 24, 2014, a group calling itself the Guardians of Peace (GOP) broke into Sony\'s internal network. They did not just break in. They stayed.\n\nThe scope of what was exfiltrated is not yet fully known, but preliminary forensics indicate the following: approximately 100 terabytes of internal data was staged and transferred. This includes five unreleased films, including "Annie" and the upcoming Seth Rogen and James Franco comedy "The Interview" -- a film depicting the assassination of North Korean leader Kim Jong-un. It includes salary information for thousands of employees. It includes personal identifying information: Social Security numbers, medical records, passport scans, HR files for current and former employees. It includes the private email archives of senior executives, including co-chairman Amy Pascal.\n\nThe attackers have posted a fraction of this material publicly. They are demanding that Sony pull "The Interview" from its December 25 release. Their message reads: "If you don\'t, we will release more. We will publish emails, business plans, personal information. And we can do more than that."\n\nThe FBI has been notified. Federal investigators are analyzing the malware, which is sophisticated -- hardcoded IP addresses, Korean-language strings in the code, operational security patterns consistent with a nation-state actor. Attribution is not yet official, but internal assessments point to North Korea\'s Reconnaissance General Bureau.\n\nSony\'s theatre chains have begun receiving threat messages. At least two major distributors are now reconsidering their participation in the December 25 release.\n\nYou are being asked to brief the executive team tomorrow morning. They need to understand: what are the security implications of each response option? What does your professional obligation tell you about what Sony should do next?\n\nYou are not the person who made the decision to make this film. You are not a lawyer or a government official. You are the person who understands, better than anyone in that room, what the attackers are capable of and what surrender signals to every future attacker who is watching.',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E11 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'memo',
            title: 'FBI Attribution Report -- North Korea Responsible',
            date: '2014-12-19',
            isRedHerring: false,
            content: 'FEDERAL BUREAU OF INVESTIGATION\nFBI NATIONAL PRESS OFFICE\n\nThe FBI has enough information to conclude that the North Korean government is responsible for these actions. While the need to protect sensitive sources and methods prevents us from sharing all of this information, our conclusion is based on a number of factors.\n\nTechnical analysis of the data deletion malware used in this attack revealed links to other malware that the FBI knows North Korean actors previously developed. The malware in this attack shares significant code overlap with a previously discovered malware suite -- including specific implementations, encryption algorithms, data deletion methods, and compromised networks -- that the FBI has attributed to North Korean actors.\n\nThe FBI also observed similarities in the network infrastructure used in this attack and in attacks the FBI has previously attributed to North Korea. Specifically, the FBI identified Internet protocol addresses -- which the actors used to post stolen Sony data -- that are known North Korean infrastructure and associated with a specific set of IP addresses known to be used exclusively by North Korea.\n\nSome individuals previously associated with these IP addresses have also been linked to the North Korean government.\n\nNote: North Korea denied responsibility. Independent cybersecurity researchers, including some at Kaspersky and Norse Corp, initially raised questions about the attribution methodology. The FBI maintained its position. The 2016 indictment of North Korean operative Park Jin Hyok named specific individuals involved in the Sony attack and subsequent operations including the WannaCry ransomware and the $81 million Bangladesh Bank heist.'
        },
        {
            id: 'E2',
            type: 'email',
            title: 'Leaked Executive Email -- Amy Pascal to Scott Rudin',
            date: '2014-11-24',
            isRedHerring: false,
            content: 'FROM: Amy Pascal, Co-Chairman, Sony Pictures Entertainment\nTO: Scott Rudin, Producer\n\n[Note: This email was among thousands released by the attackers. It became one of the most widely covered elements of the breach due to its racial content. The email chain involved racially charged jokes about President Obama\'s movie preferences. Pascal apologized publicly and subsequently resigned as Co-Chairman of Sony Pictures in February 2015.]\n\nThis artifact is included not because of its specific content, but because it represents the category of leaked executive communications that caused immediate reputational harm to individuals who had no role in making "The Interview," and whose private communications were weaponized as leverage to pressure Sony\'s decision-making.\n\nThe existence of this category of evidence raises a specific question: when a company\'s private communications are used as hostage material, does the obligation to protect those individuals override the obligation to resist coercion? Or does surrendering to coercion guarantee that future actors will use the same tactic against anyone else whose communications exist on a corporate network?'
        },
        {
            id: 'E3',
            type: 'testimony',
            title: 'Theatre Chain Communications -- Safety Concerns and Withdrawal',
            date: '2014-12-17',
            isRedHerring: false,
            content: 'Following the Guardians of Peace threat message on December 16, 2014 -- which referenced the September 11 attacks and warned audiences not to attend screenings of "The Interview" -- the five largest theatre chains in the United States withdrew from the December 25 release:\n\nRegal Entertainment Group (Statement): "Due to the wavering support of the film The Interview by Sony Pictures, as well as the ambiguous nature of any security threat, Regal Entertainment Group has decided to delay the opening of the film in our theatres."\n\nAMC Theatres, Carmike Cinemas, Cinemark, and Cineplex followed with similar withdrawals.\n\nBy December 17, Sony Pictures had canceled the theatrical release entirely, citing the withdrawal of the major distributors.\n\nNote: The threat message contained no specific, credible threat of physical violence at theatres. The Department of Homeland Security stated it had no credible intelligence indicating an active plot. The FBI similarly found no evidence of a specific plot targeting theatres. The decision by theatre chains was made in response to a threat whose operational credibility had not been established.'
        },
        {
            id: 'E4',
            type: 'testimony',
            title: 'Obama Administration Statement -- Sony Should Not Have Caved',
            date: '2014-12-19',
            isRedHerring: false,
            content: 'PRESIDENT BARACK OBAMA\nEnd-of-Year Press Conference\nDecember 19, 2014\n\n"Sony is a corporation. It suffered significant damage. There were threats against its employees. I am sympathetic to all of that. But here is what I know: we cannot have a society in which some dictator someplace can start imposing censorship here in the United States. Because if somebody is able to intimidate folks out of releasing a satirical movie, imagine what they start doing when they see a documentary they do not like, or news reports they do not like.\n\nI wish they had spoken to me first. I would have told them: do not get into a pattern in which you are intimidated by these kinds of criminal attacks. They caused damage and it was a disruption and people were inconvenienced, but if we set a precedent in which the content of films and the speech and expression of the American artistic community is subject to the intimidation of foreign actors, we will have lost something important about this country."\n\nNote: Obama subsequently signed an executive order on January 2, 2015, imposing new sanctions on North Korea\'s government in response to the attack. The sanctions targeted the Reconnaissance General Bureau, the Korea Mining Development Trading Corporation, and 10 named individuals.'
        },
        {
            id: 'E5',
            type: 'email',
            title: 'Project Goliath -- MPAA Anti-Piracy Lobbying Documents',
            date: '2014-10-01',
            isRedHerring: true,  // Red herring: MPAA lobbying strategy revealed in leaked emails is a separate controversy from the data breach response question
            content: 'MOTION PICTURE ASSOCIATION OF AMERICA\nProject Goliath -- Confidential\n\n[Note: Among the leaked Sony emails were communications revealing that the MPAA had coordinated a campaign -- internally called "Project Goliath" -- aimed at disrupting Google\'s ability to host pirated content, including efforts to revive elements of SOPA-type legislation and to pressure state attorneys general.\n\nThe Google campaign was extensively covered in the press and generated significant criticism of the entertainment industry\'s approach to copyright enforcement. Eric Schmidt of Google responded publicly to the revelations.\n\nThis document is a red herring. The MPAA lobbying revelations are a real consequence of the breach, but they are a separate controversy from the core ethical question in this case: how should Sony, the US government, and security professionals respond to state-sponsored corporate espionage used as censorship? The MPAA material is relevant to understanding why the attackers may have had a secondary goal of embarrassing the entertainment industry, but it does not bear on the decision architecture facing the Sony security team or the government response question.]'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'Employee Class Action -- Personal Data Exposure',
            date: '2015-01-06',
            isRedHerring: false,
            content: 'CORONA ET AL. v. SONY PICTURES ENTERTAINMENT INC.\nUnited States District Court, Central District of California\n\nPlaintiffs are current and former Sony Pictures employees who allege that Sony failed to take adequate precautions to secure their sensitive personal information, including Social Security numbers, medical records, salary data, and personal correspondence.\n\nThe complaint alleges that Sony was aware of significant vulnerabilities in its network prior to the attack, including a 2014 internal audit that identified 100 critical vulnerabilities in Sony\'s network infrastructure. Sony reportedly deferred corrective action due to cost.\n\nThe complaint alleges four causes of action: negligence, breach of implied contract, breach of confidence, and violation of California\'s Confidentiality of Medical Information Act.\n\nNote: Sony settled the class action in 2015 for approximately $8 million, which covered out-of-pocket costs, credit monitoring services, and a legal fee fund for the approximately 47,000 current and former employees whose data was exposed. The settlement explicitly did not require Sony to admit liability. The internal audit finding -- 100 critical vulnerabilities known and deferred -- became a significant element in subsequent analysis of Sony\'s pre-breach security posture.'
        },
        {
            id: 'E7',
            type: 'data',
            title: 'Malware Technical Analysis -- Destover Wiper',
            date: '2014-12-02',
            isRedHerring: false,
            content: 'SECURITY INDUSTRY TECHNICAL ANALYSIS -- DESTOVER\n\nThe malware deployed in the Sony attack, known as Destover, is a sophisticated wiper that operates in two stages. In the first stage, it performs reconnaissance and data exfiltration. In the second stage, it overwrites the master boot record of infected systems and deletes files, rendering the systems non-bootable.\n\nKey technical characteristics:\n- Hardcoded C2 server addresses consistent with infrastructure previously linked to North Korean operations\n- Korean-language artifacts in the binary\n- Code similarities to DarkSeoul malware used in 2013 attacks against South Korean banks and broadcasters\n- Anti-forensic capabilities to inhibit attribution analysis\n- Deployment via compromised administrator credentials, suggesting significant prior reconnaissance\n\nThe wiper component was activated on November 24, 2014. Approximately 70 percent of Sony\'s computing infrastructure was destroyed or rendered inoperable. Some systems required complete hardware replacement.\n\nNote: The sophistication of the attack and the extent of pre-positioning (the attackers had been inside Sony\'s network for months prior to the destructive phase) indicates that this was not an opportunistic attack but a planned operation. The specific selection of "The Interview" as a pressure point indicates that the objective was censorship through coercion, not financial gain.'
        },
        {
            id: 'E8',
            type: 'testimony',
            title: 'Sony Statement -- Digital Release Announcement',
            date: '2014-12-23',
            isRedHerring: false,
            content: 'STATEMENT FROM SONY PICTURES ENTERTAINMENT\nDecember 23, 2014\n\n"We have never given up on releasing The Interview and we are excited our movie will be in the hands of anyone who wants to see it on Christmas Day. We know that not every theatre in the country will be showing it, but we hope those who do will be packed.\n\nWe never imagined it would be shown in the manner it is about to be. But we are doing our best to honor our filmmakers and their right to free expression and are releasing this movie nationwide tomorrow."\n\nNote: Sony released "The Interview" through Google Play, YouTube Movies, and its own website on December 24-25, 2014. It was the first major studio film to be released simultaneously through digital rental without a theatrical run. Within four days, Sony reported that the film had earned $15 million through the online release and was shown in 331 independent theatres that chose to carry it. The film ultimately generated approximately $40 million across all platforms.\n\nThe digital release decision reversed the December 17 cancellation. Between cancellation and re-release, Obama\'s public criticism and widespread condemnation of the original decision as capitulation to censorship had been reported extensively in the media.'
        },
        {
            id: 'E9',
            type: 'legal',
            title: 'US Government Sanctions -- Executive Order 13687',
            date: '2015-01-02',
            isRedHerring: false,
            content: 'EXECUTIVE ORDER 13687\nSigned: January 2, 2015\nPresident Barack Obama\n\nI, Barack Obama, President of the United States of America, find that the provocative, destabilizing, and repressive actions and policies of the Government of North Korea, including its destructive, coercive cyber-related actions during November and December 2014, constitute an unusual and extraordinary threat to the national security, foreign policy, and economy of the United States, and I hereby declare a national emergency to deal with this threat.\n\nI hereby order sanctions against:\n- The Reconnaissance General Bureau (RGB), the primary North Korean intelligence agency\n- Korea Mining Development Trading Corporation (KOMID)\n- Korea Tangun Trading Corporation\n- Ten named individuals associated with North Korean government operations\n\nNote: This executive order represented the first time a US president used emergency powers to sanction a foreign state specifically in response to a cyberattack against a private company. The sanctions froze any assets the named entities held under US jurisdiction and prohibited Americans from doing business with them. Critics noted that the practical impact was limited because North Korea has minimal financial exposure to US jurisdiction.'
        },
        {
            id: 'E10',
            type: 'testimony',
            title: 'Cybersecurity Industry Analysis -- Precedent and Deterrence',
            date: '2015-01-15',
            isRedHerring: false,
            content: 'ANALYSIS: The Sony Decision and the Censorship Precedent\nCenter for Strategic and International Studies\n\nThe Sony Pictures attack marks a qualitative shift in the use of cyberattacks as tools of geopolitical coercion. Previous state-sponsored attacks targeted military and government infrastructure, industrial systems (Stuxnet), or financial institutions. The Sony attack targeted a private entertainment company for producing content that a foreign government found politically objectionable.\n\nThe core deterrence question is: what does the outcome of the Sony case signal to other actors?\n\nIf the answer is that a sufficiently embarrassing data dump combined with a physical threat will cause a private company to self-censor, the precedent creates a new attack vector against any media company, publisher, or platform that a foreign government wants to pressure. The cost of the attack -- attribution risk, diplomatic fallout -- must be weighed against the benefit: a private company pulled a $44 million film without any court order, any legal proceeding, or any legislative action.\n\nNote: Within 18 months of the Sony attack, the same North Korean unit (Lazarus Group) was implicated in the $81 million heist from Bangladesh\'s central bank account at the Federal Reserve, and later in the WannaCry ransomware attack affecting 300,000 systems in 150 countries. The escalation pattern is consistent with an actor that concluded the Sony attack carried acceptable consequences.'
        },
        {
            id: 'E11',
            type: 'data',
            title: 'Sony PlayStation Network Breach -- 2011 Incident Record',
            date: '2011-04-26',
            isRedHerring: true,  // Red herring: PSN breach was a different business unit, different threat actor, different legal and ethical context
            content: 'SONY COMPUTER ENTERTAINMENT -- PLAYSTATION NETWORK BREACH\nApril 2011\n\n[Note: In April 2011, hackers broke into Sony\'s PlayStation Network and stole personal information for approximately 77 million accounts, including names, addresses, email addresses, birthdates, and potentially credit card data. The PSN was taken offline for 23 days. Sony paid approximately $15 million in settlements and faced regulatory investigations in multiple countries.\n\nThis document is a red herring. The 2011 PSN breach is a separate incident involving Sony Computer Entertainment (not Sony Pictures Entertainment), a different threat actor, and a different technical vector. While it is factually accurate that Sony had experienced a major breach before 2014, the PSN incident does not bear on the ethical question of how to respond to state-sponsored cyberattack used as censorship leverage.\n\nThe relevant history for this case is Sony Pictures\' own security posture and the internal audit (E6) showing deferred remediation, not the consumer gaming network breach. Using PSN to argue that Sony should have "known better" conflates two distinct subsidiaries and two distinct categories of attack.]'
        }
    ],

    // -- Phase 3: Stakeholders --------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Sony Pictures Employees Whose Personal Data Was Exposed',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Sony Pictures Senior Executives',
            obvious: true
        },
        {
            id: 'S3',
            name: 'The Filmmakers and Actors Associated With The Interview',
            obvious: true
        },
        {
            id: 'S4',
            name: 'The US Government and Intelligence Community',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Theatre Chains and Distribution Partners',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Journalists Who Published Content From the Leaked Emails',
            obvious: true
        },
        {
            id: 'S7',
            name: 'Other Media Companies Watching the Precedent Being Set',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Sony\'s Cyber Insurance Carrier',
            obvious: false
        },
        {
            id: 'S9',
            name: 'The North Korean Civilian Population Affected by Sanctions',
            obvious: false
        },
        {
            id: 'S10',
            name: 'Future Targets of State-Sponsored Cyber Coercion',
            obvious: false
        },
        { id: 'S11', name: 'Sony PlayStation Hardware Engineers', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Japanese Film Critics Association', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Recommend Sony comply: pull the film from release to stop further employee data exposure and protect staff from the ongoing threat.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D2',
            text: 'Recommend Sony release as planned on December 25, treat the threat as a bluff, and cooperate fully with the FBI investigation.',
            framework: 'deontological'
        },
        {
            id: 'D3',
            text: 'Recommend Sony delay the theatrical release by 90 days while the FBI investigation completes, giving government actors time to respond before Sony is forced to choose.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Recommend Sony pivot immediately to a digital-only release, bypassing theatre chains entirely and releasing on all major streaming platforms simultaneously.',
            framework: 'consequentialist'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'Act utilitarianism can be invoked on behalf of the employees whose data is being held hostage. The ongoing release of personal information -- Social Security numbers, medical records, salary data -- causes concrete, measurable harm to identifiable individuals who did not choose to be part of this conflict. Preventing the release of additional data protects those specific employees from additional financial, reputational, and personal harm. A security analyst\'s primary operational obligation is to the people whose data they are entrusted to protect. If pulling the film stops the damage to those people, the utilitarian calculus at the individual level supports compliance.',

            challenging: 'This analysis fails at the systems level. The Guardians of Peace are not threatening employees because they care about Sony\'s data practices. The exfiltrated employee data is leverage -- it is the mechanism by which a foreign government is attempting to exercise censorship over American creative expression. Complying does not make the employee data safe; it rewards the use of employee data as a coercive instrument, guaranteeing that every future attacker will use the same leverage against the next target. A full utilitarian accounting must include: (1) the probability that compliance actually stops further leaks, given that the attackers retain the data regardless; (2) the harm to all future media company employees whose employers will now face the same coercive template; and (3) the harm to the principle that private companies should not be compelled to self-censor by foreign state actors.',

            incomplete: 'This decision addresses the immediate harm to employees but does not account for the professional obligation of the security function. Your brief is not just to stop the immediate damage. It is to give the executive team an honest assessment of what each response signals to future attackers. A complete analysis must include the deterrence dimension: if compliance sets a precedent, what does your security team\'s recommendation say about its own ability to protect future clients and employers from the same coercive pattern? The incomplete element is the failure to model the second-order security consequences of the decision you are recommending.'
        },
        'D2': {
            supporting: 'A deontological analysis grounded in the categorical imperative supports this choice. If universalized: what world do we inhabit if every private company pulls content when a foreign government threatens to release embarrassing internal data? We inhabit a world in which any country with the capability to conduct a sustained network intrusion has effective veto power over any creative, journalistic, or commercial expression that displeases its government. Kant\'s universalizability test produces a clear result: the maxim "comply with state-sponsored censorship threats to minimize immediate harm" cannot be universalized without destroying the principle of free expression on which it depends. You also have a duty-based obligation under ACM Code of Ethics 1.7 (honor confidentiality) and 2.5 (give comprehensive evaluations) -- your obligation is to give the executive team an accurate assessment, not a risk-minimizing one.',

            challenging: 'The deontological framing overstates the clarity of the duty. The employees whose data is at risk did not consent to being placed in this conflict. Their Social Security numbers and medical records are not abstract principles -- they are attached to real people who will suffer real consequences if the data continues to be released. A deontological analysis that treats "release the film" as a categorical imperative without accounting for the concrete harm to identifiable third parties -- the employees -- is using duty as a shield against consequential thinking. The right deontological question is not "should Sony surrender to censorship?" but "what duty does Sony owe to employees who entrusted it with their most sensitive personal information?"',

            incomplete: 'This analysis does not address the security team\'s specific role. You are not the CEO. You are not the board. You are the person who understands the technical environment. The question of whether Sony should release the film is partly a policy and business question -- but your professional input is specifically on the security dimension: what does the FBI\'s investigation status indicate? What is the realistic probability that the attackers will escalate from data leaks to a physical threat? What does the malware analysis (E7) tell you about the attacker\'s capabilities and intentions? A complete analysis from a security professional\'s perspective must include those technical judgments, not just the ethical framework.'
        },
        'D3': {
            supporting: 'Virtue ethics supports this choice as the response most consistent with practical wisdom (phronesis) in conditions of genuine uncertainty. The FBI investigation is ongoing. Attribution is confirmed but the extent of the attacker\'s capabilities -- including whether the physical theatre threats have any operational foundation -- has not been assessed. A person of good character, acting with appropriate epistemic humility, gives the government time to respond before forcing a binary choice. Delaying is not the same as surrendering. It is giving the appropriate authorities -- who have both the mandate and the resources to respond -- the time to do so. Aristotle\'s practical wisdom does not mean finding the courageous option; it means finding the option appropriate to the specific situation, which includes acknowledging what you do not yet know.',

            challenging: 'A consequentialist critique applies: a 90-day delay is not a neutral act. The attackers have demonstrated they will continue releasing data during any period of indecision. A delay extends the window of ongoing employee data exposure without actually resolving the core question. It also signals to the attackers that the threat campaign is working -- that Sony is not proceeding as planned and is in negotiation mode, even if no formal negotiation is taking place. The deterrence analysis from E10 suggests that partial responses -- neither clear compliance nor clear defiance -- may be the worst outcome, conveying neither the firmness needed to deter future attacks nor the compliance needed to stop the immediate one.',

            incomplete: 'This analysis does not specify what happens after 90 days. If the FBI investigation concludes but the government response is sanctions (as eventually happened with EO 13687) that have no practical effect on the attacker\'s data retention, Sony is in exactly the same position it was in before the delay -- except three months of additional data has been released. A complete virtue ethics analysis must specify what the delay is intended to accomplish and what the commitment point is: under what circumstances would Sony release after the delay, and under what circumstances would it conclude that release is not feasible? Without those specifications, the 90-day delay is not a decision; it is a postponement of the decision.'
        },
        'D4': {
            supporting: 'Consequentialist analysis strongly supports this choice on several grounds. A digital-only release achieves the core objective -- the film is released, censorship is resisted -- while removing the theatre chains from the conflict. Theatre chains are private businesses with no obligation to expose their employees and customers to even a non-credible physical threat. By releasing digitally, Sony removes the pressure point (theatre attendance at a physical location) without surrendering on the censorship question. The outcome is better on multiple dimensions: the film reaches a global audience, the attacker\'s censorship objective fails, and the specific threat mechanism (physical theatre attendance) is rendered moot. The $40 million Sony ultimately earned from the digital release (E8) validates the economic viability of the approach.',

            challenging: 'A deontological critique: the digital pivot, while clever, is still a partial capitulation. Sony did not originally plan a digital-only release. The modification of its release plan -- even if the film is ultimately seen -- is a response to the coercive threat. If the categorical imperative is "do not allow foreign state actors to alter your business decisions through extortion," then any modification of the original plan in response to the threat fails that test, even if the modification is tactically clever. Additionally, the digital release format disadvantaged the film compared to what a full theatrical run would have achieved, meaning the attackers did impose a concrete cost on Sony, the filmmakers, and the actors -- simply a smaller one than a full cancellation.',

            incomplete: 'This analysis addresses the immediate film release question but does not address the broader corporate breach response. The digital release of one film does not resolve the ongoing employee data exposure, the destroyed IT infrastructure (70 percent of Sony\'s systems wiped by the Destover malware, E7), or the security posture questions raised by the pre-attack internal audit (E6). Your recommendation to the executive team must address not just how to handle "The Interview" but what Sony\'s obligations are to the employees whose data was taken, to the board regarding the deferred security remediation decisions, and to the government regarding what information Sony should be sharing with federal investigators. The digital release recommendation is tactically sound but strategically incomplete.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.6',
            text: 'Respect privacy. The responsibility of computing professionals includes maintaining confidentiality of personal information entrusted to them. Computing professionals should protect individuals\' privacy by preventing the disclosure of data in ways that would harm the individual or violate their reasonable expectation of confidentiality.'
        },
        {
            code: 'SE-Code',
            section: '3.12',
            text: 'Work to develop software and related documents that respect the privacy of those who will be affected by that software. The software engineer must consider the privacy implications of their work not only for end users but for all parties whose information may be processed, stored, or exposed by the software or systems they build.'
        },
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. Computing professionals have an obligation to minimize unintended harm to the public, to co-workers, and to the individuals whose data they manage. When a harm has been caused by others and the computing professional has knowledge of it, they are obligated to take steps to minimize continuing harm and report the issue to appropriate parties.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.6',
        provision2: 'SE Code 3.12',
        conflictDescription: 'ACM 1.6 creates an obligation to protect the privacy of individuals whose data has been entrusted to Sony. SE Code 3.12 creates an obligation to consider privacy implications for all parties affected by the systems Sony builds and operates.\n\nThe conflict arises when the "affected parties" include two groups with opposing interests: the Sony employees whose private data was stolen, and the public whose interest in free expression is implicated by the censorship demand.\n\nComplying with the censorship demand may partially protect employees from additional data exposure -- but it does so by allowing a foreign government to use employee data as a weapon to override the public interest in artistic expression. Not complying may accelerate employee data exposure -- but it resists the use of that data as coercive leverage.\n\nWhich group of affected parties does the software professional\'s privacy obligation prioritize? And does "protect privacy" mean preventing initial disclosure, or does it mean refusing to allow an attacker to use already-stolen data as a bargaining chip?'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
