## Authentication & authorization - discussion


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze the security requirements and objectives to provide the
appropriate authentication and authorization controls.

### External Resources:

Authentication & authorization - discussion

  What do you need to know about Credential Management & Passwords? -

  Credential Management - set of practices that an organization uses to issue,
  track, update, & revoke credentials for identities

  Privileged Access Management (PAM) - comprising people, processes &
  technology – to control, monitor, secure & audit all human & non-human
  privileged identities & activities across an enterprise IT environment

  Password Policies - enforce credential management principles by stipulating
  requirements for user-selected passwords


  What are Federated Trust methods? -

  • Federation – a company trusts accounts created & managed by a different company

  • OpenID – SSO for participating websites

  • Shibboleth – federated identity method based on SAML; used by universities &
  public service organizations

  • Transitive Trust – Domain A trusts Domain B; Domain B trusts Domain C; Domain
  A & C implicitly trust each other

  • Security Assertion Markup Language (SAML) - attestations (or authorizations)
  are written in eXtensible Markup Language (XML)

    • Communications use HTTP/HTTPS & Simple Object Access Protocol (SOAP)
    • Secure tokens are signed using the XML signature specification
    • Digital signature allows the relying party to trust the identity provider


  Access Control Vocabulary – Use if needed -

  Permissions - access granted to a subject for an object & what the subject can do

  Rights - the ability to take an action on an object

  Privileges - the combination of rights & permissions

  Implicit deny - access to an object is denied unless access has been explicitly granted

  Access Control Matrix - table that is made up of subjects, objects, & assigned
  privileges

    • System checks the matrix to see whether a subject has appropriate
    privileges to carry out activity

  Capability Table - subject focused, as opposed to an Access Control List (ACL)
  which is object focused

    • Capability tables identify the objects that a subject can access
    • ACLs identify the subjects that can access an object

  Constrained Interface - a view that only allows access to features/abilities
  granted to the subject

  Need to Know - subjects are only granted access to what they need to know to
  accomplish a task

  Least Privilege - includes the rights necessary to take action on a system,
  unlike need to know

  Separation of Duties - splitting tasks up between two or more individuals

  Security Policy - a document that defines security requirements for the
  organization


  What are the Access Control methods to know? -

  Discretionary Access Control (DAC) - owner determines who has access to the
  data & what privileges they have; while the owner never has the ability to
  ignore, or contradict the organization’s access control policies, he or she
  has the ability to interpret those policies to fit the specific needs of his
  or her system & his or her users

  Mandatory Access Control (MAC) - subjects & objects are granted a clearance
  level, referred to as a label; labelling of subjects & objects takes place
  using pre-established rules; rules cannot be changed by any subject account, &
  are therefore non-discretionary; a subject is not permitted to change an
  object's label or to change his or her own label

  Role-Based Access Control (RBAC) - a set of organizational roles are defined &
  subjects allocated to those roles; right to modify roles is reserved to a
  system owner & system is non-discretionary; users gain rights implicitly
  (through being assigned to a role) rather than explicitly (being assigned the
  right directly)

  Attribute-Based Access Control (ABAC) - capable of making access decisions
  based on a combination of subject & object attributes plus any context-sensitive
  or system-wide attributes; uses the eXtensible Access Control Markup
  Language (XACML)

  Rule-Based Access Control - access control policies are determined by
  system-enforced rules rather than system users


  What are the authentication protocols to know? -

  Single Sign-On (SSO) - authenticate once, access everything  you are authorized to

  Remote Authentication Dial-In User Service (RADIUS) - provides AAA services
  between network access servers & an authentication server; only encrypts the
  password exchange, not the rest of the authentication traffic & uses UDP 1812

  Diameter - Uses TCP port 3368 or Stream Control Transmission Protocol (SCTP)
  port 3868 & supports IPsec and TLS

  Terminal Access Controller Access-Control System Plus (TACACS+) - Separates
  AAA processes, allowing them to be hosted separately if necessary; encrypts
  all authentication information, using TCP port 49

  Lightweight Directory Access Protocol (LDAP) - directory service protocol that
  runs over Transmission Control Protocol/Internet Protocol (TCP/IP)

  Secure LDAP (LDAPS) - LDAP using SSL/TLS encryption protocols to prevent
  eavesdropping & man-in-the-middle attacks; server implementing LDAPS requires
  a signed certificate issued by a certificate authority, & the client must
  accept & install the certificate on their machine

  Kerberos - single sign-on network authentication & authorization protocol; Key
  Distribution Center (KDC) runs on port 88 using TCP or UDP; Authentication
  Service (AS) & the Ticket Granting Service (TGS)

  Extensible Authentication Protocol (EAP) - framework for deploying multiple
  types of authentication protocols and technologies

  Open Authorization (OAuth) - Enables secure delegated access

    • It lets an application access a resource that is controlled by someone
    else (end user)
    • This kind of access requires Tokens, which represent delegated right of
    access
    • OAuth uses the JavaScript object notation (JSON) web token (JWT) format
    for claims data
    • JWTs can easily be passed as Base64-encoded strings in URLs & HTTP headers
    & can be digitally signed for authentication and integrity


  An OAuth Access Token transaction requires three players: the end user, the
  application (API), & the resource (service provider that has stored your
  privileged credentials).

  The transaction begins once the user expresses intent to access the API:

    1. Application asks permission - The application or the API (application
      program interface) asks for authorization from the resource by providing
      the user’s verified identity as proof.

    2. Application requests Access Token - After the authorization has been
    authenticated, the resource grants an Access Token to the API, without
    having to divulge usernames or passwords.

    3. Application accesses resource - Tokens come with access permission for
    the API. These permissions are called scopes and each token will have an
    authorized scope for every API. The application gets access to the resource
    only to the extent the scope allows.


  OAuth 2.0 Terminology:

    	Resource Owner - The user who is interacting with the application (the user
      that owns the data the application wants to get to)

    	Client - The application with which the user is interacting directly

    	Authorization Server - The server which is used to Authorize the request
      sent by the client for the user’s data

    	Resource Server - The API or the system that actually holds the client’s data

    	Authorization Grant - The entity that proves that permission is granted to
      the client by the Authorization Server

    	Redirect URI - After the Authorization Grant is given by the Authorization
      Server, it is sent to the client, to the callback address provided by the client

    	Access Token - It is the key used by the client to access the resources it
      has been granted access to at the Resource Server


    Client Types -

    OAuth defines two client types, based on their ability to authenticate
    securely with the authorization server (i.e., ability to maintain the
    confidentiality of their client credentials):

    	Confidential: Clients capable of maintaining the confidentiality of their
      credentials (e.g., client implemented on a secure server with restricted
      access to the client credentials), or capable of secure client
      authentication using other means.

    	Public: Clients incapable of maintaining the confidentiality of their
      credentials (e.g., clients executing on the device used by the resource
      owner, such as an installed native application or a web browser-based
      application), & incapable of secure client authentication via any other means.


    Protocol Endpoints - The authorization process utilizes two authorization
    server endpoints (HTTP resources):

    	Authorization endpoint — used by the client to obtain authorization from
      the resource owner via user-agent redirection.

    	Token endpoint — used by the client to exchange an authorization grant for
      an access token, typically with client authentication.


    As well as one client endpoint:

    	Redirection endpoint — used by the authorization server to return responses
      containing authorization credentials to the client via the resource owner
      user-agent.


 802.1x - port-based Network Access Control (NAC) protocol

    • Allows for an EAP method when a device connects to an Ethernet switch port,
    wireless access point (with enterprise authentication configured), or VPN
    gateway

    • 802.1X uses authentication, authorization, & accounting (AAA) architecture:
      • Supplicant - device requesting access
      • Network Access Server (NAS) - Edge network appliances, such as switches,
      access points, & VPN gateways; also referred to as RADIUS clients or
      authenticators
      • AAA server - The authentication server in the local network

    • NAS devices do not have to store any authentication credentials; They
    forward this data between the AAA server & the supplicant

    • There are two main types of AAA server: RADIUS & TACACS+


  What are the identity proofing mechanisms to know? -

Verifying that the user truly is who they claim to be

 Multifactor Authentication (MFA)

 2-Step Verification (out of band mechanism vs. in-band mechanism)

 HMAC-Based One-Time Password (HOTP) - algorithm for token-based authentication
(tools.ietf.org/html/rfc4226)

  • Authentication server & client token are configured with the same shared
  secret; an 8-byte value generated by a cryptographically strong random number
  generator

  • Token could be a fob-type device or implemented as a smartphone
  authentication/authenticator app

  • Shared secret is combined with a counter to create a one-time password when
  the user wants to authenticate

  • Device & server both compute the hash & derive an HOTP value that is six to
  eight digits long

  • User must enter value to authenticate with the server; counter is incremented
  by one

 Time-Based One-Time Password (TOTP) - a refinement of the HOTP
  (tools.ietf.org/html/rfc6238)

  • The HMAC is built from the shared secret plus a value derived from the device’s
 & server's local timestamps

  • TOTP automatically expires each token after a short window (60 seconds)

  • Client device & server must be closely time-synchronized (Google Authenticator)


 Hardware Root of Trust (RoT) (trust anchor) – a secure subsystem that is able
 to provide attestation; established by a type of cryptoprocessor called a
 trusted platform module (TPM)

 JavaScript Object Notation (JSON) Web Token (JWT) – transfer claims between two
 parties

  • Claims are encoded as JSON objects to enable them to be digitally signed,
  protected with a Message Authentication Code (MAC), &/or encrypted

  • JWTs are comprised of a header, payload, & signature separated by dots &
  expressed using Base64
