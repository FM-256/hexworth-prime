# 1-7-1: Physical and Logical Network Segmentation

After completing this episode, you should be able to:

+  Identify and explain the significance of physical and logical segmentation, including security implications.

**Description:** In this episode, the learner will examine physical and logical segmentation in networks. We will explore various technologies used to implement these techniques. 

+ What is physical segmentation?
  + The division of a network into separate, isolated physical zones, each with its own set of hardware devices and infrastructure.
  + Security Considerations
    + Provides robust security by physically separating network areas, which seeks to prevent unauthorized access and limits the spread of attacks across segments.
  + Examples
    + Installing separate switches and routers for different organizational units like Sales, Engineering, and Support.
    + Using distinct physical cabling systems for sensitive data areas compared to general office networks.
    + Implementing separate Wi-Fi networks for guest access, employee use, and management.
+ What is logical segmentation?
  + A process that divides a network into multiple, distinct segments
  + Commonly divided based on functional, departmental, or security requirements
  + Does not rely on physical separation \(such as in physical separation such as air-gapped networks
  + Security Considerations
    + Enhances security by isolating segments, containing breaches within segments, and reducing the attack surface.
  + Examples
    + Creating VLANs for different departments \(e.g., HR, Finance, IT\).
    + Segmenting network traffic using Virtual Private Networks \(VPNs\) for remote access.
    + Utilizing Virtual Routing and Forwarding \(VRF\) for isolating user groups within the same physical infrastructure.
+ What are examples of physical segmentation?
  + In-Band Management
    + Definition
      + Managing network devices through the same network that carries regular user traffic.
    + Security Considerations
      + Potentially exposes management interfaces to unauthorized access if not properly secured.
    + Examples
      + Configuring switches and routers via SSH over the corporate LAN.
      + Accessing server management interfaces through the main network.
      + Managing virtual machine hosts and their guests over the same network connection.
  + Out-of-Band Management
    + Definition
      + Utilizing a dedicated channel for network device management, separate from the network carrying user data.
    + Security Considerations
      + Enhances security by isolating management traffic from user data traffic, reducing the risk of interception.
    + Examples
      + Using a dedicated management VLAN for device configuration.
      + Employing modems for remote access to network device consoles.
      + Implementing management interfaces connected to a separate physical network.
  + Air-Gapped
    + Definition
      + Physically isolating a computer or network so it cannot connect to external networks or the internet.
    + Security Considerations
      + Provides the highest level of security by preventing remote attacks, but requires physical access for data transfer, which can be a logistical challenge.
    + Examples
      + Military networks handling classified information.
      + Industrial control systems in critical infrastructure.
      + Secure data centers with highly sensitive data requiring manual updates and maintenance.
+ What are examples of logical segmentation?
  + Virtual Local Area Networks \(VLANs\)
    + Splits a single physical network into multiple isolated logical networks to improve organization and security.
    + Security
      + Prevents unauthorized access between segments, reducing the risk of internal attacks and data breaches.
  + Virtual Private Networks \(VPNs\)
    + Creates a secure connection over a unsecure secure network, typically the internet, to connect remote users or networks.
    + Security
      + Shields data from eavesdropping and ensures confidentiality and integrity of transmitted information.
  + Virtual Routing and Forwarding \(VRF\)
    + Allows multiple instances of a routing table to coexist within the same router, thus enabling segregation of network traffic.
    + Security
      + Provides traffic isolation at the routing level, enhancing security by segregating different user groups or services.
  + Virtual domains
    + Consolidates various network resources, services, or applications under a single domain architecture for streamlined management and segmentation.
    + Security
      + Implements domain-specific security policies, effectively isolating user environments and reducing cross-domain security threats.
  