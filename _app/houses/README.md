# Hexworth Prime - House System

**Architecture Version:** 1.0
**Created:** December 17, 2025
**Status:** Structure Only (No Content Migration Yet)

---

## Overview

The House System organizes educational content into thematic learning tracks. Each house represents a domain of IT/Cybersecurity knowledge with its own personality, color scheme, and content focus.

---

## House Directory Structure

```
houses/
├── README.md           (this file)
├── web/                House of the Web (Networking)
├── shield/             House of the Shield (Security)
├── cloud/              House of the Cloud (AWS/Cloud)
├── forge/              House of the Forge (Hardware)
├── script/             House of the Script (Software)
├── code/               House of the Code (DevOps)
├── key/                House of the Key (Cryptography)
├── eye/                House of the Eye (Monitoring)
└── dark-arts/          The Dark Arts (Malware Analysis)
```

---

## Standard House Structure

Each house follows this internal structure:

```
{house}/
├── README.md           House-specific documentation
├── presentations/      Slide presentations
├── tools/              Interactive visualizers and tools
├── labs/               Hands-on lab exercises
├── quizzes/            Assessment materials
└── assets/             House-specific images, icons, etc.
```

---

## House Definitions

### House of the Web
- **Domain:** Networking fundamentals and protocols
- **Color:** #3B82F6 (Blue)
- **Firefly Behavior:** Clustering, network formation
- **Content Focus:** OSI model, TCP/IP, routing, switching, VLANs

### House of the Shield
- **Domain:** Security principles and defense
- **Color:** #EF4444 (Red)
- **Firefly Behavior:** Aggressive, territorial
- **Content Focus:** Firewalls, IDS/IPS, access control, incident response

### House of the Cloud
- **Domain:** Cloud computing (AWS focus)
- **Color:** #F59E0B (Orange)
- **Firefly Behavior:** Floating higher, lighter
- **Content Focus:** AWS services, cloud architecture, deployment

### House of the Forge
- **Domain:** Hardware and infrastructure
- **Color:** #8B5CF6 (Purple)
- **Firefly Behavior:** Slow, steady, durable
- **Content Focus:** Servers, storage, networking hardware, data centers

### House of the Script
- **Domain:** Software and scripting
- **Color:** #10B981 (Green)
- **Firefly Behavior:** Fast, erratic, numerous
- **Content Focus:** Python, Bash, PowerShell, automation

### House of the Code
- **Domain:** DevOps and programming
- **Color:** #6366F1 (Indigo)
- **Firefly Behavior:** Collaborative, synchronized
- **Content Focus:** Git, CI/CD, containers, infrastructure as code

### House of the Key
- **Domain:** Cryptography
- **Color:** #F97316 (Deep Orange)
- **Firefly Behavior:** Secretive, paired
- **Content Focus:** Encryption, PKI, hashing, digital signatures

### House of the Eye
- **Domain:** Monitoring and SIEM
- **Color:** #06B6D4 (Cyan)
- **Firefly Behavior:** Watchful, scanning
- **Content Focus:** Logging, SIEM, threat detection, alerting

### The Dark Arts
- **Domain:** Malware analysis and offensive security
- **Color:** #1F2937 (Dark Gray)
- **Firefly Behavior:** Predatory, glitch effects
- **Content Focus:** Malware analysis, reverse engineering, CTF
- **Access:** Gated by Five Gates CTF

---

## Content Migration Notes

Content will be migrated from Hexworth Academy in phases:
1. **Phase M-1:** House of the Web (networking core)
2. **Phase M-2:** House of the Cloud (AWS content)
3. **Phase M-3:** House of the Shield (security)
4. **Phase M-4:** Remaining houses

**Migration Rules:**
- Clean up content during migration (don't just copy)
- Enhance with new features available in Prime
- Maintain consistent structure across houses
- Update internal links and references

---

## Integration with Digital Life

Each house can have custom firefly behaviors:
- Configure in `src/digital-life/behaviors/HousePersonality.js`
- House colors available via CSS variables
- Digital Life adapts to current house context

---

## Future Features

- **House Selection Screen:** Visual selector for learning paths
- **Progress Tracking:** Per-house completion status
- **House Achievements:** Earn badges within each house
- **Cross-House Challenges:** Content spanning multiple domains
- **House Rankings:** Gamification elements

---

*"Choose your path. Master your domain."*
