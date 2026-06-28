/* QC config for the Dork Builder / OSINT Recon lab. Solves all 5 recon
   objectives with correctly-constructed Google dorks the engine parses and
   runs against the simulated index; an under-scoped dork must not certify. */
export default {
  lab: 'houses/shield/labs/shield-osint-google-dorking.lab.html',
  moduleId: 'shield-osint-google-dorking',
  solveWaitMs: 2000,
  // page-context: write the correct dork for each objective and run it.
  solve: () => {
    const dorks = {
      1: 'site:veridian-health.example filetype:pdf',
      2: 'site:veridian-health.example inurl:login OR intitle:admin',
      3: 'site:veridian-health.example intitle:"index of"',
      4: 'site:veridian-health.example filetype:env OR ext:bak',
      5: 'site:staging.veridian-health.example intext:"internal use only"'
    };
    Object.entries(dorks).forEach(([n,q]) => { window.goMission(+n); document.getElementById('dork'+n).value = q; window.checkObjective(+n); });
  },
  // page-context: one objective solved, the rest under-scoped/blank -> no certification.
  wrong: () => {
    window.goMission(1); document.getElementById('dork1').value = 'site:veridian-health.example filetype:pdf'; window.checkObjective(1);
    window.goMission(2); document.getElementById('dork2').value = 'filetype:pdf'; window.checkObjective(2);  // no site: scope
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
