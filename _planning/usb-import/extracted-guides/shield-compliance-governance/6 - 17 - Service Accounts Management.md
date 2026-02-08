# Service Accounts Management       

After completing this episode, you should be able to:

+ Describe service accounts and a strategy for service account management in the modern enterprise  

**Description:** In this episode, you will learn about the importance of service accounts in an IAM system. This episode emphasizes a strong lifecycle management approach to these important accounts. 

## Service Accounts Management         

A service account might also be called an application account. It is a digital identity used by application software or services to interact with other applications or the underlying Operating System. 

Often used with machine to machine communication - for example API requests. 

These accounts are often considered privileged identities. 

We need to understand the password process that exists with service accounts. Many famous breaches have been caused by the failure of any password protection techniques associated with the service accounts. 

Service accounts are often the subject of attack. Several possible misuses include: 

+ Privilege escalation - someone impersonates the service account and elevates their privileges 
+ Spoofing - someone impersonates the service account to hide their identity 
+ Non-repudiation - use of the service account to hide actions performed on the system 
+ Information disclosure - unauthorized individuals extract information about the infrastructure using the service account 

## Additional resources

+ Service Accounts: <https://en.wikipedia.org/wiki/Service_account>