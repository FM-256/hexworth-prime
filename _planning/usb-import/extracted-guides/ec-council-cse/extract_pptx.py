#!/usr/bin/env python3
"""
PPTX Content Extractor for EC-Council CSE Slides
Extracts text content from PPTX files and generates structured markdown.
"""

import zipfile
import xml.etree.ElementTree as ET
import os
import re
from pathlib import Path

def extract_slide_text(pptx_path):
    """Extract all text from a PPTX file, organized by slide."""
    slides = []

    with zipfile.ZipFile(pptx_path, 'r') as z:
        # Find all slide files
        slide_files = [f for f in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', f)]
        slide_files.sort(key=lambda x: int(re.search(r'slide(\d+)', x).group(1)))

        for slide_file in slide_files:
            slide_num = int(re.search(r'slide(\d+)', slide_file).group(1))
            content = z.read(slide_file).decode('utf-8')

            # Parse XML and extract text
            root = ET.fromstring(content)
            texts = []

            # Define namespace
            namespaces = {
                'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
                'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
            }

            # Find all text elements
            for elem in root.iter():
                if elem.text and elem.text.strip():
                    text = elem.text.strip()
                    # Skip copyright notices and slide numbers
                    if 'Copyright' in text or 'EC-Council' in text or 'Reproduction' in text:
                        continue
                    if text.isdigit() and len(text) <= 2:
                        continue
                    texts.append(text)

            slides.append({
                'number': slide_num,
                'texts': texts
            })

    return slides

def generate_markdown(module_name, slides, output_path):
    """Generate markdown from extracted slides."""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"# {module_name}\n\n")
        f.write(f"**Source:** EC-Council Cloud Security Essentials v1\n")
        f.write(f"**Total Slides:** {len(slides)}\n\n")
        f.write("---\n\n")

        for slide in slides:
            f.write(f"## Slide {slide['number']}\n\n")
            for text in slide['texts']:
                # Try to identify headers vs content
                if len(text) < 50 and text.isupper():
                    f.write(f"### {text.title()}\n\n")
                else:
                    f.write(f"{text}\n\n")
            f.write("---\n\n")

    print(f"Generated: {output_path}")

def main():
    base_dir = Path("/home/eq/Ai content creation/Hexworth Prime/_planning/usb-import/extracted-guides/ec-council-cse/CSEv1 Instructor Slides")
    output_dir = Path("/home/eq/Ai content creation/Hexworth Prime/_planning/usb-import/extracted-guides/ec-council-cse/markdown")
    output_dir.mkdir(exist_ok=True)

    modules = [
        ("CSEv1 Module 00 Student Introduction.pptx", "Module 00 - Student Introduction"),
        ("CSEv1 Module 01 Cloud Computing and Security Fundamentals.pptx", "Module 01 - Cloud Computing and Security Fundamentals"),
        ("CSEv1 Module 02 Identity and Access Management (IAM) in Cloud.pptx", "Module 02 - Identity and Access Management"),
        ("CSEv1 Module 03 Data Protection and Encryption in Cloud.pptx", "Module 03 - Data Protection and Encryption"),
        ("CSEv1 Module 04 Network Security in Cloud .pptx", "Module 04 - Network Security in Cloud"),
        ("CSEv1 Module 05 Application Security in Cloud .pptx", "Module 05 - Application Security in Cloud"),
        ("CSEv1 Module 06 Cloud Security Monitoring and Incident Response.pptx", "Module 06 - Security Monitoring and Incident Response"),
        ("CSEv1 Module 07 Cloud Security Risk Assessment and Management.pptx", "Module 07 - Risk Assessment and Management"),
        ("CSEv1 Module 08 Cloud Compliance and Governance.pptx", "Module 08 - Compliance and Governance"),
    ]

    for filename, module_name in modules:
        pptx_path = base_dir / filename
        if pptx_path.exists():
            slides = extract_slide_text(pptx_path)
            output_file = output_dir / f"{filename.replace('.pptx', '.md')}"
            generate_markdown(module_name, slides, output_file)
        else:
            print(f"Not found: {pptx_path}")

if __name__ == "__main__":
    main()
