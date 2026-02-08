Side-Channel Attacks
=======================================================

*3.7 Understand Methods of Cryptanalytic Attacks*
--------------------------


Description
--------------------------
In this episode, we'll explore how Side-Channel attacks exploit the physical attributes
of a digital system to reveal secrets; even secrets protected by encryption.


Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ Define Side-Channel attacks
+ Describe the different types of Side-Channel attacks


Notes
--------------------------
+ What is a side-channel attack?
  - Analysis of "leaked" information, or emanations
    + Physical and Meta attributes
      - Power Consumption
      - Time
      - Sound
      - Vibrations
      - Eelectro-Magnetic Radiation
+ Timing Attacks
  - How long it takes for a system to perform a function
+ Power Analysis Attacks
  - How much power it takes for a system to perform a function
+ Implementation Attacks
  - Attacking how the encryption is implemented
    + WEP is a prime example of good encryption(RC4) implemented poorly
      - IVs are too short
      - Part of IV is static
+ Fault-Injection Attacks
  - Attacker introduces faults in the system to see how it reacts
    + Could lead to exposure of encrypted data
+ Transient Execution Attacks
  - Spectre
    + Branch Prediction
    + Speculative Execution
      - Malicious code can possibly gain access to data in CPU-Caches
  - Meltdown
    + Breaks down the mechanism that keeps apps from accessing arbirary memory addresses
      - Spectre tricks apps into accessing arbitrary addresses in their allocated memory

