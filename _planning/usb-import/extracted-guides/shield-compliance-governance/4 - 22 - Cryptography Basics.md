Cryptography Basics
=======================================================

*3.6 Select and Determine Cryptographic Solutions*
--------------------------


Description
--------------------------
In this episode, we will delve into the fundamentals of cryptography; covering common
terms and definitions, the cryptographic lifecycle, and common types of cryptography. 


Resources
--------------------------
+ https://www.asciitable.com/
  

Learning Objectives
--------------------------
+ Become familiar with common cryptographic terms and definitions
+ Define the cryptographic lifecycle
+ List the common types of cryptography


Notes
--------------------------
+ Common Terms and Definitions
  - Encryption/Decryption
  - Plaintext/Cyphertext
  - Keys
  - Hash
  - Collision
  - Algorithm
  - Nonce
  - Ecoding/Decoding
    + [ASCII Table](https://www.asciitable.com/)
  - Transposition
  - Substitution
  - Kerckhoff's Principle
    + As long as the key is secret the message will be secure
      - Even if everything else about the cryptosystem is public
+ Cryptographic Lifecycle
  - Keys
  - Algorithm Selection
+ Common Types of Cryptography
  - Caesar Cipher (ROT13)
    + A simple substitutional cipher
    + `echo "password" | tr 'a-zA-Z' 'n-za-mN-ZA-M'`
    + `echo "cnffjbeq" | tr 'n-za-mN-ZA-M' 'a-zA-Z'`
  - Symmetric
    + Generate symmetric key
      - `openssl rand -out symmetric.key 32`
    + Encrypt a file with symmetric key
      - `openssl enc -aes-256-cbc -salt -pbkdf2 -iter 10000 -in secret.txt -out secret.enc -pass file:symmetric.key`
    + Decrypt the encrypted file with symmetric key
      - `openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 200 -in secret.enc -out secret.txt -pass file:symmetric.key`
  - Asymmetric
    + Generate a key pair
      - `gpg --full-gen-key`
      - `gpg --list-keys`
      - `gpg --export -o user1Pub.key <keyID>`
    + Encrypt a file with public key
      - `gpg -e -r user2@example.com secret.txt`
    + Decrypt the encrypted file with private key
      - `gpg -d -o secrets.txt secret.txt.gpg`
  - Eliptic Curve
    + RSA uses prime factorization in its encryption algorithm
      - By factoring prime numbers, the algorithm can create large numbers to use for encryption
        + ECC does the same thing, but uses the mathematical structure of elliptic curves
    + Advantages of ECC
      - FAST!
      - Smaller keys. (like a LOT smaller)
      - More difficult to break the encryption
        + This has given ECC great success in the mobile space
  - Quantum Cryptography
    + Uses quantum mechanics instead of mathematics to encrypt
    + Superposition
    + Detects eaves-dropping
      - The outcome of a conversation is altered if an attacker observes the conversation
