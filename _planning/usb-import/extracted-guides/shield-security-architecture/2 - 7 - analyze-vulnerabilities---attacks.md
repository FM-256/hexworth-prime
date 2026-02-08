## Analyze vulnerabilities - attacks


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze vulnerabilities and recommend risk mitigations.

### External Resources:

Analyze vulnerabilities - attacks

 What do you need to know about Web Application Attacks? -

 Directory Traversal (file path traversal) - web server vulnerability allowing
 an attacker to access the operating system files of the server, reading or
 writing files to the operating system

      Linux - /var/www
      Windows - C:\inetpub\wwwroot

 Variation is to use URL encoding to obscure the characters ../../, replacing
 them with their URL encoded equivalents where %2E represents . & %2F represents /


 Protection - configuring web server to only retrieve files with preconfigured
 file extensions & configuring the file server to block traversal
 sequences (such as ../../)

    • can be bypassed by using the null byte, URL encoded character %00 which
    tells the application to stop reading & proceed


 Cross-Site Scripting (XSS) -  attacker can execute malicious code in the
 victim’s browser; code is usually injected by the attacker when the victim
 browses a trusted site

    • able to harvest credentials, redirect victims to phishing pages, & hijack
    a user session using cookies

 Three types of XSS:

    Reflected XSS - application or API includes unvalidated & unescaped user
    input as part of HTML output; user will need to interact with some malicious
    link that points to an attacker controlled page

    Stored XSS - application or API stores unsanitized user input that is viewed
    at a later time by another user

    DOM XSS - JavaScript frameworks, single-page applications, & APIs that
    dynamically include attacker-controllable data

  https://owasp.org/www-community/attacks/xss/


 Cross-Site Request Forgery (CSRF) - tricks the victim into submitting a malicious
 request & inherits the identity & privileges of the victim to perform an
 undesired function on the victim’s behalf

    • for most sites, browser requests automatically include any credentials
    associated with the site, such as the user’s session cookie, IP address, &
    domain credentials

    • if the user is currently authenticated to the site, the site will have no
    way to distinguish between the forged request sent by the victim & a
    legitimate request sent by the victim


 Understanding the difference between XSS & CSRF:

   • The primary difference is that a CSRF attack requires an authenticated
   session, whereas an XSS attack does not

   • CSRF is restricted to the actions the victim can perform. On the other hand,
   XSS works on the execution of malicious script broadening the scope of actions
   the attacker can perform

   • XSS requires a vulnerability to exist, whereas CSRF relies on tricking the
   user to click a link or access a page

   • CSRF can only send an HTTP request but cannot view the response. XSS can send
   and receive HTTP requests and responses to extract the required data


 What do you need to know about Injection Attacks? -

 • XML & XML External Entity (XXE) Injection
 • LDAP Injection
 • Command Injection
 • Process Injection

 SQL Injection (SQLi) -

SELECT * FROM userTable where USERNAME = '' OR 'x' = 'x' -- user' AND PASSWORD = 'pw’:

    • select everything from the table called userTable where the username is
    blank or true & ignore the rest of the words on this line (-- is a comment
    indicator in SQL)

    • either web application will authenticate the attacker as the first user
    stored in the table (typically the website administrator) or return the
    full contents of the userTable table


 Authentication Bypass - exploits how user logins are obtained & processed by web
 applications

    • use of SQL language in place of the username expected by the application

    • providing a username of ' OR 'x' = 'x' -- or ' OR 1=1 -- may result in the
    attacker being authenticated as the administrative user

 Protection –

    Input Validation - checking for & rejecting the use of suspicious characters

    Parameterization - username & password fields are passed to the database as
    variables & processed as text strings


 What do you need to know about Infrastructure Attacks? -

 VLAN Hopping –

 Switch Spoofing - adversary transmits traffic to the switch to identify that it
 originates from another switch, as opposed to a device

    • vulnerable switch automatically configures the connected port as a trunk
    • attacker will obtain access to all VLAN traffic


 Protection - default configuration of the switch must be changed to not allow
 dynamic trunking; trunk ports are explicitly defined & configured by a network
 administrator


 Double Tagging - adversary takes advantage of the default configuration of the
 native VLAN (which is typically VLAN ID 1) by manipulating tags


 Protection - default VLAN ID should be changed (value must be the same for all
 connected switches); no user devices should be added to the native VLAN


 Border Gateway Protocol (BGP)/Route Hijacking - occurs when the IP addresses
 associated with an autonomous system are improperly announced

    • BGP routers inherently trust the announcements made by an AS

    • improper announcement designed to make traffic paths from one location of
    the Internet to another appear to be more efficient will result in the
    redirection of that traffic


 Protection - IP prefix filtering, ensuring IP address announcements are sent &
 accepted only from a small set of well-defined autonomous systems & monitoring
 Internet traffic to identify signs of abnormal traffic flows


 • Sandbox Escape
 • Virtual Machine (VM) Hopping & Escape
 • Interception Attacks
 • Denial-of-Service (DoS)/DDoS
 • Social Engineering
