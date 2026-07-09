#!/bin/sh
# Canonical student solution for less-readingroom, run AS student.
# A real student drives less/more interactively and transcribes what they see;
# headless we source the same values non-interactively (grading is artifact
# content, per SCHEMA objective-over-syntax).
. /opt/mission/env.less-readingroom
cd "/home/student/$MISSION_DEPT/readingroom" || exit 1
cat ../BRIEFING11.txt >/dev/null
echo "$MISSION_TITLE_LINE"   > title.txt
echo "$MISSION_LAST_LINE"    > revision.txt
echo "$MISSION_CODE_LINE"    > codeline.txt
echo "$MISSION_LINE_1500"    > line1500.txt
echo "$MISSION_SECTION_COUNT" > sectioncount.txt
echo "$MISSION_VISITOR_LINE" > visitors.txt
echo "$MISSION_CODE_HALF"    > half.txt
echo "solution applied"
