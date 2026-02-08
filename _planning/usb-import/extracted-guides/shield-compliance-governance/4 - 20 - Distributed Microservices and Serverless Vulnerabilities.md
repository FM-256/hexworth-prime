Distributed, Microservices, and Serverless Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we'll assess Distributed systems, Microservices, and Serverless systems by defining each
and covering common vulnerabilities associated with them.


Resources
--------------------------
+ N/A


Learning Objectives
--------------------------
+ Define Distributed Systems
+ Define Microservices
+ Define Serverless
+ List common vulnerabilities affecting Distributed Systems, Microservices, and Serverless systems


Notes
--------------------------
+ Distributed Systems
  - Breaking up of a large, monolithic system
    + Spreading duties across many systems
      - Client-Server Architecture
        + Clients request services or resources over a network
        + Servers are tasked with fulfilling client requests
      - Peer-to-Peer Architecture
        + Each node in the network can act as both a client and a server
          - Sharing resources and services directly with other nodes
            + No need for centralized coordination
           

+ Microservices
  - Replaces monolithic application architecture
    + Small single services
      - Connects using API calls
        + Manageable
        + Flexible
        + Scalable
       

+ Distributed System Vulnerabilities
  - Network Communication
    + MiTM
    + Sniffing 
  - API
    + Sensitive Data Leaks
      - Keys
      - Info
  - Auth and Access Misconfiguration
  - Resource Exhaustion
    + DoS Attacks
  - OS and Software Vulns


+ Serverless
  - No worry for the underlying infrastructure
    + Just push your code and the cloud provider provides the infrastructure
      - AWS Lambda
  - Vulnerabilities
    + Insecure Coding Practices
    + Injections
    + Sensitive Data Exposure
    + Weak/Broken Auth/Access
    + Security Misconfigurations
    + DoS/DDoS
    + Insecure Deserializations
      - XXE
      - Python Pickles
