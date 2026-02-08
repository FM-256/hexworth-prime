# Other Common Tests

After completing this episode, you should be able to:

+ Describe other common tests and topics associated with security assessments and tests  

**Description:** In this episode, you will learn about a variety of topics associated with security assessments and tests.   

## Other Common Tests      

Log reviews are another important aspect of testing and assessing security infrastructures. SIEMs can be used and NTP should be used (or another protocol like it) to sync the time across devices. This is important for the timestamps announcing the time and data of security events. NetFlow is an example of a protocol that can be used to analyze traffic flows throughout the organization. 

Synthetic transactions and benchmarks - synthetic transactions refer to simulating traffic (often through the use of scripts). This is a common approach in pre-production environments since there will normally not be actual traffic in the pre-production environment. Note that it can still be done in production environments, specifically those that lack user traffic. The use of synthetic traffic and transactions can be critical in the establishment of benchmarks for security devices and technologies. 

Code review and testing - software should also be tested as part of a process called code review. Third party reviews of developer work help to ensure that software developed by the organization is also following security best practices. Following the code review, the code is either sent into production or it is sent back for re-work. One popular code testing process is called a Fagan Inspection. It consists of the following phases:

+ Planning
+ Overview
+ Preparation 
+ Inspection
+ Rework 
+ Follow-up 

Other testing topics include: 

+ Misuse case testing - this involves testing your solutions against common methods of user misuse 
+ Coverage analysis - this is the science of calculating how much coverage your testing has provided for various misuses or attacks the solution may encounter 
+ Breach and attack simulations - these are similar to pen tests and often involve a software component that is placed in the network to see if it is detected and dealt with 
+ Compliance checks - these are performed to ensure that security solutions are in compliance with applicable standards and laws 
+ Interface testing - this testing seeks to check all interfaces including user interfaces, network interfaces, and APIs 

## Additional resources

+ Secure Code Review: <https://trustedinstitute.com/concept/cissp/security-assessment-methodologies/secure-code-review/>