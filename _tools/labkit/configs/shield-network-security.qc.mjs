/* QC config for the Network Segmentation Architect lab. The correct least-
   privilege ruleset must pass all 14 traffic flows; an over-permissive
   any-any ruleset must fail (no false certification). */
export default {
  lab: 'houses/shield/labs/shield-network-security.lab.html',
  moduleId: 'shield-network-lab',
  solveWaitMs: 12000,
  // page-context: load the correct 7-rule least-privilege ACL, then run the stress test.
  solve: () => { window.loadCorrectRuleset(); window.goStage(3); window.runStressTest(); },
  // page-context: load an over-permissive any-any rule, then run -> must fail several flows.
  wrong: () => { window.loadWrongRuleset(); window.goStage(3); window.runStressTest(); },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
