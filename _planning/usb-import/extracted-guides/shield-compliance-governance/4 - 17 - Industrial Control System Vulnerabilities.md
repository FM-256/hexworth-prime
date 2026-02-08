Industrial Control Systems Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we will take a look at Industrial Control Systems, including their common types
and components. We'll also investigate a few of their associated vulnerabilities.


Resources
--------------------------
+ https://shodan.io


Learning Objectives
--------------------------
+ Define OT and ICS
+ Describe Distributed Control Systems(DCS)
+ Describe SCADA systems
+ List and describe common components of an ICS
+ List and describe common vulnerabilites of an ICS


Notes
--------------------------
+ Define OT and ICS
  - OT = *Operational Technology*
    + The umbrella under which ICS and SCADA are under
    + Think IT, but for industrial systems
  - ICS = *Industrial Control Systems*
    + Network of interconnected...
      - Devices
      - Software
      - Processes
        + Designed to...
          - Monitor
          - Manage
          - Automate
            + Industrial operations in sectors such as...
              - Manufacturing
              - Energy
              - Transportation


+ Common ICSs
  - DCS = *Distributed Control Systems*
    + Localized industries
      - Chemical Processing
      - Power Generation
      - Refineries
  - SCADA = *Supervisory Control And Data Acquisition*
    + Industries that cover large geographical areas
      - Water Treatment and Distribution
      - Power Transmission and Distribution
      - Oil Pipelines (Distribution)


+ Common ICS/DCS/SCADA Components
  - Human Machine Interfaces (HMI)
    + Give users access to monitor and control industrial equipment
      - Directly connected to physical devices like PLCs
      - Software application on a Control Server
  - Programmable Logic Controllers (PLC)
    + The "brain" of industrial equipment
  - Control Server
    + Hosts the DCS or PLC supervisory control app
  - Remote Terminal Units (RTU)
    + Receives commands from and sends info to the MTU
  - Master Terminal Units (MTU)
    + Sends commands to and receives info from the RTU
  - Data Historian
    + Database that logs all process data in an ICS envrionment


+ Common OT/ICS Vulnerabilities
  - Insecure communication protocols
    + Weak/No Encryption
  - Directly connecting to public networks (ie the Internet)
    + Colonial Pipeline
    + Black Energy
      - [Shodan.io](https://www.shodan.io)
  - Insider Threats
  - Improper Input Validation
  - Poor Code Quality
  - Misconfigured Permissions, Privileges, and Access Controls
  - Improper Authentication
  - Credentials Management
