-- ============================================================================
-- Hexworth Credential Authority (HCA) — authoritative registry schema
-- PostgreSQL (Cloud SQL). Foundation / core entities. DRAFT v4 (post Nancy R3).
--
-- WHY THIS SHAPE: the HCA's product is TRUST. The registry must be UNABLE to
-- represent an invalid credential — integrity by construction (constraints +
-- triggers), atomic all-or-nothing issuance, self-policing revocation. Trust
-- itself comes from the signed payload + the public status list, NOT this DB.
-- See _docs/architecture/hexworth-credential-authority.md.
--
-- v3 closes Nancy R2's blockers + hardening:
--   - results_snapshots anchor table (certification/lock unit); canonical pointer
--     and all result rows FK to a REAL snapshot (no orphan/typo'd version).
--   - StatusList2021 done right: status_lists per purpose (revocation|suspension),
--     credential_status_list_entries, and a REQUIRED revocation entry at issuance.
--   - Audit chain: advisory-lock serialized (no fork) + hash covers ALL fields.
--   - Evidence write-once (immutable post-issuance); subject<->evidence binding
--     enforced (no wrong-person credential); snapshot children immutable once locked.
-- v4 closes Nancy R3:
--   - child-immutability trigger checks BOTH the OLD and NEW snapshot on UPDATE, so a
--     row can't be reassigned out of (or into) a locked snapshot.
--   - canonical pointer AND issuance both require a LOCKED snapshot (no issuing from
--     a still-mutable, not-yet-certified snapshot).
--   - audit hash is over a jsonb_build_object pre-image (quoted fields) — no delimiter
--     collision from a '|' inside a free-text field.
--   - corrected reissue is explicit: revision + supersedes_id, so a typo fix is a
--     distinct, non-colliding credential that supersedes the old one.
--   NOTE: the app inserts audit_events ONE row per statement (natural pattern) so each
--   row's BEFORE trigger sees the prior committed/earlier hash; the advisory lock
--   serializes across transactions. It is the only advisory lock the HCA uses.
--
-- NOT EXECUTION-VALIDATED: no local Postgres available at authoring time. Applying
-- this against Cloud SQL and running the trigger tests (hca/db/schema.test.sql, TBD)
-- is the MANDATORY first Phase-2 step before any credential issues.
--
-- DEFERRED WITH RATIONALE (surfaced, not dropped): non-competition families
-- (instructor_review, peer_review, portfolio, interview, multi_stage) have no
-- occasion anchor yet, so idempotency for them would rely on an app-invented
-- occasion_ref the DB can't validate. October scope is COMPETITION ONLY, which has
-- real anchors (event_result_id / event_specialty_result_id). An occasion/assessment
-- anchor table is added when those families ship. See open question 8 in the design doc.
--
-- KNOWN DEFERRED to the Phase-2 Cloud SQL gate / schema.test.sql (Nancy R4, non-blocking —
-- none corrupt data under the documented flow, only under a buggy app-layer call):
--   - Issue-only-from-CANONICAL results: trg_fn_assertion_guard checks the referenced
--     result's snapshot is LOCKED, but not that it's the CURRENT canonical version — so a
--     credential could be issued off a superseded-but-still-locked snapshot. Add a
--     canonical-version check (join event_canonical_results) at issuance.
--   - Correction lockstep + lineage: enforce (via a DEFERRABLE constraint trigger) that
--     when supersedes_id is set, the superseded row shares subject/definition/occasion AND
--     is demoted to 'superseded' in the same tx, so a correction can't leave two active
--     credentials. (The revision/supersedes coupling CHECK is done; the field-match +
--     demotion trigger is deferred.)
-- ============================================================================

BEGIN;

-- pgcrypto provides digest()/sha256 for the audit hash chain.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE credential_family AS ENUM (
  'competition', 'technical', 'professional', 'leadership',
  'research', 'instructor', 'partner', 'legacy', 'community', 'special_recognition'
);
CREATE TYPE credential_level AS ENUM (
  'foundation', 'practitioner', 'professional', 'advanced',
  'expert', 'master', 'distinguished', 'fellow'
);
CREATE TYPE assertion_status AS ENUM (
  'active', 'private', 'suspended', 'expired', 'revoked', 'superseded', 'archived'
);
CREATE TYPE definition_status AS ENUM ('draft', 'approved', 'published', 'retired');
CREATE TYPE evidence_type AS ENUM (
  'assessment', 'instructor_review', 'tournament_placement', 'tournament_specialty',
  'peer_review', 'lab_completion', 'practical_exam', 'research_publication',
  'portfolio', 'interview', 'multi_stage'
);
-- StatusList2021 statusPurpose: revocation is permanent, suspension is reversible.
-- They are SEPARATE lists, so an off-DB verifier can distinguish the two.
CREATE TYPE status_purpose AS ENUM ('revocation', 'suspension');

-- ---------------------------------------------------------------------------
-- issuers
-- ---------------------------------------------------------------------------
CREATE TABLE issuers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  did              TEXT NOT NULL,
  allowed_families credential_family[] NOT NULL DEFAULT '{}',
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- credential_definitions + versions
-- ---------------------------------------------------------------------------
CREATE TABLE credential_definitions (
  id          TEXT PRIMARY KEY,
  issuer_id   TEXT NOT NULL REFERENCES issuers(id),
  family      credential_family NOT NULL,
  level       credential_level,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credential_definition_versions (
  id                TEXT PRIMARY KEY,
  definition_id     TEXT NOT NULL REFERENCES credential_definitions(id),
  version           INTEGER NOT NULL CHECK (version > 0),
  status            definition_status NOT NULL DEFAULT 'draft',
  criteria          TEXT NOT NULL,
  skills            TEXT[] NOT NULL DEFAULT '{}',
  required_evidence evidence_type[] NOT NULL CHECK (array_length(required_evidence, 1) >= 1),
  badge_art         TEXT,
  expires_after     INTERVAL,
  public_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (definition_id, version)
);
CREATE UNIQUE INDEX uq_one_published_version
  ON credential_definition_versions (definition_id)
  WHERE status = 'published';

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
CREATE TABLE events (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  kind      TEXT NOT NULL DEFAULT 'ctf_tournament',
  starts_at TIMESTAMPTZ,
  ends_at   TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- results_snapshots — the CERTIFICATION + LOCK unit (Nancy R2 #3 anchor). One row
-- per (event_id, results_version). All result rows are its children; the canonical
-- pointer references it. Immutable once locked; corrections = a NEW results_version
-- + repointing event_canonical_results. Centralizes certified_at/approved_by/locked.
-- ---------------------------------------------------------------------------
CREATE TABLE results_snapshots (
  event_id        TEXT NOT NULL REFERENCES events(id),
  results_version TEXT NOT NULL,
  certified_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by     TEXT NOT NULL,
  locked          BOOLEAN NOT NULL DEFAULT FALSE,   -- flipped true when certified
  PRIMARY KEY (event_id, results_version)
);

-- event_results — team placements (children of a snapshot). placement is tie-broken
-- with the canonical rule (BUG-022). One team per placement per snapshot.
CREATE TABLE event_results (
  id              TEXT PRIMARY KEY,
  event_id        TEXT NOT NULL,
  results_version TEXT NOT NULL,
  team_id         TEXT NOT NULL,
  team_name       TEXT,
  placement       INTEGER NOT NULL CHECK (placement > 0),
  score           INTEGER,
  FOREIGN KEY (event_id, results_version) REFERENCES results_snapshots (event_id, results_version),
  UNIQUE (event_id, results_version, team_id),
  UNIQUE (event_id, results_version, placement),
  UNIQUE (id, event_id, results_version)           -- lets members carry a composite FK
);

-- Normalized team membership. A person can't be on two teams in one snapshot.
CREATE TABLE event_result_members (
  event_result_id TEXT NOT NULL,
  event_id        TEXT NOT NULL,
  results_version TEXT NOT NULL,
  subject_id      TEXT NOT NULL,
  PRIMARY KEY (event_result_id, subject_id),
  UNIQUE (event_id, results_version, subject_id),
  FOREIGN KEY (event_result_id, event_id, results_version)
    REFERENCES event_results (id, event_id, results_version)
);

-- Individual specialty outcomes (Team MVP, Best OSINT, Fastest Blood) — children of
-- a snapshot. Specialty assertions anchor evidence HERE, not on a team row.
CREATE TABLE event_specialty_results (
  id              TEXT PRIMARY KEY,
  event_id        TEXT NOT NULL,
  results_version TEXT NOT NULL,
  specialty_key   TEXT NOT NULL,
  subject_id      TEXT NOT NULL,
  team_id         TEXT,
  detail          TEXT,
  FOREIGN KEY (event_id, results_version) REFERENCES results_snapshots (event_id, results_version),
  UNIQUE (event_id, results_version, specialty_key, subject_id)
);

-- Which certified version is CANONICAL for issuance now. FK to a REAL snapshot
-- (Nancy R2 #3): a typo'd/stale results_version can no longer be pointed at.
CREATE TABLE event_canonical_results (
  event_id        TEXT PRIMARY KEY,
  results_version TEXT NOT NULL,
  set_by          TEXT NOT NULL,
  set_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (event_id, results_version) REFERENCES results_snapshots (event_id, results_version)
);

-- ---------------------------------------------------------------------------
-- credential_assertions — the credential awarded to a person.
-- DEDUP: a composite UNIQUE (definition_version_id, subject_id, occasion_ref, revision)
-- enforces "earned once per occasion per revision" on the REAL fields — no dependency on
-- an app-computed hash being consistent (Nancy R4 #4). occasion_ref discriminates the
-- earning occasion (result/specialty id for competition); `revision` distinguishes a
-- CORRECTED reissue (revision+1, supersedes_id -> the old row, set to 'superseded') from an
-- accidental duplicate. Status-list slots live in credential_status_list_entries; a
-- 'revocation' entry is REQUIRED at issuance (trigger) so every credential is revocable.
-- ---------------------------------------------------------------------------
CREATE TABLE credential_assertions (
  id                                TEXT PRIMARY KEY,
  public_id                         TEXT NOT NULL UNIQUE,
  occasion_ref                      TEXT NOT NULL,
  revision                          INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  supersedes_id                     TEXT REFERENCES credential_assertions(id),  -- set on a corrected reissue
  credential_definition_version_id  TEXT NOT NULL REFERENCES credential_definition_versions(id),
  issuer_id                         TEXT NOT NULL REFERENCES issuers(id),
  subject_id                        TEXT NOT NULL,
  event_result_id                   TEXT REFERENCES event_results(id),
  event_specialty_result_id         TEXT REFERENCES event_specialty_results(id),
  current_status                    assertion_status NOT NULL DEFAULT 'active',
  issued_at                         TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                        TIMESTAMPTZ,
  signed_payload_jsonb              JSONB NOT NULL,
  payload_hash                      TEXT NOT NULL,
  signature_reference               TEXT NOT NULL,
  created_at                        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- at most one result ref (a credential is either a team placement OR an
  -- individual specialty OR neither, never both)
  CHECK (NOT (event_result_id IS NOT NULL AND event_specialty_result_id IS NOT NULL)),
  -- Dedup by the REAL fields (Nancy R4 #4): no dependency on an app-computed hash being
  -- consistent. A person earns a given standard once per occasion per revision; a
  -- corrected reissue bumps revision, a true duplicate (same occasion+revision) is blocked.
  UNIQUE (credential_definition_version_id, subject_id, occasion_ref, revision),
  -- a corrected reissue has a lineage (supersedes_id); an original (revision 0) does not.
  CHECK ((revision = 0) = (supersedes_id IS NULL))
);
CREATE INDEX idx_assertions_subject ON credential_assertions (subject_id);
CREATE INDEX idx_assertions_event_result ON credential_assertions (event_result_id);
CREATE INDEX idx_assertions_status ON credential_assertions (current_status);

-- ---------------------------------------------------------------------------
-- Status lists (StatusList2021). One list per purpose; the signed bitstring
-- artifact itself lives in GCS (gcs_uri). credential_status_list_entries assigns
-- each credential a slot; a 'revocation' entry is mandatory at issuance.
-- ---------------------------------------------------------------------------
CREATE TABLE status_lists (
  id         TEXT PRIMARY KEY,
  purpose    status_purpose NOT NULL,
  gcs_uri    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, purpose)                             -- lets entries FK on purpose
);
CREATE TABLE credential_status_list_entries (
  assertion_id      TEXT NOT NULL REFERENCES credential_assertions(id),
  purpose           status_purpose NOT NULL,
  status_list_id    TEXT NOT NULL,
  status_list_index INTEGER NOT NULL CHECK (status_list_index >= 0),
  PRIMARY KEY (assertion_id, purpose),
  UNIQUE (status_list_id, status_list_index),
  -- the entry's purpose must match its list's purpose
  FOREIGN KEY (status_list_id, purpose) REFERENCES status_lists (id, purpose)
);

-- ---------------------------------------------------------------------------
-- evidence_records — WHY awarded. Write-once (immutable) after issuance.
-- Every assertion needs >=1 evidence row (trigger, at commit).
-- ---------------------------------------------------------------------------
CREATE TABLE evidence_records (
  id                        TEXT PRIMARY KEY,
  assertion_id              TEXT NOT NULL REFERENCES credential_assertions(id),
  type                      evidence_type NOT NULL,
  is_public                 BOOLEAN NOT NULL DEFAULT TRUE,
  summary                   TEXT NOT NULL,
  detail_jsonb              JSONB,
  event_result_id           TEXT REFERENCES event_results(id),
  event_specialty_result_id TEXT REFERENCES event_specialty_results(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_evidence_assertion ON evidence_records (assertion_id);

-- ---------------------------------------------------------------------------
-- credential_status_history — APPEND-ONLY; kept in lockstep with current_status.
-- ---------------------------------------------------------------------------
CREATE TABLE credential_status_history (
  id           BIGSERIAL PRIMARY KEY,
  assertion_id TEXT NOT NULL REFERENCES credential_assertions(id),
  from_status  assertion_status,
  to_status    assertion_status NOT NULL,
  reason       TEXT,
  actor        TEXT NOT NULL,
  at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- audit_events — APPEND-ONLY, HASH-CHAINED, SERIALIZED. entry_hash chains over ALL
-- meaningful fields; an advisory lock serializes writers so the chain can't fork.
-- ---------------------------------------------------------------------------
CREATE TABLE audit_events (
  id             BIGSERIAL PRIMARY KEY,
  actor          TEXT NOT NULL,
  action         TEXT NOT NULL,
  target         TEXT,
  previous_value JSONB,
  new_value      JSONB,
  reason         TEXT,
  source_system  TEXT,
  correlation_id TEXT,
  prev_hash      TEXT,
  entry_hash     TEXT NOT NULL DEFAULT '',
  at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- TRIGGERS
-- ===========================================================================

-- (A) Snapshot + children immutable once the snapshot is locked.
CREATE OR REPLACE FUNCTION trg_fn_snapshot_immutable() RETURNS trigger AS $$
BEGIN
  -- Block mutating/deleting a locked snapshot (unlocked->locked is still allowed).
  IF OLD.locked THEN
    RAISE EXCEPTION 'results snapshot (%,%) is locked and immutable; correct via a new results_version',
      OLD.event_id, OLD.results_version;
  END IF;
  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_snapshot_immutable BEFORE UPDATE OR DELETE ON results_snapshots
  FOR EACH ROW EXECUTE FUNCTION trg_fn_snapshot_immutable();

CREATE OR REPLACE FUNCTION trg_fn_child_of_locked_snapshot() RETURNS trigger AS $$
DECLARE v_locked BOOLEAN;
BEGIN
  -- Block if the row's OLD snapshot (UPDATE/DELETE) is locked — can't move/delete a
  -- row OUT of a certified snapshot (Nancy R3 #1: the prior version checked NEW only,
  -- so UPDATE ... SET results_version=<other-unlocked> slipped a row out of the lock).
  IF TG_OP IN ('UPDATE','DELETE') THEN
    SELECT locked INTO v_locked FROM results_snapshots
      WHERE event_id = OLD.event_id AND results_version = OLD.results_version;
    IF v_locked THEN
      RAISE EXCEPTION 'snapshot (%,%) is locked; its result rows cannot be %',
        OLD.event_id, OLD.results_version, TG_OP;
    END IF;
  END IF;
  -- Block if the row's NEW snapshot (INSERT/UPDATE) is locked — can't add/move a row INTO one.
  IF TG_OP IN ('INSERT','UPDATE') THEN
    SELECT locked INTO v_locked FROM results_snapshots
      WHERE event_id = NEW.event_id AND results_version = NEW.results_version;
    IF v_locked THEN
      RAISE EXCEPTION 'snapshot (%,%) is locked; cannot % a row into it',
        NEW.event_id, NEW.results_version, TG_OP;
    END IF;
  END IF;
  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_er_child_immutable BEFORE INSERT OR UPDATE OR DELETE ON event_results
  FOR EACH ROW EXECUTE FUNCTION trg_fn_child_of_locked_snapshot();
CREATE TRIGGER trg_erm_child_immutable BEFORE INSERT OR UPDATE OR DELETE ON event_result_members
  FOR EACH ROW EXECUTE FUNCTION trg_fn_child_of_locked_snapshot();
CREATE TRIGGER trg_esr_child_immutable BEFORE INSERT OR UPDATE OR DELETE ON event_specialty_results
  FOR EACH ROW EXECUTE FUNCTION trg_fn_child_of_locked_snapshot();

-- (B) current_status <-> history lockstep.
CREATE OR REPLACE FUNCTION trg_fn_status_sync() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO credential_status_history (assertion_id, from_status, to_status, actor, reason)
      VALUES (NEW.id, NULL, NEW.current_status, 'issuance', 'initial issuance');
  ELSIF NEW.current_status IS DISTINCT FROM OLD.current_status THEN
    INSERT INTO credential_status_history (assertion_id, from_status, to_status, actor, reason)
      VALUES (NEW.id, OLD.current_status, NEW.current_status, 'system', 'status change');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_status_sync AFTER INSERT OR UPDATE OF current_status ON credential_assertions
  FOR EACH ROW EXECUTE FUNCTION trg_fn_status_sync();

-- (C) Issue only against a PUBLISHED definition version + subject<->evidence binding
--     (Nancy R2 #8: a credential's subject must be the person the cited result certified).
CREATE OR REPLACE FUNCTION trg_fn_assertion_guard() RETURNS trigger AS $$
DECLARE v_status definition_status; v_specialty_subject TEXT; v_is_member BOOLEAN; v_locked BOOLEAN;
BEGIN
  -- (i) issue only against a PUBLISHED definition version
  SELECT status INTO v_status FROM credential_definition_versions
    WHERE id = NEW.credential_definition_version_id;
  IF v_status IS DISTINCT FROM 'published' THEN
    RAISE EXCEPTION 'cannot issue against definition version % (status=%); must be published',
      NEW.credential_definition_version_id, v_status;
  END IF;
  -- (ii) specialty credential: subject must match the certified specialty row, and its
  --      snapshot must be LOCKED (issue only from a certified snapshot — Nancy R3 #2)
  IF NEW.event_specialty_result_id IS NOT NULL THEN
    SELECT esr.subject_id, s.locked INTO v_specialty_subject, v_locked
      FROM event_specialty_results esr
      JOIN results_snapshots s ON s.event_id = esr.event_id AND s.results_version = esr.results_version
      WHERE esr.id = NEW.event_specialty_result_id;
    IF v_specialty_subject IS DISTINCT FROM NEW.subject_id THEN
      RAISE EXCEPTION 'assertion subject % does not match specialty-result subject %',
        NEW.subject_id, v_specialty_subject;
    END IF;
    IF NOT COALESCE(v_locked, FALSE) THEN
      RAISE EXCEPTION 'cannot issue from specialty result % whose snapshot is not locked/certified',
        NEW.event_specialty_result_id;
    END IF;
  END IF;
  -- (iii) team-placement credential: subject must be a member of that team, and its
  --       snapshot must be LOCKED
  IF NEW.event_result_id IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM event_result_members
      WHERE event_result_id = NEW.event_result_id AND subject_id = NEW.subject_id) INTO v_is_member;
    IF NOT v_is_member THEN
      RAISE EXCEPTION 'assertion subject % is not a member of team-result %',
        NEW.subject_id, NEW.event_result_id;
    END IF;
    SELECT s.locked INTO v_locked FROM event_results er
      JOIN results_snapshots s ON s.event_id = er.event_id AND s.results_version = er.results_version
      WHERE er.id = NEW.event_result_id;
    IF NOT COALESCE(v_locked, FALSE) THEN
      RAISE EXCEPTION 'cannot issue from team result % whose snapshot is not locked/certified',
        NEW.event_result_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_assertion_guard BEFORE INSERT ON credential_assertions
  FOR EACH ROW EXECUTE FUNCTION trg_fn_assertion_guard();

-- (D) At COMMIT: every assertion has >=1 evidence row AND a revocation status-list slot.
CREATE OR REPLACE FUNCTION trg_fn_issuance_complete() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM evidence_records WHERE assertion_id = NEW.id) THEN
    RAISE EXCEPTION 'assertion % has no evidence; a credential requires >=1 evidence record', NEW.id;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM credential_status_list_entries
                 WHERE assertion_id = NEW.id AND purpose = 'revocation') THEN
    RAISE EXCEPTION 'assertion % has no revocation status-list slot; it would be unrevocable', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE CONSTRAINT TRIGGER trg_issuance_complete
  AFTER INSERT ON credential_assertions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION trg_fn_issuance_complete();

-- (E) Evidence is write-once (immutable after insert): no UPDATE/DELETE, so a live
--     credential can't be silently stripped of its evidence post-issuance (Nancy R2 #1/#4).
CREATE OR REPLACE FUNCTION trg_fn_evidence_write_once() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'evidence_records are write-once; % not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_evidence_write_once BEFORE UPDATE OR DELETE ON evidence_records
  FOR EACH ROW EXECUTE FUNCTION trg_fn_evidence_write_once();

-- (F) Audit chain: serialize writers (advisory lock) so the chain can't fork, and
--     hash EVERY meaningful field so no historical row can be silently edited.
CREATE OR REPLACE FUNCTION trg_fn_audit_chain() RETURNS trigger AS $$
DECLARE v_prev TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('hca_audit_chain'));  -- serialize concurrent audit inserts
  SELECT entry_hash INTO v_prev FROM audit_events ORDER BY id DESC LIMIT 1;
  NEW.prev_hash := v_prev;
  -- Hash an UNAMBIGUOUS jsonb pre-image (each field is a quoted JSON value, so a '|'
  -- or any delimiter inside a free-text field can't forge a field boundary — Nancy R3 #3).
  NEW.entry_hash := encode(digest(
    coalesce(v_prev,'') || jsonb_build_object(
      'actor', NEW.actor, 'action', NEW.action, 'target', NEW.target,
      'previous_value', NEW.previous_value, 'new_value', NEW.new_value,
      'reason', NEW.reason, 'source_system', NEW.source_system,
      'correlation_id', NEW.correlation_id, 'at', NEW.at
    )::text, 'sha256'), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_audit_chain BEFORE INSERT ON audit_events
  FOR EACH ROW EXECUTE FUNCTION trg_fn_audit_chain();

-- (G) Canonical results must point at a LOCKED (certified) snapshot — you only issue
--     credentials from a certified snapshot, never a still-mutable one (Nancy R3 #2).
CREATE OR REPLACE FUNCTION trg_fn_canonical_locked_only() RETURNS trigger AS $$
DECLARE v_locked BOOLEAN;
BEGIN
  SELECT locked INTO v_locked FROM results_snapshots
    WHERE event_id = NEW.event_id AND results_version = NEW.results_version;
  IF NOT COALESCE(v_locked, FALSE) THEN
    RAISE EXCEPTION 'canonical results for event % must point at a LOCKED snapshot (% is not locked)',
      NEW.event_id, NEW.results_version;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_canonical_locked_only BEFORE INSERT OR UPDATE ON event_canonical_results
  FOR EACH ROW EXECUTE FUNCTION trg_fn_canonical_locked_only();

COMMIT;

-- NOTE (role grants, defense-in-depth on top of triggers, applied at provisioning):
--   GRANT SELECT, INSERT ON credential_status_history, audit_events TO hca_app;
--   -- no UPDATE/DELETE to the app role on the append-only tables.
-- ISSUANCE TRANSACTION (for the service): 1 tx — insert assertion (guard fires BEFORE:
--   published + subject binding; status_sync fires AFTER: initial history row), insert
--   evidence row(s), insert revocation status-list entry, COMMIT (issuance_complete
--   verifies evidence + revocation slot). Missing either rolls the whole tx back.
