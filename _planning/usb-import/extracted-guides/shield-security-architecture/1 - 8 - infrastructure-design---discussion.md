## Infrastructure design - discussion


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze the organizational requirements to determine the proper
infrastructure security design.

### External Resources:

Infrastructure design - discussion

 What is Scalability? -

 Enabling a solution to expand with changing conditions :

 Vertically - resources are added to an individual system, such as adding
 processors, memory, & storage to an existing server

          Caching & API Gateways

 Horizontally - adding servers to help process the same workload

          Content Delivery Network (CDN)


 What does designing for resiliency entail? -

 The ability to continue operating despite adverse conditions:

  • Redundancy & High Availability (HA)
  • Diversity/Heterogeneity
  • Course of Action Orchestration - closes the time gap between occurrence,
  identification, & action
  • Distributed Allocation of Workloads
  • Replication
  • Clustering


  What is Virtualization? -

  Multiple guest operating systems can be installed & run simultaneously on a
  single computer:

  • Host hardware - platform that will host the virtual environment

  • Hypervisor - manages the virtual machine (VM) environment

          Bare Metal (Type I ) vs. Application (Type II )

  • Guest operating systems, virtual machines (VM), or instances


 What is Virtual Desktop Infrastructure (VDI)? -

 Uses desktop virtualization to separate the personal computing environment from
the user's physical machine; a desktop operating system & applications are run
inside the VMs that are hosted on servers in the virtualization infrastructure

 *** The VMs are referred to as virtual desktop environments (VDEs)

 There are three main VDI deployment models:

 • Hosted - provided by a third party
 • Centralized -  hosted on virtualization infrastructure within the enterprise
 • Synchronized - Centralized + ability to continue working in a disconnected state


 What is Application Virtualization? -

 A more limited type of VDI; the client either accesses an application hosted on
 a server or streams the application from the server to the client for local
 processing:

  • Citrix XenApp (formerly MetaFrame/Presentation Server)
  • Microsoft App-V
  • VMware ThinApp

 *** Often used with HTML5 remote desktop apps, referred to as "clientless"
because users can access them through ordinary web browser software


 What is Containerization? -

 Standard unit of software that packages up code & all its dependencies; applications
 run quickly & reliably from one computing environment to another

 Virtualizes the underlying OS & causes the containerized app to perceive that
it has the OS - including CPU, memory, file storage, & network connections - all to itself

 Since containers share the host OS, they do not need to boot an OS or load
 libraries

 Constrained to the operating system they are defined for


 How does automation in cloud environments work? -

 Bootstrapping - the set of automated tasks to be performed as part of the
 deployment of an instance

 Autoscaling - policies which include specific definitions of minimum & maximum
 capacity, allowing for dynamic adjustment of performance according to observed
 loads

 Security Orchestration, Automation, & Response (SOAR) - scan security & threat
 intelligence data collected from multiple sources within the enterprise & then
 analyze it using various techniques defined via playbooks

          • Standalone vs. Bolt-on for SIEM
          • Playbook vs. Runbook


 What are common VM vulnerabilities? -

 VM escape - attacker executes code in a VM that allows an application running
 on the VM to escape & interact directly with the hypervisor; could give the
 attacker access to the underlying host O/S & all other VMs running on that
 host machine

    *** this is one of the most serious threats to virtual security

 Privilege escalation - attacker exploits a flaw in an operating system or
 application to obtain higher-level privileges & access to resources; an attacker
 with elevated privileges could access the host machine & do anything an
 administrator does

 Live VM migration - Hypervisors without proper authentication & integrity
 protocols may enable an attacker to migrate VMs to their own machine or migrate
 the VMs to a victim machine, overloading it with a denial of service (DoS) attack

 Data remnants - a concern during the deprovisioning process, as remnants of the
 virtual instance may not be completely removed from physical storage
 
