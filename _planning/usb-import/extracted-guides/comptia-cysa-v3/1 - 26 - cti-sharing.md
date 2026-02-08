Filename: cysa-1b-3-5-1-cti-sharing.md
Domain: Threat Intelligence and Threat Hunting Concepts
Episode: CTI Sharing
=========================================================================

CTI Sharing
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------

+ Better security through sharing CTI
  - Sharing CTI benefits us all during 
    + Incident Response
    + Vulnerability Management
    + Risk Management
    + Security Engineering
    + Detection and Monitoring
+ Sharing tools
  - Structured Threat Information eXpression (STIX)
    + https://oasis-open.github.io/cti-documentation/
    + Formatted/Serialized CTI data
      - Designed to be shared with others
	+ https://oasis-open.github.io/cti-documentation/stix/examples
  - Trusted Automated eXchange of Intelligence Information (TAXII)
    + HTTPS/RESTful API service used for sharing CTI data
      - STIX and Non-STIX data
    + Models
      - Hub-and-Spoke
	+ Single information repository
	  - Producers add to the repo
          - Consumers pull from the repo
      - Peer-to-Peer
      - Source-Subscriber
	+ Single info repo
	  - Subscribers pull from repo
  - Yara
    + Identify and classify malware samples
      - https://yara.readthedocs.io/en/stable/
  - Sigma
    + https://github.com/SigmaHQ/sigma
