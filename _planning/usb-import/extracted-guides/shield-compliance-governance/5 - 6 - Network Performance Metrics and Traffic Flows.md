# 1-6-1: Network Performance Metrics and Traffic Flows

After completing this episode, you should be able to:

+ 1. Identify and explain network performance metrics, given a scenario.
+ 2. Compare and contrast the differences of north-south and east-west traffic flows, given a scenario

**Description:** In this episode, the learner will examine various network performance metrics that can be used to determine the condition of network communications. We will explore traffic flows such as north-south and east-west traffic, including the security implications.

+ Why are network performance metrics important to communications?
  + Influence quality and reliability of network services, affecting user experience and application functionality.
  + Affect the confidentiality, integrity, and availability:
    + Compromising data integrity with inconsistent transmission.
    + Delaying information availability due to high latency or low throughput.
  + Latency
    + The time delay from the moment information is sent to when it's received.
    + Effect on performance
      + Can significantly impact time-sensitive applications.
    + Solutions
      + Optimize routing, reduce network hops
      + CDNs for better distribution
      + Implement Quality of Service \(QoS\) rules and traffic prioritization.
  + Bandwidth
    + The maximum transfer rate of a network link.
    + Effect
      + Insufficient bandwidth results in slow data transfers and poor network performance.
    + Solution
      + Upgrade network infrastructure for higher bandwidth capabilities
  + Throughput
    + The rate at which data  actually is transferred through the network.
    + Effect on performance
      + Often lower than bandwidth due to factors like latency and packet loss, affecting performance.
    + Solution example
      + Upgrade network components for higher throughput
  + Jitter
    + The variation in the delivery time between packets arriving is caused by network congestion, timing drift, or route changes.
    + Effect on performance
      + Problematic for real-time communications, leading to poor audio and video quality.
    + Solution
      + Use jitter buffers and traffic prioritization to minimize impacts.
  + Signal-to-Noise Ratio \(SNR\)
    + Determines the clarity or quality and reliability of communication signals within a network.
    + Effect
      + High noise levels can lead to errors and reduced data transmission speeds
    + Solution 
      + Use shielded cabling
      + Use higher-quality hardware
      + Remove sources of electromagnetic interference to improve SNR.