# Identifying security flaws at source code level

After completing this episode, you should understand:

+ *Exam Objective 8.5.1:* Security weaknesses and vulnerabilities at the source-code level

**Description:** In this episode, we'll identify some of the different source-code vulnernabilities that can be reduced by applying secure coding guidelines and standards in software development.



## Common Source-Code Vulnerabilities

**1. Injection Flaws:**
- **Examples**: SQL Injection, Command Injection, LDAP Injection.
- **Security Implications**: Allow attackers to inject malicious code into applications, potentially leading to unauthorized data access or system control.
- **TIP**: Recognize the risks associated with dynamic query execution and understand input validation and parameterized queries as mitigation strategies.

**2. Broken Authentication:**
- **Examples**: Insufficient authentication controls, session management vulnerabilities.
- **Security Implications**: May enable unauthorized access to user accounts and sensitive data.
- **TIP**: Understand the importance of implementing robust authentication mechanisms, multi-factor authentication (MFA), and secure session management practices.

**3. Sensitive Data Exposure:**
- **Examples**: Insecure storage of passwords, exposing sensitive information in URLs.
- **Security Implications**: Leads to the risk of data breaches and compliance violations.
- **TIP**: Grasp the necessity of encrypting sensitive data at rest and in transit, and the importance of not exposing sensitive information through client-side technologies.

**4. Cross-Site Scripting (XSS):**
- **Examples**: Stored XSS, Reflected XSS, DOM-based XSS.
- **Security Implications**: Allows attackers to execute malicious scripts in a user’s browser, potentially leading to data theft or session hijacking.
- **TIP**: Be familiar with the concept of output encoding and input validation as preventative measures against XSS.

**5. Insecure Deserialization:**
- **Examples**: Deserializing data from untrusted sources without adequate validation.
- **Security Implications**: Can lead to remote code execution, replay attacks, or injection attacks.
- **TIP**: Recognize the importance of validating or sanitizing serialized objects before deserialization and the risks associated with deserializing objects from untrusted sources.

**6. Use of Components with Known Vulnerabilities:**
- **Examples**: Using libraries or frameworks that contain unpatched vulnerabilities.
- **Security Implications**: Exposes applications to known attacks associated with these vulnerabilities.
- **TIP**: Understand the significance of regularly updating dependencies and conducting software composition analysis to identify and mitigate vulnerable components.

**7. Insufficient Logging and Monitoring:**
- **Examples**: Lack of detailed logs for security-relevant events, inadequate monitoring of log files.
- **Security Implications**: Hinders the ability to detect or respond to security incidents in a timely manner.
- **TIP**: Know the best practices for implementing comprehensive logging and real-time monitoring capabilities to enable effective incident detection and response.

### Importance for SoftwareDev Mgrs and CISOs

While in-depth programming skills are not required, candidates should be able to:
- Advise on the implementation of secure coding standards and guidelines to prevent these vulnerabilities.
- Communicate effectively with development teams about these vulnerabilities and their mitigation strategies.
- Contribute to the development of application security testing procedures to identify and remediate vulnerabilities in the software development lifecycle.
