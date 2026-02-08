Filename: 1-1-1-common-log-ingestion-concepts.md
Domain: System and Network Architecture Concepts in Security Operations
Episode: Common Log Ingestion Concepts
=========================================================================

Common Log Ingestion Concepts
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ Time synchronization
  - Why is time important to logs and security?
    + Some systems require time sync
      - Errors occur when time is off
    + Security Events
      - If this is part of an attack and/or breach
        + Need to establish an accurate event timeline
          - Legally admissible 
+ Logging levels
  - Determines importance/severity of event
  - Most Common
    + FATAL
      - Crash!
    + ERROR
      - Something unexpected happened
	+ Prevented one or some function/action from occuring
    + WARN
      - Something unexpected happened, but...
	+ System was able to continue
	  - Example: "File custom.conf not found, but not required"
    + INFO
      - Standard log data
        + Who/What happened
	+ When did event occur
	+ Success status
    + DEBUG
      - Fine grained data
      - Helps to make sure systems are running correctly
      - Often used to troubleshoot issues
    + TRACE
      - Most finely granulated data
      - Used to investigate the difficult of errors
