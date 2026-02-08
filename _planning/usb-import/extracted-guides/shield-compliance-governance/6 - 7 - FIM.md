# FIM  

After completing this episode, you should be able to:

+ Describe Federated Identity Management (FIM) as it is used in organizations today     

**Description:** In this episode, you will learn some of the most critical aspects of Federated Identity Management (FIM) as it is exists in corporate environments today.    

## Federated Identity Management (FIM)     

Federated Identity Management (FIM) is a system that enables users to access multiple interconnected systems or applications using a single set of credentials, such as username and password. Instead of maintaining separate credentials for each system, users authenticate themselves once to an identity provider (IdP), which then authenticates them and issues security tokens. These tokens can be used to access various services or resources across different domains or organizations.

Key components of Federated Identity Management include:

+ Identity Provider (IdP): The IdP is responsible for authenticating users and issuing security tokens upon successful authentication. It acts as a trusted third party that verifies the identity of users.
+ Service Provider (SP): The SP is the entity that hosts the services or resources that users want to access. It relies on the security tokens issued by the IdP to authenticate users and grant them access.
+ Security Token: After successful authentication, the IdP issues a security token to the user. This token contains information about the user's identity and permissions. There are various token formats, such as Security Assertion Markup Language (SAML) or JSON Web Tokens (JWT), depending on the protocol used for communication between the IdP and SP.
+ Federation Protocol: Federated Identity Management relies on standardized protocols for communication between the IdP and SP. Common protocols include OpenID Connect, and OAuth. These protocols define how authentication and authorization requests and responses are exchanged between parties.

Some of the key benefits of Federated Identity Management include:

+ Single Sign-On (SSO): Users only need to authenticate once to access multiple services, reducing the need to remember multiple sets of credentials and improving user experience.
+ Improved Security: Centralized authentication and authorization processes allow for better control over user access and permissions. Additionally, federated authentication protocols often incorporate strong encryption and security measures.
+ Interoperability: FIM enables seamless integration between systems and applications across different domains or organizations, facilitating collaboration and data sharing.
+ Reduced Administrative Overhead: Since user management tasks are centralized, organizations can streamline administrative processes, such as user provisioning and deprovisioning.

Notice that organizations will often use the services of a third party when it comes to FIM. There are three common options for how this 3rd party is implemented: 

+ On-premise - the FIM software and services are all located on premises 
+ Cloud - the third party FIM assistance is located in the cloud 
+ Hybrid - the third party FIM is a mix of on-premise and cloud-based resources 

## Additional resources

+ What is FIM?: <https://www.techtarget.com/searchsecurity/definition/federated-identity-management>