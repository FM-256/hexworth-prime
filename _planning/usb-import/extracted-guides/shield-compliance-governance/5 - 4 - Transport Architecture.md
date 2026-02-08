# 1-5-1: Transport Architecture

After completing this episode, you should be able to:

+ Identify the purpose of transport architecture technologies, given a scenario.

**Description:** In this episode, the learner will examine various transport technologies used to transmit data across networks. We will explore switching methods, topology considerations, and more.


+ Transport architecture \(including secure design\)
  + Organizes how data packets are transmitted across networks from source to destination.
  + Security considerations
    + Implement encryption and secure transmission protocols
    + Ensure authentication and integrity checks during data transfer.
+ Topology \(physical vs. logical\)
  + Physical topology
    + The arrangement of network cables, nodes, and network devices
    + Security implications
      + Physical security measures
      + Protect hardware from unauthorized access or tampering.
  + Logical Topology
    + Describes the way data flows within the network, independent of physical layout.
    + Security implications
      + Implement network segmentation
      + Implement strict access control to enhance security
      + Implement Zero Trust to reduce the risk of lateral \(east-west\) movement by attackers.
+ Data, control, and management planes
  + Data Plane
    + Transports user data through the network.
    + Examples
      + Switches
      + Routers
    + Security Considerations
      + Implement encryption to secure data in transit
      + Implement authentication to verify data sources
  + Control plane
    + Determines how data should be routed through the network.
    + Examples
      + SDN Controllers
      + Routing protocols
    + Security considerations
      + Protect against unauthorized changes
      + Ensure routing information integrity
  + Management plane
    + Administers the devices and their configurations.
    + Examples
      + SDN/SD-WAN Controllers
      + Control and User Plane Separation \(CUPS\) in 5G technologies
    + Security Considerations
      + Implement strong modern authentication
      + Secure access to management interfaces
      + Log all changes for accountability.
+ Switching Methods 
  + Cut-Through
    + Quickly forwards packets upon receiving the destination address without checking for errors.
    + Security Considerations
      + Vulnerable to spreading corrupted frames
      + Suitable for low-latency networks where security is less of a concern.
  + Store-and-Forward
    + Analyzes the entire frame for errors before forwarding, adding a layer of error checking.
    + Security considerations
      + Helps prevent the spread of corrupted data
      + Introduces latency
  + Fragment-Free
    + Checks only the first 64 bytes of the packet to catch common errors while maintaining lower latency.
    + Security Considerations
      + Balances between speed and security
      + Suitable for medium-security environments where some level of error checking is necessary.
