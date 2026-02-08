Security Model Types
==========================

*3.2 Understand the Fundamental Concepts of Security Models*
--------------------------


Description
--------------------------
In this episode, we will list and define the different types of Security Models.

Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ List and define the different types of common security models


Notes
--------------------------
+ What are the Types of Security Models we need to understand?
  - State Machine
  - Multi-level Lattice
  - Matrix-Based
  - Non-Interference
  - Information Flow
  - Take-Grant
 
+ **State Machine**
  - A given system has a number of possible "states"
    + Each state behaves in a predetermined way
  - There are "transitions" that can occur, moving the system from one state to another
    + Rules are defined that allow each transition
  - There are "events" that cause the transitions
    + Each event, transition, and state are accounted for and are strictly governed
      - This prevents security incidents

+ **Multi-Level Lattice**
  - Focused mainly on **Confidentiality** and **information flow**
  - Utilizes levels of access
    + **Upper Bounds** = Most Permissive
    + **Lower Bounds** = Most Restrictive
  - Meet and Join
    + Meet`[^]`: Used to find the greatest lower bound of two permissions
    + Join`[v]`: Used to find the least upper bound
      - Essential for determining the resulting permission set when combining or comparing different access levels
       ```
             (All Permissions)
                    /   \
              (Read)   (Write)
                 /       \
            (Read-Only)   (Write-Only)
               /           \
        (Restricted Read)  (Restricted Write)
       ```



+ **Matrix-Based**
  - A mapping of subjects and objects to their permissions
    ```
    +---------------------+----------------------+----------------------+----------------------+
    |                     | Resource A           | Resource B           | Resource C           |
    +---------------------+----------------------+----------------------+----------------------+
    | User 1              | Read, Write          |                      | Read, Execute        |
    +---------------------+----------------------+----------------------+----------------------+
    | User 2              |                      | Read                 | Read, Write, Execute |
    +---------------------+----------------------+----------------------+----------------------+
    | Admin              | Read, Write, Execute | Read, Write, Execute | Read, Write, Execute  |
    +---------------------+----------------------+----------------------+----------------------+
    ```

+ **Non-Interference**
  - Aim to ensure that the actions of lower-level users or processes do not interfere with the security or integrity of higher-level information.

+ **Information Flow**
  - Blocks the flow of information from one entity to another that violates or negates the security policy
  - The "Pump"
    + Prevents the flow of information from a lower level to a higher level
      - One-way valve
        + When subject alters, accesses, and/or observes and object

+ **Take-Grant**
  - Consists of
    + Subjects (users, programs, systems)
    + Objects (resources like files, folders, binary apps)
    + Rights
      - Take: The ability to acquire permission(s) from another Subject
        + Gaining additional permissions beyond initial permissions
      - Grant: The ability to delegate permission(s) to another Subject
        + Sharing permissions with other Subjects
      - Create: Generate new Subjects or Objects in the system
      - Delete: Remove Subjects or Objects from the system
  - Example
    + Teacher and 2 students (Bobby and Alice)
      - Teacher(subject) *grants* permission to Alice(subject) to use the Jump Rope(object)
        + Alice *takes* permission to use the Jump Rope
          - Alice *grants* permission to Bobby to use the Jump Rope
            + Bobby takes permission from Alice to use the Jump Rope
