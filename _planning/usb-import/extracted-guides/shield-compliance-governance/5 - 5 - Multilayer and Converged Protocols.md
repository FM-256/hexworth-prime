# 1-4-1: Multilayer and Converged Protocols

After completing this episode, you should be able to:

+ Identify and explain the significance of multilayer and converged protocols

**Description:** In this episode, the learner will examine multilayer and converged protocols. We will explore protocols such as DNP3, Fibre Channel over Ethernet, InfiniBand over Ethernet, Compute Express Link, and more.

+ What are multilayer protocols?
  + Designed to operate across different layers of the network model, facilitating communication and data exchange by integrating functions of multiple OSI or TCP/IP stack layers.
+ What are some examples of multilayer protocols?
  + ARP \(Address Resolution Protocol\)
    + A protocol used to resolve the MAC address of a device from its IP address within a local network segment.
    + Multilayer nature - ARP operates between the network \(Layer 3\) and the data link \(Layer 2\) layers of the OSI model or between the Internet and Network Interface layers of the TCP/IP model, mapping IP addresses to physical MAC addresses.
+ What is Distributed Network Protocol?
  + A set of protocols used by components in process automation systems, primarily in utilities such as Supervisory Control and Data Acquisition \(SCADA\) systems.
  + Benefits - Ensures reliable and secure communication for monitoring and controlling networked devices in critical infrastructures.
+ What is IP convergence?
  + The process of integrating various types of communication networks, such as voice, data, and video, into a single, unified network protocol, IP (Internet Protocol).
  + Benefits
    + Reduces network complexity and costs
    + Improves efficiency
    + Can enable easier management and scalability
+ What are converged protocols?
  + Networking protocols that support the transmission of multiple types of traffic:
    + like voice, video, and data over a single network infrastructure.
  + Benefits
    + Seamless communication across different media types
    + Supporting diverse applications
    + Utilizing a single network architecture.
+ What are some examples of converged protocols
  + FCoE \(Fibre Channel over Ethernet\)
    - Definition - an encapsulation of Fibre Channel frames over Ethernet networks, allowing Fibre Channels to use high-speed Ethernet infrastructure.
    - Benefits - Provides Fibre Channel's reliability and high-speed data transfer using conventional Ethernet networks, reducing complexity and costs.
  + InfiniBand over Ethernet
    - Definition - a technology that extends the high throughput and low latency of InfiniBand to Ethernet networks.
    - Benefits - Offers the performance benefits of InfiniBand while leveraging the widespread adoption and scalability of Ethernet.
  + iSCSI \(Internet Small Computer Systems Interface\)
    - Definition - an IP-based networking standard for allowing SCSI commands to be sent over LANs, WANs, or the Internet.
    - Benefits - Enables long-distance storage management and disaster recovery solutions at lower costs compared to traditional Fibre Channel SANs.
  + VoIP \(Voice over Internet Protocol\)
    - Definition - a technology, allowing voice calls using routable IP-based networks
    - Benefits - Reduces call costs, integrates with other services like email and fax, and offers greater flexibility and mobility.
  + CXL \(Compute Express Link\)
    - Definition - a high-speed CPU-to-device and CPU-to-memory interconnect designed to accelerate next-generation data center performance.
    - Benefits - provides a high-bandwidth, low-latency connection between the CPU and workloads such as accelerators, memory expansion, and smart I/O devices.
