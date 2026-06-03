/**
 * fetchOpportunities.js — scheduled Cloud Function (LIVE-2)
 *
 * Polls public job and internship sources every 4 hours, normalizes
 * each posting to a standard schema, tags with Hexworth house affinity
 * via keyword classification, and writes to Firestore
 * `featured_opportunities` collection. The Internship Finder + Job
 * Board pages read from this collection to render their "live feed"
 * sections (LIVE-4).
 *
 * Sources (all TOS-friendly, no scraping, no paid APIs):
 *   1. USAJobs API — federal cyber jobs + Pathways internships.
 *      Endpoint: https://data.usajobs.gov/api/search
 *      Requires User-Agent: frank@hexworth.com (verified
 *      _app/faq.html:618 per CLAUDE.md "Search Before Asking" rule).
 *   2. Hacker News via Algolia — cybersecurity-tagged comments in
 *      the monthly "Ask HN: Who Is Hiring?" threads.
 *      Endpoint: https://hn.algolia.com/api/v1/search
 *   3. We Work Remotely RSS — remote cybersecurity job category.
 *      Endpoint: https://weworkremotely.com/categories/remote-cybersecurity-jobs.rss
 *
 * Schedule: every 4 hours (cron `15 0,4,8,12,16,20 * * *` in US-east).
 * Region: us-central1 (matches other Hexworth CFs).
 * TTL: 7 days. Items older than 7 days are pruned at the end of each run.
 *
 * Operator-pre-authorized for deploy per chat 2026-06-03.
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

// USAJobs API requires both User-Agent AND Authorization-Key headers.
// The key is registered separately at https://developer.usajobs.gov/
// with the contact email. Stored as a Firebase secret; set via:
//   firebase functions:secrets:set USAJOBS_API_KEY
// If not set, the USAJobs source is skipped gracefully on each run.
// Nancy round-1 (LIVE-6) flagged this as a blocking gap; we now degrade
// instead of 401ing every request.
const USAJOBS_API_KEY = defineSecret('USAJOBS_API_KEY');

/* ========================================================================
 * CONFIGURATION
 * ====================================================================== */

const COLLECTION_NAME = 'featured_opportunities';
const TTL_DAYS = 7;
const PER_SOURCE_LIMIT = 100;          // cap per source per run
const USAJOBS_USER_AGENT = 'frank@hexworth.com';   // verified in _app/faq.html:618
const FETCH_TIMEOUT_MS = 15000;

// USAJobs search keywords for cyber-related roles.
// SeriesCode filter: 2210 = Information Technology Management.
const USAJOBS_QUERIES = [
    { type: 'job',        params: { Keyword: 'cybersecurity', SeriesCode: '2210', ResultsPerPage: 50 } },
    { type: 'job',        params: { Keyword: 'security analyst', SeriesCode: '2210', ResultsPerPage: 50 } },
    { type: 'internship', params: { Keyword: 'cybersecurity', HiringPath: 'student', ResultsPerPage: 50 } },
];

// Hacker News Algolia query: comments in the latest "Ask HN: Who is hiring?"
// thread. We dynamically find the latest thread by searching for the title
// pattern first, then filter comments under it.
const HN_THREAD_TITLE_PATTERN = 'Ask HN: Who is hiring?';
const HN_CYBER_KEYWORDS = ['security', 'cybersecurity', 'infosec', 'soc', 'pentest', 'pen test', 'red team', 'blue team', 'siem', 'malware', 'threat', 'cloud security', 'appsec', 'devsecops'];

// We Work Remotely RSS endpoint (cybersecurity category).
const WWR_RSS_URL = 'https://weworkremotely.com/categories/remote-cybersecurity-jobs.rss';

/* ========================================================================
 * HEXWORTH HOUSE TAGGER
 * Keyword map derived from the 13 per-house careers.html role taxonomies.
 * Maps job titles + descriptions to one or more Hexworth houses based on
 * keyword presence. Returns the house with the highest match count.
 * ====================================================================== */

const HOUSE_KEYWORDS = {
    shield: ['soc analyst', 'grc', 'compliance', 'isso', 'risk analyst', 'defensive security', 'security engineer', 'security architect', 'ciso', 'security operations', 'vulnerability management', 'gov risk', 'governance'],
    eye: ['threat hunt', 'incident response', 'forensic', 'malware analy', 'threat intelligence', 'detection engineer', 'siem', 'cyops', 'wireshark', 'cysa+', 'soc tier'],
    'dark-arts': ['penetration test', 'pentest', 'red team', 'bug bounty', 'offensive security', 'exploit dev', 'vulnerability research', 'social engineering', 'wireless pentest', 'appsec pentest'],
    web: ['network engineer', 'network security', 'wireless engineer', 'voip', 'wan engineer', 'sd-wan', 'network architect', 'noc analyst', 'ccna', 'ccnp', 'ccie'],
    cloud: ['cloud security', 'aws security', 'azure security', 'gcp security', 'devsecops', 'finops', 'kubernetes security', 'k8s security', 'cloud architect', 'cloud engineer', 'iam engineer', 'cloud iam'],
    code: ['application security', 'appsec', 'security software', 'secure code review', 'sast', 'dast', 'reverse engineer', 'cryptographic software', 'supply chain security', 'software security'],
    script: ['linux administrator', 'site reliability', 'sre cyber', 'automation engineer', 'configuration management', 'container platform', 'embedded linux', 'devops security'],
    forge: ['help desk', 'desktop support', 'systems administrator', 'endpoint engineer', 'msp technician', 'it operations', 'windows administrator', 'it support', 'tier 1 support'],
    key: ['cryptographer', 'pki engineer', 'identity and access', 'hsm', 'quantum-safe', 'crypto compliance', 'key management', 'tls', 'certificate authority'],
    ai: ['ai security', 'ml security', 'machine learning security', 'ai red team', 'prompt injection', 'mlops security', 'llm security', 'trustworthy ai', 'responsible ai'],
    matrix: ['security architect', 'advanced linux', 'threat modeling', 'adversary emulation', 'red team lead', 'purple team', 'vciso', 'security operations director'],
    signal: ['hardware security', 'iot security', 'embedded security', 'firmware analysis', 'rf security', 'sdr', 'ics security', 'scada security', 'physical pentest', 'industrial control'],
    divergent: ['privacy officer', 'compliance officer', 'ai ethics', 'data protection officer', 'public policy cyber', 'technology ethicist', 'chief privacy', 'gdpr', 'ccpa'],
};

/**
 * Tag an opportunity with Hexworth house affinity.
 * Returns { house, score } where house is the slug with the highest
 * keyword hit count, or { house: null, score: 0 } if no keywords match.
 * Score is a 0-1 confidence based on hits / max possible.
 */
function tagHouse(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    let best = { house: null, score: 0, hits: 0 };
    for (const [house, keywords] of Object.entries(HOUSE_KEYWORDS)) {
        let hits = 0;
        for (const kw of keywords) {
            if (text.includes(kw)) hits++;
        }
        if (hits > best.hits) {
            best = { house, score: hits / keywords.length, hits };
        }
    }
    return { house: best.house, score: Math.min(best.score * 3, 1) };  // amplify; cap at 1
}

/* ========================================================================
 * SOURCE ADAPTERS
 * Each adapter fetches from one external source, parses the response,
 * and yields an array of opportunity records in the normalized schema:
 *
 *   {
 *     source: 'usajobs' | 'hn' | 'wwr',
 *     sourceId: string,             // unique per source
 *     type: 'job' | 'internship',
 *     title: string,
 *     company: string,
 *     location: string,
 *     url: string,
 *     postedAt: Date,
 *     description: string (short snippet),
 *     house: string | null,         // populated after tagging
 *     houseScore: number,           // 0-1
 *     role: string | null,          // role family hint
 *     hexworthScore: number,        // composite ranking score
 *     fetchedAt: Date,
 *   }
 * ====================================================================== */

async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Source: USAJobs. Federal cyber jobs + Pathways student programs.
 * Requires User-Agent with a real email (per USAJobs ToS).
 */
async function fetchUSAJobs() {
    const results = [];
    // Pull the API key from Firebase secrets. If not set, skip USAJobs
    // gracefully — let HN + WWR populate the feed alone until the
    // operator registers a key and sets the secret. Nancy LIVE-6 fix.
    let apiKey = '';
    // SecretParam.value() returns "" at runtime when the secret is unset
    // (it does NOT throw). The try/catch is belt-and-suspenders for the
    // FUNCTIONS_CONTROL_API="true" deployment-time path; at runtime the
    // catch is never entered. The if(!apiKey) below handles the empty case.
    try { apiKey = USAJOBS_API_KEY.value(); } catch (e) { apiKey = ''; }
    if (!apiKey) {
        console.warn('[usajobs] USAJOBS_API_KEY secret not set — skipping source. Register at developer.usajobs.gov and set via `firebase functions:secrets:set USAJOBS_API_KEY`.');
        return results;
    }

    for (const query of USAJOBS_QUERIES) {
        const params = new URLSearchParams(query.params);
        const url = `https://data.usajobs.gov/api/search?${params.toString()}`;
        try {
            const response = await fetchWithTimeout(url, {
                headers: {
                    'User-Agent': USAJOBS_USER_AGENT,
                    'Authorization-Key': apiKey,
                    'Host': 'data.usajobs.gov',
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                console.warn(`[usajobs] HTTP ${response.status} for ${url}`);
                continue;
            }
            const json = await response.json();
            const items = (json.SearchResult && json.SearchResult.SearchResultItems) || [];
            for (const item of items) {
                const desc = item.MatchedObjectDescriptor || {};
                const positionTitle = desc.PositionTitle || '';
                const organization = desc.OrganizationName || '';
                const positionLocation = (desc.PositionLocationDisplay || (desc.PositionLocation && desc.PositionLocation[0] && desc.PositionLocation[0].LocationName) || '');
                const positionURI = desc.PositionURI || '';
                const positionID = desc.PositionID || '';
                const summary = (desc.UserArea && desc.UserArea.Details && desc.UserArea.Details.JobSummary) || desc.QualificationSummary || '';
                const postedAtStr = desc.PublicationStartDate || new Date().toISOString();
                results.push({
                    source: 'usajobs',
                    sourceId: positionID,
                    type: query.type,
                    title: positionTitle,
                    company: organization,
                    location: positionLocation,
                    url: positionURI,
                    postedAt: new Date(postedAtStr),
                    description: summary.slice(0, 600),
                });
            }
        } catch (err) {
            console.warn(`[usajobs] fetch failed for ${url}:`, err.message);
        }
    }
    return results.slice(0, PER_SOURCE_LIMIT);
}

/**
 * Source: Hacker News via Algolia. Find the latest "Ask HN: Who is hiring?"
 * thread, fetch its comments, filter to cybersecurity-keyword matches.
 */
async function fetchHackerNews() {
    const results = [];
    try {
        // Step 1: find the latest "Ask HN: Who is hiring?" story.
        // Use search_by_date endpoint, not relevance — Nancy LIVE-6 round
        // flagged that the relevance endpoint reliably returns the most
        // ENGAGED-WITH thread (often years old), not the most recent one.
        const storyURL = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(HN_THREAD_TITLE_PATTERN)}&tags=story&hitsPerPage=10`;
        const storyResp = await fetchWithTimeout(storyURL);
        if (!storyResp.ok) {
            console.warn(`[hn] story search HTTP ${storyResp.status}`);
            return results;
        }
        const storyJson = await storyResp.json();
        // Find the most recent story that exactly contains the pattern
        const latestStory = (storyJson.hits || []).find(h =>
            h.title && h.title.toLowerCase().includes(HN_THREAD_TITLE_PATTERN.toLowerCase())
        );
        if (!latestStory) {
            console.warn('[hn] no Who is hiring thread found');
            return results;
        }
        const threadId = latestStory.objectID;

        // Step 2: fetch comments in that thread
        const commentURL = `https://hn.algolia.com/api/v1/search?tags=comment,story_${threadId}&hitsPerPage=100`;
        const commentResp = await fetchWithTimeout(commentURL);
        if (!commentResp.ok) {
            console.warn(`[hn] comments HTTP ${commentResp.status}`);
            return results;
        }
        const commentJson = await commentResp.json();
        for (const c of (commentJson.hits || [])) {
            const text = (c.comment_text || '').replace(/<[^>]+>/g, ' ').trim();
            if (!text) continue;
            const lower = text.toLowerCase();
            const hasCyber = HN_CYBER_KEYWORDS.some(k => lower.includes(k));
            if (!hasCyber) continue;

            // First line often has Company | Role | Location
            const firstLine = text.split('\n')[0].slice(0, 200);
            const title = firstLine || 'Cyber role at HN-listed company';
            results.push({
                source: 'hn',
                sourceId: c.objectID,
                type: 'job',
                title: title,
                company: 'See posting',
                location: 'See posting',
                url: `https://news.ycombinator.com/item?id=${c.objectID}`,
                postedAt: new Date(c.created_at_i * 1000),
                description: text.slice(0, 600),
            });
            if (results.length >= PER_SOURCE_LIMIT) break;
        }
    } catch (err) {
        console.warn('[hn] fetch failed:', err.message);
    }
    return results;
}

/**
 * Source: We Work Remotely cybersecurity category RSS.
 * Simple XML parsing without external libraries.
 */
async function fetchWeWorkRemotely() {
    const results = [];
    try {
        const response = await fetchWithTimeout(WWR_RSS_URL, {
            headers: { 'User-Agent': USAJOBS_USER_AGENT, 'Accept': 'application/rss+xml,application/xml' },
        });
        if (!response.ok) {
            console.warn(`[wwr] HTTP ${response.status}`);
            return results;
        }
        const xml = await response.text();
        // Naive RSS parse: split on <item>, extract <title>, <description>, <link>, <pubDate>
        const items = xml.split(/<item\b/i).slice(1).slice(0, PER_SOURCE_LIMIT);
        for (const itemRaw of items) {
            const title = (itemRaw.match(/<title>(?:<!\[CDATA\[)?([^<]*?)(?:\]\]>)?<\/title>/i) || [])[1] || '';
            const link = (itemRaw.match(/<link>([^<]*)<\/link>/i) || [])[1] || '';
            const description = (itemRaw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || [])[1] || '';
            const pubDate = (itemRaw.match(/<pubDate>([^<]*)<\/pubDate>/i) || [])[1] || '';
            const guid = (itemRaw.match(/<guid[^>]*>([^<]*)<\/guid>/i) || [])[1] || link;

            // Title often "Company: Role" or "Role at Company"
            const titleClean = title.replace(/&amp;/g, '&').trim();
            const descClean = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            results.push({
                source: 'wwr',
                sourceId: guid,
                type: 'job',
                title: titleClean,
                company: titleClean.split(/:\s*|\s+at\s+/i)[0] || 'See posting',
                location: 'Remote',
                url: link,
                postedAt: pubDate ? new Date(pubDate) : new Date(),
                description: descClean.slice(0, 600),
            });
        }
    } catch (err) {
        console.warn('[wwr] fetch failed:', err.message);
    }
    return results;
}

/* ========================================================================
 * NORMALIZATION + RANKING
 * Apply house tagging + composite score, dedupe by source+sourceId.
 * ====================================================================== */

function rankOpportunity(record) {
    // Composite Hexworth score: house match weight + recency weight.
    // Higher = more relevant.
    const ageMs = Date.now() - record.postedAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (ageDays / 30));  // 1.0 if today, 0 after 30d
    const houseScore = record.houseScore || 0;
    return (houseScore * 0.7) + (recencyScore * 0.3);
}

function prepareForFirestore(record) {
    const tag = tagHouse(record.title, record.description);
    record.house = tag.house;
    record.houseScore = tag.score;
    record.hexworthScore = rankOpportunity(record);
    record.role = null;       // future: extract role family from title
    record.fetchedAt = new Date();
    // Convert Dates to Firestore Timestamps for clean storage
    return {
        ...record,
        postedAt: Timestamp.fromDate(record.postedAt),
        fetchedAt: Timestamp.fromDate(record.fetchedAt),
    };
}

/* ========================================================================
 * FIRESTORE WRITE
 * Upsert records keyed by source+sourceId. Prune TTL-expired entries.
 * ====================================================================== */

async function writeRecords(db, records) {
    const collection = db.collection(COLLECTION_NAME);
    let upserts = 0;
    let errors = 0;
    // Use a batched write for atomicity + speed
    const batchSize = 400;  // Firestore batch limit is 500
    for (let i = 0; i < records.length; i += batchSize) {
        const chunk = records.slice(i, i + batchSize);
        const batch = db.batch();
        for (const record of chunk) {
            const docId = `${record.source}-${String(record.sourceId).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 200)}`;
            const ref = collection.doc(docId);
            batch.set(ref, record, { merge: true });
        }
        try {
            await batch.commit();
            upserts += chunk.length;
        } catch (err) {
            console.error(`[write] batch failed:`, err.message);
            errors += chunk.length;
        }
    }
    return { upserts, errors };
}

async function pruneExpired(db) {
    // TTL based on when WE fetched, not when the source posted. Nancy
    // LIVE-6 round flagged that federal jobs are routinely posted 2-6
    // weeks before the application window opens; pruning by postedAt
    // would delete USAJobs results in the same run that fetched them.
    // fetchedAt reflects our caching intent (refresh-or-drop after 7d).
    const cutoff = new Date(Date.now() - (TTL_DAYS * 24 * 60 * 60 * 1000));
    const snap = await db.collection(COLLECTION_NAME)
        .where('fetchedAt', '<', Timestamp.fromDate(cutoff))
        .limit(500)
        .get();
    if (snap.empty) return 0;
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snap.size;
}

/* ========================================================================
 * SCHEDULED ENTRY POINT
 * ====================================================================== */

const fetchOpportunities = onSchedule(
    {
        // Every 4 hours at :15 past, US-east timezone. Off-minute to avoid
        // top-of-hour API contention.
        schedule: '15 0,4,8,12,16,20 * * *',
        region: 'us-central1',
        timeZone: 'America/New_York',
        memory: '512MiB',
        timeoutSeconds: 540,        // 9 minutes — plenty for ~300 fetches
        retryConfig: { retryCount: 1 },
        // Bind the USAJOBS_API_KEY secret so .value() works at runtime.
        // If unset, fetchUSAJobs() skips that source cleanly (Nancy LIVE-6).
        secrets: [USAJOBS_API_KEY],
    },
    async (event) => {
        const db = getFirestore();
        const startedAt = Date.now();

        // Fetch from all 3 sources in parallel
        const [usajobs, hn, wwr] = await Promise.all([
            fetchUSAJobs(),
            fetchHackerNews(),
            fetchWeWorkRemotely(),
        ]);

        const raw = [...usajobs, ...hn, ...wwr];

        // Tag and rank
        const records = raw.map(prepareForFirestore);

        // Write to Firestore
        const writeResult = await writeRecords(db, records);

        // Prune TTL-expired entries
        const pruned = await pruneExpired(db);

        // Write a run summary for observability
        await db.collection('featured_opportunities_runs').add({
            startedAt: Timestamp.fromDate(new Date(startedAt)),
            finishedAt: Timestamp.fromDate(new Date()),
            durationMs: Date.now() - startedAt,
            sourceCounts: {
                usajobs: usajobs.length,
                hn: hn.length,
                wwr: wwr.length,
            },
            upserts: writeResult.upserts,
            writeErrors: writeResult.errors,
            pruned,
        });

        console.log(`[fetchOpportunities] usajobs=${usajobs.length} hn=${hn.length} wwr=${wwr.length} upserts=${writeResult.upserts} pruned=${pruned} took=${Date.now()-startedAt}ms`);
        return null;
    }
);

module.exports = {
    fetchOpportunities,
    // Exported for unit testing
    _internal: {
        tagHouse,
        rankOpportunity,
        prepareForFirestore,
        HOUSE_KEYWORDS,
    },
};
