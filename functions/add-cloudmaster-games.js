#!/usr/bin/env node
'use strict';
// Surface the CLOUD house's games on the Cloud Master hub's Games shelf.
//
// WHY CURATION AND NOT A PROJECTION FIX. The hub projects catalog content by CATEGORY only --
// _app/houses/hub/index.html:667 is `if (!m || !cats[m.category] || m.status !== 'available')`,
// with no house check anywhere. Every cloud game is correctly filed under category 'games', which
// no cloud-master child claims in catalogCategories, so ZERO games project. The one card on that
// shelf today is an OpenStack Jeopardy REVIEW, surfacing only because BUCKET maps review -> games.
//
// The one-line "fix" (add 'games' to a child's catalogCategories) drags 22 games from EIGHT other
// houses onto this hub -- Packet Invaders, Crypto Pong, Threat Swarm, Pod Crossing (code) -- because
// there is no house filter. That filter is deliberate: catalogCrossHouse:true is load-bearing on
// aws-ccp and azure-fundamentals, whose content lives under houses/cloud. House-scoping the
// projection is the correct architectural fix, it touches the SHARED renderer for every Firestore
// hub, and it needs its own review and its own before/after measurement. It is not a ride-along.
//
// Curated Firestore items render BEFORE the projection in the same section, so these 12 sit above
// the Jeopardy card. Dedup is by href, so nothing double-renders.
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'hexworth-prime' });
const db = admin.firestore();
const DOC = 'hubRegistry/cloud-master';
const APPLY = process.argv.includes('--apply');

// Derived from ContentCatalog: house 'cloud', category 'games', components including 'game',
// status 'available', de-duplicated by href. EVERY href below was verified to exist on disk before
// this file was written -- a card that 404s is worse than an absent one.
const ITEMS = [
  { title: "Don't Check the Bill",  href: '/houses/cloud/games/cloud-dont-check-the-bill.html',   icon: '/assets/images/icons/icon-cloud.webp' },
  { title: 'IAM Policy Debugger',   href: '/houses/cloud/games/cloud-iam-debugger.html',          icon: '/assets/images/icons/icon-key.webp' },
  { title: 'AD Attack Path',        href: '/houses/cloud/games/cloud-ad-attack-path.applet.html', icon: '/assets/images/icons/icon-detective.webp' },
  { title: 'Cloud Architect',       href: '/houses/cloud/games/cloud-architect.html',             icon: '/assets/images/icons/icon-building.webp' },
  { title: 'aws sts',               href: '/houses/cloud/games/cloud-aws-sts.html',               icon: '/assets/images/icons/icon-key.webp' },
  { title: 'whoami',                href: '/houses/cloud/games/cloud-text-adventure-whoami.html', icon: '/assets/images/icons/icon-scroll.webp' },
  { title: 'Cloud Hop',             href: '/houses/cloud/games/cloud-hop.applet.html',            icon: '/assets/images/icons/icon-cloud.webp' },
  { title: 'Cloud Hop: Vertical',   href: '/houses/cloud/games/cloud-hop-vertical.applet.html',   icon: '/assets/images/icons/icon-cloud.webp' },
  { title: 'Cloud Flap',            href: '/houses/cloud/games/cloud-flap.html',                  icon: '/assets/images/icons/icon-cloud.webp' },
  { title: 'Cloud Destroyer',       href: '/houses/cloud/games/cloud-destroyer.applet.html',      icon: '/assets/images/icons/icon-lightning.webp' },
  { title: "Don't Lose Your Domain",href: '/houses/cloud/games/cloud-dont-lose-your-domain.html', icon: '/assets/images/icons/icon-globe.webp' },
  { title: 'Pod Crossing',          href: '/houses/cloud/modules/wsa/games/cloud-save-the-pod.module.html', icon: '/assets/images/icons/icon-docker.webp' },
];

(async () => {
  const ref = db.doc(DOC);
  const snap = await ref.get();
  if (!snap.exists) { console.error('  ' + DOC + ' does not exist'); process.exit(1); }
  const data = snap.data() || {};
  const sections = data.sections || {};
  const before = Array.isArray(sections.games) ? sections.games : [];

  console.log('  doc            : ' + DOC);
  console.log('  games BEFORE   : ' + before.length);
  before.forEach(function (g) { console.log('      - ' + (g && g.title)); });

  // Additive and idempotent: keep anything already curated, add only hrefs not present.
  const have = {};
  before.forEach(function (g) { if (g && g.href) { have[g.href] = true; } });
  const add = ITEMS.filter(function (g) { return !have[g.href]; });
  const next = before.concat(add);

  console.log('  to ADD         : ' + add.length);
  add.forEach(function (g) { console.log('      + ' + g.title + '  ' + g.href); });
  console.log('  games AFTER    : ' + next.length);

  if (!APPLY) { console.log('\n  DRY RUN -- nothing written. Re-run with --apply to write.'); return; }
  await ref.update({ 'sections.games': next });
  const after = (await ref.get()).data().sections.games;
  console.log('\n  WROTE. games now: ' + after.length);
  if (after.length !== next.length) { console.error('  READBACK MISMATCH'); process.exit(1); }
  console.log('  readback verified.');
})().catch(function (e) { console.error('  FAILED: ' + e.message); process.exit(1); });
