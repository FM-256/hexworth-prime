/* QC config for the Compliance & Governance Mapper lab. Correct classifications
   + the full required control set with no traps must pass the audit and certify;
   omitting a required control (a gap) must not certify. */
const CLASS = { med_records:'phi', payment_cards:'cardholder', eu_patient_data:'eu_personal',
  employee_ssns:'pii', financial_reporting:'financial_reporting', marketing_materials:'public' };
const REQUIRED = ['hipaa_encrypt_rest','hipaa_encrypt_transit','hipaa_access_controls','hipaa_audit_logging','hipaa_baa',
  'pci_network_seg','pci_encrypt_cardholder','pci_no_defaults','pci_quarterly_scans',
  'gdpr_lawful_basis','gdpr_dsar','gdpr_breach_72h','gdpr_dpo',
  'sox_change_mgmt','sox_sod','sox_audit_trail'];

export default {
  lab: 'houses/shield/labs/shield-compliance.lab.html',
  moduleId: 'shield-compliance-lab',
  solveWaitMs: 3000,
  // page-context: classify all assets, enable every required control (no traps), run the audit.
  solve: async () => {
    const CLASS = { med_records:'phi', payment_cards:'cardholder', eu_patient_data:'eu_personal', employee_ssns:'pii', financial_reporting:'financial_reporting', marketing_materials:'public' };
    const REQUIRED = ['hipaa_encrypt_rest','hipaa_encrypt_transit','hipaa_access_controls','hipaa_audit_logging','hipaa_baa','pci_network_seg','pci_encrypt_cardholder','pci_no_defaults','pci_quarterly_scans','gdpr_lawful_basis','gdpr_dsar','gdpr_breach_72h','gdpr_dpo','sox_change_mgmt','sox_sod','sox_audit_trail'];
    Object.entries(CLASS).forEach(([id,v])=>window.classifyAsset(id,v));
    REQUIRED.forEach(c=>window.toggleControl(c));
    window.goStage(4); await window.runAudit();
  },
  // page-context: correct classifications + all-but-one required control (a GDPR gap) -> must not certify.
  wrong: async () => {
    const CLASS = { med_records:'phi', payment_cards:'cardholder', eu_patient_data:'eu_personal', employee_ssns:'pii', financial_reporting:'financial_reporting', marketing_materials:'public' };
    const REQUIRED = ['hipaa_encrypt_rest','hipaa_encrypt_transit','hipaa_access_controls','hipaa_audit_logging','hipaa_baa','pci_network_seg','pci_encrypt_cardholder','pci_no_defaults','pci_quarterly_scans','gdpr_lawful_basis','gdpr_dsar','gdpr_dpo','sox_change_mgmt','sox_sod','sox_audit_trail']; // omits gdpr_breach_72h
    Object.entries(CLASS).forEach(([id,v])=>window.classifyAsset(id,v));
    REQUIRED.forEach(c=>window.toggleControl(c));
    window.goStage(4); await window.runAudit();
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
