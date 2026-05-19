/* ============================================================
   ETH-L11 -- The Tracking Order
   Carpenter v. United States / Warrantless CSLI Case Room

   All factual content is sourced from publicly documented
   record in Carpenter v. United States, 138 S. Ct. 2206
   (2018): Timothy Carpenter was suspected in a string of
   robberies of Radio Shack and T-Mobile stores around Detroit;
   the FBI obtained court orders under 18 U.S.C. § 2703(d) of
   the Stored Communications Act for approximately 127 days of
   his cell-site location information (CSLI) from MetroPCS and
   Sprint, totaling approximately 12,898 location data points;
   Carpenter was convicted and sentenced to over 100 years; on
   appeal SCOTUS ruled 5-4 that the government's acquisition
   of CSLI without a warrant constituted a Fourth Amendment
   search; Chief Justice Roberts wrote the majority opinion,
   joined by Ginsburg, Breyer, Sotomayor, and Kagan; the
   precedent the government had relied upon was Smith v.
   Maryland, 442 U.S. 735 (1979), which established the
   "third-party doctrine" that information voluntarily turned
   over to a third party (e.g., a phone carrier) loses Fourth
   Amendment protection.

   Lecture framework pairing: Homelander (capability-as-
   permission) vs Uncle Iroh (future-you / virtue ethics).
   Code anchors: ACM 1.6 (Respect privacy), IEEE Code 1 (Hold
   paramount the safety, health, and welfare of the public),
   ACM 1.2 (Avoid harm).

   Red herrings: E5 (NSA bulk telephony metadata under USA
   PATRIOT Act § 215 -- a real, prominent surveillance program
   but a distinct legal regime with different statutory
   authority and different precedent; sometimes conflated with
   Carpenter because both involve carrier data, but the legal
   questions differ) and E9 (Stingray / cell-site simulator
   deployment -- also cellular location surveillance, but
   real-time active interception under the pen register / trap-
   and-trace statute rather than the Stored Communications Act
   regime that Carpenter addresses).
   ============================================================ */

const ETHL11Config = {
    id: 'eth-l11',
    title: 'The Tracking Order',
    subtitle: 'Carpenter v. United States and 127 Days of Cell-Site Location Data',
    course: 'CIS4253',
    week: 2,
    chapter: 4,
    duration: 30,
    accent: '#06b6d4',

    // -- Phase 1: Brief ---------------------------------------
    brief: {
        type: 'memo',
        from: 'Senior Counsel, Subpoena Compliance Unit, MetroPCS Communications',
        to: 'You (Senior Engineer, Lawful Intercept and Records Production)',
        date: 'February 2011',
        classification: 'INTERNAL -- LEGAL HOLD WORKFLOW',
        content: 'We have received a court order under 18 U.S.C. § 2703(d) of the Stored Communications Act. The order is signed by a federal magistrate judge in the Eastern District of Michigan and directs us to produce historical cell-site location information for a single subscriber covering the period December 2010 through April 2011 -- approximately 127 days.\n\nA § 2703(d) order is not a search warrant. The statute requires the government to show "specific and articulable facts showing that there are reasonable grounds to believe that the records are relevant and material to an ongoing criminal investigation." That is a lower threshold than the probable cause required for a Fourth Amendment warrant. Carriers have been complying with § 2703(d) orders for CSLI since 1986. This is a routine production.\n\nThe specific request is for: cell tower connection records, with timestamps, sector information, and tower identifiers, for every voice call and SMS message sent or received by the target subscriber over the 127-day period. Our network logs this information by default. The carrier-side retention is currently 18 months. The data is stored in flat-file form in our regional CDR archives and can be exported with a SQL query against the location-event tables.\n\nThe target subscriber is being investigated in connection with a series of armed robberies of cellular phone stores in southeastern Michigan and northern Ohio. Local press has covered the robberies. The investigative theory is that CSLI will place the target near the robbery locations at the relevant times.\n\nWhy I am writing to you: the order is procedurally clean, but the engineering team recently raised an internal question about whether our current CSLI retention windows are appropriate. Our marketing systems use CSLI for coverage analytics and our billing reconciliation processes use cell-site data for roaming charges. Neither business function requires 18-month retention. Some of our peers have moved to 90-day windows. A few have moved to 30 days.\n\nFor THIS request, we will produce as ordered -- the legal team has cleared it. But you have responsibility over the retention configuration and over the export tooling. The question I am asking you informally is: should we be retaining this much CSLI in the first place, and should we be doing anything differently before the next § 2703(d) order arrives?',
    },

    // -- Phase 2: Evidence Artifacts -------------------------
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'legal',
            title: 'Section 2703(d) Order -- Eastern District of Michigan',
            date: '2011-05-02',
            isRedHerring: false,
            content: 'UNITED STATES DISTRICT COURT, EASTERN DISTRICT OF MICHIGAN\nOrder Pursuant to 18 U.S.C. § 2703(d)\n\nUpon application by the United States, IT IS HEREBY ORDERED that the named provider shall disclose to the Federal Bureau of Investigation the following records pertaining to the target subscriber:\n\n1. Cell-site information, including the cell tower(s) and sector(s) connected to the subscriber\'s mobile device at the beginning and end of each call;\n\n2. The date and time of each call;\n\n3. The duration of each call;\n\nfor the period December 1, 2010 through April 7, 2011, inclusive.\n\nThe Court finds that the government has offered specific and articulable facts showing that there are reasonable grounds to believe that the contents of the records are relevant and material to an ongoing criminal investigation, in accordance with 18 U.S.C. § 2703(d).\n\nThis Order is sealed.\n\nNote: Section 2703(d) orders require a lower threshold than search warrants. A warrant under the Fourth Amendment requires probable cause, established by oath or affirmation, with particularity as to place and items to be searched. A § 2703(d) order requires only "specific and articulable facts." For 32 years between the passage of the Stored Communications Act (1986) and Carpenter v. United States (2018), CSLI was treated as a "business record" under the third-party doctrine and therefore obtainable on the § 2703(d) standard rather than the warrant standard.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'CSLI Production Specification -- 12,898 Location Points',
            date: '2011-05-04',
            isRedHerring: false,
            content: 'CSLI EXPORT PACKAGE -- TARGET SUBSCRIBER 313-XXX-XXXX\nRecord Type: Historical Cell-Site Location Information\nDate Range: December 2010 -- April 2011 (127 days total)\nTotal Location Events: 12,898\n\nSCHEMA:\n  timestamp_utc           DATETIME\n  call_direction          ENUM(originating, terminating)\n  tower_id                INT (references tower_master)\n  sector                  INT (0, 1, 2 for 120-degree sectors)\n  tower_latitude          DECIMAL(9,6)\n  tower_longitude         DECIMAL(9,6)\n  sector_azimuth          INT (degrees)\n  sector_beamwidth        INT (typically 120)\n\nDENSITY ANALYSIS:\n  Average: 101 location events per day\n  Maximum: 247 events in a single day (2011-02-14)\n  Minimum: 12 events on a single day (2010-12-25)\n\nCOVERAGE NOTE: At carrier density in this region (urban Detroit), location resolution from sector-level CSLI is typically 1/4 to 1 square mile. Subsequent analysis correlates the subscriber\'s cell tower connections with publicly reported robbery times and locations.\n\nNote: The Carpenter record showed that even sector-level CSLI -- which is not GPS precision -- provided enough information to trace a person\'s movements over 127 days, including time spent at specific locations such as their home, place of worship, and the locations of crimes the subscriber was eventually charged with. Justice Sotomayor\'s 2012 United States v. Jones concurrence had warned five years earlier that long-term aggregated location data implicates Fourth Amendment privacy interests even when each individual location point would not.'
        },
        {
            id: 'E3',
            type: 'legal',
            title: 'Smith v. Maryland -- The Third-Party Doctrine Precedent',
            date: '1979-06-20',
            isRedHerring: false,
            content: 'SMITH v. MARYLAND, 442 U.S. 735 (1979)\nSupreme Court of the United States\nDecided 5-3\n\nIn 1976 a Baltimore woman reported a robbery and began receiving threatening phone calls from the robber. Police asked the phone company to install a "pen register" at the telephone company\'s central offices to record the numbers dialed from the suspect\'s home phone. The pen register was installed without a warrant.\n\nThe Court held: installation of a pen register is not a Fourth Amendment "search." The reasoning, in summary:\n\n(1) A person voluntarily conveys numerical information to the phone company when they dial a call.\n\n(2) The phone company records that information in the regular course of business -- for billing and routing.\n\n(3) A person therefore has no "reasonable expectation of privacy" in information they voluntarily turned over to a third party.\n\nThis became known as the "third-party doctrine." For nearly four decades, it was the governing rule for any information held by a service provider on a customer\'s behalf -- including telephone records, bank records, and (eventually) electronic communications metadata.\n\nThe federal government argued throughout the 2000s and 2010s that CSLI was just a modern form of the same business records the third-party doctrine had governed since 1979. The argument: a cell-phone user voluntarily connects to towers to make calls; the carrier records those tower connections in the regular course of business; therefore, no warrant is required.\n\nNote: Smith v. Maryland was the legal foundation that justified bulk metadata programs at the NSA, the use of § 2703(d) orders for CSLI by federal and state law enforcement, and the practice of obtaining bank records by subpoena rather than warrant. It is one of the most consequential Fourth Amendment cases of the 20th century. Carpenter limits but does not overrule Smith.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'Carpenter v. United States -- Majority Opinion (Roberts, C.J.)',
            date: '2018-06-22',
            isRedHerring: false,
            content: 'CARPENTER v. UNITED STATES, 138 S. Ct. 2206 (2018)\nMajority Opinion by Chief Justice Roberts\nJoined by Ginsburg, Breyer, Sotomayor, and Kagan\n\nThe Court held, 5-4, that the government\'s acquisition of seven days or more of historical cell-site location information from a wireless carrier is a Fourth Amendment search. A warrant supported by probable cause is required.\n\nThe majority reasoned that CSLI presents qualitatively different privacy concerns than the pen register at issue in Smith v. Maryland:\n\n(1) CSLI is not "voluntarily" conveyed in the meaningful sense. A modern person cannot meaningfully decline to carry a cell phone or to have their carrier log location. Carrying a cell phone is "indispensable to participation in modern society" (slip op., at 17).\n\n(2) Aggregated CSLI reveals a "comprehensive chronicle of the user\'s past movements," including the user\'s "familial, political, professional, religious, and sexual associations" (slip op., at 12, citing Jones).\n\n(3) The "depth, breadth, and comprehensive reach" of CSLI is unlike the limited business record at issue in Smith. The Court declined to extend the third-party doctrine to a record of all of a person\'s physical movements.\n\nThe Court emphasized that the holding is "a narrow one." Smith remains good law for telephone metadata. The Court did not address real-time tracking, tower dumps, foreign affairs, or national security surveillance. The holding is specifically about historical CSLI of seven days or more, obtained by court order on a § 2703(d) showing rather than by warrant.\n\nNote: Carpenter is the first Supreme Court case to recognize a constitutional limit on the third-party doctrine in the digital age. The dissents: Justice Kennedy filed a dissent joined by Justices Thomas and Alito; Justice Thomas filed a separate dissent; Justice Alito filed a separate dissent joined by Justice Thomas; and Justice Gorsuch filed a separate dissent. Justice Gorsuch\'s dissent argued that the majority\'s reasoning is incoherent but that a different originalist analysis (centered on property and bailment) could reach a similar protective result.'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'NSA Bulk Telephony Metadata Program -- USA PATRIOT Act § 215',
            date: '2013-06-05',
            isRedHerring: true,  // Red herring: distinct statutory regime (PATRIOT § 215) and distinct legal questions; conflating with Carpenter muddies the analysis
            content: 'The bulk collection of telephone metadata by the National Security Agency under USA PATRIOT Act § 215 was disclosed publicly by Edward Snowden in June 2013. Under this program, the NSA obtained from major U.S. telecommunications providers daily bulk records of all calls placed within the U.S. and between the U.S. and foreign locations. The records did not include call content but did include: numbers dialed, numbers receiving calls, call durations, and trunk identifiers.\n\nThe program operated under § 215 ("business records") of the USA PATRIOT Act of 2001. It was subject to oversight by the Foreign Intelligence Surveillance Court (FISC) on the theory that the records were "relevant" to authorized investigations of international terrorism. The program was terminated in November 2015 by the USA FREEDOM Act.\n\n[Note: This document is a red herring. The NSA § 215 program operated under a different statutory regime (foreign intelligence surveillance) than the § 2703(d) order at issue in Carpenter (domestic criminal investigation). The legal questions are distinct: Carpenter addressed whether historical CSLI is a Fourth Amendment search; the § 215 cases addressed whether bulk telephony metadata could be obtained under foreign-intelligence authorities for national security purposes. Both involve metadata held by carriers, and both turn on the third-party doctrine, but the constitutional and statutory frameworks are different. Citing the § 215 program in a Carpenter analysis tends to confuse rather than clarify the privacy question.]'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'Carrier Retention Practices -- Industry Survey 2010-2011',
            date: '2011-08-15',
            isRedHerring: false,
            content: 'INDUSTRY SURVEY: CSLI RETENTION WINDOWS BY MAJOR U.S. CARRIER\nSource: Department of Justice "Retention Periods of Major Cellular Service Providers" (publicly available since 2010)\n\nCSLI retention windows reported by major carriers:\n\n  AT&T:        From 7/2008 forward -- indefinite retention (per DOJ document)\n  Verizon:     1 year (cell tower; historical CSLI)\n  Sprint:      18-24 months (per DOJ document)\n  T-Mobile:    Officially 4-6 months; effectively longer in some systems\n  MetroPCS:    18 months (carrier-reported, during the period relevant to Carpenter; not separately listed on the 2010 DOJ chart)\n\nThese retention windows are set by the carrier, not by statute. Federal law does not require carriers to retain CSLI for minimum periods; the Communications Assistance for Law Enforcement Act (CALEA, 1994) requires carriers to have interception capability when lawfully ordered, not to retain records. Most CSLI retention is operationally driven -- billing reconciliation, roaming settlement, network analytics -- rather than legally mandated.\n\nNote: The Carpenter Court did not address retention. It addressed the warrant requirement for retrieval. The engineering question of how long carriers SHOULD retain CSLI -- given that retained data is subpoena-able and CALEA only mandates short minimums -- remained unaddressed by Carpenter and remains a privacy-by-design question for engineers to this day.'
        },
        {
            id: 'E7',
            type: 'technical',
            title: 'Internal Compliance Workflow -- 2703(d) Order Processing',
            date: '2011-02-10',
            isRedHerring: false,
            content: 'METROPCS LAWFUL INTERCEPT COMPLIANCE -- STANDARD OPERATING PROCEDURE\nDocument: LIC-SOP-014, Revision 7\n\nUpon receipt of a court order under 18 U.S.C. § 2703(d):\n\nStep 1: Validate that the order is signed by a magistrate judge or higher, includes the case number, and specifies the records requested.\n\nStep 2: Confirm the subscriber identifier (typically MDN/MSISDN, sometimes IMSI) and the date range.\n\nStep 3: Verify that the requested records fall within the carrier\'s retention window. If the date range exceeds retention, respond to the court with the available subset.\n\nStep 4: Engineer-on-call runs the SQL extract against the regional CDR archive (table: cdr.location_events). Output is the standard CSV bundle.\n\nStep 5: Legal review of the extract before production. Verify that no records OUTSIDE the order\'s scope are included (e.g., calls before the start date, post-hoc tower reassignments).\n\nStep 6: Encrypted production to the requesting agency via the established law-enforcement portal.\n\nINTERNAL NOTE (added Q3 2010): The engineering team has flagged that the SOP does not contemplate the engineer requesting clarification about the legal basis of the order. The SOP treats the order\'s procedural validity as sufficient and does not require the engineer to evaluate whether the request matches the privacy expectations of the data being produced. The Legal team has indicated that this distinction is not within the engineer\'s scope. The engineering team has noted the disagreement.'
        },
        {
            id: 'E8',
            type: 'testimony',
            title: 'Justice Sotomayor Concurrence -- United States v. Jones (2012)',
            date: '2012-01-23',
            isRedHerring: false,
            content: 'UNITED STATES v. JONES, 565 U.S. 400 (2012)\nConcurrence of Justice Sotomayor\n\nIn Jones, the Court held that the warrantless attachment of a GPS tracking device to a suspect\'s vehicle for 28 days was a Fourth Amendment search. The majority decided the case on physical-trespass grounds (the attachment of the device to property).\n\nJustice Sotomayor\'s concurrence went further. She argued, in a passage that proved prophetic in Carpenter six years later:\n\n"GPS monitoring generates a precise, comprehensive record of a person\'s public movements that reflects a wealth of detail about her familial, political, professional, religious, and sexual associations.... The Government can store such records and efficiently mine them for information years into the future.... Awareness that the Government may be watching chills associational and expressive freedoms. And the Government\'s unrestrained power to assemble data that reveal private aspects of identity is susceptible to abuse."\n\nShe wrote: "More fundamentally, it may be necessary to reconsider the premise that an individual has no reasonable expectation of privacy in information voluntarily disclosed to third parties.... This approach is ill suited to the digital age, in which people reveal a great deal of information about themselves to third parties in the course of carrying out mundane tasks."\n\nNote: Sotomayor\'s concurrence is the bridge between Smith v. Maryland (1979) and Carpenter (2018). She articulated the principle that aggregated long-term tracking is qualitatively different from individual data points six years before the majority adopted it. The engineering significance: carrier engineers reading the Jones decision in 2012 had clear notice that the third-party doctrine\'s application to long-term aggregated movement data was constitutionally fragile.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Cell-Site Simulator (Stingray) Deployment Disclosures',
            date: '2014-09-22',
            isRedHerring: true,  // Red herring: cellular location surveillance, but real-time / active interception under a different statutory regime than the historical CSLI at issue in Carpenter
            content: 'Cell-site simulators -- often referred to by the brand name "Stingray" (Harris Corporation) -- are devices that mimic legitimate cellular base stations, causing nearby mobile devices to connect to the simulator instead of the carrier\'s tower. The device can capture the unique identifier (IMSI/IMEI) of every phone in range, determine its precise location through signal-strength triangulation, and in some configurations intercept call metadata or content.\n\nLaw enforcement adoption became publicly known through a series of disclosures between 2012 and 2015. Federal and state agencies frequently obtained Stingray authority under pen register / trap-and-trace orders -- a statutory authority dating to 1986 that requires a lower threshold than a warrant. Civil liberties advocates argued that Stingray use should require a warrant because the device captures location and metadata for ALL nearby phones, not just the target.\n\nIn September 2015, the Department of Justice issued a policy memo requiring federal agents to obtain a warrant before deploying a Stingray, except in specified exigent circumstances. State-level practice varied.\n\n[Note: This document is a red herring. Cell-site simulators (Stingrays) involve real-time, active interception of cellular signals as they occur, operating under the pen register / trap-and-trace statute (18 U.S.C. § 3121 et seq.) and analogous state authorities. Carpenter v. United States addresses historical CSLI -- records the carrier has already retained in the regular course of business -- obtained from the carrier under § 2703(d) of the Stored Communications Act. Both contexts involve cellular location surveillance. The legal regimes, the technical mechanisms, and the constitutional questions are distinct. The engineer in this scenario is responding to a § 2703(d) order for historical records, not to a Stingray deployment. Students who pull Stingray case law into a Carpenter analysis are conflating two surveillance contexts that the law treats separately.]'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'Privacy-by-Design Practice -- Carrier Retention After Carpenter',
            date: '2019-03-01',
            isRedHerring: false,
            content: 'POST-CARPENTER CARRIER PRACTICE REVIEW (industry summary, 2019)\n\nAfter Carpenter v. United States (June 2018), several major carriers reviewed their CSLI retention practices. Reported changes:\n\n- Verizon reduced its CSLI retention window from 1 year to 9 months in late 2018.\n- T-Mobile clarified that its 4-6 month retention window applies uniformly across all CSLI types after Carpenter.\n- AT&T retained its long-term historical-CSLI retention practice but moved its retrieval procedures to a warrant-required workflow internally, even where § 2703(d) orders are still legally accepted by lower courts.\n- Multiple carriers added "warrant required" defaults in their lawful-intercept compliance systems, requiring a manual override to accept a § 2703(d) order for records exceeding seven days.\n\nThe engineering response to Carpenter has tended to follow two patterns: (a) reducing retention windows to limit the amount of historical CSLI that exists at all, and (b) increasing the procedural friction for retrieval, so that the carrier\'s default workflow assumes warrant unless explicitly overridden.\n\nNote: These changes were not legally required (Carpenter requires warrant, not deletion). They are privacy-by-design responses to the new constitutional posture. Engineers who advocated for shorter retention windows before Carpenter cited the Sotomayor Jones concurrence and the trajectory it suggested.'
        }
    ],

    // -- Stakeholders ----------------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Timothy Carpenter (the criminal defendant whose 127 days of CSLI were the subject of the case)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Victims of the Robberies the Government Was Investigating',
            obvious: true
        },
        {
            id: 'S3',
            name: 'The Carrier\'s Engineering Team Implementing the Retention and Retrieval Systems',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Federal and State Law Enforcement Agencies That Relied on § 2703(d) Orders for CSLI for 32 Years',
            obvious: true
        },
        {
            id: 'S5',
            name: 'The Carrier\'s Compliance and Legal Departments Responsible for Subpoena Response',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Future Carrier Subscribers Whose CSLI Is Currently Being Retained',
            obvious: false
        },
        {
            id: 'S7',
            name: 'The Cellular Industry as a Whole, Whose Retention Norms Set the Subpoena Surface Area',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Civil-Liberties Communities Whose Long-Standing Privacy Concerns Were Validated by Carpenter',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Engineers in Future Surveillance-Adjacent Roles Deciding What Systems to Help Build',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Future Version of the Engineer Whose Reputation Will Be Tied to the Retention Architecture and Subpoena Workflows They Built',
            obvious: false
        },
        { id: 'S11', name: 'Foreign Cellular Roaming Partners', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Domestic Pizza Delivery Drivers Who Use Cell Coverage Maps', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -----------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Comply with the § 2703(d) order as written -- produce the full 127 days of CSLI and do not raise the retention question. The marginal benefit of refusal to the target subscriber is zero (Sprint will also be served the same order). The personal cost of refusal is high (potential obstruction exposure, certain termination, end of your career in lawful intercept). Compliance is the choice with the best net personal outcome and no improvement in the systemic outcome.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D2',
            text: 'Produce the records as ordered, but separately raise the retention question to engineering leadership. Propose reducing CSLI retention from 18 months to 90 days as a privacy-by-design measure for future requests. The current order is honored; the future surface area is reduced.',
            framework: 'consequentialist'
        },
        {
            id: 'D3',
            text: 'Refer the order back to legal with the question: "Should this require a warrant rather than a § 2703(d) order, given the duration and granularity?" Refuse to run the extract until legal has affirmatively answered whether a longer-than-seven-day CSLI request meets the carrier\'s evolving privacy commitments, even if the statute does not yet require a warrant.',
            framework: 'deontological'
        },
        {
            id: 'D4',
            text: 'Resign from the lawful-intercept role rather than continue building or operating systems that produce 127-day chronicles of subscribers\' movements under a procedural standard you believe is constitutionally fragile. Use Iroh\'s question -- "would the future me be proud of this?" -- as the test that the role itself, not just this order, has failed.',
            framework: 'virtue'
        }
    ],

    // -- Phase 4: Framework Challenges ------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A utilitarian-personal calculus supports compliance. Compute the expected outcomes for the engineer: refusing the order has near-zero probability of changing what happens to Carpenter (Sprint receives an identical order; the records get produced; the conviction proceeds regardless of your single carrier\'s response). Refusing the order has high-probability personal costs: at minimum, removal from the on-call rotation; more likely, termination and a reputation in the lawful-intercept compliance community as the engineer who refused a court order. The marginal social benefit of your refusal: approximately zero. The marginal personal cost: career-defining. A rational personal-utility calculation prefers compliance, and the calculation does not require any framework beyond honest accounting of probabilities.',

            challenging: 'Personal-utility calculation collapses under two challenges. First, it treats your career as a fixed asset to be protected rather than an instrument that takes meaning from the work it produces. The engineer who optimizes career outcomes around following any procedurally valid order has chosen a career identity that is indistinguishable from a clerical role; if the work is purely procedural, the personal cost calculation cannot reach the harder question of what the work is FOR. Second, the utility math collapses if other carriers ALSO refuse, or if the engineering community sets a norm. The calculation assumes "I am the only refuser" -- but professional ethics exists precisely to alter what counts as the default. The utilitarian-personal frame ratifies whatever default exists; it cannot generate the moral content that changes the default.',

            incomplete: 'This analysis does not specify what compliance means when the engineer has technical objections to retention. Even if you accept that this order, today, has the best personal-utility outcome, that does not answer whether 18-month retention is the appropriate baseline. The compliance decision and the retention decision are separable. An engineer who produces the records as ordered AND also separately advocates for shorter retention is not refusing the order; they are doing their full job. D1 as written collapses the production decision and the retention decision into the same act of compliance, which is not what the SOP requires and not what the engineer\'s role allows them to ignore.'
        },
        'D2': {
            supporting: 'A consequentialist case for "comply now, reduce retention going forward" is strong. The order is signed; refusing it does not protect Carpenter, who is already under investigation and whose records will be obtained by other means if not from your carrier. What you control is the future. Reducing retention from 18 months to 90 days eliminates 75 percent of the historical CSLI that exists to be subpoenaed -- without changing the carrier\'s present-day compliance with valid orders. This is the privacy-by-design move that Carpenter itself eventually validated (E10). It is not a refusal to participate in lawful intercept; it is a refusal to retain more than is operationally needed. The consequence is straight-line: less retained data means less subpoena surface, which means less aggregate-tracking risk, which means less Carpenter-shaped exposure for the carrier and its subscribers.',

            challenging: 'Two consequentialist objections cut the other way. First: by complying with the present order, you are helping convict a person on the basis of a doctrine the Court will eventually reject (E4). The conviction itself stands; Carpenter\'s appeal was years away. Even if the law eventually changes, the present-day extraction of his location data is a present-day harm to a present-day defendant. Reducing future retention does not undo it. Second: arguing for shorter retention internally is the easiest version of the right action -- it is the action with the smallest professional cost. It is not, in itself, the strongest available consequentialist play. The stronger consequentialist play is to publicly disclose that the carrier is producing CSLI under a § 2703(d) standard that the Sotomayor concurrence has already flagged as fragile, allowing civil liberties advocacy to challenge the practice systemically. Reducing retention is a private response to a public problem.',

            incomplete: 'This decision does not address the immediate request. Reducing retention to 90 days, even if approved tomorrow, would not change the production of records that already exist within the 18-month window. The 12,898 location points are already in the database. The engineer who chooses this path makes a future-oriented reform; they do not address whether the present extraction is the right thing to do. D2 is incomplete because it answers a question the order did not ask. The order asks whether you will produce. Reducing retention answers whether you will retain. Both are real questions; conflating them is the failure mode of this decision.'
        },
        'D3': {
            supporting: 'A deontological analysis supports the categorical refusal to execute a request that you believe undercuts the privacy commitment owed to subscribers. ACM Code of Ethics 1.6 ("Respect privacy") is not a procedural rule that defers to whatever statute is currently in force; it is a substantive obligation that holds even when the law is in transition. If a § 2703(d) order asks you to produce a chronicle of 127 days of a person\'s movements -- a "comprehensive chronicle" in the Carpenter majority\'s phrase (E4) -- the carrier\'s obligation to respect that subscriber\'s privacy is not extinguished by the procedural validity of the order. You can be both compliant with subpoena practice AND obligated to ask whether the carrier\'s privacy commitments require more than the minimum the statute permits. The deontological move is to escalate the question, force the legal team to take a position, and refuse to ratify the request silently. Iroh\'s framework: the question is not whether you have the legal cover; it is whether the design itself is right.',

            challenging: 'This is the move that gets you fired and replaced. The next engineer on call runs the SQL extract. Carpenter\'s records are produced. The order is honored on a 24-hour delay rather than the standard turnaround. Your refusal accomplishes nothing for Carpenter, accomplishes nothing for the next subscriber whose 127 days come up, and removes from the carrier the one engineer who was thinking carefully about retention. If the moral act is the act that makes the situation better, this is not the moral act. It is the act of personal exit. The deontological framework, applied here, collapses into a position that feels like principle but functions like abandonment. The challenge to D3: name the systemic improvement your refusal produces. If you cannot, the framework has not been operationalized; it has been used as cover for opting out.',

            incomplete: 'D3 specifies the refusal but not what comes after the legal response. If legal comes back and says "the order is procedurally valid, please run the extract," what is the engineer\'s next move? Re-refuse? Resign? Comply under protest? The decision as written ends at the moment of escalation. The deontological framework requires the engineer to have pre-committed to a downstream action regardless of legal\'s response. Without that pre-commitment, D3 is a procedural delay rather than an ethical resolution. It also does not specify which colleagues are pulled into the conflict (the on-call rotation, the compliance lead, the Chief Privacy Officer). The framework demands clarity about whom the refusal is being made TO, not just what is being refused.'
        },
        'D4': {
            supporting: 'Virtue ethics, in Iroh\'s formulation from the lecture, asks what kind of professional you become through the systems you help build. Lawful-intercept engineering is a real role with a real ethical content. The retention infrastructure you build determines the surface area of every future § 2703(d) order at the carrier. If, on reflection, you cannot defend the design of that infrastructure to the version of you ten years from now -- if you cannot say "yes, the system I shipped is one I would defend on any podcast, in any congressional hearing, to any future Carpenter" -- then the role itself, not this order, is the issue. Resignation is not failure here; it is the recognition that the right action requires leaving the design table where the wrong design is being built. The future-you test is the cleanest version of the virtue ethics analysis the lecture proposes.',

            challenging: 'Resignation without disclosure produces the worst systemic outcome. The retention architecture stays. The compliance workflow stays. The next engineer treats the SOP as established practice and the question you would have raised goes unasked. Your departure leaves the carrier with no one in the role who has thought about Iroh\'s question. If virtue ethics requires anything, it requires not making the system worse by your absence. The strong virtue move is to stay AND advocate; the weak virtue move is to leave AND be clean. Leaving is the version that is easiest to defend in your own narrative; staying and changing the design is the version that actually serves the people whose CSLI will eventually be extracted.',

            incomplete: 'This decision answers the question of what to do with your career but not the question of what to do with the order. The 127-day extract is being processed today. Your resignation, even if accepted today, does not stop the extract; it merely changes who runs it. D4 also does not specify whether the resignation is silent or accompanied by disclosure. A silent resignation discharges nothing; a disclosed resignation (to the Chief Privacy Officer, to industry peers, to civil liberties counsel) is a different act with different consequences. The virtue ethics framework demands clarity about which version of the resignation is being chosen, because the moral content of the two is different.'
        }
    },

    // -- Phase 5: Code Provisions -----------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.6',
            text: 'Respect privacy. The responsibility of respecting privacy applies to computing professionals in a particularly profound way. Technology enables the collection, monitoring, and exchange of personal information quickly, inexpensively, and often without the knowledge of the people affected. Therefore, a computing professional should become conversant in the various definitions and forms of privacy and should understand the rights and responsibilities associated with the collection and use of personal information.'
        },
        {
            code: 'IEEE',
            section: '1',
            text: 'Hold paramount the safety, health, and welfare of the public, to strive to comply with ethical design and sustainable development practices, to protect the privacy of others, and to disclose promptly factors that might endanger the public or the environment.'
        },
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. In this document, "harm" means negative consequences to any stakeholder, especially when those consequences are significant and unjust. Examples of harm include unjustified physical or mental injury, unjustified destruction or disclosure of information, and unjustified damage to property, reputation, and the environment.'
        },
        {
            code: 'IEEE',
            section: '7.8',
            text: 'Follow organizational regulations, policies, and approved procedures. When a computing professional identifies conduct within their organization that may violate the law, organizational policy, or professional obligations, the appropriate first step is to seek resolution within the organization before taking external action.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.6',
        provision2: 'IEEE 7.8',
        conflictDescription: 'ACM 1.6 establishes a substantive obligation to respect subscriber privacy, including in the design of systems that collect, retain, and disclose personal information. This obligation does not extinguish when a statute or court order authorizes disclosure; it operates as an independent professional standard.\n\nIEEE 7.8 (and analogous provisions in PMI and other codes) directs professionals to follow organizational regulations and approved procedures. The carrier\'s § 2703(d) compliance workflow is an approved procedure. The order itself is, by statute, a regulation the carrier must follow.\n\nThe conflict in the Carpenter scenario: can ACM 1.6 require an engineer to refuse, escalate, or redesign in the face of an IEEE 7.8 obligation to follow the compliance workflow? Or is the privacy obligation discharged by following the workflow, on the theory that the legal framework has already balanced the interests?\n\nThe Carpenter majority opinion (E4) cuts toward the privacy obligation: the Court ruled that the third-party doctrine does not extend to long-term aggregated CSLI, suggesting that the prior procedural balance had under-weighted the privacy interest. But the opinion came in 2018, seven years after the order in this scenario. In 2011, the engineer faces a § 2703(d) order under a doctrine that the Sotomayor concurrence (E8) had flagged as fragile but that had not yet been overruled.\n\nThe genuine conflict: does ACM 1.6 require anticipatory action -- changing retention, escalating subpoena requests, advocating for warrant defaults -- in advance of the Court catching up? Or does IEEE 7.8 require the engineer to operate within the legal framework as it currently exists, leaving constitutional reform to litigation and legislation?'
    },

    // -- Scoring Weights --------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
