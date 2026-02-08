## Triage & Incident Response


### Objectives:

At the end of this episode, I will be able to:

Given an incident, implement the appropriate response.

### External Resources:

Triage & Incident Response

 What do you need to know about Event Classifications? -

 Triage event / triaging - dependent upon the skills & knowledge of the
 individuals performing the work; focused on determining a timeline of what,
 where, how, & when events occurred


 Event Classifications:

 • False Positive - identified as an issue, when in fact it is not
 • False Negative - not identified as an issue, when in fact it is
 • True Positive - identified as an issue, when in fact it is
 • True Negative - not identified as an issue, when in fact it is not


 What do you need to know about Communication Plans & Stakeholder Management? -

 Communication Plan - secure method of communication between members of the CSIRT
 is essential for managing incidents successfully; team may require "out-of-band"
 or "off-band" channels that cannot be intercepted with end-to-end encryption;
 should have a single  point-of-contact to handle requests & questions from
 stakeholders outside the  incident response team (internal & external)

 Stakeholder Management –  have to have it !!!


 What do you need to know about the Incident Response Process? -

 Incident - where/when security is breached or there is an attempted breach; NIST
 describes an incident as "the act of violating an explicit or implied security
 policy."

 Incident Response Plan (IRP) - actions & guidelines for dealing with incidents


 NIST SP800-61R2, Computer Security Incident Handling Guide, identifies the
 following stages in an incident response life cycle:

 1. Preparation - make the system resilient to attack; hardening systems, writing
 policies & procedures, setting up confidential lines of communication & the
 creation of incident response resources & procedures

 2. Detection & Analysis - determine whether an incident has taken place & assess
 how severe it might be (triage), followed by notification of the incident to
 stakeholders

 3. Containment - limit scope & magnitude of the incident

 4. Eradication & Recovery – remove the cause & bring system back to a secure
 state; response process may have to iterate through multiple phases of detection,
 containment, & eradication to effect a complete resolution

 5. Post-Incident Activity - identify whether procedures or systems could be
 improved; outputs from this phase feed back into a new preparation phase in the
 cycle


 What do you need to know about Incident Response Procedures? -

 Automated response (runbooks) vs. Manual response (playbooks)

 Incident response playbooks - describe the specific actions to take in response
 to emergency scenarios of different types; should provide prescriptive instructions
 on the actions to perform during a specific scenario; help ensure that responses
 are consistent & ensure responses are compliant & appropriate according to
 leadership's requirements

 Ransomware - responses include disconnecting & isolating networks as quickly as
 possible; disconnect systems in order to maintain forensic integrity as well as
 potentially being able to extract cryptographic keys from system memory which
 can be used for remediation

 Data Exfiltration - responses include notification requirements & system &
 network forensic analysis to determine exactly what was accessed; deleting
 copies of data on an adversary's system is considered to be a hack-back action

 Social Engineering - at a bare minimum, impacted individuals should have their
 passwords reset & possibly also have their desktop systems replaced
