# 1-1-1: Understand and Comply with Investigations

After completing this episode, you should be able to:

+ Identify and explain digital forensic standards in investigations, given a scenario.

**Description:** In this episode, the learner will examine the components of digital forensic standards, the processes and the role these standards offer in investigations. We will explore NIST, IOCE and SWGDE and more.

+ What is digital evidence?
  + Any digital data (files, logs, messages, etc.) that can be legally used in court to prove or disprove a theory or element of a case
  + Information stored or transmitted in digital form that is sought or seized as part of a legal investigation or proceedings
  + ISO/IEC 27037:2012
    + Information or data, stored or transmitted in binary form that may be relied on as evidence
+ Describe investigative techniques used for digital evidence?
  + Identification, preservation, collection and handling
    + NIST SP 800-86
      + Identifying, labeling, recording, and acquiring data from the possible sources of relevant data, while following guidelines and procedures that preserve the integrity of the data
    + \(3.1.1\) Identify sources
      + User files and data, network logs, mobile devices
    + \(3.1.2\) Aquire the data \(tactics and tools\)
      + Develop a plan 
      + Aquire the data
        + Order of volatility
        + Use forensic tools
      + Verify the integrity of the data
    + ISO/IEC 27037:2012
      + The process of gathering the physical items that contain potential digital evidence
  + Examination - processing and extracting relevant information from data.
  + Analysis - interpreting extracted information to answer investigation questions
  + Reporting - documenting findings, procedures, and evidence in a clear, comprehensive, and accurate manner for legal and procedural review.
+ What are examples of forensic tools
  + Disk and data capture tools \(EnCase\)
  + Network forensic tools \(WireShark, nmap\)
  + Mobile forensic tools \(Cellebrite\)
  + File Analysis tools \(FTK Imager\)

--------------------
## Additional references
+ National Institute of Standards and Technology - promotes US standards
  + NIST SP 800-86 - integrating forensic techniques into incident response
  + NIST SP 800-101R1 - guidelines on mobile device forensics
  + NIST SP 800-183 - guidelines on Networks of 'Things' - applied to forensic investigations in vehicles
  + NIST Interagency Report \(NISTIR\) 7250 - procedures for cellular forensic tool testing 
  + International Organization on Computer Evidence \(IOCE\)
    + A global body that provides guidelines and standards for the process of collecting, analyzing, and presenting digital evidence in legal contexts
    + Principles
      + Follow evidence rules and guidelines
      + Preserve all seized evidence
      + Access to data evidence should be restricted to adequately trained personnel
      + All activities from the initial seizure to conclusion should be documented \(chain of custody\)
      + Individuals in possession of digital evidence, require documented accountability for all actions taken
      + Compliance responsibility of the agency and participants of the investigation.
  + The Scientific Working Group for Digital Evidence
     + A US based organization that establishes standards and guidelines for the forensic analysis of digital evidence
  + ISO/IEC 27037:2012 
    + Guidelines for identification, collection, acquisition and preservation of digital evidence
