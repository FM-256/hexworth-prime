Data Center and Server Room Security
=======================================================

*3.8 Apply Security Principles to Site and Facility Design*
--------------------------


Description
--------------------------
In this episode, we will explore the different security controls used to secure 
phyiscal sites and facilities. We begin by addressing site security concerns, and
then work through physical, technical, and administrative controls.


Resources
--------------------------
+ https://www.nist.gov/system/files/documents/el/fire_research/R0301005.pdf
  

Learning Objectives
--------------------------
+ List and describe common site/facility security concerns
+ List and describe common physical security controls associated with sites/facilities
+ List and describe common technical security controls associated with sites/facilities
+ List and describe common administrative security controls associated with sites/facilities


Notes
--------------------------

+ **Site/Facility Security Concerns**
  - Physical Access
    + Tailgating (no 3rd part consent)
    + Piggybacking (3rd party consent)
      - Impersonation/Masquerading
    + Theft
  - Emanation security
    + TEMPEST
  - Damage/Destruction
    + Fire
    + Flood
    + Humidity
    + Temperature
    + Electrical
      - Lighning
      - Surge/Spike
    + Attack from threat actor
    + Accidental by employee

+ **Security Controls**
  - P**hysical Controls**
    + Doors
	  - Solid material
	+ Locks
	  - Mechanical
	  - Electronic
	  - Magnetic
    + Cameras
    + Lights
    + Climate Control
      - HVAC
        + Temp Range
          - 60 - 75 deg Ferenheit
          - 15 - 23 deg Celsius
        + Humidity Range
          - 40% - 60%
            + Too much humidity = moisture and corrosion
            + Too little humidity = static electricity
        + Cooling types
          - Latent Cooling - AC system removes moisture
          - Sensible Cooling - AC system removes heat
    + Fire Suppression
      - Smoke/Heat/Flame Sensors
      - Extinguishers
        + Wet
        + Dry
        + Preaction
        + Deluge
        + Halon
          - No more Halon
            + Water
            + Argon
            + [NAF-S-III](https://www.nist.gov/system/files/documents/el/fire_research/R0301005.pdf)
    + Cable Management and Labeling
      - Tripping, snagging, breaking of cables should be avoided
      - Lables ensure proper placement and aid in maintenence and troubleshooting
    + Power Supplies
      - UPS
      - Protectors/Line Conditioner
        + Spike (quick increase in voltage)
        + Sag (quick decrease in voltage)
        + Surge (prolonged increase in power)
        + Brownout (prolonged decrease in power)
        + Blackout (complete loss of power)
        + Noise (steady interference on power lines)
        + Transients (short duration noise on power lines)
          - Electromagnetic Interference (EMI)
          - Radio-Frequency Interference (RFI)
    + Glass
      - Tempered Glass
        + Like auto glass
        + Entrance doors and adjacent panels
      - Wire-mesh Glass
        + Blunt-object resistant
      - Laminated
        + Street level windows
      - Bullet-Resistant (BR)
        + Banks and High-risk areas
      - Glass Break Sensors
        + Acoustic sensors
        + Shock sensors
        + Dual-Technology
          - Both Acoustic and Shock

  - **Technical Controls**
    + ACLs
	+ Port Security
	+ IDS/IPS
	+ Network Segmentation
	+ Network Device Hardening
	  - Updates are current
	  - Unused ports are disabled

  - **Administrative Controls**
    + Policies that determine...
      - Location
        + Should be located in/near center of building
        + Should be away from water, sewer, gas
        + Should be in room constructed with walls fire rated 1 hour MINIMUM
        + Shouldn't be on ground floor
        + Shouldn't be on top floor
        + Shouldn't be in basement
      - Staff Access 
      - Staff Training and Awareness
	  - Asset Inventory and Mangement
	  - Change Management

