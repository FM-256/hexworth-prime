/* QC config for the Threat Intelligence Center lab. Drives all 3 investigate-
   and-attribute stages to certification; the wrong path completes triage+TTP
   correctly but mis-attributes the actor (proves the attribution stage gates). */
// The answer keys live INSIDE solve()/wrong() because page.evaluate serializes
// the function source and runs it in the page — it cannot close over module scope.
export default {
  lab: 'houses/shield/labs/shield-threats.lab.html',
  moduleId: 'shield-threats-lab',
  solveWaitMs: 2500,
  // page-context: classify all 6 IOCs (type+tactic), map all 6 TTPs to the
  // correct ATT&CK IDs, and attribute the actor correctly -> certifies.
  solve: () => {
    const IOC = {'ioc-ip':['network','command-and-control'],'ioc-hash':['host','execution'],'ioc-email':['email','initial-access'],'ioc-task':['host','persistence'],'ioc-lolbin':['host','defense-evasion'],'ioc-exfil':['network','exfiltration']};
    const TTP = {'ttp-phish':'T1566.002','ttp-rundll':'T1218.011','ttp-stask':'T1053.005','ttp-binary':'T1059.001','ttp-c2':'T1071.001','ttp-exfil':'T1041'};
    Object.entries(IOC).forEach(([id,[t,tac]])=>{ document.getElementById('type-'+id).value=t; document.getElementById('tactic-'+id).value=tac; });
    window.checkTriage();
    Object.entries(TTP).forEach(([id,v])=>{ document.getElementById('sel-'+id).value=v; });
    window.checkTTP();
    window.selectActor('organized-cybercrime'); window.checkAttribution();
  },
  // page-context: triage + TTP mapping correct, but mis-attribute the actor —
  // proves the attribution stage gates (a near-correct run must not certify).
  wrong: () => {
    const IOC = {'ioc-ip':['network','command-and-control'],'ioc-hash':['host','execution'],'ioc-email':['email','initial-access'],'ioc-task':['host','persistence'],'ioc-lolbin':['host','defense-evasion'],'ioc-exfil':['network','exfiltration']};
    const TTP = {'ttp-phish':'T1566.002','ttp-rundll':'T1218.011','ttp-stask':'T1053.005','ttp-binary':'T1059.001','ttp-c2':'T1071.001','ttp-exfil':'T1041'};
    Object.entries(IOC).forEach(([id,[t,tac]])=>{ document.getElementById('type-'+id).value=t; document.getElementById('tactic-'+id).value=tac; });
    window.checkTriage();
    Object.entries(TTP).forEach(([id,v])=>{ document.getElementById('sel-'+id).value=v; });
    window.checkTTP();
    window.selectActor('nation-state'); window.checkAttribution();   // wrong actor -> must not certify
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
