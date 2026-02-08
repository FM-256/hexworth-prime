## Cryptography & PKI


### Objectives:

At the end of this episode, I will be able to:

Explain how cryptography and public key infrastructure (PKI) support security
objectives and requirements.

### External Resources:

Cryptography & PKI

 What do you need to know about Public Key Infrastructure (PKI)? -

 • Public Key Infrastructure (PKI) - a suite of tools designed to support
 public/private key management, integrity checks via digital signatures,
 authentication, & non-repudiation of users &/or devices through the use of
 private key encryption

      • centralizes digital certificate management & the methods used to provide
      cryptographic services; improves compliance with established policy &/or
      regulatory requirements

      • issues digital certificates guaranteed by a trusted certificate
      authority (CA); trusted CAs are preestablished by recording their
      information within operating system certificate stores, within browsers, &
      by using special hardware storage components (TPMs)

 • Key Escrow - defines the requirement for a copy of private keys to be securely
 stored with a trusted third party; Some PKI infrastructures allow private keys
 to be regenerated under certain circumstances


 Public key cryptography solves the problem of distributing encryption keys
 across an untrusted connection

 Enabling a safe method for exchanging keys allows for secure communication
 via symmetric encryption

 For confidential messages, the public key is used to encrypt the message; The
 message can then only be decrypted by the associated private key, which is
 protected & accessible only to its owner (Kerckhoffs's Principle)

 Integrity & authentication require hashing a message & then encrypting the
 hash with the private key

 The public key, which is accessible to all, is used to decrypt the hash which
 can then be independently verified

 When a public key can be used to decrypt a message, this means that the message
 must have been encrypted by the associated private key, which is only
 accessible to its owner


 What do you need to know about Code Signing & Data States? -

 • Code signing - provides proof of origin using a code signing certificate
 provided by a trusted Certificate Authority (CA)

 • Data in Transit (on the wire) – IPsec, TLS, VPNs

 • Data in Use - Trusted Execution Environment (TEE) mechanisms like Intel
 Software Guard Extensions

 • Data at Rest – AES, BitLocker, whole disk encryption, database encryption, &
 file or folder-level encryption


 What do you need to know about Secure Authentication? -

 Any computer can present a client certificate to a server to identify that it
 is an authorized device, using public key encryption to protect the
 communications between the two endpoints after setting up the session

 A web service or API can be configured to require a certificate to identify
 authorized endpoints using public key encryption to protect the session


 Smart card authentication - programs cryptographic information onto a card
 equipped with a secure processing chip; the chip stores the user's digital
 certificate, the private key associated with the certificate, & a personal
 identification number (PIN) used to activate the card 

 For Kerberos authentication, smart-card logon works as follows: 

 1. user presents the smart card to a reader and is prompted to enter a PIN
 2. the PIN authorizes the smart card's cryptoprocessor to use its private key
 to create a Ticket Granting Ticket (TGT) request, which is transmitted to the
 authentication server (AS)
 3. The AS is able to decrypt the request because it has a matching public
 key & trusts the user's certificate, either because it was issued by a local
 certification authority or by a third-party CA that is a trusted root CA
 4. The AS responds with the TGT & Ticket Granting Service (TGS) session key


 What do you need to know about PKI Support of Automation? -

 Presence of certificates can be used to identify the authorization status of
 a device or user

 These events can be logged & used to trigger alerts or automated responses
 based on the event

 Information can be supplied to SIEM & SOAR platforms; SOAR can leverage playbooks
 which include a series of predefined & automated steps to be completed as part
 of the evaluation of an event

 Automated event analysis routines can be defined; certificates can be
 generated & distributed to endpoints to define authorized users & devices & limit
 access to resources


 What do you need to know about Federated PKI? -

 A set of independent PKI hierarchies, each supporting separate trust domains &
 each with its own root CA, that are defined by a common set of policies that
 shape the trust relationships between them

 Example:

 Create a bridge CA which acts as an intermediary between root CAs & issues
 cross-certificates which define trust paths between the root CAs
