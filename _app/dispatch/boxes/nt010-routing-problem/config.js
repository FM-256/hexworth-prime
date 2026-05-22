/* ============================================================
   ARENA LAB — Box NT010: Routing Problem
   Network Troubleshooting — Network+ N10-009
   5 scenarios: missing static route, wrong next hop,
   ACL blocking, asymmetric routing, TTL exceeded
   ============================================================ */

const NT010Config = {

    title: 'Routing Problem',
    subtitle: 'Routing Troubleshooting — Network+',
    difficulty: 'Advanced',
    accent: '#14b8a6',
    storageKey: 'hexworth_lab_nt010',
    registryId: 'nt010-routing-problem',
    trackerKey: 'lab_nt010',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint about routing issues.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check routing table', tip: 'Run show ip route on the router to see current routes.', trigger: { event: 'command', match: { cmd: 'contains:show' } } },
            { title: 'Trace the path', tip: 'Use traceroute to see where packets are going or getting dropped.', trigger: { event: 'command', match: { cmd: 'contains:traceroute' } } },
            { title: 'Fix the routing', tip: 'Use Router Config to correct the routing issue.', trigger: { event: 'window_open', match: { type: 'router_config' } } },
            { title: 'Verify end-to-end', tip: 'Confirm packets reach the destination. Find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'N10-009', mappings: [
        { flagId: 'fixed', objective: '1.3', description: 'Summarize the types of cables and connectors and explain which is the appropriate type for a solution', skill: 'Routing Concepts' },
        { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network connectivity issues', skill: 'Static Routes, ACLs, Asymmetric Routing' },
        { flagId: 'fixed', objective: '2.2', description: 'Compare and contrast routing technologies', skill: 'Static, Dynamic, Next-Hop, ACLs' }
    ]},

    _scenarioFlags: { missing_route: null, wrong_nexthop: null, acl_block: null, asymmetric: null, ttl_exceeded: null },

    _scenarios: [
        {
            id: 'missing_route', name: 'Missing Static Route',
            ticketSubject: 'Branch office can\'t reach headquarters network',
            ticketDetail: 'Our branch office (10.20.0.0/24) cannot reach any servers at headquarters (10.10.0.0/24). We can reach the internet fine and local resources work, but anything at HQ times out. This started after the router was rebooted.',
            ticketExtra: 'IT Note: The branch router (R1) had a static route to 10.10.0.0/24 via the WAN link (172.16.0.2). After reboot, the static route was lost because it was entered in running-config but never saved to startup-config.',
            fixDescription: 'Re-add the static route: ip route 10.10.0.0 255.255.255.0 172.16.0.2',
            brokenConfig: { ip: '10.20.0.1', networks: ['10.20.0.0/24', '172.16.0.0/30'] },
            stateOverrides: { _missingRoute: true, _destNet: '10.10.0.0/24', _nextHop: '172.16.0.2' },
            flagLocation: 'Router CLI show ip route after adding route'
        },
        {
            id: 'wrong_nexthop', name: 'Wrong Next Hop',
            ticketSubject: 'Packets to server farm go to wrong router',
            ticketDetail: 'Users report that connections to the server farm (10.30.0.0/24) are extremely slow or timing out. Traceroute shows packets going through an unexpected path — through the backup WAN link instead of the primary LAN path.',
            ticketExtra: 'IT Note: The static route to 10.30.0.0/24 has next-hop 172.16.1.2 (backup WAN) instead of 192.168.1.2 (primary LAN link). During migration, the next-hop was changed for testing and never reverted.',
            fixDescription: 'Change the next-hop from 172.16.1.2 to 192.168.1.2',
            brokenConfig: { ip: '192.168.1.1', networks: ['192.168.1.0/24', '172.16.1.0/30', '10.20.0.0/24'] },
            stateOverrides: { _wrongNexthop: true, _currentNexthop: '172.16.1.2', _correctNexthop: '192.168.1.2' },
            flagLocation: 'Router CLI show ip route after fix'
        },
        {
            id: 'acl_block', name: 'ACL Blocking Traffic',
            ticketSubject: 'Can\'t reach web server from internal network',
            ticketDetail: 'Our internal users (10.10.0.0/24) cannot reach the DMZ web server at 172.16.10.100 on ports 80/443. Pings to the server work fine. The server itself is up — external users can access it. Only internal users are blocked.',
            ticketExtra: 'IT Note: A new ACL was applied to the router interface facing the DMZ. The ACL was intended to block malicious traffic but may be too restrictive, blocking legitimate HTTP/HTTPS traffic from internal networks.',
            fixDescription: 'Modify the ACL to permit TCP 80/443 from 10.10.0.0/24 to 172.16.10.0/24',
            brokenConfig: { ip: '10.10.0.1', networks: ['10.10.0.0/24', '172.16.10.0/24'] },
            stateOverrides: { _aclBlocking: true, _aclName: 'DMZ-FILTER' },
            flagLocation: 'Router CLI show access-lists after fix'
        },
        {
            id: 'asymmetric', name: 'Asymmetric Routing',
            ticketSubject: 'Some connections work, others get reset mid-session',
            ticketDetail: 'TCP connections to certain servers keep getting reset after a few seconds. SSH sessions drop, web pages load partially then fail. UDP-based services like DNS work fine. The stateful firewall logs show "no matching session" errors.',
            ticketExtra: 'IT Note: Traffic from R1 to Server takes Path A (through FW), but return traffic from Server takes Path B (bypassing FW). The firewall drops return traffic because it never saw the initial SYN. Fix: ensure symmetric routing through FW.',
            fixDescription: 'Add a static route on R2 to force return traffic through the firewall path',
            brokenConfig: { ip: '10.10.0.1', networks: ['10.10.0.0/24'] },
            stateOverrides: { _asymmetric: true },
            flagLocation: 'Router CLI after fixing return path'
        },
        {
            id: 'ttl_exceeded', name: 'TTL Exceeded (Routing Loop)',
            ticketSubject: 'Traceroute shows packets bouncing between two routers',
            ticketDetail: 'Traceroute to 10.50.0.0/24 shows packets bouncing between 172.16.0.1 and 172.16.0.2 endlessly until TTL expires. Pings to that network say "TTL exceeded in transit." All other destinations work fine.',
            ticketExtra: 'IT Note: R1 has a route to 10.50.0.0/24 pointing to R2 (172.16.0.2), and R2 has a route to 10.50.0.0/24 pointing back to R1 (172.16.0.1). This creates a routing loop. R2\'s route should point to 10.50.0.1 (the actual destination gateway).',
            fixDescription: 'Fix R2\'s route to point to 10.50.0.1 instead of back to R1',
            brokenConfig: { ip: '172.16.0.1', networks: ['172.16.0.0/30', '10.10.0.0/24'] },
            stateOverrides: { _routingLoop: true, _loopNet: '10.50.0.0/24' },
            flagLocation: 'Router CLI after breaking the loop'
        }
    ],

    _macAddress: '00-1A-2B-3C-4D-67',

    _defaultHints: [
        { id: 'hint1', text: 'show ip route to see the routing table. traceroute to see the path packets take.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Routing issues: missing route, wrong next-hop, ACL blocking, asymmetric path, or routing loop.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Router Config to add/modify routes or ACLs.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after fixing the routing.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        missing_route: [{ id:'hint1',text:'show ip route has no entry for 10.10.0.0/24. The route was lost after reboot.',cost:0,penalty:0},{id:'hint2',text:'Need: ip route 10.10.0.0 255.255.255.0 172.16.0.2',cost:10,penalty:-10},{id:'hint3',text:'Add the route via Router Config.',cost:25,penalty:-25},{id:'hint4',text:'After adding route, flag in show ip route.',cost:50,penalty:-50}],
        wrong_nexthop: [{ id:'hint1',text:'show ip route shows 10.30.0.0/24 via 172.16.1.2 (backup WAN). Should be 192.168.1.2.',cost:0,penalty:0},{id:'hint2',text:'Change the next-hop to the primary path.',cost:10,penalty:-10},{id:'hint3',text:'Remove old route, add new one via Router Config.',cost:25,penalty:-25},{id:'hint4',text:'After fix, flag in show ip route.',cost:50,penalty:-50}],
        acl_block: [{ id:'hint1',text:'show access-lists reveals the DMZ-FILTER ACL. It denies TCP from 10.10.0.0 to 172.16.10.0.',cost:0,penalty:0},{id:'hint2',text:'The ACL needs a permit for TCP 80/443.',cost:10,penalty:-10},{id:'hint3',text:'Add permit rule in Router Config.',cost:25,penalty:-25},{id:'hint4',text:'After modifying ACL, flag appears.',cost:50,penalty:-50}],
        asymmetric: [{ id:'hint1',text:'show ip route reveals two paths. Outbound goes through FW, return bypasses it.',cost:0,penalty:0},{id:'hint2',text:'Add a route on R2 to force return traffic through the firewall.',cost:10,penalty:-10},{id:'hint3',text:'Add route via Router Config.',cost:25,penalty:-25},{id:'hint4',text:'After ensuring symmetric routing, flag appears.',cost:50,penalty:-50}],
        ttl_exceeded: [{ id:'hint1',text:'traceroute shows a loop between 172.16.0.1 and 172.16.0.2 for 10.50.0.0/24.',cost:0,penalty:0},{id:'hint2',text:'R2 routes 10.50.0.0/24 back to R1. Should go to 10.50.0.1.',cost:10,penalty:-10},{id:'hint3',text:'Fix R2\'s route in Router Config.',cost:25,penalty:-25},{id:'hint4',text:'After breaking the loop, flag appears.',cost:50,penalty:-50}]
    },

    _ensureScenario(engine){if(!engine.state._scenarioSelected)return false;if(engine.state._scenarioId!=null&&!NT010Config._flagRestored){NT010Config._flagRestored=true;const s=NT010Config._scenarios[engine.state._scenarioId];if(s)NT010Config.hints=NT010Config._scenarioHints[s.id]||NT010Config._defaultHints;}return true;},
    _applyScenario(engine,idx){engine.state._scenarioId=idx;engine.state._networkConfig=JSON.parse(JSON.stringify(NT010Config._scenarios[idx].brokenConfig));engine.state._scenarioSelected=true;const o=NT010Config._scenarios[idx].stateOverrides||{};for(const k in o)engine.state[k]=o[k];NT010Config._flagRestored=true;NT010Config.hints=NT010Config._scenarioHints[NT010Config._scenarios[idx].id]||NT010Config._defaultHints;engine.save();},
    _getScenario(engine){return engine.state._scenarioId==null?null:NT010Config._scenarios[engine.state._scenarioId];},
    _requireScenario(engine){return engine.state._scenarioSelected?null:'\nERROR: No active ticket.\nOpen Help Desk Ticket first.';},

    boot:{biosLines:['Cisco IOS Boot','Router firmware loaded','Ready'],grubEntries:['IOS 15.7'],loginUser:'admin'},
    desktop:{icons:[{id:'cmd',label:'Router\nCLI',icon:'>_',app:'terminal'},{id:'rtrcfg',label:'Router\nConfig',icon:'RTR',app:'router_config'},{id:'ticket',label:'Help Desk\nTicket',icon:'HD',app:'ticket'},{id:'notes',label:'Notepad',icon:'TXT',app:'notes'},{id:'hints',label:'Hints',icon:'?',app:'hints'},{id:'reset',label:'Reset\nLab',icon:'RST',app:'reset_lab'}]},
    terminal:{user:'admin',hostname:'R1',startDir:'',promptStyle:'cisco',welcome:'R1>'},
    filesystem:{'/': {type:'dir',children:{}}},
    flags:[{id:'fixed',value:null,points:500}],
    scoring:{
        minScore: 0,base:0,maxScore:600,hintPenalty:true,wrongFlagPenalty:0,speedBonus:{threshold:600000,points:100},timeBonusThreshold:1800},
    hints:[{id:'hint1',text:'show ip route and traceroute.',cost:0,penalty:0},{id:'hint2',text:'Missing route, wrong hop, ACL, asymmetric, or loop.',cost:10,penalty:-10},{id:'hint3',text:'Router Config to fix.',cost:25,penalty:-25},{id:'hint4',text:'Flag after routing fixed.',cost:50,penalty:-50}],
    lore:{intro:'Network routing is broken. Diagnose the routing issue and restore end-to-end connectivity.',scenario:'A routing configuration problem is causing packets to be dropped, misrouted, or looped.',outro:'Routing issue resolved.'},
    phases:[{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false,description:'Check routing table.'},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true,description:'Identify routing issue.'},{id:'repair',name:'Repair',requiredFlags:[],unlocks:['verify'],locked:true,description:'Fix routing.'},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true,description:'Verify and flag.'}],

    commands:{
        show:async function(args,term,engine){
            const gate=NT010Config._requireScenario(engine);if(gate)return gate;
            const cmd=args.join(' ').toLowerCase();

            if(/ip\s+route/i.test(cmd)){
                let output='\nCodes: C - connected, S - static, R - RIP, O - OSPF\n\n';
                output+='C    10.10.0.0/24 is directly connected, GigabitEthernet0/0\n';
                if(!engine.state._missingRoute) output+='S    10.10.0.0/24 [1/0] via 172.16.0.2\n';
                output+='C    172.16.0.0/30 is directly connected, Serial0/0\n';
                if(engine.state._wrongNexthop) output+='S    10.30.0.0/24 [1/0] via '+engine.state._currentNexthop+' (BACKUP WAN)\n';
                else if(engine.state._correctNexthop) output+='S    10.30.0.0/24 [1/0] via 192.168.1.2\n';
                if(engine.state._routingLoop) output+='S    10.50.0.0/24 [1/0] via 172.16.0.2\n  [WARNING: Routing loop detected for this prefix]\n';
                if(engine.state._flagRevealed){const fv=await engine.requestFlagText(NT010Config._getScenario(engine).id);output+='\n  Routing corrected — Recovery token: '+fv;}
                return output;
            }

            if(/access-lists/i.test(cmd)){
                if(engine.state._aclBlocking) return '\nExtended IP access list DMZ-FILTER\n    10 deny tcp 10.10.0.0 0.0.0.255 172.16.10.0 0.0.0.255 eq 80\n    20 deny tcp 10.10.0.0 0.0.0.255 172.16.10.0 0.0.0.255 eq 443\n    30 permit ip any any\n\n  [NOTE: Rules 10-20 block HTTP/HTTPS to DMZ from internal]';
                return '\nExtended IP access list DMZ-FILTER\n    10 permit tcp 10.10.0.0 0.0.0.255 172.16.10.0 0.0.0.255 eq 80\n    20 permit tcp 10.10.0.0 0.0.0.255 172.16.10.0 0.0.0.255 eq 443\n    30 deny tcp any 172.16.10.0 0.0.0.255 range 1 79\n    40 permit ip any any';
            }

            if(/run/i.test(cmd)) return '\nhostname R1\n!\ninterface GigabitEthernet0/0\n ip address 10.10.0.1 255.255.255.0\n!\ninterface Serial0/0\n ip address 172.16.0.1 255.255.255.252\n!';

            return '\nCommands:\n  show ip route\n  show access-lists\n  show running-config';
        },

        traceroute:function(args,term,engine){
            const gate=NT010Config._requireScenario(engine);if(gate)return gate;
            const target=args[0];if(!target)return'\nUsage: traceroute <ip>';
            if(engine.state._routingLoop&&target.startsWith('10.50.')) return '\nTracing route to '+target+':\n  1  172.16.0.1  1ms\n  2  172.16.0.2  2ms\n  3  172.16.0.1  1ms\n  4  172.16.0.2  2ms\n  5  172.16.0.1  1ms\n  ...\n  30  * * * TTL exceeded\n\n  [ROUTING LOOP DETECTED between R1 and R2]';
            if(engine.state._missingRoute&&target.startsWith('10.10.')) return '\n% Network is unreachable (no route to host)';
            if(engine.state._aclBlocking&&target==='172.16.10.100') return '\nTracing route to 172.16.10.100:\n  1  10.10.0.1  1ms\n  2  172.16.10.1  2ms\n  3  * * * (filtered by ACL)\n\n  [Packets reach the DMZ router but are blocked by ACL]';
            return '\nTracing route to '+target+':\n  1  '+target+'  1ms 1ms 1ms\n\nTrace complete.';
        },

        ping:function(args,term,engine){
            const gate=NT010Config._requireScenario(engine);if(gate)return gate;
            const target=args[0];if(!target)return'\nUsage: ping <ip>';
            if(engine.state._missingRoute&&target.startsWith('10.10.')) return '\n% Network is unreachable';
            if(engine.state._routingLoop&&target.startsWith('10.50.')) return '\nReply from 172.16.0.2: TTL expired in transit\nReply from 172.16.0.1: TTL expired in transit\nReply from 172.16.0.2: TTL expired in transit\n\nSuccess rate is 0 percent';
            if(engine.state._asymmetric) return '\nReply from '+target+': bytes=32 time=5ms TTL=62\n* (connection reset)\n* (connection reset)\n\nSuccess rate is 25 percent (intermittent — asymmetric routing)';
            return '\nReply from '+target+': bytes=32 time=1ms TTL=255\nReply from '+target+': bytes=32 time=1ms TTL=255\n\nSuccess rate is 100 percent (2/2)';
        },

        hostname:function(){return'R1';},cls:function(args,term){term.outputEl.innerHTML='';return null;},enable:function(){return'';},
        ipconfig:function(){return'% Unknown command. Use show ip route.';},ifconfig:function(){return'% Unknown command.';}
    },

    onAppLaunch(iconDef,engine){
        if(iconDef.app==='router_config'&&!engine.state._scenarioSelected){engine.notify('Open ticket first.','error');return;}
        switch(iconDef.app){case'ticket':NT010Config._openTicket(iconDef,engine);break;case'router_config':NT010Config._openRouterConfig(iconDef,engine);break;case'reset_lab':NT010Config._confirmReset(engine);break;}
    },

    _openTicket(iconDef,engine){if(engine._windows[iconDef.id]){engine._focusWindow(iconDef.id);return;} const c=document.createElement('div');c.id='ticketContainer';c.style.cssText='padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';engine.openWindow(iconDef.id,'Help Desk Ticket','HD',c);NT010Config._ensureScenario(engine);if(engine.state._scenarioSelected)NT010Config._renderTicket(engine,c);else NT010Config._renderPicker(engine,c);},

    _renderPicker(engine,c){
        const p=['Branch Office — "Can\'t reach HQ"','NOC — "Packets taking wrong path to servers"','WebTeam — "Can\'t reach DMZ web server"','SecOps — "Sessions getting reset randomly"','NOC — "Traceroute shows routing loop"'];
        let html='<div style="text-align:center;margin-bottom:20px;"><div style="color:#14b8a6;font-weight:bold;font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT010Config._scenarios.forEach(function(s,i){html+='<button class="nt010-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><span style="color:#14b8a6;font-weight:bold;">HD-'+(8900+i)+'</span><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+p[i]+'</div></button>';});
        html+='</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="nt010Rand" style="padding:10px 28px;background:#14b8a6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML=html;
        c.querySelectorAll('.nt010-btn').forEach(function(b){b.addEventListener('click',function(){NT010Config._applyScenario(engine,parseInt(this.getAttribute('data-idx')));NT010Config._renderTicket(engine,c);});});
        document.getElementById('nt010Rand').addEventListener('click',function(){NT010Config._applyScenario(engine,Math.floor(Math.random()*NT010Config._scenarios.length));NT010Config._renderTicket(engine,c);});
    },

    _renderTicket(engine,c){const s=NT010Config._getScenario(engine);const n=['Branch IT','NOC Team','WebDev','SecOps','NOC Team'];c.innerHTML='<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#14b8a6;font-weight:bold;">TICKET #HD-'+(8900+engine.state._scenarioId)+'</span></div><div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">BY</div><div>'+n[engine.state._scenarioId]+'</div></div><div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT010Config._escHtml(s.ticketSubject)+'</div></div><div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);padding:12px;border-radius:4px;line-height:1.6;">'+NT010Config._escHtml(s.ticketDetail)+'</div></div>'+(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.2);padding:12px;border-radius:4px;color:#ffcc80;">'+NT010Config._escHtml(s.ticketExtra)+'</div></div>':'')+'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;"><div style="color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div></div>';},

    _openRouterConfig(iconDef,engine){if(engine._windows[iconDef.id]){engine._focusWindow(iconDef.id);NT010Config._renderRouter(engine);return;} const c=document.createElement('div');c.id='routerContainer';c.style.cssText='padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';engine.openWindow(iconDef.id,'Router Config','RTR',c);NT010Config._renderRouter(engine);},

    async _renderRouter(engine){
        const c=document.getElementById('routerContainer');if(!c)return;
        const s=NT010Config._getScenario(engine);
        const fixes={
            missing_route:{label:'Missing route to 10.10.0.0/24 via 172.16.0.2',broken:engine.state._missingRoute,btn:'Add Static Route',key:'_missingRoute'},
            wrong_nexthop:{label:'Route to 10.30.0.0/24 via '+engine.state._currentNexthop+' (should be 192.168.1.2)',broken:engine.state._wrongNexthop,btn:'Fix Next-Hop to 192.168.1.2',key:'_wrongNexthop'},
            acl_block:{label:'ACL DMZ-FILTER blocking HTTP/HTTPS from internal',broken:engine.state._aclBlocking,btn:'Add Permit Rules for TCP 80/443',key:'_aclBlocking'},
            asymmetric:{label:'Asymmetric routing: return path bypasses firewall',broken:engine.state._asymmetric,btn:'Add Route for Symmetric Path',key:'_asymmetric'},
            ttl_exceeded:{label:'Routing loop: R1 and R2 point to each other for 10.50.0.0/24',broken:engine.state._routingLoop,btn:'Fix R2 Next-Hop to 10.50.0.1',key:'_routingLoop'}
        };

        let html='<div style="font-size:1rem;font-weight:bold;color:#14b8a6;margin-bottom:16px;">Router Configuration — R1</div>';
        if(s&&fixes[s.id]){
            const f=fixes[s.id];
            html+='<div style="border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:12px;margin-bottom:16px;"><div style="font-weight:bold;margin-bottom:8px;">Issue: '+f.label+'</div><div style="font-size:0.75rem;margin-bottom:8px;">Status: <span style="color:'+(f.broken?'#e74c3c;font-weight:bold;">ACTIVE':'#2ecc71;">RESOLVED')+'</span></div>'+(f.broken?'<button id="rtrFix" style="padding:6px 20px;background:#14b8a6;color:#fff;border:none;border-radius:3px;cursor:pointer;font-weight:bold;font-size:0.75rem;">'+f.btn+'</button>':'')+'</div>';
        }
        if(engine.state._flagRevealed&&s){const fv=await engine.requestFlagText(s.id);html+='<div style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:4px;padding:12px;margin-top:16px;"><div style="color:#2ecc71;font-weight:bold;">Routing Fixed:</div><div style="color:#c8e6c9;">Recovery token: '+fv+'</div></div>';}
        c.innerHTML=html;
        const btn=document.getElementById('rtrFix');
        if(btn&&s){const key=fixes[s.id].key;btn.addEventListener('click',function(){engine.state[key]=false;if(!engine.state._labComplete){engine.state._labComplete=true;engine.state._flagRevealed=true;}engine.save();engine.notify('Routing issue resolved.','success');NT010Config._renderRouter(engine);});}
    },

    _confirmReset(engine){const o=document.createElement('div');o.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';o.innerHTML='<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:24px;text-align:center;font-family:Consolas,monospace;color:#c8e6c9;"><div style="color:#e74c3c;font-weight:bold;margin-bottom:12px;">Reset?</div><div style="display:flex;gap:12px;justify-content:center;"><button id="nt010Y" style="padding:8px 24px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">Reset</button><button id="nt010N" style="padding:8px 24px;background:rgba(255,255,255,0.1);color:#ccc;border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;">Cancel</button></div></div>';document.getElementById('arena').appendChild(o);document.getElementById('nt010Y').addEventListener('click',function(){NT010Config._flagRestored=false;NT010Config.hints=NT010Config._defaultHints;engine.reset();});document.getElementById('nt010N').addEventListener('click',function(){o.remove();});o.addEventListener('click',function(e){if(e.target===o)o.remove();});},

    _escHtml(str){const d=document.createElement('div');d.textContent=str;return d.innerHTML;}
};
