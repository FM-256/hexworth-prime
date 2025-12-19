#!/usr/bin/env python3
"""
content-encoder.py - Build-Time Content Encryption Tool

Encrypts educational content in HTML files so that:
1. Content is unreadable when opening files directly
2. Content is decrypted at runtime by ContentDecoder.js
3. Only users who pass AccessGuard can view content

Encoding Pipeline:
1. Extract content from marked sections
2. Compress (optional, for large content)
3. XOR encrypt with derived key
4. Base64 encode for storage
5. Replace original content with encrypted payload

Usage:
    python3 content-encoder.py [file.html]           # Encode single file
    python3 content-encoder.py --dir [directory]    # Encode all HTML in directory
    python3 content-encoder.py --decode [file.html] # Decode (for testing)
    python3 content-encoder.py --dry-run [...]      # Preview without modifying

Markers:
    Add class="encode-content" to sections you want encrypted
    OR use <!-- ENCODE-START --> and <!-- ENCODE-END --> comments

@author Hexworth Prime
@version 1.0.0
"""

import os
import re
import sys
import base64
import hashlib
import random
import string
from pathlib import Path

# Configuration
MASTER_SALT = 'HexworthPrime2025'
STORAGE_PREFIX = 'hexworth_'

# Content markers
ENCODE_CLASS = 'encode-content'
ENCODE_START = '<!-- ENCODE-START -->'
ENCODE_END = '<!-- ENCODE-END -->'

# Scripts to inject
DECODER_SCRIPT = '''
    <script src="{path}components/ContentDecoder.js"></script>
    <script>
        // Auto-reveal after AccessGuard passes
        if (typeof AccessGuard !== 'undefined') {{
            ContentDecoder.autoReveal();
        }}
    </script>
'''

# ============================================
# KEY DERIVATION (must match JavaScript)
# ============================================

def hash_string(s):
    """
    djb2 hash variant - must match JavaScript implementation
    """
    h = 5381
    for c in s:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    return h & 0x7FFFFFFF

def generate_key_bytes(hash_val, length):
    """
    Generate key bytes from hash - must match JavaScript
    """
    bytes_list = []
    h = hash_val
    for _ in range(length):
        h = (h * 1103515245 + 12345) & 0x7FFFFFFF
        bytes_list.append(h % 256)
    return bytes_list

def derive_key(salt='', house='', sorted_flag=True):
    """
    Derive encryption key from factors
    For encoding, we use default values that will match decoded state
    """
    sorted_str = 'sorted' if sorted_flag else ''
    key_material = '|'.join([MASTER_SALT, salt, house, sorted_str])
    return hash_string(key_material)

# ============================================
# ENCRYPTION
# ============================================

def xor_encrypt(data_bytes, key_hash):
    """
    XOR encrypt/decrypt bytes with derived key
    """
    key_bytes = generate_key_bytes(key_hash, len(data_bytes))
    result = bytearray(len(data_bytes))

    for i, b in enumerate(data_bytes):
        result[i] = b ^ key_bytes[i]

    return bytes(result)

def generate_salt(length=8):
    """
    Generate random salt for this content block
    """
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def encode_content(content, salt=''):
    """
    Full encoding pipeline: content -> Base64 payload
    """
    # Step 1: Convert to bytes
    content_bytes = content.encode('utf-8')

    # Step 2: XOR encrypt
    key_hash = derive_key(salt)
    encrypted = xor_encrypt(content_bytes, key_hash)

    # Step 3: Base64 encode
    payload = base64.b64encode(encrypted).decode('ascii')

    return payload

def decode_content(payload, salt=''):
    """
    Decode for testing: Base64 payload -> content
    """
    # Step 1: Base64 decode
    encrypted = base64.b64decode(payload)

    # Step 2: XOR decrypt
    key_hash = derive_key(salt)
    decrypted = xor_encrypt(encrypted, key_hash)

    # Step 3: Decode UTF-8
    return decrypted.decode('utf-8')

# ============================================
# HTML PROCESSING
# ============================================

def find_encode_sections_by_class(html):
    """
    Find sections with class="encode-content"
    Returns list of (start, end, content) tuples
    """
    # Pattern to find elements with encode-content class
    # This is simplified - real implementation might use BeautifulSoup
    pattern = r'<(\w+)[^>]*class="[^"]*\bencode-content\b[^"]*"[^>]*>(.*?)</\1>'
    matches = []

    for match in re.finditer(pattern, html, re.DOTALL | re.IGNORECASE):
        tag = match.group(1)
        content = match.group(2)
        matches.append({
            'start': match.start(),
            'end': match.end(),
            'tag': tag,
            'content': content,
            'full_match': match.group(0)
        })

    return matches

def find_encode_sections_by_comment(html):
    """
    Find sections between ENCODE-START and ENCODE-END comments
    """
    pattern = r'<!-- ENCODE-START -->(.*?)<!-- ENCODE-END -->'
    matches = []

    for match in re.finditer(pattern, html, re.DOTALL):
        content = match.group(1).strip()
        matches.append({
            'start': match.start(),
            'end': match.end(),
            'content': content,
            'full_match': match.group(0)
        })

    return matches

def create_protected_block(content, salt, tag='div'):
    """
    Create the protected content HTML block
    """
    payload = encode_content(content, salt)

    protected = f'''<{tag} class="protected-content" data-payload="{payload}" data-salt="{salt}">
        <div class="content-locked">
            <span class="lock-icon">🔒</span>
            <span class="lock-text">Protected Content</span>
        </div>
    </{tag}>'''

    return protected

def get_relative_path(file_path, app_root):
    """
    Calculate relative path to components directory
    """
    rel_path = file_path.relative_to(app_root)
    depth = len(rel_path.parts)
    return '../' * depth

def process_file(file_path, app_root, dry_run=False):
    """
    Process a single HTML file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()
    except Exception as e:
        print(f"  ERROR reading: {e}")
        return 0

    # Check if already has ContentDecoder
    if 'ContentDecoder' in html:
        print(f"  SKIP (already encoded): {file_path.name}")
        return 0

    # Find sections to encode
    sections = find_encode_sections_by_class(html)
    sections.extend(find_encode_sections_by_comment(html))

    if not sections:
        print(f"  SKIP (no encode markers): {file_path.name}")
        return 0

    # Process sections in reverse order (to preserve positions)
    sections.sort(key=lambda x: x['start'], reverse=True)

    modified_html = html
    for section in sections:
        salt = generate_salt()
        tag = section.get('tag', 'div')
        protected = create_protected_block(section['content'], salt, tag)
        modified_html = (
            modified_html[:section['start']] +
            protected +
            modified_html[section['end']:]
        )

    # Add ContentDecoder script if not present
    rel_path = get_relative_path(file_path, app_root)
    decoder_script = DECODER_SCRIPT.format(path=rel_path)

    # Inject after AccessGuard script
    if 'AccessGuard' in modified_html:
        # Add after AccessGuard require call
        pattern = r'(AccessGuard\.require\([^)]+\);?\s*</script>)'
        modified_html = re.sub(
            pattern,
            r'\1' + decoder_script,
            modified_html,
            count=1
        )
    else:
        # Add before </head>
        modified_html = modified_html.replace(
            '</head>',
            decoder_script + '\n</head>'
        )

    if dry_run:
        print(f"  WOULD ENCODE ({len(sections)} sections): {file_path.name}")
        return len(sections)

    # Write modified content
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_html)
        print(f"  ENCODED ({len(sections)} sections): {file_path.name}")
        return len(sections)
    except Exception as e:
        print(f"  ERROR writing: {e}")
        return 0

def process_directory(directory, app_root, dry_run=False):
    """
    Process all HTML files in a directory recursively
    """
    if not directory.exists():
        print(f"Directory not found: {directory}")
        return 0

    total = 0
    for html_file in directory.rglob("*.html"):
        # Skip certain files
        if html_file.name in ['index.html', 'unauthorized.html', 'sorting.html', 'dashboard.html']:
            print(f"  SKIP (core file): {html_file.name}")
            continue

        sections = process_file(html_file, app_root, dry_run)
        total += sections

    return total

# ============================================
# CLI
# ============================================

def print_help():
    print("""
content-encoder.py - Encrypt content in HTML files

Usage:
    python3 content-encoder.py [file.html]           # Encode single file
    python3 content-encoder.py --dir [directory]    # Encode all HTML in directory
    python3 content-encoder.py --decode [file.html] # Decode for testing
    python3 content-encoder.py --dry-run [...]      # Preview without modifying

Marking content for encoding:
    Option 1: Add class="encode-content" to any HTML element
    Option 2: Wrap content with <!-- ENCODE-START --> and <!-- ENCODE-END -->

Example:
    <div class="encode-content">
        <h2>Secret Lesson</h2>
        <p>This content will be encrypted...</p>
    </div>

    OR

    <!-- ENCODE-START -->
    <h2>Secret Lesson</h2>
    <p>This content will be encrypted...</p>
    <!-- ENCODE-END -->
""")

def main():
    args = sys.argv[1:]

    if not args or '--help' in args or '-h' in args:
        print_help()
        return

    dry_run = '--dry-run' in args
    if dry_run:
        args.remove('--dry-run')
        print("=" * 60)
        print("DRY RUN MODE - No files will be modified")
        print("=" * 60)

    app_root = Path(__file__).parent.parent

    if '--dir' in args:
        idx = args.index('--dir')
        if idx + 1 < len(args):
            directory = Path(args[idx + 1])
            if not directory.is_absolute():
                directory = app_root / directory

            print(f"\nProcessing directory: {directory}")
            print("-" * 60)
            total = process_directory(directory, app_root, dry_run)
            print("\n" + "=" * 60)
            print(f"Total sections {'would be ' if dry_run else ''}encoded: {total}")
            print("=" * 60)
        else:
            print("ERROR: --dir requires a directory path")

    elif '--decode' in args:
        idx = args.index('--decode')
        if idx + 1 < len(args):
            # Test decode a payload
            payload = args[idx + 1]
            salt = args[idx + 2] if idx + 2 < len(args) else ''
            try:
                decoded = decode_content(payload, salt)
                print("Decoded content:")
                print("-" * 40)
                print(decoded)
            except Exception as e:
                print(f"Decode error: {e}")
        else:
            print("ERROR: --decode requires a payload string")

    else:
        # Single file
        file_path = Path(args[0])
        if not file_path.is_absolute():
            file_path = Path.cwd() / file_path

        if file_path.exists():
            process_file(file_path, app_root, dry_run)
        else:
            print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()
