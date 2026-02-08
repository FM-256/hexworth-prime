## Analyze vulnerabilities - vulnerabilities


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze vulnerabilities and recommend risk mitigations.

### External Resources:

Analyze vulnerabilities - vulnerabilities

 What do you need to know about Race Conditions? -

 Race condition attacks (Time of Check / Time of Use - TOCTOU) - systems must
 execute some tasks in a specific sequence

    • there is a small period of time when the system has carried out the firs
    task but not started on the second

    • if period is long enough a race condition vulnerability exists where an
    attacker can trick the system into carrying out unauthorized actions in
    addition to its normal processes


 Protection - locks & mutexes are used to lock resources while a process runs
 preventing important processes from changing until the process finishes

    • side effect can be deadlocking, where a lock takes effect but the process
    it is waiting for is terminated, crashes, or does not finish


 What do you need to know about Buffer Overflows? -

 Buffer overflow - memory space used while an application runs is provided with
 more data than it can properly store, allowing attacker to insert executable
 code or modify values

 Integer overflow - arithmetic operation produces a result that is larger than
 the variable type used to store it

 Protection -

    • Patching
    • Secure coding
    • Address Space Layout Randomization (ASLR)
    • Data Execution Protection (DEP)


 What do you need to know about Protecting Web Applications? -

 Broken Authentication – exposing user credentials

https://www.itprotv.com/products/jsessionid=735XA0bq832WM09665/?item=CASP+

 Protection –

    • using multi-factor authentication
    • not using default credentials
    • checking for & rejecting poor/weak passwords using published password lists
    • using limits or delays to slow failed login attempts, logging all such
    attempts, & generating alerts when they repeatedly occur
    • using server-side session management mechanisms designed to create long,
    random session identifiers
    • not using session identifiers in URLs
    • implementing session timeouts & expiring session ids so they cannot be reused


 Insecure references - application will take user-supplied input & use it to
 provide access to an object otherwise inaccessible to the user

 Insecure Direct Object Reference (IDOR) - allows a user to manipulate a URL to
 gain access to resources

    https://www.itprotv.com/customer?custid=65342

    https://www.itprotv.com/files/secrets.md

 Protection - any user-provided values should be inspected prior to being used

 Poor exception handling - without exception handling applications may break in
 a way that leaves them in an unsafe state or allows unrestricted access to
 protected systems &/or data

 Security misconfiguration - poorly implemented / documented security controls

 Weak cryptography implementations & cipher suites

 Information disclosure - information can be stolen because it is not protected
 via encryption or other means, or is encrypted using weak keys, algorithms,
 &/or protocols

 Improper Headers - HTTP response headers used to increase the security of web
 servers

      • not configured by default & form part of a hardening baseline

      • can protect against CSRF, XSS, downgrade attacks, cookie hijacking, user
      impersonation, & clickjacking

 Certificate Errors


 What do you need to know about Analyzing Source Code Dependencies? -

 Software Composition Analysis - analyzing software for open-source components
 to find weaknesses in the underlying application framework, software modules,
 &/or third-party libraries

 OWASP Dependency-Check tool - scans software to identify publicly disclosed
 vulnerabilities with a project's third-party libraries

 Dependency-Track tool - deeper insights into source code & components & libraries

 Static code analysis tools - identify function-level weaknesses within actual
 source code

    • the C standard library has several well-documented vulnerabilities
    including the strcpy, malloc, gets & strcat functions
