# Integrating software configuration management practices



After completing this episode, you should understand:

+ *Exam Objective 8.2.7:  Software Configuration Management

**Description:** In this episode, we'll  explore a scenario that illustrates the importance of Software Configuration Management (SCM) within the context of Domain 8.2 (Software Development Security), to help Software Dev Mgr or CISO understand the depth of knowledge they need on this topic.

## Bonus Scenario: Secure Development in a Fintech Company

Imagine a fintech company, FinSec Solutions, developing a new online payment application. The development team is distributed, with members working remotely. The application must comply with stringent security and regulatory standards, including PCI DSS and GDPR. The development process incorporates various components of Domain 8.2, such as secure coding practices, encryption libraries, and third-party code repositories.

### Role of SCM in the Scenario

**1. Version Control Systems (VCS):** The development team uses Git as their VCS, hosted on a secure, self-hosted server. All code changes must be pushed to feature branches and undergo thorough review through merge requests before being merged into the main branch. Software Dev Mgr or CISO should understand the importance of VCS in tracking changes, facilitating code reviews, and ensuring that only authorized and reviewed code is incorporated into the project.

**2. Automated Build and Deployment:** FinSec Solutions utilizes a Continuous Integration/Continuous Deployment (CI/CD) pipeline to automate the build and deployment process. Every commit triggers automated unit and integration tests to ensure the code's integrity before deployment. Software Dev Mgr or CISO need to know how automated processes help enforce security policies by ensuring that only code passing security tests is deployed.

**3. Change Management:** FinSec Solutions implements a formal change management process, requiring all changes to be documented, reviewed, and approved before implementation. This process includes assessing the impact of changes on the application's security posture. Software Dev Mgr or CISO should understand how change management practices contribute to securing the software development lifecycle by ensuring that all changes are accounted for, authorized, and traceable.

**4. Configuration Auditing and Compliance:** Regular audits are performed to ensure that the application's development environment and deployed instances comply with security standards and policies. SCM tools are used to track the configuration of environments and to rollback unauthorized changes. Software Dev Mgr or CISO should be aware of the role of SCM in maintaining compliance and the ability to audit software configurations effectively.

### Importance of the Scenario

This scenario highlights the critical role of SCM in developing secure software within a fintech company, emphasizing the need for Software Dev Mgr or CISO to understand how SCM practices are integrated within the broader context of software development security. By grasping the concepts and practices of SCM, candidates can better assess, design, and implement secure software development and deployment strategies that protect against unauthorized changes and ensure compliance with relevant security standards.

### Depth of Knowledge Required

Software Dev Mgr or CISO should understand SCM concepts at a level where they can appreciate its importance in securing the software development process. They should know how SCM practices, like version control, change management, and automated builds, integrate with security practices to protect the integrity and security of software products. While they don't need to be experts in implementing SCM solutions, candidates should be able to discuss how SCM practices contribute to a secure SDLC, identify risks associated with poor SCM practices, and understand the role of SCM in regulatory compliance.


