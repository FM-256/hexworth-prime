## PKI - Basics


### Objectives:

At the end of this episode, I will be able to:

Given a business requirement, implement the appropriate PKI solution.

### External Resources:

PKI - Basics

 What do you need to know about Public Key Infrastructure (PKI)? -

 PKI - Software, services, & hardware that support the generation of digital
 certificates & capabilities of public-key encryption

 Components:

      • Certificate Authorities (CA)
      • Enterprise vs. Stand-Alone
      • Root vs. Subordinate
      • Registration Authority (RA)
      • Certificate Signing Request (CSR)


          PKI - Certificate Authorities.jpg


 What do you need to know about Digital Certificates? -

 Digital Certificate - proves the authenticity of a device, server, or user
 through the use of cryptography & public key infrastructure (PKI)

 General Purpose or Domain Validation (DV) certificate — proving the ownership
 of a particular domain; proved by responding to an email to the authorized
 domain contact or by publishing a text record to the domain;

  *** process can be highly vulnerable to compromise

  Extended Validation (EV) certificate — requires more rigorous checks on the
  subject's legal identity & control over the domain or software being signed;
  EV standards are maintained by the CA/Browser forum (cabforum.org) 

        • Issued using the exact same mechanisms as standard ones

  *** Cannot be issued for a wildcard domain


  Wildcard certificates — contains the wildcard character * in its domain name
  field; allows the certificate to be used for any number of subdomains

        • Useful for SSL accelerators & load balancers (LB); LB or accelerator
        can be configured to protect communications using the wildcard
        certificate & successfully deliver content for any number of subdomain
        websites

 Subject Alternative Name (SAN) Certificates — secure multiple fully qualified
 domain names with a single certificate; needed to secure multiple domains that
 resolve to a single IP address (shared hosting environments)

Certificate Revocation List (CRL) - mechanism for informing users whether a
certificate is valid, revoked, or suspended; CAs must maintain a certificate
revocation list (CRL) of all revoked & suspended certificates, which can be
distributed throughout the hierarchy

      • Risk that the revoked certificate might still be accepted by clients
      because an up to date CRL has not been published or the browser (or other
      application) may not be configured to perform CRL checking

 *** A suspended key is given the code Certificate Hold; If a certificate is
 revoked, it cannot be reinstated but a suspended certificate can be re-enabled

 Online Certificate Status Protocol (OCSP) - checks the request’s validity with
 a trusted CA, which advises whether the certificate is valid or not, with a
 response of current, revoked, or unknown

    • OCSP server is the OCSP responder  
