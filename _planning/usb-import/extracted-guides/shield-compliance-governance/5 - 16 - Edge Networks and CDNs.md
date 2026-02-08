# 1-9-1: Edge Networks and CDNs

After completing this episode, you should be able to:

+  Identify and explain the purpose of edge networks and content distribution networks (CDNs), given a scenario.

**Description:** In this episode, the learner will examine edge networks, including characteristics such as ingress and egress traffic and content distribution networks. We will also examine security considerations, examples, and more.


+ What are edge networks?
  + The infrastructure located at the boundary of a network
  + Serve as the entry point to a core network from external networks, including the Internet.
+ What are some examples of edge network implementations?
  + Internet-facing firewalls and routers that filter incoming and outgoing traffic.
  + Content Delivery Networks \(CDNs\) that bring content closer to the user, reducing latency.
  + Edge computing devices that process data near the source of data generation.
+ What are some of the security considerations with edge networks?
  + Ingress Filtering
    + Implement security measures to inspect and control incoming traffic to the network
    + Block unauthorized access and potential threats.
  + Egress Filtering
    + Implement monitoring and restrict outbound traffic
    + Implement data exfiltration prevention measures
    + Ensure that only legitimate traffic leaves the network.
+ What is peering, and what are some of the security considerations?
  + Peering
    + The arrangement between separate entities to exchange traffic directly, bypassing third-party networks
    + Done for efficiency and cost savings
  + Peering security
    + Securely managing connections to protect against indirect attacks and ensure the integrity of exchanged data.
    + Implementing deep packet inspection, intrusion detection systems \(IDS\), and intrusion prevention systems \(IPS\) at edge points to identify and mitigate threats before they enter the core network.
+ Content Distribution Networks (CDNs)
  + Consist of strategically distributed networks of servers across various locations
  + Enables companies to deliver web content and services to users based on their geographic locations
+ What are some examples of CDN implementations?
    + Using CDNs to accelerate website load times by caching content closer to the end user.
    + Streaming platforms leveraging CDNs to provide seamless video playback.
    + E-commerce sites utilizing CDNs to handle high traffic and distribute user requests efficiently.
  + Security Considerations
    + CDNs can enhance security by providing DDoS protection and mitigating traffic spikes.
    + They may introduce vulnerabilities if not properly configured, including data interception risks and reliance on CDN provider security practices.
    + Ensuring encrypted content delivery and secure token authentication
    + Seeks to maintain data integrity and confidentiality
