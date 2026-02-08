Biba
==========================

*3.2 Understand the Fundamental Concepts of Security Models*
--------------------------


Description
--------------------------
In this episode, we will define the Biba security model as well as explore its
attributes and limitations. 

Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ Define the Biba security model and list its key attributes
+ List the limitations of the Biba security model


Notes
--------------------------
+ What is Biba?
  - A state-transition security model
  - Concerned with data INTEGRITY
    + Corruption
    + Unauthorized modification

+ Key attributes of Biba
  - 3 Integrity Levels
    + **Low**
    + **Medium**
    + **High**
  - No Write Up, No Read Down
    + No Write Up
      - aka *Star(\*) Integrity Property*
      - aka *Integrity Axiom*
        + Given integrity levels cannot write to higher levels
    + No Read Down
      - aka *Simple Integrity Property*
      - aka *Simple Integrity Axiom*
        + Given integrity levels cannot read lower levels
          - Wait. WHAT???
            + User with HIGH integrity level reads from MEDIUM level data
              - That data is corrupted or inaccurate
                + That corrupted data corrupts the HIGH level user
                  - If the HIGH level user couldn't read the MEDIUM level data,
                    there would be no corruption at a higher level

+ Drawbacks
  - Very strict. Maybe too strict for many industries
    + Useful for environments where integrity is of utmost importance
      - Finance
      - Military
      - ICS
      - Intelligence agencies
      - Healthcare
