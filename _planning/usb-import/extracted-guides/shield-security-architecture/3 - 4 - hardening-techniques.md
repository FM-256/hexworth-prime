## Hardening techniques


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, configure and implement endpoint security controls.

### External Resources:

Hardening techniques

 What do you need to know about Hardening Techniques? -

 Process of applying a secure configuration to an operating system or application:

  • Removing unneeded services
  • Disabling unused accounts
  • Images/templates
  • Remove end-of-life & end-of-support devices
  • Local drive encryption
  • Enable no execute (NX)/execute never (XN) bit
  • Disabling Central Processing Unit (CPU) virtualization support
  • Secure encrypted enclaves/ memory encryption
  • Shell restrictions
  • Address Space Layout Randomization (ASLR)


 Local Drive Encryption - Microsoft BitLocker & TrueCrypt or Linux cryptsetup

 Enable No Execute (NX)/Execute Never (XN) bit - Implemented in CPUs to separate
 areas of memory designated for instructions or data

 Disabling CPU Virtualization Support – Potential issues with proper
 guest-isolation allowing for data from one virtual machine to leak to another.
 Virtualization can also be used by malware to run in a similar way as a VM in
 order to avoid detection

 Secure Encrypted Enclaves/Memory Encryption - CPU Instructions, dedicated secure
 subsytems in SoC, or a protected region of memory in a database engine designed
 to protect sensitive information by only allowing data to be decrypted on the
 fly within the CPU, SoC, or protected region

 Shell Restrictions - The shell can interact with the operating system either
 directly or via scripts

 Address Space Layout Randomization (ASLR) - buffer overflow prevention control
 that makes it difficult to guess the memory location of executables stored in
 memory
