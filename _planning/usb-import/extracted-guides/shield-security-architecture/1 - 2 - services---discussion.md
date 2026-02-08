## Services - discussion


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze the security requirements and objectives to ensure an
appropriate, secure network architecture for a new or existing network.

### External Resources:

Services - discussion

What are common Edge Services?

 Devices directly accessible from the Internet providing access to internal
services:

 • Firewalls
 • Routers
 • Load Balancers
 • Network Address Translation (NAT) Gateways
 • Elastic IPs & Virtual Private Clouds (VPCs)
 • Internet Gateway
 • E-Mail Security
 • Distributed Denial of Service (DDoS) Protection


 Methods of defending against a DDoS attack:

 Rate Limiting - used to reduce the amount of throughput available to the server
or service being attacked.

 Web Application Firewall (WAF) - inspecting traffic for signs of malicious
activity through the use of rules designed to identify attacks.

 Blackhole Routing - takes all the traffic intended for an endpoint and drops it;
drops both legitimate and malicious traffic.

 Cloud Service Providers provide DDoS protection as a service - requires updating
DNS to point traffic to the service provider in order for it to be inspected
prior to it reaching the intended service.

 DDoS Mitigation Software/Appliance - devices and software designed to identify
and protect against attacks.


What are Application Layer protections?

 Coupled with edge services to provide a more comprehensive level of inspection
and protection of traffic:

 • Next-Generation Firewalls (NGFW) - Inspects content of protocol traffic across
 the OSI layers

 • Unified Threat Management (UTM)

 • Web Application Firewall (WAF) -
          • Network, Host & Cloud based
          • Focused on inspecting & protecting web traffic

 • API Gateways - Offload inspection & protection of data interface traffic


What are Application Layer protections?

 Coupled with edge services to provide a more comprehensive level of inspection
and protection of traffic:

 Forward/Transparent Proxy – (outbound traffic)

    Non-transparent proxy - client must be configured with proxy server address &
 port number to use it; often port 8080

    Transparent proxy (forced or intercepting) - intercepts client traffic without
 the client having to be reconfigured; implemented on a switch or router or other
 in-line network appliance


 Can be configured to require users to be authenticated before allowing access;
 able to use SSO 

 Proxy autoconfiguration (PAC) scripts allow a client to configure proxy settings
 automatically; Web Proxy Autodiscovery (WPAD) protocol allows browsers to
 locate a PAC file

*** Can be an attack vector - a malicious proxy can be used to obtain the user's
hash as the browser tries to authenticate


 Reverse Proxy – (inbound traffic)

 System put in-line of traffic for a specific host or group of hosts from the
 outside inward

 Can inspect traffic, distribute traffic among many systems, cache content in
 order to improve performance, &/or perform traffic encryption

 Works in a similar manner to a load balancer


What is Domain Name System Security Extensions (DNSSEC)? -

 Mitigates against spoofing & poisoning attacks by providing a validation process
for DNS responses

 Provides origin authentication of DNS data, authenticated denial of existence,
& data integrity as well as zone signing to establish the integrity of DNS data


How does DNSSEC work? -

 Authoritative DNS server for a zone creates a set of resource records called a
 Resource Record Set (RRset) digitally signed using its Zone Signing Key

 When a DNS server requests a secure record exchange, the authoritative server
 returns the RRset along with its public key, allowing the requesting server to
 verify the digital signature used to protect the records

 *** Zone signing key is also signed using a Key Signing Key so that if the zone
 signing key is compromised, it can be revoked & re-issued


What is a Virtual Private Network (VPN)? -

 Creation of a connection between two endpoints across an untrusted network:

 • OpenVPN
 • L2TP/IPsec
 • IKEv2/IPsec
 • WireGuard
 • SSTP
 • IPsec
 • PPTP


 What is Network Access Control (NAC)? -

  Evaluates connected devices & determines whether to allow them access to a
  network environment:

 Endpoint authentication –

          • credentials or digital certificates
          • health checks for active, updated antivirus software patch levels &
          properly configured firewalls

 Often coupled with VPN solutions to ensure devices connected via VPN pass
 security criteria before gaining access


What are Intrusion Detection & Prevention Systems? -

 Analysis techniques:  Signature / Anomaly / Behavior-based

 Capturing from a network segment can be performed by configuring a switched port
 analyzer (SPAN) or port mirroring; switch is configured to copy frames passing
 over designated source ports to the destination port where the packet sniffer
 is connected

 Sniffing over a network cable segment with a test access port (TAP); preferred
 mechanism as it leverages special expansion ports on the switch & does not
 cause a negative performance impact

 Traffic mirroring for virtual private clouds; allows traffic to be forwarded &
 inspected in a similar way to non-cloud networks


 Wireless Intrusion Detection System (WIDS) are designed to monitor the wireless
 spectrum to detect unauthorized access points, or rogue access points, & any
 indications of wireless attack mechanisms

 Threats a WIPS can identify include:

 • Unauthorized/rogue access points and evil twins
 • Unauthorized client devices
 • Improperly configured access points
 • Improper association between clients & access points
 • Ad hoc networks
 • MAC address spoofing
 • On-path attacks
 • Denial of service attacks


What are Traffic Sensors? -

 Tools to further support the collection & inspection of network & application
activity:

 • File Integrity Monitoring (FIM)
 • Simple Network Management Protocol (SNMP) - V2 vs. V3
 • NetFlow and sFlow - aggregated flow vs. sampling
 • Data Loss Prevention (DLP)
 • Antivirus (as part of Endpoint Detection & Response – EDR)


 What is the role of Security Information & Event Management (SIEM)? -

  Near real-time analysis of security alerts generated by network hardware,
 systems, & applications

 • Aggregation
 • Correlation
 • Alerting
 • Visibility
 • Compliance
 • Data Retention
