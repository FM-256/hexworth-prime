Security Model Basics
==========================

*3.2 Understand the Fundamental Concepts of Security Models*
--------------------------


Description
--------------------------
In this episode, we will examine common security models like the CIA Triad, process protections,
and User/Kernel modes which will help us better secure our IT systems.

Resources
--------------------------
+ Juice Shop
  - https://juice-shop.herokuapp.com/#/
  

Learning Objectives
--------------------------
+ Define the CIA Triad and explain its use
+ Define Process Protections
+ Define User and Kernel Modes


Notes
--------------------------
+ CIA
  - Confidentiality
    + Discover confidential info in Juice Shop
  - Integrity
    + Modify a script
      - Show and Run `integrity.sh`
      - Malciously modify `integrity.sh`
        + Catch shell
  - Availability
    + Simulate an outage (just turn off the service)
      - Have a user attemt to use the service
        + Ask the user how well they liked their experience
          - What if this was...
            + Financial data
            + Personal Health Information(PHI)
            + Criminal/Legal Data
+ Process Protections
  - Confinement
  - Bounds Checking
    + Protects from Buffer Overflows
  - Isolation
    + All are ways to protect processes through guarding them in memory
      - Either through physical or logical isloation
+ User Mode and Kernel Mode
  - Demo: Eternal Blue
