## Baselines & Templates & Software Assurance


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, integrate software applications securely into an enterprise
architecture.

### External Resources:

Baselines & Templates & Software Assurance

  What are the different types of web technologies? -

   • Web Server Technologies - IIS, Apache, WordPress

   • Web Development Frameworks - Angular, Ruby on Rails, Express.js, Django

   • Mark-up Languages - HTML, XML, CSS, JSON

   • Programming Languages - Perl, C#, Java, JavaScript, Visual Basic, .NET,
   Python, Ruby

   • Databases - MSSQL, MariaDB, PostgreSQL


   What are secure coding standards? -

   Offer a structured approach to developing code to prevent the introduction
   of security vulnerabilities through bugs and logic flaws.


   Carnegie Mellon Software Engineering Institute:
https://wiki.sei.cmu.edu/confluence/display/seccode/SEI+CERT+Coding+Standards


  OWASP Secure Coding Practices Quick Reference Guide:
https://owasp.org/www-pdf-archive/OWASP_SCP_Quick_Reference_Guide_v2.pdf


 What are secure design patterns? -

 Parallel best practices & provide guidance on secure implementation for critical
 areas of enterprise architecture.

  Open Security Architecture:
 https://www.opensecurityarchitecture.org/cms/library/patternlandscape

  Carnegie Mellon Software Engineering Institute:
 https://resources.sei.cmu.edu/library/asset-view.cfm?assetid=9115

  Microsoft (Azure):
 https://docs.microsoft.com/en-us/azure/architecture/patterns/


 *** Storage design patterns are an additional area of focus.

  Microsoft has published several storage design patterns available at:
  https://docs.microsoft.com/en-us/azure/architecture/patterns/category/data-management


  What kind of software is used in integration? -

  Container APIs - require careful treatment in order to limit access through
rigorous authentication & authorization mechanisms

  Application Vetting Processes - mitigate the introduction of vulnerable
applications, especially via third parties

  API Management - what APIs exist, what actions they perform, & which systems
need access to them; Policies & procedures should be in place to define API
security requirements, acceptable use, & the controls needed to protect them &
detect unauthorized changes

  Middleware - designed to integrate two systems together


  What are software assurance concepts? -

  Sandboxing/Development Environment - multiple environments allows for testing
  & evaluation work to be performed without impacting operations

  Validating Third-Party Libraries – just like it says

  Code Signing – certificate used to sign code in order to establish proof of
  origin

  Defined DevOps Pipeline – 8 phases of DevOps

  1. Plan
  2. Code
  3. Build
  4. Test
  5. Release
  6. Deploy
  7. Operate
  8. Monitor

  *** DevSecOps also uses same 8 phases in same order, BUT, wraps the entire flow
  with a SECURITY focus, allowing security to be built/baked in from the beginning
  of the flow all the way through its end.


  What is Application Security Testing? -

  Static Application Security Testing (SAST) - reviewing source code while it is
  in a static, or non-running, state

  Dynamic Application Security Testing (DAST) - reviewing code while it is being
  executed

  Interactive Application Security Testing (IAST) - analyzes code for security
  vulnerabilities while the app is run by an automated test, human tester, or
  any activity “interacting” with the application functionality

    • Reports vulnerabilities in real-time
    • Works inside the application
    • Does not test the entire application or codebase, but only whatever is
    exercised by the functional test
    • Works best when deployed in a QA environment with automated functional 
    tests running
