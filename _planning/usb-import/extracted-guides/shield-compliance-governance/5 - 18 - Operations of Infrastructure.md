# 2-1-1: Operations of Infrastructure

After completing this episode, you should be able to:

+ Identify and explain the impact and significance of secure infrastructure operations, given a scenario.

**Description:** In this episode, the learner will examine secure infrastructure operations techniques. We will explore power redundancy, warranties, and support.

+ Operation of infrastructure
  + Encompasses the strategies and practices for maintaining
  + Ensuring the reliable functioning of network infrastructure.
  + Security considerations
    + Implementation of redundancy
    + Implementing downtime mitigation strategies
    + Ensure continuous protection of network resources
    + Maintenance support
    + Warranty considerations
+ Implementing Power Redundancy:
  + Multiple Power Supply Units \(PSUs\)
    + Allows for power failover if a single PSU is malfunctioning 
  + Dual power feeds
    + For critical systems from separate power sources to eliminate single points of failure for the connected systems
  + Uninterruptible power supplies \(UPS\) 
    + Provide a power source, allowing systems to gracefully power down.
  + Backup generators provide long-term power solutions during extended electrical failures, ensuring systems remain operational.
+ Implementing Path Redundancy
  Path Redundancy
  + Multiple network pathways between switches and routers
  + Preventing single points of failure
  + Ensures continuous data flow
  + Examples:
    + Load balancing distributes network traffic
    + Automatic failover systems switch traffic to alternative routes if the primary path fails
+ Implementing storage redundancy
  + RAID configurations \(RAID 1, 5, or 10\) duplicate data across multiple drives.
  + Off-site backups protect against data loss from local disasters, ensuring data can be restored.
  + Cloud storage solutions offer scalable data redundancy, 
  safeguarding against local hardware failures.
+ Implementing Geographic Location Redundancy
  + Multiple data centers in different geographical areas
  + Protect against region-specific outages and disasters.
  + Examples:
    + Cloud services distributed across various regions ensure service availability even if one location is compromised.
    + Global load balancing directs users to the nearest operational data center
+ Warranty considerations
  + A guarantee provided by equipment manufacturers that covers the repair or replacement of network components within a specified period.
  + Ensure timely repairs and replacements
  + Facilitate quick recovery from hardware failures
  + Guarantee that malfunctioning components are replaced with genuine, manufacturer-approved parts
  + Provide a financial and operational safety net against potential defects
+ Support considerations
  + Services provided by vendors or third parties that offer technical assistance, updates, and troubleshooting for network infrastructure.
  + Security Considerations
    + Access to timely support and updates
    + Time frame to address vulnerabilities, perform patches, and resolve issues that could impact network security.
    + Examples
      + Subscription-based support contracts with hardware vendors and 24/7 technical support services.
