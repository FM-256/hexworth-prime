## Secure cloud & virtualization


### Objectives:

At the end of this episode, I will be able to:

Given a set of requirements, implement secure cloud and virtualization solutions.

### External Resources:

Secure cloud & virtualization

 What do you need to know about Virtualization, Containers & Emulation? -

 • Virtualization
 • Application Virtualization & Containers
 • Virtual Desktop Infrastructure (VDI) - Know what we have already discussed in
 the course… What it is, what it does & how it does it

 • Emulation - allows hardware to run operating systems designed for completely
 different architectures


 What are Cloud Deployment Models? -

 • Public (multi-tenant)
 • Multi-Cloud
 • Hosted Private
 • Private
 • Hybrid
 • Community


 What are Cloud Service Models? -

 Defines the Shared Responsibility between customer & provider

 • Infrastructure as a Service (IaaS)

 • Platform as a Service (PaaS)

 • Software as a Service (SaaS)

 NIST SP800-145:
 https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf


 What is the Cloud Shared Responsibility Model? -

            Cloud Shared Responsibility Model.jpg


 What to know about Cloud Storage? -

 Object storage – cloud-based applications needing access to document,
 video, & image files

 File-based storage – traditional hierarchical file system to store files by a
 path

 Block storage – high-performance, transactional applications such as databases

 Blob storage – large amounts of unstructured data; used to store
 archives & backup sets


 What to know about Databases? -

 Relational – support ACID transactions

 Key-value – optimized to store & retrieve large volumes of data

 In-memory – real-time access to data

 Document – store data in a semi-structured manner

 Wide-column – a type of NoSQL database


 Atomicity - guarantees that all of the commands that make up a transaction are
 treated as a single unit and either succeed or fail together

 Consistency - guarantees that changes made within a transaction are consistent
 with database constraints

 Isolation - guarantees that concurrent transactions do not affect each other’s
 outcomes

 Durability - guarantees that, once the database has told the client it has
 written the data, the data has in fact been written to a backing store; The data
 will persist even in the case of a system failure


 Graph – support applications that query millions of relationships between
  highly connected datasets (social media)

 Time series – applications that analyze data that evolves & changes over
  time & is best represented using time intervals such as in an industrial setting

 Ledger – enable a trusted & verifiable authority to support banking
  transactions & systems of record


 What are Cloud Provider limitations to be aware of? -

 Limited pool of IP addresses to support all customers – DNS updates & dynamic
 IP address assignment

 Overlapping CIDR Blocks - Two VPCs cannot be connected if they each use the
 same IPv4 CIDR blocks, or if the blocks overlap

 Transitive Peering - If three VPCs are connected as A-B-C, traffic cannot be
 directly routed from A to C or from C to A

 *** Connectivity between A & C requires the configuration of a new VPC
 peering connection


 What are Cloud misconfiguration issues to be aware of? -

 Provisioning & Deprovisioning –

  • base image or template which as been pre-configured & hardened
  • Scripts and/or automation to customize
  • Deprovisioning should use automation to remove instances & ensure associated
  files, storage, or platform changes are also reverted

 Middleware, Metadata, & Tags – The more we expose, the more we bleed
