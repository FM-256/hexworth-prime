## Software-defined networking (SDN)


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze the security requirements and objectives to ensure an
appropriate, secure network architecture for a new or existing network.

### External Resources:

Software-defined networking (SDN)

 What is Software-Defined Networking (SDN)? -

 Separates traditional network traffic (wired or wireless) into 3 components:
 raw data, how the data is sent, & what purpose the data serves; focus on data,
 control, & application (management) functions or “planes” which map to the
 infrastructure, control &application layers:

  • Application layer (Application/Management plane) - Network services,
  utilities & applications which interface with the control level to specify
  needs & requirements

  • Control layer (Control plane) - determining how traffic should flow based on
  the status of the infrastructure layer & the requirements specified by the
  application layer

  • Infrastructure layer (Data plane) - Network switches & routers & the data
  itself as well as the process of forwarding data to the appropriate destination


  What are the components of Software-Defined Networking (SDN)? -

  • SDN Application (SDN App) - programs that communicate their network
  requirements & desired network behavior to the SDN Controller via a northbound
  interface (NBI)

  • SDN Controller - in charge of translating the requirements from the SDN
  Application layer down to the SDN Datapath’s

  • SDN Datapath - a logical network device

  • SDN Northbound Interfaces (NBI) - interfaces between SDN Applications & SDN
  Controllers

  • SDN Control to Data-Plane Interface (CDPI) Southbound - interface defined
  between an SDN Controller & an SDN Datapath


  What are the different approaches to Software-Defined Networking (SDN)? -

  • Open SDN – using open standards & open source software to reduce the risks of
  vendor lock-in

  • Hybrid SDN - traditional & software defined networks operating within the
  same environment

  • SDN Overlay - Allows the use of software to create & manage new virtual
  networks which leverage existing hardware

          • Moves data across existing physical network hardware, but the network
          hardware is no longer managed or configured directly, it simply moves
          the data controlled by the SDN
