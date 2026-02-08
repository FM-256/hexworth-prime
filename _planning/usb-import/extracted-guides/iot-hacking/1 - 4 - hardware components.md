- Filename: intro-to-iot-pentesting-1-1-3-hardware-components.md
- Show Name: Intro to IoT Pentesting
- Topic Name: IoT Basics
- Episode Name: Hardware Components

================================================================================


Hardware Components
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Identify hardware components commonly found in IoT devices
--------------------------------------------------------------------------------



+ UART
  - Universal Asynchronous Receiver-Transmitter
  - Serial Protocol (like RS232)
  - Devs use it for debugging
    + Can be used to get root shell
  - Usually 4 hardware pins/pads
    + Can be more, but only 3 are needed
      - GND
      - RX
      - TX
    + Other pins
      - VCC
  - UART Frame
    + Idle		high (1)
    + Start bit 	low  (0)
    + Data bits		5-9 bits
    + Parity bit	error checking (rarely used)
    + Stop		high (1)
  - 8N1
    + 8 Data Bits
    + No Parity
    + 1 Stop bit

+ JTAG
  - Joint Test Action Group
    + Allows dev to debug hardware on multi-layered circuit boards
  - Usually 10 Pins, but 5 are needed
    + TCK		Test Clock Input
    + TMS		Test Mode Select
    + TDI		Test Data Input
    + TDO		Test Data Output
    + TRST		Test Reset Input
  - Others
    + VCC
    + GND
      - It is typical to see multiple GND pins
	+ This helps to mitigate crosstalk on a flat ribbon cable

+ SOIC
  - Small Outline Integrated Circuit
    + 4, 8, 16, 24 pins
    + SPI
      - Serial Peripheral Interface
      - Can connect to retrieve data from EEPROM/Flash Memory
      - Uses 4 connections/wires to transmit data
        + CS		Chip Select
        + SCK		Serial Clock
        + MOSI		Master OUT, Slave IN
        + MISO		Master IN, Slave OUT
