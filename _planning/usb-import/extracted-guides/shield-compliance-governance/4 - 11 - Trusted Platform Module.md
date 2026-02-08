Trusted Platform Module
==========================

*3.4 Understand Security Capabilities of Information Systems*
--------------------------


Description
--------------------------
In this episode, we will discover the Trusted Platform Module, or TPM, and its use.
We will also go over the TPM's processes of Binding and Sealing as well as identify
TPM-specific memory. 


Resources
--------------------------
+ https://www.gigabyte.com/Motherboard/GC-TPM20#ov
  

Learning Objectives
--------------------------
+ Define TPM
+ Explain the TPM processes of Binding and Sealing
+ List and define TPM-specific memory


Notes
--------------------------
+ What is a Trusted Platform Module(TPM)?
  - A hardware module used to securely manage sensitive data such as...
    + Encryption Keys
    + Digital Certificates
    + Hashes
  - https://www.gigabyte.com/Motherboard/GC-TPM20#ov

+ Explain Binding and Sealing
  - Binding the TPM to certain conditions|attributes necessary for decryption
  - Binding
    + Binding Key is created
    + Binding Key is used to encrypt or "Seal" data
  - Sealing
    + Sealed data can now be stored securely
    + To Unseal data, the binding conditions|attributes must be met


+ TPM-specific Memory
  - **Endorsement Key(EK)**
    + Non-ephemeral memory that contains public/private key pair
  - **Storage Root Key(SRK)**
    + Non-ephemeral memory that secures keys stored in the TPM
  - **Attestation Identity Key(AIK)**
    + Ephemeral memory that ensures the integrity of the EK
  - **Platform Configuration Register(PCR) Hashes**
    + Ephemeral memory that stores hashes for the Sealing function
  - **Storage Keys**
    + Ephemeral memory that contains the keys used to encrypt the system storage
      - HDD
      - USB
