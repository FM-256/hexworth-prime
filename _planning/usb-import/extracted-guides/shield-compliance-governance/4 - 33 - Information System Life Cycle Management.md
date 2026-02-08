Information System Life Cycle Management
=======================================================

*3.10 Manage the Information System Life Cycle*
--------------------------


Description
--------------------------
In this episode, we will learn about the Information System Life Cycle and explore
each phase of the ISLC to help us better secure our digital environments. 


Resources
--------------------------
+ N/A


Learning Objectives
--------------------------
+ Describe the Information System Life Cycle(ISLC)
+ Describe each management phase of the ISLC


Notes
--------------------------
+ What is the ISLC?
  - framework for managing the development, upkeep, and retirement of an
    organization’s information systems

+ What are the steps in the ISLC?
  - Prerequisites
    + Determine end-user needs and requirements
    + Determine scope
    + Determine cost
    + Determine feasibility

  - Requirements Analysis
    + Detailed requirements are gathered
      - Getting into the minutia
        + Interoperability with existing systems?

  - Design
    + The system is designed to meet the specifications in the requirements

  - Development
    + The system is built based off of the design

  - Verification
    + Testing is done to make sure
      - The system works
      - The system meets requirements

  - Deployment
    + The system is deployed to production
    + Users are given access to the system

  - Operations and Maintenance
    + End-User Training
    + Support team/systems are introduced
    + Monitoring is deployed
      - Ensures system is available and working properly
    + Maintenance is performed
      - Updates
        + New, refactored, and/or enhanced functionality
        + Bug fixes
      - Patches
        + Critical Fixes
        + Security Patches

  - Decommission
    + The system is deemed...
      - Unnecessary
        + The org has no further need for the system
      - Capable of meeting needs (outdated)
    + Disposal
      - Must be done in a forensically secure fashion
        + Data is archived and stored securely
        + Data is destroyed
          - `shred --force --iterations=5 --verbose --zero secrets.txt`
          - `bleachbit`
