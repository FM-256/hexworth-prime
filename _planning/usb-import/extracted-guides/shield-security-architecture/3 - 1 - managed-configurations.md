## Managed configurations


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, apply secure configurations to enterprise mobility.

### External Resources:

Managed configurations

 What do you need to know about Mobile Device Management (MDM)? -

 Enterprise Mobility Management (EMM) - suite of policies & tools enabling
 centralized management of mobile devices

 Mobile Device Management (MDM) - focuses on the control of mobile devices to
 ensure compliance with an organization's security requirements


 What do you need to know about Managed Configurations? -

 Application Control - capability to install, configure, block &/or remove apps
 from a device

 Passwords/Passcodes - password quality policies or password protection for
 individual apps; includes enforcing pin-codes, patterns &/or biometric authentication

 MFA Requirements - conditional access configurations

 Token-based Access - associated with network access control (NAC); requires an
 enrolled device to provide a token issued by an IAM solution in order to gain
 access to network resources

 Patch Repository - managed devices can be centrally patched

 Trust certificates – globally identify trusted devices within an organization;
 A single certificate is used & pushed to enrolled devices

 User specific certificates – used to enable device authentication, & allow for
 more granular control, or revocation, of access

 What they are, how they work, & why/when to use them:

      • Firmware Over-the-Air & Remote Wipe
      • Airplane Mode & Peripherals
      • Tethering (hotspots)
      • Location Services

 Near Field Communication (NFC) - a particular type of Radio Frequency ID (RFID);
 transactions sometimes known as a bump; use cases include smart posters, where
 the user can tap the tag to open a linked web page via the information coded in
 the tag & payments via contactless point-of-sale (PoS) machines

     • does not provide encryption, so eavesdropping & man-in-the-middle attacks
     are possible

 Bluetooth - short-range wireless communication technology used to create Wireless
 Personal Area Networks (WPANs)

     • BlueBorne allows an attacker to gain complete control of a device & does
     not require the target device to be connected, or paired, with the attacker;
     BlueBorne can compromise Windows, Android, & Apple devices

 Full Device Encryption (FDE) –

     • Android Marshmallow (6.0.1) & earlier implement FDE with dm-crypt & a
     128-bit AES key; limits functionality as no apps running on the device can
     access storage until the device password has been entered 

     • Android 7 (Nougat) file-based encryption (FBE) enabling the use of
     different keys to protect storage & independent unlocking of files; apps
     are able to operate in a limited capacity even if the password has not been
     entered

     • Android 9 (Pie) metadata encryption via hardware support; encrypts any
     items not protected by FBE

     • Apple iOS devices use a 256-bit unique ID (UID) specific for each device
     & stored in hardware; The UID is combined with the user password in order to
     secure data stored on the device

 Device Configuration Profiles – XML files that contain configuration details
 defined at either the user or device level

 VPN Settings – O/S, App & Web based

 Geofencing – policies can be configured to grant a device different levels of
 access depending on geographic location; also used for push notifications to
 send alerts or advice to a device when a user enters a specific area

 Geotagging – the addition of location metadata to files or devices; used for
 asset management to ensure devices are kept with the proper location


 What do you need to know about WiFi Protected Access? -

 WEP & Wi-Fi Protected Access (WPA/WPA2) –

      • WPA2 uses the Advanced Encryption Standard (AES) cipher with 128-bit keys,
      deployed within the Counter Mode with Cipher Block Chaining Message
      Authentication Code Protocol (CCMP)

      • AES replaces RC4, & CCMP replaces TKIP

      • CCMP provides authenticated encryption, which is designed to make replay
      attacks harder

 Wi-Fi Protected Access 3 (WPA3) – Wi-Fi 6 / IEEE 802.11ax

       • Simultaneous Authentication of Equals (SAE) - replaces WPA's 4-way
       handshake authentication & association mechanism with the Dragonfly
       handshake; Diffie-Hellman over an elliptic curves key agreement, combined
       with a hash value derived from the password, & device MAC address to
       authenticate the nodes; implements ephemeral session keys, providing
       forward secrecy

       • Enhanced Open - opportunistic wireless encryption (OWE) uses the Dragonfly
       handshake; no authentication of the access point

       • Updated cryptographic protocols - replaces AES CCMP with the AES Galois
       Counter Mode Protocol (GCMP) mode of operation; Enterprise authentication
       methods must use 192-bit AES, while personal authentication can use either
       128-bit or 192-bit

       • Management protection frames - mandatory to protect against key recovery
       attacks

 *** WPA3 still uses a passphrase to authenticate stations in personal mode, it
 changes the method by which this secret is used to agree session keys. The
 scheme used is also referred to as Password Authenticated Key Exchange (PAKE).

 *** The most recent generation (802.11ax) is being marketed as Wi-Fi 6 and, as a
 result, earlier standards are retroactively named Wi-Fi 5 (802.11ac) and
 Wi-Fi 4 (802.11n).


 What are DNS Protection options? -

 Custom DNS - blocks dangerous sites by purposefully refusing to resolve a
 previously identified malicious host

 DNS over HTTPS (DoH) - DNS requests are tunneled within TLS traffic

      • allows client devices to bypass corporate DNS restrictions
      • DoH traffic simply appears as https packets
