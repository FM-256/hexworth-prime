## Security considerations


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, apply secure configurations to enterprise mobility.

### External Resources:

Security considerations

 What are Mobile Device Security Concerns to know? -

 Wearables – collect a wide range of personal biographic health data which is
 shared according to device/application privacy policies, leading to potential
 issues related to health privacy

 Wireless Eavesdropping – channels are susceptible to eavesdropping or on-path
 attacks designed to intercept &/or modify traffic

 Hardware & Manufacturer Concerns –patching & security dependent upon the level
 of support provided by the OEM

 Containerization –  allows the employer to manage & maintain the portion of the
 device that interfaces with the corporate network

    • Storage segmentation - container is associated with a directory on the
    persistent storage device that is not readable or writable by apps that are
    not in the container

    • Apps cannot write to areas outside the container

    • App network access might be restricted to a VPN tunneled through the
    organization's security system


 Jailbreaking - enables a user to obtain root privileges, sideload apps, change
 or add carriers, & customize the interface; iOS jailbreaking is accomplished by
 booting the device with a patched kernel;

    • Tethered Jailbreak - the device is attached to a computer when it boots

    • Rooting (Android devices) - authorized mechanisms &/or exploit a
    vulnerability or use custom firmware; Custom firmware is a new Android OS
    image applied to the device (custom ROM)

    • Systemless Root - the system partitions are not modified; makes it harder
    to detect that rooting has been performed as modifications are stored in the
    boot partition of the device instead of changing original system files

    • Sideloading - selection of different stores & installation of untrusted
    apps from any third party; untrusted apps can be downloaded from a website &
    installed using the .apk file format

  US-CERT Cyber Threats to Mobile Phones -

    https://us-cert.cisa.gov/sites/default/files/publications/cyber_threats_to_mobile_phones.pdf

  US-CERT Technical Information Paper - Cyber Threats to Mobile Devices -

    https://www.us-cert.gov/reading_room/TIP10-105-01.pdf

  NIST Mobile Device Security: Corporate-Owned Personally-Enabled (COPE) -

    https://doi.org/10.6028/NIST.SP.1800-21

  NIST Guidelines for Managing the Security of Mobile Devices in the
  Enterprise: SP 800-124 -

    https://doi.org/10.6028/NIST.SP.800-124r2-draft


 Unauthorized application stores - applications that do not undergo the same
 level of screening or evaluation as applications provided by official application
 stores

     • Settings change to "allow installation from unknown sources" is all that is
     needed to disable restriction

     • Using applications from unauthorized stores may also require a device to be
     rooted or jailbroken


 Bootloader Security - validating that it is not loading an unauthorized or
 tampered operating system, that unauthorized tools cannot access the contents
 in flash memory, & that the bootloader itself remains intact.

    • eFuses - enable permanent writes to flash storage; allows for cryptographic
    keys to be permanently "etched" into the device so that they can be trusted
    & used to validate the integrity of the software used during the boot process


Digital Forensics of Mobile Devices - amount of information available depends
upon device features & capabilities & modifications made by the user or service
provider

    • Subscriber & equipment identifiers
    • Date/time, language, & other system settings
    • Phonebook/Contacts
    • Calendar information
    • Text & Multimedia messages
    • Email
    • Outgoing, incoming, & missed call logs
    • Photo/Audio/Video files
    • Instant messaging application data
    • Web browsing history
    • Social media & application data
    • Location/geolocation information
    • Documents
    • Health data
