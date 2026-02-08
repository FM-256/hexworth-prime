- Filename: intro-to-iot-pentesting-5-5-1-firmware-backdoor.md
- Show Name: Intro to IoT Pentesting
- Topic Name: Firmware Hacking
- Episode Name: Firmware Backdoor

================================================================================


Firmware Backdoor
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Utilize firmware analysis, the Firmware Analysis Toolkit, and the Firmware
  Modkit in attempt to create custom backdoored firmware
--------------------------------------------------------------------------------


+ Let's discuss "backdoors"
  - Covert access

+ How do we get a "backdoor" onto a target device?
  - Customize the manufacturers firmware to include backdoor
  - Social Engineering for installation
  - Replace device with malicious device

+ Where do we start?
  - Firmware analysis
    + Startup
    + Pre-installed binaries
+ What if there aren't any useful pre-installed binaries
  - Custom tools
    + Meterpreter/MSFVenom
    + Custom built
      - Cross-Compiled
    + Pre-Compiled
      - https://github.com/darkerego/mips-binaries
      - Steal them from other firmware

+ Testing
  - Use Firmware Analysis Toolkit to make sure things are working

+ Upload to Device
  - Final testing
    + Upload backdoored firmware to physical device
    + Test for functionality
      - Social Engineering Attack
      - Physical Access
