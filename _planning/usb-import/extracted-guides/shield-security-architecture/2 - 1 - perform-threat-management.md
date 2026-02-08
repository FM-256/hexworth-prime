## Perform threat management


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, perform threat management activities.

### External Resources:

Perform threat management

 What do you need to know about Intelligence Types? -

 Threat intelligence - continual processes used to understand the threats faced
 by an organization

      • Tactical - focused on Tactics, Techniques, & Procedures (TTPs) of a
      threat actor; used by operations teams to augment vulnerability remediation,
      alerting/reporting & architectural design considerations (commodity malware)

      • Strategic – senior leadership focused information; used to help identify
      motivations, capabilities, & intentions of threat actors (targeted attacks)

      • Operational - collected from the organization's infrastructure including
      logs & information reported by SIEM platforms; used to identify current
      attacks & Indicators of Compromise (IOCs)


 What do you need to know about Threat & Adversary Emulation & Threat Hunting? -

 Threat emulation - emulating known TTPs to mimic the actions of a threat in a
 realistic way, without emulating a specific threat actor; help identify elements
 related to the TTPs & aid in future detection efforts

 Adversary emulation - emulating known adversary TTPs in a realistic way in order
 to mimic the actions of a specific threat actor or group

 Threat hunting - assessment technique utilizing insights from threat
 intelligence to proactively discover IOCs present within the environment
 using an "assume breach" mindset; likely to be led by senior staff & include:

      • Advisories & bulletins
      • Intelligence fusion & threat data


 What do you need to know about Intelligence Collection Methods? -

 Intelligence Feeds - some feeds are freely available & others are available
 only as part of a subscription service, often associated with proprietary
 hardware & software tools

 Deep Web - unindexed & hidden locations on the Internet generally associated
 with malicious activity & criminal operations

 Open-Source Intelligence (OSINT) - using publicly available information sources
 to collect & analyze data

 Human Intelligence (HUMINT) - collection of intelligence through interactions
 with people


 What do you need to know about Augmented Reality, Big Data & Deep Learning? -

 Augmented Reality - emulates a real-life environment through computer-generated
 sights & sounds & sometimes computer-generated smell & touch

 Big Data - data collections that are so large & complex that they are difficult
 for traditional database tools to manage

 Deep Learning - machine learning that deconstructs knowledge into a series of
 smaller, simpler parts

      • the system is not provided with human-directed facts, filters, or rules
      but instead is left to independently interpret data & classify it as a
      certain category

      • determines which simpler concepts are applicable in order to identify a
      solution to an abstract problem


 What do you need to know about Threat Actor Groups? -

 • Script Kiddies
 • Insider Threats
 • Competitors
 • Organized Crime
 • Hacktivists
 • Nation States
 • State Actors
 • Advanced Persistent Threats (APTs)
 • Supply Chain Access


 What do you need to know about Threat Management Frameworks? -

 MITRE Adversarial Tactics, Techniques, & Common Knowledge (ATT&CK) - knowledge
 base of information regarding real world adversary tactics & techniques;
 describes the specifics regarding how adversaries perform attacks & break down
 into logical groupings

      • used to develop accurate threat models & defensive controls
      • visually depicts the relationships between tactics & techniques
      • documents behavior profiles of various well-known adversarial groups to
      show the techniques used by each group


 MITRE ATT&CK for ICS - describes a set of tactics & techniques specific to
 industrial control systems & lists the elements described in the ATT&CK for
 ICS knowledge base

 ATT&CK Matrix is available at https://attack.mitre.org/


 Diamond Model of Intrusion Analysis - focuses on events & describes them in
 terms of four core & interrelated base features:

    • Adversary
    • Capability
    • Infrastructure
    • Victim

Adversaries achieve goals by using a capability over infrastructure against a victim

      • this relationship is visualized using a diamond to demonstrate that
      identifying any of the features can lead an analyst to the other connected points
      • Meta-features are included as ovals on the extended diamond model
      diagram & describe the specific details that may be present in the base features

 Available at https://apps.dtic.mil/sti/citations/ADA58696


 Cyber Kill Chain - steps/actions an adversary must complete in order to achieve
 their goals; includes seven steps:

    1. Reconnaissance - seeking information regarding weaknesses with people &
    technology in the target organization
    2. Weaponization - developing the tool &/or technique to be used against the
    organization based upon information gathered during reconnaissance
    3. Delivery - method by which the tool will be delivered
    4. Exploitation - step that results in a breach
    5. Installation - post-exploitation work needed in order to maintain access
    6. Command & Control (C2) - methods used to communicate with the exploited
    system in order to further the attack
    7. Actions on Objectives - perform the tasks initially identified as the
    attack's goals

Steps identify several opportunities for the detection of adversarial action; goal
is to detect these activities as early in the kill chain as possible
