# 1-12-1: Software Defined Networking

After completing this episode, you should be able to:

+ Identify and explain software-defined networking technologies, given a scenario. 

**Description:** In this episode, the learner will examine software-defined networking (SDN). We will explore various SDN components such as SDN controllers, interfaces, SDN layers, APIs, and more.


* What is a Software-Defined Network?
  + Decouples network control and forwarding functions for more flexible management.
  + Enables programmatically efficient network configuration and management.
  + SDN layers:
    + Management plane
      + Engages directly with network applications.
    + Control plane
      + Hosts the SDN controller, orchestrating flow control and policy application.
    + Data plane
      + Consists of physical and virtual network devices.
* What are the SDN Controllers:
  + The central authority that manages traffic flow and policy enforcement across the network.
  + Can be a physical or virtualized device
  + Northbound interface \(NBI\)
    + Connects the SDN controller with the applications; utilizes RESTful APIs for communication
  + Southbound interface \(SBI\)
    + Links the SDN controller with the network devices; OpenFlow is an example of a protocol used here.
* What is SD-WAN \(Software-Defined Wide Area Network\)
  + Extends SDN concepts to wide area networks and overlay networks over large geographical areas.
* What are some of the SD-WAN components?
  + Overlay Network
    + Virtualizes WAN connections to connect different parts of the network over the internet or a private network.
  + Edge Devices
    + Sit at the perimeter of a network
    + Provides connectivity and SD-WAN functionalities.
  + Controllers:
    + SD-WAN Controller
      + Oversees traffic routing, policy management, and health of the SD-WAN connections.
  + Interfaces:
    + Management Interface
      + For SD-WAN configuration and monitoring.
    + Orchestration Interface
      + Manages and synchronizes policies and settings across the SD-WAN fabric.