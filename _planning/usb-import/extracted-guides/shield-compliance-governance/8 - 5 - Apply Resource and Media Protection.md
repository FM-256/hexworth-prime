# 1-5-1: Apply Resource and Media Protection

After completing this episode, you should be able to:

+ Identify and explain media protection techniques, given a scenario.

**Description:** In this episode, the learner will examine various resource protection techniques. We will explore media management, data states, media protection methods, and more.


+ Describe resource and media protection
  + Resource protection - implementing measures to safeguard valuable information assets and infrastructure from unauthorized access, use, disclosure, disruption, modification, or destruction.
    + Examples
      + Restricting access to server rooms 
      + Implementing file encryption
  + Media protection
    + Ensures secure handling, storage, and disposal of physical and digital media containing sensitive information
      + Examples
        + Using secure storage for backup tapes
        + Employing media sanitization processes before disposal
+ Describe media protection techniques
  + Involves applying physical and logical controls to protect media from unauthorized access and damages
    + Example
      + Encrypting data on removable media 
      + Locking media storage areas
+ Describe the states of data and protection techniques
  + Data at Rest
    + Protecting information stored on devices or media from unauthorized access or tampering.
      + Full Disk Encryption
        + Using tools like Microsoft BitLocker or Apple FileVault to encrypt entire drives, ensuring data is inaccessible without proper authentication.
      + Database Encryption
        + Implementing Transparent Data Encryption \(TDE\) in SQL Server or Oracle Database to protect stored data.
      + Data Masking
        + Applying data masking techniques for sensitive information in databases, ensuring that data at rest cannot be easily interpreted if accessed.
      + Secure Erasure
        + Utilizing certified data destruction software or services to ensure data is irrecoverably deleted when no longer needed.
      + File-level Encryption
        - Employing Encrypting File System \(EFS\) in Windows or third-party encryption tools.
      + Employing EFS \(Encrypting File System\) 
        - For Windows-based systems or using third-party encryption tools to protect individual files and directories.
  + Data in Transit
    + Securing data while it is being transferred between locations, systems, or component
      + SSL/TLS Encryption
        + Implementing SSL/TLS protocols for data transmitted over networks, using tools like OpenSSL for configuration and certificate management.
      + VPN Services
        + Using VPN solutions like OpenVPN or Cisco's VPN for secure communication channels over untrusted networks.
      + Email Encryption
        + Employing PGP \(Pretty Good Privacy\) or S/MIME for encrypting email messages and attachments in transit.
      + Secure File Transfer
        + Utilizing SFTP \(SSH File Transfer Protocol\) or SCP \(Secure Copy\) instead of FTP for secure file transfers.
      + API Security
        + Applying OAuth 2.0 \(authorization protocol\), API keys, and HTTPS for securing API data in transit between services.
  + Data in Use
    + Ensuring data being processed or used by applications is protected against threats
      + Application-level encryption
        + Integrating AES encryption directly into applications to protect sensitive data while it's being processed.
      + Trusted Execution Environments \(TEEs\)
        + Utilizing TEEs like Intel Software Guard Extensions \(SGX\) to provide isolated execution spaces where sensitive data can be processed securely.
      + Homomorphic Encryption
        + Implementing emerging technologies that allow computations to be performed on encrypted data, maintaining privacy while data is in use.
      + Data Access Management
        + Using access control mechanisms and identity management solutions like Active Directory to limit data exposure to authorized users during use.
      + Endpoint Protection Platforms
        + Deploying solutions like Symantec Endpoint Protection or Microsoft Defender for Endpoint to safeguard data against unauthorized access and malware during processing on end-user devices.
+ Describe examples of media management and protection techniques
  + Encryption
    + Using BitLocker or VeraCrypt for full disk encryption on physical media to protect data at rest.
  + Secure storage and inventory
    + Utilizing fireproof safes and secure off-site storage facilities to store backup media, and maintaining an inventory using asset management tools like Snipe-IT.
  + Access control
    + Implementing biometric access controls or key card systems to restrict access to physical media storage areas.
  + Transport security
    + Using tamper-evident bags and secure transport services for moving sensitive media between locations.
  + Labeling and handling
    + Applying clear labeling protocols for media, categorizing them based on sensitivity levels, and training staff on proper handling procedures.
  + Disposal and sanitization
    + Employing tools like DBAN \(Darik's Boot and Nuke\) for secure data erasure or using professional shredding services for physical media destruction.

-----
+ Grandfather-Father-Son (GFS):
  + This backup strategy involves three levels of backups: daily (son), weekly (father), and monthly (grandfather).
  + The approach ensures a mix of recent and older data backups, with the daily backups rotated more frequently, and the monthly backups kept the longest.
  + GFS is known for its simplicity and effectiveness in maintaining a consistent and manageable set of backup data over time, making it suitable for businesses that require regular, systematic backups.
+ Tower of Hanoi:
  + Based on the mathematical puzzle of the same name, this strategy uses a sequence that minimizes the number of tapes needed to perform backups over time while still providing a good mix of recent and older backups.
  + Backups are rotated in a predefined, non-linear sequence that ensures a variety of restore points, optimizing storage usage while protecting against data loss.
  + This method is more complex than GFS but is effective for saving storage space and is suitable for environments where storage resources are limited, but data recovery needs are flexible.
  