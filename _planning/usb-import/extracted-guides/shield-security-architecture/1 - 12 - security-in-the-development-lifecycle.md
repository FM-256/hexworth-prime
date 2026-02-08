## Security in the development lifecycle


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, integrate software applications securely into an enterprise
architecture.

### External Resources:

Security in the development lifecycle

  What is the Software Development Life Cycle (SDLC)? -

  Structured approach to programming to ensure that final products align to
  functional requirements

  Lacks formal mechanisms to integrate secure coding practices throughout all
  phases:

  1. Planning & requirements gathering
  2. Solution design
  3. Coding & formulation of tests
  4. Testing & evaluation of code
  5. Release (deployment &/or fielding)

  Examples of the types of security-focused activities to incorporate at each
  phase:

  1. Planning & requirements gathering:

    • Identifying policy, standard, &/or regulatory requirements that govern how
    software operates

    • Identifying all dependencies & use of third-party & standard libraries


  2. Solution design:

    • Incorporating secure coding patterns & best-practice guidance from
    organizations such as OWASP


  3. Coding & formulation of tests:

    • Using Static Code Analysis tools, software linters, & automated unit tests
    to identify vulnerabilities while code is being written

    • Developing tests focused on misuse & abuse scenarios as well as error
    handling & logging capabilities

  *** What is a Linter? Here’s a Definition and Quick-Start Guide:
  https://www.testim.io/blog/what-is-a-linter-heres-a-definition-and-quick-start-guide/


  4. Testing & evaluation of code:

    • Using Dynamic Code Analysis tools to evaluate application security & test
    for the existence of known vulnerabilities

    • Performing penetration tests

    • Performing the misuse & abuse cases developed during the coding phase


  5. Release:

    • Developing documentation to describe maintenance tasks, such as
    troubleshooting & installing patches

    • Integrating with enterprise monitoring solutions to detect unauthorized
    use or suspicious activities

    • Monitoring external sources to identify if any dependencies or libraries
    have identified vulnerabilities in order to proactively patch them


  What are testing approaches to know? -

   • Regression Testing – evaluates whether changes in code have caused previously
   existing functionality to fail

      • Security Regression Testing – designed to inspect the way that a code
      change impacts input validation, data processing, & control logic of a program

   • Unit Testing – ensure that a particular block of code performs the exact
   action intended, & provides the exact output expected

   • Integration Testing – individual components of a system are tested together
   to ensure that they interact as expected


  What are the development approaches to know? -

   Waterfall Model - a phase will start only when all tasks identified in the
   previous phase are complete

    • 5 phases: requirements, design, implementation, verification, & maintenance
    • Phases are executed sequentially & do not overlap
    • At the end of each phase, developers perform code checks
    • Best suited for projects with long completion timeframes


  Spiral Model - Development is modified repeatedly in response to stakeholder
  feedback & input but still follows an overall beginning-to-end structure

   • Most useful for large, complex, & expensive projects
   • Imposes risk analysis in each iterative step


   Agile Model - uses iterative processes to release well-tested code in smaller
   blocks or units; development & provisioning tasks are continuous

   • End of each iteration developers present their progress to clients & other
   stakeholders to receive feedback that can be used in upcoming iterations
   • Useful in complex, unstable systems where requirements & design are not easy
   to predict

   DevSecOps (SecDevOps) - introduces a set of best practices designed to embed
   security early in the development process & across all phases

    • Security as Code (SaC) - Automated methods to introduce static code
    analysis testing & dynamic application testing (DAST) as applications are
    developed

    • Infrastructure as Code (IaC) - Configuration management tools are used to
    control changes to infrastructure


  What are the continuous delivery methods to know? -

    Continuous Integration/Continuous Delivery (CI/CD) Pipelines

    Continuous Integration (CI) - commit & test updates often in order to detect
    & resolve conflicts using automated testing suites

    Continuous Delivery (CD) - process to build, test, configure, & deploy from
    a build to a production environment

      • Multiple testing or staging environments create a Release Pipeline to
      automate the creation of infrastructure & deployment of a new build
      • Successive environments support progressively longer-running activities
      of integration, load, & user acceptance testing
      • Continuous Integration starts the CD process & the pipeline stages each
      successive environment to the next upon successful completion of tests

      Continuous Deployment - the process that takes validated features in a
      staging environment & deploys them into the production environment, where
      they are readied for release using configuration management platforms to
      support the newly updated application

      • Separates the deployment & release process
      • Deploy to production - practices necessary to deploy a solution to a
      production environment
      • Verify the solution - practices needed to make sure the changes operate
      in production as intended before they are released to customers
      • Monitor for problems - practices to monitor & report on any issues that
      may arise in production
      • Respond & recover - practices to rapidly address any problems that happen
      during deployment


      Continuous Monitoring - designed to detect flaws, bugs, errors, & defects

      • Courses of action can be automated in response to any detected issues
      • Leverage Security Orchestration Automation & Response (SOAR) systems


      Continuous Validation - An application model describes the requirements
      governing a software development project; tested using processes of
      verification & validation (V&V):

      • Verification - compliance testing process designed to ensure that the
      product or system meets its design goals

      • Validation - process of validating that the application is fit-for-purpose

    Ensures that design goals continue to meet user & security requirements

    Monitoring & validation processes ensure that there is no drift from the
    secure configuration baseline


  What are the Web Application security concepts to know? -

  Open Web Application Security Project (OWASP) –
    Top 10 –  https://owasp.org/Top10/
    Secure Headers Project -  https://owasp.org/www-project-secure-headers/


  Proper Hypertext Transfer Protocol (HTTP) Headers - security options can be
  set in the response header returned by a web server to a client; Enabling these
  settings is limited by compatibility between various client browser & web
  application functionality


Response Headers:

  HTTP Strict Transport Security (DSTS) - Allows web servers to enforce the use of
HTTPS; defends against downgrade attacks and cookie hijacking

  X-Frame-Options (XFO) - Defines whether content can be displayed using frames
to defend against clickjacking attacks

  X-Content-Type-Options - Prevents a browser from interpreting the MIME type of
files in a way that is different than what is specified in the Content-Type header

  Content-Security-Policy (CSP) - Can prevent many different types of attacks,
including cross-site scripting & other cross-site injection attacks

  X-Permitted-Cross-Domain-Policies - Grants a web client permission to handle
data across domains, such as retrieving content from a domain that differs
from the source

  Referrer-Policy - Defines which referrer information can be included with
requests; This information is used to determine the source location where a
link originated from

  Clear-Site-Data - Clears cookies, storage, & cache associated with the website

  Cross-Origin-Embedder-Policy (COEP) - Limits documents from being loaded from
origins other than the source

  Cross-Origin-Opener-Policy (COOP) - Changes the way documents are loaded to
prevent cross-origin attacks

  Cross-Origin-Resource-Policy (CORP) - Designed to protect against speculative
execution (such as Spectre) & Cross-Site Script Inclusion attacks
