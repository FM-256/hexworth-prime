IoT, Embedded, and Edge Computing Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we'll investigate IoT, Embedded systems, and Edge Computing along with their
associated vulnerabilites. 


Resources
--------------------------
- https://azure.microsoft.com/en-us/products/windows-iot/
- https://ubuntu.com/embedded

Learning Objectives
--------------------------
+ Define IoT, Embedded Systems, and Edge Computing
+ List and describe common vulnerabilities associated with IoT, Embedded Systems, and Edge Computing systems


Notes
--------------------------
+ What is IoT?
+ What are common IoT vulns?
  - Securing constrained devices
    + Updates/Patches
      - Having a myriad of 3rd-party IoT vendors makes this difficult to manage
        + Vendors slow to release updates/patches
        + Vendors release NO updates/patches
  - Authorize and authenticate devices
    + Default|Weak|No creds for auth
    + Only admin users are available
      - No way to add lower-than-admin users
  - Secure communication
    + Developed without encryption in mind
    + Device doesn't have the "horsepower" to process encryption/decryption
  - Ensure data privacy and integrity
    + Device not developed with security in mind
  - Secure web, mobile, and cloud applications
    + OWASP Top 10


+ What is an Embedded System?
  - OS that runs IoT devices
    + Small
    + Lightweight
    + Built for IoT
      - https://azure.microsoft.com/en-us/products/windows-iot/
      - https://ubuntu.com/embedded
+ What are the common Embedded System vulnerabilities
  - Many same as IoT
    + Specific to the Embedded System
      - Malicious Firmware
      - Extracting secrets from firmware


+ What is Edge Computing?
  - Define "The Edge"
    + Usually defined as a client that receives data, instructions, and updates
      from a centralized server/service in a Server Room, Data Center, or Cloud
      - Great for clients such as
        + Desktops/Laptops/Mobile
        + Browsers
        + Apps
      - IoT has complicated it
        + They send/receive a TON of data
          - This makes processing data/instructions/updates SLOW
            + This is a problem for time-sensitive devices
              - Pressure/Heat/Radiation sensors
    + Enter Edge Computing
      - "Servers" that are close to edge clients
        + Quickly service clients
        + Acts as an intermediary to the Server Rooms, Data Centers, and Cloud
    + Vulnerabilities associated with Edge Computing
      - Physical security
      - Lack of security developed into the system
        + No/Weak authentication
        + No/Weak encryption
      - Lack of system hardening
      - Lack of updates / Slow to update / No update schedule
