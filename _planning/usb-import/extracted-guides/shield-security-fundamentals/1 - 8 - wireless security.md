## Wireless Security
At the end of this episode, I will be able to:    

1. Compare and contrast wireless security technologies.    

Learner Objective: *Compare and contrast wireless security technologies.*    

Description: In this episode, the learner will be introduced to a variety of wireless security technologies such as WEP, WPA, WPA2, WPA3, MAC filtering and more.

--------

* Wireless Security 
	+ Wireless networks
		- Use unbounded communication media
		- Requires security protocols to secure the communications
		- Requires unique configuration or changing the default configuration. 
		- Without security, unauthorized access is possible.
	+ Default configurations
		- Usernames
		- Passwords
		- Service Set Identifier \(SSID\)
		- Firmware updates \(initial version\)
		- HTTPS for local management
		- Disable remote management
	+ Wireless Authentication - Due to the nature of unbounded tranmissions, it is important, when ensuring confidentiality, to secure the wireless communications and prevent unauthorized access. The options today are WEP, WPA/WPA2/WPA3 \(WPA3 is the newest and strongest, WPA2 is still widely implemented and considered secure.\)
		- WEP  
			* Weak or vulnerable to attack\(Avoid\)  
			* Uses a static key  
			* 64-bit or 128-bit key   
			* RC4 stream cipher		
			* CRC checksum		
		- WPA
			* Weak or vulnerable to attack\(Avoid\)		
			* Uses Temporal Key Integrity Protocol		
			* Per-packet encryption		
			* RC4 stream cipher		
			* Message Integrity Check		
		- WPA2		
			* Stronger \(Implement\)		
			* Uses CCMP		
				+ Counter Mode Cipher Block Chaining Message Authentication Code Protocol		
				+ Advanced Encryption Standard		
				+ 128-bit key		
		- WPA3		
				+ Strongest		
				+ Uses SAE		
				+ 128-bit or 192-bit encryption		
		- WPS		
			* Push-button security		
			* Simplifies implementing security		
			* Weak or vulnerable to attack \(Avoid\)		
			* Disable
	+ Wireless Authentication Modes - 
		- Personal Mode		
			* WPA/WPA2/WPA3 implementation		
			* Requires no additional infrastructure		
			* Uses a preshared key or PSK \(think password\)		
		- Enterprise Mode	
			* WPA/WPA2/WPA3 implementation	
			* Requires additional infrastructure	
			* Utilizes 802.1X port-based authencation	
			* Requires a Remote Access Dial-in Server \(RADIUS\)	
	+ MAC Filtering	\(Called Access Control in the TP-Link Demo\)
		- A security technique that identifies which wireless clients are allowed or denied access to the wireless network based on the client's media access control address.		
