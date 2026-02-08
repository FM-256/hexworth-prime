Virtualization and Container Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we will dive into virtualization and containerization, specifically exploring the
common vulnerabilities associated with each.


Resources
--------------------------
+ https://www.vmware.com/products/esxi-and-esx.html
+ https://csrc.nist.gov/pubs/sp/800/190/final
+ https://hub.docker.com
+ https://unit42.paloaltonetworks.com/docker-patched-the-most-severe-copy-vulnerability-to-date-with-cve-2019-14271/


Learning Objectives
--------------------------
+ Define virtualization
+ Define containers and containerization
+ List and define the common vulnerabilities associtated with virtualization and containers


Notes
--------------------------
+ Virtualization
  - VM sprawl
  - Sensitive data within a VM
  - Security of offline & dormant VMs
  - Security of pre-configured (golden image) VM/active VMs
  - Lack of visibility and control over virtual networks
  - Resource exhaustion
  - Hypervisor security
  - Unauthorized access to hypervisor
  - Account or service hijacking through the self-service portal
  - Workloads of different trust levels located on the same server
  - Risk due to cloud service provider APIs
+ Containers
  - [Docker Hub](https://hub.docker.com/)
    + Download and run the *httpd/apache2* docker container
      - `docker ps -a`
      - `docker stop [containerID]`
      - `docker rm [containerID]`
  - [NIST SP 800-190](https://csrc.nist.gov/pubs/sp/800/190/final)
    + *Application Container Security Guide*
  - Insecure Images
    + Stranger Danger!
  - Priv Esc
  - Inadequate Isolation
    + [Container Escape](https://unit42.paloaltonetworks.com/docker-patched-the-most-severe-copy-vulnerability-to-date-with-cve-2019-14271/)
  - Exposed APIs
  - Data Leakage
  - Insecure Dependencies
  - Orchestration Misconfiguration
  - Supply Chain Attacks
