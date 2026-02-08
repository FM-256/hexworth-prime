## Port Security and VLAN Hopping Attacks

### Objectives:

At the end of this episode, I will be able to:

1. Describe the function of port security
2. Examine a port security configuration
3. Describe the VLAN Hopping attack and the mitigation options


>Additional resources used during the episode can be obtained using the download link on the overview episode.

-----------------------------------------------------------
Port security can be easily tricked with MAC spoofing, but many of us consider it a solid initial defense strategy.

VLAN Hopping attacks take advantage of 802.1Q in 802.1Q tunneling and the native VLAN feature. In order to guard against these attacks, do not use the native VLAN! You can either set the Native VLAN to an unused VLAN in your enterprise, or you can instruct your Cisco device to tag the Native VLAN in your Enterprise.


-----------------------------------------------------------
### External Resources:

During this episode, you can reference the following external resources for supplementary tools and information:

Here is the port security configuration guide:

https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst4500/12-2/25ew/configuration/guide/conf/port_sec.html

Here is a very dated, but still very good presentation on attack mitigations and this includes a discussion of the VLAN Hopping attack:

https://www.cisco.com/c/dam/global/da_dk/assets/docs/security2006/Security2006_Eric_Vyncke_2.pdf
