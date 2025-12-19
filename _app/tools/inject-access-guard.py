#!/usr/bin/env python3
"""
inject-access-guard.py - Batch inject AccessGuard into content pages

This script adds access control to all house content and Dark Arts pages.
It injects the AccessGuard.js script and appropriate access checks.

Usage:
    python3 inject-access-guard.py [--dry-run]

Options:
    --dry-run    Show what would be changed without modifying files
"""

import os
import re
import sys
from pathlib import Path

# Configuration
APP_ROOT = Path(__file__).parent.parent
HOUSES_DIR = APP_ROOT / "houses"
DARK_ARTS_DIR = APP_ROOT / "dark-arts"

# Guard injection templates
def get_guard_script(relative_depth, protection_type, protection_param=None):
    """Generate the AccessGuard script block based on file location."""

    # Calculate path to components directory
    path_prefix = "../" * relative_depth

    script = f'''
    <!-- Access Control -->
    <script src="{path_prefix}components/AccessGuard.js"></script>
    <script>
        AccessGuard.require('{protection_type}'{f", '{protection_param}'" if protection_param else ""});
    </script>
'''
    return script.strip()


def get_relative_depth(file_path, base_dir):
    """Calculate how many directories deep the file is from base."""
    rel_path = file_path.relative_to(base_dir)
    return len(rel_path.parts)


def determine_protection(file_path, app_root):
    """Determine the protection level based on file path."""

    rel_path = file_path.relative_to(app_root)
    parts = rel_path.parts

    # Dark Arts protection
    if parts[0] == "dark-arts":
        if "vault" in parts:
            # Vault content requires all 5 gates
            return ("dark-arts", None)
        elif "gates" in parts or "gate-" in str(file_path):
            # Gate pages themselves - only require sorting
            return ("sorted", None)
        else:
            return ("sorted", None)

    # House content protection
    if parts[0] == "houses":
        house_name = parts[1] if len(parts) > 1 else None
        if house_name:
            # For now, require sorting (not specific house)
            # This allows cross-house exploration while still blocking direct access
            return ("sorted", None)

    return ("sorted", None)


def inject_guard(file_path, app_root, dry_run=False):
    """Inject AccessGuard into a single HTML file."""

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ERROR reading: {e}")
        return False

    # Skip if already has AccessGuard
    if 'AccessGuard' in content:
        print(f"  SKIP (already protected): {file_path.name}")
        return False

    # Calculate relative depth from _app directory
    rel_to_app = file_path.relative_to(app_root)
    depth = len(rel_to_app.parts)

    # Determine protection type
    protection_type, protection_param = determine_protection(file_path, app_root)

    # Generate guard script
    guard_script = get_guard_script(depth, protection_type, protection_param)

    # Find injection point (after <head> or after first <meta charset>)
    # Try to inject after charset meta tag
    charset_pattern = r'(<meta\s+charset=["\'][^"\']+["\']\s*/?>)'
    match = re.search(charset_pattern, content, re.IGNORECASE)

    if match:
        # Inject after charset meta
        insert_pos = match.end()
        new_content = content[:insert_pos] + "\n    " + guard_script + content[insert_pos:]
    else:
        # Fallback: inject after <head>
        head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
        if head_match:
            insert_pos = head_match.end()
            new_content = content[:insert_pos] + "\n    " + guard_script + content[insert_pos:]
        else:
            print(f"  ERROR: No <head> found in {file_path.name}")
            return False

    if dry_run:
        print(f"  WOULD INJECT ({protection_type}): {file_path.name}")
        return True

    # Write modified content
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  INJECTED ({protection_type}): {file_path.name}")
        return True
    except Exception as e:
        print(f"  ERROR writing: {e}")
        return False


def process_directory(directory, app_root, dry_run=False):
    """Process all HTML files in a directory recursively."""

    if not directory.exists():
        print(f"Directory not found: {directory}")
        return 0

    count = 0
    for html_file in directory.rglob("*.html"):
        # Skip index.html files (they're landing pages, not content)
        if html_file.name == "index.html":
            print(f"  SKIP (landing page): {html_file.relative_to(app_root)}")
            continue

        if inject_guard(html_file, app_root, dry_run):
            count += 1

    return count


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("=" * 60)
        print("DRY RUN MODE - No files will be modified")
        print("=" * 60)

    print(f"\nProcessing houses directory: {HOUSES_DIR}")
    print("-" * 60)
    houses_count = process_directory(HOUSES_DIR, APP_ROOT, dry_run)

    print(f"\nProcessing dark-arts directory: {DARK_ARTS_DIR}")
    print("-" * 60)
    dark_arts_count = process_directory(DARK_ARTS_DIR, APP_ROOT, dry_run)

    print("\n" + "=" * 60)
    print(f"Total files {'would be ' if dry_run else ''}modified: {houses_count + dark_arts_count}")
    print("=" * 60)

    if dry_run:
        print("\nRun without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
