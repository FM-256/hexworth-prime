Encryption and Decryption
==========================

*3.4 Understand Security Capabilities of Information Systems*
--------------------------


Description
--------------------------
In this episode, we delve into the basics of using encryption. Here we'll discover
how encryption can be used to protect stored data as well as data in motion. 


Resources
--------------------------
+ https://www.gnupg.org/
+ https://gpg4win.org/
  

Learning Objectives
--------------------------
+ Define encryption and decryption
+ List common use-cases for encryption with data a rest and data in motion


Notes
--------------------------
+ What is encryption/decryption?
  - Obfuscating readable text, aka PlainText
    + For the purposes of securing sensitive information

+ Practically, how can we use encryption in our information systems?
  - Drive Encryption
    + BitLocker
    + LUKS
  - File Encryption
    + PGP/GPG
      - [GnuPG](https://www.gnupg.org/)
        + Encrypt file: `gpg -c secret.txt`
        + Decrypt file: `gpg secret.txt.gpg`
      - [GPG4Win](https://gpg4win.org/)
        + Kleopatra
  - Network Encryption
    + Wireshark demo
      - Telnet:SSH
      - FTP:SCP
      - HTTP:HTTPs
  - Email Encryption
    + OWA: *Options > Lock Icon > Encrypt*
  - Wifi
    + WPA2/Enterprise
    + WPA3
