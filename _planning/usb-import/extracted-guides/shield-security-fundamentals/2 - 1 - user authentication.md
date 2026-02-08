## User Authentication
At the end of this episode, I will be able to:    

1. Describe the characteristics and importance of user authentication.    

Learner Objective: *Describe the characteristics and importance of user authentication.*    

Description: In this episode, the learner will dive into user authentication as well as the types of authentication factors, multifactor authentication, Windows Hello and Kerberos.  

--------

* User Authentication - a process that attempts to verify that a user is who they claim to be, prior to gaining access to network and computing resources.			
	+ Authentication Factors		
		- Something you know - knowledge-based authentication, such as a password, secret or PIN		
		- Something you have - possession-based authentication, such as a smartcard, key fob, authenticator app, one-time password generator		
		- Something you are - physical characteristic-based authentication, such as biometrics \(voice recognition, fingerprint scanner, facial recognition, hand geometry scanner)		
	+ Multifactor authentication - an authentication process that requires the 	combination of two or more authentication factors	
		- Examples	
			* Password \(Something you know\) + smartcard \(Something you have\)		
			* Key fob \(Something you have\) + fingerprint scanner\(Something you are\)		
			* PIN \(Something you know\) + voice recognition \(Something you are\)	
* Decentralized Authentication - an authentication implementation in which each system maintains a user or identity and authentication database, without a centralized authentication authority to verify user credentials.
	+ Easy to implment
	+ Also known as local authentication 
	+ Excessive administrative overhead
	+ Not scalable
	+ This is type of authentication is used in peer-to-peer or workgroup networking models
	+ User accounts for each authorized user must be created on each system that users require access to.
* Centralized Authentication - this authentication implementation has a single user identity and authentication database, that is controlled by a single authority \(although multiple instances of the same authority can exist\)	
	+ Requires enterprise implementations
	+ Reduced administrative overhead
	+ Scalable
	+ This type of authentication is implemented in Windows Active Directory with a domain controller being the single authenticating authority \(multiple instances of the same database can be stored on more than one domain controller\)
* Authentication Protocols
	+ NT Lan Manager - an authentication mechanism built into the Windows operating system.
	+ Kerberos - an open standard, authentication protocol used to verify the identity of a user or host \(computer\). Kerberos authentication is the default authentication mechanism used in an Active Directory domain and provide an SSO or single sign-on.	