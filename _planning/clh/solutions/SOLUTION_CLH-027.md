# CLH-027: User Management - Solution Sheet

**Module:** CLH-027
**Title:** User Management
**Tier:** CLI Wraith
**Theme:** Identify backdoor accounts and unauthorized privilege escalation

---

## Scenario Overview

You are `admin@USER-AUDIT-SRV`, investigating a security incident. Your mission is to identify backdoor accounts created by the attacker for persistent access. Attackers often create accounts that blend in with legitimate service accounts.

---

## Objectives & Solutions

### Objective 1: LIST - User Accounts
**Task:** List all user accounts on the system
**Hint:** `$ cat /etc/passwd | cut -d: -f1`

**Solution:**
```bash
cat /etc/passwd | cut -d: -f1
```
or
```bash
cat /etc/passwd
```

**Expected Output:**
```
root
daemon
bin
...
admin
svcaccount
developer
s3rv1c3
guest
mysql
www-data
```

**Analysis:** Notice `s3rv1c3` - this looks like "service" in leet-speak (3=e, 1=i).

---

### Objective 2: CHECK - User Details
**Task:** Get detailed information about a specific user
**Hint:** `$ getent passwd s3rv1c3`

**Solution:**
```bash
getent passwd s3rv1c3
```
or
```bash
id s3rv1c3
```

**Expected Output:**
```
s3rv1c3:x:1003:1003::/home/s3rv1c3:/bin/bash
```

**Analysis:** UID 1003, has a home directory, has bash shell - this is a fully functional user account.

---

### Objective 3: LIST - Group Memberships
**Task:** Check privileged group memberships
**Hint:** `$ groups admin` (or `cat /etc/group`)

**Solution:**
```bash
cat /etc/group | grep sudo
```
or
```bash
grep sudo /etc/group
```

**Expected Output:**
```
sudo:x:27:admin,s3rv1c3
```

**Analysis:** The `s3rv1c3` account is in the sudo group - this means it has root privileges!

---

### Objective 4: CHECK - Password Status
**Task:** Check password aging and status
**Hint:** `$ passwd -S admin` (or `chage -l`)

**Solution:**
```bash
passwd -S s3rv1c3
```
or
```bash
chage -l s3rv1c3
```

**Expected Output (passwd -S):**
```
s3rv1c3 P 01/15/2026 0 99999 7 -1
```

**Analysis:** Password was set on 01/15/2026 - the same date as the incident.

---

### Objective 5: AUDIT - Login Shells
**Task:** Find accounts with interactive login shells
**Hint:** `$ grep -v nologin /etc/passwd`

**Solution:**
```bash
grep -v nologin /etc/passwd | grep -v /bin/false
```
or
```bash
grep /bin/bash /etc/passwd
```

**Expected Output:**
```
root:x:0:0:root:/root:/bin/bash
admin:x:1000:1000:Administrator:/home/admin:/bin/bash
svcaccount:x:1001:1001:Service Account:/home/svcaccount:/bin/bash
developer:x:1002:1002:Developer:/home/developer:/bin/bash
s3rv1c3:x:1003:1003::/home/s3rv1c3:/bin/bash
```

**Analysis:** Only 5 accounts have bash shells. `s3rv1c3` is the only one that looks suspicious.

---

## Insight Phase

**Question:** You found an account added to the sudo group that wasn't in the baseline. What is the username of this backdoor account?

**Answer:** `s3rv1c3`

**Accepted variations:** "s3rv1c3", "S3RV1C3"

**How to find:**
1. Compare `group_memberships.txt` baseline vs current (sudo group gained `s3rv1c3`)
2. Check `user_list.txt` for accounts created on 2026-01-15
3. Notice the leet-speak naming pattern (s3rv1c3 = service)

---

## Investigation Workflow

```
1. cat ~/user_audit/group_memberships.txt
   → See: "sudo: admin, s3rv1c3" (baseline had only admin)

2. cat ~/user_audit/user_list.txt
   → See: "s3rv1c3 1003 /bin/bash 2026-01-15"
   → Created on incident date!

3. grep sudo /etc/group
   → Confirm s3rv1c3 is in sudo group

4. getent passwd s3rv1c3
   → Full account with bash shell
```

---

## Key Findings Summary

| Account | Created | Sudo | Status |
|---------|---------|------|--------|
| admin | 2025-06-01 | Yes | LEGITIMATE |
| svcaccount | 2025-06-15 | No | LEGITIMATE |
| developer | 2025-08-20 | No | LEGITIMATE |
| s3rv1c3 | **2026-01-15** | **Yes** | **BACKDOOR** |
| guest | 2025-06-01 | No | Disabled |

---

## Red Flags Identified

1. **Leet-speak naming:** `s3rv1c3` = "service" (evasion attempt)
2. **Immediate sudo access:** Added to sudo group at creation
3. **Incident timeline:** Created 2026-01-15 (same as malware installation)
4. **No change record:** No corresponding ticket or authorization
5. **Full shell access:** Has /bin/bash, not /usr/sbin/nologin

---

## Remediation Commands

```bash
# Disable the account immediately
sudo usermod -L s3rv1c3

# Remove shell access
sudo usermod -s /usr/sbin/nologin s3rv1c3

# Remove from sudo group
sudo gpasswd -d s3rv1c3 sudo

# Check for SSH keys (persistence)
ls -la /home/s3rv1c3/.ssh/

# Review their command history
cat /home/s3rv1c3/.bash_history
```

---

## Additional Investigation Commands

```bash
# View the user audit workspace
cat ~/user_audit/README.txt

# Check suspicious accounts analysis
cat ~/user_audit/suspicious_accounts.txt

# View the evidence timeline
cat ~/evidence/timeline.txt

# Check for recently modified passwd entries
ls -la /etc/passwd /etc/shadow /etc/group
```

---

## IOCs (Indicators of Compromise)

| IOC Type | Value |
|----------|-------|
| Username | s3rv1c3 |
| UID | 1003 |
| Creation Time | 2026-01-15 02:52:33 |
| Home Directory | /home/s3rv1c3 |
| Group Membership | sudo (unauthorized) |
| SSH Keys | /home/s3rv1c3/.ssh/authorized_keys |

---

## Attack Timeline Correlation

```
2026-01-15 02:47:33  ncat installed
2026-01-15 02:48:15  socat installed
2026-01-15 02:51:07  netminer installed
2026-01-15 02:52:33  s3rv1c3 account created  ← BACKDOOR
2026-01-15 02:52:45  s3rv1c3 added to sudo
2026-01-15 02:53:01  SSH key added to s3rv1c3
```

The account was created exactly 1 minute and 26 seconds after malware installation - clearly automated.

---

*Last Updated: February 2, 2026*
