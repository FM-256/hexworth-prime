/* ═══════════════════════════════════════════════════════════════════════════
   LAGRANGE EDGE — HELD MISSION PAYLOAD (Act I missions 2-3, MVP-1 mission 4)
   ═══════════════════════════════════════════════════════════════════════════
   SEPARATE FILE ON PURPOSE, and the reason is a real finding rather than tidiness.

   These missions are held from launch: z1 is locked and gateway.html is excluded
   from hosting. That containment was HALF REAL. config-shared.js is loaded by
   index.html and telemetry.html, both of which DO ship, so every word of these
   missions -- the evidence, the traps, the hint text, the answers they lead to --
   would have been one curl away from production the moment deploy.sh ran.
   Locking the door while leaving the script on the doorstep.

   Found by adversarial review, not by a passing test suite; the suites were green
   throughout because they only ever asked whether the ENTRY POINT was reachable.

   So the payload lives here, this file carries the same firebase.json ignore as
   gateway.html, and only gateway.html loads it. Ship the two together, or neither.
   ═══════════════════════════════════════════════════════════════════════════ */

const ColdHorizonMissions = {

        /* ── MISSION 2 — GHOST SESSION ──────────────────────────────────────
           A maintenance command reached ASTRAEA-9 from a Terran operator
           session while HELIOS-7's channels were diverging. Was it legitimate?

           THE TRAP, and it is the same trap in a new coat: the session token
           and the SSO audit log agree, and they are the same source. The
           identity provider vouching for its own token is one voice, not two.

           THE CANON OUTPUT IS "COMPROMISED BUT INCONCLUSIVE" and the design
           has to actually earn the second word. The physical record proves the
           human was not in the building, so the credential was used without
           them. Nothing here can say BY WHOM, because everything capable of
           attributing the action derives from the identity provider that was
           itself the thing being used. Authentication is not attribution.
           That is also mission 4's lesson ("valid signature does not establish
           origin"), so this plants it rather than duplicating it.

           Provenance: REAL. Federated identity, SSO audit trails, physical
           access control as an out-of-band witness, and the standing
           distinction between authentication and attribution. */
        2: {
            axes: ['issuer', 'logPipeline', 'clockSource'],
            situation:
                'A maintenance command reached ASTRAEA-9 at 06:14:22Z from operator '
              + 'session S-4471, during the window in which HELIOS-7 thermal channels '
              + 'diverged. The session authenticated cleanly. Establish whether it was '
              + 'legitimate, and be precise about what the evidence can and cannot show.',
            sensors: [
                { id: 'sess-token', name: 'Operator session token S-4471',
                  reading: 'VALID', unit: '',
                  issuer: 'terran-sso', logPipeline: 'sso-audit', clockSource: 'MOC-NTP',
                  note: 'Subject R. Okonkwo. Issued 06:12:04Z, MFA satisfied, not expired.' },
                { id: 'sso-audit', name: 'SSO audit record for S-4471',
                  reading: 'CONFIRMS', unit: '',
                  issuer: 'terran-sso', logPipeline: 'sso-audit', clockSource: 'MOC-NTP',
                  note: 'Authentication success, MFA satisfied, same subject, same second.' },
                { id: 'vpn-log', name: 'VPN concentrator session log',
                  reading: 'CONFIRMS', unit: '',
                  issuer: 'terran-sso', logPipeline: 'netops-syslog', clockSource: 'MOC-NTP',
                  note: 'Tunnel established for the same subject. SSO-integrated, so the '
                      + 'identity it reports is the one SSO handed it.' }
            ],
            corroborators: [
                { id: 'badge-log', name: 'Facility access control, ops floor',
                  value: 'BADGED OUT 05:48Z', unit: '',
                  issuer: 'facility-acs', logPipeline: 'facility-acs', clockSource: 'ACS-RTC',
                  reasoning: 'R. Okonkwo badged OUT of the operations floor at 05:48Z and '
                           + 'did not badge back in. The session authenticated at 06:12:04Z. '
                           + 'This system shares no issuer, no pipeline and no clock with '
                           + 'the identity provider.' },
                { /* Independent of the SSO family, but NOT of badge-log: same clock, same
                     pipeline. Deliberate, and the same shape as mission 1's corroborator
                     pair. Two witnesses can each be independent of the accused and still
                     be one witness with respect to each other. */
                  id: 'cam-still', name: 'Ops floor camera still, 06:12Z',
                  value: 'POSITION UNOCCUPIED', unit: '',
                  issuer: 'facility-cctv', logPipeline: 'facility-acs', clockSource: 'ACS-RTC',
                  reasoning: 'Console position 4 is unoccupied in the frame timestamped '
                           + '06:12Z. Shares a clock and a pipeline with the badge record, '
                           + 'so it strengthens that account rather than being a second one.' },
                { id: 'cmd-origin', name: 'Uplink source address for the command',
                  value: '10.42.7.19 (MOC floor subnet)', unit: '',
                  issuer: 'terran-sso', logPipeline: 'netops-syslog', clockSource: 'MOC-NTP',
                  reasoning: 'The command came from inside the MOC address space, which is '
                           + 'consistent with a legitimate console and equally consistent '
                           + 'with anyone who reached that subnet. It narrows WHERE and '
                           + 'says nothing about WHO.' }
            ]
        },

        /* ── MISSION 3 — LAST GOOD CONTACT ──────────────────────────────────
           Rebuild the last communications window that can be trusted, so every
           later mission has a reference point that is not simply asserted.

           THE TRAP: the platform clock and the ground clock are disciplined
           from the same upstream source, so two logs agreeing on a timestamp
           are one clock counted twice. Exactly mission 1's structure, applied
           to time.

           THE ANCHOR IS THE BOX'S OWN PHYSICS, which is why this mission is
           worth building rather than being a third variation. ASTRAEA-9 sits
           ~326,000 km away, so a command and its acknowledgement cannot be
           separated by less than ~2.18 s. That figure is not a setting anyone
           can edit, it is the distance. Any command/ack pair in the logs that
           appears to have completed faster than light is proof the timestamps
           were moved, and the ranging fix is a measurement of DISTANCE rather
           than a reading of a clock, so it cannot be forged by touching one.

           The player looks for the physically impossible round trip. That is
           the whole mission, and it turns the constraint the box opens with
           into the tool that solves it.

           Provenance: REAL (two-way ranging, light-time as a physical bound,
           NTP hierarchy and common-mode clock failure). */
        3: {
            /* timeRoot is the axis that matters and the reason this mission is not
               mission 1 reskinned. Two clocks with DIFFERENT NAMES can still be one
               clock: PLAT-CLK-A is disciplined from MOC-NTP, which is disciplined from
               GPS-DISC-1. Comparing clock names finds nothing, which is exactly the
               mistake a real analyst makes. Caught by act1-test: plat-log and moc-log
               came back INDEPENDENT because they share no field value, while being the
               same time by derivation. Dependency here is a hierarchy, not a string
               match, so the hierarchy is stated as its own axis. Real anchor: NTP
               stratum and common-mode clock failure. */
            axes: ['timeSource', 'timeRoot', 'logPipeline', 'signingAuthority'],
            situation:
                'Every later finding needs a moment it can be measured against. Establish '
              + 'the last contact whose timestamp can be trusted. Note that a command and '
              + 'its acknowledgement cannot be separated by less than the round-trip light '
              + 'delay, whatever any log says.',
            sensors: [
                { id: 'plat-log', name: 'ASTRAEA-9 command log',
                  reading: '06:14:22.31Z', unit: '',
                  timeSource: 'PLAT-CLK-A', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'platform-telemetry',
                  signingAuthority: 'astraea-telemetry-ca',
                  note: 'Command received. Platform clock, disciplined from the ground '
                      + 'reference on every contact.' },
                { id: 'moc-log', name: 'MOC uplink log',
                  reading: '06:14:22.10Z', unit: '',
                  timeSource: 'MOC-NTP', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'netops-syslog',
                  signingAuthority: 'lagrange-ops-ca',
                  note: 'Command transmitted. 0.21 s before the platform recorded '
                      + 'receiving it, which is not possible at this range.' },
                { id: 'sso-time', name: 'SSO audit timestamp for the session',
                  reading: '06:12:04.00Z', unit: '',
                  timeSource: 'MOC-NTP', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'sso-audit',
                  signingAuthority: 'lagrange-ops-ca',
                  note: 'Shares its time source with the MOC uplink log.' }
            ],
            corroborators: [
                { id: 'range-fix', name: 'Two-way ranging fix, modem-measured',
                  value: '2.181 s round trip', unit: '',
                  /* Its own root: a free-running counter is not disciplined from
                     anything, which is precisely what makes it usable here. */
                  timeSource: 'MODEM-COUNTER', timeRoot: 'MODEM-COUNTER',
                  logPipeline: 'rf-front-end',
                  signingAuthority: 'gs-ranging-ca',
                  reasoning: 'This is a measurement of DISTANCE, not a reading of a clock. '
                           + 'The modem counts its own elapsed ticks between transmitting a '
                           + 'code and hearing it returned. Moving a clock does not move '
                           + 'this number, and 2.181 s is the floor for any command and its '
                           + 'acknowledgement.' },
                { id: 'gs-maser', name: 'Ground station arrival time, maser reference',
                  value: '06:14:23.19Z', unit: '',
                  timeSource: 'GS-MASER', timeRoot: 'GS-MASER',
                  logPipeline: 'rf-front-end',
                  signingAuthority: 'gs-ranging-ca',
                  reasoning: 'RF arrival stamped against a local hydrogen maser that is not '
                           + 'disciplined from the ground NTP hierarchy. Shares a pipeline '
                           + 'with the ranging fix, so the two are one account of the RF '
                           + 'front end rather than two independent ones.' },
                { id: 'ntp-tree', name: 'Time service topology',
                  value: 'PLAT-CLK-A <- MOC-NTP <- GPS-DISC-1', unit: '',
                  timeSource: 'MOC-NTP', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'netops-syslog',
                  signingAuthority: 'lagrange-ops-ca',
                  reasoning: 'The platform clock is disciplined FROM the ground reference. '
                           + 'Agreement between them is not two clocks agreeing, it is one '
                           + 'clock and its copy.' }
            ]
        },

        /* ── MISSION 4 — SIGNED IN ASH ──────────────────────────────────────
           MVP-1's centrepiece, and the first mission that is NOT another
           independence test. Act I taught one habit three times; running it a
           fourth would be a treadmill. This mission needs the habit and then
           needs something the habit cannot do.

           THE COMMAND'S SIGNATURE IS VALID. The key is the right key, the chain
           builds to a trusted root, nothing is expired. And it still does not
           establish origin, for two independent reasons the player must find:

             REPLAY.  The frame counter was already used. A signature proves the
                      key signed THAT PAYLOAD at some point; it says nothing
                      about when it was sent. That is precisely why CCSDS SDLS
                      carries an anti-replay sequence rather than relying on the
                      MAC alone.                                        [REAL]
             SCOPE.   The token's `aud` names the thermal service, not the
                      command authority. It validates and it was not issued FOR
                      this. Verbatim the `bh-mod-auth-access` lesson on aud/iss
                      claim validation, which the scope doc names as this
                      mission's module citation.                        [REAL]

           IT CHAINS BACKWARD DELIBERATELY. Mission 3 establishes a known-good
           timestamp; without it there is no reference against which "this frame
           counter was already used at 06:09" means anything. And mission 2
           planted "authentication is not attribution" so this can pay it off
           rather than teach it cold. Act I is the equipment for Act II.

           Provenance: REAL. CCSDS Space Data Link Security, telecommand frame
           counters, and JWT-style audience/issuer claim validation. */
        4: {
            axes: ['keyCustody', 'signingAuthority', 'logPipeline'],
            situation:
                'The maintenance command from session S-4471 carries a valid signature. '
              + 'Ops is treating that as proof of origin and is ready to close the '
              + 'investigation. Audit the telecommand frame itself. A signature establishes '
              + 'that a key signed a payload; decide what else it does and does not show.',
            /* Frames for the audit panel. The mission is solved by comparing them,
               not by reading any single one: every frame here is individually valid. */
            frames: [
                { id: 'f-1131', label: 'Frame 1131 — thermal setpoint',
                  frameCounter: 1131, payloadHash: 'a41c…9e02', sig: 'VALID',
                  aud: 'astraea.thermal', iss: 'terran-sso', sentAt: '06:09:41Z',
                  note: 'Legitimate. Issued and acknowledged inside the known-good window '
                      + 'established in Last Good Contact.' },
                { id: 'f-1131-r', label: 'Frame 1131 — maintenance command (disputed)',
                  frameCounter: 1131, payloadHash: 'a41c…9e02', sig: 'VALID',
                  aud: 'astraea.thermal', iss: 'terran-sso', sentAt: '06:14:22Z',
                  note: 'The disputed command. Signature verifies. Same frame counter and '
                      + 'the same payload hash as 06:09:41Z.' },
                { id: 'f-1132', label: 'Frame 1132 — housekeeping poll',
                  frameCounter: 1132, payloadHash: 'b7d0…1a55', sig: 'VALID',
                  aud: 'astraea.command', iss: 'terran-sso', sentAt: '06:15:03Z',
                  note: 'Normal traffic. Counter advances, audience is the command '
                      + 'authority, payload is its own.' }
            ],
            /* The service this frame was accepted BY. A token whose aud names a
               different service is a scope failure even when it verifies. */
            acceptedBy: 'astraea.command',
            sensors: [
                { id: 'cmd-sig', name: 'Telecommand signature',
                  reading: 'VERIFIES', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'lagrange-ops-ca',
                  logPipeline: 'netops-syslog',
                  note: 'MAC verifies against the operations signing key. Chain builds to a '
                      + 'trusted root. Nothing is expired.' },
                { id: 'cmd-cert', name: 'Signing certificate chain',
                  reading: 'TRUSTED', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'lagrange-ops-ca',
                  logPipeline: 'netops-syslog',
                  note: 'Same key custody and same authority as the signature it vouches '
                      + 'for. A chain confirming its own leaf is one statement.' },
                { id: 'hsm-audit', name: 'HSM key-use audit',
                  reading: 'ONE USE AT 06:09:41Z', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'hsm-attest-ca',
                  logPipeline: 'hsm-internal',
                  note: 'The HSM records the key being used ONCE this hour, at 06:09:41Z. '
                      + 'It has no record of a signing operation at 06:14:22Z.' }
            ],
            corroborators: [
                { id: 'seq-window', name: 'SDLS anti-replay window',
                  value: 'COUNTER 1131 ALREADY SEEN', unit: '',
                  keyCustody: 'astraea-fsw', signingAuthority: 'astraea-platform-ca',
                  logPipeline: 'platform-telemetry',
                  reasoning: 'The platform recorded frame counter 1131 at 06:09:41Z and '
                           + 'accepted it again at 06:14:22Z. A frame counter is single-use '
                           + 'by design; accepting it twice is the anti-replay control '
                           + 'failing open, not the signature being forged.' },
                { id: 'aud-claim', name: 'Token audience claim',
                  value: 'aud = astraea.thermal', unit: '',
                  keyCustody: 'terran-sso', signingAuthority: 'terran-sso-ca',
                  logPipeline: 'sso-audit',
                  reasoning: 'The frame was accepted by astraea.command. Its audience claim '
                           + 'names astraea.thermal. It validates, and it was never issued '
                           + 'for the service that honoured it.' },
                { id: 'hsm-attest', name: 'HSM attestation log',
                  value: 'NO SIGNING OPERATION AT 06:14:22Z', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'hsm-attest-ca',
                  logPipeline: 'hsm-internal',
                  reasoning: 'The key never left the module and the module did not sign '
                           + 'anything at the disputed time. Whoever sent that frame did '
                           + 'not need the key, because the bytes already existed.' }
            ]
        }
    };

/* Attach on load so forMission() finds it. Absent in production by design: the
   two consumers of missionData are gateway.html (held) and the test suite. */
if (typeof ColdHorizonConfig !== 'undefined') {
    ColdHorizonConfig.missionData = ColdHorizonMissions;
}
if (typeof module !== 'undefined' && module.exports) module.exports = ColdHorizonMissions;
