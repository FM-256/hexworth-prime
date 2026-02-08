After completing this episode, you should be able to:

+ 1. Explain the significance of the OSI model and TCP/IP model.
+ 2. Explain the function of each of the individual layers.  

**Description:** In this episode, the learner will examine the OSI model and TCP/IP models. We will explore the layers, functionality, similarities, and differences.
* What is the OSI model?
  + The ISO designed the Open Systems Interconnection model as a framework to standardize network communications. The framework divided the functionality into seven layers, each providing a service.
* What are the layers and functionality?
  + Layer 7 - Application
    - Provides network services directly to end-user applications and facilitates user interaction and data interpretation.
  + Layer 6 - Presentation
    - Translates data between the application layer and the network format and can provide encryption.
  + Layer 5 - Session
    - Controls the establishment, management, and termination of connections between applications.
  + Layer 4 - Transport
    - Delivers error-free, in-sequence data transfer between end systems with flow control.
  + Layer 3 - Network
    - Manages device addressing, identification, and routing of packets between sub-networks.
  + Layer 2 - Data Link
    - Provides node-to-node data transfer and error detection between two directly connected nodes.
  + Layer 1 - Physical
    - Defines the electrical, mechanical, procedural, and functional specifications for activating, maintaining, and deactivating physical connections.
* Where does TCP/IP come into the scene?
  + TCP/IP is a protocol suite designed by the Department of Defensive for communications across the Internet \(or earlier with ARPANET\). The TCP/IP model divides the functions into 4 layers and focuses on routing communications across networks.
* What are the layers and the functionality within TCP/IP?
  + Application Layer - provides network services directly to end-user applications and facilitates user interaction and data interpretation.
  + Transport Layer - delivers error-free, in-sequence data transfer between end systems with flow control and error handling.
  + Internet Layer - manages device addressing, identification, and routing of packets across networks.
  + Network Interface Layer - handles the physical and data link aspects of network access, including hardware addressing and media access processes.
* What are some of the similarities between the OSI and TCP/IP models?
  + Layered architecture - both models use a layered approach to abstract network functions and simplify the networking process.
  + Encapsulation - data is encapsulated with protocol information at each layer in both models, enabling effective communication and data transfer across networks.
* What are some of the differences between the two?
  + Number of layers - OSI has seven distinct layers, while TCP/IP has four layers, combining certain functions that are separated in the OSI model.
  + Model origin - OSI is a theoretical framework designed by ISO as a universal standard. In contrast, TCP/IP was developed as a practical solution, primarily driven by actual networking implementations and needs.
