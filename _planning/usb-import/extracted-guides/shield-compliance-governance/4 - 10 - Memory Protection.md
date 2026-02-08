Memory Protection
==========================

*3.4 Understand Security Capabilities of Information Systems*
--------------------------


Description
--------------------------
In this episode, we'll take a look at how computer systems utilize memory protections to
safeguard against buffer and stack overflow attacks. 


Resources
--------------------------
+ https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html
  

Learning Objectives
--------------------------
+ Define memory protection
+ List and define commonly used memory protection techniques


Notes
--------------------------
+ What is memory protection?
  - Applications are loaded into memory during run time
    + All the instructions that control the operation of the app is in memory
      - App instructions = code = machine code
  - Attackers are looking to read/write/execute code in memory
    + Read confidential/sensitive data
    + Write/Execute malicious code (*buffer overflow*)
      - **DEMO: Buffer Overflow**

+ What are some ways that we implement memory protection?
  - **Address Space Layout Randomization** (*ASLR*)
  - **Data Execution Prevention** (*DEP*)
    + Prevents code execution in certain regions of memory that should only
      contain data
  - **Non-Executable Stack/Heap**
  - **Memory Encryption**
    + Protects sensitive data from being read by attackers
  - **Memory Integrity Protection** (*MIP*)
    + *Stack Canaries*
      - Special values placed between a buffer and control data on the stack to
        detect buffer overflows
        + The canary will usually be the first data corrupted by an overflow
          - When canary verification fails will alert to an overflow
            + Corrupted data can then be invalidated
              - GCC Implementation: `-fstack-protector`
                + https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html
                  - Ctrl+f > search for "fstack-protector"
