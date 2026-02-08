# Grep & Pipe Mastery - Solutions Guide

**Course**: Grep & Pipe Mastery (BLACKSITE Terminal)
**Version**: 3.2.0
**Last Updated**: January 25, 2026

---

## Quick Reference

| Lab | Type | Objectives | Key Skill |
|-----|------|------------|-----------|
| Section 1 | Slide Mini-Lab | 8 | grep flags (-i, -c, -n, -v, -r, -A/B/C, -l, -w) |
| Section 2 | Slide Mini-Lab | 8 | regex patterns (^, $, [], *, +, ?, \|) |
| Section 3 | Slide Mini-Lab | 8 | pipes (sort, uniq, wc, head, tail, cut, tee) |
| GPM-TRACE | BLACKSITE | 8 | grep flag mastery |
| GPM-DECODE | BLACKSITE | 8 | regex pattern matching |
| GPM-EXTRACT | BLACKSITE | 8 | pipe chain building |
| GPM-DEFUSE | BLACKSITE | 6 | synthesis and final mission |

---

## Section 1: Grep Basics (Slide Mini-Lab)

### Objectives & Solutions

1. **Find all ERROR entries (case-insensitive)**
   ```bash
   grep -i "error" auth.log
   ```

2. **Count failed login attempts**
   ```bash
   grep -c "FAILED" auth.log
   ```

3. **Show line numbers for root access**
   ```bash
   grep -n "root" auth.log
   ```

4. **Find lines NOT containing "success"**
   ```bash
   grep -v "success" auth.log
   ```

5. **Search recursively for "password"**
   ```bash
   grep -r "password" .
   ```

6. **Show context around "breach"**
   ```bash
   grep -A 2 -B 2 "breach" auth.log
   # or
   grep -C 2 "breach" auth.log
   ```

7. **List files containing "admin"**
   ```bash
   grep -l "admin" *.log
   ```

8. **Find exact word "fail" (not "failed")**
   ```bash
   grep -w "fail" auth.log
   ```

---

## Section 2: Regex Patterns (Slide Mini-Lab)

### Objectives & Solutions

1. **Find lines starting with "2024"**
   ```bash
   grep "^2024" access.log
   ```

2. **Find lines ending with "denied"**
   ```bash
   grep "denied$" access.log
   ```

3. **Match any IP address pattern**
   ```bash
   grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" access.log
   ```

4. **Find "error" or "warning"**
   ```bash
   grep -E "error|warning" syslog
   ```

5. **Match repeated characters (aa, bb, etc.)**
   ```bash
   grep -E "(.)\1" data.txt
   ```

6. **Find 3-digit codes**
   ```bash
   grep -E "[0-9]{3}" access.log
   ```

7. **Match optional "s" (color/colours)**
   ```bash
   grep -E "colou?rs?" data.txt
   ```

8. **Find hex values (0x followed by hex)**
   ```bash
   grep -E "0x[0-9a-fA-F]+" data.txt
   ```

---

## Section 3: Pipe Chains (Slide Mini-Lab)

### Objectives & Solutions

1. **Sort log entries alphabetically**
   ```bash
   cat access.log | sort
   ```

2. **Count unique IP addresses**
   ```bash
   cat access.log | cut -d' ' -f1 | sort | uniq | wc -l
   ```

3. **Find top 5 most frequent IPs**
   ```bash
   cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn | head -5
   ```

4. **Extract and sort timestamps**
   ```bash
   cat access.log | cut -d' ' -f4 | sort
   ```

5. **Filter errors and count by type**
   ```bash
   grep "ERROR" syslog | cut -d':' -f2 | sort | uniq -c
   ```

6. **Chain 3+ commands for analysis**
   ```bash
   cat access.log | grep "404" | cut -d' ' -f7 | sort | uniq -c | sort -rn
   ```

7. **Save output while displaying**
   ```bash
   grep "CRITICAL" syslog | tee critical.txt
   ```

8. **Complex pipeline with multiple filters**
   ```bash
   cat access.log | grep -v "200" | cut -d' ' -f1,7,9 | sort | uniq -c | sort -rn | head -10
   ```

---

## GPM-TRACE: Hunt RAVEN (BLACKSITE)

### Mission Context
Trace threat actor RAVEN through security logs to identify the target location (Room 105).

### Objectives & Solutions

1. **Search for RAVEN case-insensitive**
   ```bash
   grep -i "raven" auth.log
   ```

2. **Count RAVEN mentions**
   ```bash
   grep -c "RAVEN" auth.log
   ```

3. **Find line numbers for "105" pattern**
   ```bash
   grep -n "105" keycard.log
   ```

4. **Find entries NOT from authorized IPs**
   ```bash
   grep -v "192.168.1.1" auth.log
   ```

5. **Search recursively for "summit"**
   ```bash
   grep -r "summit" intel/
   ```

6. **Get context around "MERIDIAN"**
   ```bash
   grep -A 3 "MERIDIAN" radio_intercept.txt
   # or
   grep -B 2 "MERIDIAN" radio_intercept.txt
   # or
   grep -C 2 "MERIDIAN" radio_intercept.txt
   ```

7. **List files mentioning "bomb"**
   ```bash
   grep -l "bomb" intel/*
   ```

8. **Find exact room number "105"**
   ```bash
   grep -w "105" security_alerts.log
   ```

### Insight Answer
**192.168.1.105** (Room 105)

---

## GPM-DECODE: CRIMSON Protocol (BLACKSITE)

### Mission Context
Decode the CRIMSON wire protocol using regex pattern analysis.

### Objectives & Solutions

1. **Find lines starting with timestamps**
   ```bash
   grep "^[0-9]" intercepted_codes.log
   # or
   grep "^2024" intercepted_codes.log
   ```

2. **Extract frequency patterns (digits + Hz)**
   ```bash
   grep -oE "[0-9]+\.?[0-9]* Hz" detonator_freq.log
   # or
   grep -E "[0-9]+ Hz" detonator_freq.log
   ```

3. **Find wire color patterns (alternation)**
   ```bash
   grep -E "RED|BLUE|GREEN" wire_protocols.db
   ```

4. **Match numeric sequences**
   ```bash
   grep -E "[0-9]{4}" bomb_telemetry.log
   # or
   grep "[0-9][0-9][0-9][0-9]" bomb_telemetry.log
   ```

5. **Find lines ending with "ARMED"**
   ```bash
   grep "ARMED$" wire_protocols.db
   ```

6. **Match wire code patterns (COLOR-COLOR)**
   ```bash
   grep -E "[A-Z]+-[A-Z]+" wire_protocols.db
   # or
   grep "RED-RED\|BLUE-BLUE" wire_protocols.db
   ```

7. **Find repeated patterns (RED-RED)**
   ```bash
   grep -E "(RED)-\1" wire_protocols.db
   # or
   grep "RED-RED" wire_protocols.db
   ```

8. **Match optional TRAP patterns**
   ```bash
   grep -E "TRAP.*ARMED" wire_protocols.db
   # or
   grep "TRAP" wire_protocols.db
   ```

### Insight Answer
**RED-RED-BLUE** (matches the repeated failure pattern from 192.168.1.105)

---

## GPM-EXTRACT: Wire Analysis (BLACKSITE)

### Mission Context
Extract wire counts for field agent PHOENIX using pipe chains.

### Objectives & Solutions

1. **Count BLUE ground wires**
   ```bash
   grep "BLUE" wire_sequence.log | wc -l
   ```

2. **Sort wire sequence by type**
   ```bash
   cat wire_sequence.log | sort
   ```

3. **Get unique wire types**
   ```bash
   cat wire_sequence.log | sort | uniq
   ```

4. **Count each wire type**
   ```bash
   cat wire_sequence.log | sort | uniq -c
   # or
   grep -E "BLUE|RED|GREEN" wire_sequence.log | sort | uniq -c
   ```

5. **Find most frequent frequency signal**
   ```bash
   grep -oE "PRIMARY|GROUND|TRAP" frequency_data.log | sort | uniq -c | sort -rn | head -1
   ```

6. **Extract kill code from timer**
   ```bash
   head -n 4 timer_codes.txt | cut -f1
   # or
   grep "0230" timer_codes.txt | cut -f1
   ```

7. **Build 3-stage pipeline for wire priorities**
   ```bash
   cat cut_order.db | grep -v "^#" | sort -t$'\t' -k2
   # or
   cat cut_order.db | grep "cut" | sort | uniq
   ```

8. **Save wire count report with tee**
   ```bash
   grep "BLUE\|RED" wire_sequence.log | wc -l | tee wire_report.txt
   ```

### Insight Answer
**BLUE first (isolate ground), then RED (disable primary), NEVER touch GREEN**

---

## GPM-DEFUSE: Final Countdown (BLACKSITE)

### Mission Context
Deliver the disarm code to PHOENIX before detonation.

### Objectives & Solutions

1. **Find PHOENIX's last transmission**
   ```bash
   grep "PHOENIX" phoenix_comms.log | tail -1
   ```

2. **Count CRITICAL status entries**
   ```bash
   grep -c "CRITICAL" live_feed.log
   ```

3. **Extract kill code from timer setting**
   ```bash
   grep "0230" countdown_status.txt
   # or
   grep "timer" countdown_status.txt
   # or
   grep "code" final_sequence.db
   ```

4. **Verify wire counts match analysis**
   ```bash
   grep "BLUE\|RED" final_sequence.db
   # or
   grep "wire" final_sequence.db
   ```

5. **Find all IMMINENT status entries**
   ```bash
   grep "IMMINENT" live_feed.log
   ```

6. **Generate final mission report**
   ```bash
   cat mission_summary.txt | tee final_report.txt
   # or
   cat mission_summary.txt > final_report.txt
   ```

### Insight Answer
**0230** (timestamp when RAVEN started the timer at 02:30:00)

---

## Radio System Quick Reference

### Tune Commands
```bash
scan                    # Show all frequencies
tune 161.7              # Tune to GHOST-7 (hints)
tune ghost              # Tune by name
tune security           # Hotel security chatter
tune 88.1               # Emergency (direct solutions)
```

### Frequency Guide
| Frequency | Name | Use Case |
|-----------|------|----------|
| 161.7 | GHOST-7 | Context-aware hints for current objective |
| 152.8 | SECURITY | Ambient narrative/immersion |
| 156.1 | CONSORTIUM | Enemy lore/backstory |
| 173.5 | NUMBERS | Easter egg (creepy numbers station) |
| 88.1 | EMERGENCY | Last resort (direct solutions) |

### Hidden .signal Files
Each BLACKSITE module has a hidden `.signal` file with radio hints:
```bash
ls -la                  # Reveals hidden files
cat .signal             # Read the dead drop message
```

---

## Instructor Notes

### Common Student Issues
1. **Forgetting pipe order**: Remind that `sort` must come before `uniq`
2. **Case sensitivity**: Emphasize `-i` flag for case-insensitive searches
3. **Regex escaping**: Period `.` matches any character, use `\.` for literal
4. **Output redirection**: `>` overwrites, `>>` appends, `tee` does both

### Grading Rubric
- Each objective validates command patterns, not exact output
- Multiple correct solutions exist for most objectives
- Timer pressure is educational, not punitive

### Mission Success Criteria
- Complete all 8 objectives in each section
- Answer insight question correctly
- No requirement to use radio (it's optional help)

---

*Document created January 25, 2026*
