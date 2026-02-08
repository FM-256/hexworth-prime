Clark-Wilson
==========================

*3.2 Understand the Fundamental Concepts of Security Models*
--------------------------


Description
--------------------------
In this episode, we will define the Clark-Wilson security model as well as explore its
attributes.

Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ Define the Clark-Wilson security model and list its key attributes


Notes
--------------------------
+ What is the Clark-Wilson Model?
  - Security Model that is concerned with data INTEGRITY
    + No unauthorized modifications
    + No authorized improper modifications
  - Separation of Duties
    + Enforced to prevent conflicts of interest
    + Reduce errors/corruption
      - Either intentionally or unintentionally
    + Critical tasks are divided among multiple individuals
      - Ensures that no one person has too much control or access

+ Other attributes
  - *Well-Formed Transactions*
    + A transaction that satisfies certain rules and/or criteria
      - Ensures that the transformation it performs is valid
      - Preserves data integrity.
        + These rules typically include conditions such as:
          - Only authorized users or processes can initiate the transaction
          - The transaction must adhere to a set of predefined rules or policies
          - The transaction must leave the system in a consistent state, maintaining data integrity
          - The transaction must be certified as well-formed before execution
  - *Certification and Enforcement*
    + **Certification**
      - Checking that a transformation is Well-Formed before it can take place
    + **Enforcement**
      - Makes sure that only authorized transformations are allowed
  - *Separation of Duties*
    + It's like playing baseball.
      - Umpires
        + They enforce the rules, but don't play the game, or keep score
      - Score Keepers
        + They keep track of the scrore, but don't play the game, or enforce the rules
      - Players
        + Play the game, but don't enforce the rules, or keep score
    + Apply that to a computer system like a bank
      - User Accounts
        + Admins
          - Create, Modify, and Delete accounts
          - Don't provide account services like password resets or account lockouts
        + CSRs
          - Provide account services like password resets and account lockouts
          - No ability to create, modify, and/or delete accounts
      - Processing Transactions
        + Initiator
          - Can initiate a financial transaction
          - Can't Approve or Validate a transaction
        + Approver
          - Can't initiate a financial transaction
          - Can Approve or Validate a transaction
