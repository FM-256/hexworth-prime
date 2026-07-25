// Generates the self-contained feature-preview HTML with the real screenshots inlined as data URIs.
const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '../../_docs/features/screenshots/tournament-broadcast');
const out = path.resolve(__dirname, 'tournament-broadcast-preview.html');
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(`${dir}/${f}`).toString('base64');

const IMG = {
  standings: b64('broadcast-1-standings.png'),
  race: b64('broadcast-2-race.png'),
  spotlight: b64('broadcast-3-spotlight.png'),
  podium: b64('podium.png'),
  lobby: b64('lobby.png'),
  panopticon: b64('panopticon-header.png'),
};

const shot = (src, tag, title, desc) => `
  <figure class="shot">
    <div class="frame"><img src="${src}" alt="${title}" loading="lazy"></div>
    <figcaption>
      <div class="cap-head"><span class="cap-tag">${tag}</span><h3>${title}</h3></div>
      <p>${desc}</p>
    </figcaption>
  </figure>`;

const step = (n, h, b) => `<li><span class="step-n">${n}</span><div><strong>${h}</strong><span>${b}</span></div></li>`;

const feat = (h, b) => `<div class="feat"><h4>${h}</h4><p>${b}</p></div>`;

const html = `<title>Tournament Broadcast — Feature Preview</title>
<style>
  :root{
    --void:#05060d; --panel:rgba(12,16,28,.72); --panel2:rgba(20,26,44,.55);
    --cyan:#22d3ee; --cyan-dim:rgba(34,211,238,.5); --violet:#8b5cf6; --up:#34e0a1; --gold:#f5c542;
    --text:#e9eef8; --dim:#8394ad; --faint:#5c6b86; --line:rgba(120,160,220,.14);
    --mono:ui-monospace,"JetBrains Mono","SF Mono",Menlo,Consolas,monospace;
    --sans:"Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--void);color:var(--text);font-family:var(--sans);line-height:1.6;-webkit-font-smoothing:antialiased;}
  body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
    background:
      radial-gradient(1100px 620px at 82% -8%, rgba(34,211,238,.07), transparent 60%),
      radial-gradient(820px 560px at 8% 108%, rgba(139,92,246,.08), transparent 60%),
      linear-gradient(rgba(120,160,220,.028) 1px, transparent 1px) 0 0/100% 48px,
      linear-gradient(90deg, rgba(120,160,220,.028) 1px, transparent 1px) 0 0/48px 100%;}
  .wrap{position:relative;z-index:1;max-width:1060px;margin:0 auto;padding:64px 26px 90px;}

  .eyebrow{font-family:var(--mono);font-size:.72rem;letter-spacing:.32em;text-transform:uppercase;color:var(--cyan);display:flex;align-items:center;gap:12px;}
  .eyebrow::before{content:"";width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,var(--cyan),var(--violet));display:inline-block;
    -webkit-mask:linear-gradient(#000,#000);}
  .mark{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,var(--cyan),var(--violet));display:grid;place-items:center;font-family:var(--mono);font-weight:800;font-size:.62rem;color:#04060b;}
  h1{font-size:clamp(2.4rem,6vw,3.6rem);line-height:1.02;margin:20px 0 12px;font-weight:800;letter-spacing:-.01em;text-wrap:balance;}
  h1 .live{font-family:var(--mono);font-size:.9rem;font-weight:700;letter-spacing:.16em;color:var(--up);border:1px solid rgba(52,224,161,.4);background:rgba(52,224,161,.08);border-radius:999px;padding:5px 12px;vertical-align:middle;margin-left:14px;}
  .lede{font-size:1.28rem;color:var(--dim);max-width:60ch;margin:0 0 22px;}
  .note{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:.74rem;color:var(--faint);border:1px solid var(--line);border-radius:8px;padding:8px 13px;}
  .note b{color:var(--dim);font-weight:600;}

  .rule{height:1px;background:var(--line);margin:52px 0;}
  h2{font-family:var(--mono);font-size:.78rem;letter-spacing:.26em;text-transform:uppercase;color:var(--dim);margin:0 0 26px;display:flex;align-items:center;gap:14px;}
  h2::after{content:"";flex:1;height:1px;background:var(--line);}

  .shot{margin:0 0 46px;}
  .frame{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#04070c;box-shadow:0 24px 60px -30px rgba(0,0,0,.9),0 0 0 1px rgba(34,211,238,.04) inset;}
  .frame img{display:block;width:100%;height:auto;}
  figcaption{padding:18px 4px 0;}
  .cap-head{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;}
  .cap-tag{font-family:var(--mono);font-size:.6rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#04060b;background:var(--cyan);border-radius:5px;padding:3px 9px;flex:none;}
  figcaption h3{margin:0;font-size:1.3rem;font-weight:700;}
  figcaption p{margin:8px 0 0;color:var(--dim);max-width:72ch;}
  figcaption p b{color:var(--text);font-weight:600;}
  .demo{color:var(--up);font-weight:600;}

  ol.steps{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:16px;}
  ol.steps li{display:flex;gap:16px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:16px 18px;}
  .step-n{font-family:var(--mono);font-weight:800;font-size:1.05rem;color:var(--cyan);width:34px;height:34px;flex:none;display:grid;place-items:center;border:1px solid var(--cyan-dim);border-radius:9px;background:rgba(34,211,238,.06);}
  ol.steps strong{display:block;font-size:1.05rem;margin-bottom:2px;}
  ol.steps span{color:var(--dim);}
  code{font-family:var(--mono);font-size:.86em;color:var(--cyan);background:rgba(34,211,238,.08);border:1px solid var(--line);border-radius:5px;padding:1px 7px;}

  .feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;}
  .feat{border:1px solid var(--line);border-left:3px solid var(--violet);border-radius:11px;background:var(--panel2);padding:18px 20px;}
  .feat h4{margin:0 0 7px;font-size:1.02rem;font-weight:700;}
  .feat p{margin:0;color:var(--dim);font-size:.96rem;}

  footer{margin-top:60px;padding-top:24px;border-top:1px solid var(--line);color:var(--faint);font-size:.9rem;}
  footer .mono{font-family:var(--mono);font-size:.8rem;}
  @media (max-width:640px){ .wrap{padding:44px 18px 70px;} figcaption h3{font-size:1.15rem;} }
</style>

<div class="wrap">

  <div class="eyebrow"><span class="mark">HX</span> Hexworth Prime · CTF Arena</div>
  <h1>Tournament Broadcast <span class="live">LIVE</span></h1>
  <p class="lede">The zero-scroll big-screen channel for live CTF events. Pick a tournament, and it takes over the projector, auto-rotating standings, the race, and team spotlights. No mouse, no scrolling.</p>
  <div class="note"><b>Preview note:</b>&nbsp;these are real screenshots of the shipped page, rendered with sample tournament data (no live event required).</div>

  <div class="rule"></div>
  <h2>What it looks like</h2>

  ${shot(IMG.standings, 'Scene 1', 'Standings board',
    'The full leaderboard: rank, team color, score, solves, and last-solve time, with a live countdown and a solve ticker crawling along the bottom. <span class="demo">Note Cyan Storm and Red Cell tied at 4200</span> — Red Cell carries the <b>TIE-BREAK</b> tag because Cyan reached the score first (the canonical rule that keeps trophies and credentials correct).')}

  ${shot(IMG.race, 'Scene 2', 'The Race',
    'A NASCAR/golf-style gap read: each team as a bar scaled to the leader, so who is catching whom is legible from across the room. The operator control strip has auto-dimmed for projection.')}

  ${shot(IMG.spotlight, 'Scene 3', 'Team Spotlight',
    'Rotates through each team: rank, name, score, roster, and recent captures. <span class="demo">Rosters show as "Alex R.", "Sam C."</span> — first name + last initial only, since this is a public URL and competitors may be minors.')}

  ${shot(IMG.podium, 'Companion page', 'Live Podium',
    'The existing student-facing podium (gold / silver / bronze + full table), also driven by the same canonical ranking. Reachable from the broadcast, or on its own screen.')}

  ${shot(IMG.lobby, 'Companion page', 'Registration Lobby',
    'Where competitors pick a team before the event: team cards with rosters and join buttons, the challenge list, and live tournament stats. The same hardening applies — legit team ids render join buttons, crafted ones do not.')}

  <div class="rule"></div>
  <h2>How to run it</h2>
  <figure class="shot"><div class="frame"><img src="${IMG.panopticon}" alt="Panopticon header with the Big Screen link"></div><figcaption><p>The entry point lives in the Panopticon header: the accent <b>[ Big Screen ]</b> link (kept distinct from the page's own "Go Live" screen-share button).</p></figcaption></figure>
  <ol class="steps">
    ${step('1','Open the Panopticon','From the CTF Arena, open the Panopticon (the internal stream gallery).')}
    ${step('2','Click <span style="color:#22d3ee">[ Big Screen ]</span>','The accent link in the header opens the broadcast. (Labeled "Big Screen" so it is not confused with the "Go Live" screen-share button.)')}
    ${step('3','Pick a tournament','Choose the event from the dropdown at the top. It auto-selects a live event if there is one.')}
    ${step('4','Go Fullscreen and walk away','Hit Fullscreen, point the projector at it. The director rotates the scenes on its own; the control strip fades out. Direct URL: <code>/arena/broadcast.html</code>')}
  </ol>

  <div class="rule"></div>
  <h2>What is built in</h2>
  <div class="feats">
    ${feat('Zero-scroll director','Scenes auto-rotate (Standings → Race → Spotlight per team) with smooth crossfades. Nobody touches a mouse during the event.')}
    ${feat('Hard scoreboard freeze','When the event freezes for the final stretch, the board locks to where it stood and reveals the true finish at the end, so the projection cannot leak the ending.')}
    ${feat('Roster privacy','Player names show as first-name + last-initial, with email fallbacks redacted, safe for a public, projected screen.')}
    ${feat('Correct standings','Ranking uses the canonical tie-break (score, then who reached it first), the same rule that feeds trophies and credentials.')}
    ${feat('Hardened + safe','The tournament pages were hardened against crafted-team-field injection; flags are never shown; all data is escaped or coerced before display.')}
    ${feat('Live, no setup','Reads the live tournament straight from the platform. No build step, no export, open the page and it is current.')}
  </div>

  <footer>
    <p>Shipped and live at <span class="mono">hexworth.com/arena/broadcast.html</span> · reachable from the Panopticon via <span class="mono">[ Big Screen ]</span>.</p>
    <p class="mono">Screenshots are genuine renders of the shipped page with representative sample data — team names and figures are illustrative, not a real event.</p>
  </footer>

</div>`;

fs.writeFileSync(out, html);
console.log('wrote', out, '(' + Math.round(html.length/1024) + ' KB)');
