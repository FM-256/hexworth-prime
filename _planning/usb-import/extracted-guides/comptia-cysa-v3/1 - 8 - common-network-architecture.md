Filename: 1-7-1-common-network-architecture.md
Domain: System and Network Architecture Concepts in Security Operations
Episode: Common Network Architecture
=========================================================================

Common Network Architecture
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------


+ On-Prem
+ Cloud
+ Hybrid
  - Wired and Wireless connections
  - Public and Private networks
  - Cloud and On-Prem resources
+ Network Segementation
  - Logically and/or Physically segmented
  - Limits attacker's ability to laterally move
  - Access to critical systems and data are also limited
+ Zero Trust
  - Never Trust. Always verify.
    + Request and connections are NEVER trusted
	- Applies to External AND Internal sources and locations
	  + Employs a lot of Monitoring and Analysis
	    - IDS/IPS
	    - User Entity Behavior Analytics
 	    - Traffic Analysis
+ Secure Access Secure Edge (SASE)
  - Provides secure access to network resources from anywhere
    + Combines
	- SD-WAN
	- SaaS
	- CASBs
	- Zero Trust Network Access
+ Software-Defined Networking (SDN)
  - Traditional Networking
    + Control Plane
    + Data Plane
      - Each network device must be configured by the admin
        + These devices(routers/switches/etc) handle both the
          Control and Data Planes to make decisions about where
   	    traffic should go, and then actually send the traffic
  - SDN
    + Does all that, but in a different way
	- Centralized software-based controller
	  + Single point of control for the entire network
	    - Admin defines policies and rules for how network
            data should flow
		+ SDN makes it happen
    + Toy Cars analogy
	- You have a bunch of toy cars that you wish to move around
	- You have a friend that knows everything about those cars
 	  and can communicate with their GPS
	- You tell your friend how you want the cars to move
	  + Sedans go North
	  + Coupes go South
	  + Trucks go East
	  + Vans go West
	- Your friend then communicates with the cars to get them
	  where they need to go
	  + "Updates their GPS"
