# 2-3-1: Network Access Control Systems

After completing this episode, you should be able to:

+ Identify and explain the significance of network access control (NAC) technologies, given a scenario.

**Description:** In this episode, the learner will examine physical and virtual network access control solutions. We will examine firewalls, health attestation, proxy servers, 802.1X, and more.

+ Physical network access control \(NAC\)
  + Manages physical access to network resources.
  + Prevent unauthorized entry, access, and tampering such as doors, locks, biometrics, guards, fencing, and mantraps.
+ What is the purpose of virtual solutions?
  + Regulate access to network services through logical mechanisms such as software policies, access control lists \(ACLs\), and authentication.
+ What are some examples of virtual technologies?
  + Policy-driven access control - implements strict policy adherence for network access without assuming trust.
  + Health attestation - a security mechanism where devices must prove their health status(running antimalware, updated security patches\), and policy compliance devices can connect to the network
  + Access Control Lists \(ACLs\)  - Configurations on network devices that permit or deny traffic based on predefined policies.
  + Certificate-based authentication - implementing digital certificates to authenticate devices \(and users\) prior to granting network access.
  + Attribute-Based Access Control \(ABAC\) - Access decisions are made by evaluating attributes such as administrative tasks, context, or network devices.
  + 802.1X Authentication - a framework for port-based network access control, providing secure authentication to network devices.
  + Proxy and reverse proxy servers
    + Servers that mediate traffic between users and backend services
+ Describe the different firewall types
  + Firewalls
    + Stateful - monitors and controls incoming and outgoing network traffic based on the state, attributes, and context of the traffic, maintaining a record of active connections.
    + Stateless -  filters network traffic based solely on source and destination addresses, protocols, and ports.
    + Web application firewall \(WAF\) - protects web applications by monitoring, filtering, and blocking harmful HTTP traffic to and from a web service.
    + Intrusion detection and prevention devices \(IDPS\) - identify and mitigate malicious network activities.
    + Next-generation firewalls \(NGFW\) -  combine traditional firewall capabilities with advanced features like application awareness, intrusion prevention, and deep packet inspection.
+ What are some examples of cloud-based solutions?
  + Cloud-hosted identity and access management \(IAM\)
    + Solutions managing user access to network resources.
  + Software-defined perimeter \(SDP\)  + Services creating secure cloud-based boundaries around network resources.
  + Cloud access security brokers \(CASBs\) 
    + Enforces security policies between cloud users and cloud applications.
