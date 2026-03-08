/* ============================================================
   CTF ARENA — Box A12: The Mobile Scapegoat
   Android APK Reverse Engineering | Digital Nomads
   Config: APK analysis sim, ADB, decompilers, filesystem, flags
   ============================================================ */

const A12Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Mobile Scapegoat',
    subtitle: 'Android Exploitation — Digital Nomads',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Advanced',
    accent: '#3DDC84',
    storageKey: 'hexworth_ctf_a12',
    trackerKey: 'ctf_a12',

    // ═══════════════════════════════════════════════════════
    // PHASES (Progressive unlock system)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '<img src="/assets/images/icons/icon-microscope.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">',
            description: 'Identify the target application, gather metadata, and map the attack surface. Examine the APK file, enumerate permissions, and review the network status page for intel.',
            requiredFlags: [],
            mitre: ['T1422', 'T1418'],
            // T1422: System Network Configuration Discovery (mobile)
            // T1418: Software Discovery (mobile — enumerating installed apps/APK metadata)
            unlocks: ['APK metadata', 'Network status page', 'ADB device enumeration'],
            locked: false
        },
        {
            id: 'apk-analysis',
            name: 'APK Analysis',
            icon: '<img src="/assets/images/icons/icon-microscope.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Decompile the APK using apktool and jadx. Examine AndroidManifest.xml for exported components, dangerous permissions, and security misconfigurations. Review network security config.',
            requiredFlags: [],
            mitre: ['T1409', 'T1406'],
            // T1409: Access Stored Application Data (mobile — accessing unprotected data stores)
            // T1406: Obfuscated Files or Information: Software Packing (mobile — reverse engineering packed DEX)
            unlocks: ['Decompiled Java source', 'AndroidManifest.xml', 'network_security_config.xml'],
            locked: true
        },
        {
            id: 'secret-extraction',
            name: 'Code Review / Secret Extraction',
            icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Analyze decompiled Java source for hardcoded credentials, API keys, and insecure data storage patterns. Extract secrets from SharedPreferences and identify the XOR cipher weakness.',
            requiredFlags: [],
            mitre: ['T1552', 'T1417'],
            // T1552: Unsecured Credentials (enterprise — hardcoded secrets in source)
            // T1417: Input Capture (mobile — MODE_WORLD_READABLE SharedPreferences exposure)
            unlocks: ['User flag (hardcoded API key)', 'Auth token', 'XOR key material'],
            locked: true
        },
        {
            id: 'backend-exploitation',
            name: 'Backend Exploitation',
            icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Use extracted API credentials to authenticate against the Digital Nomads API. Exploit the unguarded ContentProvider to dump the safehouse manifest database and retrieve the root flag.',
            requiredFlags: ['user'],
            mitre: ['T1059', 'T1190'],
            // T1059: Command and Scripting Interpreter (ADB shell content queries)
            // T1190: Exploit Public-Facing Application (unauthenticated ContentProvider access)
            unlocks: ['Root flag (safehouse manifest)', 'Full safehouse database', 'API endpoint access'],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Hardcoded API Key Discovery' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Android Content Provider Exploitation' },
            { flagId: 'user', objective: '2.7', description: 'Explain the importance of using appropriate cryptographic solutions', skill: 'Identifying Weak/Absent Mobile Encryption (XOR, MODE_WORLD_READABLE)' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, use appropriate tools or techniques to determine malicious activity', skill: 'Mobile App Static Analysis with jadx / apktool' },
            { flagId: 'user', objective: '3.2', description: 'Given a scenario, apply security principles to secure enterprise infrastructure', skill: 'Secure Coding: Secrets Management and Android Keystore' },
            { flagId: 'root', objective: '1.3', description: 'Compare and contrast types of vulnerabilities', skill: 'Android Insecure Data Storage — ContentProvider, SharedPreferences, SQLite' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
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
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget APK: ~/Voyager.apk  [Digital Nomads — Mobile Exploitation]\nEmulator: emulator-5554 (online)\n'
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE (tracks decompilation / install progress)
    // ═══════════════════════════════════════════════════════

    _state: {
        apkDecompiled: false,
        apkInstalled: false,
        jadxRun: false,
        sharedPrefsPulled: false,
        adbShellActive: false,
        dbPulled: false
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED APK DATA
    // ═══════════════════════════════════════════════════════

    _apk: {
        packageName: 'com.nomads.voyager',
        versionName: '2.4.1',
        versionCode: 17,
        minSdk: 26,
        targetSdk: 33,

        manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nomads.voyager"
    android:versionCode="17"
    android:versionName="2.4.1">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:debuggable="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Voyager"
        android:networkSecurityConfig="@xml/network_security_config"
        android:theme="@style/AppTheme">

        <activity android:name=".ui.MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".ui.LoginActivity" android:exported="false" />
        <activity android:name=".ui.MapActivity" android:exported="false" />
        <activity android:name=".ui.SafehouseActivity" android:exported="true" />

        <!-- VULNERABILITY: Exported ContentProvider with no permissions -->
        <provider
            android:name=".data.SafehouseProvider"
            android:authorities="com.nomads.voyager.provider"
            android:exported="true"
            android:grantUriPermissions="true" />

        <service android:name=".service.LocationSyncService" android:exported="false" />

        <receiver android:name=".receiver.BootReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,

        stringsXml: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Voyager</string>
    <string name="welcome_text">Welcome to the Nomad Network</string>
    <string name="login_prompt">Enter your Nomad credentials</string>
    <string name="api_base_url">https://api.digitalnomads.net/v2</string>
    <string name="maps_api_key">AIzaSyD-REDACTED-NotTheRealKey</string>
    <string name="content_authority">com.nomads.voyager.provider</string>
    <string name="safehouse_uri">content://com.nomads.voyager.provider/safehouse</string>
    <string name="db_name">voyager.db</string>
    <string name="prefs_name">voyager_prefs</string>
</resources>`,

        networkSecurityConfig: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>`,

        // Decompiled Java source files
        javaSource: {
            'com/nomads/voyager/api/ApiClient.java': `package com.nomads.voyager.api;

import android.util.Log;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class ApiClient {

    private static final String TAG = "VoyagerAPI";

    // *** HARDCODED API KEY — Developer shortcut ***
    // TODO: Move to BuildConfig or secure keystore before release
    private static final String API_KEY = "flag{v0y4g3r_h4rdc0d3d_4p1_k3y}";
    private static final String BASE_URL = "https://api.digitalnomads.net/v2";

    private final OkHttpClient client;

    public ApiClient() {
        this.client = new OkHttpClient.Builder()
            .addInterceptor(chain -> {
                Request original = chain.request();
                Request request = original.newBuilder()
                    .header("X-API-Key", API_KEY)
                    .header("X-Client-Version", "2.4.1")
                    .build();
                return chain.proceed(request);
            })
            .build();
    }

    public String getSafehouses() throws Exception {
        Request request = new Request.Builder()
            .url(BASE_URL + "/safehouses?key=" + API_KEY)
            .build();
        try (Response response = client.newCall(request).execute()) {
            return response.body().string();
        }
    }

    public String getRendezvousPoints() throws Exception {
        Request request = new Request.Builder()
            .url(BASE_URL + "/rendezvous?key=" + API_KEY)
            .build();
        try (Response response = client.newCall(request).execute()) {
            return response.body().string();
        }
    }

    public void syncLocation(double lat, double lon) {
        Log.d(TAG, "Syncing location: " + lat + ", " + lon + " with key: " + API_KEY);
    }
}`,

            'com/nomads/voyager/data/SafehouseProvider.java': `package com.nomads.voyager.data;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.UriMatcher;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;

/**
 * SafehouseProvider — Content Provider for safehouse data.
 *
 * WARNING: This provider is exported with NO permission checks.
 * Any app on the device can query safehouse data via:
 *   content://com.nomads.voyager.provider/safehouse
 *
 * Developer note: "We'll add permission checks in v3.0"
 */
public class SafehouseProvider extends ContentProvider {

    private static final String AUTHORITY = "com.nomads.voyager.provider";
    private static final String TABLE_SAFEHOUSE = "safehouses";
    private static final int SAFEHOUSES = 1;
    private static final int SAFEHOUSE_ID = 2;

    private static final UriMatcher uriMatcher = new UriMatcher(UriMatcher.NO_MATCH);
    static {
        uriMatcher.addURI(AUTHORITY, "safehouse", SAFEHOUSES);
        uriMatcher.addURI(AUTHORITY, "safehouse/#", SAFEHOUSE_ID);
    }

    private DatabaseHelper dbHelper;

    @Override
    public boolean onCreate() {
        dbHelper = new DatabaseHelper(getContext());
        return true;
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection,
                        String[] selectionArgs, String sortOrder) {
        // NO PERMISSION CHECK — any external app can query
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor;

        switch (uriMatcher.match(uri)) {
            case SAFEHOUSES:
                cursor = db.query(TABLE_SAFEHOUSE, projection,
                    selection, selectionArgs, null, null, sortOrder);
                break;
            case SAFEHOUSE_ID:
                String id = uri.getLastPathSegment();
                cursor = db.query(TABLE_SAFEHOUSE, projection,
                    "_id=?", new String[]{id}, null, null, sortOrder);
                break;
            default:
                throw new IllegalArgumentException("Unknown URI: " + uri);
        }

        cursor.setNotificationUri(getContext().getContentResolver(), uri);
        return cursor;
    }

    @Override
    public String getType(Uri uri) {
        switch (uriMatcher.match(uri)) {
            case SAFEHOUSES:
                return "vnd.android.cursor.dir/vnd.nomads.safehouse";
            case SAFEHOUSE_ID:
                return "vnd.android.cursor.item/vnd.nomads.safehouse";
            default:
                throw new IllegalArgumentException("Unknown URI: " + uri);
        }
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) { return null; }
    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) { return 0; }
    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] args) { return 0; }
}`,

            'com/nomads/voyager/data/DatabaseHelper.java': `package com.nomads.voyager.data;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "voyager.db";
    private static final int DB_VERSION = 3;

    public DatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE safehouses (" +
            "_id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "codename TEXT NOT NULL," +
            "location TEXT NOT NULL," +
            "lat REAL," +
            "lon REAL," +
            "status TEXT DEFAULT 'active'," +
            "notes TEXT," +
            "flag TEXT" +
            ")");

        db.execSQL("INSERT INTO safehouses VALUES (1, 'PHOENIX', 'Berlin, DE', 52.52, 13.405, 'active', 'Primary EU hub', NULL)");
        db.execSQL("INSERT INTO safehouses VALUES (2, 'MIRAGE', 'Bangkok, TH', 13.756, 100.502, 'active', 'Southeast Asia relay', NULL)");
        db.execSQL("INSERT INTO safehouses VALUES (3, 'GHOST', 'Reykjavik, IS', 64.147, -21.942, 'compromised', 'Nordic dead drop', NULL)");
        db.execSQL("INSERT INTO safehouses VALUES (4, 'NOMAD-PRIME', 'Classified', 0.0, 0.0, 'active', 'The Manifest', 'flag{n0m4d_m4n1f3st_c0nt3nt_pr0v1d3r}')");
        db.execSQL("INSERT INTO safehouses VALUES (5, 'DRIFTER', 'Lisbon, PT', 38.722, -9.139, 'active', 'Atlantic staging point', NULL)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS safehouses");
        onCreate(db);
    }
}`,

            'com/nomads/voyager/util/PrefsManager.java': `package com.nomads.voyager.util;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * PrefsManager — Handles local preference storage.
 *
 * VULNERABILITY: Uses MODE_WORLD_READABLE (deprecated and insecure).
 * Any app on the device can read these preferences.
 */
public class PrefsManager {

    private static final String PREFS_NAME = "voyager_prefs";
    private final SharedPreferences prefs;

    @SuppressWarnings("deprecation")
    public PrefsManager(Context context) {
        // MODE_WORLD_READABLE allows any app to read SharedPreferences
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_WORLD_READABLE);
    }

    public void saveAuthToken(String token) {
        prefs.edit().putString("auth_token", token).apply();
    }

    public String getAuthToken() {
        return prefs.getString("auth_token", null);
    }

    public void saveApiKey(String key) {
        prefs.edit().putString("api_key", key).apply();
    }

    public void saveUserId(String userId) {
        prefs.edit().putString("user_id", userId).apply();
    }

    public void saveLastSync(long timestamp) {
        prefs.edit().putLong("last_sync", timestamp).apply();
    }

    public boolean isFirstRun() {
        return prefs.getBoolean("first_run", true);
    }

    public void clearFirstRun() {
        prefs.edit().putBoolean("first_run", false).apply();
    }
}`,

            'com/nomads/voyager/ui/MainActivity.java': `package com.nomads.voyager.ui;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.nomads.voyager.api.ApiClient;
import com.nomads.voyager.util.PrefsManager;
import com.nomads.voyager.util.CryptoUtil;

public class MainActivity extends Activity {

    private static final String TAG = "VoyagerMain";
    private PrefsManager prefsManager;
    private ApiClient apiClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefsManager = new PrefsManager(this);
        apiClient = new ApiClient();

        if (prefsManager.isFirstRun()) {
            Log.d(TAG, "First run detected — initializing defaults");
            prefsManager.saveApiKey(ApiClient.API_KEY);
            prefsManager.clearFirstRun();
        }

        String token = prefsManager.getAuthToken();
        if (token == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        } else {
            loadDashboard();
        }
    }

    private void loadDashboard() {
        Log.d(TAG, "Loading dashboard for authenticated user");
        // Dashboard shows map with safehouse markers
    }
}`,

            'com/nomads/voyager/util/CryptoUtil.java': `package com.nomads.voyager.util;

/**
 * CryptoUtil — "Encryption" utility for local data.
 *
 * Uses a simple XOR cipher with a hardcoded key.
 * This is NOT real encryption — trivially reversible.
 */
public class CryptoUtil {

    // Hardcoded XOR key — easily extractable
    private static final byte[] XOR_KEY = "N0m4dK3y!".getBytes();

    public static byte[] encrypt(byte[] data) {
        byte[] result = new byte[data.length];
        for (int i = 0; i < data.length; i++) {
            result[i] = (byte)(data[i] ^ XOR_KEY[i % XOR_KEY.length]);
        }
        return result;
    }

    public static byte[] decrypt(byte[] data) {
        // XOR is symmetric — encrypt == decrypt
        return encrypt(data);
    }

    public static String encryptString(String plaintext) {
        return android.util.Base64.encodeToString(
            encrypt(plaintext.getBytes()), android.util.Base64.NO_WRAP);
    }

    public static String decryptString(String ciphertext) {
        byte[] decoded = android.util.Base64.decode(ciphertext, android.util.Base64.NO_WRAP);
        return new String(decrypt(decoded));
    }
}`
        },

        sharedPrefs: `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="auth_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoibm9tYWRfYWxwaGEiLCJyb2xlIjoib3BlcmF0aXZlIiwiZXhwIjoxNzM5NTk5MjAwfQ.N0m4dT0k3n</string>
    <string name="api_key">flag{v0y4g3r_h4rdc0d3d_4p1_k3y}</string>
    <string name="user_id">nomad_alpha</string>
    <long name="last_sync" value="1708128000000" />
    <boolean name="first_run" value="false" />
    <string name="device_id">EMU-5554-KALI</string>
    <string name="encrypted_passphrase">GCcWTh4NBRUGGAoTBQ==</string>
</map>`,

        // Simulated SQLite database content
        database: {
            tables: ['safehouses', 'android_metadata', 'sqlite_sequence'],
            safehouses: [
                { _id: 1, codename: 'PHOENIX',     location: 'Berlin, DE',     lat: 52.52,   lon: 13.405,  status: 'active',      notes: 'Primary EU hub',         flag: null },
                { _id: 2, codename: 'MIRAGE',      location: 'Bangkok, TH',    lat: 13.756,  lon: 100.502, status: 'active',      notes: 'Southeast Asia relay',   flag: null },
                { _id: 3, codename: 'GHOST',       location: 'Reykjavik, IS',  lat: 64.147,  lon: -21.942, status: 'compromised', notes: 'Nordic dead drop',       flag: null },
                { _id: 4, codename: 'NOMAD-PRIME', location: 'Classified',     lat: 0.0,     lon: 0.0,     status: 'active',      notes: 'The Manifest',           flag: 'flag{n0m4d_m4n1f3st_c0nt3nt_pr0v1d3r}' },
                { _id: 5, codename: 'DRIFTER',     location: 'Lisbon, PT',     lat: 38.722,  lon: -9.139,  status: 'active',      notes: 'Atlantic staging point', flag: null }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{v0y4g3r_h4rdc0d3d_4p1_k3y}',          points: 100 },
        { id: 'root', value: 'flag{n0m4d_m4n1f3st_c0nt3nt_pr0v1d3r}',    points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }  // 20 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            cost: 10,
            text: "Start by decompiling the APK with apktool or jadx to see the source code. Try: jadx -d output Voyager.apk",
            penalty: -10
        },
        {
            id: 'hint2',
            cost: 25,
            text: "Search the decompiled source for hardcoded credentials: grep -r \"API_KEY\" output/",
            penalty: -25
        },
        {
            id: 'hint3',
            cost: 50,
            text: "The app stores sensitive data in SharedPreferences. Pull it with: adb pull /data/data/com.nomads.voyager/shared_prefs/voyager_prefs.xml",
            penalty: -50
        },
        {
            id: 'hint4',
            cost: 75,
            text: "An exported ContentProvider at content://com.nomads.voyager.provider/ allows direct queries. Try: adb shell content query --uri content://com.nomads.voyager.provider/safehouse",
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: "An encrypted collective known as the Digital Nomads operates a global safehouse network through a custom Android app called Voyager. Intel suggests the APK contains secrets that could expose their entire operation — your mission is to extract them.",

        scenario: "The Digital Nomads contracted a small dev shop to build Voyager on a tight deadline. The lead developer hardcoded the API key 'just for testing' and promised to move it to Android Keystore before the v3.0 release — that release never came. A separate junior developer added the SafehouseProvider component and exported it without permissions because 'only our app runs on these devices anyway.' The XOR cipher in CryptoUtil was copy-pasted from a Stack Overflow answer dated 2014. Each decision was made in isolation, each one defensible in the moment. Together they form a chain that gives any attacker with the APK total control over the network.",

        outro: "The Voyager app has been completely compromised. A hardcoded API key in the source code gave you initial access, and an exported ContentProvider with zero permission checks exposed the entire Nomad Manifest. The Digital Nomads' trust in mobile obscurity was their undoing — the Scapegoat wasn't the app, it was their security model.",

        ecer: {
            executive: "A critical security incident resulted in the full exposure of the Voyager mobile application's authentication credentials and the complete Digital Nomads safehouse network manifest. The root cause was a hardcoded API key and an unprotected data access interface (ContentProvider) shipped in a production release. Estimated impact: all 5 registered safehouses are considered compromised pending rotation of credentials and relocation of NOMAD-PRIME.",
            culture: "The development team operated under a 'ship it now, secure it later' culture reinforced by deadline pressure and lack of mandatory security review gates. Developers were not trained on Android-specific secure coding practices such as Android Keystore usage, ContentProvider permission modeling, or SharedPreferences encryption. No mobile security checklist existed in the release pipeline, and code comments explicitly deferred known vulnerabilities to a future version that was never prioritized.",
            employee: "The primary developer who hardcoded API_KEY in ApiClient.java documented the issue with a TODO comment and was never held accountable for resolving it. The developer who implemented SafehouseProvider did not have sufficient knowledge of Android ContentProvider security semantics — the exported=true flag requires explicit readPermission and writePermission attributes to prevent public access. No peer code review was conducted on either component prior to production deployment.",
            regulatory: "This incident may constitute a reportable data breach under applicable privacy regulations if any personally identifiable information was stored in the safehouses table or accessible via the compromised API. The use of MODE_WORLD_READABLE SharedPreferences (deprecated since Android API 17) and cleartext traffic permitted in network_security_config.xml represent violations of Android security best practices and may conflict with organizational data handling policies. Organizations operating in regulated industries (healthcare, finance, government) should treat hardcoded credentials in distributed mobile applications as an automatic compliance failure requiring immediate incident response."
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Digital Nomads Status Page (minor intel)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.42/nomads/',

        pages: {

            // ── Page 1: Digital Nomads Network Status ──────────
            '/nomads/': {
                title: 'Digital Nomads — Network Status',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #1a352e;">
                        <div style="font-size:2rem; margin-bottom:8px;"><img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                        <h1 style="color:#3DDC84; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Digital Nomads</h1>
                        <div style="color:#6abf8a; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase;">Network Status &mdash; Operational Dashboard</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">

                        <div style="background:#0d2018; border:1px solid #1a352e; border-radius:6px; padding:20px; margin-bottom:16px;">
                            <div style="color:#6abf8a; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">System Status</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.8rem;">
                                <div style="color:#7fa89e;"><span style="color:#3DDC84;">&#9679;</span> API Gateway: <span style="color:#3DDC84;">Online</span></div>
                                <div style="color:#7fa89e;"><span style="color:#3DDC84;">&#9679;</span> Relay Nodes: <span style="color:#3DDC84;">4/5 Active</span></div>
                                <div style="color:#7fa89e;"><span style="color:#f39c12;">&#9679;</span> Nordic Node: <span style="color:#f39c12;">Compromised</span></div>
                                <div style="color:#7fa89e;"><span style="color:#3DDC84;">&#9679;</span> Mobile Sync: <span style="color:#3DDC84;">Operational</span></div>
                            </div>
                        </div>

                        <div style="background:#0d2018; border:1px solid #1a352e; border-radius:6px; padding:20px; margin-bottom:16px;">
                            <div style="color:#6abf8a; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">Recent Activity</div>
                            <div style="font-size:0.78rem; color:#7fa89e; line-height:1.8; font-family:monospace;">
                                <div>[2026-02-17 04:12] Voyager v2.4.1 deployed to production</div>
                                <div>[2026-02-17 03:58] <span style="color:#f39c12;">ALERT:</span> GHOST node unresponsive &mdash; marked compromised</div>
                                <div>[2026-02-16 22:30] Location sync batch completed (47 check-ins)</div>
                                <div>[2026-02-16 18:05] API key rotation <span style="color:#e74c3c;">SKIPPED</span> &mdash; hardcoded in client</div>
                                <div>[2026-02-16 12:00] New safehouse DRIFTER registered</div>
                            </div>
                        </div>

                        <div style="background:#0d2018; border:1px solid #1a352e; border-radius:6px; padding:20px; margin-bottom:16px;">
                            <div style="color:#6abf8a; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">Voyager App Info</div>
                            <div style="font-size:0.8rem; color:#7fa89e; line-height:1.7;">
                                <div><span style="color:#456b63;">Package:</span> <span style="color:#e0f5f2; font-family:monospace;">com.nomads.voyager</span></div>
                                <div><span style="color:#456b63;">Version:</span> <span style="color:#e0f5f2;">2.4.1 (build 17)</span></div>
                                <div><span style="color:#456b63;">API Base:</span> <span style="color:#e0f5f2; font-family:monospace;">https://api.digitalnomads.net/v2</span></div>
                                <div><span style="color:#456b63;">Data Provider:</span> <span style="color:#e0f5f2; font-family:monospace;">content://com.nomads.voyager.provider</span></div>
                                <div><span style="color:#456b63;">Known Issue:</span> <span style="color:#e74c3c;">API keys hardcoded in APK source (fix deferred to v3.0)</span></div>
                            </div>
                        </div>

                        <div style="background:#071a12; border:1px solid #1a3a20; border-radius:6px; padding:14px;">
                            <div style="color:#f39c12; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Internal Notice</div>
                            <div style="color:#456b63; font-size:0.72rem; line-height:1.6;">
                                The Voyager APK contains <span style="color:#e74c3c;">hardcoded credentials</span> and an <span style="color:#e74c3c;">exported ContentProvider</span> without permission guards.
                                These are scheduled for remediation in the v3.0 security sprint. Until then, the APK should be considered a <em>high-value target</em> if obtained by adversaries.
                                <br><br>
                                <span style="color:#3DDC84;">Reminder:</span> Safehouse manifest data is accessible via the provider URI.
                            </div>
                        </div>

                    </div>
                `,
                formHandler: null
            },

            // ── Page 2: API Documentation ──────────────────────
            '/nomads/api/': {
                title: 'Digital Nomads — API Documentation',
                html: `
                    <div style="border-bottom:1px solid #1a352e; padding-bottom:16px; margin-bottom:22px;">
                        <h2 style="color:#3DDC84; font-size:1.1rem; margin:0 0 4px; font-family:Georgia,serif;"><img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Nomad API Reference</h2>
                        <div style="color:#456b63; font-size:0.7rem; letter-spacing:0.1em;">VERSION 2.4.1 &mdash; INTERNAL USE ONLY</div>
                    </div>

                    <div style="font-size:0.8rem; color:#7fa89e; line-height:1.7;">

                        <div style="background:#0d2018; border:1px solid #1a352e; border-radius:6px; padding:16px; margin-bottom:14px;">
                            <div style="color:#6abf8a; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">Authentication</div>
                            <div style="color:#456b63; margin-bottom:8px;">All API requests require the <code style="color:#3DDC84;">X-API-Key</code> header. The key is embedded in the Voyager APK source.</div>
                            <pre style="background:#071a12; border-radius:4px; padding:12px; color:#3DDC84; font-size:0.75rem; overflow-x:auto; margin:0;">X-API-Key: [extracted from com.nomads.voyager.api.ApiClient]</pre>
                        </div>

                        <div style="background:#0d2018; border:1px solid #1a352e; border-radius:6px; padding:16px; margin-bottom:14px;">
                            <div style="color:#6abf8a; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">GET /v2/safehouses</div>
                            <div style="color:#456b63; margin-bottom:8px;">Returns all registered safehouses. Requires valid API key.</div>
                            <pre style="background:#071a12; border-radius:4px; padding:12px; color:#3DDC84; font-size:0.75rem; overflow-x:auto; margin:0;">curl -H "X-API-Key: KEY" https://api.digitalnomads.net/v2/safehouses</pre>
                        </div>

                        <div style="background:#0d2018; border:1px solid #1a352e; border-radius:6px; padding:16px; margin-bottom:14px;">
                            <div style="color:#6abf8a; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">Local Data Access</div>
                            <div style="color:#456b63; margin-bottom:8px;">The Voyager app stores safehouse data locally via a ContentProvider.</div>
                            <pre style="background:#071a12; border-radius:4px; padding:12px; color:#3DDC84; font-size:0.75rem; overflow-x:auto; margin:0;">content://com.nomads.voyager.provider/safehouse
content://com.nomads.voyager.provider/safehouse/{id}</pre>
                            <div style="color:#e74c3c; font-size:0.7rem; margin-top:8px;">WARNING: Provider is exported without permissions. Any app can query it.</div>
                        </div>

                        <div style="background:#071a12; border:1px solid #1a3a20; border-radius:6px; padding:14px;">
                            <div style="color:#f39c12; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Security Notes</div>
                            <div style="color:#456b63; font-size:0.72rem; line-height:1.6;">
                                &bull; API key is hardcoded in <code style="color:#3DDC84;">ApiClient.java</code> (line 12)<br>
                                &bull; SharedPreferences uses <code style="color:#3DDC84;">MODE_WORLD_READABLE</code> (deprecated since API 17)<br>
                                &bull; ContentProvider lacks <code style="color:#3DDC84;">android:permission</code> attribute<br>
                                &bull; CryptoUtil uses XOR with a static key &mdash; trivially reversible<br>
                                &bull; <code style="color:#3DDC84;">android:debuggable="true"</code> in production manifest
                            </div>
                        </div>

                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — Kali)
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
                                'Voyager.apk': {
                                    type: 'file',
                                    content: '[Android Package]\nFile: Voyager.apk\nSize: 4,218,432 bytes (4.0 MB)\nMD5:  a3c1f7e2b4d6890f1c2e3a4b5d6f7890\nSHA1: 9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c\n\nPackage: com.nomads.voyager\nVersion: 2.4.1 (code 17)\nMin SDK: 26 (Android 8.0)\nTarget SDK: 33 (Android 13)\n\nPermissions:\n  - android.permission.INTERNET\n  - android.permission.ACCESS_FINE_LOCATION\n  - android.permission.READ_EXTERNAL_STORAGE\n  - android.permission.WRITE_EXTERNAL_STORAGE\n\nComponents:\n  Activities: MainActivity, LoginActivity, MapActivity, SafehouseActivity\n  Providers: SafehouseProvider (EXPORTED, NO PERMISSIONS)\n  Services:  LocationSyncService\n  Receivers: BootReceiver (EXPORTED)\n\nUse apktool or jadx to decompile.'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Voyager.apk (Digital Nomads mobile app)\nFaction: Digital Nomads\nObjective: Android APK reverse engineering & exploitation\n\nIntel:\n- The "Digital Nomads" use a custom Android app called Voyager\n- The app communicates with api.digitalnomads.net\n- Developers hardcoded sensitive data in the APK source\n- The app stores data insecurely (SharedPreferences, SQLite)\n- An exported ContentProvider leaks safehouse data\n- Network status page at http://10.10.14.42/nomads/\n\nAttack Steps:\n1. Decompile the APK with apktool or jadx\n2. Search decompiled source for hardcoded API keys\n3. Check SharedPreferences for stored credentials\n4. Identify and exploit the exported ContentProvider\n5. Query the safehouse database for the Nomad Manifest\n\nTools available:\n- apktool d Voyager.apk    (decompile resources & smali)\n- jadx -d output Voyager.apk (decompile to Java source)\n- adb devices / adb shell    (Android Debug Bridge)\n- strings Voyager.apk        (extract embedded strings)\n- sqlite3                     (query SQLite databases)\n\nEmulator: emulator-5554 is online and ready.\n\nGood luck, operator.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'apk-scanner.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# APK Security Scanner v1.2\n# Quick static analysis of Android APKs\n\necho "=== APK Security Scanner v1.2 ==="\necho "Target: $1"\necho ""\necho "Checking for common vulnerabilities..."\necho ""\necho "[!] android:debuggable=true in manifest"\necho "[!] android:allowBackup=true in manifest"\necho "[!] Exported ContentProvider without permissions"\necho "[!] MODE_WORLD_READABLE SharedPreferences usage"\necho "[!] Hardcoded strings matching API key patterns"\necho "[!] Cleartext traffic permitted (network_security_config)"\necho "[!] XOR encryption with static key (CryptoUtil.java)"\necho ""\necho "VERDICT: HIGH RISK — 7 vulnerabilities detected"\necho "Recommendation: Decompile with jadx for full source review"'
                                        },
                                        'content-query.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Quick content provider query helper\n# Usage: ./content-query.sh <authority> <path>\n#\n# Examples:\n#   ./content-query.sh com.nomads.voyager.provider safehouse\n#   ./content-query.sh com.nomads.voyager.provider safehouse/4\n#\n# This wraps: adb shell content query --uri content://$1/$2\n\nif [ -z "$1" ] || [ -z "$2" ]; then\n    echo "Usage: $0 <authority> <path>"\n    exit 1\nfi\n\nadb shell content query --uri "content://$1/$2"'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file Voyager.apk\nstrings Voyager.apk | head -50\nadb devices\nadb install Voyager.apk\napktool d Voyager.apk\njadx -d output Voyager.apk\ngrep -r "API_KEY" output/\nadb shell\nsqlite3 voyager.db'
                                },

                                // ── DECOY FILES — red herrings for student exploration ──

                                'signing': {
                                    type: 'dir',
                                    children: {
                                        'debug.keystore': {
                                            type: 'file',
                                            content: '=== Android Debug Keystore ===\nAlias:  androiddebugkey\nType:   JKS\nIssuer: CN=Android Debug, O=Android, C=US\nSerial: 0x1\nValid:  2020-01-01 to 2050-01-01\n\nPassword: android\n\nNOTE: This is the standard Android debug signing certificate.\nIt is NOT the production release key. Release APKs are signed\nwith a separate keystore that is stored offline.\n\nThis keystore is used during development and testing only.\nThe signature on Voyager.apk matches the release certificate\nstored at /opt/nomads-release.jks (not on this machine).\n\nFingerprint (SHA-256):\n  AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:\n  10:21:32:43:54:65:76:87:98:A9:BA:CB:DC:ED:FE:0F\n\n[Dead end — the real signing key is stored offline, not in the APK]'
                                        },
                                        'cert-verify.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Verify APK signature against known cert fingerprint\n# This is used to confirm the APK is authentic before distribution\n\nAPK="$1"\nEXPECTED="AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"\n\nif [ -z "$APK" ]; then\n    echo "Usage: $0 <apk_file>"\n    exit 1\nfi\n\necho "[*] Extracting signing certificate from $APK..."\necho "[*] Certificate fingerprint: $EXPECTED"\necho "[*] Status: VERIFIED (debug cert)"\necho ""\necho "NOTE: Signing certificate does not contain user data or API keys."\necho "      The vulnerability is in the APK source code, not the signature."\necho "      Keep looking inside the DEX classes."'
                                        }
                                    }
                                },

                                'decompiled-fragments': {
                                    type: 'dir',
                                    children: {
                                        'LoginActivity.java.bak': {
                                            type: 'file',
                                            content: '// Partial decompile of LoginActivity — DO NOT USE (corrupted output)\n// This fragment is from an older version of the APK (v1.8.2)\n// It no longer reflects the current codebase\n\npackage com.nomads.voyager.ui;\n\npublic class LoginActivity extends Activity {\n\n    // OUTDATED: This was the v1.x login mechanism\n    // The credential check was server-side in v1.x\n    // NOTE: hardcoded backup PIN was REMOVED in v2.0\n    // private static final String BACKUP_PIN = "142857"; // <- REMOVED\n\n    // In v2.x, authentication is token-based via ApiClient\n    // This file is an artifact from an older jadx run and is not accurate\n\n    // The current auth flow is:\n    //   1. User enters Nomad ID + PIN\n    //   2. POST /v2/auth with credentials\n    //   3. JWT stored in voyager_prefs.xml via PrefsManager\n    //   See the current ApiClient.java for the real API key\n\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        // PLACEHOLDER — this decompile output is incomplete\n    }\n}'
                                        },
                                        'obfuscation-notes.txt': {
                                            type: 'file',
                                            content: '=== APK Obfuscation Analysis Notes ===\nDate: 2026-02-16\nAnalyst: prev_operator\n\nObfuscation level: LOW\nProGuard: disabled (build.gradle: minifyEnabled false)\nR8: not configured\n\nClass names are fully readable — no renaming applied.\nThis makes jadx output very clean and easy to follow.\n\nSuspicious string at offset 0x2A4F8:\n  GCcWTh4NBRUGGAoTBQ==\n  -> Base64-decode: [binary garbage — XOR encrypted with N0m4dK3y!]\n  -> XOR decrypt attempt 1: "passphrase: nomad_operati..." [truncated]\n  -> Full XOR decrypt requires the key from CryptoUtil.java\n\nNote: The encrypted_passphrase in SharedPreferences is XOR-encoded\nwith "N0m4dK3y!" from CryptoUtil. This is NOT the API key.\nIt appears to be an encrypted local storage passphrase — not a flag.\nDo not waste time here; the flags are elsewhere.'
                                        }
                                    }
                                },

                                'config-dump.json': {
                                    type: 'file',
                                    content: '{\n  "_comment": "Extracted from assets/config.json inside Voyager.apk (via unzip)",\n  "version": "2.4.1",\n  "environment": "production",\n  "api": {\n    "base_url": "https://api.digitalnomads.net/v2",\n    "timeout_ms": 30000,\n    "retry_count": 3\n  },\n  "features": {\n    "location_tracking": true,\n    "offline_mode": true,\n    "debug_logging": true,\n    "_comment": "debug_logging should be false in production — another oversight"\n  },\n  "maps": {\n    "provider": "Google",\n    "api_key_source": "strings.xml",\n    "_comment": "maps_api_key in strings.xml is redacted (AIzaSyD-REDACTED). Not the target key."\n  },\n  "_note": "The Google Maps API key here is a separate, non-sensitive key for map tiles only. The authentication API key is hardcoded in the Java source — see ApiClient.java."\n}'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific Android tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── ADB (Android Debug Bridge) ────────────────────────
        'adb': function(args, term, engine) {
            if (!args.length) {
                return `Android Debug Bridge version 1.0.41
Version 34.0.5-10900879
Installed as /usr/bin/adb
Running on Linux (x86_64)

Global options:
 -a  listen on all network interfaces
 -d  use USB device
 -e  use TCP/IP device

General commands:
 devices      list connected devices
 install      install APK on device
 shell        open device shell
 pull         copy files from device
 push         copy files to device
 logcat       view device logs

Usage: adb [command] [arguments]`;
            }

            const subcmd = args[0];

            // adb devices
            if (subcmd === 'devices') {
                return `List of devices attached
emulator-5554\tdevice`;
            }

            // adb install
            if (subcmd === 'install') {
                const apk = args[1] || '';
                if (!apk) return 'Error: no apk specified';
                if (apk === 'Voyager.apk' || apk === './Voyager.apk' || apk === '~/Voyager.apk' || apk === '/home/kali/Voyager.apk') {
                    A12Config._state.apkInstalled = true;
                    return `Performing Streamed Install
Success
Package: com.nomads.voyager
Version: 2.4.1 (code 17)
Target:  emulator-5554`;
                }
                return `adb: error: failed to stat ${apk}: No such file or directory`;
            }

            // adb pull
            if (subcmd === 'pull') {
                const remotePath = args[1] || '';
                const localDest = args[2] || '';

                if (remotePath.includes('shared_prefs/voyager_prefs.xml') ||
                    remotePath.includes('shared_prefs/') && !remotePath.includes('.')) {
                    A12Config._state.sharedPrefsPulled = true;
                    const fileName = remotePath.endsWith('/') ? 'voyager_prefs.xml' : remotePath.split('/').pop();
                    // Add file to filesystem dynamically
                    A12Config._ensureDecompiledFs(engine);
                    return `/data/data/com.nomads.voyager/shared_prefs/${fileName}: 1 file pulled. 0.4 MB/s (482 bytes in 0.001s)

Contents of voyager_prefs.xml:
${A12Config._apk.sharedPrefs}`;
                }

                if (remotePath.includes('databases/voyager.db')) {
                    A12Config._state.dbPulled = true;
                    return `/data/data/com.nomads.voyager/databases/voyager.db: 1 file pulled. 2.1 MB/s (28672 bytes in 0.013s)

File saved as: voyager.db
Use sqlite3 voyager.db to examine the database.`;
                }

                if (remotePath.includes('/data/data/com.nomads.voyager/')) {
                    return `adb: error: remote object '${remotePath}' does not exist`;
                }

                return `adb: error: remote object '${remotePath}' does not exist`;
            }

            // adb push
            if (subcmd === 'push') {
                return `adb: error: push requires two arguments (local source, remote destination)`;
            }

            // adb shell
            if (subcmd === 'shell') {
                // adb shell with subcommand
                if (args.length > 1) {
                    const shellArgs = args.slice(1);
                    const shellCmd = shellArgs.join(' ');

                    // adb shell content query
                    if (shellCmd.startsWith('content query') || shellCmd.startsWith('content quer')) {
                        return A12Config._handleContentQuery(shellCmd);
                    }

                    // adb shell pm list packages
                    if (shellCmd.includes('pm list packages')) {
                        if (A12Config._state.apkInstalled) {
                            return `package:com.nomads.voyager\npackage:com.android.settings\npackage:com.android.browser\npackage:com.android.contacts\npackage:com.android.phone`;
                        }
                        return `package:com.android.settings\npackage:com.android.browser\npackage:com.android.contacts\npackage:com.android.phone`;
                    }

                    // adb shell dumpsys
                    if (shellCmd.includes('dumpsys package com.nomads.voyager')) {
                        return A12Config._handleDumpsys();
                    }

                    // adb shell run-as
                    if (shellCmd.startsWith('run-as com.nomads.voyager')) {
                        return `run-as: package 'com.nomads.voyager' is debuggable — access granted
$ ls /data/data/com.nomads.voyager/
cache/
databases/
shared_prefs/
files/`;
                    }

                    // adb shell ls
                    if (shellCmd.startsWith('ls ')) {
                        const lsPath = shellCmd.replace('ls ', '').replace('-la ', '').replace('-l ', '').trim();
                        if (lsPath.includes('shared_prefs')) {
                            return `total 4\n-rw-rw-r-- 1 u0_a123 u0_a123 482 2026-02-17 04:12 voyager_prefs.xml`;
                        }
                        if (lsPath.includes('databases')) {
                            return `total 32\n-rw-rw-r-- 1 u0_a123 u0_a123 28672 2026-02-17 04:10 voyager.db\n-rw-rw-r-- 1 u0_a123 u0_a123 12288 2026-02-17 04:10 voyager.db-journal`;
                        }
                        if (lsPath.includes('com.nomads.voyager')) {
                            return `total 16\ndrwxrwx--x 2 u0_a123 u0_a123 4096 cache\ndrwxrwx--x 2 u0_a123 u0_a123 4096 databases\ndrwxrwx--x 2 u0_a123 u0_a123 4096 shared_prefs\ndrwxrwx--x 2 u0_a123 u0_a123 4096 files`;
                        }
                        return `ls: ${lsPath}: No such file or directory`;
                    }

                    // adb shell cat
                    if (shellCmd.startsWith('cat ')) {
                        const catPath = shellCmd.replace('cat ', '').trim();
                        if (catPath.includes('voyager_prefs.xml')) {
                            return A12Config._apk.sharedPrefs;
                        }
                        return `cat: ${catPath}: Permission denied`;
                    }

                    return `/system/bin/sh: ${shellArgs[0]}: not found`;
                }

                // Bare "adb shell" — open interactive shell
                A12Config._state.adbShellActive = true;
                return `emulator-5554:/ $
(Interactive ADB shell — use "adb shell <command>" for direct commands)
(Useful: ls, cat, content query, pm list packages, dumpsys)`;
            }

            // adb logcat
            if (subcmd === 'logcat') {
                return `--------- beginning of main
02-17 04:12:01.234  1234  1234 D VoyagerMain: First run detected — initializing defaults
02-17 04:12:01.235  1234  1234 D VoyagerMain: Loading dashboard for authenticated user
02-17 04:12:01.300  1234  1234 D VoyagerAPI : Syncing location: 28.5383, -81.3792 with key: flag{v0y4g3r_h4rdc0d3d_4p1_k3y}
02-17 04:12:02.100  1234  1234 I SafehouseProvider: Query received for content://com.nomads.voyager.provider/safehouse
02-17 04:12:02.102  1234  1234 W SafehouseProvider: No permission check on exported provider!
02-17 04:12:03.500  1234  1234 D PrefsManager: Stored api_key to SharedPreferences (MODE_WORLD_READABLE)
02-17 04:12:03.501  1234  1234 W PrefsManager: WARNING: MODE_WORLD_READABLE is deprecated!
02-17 04:12:04.200  1234  1234 D CryptoUtil: Encrypting passphrase with XOR key: N0m4dK3y!
^C`;
            }

            return `adb: unknown command '${subcmd}'. See 'adb help'.`;
        },

        // ── apktool (APK decompiler — resources & smali) ──────
        'apktool': function(args, term, engine) {
            if (!args.length) {
                return `Apktool v2.9.3 - a tool for reengineering Android apk files
Usage: apktool d[ecode] <file_apk> [options]
       apktool b[uild]  <dir>       [options]

Options:
  d, --decode    Decode an APK file
  b, --build     Build an APK from decoded files
  -f, --force    Force overwrite
  -o, --output   Output directory`;
            }

            const subcmd = args[0];
            if (subcmd !== 'd' && subcmd !== 'decode') {
                return `apktool: unknown command '${subcmd}'`;
            }

            const apk = args.find(a => a.endsWith('.apk')) || '';
            if (!apk || (!apk.includes('Voyager') && !apk.includes('voyager'))) {
                return apk ? `apktool: error: ${apk}: No such file` : 'apktool: error: no APK specified';
            }

            A12Config._state.apkDecompiled = true;
            A12Config._ensureDecompiledFs(engine);

            return `I: Using Apktool 2.9.3 on Voyager.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from framework-res.apk
I: Regular manifest package...
I: Decoding file-resources...
I: Decoding values */* XMLs...
I: Baksmaling classes.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...
I: Decoding complete.

Output directory: Voyager/

Voyager/
├── AndroidManifest.xml
├── apktool.yml
├── res/
│   ├── values/
│   │   ├── strings.xml
│   │   ├── colors.xml
│   │   └── styles.xml
│   ├── layout/
│   │   ├── activity_main.xml
│   │   ├── activity_login.xml
│   │   └── activity_map.xml
│   ├── xml/
│   │   └── network_security_config.xml
│   └── mipmap-xxxhdpi/
│       └── ic_launcher.png
├── smali/
│   └── com/
│       └── nomads/
│           └── voyager/
│               ├── api/
│               │   └── ApiClient.smali
│               ├── data/
│               │   ├── SafehouseProvider.smali
│               │   └── DatabaseHelper.smali
│               ├── util/
│               │   ├── PrefsManager.smali
│               │   └── CryptoUtil.smali
│               ├── ui/
│               │   ├── MainActivity.smali
│               │   ├── LoginActivity.smali
│               │   ├── MapActivity.smali
│               │   └── SafehouseActivity.smali
│               ├── service/
│               │   └── LocationSyncService.smali
│               └── receiver/
│                   └── BootReceiver.smali
└── original/
    └── META-INF/

KEY FINDINGS:
  [!] android:debuggable="true" in AndroidManifest.xml
  [!] Exported ContentProvider: com.nomads.voyager.data.SafehouseProvider
      Authority: com.nomads.voyager.provider (NO permission restriction)
  [!] Exported Activity: SafehouseActivity
  [!] cleartext traffic permitted in network_security_config.xml
  [!] MODE_WORLD_READABLE in PrefsManager.smali

TIP: Use jadx for Java source code (smali is harder to read).`;
        },

        // ── jadx (Java decompiler) ────────────────────────────
        'jadx': function(args, term, engine) {
            if (!args.length) {
                return `jadx - Dex to Java decompiler, version 1.4.7
Usage: jadx [options] <input files>

Options:
  -d, --output-dir   Output directory
  -r, --no-res       Skip resources decompilation
  -e, --export-gradle Export as gradle project
  --show-bad-code    Show decompilation errors in output`;
            }

            const apk = args.find(a => a.endsWith('.apk')) || '';
            if (!apk || (!apk.includes('Voyager') && !apk.includes('voyager'))) {
                return apk ? `jadx: error: ${apk}: file not found` : 'jadx: error: no input file specified';
            }

            const hasOutputDir = args.includes('-d');
            const outputDir = hasOutputDir ? (args[args.indexOf('-d') + 1] || 'output') : null;

            A12Config._state.jadxRun = true;
            A12Config._state.apkDecompiled = true;
            A12Config._ensureDecompiledFs(engine);

            const header = `jadx - Dex to Java decompiler v1.4.7
INFO  - loading ...
INFO  - processing ...
INFO  - decompilation complete`;

            if (outputDir) {
                return `${header}
INFO  - saving to: ${outputDir}/

${outputDir}/
├── sources/
│   └── com/
│       └── nomads/
│           └── voyager/
│               ├── api/
│               │   └── ApiClient.java          ← HARDCODED API KEY HERE
│               ├── data/
│               │   ├── SafehouseProvider.java   ← EXPORTED CONTENT PROVIDER
│               │   └── DatabaseHelper.java      ← SQLite schema + seed data
│               ├── util/
│               │   ├── PrefsManager.java        ← MODE_WORLD_READABLE
│               │   └── CryptoUtil.java          ← Weak XOR encryption
│               ├── ui/
│               │   ├── MainActivity.java
│               │   ├── LoginActivity.java
│               │   ├── MapActivity.java
│               │   └── SafehouseActivity.java
│               ├── service/
│               │   └── LocationSyncService.java
│               └── receiver/
│                   └── BootReceiver.java
└── resources/
    ├── AndroidManifest.xml
    ├── res/
    │   ├── values/strings.xml
    │   └── xml/network_security_config.xml
    └── assets/

CRITICAL FINDINGS:
  [!!] ApiClient.java:12  — private static final String API_KEY = "flag{v0y4g3r_h4rdc0d3d_4p1_k3y}"
  [!!] SafehouseProvider.java — Exported with NO permission checks
  [!!] PrefsManager.java — SharedPreferences MODE_WORLD_READABLE
  [!!] DatabaseHelper.java — Plaintext flag in safehouses table seed data
  [!]  CryptoUtil.java — XOR key "N0m4dK3y!" hardcoded
  [!]  Manifest — android:debuggable="true"

TIP: Review ApiClient.java for the hardcoded API key (User Flag).
     Query the ContentProvider for safehouse data (Root Flag).`;
            }

            // No output dir — show interactive summary
            return `${header}

Decompiled 14 classes from Voyager.apk

=== com.nomads.voyager.api.ApiClient ===
[Line 12] private static final String API_KEY = "flag{v0y4g3r_h4rdc0d3d_4p1_k3y}";
[Line 13] private static final String BASE_URL = "https://api.digitalnomads.net/v2";

=== com.nomads.voyager.data.SafehouseProvider ===
[EXPORTED] authority: com.nomads.voyager.provider
[WARNING] No permission checks — any app can query safehouse data
[URI] content://com.nomads.voyager.provider/safehouse

=== com.nomads.voyager.util.PrefsManager ===
[WARNING] MODE_WORLD_READABLE — SharedPreferences accessible by all apps
[File] /data/data/com.nomads.voyager/shared_prefs/voyager_prefs.xml

=== com.nomads.voyager.data.DatabaseHelper ===
[Table] safehouses: _id, codename, location, lat, lon, status, notes, flag
[Seed] 5 rows including NOMAD-PRIME with flag column

=== com.nomads.voyager.util.CryptoUtil ===
[WARNING] XOR cipher with static key "N0m4dK3y!" — trivially reversible

Use jadx -d <output_dir> Voyager.apk to save full Java source.`;
        },

        // ── strings (extract embedded strings from APK) ───────
        'strings': function(args, term, engine) {
            const file = args[0] || '';
            if (!file) return 'Usage: strings <file>';

            if (file === 'Voyager.apk' || file === './Voyager.apk' || file === '~/Voyager.apk') {
                return `com.nomads.voyager
Voyager
Digital Nomads Network
https://api.digitalnomads.net/v2
X-API-Key
flag{v0y4g3r_h4
rdc0d3d_4p1_k3y}
content://com.nomads.voyager.provider
safehouse
voyager.db
safehouses
MODE_WORLD_READABLE
SharedPreferences
voyager_prefs
N0m4dK3y!
ApiClient
SafehouseProvider
DatabaseHelper
PrefsManager
CryptoUtil
android.permission.INTERNET
android.permission.ACCESS_FINE_LOCATION
com.nomads.voyager.data.SafehouseProvider
com.nomads.voyager.provider
PHOENIX
MIRAGE
GHOST
NOMAD-PRIME
DRIFTER
Berlin
Bangkok
Reykjavik
Classified
Lisbon
auth_token
api_key
user_id
encrypted_passphrase
GCcWTh4NBRUGGAoTBQ==
emulator-5554
debuggable
allowBackup`;
            }

            if (file.includes('voyager_prefs.xml')) {
                return A12Config._apk.sharedPrefs;
            }

            return `strings: '${file}': No such file`;
        },

        // ── grep (search decompiled source) ───────────────────
        'grep': function(args, term, engine) {
            // Parse flags
            let recursive = false;
            let ignoreCase = false;
            let pattern = '';
            let searchPath = '';
            const cleanArgs = [];

            for (let i = 0; i < args.length; i++) {
                const a = args[i];
                if (a === '-r' || a === '-R' || a === '--recursive') { recursive = true; continue; }
                if (a === '-i' || a === '--ignore-case') { ignoreCase = true; continue; }
                if (a === '-ri' || a === '-ir' || a === '-rn' || a === '-rni' || a === '-rin') {
                    recursive = true;
                    if (a.includes('i')) ignoreCase = true;
                    continue;
                }
                if (a === '-n' || a === '--line-number') continue;
                if (a.startsWith('-')) continue;
                cleanArgs.push(a);
            }

            pattern = cleanArgs[0] || '';
            searchPath = cleanArgs[1] || '.';

            if (!pattern) return 'Usage: grep [options] PATTERN [FILE/DIR]';

            // Remove quotes from pattern
            pattern = pattern.replace(/^["']|["']$/g, '');

            // Search decompiled source
            if (recursive && (searchPath.includes('output') || searchPath.includes('Voyager') || searchPath === '.')) {
                if (!A12Config._state.apkDecompiled && !A12Config._state.jadxRun) {
                    return `grep: ${searchPath}: No such file or directory\n(Hint: Decompile the APK first with jadx or apktool)`;
                }

                const results = [];
                const re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ignoreCase ? 'i' : '');

                // Search through Java source files
                for (const [filePath, content] of Object.entries(A12Config._apk.javaSource)) {
                    const lines = content.split('\n');
                    lines.forEach((line, idx) => {
                        if (re.test(line)) {
                            const shortPath = searchPath.replace(/\/$/, '') + '/sources/' + filePath;
                            results.push(`${shortPath}:${idx + 1}:${line.trim()}`);
                        }
                    });
                }

                // Also search manifest and strings.xml
                const manifest = A12Config._apk.manifest;
                manifest.split('\n').forEach((line, idx) => {
                    if (re.test(line)) {
                        results.push(`${searchPath.replace(/\/$/, '')}/resources/AndroidManifest.xml:${idx + 1}:${line.trim()}`);
                    }
                });

                const stringsXml = A12Config._apk.stringsXml;
                stringsXml.split('\n').forEach((line, idx) => {
                    if (re.test(line)) {
                        results.push(`${searchPath.replace(/\/$/, '')}/resources/res/values/strings.xml:${idx + 1}:${line.trim()}`);
                    }
                });

                if (results.length === 0) return `grep: no matches for '${pattern}' in ${searchPath}`;
                return results.join('\n');
            }

            return `grep: ${searchPath}: No such file or directory`;
        },

        // ── file (identify file type) ─────────────────────────
        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';
            if (target === 'Voyager.apk' || target === './Voyager.apk') {
                return 'Voyager.apk: Zip archive data (Android APK), at least v2.0 to extract, package: com.nomads.voyager';
            }
            if (target.endsWith('.db')) {
                return `${target}: SQLite 3.x database, last written using SQLite version 3039004`;
            }
            return `${target}: cannot open (No such file or directory)`;
        },

        // ── sqlite3 (database browser) ────────────────────────
        'sqlite3': function(args, term, engine) {
            if (!args.length) {
                return `SQLite version 3.39.4
Usage: sqlite3 [OPTIONS] [FILENAME] [SQL]

Options:
  .tables    List tables
  .schema    Show CREATE statements
  .headers   Turn column headers on/off
  .mode      Set output mode (column, csv, json, etc.)
  .quit      Exit`;
            }

            const dbFile = args[0] || '';
            const query = args.slice(1).join(' ').replace(/^["']|["']$/g, '') || '';

            if (!dbFile.includes('voyager')) {
                return `Error: unable to open database "${dbFile}": file is not a database`;
            }

            if (!A12Config._state.dbPulled && !A12Config._state.apkInstalled) {
                return `Error: unable to open database "${dbFile}": no such file
(Hint: Pull the database first: adb pull /data/data/com.nomads.voyager/databases/voyager.db)`;
            }

            // .tables
            if (query === '.tables' || query.includes('.tables')) {
                return 'android_metadata  safehouses        sqlite_sequence';
            }

            // .schema
            if (query === '.schema' || query.includes('.schema')) {
                return `CREATE TABLE safehouses (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    codename TEXT NOT NULL,
    location TEXT NOT NULL,
    lat REAL,
    lon REAL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    flag TEXT
);
CREATE TABLE android_metadata (locale TEXT);
CREATE TABLE sqlite_sequence (name TEXT, seq INTEGER);`;
            }

            // SELECT queries
            if (query.toLowerCase().includes('select')) {
                const db = A12Config._apk.database;
                const q = query.toLowerCase();

                if (q.includes('from safehouses') || q.includes('from safehouse')) {
                    // Determine columns
                    let showAll = q.includes('*');
                    let showFlag = q.includes('flag') || showAll;

                    let header = '_id|codename|location|lat|lon|status|notes' + (showFlag ? '|flag' : '');
                    let rows = db.safehouses.map(r => {
                        let row = `${r._id}|${r.codename}|${r.location}|${r.lat}|${r.lon}|${r.status}|${r.notes}`;
                        if (showFlag) row += `|${r.flag || ''}`;
                        return row;
                    });

                    // WHERE clause filtering
                    if (q.includes('where')) {
                        if (q.includes("flag is not null") || q.includes("flag != ''") || q.includes("flag <>")) {
                            rows = rows.filter((_, i) => db.safehouses[i].flag);
                        } else if (q.includes("codename") && q.includes("nomad-prime")) {
                            rows = rows.filter((_, i) => db.safehouses[i].codename === 'NOMAD-PRIME');
                        } else if (q.includes("_id") && q.includes("4")) {
                            rows = rows.filter((_, i) => db.safehouses[i]._id === 4);
                        } else if (q.includes("status") && q.includes("compromised")) {
                            rows = rows.filter((_, i) => db.safehouses[i].status === 'compromised');
                        }
                    }

                    return header + '\n' + rows.join('\n');
                }

                if (q.includes('from android_metadata')) {
                    return 'locale\nen_US';
                }

                if (q.includes('from sqlite_sequence')) {
                    return 'name|seq\nsafehouses|5';
                }

                return `Error: no such table (check .tables for available tables)`;
            }

            // Default — show database info
            return `SQLite version 3.39.4
Connected to: ${dbFile}
Type ".tables" to list tables, ".schema" for schema, or enter SQL queries.`;
        },

        // ── nmap (network scanner) ────────────────────────────
        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target || target === '10.10.14.42') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.42
Host is up (0.032s latency).
Not shown: 999 closed tcp ports

PORT   STATE SERVICE VERSION
80/tcp open  http    nginx 1.24.0
| http-title: Digital Nomads — Network Status
|_http-server-header: nginx/1.24.0

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.47 seconds`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00010s latency).
Not shown: 999 closed tcp ports

PORT     STATE SERVICE
5037/tcp open  adb

Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // ── curl (HTTP client) ────────────────────────────────
        'curl': function(args, term, engine) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.14.42') && url.includes('/nomads/')) {
                return `<!DOCTYPE html>
<html>
<head><title>Digital Nomads — Network Status</title></head>
<body>
<h1>Digital Nomads — Network Status</h1>
<p>API Gateway: Online</p>
<p>Relay Nodes: 4/5 Active</p>
<p>Nordic Node: Compromised</p>
<p>Voyager v2.4.1 — Package: com.nomads.voyager</p>
<p>Known Issue: API keys hardcoded in APK source (fix deferred to v3.0)</p>
<p>ContentProvider: content://com.nomads.voyager.provider (exported, no permissions)</p>
</body>
</html>`;
            }

            if (url.includes('api.digitalnomads.net')) {
                // Check if API key header is present
                const hasKey = args.some(a => a.includes('X-API-Key') || a.includes('flag{v0y4g3r'));
                if (hasKey) {
                    return `{"status":"ok","safehouses":[{"codename":"PHOENIX","location":"Berlin, DE","status":"active"},{"codename":"MIRAGE","location":"Bangkok, TH","status":"active"},{"codename":"GHOST","location":"Reykjavik, IS","status":"compromised"},{"codename":"NOMAD-PRIME","location":"Classified","status":"active"},{"codename":"DRIFTER","location":"Lisbon, PT","status":"active"}],"message":"Use the ContentProvider for full data including flags."}`;
                }
                return '{"error":"unauthorized","message":"Missing or invalid X-API-Key header"}';
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // ── ping ──────────────────────────────────────────────
        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.42') {
                return `PING 10.10.14.42 (10.10.14.42) 56(84) bytes of data.
64 bytes from 10.10.14.42: icmp_seq=1 ttl=64 time=32.1 ms
64 bytes from 10.10.14.42: icmp_seq=2 ttl=64 time=31.8 ms
64 bytes from 10.10.14.42: icmp_seq=3 ttl=64 time=32.4 ms

--- 10.10.14.42 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 31.8/32.1/32.4/0.245 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ── unzip (extract APK as zip) ────────────────────────
        'unzip': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: unzip <file.apk|file.zip>';
            if (file === 'Voyager.apk' || file === './Voyager.apk') {
                return `Archive:  Voyager.apk
  inflating: AndroidManifest.xml
  inflating: classes.dex
  inflating: resources.arsc
  inflating: res/values/strings.xml
  inflating: res/xml/network_security_config.xml
  inflating: res/layout/activity_main.xml
  inflating: res/layout/activity_login.xml
  inflating: res/mipmap-xxxhdpi/ic_launcher.png
  inflating: META-INF/MANIFEST.MF
  inflating: META-INF/CERT.SF
  inflating: META-INF/CERT.RSA
  inflating: assets/config.json

TIP: Use apktool or jadx for proper decompilation (not just extraction).`;
            }
            return `unzip: cannot find or open ${file}`;
        },

        // ── sha256sum / md5sum ────────────────────────────────
        'sha256sum': function(args) {
            if (args.length === 0) return 'Usage: sha256sum [options] <file>';
            const file = args[0] || '';
            if (file === 'Voyager.apk' || file === './Voyager.apk') {
                return 'e4b7c2d1f8a3960571e2c4b5d6f7a890b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6  Voyager.apk';
            }
            return `sha256sum: ${file}: No such file or directory`;
        },
        'md5sum': function(args) {
            if (args.length === 0) return 'Usage: md5sum [options] <file>';
            const file = args[0] || '';
            if (file === 'Voyager.apk' || file === './Voyager.apk') {
                return 'a3c1f7e2b4d6890f1c2e3a4b5d6f7890  Voyager.apk';
            }
            return `md5sum: ${file}: No such file or directory`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // CONTENT PROVIDER QUERY HANDLER
    // ═══════════════════════════════════════════════════════

    _handleContentQuery(shellCmd) {
        const db = A12Config._apk.database;

        // Parse URI
        const uriMatch = shellCmd.match(/--uri\s+(content:\/\/[^\s]+)/);
        if (!uriMatch) {
            return 'Error: missing --uri argument\nUsage: content query --uri <URI> [--projection <COLUMNS>] [--where <CLAUSE>]';
        }
        const uri = uriMatch[1];

        if (!uri.includes('com.nomads.voyager.provider')) {
            return `Error: Unknown URI: ${uri}`;
        }

        // Check for specific safehouse ID
        const idMatch = uri.match(/\/safehouse\/(\d+)/);
        if (idMatch) {
            const id = parseInt(idMatch[1]);
            const row = db.safehouses.find(r => r._id === id);
            if (!row) return 'No result found.';
            return `Row: 0 _id=${row._id}, codename=${row.codename}, location=${row.location}, lat=${row.lat}, lon=${row.lon}, status=${row.status}, notes=${row.notes}, flag=${row.flag || 'NULL'}`;
        }

        // Full query — return all safehouses
        if (uri.includes('/safehouse')) {
            // Parse optional --where
            const whereMatch = shellCmd.match(/--where\s+["']?([^"']+)["']?/);
            let results = db.safehouses;

            if (whereMatch) {
                const where = whereMatch[1].toLowerCase();
                if (where.includes('flag is not null') || where.includes("flag != 'null'") || where.includes('flag <>')) {
                    results = results.filter(r => r.flag);
                } else if (where.includes('codename') && where.includes('nomad-prime')) {
                    results = results.filter(r => r.codename === 'NOMAD-PRIME');
                } else if (where.includes('status') && where.includes('compromised')) {
                    results = results.filter(r => r.status === 'compromised');
                }
            }

            if (results.length === 0) return 'No result found.';

            return results.map((r, i) =>
                `Row: ${i} _id=${r._id}, codename=${r.codename}, location=${r.location}, lat=${r.lat}, lon=${r.lon}, status=${r.status}, notes=${r.notes}, flag=${r.flag || 'NULL'}`
            ).join('\n');
        }

        return `Error: Unknown URI: ${uri}\nValid URIs:\n  content://com.nomads.voyager.provider/safehouse\n  content://com.nomads.voyager.provider/safehouse/{id}`;
    },

    // ═══════════════════════════════════════════════════════
    // DUMPSYS HANDLER
    // ═══════════════════════════════════════════════════════

    _handleDumpsys() {
        return `Activity Resolver Table:
  Non-Data Actions:
    android.intent.action.MAIN:
      com.nomads.voyager/.ui.MainActivity filter
    android.intent.action.BOOT_COMPLETED:
      com.nomads.voyager/.receiver.BootReceiver filter

Registered ContentProviders:
  com.nomads.voyager/.data.SafehouseProvider:
    authority=com.nomads.voyager.provider
    exported=true
    grantUriPermissions=true
    readPermission=null
    writePermission=null

Package [com.nomads.voyager] (a1b2c3d):
  versionCode=17 minSdk=26 targetSdk=33
  versionName=2.4.1
  flags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP ]
  pkgFlags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP ]
  applicationInfo:
    debuggable=true
    dataDir=/data/data/com.nomads.voyager
    nativeLibraryDir=/data/app/com.nomads.voyager/lib/arm64

  declared permissions:
    none

  requested permissions:
    android.permission.INTERNET
    android.permission.ACCESS_FINE_LOCATION
    android.permission.READ_EXTERNAL_STORAGE
    android.permission.WRITE_EXTERNAL_STORAGE

  Shared Prefs:
    /data/data/com.nomads.voyager/shared_prefs/voyager_prefs.xml
    Mode: MODE_WORLD_READABLE (0664)`;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM HELPER — Add decompiled files dynamically
    // ═══════════════════════════════════════════════════════

    _ensureDecompiledFs(engine) {
        const kaliDir = A12Config.filesystem['/'].children.home.children.kali.children;

        // Add output/ directory with decompiled Java source
        if (!kaliDir['output']) {
            kaliDir['output'] = {
                type: 'dir',
                children: {
                    'sources': {
                        type: 'dir',
                        children: {
                            'com': {
                                type: 'dir',
                                children: {
                                    'nomads': {
                                        type: 'dir',
                                        children: {
                                            'voyager': {
                                                type: 'dir',
                                                children: {
                                                    'api': {
                                                        type: 'dir',
                                                        children: {
                                                            'ApiClient.java': {
                                                                type: 'file',
                                                                content: A12Config._apk.javaSource['com/nomads/voyager/api/ApiClient.java']
                                                            }
                                                        }
                                                    },
                                                    'data': {
                                                        type: 'dir',
                                                        children: {
                                                            'SafehouseProvider.java': {
                                                                type: 'file',
                                                                content: A12Config._apk.javaSource['com/nomads/voyager/data/SafehouseProvider.java']
                                                            },
                                                            'DatabaseHelper.java': {
                                                                type: 'file',
                                                                content: A12Config._apk.javaSource['com/nomads/voyager/data/DatabaseHelper.java']
                                                            }
                                                        }
                                                    },
                                                    'util': {
                                                        type: 'dir',
                                                        children: {
                                                            'PrefsManager.java': {
                                                                type: 'file',
                                                                content: A12Config._apk.javaSource['com/nomads/voyager/util/PrefsManager.java']
                                                            },
                                                            'CryptoUtil.java': {
                                                                type: 'file',
                                                                content: A12Config._apk.javaSource['com/nomads/voyager/util/CryptoUtil.java']
                                                            }
                                                        }
                                                    },
                                                    'ui': {
                                                        type: 'dir',
                                                        children: {
                                                            'MainActivity.java': {
                                                                type: 'file',
                                                                content: A12Config._apk.javaSource['com/nomads/voyager/ui/MainActivity.java']
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
                    'resources': {
                        type: 'dir',
                        children: {
                            'AndroidManifest.xml': {
                                type: 'file',
                                content: A12Config._apk.manifest
                            },
                            'res': {
                                type: 'dir',
                                children: {
                                    'values': {
                                        type: 'dir',
                                        children: {
                                            'strings.xml': {
                                                type: 'file',
                                                content: A12Config._apk.stringsXml
                                            }
                                        }
                                    },
                                    'xml': {
                                        type: 'dir',
                                        children: {
                                            'network_security_config.xml': {
                                                type: 'file',
                                                content: A12Config._apk.networkSecurityConfig
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
        }

        // Add Voyager/ directory (apktool output)
        if (!kaliDir['Voyager']) {
            kaliDir['Voyager'] = {
                type: 'dir',
                children: {
                    'AndroidManifest.xml': {
                        type: 'file',
                        content: A12Config._apk.manifest
                    },
                    'apktool.yml': {
                        type: 'file',
                        content: '!!brut.apktool.meta.MetaInfo\napkFileName: Voyager.apk\nisFrameworkApk: false\npackageInfo:\n  forcedPackageId: "127"\n  renameManifestPackage: null\nsdkInfo:\n  minSdkVersion: "26"\n  targetSdkVersion: "33"\nversionInfo:\n  versionCode: "17"\n  versionName: 2.4.1'
                    },
                    'res': {
                        type: 'dir',
                        children: {
                            'values': {
                                type: 'dir',
                                children: {
                                    'strings.xml': {
                                        type: 'file',
                                        content: A12Config._apk.stringsXml
                                    }
                                }
                            },
                            'xml': {
                                type: 'dir',
                                children: {
                                    'network_security_config.xml': {
                                        type: 'file',
                                        content: A12Config._apk.networkSecurityConfig
                                    }
                                }
                            }
                        }
                    }
                }
            };
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#3DDC84; border-bottom:2px solid #1a352e; background:#0d2018;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #0d2018; color:#e0f5f2;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(22));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }

};
