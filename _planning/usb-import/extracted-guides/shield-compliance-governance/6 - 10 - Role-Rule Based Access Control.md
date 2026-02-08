# Role-Rule Based Access Control   

After completing this episode, you should be able to:

+ Describe Role Based Access Control (RBAC) and Rule Based Access Control models      

**Description:** In this episode, you will learn about two of the many access control models that exist. This episode examines Role Based Access Control (RBAC) and Rule Based Access Control (RuBAC).    

## RBAC and Rule Based Access Control       

Role-Based Access Control (RBAC) is a method of restricting network access based on the roles of individual users within an organization. In RBAC, permissions are assigned to roles rather than to individual users. Users are then assigned to one or more roles, and they inherit the permissions associated with those roles.

The key components of RBAC include:

Roles: Roles represent job functions or responsibilities within an organization. For example, roles could be "manager," "administrator," "employee," etc. Each role has a set of permissions associated with it.

Permissions: Permissions are the actions or operations that users are allowed to perform within a system. These can include tasks such as read, write, execute, create, delete, etc. Permissions are assigned to roles.

Users: Users are individuals who interact with the system. Each user is assigned to one or more roles, and they inherit the permissions associated with those roles.

Role Assignment: Role assignment is the process of associating users with roles. Users can be assigned to multiple roles if necessary.

Role Hierarchy: In some RBAC implementations, roles may be organized into a hierarchy. This hierarchy can help simplify administration by allowing certain roles to inherit permissions from higher-level roles. For example, a "supervisor" role might inherit permissions from both "manager" and "employee" roles.

Rule-Based Access Control (RuBAC) is a method of access control where access decisions are based on a set of rules defined by the system administrator or security policy. Unlike Role-Based Access Control (RBAC), where access is determined by predefined roles, RBAC allows for more granular control by specifying conditions or criteria that must be met for access to be granted.

In Rule-Based Access Control:

Access Rules: Access rules define the conditions under which access to a particular resource or system is allowed or denied. These rules can be based on various factors such as user attributes, environmental conditions, time of access, and specific actions being performed.

Policy Evaluation: When a user requests access to a resource, the system evaluates the relevant access rules to determine whether access should be granted or denied. The evaluation process typically involves comparing the user's attributes and the context of the request against the conditions specified in the access rules.

Fine-Grained Control: RBAC allows for fine-grained control over access permissions, enabling organizations to define specific rules tailored to their security requirements. For example, access to sensitive data may be restricted to users with a certain clearance level, or access to a system may be limited to specific time periods.

Dynamic Access Control: RBAC can support dynamic access control where access rules can be updated or modified in real-time based on changing security requirements or environmental conditions. This flexibility enables organizations to adapt their access control policies to evolving threats or business needs.

Policy Administration: Administrators are responsible for defining and managing the access rules within the RBAC system. This includes creating new rules, modifying existing rules, and ensuring that the access control policies align with the organization's security objectives.

## Additional resources

+ Definition and Types of Access Control Models: <https://www.infosecinstitute.com/resources/cissp/access-control-models-and-methods/>