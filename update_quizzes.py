#!/usr/bin/env python3
"""
Update all quiz files to include the Progress System
"""

import os
import re
from pathlib import Path

# Base path
BASE_PATH = Path("/home/eq/Ai content creation/Hexworth Prime/_app/houses")

# Map quiz files to their module IDs and house IDs
QUIZ_MAPPINGS = {
    # Shield House
    "shield/quizzes/cia-triad-quiz.html": {"moduleId": "shield-cia-triad-quiz", "houseId": "shield"},

    # Web House
    "web/quizzes/osi-quiz.html": {"moduleId": "web-osi-quiz", "houseId": "web"},
    "web/quizzes/subnetting-quiz.html": {"moduleId": "web-subnetting-quiz", "houseId": "web"},

    # Forge House
    "forge/quizzes/windows-admin-quiz.html": {"moduleId": "forge-windows-admin-quiz", "houseId": "forge"},
    "forge/quizzes/aplus-core2-quiz.html": {"moduleId": "forge-aplus-core2-quiz", "houseId": "forge"},

    # Script House
    "script/quizzes/linux-basics-quiz.html": {"moduleId": "script-linux-quiz", "houseId": "script"},

    # Cloud House
    "cloud/quizzes/aws-fundamentals-quiz.html": {"moduleId": "cloud-aws-quiz", "houseId": "cloud"},

    # Code House
    "code/quizzes/agile-quiz.html": {"moduleId": "code-agile-quiz", "houseId": "code"},
    "code/quizzes/cicd-quiz.html": {"moduleId": "code-cicd-quiz", "houseId": "code"},
    "code/quizzes/docker-quiz.html": {"moduleId": "code-docker-quiz", "houseId": "code"},
    "code/quizzes/kubernetes-quiz.html": {"moduleId": "code-kubernetes-quiz", "houseId": "code"},
    "code/quizzes/terraform-quiz.html": {"moduleId": "code-terraform-quiz", "houseId": "code"},
    "code/quizzes/cloudformation-quiz.html": {"moduleId": "code-cloudformation-quiz", "houseId": "code"},

    # Key House
    "key/quizzes/symmetric-quiz.html": {"moduleId": "key-symmetric-quiz", "houseId": "key"},
    "key/quizzes/ecc-quiz.html": {"moduleId": "key-ecc-quiz", "houseId": "key"},
    "key/quizzes/kdf-quiz.html": {"moduleId": "key-kdf-quiz", "houseId": "key"},
    "key/quizzes/mac-quiz.html": {"moduleId": "key-mac-quiz", "houseId": "key"},
    "key/quizzes/cert-quiz.html": {"moduleId": "key-cert-quiz", "houseId": "key"},
    "key/quizzes/cryptanalysis-quiz.html": {"moduleId": "key-cryptanalysis-quiz", "houseId": "key"},
    "key/quizzes/hsm-quiz.html": {"moduleId": "key-hsm-quiz", "houseId": "key"},
    "key/quizzes/pqc-quiz.html": {"moduleId": "key-pqc-quiz", "houseId": "key"},

    # Eye House
    "eye/quizzes/soc-quiz.html": {"moduleId": "eye-soc-quiz", "houseId": "eye"},
    "eye/quizzes/siem-quiz.html": {"moduleId": "eye-siem-quiz", "houseId": "eye"},
    "eye/quizzes/correlation-quiz.html": {"moduleId": "eye-correlation-quiz", "houseId": "eye"},
    "eye/quizzes/hunting-quiz.html": {"moduleId": "eye-hunting-quiz", "houseId": "eye"},
    "eye/quizzes/traffic-quiz.html": {"moduleId": "eye-traffic-quiz", "houseId": "eye"},
}


def update_quiz_file(filepath, module_id, house_id):
    """Update a single quiz file with progress system integration"""
    full_path = BASE_PATH / filepath

    if not full_path.exists():
        print(f"  SKIP: {filepath} (file not found)")
        return False

    content = full_path.read_text()

    # Check if already updated
    if "ProgressSystem.js" in content:
        print(f"  SKIP: {filepath} (already updated)")
        return False

    # Add ProgressSystem.js before QuizEngine.js
    content = re.sub(
        r'(<!-- Quiz Engine -->)\s*\n\s*(<script src="[^"]*QuizEngine\.js"></script>)',
        r'<!-- Progress System (loads ProgressManager, AchievementSystem, LearningPaths, SkillTreeData) -->\n    <script src="../../../components/ProgressSystem.js"></script>\n\n    \1\n    \2',
        content
    )

    # Add moduleId, houseId, trackProgress to quiz config
    # Look for the QuizEngine config and add after theme or achievement
    config_pattern = r"(theme:\s*'[^']*',\s*\n\s*)(achievement:\s*'[^']*',)"
    replacement = rf"\1\2\n            // Progress tracking\n            moduleId: '{module_id}',\n            houseId: '{house_id}',\n            trackProgress: true,"

    if re.search(config_pattern, content):
        content = re.sub(config_pattern, replacement, content)
    else:
        # Try alternative pattern - just add after theme
        config_pattern2 = r"(theme:\s*'[^']*',)"
        replacement2 = rf"\1\n            // Progress tracking\n            moduleId: '{module_id}',\n            houseId: '{house_id}',\n            trackProgress: true,"
        if re.search(config_pattern2, content):
            content = re.sub(config_pattern2, replacement2, content)
        else:
            print(f"  WARN: {filepath} (could not find config pattern)")

    full_path.write_text(content)
    print(f"  UPDATED: {filepath}")
    return True


def main():
    print("Updating quiz files with Progress System...")
    print("-" * 50)

    updated = 0
    skipped = 0

    for filepath, config in QUIZ_MAPPINGS.items():
        if update_quiz_file(filepath, config["moduleId"], config["houseId"]):
            updated += 1
        else:
            skipped += 1

    print("-" * 50)
    print(f"Done! Updated: {updated}, Skipped: {skipped}")


if __name__ == "__main__":
    main()
