Using Secure Design Principles
=======================================================

*3.1 Research, Implement, and Manage Engineering Processes Using Secure Design Principles*
-------------------------------------------------------

Description
--------------------------
In this episode, we will explore and define many secure design principles that can
aid us in creating more secure systems.

Resources
--------------------------
+ https://attack.mitre.org/

Learning Objectives
--------------------------
+ List and define common secure design principles used to secure IT systems


Notes
--------------------------
+ Threat Modeling
  - What are the TTPs used by our most likely adversaries?
  - How can we build the best defense in light of that information?
    + https://attack.mitre.org/
+ Subject and Object
  - Subjects are users or processes that need access
  - Objects are the resources that Subjects need access to
+ Close/Open Systems
  - Closed systems are proprietary and limited to interactions within their own ecosystems
  - Open Systems are built upon industry standards and are able to interact with any system that supports said standard
    + TCP/IP
    + OSI
+ Least Privilege
  - Literally giving the user the least amount of privs without preventing them from doing their job
    + Reduces fall-out from compromise/infection
  - Role-Based access is useful for implementing this
  - Separation of privilege
    + Same user has 2 accounts
      - First account for normal user activity
      - Second account for administrative activity
        + **Demo with Windows AD**
  - Audit priviledged access
  - Privilege Creep
    + Accumulating privs over time
+ Defense in Depth
  - No one security control is enough (*single point of failure*)
    + Multiple layers of defense is necessary
      - Increases the difficulty to compromise
      - Increases the likelihood of attack detection
+ Secure Defaults
  - The system opts-in to security by default
+ Fail Securely
  - Physical systems
    + If power is removed, does the door lock release or stay locked?
    + If the firewall/IDS gets DoSed, does it block or allow traffic?
+ Segregation of Duties
  - System Config & System Auditing
    + Separate the sys config duties
      - Throw in a little job rotation for spice (*eliminates single-point of failure*)
        + Auditors should be different people
+ Keep it Simple and Small (KISS)
  - Don't introduce needless complexity
+ Zero Trust or Trust-but-Verify
  - Zero Trust: No access without verification and everything you do is
    assumed to be malicious
    + This is regardless of user and device used
  - Trust-but-Verify: Access is allowed, but everything you do is audited
    + Security Audits
    + Penetration tests
+ Privacy by Design
  - Privacy guides the Development process
    + Takes longer to build systems
    + Makes them more secure
+ Shared Responsibility
  - EVERYONE is responsible for system security
+ Secure Access Service Edge(SASE pronounced *Sassy*)
  - Provides security for network access, apps, and resources
    + Typically employs the following tech
      - Zero Trust Network Access(ZTNA)
      - Secure Web Gateway(SWG)
        + Protects users from accessing malicious external sites undesireble
          content
      - Cloud Access Security Broker(CASB)
        + Enforces security policy
          - Examples
            + NetSkope CASB
            + Zscalar CASB
            + Cisco CloudLock
      - SD-WAN
        + SD-WAN
          - Utilizes software to manage and optimize network traffic/connections
      - NextGen Firewalls or FWaaS
