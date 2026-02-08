# 1-8-1: Micro-segmentation

After completing this episode, you should be able to:

+ Identify and explain the significance of micro-segmentation (including the security implications), given a scenario. 

**Description:** In this episode, the learner will examine micro-segmentation in network design. We will explore various technologies such as network overlays, routers, distributed firewalls, intrusion detection and prevention, zero trust, and more.

+ What is micro-segmentation?
  + A fine-grained security strategy that isolates workloads from each other to secure them individually.
  + Significantly enhances security within data centers and cloud environments by limiting lateral \(east-west\) movement of attackers.
+ What are some examples?
  + Isolating applications in a cloud environment.
  + Segmenting workloads in virtualized data centers.
  + Protecting individual virtual machines within the same physical host.
  + Implement policy-driven, application-level security controls
+ What way to accomplish micro-segmentation?
  + Containerization
    + A technology that uses virtualization to isolate applications into separate environments
    + Enhance deployment and scalability
    + Provides improved isolation 
    + Implement continuous monitoring through rigorous image scanning and management
  + Network Overlays/Encapsulation
    + Methods that create a virtual network layer over existing networks
    + Support flexible and scalable topologies
    + Allows separate control over virtual network traffic
    + Independent of physical infrastructure \(hardware agnostic\)
    + Examples
      + Utilizing VXLAN for network virtualization in cloud environments.
      + Creating GRE tunnels for secure point-to-point connectivity.
      + Setting up MPLS networks for efficient and secure data forwarding.
  + Distributed Firewalls
    + Security solutions implemented across various network points
    + Enforce policies tailored to specific network segments or resources
    + Offers granular security control
    + Examples
      + Implement policies directly to workload levels for precise protection.
      + Positioning firewalls within virtualized environments and strategic points within segmented network areas.
      + Configure host-based firewalls on enterprise servers
  + Intrusion Detection and Prevention Systems (IDPS)
    + Systems that monitor network or system activities to detect malicious actions or policy violations. 
    + Actively preventing identified threats from executing in network environments in real-time
  + Routers
      + Network devices that manage traffic between different networks based on IP addresses.
      + Can help to segment and control access between networks
    + Examples
      + Utilizing edge routers for defining secure boundaries between networks
      + Employing interior routers to direct internal traffic efficiently
      + Deploying routers with integrated security features for traffic control
+ What is Zero Trust?
  + A strategic approach to modern networks
  + Enforces strict access controls and authentication across all network resources
  + Principles
    + Never trust, always verify - treat all users and devices as potentially hostile
    + Least privilege access - grant users and devices the minimum access necessary
    + Assume breach - operates under the assumption that threats may already exist within
