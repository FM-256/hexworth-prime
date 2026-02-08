Filename: cysa-1b-2-8-1-user-and-entity-behvior-analytics.md
Domain: Tools and Techniques for Determining Malicious Activity
Episode: User and Entity Behavior Analytics
=========================================================================

User and Entity Behavior Analytics
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ What is UEBA?
  - Used to detect compromised account creds
  - Can also help determine if real users pose a risk
+ How does it work?
  - Built-in function to many SIEM solutions
    + Splunk
    + M$ Sentinel
  - Gathers information about "Normal" user activity
    + When/where logins occur
    + User's role
    + Systems and Apps accessed by user
  - Uses ML to detect anomalies 
    + Abnormal Account Activity
    + Impossible Travel
  - Generates alerts
    + Security teams can then investigate/remediate 
