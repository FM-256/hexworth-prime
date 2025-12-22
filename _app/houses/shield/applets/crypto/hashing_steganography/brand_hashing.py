#!/usr/bin/env python3
"""
Apply House of Shield branding to custom Hashing/Steganography applets
"""

import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SHIELD_WRAPPER_START = '''<div class="hexworth-wrapper" style="font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%); min-height: 100vh; margin: 0; padding: 0;">
    <header style="background: linear-gradient(135deg, #1a0a0a 0%, #8b0000 50%, #dc143c 100%); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(220, 20, 60, 0.3);">
        <a href="../../../index.html" style="display: flex; align-items: center; gap: 12px; color: white; text-decoration: none;">
            <span style="font-size: 28px;">🏰</span>
            <span style="font-size: 18px; font-weight: 600; letter-spacing: 1px;">Hexworth Academy</span>
        </a>
        <span style="background: linear-gradient(135deg, #1a1a1a, #333333); color: #dc143c; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #dc143c;">🛡️ House of Shield</span>
    </header>
    <div style="display: flex; justify-content: center; padding: 20px;">
'''

SHIELD_WRAPPER_END = '''    </div>
    <footer style="background: rgba(26, 10, 10, 0.8); color: rgba(255,255,255,0.7); text-align: center; padding: 12px; font-size: 12px;">
        <p>Educational content | <a href="../../../index.html" style="color: #dc143c; text-decoration: none;">← Back to House</a></p>
    </footer>
</div>'''

def brand_file(filepath):
    """Apply Shield branding wrapper to HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Skip if already branded
        if 'hexworth-wrapper' in content or 'House of Shield' in content:
            return False

        # Find body tag and wrap content
        body_match = re.search(r'(<body[^>]*>)', content)
        if body_match:
            body_tag = body_match.group(1)
            content = content.replace(body_tag, body_tag + '\n' + SHIELD_WRAPPER_START)

        # Add footer before closing body
        content = content.replace('</body>', SHIELD_WRAPPER_END + '\n</body>')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("Applying Shield branding to Hashing/Steganography applets...")
    branded = 0
    for file in os.listdir(BASE_DIR):
        if file.endswith('.html'):
            filepath = os.path.join(BASE_DIR, file)
            if brand_file(filepath):
                branded += 1
                print(f"  Branded: {file}")
    print(f"Done! Branded {branded} files.")

if __name__ == "__main__":
    main()
