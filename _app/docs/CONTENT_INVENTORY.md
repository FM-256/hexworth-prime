# Hexworth Prime - Content Inventory

**Generated:** December 23, 2025
**Purpose:** Track existing content vs gaps across all houses

---

## Summary

| House | Files | Listed Modules | Available | Gaps | Orphans |
|-------|-------|----------------|-----------|------|---------|
| Cloud | 30 | 12 | 12 | 0 | Few |
| Code | 28 | 7 | 5 | 2 | Many |
| Eye | 22 | 8 | 3 | 5 | Many |
| Forge | 44 | 10 | 10 | 0 | Many |
| Key | 26 | 6 | 1 | 5 | Many |
| Script | 27 | 15 | 15 | 0 | Few |
| Shield | 200+ | 10 | 10 | 0 | Many |
| Web | 76 | 17 | 17 | 0 | Many |

**Legend:**
- **Gaps** = Modules listed but no content exists
- **Orphans** = Content exists but not linked from landing page

---

## CLOUD HOUSE

### Existing Content (30 files)
```
presentations/
  - cloud-presentation.html
  - aws-fundamentals.html
  - azure-fundamentals.html
  - cloud-concepts.html

applets/fundamentals/
  - cloud-visualizer.html
  - ch01-cloud-models-visualizer.html
  - cloud-provider-comparison.html
  - ch01-cloud-fundamentals-quiz.html

applets/architecture/
  - cloud-architecture-designer.html

applets/aws/
  - aws-service-explorer.html
  - ch02-aws-account-explorer.html
  - ch03-support-plans-visualizer.html
  - ch04-aws-regions-explorer.html
  - ch05-iam-security-quiz.html
  - ch05-security-visualizer.html
  - ch06-aws-tools-explorer.html
  - ch07-compute-services-explorer.html
  - ch07-ec2-instance-visualizer.html
  - ch08-storage-quiz.html
  - ch08-storage-services-explorer.html
  - ch09-database-quiz.html
  - ch09-database-services-explorer.html
  - ch10-networking-quiz.html
  - ch10-vpc-networking-visualizer.html
  - ch11-automation-explorer.html
  - ch12-aws-practitioner-final-quiz.html
  - ch12-use-cases-visualizer.html

labs/
  - cloud-lab-simulator.html

quizzes/
  - aws-fundamentals-quiz.html
```

### Gaps: None

### Status: COMPLETE - All content accessible

---

## CODE HOUSE

### Existing Content (28 files)
```
presentations/
  - git-basics.html
  - agile-sdlc.html
  - automation-presentation.html
  - cicd-fundamentals.html
  - cloudformation-fundamentals.html
  - docker-fundamentals.html
  - kubernetes-fundamentals.html
  - terraform-fundamentals.html

applets/
  - automation-visualizer.html
  - cloudformation-designer.html
  - docker-playground.html
  - kubernetes-cluster-sim.html
  - pipeline-builder.html
  - sprint-simulator.html
  - terraform-visualizer.html
  - config_management/ConfigMgmt.html

labs/
  - cicd-lab.html
  - cloudformation-lab.html
  - docker-lab.html
  - kubernetes-lab.html
  - terraform-lab.html

quizzes/
  - agile-quiz.html
  - cicd-quiz.html
  - cloudformation-quiz.html
  - docker-quiz.html
  - kubernetes-quiz.html
  - terraform-quiz.html
```

### Gaps (2)
- [ ] code-unit-testing: Unit Testing content needed

### Status: MOSTLY COMPLETE

---

## EYE HOUSE

### Existing Content (22 files)
```
presentations/
  - log-basics.html
  - log-correlation.html
  - network-traffic-analysis.html
  - siem-fundamentals.html
  - soc-operations.html
  - threat-hunting.html

labs/
  - correlation-lab.html
  - hunting-lab.html
  - siem-lab.html
  - soc-lab.html
  - traffic-lab.html

tools/
  - correlation-engine.html
  - hunt-workbench.html
  - packet-analyzer.html
  - siem-simulator.html
  - soc-simulator.html
  - wireshark-training.html

quizzes/
  - correlation-quiz.html
  - hunting-quiz.html
  - siem-quiz.html
  - soc-quiz.html
  - traffic-quiz.html
```

### Gaps (5)
- [ ] eye-siem-intro: SIEM Introduction content needed
- [ ] eye-splunk-basics: Splunk Fundamentals content needed
- [ ] eye-threat-hunting: Needs proper module (file exists in presentations)
- [ ] eye-incident-timeline: Incident Timeline content needed
- [ ] eye-log-analysis: Needs href assigned (file exists)

### Status: CONTENT EXISTS BUT LANDING PAGE INCOMPLETE

---

## FORGE HOUSE

### Existing Content (44 files)
```
presentations/
  - windows-editions.html
  - windows-settings.html
  - control-panel.html
  - admin-tools.html
  - system-tools.html
  - macos-linux-basics.html

applets/
  - admin-tools-explorer.html
  - command-translator.html
  - control-panel-explorer.html
  - settings-explorer.html
  - system-tools-sim.html
  - windows-edition-selector.html

applets/hardware/
  - backup-strategy-planner.html
  - hardware-trainer.html
  - raid-level-visualizer.html
  - cpu_architecture/cpu_architecture.html
  - display_types/display_types.html
  - expansion_cards/expansion_cards.html
  - hard_drive_geometry/hard_drive_geometry1.html
  - laptop_hardware/laptop_hardware.html
  - mobile_accessories/mobile_accessories.html
  - motherboards/motherboards.html
  - multimeter/multimeter_jedit_v1.html (BROKEN - missing resources)
  - network_cables/network_cables.html
  - network_ports/network_ports.html
  - peripheral_devices/peripheral_devices.html
  - power_supplies/power_supplies.html
  - printers/printers.html
  - raid_storage/raid_storage.html
  - ram_types/ram_types.html
  - storage_devices/storage_devices.html
  - virtualization/virtualization.html
  - wireless_networking/wireless_networking.html

labs/
  - admin-tools-lab.html
  - control-panel-lab.html
  - lab-macos-linux.html
  - system-tools-lab.html
  - windows-editions-lab.html
  - windows-settings-lab.html

quizzes/
  - aplus-core2-quiz.html
  - windows-admin-quiz.html
```

### Gaps: None

### Known Issues:
- multimeter/multimeter_jedit_v1.html - Missing .hyperesources folder

### Status: COMPLETE - All content accessible

---

## KEY HOUSE

### Existing Content (33 files)
```
presentations/
  - encryption-basics.html
  - advanced-symmetric.html
  - elliptic-curve.html
  - key-derivation.html
  - key-management.html
  - message-authentication.html
  - certificates.html
  - cryptanalysis.html
  - post-quantum.html

labs/
  - aes-lab.html
  - attack-lab.html
  - cert-lab.html
  - ecc-lab.html
  - hmac-lab.html
  - hsm-lab.html
  - kdf-lab.html
  - pqc-lab.html

tools/
  - aes-explorer.html
  - cert-inspector.html
  - cryptanalysis-lab.html
  - ecc-visualizer.html
  - hmac-calculator.html
  - kdf-analyzer.html
  - key-lifecycle.html
  - pqc-explorer.html

quizzes/
  - cert-quiz.html
  - cryptanalysis-quiz.html
  - ecc-quiz.html
  - hsm-quiz.html
  - kdf-quiz.html
  - mac-quiz.html
  - pqc-quiz.html
  - symmetric-quiz.html
```

### Gaps (5 listed as coming-soon, but content exists)
- key-symmetric-vs-asymmetric: Content exists in presentations
- key-hashing-integrity: Needs linking
- key-digital-signatures: Needs linking
- key-pki-deep-dive: Content exists (certificates.html)
- key-tls-ssl: Needs content creation

### Status: CONTENT EXISTS BUT LANDING PAGE INCOMPLETE

---

## SCRIPT HOUSE

### Existing Content (27 files)
```
presentations/
  - scripting-basics.html
  - automation-presentation.html
  - macos-linux-basics.html

applets/linux/
  - bash-scripting-playground.html
  - command-translator.html
  - lab-macos-linux.html
  - linux-command-simulator.html
  - linux-filesystem-navigator.html
  - linux-permissions-calculator.html

applets/powershell/
  - powershell-playground.html
  - windows-cli-tools.html
  - windows-registry-explorer.html
  - windows-troubleshooting.html

applets/python/
  - python-chapter1-applet.html
  - python-chapter2-strings.html
  - python-chapter3-flow-control.html
  - python-chapter4-functions.html
  - python-chapter5-collections.html
  - python-chapter6-dictionaries.html
  - python-chapter7-file-handling.html
  - python-chapter8-oop.html

applets/sysadmin/
  - automation-visualizer.html
  - log-management-visualizer.html
  - package-manager-simulator.html
  - process-management-visualizer.html

quizzes/
  - linux-basics-quiz.html
```

### Gaps: None

### Status: COMPLETE - All content accessible

---

## SHIELD HOUSE

### Existing Content (200+ files)
```
presentations/
  - cia-triad.html
  - security-presentation.html

applets/fundamentals/ (11 files)
applets/access/ (3 files)
applets/crypto/ (20+ files)
applets/network/ (11 files)
applets/risk/ (7 files)
applets/threats/ (23 files)
applets/compliance/ (17 files) - BROKEN: Missing data/player folders
applets/games/ (6 files)

tools/
  - yara-training.html

quizzes/
  - cia-triad-quiz.html
```

### Gaps: None (all listed modules available)

### Known Issues:
- 17 CMMC compliance applets missing data/player/ resources
- career_exploration missing assets
- Some crypto applets missing .hyperesources

### Status: COMPLETE but some applets non-functional

---

## WEB HOUSE

### Existing Content (76 files)
```
presentations/ (26 files)
  - arp, cables, devices, dhcp, dns, eigrp, etherchannel
  - fhrp, ipv6, nat, network-essentials, ntp, osi variants
  - ospf, ports, stp, subnetting, switch-operations
  - tcp, topologies, troubleshooting, vlan, wireless variants

applets/ip-addressing/ (14 files)
applets/visualizers/ (21 files)
applets/services/ (3 files)

simulators/
  - interactive-network-simulator.v2.html
  - packet-tracer-lite-v3.html

tools/
  - burp-training.html
  - gobuster-training.html
  - nikto-training.html
  - sqlmap-training.html

troubleshooting/
  - lab-troubleshooting-guide.html

quizzes/
  - osi-quiz.html
  - subnetting-quiz.html
```

### Gaps: None

### Status: COMPLETE - All content accessible

---

## ACTION ITEMS

### Critical (Navigation Broken)
1. [ ] Implement openModule() navigation in ALL 8 house landing pages
2. [ ] Implement openCategory() filtering in ALL 8 house landing pages

### High Priority (Content Gaps)
3. [ ] Eye House: Link existing content to modules
4. [ ] Key House: Link existing content to modules
5. [ ] Code House: Create unit-testing content

### Medium Priority (Missing Assets)
6. [ ] Shield CMMC applets: Locate/rebuild data/player/ resources
7. [ ] Forge multimeter: Locate/rebuild .hyperesources
8. [ ] Shield crypto applets: Locate/rebuild .hyperesources

### Low Priority (Orphaned Content)
9. [ ] Add missing presentations to module listings
10. [ ] Add quiz files to module listings
11. [ ] Consider adding Shield games to landing page

---

## FILE LOCATION REFERENCE

All content is in: `/home/eq/Ai content creation/Hexworth Prime/_app/houses/`

Structure per house:
```
houses/[HOUSE_NAME]/
  ├── index.html          (Landing page)
  ├── presentations/      (Slide decks)
  ├── applets/           (Interactive tools)
  ├── labs/              (Hands-on exercises)
  ├── quizzes/           (Assessments)
  ├── tools/             (Training tools)
  ├── simulators/        (Network sims - Web only)
  └── troubleshooting/   (Guides - Web only)
```
