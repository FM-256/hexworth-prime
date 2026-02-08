# EC-Council Cloud Security Essentials (CSE) v1 Course Documentation

**Source:** EC-Council Cloud Security Essentials v1 Official Curriculum
**Platform:** Hexworth Prime - Cloud House
**Last Updated:** December 31, 2025
**Status:** Complete (All 8 Modules)

---

## Course Overview

The Cloud Security Essentials (CSE) course provides comprehensive training in cloud security fundamentals, from basic concepts through advanced compliance and governance. Each module follows a consistent three-part structure:

1. **Presentation** - Informational/theoretical content (9-11 slides)
2. **Hands-On Lab** - Terminal-based CLI simulations (5 labs, 15+ commands)
3. **Quiz** - Assessment with cumulative review questions (20 questions)

### Progressive Difficulty Model

- Modules 01-03: Beginner to Intermediate foundations
- Modules 04-06: Intermediate to Advanced technical skills
- Modules 07-08: Advanced analysis and capstone integration

### Cumulative Learning Design

Each module's quiz includes 3 review questions from previous modules:
- M04 Quiz: Reviews M01-03
- M05 Quiz: Reviews M02-04
- M06 Quiz: Reviews M03-05
- M07 Quiz: Reviews M04-06
- M08 Quiz: Reviews M05-07

---

## Module Directory

### Module 01: Cloud Fundamentals
**Location:** `_app/houses/cloud/modules/cse/cse-module01-*`
**Color Theme:** Blue (#3498db)
**Difficulty:** Beginner
**Duration:** 75 minutes

**Topics Covered:**
- Cloud computing definition (NIST SP 800-145)
- Essential characteristics (on-demand, pooling, elasticity, measured service)
- Service models: IaaS, PaaS, SaaS
- Deployment models: Public, Private, Hybrid, Community
- Shared Responsibility Model
- Cloud Security Alliance (CSA) overview

**Learning Objectives:**
- Define cloud computing per NIST standards
- Differentiate IaaS, PaaS, and SaaS responsibilities
- Apply the Shared Responsibility Model
- Identify cloud deployment model use cases

---

### Module 02: Identity & Access Management (IAM)
**Location:** `_app/houses/cloud/modules/cse/cse-module02-*`
**Color Theme:** Blue (#3498db)
**Difficulty:** Beginner-Intermediate
**Duration:** 90 minutes

**Topics Covered:**
- Identity lifecycle management
- Authentication vs Authorization
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Multi-Factor Authentication (MFA)
- Single Sign-On (SSO) and Federation
- Privileged Access Management (PAM)
- AWS IAM, Azure AD, GCP IAM specifics

**Learning Objectives:**
- Implement least privilege access
- Configure RBAC and ABAC policies
- Deploy MFA across cloud environments
- Manage identity federation with SAML/OIDC

---

### Module 03: Data Protection & Encryption
**Location:** `_app/houses/cloud/modules/cse/cse-module03-*`
**Color Theme:** Blue (#3498db)
**Difficulty:** Intermediate
**Duration:** 100 minutes

**Topics Covered:**
- Data classification (Public, Internal, Confidential, Restricted)
- Encryption at rest (AES-256, server-side, client-side)
- Encryption in transit (TLS 1.2/1.3)
- Key Management Services (AWS KMS, Azure Key Vault, GCP KMS)
- Hardware Security Modules (HSM)
- Data Loss Prevention (DLP)
- Tokenization and masking
- Backup and recovery encryption

**Learning Objectives:**
- Classify data according to sensitivity levels
- Implement encryption at rest and in transit
- Configure key management services
- Deploy DLP policies for sensitive data

---

### Module 04: Network Security in Cloud
**Location:** `_app/houses/cloud/modules/cse/cse-module04-*`
**Color Theme:** Cyan/Teal (#00bcd4)
**Difficulty:** Intermediate-Advanced
**Duration:** 110 minutes

**Topics Covered:**
- Virtual Private Clouds (VPCs)
- Network segmentation and micro-segmentation
- Network ACLs (stateless) vs Security Groups (stateful)
- VPC Endpoints and PrivateLink
- Bastion hosts and jump servers
- Just-In-Time (JIT) VM access
- Web Application Firewalls (WAF)
- Next-Generation Firewalls (NGFW)
- IDS vs IPS capabilities
- Remote access security

**Learning Objectives:**
- Design multi-tier VPC architectures
- Differentiate NACLs and Security Groups
- Implement secure remote access patterns
- Deploy WAF for Layer 7 protection

**Lab Commands:**
```
vpc components
acl compare nacl sg
security-group analyze --sample
remote-access options
waf configure --demo
ids-ips compare
scenario --breach-response
```

---

### Module 05: Application Security in Cloud
**Location:** `_app/houses/cloud/modules/cse/cse-module05-*`
**Color Theme:** Pink/Magenta (#e91e63)
**Difficulty:** Advanced
**Duration:** 110 minutes

**Topics Covered:**
- Secure Software Development Lifecycle (SDLC)
- NIST SP 800-64 secure development
- The 3 Rs: Reliability, Resiliency, Recovery
- OWASP Top 10 (2021)
- Security by Design principles
- SAST (Static Application Security Testing)
- DAST (Dynamic Application Security Testing)
- IAST and RASP
- API Security (OWASP API Top 10)
- Serverless security (Lambda, Azure Functions)
- Container security (Docker, Kubernetes)
- Supply chain security

**Learning Objectives:**
- Apply Secure SDLC phases
- Identify OWASP Top 10 vulnerabilities
- Compare SAST, DAST, and RASP methodologies
- Secure serverless and containerized applications

**Lab Commands:**
```
sdlc phases --list
owasp top10 --list
owasp analyze --vuln [name]
sast scan --sample webapp
dast scan --target demo-app
container-security scan --image
scenario --supply-chain-attack
```

---

### Module 06: Security Monitoring & Incident Response
**Location:** `_app/houses/cloud/modules/cse/cse-module06-*`
**Color Theme:** Orange (#ff9800)
**Difficulty:** Advanced
**Duration:** 120 minutes

**Topics Covered:**
- Cloud-native logging (CloudTrail, CloudWatch, Azure Monitor)
- Log aggregation and centralization
- SIEM architecture and deployment
- SOAR playbooks and automation
- Cloud Security Posture Management (CSPM)
- Cloud Workload Protection Platform (CWPP)
- Cloud-Native Application Protection Platform (CNAPP)
- NIST Incident Response lifecycle
- Cloud forensics and evidence preservation
- Post-incident review and documentation

**Learning Objectives:**
- Configure cloud logging services
- Implement SIEM/SOAR solutions
- Differentiate CSPM, CWPP, and CNAPP
- Execute NIST IR lifecycle phases

**Lab Commands:**
```
cloudtrail events --sample
log-aggregator configure --demo
siem query --sample-alerts
soar playbook --ransomware
cspm scan --environment
cnapp analyze --workloads
ir-lifecycle --phase [name]
scenario --active-breach
```

---

### Module 07: Risk Assessment & Management
**Location:** `_app/houses/cloud/modules/cse/cse-module07-*`
**Color Theme:** Purple/Violet (#8a2be2)
**Difficulty:** Advanced
**Duration:** 120 minutes

**Topics Covered:**
- Cloud security risks (attack surface, human error, misconfiguration)
- Risk categories (Low, Moderate, High)
- NIST Risk Management Framework (SP 800-37)
- Risk Management Tiers (Organization, Mission, Information Systems)
- Defense in Depth principle
- Security controls and countermeasures
- Business Continuity Plans (BCP)
- Disaster Recovery Plans (DRP)
- RTO and RPO objectives
- Threat modeling (STRIDE, DREAD)
- Vulnerability assessment and scanning
- Quantitative risk analysis (ALE = SLE × ARO)
- Qualitative risk analysis
- Risk response strategies (Mitigate, Avoid, Accept, Transfer)
- Residual risk management

**Learning Objectives:**
- Calculate ALE, SLE, and ARO
- Apply NIST RMF 7-step lifecycle
- Develop BCP and DRP plans
- Perform STRIDE/DREAD threat modeling
- Implement risk response strategies

**Lab Commands:**
```
risk-analyzer inventory --cloud
risk-analyzer assess --surface
risk-analyzer categorize --risk-level
risk-calc sle --asset --impact
risk-calc aro --threat-history
risk-calc ale --comprehensive
vuln-scan execute --target cloud-infra
vuln-scan analyze --cvss-priority
vuln-scan remediate --generate-plan
bcdr-planner bia --analyze
bcdr-planner rto-rpo --calculate
bcdr-planner test --tabletop ransomware
scenario --acquisition-risk-assessment
threat-model --dread-stride
risk-response --decision-matrix
```

**Key Formulas:**
- **SLE** = Asset Value (AV) × Exposure Factor (EF)
- **ALE** = SLE × ARO (Annualized Rate of Occurrence)

---

### Module 08: Cloud Compliance & Governance (Capstone)
**Location:** `_app/houses/cloud/modules/cse/cse-module08-*`
**Color Theme:** Green (#228b22)
**Difficulty:** Advanced
**Duration:** 130 minutes

**Topics Covered:**

**Regulatory Compliance:**
- GDPR (General Data Protection Regulation)
- FISMA (Federal Information Security Management Act)
- FERPA (Family Educational Rights and Privacy Act)
- HIPAA (Health Insurance Portability and Accountability Act)
- HIPAA Security Rule safeguards
- HITRUST Common Security Framework
- PCI-DSS (Payment Card Industry Data Security Standard)
- SOX (Sarbanes-Oxley Act)
- GLBA (Gramm-Leach-Bliley Act)

**Security Standards:**
- NIST Cybersecurity Framework (5 functions)
- NIST SP 800-53 (security controls catalog)
- NIST SP 800-144, 800-145, 800-146, 800-210
- ISO 27001 (ISMS - 114 controls, 14 domains)
- ISO 27017, 27018, 27040 (cloud-specific)
- CSA STAR Registry
- CSA Cloud Controls Matrix (17 domains, 197 controls)
- CIS Benchmarks
- FedRAMP (Ready, Authorized, Tailored)

**Governance & Auditing:**
- Cloud security governance pillars
- Azure Policy and Microsoft Defender for Cloud
- AWS Config and Amazon Inspector
- GCP Cloud Compliance Reports Manager
- Cloud-native auditing methodology
- Security assessment lifecycle
- Ethical penetration testing
- Cloud penetration testing scope and limitations

**Learning Objectives:**
- Navigate regulatory requirements
- Apply security standards and frameworks
- Implement cloud security governance
- Configure cloud-native auditing tools
- Perform security assessments and pentests

**Lab Commands:**
```
compliance-mapper frameworks --list
compliance-mapper analyze --framework [name]
compliance-mapper cross-walk --compare
policy-engine scan --provider [aws|azure|gcp]
policy-engine evaluate --cis-benchmark
policy-engine remediate --auto-fix
audit-analyzer query --events compliance
audit-analyzer report --framework [name]
audit-analyzer detect --unauthorized
pentest-sim scope --define target-env
pentest-sim execute --methodology [phase]
pentest-sim report --generate-findings
scenario --regulatory-audit-prep
audit-prep evidence --collect-all
audit-prep readiness --final-assessment
```

---

## File Structure

```
_app/houses/cloud/modules/cse/
├── cse-module01-presentation.html
├── cse-module01-lab.html
├── cse-module01-quiz.html
├── cse-module02-presentation.html
├── cse-module02-lab.html
├── cse-module02-quiz.html
├── cse-module03-presentation.html
├── cse-module03-lab.html
├── cse-module03-quiz.html
├── cse-module04-presentation.html
├── cse-module04-lab.html
├── cse-module04-quiz.html
├── cse-module05-presentation.html
├── cse-module05-lab.html
├── cse-module05-quiz.html
├── cse-module06-presentation.html
├── cse-module06-lab.html
├── cse-module06-quiz.html
├── cse-module07-presentation.html
├── cse-module07-lab.html
├── cse-module07-quiz.html
├── cse-module08-presentation.html
├── cse-module08-lab.html
└── cse-module08-quiz.html
```

---

## Registry Configuration

### ContentRegistry Entries
**Location:** `_app/config/content-registry.js`

Each module is registered with:
- `id`: Unique identifier (e.g., `cse-module01`)
- `title`: Display name
- `description`: Brief summary
- `house`: `cloud`
- `type`: `module`
- `difficulty`: `beginner`, `intermediate`, or `advanced`
- `duration`: Estimated time in minutes
- `topics`: Array of relevant tags
- `paths`: Learning path associations
- `components`: Links to presentation, lab, and quiz files
- `prerequisites`: Required prior modules
- `objectives`: Array of learning objectives

### Cloud House Index
**Location:** `_app/houses/cloud/index.html`

All modules are listed in `SAMPLE_MODULES` array with:
- `id`, `title`, `description`
- `icon`: 🏆 (trophy for complete modules)
- `status`: `available`
- `difficulty`: Level indicator
- `components`: Array `['presentation', 'lab', 'quiz']`
- `href`: Link to presentation file

---

## Design Patterns

### Color Theme Progression
| Module | Theme | Primary Color | Accent Color |
|--------|-------|---------------|--------------|
| M01-03 | Blue | #3498db | #2980b9 |
| M04 | Cyan | #00bcd4 | #0097a7 |
| M05 | Pink | #e91e63 | #c2185b |
| M06 | Orange | #ff9800 | #f57c00 |
| M07 | Purple | #8a2be2 | #4b0082 |
| M08 | Green | #228b22 | #006400 |

### Lab Design Principles
1. **Terminal-Based**: All labs use CLI simulation, not quiz-style interactions
2. **Realistic Output**: Commands produce industry-accurate output
3. **Progressive Complexity**: Lab 1 is simplest, Lab 5 is integrated scenario
4. **Cumulative Integration**: Lab 5 always combines concepts from ALL previous modules
5. **Practical Skills**: Focus on real-world tasks and decision-making

### Quiz Design Principles
1. **20 Questions Total**: 17 core module questions + 3 review questions
2. **Review Questions**: Pull from 3 previous modules (sliding window)
3. **Immediate Feedback**: Explanations provided after each answer
4. **Progress Tracking**: Visual progress bar
5. **Score Thresholds**: 90%+ for "Outstanding", 80%+ for completion badge

---

## Instructor Notes

### Lab Answer Keys

#### Module 07 Lab Tasks:

**Lab 1 - Risk Identification:**
1. Total cloud assets: 689
2. Public S3 buckets: 3
3. Critical/High percentage: 8% + 13% = 21%
4. Immediate attention: Data Exposure (CRITICAL)

**Lab 2 - Quantitative Analysis:**
1. SLE with $5M AV and 40% EF: $5M × 0.40 = $2,000,000
2. ALE with $2M SLE and 0.25 ARO: $2M × 0.25 = $500,000
3. Best ROI control: Encryption at Rest (360%)
4. Residual ALE after all controls: $155,000/year

**Lab 3 - Vulnerability Scanning:**
1. KEV list vulnerabilities: 3
2. RCE percentage: 28%
3. Highest CVSS asset: FW-EDGE-01 (CVE-2024-3400, CVSS 10.0)
4. Top 3 priorities: CVE-2024-21887, CVE-2024-27198, CVE-2024-3400

**Lab 4 - BCP/DRP:**
1. 4-hour outage cost: $1,100,000
2. Largest RTO gap: Payment Processing (2hr current vs 15min target)
3. Ransomware root cause: IAM key not rotated
4. Improvements: DR load balancer, updated runbook, backup verification

**Lab 5 - Integrated Scenario:**
1. Most critical STRIDE: Information Disclosure & Elevation of Privilege (both CRITICAL)
2. DREAD for "No logging": D=8, R=9, E=6, A=10, D=7 = 8.0/10
3. Price adjustment: 11% ($5M)
4. Conditions: Pentest, root remediation, IR plan written
5. Risk reduction: 90.6%

#### Module 08 Lab Tasks:

**Lab 1 - Compliance Mapping:**
1. PCI-DSS gaps: Requirement 6, Requirement 11
2. PCI-DSS compliance: 84% (109/127)
3. Lowest coverage: Security Testing (60%)
4. Best value controls: MFA, Encryption at rest, Logging/monitoring, Access reviews

**Lab 2 - Policy Evaluation:**
1. IAM users without MFA: 8
2. CIS Section 4 score: 47% (7/15)
3. SOX-relevant bucket: company-financial-reports
4. Compliance improvement: 94.6% → 97.2% (+2.6%)

**Lab 3 - Audit Trail:**
1. Privilege escalation events: 3
2. Overdue HIPAA safeguard: Administrative (Evaluation/Pen test)
3. Detection #1 source: Tor exit node (185.143.xxx.xxx)
4. Brute force blocked: 1,247

**Lab 4 - Penetration Testing:**
1. Most critical CVSS: 9.8 (SQL Injection)
2. Control that blocked stuffing: MFA
3. SQLi compliance impact: PCI-DSS 6.5.1, GDPR Art. 32
4. SSRF remediation: IMDSv2, URL allowlist, Block 169.254.169.254, PrivateLink

**Lab 5 - Capstone:**
1. HIPAA readiness: 92%
2. Priority 1 blockers: Pentest, security groups, credential rotation
3. Most gaps: M02 (IAM) - 3 stale credentials, M04 (Network) - 2 open SGs
4. Evidence items: 1,892
5. Conditional pass: PCI-DSS

---

## Source Material Reference

**Original Course Files:**
```
_planning/usb-import/extracted-guides/ec-council-cse/markdown/
├── CSEv1 Module 01 Cloud Computing Fundamentals.md (30 slides)
├── CSEv1 Module 02 Identity and Access Management in Cloud.md (36 slides)
├── CSEv1 Module 03 Data Protection and Encryption in Cloud.md (42 slides)
├── CSEv1 Module 04 Network Security in Cloud.md (30 slides)
├── CSEv1 Module 05 Application Security in Cloud.md (35 slides)
├── CSEv1 Module 06 Cloud Security Monitoring and Incident Response.md (30 slides)
├── CSEv1 Module 07 Cloud Security Risk Assessment and Management.md (37 slides)
└── CSEv1 Module 08 Cloud Compliance and Governance.md (54 slides)
```

---

## Navigation Structure

All module components are interconnected with consistent navigation:

### Navigation Flow
```
Presentation → Lab → Quiz → Next Module
     ↓          ↓      ↓
  Cloud House  Cloud House  Cloud House
```

### Implementation by Module

| Module | Style | Components |
|--------|-------|------------|
| M01-M03 | `nav-buttons` class | Bottom buttons with consistent styling |
| M04-M06 | `nav-links` class | Bottom links with emoji indicators |
| M07-M08 | `module-nav` + `nav-buttons` | Top navigation bar + bottom buttons |

### Standard Navigation Elements

**Presentations:**
- Previous/Next slide buttons
- "Start Lab →" button on final slide
- "← Cloud House" link

**Labs:**
- "← Review Presentation" link
- "Take Quiz →" link
- "☁️ Cloud House" link

**Quizzes:**
- "Retake Quiz" button
- "Review Presentation" link
- "Next Module →" button (hidden if score < 70%)
- "← Cloud House" link

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | Dec 31, 2025 | **🔮 SPELL SEALED** - User verified, deployed to production |
| 1.1 | Dec 31, 2025 | Navigation audit - fixed M01 lab/quiz links |
| 1.0 | Dec 31, 2025 | Initial complete course with all 8 modules |

---

## 🔮 SPELL-023 SEAL

```
╔═════════════════════════════════════════════════════════════╗
║  This spell has been SEALED and is considered COMPLETE.     ║
║                                                             ║
║  Sealed By: User verification after live testing            ║
║  Seal Date: December 31, 2025                               ║
║  Deployment: Firebase v2.55.0                               ║
║  Live URL: https://hexworth-prime.web.app/houses/cloud/     ║
║                                                             ║
║  All 8 modules tested and functioning correctly.            ║
║  Navigation flow verified: Presentation → Lab → Quiz        ║
╚═════════════════════════════════════════════════════════════╝
```

---

*Documentation generated for Hexworth Prime Cloud House*
