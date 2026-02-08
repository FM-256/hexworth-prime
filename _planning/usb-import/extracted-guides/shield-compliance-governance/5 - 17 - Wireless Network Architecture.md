# 1-10-1: Wireless Network Architecture

After completing this episode, you should be able to:

+  1. Identify and explain the significance of wireless technologies in network communications.

**Description:** In this episode, the learner will examine a various wireless technologies such as Wi-Fi and IEEE802.11, WLAN Bluetooth and ZigBee. We will explore wireless local area network or WLAN architectures, frequencies, channels and more.


+ What are some of the key characteristics of wireless local area network \(WLAN\) communications?
  + Identifying the standards by 802.11 designation
  + Comparing and contrasting
    + Frequency attributes
    + Performance \(including multiplexing techniques, an antenna technologies\)
    + Compatibility
+ What is MIMO \(Multiple Input Multiple Output\)? and MU-MIMO \(Multi-User MIMO\)?
  + MIMO
    + A technology using multiple antennas at both the transmitter and receiver
    + Enhances communication performance, data rates, and network capacity by using multiple signal paths
  + MU-MIMO
    + An advancement of MIMO technology
    + Allows multiple users to simultaneously access the same network
    + Each user has their own dedicated set of multiple antennas
    + Improving network efficiency and throughput.
+ What channels are there for the 2.4GHz and 5 GHz frequencies?
  + 2.4 GHz
    + 11 channels in North America
    +  3 non-overlapping channels \(1, 3, 11\)
  + 5 GHz
    + All channels are non-overlapping
    + Bands are labeled UNII
    + Some channels support dynamic frequency selection \(DFS) 
      + Allows wireless communication in the same channels as radar operates
+ What are different wireless network modes?
  + Infrastructure mode
    + A wireless local-area network \(WLAN\) implementation where communication occurs through an AP
    + Commonly used in today's Wi-Fi networks
    + Provides centralized administration and security
  + Ad-hoc networks 
    + A wireless local-area network \(WLAN\) implementation  where devices communicate directly with each other without a central AP
    + Simple implementation, convenient
    + Lacks centralized management and security
+ What are some of the key characteristics for Bluetooth standards?
  + Operates in the 2.4 GHz ISM band
  + Various standards
    + Earlier versions are less secure, with greater power demands
    + Later versions focus on higher data rates, lower power requirements, IoT devices and improved security
+ Describe the ZigBee standard
  + A low-power, wireless mesh network standard
  + Used for home automation, medical device data collection, and other low-power low-bandwidth needs.
  + Operates on 2.4 GHz worldwide and 915 MHz in the US
  + Ranges from 10 to 100 meters indoors and can extend further outdoors with clear line-of-sight.
+ Describe the Li-Fi standard
  + Line-of-sight
  + Allows for the wireless tranmission of data via the electromagnetic spectrum, operating in the 800 - 1000 nm wave (by comparision 2.4GHz = 120nm/5 GHZ = 60nm
  + Speeds range from 10 Mbps to 9.6 Gbps \(comparable to 802.11ax)   
---
+ IEEE 802.11 standards 
  + The IEEE working group for wireless local area networks \(WLAN\)
  + 802.11a
    + Speed - Up to 54 Mbps
    + Frequency - 5 GHz
    + Range - Shorter range due to higher frequency
    + Interference - Less interference 
  + 802.11b
    + Speed - Up to 11 Mbps
    + Frequency - 2.4 GHz
    + Range - Good range due to lower frequency
    + Interference - More interference \(many devices use 2.4 GHz\)
  + 802.11g
    + Speed - Up to 54 Mbps
    + Frequency - 2.4 GHz
    + Range - Good range, similar to 802.11b
    + Interference - More interference \(2.4 GHz is commonly used\)
  + 802.11n
    + Speed - Up to 600 Mbps
    + Frequency - 2.4 GHz and 5 GHz
    + Range - Better than 802.11a/g, option for 2.4 GHz improves range
    + Interference - The 2.4 GHz band has more interference, less on the 5 GHz
    + Wi-Fi Alliance - Wi-Fi 4
    + MIMO - Supported \(up to 4x4\)
  + 802.11ac
    + Speed - Up to 6.9 Gbps
    + Frequency - 5 GHz
    + Range - Shorter than 2.4 GHz networks, better with beamforming
    + Interference - Less crowded, minimal interference
    + Wi-Fi - Wi-Fi 5
    + MIMO - Supported \(up to 8x8\)
    + MU-MIMO - Supported
  + 802.11ax
    + Speed - Up to 9.6 Gbps
    + Frequency - 2.4 GHz and 5 GHz
    + Range - Improved over Wi-Fi 5, especially in the 2.4 GHz band
    + Interference - technologies like OFDMA reduce interference
    + Wi-Fi Alliance - Wi-Fi 6
    + MIMO - Supported \(up to 8x8\)
    + MU-MIMO - Supported
  + 802.11be
    + Speed - Expected to exceed 30 Gbps
    + Frequency - 2.4 GHz, 5 GHz, and 6 GHz
    + Range - Anticipated to offer enhanced range with new technologies
    + Interference - Expected to be managed with advanced techniques
    + Wi-Fi Alliance Name - Wi-Fi 7 \(anticipated\)
    + MIMO - Supported \(expected to support higher than 8x8\)
    + MU-MIMO - Supported
+ Bluetooth standards
  + Bluetooth 1.x
    - Basic rate of 1 Mbps.
    - Limited range \(10 meters\) and data rate
  + Bluetooth 2.x
    - Range around 30 meters
    - Introduction of Enhanced Data Rate \(EDR\) for faster data transfer up to 3 Mbps.
    - Better resistance to interference.
    - 2.1 version introduced Secure Simple Pairing \(SSP\) for improved pairing experience.
  + Bluetooth 3.x + HS \(High Speed\)
    - Range: around 30 meters
    - Introduction of high-speed data transfer, utilizing Wi-Fi for data rates up to 24 Mbps.
    - Continued improvements in power consumption and security.
  + Bluetooth 4.x \(Bluetooth Low Energy or BLE\)
    - Range: 60 meters
    - Up to 24 Mbps
    - Focus on significantly lower power 
    consumption.
    - BLE technology allowed for long-term operation with battery-powered devices like fitness trackers.
    - 4.2 improved privacy and increased data capacity.
  + Bluetooth 5.x
    - Increased range speed \(up to 2 Mbps for LE, 50 Mbps for EDR\), and broadcasting message capacity.
    - Enhanced focus on IoT \(Internet of Things\) with improvements in connectivity and range.
    - Multiple simultaneous connections
  + Bluetooth 5.2
    - Improved efficiency and support for LE Audio, including features like Audio Sharing and Broadcast Audio.
    - Enhanced reliability and performance for audio transmissions.
  + Bluetooth 5.3
    - Perioc Advertising Enhancement
    - Encryption Key Size Control
  + Bluetooth 5.4
    - Periodic Advertising with Responses (PAwR) 
    - Encrypted Advertising Data