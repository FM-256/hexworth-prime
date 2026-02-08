- Filename: intro-to-iot-pentesting-6-1-1-manually-identifying-uart-pins.md
- Show Name: Intro to IoT Pentesting
- Topic Name: Hardware Hacking
- Episode Name: Manually Identifying UART Pins

================================================================================


Manually Identifying UART Pins
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Use a multimeter and knowledge of UART pin functions to determine UART pinout
  on an unlabled PCB
--------------------------------------------------------------------------------


+ Find GND pin
  - Continutiy Test
+ Determine RX, TX, and VCC pins
  - RX
    + Typically lower voltage than other pins
    + Also not much variance in voltage
  - TX
    + Typically has a lot of variance in voltage
    + Can see voltages that are close to VCC
      - Check each pin during boot to catch voltage changes due to data output
  - VCC
    + Typically close to full voltage (3.3)
    + Not much variance in voltage if any
