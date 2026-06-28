/* QC config for the Incident Response Command lab. Sets each stage to its
   ground-truth key to certify; the wrong path scrambles the lifecycle order
   so stage 1 fails (no false certification). Completion uses
   ModuleProgress.complete('shield','ir-forensics-lab',...) -> the harness
   normalises that to moduleId-first. */
export default {
  lab: 'houses/shield/labs/shield-ir-forensics.lab.html',
  moduleId: 'ir-forensics-lab',
  solveWaitMs: 2500,
  // page-context: the check fns read DOM order, so reorder each pool to its key,
  // set the decision selections, and grade all three stages -> certifies.
  solve: () => {
    const order = (poolId, sel, ids) => { const pool=document.getElementById(poolId);
      ids.forEach(id => { const el=pool.querySelector(sel+'[data-id="'+id+'"]'); if(el) pool.appendChild(el); }); };
    order('lifecyclePool', '.phase-slot', window.LIFECYCLE_KEY); window.checkLifecycle();
    window.dpSelections = window.DECISIONS.reduce((o,d,i)=>{ o[i]=d.correctIdx; return o; }, {}); window.checkDecisions();
    order('timelinePool', '.tl-card', window.TIMELINE_KEY); window.checkTimeline();
  },
  // page-context: reorder the lifecycle pool to the REVERSED key -> stage 1 fails -> no certification.
  wrong: () => {
    const pool=document.getElementById('lifecyclePool');
    [...window.LIFECYCLE_KEY].reverse().forEach(id => { const el=pool.querySelector('.phase-slot[data-id="'+id+'"]'); if(el) pool.appendChild(el); });
    window.checkLifecycle();
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
