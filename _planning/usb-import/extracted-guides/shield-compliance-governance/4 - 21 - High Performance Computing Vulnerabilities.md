High Performance Computing Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we will attempt to define High-Performance Systems, explore their common
use, and list out a few of the common security vulnerabilites associcated with them.


Resources
--------------------------
+ https://www.top500.org/lists/top500/2023/11/
+ https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-223.pdf
  

Learning Objectives
--------------------------
+ Define High-Performance Computing(HPC)
+ List and explain the practical use of HPCs
+ List and explain the vulnerabilities associated with HPCs


Notes
--------------------------
+ What is an HPC?
  - Supercomputers
  - Clusters
    + Used for doing complex math efficiently and rapidly
+ Practical Uses for HPCs
  - Weather Forcasting
  - Climate Modeling
  - Financial Modeling and Risk Analysis
  - Genomic Sequencing and Bioinformatics
  - Geological Exploration
    + Precious Commodities (oil and gas)
    + Seismic Activity
  - Astrophysics and Cosmology
  - Aerodynamic and Fluid Dynamics
    + [Top500 Supercomputers](https://www.top500.org/lists/top500/2023/11/)
+ High Performance Computing Vulnerabilities
  - HPCs are built for speed not security
    + Good defensive strategies can be cost-prohibitive
      - HPC datasets are MASSIVE!
  - [NIST SP 800-223](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-223.pdf)
  - HPC Functional Zone Threats
    + *Access Zone Threats*
      - Controls Authentication and Authorization to the HPC system
      - The only portion of the HPC connected to external networks
        + Brute-Force
        + Session-Hijacking
        + DoS
        + Injection Attacks against software app
    + *Management Zone Threats*
      - Administrative area of HPC
        + Management systems can be running with `root` level permissions
          - Vulnerable to *Privilege Escalation* attacks
    + *HPC Zone Threats*
      - Where the actual computing is done
        + Software vulnerabilities
        + Multi-tenancy environment
          - Container escape
          - Side-Channel Attacks
          - Data Leakage
        + Resource Consumption
        + Priv Esc
    + *Data Storage Zone Threats*
      - CIA
        + *Confidentiality*
          - Data leaks via metadata and/or user mishandling
        + *Integrity*
          - Deletion
          - Corruption
          - Pollution
          - Injection
        + *Availability*
          - No backups
    + *Other Threats*
      - Insider Threats
      - Physical Attacks
      - Environmental Risks
