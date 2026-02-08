Bell-LaPadula
==========================

*3.2 Understand the Fundamental Concepts of Security Models*
--------------------------


Description
--------------------------
In this episode, we will define the Bell-LePadula security model as well as explore its
attributes and limitations. 

Resources
--------------------------
+ https://web.archive.org/web/20060618092351/http://www.albany.edu/acc/courses/ia/classics/belllapadula1.pdf
+ https://csrc.nist.gov/files/pubs/conference/1998/10/08/proceedings-of-the-21st-nissc-1998/final/docs/early-cs-papers/bell76.pdf
  

Learning Objectives
--------------------------
+ Define the Bell-LePadula security model attributes
+ List the limitations of the Bell-LePadula security model


Notes
--------------------------
+ What is a Security Model?
  - Rules|Guidelines for protecting information and controlling access
    + Think like rules to a game
      - To play the game correctly, you must follow these rules
        + Certain things are allowed
        + Other things are not
    + Or, like having a clubhouse as a kid
      - If you have the secret password, you're allowed in

+ Define the Bell-LaPadula Security Model
  - Primarily concearned with
    + **Confidentiality**
    + **Access Control**
  - Originally developed for the US military and gov
    + Utilizes Data Classification|Lables to determine access
+ What are the key attributes of Bell-LaPadula
  - State system/ State Machine Model
    + Manditory Access Control
  - *Security Levels*
    + Unclassified
    + Restricted
    + Confidential
    + Secret
    + Top Secret
  - *Security Properties*
    + Simple Security Property
      - No Read up
        + Subjects at one security level should not be able to read data at a
          higher security level
    + Star(*) Security Property
      - No Write Down
        + Subjects at one security level should not be able to write data to a
          lower security level
+ Limitations of Bell-LaPadula
  - Focus mainly on Confidentiality
    + Basically disregards Integrity
  - Does a poor job of addressing Covert Channels
  - No "Need-to-Know" support
    + There may be subjects in a lower security level that needs-to-know info
      that is in a higher security level
      - Subject doesn't need to be at the higher security level
        + They just need access to that specific info
  - Complex to implement
  - Inflexible
    + Too ridgid of a system
