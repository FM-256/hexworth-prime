## Cloud Technology - Basics


### Objectives:

At the end of this episode, I will be able to:

Explain how cloud technology adoption impacts organizational security.

### External Resources:

Cloud Technology - Basics

 What do you need to know about BCDR for the Cloud? -

 Cloud BCDR - Organizations may identify that cloud platforms offer opportunities
 to extend or improve BCDR capabilities, leveraging cloud to store backup sets
 &/or as a replication target for existing virtualized workloads & storage volumes

    • Fail into the cloud
    • Fail out of the cloud
    • Fail through the cloud same provider (Primary Provider)
    • Fail through the cloud different provider (Alternative Provider)


 What do you need to know about Serverless Computing & Software Defined
 Networking (SDN)? -

 Serverless Computing - a design pattern for service delivery of web
 applications; all the architecture is hosted within a cloud & the applications
 are developed as functions & microservices, each interacting with other
 functions to facilitate client requests

    • Depends on the concept of event-driven orchestration to facilitate
    operations

    • Eliminates the need to manage physical or virtual server instances;
    underlying architecture is managed by the service provider

    • Billing is based on execution time, rather than hourly charges (Function as
      a Service (FaaS))

 Client requires some operation to be processed; cloud spins up a container to
 run the code, performs the processing, & then destroys the container

 Must ensure that clients have not been compromised, allowing a malicious actor
 to impersonate a legitimate user; particularly important for the developer
 accounts & devices used to update the application code underpinning the services

 *** Dependency on the service provider with limited options for disaster
 recovery

 Software-Defined Networking (SDN) - Infrastructure as Code (IaC) is facilitated
 by physical & virtual network appliances that are fully configurable via
 scripting & APIs

      • Saves network & security administrators from configuring each appliance
      with proper settings to enforce the desired policy

      • Allows for fully automated deployment (or provisioning) of network links,
      appliances, & servers


  What do you need to know about Log Collection & Analysis? -

  Logs - record a wide variety of events spanning platforms, applications, & user
  activity, but only if properly configured & enabled

      • Log data should be directed to a log management system; providing
      mechanisms to collect, store, protect, & analyze all log data

      • Alerts configured to classify important events & help distinguish between
      critical events needing immediate action or other less severe items

      • Requirements to identify & respond to events are often mandatory

      • Principle of least privilege to secure logs


 AWS CloudTrail is an audit logging service that tracks & records AWS application
 program interface (API) calls, actions, & any changes within AWS which can be
 coupled with AWS CloudWatch to provide graphical reporting & analytics as well
 as monitoring & alerting capabilities

 Microsoft Monitor Logs can collect & organize log & performance data from Azure
 services into a single repository that can be analyzed using query tools. Rules
 can also be crafted to generate alerts for specific results. Information from
 Monitor Logs can be visualized using the dashboard in the Azure Portal.
