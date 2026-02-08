# CSE Course Quick Reference Card

## Module Navigation URLs

| Module | Presentation | Lab | Quiz |
|--------|--------------|-----|------|
| M01 | `modules/cse/cse-module01-presentation.html` | `-lab.html` | `-quiz.html` |
| M02 | `modules/cse/cse-module02-presentation.html` | `-lab.html` | `-quiz.html` |
| M03 | `modules/cse/cse-module03-presentation.html` | `-lab.html` | `-quiz.html` |
| M04 | `modules/cse/cse-module04-presentation.html` | `-lab.html` | `-quiz.html` |
| M05 | `modules/cse/cse-module05-presentation.html` | `-lab.html` | `-quiz.html` |
| M06 | `modules/cse/cse-module06-presentation.html` | `-lab.html` | `-quiz.html` |
| M07 | `modules/cse/cse-module07-presentation.html` | `-lab.html` | `-quiz.html` |
| M08 | `modules/cse/cse-module08-presentation.html` | `-lab.html` | `-quiz.html` |

---

## Key Formulas (Module 07)

```
SLE = Asset Value × Exposure Factor
ALE = SLE × ARO

Example:
  Asset Value = $5,000,000
  Exposure Factor = 40%
  ARO = 0.25 (once every 4 years)

  SLE = $5,000,000 × 0.40 = $2,000,000
  ALE = $2,000,000 × 0.25 = $500,000/year
```

---

## Framework Quick Reference

### NIST CSF Core Functions
1. **Identify** - Asset management, risk assessment
2. **Protect** - Access control, training, encryption
3. **Detect** - Monitoring, anomaly detection
4. **Respond** - Incident response, mitigation
5. **Recover** - Recovery planning, improvements

### NIST RMF Steps (SP 800-37)
1. Prepare → 2. Categorize → 3. Select → 4. Implement → 5. Assess → 6. Authorize → 7. Monitor

### Risk Response Strategies
- **Mitigate** - Implement controls to reduce risk
- **Avoid** - Don't do the risky activity
- **Accept** - Acknowledge and document the risk
- **Transfer** - Insurance or outsourcing
- ❌ **NEVER Ignore**

### STRIDE Threat Categories
- **S**poofing identity
- **T**ampering with data
- **R**epudiation
- **I**nformation disclosure
- **D**enial of service
- **E**levation of privilege

### DREAD Risk Scoring (0-10 each)
- **D**amage potential
- **R**eproducibility
- **E**xploitability
- **A**ffected users
- **D**iscoverability

---

## Regulatory Cheat Sheet

| Regulation | Scope | Key Requirement |
|------------|-------|-----------------|
| **GDPR** | EU data privacy | 72-hour breach notification |
| **HIPAA** | US healthcare | ePHI safeguards (Admin/Physical/Technical) |
| **PCI-DSS** | Payment cards | 12 requirements, quarterly scans |
| **SOX** | Public companies | Internal control reporting |
| **FISMA** | US federal | NIST-based security standards |
| **FERPA** | Education | Student record privacy |
| **GLBA** | Financial | Privacy + Safeguards + Pretexting |

---

## Cloud Provider Tools

| Function | AWS | Azure | GCP |
|----------|-----|-------|-----|
| **Policy/Config** | AWS Config | Azure Policy | Org Policies |
| **Compliance** | Security Hub | Defender for Cloud | SCC |
| **Vulnerability** | Inspector | Defender | SCC |
| **Logging** | CloudTrail | Activity Log | Cloud Audit |
| **SIEM** | Security Lake | Sentinel | Chronicle |

---

## Standards Quick Reference

| Standard | Controls | Focus |
|----------|----------|-------|
| **NIST 800-53** | 1189 | Federal security controls |
| **ISO 27001** | 114 (14 domains) | ISMS certification |
| **CSA CCM** | 197 (17 domains) | Cloud-specific controls |
| **CIS Controls** | 18 | Critical security controls |
| **CIS Benchmarks** | Varies | Configuration hardening |

### FedRAMP Paths
- **Ready** - Minimum requirements met, ready for agency review
- **Authorized** - ATO obtained, reusable by other agencies
- **Tailored** - Streamlined for low-impact SaaS

---

## BCP vs DRP

| Aspect | BCP | DRP |
|--------|-----|-----|
| **Focus** | Keep running DURING disaster | Restore AFTER disaster |
| **Scope** | All business operations | IT systems specifically |
| **Approach** | Prevention-focused | Recovery-focused |
| **Key Metrics** | MTD (Max Tolerable Downtime) | RTO/RPO |

**RTO** = Recovery Time Objective (max acceptable downtime)
**RPO** = Recovery Point Objective (max acceptable data loss)

---

## Passing Scores

| Score | Result |
|-------|--------|
| 90%+ | Outstanding - Full mastery |
| 80-89% | Great - Course completion badge |
| 70-79% | Good - Review recommended |
| <70% | Needs study - Retake advised |

---

## Color Themes by Module

```css
M01-03: #3498db (Blue)
M04:    #00bcd4 (Cyan)
M05:    #e91e63 (Pink)
M06:    #ff9800 (Orange)
M07:    #8a2be2 (Purple)
M08:    #228b22 (Green - Capstone)
```

---

*Quick Reference v1.0 - December 2025*
