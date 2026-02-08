## PKI - Advanced


### Objectives:

At the end of this episode, I will be able to:

Given a business requirement, implement the appropriate PKI solution.

### External Resources:

PKI - Advanced

 What do you need to know about Certificate Usage? -

 Client & Server authentication & Code Signing – validity of parties in a
 communication stream & downloaded/provided code

 Digital Signatures –  provide assurance that a message does indeed come from
 the person who claims to have sent it, it has not been altered, both parties
 have a copy of the same document, & the person sending the document cannot
 claim that he/she did not send it

      • A block of data (usually a hash) that is generated based on the contents
      of the message sent & encrypted with the sender’s private key


 How a Digital Signature is created:

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


 What do you need to know about Certificate Management & Trust? -

 Single CA (root only) vs. CA Hierarchy (root & subordinates)

 Cross Certification - establishing a trust relationship between two different
 certification authorities

 Trusted Providers - set of root CAs trusted to validate identity

 Certificate Profiles - the set of certificates allowed within an organization

                  PKI - Certificate Authorities.jpg


 Lifecycle Management phases (8):

  • Generate – policies & processes for request & issuance of certificates
  • Provision – types of certificates to be issued & circumstances by which they
  can be provided
  • Discover – scanning to identify certificates in use
  • Inventory – formal documentation of certificates in use
  • Monitor – identify changes or any anomalous activity related to use
  • Protect – private keys via Key Encrypting Keys (KEKs)
  • Renew – expiring certificates are identified & use of automation
  • Revoke – remove certificates that have violated policy


 What do you need to know about Web Traffic Protection? -

 Problem - When certificates are used by a transport protocol there is a
 possibility that the chain of trust can be compromised

 If an adversary can substitute a malicious but trusted certificate into the
 chain (using some sort of proxy or man-in-the-middle attack), they could
 eavesdrop on the secure connection

 What to do?

 Solutions –

 Pinning - ensures that when a client inspects the certificate presented by a
 server or a code-signed application, it is inspecting the proper certificate

 Stapling - having the SSL/TLS web server periodically obtain a time-stamped OCSP
 response from the CA; when a client submits an OCSP request, the web server
 returns the time-stamped response, rather than making the client contact the
 OCSP responder itself

 HTTP Strict Transport Security (HSTS) - configured as a response header on a
 web server & notifies a browser to connect to the requested website using HTTPS
 only; mitigates against downgrade attacks, such as SSL stripping

  *** preferable over performing a simple redirect as it notifies the browser it
  should never attempt to load the page using http, preventing on-path (formally
  referred to as man-in-the-middle) attacks

 Returns a header named Strict-Transport-Security, which includes an expiration
 date/time; the next time the browser attempts to load the page it will do so
 using https only

 HSTS preload services exist to preload browsers with a list of sites that should
 never be accessed using http

    • Preload services are not part of the HSTS specification they are included
    as a security feature of most modern browsers
