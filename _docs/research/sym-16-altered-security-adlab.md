# SYM-16 — Altered Security AD Lab (CRTP) Competitive Analysis

> Source: https://www.alteredsecurity.com/adlab — fetched 2026-05-05
> Purpose: structured analysis of "Attacking and Defending Active Directory Lab" (CRTP cert) with explicit recommendations on what to port to Hexworth Prime and what to deliberately avoid.

## 1. What they offer (one-screen summary)

**Product:** Self-paced AD attack/defense lab + 14+ hour video course + CRTP certification exam.

**Pitch:** "Beginner-friendly platform for security professionals to understand, analyze and practice threats and attacks in a modern Active Directory environment" — built on 15+ years of red-team experience by Nikhil Mittal (BlackHat USA trainer, DEF CON speaker).

**Differentiator:** Practice lab (not CTF), guided + comprehensive (covers attack AND defense), with multi-domain/multi-forest realism on fully patched Windows Server 2022 — no N-day exploits.

| Offering | Details |
|---|---|
| **Lab tiers** | $249 (30 day) / $379 (60 day) / $499 (90 day), all include lifetime course access + 1 cert exam attempt |
| **Cert** | CRTP — 24-hour hands-on exam, 3-year validity, free renewal |
| **Skills** | 13 domains: enumeration, LPE, domain priv-esc, Kerberos forging, trust attacks, AD CS, defense bypass (MDE/MDI), deception |
| **Access** | Cloud-hosted student VM with Sliver C2 pre-installed; web browser OR VPN |
| **Support** | Email + Discord community + walk-through videos + 2 lab manuals |
| **Audience** | Beginner-to-intermediate red teamers; covers some blue-team material |

## 2. Items worth PORTING to Hexworth Prime (what they do well)

### 2.1 Pre-configured cloud student VM with C2 pre-installed

**What:** Student doesn't install anything locally. The lab provides a cloud Windows VM already loaded with PowerShell modules, .NET loaders, Sliver C2, BloodHound integration, etc.

**Why port:** Hexworth currently has the Docker sandbox infrastructure (bc1/bc2/bc3 per `reference_sandbox_infrastructure.md`) and BoxEngine for CTF boxes, but each student-bound interactive surface requires manual setup. A "ready-to-attack VM" reduces setup friction massively.

**Apply to:** Dark Arts house. The "operator workstation" pattern would fit naturally — student logs in, gets a pre-configured Kali/Parrot VM, can immediately attack the lab targets without 2 hours of tool installation.

**Ticket candidate:** SB-XX (extension of sandbox phases) — "Pre-configured operator VM image with red-team tooling"

### 2.2 Practice-first vs CTF-first design

**What:** They explicitly position as "practice lab rather than challenge lab" with integrated video course + lab manuals. Students learn → practice → solve, not guess-and-check.

**Why port:** Hexworth's current Arena leans CTF-style. The Dark Arts curriculum could benefit from a parallel practice-first track (lecture, then guided lab steps, then free-roam) — matches our existing CLH model in the script house but applied to red-team content.

**Apply to:** Dark Arts FEH-01 through FEH-10 already partially do this (presentation + lab pairs we just allowlisted). Reinforce the pattern; add walkthroughs for advanced labs.

### 2.3 Defense-aware curriculum (rare for red-team labs)

**What:** Their CRTP covers MDE telemetry evasion, MDI anomaly bypass, AND deception deployment (decoy users/computers). Not just "how to attack" but "how to NOT get caught" + "how to detect attackers."

**Why port:** Hexworth has Eye house (defense, forensics, OSINT) but the offensive/defensive content is siloed by house. A "purple team" track that explicitly bridges Dark Arts attack content with Eye detection content would differentiate Hexworth from pure-offensive certs.

**Apply to:** New cross-house module track (Matrix house? Or a new "Purple" sub-house?). Each red-team technique gets a paired blue-team detection lab.

**Ticket candidate:** Multi-sprint initiative — start with one paired lab as PoC.

### 2.4 Multi-domain/multi-forest realism

**What:** Their lab has multiple domains and forests configured for cross-trust attack practice. Most beginner AD labs are single-domain; theirs reflects enterprise reality.

**Why port:** When Hexworth eventually does AD content (currently sparse), follow this — single-domain labs teach the wrong mental model.

**Apply to:** Future Cloud or Forge house AD curriculum. Don't ship single-domain-only AD labs.

### 2.5 Free certification renewal exam before expiry

**What:** CRTP is valid 3 years; a free renewal exam is provided before expiry. Renewal fee only applies if you let it lapse.

**Why port:** Builds long-term student loyalty and recurring re-engagement without nickel-and-diming. Most certs charge for everything.

**Apply to:** Hexworth's eventual cert mechanics (if/when we sell certs). Bake free renewal into the pricing model.

### 2.6 Discord community + walk-through videos for "stuck" students

**What:** Email support is async; Discord gives real-time peer help. Walk-through videos exist for students who're truly blocked.

**Why port:** Hexworth has Hive (community surface) but no formal stuck-student path. Walkthroughs exist as Spellbook auditor but aren't student-facing.

**Apply to:** Hive could become Discord-equivalent. Per-lab "I'm stuck" reveal of a walkthrough video would help retention.

### 2.7 Pricing simplicity

**What:** Three tiers (30/60/90 day), each fully described in one card. No feature-matrix nightmare.

**Why port:** When Hexworth eventually adds paid tiers, follow this UX. Avoid the "Bronze/Silver/Gold/Platinum/Enterprise" SaaS complexity trap.

## 3. Items to deliberately AVOID

### 3.1 Time-limited lab access on top of "lifetime course access"

**What:** Pay $249, get 30 days of lab access. Pay $499, get 90 days. After that, lab access expires; renewal is $199 for another 30 days.

**Why avoid:** This is the textbook "anchor + upsell" pricing that pressures students into rushed completion. Hexworth's gamification model (XP, streaks, houses) works against this — we WANT students to come back over months/years.

**Hexworth model to preserve:** Always-on access. Make money via cohort sponsorships, B2B licenses, or premium content tiers — never by metering individual lab access.

### 3.2 Pay-per-exam-attempt

**What:** $99 per additional exam attempt. Cooldown periods (1 month between attempts; 6 months after 3 attempts).

**Why avoid:** Punishes students for failing. Doesn't increase learning — increases anxiety + dropout. Hexworth's quiz/exam model can attempt multiple times by design.

**Hexworth model to preserve:** Reattemptable assessments. Track best score; show progress over time.

### 3.3 "Industry recognition" claims as marketing crutch

**What:** Heavy emphasis on "industry-recognized certification," "prerequisite for job postings," "recognized by industrial bodies and governments."

**Why avoid:** Hexworth's value isn't (yet) industry recognition — it's pedagogical depth + house culture. Don't fake recognition we don't have. Build it via NSF/ATE grant outcomes and named institutional adopters first.

### 3.4 Wix as the platform

**What:** Their site is built on Wix. Probably good enough for marketing pages but limits what they can do interactively on the marketing surface.

**Why avoid:** Hexworth Prime (the platform) is custom for a reason — interactive labs need direct control. Don't move marketing surfaces to a hosted platform if it constrains future integration with the lab UX.

### 3.5 "Beginner friendly" claim with significant prerequisite skill assumption

**What:** Marketed as "beginner friendly" but assumes basic AD knowledge + Windows command-line ability. Real beginners will struggle.

**Why avoid:** Hexworth's sorting hat + housed onboarding does the actual beginner work — placing students at the right entry point. Don't claim "beginner friendly" if there's still a 5-skill prerequisite list. Honest positioning > marketing-speak.

### 3.6 Headshot of the founder as primary trust signal

**What:** Nikhil Mittal's photo + credentials (BlackHat trainer, DEF CON speaker) are the central trust mechanism on the page.

**Why avoid:** Hexworth is institution-backed (Mexico Beach STEM Academy / TFM Atelier / faculty roles). Trust signals should come from the institutions and student outcomes, not from a single founder's pedigree. Avoids key-person risk + scales better.

## 4. Open questions / decisions for user

1. **Cross-house "Purple Team" track** — worth scoping? Could be a small PoC first (one Dark Arts lab + one Eye detection lab paired) before committing to a full track.

2. **Pre-configured operator VM** — this would extend the existing Docker sandbox work (SB-15 to SB-19 per memory). Scope-wise it's a multi-week project. Worth adding as a SYM-XX item or rolled into existing SB-XX phases?

3. **Cert mechanics** — Hexworth doesn't currently sell certs. If/when we do, the CRTP pricing is a useful reference (low entry, free renewal, no per-attempt fees). But this is a strategic decision that depends on B2B sales motion + grant outcomes — out of scope for SYM-16 directly.

4. **Walk-through video pattern** — Spellbook auditor audits walkthroughs internally; should they become student-facing for "stuck" cases? Tradeoff: helps retention but reduces challenge (students click "show walkthrough" too quickly).

5. **AD content roadmap** — currently Hexworth has minimal AD content (some in Cloud house under server-plus / az-104 indirectly). If AD becomes a serious track, the multi-domain/multi-forest realism lesson is important to bake in early.

## 5. Summary verdict

**Their CRTP is well-executed for a focused commercial product** — strong instructor credibility, modern infrastructure, defense-aware coverage, simple pricing, sustainable cert mechanics. Worth respecting as a competitor.

**Where they win and Hexworth doesn't:** depth in a single specialty (AD), pre-configured tooling, polished video course, established cert recognition.

**Where Hexworth wins and they don't:** breadth across security domains (10 houses vs 1 specialty), gamified retention (houses, XP, sorting), always-on access (no time-limit pressure), institutional anchoring (vs founder-anchored), interactive native labs (vs slide-based course + separate VM).

**The two products are complementary not competitive in 2026** — a learner serious about AD red team should arguably do both: Hexworth for breadth + foundational concepts, CRTP for deep AD specialization + an industry-recognized cert.

**Strategic implication:** don't try to clone CRTP. Take the 7 portable wins above (especially: pre-configured operator VM, defense-aware curriculum, walk-through videos for stuck students). Avoid the 6 anti-patterns. Hexworth's positioning is "the academy that teaches you the entire field, gamified" — different mission, complementary outcome.

---

## Reference

- Source page: https://www.alteredsecurity.com/adlab
- Founder: Nikhil Mittal (https://www.linkedin.com/in/nikhilmittal)
- Sister cert tracks (mentioned for renewal eligibility): CRTE, CETP, CRTM
- Comparable products to investigate next (would be separate research items): HackTheBox PRO Lab Offshore, OffSec PEN-300 (Windows tradecraft), TryHackMe AD path
