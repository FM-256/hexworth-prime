# EduScan Remediation Plan
Generated: 2026-02-06

## Summary

- **Total issues:** 330
- **Safe to auto-fix:** 124
- **Need review:** 3
- **Manual only:** 203

### By Severity

- HIGH: 215
- MEDIUM: 99
- LOW: 16

## Safe Auto-Fix (124 issues)

These issues have high confidence (>=95%) and can be safely auto-fixed.

### houses/forge (124 issues)

**PATH-001** (69 issues)

| File | Fix |
|------|-----|
| `.../core-2/labs/admin-tools-lab.html` | Change path to: ../../../../../../components/AchievementM... |
| `.../core-2/labs/admin-tools-lab.html` | Change path to: ../../../../../../components/LearningPath... |
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/AccessGuard.js |
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/AchievementM... |
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/ModuleProgre... |
| ... | *and 64 more with same pattern* |

**PATH-DEPTH-001** (55 issues)

| File | Fix |
|------|-----|
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/AccessGuard.js |
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/AchievementM... |
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/ModuleProgre... |
| `.../core-2/presentations/admin-tools.html` | Change path to: ../../../../../../components/FluxCapacito... |
| `.../core-2/presentations/change-management.html` | Change path to: ../../../../../../components/AccessGuard.js |
| ... | *and 50 more with same pattern* |

## Review Needed (3 issues)

These issues are auto-fixable but have medium confidence (70-94%). Review before applying.

### houses/eye (1 issues)

**ENG-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../eye/presentations/network-traffic-analysis.html` | Engine "PresentationEngine" is used but not inc... | Add <script src="components/PresentationEngine.js"></scri... |

### houses/web (2 issues)

**ENG-001** (2 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../web/presentations/osi-model.html` | Engine "PresentationEngine" is used but not inc... | Add <script src="components/PresentationEngine.js"></scri... |
| `.../web/presentations/osi-model.html` | Engine "PresentationEngine" is used but not inc... | Add <script src="components/PresentationEngine.js"></scri... |

## Manual Only (203 issues)

These issues require manual intervention (not auto-fixable or low confidence).

### admin (1 issues)

**JS-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `admin/audit-tool.html` | Severely unbalanced {} (off by 4) | Add 4 closing '}' |

### dark-arts (2 issues)

**HTML-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `dark-arts/vault/xss-attacks-lab.html` | Unclosed <script> tag - this will break page fu... | Add closing </script> tag |

**JS-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../vault/tools/analysis-toolkit.html` | Severely unbalanced () (off by 4) | Add 4 closing ')' |

### houses/cloud (2 issues)

**HTML-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../modules/cse/cse-module05-lab.html` | Unclosed <script> tag - this will break page fu... | Add closing </script> tag |

**JS-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../wsa/midterm-outpost/simulation.html` | Severely unbalanced () (off by 4) | Add 4 closing ')' |

### houses/forge (10 issues)

**ENG-002** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../core-1/labs/hardware-diagnosis-lab.html` | Global "moment" used but Moment.js not included | Add Moment.js script before usage |

**PATH-001** (5 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../hardware/hard_drive_geometry/hard_drive_geometry1.html` | Script not found: hard_drive_geometry1.hypereso... | Create hard_drive_geometry1.hyperesources/harddrivegeomet... |
| `.../hardware/multimeter/multimeter_jedit_v1.html` | Script not found: multimeter_jedit_v1.hyperesou... | Change path to: ../../../../shield/applets/access/access_... |
| `.../hardware/multimeter/multimeter_jedit_v1.html` | Script not found: multimeter_jedit_v1.hyperesou... | Change path to: ../../../../shield/applets/access/access_... |
| `.../hardware/multimeter/multimeter_jedit_v1.html` | Script not found: multimeter_jedit_v1.hyperesou... | Change path to: ../../../../shield/applets/access/access_... |
| `.../hardware/multimeter/multimeter_jedit_v1.html` | Script not found: multimeter_jedit_v1.hyperesou... | Create multimeter_jedit_v1.hyperesources/multimeterjeditv... |

**PATH-002** (4 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../chapters/ch08-cloud/index.html` | Stylesheet not found: ../../../../../../styles/... | Create ../../../../../../styles/main.css or fix the path |
| `.../chapters/ch08-cloud/index.html` | Stylesheet not found: ../../../../../../styles/... | Create ../../../../../../styles/chapter.css or fix the path |
| `.../chapters/ch09-laptops/index.html` | Stylesheet not found: ../../../../../../styles/... | Create ../../../../../../styles/main.css or fix the path |
| `.../chapters/ch09-laptops/index.html` | Stylesheet not found: ../../../../../../styles/... | Create ../../../../../../styles/chapter.css or fix the path |

### houses/script (96 issues)

**ENG-002** (2 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../script/clh/clh-014-intro.html` | Global "$" used but jQuery not included | Add jQuery script before usage |
| `.../modules/clh-014/intro.html` | Global "$" used but jQuery not included | Add jQuery script before usage |

**JS-001** (2 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../applets/python/python-chapter2-strings.html` | Severely unbalanced () (off by 5) | Remove 5 extra ')' |
| `.../modules/linux-mastery/lm-12-section2-practice.html` | Severely unbalanced () (off by 4) | Remove 4 extra ')' |

**PATH-002** (92 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../modules/linux-mastery/lm-08-file-operations.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-08-file-operations.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-09-copy-move.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-09-copy-move.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-10-viewing-files.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-10-viewing-files.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-11-finding-files.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-11-finding-files.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-12-section2-practice.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-12-section2-practice.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-13-grep-basics.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-13-grep-basics.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-14-regular-expressions.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-14-regular-expressions.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-15-sed-editor.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-15-sed-editor.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-16-awk-processing.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-16-awk-processing.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-17-sort-uniq.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-17-sort-uniq.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-18-cut-paste.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-18-cut-paste.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-19-text-pipelines.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-19-text-pipelines.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-20-section3-practice.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-20-section3-practice.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-21-users-groups.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-21-users-groups.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-22-file-permissions.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-22-file-permissions.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-23-chmod.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-23-chmod.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-24-chown.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-24-chown.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-25-sudo.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-25-sudo.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-26-special-permissions.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-26-special-permissions.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-27-section4-practice.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-27-section4-practice.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-28-process-basics.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-28-process-basics.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-29-ps-top.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-29-ps-top.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-30-background-jobs.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-30-background-jobs.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-31-signals-kill.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-31-signals-kill.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-32-cron.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-32-cron.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-33-systemd.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-33-systemd.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-34-section5-practice.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-34-section5-practice.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-35-network-info.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-35-network-info.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-36-connectivity.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-36-connectivity.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-37-dns-tools.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-37-dns-tools.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-38-downloading.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-38-downloading.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-39-ssh-basics.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-39-ssh-basics.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-40-section6-practice.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-40-section6-practice.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-41-first-script.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-41-first-script.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-42-variables.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-42-variables.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-43-user-input.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-43-user-input.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-44-conditionals.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-44-conditionals.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-45-loops.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-45-loops.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-46-functions.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-46-functions.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-47-practical-scripts.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-47-practical-scripts.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-48-section7-practice.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-48-section7-practice.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-49-links.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-49-links.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-50-text-editors.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-50-text-editors.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-51-package-management.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-51-package-management.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-52-environment-path.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-52-environment-path.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |
| `.../modules/linux-mastery/lm-53-next-steps.html` | Stylesheet not found: ../../../../styles/main.css | Create ../../../../styles/main.css or fix the path |
| `.../modules/linux-mastery/lm-53-next-steps.html` | Stylesheet not found: ../../../../styles/termin... | Change path to: ../../../../terminal.html |

### houses/shield (79 issues)

**ENG-002** (2 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../applets/operations/cyber-arts-bootcamp.html` | Global "$" used but jQuery not included | Add jQuery script before usage |
| `.../applets/crypto/gpg-encryption-lab.html` | Global "moment" used but Moment.js not included | Add Moment.js script before usage |

**JS-001** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../applets/risk/bia-calculator.html` | Severely unbalanced () (off by 4) | Remove 4 extra ')' |

**PATH-001** (59 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../compliance/cmmc_access_control/ACv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_access_control/ACv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_audit_accountability/AUv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_audit_accountability/AUv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_awareness_training/ATv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_awareness_training/ATv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_config_management/CMv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_config_management/CMv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_cui/CUI_2.html` | Script not found: CUI_2.hyperesources/cui2_hype... | Create CUI_2.hyperesources/cui2_hype_generated_script.js?... |
| `.../compliance/cmmc_framework/CMMCFrameworkv2.html` | Script not found: CMMCFrameworkv2.hyperesources... | Create CMMCFrameworkv2.hyperesources/cmmcframeworkv2_hype... |
| `.../compliance/cmmc_identification_auth/IAv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_identification_auth/IAv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_incident_response/IRv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_incident_response/IRv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_maintenance/MAv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_maintenance/MAv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_media_protection/MPv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_media_protection/MPv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_personnel_security/PSv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_personnel_security/PSv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_physical_protection/PEv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_physical_protection/PEv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_quiz/CMMCTestKnowledge2.html` | Script not found: CMMCTestKnowledge2.hyperesour... | Change path to: ../../fundamentals/privacy/privacy.hypere... |
| `.../compliance/cmmc_quiz/CMMCTestKnowledge2.html` | Script not found: CMMCTestKnowledge2.hyperesour... | Change path to: ../../access/access_control/access_contro... |
| `.../compliance/cmmc_quiz/CMMCTestKnowledge2.html` | Script not found: CMMCTestKnowledge2.hyperesour... | Change path to: ../../access/access_control/access_contro... |
| `.../compliance/cmmc_quiz/CMMCTestKnowledge2.html` | Script not found: CMMCTestKnowledge2.hyperesour... | Create CMMCTestKnowledge2.hyperesources/cmmctestknowledge... |
| `.../compliance/cmmc_risk_assessment/RAv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_risk_assessment/RAv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_security_assessment/CAv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_security_assessment/CAv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_system_comm_protection/SCv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_system_comm_protection/SCv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../compliance/cmmc_system_info_integrity/SIv2.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../compliance/cmmc_system_info_integrity/SIv2.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |
| `.../crypto/block_mode/Block.html` | Script not found: Block.hyperesources/block_hyp... | Create Block.hyperesources/block_hype_generated_script.js... |
| `.../crypto/blockchain/blockchain.html` | Script not found: blockchain.hyperesources/jque... | Change path to: ../../access/access_control/access_contro... |
| `.../crypto/blockchain/blockchain.html` | Script not found: blockchain.hyperesources/jque... | Change path to: ../../access/biometrics/Biometrics.hypere... |
| `.../crypto/blockchain/blockchain.html` | Script not found: blockchain.hyperesources/jque... | Change path to: ../../access/access_control/access_contro... |
| `.../crypto/blockchain/blockchain.html` | Script not found: blockchain.hyperesources/bloc... | Create blockchain.hyperesources/blockchain_hype_generated... |
| `.../crypto/cryptography/cryptography.html` | Script not found: cryptography.hyperesources/jq... | Change path to: ../../access/access_control/access_contro... |
| `.../crypto/cryptography/cryptography.html` | Script not found: cryptography.hyperesources/jq... | Change path to: ../../access/biometrics/Biometrics.hypere... |
| `.../crypto/cryptography/cryptography.html` | Script not found: cryptography.hyperesources/jq... | Change path to: ../../access/access_control/access_contro... |
| `.../crypto/cryptography/cryptography.html` | Script not found: cryptography.hyperesources/cr... | Create cryptography.hyperesources/cryptography_hype_gener... |
| `.../crypto/cryptomatch/CryptoMatch.html` | Script not found: CryptoMatch.hyperesources/cry... | Create CryptoMatch.hyperesources/cryptomatch_hype_generat... |
| `.../crypto/diffie_hellman/diffie_hellman.html` | Script not found: diffie_hellman.hyperesources/... | Create diffie_hellman.hyperesources/diffiehellman_hype_ge... |
| `.../crypto/digital_signatures/DigitalSignature.html` | Script not found: DigitalSignature.hyperesource... | Create DigitalSignature.hyperesources/digitalsignature_hy... |
| `.../crypto/encrypt_data/EncryptData.html` | Script not found: EncryptData.hyperesources/enc... | Create EncryptData.hyperesources/encryptdata_hype_generat... |
| `.../crypto/encryption/encryption_jedit_6_1.html` | Script not found: encryption_jedit_6_1.hypereso... | Create encryption_jedit_6_1.hyperesources/encryptionjedit... |
| `.../crypto/factor_prime/FactorPrime.html` | Script not found: FactorPrime.hyperesources/fac... | Create FactorPrime.hyperesources/factorprime_hype_generat... |
| `.../crypto/hashing/Hashing.html` | Script not found: Hashing.hyperesources/hashing... | Create Hashing.hyperesources/hashing_hype_generated_scrip... |
| `.../crypto/hashing_narrated/Hashing_vo.html` | Script not found: Hashing_vo.hyperesources/hash... | Create Hashing_vo.hyperesources/hashingvo_hype_generated_... |
| `.../crypto/pki/pki.html` | Script not found: pki.hyperesources/pki_hype_ge... | Create pki.hyperesources/pki_hype_generated_script.js?295... |
| `.../crypto/rsa/RSA.html` | Script not found: RSA.hyperesources/rsa_hype_ge... | Create RSA.hyperesources/rsa_hype_generated_script.js?374... |
| `.../fundamentals/career_exploration/index.html` | Script not found: script.js | Create script.js or fix the path |
| `.../fundamentals/career_exploration/index.html` | Script not found: ../../js/ios-orientationchang... | Create ../../js/ios-orientationchange-fix.min.js or fix t... |
| `.../fundamentals/career_exploration/index.html` | Script not found: username.js | Create username.js or fix the path |
| `.../fundamentals/career_exploration/index.html` | Script not found: jquery.rwdImageMaps.min.js | Create jquery.rwdImageMaps.min.js or fix the path |
| `.../threats/osint_challenge/OSINT_PD_Challenge.html` | Script not found: data/common/script.js | Create data/common/script.js or fix the path |
| `.../threats/osint_challenge/OSINT_PD_Challenge.html` | Script not found: data/player/player.js | Create data/player/player.js or fix the path |

**PATH-002** (1 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../fundamentals/career_exploration/index.html` | Stylesheet not found: styles.css | Create styles.css or fix the path |

**PATH-003** (16 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../compliance/cmmc_access_control/ACv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_audit_accountability/AUv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_awareness_training/ATv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_config_management/CMv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_identification_auth/IAv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_incident_response/IRv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_maintenance/MAv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_media_protection/MPv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_personnel_security/PSv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_physical_protection/PEv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_risk_assessment/RAv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_security_assessment/CAv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_system_comm_protection/SCv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../compliance/cmmc_system_info_integrity/SIv2.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |
| `.../fundamentals/career_exploration/index.html` | Image not found: assets/nsa room renders/Entryw... | Add image at assets/nsa room renders/Entryway/Entryway/En... |
| `.../threats/osint_challenge/OSINT_PD_Challenge.html` | Image not found: data/player/pre.gif | Add image at data/player/pre.gif or fix the path |

### houses/web (13 issues)

**PATH-001** (13 issues)

| File | Issue | Fix |
|------|-------|-----|
| `.../ip-addressing/IPv6/IPv6.html` | Script not found: IPv6.hyperesources/ipv6_hype_... | Create IPv6.hyperesources/ipv6_hype_generated_script.js?9... |
| `.../ip-addressing/IPv6Challenge/IPv6Challenge.html` | Script not found: IPv6Challenge.hyperesources/i... | Create IPv6Challenge.hyperesources/ipv6challenge_hype_gen... |
| `.../ip-addressing/NAT/NAT.html` | Script not found: NAT.hyperesources/nat_hype_ge... | Create NAT.hyperesources/nat_hype_generated_script.js?475... |
| `.../ip-addressing/VLSM/VLSM.html` | Script not found: VLSM.hyperesources/vlsm_hype_... | Create VLSM.hyperesources/vlsm_hype_generated_script.js?8... |
| `.../ip-addressing/VLSM_challenge/VLSM_challenge.html` | Script not found: VLSM_challenge.hyperesources/... | Create VLSM_challenge.hyperesources/vlsmchallenge_hype_ge... |
| `.../ip-addressing/binaryIP/binaryIP.html` | Script not found: binaryIP.hyperesources/binary... | Create binaryIP.hyperesources/binaryip_hype_generated_scr... |
| `.../ip-addressing/classA/classA.html` | Script not found: classA.hyperesources/classa_h... | Create classA.hyperesources/classa_hype_generated_script.... |
| `.../ip-addressing/classB/classB.html` | Script not found: classB.hyperesources/classb_h... | Create classB.hyperesources/classb_hype_generated_script.... |
| `.../ip-addressing/intro_subnetting/intro_subnetting.html` | Script not found: intro_subnetting.hyperesource... | Create intro_subnetting.hyperesources/introsubnetting_hyp... |
| `.../ip-addressing/macaddressing/EMate_pizzaparty_exercise_102918.html` | Script not found: EMate_pizzaparty_exercise_102... | Create EMate_pizzaparty_exercise_102918.hyperesources/ema... |
| `.../ip-addressing/network_classes2/network_classes2.html` | Script not found: network_classes2.hyperesource... | Create network_classes2.hyperesources/networkclasses2_hyp... |
| `.../ip-addressing/networkaddressing/EMate_understanding_addresses.html` | Script not found: EMate_understanding_addresses... | Create EMate_understanding_addresses.hyperesources/emateu... |
| `.../ip-addressing/subnetting/subnetting.html` | Script not found: subnetting.hyperesources/subn... | Create subnetting.hyperesources/subnetting_hype_generated... |

---

Generated by EduScan RemediationPlanner v1.0.0