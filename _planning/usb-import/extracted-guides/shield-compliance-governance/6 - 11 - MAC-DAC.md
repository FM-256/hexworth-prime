# MAC-DAC   

After completing this episode, you should be able to:

+ Describe Mandatory Access Control (MAC) models and Discretionary Access Control (DAC) models      

**Description:** In this episode, you will learn about two of the many access control models that exist. This episode examines Mandatory Access Control (MAC) models and Discretionary Access Control (DAC) models.    

## MAC and DAC Models        

Mandatory Access Control (MAC) is a security model used in computer systems to restrict the access of users and processes to resources based on the security policies defined by a system administrator or security policy. Unlike discretionary access control (DAC), where access controls are at the discretion of the resource owner, MAC enforces access controls based on security labels and predefined rules, and it typically operates at a lower level in the system.

Mandatory Access Control models offer several advantages:

+ Strong Security Enforcement: MAC models provide strong security guarantees by enforcing access controls based on predefined rules and security labels.
+ Consistency: MAC ensures consistent enforcement of access controls across the system, reducing the risk of misconfigurations or errors.
+ Protection against Insider Threats: MAC can help mitigate insider threats by limiting the ability of users to access sensitive information beyond their authorized level.

The Discretionary Access Control (DAC) model is a security model used in computer systems to manage access to resources based on the discretion of the resource owner. In DAC, the resource owner has the authority to determine who can access their resources and what level of access they are granted. This contrasts with Mandatory Access Control (MAC) models, where access controls are enforced based on predefined rules and security labels.

Key characteristics of the Discretionary Access Control model include:

+ Resource Owner Authority: In DAC, the owner of a resource has full discretion over who can access it and how it can be accessed. The resource owner can specify access permissions for individual users or groups of users based on their own judgment or organizational policies
+ Access Control Lists (ACLs): DAC typically implements access controls using Access Control Lists (ACLs), which are data structures associated with each resource that specify which users or groups are granted specific permissions (e.g., read, write, execute) on that resource.
+ Flexibility: DAC offers flexibility in managing access permissions, as resource owners can easily modify ACLs to grant or revoke access as needed without requiring intervention from system administrators.
+ Granularity: DAC allows for fine-grained control over access permissions, enabling resource owners to specify access controls at the level of individual files, directories, or other resources.
+ Decentralized Administration: In DAC, access control decisions are decentralized, meaning that resource owners are responsible for managing access to their own resources. This can distribute the administrative burden and empower resource owners to make access control decisions that best align with their needs.

## Additional resources

+ Definition and Types of Access Control Models: <https://www.infosecinstitute.com/resources/cissp/access-control-models-and-methods/>