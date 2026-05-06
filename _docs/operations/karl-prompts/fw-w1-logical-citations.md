# Karl invocation prompt — fw-w1-logical citation audit

> Paste this verbatim into a Karl sub-agent call. Karl loads at session start, so this is for use in a fresh session AFTER restart.
>
> Invocation pattern:
> ```
> Agent({
>   description: "Karl audit fw-w1-logical citations",
>   subagent_type: "karl",
>   prompt: "[paste content below]"
> })
> ```

---

Batch citation audit. The artifact under review is the Confluence page "[DRAFT] Shield — FW-W1: Logical Security Quiz" (id 8486914), which contains 15 cybersecurity quiz questions, each with a sourced answer. The architecture standard you enforce: ~/hexworth-shared/KBA/quiz-solutions-manual-architecture.md §"Citation Requirements".

Below are all 15 citations as currently published on the page (Confluence v3). For each: the claim being supported, the proposed URL, the verifying quote provided, and my source-type classification. Verify each per your mandate: fetch the URL, confirm content addresses the claim, confirm quote is verbatim or near-verbatim, classify source type.

Return your standard batch response: per-citation review block + summary verdict.

---

Q1 — CIA Triad
- Claim: "The three core security principles of the CIA Triad are Confidentiality, Integrity, Availability."
- URL: https://en.wikipedia.org/wiki/Information_security#CIA_triad
- Quote provided: "The 'CIA triad' of confidentiality, integrity, and availability is at the heart of information security."
- Classification: Secondary

Q2 — Ransomware violates Availability
- Claim: "Ransomware encrypts files and denies access until ransom is paid; this is a violation of the Availability property."
- URL: https://en.wikipedia.org/wiki/Ransomware
- Quote provided: "Ransomware is a type of malware that encrypts the victim's personal data until a ransom is paid."
- Classification: Secondary

Q3 — Fingerprint = Inherence factor
- Claim: "Biometric authentication factors like fingerprints are 'something you are' (inherence factors)."
- URL: https://pages.nist.gov/800-63-3/sp800-63b.html#sec5
- Quote provided: "The use of biometrics (something you are) in authentication includes both measurement of physical characteristics (e.g., fingerprint, iris, facial characteristics) and behavioral characteristics."
- Classification: Primary (NIST HTML)

Q4 — Authentication vs Authorization
- Claim: "Authentication verifies who you are; authorization determines what you are allowed to do."
- URL: https://learn.microsoft.com/en-us/entra/identity-platform/authentication-vs-authorization
- Quote provided: "Authentication is the process of proving that you are who you say you are. ... Authorization is the act of granting an authenticated party permission to do something. It specifies what data you're allowed to access and what you can do with that data."
- Classification: Vendor official

Q5 — Principle of least privilege
- Claim: "Least privilege means users receive only the minimum permissions necessary to perform their job functions."
- URL: https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview
- Quote provided: "Use least privilege access — Limit user access with Just-In-Time and Just-Enough-Access (JIT/JEA), risk-based adaptive policies, and data protection."
- Classification: Vendor official

Q6 — Stateful firewall vs packet-filtering
- Claim: "A stateful firewall tracks the state of active connections and uses connection context, distinguishing it from packet-filtering."
- URL: https://en.wikipedia.org/wiki/Stateful_firewall
- Quote provided: "A stateful firewall keeps track of the state of network connections, such as TCP streams, UDP datagrams, and ICMP messages, and can apply labels such as LISTEN, ESTABLISHED, or CLOSING."
- Classification: Secondary

Q7 — AES is symmetric encryption
- Claim: "AES (including AES-256) is a symmetric-key encryption algorithm."
- URL: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
- Quote provided: "The algorithm described by AES is a symmetric-key algorithm, meaning the same key is used for both encrypting and decrypting the data."
- Classification: Secondary

Q8 — VPN encrypted tunnel
- Claim: "A VPN creates an encrypted tunnel between two endpoints across an untrusted network like the internet."
- URL: https://en.wikipedia.org/wiki/Virtual_private_network
- Quote provided: "A virtual private network (VPN) is an overlay network that uses network virtualization to extend a private network across a public network, such as the Internet, via the use of encryption and tunneling protocols."
- Classification: Secondary

Q9 — RBAC = role-based permissions assignment
- Claim: "Role-Based Access Control (RBAC) assigns permissions based on a user's job function or role within the organization."
- URL: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
- Quote provided: "A role assignment is the process of attaching a role definition to a user, group, service principal, or managed identity at a particular scope for the purpose of granting access."
- Classification: Vendor official
- NOTE: I'm uncertain if this Azure-implementation page actually establishes the abstract "job function" claim.

Q10 — MFA requires factors from different categories
- Claim: "Multi-factor authentication requires at least two factors from two different categories."
- URL: https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks
- Quote provided: "Microsoft Entra multifactor authentication works by requiring two or more of the following authentication methods: Something you know (password). Something you have (trusted device). Something you are (biometrics)."
- Classification: Vendor official

Q11 — Implicit deny rule
- Claim: "A firewall's implicit deny rule drops all traffic that does not match any explicitly permitted rule."
- URL: https://en.wikipedia.org/wiki/Firewall_(computing)
- Quote provided: "The firewall maintains an access-control list which dictates what packets will be looked at and what action should be applied, if any, with the default action set to silent discard."
- Classification: Secondary

Q12 — Encryption at rest
- Claim: "Encryption at rest protects data stored on hard drives, SSDs, or other storage media."
- URL: https://learn.microsoft.com/en-us/azure/security/fundamentals/encryption-atrest#purpose-of-encryption-at-rest
- Quote provided: "Encryption at rest protects stored data (at rest). Attacks against data at rest include attempts to obtain physical access to the hardware where the data is stored, and then compromise the contained data."
- Classification: Vendor official

Q13 — TLS encrypts HTTPS web traffic
- Claim: "TLS provides encryption for web traffic, indicated by 'https://' in URLs."
- URL: https://www.rfc-editor.org/rfc/rfc8446
- Quote provided: "TLS allows client/server applications to communicate over the Internet in a way that is designed to prevent eavesdropping, tampering, and message forgery."
- Classification: Primary (IETF RFC, HTML)

Q14 — Password policy strengthens confidentiality
- Claim: "Strong password policies (length, complexity) strengthen confidentiality through stronger authentication."
- URL: https://pages.nist.gov/800-63-3/sp800-63b.html#sec5
- Quote provided (PARAPHRASE — I admit this was paraphrased, not verbatim): "Section 5.1.1 'Memorized Secret Verifiers' specifies password length requirements, composition rules, and the security rationale tying password strength to confidentiality."
- Classification: Primary (NIST HTML)
- NOTE: I already flagged this — quote is paraphrase, not verbatim. Please verify and propose actual verbatim text from that section.

Q15 — ACL = ordered permit/deny rules
- Claim: "An ACL on a network device defines rules that permit or deny traffic based on source, destination, protocol, or port."
- URL: https://en.wikipedia.org/wiki/Access-control_list
- Quote provided: "an access-control list provides rules that are applied to port numbers or IP addresses... each with a list of hosts and/or networks permitted to use the service."
- Classification: Secondary

---

For any FAIL or REJECT, propose a replacement URL if you find one. Pay extra attention to Q9 (does Azure RBAC page establish "job function" framing?), Q5 (does the Zero Trust page actually establish "minimum permissions necessary"?), and Q14 (the paraphrase issue I admitted).
