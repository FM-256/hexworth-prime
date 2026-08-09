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

/* ═══════════════════════════════════════════════════════════════════════════
   MISSIONS 8-12 — Acts III and IV
   ═══════════════════════════════════════════════════════════════════════════
   Merged rather than spliced into the literal above, so adding a mission never
   requires surgery inside a 300-line object.

   THE AXES CHANGE EVERY TIME, on purpose. By mission 8 a player has run the
   independence test three ways and the risk stops being "can they do it" and
   becomes "have they memorised a checklist". Fabric membership, image
   provenance, replica writers, model inputs and thermal basis share no
   vocabulary, so the only thing that carries between them is the question:
   what do these agreeing sources have in common?
   ═══════════════════════════════════════════════════════════════════════════ */
Object.assign(ColdHorizonMissions, {

    /* 8 — PARTITION ZERO. Three views agree the rogue node is a legitimate
       member, and all three are the Subnet Manager describing itself: its
       config, the table it produced, and the audit log it writes. The witness
       is a hardware port counter, which counts frames whether or not the SM
       believes anything is attached. Real anchor: InfiniBand P_Key membership. */
    8: {
        axes: ['authority', 'collectionPath', 'signingAuthority'],
        situation: 'A node holds full membership of partition 0x7fff and is reachable by '
                 + 'every workload on the fabric. Nothing on record says it should exist. '
                 + 'Establish whether its membership is legitimate before anything is isolated.',
        sensors: [
            { id: 'sm-table', name: 'Subnet Manager membership table', reading: 'MEMBER, P_Key 0x7fff', unit: '',
              authority: 'opensm-primary', collectionPath: 'fabric/sm/state', signingAuthority: 'astraea-fabric-ca',
              note: 'The SM lists the node as a full member of the default partition.' },
            { id: 'sm-config', name: 'Partition configuration file', reading: 'CONFIRMS MEMBERSHIP', unit: '',
              authority: 'opensm-primary', collectionPath: 'fabric/sm/state', signingAuthority: 'astraea-fabric-ca',
              note: 'The config the SM loaded. It agrees with the table it produced.' },
            { id: 'sm-audit', name: 'Fabric audit log', reading: 'NO UNAUTHORISED JOIN', unit: '',
              authority: 'opensm-primary', collectionPath: 'fabric/sm/audit', signingAuthority: 'astraea-fabric-ca',
              note: 'Written by the SM. Silence here is the SM reporting on itself.' }
        ],
        corroborators: [
            { id: 'port-counter', name: 'Leaf switch port counter, physical',
              value: '412 GB since 06:02Z on a port with no assigned host', unit: '',
              authority: 'switch-asic', collectionPath: 'fabric/hw/counters', signingAuthority: 'switch-hw-attest',
              reasoning: 'A port counter is hardware. It counts frames whether or not the Subnet '
                       + 'Manager believes anything is attached, so it cannot be edited by editing '
                       + 'the partition table.' },
            { id: 'sm-standby', name: 'Standby Subnet Manager view', value: 'NODE ABSENT FROM ITS LAST SYNC', unit: '',
              authority: 'opensm-standby', collectionPath: 'fabric/sm/state', signingAuthority: 'astraea-fabric-ca',
              reasoning: 'A second SM, but it shares the state path and the signing authority with '
                       + 'the primary. Useful, and not independent.' },
            { id: 'cable-map', name: 'Physical cable inventory, hand-recorded',
              value: 'PORT 14 UNPOPULATED AT LAST WALKDOWN', unit: '',
              authority: 'ops-walkdown', collectionPath: 'ops/maintenance/records', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'A human wrote this on the deck. Shares nothing with the fabric control '
                       + 'plane, and it says nothing should be on that port.' }
        ]
    },

    /* 9 — NIGHTJAR. The image TAG matches the approved release; the DIGEST does
       not. A tag is a mutable pointer, a digest is the content. Two attestations
       vouch for the image and both came out of the same build pipeline, so they
       are one statement. The witness is the running container's own layer hash,
       read off the orbital host rather than from the registry describing it. */
    9: {
        axes: ['producer', 'collectionPath', 'signingAuthority'],
        situation: 'A workload is executing on ASTRAEA-9 that appears in no deployment record. '
                 + 'It presents the approved image tag. Establish what is actually running, and '
                 + 'where it came from.',
        sensors: [
            { id: 'img-tag', name: 'Deployed image tag', reading: 'astraea/telemetry:2.4.1 (APPROVED)', unit: '',
              producer: 'terran-buildfarm', collectionPath: 'registry/metadata', signingAuthority: 'buildfarm-ca',
              note: 'The tag matches the approved release exactly.' },
            { id: 'img-attest', name: 'Build attestation for 2.4.1', reading: 'SIGNED, CHAIN VALID', unit: '',
              producer: 'terran-buildfarm', collectionPath: 'registry/metadata', signingAuthority: 'buildfarm-ca',
              note: 'The build farm attesting to its own output.' },
            { id: 'sbom', name: 'SBOM for the approved release', reading: 'NO UNEXPECTED COMPONENTS', unit: '',
              producer: 'terran-buildfarm', collectionPath: 'registry/metadata', signingAuthority: 'buildfarm-ca',
              note: 'Generated by the same pipeline from the same inputs.' }
        ],
        corroborators: [
            { id: 'layer-hash', name: 'Running container layer digest, read on the host',
              value: 'sha256:1c7e... DOES NOT MATCH THE TAGGED DIGEST', unit: '',
              producer: 'astraea-runtime', collectionPath: 'platform/containerd', signingAuthority: 'astraea-platform-ca',
              reasoning: 'A tag is a mutable pointer; a digest is the content. This is what is '
                       + 'actually executing, read from the runtime rather than from the registry '
                       + 'that describes it.' },
            { id: 'egress-flow', name: 'Orbital gateway egress flow record',
              value: 'OUTBOUND TO AN ADDRESS IN NO ALLOWLIST', unit: '',
              producer: 'orbital-gateway', collectionPath: 'platform/netflow', signingAuthority: 'astraea-platform-ca',
              reasoning: 'Shares a signing authority with the runtime, so it corroborates the '
                       + 'platform account rather than standing apart from it.' },
            { id: 'reg-pull-log', name: 'Registry pull log for this digest',
              value: 'NEVER PULLED FROM THE TERRAN REGISTRY', unit: '',
              producer: 'terran-registry', collectionPath: 'registry/access', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'If the image never crossed the link, it was not deployed from the ground. '
                       + 'That is the orbital origin, established rather than assumed.' }
        ]
    },

    /* 10 — REDUNDANT TRUTH. Three replicas agree because ONE writer feeds all
       three. Replication protects against LOSS; it does nothing about forgery
       upstream of the writer. Mission 1's shape, one level further out. The
       forgery boundary is the ground downlink recording: written as the bits
       arrived, on write-once media, on the far side of the link. */
    10: {
        axes: ['writer', 'collectionPath', 'signingAuthority'],
        situation: 'The thermal history for HELIOS-7 is stored in three replicas and they agree '
                 + 'to the sample. Establish how far back the record can be trusted, and where '
                 + 'the forgery boundary sits.',
        sensors: [
            { id: 'rep-a', name: 'Replica A, primary store', reading: 'NOMINAL THROUGHOUT', unit: '',
              writer: 'tsdb-ingest-1', collectionPath: 'platform/tsdb', signingAuthority: 'astraea-telemetry-ca',
              note: 'Fed by the ingest writer.' },
            { id: 'rep-b', name: 'Replica B, hot standby', reading: 'IDENTICAL TO A', unit: '',
              writer: 'tsdb-ingest-1', collectionPath: 'platform/tsdb', signingAuthority: 'astraea-telemetry-ca',
              note: 'Byte-identical. Same writer, so identity is expected, not evidence.' },
            { id: 'rep-c', name: 'Replica C, cold archive', reading: 'IDENTICAL TO A', unit: '',
              writer: 'tsdb-ingest-1', collectionPath: 'platform/tsdb-archive', signingAuthority: 'astraea-telemetry-ca',
              note: 'Different store, same writer.' }
        ],
        corroborators: [
            { id: 'wal-gap', name: 'Write-ahead log continuity', value: 'SEQUENCE BREAK 06:08Z TO 06:11Z', unit: '',
              writer: 'tsdb-wal', collectionPath: 'platform/tsdb-wal', signingAuthority: 'astraea-platform-ca',
              reasoning: 'The WAL is written before the replicas and by a different path. A gap '
                       + 'there with no gap in the replicas means the replicas were written from '
                       + 'something other than the live stream.' },
            { id: 'downlink-tape', name: 'Ground downlink recording, write-once', value: 'SHOWS 58.9 C AT 06:09Z', unit: '',
              writer: 'gs-recorder', collectionPath: 'ground/downlink-archive', signingAuthority: 'gs-ranging-ca',
              reasoning: 'Recorded on the ground as the bits arrived, on write-once media, by a '
                       + 'system on the other side of the link from every replica. This is the '
                       + 'boundary: everything after it can be rewritten, and this cannot.' },
            { id: 'rep-checksum', name: 'Replica checksum service', value: 'ALL THREE MATCH', unit: '',
              writer: 'tsdb-ingest-1', collectionPath: 'platform/tsdb', signingAuthority: 'astraea-telemetry-ca',
              reasoning: 'Confirms the replicas agree with each other. That was never in doubt and '
                       + 'is not the question.' }
        ]
    },

    /* 11 — EIDOLON. The payoff of the whole box, and the trap is INVERTED. Every
       earlier mission taught suspicion of the source that agrees with the crowd;
       here the temptation is to distrust the one that has been disagreeing. It
       was never lying. Its confidence is a function of its inputs, and its
       thermal inputs are TH-1 and TH-3 -- the two channels that share everything.
       A competent operator on corrupted inputs, which is the canon description
       from the design doc's first page. */
    11: {
        axes: ['inputPath', 'policyAuthority', 'signingAuthority'],
        situation: 'EIDOLON has reported insufficient confidence since the first alarm and its '
                 + 'recommendations have been conservative to the point of obstruction. Ops wants '
                 + 'it taken out of the loop. Establish whether the autonomy is faulty or the '
                 + 'inputs are.',
        sensors: [
            { id: 'eid-conf', name: 'EIDOLON confidence trace', reading: 'LOW SINCE 06:09Z', unit: '',
              inputPath: 'platform/telemetry-bus', policyAuthority: 'eidolon-policy-v4', signingAuthority: 'astraea-platform-ca',
              note: 'Confidence fell when the thermal channels diverged, not before.' },
            { id: 'eid-policy', name: 'Autonomy policy in force', reading: 'WITHIN ENVELOPE', unit: '',
              inputPath: 'platform/policy-store', policyAuthority: 'eidolon-policy-v4', signingAuthority: 'astraea-platform-ca',
              note: 'The policy vouching for its own compliance.' },
            { id: 'eid-selfcheck', name: 'EIDOLON self-assessment', reading: 'NO INTERNAL FAULT', unit: '',
              inputPath: 'platform/telemetry-bus', policyAuthority: 'eidolon-policy-v4', signingAuthority: 'astraea-platform-ca',
              note: 'The system reporting on itself, over the bus it reads.' }
        ],
        corroborators: [
            { id: 'input-provenance', name: 'Provenance of EIDOLON input channels',
              value: 'READS TH-1 AND TH-3, NOT TH-2', unit: '',
              inputPath: 'ops/config-audit', policyAuthority: 'lagrange-ops', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'Its thermal inputs are the two channels that share a bus, a clock and a '
                       + 'signing authority. It has been reasoning correctly about a panel it was '
                       + 'never shown.' },
            { id: 'policy-diff', name: 'Policy store diff since last release', value: 'UNCHANGED SINCE 2026-06-30', unit: '',
              inputPath: 'ops/config-audit', policyAuthority: 'lagrange-ops', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'Nobody altered the autonomy envelope. Shares its path with the provenance '
                       + 'record, so the two are one account of the config.' },
            { id: 'replay-harness', name: 'Offline replay against the corrected inputs',
              value: 'RECOMMENDS THE SAME ACTION YOU DID', unit: '',
              inputPath: 'ground/replay-lab', policyAuthority: 'lagrange-ops', signingAuthority: 'gs-ranging-ca',
              reasoning: 'Fed the same policy with TH-2 included, on the ground, off the platform '
                       + 'entirely. It reaches the correct call. The reasoning was never the problem.' }
        ]
    },

    /* 12 — HEAT DEBT. The first mission whose answer is an ACTION under
       uncertainty rather than a finding. The obvious move is to shed HELIOS-7's
       load onto the remaining panels, and the capacity figure everyone quotes
       comes from the same telemetry family that has been wrong since mission 1.
       The physical bound is what the panels can actually radiate, and one of the
       three is already running hot. */
    12: {
        axes: ['basis', 'collectionPath', 'signingAuthority'],
        situation: 'HELIOS-7 must come off the bus for containment. Its thermal load has to go '
                 + 'somewhere for the length of the window. Establish what the remaining panels '
                 + 'can actually reject, and decide whether the platform survives the plan.',
        sensors: [
            { id: 'cap-nominal', name: 'Rated capacity, remaining panels', reading: '3 x 4.2 kW = 12.6 kW', unit: '',
              basis: 'design-spec', collectionPath: 'ops/design-docs', signingAuthority: 'lagrange-ops-ca',
              note: 'Nameplate rating at end-of-life margin, from the design pack.' },
            { id: 'cap-telemetry', name: 'Reported current rejection', reading: '11.8 kW HEADROOM', unit: '',
              basis: 'platform-telemetry', collectionPath: 'platform/thermal', signingAuthority: 'astraea-telemetry-ca',
              note: 'The same telemetry family that has been wrong about HELIOS-7.' },
            { id: 'load-forecast', name: 'Load to be shed during the window', reading: '9.1 kW', unit: '',
              basis: 'platform-telemetry', collectionPath: 'platform/thermal', signingAuthority: 'astraea-telemetry-ca',
              note: 'Derived from the same bus.' }
        ],
        corroborators: [
            { id: 'ir-survey', name: 'Your own infrared survey of the three panels',
              value: 'TWO AT 46 C, ONE AT 61 C', unit: '',
              basis: 'rsv-infrared', collectionPath: 'rsv/optics', signingAuthority: 'rsv-payload-attest',
              reasoning: 'Measured off the platform with the same instrument that settled mission 1. '
                       + 'One of the three panels is already running hot, so the usable headroom is '
                       + 'not what the nameplate implies.' },
            { id: 'degradation', name: 'Panel degradation record', value: 'PANEL 3 COATING DEGRADED, 2031 SURVEY', unit: '',
              basis: 'ops-walkdown', collectionPath: 'ops/maintenance/records', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'A hand-recorded survey explains the hot panel: its emissivity is down, so '
                       + 'it radiates less for the same temperature.' },
            { id: 'pump-margin', name: 'Coolant pump duty on the remaining loop', value: '94 PERCENT', unit: '',
              basis: 'platform-telemetry', collectionPath: 'platform/thermal', signingAuthority: 'astraea-telemetry-ca',
              reasoning: 'Consistent with a loop already working hard. Same family as the capacity '
                       + 'figure it would be used to confirm.' }
        ]
    }
});
