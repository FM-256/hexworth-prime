- Filename: intro-to-iot-pentesting-2-9-1-binwalk.md
- Show Name: Intro to IoT Pentesting
- Topic Name: Tools
- Episode Name: Binwalk

================================================================================


Binwalk
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Become familiar with the function and use-case of Binwalk in the context of
  IoT Penetration Testing.
--------------------------------------------------------------------------------


+ What is Binwalk?
  - `man binwalk`
+ How will we be using Binwalk?
  - Dumping firmware for analysis
    + Finding secrets
    + Learning more about device/OS operations
+ What options will we be using?
  - Could be any, but the common options are...
    + No options
    + `-e`  Extract firmware
    + `-Me` Recursive Extraction
    + `-B`  Signature Analysis
    + `-E`  Entropy Analysis
    + `--disasm`  CPU/Architecture
