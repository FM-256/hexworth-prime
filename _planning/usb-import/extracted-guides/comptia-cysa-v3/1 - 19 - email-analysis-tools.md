Filename: cysa-1b-2-7-1-email-analysis-tools.md
Domain: Tools and Techniques for Determining Malicious Activity
Episode: Email Analysis Tools
=========================================================================

Email Analysis Tools
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------

+ Explain a bit about email analysis 
  - Impersonation
    + Headers
  - Embedded Links
+ Sender Policy Framework(SPF)
  - Authentication system used to verify allowed "Sending email" Servers
    + Is this server allowed to send email on behalf of xyz.com?
      - Uses SPF records, which is published with its DNS record
        + Manually inspect SPF record
	  - ```
	    nslookup
	    set type=txt
	    acilearning.com
	   ```
+ DomainKeys Identified Mail(DKIM)
  - Use of Digital Signatures to verify email integrity
    + Public/Private keys 
      - Email recipient uses senders Public Key to validate digital sigantures
+ Domain-based Message Authentication, Reporting, and Conformance (DMARC)
  - Advertises that the sender domain is using SPF and/or DKIM
  - Tells recipient what to do with email that fails those auth methods
    + https://dmarcian.com/dmarc-inspector/
    + https://datatracker.ietf.org/doc/html/rfc7489
