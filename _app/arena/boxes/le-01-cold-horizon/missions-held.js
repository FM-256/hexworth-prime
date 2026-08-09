/* ═══════════════════════════════════════════════════════════════════════════
   LAGRANGE EDGE, HELD MISSION PAYLOAD (Act I missions 2-3, MVP-1 mission 4)
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

        /* ── MISSION 2, GHOST SESSION ──────────────────────────────────────
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

        /* ── MISSION 3, LAST GOOD CONTACT ──────────────────────────────────
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

        /* ── MISSION 4, SIGNED IN ASH ──────────────────────────────────────
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
                { id: 'f-1131', label: 'Frame 1131, thermal setpoint',
                  frameCounter: 1131, payloadHash: 'a41c…9e02', sig: 'VALID',
                  aud: 'astraea.thermal', iss: 'terran-sso', sentAt: '06:09:41Z',
                  note: 'Legitimate. Issued and acknowledged inside the known-good window '
                      + 'established in Last Good Contact.' },
                { id: 'f-1131-r', label: 'Frame 1131, maintenance command (disputed)',
                  frameCounter: 1131, payloadHash: 'a41c…9e02', sig: 'VALID',
                  aud: 'astraea.thermal', iss: 'terran-sso', sentAt: '06:14:22Z',
                  note: 'The disputed command. Signature verifies. Same frame counter and '
                      + 'the same payload hash as 06:09:41Z.' },
                { id: 'f-1132', label: 'Frame 1132, housekeeping poll',
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
   MISSIONS 8-12, Acts III and IV
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

    /* 8, PARTITION ZERO. Three views agree the rogue node is a legitimate
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

    /* 9, NIGHTJAR. The image TAG matches the approved release; the DIGEST does
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

    /* 10, REDUNDANT TRUTH. Three replicas agree because ONE writer feeds all
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

    /* 11, EIDOLON. The payoff of the whole box, and the trap is INVERTED. Every
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

    /* 12, HEAT DEBT. The first mission whose answer is an ACTION under
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

/* ═══════════════════════════════════════════════════════════════════════════
   ACT V, THE BURN. Missions 13, 14, 15.
   ═══════════════════════════════════════════════════════════════════════════
   Mission 13 is NOT another independence test and must not be. Its canon
   learning focus is "risk-based containment", and the question is not which
   source to trust but what ORDER to act in, which the independence mechanic
   cannot express at all. It declares `actions` and `constraints`; gateway.html
   renders a sequencing panel for any mission that does.

   The constraints are of two kinds and the distinction is the lesson:
     hard , violating it destroys something irrecoverable, or reopens the door
     soft , a genuine trade-off with no free answer, judged not enforced
   A mission where every rule is hard teaches rule-following. The thermal
   deadline is what makes this a decision.
   ═══════════════════════════════════════════════════════════════════════════ */
Object.assign(ColdHorizonMissions, {

    13: {
        axes: ['authority', 'collectionPath', 'signingAuthority'],
        situation: 'You have the evidence. HELIOS-7 is climbing, a rogue member holds the '
                 + 'fabric, and a credential that is not the operator\'s is still valid. '
                 + 'Sequence the containment. Order is the whole problem: several of these '
                 + 'actions destroy the evidence for the others, and one of them is on a '
                 + 'clock that does not care about your investigation.',
        actions: [
            { id: 'a-snapshot', label: 'Snapshot volatile state on the orbital host',
              note: 'Process table, open sockets, the running container\'s layers. Gone on reboot.' },
            { id: 'a-revoke',   label: 'Revoke the compromised credential',
              note: 'Kills the session that issued the replayed frame.' },
            { id: 'a-isolate',  label: 'Isolate the rogue fabric member',
              note: 'Drops it from partition 0x7fff. Also drops its volatile state.' },
            { id: 'a-thermal',  label: 'Take HELIOS-7 off the bus',
              note: 'Thermal containment. The panel is climbing while you decide.' },
            { id: 'a-restore',  label: 'Restore command authority and rotate keys',
              note: 'Reopens the command path.' }
        ],
        /* before MUST precede after. `hard` violations are irreversible or reopen
           the attack path; `soft` is a real trade-off the player has to own. */
        constraints: [
            { before: 'a-snapshot', after: 'a-isolate', hard: true,
              reason: 'Isolating the node drops its volatile state. Snapshot first or the '
                    + 'evidence for what it was doing is gone permanently.' },
            { before: 'a-snapshot', after: 'a-restore', hard: true,
              reason: 'Restoring authority means reboots and re-deploys. Capture before you '
                    + 'change the thing you are trying to describe.' },
            { before: 'a-revoke', after: 'a-restore', hard: true,
              reason: 'Reopening the command path while the credential is still valid hands '
                    + 'it straight back. Revoke before you restore, never after.' },
            { before: 'a-isolate', after: 'a-restore', hard: true,
              reason: 'Restoring the fabric with the rogue member still in the partition '
                    + 'returns it to full reachability.' },
            { before: 'a-thermal', after: 'a-restore', hard: false,
              reason: 'The panel is on a clock. Every step you take before thermal '
                    + 'containment is margin you are spending on forensics. Defensible, and '
                    + 'you should be able to say why you chose it.' }
        ],
        sensors: [
            { id: 'c-margin', name: 'Thermal margin remaining', reading: '18 MINUTES', unit: '',
              authority: 'platform-telemetry', collectionPath: 'platform/thermal',
              signingAuthority: 'astraea-telemetry-ca',
              note: 'From the telemetry family you already know is unreliable. Treat as soft.' },
            { id: 'c-ir', name: 'Your own IR trend on HELIOS-7', reading: 'RISING 1.9 C/MIN', unit: '',
              authority: 'rsv-infrared', collectionPath: 'rsv/optics',
              signingAuthority: 'rsv-payload-attest',
              note: 'Measured. This is the clock that is actually running.' },
            { id: 'c-session', name: 'Compromised session state', reading: 'STILL VALID', unit: '',
              authority: 'terran-sso', collectionPath: 'sso-audit',
              signingAuthority: 'terran-sso-ca',
              note: 'The credential from Ghost Session has not been revoked.' }
        ],
        corroborators: [
            { id: 'c-runbook', name: 'Containment runbook, ops-authored',
              value: 'EVIDENCE BEFORE ERADICATION', unit: '',
              authority: 'ops-walkdown', collectionPath: 'ops/maintenance/records',
              signingAuthority: 'lagrange-ops-ca',
              reasoning: 'Written before any of this happened, by people with no stake in '
                       + 'the outcome. Independent of every platform system involved.' },
            { id: 'c-legal', name: 'Evidence-handling requirement', value: 'VOLATILE FIRST', unit: '',
              authority: 'ops-walkdown', collectionPath: 'ops/legal', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'Shares an authority with the runbook, so the two are one policy '
                       + 'position rather than two independent confirmations.' },
            { id: 'c-fsw', name: 'Flight software safing behaviour', value: 'AUTO-SHEDS AT 71 C', unit: '',
              authority: 'astraea-fsw', collectionPath: 'platform/fsw', signingAuthority: 'astraea-platform-ca',
              reasoning: 'The platform will protect itself if you run out of time. That is a '
                       + 'floor, not a plan: it sheds the load its own way and you lose the '
                       + 'choice.' }
        ]
    },

    /* 14, COLD HORIZON. The title mission. Recovery and ATTRIBUTION, and the
       last trap is the one the whole box has been building toward: the evidence
       supports a specific technical account and NOT a specific actor. Every
       source that would name who is downstream of the identity provider that was
       itself the thing used. You can establish what happened, when, and through
       which path. Naming the party is a claim the record does not carry, and the
       mission is scored on refusing to make it. */
    14: {
        axes: ['origin', 'collectionPath', 'signingAuthority'],
        situation: 'Containment holds. Write the incident record: what happened, what the '
                 + 'evidence establishes, and what it does not. Ops wants a name in the '
                 + 'report. Decide whether the record carries one.',
        sensors: [
            { id: 'r-narrative', name: 'Draft attribution narrative', reading: 'NAMES A PARTY', unit: '',
              origin: 'terran-sso', collectionPath: 'sso-audit', signingAuthority: 'terran-sso-ca',
              note: 'Built from the session records, which is to say from the identity '
                  + 'provider whose credential was used.' },
            { id: 'r-session', name: 'Session attribution chain', reading: 'RESOLVES TO ONE SUBJECT', unit: '',
              origin: 'terran-sso', collectionPath: 'sso-audit', signingAuthority: 'terran-sso-ca',
              note: 'The IdP resolving its own token to its own subject.' },
            { id: 'r-cmdlog', name: 'Command authority log', reading: 'SAME SUBJECT', unit: '',
              origin: 'terran-sso', collectionPath: 'sso-audit', signingAuthority: 'terran-sso-ca',
              note: 'Populated from the SSO assertion. Not a second witness.' }
        ],
        corroborators: [
            { id: 'r-badge', name: 'Facility access record', value: 'SUBJECT WAS NOT ON SITE', unit: '',
              origin: 'facility-acs', collectionPath: 'facility-acs', signingAuthority: 'facility-acs-ca',
              reasoning: 'Independent of the identity provider, and it REFUTES the named '
                       + 'subject rather than confirming them. The strongest evidence in the '
                       + 'file argues against the name the report wants.' },
            { id: 'r-timeline', name: 'Reconstructed technical timeline',
              value: 'REPLAY -> FABRIC JOIN -> WORKLOAD -> THERMAL', unit: '',
              origin: 'ground/replay-lab', collectionPath: 'ground/replay-lab',
              signingAuthority: 'gs-ranging-ca',
              reasoning: 'Built off-platform from the write-once downlink record. This is '
                       + 'what the evidence DOES establish: a sequence, a path, and a method.' },
            { id: 'r-evidence-seal', name: 'Evidence bundle hash, sealed at capture',
              value: 'INTACT', unit: '',
              origin: 'ground/replay-lab', collectionPath: 'ground/evidence-seal',
              signingAuthority: 'gs-ranging-ca',
              reasoning: 'Shares an origin with the timeline, so it attests that the bundle '
                       + 'was not altered rather than independently confirming its contents.' }
        ]
    },

    /* 15, BLACK RELAY (optional). Threat hunting and the sequel hook. Three
       endpoints look like the relay; two are the same infrastructure wearing
       different names, which is mission 1's lesson applied to an adversary's
       estate rather than to your own. */
    15: {
        axes: ['operator', 'collectionPath', 'signingAuthority'],
        situation: 'The workload was talking to something. Find the relay endpoint it '
                 + 'actually used, and be careful: an adversary buys redundancy from the same '
                 + 'places everyone else does.',
        sensors: [
            { id: 'ep-a', name: 'Endpoint A, first-seen in egress flow', reading: 'CANDIDATE', unit: '',
              operator: 'relay-provider-1', collectionPath: 'threat/passive-dns',
              signingAuthority: 'ti-feed-ca', note: 'Resolved via the passive DNS feed.' },
            { id: 'ep-b', name: 'Endpoint B, same ASN', reading: 'CANDIDATE', unit: '',
              operator: 'relay-provider-1', collectionPath: 'threat/passive-dns',
              signingAuthority: 'ti-feed-ca',
              note: 'A different name on the same operator, from the same feed.' },
            { id: 'ep-c', name: 'Endpoint C, unrelated hosting', reading: 'CANDIDATE', unit: '',
              operator: 'relay-provider-2', collectionPath: 'threat/passive-dns',
              signingAuthority: 'ti-feed-ca', note: 'Different operator, same feed.' }
        ],
        corroborators: [
            { id: 'ep-flow', name: 'Orbital gateway flow record, byte counts',
              value: 'SUSTAINED TO ENDPOINT C ONLY', unit: '',
              operator: 'orbital-gateway', collectionPath: 'platform/netflow',
              signingAuthority: 'astraea-platform-ca',
              reasoning: 'What the platform actually sent, rather than what a reputation feed '
                       + 'says about a name. Shares nothing with the threat-intel pipeline.' },
            { id: 'ep-tls', name: 'TLS certificate fingerprint observed on the wire',
              value: 'MATCHES ENDPOINT C', unit: '',
              operator: 'orbital-gateway', collectionPath: 'platform/netflow',
              signingAuthority: 'astraea-platform-ca',
              reasoning: 'Observed by the same gateway on the same path, so it strengthens '
                       + 'that one account rather than being a second one.' },
            { id: 'ep-reputation', name: 'Threat-intel reputation score',
              value: 'A AND B FLAGGED, C CLEAN', unit: '',
              operator: 'relay-provider-1', collectionPath: 'threat/passive-dns',
              signingAuthority: 'ti-feed-ca',
              reasoning: 'The feed flags the two endpoints that share its own operator and '
                       + 'clears the one the platform actually talked to. A reputation score '
                       + 'is an opinion about a name, not an observation of a connection.' }
        ]
    }
});

/* ═══════════════════════════════════════════════════════════════════════════
   MISSIONS 5, 6, 7, the Act II/III gaps
   ═══════════════════════════════════════════════════════════════════════════
   Skipped when Act II was built because the scope doc's MVP-1 named 4, 8 and 10
   as the vertical slice. Added now to close the arc: the design document
   describes fifteen missions and a box that plays 12 of them has holes where
   its phase outputs should chain.
   ═══════════════════════════════════════════════════════════════════════════ */
Object.assign(ColdHorizonMissions, {

    /* 5, THE QUIET DISH. Ground station maintenance access. The trap is a
       negative: three records show no unauthorised change, and all three are the
       change-management system describing its own contents. Absence of a record
       is not absence of an event, and the witness is the door. */
    5: {
        axes: ['recordKeeper', 'collectionPath', 'signingAuthority'],
        situation: 'The disputed command left a ground station. Establish whether the station '
                 + 'was the point of entry, or whether it only carried something that was '
                 + 'already inside. Be careful with a clean change log.',
        sensors: [
            { id: 'gs-cm', name: 'Change-management record', reading: 'NO CHANGES IN WINDOW', unit: '',
              recordKeeper: 'cm-system', collectionPath: 'ops/change-mgmt', signingAuthority: 'lagrange-ops-ca',
              note: 'The CM system reports nothing was changed.' },
            { id: 'gs-approval', name: 'Approval workflow history', reading: 'NO PENDING OR APPROVED WORK', unit: '',
              recordKeeper: 'cm-system', collectionPath: 'ops/change-mgmt', signingAuthority: 'lagrange-ops-ca',
              note: 'Same system, same store. It agrees with its own record.' },
            { id: 'gs-config', name: 'Station config baseline diff', reading: 'MATCHES BASELINE', unit: '',
              recordKeeper: 'cm-system', collectionPath: 'ops/change-mgmt', signingAuthority: 'lagrange-ops-ca',
              note: 'The baseline the CM system holds, compared against itself.' }
        ],
        corroborators: [
            { id: 'gs-door', name: 'Equipment room door log', value: 'ONE ENTRY, 04:51Z, MAINTENANCE BADGE', unit: '',
              recordKeeper: 'facility-acs', collectionPath: 'facility-acs', signingAuthority: 'facility-acs-ca',
              reasoning: 'A physical door log kept by a different system entirely. Someone was '
                       + 'in the room during a window the change system says was quiet.' },
            { id: 'gs-serial', name: 'Serial console session record', value: 'SESSION AT 04:53Z', unit: '',
              recordKeeper: 'oob-console', collectionPath: 'ops/oob', signingAuthority: 'oob-attest-ca',
              reasoning: 'Out-of-band console, outside the change process by design. Two '
                       + 'minutes after the door. It carries no change ticket because the '
                       + 'change system never saw it.' },
            { id: 'gs-uplink', name: 'Uplink transmit log for this station', value: 'CARRIED THE FRAME, DID NOT ORIGINATE IT', unit: '',
              recordKeeper: 'gs-recorder', collectionPath: 'ground/downlink-archive', signingAuthority: 'gs-ranging-ca',
              reasoning: 'The station transmitted the frame it was handed. That makes it the '
                       + 'road, not the door: the entry happened somewhere the change system '
                       + 'does not watch.' }
        ]
    },

    /* 6, DEAD AIR. Resilient communications. Three fallback channels are listed
       as available and two of them terminate on the same transponder, so a single
       failure takes both. The lesson is redundancy that is only redundant on
       paper -- mission 1's shape applied to the link itself, which is the thing
       every other mission has depended on without examining. */
    6: {
        axes: ['rfChain', 'collectionPath', 'signingAuthority'],
        situation: 'The primary command path is degraded and you need a channel you can trust '
                 + 'for a containment order. Three fallbacks are listed as available. '
                 + 'Establish which one is genuinely independent of the primary.',
        sensors: [
            { id: 'ch-primary', name: 'Primary command uplink', reading: 'DEGRADED', unit: '',
              rfChain: 'ka-transponder-1', collectionPath: 'platform/comms', signingAuthority: 'astraea-platform-ca',
              note: 'The path everything has been using.' },
            { id: 'ch-backup', name: 'Backup command uplink', reading: 'AVAILABLE', unit: '',
              rfChain: 'ka-transponder-1', collectionPath: 'platform/comms', signingAuthority: 'astraea-platform-ca',
              note: 'Listed as a separate channel. Same transponder.' },
            { id: 'ch-relay', name: 'Cross-link relay via a partner platform', reading: 'AVAILABLE', unit: '',
              rfChain: 'ka-transponder-1', collectionPath: 'platform/comms', signingAuthority: 'astraea-platform-ca',
              note: 'Routes off-platform and back through the same front end.' }
        ],
        corroborators: [
            { id: 'ch-emergency', name: 'Low-rate emergency beacon channel', value: '48 BYTES PER MINUTE, S-BAND', unit: '',
              rfChain: 's-band-omni', collectionPath: 'platform/fsw', signingAuthority: 'astraea-fsw-attest',
              reasoning: 'A separate omni antenna on a separate RF chain, driven by flight '
                       + 'software rather than the comms stack. Trusted, and constrained: '
                       + '48 bytes is a containment order, not a conversation.' },
            { id: 'ch-rf-topology', name: 'RF chain topology diagram', value: 'PRIMARY, BACKUP AND RELAY SHARE THE Ka FRONT END', unit: '',
              rfChain: 'ops-walkdown', collectionPath: 'ops/design-docs', signingAuthority: 'lagrange-ops-ca',
              reasoning: 'A hand-drawn diagram from the design pack. It says in one line what '
                       + 'the availability list hides: three named channels, one front end.' },
            { id: 'ch-status', name: 'Comms stack availability report', value: 'ALL THREE AVAILABLE', unit: '',
              rfChain: 'ka-transponder-1', collectionPath: 'platform/comms', signingAuthority: 'astraea-platform-ca',
              reasoning: 'The comms stack reporting on the channels it owns. It is telling the '
                       + 'truth about configuration and nothing about independence.' }
        ]
    },

    /* 7, BORROWED HANDS. Out-of-band management, and the reason the earlier
       missions could not find the entry point. The Space KVM sits BESIDE the
       operating system: it mounts virtual media, survives a rebuild, and is
       invisible to every host-side record. Real anchor: BMC / IPMI / Redfish and
       the documented virtual-media attack class. */
    7: {
        axes: ['plane', 'collectionPath', 'signingAuthority'],
        situation: 'Nothing host-side explains how the workload arrived. Audit the Space KVM: '
                 + 'the management processor that can mount media and power-cycle the node '
                 + 'without the operating system ever knowing.',
        sensors: [
            { id: 'kvm-hostlog', name: 'Host system log', reading: 'NO MOUNT EVENTS', unit: '',
              plane: 'host-os', collectionPath: 'platform/syslog', signingAuthority: 'astraea-platform-ca',
              note: 'The OS reports nothing. It would not: virtual media is presented to it '
                  + 'as ordinary hardware.' },
            { id: 'kvm-audit', name: 'Host audit subsystem', reading: 'NO PRIVILEGED ACTION', unit: '',
              plane: 'host-os', collectionPath: 'platform/syslog', signingAuthority: 'astraea-platform-ca',
              note: 'Same plane, same store.' },
            { id: 'kvm-integrity', name: 'Filesystem integrity check', reading: 'NO UNEXPECTED FILES', unit: '',
              plane: 'host-os', collectionPath: 'platform/syslog', signingAuthority: 'astraea-platform-ca',
              note: 'Run by the host, on the host, after the fact.' }
        ],
        corroborators: [
            { id: 'kvm-sel', name: 'Management processor event log', value: 'VIRTUAL MEDIA MOUNTED 05:58Z', unit: '',
              plane: 'bmc', collectionPath: 'platform/bmc', signingAuthority: 'bmc-attest-ca',
              reasoning: 'The management processor keeps its own log on its own plane. It '
                       + 'records a mount the operating system was never told about, six '
                       + 'minutes before the fabric join.' },
            { id: 'kvm-power', name: 'Management processor power history', value: 'CYCLE AT 05:59Z', unit: '',
              plane: 'bmc', collectionPath: 'platform/bmc', signingAuthority: 'bmc-attest-ca',
              reasoning: 'A power cycle one minute after the mount, which is how the image got '
                       + 'executed. Same plane as the event log, so the two are one account.' },
            { id: 'kvm-netflow', name: 'Management network flow record', value: 'INBOUND FROM THE GROUND STATION SUBNET', unit: '',
              plane: 'oob-network', collectionPath: 'platform/netflow-oob', signingAuthority: 'astraea-platform-ca',
              reasoning: 'The out-of-band management network is separate from both the host and '
                       + 'the BMC log. It says where the session came from, and it points back '
                       + 'at the quiet dish.' }
        ]
    }
});
