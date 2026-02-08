## Forensic concepts


### Objectives:

At the end of this episode, I will be able to:

Explain the importance of forensic concepts.

### External Resources:

Forensic concepts

 What do you need to know about Digital Forensics Concepts? -

 Forensic investigation includes four phases:

 1. Identification - ensure the scene is safe; secure scene to prevent
 contamination of evidence; identify scope of evidence to be collected

 2. Collection - using tools & methods that will withstand legal scrutiny; document
 & prove the integrity of evidence & ensure that it is stored in secure,
 tamper-evident packaging

 3. Analysis - create a copy of evidence for analysis, ensuring that the copy
 can be related directly to the primary evidence source; integrity is verified
 by generating hashes of the files on a recurring basis in order to detect any
 unintended changes; use repeatable methods & tools to analyze the evidence

 4. Reporting/Presentation - report the methods & tools used & present findings
 & conclusions in accordance with the specific reporting requirements necessary


 Chain of custody - record of evidence handling from collection through
 presentation in court; documentation reinforces the integrity and proper custody
 of evidence from collection, to analysis, to storage, & finally to presentation

 Cryptanalysis - art & science of cracking cryptographic schemes

 Steganalysis - attempts to identify messages &/or media which have been hidden
 in cover files

 Forensic Image - used for analysis purposes

 Forensic Clone - used as a working copy that is not typically preserved

 Data acquisition - process of obtaining a forensically clean copy of data from
 a device held as evidence; acquired from either volatile or nonvolatile storage
 & a snapshot of memory (memory dump)

    • capture evidence in the order of volatility, from more volatile to less volatile

The Guidelines for Evidence Collection and Archiving (tools.ietf.org/html/rfc3227)
sets out the general order as follows:

• CPU registers & cache memory (including cache on disk controllers, & GPUs)
• Contents of system memory (RAM), including:
  • Routing table, ARP cache, process table, kernel statistics
  • Temporary file systems/swap space/virtual memory
• Data on persistent mass storage devices (HDDs, SSDs, & flash memory devices)
including file system & free space
• Remote logging & monitoring data
• Physical configuration & network topology
• Archival media
