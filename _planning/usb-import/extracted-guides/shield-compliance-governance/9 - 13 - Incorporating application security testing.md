# Incorporating application security testing

After completing this episode, you should understand:

+ *Exam Objective 8.2.9: Application security testing (e.g., static application security testing (SAST), dynamic application security testing (DAST), software composition analysis, Interactive Application Security Test (IAST))

**Description:** In this episode, we'll analyze how to incorporate application security testing methodologies within the SDLC.



## Security Testing Methods

* SAST

  * Analyze source code

    Integrated in many IDEs 

    Look for vulnerabilities

    e.g., SQL injection and XSS

    (White box testing)

    Keys: see source code, doesn’t have to execute.

* DAST

  * Test runtime behavior of application.

    No access to source code

    Identifies auth issues, session management, exposed data

    (Black box testing)

    Key: identify issues that reveal only when program is executed.

* IAST

  * Analyze source code while code is executed (running).

    Vulnerabilities discovered in real-time 

    Combination of SAST and DAST

* SCA

  * Finds risks with 3rd party libraries

    Analyzes application’s dependencies.

    Key: securing the application’s supply chain.

* Fuzzing

  * Injecting randomized code to produce errors that could be useful to an attacker.	

## Application security testing levels

+ Unit testing
+ Integration
+ Acceptance testing
+ Regression testing