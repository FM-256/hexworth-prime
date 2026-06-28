/* QC config for the Security Controls & CIA lab. Drives all 3 stages (CIA
   impact, control type+function matrix, AAA mapping) to a perfect 19/19 via
   the real UI handlers; one wrong CIA selection must not certify. */
export default {
  lab: 'houses/shield/labs/shield-security-fundamentals.lab.html',
  moduleId: 'shield-fundamentals-lab',
  solveWaitMs: 8000,
  // page-context: classify all CIA impacts, all control type+function pairs, all AAA mappings, then evaluate.
  solve: async () => {
    const cia = { ransomware:['A'], ddos:['A'], exfil:['C'], alteration:['I'], cred:['C','I'], tape:['C'] };
    Object.entries(cia).forEach(([inc,ps]) => ps.forEach(p => window.toggleCIA(inc, p)));
    const ctrl = { firewall:['Technical','Preventive'], awareness:['Operational','Preventive'], encryption:['Technical','Preventive'],
      cctv:['Physical','Detective'], ids:['Technical','Detective'], backup:['Operational','Corrective'],
      guard:['Physical','Deterrent'], aup:['Managerial','Directive'] };
    Object.entries(ctrl).forEach(([id,[t,f]]) => { window.setCtrl(id,'type',t); window.setCtrl(id,'fn',f); });
    const aaa = { mfa:'authn', rbac:'authz', audit:'accounting', digsig:'nonrep', sso:'authn' };
    Object.entries(aaa).forEach(([m,p]) => { window.selectMech(m); window.placeInPillar(p); });
    window.goStage(4); await window.runEvaluation();
  },
  // page-context: one wrong CIA selection, rest empty -> not 19/19 -> no certification.
  wrong: async () => {
    window.toggleCIA('ransomware','C');   // wrong (should be Availability)
    window.goStage(4); await window.runEvaluation();
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
