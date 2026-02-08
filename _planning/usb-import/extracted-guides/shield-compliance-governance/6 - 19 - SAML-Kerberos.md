# SAML-Kerberos       

After completing this episode, you should be able to:

+ Describe the technologies of SAML and Kerberos and discuss how these can be used in modern authentication systems    

**Description:** In this episode, you will learn two protocols that can be used in the authentication process. These protocols are SAML and Kerberos.   

## SAML and Kerberos          

SAML is the Security Assertion Markup Language. It is an open standard that is based on the earlier XML. It is commonly used to exchange authentication and authorization information between federated organizations. It is often used to provide SSO capabilities for browser access. 

The SAML 2.0 specification works with the three entities here: 

+ Principal or user agent - the user trying to access an account 
+ Service provider (SP) - the website the user is trying to access 
+ Identity provider (IdP) - a third party that hold the user authentication and authorization information 

Kerberos is an SSO system used within networks. It is a ticket authentication mechanism that uses a third-party entity to prove identification and provide authentication. Once a user authenticates and proves their identity, Kerberos uses this identity to issue tickets. Users accounts present these tickets when accessing resources. 

Kerberos uses several different components in its operation: 

+ Key Distribution Center - this is the trusted third party that provides authentication services; all clients and servers are registered with the KDC
+ Kerberos Authentication Server  - this system hosts the functions of the KDC; it contains ans authentication service that verifies or rejects the authenticity and timeliness of tickets 
+ Ticket - an encrypted message that provides proof the subject is permitted to access an object 
+ Ticket-Granting Ticket - this ticket provides proof that a subject has authenticated through a KDC and is authorized to request tickets to access other objects 
+ Kerberos principle - this is typically a user account, but can be any entity that can request a ticket 
+ Kerberos Realm - a logical area controlled by Kerberos 

Kerberos requires a database of accounts. In Windows environments, this is the Active Directory (AD). 

## Additional resources

+ SAML Explained in Plain English: <https://www.onelogin.com/learn/saml>
+ Kerberos: <https://en.wikipedia.org/wiki/Kerberos_(protocol)>