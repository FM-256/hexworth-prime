# 1-10-2: Wireless Network Security

After completing this episode, you should be able to:

+ Identify and explain the significance of wireless network security, given a scenario.

**Description:** In this episode, the learner will examine security technologies used to secure communications across wireless networks. We will explore authentication methods and various security protocols such as WPA, TKIP, CCMP, and more.



+ What are the different authentication modes for wireless networks?
  + Personal Mode (WPA-Personal/WPA2-Personal/WPA3-Personal):
    + Designed for home and small office networks, uses a pre-shared key (PSK) for authentication.
    + Easier to set up without complex infrastructure
    + Less secure than Enterprise mode due to shared password vulnerability.
  + Enterprise Mode (WPA-Enterprise/WPA2-Enterprise/WPA3-Enterprise):
    + Aimed at organizations requiring higher security
    + Utilizes 802.1X authentication with a RADIUS server.
    + Provides individualized authentication for users, significantly enhancing security over Personal mode.
+ What are some of the key attributes of these security protocols or techniques for wireless networks?
  + Identify the strengths and weaknesses of each
  + Identify per protocol attributes and the benefits \(such as TKIP, CCMP, SAE, AES etc.\)
+ What are examples of the per-protocol attributes?
  + TKIP \(Temporal Key Integrity Protocol\)
    + Designed as a temporary solution to replace WEP without requiring new hardware.
    + Now considered deprecated due to security vulnerabilities.
  + CCMP \(Counter Mode with Cipher Block Chaining Message Authentication Code Protocol\)
    + Encryption protocol used in WPA2 for enhanced security.
    + Based on the AES standard, providing strong data protection.
  + AES \(Advanced Encryption Standard\)
    + Symmetric key encryption standard used globally.
    + Provides strong security and is widely adopted in various protocols and systems.
+ What are the key characteristics of these authentication methods to be aware of?
  + Identify the strengths and weakness of each \(cryptographic strength, management complexity\)
  + Identify per method attributes and the benefits \(client-side \+ server-side certificates, server-side certicates only, no certificates

----
+ Wireless Security Protocols
  + WEP \(Wired Equivalent Privacy\)
    + Early security protocol designed to provide a wireless network security standard.
    + Known to be vulnerable and generally considered obsolete.
  + WPA \(Wi-Fi Protected Access\)
    + Provides enhanced security over WEP, using TKIP for encryption and integrity checks.
    + Offers improved data protection and network access control compared to WEP.
  + WPA2
    + Enhances security further by introducing mandatory AES encryption and CCMP, replacing TKIP.
    + Provides robust security measures, making it the standard for Wi-Fi protection before WPA3.
  + WPA3
    + Newest security standard offering superior protections, including individualized data encryption.
    + Utilizes advanced techniques such as SAE \(Simultaneous Authentication of Equals\) for stronger password protection and forward secrecy, moving beyond AES and CCMP used in WPA2 for certain applications
+ EAP authentication methods
  + EAP \(Extensible Authentication Protocol\)
    + A framework for transporting authentication protocols.
    + Supports multiple authentication methods used in various network types.
  + EAP-TLS \(EAP-Transport Layer Security\)
    + EAP method requiring certificates for both server and client.
    + Provides strong security based on mutual authentication.
  + EAP-TTLS \(EAP-Tunneled Transport Layer Security\)
    + Allows secure communication and authentication using only server-side certificates.
    + Protects credentials with a secure tunnel.
  + EAP-PEAP \(Protected EAP\)
    + Creates an encrypted channel to protect user authentication.
    + Requires only a server-side certificate, simplifying client-side management.
  + EAP-FAST \(Flexible Authentication via Secure Tunneling\)
    + Designed by Cisco to improve EAP's security without needing certificates.
    + Uses a PAC \(Protected Access Credential\) for faster, secure authentication.
  + EAP-MD5
    + Uses MD5 hash function for authentication.
    + Considered less secure and generally not recommended for use.
 