## Network Isolation		
At the end of this episode, I will be able to:    

1. Describe the purpose and techniques of network isolation. 	   	

Learner Objective: *Describe the purpose and techniques of network isolation.* 		

Description: In this episode, the learner will explore the attributes and techniques of network isolation such as network address translation, virtual private networks, perimeter networks, server and domain isolation as well as honeypot.	

--------

* Network Isolation - the process of dividing a network into discrete divisions based on the security requirements of the organization. Then other security technologies can be implemented to the divisions to strengthen the security of the network.		
	+ Network address translation - this is a process that maps non-routable private IP addresses to public IP addresses. This reduces the amount public IP addresses that an organization needs to use. The process of address translation obfuscates in private IP addresses of the devices on the private network.	
	+ Virtual private networks \(VPN\) - a technology that creates a secure software-based point-to-point connection using a combination of private and public communication links.		
		- Tunneling - One of the components of a VPN communication that uses a protocol to create a secure method of transport data across public networks via encapsulation. 
			* Point-to-point Tunneling Protocol \(PPTP\)- a widely supported, largely obsolete tunneling protocol developed by Microsoft used in VPN communications. This protocol has security weakness and should be avoided. 	
			* Layer 2 Tunneling Protocol \(L2TP\) -  this protocol is a combination of Microsoft's PPTP and Cisco's Layer 2 Forwarding \(L2F) protocol, considered more secure then PPTP when coupled with IPSec encryption. 	
		- Encapsulation - this is a technique in network communications that hides an original data packet by wrapping it inside another packet.	 
		- VPN encryption - the process that transforms plaintext data into ciphertext data using asymmetric key encryption.	 
			* Microsoft Point-to-point Encryption \(MPPE\) - an older encryption standard used in dial-up and PPTP VPN connections that is considered weak today and should be avoided.	
			* IPSec - a collection or suite of security technologies use for authentication and encryption as well in L2TP VPN connections. 	
	+ Perimeter networks  - this type of network commonly borders a private network, coupled with a firewall that is a barrier between a private network and a public network. These are typically used when an organization wants to provide public access to a network resource such as a web server, but does not want to give public access to other private internally networked resources. 		
	+ Server and domain isolation - these techniques use IPsec authentication and encryption to create restricted communications. Administrators can create policies that restrict which devices can or cannot communicate. 		
	+ Honeypots - these are network-attached system, placed in perimeter networks as decoys to deflect, detect and monitor unauthorized access attempts by threat actors.	 