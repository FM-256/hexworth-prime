## Audit Policies 
At the end of this episode, I will be able to:    

1. Explain the attributes and importance of audit policies.    

Learner Objective: *Explain the attributes and importance of audit policies.* 	   

Description: In this episode, the learner will examine audit policies as well as the types of audit policies.			
	
--------

* Audit Policies   
	+ Types of audits \(Security audit policies\)  
		- Logon events - determines whether to audit each instance of a user logging on to or logging off from a device.    		
		- Account management - determines whether to audit each event of account management on a device.    	 
		- Object access - determines whether to audit the event of a user accessing an object for example, a file, folder, registry key, printer.		
		- Policy change - determines whether to audit every incident of a change to user rights assignment policies, audit policies, or trust policies.		
		- Privilege use - determines whether to audit each instance of a user exercising a user right.
		- System event - determines whether to audit when a user restarts or shuts down the computer or when an event occurs that affects either the system security or the security log
	+ Configuring auditing - launch the Local Security Policy editor and browse to Security settings > Local Policies > Audit Policy > right-click any policy > properties > Local Security Setting > Audit these attempts: > Success/Failure
	+ Audit storage - audit logs are stored in the same location as Event Viewer logs.	
		- C:\Windows\System32\winevt\Logs\Security.evtx
