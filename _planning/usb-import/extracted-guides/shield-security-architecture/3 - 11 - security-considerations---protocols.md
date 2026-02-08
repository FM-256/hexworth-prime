## Security considerations - protocols


### Objectives:

At the end of this episode, I will be able to:

Explain security considerations impacting specific sectors and operational
technologies.

### External Resources:

Security considerations - protocols

 What do you need to know about ICS Protocols? -

 Controller Area Network (CAN bus) - automobiles & UAVs / drones have sophisticated
 electronics & the systems they control are implemented as an electronic control
 unit (ECU), connected via one or more CAN bus serial communications buses

      • principal external interface is an Onboard Diagnostics (OBD-II) module;
      acting as a gateway for multiple CAN buses

      • CAN bus operates similarly to shared Ethernet; ECUs transmit messages as
      broadcasts so they are received by all other ECUs on the same bus

      *** no source addressing or message authentication

 Attacker able to attach a malicious device to the OBD-II port is able to perform
 DoS attacks against the CAN bus, threatening the safety of the vehicle

 Remote access to the CAN bus via the cellular features of the automobile's
 navigation & entertainment system

 On-board Wi-Fi further broadens attack surface

 Modbus - communication protocol giving control servers & SCADA hosts the ability
 to query & change the configuration of each PLC in an Operational Technology
 (OT) network

    • Originally designed as a serial protocol (Modbus RTU) running over a fieldbus
    network but has been adapted to use Ethernet & TCP/IP as well

    • Other protocols include EtherNet/IP, a variant of the Common Industrial
    Protocol (CIP), Distributed Network Protocol (DNP3), & Siemens S7comms

 Data Distribution Service (DDS) - enables network interoperability for connected
 machines & facilitates the scalability, performance, & Quality of Service (QoS)

    • DDS supports on-premise and Cloud scenarios as well as automated
    orchestration of all connected components


 Zigbee - IEEE 802.15.4 specification for a suite of high-level communication
 protocols used to create personal area networks with small, low-power digital
 radios, such as for home automation & medical device data collection

    • Can talk up to a maximum range of 300+ meters with a clear line of sight
    (between 75-100 meters indoors)

    • Creates a self healing mesh, where each interoperable device becomes a sort
    of outpost, able to communicate with the next device... up to 65,000 of them
    per mesh

 Uses 128 bit symmetric encryption; *** there have been claims that there are
 Zigbee vulnerabilities around the way it handles encryption keys

 Works at 2.4GHz allowing for transfer rates around 250kbps; pretty much
 everything works on that spectrum – most notably your Wi-Fi enabled devices –
 & that means interference is a possibility


 Safety Instrumented System (SIS) - composed of sensors, logic solvers, & final
 control elements (devices like horns, flashing lights, and/or sirens) for the
 purpose of returning an industrial process to a safe state after predetermined
 conditions are detected

    • Designed to monitor industrial processes for potentially dangerous
    conditions & reduce the severity of an emergency event by taking action when
    needed to protect personnel, equipment, & the environment
