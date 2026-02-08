## Use processes to reduce risk


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, use processes to reduce risk.

### External Resources:

Use processes to reduce risk

 What do you need to know about Deceptive Technologies? -

 Decoy files - honeytokens &/or canary traps; contain data that would be appealing
 to an adversary, but the data is fake

    • include executables or "phone home" mechanisms to aid in the detection &
    analysis of their use

    • help aid in the detection of malicious activity

 Honeypot - mimics a genuine system & is configured to monitor & log interactions;
 generate highly detailed information designed to support investigative & hunt
 operations

 Honeynet - several honeypots attached to a monitored network

 Simulators - less complicated to deploy than other deceptive technologies; can
 be as simple as a software application designed to simulate common services &
 alert / log interactions

 Dynamic network configurations - integrating detection techniques &
 software-defined networking, allows for network configurations to be automatically
 redeployed after detecting an attack or malicious activity in order to contain
 the threat while still allowing for observations & logging of the suspicious
 activity


 What do you need to know about Security Data Analytics? -

 Security data analytics - tools used to collect, order, & analyze data available
 in an enterprise architecture in order to identify security incidents & perform
 threat detection

 Processing Pipeline - software elements required for automated collection,
 extraction, validations, combination & transformation of the data for analysis
 & visualization

    • Static data - logs & reports; critical to forensics & investigations
    • Stream data - live & provided in near real-time

 Indexing - decomposes collected data by identifying important elements such as
 hostname, source, source-type, & other fields that can be defined by operators
 that are unique to the organization

   • output allows an analyst to perform searches

 Searching - discover information &/or patterns that are hidden

 Database Activity Monitoring (DAM) - focused on identification of changes &/or
 specific activities within a database management system (DBMS)

   • data discovery & classifications tasks, user rights management, privileged
   user monitoring, & data protection tasks (such as loss protection)


 What do you need to know about Preventative Controls? -

 Antivirus

 Immutable Systems - creation of an unchangeable core designed to be useable but
 not reconfigurable in a typical manner

 Hardening - removing elements that can be exploited by an adversary

 Sandbox Detonation - accessing a file, executable, or website via a protected
 location in order to observe & analyze behavior determining if malicious
 activity occurs


 What do you need to know about Application Controls? -

 Allow vs. Block lists

 Licensing

 Time of check vs. time of use (TOC/TOU) - issues associated with programming
 that follows a sequence of events & makes assumptions about the state of the steps

 Atomic execution - capability for a task to run with exclusive access to resources

    • a lack of atomic execution means that more than one task can access or
    modify critical resources & potentially change their state, which exposes the
    application to a TOC/TOU attack


 What do you need to know about Security Automation Tools? -

 Operating Systems Schedulers - Linux cron & Windows scheduled tasks; can be used
 to trigger scripts to run

    • scripts can be written in native scripting languages such as Bash for Linux
    or PowerShell for Windows or using more powerful languages such as Python

    • endpoints should leverage controls available via allow & block lists
    combined with allowing only specifically signed scripts to execute


 What do you need to know about Physical Security Controls? -

 Lights - eliminate dark spaces & support capture of clear video

 Cameras - placed to provide full coverage of an area & to also eliminate hidden
 paths allowing an attacker to gain unrecorded access to the back in a way that
 allows it to be disabled

    • all actions to review & respond to video should be documented

 Closed, confined spaces - blanketed with cameras & warning signs to remind
 visitors that they are not alone

 Open spaces - capability to identify people entering & leaving a space

 Visitors to a facility - should be required to sign access logs
