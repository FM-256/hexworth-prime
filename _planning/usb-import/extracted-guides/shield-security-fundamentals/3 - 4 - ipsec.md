## IPSec			

At the end of this episode, I will be able to:    

1. Describe the components and importance of IPSec.    	

Learner Objective: *Describe the components and importance of IPSec.* 		   

Description: In this episode, the learner will dive into the components of IPSec and learn the importance that IPSec plays in secure network communications. 	

--------

* IP Security - a group or suite of open standard protocols used to authenticate and encrypt data packets sent over an IP-based network. The most common protocols are:	
	+ Authentication Header \(AH\) - provides data integrity and data origin authentication, providing protection against replay attacks. 	
	+ Encapsulation Security Payload \(ESP\) - provides confidentially through encryptions, data integrity, data origin authentication and anti-replay protections.
	+ IPSec operates in two modes:
		- Transport mode - in this mode the IP packet is encrypted or authenticated. 	
		- Tunnel mode - in this mode the entire IP packet is encrypted and then encapsulated into another IP packet and IP header. This is the mode that is used to create VPN connections.	
	+ Security Association - a trust relationship between two IPSec enabled computers that are used to define the parameters of the IPSec communication and send encrypted communications.	
