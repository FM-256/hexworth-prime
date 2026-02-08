- Filename: intro-to-iot-pentesting-2-2-1-ttl-to-usb.md
- Show Name: Intro to IoT Pentesting
- Topic Name: Tools
- Episode Name: TTL-to-USB

================================================================================


TTL-to-USB
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Become familiar with the function and use-case of a Serial-to-USB device
--------------------------------------------------------------------------------


+ What is a TTL-to-USB device?
  - Connects serial TTL devices through USB

+ Why do we need this?
  - You'll notice that computers don't have serial ports anymore 
    + They have tons of USB though
  - We need to make serial connections
    + UART

+ Identify the connectors
  - VCC		Power
  - GND		Ground
  - RXD		Receive Data
  - TXD		Transmit Data
  - RTS		Request To Send (flow control)
  - CTS		Clear to Send (flow control)
  - Jumpers	1v8,2v5,3v3,5v0
  - LEDs	PWR, RTD, TXD
