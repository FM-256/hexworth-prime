#!/usr/bin/env python3
"""
Fix broken links in Hexworth Prime
Addresses:
1. Component import paths that escape outside _app/
2. Navigation links to non-existent /houses/index.html
3. Forge dashboard links
"""

import os
import re
from pathlib import Path

APP_DIR = Path("/home/eq/Ai content creation/Hexworth Prime/_app")
COMPONENTS = ["AccessGuard.js", "AchievementManager.js", "ModuleProgress.js", "QuizEngine.js"]

fixes_made = {
    "component_imports": 0,
    "navigation_links": 0,
    "dashboard_links": 0,
    "files_modified": set()
}

def get_relative_path_to_components(file_path):
    """Calculate correct relative path from file to _app/components/"""
    rel_path = file_path.relative_to(APP_DIR)
    depth = len(rel_path.parts) - 1  # -1 for the file itself
    return "../" * depth + "components/"

def get_relative_path_to_root(file_path):
    """Calculate correct relative path from file to _app/ root"""
    rel_path = file_path.relative_to(APP_DIR)
    depth = len(rel_path.parts) - 1
    return "../" * depth if depth > 0 else "./"

def fix_component_imports(content, file_path):
    """Fix component import paths"""
    global fixes_made
    correct_base = get_relative_path_to_components(file_path)

    modified = content
    for component in COMPONENTS:
        # Match any relative path ending in components/ComponentName.js
        # This catches paths like ../../components/, ../../../components/, etc.
        pattern = rf'(src=["\'])(?:\.\.\/)+components\/{component}(["\'])'
        replacement = rf'\g<1>{correct_base}{component}\g<2>'

        new_content = re.sub(pattern, replacement, modified)
        if new_content != modified:
            count = len(re.findall(pattern, modified))
            fixes_made["component_imports"] += count
            modified = new_content

    return modified

def fix_navigation_to_houses_index(content, file_path):
    """Fix links that point to non-existent /houses/index.html"""
    global fixes_made

    # Get correct path to root index.html
    correct_root = get_relative_path_to_root(file_path)

    modified = content

    # Pattern: href pointing to ../../index.html from houses subdirectories
    # that would resolve to /houses/index.html
    rel_path = file_path.relative_to(APP_DIR)
    parts = rel_path.parts

    # Only fix if file is in houses/*/something/ (depth 3+)
    if len(parts) >= 3 and parts[0] == "houses":
        # Check for links that would resolve to /houses/index.html
        # From houses/KEY/presentations/file.html, ../../index.html goes to houses/index.html

        # Pattern: going up 2 levels to index.html from a houses subdirectory
        pattern = r'(href=["\'])\.\.\/\.\.\/index\.html(["\'])'
        correct_path = correct_root + "index.html"
        replacement = rf'\g<1>{correct_path}\g<2>'

        new_content = re.sub(pattern, replacement, modified)
        if new_content != modified:
            count = len(re.findall(pattern, modified))
            fixes_made["navigation_links"] += count
            modified = new_content

    return modified

def fix_forge_dashboard_links(content, file_path):
    """Fix Forge house links to dashboard"""
    global fixes_made

    rel_path = file_path.relative_to(APP_DIR)
    parts = rel_path.parts

    # Only fix if file is in houses/forge/
    if len(parts) >= 2 and parts[0] == "houses" and parts[1] == "forge":
        correct_root = get_relative_path_to_root(file_path)

        # Fix ../../dashboard.html that would go to houses/dashboard.html
        # From houses/forge/presentations/file.html (depth 3)
        if len(parts) == 4:  # houses/forge/subfolder/file.html
            pattern = r'(href=["\'])\.\.\/\.\.\/dashboard\.html(["\'])'
            correct_path = correct_root + "dashboard.html"
            replacement = rf'\g<1>{correct_path}\g<2>'

            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                count = len(re.findall(pattern, content))
                fixes_made["dashboard_links"] += count
                content = new_content

    return content

def fix_file(file_path):
    """Apply all fixes to a single file"""
    global fixes_made

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            original_content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    content = original_content

    # Apply all fixes
    content = fix_component_imports(content, file_path)
    content = fix_navigation_to_houses_index(content, file_path)
    content = fix_forge_dashboard_links(content, file_path)

    # Only write if changes were made
    if content != original_content:
        fixes_made["files_modified"].add(str(file_path))
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path.relative_to(APP_DIR)}")
        except Exception as e:
            print(f"Error writing {file_path}: {e}")

def main():
    print("=" * 60)
    print("Hexworth Prime Link Fixer")
    print("=" * 60)

    # Find all HTML files
    html_files = list(APP_DIR.rglob("*.html"))
    print(f"\nFound {len(html_files)} HTML files to check\n")

    for file_path in html_files:
        fix_file(file_path)

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Component imports fixed: {fixes_made['component_imports']}")
    print(f"Navigation links fixed: {fixes_made['navigation_links']}")
    print(f"Dashboard links fixed: {fixes_made['dashboard_links']}")
    print(f"Total files modified: {len(fixes_made['files_modified'])}")
    print("=" * 60)

if __name__ == "__main__":
    main()
