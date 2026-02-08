Classic Cryptanalytic Attacks
=======================================================

*3.7 Understand Methods of Cryptanalytic Attacks*
--------------------------


Description
--------------------------
In this episode, we will learn about classic cryptographic attacks that have been
used to break cryptosystem in history past and can even be applied today.


Resources
--------------------------
+ N/A
  

Learning Objectives
--------------------------
+ Describe Brute-force attacks
+ Describe Ciphertext-Only attacks
+ Describe Known Plain-text attacks
+ Describe Chosen Ciphertext attacks


Notes
--------------------------
+ Brute-Force
  - Generate every possible permutation of decryption key
+ Ciphertext Only
  - Attacker only has access to ciphertext
    + Attacker uses what is known about the ciphertext to decrypt and generate decryption key
  - *Frequency Analysis*
    + Each language uses certain letters with more or less frequency
      - English Frequency Order (greatest to least)
        + **ETAOINSHRDLCUMWFGYPBVKJXQZ**
+ Known Plain-text
  - Used to regenerate encryption key
    + Key then used to decrypt all messages that use that key
      - If you know ...
        + Some or all of the plain-text
        + And have the encrypted form of the known plain-text
          - You can use that to create a key
        + Enigma Cipher
          - Allies knew some of the plain-text in German encoded messages
            + Weather
            + Numbers
            + Common Greetings
            + Cities
          - From there they guessed and brute-forced the decryption key
+ Chosen Ciphertext
  - Attacker generates fake ciphertext
  - Target attempts to decrypt fake ciphertext
  - Decryption results in garbage output
  - Attacker is made aware of garbage output
    + Eavesdropping 
  - Attacker extrapolates key used by analyzing fake ciphertext and decrypted garbage output
    + `A1 B2 C3 D4 E5 F6 G7 H8 I9 J10 K11 L12 M13 N14 O15 P16 Q17 R18 S19 T20 U21 V22 W23 X24 Y25 Z26`
      - *Vigenere Cipher*
    + Message: `THIS IS A SECRET`
    + Key: `ACILEARNINGAC`
    + Encrypted: `UKREN TRGNQ YFW`
    + Fake Encrpyted: `RSTLN EOPAI JKQFG`
    + Key: `ACILEARNINGACIL`
    + Decrypted: `QPKZI DWBRU CJNWU`
      - Analysis
        + `Q` is **1** letter away from `R`
          - The 1st letter in the key must be `A`
        + `P` is **3** letters away from `S`
          - The 2nd letter in the key must be `C`
        + `K` is **9** letters awya from `T`
          - The 3rd letter in the key must be `I`
