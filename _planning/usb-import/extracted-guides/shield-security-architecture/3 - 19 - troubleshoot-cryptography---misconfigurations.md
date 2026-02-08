## Troubleshoot Cryptography - Misconfigurations


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, troubleshoot issues with cryptographic implementations.

### External Resources:

Troubleshoot Cryptography - Misconfigurations

 What do you need to know about Certificate Implementation & Configuration Issues? -

  • Validity dates
  • Wrong certificate type
  • Revoked certificates
  • Incorrect name - certificate CN name must match the FQDN of the system using it
  • Chain issues - certificate chain must be valid all the way through the chain
  • Self-signed certificate
  • Weak signing algorithm - displayed as "your connection is not private"


  Weak cipher suite - Errors in browsers include NS_ERROR_NET_INADEQUATE_SECURITY
  or ERR_SPDY_INADEQUATE_TRANSPORT_SECURITY

      • reconfiguration of the website is needed to remedy


  Incorrect permissions - When a template is used for certificate enrollment but
  permissions are incorrectly set, then an error will occur indicating that the
  "operation failed" or "cannot enroll for this type of certificate"


  Cipher mismatches - displayed as ERR_SSL_VERSION_OR_CIPHER_MISMATCH

      • can occur in modern browsers that identify old and/or deprecated cipher
      suites and refuse to use them & / or old operating systems & browsers that
      do not support modern cipher suites
