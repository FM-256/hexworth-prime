# Hexclass Server — Backup Strategy

> Live as of 2026-05-24
> Two-target backup posture covering orchestrator code, pgvector RAG corpus, and ollama model store

## TLDR

Hexclass maintains **two independent backup targets** for the orchestrator + AI stack:

| Target | Location | Type | Frequency |
|---|---|---|---|
| **Off-box** | `sftp:eq1@192.168.1.176:/data/backups/hexclass` (bc1 server, LAN) | Restic | Manual via `/opt/hexclass/backup.sh` |
| **On-box** | `/mnt/wd-8tb/backup/restic-hexclass` (8 TB WD Purple USB) | Restic | Daily 02:30 UTC (systemd timer) |

Plus two specialized daily backups on the on-box target:

| Backup | Location | Frequency | Retention |
|---|---|---|---|
| pgvector `pg_dump` (RAG corpus) | `/mnt/wd-8tb/pgvector-dumps/hexclass-YYYY-MM-DD.pgdump` | Daily 02:00 UTC | 14 daily |
| Ollama model store rsync | `/mnt/wd-8tb/models/ollama-data/` | Weekly Sun 03:00 UTC | always-in-sync mirror |

If either backup target goes down (bc1 unreachable, 8 TB dock dies), the other survives.

## Hardware

| Component | Detail |
|---|---|
| Drive | WD Purple 8 TB (`WDC WD85PURZ-85C4WY0`, surveillance/NAS grade) |
| Dock | JMicron JMS567 USB 3.0 SATA bridge (single-bay-active, USB 5 Gbps) |
| Filesystem | ext4, label `WD_8TB`, UUID `2ddd8587-7d59-47c0-a274-fb35db9565c1` |
| Mount point | `/mnt/wd-8tb` |
| Mount options | `defaults,nofail,x-systemd.device-timeout=10` |
| Free space | 6.9 TB usable |

The mount is reboot-safe: UUID-keyed in `/etc/fstab`, `nofail` so the box still boots if the dock is offline. `/mnt/wd-8tb` ownership is `hexclass:hexclass` so the orchestrator user writes directly without sudo.

## Three backup scripts

All scripts live in `/opt/hexclass/scripts/`. Each is idempotent (safe to re-run) and writes log lines that get captured by systemd journal.

### `backup-local.sh` — restic mirror of `/opt/hexclass`

Mirrors what the off-box `backup.sh` ships to bc1, but to the local 8 TB. Separate restic repository (not a copy of the bc1 repo) so recovery doesn't depend on bc1 being reachable.

Excludes:

- `/opt/hexclass/data/postgres` — captured by the daily `pg_dump` instead (smaller, faster restore)
- `/opt/hexclass/data/redis` — ephemeral conversation memory, not worth backing up
- Permission warnings on `caddy/data/`, `grafana/`, `loki/` are non-fatal — those data dirs are owned by their docker container UIDs, which the `hexclass` user can't read. Same behavior as the existing bc1 backup; backups complete successfully despite the warnings.

Retention: `--keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune` after every run.

### `backup-pgvector.sh` — daily `pg_dump` of `hexclass` database

Why a separate `pg_dump` instead of relying on the docker volume?

The postgres data directory uses live page files; copying them while postgres is running produces an inconsistent snapshot that won't restore cleanly. `pg_dump` produces a logical backup that can restore to any postgres version 16+. Compressed format level 9 keeps the dump small.

`pg_dump` runs **inside the `hex-postgres` container** via `docker exec` — the host doesn't need postgresql-client installed. Password sourced from `/opt/hexclass/.env`.

Sanity check before pruning: the script verifies the new dump is ≥1 KB before deleting older dumps. A failed `pg_dump` producing an empty file won't cascade into deleting all prior backups.

Retention: 14 most-recent daily dumps.

### `backup-models.sh` — weekly rsync of ollama model store

`/var/lib/ai-models/ollama-data/` → `/mnt/wd-8tb/models/ollama-data/`.

`rsync -a --delete` mirrors the current state. The on-box 600 GB `ai-models` LV currently holds 34 GB of models (`qwen2.5:7b`, `nomic-embed-text`, etc.); the mirror lets us re-create without re-pulling multi-GB models if the LV fails. Transfer rate on USB 3.0: ~250 MB/s, so 34 GB completes in ~140 s.

The `--delete` flag means models deleted from the active LV also get deleted from the mirror. This is the right behavior for "current state mirror" — if you want to preserve old models, copy them to a different subdirectory outside `ollama-data/`.

## Systemd user timers

| Timer | Schedule | Service |
|---|---|---|
| `hex-backup-pgvector.timer` | Daily 02:00 UTC | `hex-backup-pgvector.service` |
| `hex-backup-local.timer` | Daily 02:30 UTC | `hex-backup-local.service` |
| `hex-backup-models.timer` | Weekly Sun 03:00 UTC | `hex-backup-models.service` |

Staggered by 30 min so they don't contend for the USB bus or compete with each other for the postgres connection.

All timers have `Persistent=true` — if the box is off when a scheduled run is due, the timer fires on next boot to catch up. `RequiresMountsFor=/mnt/wd-8tb` in each service guarantees the mount is present before the script runs (or systemd skips with a clear failure).

Unit files live in `~/.config/systemd/user/`:

```
hex-backup-local.service
hex-backup-local.timer
hex-backup-pgvector.service
hex-backup-pgvector.timer
hex-backup-models.service
hex-backup-models.timer
```

## Operational commands

```bash
# Status of all timers
ssh hexclass-via-bc1 'systemctl --user list-timers --no-pager'

# Manually trigger any backup
ssh hexclass-via-bc1 'systemctl --user start hex-backup-pgvector.service'
ssh hexclass-via-bc1 'systemctl --user start hex-backup-local.service'
ssh hexclass-via-bc1 'systemctl --user start hex-backup-models.service'

# View recent backup logs
ssh hexclass-via-bc1 'journalctl --user -u hex-backup-pgvector.service -n 20'

# List restic snapshots in the local repo
ssh hexclass-via-bc1 'RESTIC_PASSWORD_FILE=/opt/hexclass/.restic-pass \
    restic -r /mnt/wd-8tb/backup/restic-hexclass snapshots'

# Verify a backup
ssh hexclass-via-bc1 'RESTIC_PASSWORD_FILE=/opt/hexclass/.restic-pass \
    restic -r /mnt/wd-8tb/backup/restic-hexclass check --read-data-subset=5%'
```

## Recovery procedures

### Recover `/opt/hexclass` from local restic

```bash
ssh hexclass-via-bc1
export RESTIC_PASSWORD_FILE=/opt/hexclass/.restic-pass
restic -r /mnt/wd-8tb/backup/restic-hexclass snapshots
# pick a snapshot ID, e.g., e3c9fc5e
restic -r /mnt/wd-8tb/backup/restic-hexclass restore e3c9fc5e --target /tmp/restore
# verify, then move into place:
rsync -a /tmp/restore/opt/hexclass/ /opt/hexclass/
sudo systemctl --user restart hex-orchestrator.service
```

### Recover pgvector `hexworth_docs` from a pg_dump

```bash
ssh hexclass-via-bc1
ls /mnt/wd-8tb/pgvector-dumps/                       # pick the most recent good dump
docker exec -i hex-postgres \
    pg_restore -U hexclass -d hexclass --clean --if-exists \
    < /mnt/wd-8tb/pgvector-dumps/hexclass-YYYY-MM-DD.pgdump
# verify:
docker exec hex-postgres psql -U hexclass -d hexclass -c "SELECT count(*) FROM hexworth_docs"
```

### Recover ollama models from rsync mirror

```bash
ssh hexclass-via-bc1
sudo systemctl stop ollama         # or whatever wraps ollama on hexclass
sudo rsync -a /mnt/wd-8tb/models/ollama-data/ /var/lib/ai-models/ollama-data/
sudo systemctl start ollama
ollama list                         # verify models are back
```

### Fall back to bc1 if the local mount is dead

The off-box backup at `sftp:eq1@192.168.1.176:/data/backups/hexclass` uses the same restic password (`/opt/hexclass/.restic-pass`). To restore from there:

```bash
ssh hexclass-via-bc1
export RESTIC_PASSWORD_FILE=/opt/hexclass/.restic-pass
restic -r sftp:eq1@192.168.1.176:/data/backups/hexclass snapshots
restic -r sftp:eq1@192.168.1.176:/data/backups/hexclass restore <id> --target /tmp/restore
```

## What this strategy does NOT cover (deliberate)

| Gap | Why deferred |
|---|---|
| Redis conversation memory | Ephemeral by design (30-min TTL); a snapshot in time isn't valuable for restoration |
| Caddy/Grafana/Loki container data | Owned by container UIDs; container configs are in `/opt/hexclass/{caddy,grafana,loki}/` and ARE captured by restic; runtime state isn't worth restoring |
| Audit-log retention sweep | Cloud Function `hexAiToolCallback` writes to Firestore `tool_invocations`; retention is a Firebase-side scheduled CF, deferred per the v0.6.0c-3 design |
| Off-site backup beyond bc1 | bc1 is on the same LAN; for true off-site (e.g., S3, B2) — defer until there's data worth that cost |
| Encrypted-at-rest for the on-box backup | Restic encrypts its repository by default with the password; the local ext4 is unencrypted, so a stolen drive could be read by anyone bypassing restic. Defer; the dock is physically inside hexclass behind locked doors |

## When a backup fails

Each timer service writes to journal. To see recent failures:

```bash
ssh hexclass-via-bc1 'journalctl --user --since=yesterday \
    -u hex-backup-pgvector.service \
    -u hex-backup-local.service \
    -u hex-backup-models.service \
    --no-pager'
```

Common failure modes and fixes:

| Symptom | Likely cause | Fix |
|---|---|---|
| `RequiresMountsFor /mnt/wd-8tb` failure | Dock unplugged or off | Plug dock + power on; `sudo mount -a` |
| `pg_dump` exit non-zero | Postgres container down or password rotated | `docker ps` to verify; check `/opt/hexclass/.env` POSTGRES_PASSWORD |
| Restic `repository already locked` | Previous run interrupted | `restic unlock -r <repo>` then re-run |
| rsync exit 23 | Permission errors on container-owned files | Non-fatal; main payload still transferred. Check log for which files were skipped. |

## Related

- `_docs/operations/hexclass-server-profile.md` — host operational profile
- `_docs/architecture/dr-hex-orchestrator.md` — what `/opt/hexclass/orchestrator` contains
- `_docs/architecture/hex-ai-tool-audit-v0.6.0c-3.md` — audit log destination (Firestore, separate from this strategy)
- Memory: `[[bc1-disk-layout]]` — bc1 backup target operational details

---

*Last Updated: 2026-05-24 · Initial setup of local on-box backup target alongside the existing bc1 off-box backup*
