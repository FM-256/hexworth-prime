- Filename: intro-to-iot-pentesting-5-3-1-Analyzing Firmware.md
- Show Name: Intro to IoT Pentesting
- Topic Name: Firmware Hacking
- Episode Name: Analyzing Firmware

================================================================================


Analyzing Firmware
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Explore firmware filesystems to uncover possible sensitive information or
  actionable intel
--------------------------------------------------------------------------------


+ Where do we begin?
  - Learn about the embedded system
    + `uname`
    + `/etc/issue`
    + `netstat`
    + `ps aux`

+ What kind of secrets are we looking for?
  - Certificates
  - Keys
  - Hard-coded creds
    + www
  - usernames/passwords

+ Anything else?
  - What apps are installed
    + `/bin`
    + `/sbin`
    + `/usr/bin`
    + `/usr/sbin`
