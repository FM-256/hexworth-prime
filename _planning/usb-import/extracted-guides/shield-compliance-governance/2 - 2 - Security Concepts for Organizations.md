# Security Concepts for Organizations

After completing this episode, you should be able to:

+ Discuss basic security concepts that organizations should consider.. 

**Description:** In this episode, you will learn about the basic concepts of information security. This discussion covers defense in depth, layered defense, authentication, authorization, accountability, least privilege, and need to know.    

## Security Concepts for Organizations       

Defense in Depth and Layered Defense are strategic approaches to cybersecurity that are fundamental to understanding and applying security concepts. These strategies are designed to provide multiple layers of security controls (physical, technical, and administrative) throughout an information system's architecture, ensuring that if one layer fails, others still provide protection. This approach enhances the overall security posture by addressing potential vulnerabilities in various areas, including network, endpoint, application, data, and user security.

**Defense in Depth**

Defense in Depth is a holistic approach to cybersecurity that involves implementing multiple layers of security measures to protect the integrity, confidentiality, and availability of information. 

In cybersecurity, Defense in Depth translates to the deployment of diverse security mechanisms that protect data across all levels of an organization. This includes employing firewalls, intrusion detection systems, malware protection, data encryption, access controls, and policies and procedures that work together to defend against threats.

**Layered Defense**

Layered Defense is a component of the Defense in Depth strategy, specifically referring to the stacking of different security measures to protect various aspects of an information system. Each layer addresses different vectors through which an attack or breach can occur.

A layered defense strategy might include network layer security (firewalls, network segmentation), application layer security (application firewalls, secure coding practices), endpoint security (antivirus, device management), and user training and awareness programs. The idea is to create a comprehensive security model that covers all bases.

Security professionals are expected to:

- Design and Implement Security Architectures: Use Defense in Depth principles to design and implement robust security architectures that mitigate risks from various threat vectors.
- Assess and Manage Risk: Identify potential vulnerabilities at different layers and apply appropriate controls to manage and mitigate risks effectively.
- Ensure Comprehensive Protection: Understand that no single security measure is foolproof and that a combination of controls is necessary to protect against sophisticated and evolving threats.
- Promote Security Awareness: Recognize the role of human elements in cybersecurity and implement training and awareness programs as part of the layered defense strategy.

**Authentication** 

Authentication is a fundamental security mechanism used to verify the identity of users, systems, or entities attempting to gain access to secured resources. It forms the basis of access control and plays a crucial role in maintaining the confidentiality, integrity, and availability of information systems. 

Core Aspects of Authentication:

- Verification of Identity: Authentication involves confirming an entity's claimed identity through various factors, such as something the entity knows (e.g., password), something the entity has (e.g., security token), something the entity is (e.g., biometric characteristic), or somewhere the entity is (e.g., geolocation). This process ensures that only authorized entities can access sensitive data or systems.
- Foundation for Security: Authentication is a prerequisite for implementing further security measures, such as authorization and accountability. Once an entity's identity is verified, the system can determine the resources and actions permitted for that entity and audit their activities.
- Types of Authentication:
  - Single-Factor Authentication (SFA): Involves only one method of verification, typically a password or PIN.
  - Multi-Factor Authentication (MFA): Requires two or more verification methods from different categories, significantly enhancing security by adding layers of defense. An example is using both a password (something you know) and a smart card (something you have).
  - Biometric Authentication: Uses unique biological characteristics (something you are) for verification, such as fingerprints, facial recognition, or iris scans.
  - Authentication Protocols and Mechanisms: Various protocols support the authentication process, including Kerberos, Secure Sockets Layer (SSL)/Transport Layer Security (TLS) for web authentication, and Remote Authentication Dial-In User Service (RADIUS) for network access.

Authentication is a prerequisite for implementing further security measures, such as authorization and accountability. Once an entity's identity is verified, the system can determine the resources and actions permitted for that entity and audit their activities.

**Authorization** 

Authorization refers to the process of granting or denying specific rights and privileges to a user, program, or process. It is a critical component of access control systems, determining what an authenticated entity is allowed to do within a system. Authorization comes after the authentication process, where an entity's identity is verified, and is fundamental in ensuring that entities can only access resources or perform actions that are permitted based on their roles, attributes, or policies.

Core Aspects of Authorization:

- Role-Based Access Control (RBAC): One common model for implementing authorization is RBAC, where access rights are granted according to roles assigned to users within an organization. Each role is associated with a set of permissions that define allowable actions on system resources. 
- Attribute-Based Access Control (ABAC): ABAC is a more flexible model that grants or denies access based on a combination of attributes of the user, resource, and environment. This model can dynamically adjust permissions based on contextual factors, such as the time of day or the location of access.
- Discretionary Access Control (DAC): DAC allows resource owners to make individual decisions about who can access specific resources. Access is typically controlled based on the identity of the requester and the permissions assigned to them.
- Mandatory Access Control (MAC): MAC is a policy-based approach where access decisions are made based on predefined policies and security labels assigned to both users and resources. This model is often used in environments requiring a high level of security, such as military or government systems.

Authorization mechanisms are key in implementing the principle of least privilege, ensuring that entities have only the minimum access necessary to perform their functions. This minimizes the potential impact of compromise or error.

**Accountability** 

Accountability refers to the ability to trace actions performed on a system or network back to the individual or entity that performed them. This principle is fundamental to ensuring that users and systems are responsible for their actions, and it supports the enforcement of security policies, the detection of policy violations, and the investigation of security incidents.

Key Components of Accountability:

- Identification and Authentication: For accountability to be effective, there must first be a reliable system of identification and authentication in place. Users, devices, and services must be uniquely identified and authenticated to ensure that actions can be accurately attributed to them.
- Logging and Monitoring: Systems must maintain detailed logs of user activities, system events, and security incidents. These logs are crucial for auditing purposes, allowing organizations to review actions, detect anomalies, and trace suspicious activities back to their source.
- Access Controls: Access control mechanisms enforce what actions authenticated users are authorized to perform. By tightly controlling access based on user roles, permissions, and policies, organizations can ensure that users are accountable for accessing only those resources they are permitted to use.
- User Training and Awareness: Promoting a culture of security awareness among users helps reinforce the importance of accountability. Users who understand their role in maintaining security are more likely to act responsibly and be cognizant of the consequences of their actions.

Understanding and applying accountability mechanisms is crucial for securing systems, managing risks, and supporting compliance efforts. By establishing robust systems of identification, authentication, logging, and monitoring, 

**Least Privilege/Need to Know**

The principle of least privilege and the concept of need to know are fundamental to the field of information security to minimize the risk of unauthorized access, data breaches, and potential damage by limiting access rights for users, systems, and processes to the minimum necessary to perform their functions.

The principle of least privilege requires that individuals, systems, and applications are granted only those permissions necessary to perform their assigned tasks or roles. This means limiting access rights to the minimal level of permissions needed, thereby reducing the attack surface and mitigating the potential impact of a compromise.

Least Privilege Application in Security:

- User Accounts: Ensuring that user accounts have access only to the resources and data necessary for their job functions.
- Administrative Access: Restricting administrative privileges to those who truly need them and implementing controls such as sudo privileges or role-based access control (RBAC) to manage these rights effectively. Users needing administrative rights will often need an administrative-level account and a regular user account.
- Software Applications: Running software applications with the minimal set of permissions required to function correctly, avoiding unnecessary administrative or network access that could be exploited if the application is compromised.

The need to know principle takes least privilege a step further by asserting that access to information should be granted based not just on the user's role, but also on the necessity of the information for the completion of a specific task. This principle is particularly important for protecting sensitive or classified information.

Need to Know Application in Security:

- Data Access: Restricting access to sensitive data, such as personal information or intellectual property, to individuals whose roles explicitly require access to that information.
- Project-Based Access: Limiting access to information and resources to members of a project team for the duration of the project and revoking access once the project is completed or if an individual's role in the project changes.
- Compartmentalization: Segmenting information and networks into compartments so that access to data is controlled based on the need to know, reducing the risk of wide-scale exposure from a single point of compromise.

## Additional resources

+ Understanding Layered Security and Defense in Depth [Understanding layered security and defense in depth | TechRepublic](https://www.techrepublic.com/article/understanding-layered-security-and-defense-in-depth/)
+ Authentication vs Authorization: Key Differences [Authentication vs. Authorization: Key Differences | Fortinet](https://www.fortinet.com/resources/cyberglossary/authentication-vs-authorization)
+ What are the Four Basic Security Goals? Protecting Confidentiality, Integrity, Availability, and Accountability [What Are the 4 Basic Security Goals? Protecting Confidentiality, Integrity, Availability, and Accountability. - Cyber Insight](https://cyberinsight.co/what-are-the-4-basic-security-goals/)
+ Least Privilege vs Need to Know in Cybersecurity [Least Privilege vs Need to Know in Cybersecurity | Tufin](https://www.tufin.com/blog/least-privilege-vs-need-to-know-cybersecurity)

