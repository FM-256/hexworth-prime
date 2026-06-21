/* ============================================================
   Security+ Cert Prep -- Quantitative Risk Analysis: Veridian Financial
   Blue-team risk quantification | compute-and-submit flags
   Students read asset and threat figures from evidence files,
   apply SLE/ALE formulas, and submit the computed values as flags.
   No answer is printed in the lab -- the student must compute each one.
   SY0-701: 5.2 (quantitative risk analysis), 5.1 (risk identification)
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VRQConfig after this script has loaded.
window.VRQConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:            'shield-sp-blueteam-risk-quant',
    title:         'Quantitative Risk Analysis',
    subtitle:      'Veridian Financial -- Risk Register Worksheet',
    description:   'Veridian Financial has asked you to quantify the risk exposure for its primary transaction-processing server. You will read the asset and threat figures from the risk register files, apply quantitative risk formulas (SLE, ALE, post-control ALE), and determine whether the proposed safeguard is cost-justified.',
    difficulty:    'Beginner',
    estimatedTime: 25,
    accent:        '#2563eb',
    storageKey:    'hexworth_lab_sp_blueteam_risk_quant',
    registryId:    'shield-sp-blueteam-risk-quant',
    trackerKey:    'lab_sp_blueteam_risk_quant',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL RISK MGMT WORKSTATION v1.9.0',
            'Risk Management Analyst -- Tier-1 Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Risk register mount: /home/analyst -- READY',
            'Assessment date: 2026-09-15',
            'Ticket: RM-2026-0915-003 -- AWAITING QUANTIFICATION'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (Risk Mgmt Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    //
    // ANTI-LEAK: lore describes the TASK (compute, submit) and
    // the CONTEXT (Veridian Financial, ransomware threat) but
    // contains NO computed values (SLE/ALE/reduction are not
    // mentioned here -- only the input figures appear in the
    // evidence files the student reads).
    // =========================================================

    lore: {
        intro: 'RM-2026-0915-003 just landed in your queue: "Quantitative risk assessment required for TXPROC-01 (primary transaction-processing server) -- ransomware threat scenario. Management needs SLE, ALE, post-control figures, and a cost-justification decision before the safeguard budget can be approved." The risk register files are in /home/analyst/.',

        scenario: 'Veridian Financial runs TXPROC-01 as the hub for all payment processing. The threat model identifies ransomware as the primary risk scenario. The Risk Management team has collected the asset value, exposure factor, annualized rate of occurrence, and a proposed safeguard with its cost and expected post-control exposure factor. Your job is to open the evidence files, plug the figures into the quantitative risk formulas, and submit each computed value as a flag. The formulas are in /home/analyst/formulas.txt if you need a reference.',

        outro: 'Risk quantification complete. You correctly computed SLE, pre- and post-control ALE, the ALE reduction, and determined whether the safeguard justifies its annual cost. This is the core skill SY0-701 Domain 5 tests: given raw asset and threat figures, produce a defensible risk register entry that management can act on.',

        goals: [
            'Read /home/analyst/risk_data.txt to find all input figures',
            'Compute SLE = Asset Value x Exposure Factor',
            'Compute ALE = SLE x Annualized Rate of Occurrence',
            'Compute post-control ALE using the post-control Exposure Factor',
            'Determine whether ALE reduction exceeds the annual safeguard cost'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full file',              sample: 'cat /home/analyst/risk_data.txt'  },
            { name: 'cat',  purpose: 'Display the formula reference',    sample: 'cat /home/analyst/formulas.txt'   },
            { name: 'grep', purpose: 'Search for a value in a file',     sample: 'grep "Asset Value" /home/analyst/risk_data.txt' },
            { name: 'ls',   purpose: 'List files in a directory',        sample: 'ls /home/analyst/'                },
            { name: 'help', purpose: 'Show available commands',          sample: 'help'                             }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'risk-ws-01',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- Risk Management Analyst Terminal\nTier-1 Access | RM-2026-0915-003 Active\n\nRisk register files:\n  /home/analyst/risk_data.txt    Asset and threat input figures\n  /home/analyst/formulas.txt     Formula reference (SLE, ALE, cost-benefit)\n  /home/analyst/task.txt         Task brief -- what to compute and submit\n\nRead the files, compute each value, submit via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: 'T', app: 'terminal'  },
            { id: 'logviewer', label: 'Log Viewer',  icon: 'L', app: 'logviewer' },
            { id: 'notes',     label: 'Notes',       icon: 'N', app: 'notes'     },
            { id: 'hints',     label: 'Hints',       icon: 'H', app: 'hints'     },
            { id: 'flags',     label: 'Submit Flag', icon: 'F', app: 'flags'     }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/
    //   risk_data.txt    -- input figures only (AV, EF, ARO, safeguard cost,
    //                       post-control EF); NO computed values printed here
    //   formulas.txt     -- formula reference beginner can follow
    //   task.txt         -- what to compute; answers described as "what to compute"
    //                       not "what the answer is"
    //   notes.txt        -- scratch pad
    //
    // ANTI-LEAK CHECK:
    //   risk_data.txt    -- contains ONLY inputs (AV=$500,000, EF=40%, ARO=2,
    //                       safeguard_cost=$60,000, post_control_EF=10%).
    //                       Computed values (SLE=$200,000, ALE=$400,000, etc.)
    //                       do NOT appear in any file except the final
    //                       {{FLAG:id}} reveal hints below.
    //   task.txt         -- describes WHAT to compute; no numeric answers.
    //   formulas.txt     -- generic formulas only; no worked example with answers.
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {

                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {

                                // ── RISK DATA (input figures) ─────────────────────────
                                // Contains ONLY the raw inputs. No computed values.
                                // The student reads these numbers and applies the formulas.
                                'risk_data.txt': {
                                    type: 'file',
                                    content: [
                                        'VERIDIAN FINANCIAL -- QUANTITATIVE RISK REGISTER',
                                        '================================================',
                                        'Assessment Date : 2026-09-15',
                                        'Analyst         : (you)',
                                        'Ticket          : RM-2026-0915-003',
                                        '',
                                        'ASSET UNDER ASSESSMENT',
                                        '  Asset Name           : TXPROC-01 (Primary Transaction-Processing Server)',
                                        '  Asset Value (AV)     : $500,000',
                                        '',
                                        'THREAT SCENARIO: Ransomware Encryption of TXPROC-01',
                                        '  Exposure Factor (EF) : 40%',
                                        '    (The fraction of the asset value estimated to be lost per incident.)',
                                        '    (A ransomware event is expected to destroy or lock 40% of the asset.)',
                                        '  Annualized Rate of   : 2',
                                        '  Occurrence (ARO)       (The threat is expected to materialize twice per year',
                                        '                          based on industry threat intelligence and past incidents.)',
                                        '',
                                        'PROPOSED SAFEGUARD: Immutable Backup System with Offline Replication',
                                        '  Safeguard Annual     : $60,000',
                                        '  Cost                   (Licensing, storage hardware, and support per year.)',
                                        '  Post-Control         : 10%',
                                        '  Exposure Factor        (If ransomware still strikes, only 10% of the asset',
                                        '                          value is expected to be lost because backups allow',
                                        '                          rapid recovery. ARO is unchanged at 2.)',
                                        '',
                                        '================================================',
                                        'NOTE: Compute each risk value using the formulas in formulas.txt.',
                                        'Submit computed values as flags via the Submit Flag panel.',
                                        'Submit all monetary values as plain integers (no $ sign, no commas).',
                                        'Submit the safeguard_justified flag as exactly "yes" or "no".',
                                        '================================================'
                                    ].join('\n')
                                },

                                // ── FORMULA REFERENCE ─────────────────────────────────
                                // Generic formulas and definitions only.
                                // No worked numeric example that would give away the answers.
                                'formulas.txt': {
                                    type: 'file',
                                    content: [
                                        'QUANTITATIVE RISK ANALYSIS -- FORMULA REFERENCE',
                                        '================================================',
                                        '',
                                        'CORE FORMULAS',
                                        '',
                                        '  SLE = AV x EF',
                                        '  (Single Loss Expectancy)',
                                        '  The expected dollar loss from a SINGLE occurrence of the threat.',
                                        '  AV  = Asset Value (in dollars)',
                                        '  EF  = Exposure Factor (as a decimal; e.g., 40% = 0.40)',
                                        '',
                                        '  ALE = SLE x ARO',
                                        '  (Annualized Loss Expectancy)',
                                        '  The expected dollar loss per YEAR from this threat.',
                                        '  ARO = Annualized Rate of Occurrence',
                                        '        (how many times the threat is expected to hit per year)',
                                        '',
                                        '  Post-Control SLE = AV x Post-Control EF',
                                        '  Post-Control ALE = Post-Control SLE x ARO',
                                        '  (Apply the same formulas using the new, lower Exposure Factor',
                                        '   that the safeguard achieves. ARO does not change.)',
                                        '',
                                        '  ALE Reduction = ALE (before control) - ALE (after control)',
                                        '  (How much annual expected loss the safeguard prevents.)',
                                        '',
                                        'COST-BENEFIT TEST',
                                        '',
                                        '  A safeguard is cost-justified when:',
                                        '    ALE Reduction > Annual Safeguard Cost',
                                        '',
                                        '  If ALE Reduction > Annual Cost  => submit "yes"',
                                        '  If ALE Reduction <= Annual Cost => submit "no"',
                                        '',
                                        'CONVERTING PERCENTAGES',
                                        '',
                                        '  Exposure Factor is given as a percentage in risk_data.txt.',
                                        '  Convert it to a decimal before multiplying.',
                                        '  Example (generic): 25% becomes 0.25',
                                        '',
                                        '  Plug the figures from risk_data.txt into the formulas above.',
                                        '  Submit each computed value as a plain integer (no $ or commas).',
                                        '================================================'
                                    ].join('\n')
                                },

                                // ── TASK BRIEF ────────────────────────────────────────
                                // Describes WHAT to compute; never states the answers.
                                'task.txt': {
                                    type: 'file',
                                    content: [
                                        'TASK BRIEF -- RM-2026-0915-003',
                                        '==============================',
                                        '',
                                        'Using the figures in /home/analyst/risk_data.txt and the formulas',
                                        'in /home/analyst/formulas.txt, compute and submit these five flags:',
                                        '',
                                        '  FLAG 1 -- sle',
                                        '    Compute: SLE = Asset Value x Exposure Factor',
                                        '    Read AV and EF from risk_data.txt.',
                                        '    Submit the result as a plain integer (no $ or commas).',
                                        '',
                                        '  FLAG 2 -- ale',
                                        '    Compute: ALE = SLE x Annualized Rate of Occurrence',
                                        '    Use the SLE you computed above and the ARO from risk_data.txt.',
                                        '    Submit the result as a plain integer.',
                                        '',
                                        '  FLAG 3 -- post_control_ale',
                                        '    Compute: Post-Control ALE = (AV x Post-Control EF) x ARO',
                                        '    Read the Post-Control Exposure Factor from risk_data.txt.',
                                        '    ARO does not change.',
                                        '    Submit the result as a plain integer.',
                                        '',
                                        '  FLAG 4 -- ale_reduction',
                                        '    Compute: ALE Reduction = ALE - Post-Control ALE',
                                        '    Use the two ALE values you computed above.',
                                        '    Submit the result as a plain integer.',
                                        '',
                                        '  FLAG 5 -- safeguard_justified',
                                        '    Is the safeguard cost-justified?',
                                        '    Test: ALE Reduction > Annual Safeguard Cost',
                                        '    Read the Annual Safeguard Cost from risk_data.txt.',
                                        '    Submit exactly "yes" or "no" (lowercase, no quotes).',
                                        '',
                                        '==============================',
                                        'Submission format reminder:',
                                        '  - Monetary flags: plain integer only (e.g., 750000 not $750,000)',
                                        '  - safeguard_justified: exactly "yes" or "no"',
                                        '=============================='
                                    ].join('\n')
                                },

                                // ── ANALYST SCRATCH PAD ───────────────────────────────
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'RISK ANALYSIS SCRATCH PAD',
                                        '=========================',
                                        '',
                                        'Read the input figures from risk_data.txt:',
                                        '  AV  (Asset Value)            = $',
                                        '  EF  (Exposure Factor)        =  %',
                                        '  ARO (Ann. Rate of Occ.)      = ',
                                        '  Safeguard Annual Cost        = $',
                                        '  Post-Control EF              =  %',
                                        '',
                                        'Compute:',
                                        '  SLE = AV x (EF as decimal)   = ',
                                        '  ALE = SLE x ARO              = ',
                                        '  Post-Control SLE             = ',
                                        '  Post-Control ALE             = ',
                                        '  ALE Reduction                = ',
                                        '  Safeguard justified? (yes/no)= ',
                                        '',
                                        'Formula quick-ref: cat /home/analyst/formulas.txt',
                                        'Input figures:     cat /home/analyst/risk_data.txt'
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat /home/analyst/task.txt\n'
                                }

                            }
                        }
                    }
                },

                // /etc and /tmp exist so paths resolve cleanly
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'risk-ws-01' },
                        'hosts':    { type: 'file', content: '127.0.0.1 localhost\n10.10.10.50 risk-ws-01' }
                    }
                },
                'tmp': { type: 'dir', children: {} }

            }
        }
    },

    // =========================================================
    // TERMINAL COMMANDS (custom additions)
    //
    // grep with file-arg AND pipe-aware (term._pipedStdin),
    // matching the pattern established in the intrusion-hunt box.
    // =========================================================

    commands: {

        // ── grep: file-based AND pipe-aware ────────────────────
        // Handles: grep PATTERN FILE          (direct file search)
        //          cat FILE | grep PATTERN    (piped stdin via term._pipedStdin)
        //          grep -i PATTERN FILE       (case-insensitive)
        //          grep -v PATTERN FILE       (invert match)
        //          grep -c PATTERN FILE       (count matches)
        //          grep -n PATTERN FILE       (show line numbers)
        //
        // Terminal.js sets term._pipedStdin = <previous stdout> before
        // calling any custom command handler in a pipeline segment.
        'grep': function(args, term) {
            if (!args.length) {
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n\nExample: grep "Asset Value" /home/analyst/risk_data.txt\nExample: cat /home/analyst/formulas.txt | grep "SLE"';
            }

            // Parse flags and positional args
            var flags   = args.filter(function(a) { return a.startsWith('-'); });
            var nonFlag = args.filter(function(a) { return !a.startsWith('-'); });
            var pattern  = nonFlag[0] || '';
            var filePath = nonFlag[1] || '';

            var caseInsensitive = flags.some(function(f) { return f.includes('i'); });
            var invertMatch     = flags.some(function(f) { return f.includes('v'); });
            var countOnly       = flags.some(function(f) { return f.includes('c'); });
            var showLineNums    = flags.some(function(f) { return f.includes('n'); });

            if (!pattern) return 'grep: missing pattern\nUsage: grep PATTERN FILE';

            // Determine content: named file arg OR piped stdin
            var content;
            if (filePath) {
                var node = term._getNode(filePath);
                if (!node) return 'grep: ' + filePath + ': No such file or directory';
                if (node.type === 'dir') return 'grep: ' + filePath + ': Is a directory';
                content = node.content || '';
            } else if (term._pipedStdin) {
                content = term._pipedStdin;
            } else {
                return 'grep: missing file argument\nUsage: grep PATTERN FILE\n       cat FILE | grep PATTERN';
            }

            var lines = content.split('\n');

            var re;
            try {
                re = new RegExp(pattern, caseInsensitive ? 'i' : '');
            } catch (e) {
                return 'grep: invalid regular expression: ' + pattern;
            }

            var matched = [];
            lines.forEach(function(line, idx) {
                var hits = re.test(line);
                var keep = invertMatch ? !hits : hits;
                if (keep) matched.push({ num: idx + 1, text: line });
            });

            if (countOnly) return String(matched.length);
            if (!matched.length) return '';

            if (showLineNums) {
                return matched.map(function(m) { return m.num + ':' + m.text; }).join('\n');
            }
            return matched.map(function(m) { return m.text; }).join('\n');
        },

        // ── help override (risk-specific context) ───────────────
        'help': function() {
            return [
                'QUANTITATIVE RISK ANALYSIS -- COMMAND REFERENCE',
                '',
                'File inspection:',
                '  ls [PATH]               List directory contents',
                '  cat FILE                Display full file contents',
                '  head [-n N] FILE        First N lines (default 10)',
                '  tail [-n N] FILE        Last N lines (default 10)',
                '  find PATH [-name PAT]   Search for files',
                '',
                'Search and filter:',
                '  grep [-ivnc] PAT FILE   Search for pattern in file',
                '    -i  case-insensitive  -v  invert  -n  line nums  -c  count',
                '',
                'Navigation:',
                '  cd PATH                 Change directory',
                '  pwd                     Print working directory',
                '  clear                   Clear screen',
                '',
                'Key files:',
                '  /home/analyst/risk_data.txt    Asset and threat input figures',
                '  /home/analyst/formulas.txt     SLE / ALE formula reference',
                '  /home/analyst/task.txt         What to compute and submit',
                '  /home/analyst/notes.txt        Scratch pad',
                '',
                'Starting points:',
                '  cat /home/analyst/risk_data.txt',
                '  cat /home/analyst/formulas.txt',
                '  cat /home/analyst/task.txt'
            ].join('\n');
        }

    },

    // =========================================================
    // LOG VIEWER DATA
    //
    // Shows contextual evidence entries for the risk scenario:
    // past ransomware incidents that ground the ARO figure,
    // the asset classification that grounds the AV figure, and
    // the safeguard evaluation memo. None of these entries
    // contain the computed flag values.
    // =========================================================

    logViewer: {
        entries: [
            // Asset classification records
            { timestamp: '2026-01-10 09:00:00', severity: 'info',    source: 'asset-mgmt',  message: 'TXPROC-01 classified CRITICAL -- payment processing hub. AV assessed at $500,000 (replacement + revenue + compliance cost).' },
            { timestamp: '2026-01-10 09:02:00', severity: 'info',    source: 'asset-mgmt',  message: 'TXPROC-01 added to risk register. Tier-1 asset. Insurance underwriter requires annual quantitative risk assessment.' },
            // Threat intelligence grounding the ARO
            { timestamp: '2026-02-14 13:45:00', severity: 'warning', source: 'threat-intel', message: 'FS-ISAC TI feed: ransomware groups targeting mid-tier financial processors. Observed ARO for peer institutions: 1.5-2.5 events/year. Internal ARO set to 2.', suspicious: true },
            { timestamp: '2026-03-01 08:30:00', severity: 'err',     source: 'ir-log',       message: 'INC-2026-0301: Ransomware precursor (Qakbot) detected on TXPROC-01 network segment. Contained before encryption stage. Near-miss event.', suspicious: true },
            // Exposure factor grounding
            { timestamp: '2026-04-05 10:15:00', severity: 'warning', source: 'risk-mgmt',   message: 'EF assessment for ransomware scenario: business analyst estimates 40% asset loss per incident (data recovery partial, downtime, reputational). EF = 0.40.' },
            // Safeguard evaluation
            { timestamp: '2026-08-20 14:00:00', severity: 'info',    source: 'vendor-eval', message: 'Immutable Backup System evaluation: vendor quote $60,000/year (licensing + storage + support). Post-control EF assessed at 10% -- rapid recovery reduces effective loss.' },
            { timestamp: '2026-09-10 09:00:00', severity: 'info',    source: 'risk-mgmt',   message: 'RM-2026-0915-003 opened: quantitative risk assessment for TXPROC-01 ransomware scenario. Analyst assignment pending.' },
            { timestamp: '2026-09-15 07:55:00', severity: 'info',    source: 'risk-mgmt',   message: 'RM-2026-0915-003 assigned. Evidence files written to /home/analyst/. Awaiting computed risk values.' }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // All five flags are compute-and-submit. The student reads
    // input figures from risk_data.txt, applies the formulas from
    // formulas.txt, and submits the results.
    //
    // EXPECTED VALUES (Nancy recompute):
    //   Inputs: AV=$500,000  EF=40%=0.40  ARO=2
    //           Safeguard cost=$60,000  Post-control EF=10%=0.10
    //
    //   sle              = 500000 x 0.40          = 200000
    //   ale              = 200000 x 2             = 400000
    //   post_control_ale = (500000 x 0.10) x 2   = 100000
    //   ale_reduction    = 400000 - 100000        = 300000
    //   safeguard_justified: 300000 > 60000       = yes
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-risk-quant):
    //   sle                  -> 200000
    //   ale                  -> 400000
    //   post_control_ale     -> 100000
    //   ale_reduction        -> 300000
    //   safeguard_justified  -> yes
    //
    // ANTI-LEAK: flag descriptions state WHAT to compute and HOW
    // (point to formulas.txt / risk_data.txt). They do NOT state
    // the numeric answer. The answer only appears in {{FLAG:id}}
    // tokens inside the final reveal hints below.
    // =========================================================

    flags: [
        {
            id:          'sle',
            points:      150,
            label:       'Single Loss Expectancy',
            description: 'Compute SLE = Asset Value x Exposure Factor using the figures in /home/analyst/risk_data.txt. Convert the Exposure Factor percentage to a decimal first (e.g., 40% becomes 0.40). Submit the result as a plain integer with no $ sign and no commas (e.g., 750000 not $750,000).'
        },
        {
            id:          'ale',
            points:      150,
            label:       'Annualized Loss Expectancy',
            description: 'Compute ALE = SLE x Annualized Rate of Occurrence. Use the SLE you computed and the ARO from /home/analyst/risk_data.txt. Submit the result as a plain integer with no $ sign and no commas.'
        },
        {
            id:          'post_control_ale',
            points:      150,
            label:       'Post-Control ALE',
            description: 'Compute post-control ALE using the Post-Control Exposure Factor from /home/analyst/risk_data.txt. Formula: (AV x Post-Control EF) x ARO. The ARO does not change after the safeguard is applied. Submit the result as a plain integer with no $ sign and no commas.'
        },
        {
            id:          'ale_reduction',
            points:      150,
            label:       'ALE Reduction',
            description: 'Compute ALE Reduction = ALE (before control) minus Post-Control ALE. Use the two values you computed for the ale and post_control_ale flags. Submit the result as a plain integer with no $ sign and no commas.'
        },
        {
            id:          'safeguard_justified',
            points:      200,
            label:       'Safeguard Cost-Justified',
            description: 'Determine whether the safeguard is cost-justified. Test: is the ALE Reduction greater than the Annual Safeguard Cost listed in /home/analyst/risk_data.txt? Submit exactly "yes" if the reduction exceeds the cost, or "no" if it does not. Lowercase only, no quotes.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base:               1000,
        minScore:           0,
        maxScore:           700,
        hintPenalty:        true,
        wrongFlagPenalty:   -25,
        speedBonus:         { threshold: 1200000, points: 100 },
        timeBonusThreshold: 1800
    },

    // =========================================================
    // HINTS
    //
    // Three progressive hints per flag:
    //   hint_*_1 -- conceptual direction (no command, no value)
    //   hint_*_2 -- specific command to run or step to take
    //   hint_*_3 -- final reveal: {{FLAG:id}} token
    //
    // ANTI-LEAK: no hint except the final reveal states the
    // computed numeric answer. Hint 2 may show the formula
    // applied to generic variable names, never to the actual
    // Veridian figures.
    // =========================================================

    hints: [

        // ── sle ──────────────────────────────────────────────
        {
            id:      'hint_sle_1',
            flagId:  'sle',
            text:    'SLE (Single Loss Expectancy) answers the question: "How much do we expect to lose each time this threat event occurs?" Read /home/analyst/risk_data.txt and find the Asset Value and the Exposure Factor for the ransomware scenario. The formula is in /home/analyst/formulas.txt.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_sle_2',
            flagId:  'sle',
            text:    'Run: cat /home/analyst/risk_data.txt\n\nLocate "Asset Value (AV)" and "Exposure Factor (EF)". Convert the EF percentage to a decimal (divide by 100). Then:\n  SLE = AV x EF (decimal)\n\nSubmit the result as a plain integer -- no dollar sign, no commas.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_sle_3',
            flagId:  'sle',
            text:    'Apply the formula to the figures in risk_data.txt and you will get the SLE.\n\nThe value to submit: {{FLAG:sle}}',
            cost:    75,
            penalty: -75
        },

        // ── ale ──────────────────────────────────────────────
        {
            id:      'hint_ale_1',
            flagId:  'ale',
            text:    'ALE (Annualized Loss Expectancy) answers: "How much do we expect to lose per year from this threat?" It scales the per-incident loss (SLE) by how often the threat is expected to hit each year (ARO). Find the ARO in /home/analyst/risk_data.txt.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_ale_2',
            flagId:  'ale',
            text:    'Run: cat /home/analyst/risk_data.txt\n\nLocate "Annualized Rate of Occurrence (ARO)". Then:\n  ALE = SLE x ARO\n\nUse the SLE you computed (flag sle) and the ARO from the file. Submit as a plain integer.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_ale_3',
            flagId:  'ale',
            text:    'Multiply SLE by the ARO listed in risk_data.txt.\n\nThe value to submit: {{FLAG:ale}}',
            cost:    75,
            penalty: -75
        },

        // ── post_control_ale ─────────────────────────────────
        {
            id:      'hint_pca_1',
            flagId:  'post_control_ale',
            text:    'After the safeguard is applied, the Exposure Factor drops because the backup system allows faster recovery -- the asset is not lost as completely. The ARO stays the same (the safeguard does not stop ransomware from trying; it just limits the damage). Find the Post-Control Exposure Factor in /home/analyst/risk_data.txt.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_pca_2',
            flagId:  'post_control_ale',
            text:    'Run: cat /home/analyst/risk_data.txt\n\nLocate "Post-Control Exposure Factor". Apply the same formula:\n  Post-Control SLE = AV x Post-Control EF (as decimal)\n  Post-Control ALE = Post-Control SLE x ARO\n\nSubmit the final Post-Control ALE as a plain integer.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_pca_3',
            flagId:  'post_control_ale',
            text:    'Use the Post-Control EF from risk_data.txt with AV and ARO unchanged. The result is the post-control ALE.\n\nThe value to submit: {{FLAG:post_control_ale}}',
            cost:    75,
            penalty: -75
        },

        // ── ale_reduction ─────────────────────────────────────
        {
            id:      'hint_ar_1',
            flagId:  'ale_reduction',
            text:    'ALE Reduction measures the annual savings the safeguard delivers: the difference between what you expected to lose per year WITHOUT the safeguard and what you expect to lose per year WITH it. You have already computed both ALE values.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_ar_2',
            flagId:  'ale_reduction',
            text:    'Formula:\n  ALE Reduction = ALE (before control) - Post-Control ALE\n\nSubtract the post-control ALE from the pre-control ALE. Submit the result as a plain integer.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_ar_3',
            flagId:  'ale_reduction',
            text:    'The ALE Reduction is the difference between the two annualized loss values you computed.\n\nThe value to submit: {{FLAG:ale_reduction}}',
            cost:    75,
            penalty: -75
        },

        // ── safeguard_justified ───────────────────────────────
        {
            id:      'hint_sj_1',
            flagId:  'safeguard_justified',
            text:    'A safeguard is cost-justified when it saves more per year than it costs per year. Compare the ALE Reduction you computed to the Annual Safeguard Cost listed in /home/analyst/risk_data.txt. Read the formula reference: cat /home/analyst/formulas.txt',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_sj_2',
            flagId:  'safeguard_justified',
            text:    'Run: cat /home/analyst/risk_data.txt\n\nLocate "Safeguard Annual Cost". Then compare:\n  Is ALE Reduction > Annual Safeguard Cost?\n\nSubmit exactly "yes" or "no" (lowercase, no quotes).',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_sj_3',
            flagId:  'safeguard_justified',
            text:    'Compare the ALE Reduction to the Annual Safeguard Cost from risk_data.txt. The comparison determines whether the investment is justified.\n\nThe value to submit: {{FLAG:safeguard_justified}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // SY0-701 Domain 5 -- Security Program Management and Oversight
    //   5.2 -- Explain elements of the risk management process
    //           (quantitative risk: SLE, ALE, EF, ARO)
    //   5.1 -- Summarize elements of effective security governance
    //           (risk identification, asset valuation)
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'sle',                 objective: '5.2', description: 'Elements of the risk management process -- quantitative analysis', skill: 'Computing Single Loss Expectancy (SLE = AV x EF)' },
            { flagId: 'ale',                 objective: '5.2', description: 'Elements of the risk management process -- quantitative analysis', skill: 'Computing Annualized Loss Expectancy (ALE = SLE x ARO)' },
            { flagId: 'post_control_ale',    objective: '5.2', description: 'Elements of the risk management process -- quantitative analysis', skill: 'Computing post-control ALE after safeguard application' },
            { flagId: 'ale_reduction',       objective: '5.2', description: 'Elements of the risk management process -- quantitative analysis', skill: 'Quantifying the annual benefit of a risk control' },
            { flagId: 'safeguard_justified', objective: '5.1', description: 'Security governance -- risk-based safeguard selection', skill: 'Cost-benefit analysis: ALE reduction vs. safeguard cost' }
        ]
    },

    // =========================================================
    // STATE RESET (idempotent on script load)
    // BoxEngine manages flag submission state in Firestore.
    // No internal _state is needed for a pure compute-and-submit box.
    // =========================================================

    resetState: function() {
        // No internal _state; BoxEngine manages progress in Firestore.
    }

};

// Auto-reset on load (BOX-006 backfill pattern)
if (window.VRQConfig) window.VRQConfig.resetState();
