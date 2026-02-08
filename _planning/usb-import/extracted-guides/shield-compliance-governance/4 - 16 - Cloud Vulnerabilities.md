Cloud Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we'll examine the basics of cloud systems and the cybersecurity vulnerabilities associated 
with the different types of cloud systems.


Resources
--------------------------
+ https://www.tenable.com/products/tenable-cloud-security
+ https://www.crowdstrike.com/products/cloud-security/
+ https://aws.amazon.com


Learning Objectives
--------------------------
+ Define Cloud Computing
+ List and describe the 3 basic cloud models
+ List and describe the 4 cloud deployment models
+ List and explain common vulnerabilites in cloud systems
+ List and explain cloud specific defenses


Notes
--------------------------
+ <u>**Cloud Computing Basics**</u>
  - On-Demand Self-Service
  - Broad Network Access
  - Resource Pooling
  - Rapid Elasticity
  - Measured Service
  - Relies on Virtualization


+ <u>**What are the 3 cloud service models?**</u>
  - *SaaS*
    + Think Facebook, YouTube, Your Banking App, ACI-Learning
    + No control over the cloud environment
      - Except through provider-defined user configuration
  - *PaaS*
    + Commonly deployed by developers
      - Quickly provision infrastructure and supporting tech stacks
      - User has ability to develop, operate, manage, and maintain applications
      - User has no control of underlying infrastructure
  - *IaaS*
    + **\*Show AWS EC2 Instance Launch\***
    + User has the most control and responsibility over cloud environment
      - Control of operating system and tech stacks
        + Security updates and patches
        + 3rd-party security updates and patches
      - Some networking control
        + Network security
          - Remote access
          - Firewalls/ACLs
          - WAFs
          - IDS/IPS
          - AV/EDR/XDR
      - Storage
      - Memory
    + Cloud provider responsibilities
      - Hardware maintenance and repair
      - Hypervisor maintenance and security
      - Physical security of data center


+ <u>**What are the 4 cloud deployment models?**</u>
  - *Private Cloud*
    + Single org use and management
    + On-Prem
      - Internal Data Center
    + Managed
      - Hosted and maintained by Data Center provider
    + Virtual
      - Utilizes Public Cloud infrastructure
      - Secured and segregated enclave for the tenant
  - *Community Cloud*
    - Used and maintained by a community of consumers
      + Delta Airlines = Private
      + Delta, American, Jet Blue = Community
  - *Public Cloud*
    + Open use by the general public
      - AWS, Azure, GCP
  - *Hybrid Cloud*
    + Implementation of 2 or more of the other deployment models


+ <u>**What are vulnerabilities that affect cloud systems?**</u>
  - Misconfigurations
  - Poor Access Control
  - Shared/Multi-Tenancy
    + Escape
  - Supply Chain/Third-Party
    + Data breaches
    + Hacking and taking over of accounts
    + Insider/internal employee compromises the network’s security
    + Malware and ransomware
    + Insecure APIs
    + Denial of Service (DoS) Distributed Denial of Service (DDoS) attacks
    + Lack of due diligence in researching, maintaining compliance, and upgrading
      security measures
    + Data loss
    + Non-compliance with regulations
    + Vendor lock-in



+ <u>**Cloud Specific Defenses**</u>
  - *Security as a Service (SECaaS)*
    + security services provided by a third party cloud provider
  - *Cloud Access Security Broker (CASB)*
    + Like the guardian of your cloud deployment, watching over and granting
      access and enforcing compliance and security
      - The 4 Pillars of CASB
        + Visibility
          - Helps give clients better insights into their cloud environments
          - Can help discover shadow-IT
        + Compliance
          - Ensures conformance to standards like HIPAA, SOC2, GDPR
        + Data Security
          - ACLs and DLP
        + Threat Protection
          - Malware Detection
          - Sandboxing
          - URL Filtering
          - Network Packet Inspection
  - *Cloud Workload Protection Platform (CWPP)*
    + Unifying management across multiple cloud providers and spanning all types
      of workloads
      - Physical servers
      - VMs
      - Containers
      - Serverless Functions
    + Single Pane of Glass
    + [CrowdStrike Falcon Cloud Security](https://www.crowdstrike.com/products/cloud-security/)
    + [Tenable Cloud Security](https://www.tenable.com/products/tenable-cloud-security)
  - Cloud security Posture Management (CSPM)
    + Monitors, discovers, and remediates risks across the cloud platforms
      - risk assessments and visualizations
      - Incident Response
      - Monitoring Compliance
      - DevOps integration
