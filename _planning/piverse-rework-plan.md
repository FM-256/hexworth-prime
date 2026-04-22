# PiVerse Rework Plan

**Status:** PLANNING — not started
**Problem:** 50 modules built as article-style pages instead of the proper presentation + lab + quiz format
**Decision date:** 2026-04-22

---

## What Happened

PiVerse was built with 50 single-page article modules (scrollable content with Mark Complete button). This does not follow the Hexworth Prime content standard:

**Standard:** Every chapter = presentation (12 slides, SVG, viewport-locked) + lab (terminal or GUI) + quiz (15 Qs, server-graded)

**What was built:** 50 HTML articles with embedded content, no slides, no labs, no quizzes

---

## Rework Plan

### Step 1: Archive existing articles as raw source docs

Move the 50 article files to `/home/eq/hexworth-shared/Raw sources/pi/piverse-articles/`

These become internal source material alongside the Raspberry Pi Press books. They're accurate, organized by topic, and have code examples — useful as reference when building the proper format.

### Step 2: Rebuild PiVerse from scratch

Same 5 tracks, same 50 chapters. Each chapter produces 3 files:
1. Presentation (12 slides, SVG + animation, viewport-locked)
2. Lab (terminal sim or GUI portal)
3. Quiz (15 questions, serverGrading:true, balanced A/B/C/D)

**Total: 150 content files + 1 hub + 5 track indexes = 156 files**

The hub page (index.html) is solid — blinking LED, PCB traces, progress tracking. It stays. Track index pages stay. Only the 50 module files get replaced with 150 content files.

### Step 3: Update hub to reference new file structure

Hub currently links to `fundamentals/pv-f-01.html` etc. New structure needs:
- `fundamentals/presentations/pv-f-01.presentation.html`
- `fundamentals/labs/pv-f-01.lab.html`
- `fundamentals/quizzes/pv-f-01.quiz.html`

Or keep flat with naming convention:
- `fundamentals/pv-f-01-slides.html`
- `fundamentals/pv-f-01-lab.html`
- `fundamentals/pv-f-01-quiz.html`

Hub needs to be updated to show 3 cards per chapter (slides + lab + quiz) instead of 1 module card.

### Step 4: Seed quiz keys

50 new quizzes x 15 questions = 750 answers to seed in Firestore

---

## Scope

| Track | Chapters | Files (slides+lab+quiz) |
|-------|----------|------------------------|
| Pi Fundamentals | 10 | 30 |
| MicroPython on Pico | 12 | 36 |
| Electronics & GPIO | 10 | 30 |
| Maker's Workshop | 10 | 30 |
| Board Engineering | 8 | 24 |
| **Total** | **50** | **150** |

---

## Priority

TBD — ProtoCore (clean build from scratch) vs PiVerse rework (fix existing debt). Decision pending.

---

## Source Material for Rebuild

1. The 50 existing PiVerse article modules (our own content, accurate, organized)
2. Official Raspberry Pi Beginner's Guide 5th Ed (CC BY-NC-SA 3.0)
3. Get Started with MicroPython on Raspberry Pi Pico 2nd Ed (CC BY-NC-SA 3.0)
4. Design an RP2040 Board with KiCad (CC BY-NC-SA 3.0)
5. Handbook 2025, Book of Making 2025, Code the Classics I & II (authorized by publisher)
6. Raspberry Pi Cookbook 4th Ed
7. An Introduction to C and GUI Programming

All authorized through Raspberry Pi Press partnership.
