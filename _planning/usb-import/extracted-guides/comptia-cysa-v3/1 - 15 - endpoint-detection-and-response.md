Filename: cysa-1b-2-3-1-endpoint-detection-and-response.md
Domain: Tools and Techniques for Determining Malicious Activity
Episode: Endpoint Detection and Response
=========================================================================

Endpoint Detection and Response
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ What is EDR?
  - Utilizes ML, Behavioral Analysis, and Threat Hunting to detect
    suspicious activity
    + Detects sophisticated and targeted attacks
      - Also blocks and alerts
+ How is it different from AV?
  - AV PREVENTS malware from infecting endpoints
  - EDR DETECTS and RESPONDS to malware that makes it past AV
+ How does it work?
  - Admin installs an agent (typically)
    1. Monitors and collects data
      - User activity
      - System activity
    2. Builds baselines
    3. Watches for unusual User and/or System behavior
      - Network activity
      - File Access
      - System changes
      - Data exfiltration
      - Data encryption (ransomware)
      - Malware signatures
    4. Automated Response and Remediation
    5. Reporting
