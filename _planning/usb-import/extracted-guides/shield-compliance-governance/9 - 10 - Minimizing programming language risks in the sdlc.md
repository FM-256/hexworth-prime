# Minimizing programming language risks in the sdlc

After completing this episode, you should understand:

+ *Exam Objective 8.2.1 :* Programming Languages

**Description:** In this episode, we'll explore how certain programming languages can influence security, common vulnerabilities associated with them, and best practices for secure coding to  minimize software programming risks.



## Programming Languages and Security Concerns

While Software Dev Mgr or CISO are not expected to be proficient programmers, they should be familiar with concepts and vulnerabilities common to programming and scripting languages such as:

- **C/C++**: Known for issues like buffer overflows and memory leaks due to manual memory management.
- **Java**: While safer in terms of memory management, still has concerns like deserialization vulnerabilities and issues related to its extensive use in web and enterprise environments.
- **JavaScript**: Commonly used in web development, with security issues including cross-site scripting (XSS) and cross-site request forgery (CSRF).
- **Python**: Popular for its simplicity and readability, but security issues can arise from third-party modules and deserialization vulnerabilities.
- **SQL**: Not a programming language per se but essential for database interaction, with SQL injection being a primary concern.

### Depth of Knowledge Required

Software Dev Mgr or CISO should have a conceptual understanding of how these languages can contribute to software vulnerabilities and the types of security controls that can mitigate these risks. This includes:

- **Input Validation and Sanitization**: Understanding how to prevent common vulnerabilities such as SQL injection and XSS by validating and sanitizing user inputs.
- **Secure Memory Management**: Awareness of the risks associated with languages that require manual memory management and the importance of secure coding practices to prevent buffer overflows and memory leaks.
- **Error Handling**: Knowing how to securely handle errors without exposing sensitive information to users.
- **Authentication and Authorization**: Understanding basic principles to securely manage user identities and control access to resources.
- **Use of Libraries and Frameworks**: Awareness of the security implications of using third-party libraries and frameworks, including the need for keeping them up to date to mitigate known vulnerabilities.

### Importance for Software Dev Mgr or CISO

Understanding these aspects is crucial for Software Dev Mgr or CISO because:

- **Security Across the SDLC**: need to ensure that security is integrated throughout the Software Development Life Cycle (SDLC), from initial design to deployment and maintenance.
- **Risk Management**: must be able to identify, assess, and prioritize security risks associated with software development and advocate for practices that mitigate these risks.
- **Communication with Development Teams**: Need to communicate and collaborate with development teams. Understanding the basic principles of programming languages and associated vulnerabilities enables more effective communication and guidance on implementing security controls.



