# Threat Modeling

After completing this episode, you should be able to:

+ Discuss threat modeling.

**Description:** In this episode, you will learn about threat modeling.

## Threat Modeling

### Attack Vector

An attack vector refers to the path or means by which a cyber attacker gains unauthorized access to a computer system, network, or application to exploit vulnerabilities and carry out malicious activities. 

Understanding attack vectors is crucial for threat modeling and involves several key considerations:

- Identification of Potential Entry Points: Attack vectors can vary widely depending on the specific vulnerabilities present in an organization's systems and the methods used by attackers. Common entry points include insecure network protocols, unpatched software, misconfigured devices, phishing emails, and physical security weaknesses.
- Analysis of Vulnerabilities and Exploitation Techniques: Attack vectors often exploit known vulnerabilities in software, hardware, or human behavior. Threat modeling involves analyzing these vulnerabilities and understanding how they could be exploited by attackers. This analysis helps identify potential attack vectors and prioritize remediation efforts based on the likelihood and potential impact of exploitation. 
- Consideration of Layered Defenses: Effective threat modeling takes into account the concept of defense in depth, which involves implementing multiple layers of security controls to mitigate the risk of successful attacks. By understanding attack vectors, organizations can design and deploy appropriate security measures at various layers of their infrastructure to prevent, detect, and respond to potential threats.
- Adversarial Thinking: Threat modeling requires adopting an adversarial mindset to anticipate how attackers might exploit weaknesses in an organization's systems. This involves considering various attack scenarios, understanding the motivations and capabilities of potential adversaries, and evaluating the effectiveness of existing security controls in mitigating specific attack vectors. 

### Internal Threat Actors

Internal threat actors refer to individuals or entities within an organization who pose a potential risk to its security, data, or operations. Understanding these internal threat actors is essential for threat modeling, which involves identifying, analyzing, and prioritizing potential threats to an organization's assets. Here's an explanation of different types of internal threat actors:

- Reckless Employee: These are employees who may inadvertently compromise security through careless or negligent behavior. For example, they might click on suspicious links in emails, share sensitive information on insecure channels, or mishandle company devices. Understanding the potential actions of reckless employees helps organizations implement training programs and security awareness initiatives to promote better security practices.
- Untrained Employee: Similar to reckless employees, untrained employees lack sufficient knowledge or awareness of security best practices. They may unknowingly engage in risky behaviors or fail to recognize security threats. Providing comprehensive security training and education to employees can help mitigate the risk posed by untrained individuals.
- Disgruntled Employee: These are employees who harbor resentment or dissatisfaction towards the organization, often due to perceived grievances or conflicts. Disgruntled employees may intentionally sabotage systems, steal sensitive data, or engage in malicious activities as a form of retaliation. Implementing robust access controls, monitoring employee behavior, and fostering a positive work environment can help mitigate the risk of insider threats from disgruntled employees.
- Internal Spy: An internal spy is an employee or contractor who intentionally acts as a covert agent to steal sensitive information or trade secrets from the organization for personal gain or to benefit a competitor. These individuals may have access to valuable intellectual property or sensitive data and can pose a significant risk to the organization's security. Implementing strong access controls, conducting thorough background checks on employees and contractors, and monitoring privileged user activities can help detect and prevent insider espionage.
- Partner: Partnerships with external entities, such as vendors, suppliers, or business associates, can introduce security risks if these entities have access to the organization's systems or data. Malicious or compromised partners may exploit their access to launch attacks or exfiltrate sensitive information. Establishing clear security requirements and conducting due diligence when selecting and managing partners can help mitigate these risks.
- Vendor: Similar to partners, vendors or third-party service providers may have access to the organization's systems, networks, or data as part of their contractual agreements. Weaknesses or vulnerabilities in vendor systems can potentially be exploited to compromise the organization's security. Implementing vendor risk management programs, conducting security assessments, and enforcing contractual security requirements can help mitigate the risks associated with third-party vendors.
- Thief: While not necessarily an employee, thieves can still pose internal threats if they gain unauthorized physical access to the organization's premises or assets. Theft of hardware, devices, or sensitive information can result in financial loss, data breaches, or disruption of operations. Implementing physical security measures, such as access controls, surveillance systems, and secure storage facilities, can help deter and detect theft-related risks.

### External Threat Actors 

External threat actors refer to individuals, groups, or entities outside of an organization who pose potential risks to its security, data, or operations. Understanding these external threat actors is crucial for threat modeling, which involves identifying, analyzing, and prioritizing potential threats to an organization's assets. Here's an explanation of different types of external threat actors:

- Anarchist: Anarchists are individuals or groups who seek to disrupt or undermine established systems or institutions, often through acts of protest, civil disobedience, or sabotage. In the context of cybersecurity, anarchists may launch attacks against organizations to promote their ideological or political agenda. These attacks can range from distributed denial-of-service (DDoS) attacks to defacement of websites or data breaches.
- Competitor: Competitors are rival organizations or entities in the same industry or market who may seek to gain a competitive advantage through unethical or illegal means, including corporate espionage, intellectual property theft, or sabotage. Competitors may attempt to steal proprietary information, trade secrets, or customer data to undermine a competitor's business or reputation.
- Corrupt Government Official: Corrupt government officials or state-sponsored actors may abuse their positions of power to engage in cyber espionage, surveillance, or cyber warfare against organizations, governments, or individuals. These actors may seek to obtain sensitive information, disrupt critical infrastructure, or engage in cyberattacks for political, economic, or military purposes.
- Data Miner: Data miners are individuals or organizations that collect, analyze, and exploit large volumes of data for various purposes, including marketing, research, or surveillance. While not inherently malicious, data miners may pose risks to organizations if they obtain unauthorized access to sensitive or personal data, leading to privacy violations, identity theft, or unauthorized profiling.
- Cyber Warrior: Cyber warriors are individuals or groups affiliated with military or government agencies who engage in offensive or defensive cyber operations, including cyber espionage, sabotage, or warfare. These actors may target organizations, critical infrastructure, or government systems to gather intelligence, disrupt operations, or cause economic or political harm.
- Legal Adversary: Legal adversaries are individuals or entities involved in legal disputes or litigation with an organization. These adversaries may seek to exploit vulnerabilities in the organization's systems or data to gain leverage in legal proceedings, extract financial compensation, or tarnish the organization's reputation. Legal adversaries may include disgruntled employees, former business partners, or individuals seeking damages for alleged wrongdoing.
- Activist/Terrorist: Activists or terrorists are individuals or groups who seek to promote a particular cause, ideology, or agenda through acts of violence, intimidation, or coercion. In the context of cybersecurity, activists or terrorists may target organizations or critical infrastructure to disrupt operations, steal sensitive information, or spread propaganda. These threats may manifest in the form of cyberattacks, such as ransomware, phishing, or social engineering campaigns.
- Advanced persistent threat (APT): An APT is a sophisticated and prolonged cyberattack carried out by a well-funded, organized, and highly skilled group of threat actors. APTs typically target specific organizations or entities, such as government agencies, military, defense contractors, financial institutions, or large corporations. 

Here are the key characteristics and components of an APT:

- Sophistication: APTs involve advanced and highly sophisticated attack techniques, often leveraging zero-day exploits, custom malware, and complex attack vectors. Threat actors behind APTs are typically skilled and well-resourced, possessing extensive knowledge of cybersecurity vulnerabilities and evasion tactics.
- Persistence: APTs are characterized by their persistence and long-term focus on infiltrating and compromising targeted systems or networks. Threat actors may conduct reconnaissance and intelligence gathering over extended periods, patiently seeking vulnerabilities and opportunities for exploitation.
- Stealth: APTs prioritize stealth and evasion to avoid detection by security defenses and monitoring systems. Threat actors employ sophisticated evasion techniques, including anti-forensic methods, encryption, and obfuscation, to conceal their activities and maintain covert access to compromised systems.
- Targeted: APTs are specifically tailored to target high-value assets, intellectual property, sensitive data, or critical infrastructure within a specific organization or industry sector. Threat actors conduct thorough reconnaissance and reconnaissance to identify vulnerabilities and exploit weaknesses in the target's defenses.
- Persistence: APTs aim to establish persistent access to compromised systems or networks, enabling ongoing surveillance, data exfiltration, or further exploitation. Threat actors may deploy backdoors, remote access trojans (RATs), or command-and-control (C2) infrastructure to maintain access and control over compromised assets.
- Goals: The objectives of APTs vary depending on the motivations of the threat actors and their sponsors. APTs may seek to steal sensitive information, intellectual property, or financial data for espionage, sabotage, fraud, or competitive advantage. In some cases, APTs may also aim to disrupt operations, undermine trust, or achieve geopolitical or ideological objectives.

### Threat Actor Characteristics

#### Skill Level

Skill level refers to the expertise and proficiency of threat actors in carrying out cyberattacks. 

- None: Threat actors with no or limited technical skills may include insiders with access to sensitive information but lacking in-depth technical knowledge.
- Minimal: This level includes low-skilled attackers who leverage publicly available tools and techniques without deep understanding.
- Operational: Threat actors at this level possess moderate technical skills and may include cybercriminals or hacktivists capable of executing relatively sophisticated attacks. 
- Adept: Highly skilled threat actors, such as nation-state actors or advanced cybercriminal groups, possess advanced capabilities to develop and deploy complex attack vectors.

#### Resources

Resources consider the support and backing available to threat actors.

- Individual: Threat actors operating alone, with limited resources and capabilities, may include amateur hackers or lone wolves.
- Team: Threat actors working in small groups or cybercrime syndicates have access to greater resources and expertise, enabling coordinated and sophisticated attacks.
- Organization: Well-funded criminal organizations or state-sponsored groups can marshal significant resources, including funding, infrastructure, and expertise, to conduct large-scale and highly coordinated cyber operations.
- Government: Threat actors backed by nation-states have access to extensive resources, including advanced technologies, intelligence capabilities, and legal immunity, enabling them to conduct highly sophisticated and strategic cyber operations.

#### Visibility

Visibility refers to the level of secrecy or visibility maintained by threat actors during their operations.

- Overt: Threat actors openly declare their intentions or affiliations and may include hacktivist groups or cybercriminals operating openly on underground forums.
- Covert: Threat actors operating discreetly to avoid detection, such as cybercriminals using stealthy malware or social engineering tactics to infiltrate networks.
- Clandestine: Highly secretive threat actors, such as state-sponsored espionage groups or advanced persistent threat (APT) actors, operate covertly to conceal their identities and objectives while conducting long-term intelligence-gathering operations.
- Don’t care: Some threat actors may exhibit reckless or brazen behavior, operating with little regard for concealment or attribution, which can make them particularly challenging to defend against.

#### Objective

Objective refers to the primary goals or motivations driving the actions of threat actors.

- Copy: Threat actors seeking to steal sensitive information or intellectual property for financial gain, espionage, or competitive advantage.
- Destroy: Threat actors aiming to disrupt or sabotage systems, networks, or data, often motivated by ideological, political, or revenge-driven motives.
- Injure: Threat actors intending to cause harm or damage to individuals, organizations, or critical infrastructure, potentially leading to physical or psychological harm.
- Take: Threat actors focused on unauthorized access or control of assets, data, or resources, often for extortion, ransom, or coercion purposes.
- Don’t care: Some threat actors may lack clear objectives or motivations, engaging in opportunistic or indiscriminate attacks without specific goals.

#### Outcome

Outcome considers the intended or unintended consequences of threat actor actions.

- Acquisition/theft: Successful theft or exfiltration of sensitive data or assets, leading to loss of confidentiality or intellectual property.
- Business advantage: Gain of competitive advantage through theft of proprietary information or disruption of competitors' operations.
- Damage: Infliction of harm or disruption to systems, networks, or operations, resulting in financial, reputational, or operational damage.
- Embarrassment: Exposure of sensitive or embarrassing information, leading to reputational harm or public embarrassment for individuals or organizations.
- Technical advantage: Acquisition of technological insights or capabilities through reconnaissance or exploitation, enabling future attacks or espionage activities.

### Threat Modeling Perspectives

Threat modeling is a structured approach to identifying and mitigating potential security threats to systems, applications, or networks. Different perspectives can be applied to threat modeling to focus on specific aspects of security. Here's an explanation of the three main threat modeling perspectives:

#### Application-centric threat modeling

In application-centric threat modeling, the primary focus is on understanding and mitigating threats specific to an application or software system. This perspective involves analyzing the architecture, design, and implementation of the application to identify potential vulnerabilities and attack vectors.

Threat modeling techniques such as data flow diagrams, data flow analysis, and attack trees are commonly used to identify and prioritize threats to the application.

The goal is to design and implement security controls that address the identified threats and minimize the risk of exploitation.

#### Asset-centric threat modeling

Asset-centric threat modeling revolves around identifying and protecting the critical assets within an organization's infrastructure. Assets can include data, hardware, software, intellectual property, or any other resources that are valuable to the organization. This perspective involves assessing the value, sensitivity, and importance of each asset and evaluating the potential threats and risks to those assets.

Threat modeling techniques such as asset inventory, risk assessment, and impact analysis are used to prioritize assets and identify appropriate security controls.

The goal is to ensure that the organization's most critical assets are adequately protected against potential threats and vulnerabilities.

####  Attacker-centric threat modeling

Attacker-centric threat modeling focuses on understanding the motivations, capabilities, and tactics of potential attackers targeting an organization's systems or assets. •This perspective involves putting oneself in the shoes of a potential attacker to anticipate how they might exploit vulnerabilities and compromise security.

Threat modeling techniques such as threat actor profiling, attack scenario analysis, and penetration testing are used to simulate and assess potential attacks.

The goal is to identify weaknesses in the organization's defenses, understand the likely tactics of adversaries, and proactively implement security measures to prevent or mitigate attacks.

### STRIDE Model

The STRIDE model is a threat modeling framework used to identify and categorize different types of security threats that can affect software systems. It stands for:

- Spoofing: This refers to the unauthorized impersonation of a user, system, or entity. Spoofing threats involve attackers attempting to masquerade as legitimate users or systems to gain unauthorized access.
- Tampering: Tampering threats involve unauthorized modifications to data or systems. Attackers may attempt to alter data, manipulate system configurations, or inject malicious code to compromise the integrity of the system.
- Repudiation: Repudiation threats involve the denial of actions or events by users or systems. This includes scenarios where users deny performing certain actions or transactions, making it difficult to hold them accountable for their actions.
- Information Disclosure: Information disclosure threats involve the unauthorized exposure or leakage of sensitive information. Attackers may exploit vulnerabilities to gain access to confidential data such as personal identifiable information (PII), financial records, or intellectual property.
- Denial of Service (DoS): Denial of Service threats involve attacks that aim to disrupt or degrade the availability of a system or service. Attackers may flood a system with excessive traffic, exploit vulnerabilities to crash servers, or exhaust system resources to render services unavailable to legitimate users.
- Elevation of Privilege: Elevation of Privilege threats involve attackers gaining unauthorized access to higher levels of privileges or permissions than originally intended. This allows attackers to perform actions or access resources that are typically restricted to privileged users.

### PASTA Model

The Process for Attack Simulation and Threat Analysis (PASTA) is a threat modeling methodology designed to help organizations systematically identify and mitigate security risks in their software applications. PASTA consists of seven stages:

1. Define the Objectives: The first step in PASTA is to define the objectives of the threat modeling exercise. This involves identifying the goals of the organization, understanding the context of the application being analyzed, and determining what the organization aims to achieve through the threat modeling process.
2. Define the Technical Scope: In this stage, the technical scope of the threat modeling exercise is defined. This includes identifying the boundaries of the application under analysis, understanding its architecture, and determining the components and data flows that will be included in the threat model.
3. Decompose the Application: Once the technical scope is defined, the application is decomposed into its various components, including modules, subsystems, interfaces, and data flows. This step helps the threat modeling team gain a comprehensive understanding of the application's architecture and identify potential areas of vulnerability.
4. Analyze the Threats: With the application decomposed, the threat modeling team analyzes potential threats that could affect the security of the application. This includes identifying common attack vectors, known vulnerabilities, and potential weaknesses in the application's design or implementation.
5. Vulnerability Analysis: In this stage, vulnerabilities within the application are analyzed and categorized based on their severity, likelihood of exploitation, and potential impact on the organization. Vulnerabilities may be identified through code reviews, penetration testing, or security scanning tools.
6. Attack Analysis: Building upon the vulnerabilities identified in the previous stage, the threat modeling team simulates potential attacks that could be launched against the application. This involves mapping out attack paths, identifying potential entry points for attackers, and determining the tactics, techniques, and procedures (TTPs) that adversaries might use.
7. Risk and Impact Analysis* Finally, the risks associated with identified threats and vulnerabilities are analyzed, and their potential impact on the organization is assessed. This includes evaluating the likelihood of the threats being realized, the potential impact they could have on the organization's assets, and the effectiveness of existing controls in mitigating the risks.

By following the seven stages of PASTA, organizations can systematically identify, prioritize, and mitigate security risks in their software applications, ultimately enhancing their overall security posture.

### TRIKE Methodology

The Triage, Identify, and Prioritize Risks, and Knowledge, Exploit (TRIKE) Methodology is a threat modeling framework designed to help organizations identify and mitigate security risks in their software applications. It consists of several stages:

1. Identifying assets and defining requirements: The first step involves identifying the assets within the organization that need protection and defining their requirements. This includes understanding the value of the assets, their dependencies, and the potential impact of security breaches on the organization. 
2. Creating diagrams: In this stage, organizations create diagrams to visualize the architecture and components of their systems. These diagrams help identify potential attack surfaces, entry points for attackers, and potential vulnerabilities in the system.
3. Identifying threats and risks: Companies should identify the IT threats and risks they face and the attackers who might be responsible. Potential attack methods include infiltrating networks, exploiting insider threats and software vulnerabilities, and even using physical attacks to hack into hardware. Then, organizations should develop policies to bolster security and decrease the likelihood of an attack (such as tightening access control, strengthening passwords, and employee training programs).
4. Mitigating threats: Once a plan of action has been created, the fourth stage of threat modeling involves executing that plan and mitigating security threats. Threat modeling provides a list of priorities, enabling organizations to triage their IT security issues by first addressing the most critical risks and vulnerabilities.
5. Validating the model: The final stage involves validating the effectiveness of the threat model and the implemented security controls. This may involve testing the system against known attack vectors, conducting penetration tests, and verifying that security measures are functioning as intended.

### VAST Model

The Visual, Agile, and Simple Threat (VAST) model is a threat modeling methodology designed to provide a visual representation of threats and vulnerabilities in a system, focusing on simplicity and agility. Here's an overview of the VAST model:

Visual Representation: The VAST model emphasizes the use of visual diagrams to represent the system architecture, components, data flows, and potential attack surfaces. Visual representations help stakeholders, including developers, security professionals, and business stakeholders, understand the security posture of the system more intuitively.

Agile Approach: Unlike traditional threat modeling methodologies that may be time-consuming and resource-intensive, the VAST model follows an agile approach. It aims to quickly identify and address security risks iteratively throughout the development lifecycle. By integrating threat modeling into agile development processes, organizations can proactively address security concerns without disrupting the development workflow.

Simplicity: The VAST model advocates for simplicity in threat modeling. It focuses on identifying the most critical threats and vulnerabilities that pose significant risks to the system's security. By prioritizing simplicity, the VAST model enables organizations to streamline the threat modeling process and allocate resources more efficiently to mitigate high-priority risks.

Collaborative Approach: Collaboration is a key aspect of the VAST model. It encourages cross-functional teams, including developers, security experts, and business stakeholders, to collaborate in identifying and mitigating security threats. By involving stakeholders from various domains, organizations can gain diverse perspectives and insights into potential security risks.

Continuous Improvement: The VAST model promotes continuous improvement in threat modeling practices. It encourages organizations to adapt and refine their threat modeling processes based on feedback, lessons learned, and changes in the threat landscape. By continuously evolving their threat modeling practices, organizations can stay ahead of emerging security threats and maintain a robust security posture.

### OCTAVE Methodology

The Operationally Critical Threat, Asset, and Vulnerability Evaluation (OCTAVE) methodology is a risk-based approach to information security. It is designed to help organizations identify, prioritize, and mitigate risks to their critical assets and operations.

Here's an overview of the OCTAVE methodology:

1. Build Asset-Based Threat Profiles:
   - Identify and prioritize critical assets: Organizations identify the assets that are crucial to their operations and classify them based on their importance.
   - Identify potential threats: Threats to the identified assets are identified and categorized based on their likelihood and potential impact.
2. Identify Infrastructure Vulnerabilities:
   - Assess vulnerabilities: The organization assesses the vulnerabilities present in its infrastructure that could be exploited by the identified threats.
   - Analyze organizational vulnerabilities: Factors such as organizational culture, policies, procedures, and human factors are analyzed to identify vulnerabilities that could impact security.
3. Develop Security Strategy:
   - Develop security controls: Based on the identified threats and vulnerabilities, the organization develops security controls and countermeasures to mitigate the risks.
   - Implement risk mitigation measures: The security strategy is implemented, and ongoing monitoring and evaluation are conducted to ensure its effectiveness.
   - Develop incident response and recovery plans: Plans are developed to respond to and recover from security incidents effectively.

### NIST SP 800-154

NIST Special Publication 800-154 (Draft) provides guidance on developing threat models for information systems, helping organizations identify and mitigate potential security threats effectively. The document outlines a four-step process for creating threat models:

1. Identify and Characterize the System and Data of Interest: In the first step, organizations identify and characterize the system and data assets that are of interest. This includes understanding the architecture, components, functionalities, and data flows of the system. By thoroughly analyzing the system and its associated data, organizations can establish a solid foundation for threat modeling.
2. Identify and Select the Attack Vectors: In the second step, organizations identify and select the attack vectors to be included in the threat model. Attack vectors represent potential avenues through which adversaries could exploit vulnerabilities to compromise the system or data. Common attack vectors may include network-based attacks, application-level attacks, physical attacks, and social engineering tactics. By identifying relevant attack vectors, organizations can focus their efforts on analyzing and mitigating specific threats.
3. Characterize the Security Controls for Mitigating Attack Vectors: Once the attack vectors have been identified, organizations characterize the security controls that are in place or need to be implemented to mitigate these vectors effectively. Security controls may include preventive, detective, and corrective measures designed to reduce the likelihood and impact of security incidents. Examples of security controls include firewalls, intrusion detection systems, encryption, access controls, and security awareness training. By assessing the effectiveness of existing controls and identifying gaps, organizations can enhance their security posture.
4. Analyze the Threat Model: In the final step, organizations analyze the threat model to assess the overall security posture of the system and identify areas of concern. This involves evaluating the likelihood and potential impact of various threats, considering factors such as threat actors' capabilities, motivations, and resources. Organizations may use qualitative or quantitative risk analysis techniques to prioritize threats based on their severity and likelihood of occurrence. The analysis helps organizations make informed decisions about risk mitigation strategies and resource allocation.

## Additional resources

+ CISSP Study Notes Chapter 2 - Personnel Security and Risk Management Concepts [CISSP Study Notes Chapter 2 - Personnel Security and Risk Management Concepts – Thomas Rayner – Writing and deploying secure code](https://thomasrayner.ca/cissp-study-notes-ch2/)
+ Threat Modeling: The Ultimate Guide [Threat Modeling: The Ultimate Guide | Splunk](https://www.splunk.com/en_us/blog/learn/threat-modeling.html)
