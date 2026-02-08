Filename: cysa-1b-3-6-1-threat-hunting.md
Domain: Threat Intelligence and Threat Hunting Concepts
Episode: Threat Hunting
=========================================================================

Threat Hunting
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ What are Indicators of Compromise (IoC)
  - File hashes
  - IP Addresses
  - Domain names
  - URLs
  - Anything associated with the breach
    + https://github.com/eset/malware-ioc
+ What is the process of obtaining IoCs?
  - Collection
    + Logs
    + Files
    + Other Data 
      - pcaps
      - LOLBINs
      - email addresses
      - Registry Entries
  - Analysis
    + Reverse engineering malicious binaries (SAST)
    + DAST
    + Memory Dumps
    + Strings
    + Metadata
  - Application
    + Tracking threats
    + Attribution
+ Focus areas
  - Configurations/misconfigurations
  - Isolated networks
  - Business-critical assets and processes
+ What is "Active Defense"?
  - Wasting the attacker's time
    + Increasing the probability of detection
      - Even baiting the attacker into getting detected
	+ Fake websites/pages/directories/login portals/etc
	+ Canary Tokens
	  - https://canarytokens.org/generate
        + Inticing files/data
	  - API Keys
	  - SSH Keys
	  - Encryption Keys
	  - Sensitive-looking documents
	    + Creds.txt
	    + Financial docs
+ Honeypot
