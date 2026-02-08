## Secure Protocols	

At the end of this episode, I will be able to:    

1. Compare and contrast secure protocols.    	

Learner Objective: *Compare and contrast secure protocols.* 		   

Description: In this episode, the learner will explore a variety of protocols that secure data communications on modern networks.	

--------

* Secure Protocols - secure protocols should be used in network communications, to reduce the likelihood eavesdropping or unauthorized access to the data within the communication. These protocols implement encryption to protect the communication between source and destination. 		
* Protocol examples	
	+ Transport Layer Security \(TLS\) - this is a protocol that is implemented to create secure communications to mitigate eavesdropping and data tampering. This protocol is used in email, voice over IP and most commonly HTTPS or secure websites. 
	+ HTTP vs. HTTPS	
		- Hypertext Transfer Protocol - this protocol is the protocol used to connect to web servers for the purposes of viewing websites. The HTTP protocol is does not protect the data that is transmitted between the client's web browser and the web server and is vulnerable to eavesdropping. 	
		- Hypertext Transfer Protocol Secure \(Originally Hypertext Transfer Protocol over Secure Socket Layer\) - this version of HTTP adds an encryption element that scrambles the data being transferred between the client's web broswer and the web server reducing the likelihood of eavesdropping and data tampering.	
	+ Telnet vs SSH		
		- Telnet is older protocol that allows for a bi-directional text-based communication with remote devices or a server. The Telnet protocol lacks encryption and sends communications in cleartext making it vulnerable to eavesdropping and data tampering.	The Telnet protocol has be largely succeeded by Secure Shell or SSH.				
		- Secure Shell - this protocol allows for remote connections to network devices. This remote connection protocol employs encryption to secure the communication between the client and remote device to mitigate the risk of eavesdropping and data tampering.	
	+ FTP vs. SFTP
		- File Transfer Protocol - this is a client/server protocol that is optimized for transferring files over a network, between a server and network client. This protocol does not employ encryption and is vulnerable to eavesdropping
		- Secure FTP - This is a client/server protocol actually using combination of protocols. Secure FTP uses both SSH and FTP. The connection between the client and server is established using and SSH connection with file transfers being perform via FTP through the encrypted SSH connection to prevent eavesdropping and data tampering.	
	
