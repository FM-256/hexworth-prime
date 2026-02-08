Filename: cysa-1b-3-3-1-cti-confidence-levels.md
Domain: Threat Intelligence and Threat Hunting Concepts
Episode: CTI Confidence Levels
=========================================================================

CTI Confidence Levels
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ **Three CTI Types**
  1. *Strategic*
    + Long-term planning
    + Focuses on the "Who" and "Why"
      - Identify potential vulns and threats
      - Identify adversarial motives and capabilities
  2. *Tactical*
    + More "Short-Term" planning
    + Tailored to specific teams, operations, and investigations
      - Focuses on TTPs of likely adversaries 
      - Aids in Threat Hunting efforts
  3. *Operational*
    + Focuses on responding to active threats
    + Utilizes technologies to actively defend systems
      - SIEM
      - SOAR
      - EDR
      - IDS/IPS
      - IOCs
    + Threat-intel feeds
      - Anomali
      - Carbon Black
      - OpenCTI
        + https://demo.opencti.io
+ **Timeliness Levels**
  - Historic/Past
    + LEAST Relevant
    + Outdated
  - Current/Present
    + MOST Relevant
  - Forecasted/Future
    + MODERATELY Relevant
    + Projected/Predicted Intel
  - Indeterminate/Unknown
    + LIMITED Relevancy
    + Not enough is known to assess reliability
+ **Relevancy Levels**
  - Low
    + Too generic
  - Moderate
    + Somewhat generic
      - But still has indications that it could be useful
  - High
    + Specific to your org/systems
  - Very High
    + Highly specific
    + Tailored to your org/systems
+ Accuracy Levels
  - Low
    + Incomplete
    + Outdated
    + Unverified sources
  - Moderate
    + Partially verified
      - Still some uncertainty about accuracy
  - High
    + Verified
  - Very High
    + Extensively verified
