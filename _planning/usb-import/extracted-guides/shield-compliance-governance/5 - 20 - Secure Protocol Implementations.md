# 1-3-1: Secure Protocol Implementations

After completing this episode, you should be able to:

+ Identify and explain the significance of secure protocol implementation, given a scenario 

**Description:** In this episode, the learner will examine secure protocols and the significance of their implementation. We will explore various secure protocols, implementations and attributes.


* What is a secure protocol?
  + A protocol that delivers data using encryption, that protects the data from eavesdropping and tampering.
  + Example: HTTPS
* What are IANA ports numbers?
  + A value assigned to a network service, that is maintained by the Internet Assigned Numbers Authrority
  + Port ranges
    + Well-known = 0 - 1023
    + Registered = 1024 - 49,151
    + Private = 49,152 - 65,535
* What are some of the common secure protocols?
  + For remote management
    + RDP, SSH, SNMPv3
  + For file servers 
    + SFTP, FTPS, SMBv3, NFSv4
  + Directory services 
    + LDAPS
  + Email servers
    + SMTPS
    + POP3S
    + IMAPS
* Additional References
  + SMTP \(Simple Mail Transfer Protocol\)
    + Definition - protocol for sending email messages between servers.
    + IANA port - 25
    + Security implications - susceptible to spam and phishing without proper authentication and encryption mechanisms.
  + SMTPS \(Secure SMTP\)
    + Definition - encrypted version of SMTP that uses SSL or TLS for security.
    + IANA port - 465 \(Implicit TLS\) 587 \(default\)
    + Security implications - provides confidentiality and integrity for email transmission, though susceptible to SSL\TLS vulnerabilities.
  + POPv3 \(Post Office Protocol version 3\)
    - Definition - protocol used by email clients to retrieve emails from a server.
    - IANA port - 110
    - Security implications - lacks encryption, exposing user credentials and email contents to eavesdropping.
  + POP3S \(Secure POP3\)
    - Definition - version of POPv3 that uses SSL or TLS for encryption.
    - IANA port - 995
    - Security implications - Secures email retrieval from server but can be vulnerable to SSL\TLS exploits.
  + IMAP \(Internet Message Access Protocol\)
    - Definition - protocol for accessing email on a remote server from a local client.
    - IANA port - 143
    - Security implications - can expose sensitive information without encryption, leading to potential unauthorized access.
  + IMAPS \(Secure IMAP\)
    - Definition - encrypted version of IMAP using SSL or TLS.
    - IANA port - 993
    - Security implications - enhances email security but requires ongoing maintenance against SSL\TLS security threats.
  + FTP (File Transfer Protocol)
    - Definition - protocol for transferring files between computers on a network.
    - IANA port - 21
    - Security implications - Unencrypted, exposing data and credentials to interception and unauthorized access.
  + SFTP \(SSH File Transfer Protocol\)
    - Definition - protocol for secure file transfer over Secure Shell (SSH).
    - IANA port - 22
    - Security implications - secure against eavesdropping and tampering but dependent on robust SSH configurations.
  + FTPS \(FTP Secure\)
    - Definition - extension of FTP that adds support for SSL and TLS.
    - IANA port - 990
    - Security implications - provides encryption for data transfers, mitigating eavesdropping risks.
  + SMBv3 \(Server Message Block version 3)
    - Definition - protocol for network file access, printing, and interprocess communication.
    - IANA port - no standard port, typically uses 445 over TCP \(microsoft-ds\).
    - Security implications - Vulnerable to man-in-the-middle attacks if not properly secured with SMB Signing or encryption.
  + NFSv4 (Network File System version 4)
    - Definition - protocol for distributed file systems in a network.
    - IANA port - 2049
    - Security implications - risks of unauthorized access and data exposure without proper authentication and encryption.
  + LDAP \(Lightweight Directory Access Protocol\)
    - Definition - protocol for accessing and maintaining distributed directory information services.
    - IANA port - 389
    - Security implications - vulnerable to interception and modification without SSL\TLS.
  + LDAPS \(Secure LDAP\)
    - Definition - version of LDAP that operates over SSL\TLS for encryption.
    - IANA Port - 636
    - Security Implications - Protects against eavesdropping and tampering, though susceptible to SSL\TLS-specific vulnerabilities.
  + Kerberos
    - Definition - Network authentication protocol designed for client/server model systems.
    - IANA Port - 88
    - Security Implications - Provides strong authentication but can be compromised if attackers gain access to key distribution center.
  + RDP (Remote Desktop Protocol)
    - Definition - Protocol for remote connections and management of networked computers.
    - IANA Port - 3389
    - Security Implications - Vulnerable to brute force attacks and exploitation if not secured with strong encryption and authentication.
  + Telnet
    - Definition - Protocol for executing commands and managing devices over a network.
    - IANA Port - 23
    - Security Implications - Highly insecure, transmitting data, including credentials, in clear text.
  + RADIUS (Remote Authentication Dial-In User Service)
    - Definition - Networking protocol providing centralized Authentication, Authorization, and Accounting (AAA) management.
    - IANA Port - 1812 for authentication and authorization, 1813 for accounting.
    - Security Implications - Vulnerable to dictionary attacks and packet interception without additional encryption mechanisms.
  + TACACS+ (Terminal Access Controller Access-Control System Plus)
    - Definition - Protocol providing centralized Authentication, Authorization, and Accounting management for access control.
    - IANA Port - 49
    - Security Implications - Offers more robust security than RADIUS but still requires proper configuration and encryption to prevent exploitation.
  + SIP (Session Initiation Protocol)
    - Definition - Protocol used for initiating, maintaining, and terminating real-time sessions for voice, video, and messaging applications.
    - IANA Port - 5060 for TCP/UDP, 5061 for secure SIP over TLS.
    - Security Implications - Susceptible to eavesdropping and spoofing without strong encryption and authentication.
  + SNMPv3 (Simple Network Management Protocol version 3)
    - Definition - Internet-standard protocol for managing devices on IP networks.
    - IANA Port - 161 \(agent listening\), 162 \(asynchronous traps\)
    - Security Implications - Can leak sensitive information if not secured with SNMPv3's authentication and encryption features.
  + NTP (Network Time Protocol)
    - Definition - Protocol designed to synchronize clocks of networked devices.
    - IANA Port - 123
    - Security Implications - Vulnerable to man-in-the-middle attacks if not using secure mode or authentication.
  + DNS (Domain Name System)
    - Definition - The system for translating domain names into IP addresses.
    - IANA Port - 53
    - Security Implications - Exposed to DNS poisoning, DDoS attacks, and hijacking without DNSSEC.
  + DHCP (Dynamic Host Configuration Protocol)
    - Definition - Network management protocol used to dynamically assign IP addresses to devices on a network.
    - IANA Port - 67 for server, 68 for client.
    - Security Implications - Vulnerable to unauthorized DHCP servers and IP address exhaustion attacks.
  + AFP (Apple Filing Protocol)
    - Definition - Protocol that offers file services for Macintosh clients.
    - IANA Port - 548
    - Security Implications - Risks associated with unauthorized access and data interception, especially without encryption.
  + NetBIOS (Network Basic Input/Output System)
    - Definition - An API that allows applications on different computers to communicate within a local area network.
    - IANA Port - 137-139
    - Security Implications - Vulnerable to spoofing and information disclosure attacks, particularly on older systems.
  + L2TP (Layer 2 Tunneling Protocol)
    - Definition - Protocol used to support virtual private networks or as part of the delivery of services by ISPs.
    - IANA Port - 1701
    - Security Implications - Does not provide encryption by itself, often combined with IPsec for security.
  + PPTP (Point-to-Point Tunneling Protocol)
    - Definition - A method for implementing virtual private networks, widely considered obsolete.
    - IANA Port - 1723
    - Security implications - Known for having numerous security vulnerabilities and should be used with caution.

