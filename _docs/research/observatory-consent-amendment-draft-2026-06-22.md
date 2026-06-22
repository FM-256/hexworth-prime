# Observatory — Research Consent Amendment (DRAFT) — 2026-06-22

> **Status: DRAFT for PI + IRB.** Not approved, not live. Drafting aid only. The National University IRB must approve this amendment before the revised consent text is shown to any participant or before any expanded-scope (fishbowl / Dr. Hex) data collection begins. Companion to `observatory-analytics-expansion-2026-06-22.md` Part 4 (which this amendment gates).

## Why this exists
The Observatory shipped with consent language describing coarse interaction logging and an explicit "anonymized / no PII" promise. The planned expansion — comprehensive ("fishbowl") session capture, session reconstruction/replay, and Dr. Hex AI-interaction + transcript logging — collects **identifiable** data that the current language does not cover and, in part, contradicts. This amendment corrects that honestly. Part 4 of the expansion plan is **hard-gated** on its approval.

---

## Technical accuracy preface (engineering input for the PI's [PI TO CONFIRM] items)
The draft below was produced by the research-writing specialist and includes seven `[PI TO CONFIRM]` items. Here is what I can confirm from the implementation, so the PI fills the rest:

- **Item 1 — Storage location:** Research data lives in **Google Cloud Firestore under the `hexworth-prime` Firebase project** (collections `observatory_consent`, `observatory_enrollment`, `observatory_activity`, `observatory_withdrawals`; Dr. Hex events in `dr_hex_engagement_events`; AI transcripts via the orchestrator on the `hexclass` server). Nexus quality tooling writes aggregate reports to Firestore but not participant research data. PI to confirm region + any exports.
- **Item 4 — Security controls:** Firestore access is rule-gated; all `observatory_*` research reads/writes require admin (`isAdmin()`), and `observatory_activity` is server-write-only (Cloud Function, admin SDK; no client writes). Firebase encrypts at rest and in transit by default. There is **no per-read audit log** today (worth noting to IRB). The Dr. Hex orchestrator sits behind Cloudflare Access + an API key.
- **Item 5 — Screen/visual replay: NOT yet implemented.** It is a *planned, contingent* capability (expansion plan Phase 7) and is correctly described in the draft as a possibility. If the PI wants to keep the amendment to currently-built scope, the visual-replay paragraph should be softened to "may be added under a future amendment."
- **Withdrawal/deletion:** Matches the live `withdrawFromObservatory` Cloud Function — it deletes the participant's consent, enrollment, and **all** activity events (batched), permanently. One technical caveat for the draft's deletion clause: a **minimal tombstone** (`observatory_withdrawals/{uid}` = uid + timestamp only, **no PII, no research data**) is retained as a withdrawal audit record. This is not research data, but the PI should disclose it to the IRB for completeness.
- **Re-consent enforcement (Part C):** Already built. `ObservatoryConsent.ensureConsent()` re-prompts whenever the stored record's `formVersion` ≠ the current `FORM_VERSION` constant. Activating this amendment = bump `FORM_VERSION` (currently `cerbi-v1-2026-06-21` → e.g. `cerbi-v2-amendment-<approval-date>`) and replace the `CONSENT_SECTIONS` text. Every existing participant is then forced through re-consent on next entry. **Do not bump until the IRB approves.**

PI still owns: Item 2 (retention period), Item 3 (named access list), Item 6 (FERPA — likely applies; participants are NU students), Item 7 (minors — confirm none under 18).

---

## The draft amendment

DRAFT IRB CONSENT FORM AMENDMENT
Study: Gamification in Cybersecurity Training and CERBI Score Analysis
PI: Frank Mora, MCSIA · National University · frank.mora@keiseruniversity.edu · 904-616-8333
Amendment Version: 1.0 DRAFT — For PI and IRB Review Only

NOTICE TO PI: This document is a drafting aid prepared at your direction. It does not constitute IRB approval, legal advice, or a completed consent instrument. You must review every clause for accuracy against your actual data systems, verify all bracketed items, and submit to your IRB for review and approval before presenting to participants. Language marked [PI TO CONFIRM] requires your direct input before this draft is complete.

---

### PART A: SUMMARY OF CHANGES (Participant-Facing — Read First)

We are expanding this study. If you are an existing participant, we are asking you to review and re-confirm your consent before continuing. If you are a new participant, this document describes the full scope of the study as it currently stands.

Three things are changing. First, we are collecting more detailed records of how you interact with the platform — including which questions you attempt, how long you spend on each activity, and the commands you enter during hands-on exercises. Second, your learning sessions may be reconstructed or replayed from those records for research analysis. Third, an AI guide called "Dr. Hex" is now part of the learning experience, and the full text of any conversations you have with Dr. Hex will be recorded and used as research data.

Because these changes involve more detailed personal data than the original study described, we have also revised our confidentiality and risk disclosures to be accurate under the new scope. Please read all amended sections carefully before deciding whether to continue or to withdraw.

---

### PART B: AMENDED AND NEW CONSENT CLAUSES

The following clauses revise or replace the correspondingly titled sections of the original consent form. Sections of the original form not listed here remain in effect without change.

#### PROCEDURES — ADDENDUM

In addition to the course activities, training exercises, and competitions described in the original consent form, your participation now includes the following:

The platform will record detailed information about how you interact with each part of the learning environment. This includes, but is not limited to: which pages and sections you view; how far you scroll within a page; how much time you spend on each module or activity; periods when you appear focused versus inactive; the path you take through the platform's navigation; and any help or hint requests you make.

During quizzes and exams, the platform will record which answer you select for each question, whether you change that answer before submitting, and how much time you spend on each question.

During hands-on laboratory exercises and Capture-the-Flag challenges, the platform will record the commands you enter, the flag or answer attempts you submit, the errors you encounter, and any hints you request.

These records are collected automatically from your interactions with the HEXworth Academy platform while you are enrolled in the research cohort. No software is installed on your personal device. All recording occurs within the platform environment.

The overall study duration remains up to six months.

#### DETAILED DATA COLLECTION AND SESSION RECORDING (New Section)

The research team uses the interaction records described above to build a chronological log of your learning activity — a complete record of actions you took during each session, in the order you took them. The research team may use this log to reconstruct your learning sessions for analysis.

Two forms of session reconstruction are possible, and both may be used in this study:

Chronological reconstruction means the research team reviews your session as a time-ordered sequence of actions — for example, the sequence of questions you attempted, the commands you entered in a lab, or the path you navigated across modules.

Visual replay means the research team may be able to generate a visual representation of your on-screen activity within the platform, approximating what you saw and did during a session. [PI TO CONFIRM: Confirm whether visual/screen-replay functionality is implemented or planned in the platform. If not currently implemented, revise this paragraph to state it is a potential future capability under this amendment, contingent on separate technical deployment.]

This level of detail is collected because the research team studies not only what outcomes you achieve but how your behavior and decision-making process develop during cybersecurity training. This behavioral data is the core subject of the CERBI scoring and behavioral pattern analysis components of the study.

#### AI TUTOR INTERACTION AND CONVERSATION LOGGING (New Section)

The HEXworth Academy platform includes an AI guide named "Dr. Hex." Dr. Hex is aware of your current activity in the platform and uses that awareness to offer adaptive guidance — for example, suggesting a hint, explaining a concept, or checking in when you appear to be struggling. Dr. Hex may reach out to you proactively based on your activity, not only when you ask a question.

By continuing to participate, you agree that the following information related to Dr. Hex will be recorded as research data:

The timing and context of each instance when Dr. Hex offered assistance or intervened in your session; the reason the system identified as the trigger for that intervention; your response to the intervention (whether you engaged, dismissed it, or continued without response); the learning outcomes recorded in your session following each intervention; and the complete text of every message exchanged between you and Dr. Hex during your time in the research cohort.

You should be aware that Dr. Hex's design, communication style, and intervention behavior are themselves variables under study. The research team may analyze not only how you respond to Dr. Hex but whether different styles of AI guidance produce different learning outcomes.

You are not required to engage with Dr. Hex. You may dismiss prompts, skip interactions, or use the platform without responding to AI guidance. Your choice to engage or not engage is itself recorded and may be analyzed.

#### CONFIDENTIALITY AND DATA SECURITY (Revised — Replaces Original Confidentiality Clause)

The original consent form stated that your data would be "anonymized" and that "no personally identifiable information will be disclosed." That description was accurate under the original study scope. It is no longer accurate under the expanded scope described in this amendment, and we are revising it here.

How your data is handled during the study: Your research data — including your detailed interaction logs, session reconstructions, AI tutor conversation transcripts, and performance records — is linked to your platform account, which includes your name and email address. This means your data is identifiable to the research team while the study is active. Your data is stored in a restricted-access environment and is accessible only to authorized members of the research team and platform administrators. [PI TO CONFIRM: Identify the storage system (e.g., Firebase Firestore under the hexworth-prime project, or a separate research data store), the specific personnel who hold access, and confirm that access controls are enforced at the system level.]

How your data is handled in publications and reports: When results are reported, presented, or published, your data will be de-identified. No reports or publications will include your name, email address, or any information that could reasonably identify you as an individual participant.

The research team will not sell, rent, or share your identifiable data with any third party outside the study team. Data will not be used for commercial purposes.

[PI TO CONFIRM: If the platform is hosted on a third-party cloud provider, you may be required to disclose the provider and reference any applicable data processing agreements or FERPA/privacy compliance posture here.]

#### DATA USAGE (Revised — Replaces Original Data Usage Clause)

Your data, including behavioral logs, session records, quiz and lab performance data, and AI tutor conversation transcripts, will be used for the following purposes: academic analysis of cybersecurity training effectiveness; development and validation of the CERBI behavioral risk and engagement scoring framework; scholarly publications and conference presentations (in de-identified, aggregated, or anonymized form); and improvement of the HEXworth Academy platform's adaptive learning and AI guidance systems.

Data will not be repurposed for any use outside the scope of cybersecurity education research and behavioral framework development without your separate consent.

#### RISKS (Revised — Replaces Original Risks Clause)

This study presents minimal risk. Participation does not involve medical procedures, physical activity, or exposure to harmful material. All activities take place within a web-based educational platform.

The primary risk is privacy-related. Under the expanded study scope, the research team will hold detailed records of your learning behavior, including your quiz responses, commands entered during laboratory exercises, navigation patterns, and the complete text of your conversations with the AI tutor Dr. Hex. This is a more detailed personal record than the original study collected. Although access to this data is restricted to the research team and platform administrators, and although identifiable data will not appear in any publication, you should be aware that a comprehensive record of your activity within the platform exists and is retained for the duration of the study.

There is a small, indirect risk that detailed behavioral data, if compromised through a security breach, could reveal information about your cybersecurity knowledge gaps or learning difficulties. The research team has implemented access controls and secure storage to minimize this risk. [PI TO CONFIRM: Briefly describe the specific technical safeguards in place, such as encrypted storage, role-based access control, and audit logging, so this clause reflects your actual security posture.]

There are no anticipated risks to employment, academic standing, or personal reputation arising from participation. Participation is not connected to any course grade or academic evaluation.

#### VOLUNTARY PARTICIPATION, WITHDRAWAL, AND DATA DELETION (Revised — Replaces Original Voluntary Participation Clause)

Participation in this study is entirely voluntary. You may withdraw at any time and for any reason without penalty, without affecting your academic standing, and without affecting your continued access to HEXworth Academy outside of the research cohort.

The platform provides a one-step withdrawal process. When you withdraw, the following occurs immediately and permanently: your research consent record is deleted; your enrollment in the research cohort is terminated; and all research data collected about you — including interaction logs, session records, quiz and lab performance data, and AI tutor conversation transcripts — is permanently and irreversibly deleted from the research dataset.

[PI TO CONFIRM: Confirm that the deletion is technically implemented as described — specifically, that withdrawal triggers deletion of all Firestore records tied to the participant's UID in the research collection, including consent, enrollment, and all activity documents. Confirm whether deletion is synchronous or whether there is a brief processing window. Confirm whether any backup or export of data exists that would survive the deletion event, and if so, disclose that here.]

Because data deletion upon withdrawal is permanent, data collected before your withdrawal cannot be recovered or returned to you. You will not be asked to explain your decision to withdraw.

If you choose to withdraw, you may re-enroll in the study in the future if the study is still active, subject to completing a new consent process at that time.

---

### PART C: RE-CONSENT STATEMENT (For Existing Participants)

To be displayed to existing participants upon first login following amendment activation. The platform enforces re-consent on any form-version change; no existing participant may continue research-cohort activity without completing this step.

#### RE-CONSENT FOR EXISTING PARTICIPANTS

You have previously consented to participate in the study "Gamification in Cybersecurity Training and CERBI Score Analysis" conducted by PI Frank Mora at National University.

This study has been amended. The amendment expands data collection, introduces AI tutor interaction logging, and revises the confidentiality and risk disclosures to accurately reflect the new scope. The Summary of Changes at the beginning of this document describes what is different. We ask that you read the amended sections before deciding whether to continue.

Your previous consent applies only to the original study scope. To continue participating, you must affirmatively re-consent to the amended terms below.

You are not required to re-consent. If you prefer not to continue under the amended terms, you may withdraw. Withdrawal will permanently delete all data previously collected about you, as described in the Voluntary Participation, Withdrawal, and Data Deletion section above.

By selecting "I agree and wish to continue" below, you confirm the following: you have read the Summary of Changes and the amended consent clauses; you understand that the study now collects detailed behavioral data and AI tutor conversation transcripts that are identifiable to the research team; you understand that this data is de-identified in any publication or report; and you voluntarily agree to continue participating under the amended terms.

[ ] I agree and wish to continue participating under the amended terms.

[ ] I do not wish to continue. I understand that selecting this option will withdraw me from the study and permanently delete all data previously collected about me.

Participant Name (printed): _______________________________________

Date: _______________________________________

[PI TO CONFIRM: Determine whether a wet or electronic signature is required by your IRB for re-consent, and adjust this interface prompt accordingly. If electronic acknowledgment satisfies your IRB's re-consent standard, note that in your amendment submission.]

---

### PART D: DATA RETENTION AND SECURITY — ITEMS REQUIRING PI COMPLETION

The following items must be confirmed and documented before IRB submission.

- **[PI TO CONFIRM — Item 1, Storage Location]** — engineering input above (Firestore / `hexworth-prime`; orchestrator on `hexclass`). PI confirms region + exports.
- **[PI TO CONFIRM — Item 2, Data Retention Period]** — how long data is retained after study close (IRBs often require e.g. 5 years post-publication) and disposal method. PI/IRB owns.
- **[PI TO CONFIRM — Item 3, Access List]** — every individual with access to identifiable data (PI, co-investigators, RAs, platform admins). PI owns.
- **[PI TO CONFIRM — Item 4, Security Controls]** — engineering input above (rule-gated, server-write-only activity, Firebase encryption, CF Access on the orchestrator; NO per-read audit log today). PI confirms posture.
- **[PI TO CONFIRM — Item 5, Screen/Visual Replay]** — engineering input above: **not yet implemented**, planned (Phase 7), contingent. Recommend softening the visual-replay paragraph to a future-amendment capability if the PI wants the amendment to match currently-built scope.
- **[PI TO CONFIRM — Item 6, FERPA Applicability]** — participants are NU students → FERPA likely applies; interaction/performance data may be education records. PI/institution owns.
- **[PI TO CONFIRM — Item 7, Minor Participants]** — confirm none under 18; if any, parental permission + assent instruments are required (not drafted here).

---

## Activation checklist (after IRB approval — do NOT do before)
1. IRB approves the amendment (document approval + date).
2. Update `_app/components/ObservatoryConsent.js`: replace `CONSENT_SECTIONS` with the approved clauses; update `CONSENT_META` if needed; **bump `FORM_VERSION`** (e.g. `cerbi-v2-amendment-<date>`).
3. Deploy hosting (existing participants auto-re-consent on next entry via the built `formVersion` check).
4. Only THEN begin expanded-scope (fishbowl / Dr. Hex) data collection — i.e., build expansion-plan Part 4 (Phases 6–8).
