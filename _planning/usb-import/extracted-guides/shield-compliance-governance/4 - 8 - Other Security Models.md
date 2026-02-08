Other Security Models
==========================

*3.2 Understand the Fundamental Concepts of Security Models*
--------------------------


Description
--------------------------
In this episode, we will list and describe commonly used security models such as,
Lipner, Brewer-Nash, Graham-Denning, and Harrison-Ruzzo-Ullman.

Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ Define the Lipner security model
+ Define the Brewer-Nash security model
+ Define the Graham-Denning security model
+ Define the Harrison-Ruzzo-Ullman security model


Notes
--------------------------
+ **Lipner**
  - Combines elements of Bell-LaPadula and Biba
  - 2 ways of implementing integrity
    + 1 - Using the BLP confidentiality model
    + 2 - A hybrid of BLP and Biba
       - Both utilize security levels and functional categories for subjects and objects
         + Subjects
           - Clearence Level
           - Job Function
             + User
             + Operator
             + Programmer
         + Objects
           - Classification determined by 
             + Sensitivity
             + Data Type and Function
               - Production
               - Test
               - Application
+ **Brewer-Nash aka "Chinese Wall"**
  - Designed to mitigate Conflicts of Interest(CoI)
    + An information flow model
      - Info cannot flow to/from subjects and objects in such a way that would be a CoI
  - Commonly employed by Accounting and Consulting orgs
    + Example:
      - Joe works for a consulting firm
      - Joe is tasked to consult for ABC
      - Joe can no longer access any data from ABC's competitors
      - Jill works at the same firm as Joe
      - Jill is tasked to consult for XYZ, a competitor of ABC
        + This is the prinicple of data isolation
+ **Graham-Denning**
  - Concerned with the secure creation and deletion of subjects and objects
  - 3 main attributes
    + **Subjects**
    + **Objects**
    + **Rules**
      - Transfer Access
      - Grant Access
      - Delete Access
      - Read Object
      - Create Object
      - Destroy Object
      - Create Subject
      - Destroy Subject
+ **Harrison-Ruzzo-Ullman**
  - Variation on Graham-Denning
  - Maps subjects, objects, and access rights to an access matrix
  - 6 *Primitive Operations*
    + Create object
    + Delete object
    + Create subject
    + Delete subject
    + Append to the access matrix
    + Delete from the access matrix 
