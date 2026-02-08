# Developing, deploying and maintaining secure software.



After completing this episode, you should understand how the following play a critical role in software develop security:

+ 8.2.2 Libraries
+ 8.2.3 Tool sets
+ 8.2.4 Integrated Development Environment
+ 8.2.5 Runtime 
+ 8.2.8 Code repositories

**Description:** In this episode, we will explore how libraries, toolsets, Integrated Development Environments (IDEs), runtime environments, Continuous Integration/Continuous Deployment (CI/CD) pipelines, and code repositories work together is essential for providing a comprehensive view of software development security within Domain 8.2. These components form the backbone of modern software development practices and are interconnected in ways that significantly impact the security of the development process and the final software product. 

### How These Components Work Together

- **Libraries** provide pre-written code that developers can use to add functionality to their software projects, saving time and resources.
- **Toolsets**, including compilers and debuggers, are used to transform and test the code written by developers into executable programs.
- **Integrated Development Environments (IDEs)** offer a comprehensive environment where developers can write, test, and debug their code using a unified interface that integrates various toolsets and libraries.
- **Runtime Environments** are where the software applications execute, providing necessary services and libraries required for the running application.
- **Continuous Integration/Continuous Deployment (CI/CD) pipelines** automate the processes of integrating code changes from multiple contributors into a single software project, testing these changes, and deploying them to production environments. This automation includes the use of IDEs for code development, toolsets for building and testing, and runtime environments for deployment testing.
- **Code Repositories** serve as the storage and version control backbone for the source code, allowing changes to be tracked, reviewed, and collaborated on by development teams. They are integral to the CI/CD process, triggering automated builds and tests when new code is committed.

### Bonus Scenario: Secure Software Development in a Fintech Company

Imagine a fintech company developing a new online payment platform. The development team uses **IDEs** to write and debug their code, relying on various **libraries** for encryption and secure communication protocols to protect financial transactions. They use **toolsets** for compiling their code into executables and running automated tests.

Their work is stored in a **code repository**, which is configured to automatically trigger the **CI/CD pipeline** upon new commits. This pipeline automates the process of integrating new code changes, running tests in various **runtime environments** to ensure compatibility and security across different platforms, and deploying the code to a staging environment for further security tests before final deployment.

### Depth of Knowledge Required for Software Dev Mgr or CISO

Software Dev Mgr or CISO should understand:

- **The role and security implications of each component**: need to know how these components contribute to the software development lifecycle and potential security vulnerabilities each may introduce.
- **Best practices for securing these components**: This includes secure coding practices, regular updates of libraries and toolsets, secure configuration of IDEs and runtime environments, managing access controls for code repositories, and ensuring the security of the CI/CD pipeline through automated testing and code reviews.
- **The interconnectedness of these components in the development process**: Understanding how changes in one component (e.g., an update to a library) can affect others (e.g., requiring changes in the code repository or additional tests in the CI/CD pipeline).

Software Dev Mgr or CISO are not expected to have the in-depth technical knowledge to implement these components but should be able to oversee and advise on the secure integration of these components within the software development lifecycle. They should understand the security risks associated with each component and how to mitigate these risks through policies, procedures, and best practices.

### Conclusion

In summary, Software Dev Mgr or CISO should grasp how libraries, toolsets, IDEs, runtime environments, CI/CD pipelines, and code repositories are interlinked in the software development process. They should be knowledgeable about the security considerations for each and capable of advising on strategies to mitigate associated risks, ensuring the secure development of software. This understanding is crucial for implementing and managing secure software development practices in any organization.

