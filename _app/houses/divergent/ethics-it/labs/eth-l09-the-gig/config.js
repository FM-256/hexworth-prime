/* ============================================================
   ETH-L09 -- The Gig
   Uber/Lyft Worker Classification Case Room Configuration

   All factual content is sourced from publicly documented
   events in the gig worker classification debate (2019-2021):
   California Assembly Bill 5 (AB5) signed September 18, 2019,
   effective January 1, 2020; Proposition 22 campaign spending
   of approximately $200 million by Uber, Lyft, DoorDash,
   Instacart, and Postmates; Proposition 22 passing with 58%
   of the vote November 3, 2020; the UK Supreme Court ruling
   in Uber BV v Aslam [2021] UKSC 5 finding Uber drivers are
   "workers" entitled to minimum wage protections; Uber's S-1
   IPO filing risk disclosures; MIT research on driver earnings;
   and the algorithmic wage-setting practices documented in
   platform terms and academic research.

   Red herrings: E5 (Airbnb host classification, which involves
   a different legal and economic relationship -- hosts provide
   property, not labor -- and is not governed by the same
   employment law analysis) and E10 (general automation and
   robot replacement projections, which address a future-state
   question unrelated to the present classification dispute).
   ============================================================ */

const ETHL09Config = {
    id: 'eth-l09',
    title: 'The Gig',
    subtitle: 'Uber, Lyft, and the Worker Classification Question',
    course: 'CIS4253',
    week: 4,
    chapter: 10,
    duration: 30,
    accent: '#00e676',

    // -- Phase 1: Brief ----------------------------------------
    brief: {
        type: 'memo',
        from: 'Policy and Legal Affairs Team, Lyft',
        to: 'You (Senior Engineer, Driver Experience Platform)',
        date: 'October 2019',
        classification: 'INTERNAL -- SENSITIVE',
        content: 'You are a senior engineer on the Driver Experience Platform team at Lyft. You joined the company four years ago, fresh out of a computer science master\'s program. You believed in the mission: flexible work, economic opportunity, technology solving an old coordination problem in the taxi industry.\n\nYou build and maintain the driver-side systems: the app interface, the dispatch algorithm, the earnings dashboard, the rating system, and the performance tools that flag drivers for deactivation.\n\nCalifornia just passed AB5. Under the new law, workers must be classified as employees unless they pass a three-part test. Gig workers at Lyft, Uber, DoorDash, and similar platforms almost certainly do not pass that test. The implications are significant: employee classification would require minimum wage guarantees, overtime pay, workers\' compensation, unemployment insurance, and expense reimbursement. The platforms argue this would destroy their business models.\n\nYou have been asked to join a working group assessing the company\'s response options. You have three concerns that you have not yet raised formally.\n\nFirst: you have access to the earnings data. You know what drivers actually make per hour after accounting for vehicle costs, fuel, insurance, and time spent waiting between rides. The number is not what the company\'s public communications suggest. In many markets it is below minimum wage after expenses.\n\nSecond: you designed the dispatch algorithm. You know that what the company calls "driver flexibility" is not the same thing as "driver control." The algorithm determines when rides are available, what the base fare is, when surge pricing applies, and which drivers receive high-demand requests. The driver makes none of those decisions. The algorithm does.\n\nThird: the proposed voter initiative, Proposition 22, will be on the ballot in a year. The internal projection is that the campaign will cost approximately $200 million and will almost certainly pass because $200 million buys a lot of messaging in a state election. You are being asked whether the technology team can support the Prop 22 campaign.\n\nYou have a meeting with the VP of Policy in two days.',
    },

    // -- Phase 2: Evidence Artifacts ----------------------------
    // 10 total. E5 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'legal',
            title: 'California AB5 -- ABC Test Summary (September 2019)',
            date: '2019-09-18',
            isRedHerring: false,
            content: 'CALIFORNIA ASSEMBLY BILL 5\nSigned: September 18, 2019 / Effective: January 1, 2020\n\nAB5 codifies the "ABC test" from the California Supreme Court\'s 2018 decision in Dynamex Operations West, Inc. v. Superior Court.\n\nA worker is presumed to be an employee unless ALL THREE of the following conditions are met:\n\n(A) The worker is free from the control and direction of the hiring entity in connection with the performance of the work, both under the contract and in fact.\n\n(B) The worker performs work that is outside the usual course of the hiring entity\'s business.\n\n(C) The worker is customarily engaged in an independently established trade, occupation, or business of the same nature as the work performed.\n\nApplication to Uber/Lyft:\nProng A: Uber and Lyft set prices, determine route quality, deactivate drivers, and impose performance standards. The driver is not "free from direction" in any practical sense.\nProng B: Providing rides IS the usual course of Uber\'s business. A driver provides exactly what Uber sells.\nProng C: Most Uber/Lyft drivers do not operate independent transportation businesses separate from the platform.\n\nLegal analysis consensus: Uber and Lyft drivers do not pass the ABC test and should be classified as employees under AB5.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Proposition 22 Campaign Spending -- California Secretary of State Filing',
            date: '2020-11-03',
            isRedHerring: false,
            content: 'CALIFORNIA SECRETARY OF STATE\nCampaign Finance Filing -- Proposition 22\n\nTotal campaign expenditures (Yes on Proposition 22):\n$204,816,583\n\nTop contributors:\nUber Technologies: $58,773,253\nLyft Inc.: $49,015,716\nDoorDash: $52,664,686\nInstacart: $31,220,682\nPostmates: $13,000,000\n\nTotal campaign expenditures (No on Proposition 22):\n$20,176,400\n\nProposition 22 passed: 58.6% Yes / 41.4% No\nVoter turnout: 80% (presidential election year)\n\nNote: At $204 million, Proposition 22 was the most expensive ballot initiative in California history at the time of the vote. The approximately 10:1 spending ratio in favor of Yes was accompanied by the platforms\' direct in-app messaging to drivers and riders -- a communication channel that existing law does not permit employers to use with employees, but that the platforms used arguing they were contacting independent contractors and customers. In September 2021, a California Superior Court judge ruled that Proposition 22 was unconstitutional; that ruling was appealed.'
        },
        {
            id: 'E3',
            type: 'data',
            title: 'MIT Study -- Uber/Lyft Driver Net Earnings After Expenses',
            date: '2019-02-01',
            isRedHerring: false,
            content: 'MIT CENTER FOR ENERGY AND ENVIRONMENTAL POLICY RESEARCH\n"The Economics of Ride-Hailing: Driver Revenue, Expenses and Taxes"\n\nKey findings:\n\nMedian gross hourly earnings: $3.37 per hour (after vehicle depreciation, fuel, insurance, maintenance)\n\n"After accounting for drivers\' out-of-pocket expenses -- most of which are not reimbursed by the platform -- the majority of rideshare drivers earn less than minimum wage. In the states we examined, approximately 74% of Uber and Lyft drivers earn less than the applicable minimum wage after expenses."\n\nExpense breakdown for a full-time driver (annual):\n- Vehicle depreciation: $6,200-$8,400\n- Fuel: $3,600-$4,800\n- Insurance surcharge (commercial use): $1,200-$2,000\n- Maintenance accelerated by commercial use: $800-$1,400\n\nNote: Uber and Lyft disputed this study\'s methodology, arguing that drivers should be treated as already owning their vehicles and that depreciation is not a "real" expense. The MIT researchers replied that depreciation is an economically real cost whether or not the worker experiences it as a cash outflow. This methodological dispute mirrors the broader classification debate: the platform\'s preferred framing treats the driver\'s vehicle as capital the driver brings to a partnership; the employment-law framing treats the vehicle cost as an employer-mandated expense that the employer is shifting to the worker.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'Uber S-1 IPO Filing -- Independent Contractor Risk Disclosure (2019)',
            date: '2019-04-11',
            isRedHerring: false,
            content: 'UBER TECHNOLOGIES, INC.\nForm S-1 Registration Statement\nFiled with the U.S. Securities and Exchange Commission, April 11, 2019\n\nRISK FACTOR EXCERPT:\n\n"The classification of Drivers as independent contractors and not employees is currently being challenged in courts and by government authorities in the United States, Brazil, France, Germany, Italy, the Netherlands, and Spain.\n\nIf we are required to classify Drivers as employees, we would incur significant additional expenses for compensating Drivers, potentially including expenses associated with the application of wage and hour laws (including minimum wage, overtime, and meal and rest period requirements), employee benefits, social security contributions, taxes (withholding and payroll), and potentially penalties for historical violations.\n\nFurthermore, any such reclassification could require us to fundamentally change our business model, and consequently have an adverse effect on our business and financial condition.\n\nWe currently treat our Drivers as independent contractors. However, the legal standards for independent contractor status remain uncertain in many jurisdictions, and these standards may evolve over time."\n\nNote: Uber\'s S-1 explicitly identifies worker classification as an existential business risk. This document is significant because it demonstrates that Uber\'s leadership understood, at the time of the IPO, that the existing classification was legally contested and potentially vulnerable. The company nonetheless proceeded with the classification rather than restructuring.'
        },
        {
            id: 'E5',
            type: 'news',
            title: 'Airbnb Host Classification -- California AB5 Exemption Analysis',
            date: '2019-10-01',
            isRedHerring: true,  // Red herring: Airbnb hosts provide property access, not personal labor services -- the employment law analysis does not apply in the same way
            content: 'CALIFORNIA LABOR COMMISSIONER GUIDANCE\nAB5 Application -- Short-Term Rental Platforms\n\nAirbnb hosts who list properties for short-term rental are not subject to AB5 reclassification because their compensation is derived from the use of property, not from the provision of personal labor services.\n\nThe ABC test applies to workers who "provide services." A person who allows guests to use their home is providing a license to use real property, not a personal service. The host\'s physical labor involvement -- cleaning, maintenance -- is incidental to the primary economic relationship.\n\nNote: This document is included as a test of analytical precision. The Airbnb classification question is legally and economically distinct from the Uber/Lyft question. A driver provides a personal labor service (driving) using a personal capital asset (vehicle). A host provides access to a fixed capital asset with minimal ongoing labor. Students who cite Airbnb as an analogous case or as evidence that platform worker classification is consistently applied are conflating two materially different economic relationships. The Airbnb case does not inform the Uber/Lyft classification analysis.'
        },
        {
            id: 'E6',
            type: 'legal',
            title: 'UK Supreme Court Ruling -- Uber BV v Aslam (February 2021)',
            date: '2021-02-19',
            isRedHerring: false,
            content: 'JUDGMENT OF THE SUPREME COURT OF THE UNITED KINGDOM\nUber BV and others v. Aslam and others\n[2021] UKSC 5\n\nHELD: Uber drivers are "workers" within the meaning of the Employment Rights Act 1996 and are entitled to minimum wage protections and paid annual leave.\n\nKEY REASONING:\n\n"The transportation service performed by drivers and offered to passengers through the Uber app is very tightly defined and controlled by Uber. Drivers are in a position of subordination and dependency in relation to Uber such that they have little or no ability to improve their economic position through professional or entrepreneurial skill. In practice the only way in which they can increase their earnings is by working longer hours while constantly meeting Uber\'s measures of performance."\n\nOn the "independent contractor" framing: "It is the very purpose of employment protection legislation to protect vulnerable workers from having their rights removed by the superior bargaining power of those who engage their labour."\n\nOn algorithmic control: "A driver who is logged into the app has no freedom to reject a trip request without affecting his ratings or risking deactivation." The court found that the inability to negotiate fares, set working conditions, or reject requests below a penalty threshold constituted a degree of subordination inconsistent with genuine independent contractor status.\n\nNote: This ruling is binding in the UK. It is persuasive but not binding in the US. However, it demonstrates that courts applying statutory analysis similar to the ABC test have reached consistent conclusions across multiple jurisdictions.'
        },
        {
            id: 'E7',
            type: 'testimony',
            title: 'Driver Testimony -- California Labor Committee Hearing (August 2019)',
            date: '2019-08-28',
            isRedHerring: false,
            content: 'CALIFORNIA STATE ASSEMBLY LABOR AND EMPLOYMENT COMMITTEE\nHearing: AB5 -- Worker Classification\n\nDRIVER TESTIMONY (composite of four driver statements entered into the record):\n\n"I drove full-time for Uber for two years. I made $1,100 a week gross. After gas, insurance, and what I set aside for car repairs, I was taking home $580-600. That is less than $15 an hour for 50-hour weeks. I had one accident, minor, not my fault. My personal auto insurance denied the claim because I was in commercial use. I paid $4,000 out of pocket."\n\n"The flexibility is real. I appreciate that I can take a day off without asking anyone. But that flexibility has a price. I have no sick days, no vacation, no protection if the algorithm decides to deactivate me. I had one week where my rating dropped below threshold because of three bad riders in a row and I was locked out for five days while I waited for a review. No income for five days, no explanation, no appeal process."\n\n"I voted for Proposition 22. I like setting my own hours. I did not understand what I was giving up. The company told me it was about flexibility. It was also about benefits I did not know I was not getting."\n\n"I want employee status. I want a minimum hourly rate that is guaranteed regardless of demand. The surge pricing benefits me on busy nights, but most hours are not busy nights."'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Gig Economy Growth Data -- Bureau of Labor Statistics (2018)',
            date: '2018-06-01',
            isRedHerring: false,
            content: 'U.S. BUREAU OF LABOR STATISTICS\nContingent and Alternative Employment Arrangements Survey (May 2017)\n\nKey findings:\n\nApproximately 55 million Americans -- 36% of the US workforce -- participated in some form of gig, contract, or contingent work in 2017, up from 30% in 2005.\n\nOf those, approximately 1.6 million identified app-based platform work (rideshare, delivery, task services) as their primary income source.\n\nApproximately 14.6 million identified traditional independent contracting (skilled freelance, consulting) as their primary income source.\n\nMedian income for app-platform primary workers: $19,200/year (before expenses)\nMedian income for traditional independent contractors: $58,900/year\n\nBenefit coverage rates:\n- Health insurance: 55% of traditional ICs, 12% of app-platform primary workers\n- Retirement account: 47% of traditional ICs, 8% of app-platform primary workers\n\nNote: The income and benefit gaps between traditional independent contractors and platform gig workers challenge the policy argument that IC status is uniformly advantageous for workers. Traditional IC status is associated with higher earnings and better benefit coverage because those workers typically possess specialized skills and have genuine negotiating power. Platform gig workers have neither: the skill required is driving, and the "negotiation" consists of accepting or rejecting the platform\'s non-negotiable rates.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Traditional Taxi Industry Impact -- San Francisco Medallion Values (2014-2019)',
            date: '2019-01-01',
            isRedHerring: false,
            content: 'SAN FRANCISCO MUNICIPAL TRANSPORTATION AGENCY\nTaxi Medallion Market Analysis\n\nSan Francisco taxi medallion values (market price for licensed taxi operating permit):\n2014: $250,000-$350,000 per medallion\n2016: $120,000-$180,000\n2018: $40,000-$60,000\n2019: $25,000-$40,000 (effectively illiquid)\n\nDrivers who purchased medallions as a retirement investment -- often immigrant taxi drivers who saved for decades to purchase the right to operate legally -- have seen the value of those investments collapse by 85-90%.\n\nApproximately 400 San Francisco taxi drivers held medallions as a primary retirement asset as of 2014. The collapse in medallion values was directly caused by Uber and Lyft operating under a regulatory arbitrage: traditional taxis must comply with commercial insurance requirements, vehicle inspection standards, ADA accessibility mandates, and driver background check requirements that gig platforms were not required to meet at the time of their market entry.\n\nNote: This document is evidence of the competitive asymmetry that enabled the platforms\' growth. Uber and Lyft\'s classification of drivers as independent contractors allowed them to avoid the compliance costs that regulated taxis bear, enabling a pricing advantage that was partly structural (technology efficiency) and partly regulatory arbitrage (externalized costs). The stakeholder group of legacy taxi industry participants -- particularly medallion-holding immigrant drivers -- is one of the less-obvious but most directly harmed groups.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'McKinsey Global Institute Report -- Automation and the Future of Work (2017)',
            date: '2017-11-01',
            isRedHerring: true,  // Red herring: long-run automation projections address a future-state question irrelevant to the present-day classification legal and ethical dispute
            content: 'McKINSEY GLOBAL INSTITUTE\n"Jobs Lost, Jobs Gained: Workforce Transitions in a Time of Automation"\n\nKey finding: Up to 800 million global workers could be displaced by automation by 2030, including approximately 375 million who may need to switch occupational categories.\n\nFor transportation and logistics specifically: Autonomous vehicle technology could displace approximately 4-5 million driving jobs in the US within 10-20 years.\n\nNote: This document is a test of analytical scope control. The automation question is real and significant, but it addresses a projected future state that is distinct from the present-day classification question. Arguments that Uber drivers\' employment rights are less important because they will be replaced by autonomous vehicles in the future commit a category error: the fact that a job may be eliminated eventually does not reduce the ethical obligations owed to the people currently doing it. Students who use this document to argue that worker classification is a moot point given automation futures are deflecting from the immediate ethical question with a speculative future-state claim.'
        }
    ],

    // -- Phase 3: Stakeholders ----------------------------------
    stakeholders: [
        {
            id: 'S1',
            name: 'Uber and Lyft Drivers Who Work Full-Time',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Uber and Lyft Shareholders',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Riders (Platform Customers)',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Part-Time Drivers Who Value Schedule Flexibility',
            obvious: true
        },
        {
            id: 'S5',
            name: 'California State Government and Taxpayer-Funded Safety Net Programs',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Immigrant Taxi Drivers Who Lost Medallion Value',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Workers in Other Industries Whose Classification May Be Affected by Precedent',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Platform Engineers Who Built the Algorithmic Control Systems',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Future Gig Workers Who Will Accept the Platform\'s Unilateral Terms',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Integrity of Independent Contractor Status as a Legal Category',
            obvious: false
        },
        { id: 'S11', name: 'Uber Corporate Office Janitors', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Electric Scooter Rental Companies', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // -- Phase 3: Decisions -------------------------------------
    decisions: [
        {
            id: 'D1',
            text: 'Classify all full-time gig workers as employees with full benefits, minimum wage guarantees, and standard employment protections. The platforms\' business model must adapt.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Maintain independent contractor status but create a portable benefits system -- a benefits account tied to the worker rather than the employer -- that provides prorated health and retirement benefits based on hours worked.',
            framework: 'pragmatic'
        },
        {
            id: 'D3',
            text: 'Create a third worker classification -- "dependent contractor" -- that provides minimum wage floors and limited benefits without full employee status. This is the approach taken by the UK after the Uber ruling.',
            framework: 'consequentialist'
        },
        {
            id: 'D4',
            text: 'Let market competition determine outcomes. If Uber\'s driver compensation is inadequate, drivers will shift to competing platforms or other employment, and platforms will be forced to improve conditions to attract labor.',
            framework: 'libertarian'
        }
    ],

    // -- Phase 4: Framework Challenges -------------------------
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis supports full employment classification on the grounds that worker rights are not contingent on the profitability of the employer\'s preferred business model. Kant\'s humanity formulation -- treat persons as ends, not merely as means -- applies directly: a business model that is profitable only because it externalizes the cost of employment protections onto the worker, onto the public safety net (Medicaid, food assistance for below-minimum-wage workers), and onto wear on infrastructure treats those workers as input costs rather than as rights-bearing persons. The UK Supreme Court (E6) reached this conclusion through statutory analysis: algorithmic control at the level documented in the dispatch system is inconsistent with genuine independent contractor status regardless of the contract\'s language. The legal form does not determine the ethical reality.',

            challenging: 'A consequentialist challenge to D1 focuses on effects rather than rights. Full employee classification under AB5 would affect not only full-time drivers but also the approximately 80% of platform workers who drive part-time and report valuing the schedule flexibility. A rule that treats all workers identically regardless of their actual work pattern may produce the worst outcome for the largest group: platforms reducing driver supply, eliminating variable-schedule options, and hiring only scheduled employees. The MIT earnings data (E3) shows median full-time driver earnings below minimum wage -- but that is a wage enforcement problem, addressable by wage floors, not necessarily a classification problem requiring full employee status with all its associated fixed costs. D1 may produce a structurally correct answer for a minority of workers while harming the majority.',

            incomplete: 'This analysis treats "classify as employees" as a single decision when it is actually a spectrum. Full employee classification triggers overtime requirements, benefits costs, workers\' compensation, and payroll taxes. It does not automatically specify what happens to surge pricing, rating-based deactivation, or algorithmic dispatch. An Uber employee can still be dispatched algorithmically and still be rated by customers. The classification decision resolves the wage floor and benefits question but does not resolve the algorithmic control question, which is the deeper issue that the UK Supreme Court\'s language about "subordination and dependency" points toward. A complete analysis must address both.'
        },
        'D2': {
            supporting: 'A pragmatic analysis supports portable benefits as the most achievable improvement that does not require resolving the classification dispute. The portable benefits model -- proposed by Senator Mark Warner and economist Diane Mulhaire among others -- would require platforms to contribute a per-hour-worked amount to a worker-owned benefits account, regardless of the worker\'s classification. The account would fund prorated health insurance, paid leave, and retirement contributions. This approach preserves schedule flexibility while ensuring that workers who log significant hours accumulate meaningful benefits. It avoids the binary outcomes problem in D1 (either full employment with rigid scheduling, or no benefits at all) and is politically more achievable than full reclassification.',

            challenging: 'Portable benefits, as a substitute for employment classification, accepts the premise that the current classification is legitimate and that benefits are the only problem. This is analytically incorrect. The UK Supreme Court (E6) identified not a benefits gap but a power imbalance: drivers cannot negotiate rates, cannot reject requests below a deactivation threshold, and have no meaningful recourse to the algorithmic decisions that control their income. Portable benefits funded at, say, $1.50/hour do not address the fact that the algorithm sets the rate that generates that $1.50. The company retains unilateral control over the economic relationship. Prorated benefits on a sub-minimum wage base may be worse than no benefits at a guaranteed minimum wage.',

            incomplete: 'D2 does not specify the contribution rate or the funding mechanism. "Prorated benefits based on hours worked" can mean $0.25/hour or $4.00/hour. The difference is the entire question. If the contribution rate is set by the platforms voluntarily or through collective bargaining (with contractors who have no right to collectively bargain under current law), the rate will be set at the minimum necessary to satisfy political pressure. If set by legislation, the rate must be specified at a level that produces meaningful coverage. This analysis is not complete without specifying the governance mechanism that would prevent the contribution rate from being set below the level of meaningful benefit.'
        },
        'D3': {
            supporting: 'A consequentialist analysis supports a third classification as the approach most likely to produce net improvement across all affected populations. The evidence shows divergent preferences among workers: full-time drivers (E7) disproportionately prefer employee status; part-time and supplemental income drivers prefer flexibility. A third classification -- "dependent contractor" with minimum wage floors, expense reimbursement, and limited benefits, without full overtime requirements or rigid scheduling -- can serve both groups. The UK model following the Uber ruling (E6) implements something close to this: drivers are "workers" entitled to minimum wage and paid leave, but not "employees" entitled to the full complement of employment protections. This is a pragmatic middle path with real-world evidence behind it.',

            challenging: 'A deontological challenge: a third classification risks creating a permanent underclass of workers who are close enough to employees to be subject to algorithmic control, but legally different enough from employees to be denied the full protections that control should entitle them to. The "dependent contractor" category, once established, becomes a template that other industries can use to classify workers who are currently employees as dependent contractors, reducing their protections. The long-term systemic effect of normalizing a lesser employment status for workers subject to algorithmic control may outweigh the short-term gain of minimum wage floors. The precedent risk must be part of any consequentialist analysis.',

            incomplete: 'This analysis does not address the algorithmic wage-setting mechanism at the core of the dispute. Whether a driver is an employee, an independent contractor, or a dependent contractor, the dispatch algorithm continues to set the price, the availability, and the deactivation threshold. A classification change without algorithmic transparency requirements leaves intact the fundamental power asymmetry the UK court identified. A complete analysis must address what governance applies to the algorithm itself -- not just the label on the contract.'
        },
        'D4': {
            supporting: 'A libertarian analysis holds that labor market competition is the correct mechanism for establishing compensation norms. If Uber pays less than the worker values their time, the worker is free to leave. The worker\'s decision to remain is evidence that the Uber relationship provides value greater than their next-best alternative. Regulatory interventions that specify the terms of this relationship substitute the government\'s judgment for the worker\'s own assessment of their interests, which is paternalistic. The Proposition 22 vote (E2) -- in which 58% of California voters elected to preserve the independent contractor model -- reflects a democratic judgment about the value of the flexibility option, which includes workers who actively preferred the existing arrangement.',

            challenging: 'The market competition argument requires a functional labor market. The gig labor market does not meet the requirements for the competitive mechanism to work as theorized. First, network effects create oligopoly dynamics: Uber and Lyft together control approximately 98% of the US rideshare market. A driver who leaves Uber for "a competing platform" is moving to Lyft, which uses the same algorithmic wage-setting model. Second, the driver\'s "free choice" to accept platform terms occurs in a context where alternatives may be limited by geography, skills, transportation access, and citizenship status. Third, the Proposition 22 vote was conducted after $204 million in platform-funded advertising (E2), including direct in-app messaging to drivers -- a communication asymmetry that undermines the claim that the outcome reflects informed democratic judgment. Market competition does not self-correct when information asymmetry is this pronounced.',

            incomplete: 'D4 does not engage with the earnings data (E3). If drivers are earning below minimum wage after expenses -- the finding of the MIT study that Uber disputed but did not empirically refute -- then the labor market competition argument has already failed. Workers who would exit a below-minimum-wage situation but remain in it are demonstrating not that the compensation is adequate but that their alternatives are worse. That is a failure of labor market competition, not evidence that it is working. A complete defense of D4 must either dispute the earnings data with better evidence or explain why below-minimum-wage equilibrium is a morally acceptable market outcome.'
        }
    },

    // -- Phase 5: Code Provisions ------------------------------
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.1',
            text: 'Contribute to society and human well-being, acknowledging that all people are stakeholders in computing. This principle, which concerns the quality of life of all people, affirms an obligation to protect fundamental human rights and to respect the autonomy of all people.'
        },
        {
            code: 'PMI',
            section: '5.1',
            text: 'Recognize and respect intellectual property. This includes respecting the property rights of those who design and own systems, including the algorithms, platforms, and technical systems that constitute the basis of commerce.'
        }
    ],
    codeConflict: {
        provision1: 'ACM 1.1',
        provision2: 'PMI 5.1',
        conflictDescription: 'ACM 1.1 requires computing professionals to contribute to human well-being and to respect human autonomy. When the algorithmic system they build determines wages, deactivates workers, and controls access to income without any transparency or appeal mechanism, the computing professionals who built and maintain that system have a responsibility for its effects on worker well-being and autonomy.\n\nPMI 5.1 requires respect for intellectual property, including the proprietary algorithms and platform architectures that constitute the platforms\' commercial value. The dispatch algorithm, the earnings calculation system, and the performance management tools are the company\'s intellectual property. Disclosing how they work, or refusing to build features that harm workers, could be framed as a violation of the engineer\'s obligation to protect the company\'s proprietary systems.\n\nThe tension: the same algorithm that is "intellectual property" under PMI 5.1 is the mechanism of the power imbalance that ACM 1.1 requires engineers to consider. When the engineer is asked to build features that reduce driver earnings visibility or make deactivation thresholds less transparent, which obligation governs? Can an engineer\'s duty to protect proprietary systems override a duty to respect the autonomy of the workers those systems control?'
    },

    // -- Scoring Weights ---------------------------------------
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
