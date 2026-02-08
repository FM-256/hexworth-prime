Filename: cysa-1b-3-2-1-ttps.md
Domain: Threat Intelligence and Threat Hunting Concepts
Episode: TTPs
=========================================================================

TTPs
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ What are TTPs?
  - Tactics
    + High-level overview of an attacker's goal(s)
      - Gain system access
      - Disrupt service of target
      - Steal target's data
      - Establish persistence
  - Techniques
    + Specific methods and/or tools used to achieve attacker's goal(s)
      - Use malware to gain system access
      - Perform DDoS attack to disrupt network service
      - Use Social Engineering to steal sensitive data
      - Use Backdoor/RAT to establish persistence
  - Procedures
    + Low-Level, step-by-step description of a technique
      - Recon
	+ OSINT
	+ Active/Passive Scanning Ports and Services
	+ Social Media
	+ Phishing for creds
      - Initial Access
	+ Exploit software Vulns
	+ Use stolen creds
	+ Brute-Force
	+ Malware
      - Lateral Movement
	+ Password Reuse
	+ PTH
	+ Cracking password hashes
	+ Misconfigured Shares
      - Persistence
	+ RAT
	+ Backdoor accounts
      - Data Exfil
	+ C2
	+ Stego
	+ Covert Channels
