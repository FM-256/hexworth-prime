// =============================================================
// The Proving Grounds -- CEH-01: Footprinting & Reconnaissance
// Engine-driven arena box (Terminal-only). The student performs
// real name-service reconnaissance (whois / dig / nslookup / host)
// against a FICTIONAL target and submits the values they DISCOVER
// as server-validated flags. No multiple choice, no dropdowns.
//
// GROUNDING (CEH v12 312-50, Module 02 Footprinting & Recon):
//   _planning/usb-import/extracted-guides/ec-council-ceh-v12/
//     eccouncil-ceh31250-v12-2-9-1-whois-and-dns.md   (WHOIS thick/thin,
//         DNS record recon via nslookup/dig, zone transfer as the
//         "ultimate goal": dig axfr @<ns> <domain>)
//     eccouncil-ceh31250-v12-2-1-1-footprinting-concepts.md
//
// SAFETY: the TARGET (domain, hostnames, IPs) is fictional and non-routable.
//   TLD .example is reserved (RFC 2606). 198.51.100.0/24 (TEST-NET-2)
//   and 203.0.113.0/24 (TEST-NET-3) are documentation ranges (RFC 5737).
//   10.0.0.0/8 is RFC 1918 private. No real host is ever contacted --
//   all command output is served locally from this config. NOTE: the WHOIS
//   registrar fields (CSC Corporate Domains / IANA ID 299 / whois server)
//   are real-world-accurate REFERENCE values so the student learns to read a
//   genuine registrar record; nothing directs the student to contact them.
//
// FLAG DISCOVERY MAP (each value is surfaced ONLY by running a tool):
//   registrar_iana_id  -> `whois meridiantech-corp.example`
//                         (Registrar IANA ID: 299)
//   primary_nameserver -> `dig SOA meridiantech-corp.example`
//                         (SOA MNAME: ns1.meridiantech-corp.example)
//   mail_server_ip     -> `dig MX ...` then `dig A mail.meridiantech-corp.example`
//                         (chain; A = 198.51.100.25)
//   vpn_cname_target   -> `dig CNAME vpn.meridiantech-corp.example`
//                         (aliased to edge.cloudhost-dns.example)
//   internal_ci_host   -> `dig axfr @ns2.meridiantech-corp.example meridiantech-corp.example`
//                         (misconfigured secondary allows AXFR; the zone
//                          dump exposes an internal-only build server not
//                          resolvable by any ordinary lookup)
// =============================================================

window.CEHReconConfig = {

    id:          'dark-arts-ceh-01-recon',
    title:       'Footprinting & Reconnaissance',
    subtitle:    'The Proving Grounds -- CEH-01 -- Passive OSINT Recon',
    description: 'MeridianTech Corp has authorized a black-box engagement. Your first phase is passive footprinting: map the target\'s registrar, name servers, mail infrastructure, third-party dependencies, and any internal hosts leaked through DNS -- using only name-service reconnaissance. Every value you discover with whois and dig is a flag. Find them in the tool output, then submit them.',
    difficulty:  'Beginner',
    estimatedTime: 30,
    accent:      '#9333ea',

    storageKey:  'hexworth_lab_dark_arts_ceh_01_recon',
    registryId:  'dark-arts-ceh-01-recon',
    trackerKey:  'lab_dark_arts_ceh_01_recon',

    // Terminal-only box (no BlueTeam SOC devices), so blueTeamMode is
    // omitted -- index.html does not load BlueTeam.js.

    boot: {
        biosLines: [
            'THE PROVING GROUNDS -- OFFENSIVE RECON WORKSTATION',
            'Engagement: MeridianTech Corp (AUTHORIZED -- scope: passive footprinting)',
            'Parrot Security OS 6.1: LOADING',
            'Recon toolkit: whois / dig / nslookup / host -- READY',
            'Engagement ticket: PG-CEH-01 -- ACTIVE',
            'Rules of Engagement: acknowledgment required (see briefing)'
        ],
        grubEntries: [
            'Parrot Security OS 6.1 (Operator)',
            'Parrot Security OS 6.1 (recovery mode)'
        ],
        loginUser: 'operator'
    },

    // =========================================================
    // LORE  (RoE folded into the intro -- authorized-use gate)
    // =========================================================

    lore: {
        intro: 'RULES OF ENGAGEMENT -- READ BEFORE YOU BEGIN. This is a sanctioned training engagement against MeridianTech Corp (meridiantech-corp.example), a FICTIONAL company. Every whois record, DNS answer, IP, and hostname in this box is synthetic and served locally -- no traffic leaves your machine and no real host is ever contacted. The techniques you practice here (WHOIS lookups, DNS interrogation, zone transfers) are legal ONLY against systems you own or are contracted in writing to test. Running them against a real target without signed authorization is unauthorized access under the Computer Fraud and Abuse Act (CFAA) and equivalent laws worldwide, regardless of intent. By starting this lab you acknowledge you will use these skills only within authorized scope.',

        scenario: 'You are the recon lead on a black-box penetration test of MeridianTech Corp. Before any active scanning, you footprint the target purely through public name-service data. Your terminal has the standard recon toolkit. Work from the domain outward: identify who registered it, which name servers are authoritative, where its mail is handled, which services are outsourced to third parties, and -- if any name server is misconfigured -- what internal infrastructure the DNS zone leaks. The engagement brief (/home/operator/engagement_brief.txt) names the categories to enumerate; the specific values live in the tool output, not the brief.',

        outro: 'Passive footprint complete. You pulled the registrar and its IANA ID from WHOIS, identified the primary authoritative name server from the SOA record, chained an MX lookup into an A record to find the mail server\'s real IP, exposed a VPN endpoint outsourced to a third-party edge provider via its CNAME, and -- the payoff -- performed a DNS zone transfer against a misconfigured secondary name server, dumping the full zone and revealing an internal build server that no ordinary lookup would ever surface. This is exactly why AXFR must be restricted to authorized secondaries: one misconfigured NS hands an attacker the internal network map. Recon phase closed; the target profile is ready for the next stage.',

        goals: [
            'Identify the domain registrar and its IANA ID from the WHOIS record',
            'Identify the primary authoritative name server (the SOA MNAME) for the domain',
            'Find the real IP address of the mail server (chain the MX record into an A lookup)',
            'Find the third-party edge host the VPN endpoint is aliased to (its CNAME target)',
            'Perform a DNS zone transfer against the misconfigured name server and find the leaked internal build server'
        ],

        toolkit: [
            { name: 'whois', purpose: 'Query domain registration (registrar, IANA ID, name servers)', sample: 'whois meridiantech-corp.example' },
            { name: 'dig',   purpose: 'Interrogate DNS records by type',                              sample: 'dig MX meridiantech-corp.example' },
            { name: 'dig (SOA)', purpose: 'Read the Start of Authority record (names the primary NS)', sample: 'dig SOA meridiantech-corp.example' },
            { name: 'dig (AXFR)', purpose: 'Attempt a full DNS zone transfer from a name server',     sample: 'dig axfr @ns2.meridiantech-corp.example meridiantech-corp.example' },
            { name: 'nslookup', purpose: 'Alternate resolver (interactive-style lookups)',            sample: 'nslookup meridiantech-corp.example' },
            { name: 'host',  purpose: 'Quick one-line DNS answers',                                   sample: 'host vpn.meridiantech-corp.example' },
            { name: 'cat',   purpose: 'Read a local file (engagement brief, notes)',                  sample: 'cat /home/operator/engagement_brief.txt' },
            { name: 'help',  purpose: 'Show available commands',                                       sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'operator',
        hostname: 'recon-01',
        startDir: '/home/operator',
        welcome:  'The Proving Grounds -- Offensive Recon Workstation\nEngagement PG-CEH-01 | Target: meridiantech-corp.example (AUTHORIZED, fictional)\n\nRecon toolkit:\n  whois <domain>            Registrar / IANA ID / name servers\n  dig [TYPE] <name>         DNS records (A, AAAA, MX, NS, SOA, CNAME, TXT, ANY)\n  dig axfr @<ns> <domain>   Attempt a full DNS zone transfer\n  nslookup <name>           Alternate resolver\n  host <name>               Quick one-line answers\n\nEngagement brief: /home/operator/engagement_brief.txt\n\nDiscover each value in the tool output. Submit it via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS  (Terminal + notes + hints + flag submit)
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: 'T', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: 'N', app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: 'H', app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: 'S', app: 'flags'    }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //   /home/operator/engagement_brief.txt  -- names the CATEGORIES to
    //       enumerate (registrar, name servers, mail, third-party, zone
    //       transfer), NOT the values.
    //   /home/operator/notes.txt             -- scratch pad.
    //   /home/operator/osint/job_posting.txt -- OSINT flavor: a MeridianTech
    //       job ad mentioning an internal "CI/CD build pipeline" (motivates
    //       the AXFR) WITHOUT naming the internal hostname (no pre-give).
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'operator': {
                            type: 'dir',
                            children: {

                                'engagement_brief.txt': {
                                    type: 'file',
                                    content:
`ENGAGEMENT PG-CEH-01 -- PASSIVE FOOTPRINTING BRIEF
==================================================
Target : meridiantech-corp.example  (FICTIONAL, authorized scope)
Phase  : Passive reconnaissance ONLY. No active scanning, no exploitation.

Enumerate the following categories using name-service recon only.
The specific values are NOT in this brief -- you must discover them
with your tools (whois / dig / nslookup / host).

  [1] Registrar   -- who registered the domain, and the registrar's
                     numeric IANA ID.
  [2] Authority   -- the PRIMARY authoritative name server (the server
                     named in the zone's SOA record).
  [3] Mail        -- the real IP address of the domain's mail server.
                     (Find the MX host first, then resolve its A record.)
  [4] Third party -- the external edge host the corporate VPN endpoint
                     is outsourced to (follow its CNAME).
  [5] Zone leak   -- if any authoritative name server permits a zone
                     transfer (AXFR), dump the full zone and identify
                     any INTERNAL host that ordinary lookups cannot see.

Submit each discovered value in the Submit Flag panel.

SUBMISSION FORMAT: dig prints fully-qualified names with a trailing dot
(e.g. ns1.example.). Submit hostnames WITHOUT that trailing dot; submit
IPs as a plain dotted-quad and the IANA ID as digits only. Answers are
matched case-insensitively.
`
                                },

                                'notes.txt': {
                                    type: 'file',
                                    content: 'operator scratch pad\n---\nstart with whois, then map the zone with dig.\nremember: NS list != primary. the SOA MNAME is the primary.\nif one name server refuses AXFR, try the others.\n'
                                },

                                'osint': {
                                    type: 'dir',
                                    children: {
                                        'job_posting.txt': {
                                            type: 'file',
                                            content:
`SAVED OSINT ARTIFACT -- MeridianTech Corp careers page (public)
---------------------------------------------------------------
"Senior DevOps Engineer -- MeridianTech Corp

 You will own our internal CI/CD build pipeline (Jenkins), maintain
 our self-hosted GitLab, and manage deployment automation across the
 dev and staging environments. Experience administering internal
 build servers behind the corporate perimeter is required."

RECON NOTE: MeridianTech runs internal build infrastructure. None of
it should appear in public DNS -- but a misconfigured name server that
allows zone transfers would leak the internal names anyway. Worth an
AXFR attempt against each authoritative NS.
`
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // CUSTOM COMMANDS -- the recon toolkit
    //   Each returns a STRING (Terminal.js appends it as output).
    //   whois / dig / nslookup / host are NOT Terminal builtins,
    //   so they are defined here. cat / ls / grep / help are builtin.
    // =========================================================

    commands: {

        // ── whois ─────────────────────────────────────────────
        'whois': function(args, term, engine) {
            var domain = (args[0] || '').toLowerCase().replace(/\.$/, '');
            if (!domain) {
                return 'Usage: whois <domain>\nExample: whois meridiantech-corp.example';
            }
            if (domain !== 'meridiantech-corp.example') {
                return 'No whois server is known for this kind of object.\n(Only the authorized engagement target meridiantech-corp.example is in scope.)';
            }
            return [
                '% IANA WHOIS server / registrar referral (thin model)',
                '',
                'Domain Name: MERIDIANTECH-CORP.EXAMPLE',
                'Registry Domain ID: 118822_DOMAIN_EXAMPLE-VRSN',
                'Registrar WHOIS Server: whois.corporatedomains.com',
                'Registrar URL: http://cscdbs.com',
                'Updated Date: 2026-02-11T10:04:02Z',
                'Creation Date: 2011-06-30T00:00:00Z',
                'Registry Expiry Date: 2027-06-30T00:00:00Z',
                'Registrar: CSC Corporate Domains, Inc.',
                'Registrar IANA ID: 299',
                'Registrar Abuse Contact Email: domainabuse@cscglobal.example',
                'Registrar Abuse Contact Phone: +1.8887802723',
                'Domain Status: clientTransferProhibited',
                'Name Server: NS1.MERIDIANTECH-CORP.EXAMPLE',
                'Name Server: NS2.MERIDIANTECH-CORP.EXAMPLE',
                'DNSSEC: unsigned',
                '',
                '>>> This registrar returns a THIN response: registrant, admin,',
                '>>> and technical contact records are NOT disclosed here. Query',
                '>>> the registrar WHOIS server directly for full contact detail.',
                ''
            ].join('\n');
        },

        // ── dig ───────────────────────────────────────────────
        // Supports:  dig <name>              (defaults to A)
        //            dig <TYPE> <name>       and  dig <name> <TYPE>
        //            dig @<server> <name> [TYPE]
        //            dig axfr @<server> <domain>   (zone transfer)
        'dig': function(args, term, engine) {
            if (!args.length) {
                return 'Usage: dig [TYPE] <name>\n       dig axfr @<nameserver> <domain>\nTYPE: A AAAA MX NS SOA CNAME TXT ANY\nExample: dig MX meridiantech-corp.example';
            }

            var TYPES = ['A', 'AAAA', 'MX', 'NS', 'SOA', 'CNAME', 'TXT', 'ANY', 'AXFR'];
            var type = '', name = '', server = '';
            args.forEach(function(a) {
                if (a.charAt(0) === '@') { server = a.slice(1).toLowerCase().replace(/\.$/, ''); return; }
                if (TYPES.indexOf(a.toUpperCase()) !== -1) { type = a.toUpperCase(); return; }
                if (!name) { name = a.toLowerCase().replace(/\.$/, ''); }
            });
            if (!type) type = 'A';

            // ── Zone transfer (AXFR) ──────────────────────────
            if (type === 'AXFR') {
                if (name !== 'meridiantech-corp.example') {
                    return '; <<>> DiG 9.18 <<>> axfr ' + (name || '(no zone)') + '\n;; Transfer failed: this box only serves the meridiantech-corp.example zone.';
                }
                // ns1 (and the default) REFUSE the transfer. Only the
                // misconfigured secondary ns2 allows it.
                var ns2 = (server === 'ns2.meridiantech-corp.example' || server === '203.0.113.53');
                if (!ns2) {
                    var against = server ? ('@' + server) : '(default resolver)';
                    return [
                        '; <<>> DiG 9.18 <<>> axfr @' + (server || 'ns1.meridiantech-corp.example') + ' meridiantech-corp.example',
                        ';; global options: +cmd',
                        ';; Transfer failed.',
                        ';; ' + (server || 'ns1.meridiantech-corp.example') + ' refused the zone transfer (REFUSED).',
                        ';; The primary name server restricts AXFR to authorized secondaries.',
                        ';; Try the other authoritative name server(s) listed in the NS records.'
                    ].join('\n');
                }
                // ns2 is misconfigured -> full zone dump (the payoff).
                return [
                    '; <<>> DiG 9.18 <<>> axfr @ns2.meridiantech-corp.example meridiantech-corp.example',
                    ';; global options: +cmd',
                    'meridiantech-corp.example.            3600 IN SOA    ns1.meridiantech-corp.example. hostmaster.meridiantech-corp.example. 2026021101 7200 3600 1209600 3600',
                    'meridiantech-corp.example.            3600 IN NS     ns1.meridiantech-corp.example.',
                    'meridiantech-corp.example.            3600 IN NS     ns2.meridiantech-corp.example.',
                    'meridiantech-corp.example.            3600 IN A      198.51.100.10',
                    'meridiantech-corp.example.            3600 IN MX     10 mail.meridiantech-corp.example.',
                    'meridiantech-corp.example.            3600 IN TXT    "v=spf1 include:_spf.mailhost.example ~all"',
                    'ns1.meridiantech-corp.example.        3600 IN A      198.51.100.53',
                    'ns2.meridiantech-corp.example.        3600 IN A      203.0.113.53',
                    'mail.meridiantech-corp.example.       3600 IN A      198.51.100.25',
                    'www.meridiantech-corp.example.        3600 IN CNAME  meridiantech-corp.example.',
                    'vpn.meridiantech-corp.example.        3600 IN CNAME  edge.cloudhost-dns.example.',
                    '; --- records below are INTERNAL and should never be in public DNS ---',
                    'jenkins-ci.dev.meridiantech-corp.example. 3600 IN A   10.20.30.40',
                    'gitlab.dev.meridiantech-corp.example.     3600 IN A   10.20.30.41',
                    'staging.dev.meridiantech-corp.example.    3600 IN A   10.20.30.50',
                    'vpn-admin.corp.meridiantech-corp.example. 3600 IN A   10.20.10.5',
                    'meridiantech-corp.example.            3600 IN SOA    ns1.meridiantech-corp.example. hostmaster.meridiantech-corp.example. 2026021101 7200 3600 1209600 3600',
                    ';; Transfer completed: 16 records from ns2.meridiantech-corp.example (203.0.113.53) in 41 ms',
                    '',
                    '>>> AXFR SUCCEEDED. ns2 is a misconfigured secondary that allows',
                    '>>> unrestricted zone transfers. The dev/ and corp/ hosts above are',
                    '>>> internal-only and are NOT resolvable by any ordinary public lookup.'
                ].join('\n');
            }

            // ── Normal record lookups ─────────────────────────
            if (!name) return ';; no name to look up. Usage: dig [TYPE] <name>';

            var header = [
                '; <<>> DiG 9.18 <<>> ' + type + ' ' + name,
                ';; global options: +cmd',
                ';; Got answer:',
                ';; ->>HEADER<<- opcode: QUERY, status: NOERROR',
                '',
                ';; QUESTION SECTION:',
                ';' + name + '.\t\t\tIN\t' + type,
                '',
                ';; ANSWER SECTION:'
            ];
            var ans = [];

            function A(host) {
                var map = {
                    'meridiantech-corp.example':            '198.51.100.10',
                    'ns1.meridiantech-corp.example':        '198.51.100.53',
                    'ns2.meridiantech-corp.example':        '203.0.113.53',
                    'mail.meridiantech-corp.example':       '198.51.100.25',
                    'jenkins-ci.dev.meridiantech-corp.example': '10.20.30.40',
                    'gitlab.dev.meridiantech-corp.example':     '10.20.30.41',
                    'staging.dev.meridiantech-corp.example':    '10.20.30.50',
                    'vpn-admin.corp.meridiantech-corp.example': '10.20.10.5'
                };
                return map[host] || null;
            }

            if (type === 'A' || type === 'ANY') {
                // www and vpn are CNAMEs -> resolve through
                if (name === 'www.meridiantech-corp.example') {
                    ans.push('www.meridiantech-corp.example.\t3600\tIN\tCNAME\tmeridiantech-corp.example.');
                    ans.push('meridiantech-corp.example.\t3600\tIN\tA\t198.51.100.10');
                } else if (name === 'vpn.meridiantech-corp.example') {
                    ans.push('vpn.meridiantech-corp.example.\t3600\tIN\tCNAME\tedge.cloudhost-dns.example.');
                    ans.push('edge.cloudhost-dns.example.\t3600\tIN\tA\t198.51.100.200');
                } else {
                    var ip = A(name);
                    if (ip) ans.push(name + '.\t3600\tIN\tA\t' + ip);
                }
            }
            if (type === 'NS' || type === 'ANY') {
                if (name === 'meridiantech-corp.example') {
                    ans.push('meridiantech-corp.example.\t3600\tIN\tNS\tns1.meridiantech-corp.example.');
                    ans.push('meridiantech-corp.example.\t3600\tIN\tNS\tns2.meridiantech-corp.example.');
                }
            }
            if (type === 'SOA' || type === 'ANY') {
                if (name === 'meridiantech-corp.example') {
                    ans.push('meridiantech-corp.example.\t3600\tIN\tSOA\tns1.meridiantech-corp.example. hostmaster.meridiantech-corp.example. 2026021101 7200 3600 1209600 3600');
                }
            }
            if (type === 'MX' || type === 'ANY') {
                if (name === 'meridiantech-corp.example') {
                    ans.push('meridiantech-corp.example.\t3600\tIN\tMX\t10 mail.meridiantech-corp.example.');
                }
            }
            if (type === 'CNAME' || type === 'ANY') {
                if (name === 'vpn.meridiantech-corp.example') {
                    ans.push('vpn.meridiantech-corp.example.\t3600\tIN\tCNAME\tedge.cloudhost-dns.example.');
                } else if (name === 'www.meridiantech-corp.example') {
                    ans.push('www.meridiantech-corp.example.\t3600\tIN\tCNAME\tmeridiantech-corp.example.');
                }
            }
            if (type === 'TXT' || type === 'ANY') {
                if (name === 'meridiantech-corp.example') {
                    ans.push('meridiantech-corp.example.\t3600\tIN\tTXT\t"v=spf1 include:_spf.mailhost.example ~all"');
                }
            }
            if (type === 'AAAA') {
                // No IPv6 published for this target.
                ans = [];
            }

            var footer;
            if (ans.length) {
                footer = ['', ';; Query time: 24 msec', ';; SERVER: 198.51.100.53#53(ns1.meridiantech-corp.example)', ';; MSG SIZE  rcvd: ' + (80 + ans.length * 20)];
            } else {
                // NXDOMAIN / no records: an ordinary lookup cannot see
                // internal-only names, which is the whole point of AXFR.
                header[3] = ';; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN';
                footer = ['', ';; No ' + type + ' record found for ' + name + '.', ';; (Internal names are not published in public DNS -- try a zone transfer.)'];
            }
            return header.concat(ans).concat(footer).join('\n');
        },

        // ── nslookup ──────────────────────────────────────────
        'nslookup': function(args, term, engine) {
            var name = (args[0] || '').toLowerCase().replace(/\.$/, '');
            if (!name) return 'Usage: nslookup <name>\nExample: nslookup mail.meridiantech-corp.example';
            var map = {
                'meridiantech-corp.example':      '198.51.100.10',
                'ns1.meridiantech-corp.example':  '198.51.100.53',
                'ns2.meridiantech-corp.example':  '203.0.113.53',
                'mail.meridiantech-corp.example': '198.51.100.25'
            };
            var head = 'Server:\t\t198.51.100.53\nAddress:\t198.51.100.53#53\n\n';
            if (name === 'vpn.meridiantech-corp.example') {
                return head + 'vpn.meridiantech-corp.example\tcanonical name = edge.cloudhost-dns.example.\nName:\tedge.cloudhost-dns.example\nAddress: 198.51.100.200';
            }
            if (name === 'www.meridiantech-corp.example') {
                return head + 'www.meridiantech-corp.example\tcanonical name = meridiantech-corp.example.\nName:\tmeridiantech-corp.example\nAddress: 198.51.100.10';
            }
            if (map[name]) {
                return head + 'Name:\t' + name + '\nAddress: ' + map[name];
            }
            return head + '** server can\'t find ' + name + ': NXDOMAIN\n(Internal names are not in public DNS -- try a zone transfer.)';
        },

        // ── host ──────────────────────────────────────────────
        'host': function(args, term, engine) {
            var name = (args[0] || '').toLowerCase().replace(/\.$/, '');
            if (!name) return 'Usage: host <name>\nExample: host vpn.meridiantech-corp.example';
            if (name === 'meridiantech-corp.example') {
                return 'meridiantech-corp.example has address 198.51.100.10\nmeridiantech-corp.example mail is handled by 10 mail.meridiantech-corp.example.';
            }
            if (name === 'vpn.meridiantech-corp.example') {
                return 'vpn.meridiantech-corp.example is an alias for edge.cloudhost-dns.example.\nedge.cloudhost-dns.example has address 198.51.100.200';
            }
            if (name === 'www.meridiantech-corp.example') {
                return 'www.meridiantech-corp.example is an alias for meridiantech-corp.example.\nmeridiantech-corp.example has address 198.51.100.10';
            }
            var m = {
                'ns1.meridiantech-corp.example':  '198.51.100.53',
                'ns2.meridiantech-corp.example':  '203.0.113.53',
                'mail.meridiantech-corp.example': '198.51.100.25'
            };
            if (m[name]) return name + ' has address ' + m[name];
            return 'Host ' + name + ' not found: 3(NXDOMAIN)\n(Not in public DNS -- an internal name would only appear in a zone transfer.)';
        }
    },

    // =========================================================
    // FLAGS  (700 pts total; base == sum of points)
    // =========================================================

    flags: [
        {
            id:          'registrar_iana_id',
            points:      100,
            label:       'Registrar IANA ID',
            description: 'The numeric IANA ID of the domain\'s registrar. Run whois against the target and read the "Registrar IANA ID" field. Submit the number only (digits, no label).'
        },
        {
            id:          'primary_nameserver',
            points:      100,
            label:       'Primary Name Server (SOA MNAME)',
            description: 'The PRIMARY authoritative name server for the domain -- the hostname in the MNAME field of the SOA record (not just any server in the NS list). Query the SOA record with dig. Submit the fully-qualified hostname exactly (e.g. nsX.example.tld), no trailing dot.'
        },
        {
            id:          'mail_server_ip',
            points:      150,
            label:       'Mail Server IP',
            description: 'The real IPv4 address of the domain\'s mail server. The MX record names the mail HOST, not its IP -- resolve that host\'s A record to get the address. Submit the IPv4 address only (e.g. x.x.x.x).'
        },
        {
            id:          'vpn_cname_target',
            points:      150,
            label:       'VPN Third-Party Edge Host',
            description: 'The external host the corporate VPN endpoint (vpn.<domain>) is outsourced to -- the CNAME target it is aliased to. Look up the CNAME of the vpn hostname. Submit the fully-qualified target hostname exactly, no trailing dot.'
        },
        {
            id:          'internal_ci_host',
            points:      200,
            label:       'Leaked Internal Build Server',
            description: 'The internal CI/CD build server exposed by a DNS zone transfer. One authoritative name server is misconfigured and permits AXFR -- transfer the zone from it, then find the internal build/CI host in the dump (an RFC 1918 10.x address that no ordinary lookup can resolve). Submit its fully-qualified hostname exactly, no trailing dot.'
        }
    ],

    scoring: {
        base:              700,
        minScore:          0,
        maxScore:          700,
        hintPenalty:       true,
        wrongFlagPenalty:  -25,
        speedBonus:        { threshold: 1500000, points: 100 },
        timeBonusThreshold: 1800
    },

    // =========================================================
    // HINTS  (3 per flag, progressive; only hint 3 uses {{FLAG:id}})
    // =========================================================

    hints: [
        // ── registrar_iana_id ─────────────────────────────────
        { id: 'hint_iana_1', flagId: 'registrar_iana_id', cost: 25, penalty: -25,
          text: 'The registrar and its identifiers come from WHOIS, not DNS. Run whois against the target domain and read the response.' },
        { id: 'hint_iana_2', flagId: 'registrar_iana_id', cost: 50, penalty: -50,
          text: 'Run: whois meridiantech-corp.example\n\nIn the response, find the line labeled "Registrar IANA ID". Every ICANN-accredited registrar has a unique numeric IANA ID. Submit the number on that line -- not the registrar name.' },
        { id: 'hint_iana_3', flagId: 'registrar_iana_id', cost: 75, penalty: -75,
          text: 'The whois record shows "Registrar: CSC Corporate Domains, Inc." with its IANA ID directly below. Submit just the digits.\n\nThe value to submit: {{FLAG:registrar_iana_id}}' },

        // ── primary_nameserver ────────────────────────────────
        { id: 'hint_ns_1', flagId: 'primary_nameserver', cost: 25, penalty: -25,
          text: 'The domain has more than one authoritative name server (the NS records list all of them). But only ONE is the primary -- the source of authority. That is recorded in a different record type.' },
        { id: 'hint_ns_2', flagId: 'primary_nameserver', cost: 50, penalty: -50,
          text: 'Run: dig SOA meridiantech-corp.example\n\nThe SOA (Start of Authority) record\'s FIRST field is the MNAME -- the primary master name server for the zone. Submit that hostname (drop any trailing dot).' },
        { id: 'hint_ns_3', flagId: 'primary_nameserver', cost: 75, penalty: -75,
          text: 'In the SOA answer, the MNAME (first field after "SOA") is the primary. The NS list also contains a secondary -- do not submit that one.\n\nThe value to submit: {{FLAG:primary_nameserver}}' },

        // ── mail_server_ip ────────────────────────────────────
        { id: 'hint_mail_1', flagId: 'mail_server_ip', cost: 25, penalty: -25,
          text: 'Mail routing is in the MX record, but MX gives you the mail server\'s NAME, not its IP. You will need two lookups: first the MX, then resolve the host it points to.' },
        { id: 'hint_mail_2', flagId: 'mail_server_ip', cost: 50, penalty: -50,
          text: 'Run: dig MX meridiantech-corp.example  (find the mail host name)\nThen:  dig A mail.meridiantech-corp.example  (resolve it to an IP)\n\nThe mail server\'s A record holds the address. Note it is a DIFFERENT IP than the domain apex A record. Submit the mail host\'s IP.' },
        { id: 'hint_mail_3', flagId: 'mail_server_ip', cost: 75, penalty: -75,
          text: 'The MX points to mail.meridiantech-corp.example; its A record is the answer (not the apex 198.51.100.10). Submit the mail host\'s IPv4 address.\n\nThe value to submit: {{FLAG:mail_server_ip}}' },

        // ── vpn_cname_target ──────────────────────────────────
        { id: 'hint_vpn_1', flagId: 'vpn_cname_target', cost: 25, penalty: -25,
          text: 'Some hostnames are not real servers -- they are aliases (CNAMEs) pointing to third-party infrastructure. The VPN endpoint vpn.<domain> is one of them. Find what it is aliased to.' },
        { id: 'hint_vpn_2', flagId: 'vpn_cname_target', cost: 50, penalty: -50,
          text: 'Run: dig CNAME vpn.meridiantech-corp.example  (or: host vpn.meridiantech-corp.example)\n\nThe answer shows the canonical name the VPN endpoint is outsourced to -- a host in a different, third-party domain. Submit that target hostname.' },
        { id: 'hint_vpn_3', flagId: 'vpn_cname_target', cost: 75, penalty: -75,
          text: 'vpn.meridiantech-corp.example is a CNAME to an external edge provider\'s host (a different domain entirely). Submit the full target hostname, no trailing dot.\n\nThe value to submit: {{FLAG:vpn_cname_target}}' },

        // ── internal_ci_host ──────────────────────────────────
        { id: 'hint_ci_1', flagId: 'internal_ci_host', cost: 25, penalty: -25,
          text: 'Ordinary lookups only return names the target chose to publish. Internal hosts stay hidden -- UNLESS a name server is misconfigured to allow a full zone transfer (AXFR). The saved OSINT job posting hints the company runs an internal CI/CD build pipeline worth finding.' },
        { id: 'hint_ci_2', flagId: 'internal_ci_host', cost: 50, penalty: -50,
          text: 'Try a zone transfer against each authoritative name server you found in the NS records. The syntax is:\n  dig axfr @<name-server> meridiantech-corp.example\n\nOne of the two name servers refuses the transfer; the other -- the secondary -- is misconfigured and dumps the entire zone, including internal dev/ hosts. In that dump, find the CI / build server: a Jenkins host on a 10.x (RFC 1918) internal address.' },
        { id: 'hint_ci_3', flagId: 'internal_ci_host', cost: 75, penalty: -75,
          text: 'In the AXFR dump from ns2, the internal build server is the jenkins CI host under the dev. subdomain, pointing at a 10.20.30.x address. Submit its full hostname, no trailing dot.\n\nThe value to submit: {{FLAG:internal_ci_host}}' }
    ],

    // =========================================================
    // CERT OBJECTIVES  (CEH v12 312-50, Module 02)
    // =========================================================

    certObjectives: {
        certPath: 'EC-Council CEH v12 (312-50)',
        mappings: [
            { flagId: 'registrar_iana_id',  objective: 'Module 02 -- Footprinting through WHOIS',
              description: 'Footprinting and Reconnaissance -- gather registrar and ownership intelligence via WHOIS',
              skill: 'Reading a WHOIS record to extract registrar identity and IANA ID (thin vs thick model)' },
            { flagId: 'primary_nameserver', objective: 'Module 02 -- DNS Footprinting',
              description: 'Footprinting and Reconnaissance -- enumerate authoritative DNS infrastructure',
              skill: 'Distinguishing the primary name server (SOA MNAME) from the full NS record set' },
            { flagId: 'mail_server_ip',     objective: 'Module 02 -- DNS Footprinting',
              description: 'Footprinting and Reconnaissance -- map mail infrastructure from DNS',
              skill: 'Chaining an MX lookup into an A-record resolution to obtain a mail server IP' },
            { flagId: 'vpn_cname_target',   objective: 'Module 02 -- DNS Footprinting',
              description: 'Footprinting and Reconnaissance -- identify outsourced / third-party dependencies',
              skill: 'Following CNAME aliases to reveal third-party hosting of a corporate service' },
            { flagId: 'internal_ci_host',   objective: 'Module 02 -- DNS Zone Transfer (AXFR)',
              description: 'Footprinting and Reconnaissance -- exploit a misconfigured name server to map internal hosts',
              skill: 'Performing a DNS zone transfer against a permissive secondary NS to enumerate internal infrastructure' }
        ]
    },

    // =========================================================
    // STATE RESET  (BOX-006 pattern -- idempotent on script load)
    // =========================================================

    resetState: function() {
        // Pure find-and-submit box: BoxEngine tracks flag state itself.
    }

};

// Auto-reset on load (BOX-006 backfill pattern).
if (window.CEHReconConfig) window.CEHReconConfig.resetState();
