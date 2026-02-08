## Troubleshoot Cryptography - Keys


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, troubleshoot issues with cryptographic implementations.

### External Resources:

Troubleshoot Cryptography - Keys

 What do you need to know about Cryptographic Key Implementation & Configuration
 Issues? -

  • Mismatched - wrong public/private key pair is used to decrypt data; Errors
  such as "key mismatch" or "X509_check_private_key“

  • Improper key handling

  • Embedded keys

  • Rekeying - triggered by the volume of traffic protected by an individual key,
  as opposed to the amount of time it has been used

  • Crypto shredding

  • Cryptographic obfuscation - Linux/etc/shadow file contains obfuscated
  passwords for local users

  • Key rotation - previous key must be revoked as part of the rotation process

  • Compromised/exposed keys
