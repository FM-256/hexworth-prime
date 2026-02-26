# Marathon Mode Prompt Template

Copy this as your opening message when starting an unattended marathon session:

---

MARATHON MODE — Unattended Build Session

You are authorized to work autonomously through the following sprint items without stopping to ask questions. Execute them in order, committing each completed item before moving to the next.

## Pre-Authorization
- CREATE new files (HTML, JS, CSS, JSON) — AUTHORIZED
- EDIT existing files — AUTHORIZED
- WRITE to existing files — AUTHORIZED
- GIT COMMIT completed work — AUTHORIZED (commit after each item)
- GIT PUSH to origin — AUTHORIZED
- RUN build/deploy commands — AUTHORIZED
- RUN npm scripts, node commands — AUTHORIZED
- READ any file in the workspace — AUTHORIZED
- SEARCH/GREP the codebase — AUTHORIZED
- WEB SEARCH for reference material — AUTHORIZED

## Restrictions (HARD BLOCK)
- DO NOT delete any files or directories
- DO NOT run rm, rmdir, or any destructive commands
- DO NOT git push --force, git reset --hard, git clean, or git restore
- DO NOT modify permissions, auth, or security config
- DO NOT skip or abandon items — if stuck, leave a TODO comment and move on

## Workflow Per Item
1. Read the sprint description
2. Study the relevant template/pattern file
3. Build the module following established conventions
4. Commit with a descriptive message (no AI attribution)
5. Move to the next item

## Sprint Items (work these in order):
1. [Sprint ID] — [Title]
2. [Sprint ID] — [Title]
3. ...

## Template References
- Dark Arts Vault modules: _app/dark-arts/vault/wireless-attacks-lab.html
- Vault index: _app/dark-arts/vault/index.html
- Sprint data: _tools/sprint-master/sprints.json

## When Complete
After all items are done, run `firebase deploy --only hosting` and push all commits.

---

To use this: paste it as your opening prompt, fill in the sprint items from the marathon list, and let it run. The `settings.local.json` permissions we already configured will handle the tool-level auto-approvals, and this prompt handles the behavioral pre-authorization (commits, pushes, autonomous decisions).
