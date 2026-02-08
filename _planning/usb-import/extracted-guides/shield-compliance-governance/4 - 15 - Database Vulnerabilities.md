Database Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we'll explore cybersecurity vulnerabilities associated with database systems.


Resources
--------------------------
+ N/A


Learning Objectives
--------------------------
+ Define database systems
+ List and explain common security vulnerabilities associated with database systems


Notes
--------------------------
+ **What is a database server?**
  - A server that is specifically used as a data repository
    + Used for many types of client connections
      - Commonly HTTP/Web back-end
        + `mysql -u [username] -p -h [hostname/IP]`


+ **What are the Vulnerabilities associated with Databases?**
  - All the same as other server-based systems
    + Injection
      - SQL/NoSQL
      - Command
    + Zero-Day
    + N-Day
    + DDoS
    + Brute-Force Login
      - **Database Specific Vulns?**
        + **Aggregation** - The ability to combine non-sensitive data from separate
          sources to create sensitive information
          - pulling together lots of different information that reveals something
            when analyzed you are not supposed to know
        + **Bypass Attacks** - Users attempt to bypass controls at the front end
          of the database application to access information
        + **Concurrency (TOC/TOU)** - When actions or processes run at the same
          time, they are said to be concurrent
          - Problems with concurrency include running processes that use old data,
            updates that are inconsistent, or having a deadlock occur.
        + **Data Contamination** - The corruption of data integrity by input data errors or
          erroneous processing
          - This can occur in a file, report, or database.
        + **Deadlocking** - Occurs when two users try to access the information at the same
          time and both are denied
        + **Inference** - The ability to deduce (infer) sensitive or restricted information
          from observing available information
          - You have to guess to understand the meaning of the information that has been
            gathered --- raw data + deduction
