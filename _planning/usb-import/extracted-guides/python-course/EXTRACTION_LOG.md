# Python Course Extraction Log

**SPELL:** 024
**Extraction Date:** December 30, 2025
**Status:** COMPLETE

---

## Source Summary

| Source | Location | Files | Status |
|--------|----------|-------|--------|
| USB (Primary) | `D:\Keiser Idrive\programming class\` | 43 | EXTRACTED |
| User Local | `/home/eq/Ai content creation/Python/Python_Course/` | 25 | EXTRACTED |
| **Total Unique** | - | **68+** | CONSOLIDATED |

---

## Extraction Timeline

### Session 1: USB Extraction (Dec 30, 2025 - 03:37)
- Mounted USB at `/mnt/D`
- Extracted `programming class/` folder
- Retrieved 43 files including:
  - Chapters 2-6, 8 PPTX
  - APP/ HTML applets
  - Crack/ advanced content
  - Python scripts and labs
- **Blocker identified:** Chapters 1 and 7 missing

### Session 2: Blocker Resolution (Dec 30, 2025 - 12:20)
- User revealed complete course at local path
- Found missing chapters:
  - Chapter 1: `1Zero_to_Python_Chapter1.pptx`
  - Chapter 7: `9Chapter_7_File_Handling.pptx`
- Consolidated 25 additional files to staging
- **Blocker resolved:** All 8 chapters now available

---

## Files by Category

### PPTX Presentations (20 files)

| File | Size | Chapter/Topic |
|------|------|---------------|
| `1Zero_to_Python_Chapter1.pptx` | 1.1MB | Ch 1 - Introduction |
| `2Zero_to_Python_Chapter2.pptx` | 2.5MB | Ch 2 - Strings |
| `2Chapter_2_String_Review_Final.pptx` | 633KB | Ch 2 - Review |
| `3Zero_to_Python_AppendixA_Functions.pptx` | 737KB | Appendix - Functions |
| `4-5_Powerful_Python_Functions.pptx` | 171KB | Advanced Functions |
| `5Chapter_3_Flow_Control.pptx` | 2.8MB | Ch 3 - Flow Control |
| `6Chapter_4_Functions_Full.pptx` | 622KB | Ch 4 - Functions |
| `7Chapter_5_Collections_Full (1).pptx` | 640KB | Ch 5 - Collections |
| `8Chapter_6_Dictionaries_Full.pptx` | 1.2MB | Ch 6 - Dictionaries |
| `9Chapter_7_File_Handling.pptx` | 672KB | Ch 7 - File Handling |
| `Chapter_8_OOP.pptx` | 780KB | Ch 8 - OOP |
| `Creating_GUI_With_Styling_and_Examples.pptx` | 637KB | GUI Development |
| `Cracking_the_Code_Lab_PowerPoint.pptx` | 2.0MB | Flagship Project |
| `JSON.pptx` | 1.5MB | JSON Handling |
| `Lambda_Code_A_Long.pptx` | 735KB | Lambda Functions |
| `Pandas_Code_A_Long.pptx` | 539KB | Data Analysis |
| `Truthy_Falsy_Slides.pptx` | 896KB | Boolean Logic |
| `exec_function_breakdown.pptx` | 113KB | exec() Function |
| `partial_function_breakdown.pptx` | 112KB | partial() Function |
| `itertools_permutations_combinations.pptx` | 53KB | itertools Module |

### ZIP Lab Packs (15 files)

| File | Size | Content |
|------|------|---------|
| `Chapter_4_Functions_Bundle_With_Solutions.zip` | 40KB | Ch 4 Labs |
| `Chapter_5_GUI_Expansions.zip` | 3KB | GUI Labs |
| `Chapter_5_Labs_and_Solutions.zip` | 40KB | Ch 5 Labs |
| `Chapter_6_Labs_and_Solutions.zip` | 40KB | Ch 6 Labs |
| `Code_Decode_Lab_Complete_Pack.zip` | 5KB | Encode/Decode Lab |
| `Cracking_the_Code_Lab_Package.zip` | 41KB | Main Project |
| `CrackingCode_ReactApp.zip` | 5KB | React Version |
| `Smart_Vending_Machine_Lab_Pack.zip` | 5KB | OOP Project |
| `Number_Guessing_Game_Lab.zip` | 2KB | Beginner Project |
| `Function_Menu_GUI_Solution.zip` | 1KB | GUI Menu |
| `API_Code_A_Long_Kit.zip` | 3KB | API Labs |
| `Pandas_Code_A_Long_Kit.zip` | 4KB | Pandas Labs |
| `Matplotlib_Code_A_Long_Kit.zip` | 3KB | Visualization |
| `Combinations_Expanded_Tools.zip` | 3KB | Combinations |
| `Python_Function_Demos.zip` | 2KB | Function Demos |

### HTML Applets (5 files)

| File | Size | Target House |
|------|------|--------------|
| `career explorator.html` | 13KB | Code |
| `subnet.html` | 10KB | Web |
| `dns.html` | 8KB | Web |
| `cve.html` | 2KB | Shield |
| `atttk_game.html` | 10KB | Dark Arts |

### Python Scripts (16+ files)

| File | Purpose |
|------|---------|
| `hang.py` | Hangman game |
| `tictactoe.py` | Tic-tac-toe |
| `turtle.py` | Graphics demo |
| `kevin's_Calendar.py` | Calendar app |
| `gui1.py` - `gui4.py` | GUI examples |
| `regex.py` | Regex demo |
| `bank_account_*.py` | OOP lab |
| `pet_registry_*.py` | Data lab |
| `code_decode_lab.py` | Encode/decode |
| And more... | Various examples |

### Documentation (6 files)

| File | Content |
|------|---------|
| `OOP_Handout.docx` | OOP reference |
| `Code_Decode_GUI_Guide.pdf` | GUI guide |
| `Code_Decode_Lab_Guide.pdf` | Lab instructions |
| `Code_Decode_Instructor_Guide_UPDATED.pdf` | Instructor notes |
| `HTB python intro course.txt` | HackTheBox notes |
| `CURRICULUM_GUIDE.md` | This course guide |

---

## Folder Structure

```
python-course/
├── CURRICULUM_GUIDE.md          # Course documentation
├── EXTRACTION_LOG.md            # This file
├── 1Zero_to_Python_Chapter1.pptx
├── 2*.pptx                      # Chapter 2 files
├── 3*.pptx                      # Appendix
├── 4-5_Powerful_Python_Functions.pptx
├── 5Chapter_3_Flow_Control.pptx
├── 6Chapter_4_Functions_Full.pptx
├── 7Chapter_5_Collections_Full.pptx
├── 8Chapter_6_Dictionaries_Full.pptx
├── 9Chapter_7_File_Handling.pptx
├── Chapter 8 oop/               # OOP chapter folder
│   ├── Chapter_8_OOP.pptx
│   ├── bank_account_*.py
│   └── pet_registry_*.py
├── APP/                         # HTML applets
│   ├── career explorator.html
│   ├── subnet.html
│   ├── dns.html
│   ├── cve.html
│   └── *.py (examples)
├── Crack/                       # Advanced content
│   ├── *.pptx (advanced topics)
│   └── *.zip (lab packs)
├── *.zip                        # Lab packs
├── *.py                         # Python scripts
└── *.pdf                        # Documentation
```

---

## USB Sources Exhausted

- [x] `D:\Keiser Idrive\programming class\` - EXTRACTED
- [x] User local Python_Course folder - EXTRACTED

---

## Conversion Checklist

- [ ] Chapter 1 → Hexworth presentation
- [ ] Chapter 2 → Hexworth presentation
- [ ] Chapter 3 → Hexworth presentation
- [ ] Chapter 4 → Hexworth presentation + lab
- [ ] Chapter 5 → Hexworth presentation + lab
- [ ] Chapter 6 → Hexworth presentation + lab
- [ ] Chapter 7 → Hexworth presentation
- [ ] Chapter 8 → Hexworth presentation + lab
- [ ] Cracking the Code → Standalone module
- [ ] HTML applets → House integration
- [ ] Quizzes → Generate from content

---

*Extraction complete. Ready for conversion phase.*
