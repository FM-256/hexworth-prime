/* QC config for the Steganography & Hidden Data lab. Embeds a secret, extracts
   it (round trip), detects the payload image, and answers the vocab capstone -> certifies.
   The wrong path sets the vocab wrong and leaves missions undone (no false pass). */
export default {
  lab: 'houses/shield/labs/shield-hash.lab.html',
  moduleId: 'shield-hash-lab',
  solveWaitMs: 2500,
  // page-context: real LSB embed+extract, payload detection, then vocab capstone.
  solve: async () => {
    document.getElementById('m1secret').value = 'QC TEST MESSAGE 12345'; window.m1embed();
    window.goMission(2); await new Promise(r=>setTimeout(r,80)); window.m2extract();
    window.goMission(3); await new Promise(r=>setTimeout(r,80)); await window.m3computeHashes();
    // m3payloadImage is a module-local (not on window); try both - the correct pick completes M3.
    window.m3pick('A'); window.m3submitVerdict(); window.m3pick('B'); window.m3submitVerdict();
    window.goMission(4); await new Promise(r=>setTimeout(r,80));
    const vocab = { 'sel-stego':'hide-existence','sel-crypto':'hide-content','sel-obfusc':'make-unclear',
      'sel-carrier':'host-file','sel-payload':'hidden-data','sel-steganalysis':'detect-payload' };
    Object.entries(vocab).forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.value=v; });
    window.m4check();
  },
  // page-context: embed only, then submit deliberately-wrong vocab -> not certified.
  wrong: () => {
    document.getElementById('m1secret').value = 'x'; window.m1embed();
    window.goMission(4);
    ['sel-stego','sel-crypto','sel-obfusc','sel-carrier','sel-payload','sel-steganalysis']
      .forEach(id=>{ const el=document.getElementById(id); if(el) el.value='hide-content'; });
    window.m4check();
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
