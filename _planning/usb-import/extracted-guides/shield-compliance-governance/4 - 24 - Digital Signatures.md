Digital Signatures
=======================================================

*3.6 Select and Determine Cryptographic Solutions*
--------------------------


Description
--------------------------
In this episode, we will learn about Digital Signatures. Here we will define
what Digital Signatures are and how they are used. We will explore the process
of creating and using Digital Signature, step-by-step, so as to fully understand
the process.


Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ Define Digital Signatures
+ Explain the use of Digital Signagures
+ Explain the process of Digital Signatures


Notes
--------------------------
+ What are Digital Signatures?

+ How do they work?
  - Hash value of message is calculated
    + `md5sum topsecret.txt | awk '{print $1}' > sig.txt`
  - Hash is encrypted with **SENDER'S PRIVATE KEY**
    + `gpg --sign sig.txt`
  - You can now send message plain-text or encrypt with **RECIPIENT'S PUBLIC KEY**
    + `gpg -e -r john@example.com topsecret.txt`
  - Send file and signature to receiver
    + `zip topsecret.zip sig.txt.gpg topsecret.txt.gpg`
    + Serve it with `python3 -m http.server`
  - The recipient decrypts the digital signature with **SENDER'S PUBLIC KEY**
    + `gpg -d -o sig.txt sig.txt.gpg`
      - Only the sender's public key will decrypt files encrypted with sender's private key
        + This verifies the sender's identity
  - The hash value in the signature can now be compared with the hash value of the file
    + `gpg -d -o topsecret.txt topsecret.txt.gpg`
    + `md5sum topsecret.txt`
    + `cat sig.txt`
      - This validates the integrity of the file
