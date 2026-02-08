Filename: 1-3-1-common-infrastructure-concepts.md
Domain: System and Network Architecture Concepts in Security Operations
Episode: Common Infrastructure Concepts
=========================================================================

Common Infrastructure Concepts
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ Serverless
  - Servers are involved
    + You just don't have to do any of the provisioning
  - Cloud services that work together
    + That service cooperation, facilitates your application's infrastructure
      - You get charged for usage
+ Virtualization
  - Utilize unused resources 
    + Foundational for Cloud Services
  - Type I
    + aka "Bare Metal"
  - Type II
    + aka "Hosted"
+ Containerization
  - `docker pull httpd`
  - `docker run -dit --name my-apache-app -p 8080:80 -v "$PWD":/var/www/html/ httpd:2.4`
  - `docker ps`
  - `docker stop my-apache-app`
  - `docker rm my-apache-app`
