Client Vulnerabilities
=======================================================

*3.5 Assess and Mitigate the Vulnerabilities of Security Architectures, Designs, and Solution Elements*
--------------------------


Description
--------------------------
In this episode, we'll explore cybersecurity vulnerabilities associated with client-based systems. 


Resources
--------------------------
+ N/A


Learning Objectives
--------------------------
+ Define client-based systems
+ List and explain common security vulnerabilities associated with client-based systems


Notes
--------------------------
+ **What is a client-based system?**
  - End-user systems
    + Windows 7/10/11
    + Linux
    + MacOS
  - Connects to server services
    + Authentication
    + File Server
    + HTTP
  - Also used to create, modify, and store documents
    + Possibly sensitive data
      - Temp and Cached files
        + Clipboard (`WindowsKey + V`)
        + Browser
        + Wifi Passwords
        + Command History
        + Browser-stored passwords
      - Locally stored files
        + `passwords.txt`

+ **What are the Vulnerabilities?**
  - Weak permissions
  - Weak or no authentication
  - Vulnerable 3rd-party software
    + Shadow IT
  - Weak or no encryption
    + Full-disk
    + Confidential data
    + Network comms
      - Wireshark capture of Telnet session (Win10 > Metasploitable2)
  - Lacking Patches/Updates/Upgrades
    + Exploit-DB
    + Windows Updates
    + Apt/Yum/Pacman
    + EOL 
