# Network Essentials v3.1 - Blackboard Deployment Guide

**Version:** 3.1
**Last Updated:** December 7, 2025
**Package:** `network-essentials-v3.1.zip`
**Created By:** CCode-Gamma

---

## Overview

This guide explains how to deploy the Network Essentials Interactive Training Catalog to Blackboard Learn. There are two deployment strategies:

1. **Full Package Upload** (Recommended) - Upload the entire ZIP as a content package
2. **Individual File Links** - Upload files separately and link from course content

---

## Prerequisites

- Blackboard Learn instructor access
- Course shell created
- `network-essentials-v3.1.zip` file (921 KB)

---

## Option 1: Full Package Upload (Recommended)

### Step 1: Access Content Collection

1. Log into Blackboard Learn
2. Navigate to your course
3. Go to **Control Panel** → **Content Collection** → **Course ID**

### Step 2: Upload the ZIP Package

1. Click **Upload** → **Upload Zip Package**
2. Select `network-essentials-v3.1.zip`
3. Click **Submit**
4. Blackboard will extract all 41 files automatically

### Step 3: Create Course Link

1. Go to your course content area (e.g., "Course Materials" or "Learning Modules")
2. Click **Build Content** → **Item** or **Web Link**
3. For **Web Link**:
   - **Name:** Network Essentials Interactive Catalog
   - **URL:** `/bbcswebdav/courses/[COURSE_ID]/network-essentials/catalog.html`
   - Replace `[COURSE_ID]` with your actual course ID
4. Click **Submit**

### Step 4: Verify Deployment

1. Click the link you created
2. Confirm `catalog.html` opens in a new tab
3. Test navigation to a few presentations
4. Verify "Back to Catalog" links work

---

## Option 2: Individual File Links

Use this method if you want more granular control or if ZIP upload isn't available.

### Step 1: Extract ZIP Locally

```bash
unzip network-essentials-v3.1.zip -d network-essentials
```

### Step 2: Upload Files to Content Collection

1. Go to **Content Collection** → **Course ID**
2. Create a folder: **network-essentials**
3. Upload all files maintaining folder structure:
   ```
   network-essentials/
   ├── catalog.html
   ├── *.html (all presentations)
   ├── *.md (all speaker notes)
   ├── *.pdf (lab handouts)
   └── labs/
       └── *.md (all lab guides)
   ```

### Step 3: Create Content Items

For each major component, create a Blackboard Content Item:

#### Main Catalog
- **Build Content** → **Web Link**
- Name: "Network Essentials Catalog"
- URL: Link to `catalog.html`

#### Individual Presentations (Optional)
Create separate items for direct access:
- OSPF Presentation → `ospf-presentation.html`
- VLAN Presentation → `vlan-presentation.html`
- etc.

---

## Option 3: Learning Module Structure

Create a structured learning path using Blackboard Learning Modules:

### Module 1: Foundations
- ARP Presentation
- TCP/IP Presentation
- DNS Presentation
- DHCP Presentation

### Module 2: Switching
- VLAN Presentation
- STP Presentation

### Module 3: Routing
- Static Routes (Lab 1)
- OSPF Presentation
- EIGRP Presentation

### Module 4: Security & Services
- ACL Presentation
- NAT Presentation
- Subnetting Presentation

### Module 5: Hands-On Practice
- Interactive Network Simulator
- Packet Tracer Lite

### Module 6: Capstone Labs
- Labs 1-6 (Cumulative Series)

---

## Blackboard-Specific Considerations

### Content Collection Path
The URL format for Content Collection files:
```
/bbcswebdav/courses/[COURSE_ID]/[FOLDER]/[FILENAME]
```

Example:
```
/bbcswebdav/courses/NET101_2025SP/network-essentials/catalog.html
```

### Iframe Embedding (Alternative)
If you want to embed the catalog directly in a page:

```html
<iframe src="/bbcswebdav/courses/[COURSE_ID]/network-essentials/catalog.html"
        width="100%"
        height="800px"
        frameborder="0">
</iframe>
```

### Pop-out Window (Recommended for Presentations)
For better presentation experience, use:
- **Open in New Window** option when creating links
- Presentations are optimized for full-screen viewing

---

## File Reference

### Core Navigation
| File | Purpose | Blackboard Link Type |
|------|---------|---------------------|
| `catalog.html` | Main hub | Web Link (primary entry point) |

### Presentations (12 files)
| File | Topic | Recommended Access |
|------|-------|-------------------|
| `ospf-presentation.html` | OSPF Routing | Via Catalog or Direct Link |
| `stp-presentation.html` | Spanning Tree | Via Catalog or Direct Link |
| `vlan-presentation.html` | VLANs & Trunking | Via Catalog or Direct Link |
| `arp-presentation.html` | ARP Protocol | Via Catalog or Direct Link |
| `eigrp-presentation.html` | EIGRP Routing | Via Catalog or Direct Link |
| `tcp-presentation.html` | TCP/IP | Via Catalog or Direct Link |
| `dns-presentation.html` | DNS Protocol | Via Catalog or Direct Link |
| `nat-presentation.html` | NAT/PAT | Via Catalog or Direct Link |
| `subnetting-presentation.html` | IPv4 Subnetting | Via Catalog or Direct Link |
| `acl-presentation.html` | Access Control Lists | Via Catalog or Direct Link |
| `dhcp-presentation.html` | DHCP Protocol | Via Catalog or Direct Link |

### Speaker Notes (9 files)
| File | Purpose | Recommended Access |
|------|---------|-------------------|
| `*-speaker-notes.md` | Instructor guides | Download or Blackboard Docs |

### Lab Documents
| File | Purpose | Recommended Access |
|------|---------|-------------------|
| `CUMULATIVE_LAB_SERIES.md` | 6-lab series overview | Content Item |
| `network-essentials-lab-handout.pdf` | Printable handout | Assignment Attachment |
| `cisco-devnet-guide.pdf` | Packet Tracer setup | Content Item |
| `labs/*.md` | Individual lab guides | Content Items |

### Interactive Simulators
| File | Purpose | Recommended Access |
|------|---------|-------------------|
| `interactive-network-simulator.v2.html` | Topology builder | Web Link (New Window) |
| `packet-tracer-lite-v3.html` | Config & troubleshooting | Web Link (New Window) |

---

## Troubleshooting

### Issue: Links Don't Work
**Solution:** Check the Content Collection path. Ensure files were uploaded to the correct course folder.

### Issue: Catalog Opens But Presentations Don't
**Solution:** All files must be in the SAME folder. The catalog uses relative paths like `ospf-presentation.html` (not absolute paths).

### Issue: "Back to Catalog" Links Broken
**Solution:** This happens if files are in different folders. Keep all HTML files together at the same level.

### Issue: PDF Won't Display
**Solution:** Blackboard may try to inline PDFs. Use **Open in New Window** or provide download link.

### Issue: Speaker Notes (Markdown) Look Wrong
**Solution:** Markdown files display as plain text in Blackboard. Options:
1. Convert to PDF before uploading
2. Use Blackboard's document viewer
3. Provide as downloadable files

---

## Best Practices

### 1. Create a Welcome/Instructions Item
Add a content item explaining how to navigate the catalog:
```
Welcome to Network Essentials!

1. Click "Network Essentials Catalog" to access all materials
2. Use keyboard arrows (← →) to navigate presentations
3. Complete labs in order (they build on each other)
4. Practice with the simulators before using Packet Tracer
```

### 2. Set Adaptive Release (Optional)
Control access to advanced content:
- Lock Labs 4-6 until Labs 1-3 completed
- Require quiz scores before unlocking next module

### 3. Create Discussion Forums
Link content to discussions:
- "Questions about OSPF Presentation"
- "Lab 3 Help Thread"
- "Simulator Tips and Tricks"

### 4. Track Completion
Use Blackboard's Performance Dashboard to monitor:
- Which students accessed materials
- Time spent on content
- Completion rates

---

## Quick Deployment Checklist

- [ ] Upload `network-essentials-v3.1.zip` to Content Collection
- [ ] Verify all 41 files extracted correctly
- [ ] Create Web Link to `catalog.html` in course content
- [ ] Test catalog navigation (click 2-3 presentations)
- [ ] Test "Back to Catalog" links
- [ ] Verify simulators load correctly
- [ ] Add welcome/instructions for students
- [ ] (Optional) Create Learning Modules structure
- [ ] (Optional) Set up discussion forums
- [ ] Announce to students!

---

## Support

If you encounter issues:
1. Verify file paths in Content Collection
2. Test in incognito/private browser window
3. Check Blackboard system status
4. Contact your institution's LMS support team

---

**Package:** network-essentials-v3.1.zip
**Checksum (SHA256):** `f9d355caf1edfb54e871938a2b04b4ad76f20cf7182a3a4dc5b2b3da4f593a08`
**Files:** 41
**Size:** 921 KB (compressed) / 2.9 MB (uncompressed)

---

**Happy Teaching! 🎓**
