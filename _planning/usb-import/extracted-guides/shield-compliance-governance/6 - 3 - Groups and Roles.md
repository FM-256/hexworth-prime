# Groups and Roles 

After completing this episode, you should be able to:

+ Describe the use of users, groups, and roles in a typical IAM system  

**Description:** In this episode, you will learn about the use of users, groups, and roles in a typical Identity and Access Management system in a typical IT environment.   

## Users, Groups, and Roles    

Users: Users are individuals, employees, or entities granted access to an organization's systems, applications, and data. Each user has a unique identifier, such as a username or employee ID, and associated attributes like name, email, and job title. Users need to authenticate themselves using credentials (username/password, multi-factor authentication, etc.) before gaining access to resources.

Groups: Groups are collections of users who share common attributes or requirements, allowing for streamlined management of permissions. A group can include multiple users, and each user can belong to one or more groups. Groups simplify access management by assigning permissions to an entire group rather than individual users. Managing access at the group level enhances efficiency, as changes made to group permissions automatically apply to all members. This is particularly useful in large organizations with dynamic user responsibilities.

Roles: Roles are predefined sets of permissions that define what actions users or groups are allowed to perform within a system or application. Roles are often granular, defining specific permissions for various tasks or responsibilities within an organization. For example, an "HR Manager" role might have access to employee records, while a "Finance Clerk" role might have access to financial data. Users or groups are assigned specific roles based on their job functions, responsibilities, or project requirements. Role assignments can be modified as needed to adapt to changing organizational structures or projects. 

## Additional resources

+ Groups vs Roles: <https://wentzwu.com/2020/02/15/groups-vs-roles/>