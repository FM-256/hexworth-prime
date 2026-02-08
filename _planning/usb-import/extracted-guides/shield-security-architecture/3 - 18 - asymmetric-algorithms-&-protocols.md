## Asymmetric Algorithms & Protocols


### Objectives:

At the end of this episode, I will be able to:

Given a business requirement, implement the appropriate cryptographic protocols
and algorithms.

### External Resources:

Asymmetric Algorithms & Protocols

 What do you need to know about Asymmetric Algorithms? -

 Asymmetric Cryptography - uses DUAL KEYS !!! - the keys are a PUBLIC / PRIVATE
 key pair

  • User has a distinct key pair issued to them upon entry / registration into
  the system

  • PUBLIC key is meant to be shared with anyone who may need it to facilitate
  communication

  • PRIVATE key is kept secret & NOT SHARED

 Strengths:

  • adding users requires ONLY the generation of the key pair for them
  • users can be removed easily, without having to regenerate keys
  • ONLY time you typically regenerate a key is if the PRIVATE KEY of a user has
  been compromised, or is suspect for some reason
  • provides confidentiality, integrity, authentication & non-repudiation

 Weakness:

  • SLOW !!! (in comparison to Symmetric)


  Key Exchange – use asymmetric algorithms to encrypt symmetric keys &
  send / exchange them securely

  Key Agreement – Both parties use mathematic approaches to mutually agree upon
  a secret key by deriving it using modulus math (discrete logs) & knowledge of
  a common secret

    • Diffie-Hellman (DH) – no native authentication of parties; susceptible to
    the Logjam attack

    • Elliptic-Curve Diffie-Hellman (ECDH) - utilizes math based on elliptic
    curves


 What do you need to know about Digital Signatures… again -

 1. Chris generates a message digest of the original plaintext message using
 SHA-160

 2. Chris then encrypts ONLY the message digest using his private key - this
 becomes the digital signature

 3. Chris appends (adds) the digital signature to the plaintext message

 4. Chris sends the message to Adam (that's me !!)

 5. When Adam receives the message, he reverses the process:

 6. Adam decrypts the digital signature using Chris's public key

 7. Adam then uses the same hashing function to create a message digest of the
 message

 8. Adam then compares the decrypted message digest to the new one he has just
 created; if the two match, then the message was sent by Chris; if they do not
 match, then it was not sent by Chris


 What do you need to know about Signing Methods? -

 Rivest, Shamir, and Adleman (RSA) - based on factoring large prime numbers; uses
 public/private key functions in conjunction with DH

    • Decryption depends upon the private key plus the derived key calculated by
    DH as part of session initialization

 Digital Signature Algorithm (DSA) - operates similarly to RSA but is based on
 logarithmic and modulus math

    • Compared to RSA, DSA is faster at generating digital signatures but slower
    at verifying them

 Elliptic-Curve Digital Signature Algorithm (ECDSA) - operates similarly to DSA
 but utilizes properties of elliptic curves in order to provide comparable levels
 of protection as RSA but with much smaller keys


 What do you need to know about SSL/TLS & Cipher Suites? -

 Secure Sockets Layer (SSL) --> Transport Layer Security (TLS) - v1.2 & above

 Cipher suite - algorithm supported by both the client & server to perform the
 encryption & hashing operations required by the protocol

    Prior to TLS 1.3, a cipher suite would be written in the following form:
		                  ECDHE-RSA-AES128-GCM-SHA256

 The server can use:

    • Elliptic Curve Diffie-Hellman Ephemeral mode for session key agreement
    • RSA signatures
    • 128-bit AES-GCM (Galois Counter Mode) for symmetric bulk encryption
    • 256-bit SHA for HMAC functions

***  Suites the server prefers are listed earlier in its supported cipher list


 TLS 1.3 uses simplified & shortened suites; a typical TLS 1.3 cipher suite
 appears as follows:
                      TLS_AES_256_GCM_SHA384

      • only ephemeral key agreement is supported in 1.3

      • signature type is supplied in the certificate, so the cipher suite only
      lists the bulk encryption key strength & mode of operation (AES_256_GCM)
      plus the cryptographic hash algorithm (SHA384) used within the new hash
      key derivation function (HKDF)

 *** HKDF - mechanism by which the shared secret established by DH key agreement
 is used to derive symmetric session keys


 What do you need to know about S/MIME? -

 Secure Multipurpose Internet Mail Extension (S/MIME) - authentication &
 confidentiality protection through use of public key cryptography & digital
 signatures. X.509 digital certificates are used for authentication

 Two message types:

    • signed messages - integrity | sender authentication & non-repudiation
    • enveloped messages - integrity | sender authentication & confidentiality


 How does it work?

 1. Adam sends Chris his digital certificate, containing his public key &
 validated digital ID (an email address). Adam signs this message using his
 private key

 2. Chris uses the public key in the certificate to decode Adam’s signature &
 the signature of the CA (or chain of CAs) validating Adam’s digital certificate
 & digital ID & decides that he can trust Adam and his email address

 3. Chris responds with his digital certificate & public key & Adam, following
 the same process, decides to trust Chris

 4. Both Adam & Chris now have one another's certificates in their trusted
 certificate stores

 5. When Adam wants to send Chris a confidential message, he makes a hash of the
 message and signs the hash using his private key; Adam then encrypts the
 message, hash, & his public key using Chris's public key & sends a message to
 Chris with this data as an S/MIME attachment

 6. Chris receives the message & decrypts the attachment using his private key;
 He validates the signature & the integrity of the message by decrypting it with
 Adam's public key & comparing Adam’s hash value with one he makes himself


 What do you need to know about Secure Shell (SSH)? -

 Secure Shell (SSH) - remote access protocol

 SSH uses two types of key pairs:

  A host key pair identifies an SSH server

      • server reveals the public part when a client connects to it

      • client must use some means of determining the validity of this public key;
      If accepted, the key pair is used to encrypt the network connection and
      start a session

 A user key pair is a means for a client to login to an SSH server

      • server stores a copy of the client's public key

      • client uses the linked private key to generate an authentication request
      & sends the request (not the private key) to the server; server can only
      validate this request if the correct public key is held for that client


 What do you need to know about Extensible Authentication Protocol (EAP)? -

 EAP - framework for negotiating authentication mechanisms rather than the
 details of the mechanisms themselves

    • Vendors can write extensions to the protocol to support third-party security
    devices

    • EAP implementations can include smart cards, one-time passwords, biometric
    identifiers, or simpler username & password combinations


  • EAP Transport Layer Security (EAP-TLS)
  • Protected Extensible Authentication Protocol (PEAP)
  • EAP Tunneled Transport Layer Security (EAP-TTLS)
  • EAP with Flexible Authentication via Secure Tunneling (EAP-FAST)


  EAP Transport Layer Security (EAP-TLS) - an encrypted Transport Layer Security
  (TLS) tunnel is established between a client & a server using public key
  certificates on the server & client. As both supplicant & server are configured
  with certificates, this provides mutual authentication. The client will
  typically provide a certificate using a smart card or a certificate could be
  installed on the client device, possibly in a Trusted Platform Module (TPM).


  Protected Extensible Authentication Protocol (PEAP) - an encrypted tunnel is
  established between the supplicant & authentication server, but PEAP only
  requires a server-side public key certificate. The supplicant does not require
  a certificate. With the server authenticated to the supplicant, user
  authentication can then take place through the secure tunnel with protection
  against sniffing, password-guessing/dictionary, & on-path attacks. The user
  authentication method (also referred to as the "inner" method) can use either
  MS-CHAPv2 or EAP-GTC. The Generic Token Card (GTC) method transfers a token for
  authentication against a network directory or using a one-time password mechanism.


  EAP Tunneled Transport Layer Security (EAP-TTLS) - uses a server-side
  certificate to establish a protected tunnel through which the user's
  authentication credentials can be transmitted to the authentication server.
  The main distinction from PEAP is that EAP-TTLS can use any inner
  authentication protocol (PAP or CHAP, for instance), while PEAP must use
  EAP-MSCHAP or EAP-GTC. 


  EAP with Flexible Authentication via Secure Tunneling (EAP-FAST) - uses a
  Protected Access Credential (PAC) to set up the tunnel, which is generated for
  each user from the authentication server's master key. The problem with
  EAP-FAST is in distributing (provisioning) the PAC securely to each user
  requiring access. The PAC can either be distributed via an out-of-band method
  or via a server with a digital certificate. Alternatively, the PAC can be
  delivered via an anonymous Diffie-Hellman key exchange. The problem here is
  that there is nothing to authenticate the access point to the user. A rogue
  access point could obtain enough of the user credential to perform an ASLEAP
  password cracking attack.


 What do you need to know about IPsec? -

 IPsec - creates a boundary between unprotected & protected interfaces, for a
 host or a network; traffic traversing the boundary is subject to the access
 controls specified by the user or administrator responsible for the IPsec
 configuration

      • uses two protocols to provide traffic security services -- Authentication
      Header (AH) & Encapsulating Security Payload (ESP)

      • IPsec implementations MUST support ESP & MAY support AH

  AH offers integrity & data origin authentication, with optional (at the
  discretion of the receiver) anti-replay features

  ESP offers the same set of services & confidentiality; use of ESP to provide
  confidentiality without integrity is NOT RECOMMENDED

  Both offer access control enforced through the distribution of cryptographic
  keys & the management of traffic flows as dictated by the Security Policy
  Database

      *** Make sure to download & use the Domain 3 – IPsec Primer.txt document  


 What do you need to know about Elliptic Curve Cryptography (ECC)? -

 Elliptic Curve Cryptography (ECC) - asymmetric algorithm function used in
 public key cryptography ciphers; ECC used with a key size of 256 bits is
 comparable to RSA with a key size of 2048 bits

    • Elliptic Curve Cryptography is based on the algebra that defines elliptic
    curves over finite fields and the difficulty of the Elliptic Curve Discrete
    Logarithm Problem

    • NIST Suite B algorithms - Elliptic-curve Diffie-Hellman (ECDH) for key
    exchange & Elliptic Curve Digital Signature Algorithm (ECDSA) for digital
    signature - phased out in 2016 & replaced with the Commercial National
    Security Algorithm Suite (CNSA) designed to work as an intermediary standard
    until post-quantum cryptographic standards are formulated

      • P256 - no longer recommended for use by the NSA
      • P384 - used to protect information up to the top secret classification
      level


 What do you need to know about Forward Secrecy & AEAD? -

 Perfect Forward Secrecy (PFS) - uses a Diffie-Hellman (DH) key agreement to
 create ephemeral session keys without using the server's private key; the
 authenticity of the values sent by the server is proved by using a digital
 signature

 Authenticated encryption - provides a way to check integrity & authenticity of
 encrypted data

 Authenticated Encryption with Associated Data (AEAD) - ability to check the
 integrity & authenticity of Associated Data (AD), also called "additional
 authenticated data“, that is not encrypted

    • enhanced modes of operation that allow for validation steps through each
    iteration of block encryption

    • Advanced Encryption Standard in Galois/Counter Mode (AES-GCM) is an example
    of an AEAD encryption scheme


 What do you need to know about Key Stretching? -

 Key stretching - takes a key generated from a user password & repeatedly
 converts it to a longer & more random key by putting it through multiple
 rounds of hashing

    *** does not actually make the key stronger but instead slows down the
    attack because the attacker has to do extra processing for each possible key
    value

    performed using software designed to hash & save passwords when created


 Password-Based Key Derivation Function 2 (PBKDF2) - WPA, GRUB password
 rotection, Apple iOS user passwords, Cisco IOS Type 4 passwords, LastPass,
 & 1Password

 Bcrypt - adds a salt to improve resistance to brute-force attacks
