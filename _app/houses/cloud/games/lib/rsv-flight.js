/**
 * rsv-flight.js: the Remote Service Vehicle flight model, mission-agnostic.
 *
 * LAGRANGE EDGE / House of Cloud.
 *
 * WHY THIS EXISTS. cloud-cold-horizon.html was 2,381 lines with the flight model tangled into
 * 116 references to mission 1's specific content (HELIOS-7, TH-1/2/3, radiator panels). A
 * second flying mission would have started by copy-pasting all of it, which the box's own
 * engineering note warned about at n=1: "extract it BEFORE mission 2, not after four copies
 * exist." lib/orbital-scene.js already took the scenery. This takes the flying.
 *
 * WHAT IS GENERIC AND LIVES HERE
 *   - the ship: position, velocity, attitude, fuel, hull
 *   - TELEOPERATION LATENCY, which is the whole point of the world. A keypress does not thrust
 *     the vehicle; it stamps a command for a future tick. Nothing here is interactive, because
 *     ASTRAEA-9 is 326,000 km away and every console shows the past.
 *   - pointer-lock mouse-look, keyboard translation, the [X] kill-relative-velocity burn
 *   - Newtonian integration with NO drag, sphere collision with an inelastic bounce
 *   - the NO-BRICK automated recall: a player who strands themselves gets tugged home
 *
 * WHAT STAYS WITH THE MISSION, and is passed in
 *   - the station geometry and therefore the collision spheres (`obstacles`)
 *   - every HUD element and every line the mission AI speaks (`on*` callbacks)
 *   - what a key other than movement does (`onKey`)
 *   - whether the mission is running at all (`isRunning`)
 *
 * PROVENANCE: EXTRAPOLATED. The vehicle, its thrust figures and its fuel budget are plausible
 * for a cislunar service vehicle and are not any real spacecraft. The LATENCY is REAL: light
 * takes ~1.09 s each way at this range, and the four-tick command delay is that constraint
 * expressed as a control scheme.
 *
 * USAGE
 *   const rsv = createRSV({ THREE, cfg: CFG, camera, renderer,
 *       isRunning: () => state.running,
 *       obstacles: () => [origin, ...NODES.map(n => n.pos)],
 *       audio, onDamage, onRecallStart, onRecallEnd, onKey });
 *   rsv.issueCommands(now);  rsv.stepShip(dt, now);
 */

export function createRSV(opts) {
    const THREE = opts.THREE;
    const cfg = opts.cfg;
    const camera = opts.camera;
    const renderer = opts.renderer;
    const audio = opts.audio || {};
    const isRunning = opts.isRunning || (() => true);
    const obstacles = opts.obstacles || (() => []);
    const noop = () => {};
    const onDamage = opts.onDamage || noop;          // (amount, hull) -> mission decides death
    const onRecallStart = opts.onRecallStart || noop;
    const onRecallEnd = opts.onRecallEnd || noop;
    const onKey = opts.onKey || noop;                // (key, event) -> mission-specific bindings

    const ship = {
        pos: (opts.spawn && opts.spawn.clone()) || new THREE.Vector3(-118, 26, 96),
        vel: (opts.spawnVel && opts.spawnVel.clone()) || new THREE.Vector3(0.9, -0.22, -0.75),
        yaw: 0, pitch: 0,
        fuel: cfg.maxFuel,
        hull: 100,
    };
    // Point the RSV at the station on spawn, so the first thing an operator sees is the target.
    {
        const d = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), ship.pos).normalize();
        ship.yaw = Math.atan2(-d.x, -d.z);
        ship.pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
    }

    const keys = Object.create(null);
    const cmdQueue = [];              // { at:ms, vec:Vector3, boost:bool } | { at:ms, kill:true }
    let linkTicks = cfg.baseTicks;    // grows as a mission degrades the link
    let thrustLevel = 0;              // 0..1, drives audio and exhaust
    let recalling = false;

    /* ── LISTENERS, NAMED SO THEY CAN BE REMOVED ─────────────────────────────────────
       These were anonymous, and createRSV returned no teardown. Safe while every mission is
       its own page, because navigation forces a reload and the factory runs once per page
       life. But this module exists so a SECOND flying mission is a config rather than a copy,
       and the moment one mounts without a full reload the listeners stack: thrust applies
       twice per key, [X] queues two cancel burns, every command double-pushes. Taskboard #307,
       raised by Nancy on the extraction review, closed here before anything trips over it.

       An anonymous handler cannot be removed, so each is a named reference. */
    const onKeyDown = e => {
        const k = e.key.toLowerCase();
        keys[k] = true;
        if (k === ' ') e.preventDefault();
        if (k === 'x') killRel();
        onKey(k, e);                  // everything else belongs to the mission
    };
    const onKeyUp = e => { keys[e.key.toLowerCase()] = false; };
    // Losing focus mid-burn would otherwise leave a key stuck down and the vehicle thrusting
    // away from the station with nobody at the controls.
    const onBlur = () => { for (const k in keys) keys[k] = false; };

    /* requestPointerLock returns a promise in current browsers and REJECTS when the call is not
       tied to a user gesture. Unguarded that surfaces as an uncaught page error, so it is
       swallowed here: losing pointer lock is a degraded control scheme, not a crash. */
    function grabPointer() {
        try {
            const p = renderer.domElement.requestPointerLock();
            if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (e) { /* pointer lock unavailable; mouse-look simply stays unlocked */ }
    }
    const onClick = () => {
        if (isRunning() && !document.pointerLockElement) grabPointer();
    };
    const onMouseMove = e => {
        if (document.pointerLockElement !== renderer.domElement) return;
        ship.yaw -= e.movementX * 0.0021;
        ship.pitch -= e.movementY * 0.0021;
        ship.pitch = THREE.MathUtils.clamp(ship.pitch, -1.52, 1.52);
    };

    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    addEventListener('blur', onBlur);
    addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    /** Remove every listener this instance registered. Idempotent: calling it twice is a
        no-op rather than an error, because a caller unmounting defensively should not have to
        track whether it already did. After destroy the instance is inert, and stepShip on a
        destroyed instance simply moves a vehicle nobody is steering. */
    let destroyed = false;
    function destroy() {
        if (destroyed) return;
        destroyed = true;
        removeEventListener('keydown', onKeyDown);
        removeEventListener('keyup', onKeyUp);
        removeEventListener('blur', onBlur);
        removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
        for (const k in keys) keys[k] = false;   // never leave a key stuck down
    }

    /** Body-relative basis from yaw/pitch. */
    function basis() {
        const q = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(ship.pitch, ship.yaw, 0, 'YXZ'));
        return {
            fwd: new THREE.Vector3(0, 0, -1).applyQuaternion(q),
            right: new THREE.Vector3(1, 0, 0).applyQuaternion(q),
            up: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
            q
        };
    }

    /** Reads the keyboard and stamps a command for FUTURE execution. The delay is the lesson. */
    function issueCommands(now) {
        if (!isRunning()) return;
        const v = new THREE.Vector3();
        if (keys['w']) v.z -= 1;
        if (keys['s']) v.z += 1;
        if (keys['a']) v.x -= 1;
        if (keys['d']) v.x += 1;
        if (keys[' ']) v.y += 1;
        if (keys['control']) v.y -= 1;
        if (v.lengthSq() === 0) return;
        if (ship.fuel <= 0) return;
        cmdQueue.push({ at: now + linkTicks * cfg.tickMs, vec: v.normalize(),
                        boost: !!keys['shift'] });
    }

    /* "Kill relative velocity": one queued burn that cancels current drift. The NO-BRICK safety
       valve, and deliberately NOT fuel-gated, because stopping is a safety function. */
    function killRel() {
        if (!isRunning()) return;
        if (ship.vel.lengthSq() < 1e-6) return;
        if (audio.blip) audio.blip(520, 0.09, 'square', 0.1);
        cmdQueue.push({ at: performance.now() + linkTicks * cfg.tickMs, kill: true });
    }

    function damage(amount) {
        ship.hull = Math.max(0, ship.hull - amount);
        if (audio.hull) audio.hull();
        onDamage(amount, ship.hull);
    }

    function stepShip(dt, now) {
        // --- apply any commands that have arrived
        let applied = null;
        while (cmdQueue.length && cmdQueue[0].at <= now) {
            const c = cmdQueue.shift();
            if (c.kill) {
                const dv = ship.vel.clone().multiplyScalar(-1);
                const max = cfg.thrust * 0.85;
                if (dv.length() > max) dv.setLength(max);
                ship.vel.add(dv);
                ship.fuel = Math.max(0, ship.fuel - dv.length() * 1.4);
                continue;
            }
            applied = c;
        }
        if (applied && ship.fuel > 0) {
            const b = basis();
            const a = new THREE.Vector3()
                .addScaledVector(b.right, applied.vec.x)
                .addScaledVector(b.up, applied.vec.y)
                .addScaledVector(b.fwd, -applied.vec.z);
            const mul = cfg.thrust * (applied.boost ? cfg.boostMul : 1);
            ship.vel.addScaledVector(a.normalize(), mul * dt);
            ship.fuel = Math.max(0, ship.fuel - cfg.fuelPerSec * (applied.boost ? 2.1 : 1) * dt);
            thrustLevel = Math.min(1, thrustLevel + dt * 7);
        } else {
            thrustLevel = Math.max(0, thrustLevel - dt * 3.4);
        }

        /* AUTOMATED RECALL. NO-BRICK RULE (canon): no player action may render the mission
           unplayable. Burning all propellant escaping the station would otherwise strand the
           vehicle, [X] still stops the drift because that is not fuel-gated, but with nothing
           left there is no way back. The Terran MOC holds "dock or recall a service vehicle"
           as a standing capability, so an exhausted RSV is tugged home on ground authority.
           Costs the player time and pride, not the run. */
        const rangeNow = ship.pos.length();
        if (ship.fuel <= 0.5 && rangeNow > cfg.approachRange) {
            if (!recalling) { recalling = true; onRecallStart(); }
            const home = ship.pos.clone().multiplyScalar(-1).normalize().multiplyScalar(7.5);
            ship.vel.lerp(home, Math.min(1, dt * 0.55));
        } else if (recalling && rangeNow <= cfg.approachRange) {
            recalling = false;
            ship.fuel = 32;                    // re-serviced at the berth
            ship.vel.multiplyScalar(0.12);
            onRecallEnd();
        }

        // --- no drag in vacuum. Position integrates, full stop.
        ship.pos.addScaledVector(ship.vel, dt);

        /* --- collision: the station is a set of spheres. Bouncing rather than stopping keeps
               it forgiving, and only a real closing speed does damage. */
        const hitR = 6.0;
        for (const c of obstacles()) {
            const d = ship.pos.distanceTo(c);
            const r = (c.lengthSq() === 0) ? 4.2 : hitR;
            if (d < r) {
                const n = new THREE.Vector3().subVectors(ship.pos, c).normalize();
                ship.pos.copy(c).addScaledVector(n, r + 0.05);
                const vn = ship.vel.dot(n);
                if (vn < 0) {
                    ship.vel.addScaledVector(n, -vn * 1.55);
                    if (-vn > 1.4) damage(Math.min(cfg.collideDmg, (-vn) * 5));
                }
            }
        }

        // --- the camera IS the RSV's optics. Never a cut, never a third-person view.
        const b = basis();
        camera.position.copy(ship.pos);
        camera.quaternion.copy(b.q);

        if (audio.thrust) audio.thrust(thrustLevel);
    }

    return {
        ship, keys, cmdQueue, basis, issueCommands, killRel, stepShip, grabPointer, damage,
        destroy,
        get thrustLevel() { return thrustLevel; },
        get recalling() { return recalling; },
        get linkTicks() { return linkTicks; },
        /** Missions degrade the link as the story progresses; the flight model just obeys. */
        setLinkTicks(t) { linkTicks = Math.max(0, t | 0); },
    };
}
