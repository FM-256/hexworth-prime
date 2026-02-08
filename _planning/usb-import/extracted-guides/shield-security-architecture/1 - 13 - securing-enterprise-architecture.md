## Securing enterprise architecture


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, implement data security techniques for securing enterprise
architecture.

### External Resources:

Securing enterprise architecture

  What are the 5 stages of the Data Life Cycle? -

  1. Create - make
  2. Store - easy access
  3. Use - do
  4. Archive - hard access
  5. Destroy - BOOM !!!


  Data Classification vs. Data Categorization -

   Classification is a system to ensure information/assets are marked in such
   a way that only those with an appropriate level of clearance can have access
   to them

   Categorization is the process of determining the impact of the loss of
   confidentiality, integrity, or availability of the information/asset to an
   organization


  What are Data Classification schemes – Government/Military? -

  1. Top Secret – unauthorized disclosure of such information can be expected to
  cause exceptionally grievous damage to the national security

  2. Secret – unauthorized disclosure of such data can be expected to cause
 significant damage to the national security

  3. Confidential – unauthorized disclosure of such data can be expected to cause
 serious, noticeable damage to the national security

    *** NOTE: These 3 levels of data are collectively known as ‘Classified’ data

  4. Unclassified – data is neither sensitive nor classified, & hence it is
  available to anyone through procedures identified in the Freedom of
  Information Act (FOIA)


  What are Data Classification schemes – Private Sector? -

  1. Confidential – reserved for extremely sensitive data & internal data; A
  considerable amount of damage may occur for an organization if this confidential
  data is divulged; Proprietary data, among other types of data, falls into this
  category

  2. Private – data for internal use only whose significance is great & its
  disclosure may lead to a significant negative impact on an organization; All
  data & information which is being processed inside an organization is to be
  handled by employees only & should not fall into the hands of outsiders

  3. Sensitive – data which is treated as classified in comparison to public data;
  Negative consequences may ensue if such kind of data is disclosed

  4. Public – disclosure will not cause serious negative consequences to the
  organization


  What is Data Management? -

  Inventory & mapping - the mechanisms used to identify & track the data assets
  created, controlled, or maintained by an organization

  Data integrity management - used to ensure that data is in the proper state,
  that any changes can be identified, & that the reliability & accuracy of data
  can be validated throughout its lifecycle


  What is Data Loss Prevention (DLP)? -

  Automate the discovery & classification of data types & enforce rules so that
  data is not viewed or transferred without proper authorization

  Remediation mechanisms:

    • Alert only - copying is allowed, but the management system records an
    incident and may alert an administrator

    • Block - user is prevented from copying the original file but retains access
    to it; user may or may not be alerted to the policy violation, but it will be
    logged as an incident by the management engine

    • Quarantine - Access to the original file is denied to the user

    • Tombstone - The original file is quarantined & replaced with one describing
    the policy violation and how the user can release it again


  What is Data Loss Detection, DRM & Watermarking? -

  Data Loss Detection – technologies to tell you data has been used in
  inappropriate ways

  Data Rights Management (DRM) – technologies to control how digital content is
  used after it is published

  Digital Watermarking - does not directly control how data is used; is a way to
  clearly identify classification or use/licensing terms


  What are data obfuscation & masking techniques? -

  Data Obfuscation & Masking - mechanisms used to hide data; often used to protect
  stored data; storing passwords in an obfuscated form instead of plaintext such
  as the /etc/shadow file in Linux or the use of base64 encoding

  Tokenization - use of a token to represent sensitive data records; The token
  cannot be directly converted into the sensitive data, as would be the case with
  encryption, as tokens are irreversible

  Data scrubbing - data integrity control mechanism designed to locate invalid,
  obsolete, redundant or outdated information from a database or data warehouse;
  can be used to locate sensitive data & modify it in a way that protects against
  unauthorized disclosure or use

  Data anonymization - information that could be used to uniquely identify an
  individual is removed from data so that the data can be shared with internal
  groups or third parties in a way that does not violate privacy laws
  
