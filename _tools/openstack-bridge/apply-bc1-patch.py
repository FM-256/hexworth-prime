#!/usr/bin/env python3
"""
Stage 3 bc1 lab-manager patch: per-student cloud credentials for the openstack-cli lab.

Run ON bc1:  python3 apply-bc1-patch.py ~/hexworth-sandbox/lab-manager/server.js
Then:        node --check server.js && docker compose build lab-manager && docker compose up -d lab-manager

Every replacement asserts exactly-one occurrence (the BUG-052 fix discipline): if bc1's
server.js has drifted from what this patch was written against, it stops rather than
guessing. Archive-first: writes server.js.pre-stage3.<ts> beside the target.

What it adds (design: _docs/architecture/openstack-identity-bridge.md RESOLUTIONS):
 1. Claim call on openstack-cli launches: forwards the student's OWN Firebase ID token to
    the bc2 claim service (bridge verifies it independently -- a leaked bc1 secret alone
    mints nothing). On success the container gets a per-student clouds.yaml (restricted
    app credential, member role on their sticky student-NN project). On CLOUD_FULL the
    launch is refused with a clear message. On any other bridge failure the launch
    FALLS BACK to the baked read-only clouds.yaml (lab still works, telescope mode) and
    says so in the response -- degraded, never broken, never silent.
 2. Labels hexworth.oscred / hexworth.osslot on the container (durable truth).
 3. Credential deletion on destroy AND on both cleanup paths (expired sessions, orphans).
 4. Reconcile sweep at the end of cleanupOrphans: active labeled cred ids -> bridge
    deletes every pool app cred not in the set. Restart-safe by construction.

Config (add to bc1 hexworth-sandbox/.env, and compose must pass them through):
  OS_BRIDGE_URL=http://100.125.36.2:9711
  OS_BRIDGE_SECRET=<contents of bc2 ~/openstack-stage1/bridge-secret>
"""
import sys, time, os

TARGET = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/hexworth-sandbox/lab-manager/server.js')
src = open(TARGET).read()
orig = src


def swap(old, new, why):
    global src
    n = src.count(old)
    assert n == 1, f"DRIFT: expected exactly 1 occurrence for [{why}], found {n}. Patch aborted, file untouched."
    src = src.replace(old, new)


# ── 1. Bridge config + helpers, anchored right after the free-play config block ──
swap(
    "const FREE_PLAY_LABS = new Set(['linux-sandbox', 'openstack-cli']);",
    """const FREE_PLAY_LABS = new Set(['linux-sandbox', 'openstack-cli']);

// ── OpenStack Stage 3 bridge (per-student cloud credentials) ────────────────
// The claim service on bc2 verifies the student's Firebase ID token ITSELF
// (public JWKS) and holds all Keystone admin material; this host only relays.
const OS_BRIDGE_URL = process.env.OS_BRIDGE_URL || '';
const OS_BRIDGE_SECRET = process.env.OS_BRIDGE_SECRET || '';

async function bridgeCall(method, path, body) {
  const resp = await fetch(OS_BRIDGE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': OS_BRIDGE_SECRET },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let data = null;
  try { data = await resp.json(); } catch { /* non-JSON error body */ }
  return { status: resp.status, data };
}

function personalCloudsYaml(claim) {
  // v3applicationcredential: no username/password in the container at all.
  return `clouds:
  demo:
    auth_type: v3applicationcredential
    auth:
      auth_url: http://100.125.36.2:8080/identity
      application_credential_id: ${claim.cred_id}
      application_credential_secret: ${claim.cred_secret}
    region_name: RegionOne
    interface: public
    identity_api_version: 3
    compute_endpoint_override: http://100.125.36.2:8080/compute/v2.1
    network_endpoint_override: http://100.125.36.2:8080/networking
    image_endpoint_override: http://100.125.36.2:8080/image
    volumev3_endpoint_override: http://100.125.36.2:8080/volume/v3
    placement_endpoint_override: http://100.125.36.2:8080/placement
`;
}

async function deleteBridgeCred(slot, credId, why) {
  if (!OS_BRIDGE_URL || !slot || !credId) return;
  try {
    await bridgeCall('DELETE', '/cred', { slot, cred_id: credId });
    console.log(`[bridge] deleted cred ${credId} (${slot}) on ${why}`);
  } catch (e) {
    // Reconcile sweep is the backstop; a miss here is not silent loss.
    console.warn(`[bridge] cred delete failed (${why}), reconcile will catch it:`, e.message);
  }
}
""",
    'bridge config block')

# ── 2. Claim on launch: runs before createContainer for openstack-cli ──
swap(
    """  const lab = LABS[labId];
  const sessionId = nanoid(12);
  const containerName = `sandbox-${sessionId}`;
""",
    """  const lab = LABS[labId];
  const sessionId = nanoid(12);
  const containerName = `sandbox-${sessionId}`;

  // ── Stage 3: personal cloud claim for the openstack lab ──
  // claim=null -> baked read-only clouds.yaml (telescope mode), which is the
  // degraded-but-working fallback, stated in the response, never silent.
  let osClaim = null;
  let osCloudMode = 'read-only';
  if (labId === 'openstack-cli' && OS_BRIDGE_URL) {
    try {
      const idToken = (req.headers.authorization || '').split('Bearer ')[1] || '';
      const r = await bridgeCall('POST', '/claim', { uid, id_token: idToken });
      if (r.status === 200 && r.data && r.data.cred_id) {
        osClaim = r.data;
        osCloudMode = 'personal';
      } else if (r.status === 503) {
        // Headroom guard / pool exhausted: refuse CLEARLY rather than letting Nova
        // fail later with an error identical to the seeded troubleshooting lab.
        return res.status(503).json({
          error: 'The cloud is at capacity right now. Try again shortly.',
          code: (r.data && r.data.error) || 'CLOUD_FULL',
        });
      } else {
        console.warn(`[bridge] claim failed (${r.status}):`, r.data && r.data.error);
      }
    } catch (e) {
      console.warn('[bridge] claim unreachable, falling back to read-only:', e.message);
    }
  }
""",
    'claim on launch')

# ── 3. Labels: durable cred truth on the container ──
swap(
    """        'hexworth.session': sessionId,
        'hexworth.created': new Date().toISOString(),""",
    """        'hexworth.session': sessionId,
        'hexworth.created': new Date().toISOString(),
        // Stage 3: the app-cred id/slot live HERE (not only in the session Map) so a
        // lab-manager restart can still reconcile and delete them (Nancy gap 2).
        'hexworth.oscred': osClaim ? osClaim.cred_id : '',
        'hexworth.osslot': osClaim ? osClaim.slot : '',""",
    'oscred labels')

# ── 4. Inject personal clouds.yaml after start, before readiness gate ──
swap(
    """    // Connect to sandbox network
    const network = docker.getNetwork(NETWORK);
    await container.start();
""",
    """    // Connect to sandbox network
    const network = docker.getNetwork(NETWORK);
    await container.start();

    // Stage 3: overwrite the baked read-only clouds.yaml with the personal one.
    // Root exec (image runs as student); file is readable by the student -- it is
    // THEIR scoped, restricted, session-lifetime credential (an improvement over the
    // baked file, which exposes the SHARED read-only password to every student).
    if (osClaim) {
      try {
        const yaml = personalCloudsYaml(osClaim);
        const ex = await container.exec({
          Cmd: ['sh', '-c', 'cat > /etc/openstack/clouds.yaml'],
          User: 'root', AttachStdin: true, AttachStdout: true, AttachStderr: true,
        });
        const stream = await ex.start({ hijack: true, stdin: true });
        stream.write(yaml); stream.end();
        await new Promise((resolve) => { stream.on('close', resolve); stream.on('end', resolve); setTimeout(resolve, 3000); });
        console.log(`[bridge] personal cloud injected: ${uid} -> ${osClaim.slot}`);
      } catch (e) {
        // Injection failed: the baked read-only file is still in place, so the lab
        // degrades to telescope mode. Free the minted cred rather than leaking it.
        console.warn('[bridge] clouds.yaml inject failed, session stays read-only:', e.message);
        await deleteBridgeCred(osClaim.slot, osClaim.cred_id, 'inject-failure');
        osClaim = null; osCloudMode = 'read-only';
      }
    }
""",
    'clouds.yaml injection')

# ── 5. Session record carries cred for the destroy path ──
swap(
    """    sessions.set(sessionId, {
      containerId: container.id,
      uid,
      labId,
      mission: missionId || undefined,
      createdAt: Date.now(),
    });""",
    """    sessions.set(sessionId, {
      containerId: container.id,
      uid,
      labId,
      mission: missionId || undefined,
      createdAt: Date.now(),
      osCred: osClaim ? { slot: osClaim.slot, credId: osClaim.cred_id } : undefined,
    });""",
    'session osCred')

# ── 6. Launch response says which cloud mode the student got ──
swap(
    """    res.json({
      sessionId,
      url: `https://${DOMAIN}/s/${sessionId}/`,
      status: 'running',
      lab: lab.name,
      ready,
    });""",
    """    res.json({
      sessionId,
      url: `https://${DOMAIN}/s/${sessionId}/`,
      status: 'running',
      lab: lab.name,
      ready,
      // openstack-cli only: 'personal' (own project, writable within quota) or
      // 'read-only' (shared telescope). Other labs omit it.
      ...(labId === 'openstack-cli' ? { cloudMode: osCloudMode, cloudSlot: osClaim ? osClaim.slot : null } : {}),
    });""",
    'launch response cloudMode')

# ── 7. Destroy deletes the cred ──
swap(
    """    sessions.delete(sessionId);
    console.log(`[destroy] ${session.uid} → ${session.labId} → ${sessionId}`);""",
    """    sessions.delete(sessionId);
    if (session.osCred) { await deleteBridgeCred(session.osCred.slot, session.osCred.credId, 'destroy'); }
    console.log(`[destroy] ${session.uid} → ${session.labId} → ${sessionId}`);""",
    'destroy cred delete')

# ── 8. Expired-session cleanup deletes the cred ──
swap(
    """      } catch { /* container already gone */ }
      sessions.delete(sessionId);
    }
  }""",
    """      } catch { /* container already gone */ }
      sessions.delete(sessionId);
      if (session.osCred) { await deleteBridgeCred(session.osCred.slot, session.osCred.credId, 'expiry'); }
    }
  }""",
    'expiry cred delete')

# ── 9. Orphan cleanup deletes the labeled cred + reconcile sweep ──
swap(
    """      if (!sessions.has(sessionId)) {
        console.log(`[cleanup] Removing orphaned container ${info.Names[0]}`);
        const container = docker.getContainer(info.Id);
        try { await container.stop({ t: 5 }); } catch { /* ok */ }
        try { await container.remove({ force: true }); } catch { /* ok */ }
      }
    }
  } catch (err) {
    console.error('[cleanup-error]', err.message);
  }
}""",
    """      if (!sessions.has(sessionId)) {
        console.log(`[cleanup] Removing orphaned container ${info.Names[0]}`);
        const container = docker.getContainer(info.Id);
        try { await container.stop({ t: 5 }); } catch { /* ok */ }
        try { await container.remove({ force: true }); } catch { /* ok */ }
        const oc = info.Labels['hexworth.oscred'], os = info.Labels['hexworth.osslot'];
        if (oc && os) { await deleteBridgeCred(os, oc, 'orphan'); }
      }
    }
  } catch (err) {
    console.error('[cleanup-error]', err.message);
  }

  // Stage 3 reconcile: the containers are the truth. Every app cred on the pool that
  // no LIVE container is labeled with gets deleted bridge-side. This is what makes a
  // lab-manager restart lose nothing (Nancy gap 2: truth on containers + Keystone,
  // never only in the in-memory Map).
  if (OS_BRIDGE_URL) {
    try {
      const live = await docker.listContainers({ filters: { label: ['hexworth.sandbox=true'] } });
      const active = live.map((c) => c.Labels['hexworth.oscred']).filter(Boolean);
      const r = await bridgeCall('POST', '/reconcile', { active });
      if (r.data && r.data.deleted) { console.log(`[bridge] reconcile deleted ${r.data.deleted} stray cred(s)`); }
    } catch (e) {
      console.warn('[bridge] reconcile failed (will retry next sweep):', e.message);
    }
  }
}""",
    'orphan cred delete + reconcile')

ts = int(time.time())
backup = f'{TARGET}.pre-stage3.{ts}'
open(backup, 'w').write(orig)
open(TARGET, 'w').write(src)
print(f'patched {TARGET} (9 replacements), backup at {backup}')
print('next: node --check server.js && docker compose build lab-manager && docker compose up -d lab-manager')
