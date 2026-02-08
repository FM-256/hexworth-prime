## Trustworthy computing


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, configure and implement endpoint security controls.

### External Resources:

Trustworthy computing

 What are Secure Boot Configurations? -

 Trusted Platform Module (TPM) - hardware-based storage of encryption keys,
 hashed passwords, & other user / platform identification information; Implemented
 either as part of the chipset or as an embedded function of the CPU

    • hard-coded with a unique, unchangeable asymmetric private key called the
    endorsement key, used to create various other types of subkeys for key
    storage, signature, & encryption operations

    • support the concept of an owner, usually identified by a password; anyone
    with administrative control over the setup program can take ownership of the
    TPM, which destroys & then regenerates its subkeys

    • can be managed in Windows via the tpm.msc console or through group policy;
    enterprise networks, provisioning keys to the TPM centrally managed via the
    Key Management Interoperability Protocol (KMIP)


 BIOS vs UEFI - Basic Input/Output System & Unified Extensible Firmware Interface
 are firmware mechanisms designed to assist a computer/device load/boot an
 operating system

   • BIOS uses a Master Boot Record (MBR) for boot information; UEFI uses a GUID
   partition table (GPT) & enforces boot integrity checks

 Secure boot - prevents a computer from being hijacked by a malicious OS

   • UEFI is configured with digital certificates from valid OS vendors which are
   checked by the system firmware to ensure that the operating system boot loader
   & kernel has been digitally signed by the OS vendor; Prevents a boot loader or
   kernel that has been changed by malware (or an OS installed without
   authorization) from being used

   *** requires UEFI, but does not require a TPM

 Measured Boot - uses platform configuration registers (PCRs) in the TPM at each
 stage in the boot process to check whether hashes of key system state data (boot
 firmware, boot loader, OS kernel, & critical drivers) have changed

   • Does not usually prevent boot, but it will record the presence of unsigned
   kernel-level code


 What are Hardware-Based Encryption Protections? -

 Hardware-backed attestation - protect against threats that originate prior to
 operating system load

 Remote attestation services - centralized integrity checking mechanism that
 integrates with hardware-based solutions running on individual systems

    • Device OEMs store secure boot information in the firmware nonvolatile RAM
    (NV-RAM) during manufacture

    • Secure boot information includes a signature database (db), revoked
    signature database (dbx) & Key Enrollment Key (KEK) database

    • db & dbx contain signature &/or hash information for UEFI applications,
    operating system loaders (boot manager), & UEFI drivers

    • KEK contains the signing keys used to update the db & dbx databases

    • OEM locks the firmware to prevent changes from being made by anything other
    than updates signed with the associated KEK

 Hardware Security Module (HSM) - network appliance for centralized PKI management

    • can act as an archive or escrow for keys in case of loss or damage

    • designed to be tamper-evident to mitigate risk of insider threat & provides
    cryptographically-secure pseudorandom number generators (CSPRNGs)

    • rack-mounted appliances, plug-in PCIe adapter cards, & USB-connected external
    peripherals

 Self-Encrypting Drives (SEDs) - encryption process designed to be completely
 transparent & unknown to a system or application

    • incorporate FIPS 140-2 & IEEE 1667 encryption standards

    • drive manufacturers implement crypto-processors within the SSD (or HDD) 
    eliminating need for encryption keys to be stored in system RAM
