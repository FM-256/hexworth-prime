# DA-20: Tennessee Security Labs Extraction Design

**Status:** Plan (not implementation)
**Date:** 2026-03-16
**Scope:** Pipeline design for extracting labs from Canvas .imscc course exports and converting them to Hexworth Prime content format.

---

## 1. What .imscc Contains

An `.imscc` file is a ZIP archive following the IMS Common Cartridge specification. Canvas exports use version 1.1 or 1.3. Internal structure:

```
course_export.imscc
  imsmanifest.xml            # Master manifest -- TOC, resource list, metadata
  course_settings/
    course_settings.xml      # Course-level config (name, dates, grading)
    assignment_groups.xml    # Assignment group weights
    module_meta.xml          # Module ordering and prerequisites
  wiki_content/
    *.html                   # Wiki pages (lab instructions, readings)
  web_resources/
    *.html                   # Uploaded HTML files
    *.png, *.jpg, *.pdf      # Embedded media
  assessment_meta/
    *.xml                    # Quiz metadata (question banks, settings)
  quizzes/
    *.xml                    # Quiz content (questions, answers, points)
  discussion_topics/
    *.xml                    # Forum prompts
  assignment_settings/
    *.xml                    # Assignment rubrics and submission types
```

### Key Observations
- Lab content is primarily in `wiki_content/` as HTML files
- The manifest (`imsmanifest.xml`) maps every resource to its module position
- Quiz questions use QTI (Question & Test Interoperability) XML format
- File references inside HTML use `$IMS-CC-FILEBASE$/` or `%24IMS-CC-FILEBASE%24/` as path prefix
- Canvas-specific features (Modules, SpeedGrader) produce metadata we can ignore
- Media files (images, PDFs) are in `web_resources/` and referenced relatively

---

## 2. Extraction Pipeline

### Phase 1: Unzip and Inventory
```
Input:  .imscc file
Output: extracted directory + inventory.json

Steps:
1. Unzip to temp directory
2. Parse imsmanifest.xml
3. Build inventory of all resources with:
   - Resource ID
   - Type (webcontent, assessment, discussion, etc.)
   - File path within archive
   - Module assignment (from module_meta.xml)
   - Title
4. Write inventory.json for pipeline consumption
```

### Phase 2: Parse Manifest and Build Module Tree
```
Input:  imsmanifest.xml + module_meta.xml
Output: module-tree.json

Steps:
1. Parse XML manifest for <organization> tree
2. Cross-reference with module_meta.xml for ordering
3. Build ordered tree:
   Module 1: "Network Fundamentals"
     - Item 1: wiki page "Lab: Scanning with Nmap" (wiki_content/lab-nmap.html)
     - Item 2: quiz "Nmap Quiz" (quizzes/quiz-nmap.xml)
     - Item 3: assignment "Nmap Report" (assignment_settings/assign-nmap.xml)
   Module 2: ...
4. Tag each item with content type for routing
```

### Phase 3: Extract and Clean HTML
```
Input:  wiki_content/*.html
Output: cleaned HTML fragments

Steps:
1. Read each HTML file
2. Strip Canvas wrapper markup:
   - Remove Canvas-injected <link> and <script> tags
   - Remove Canvas CSS classes (ic-*, canvas-*)
   - Remove data-api-* attributes
3. Resolve file references:
   - Replace $IMS-CC-FILEBASE$ paths with local asset paths
   - Download/copy referenced media to assets directory
4. Normalize HTML:
   - Fix heading hierarchy (apply SEM-001 rules)
   - Convert inline styles to class-based where possible
   - Ensure UTF-8 encoding
5. Extract lab metadata from content:
   - Title (from first h1/h2)
   - Objectives (look for "objectives" or "learning outcomes" sections)
   - Tools mentioned
   - Difficulty estimate based on content complexity
```

### Phase 4: Transform to Hexworth Format
```
Input:  cleaned HTML + metadata
Output: Hexworth-compatible lab files

Steps:
1. Wrap content in Hexworth lab template (see Section 4)
2. Add required Hexworth components:
   - Progress tracking hooks
   - Navigation breadcrumbs
   - House-appropriate theming
3. Generate storageKey and registryId
4. Add to ContentCatalog registry
5. Create module entry in house index
```

### Phase 5: Quiz Conversion
```
Input:  QTI XML quiz files
Output: Hexworth QuizEngine-compatible format

Steps:
1. Parse QTI XML for question data
2. Extract: question text, answer choices, correct answer, points
3. Map QTI question types to QuizEngine types:
   - multiple_choice_question -> 'mc'
   - true_false_question -> 'tf'
   - short_answer_question -> 'short'
   - essay_question -> skip (not auto-gradable)
4. Generate hash-verified answer keys
5. Write QuizEngine config object
```

---

## 3. House Mapping Rules

Tennessee Security labs map to Hexworth houses based on content domain:

| TN Security Topic | Hexworth House | Rationale |
|-------------------|----------------|-----------|
| Network scanning, enumeration | Dark Arts | Offensive reconnaissance |
| Vulnerability assessment | Dark Arts | Attack surface analysis |
| Penetration testing | Dark Arts | Active exploitation |
| Firewall configuration | Shield | Defensive infrastructure |
| IDS/IPS setup | Shield | Detection and prevention |
| Security policy, compliance | Shield | GRC domain |
| Log analysis, SIEM | Eye | Monitoring and investigation |
| Digital forensics | Eye | Evidence analysis |
| Incident response | Eye | IR procedures |
| Cloud security labs | Cloud | Cloud-specific content |
| Windows administration | Forge | System administration |
| Active Directory | Forge | Directory services |
| Linux hardening | Script | Linux security |
| Scripting for security | Script / Code | Automation |
| Cryptography labs | Key | Crypto domain |
| Network protocols | Web | Protocol analysis |
| Web app security | Web / Dark Arts | Depends on offensive vs defensive angle |

### Conflict Resolution
When a lab spans multiple domains (e.g., "Scanning a Linux Web Server"):
1. Primary house = the attack/defense technique domain
2. Secondary house = tagged as cross-reference in ContentCatalog
3. If truly equal, default to Dark Arts for offensive, Shield for defensive

---

## 4. Converted Lab Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{LAB_TITLE} | Hexworth Prime</title>
    <link rel="stylesheet" href="/assets/css/global.css">
    <link rel="stylesheet" href="/assets/css/lab.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="lab-nav">
        <a href="/{HOUSE}/index.html" class="back-link">
            <img src="/assets/images/icons/arrow-left.webp" alt="" class="icon-sm">
            Back to {HOUSE_NAME}
        </a>
    </nav>

    <main class="lab-container">
        <header class="lab-header">
            <h1>{LAB_TITLE}</h1>
            <div class="lab-meta">
                <span class="lab-source">Adapted from Tennessee Security Curriculum</span>
                <span class="lab-difficulty">{DIFFICULTY}</span>
            </div>
        </header>

        <section class="lab-objectives">
            <h2>Learning Objectives</h2>
            <ul>
                {OBJECTIVES_LIST}
            </ul>
        </section>

        <section class="lab-content">
            {CLEANED_HTML_CONTENT}
        </section>

        <section class="lab-assessment" id="lab-check">
            <h2>Knowledge Check</h2>
            {QUIZ_OR_REFLECTION_CONTENT}
        </section>
    </main>

    <script src="/assets/js/progress.js"></script>
    <script>
        // Progress tracking
        ProgressTracker.init('{STORAGE_KEY}', '{REGISTRY_ID}');
    </script>
</body>
</html>
```

---

## 5. Quality Checklist for Converted Content

### Automated Checks (run via EduScan)
- [ ] SEM-001: No heading hierarchy skips
- [ ] SEM-002: Exactly one h1 per page
- [ ] SEM-003: h1 element exists
- [ ] HEUR-006: Back-link uses absolute path
- [ ] CAT-001: Module registered in ContentCatalog
- [ ] No broken image references (all media extracted and paths updated)
- [ ] No Canvas-specific CSS classes remaining
- [ ] No `$IMS-CC-FILEBASE$` references remaining
- [ ] UTF-8 encoding verified
- [ ] No inline `<style>` blocks with Canvas styles

### Manual Review
- [ ] Content accuracy -- does the lab still make sense outside Canvas context?
- [ ] Tool references -- are all tools available in Hexworth's environment?
- [ ] Screenshots -- do embedded screenshots show Canvas UI that needs replacing?
- [ ] Difficulty rating -- is the assigned difficulty appropriate?
- [ ] House assignment -- does the content fit the mapped house?
- [ ] Legal -- is the content licensed for adaptation? (check course metadata)
- [ ] Deduplication -- does Hexworth already have equivalent content?

### Post-Conversion Validation
- [ ] Lab loads in browser without errors
- [ ] Progress tracking fires correctly
- [ ] Back-link navigation works
- [ ] All images render
- [ ] Content appears in Global Search results
- [ ] EduScan full scan passes with zero new findings

---

## 6. Pipeline Implementation Notes (for future dev)

### Tool Choice
Node.js CLI tool, no external dependencies. Use built-in `fs`, `path`, `zlib`. For XML parsing, use a lightweight SAX parser or regex extraction (QTI XML is predictable enough for regex).

### File Organization
```
_tools/canvas-extractor/
  extractor.js       # Main CLI entry point
  manifest-parser.js # imsmanifest.xml parser
  html-cleaner.js    # Canvas HTML cleanup
  qti-converter.js   # Quiz QTI to QuizEngine
  house-mapper.js    # Content-to-house routing
  template.js        # Lab template generator
```

### CLI Interface
```bash
node extractor.js --input course.imscc --output ./_staging/tn-security/
node extractor.js --input course.imscc --inventory-only  # Just produce inventory.json
node extractor.js --input course.imscc --dry-run          # Preview without writing
```

### Risks and Mitigations
| Risk | Mitigation |
|------|------------|
| Canvas HTML varies by instructor | Cleaner handles common patterns; manual review for edge cases |
| QTI format inconsistencies | Graceful fallback: skip unparseable questions, log warnings |
| Media files missing from export | Log missing references; placeholder image with "media not found" |
| Duplicate content already in Hexworth | Inventory step cross-references ContentCatalog before conversion |
| Large exports (>100MB) | Stream processing; process one resource at a time |
