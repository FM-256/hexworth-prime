#!/usr/bin/env python3
"""
Per-ITEM cover generator for the Cloud Master hub (operator: "generate the rest to match").

The existing gen_batch.py drives a hand-curated map of HUB covers. This does the same for the
CONTENT ITEMS on cloud-master, whose slugs are read from the live hub rather than hand-listed, so
the set cannot drift from what students actually see.

Scenes are ORIGINAL and generic: no real brand, product logo, franchise or copyrighted work. The
locked neon-noir style and the "no text/words/logos" clause come from gen_cover.build_prompt --
the title is drawn by the card, never by the model.

  python3 gen_cloudmaster_items.py --dry-run        # print slug + prompt, no fal calls, no spend
  python3 gen_cloudmaster_items.py --count 1        # generate into staging for curation
  python3 gen_cloudmaster_items.py --only az104     # substring filter
"""
import os, sys, json, re, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_cover import gen

# Keyword -> original scene. First match wins, so order matters: specific before generic.
SCENES = [
    # SCENE-SHAPED, not noun-shaped. The first bulk run described abstractions ("glowing topology")
    # and the model returned flat isometric diagrams and a logo-like cloud mark -- a different
    # register from the three cinematic pilots the operator approved. Every entry below now names a
    # PHYSICAL SPACE, a SUBJECT in it, and a beat of action, which is what made the pilots read as
    # cinematic. The operator's instruction was "generate the rest to match".
    ('account',      "a lone administrator standing before towering glass partitions that divide one vast data hall into separate lit enclosures, each enclosure glowing a different intensity, deep receding perspective"),
    ('identit',      "a figure pausing at a tall security turnstile inside a dark facility, badge raised, beams of light fanning out ahead into corridors that open only where the beam lands"),
    ('governance',   "a figure pausing at a tall security turnstile inside a dark facility, badge raised, beams of light fanning out ahead into corridors that open only where the beam lands"),
    ('storage',      "a technician walking a narrow catwalk between immense vaults of stacked drives receding into darkness, one vault door open and spilling light across the walkway"),
    ('comput',       "an engineer watching machines assemble themselves out of light on a factory floor, half-formed chassis solidifying row by row into the distance"),
    ('network',      "an operator on a raised platform overlooking a dark hall strung with luminous cabling that arcs between distant racks, cables converging overhead like a canopy"),
    ('monitor',      "an analyst silhouetted against a towering curved wall of live monitoring panels in a darkened operations room, one panel pulsing amber among the calm cyan"),
    ('backup',       "a lone figure in a cold vault of sealed archival cases stretching into darkness, one case withdrawn and glowing in their hands"),
    ('security',     "a guard's silhouette at the threshold of a fortified server core, layered barriers of light receding inward, something testing the outer barrier and scattering"),
    ('databas',      "an archivist between colossal shelves of luminous ledgers in a cathedral-like hall, beams of light tracing connections from shelf to distant shelf"),
    ('serverless',   "an engineer on a dark plain watching brief pillars of light ignite, do their work and vanish, leaving nothing behind but the after-glow"),
    ('container',    "a night shipyard of stacked freight units glowing from within, a crane silhouette moving one unit into a waiting row, harbour lights receding"),
    ('migrat',       "workers guiding luminous cargo across a long bridge from a decaying dark facility toward a bright new hall on the far side"),
    ('cost',         "an operator at a mezzanine console overlooking a data hall, gauges and meters casting light upward onto their face"),
    ('architect',    "an architect standing beneath an enormous suspended blueprint of an entire facility, the real halls faintly visible far below through the floor"),
    ('concept',      "a newcomer standing at the mouth of an immense luminous machine hall for the first time, scale dwarfing the figure, light pouring from deep inside"),
    ('presentation', "a darkened lecture hall seen from the back row, a lone presenter silhouetted against an enormous glowing technical projection, empty seats in shadow"),
    ('quiz',         "a single figure seated at a lone desk in a vast dark examination hall, one overhead light, floating glyphs orbiting slowly above the desk"),
    ('exam',         "a single figure seated at a lone desk in a vast dark examination hall, one overhead light, floating glyphs orbiting slowly above the desk"),
    ('lab',          "an engineer mid-task at a cluttered workbench inside a dim machine bay, cables in hand, open equipment glowing around them"),
    ('install',      "a technician kneeling to seat a component into an open rack, tools laid out, the rack lighting up section by section as it comes alive"),
    ('openstack',    "an engineer standing inside an opened machine core, its interlocking service rings exposed and turning slowly around them"),
    ('operation',    "an operator's hands on a control console in a dim command room, banks of readouts stretching away, one hand mid-adjustment"),
    ('project',      "a builder standing back to look at a large structure they have assembled from separate luminous modules, the last module settling into place"),
    ('intro',        "a figure pushing open a heavy door onto an immense glowing facility, first light spilling past them into the dark corridor behind"),
    ('fundamental',  "a lone figure at the base of colossal luminous pillars that vanish upward into darkness, hand resting against the nearest one"),
]
FALLBACK = "a lone engineer walking a long corridor between towering server rows that recede into darkness, volumetric light from above, cinematic depth"

def scene_for(slug, title):
    hay = (slug + ' ' + title).lower()
    for kw, sc in SCENES:
        if kw in hay:
            return sc
    return FALLBACK

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--items', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cloudmaster-items.json'))
    ap.add_argument('--count', type=int, default=1)
    ap.add_argument('--only', default='')
    ap.add_argument('--size', default='square_hd', help="matches the approved pilots")
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    items = json.load(open(a.items))
    todo = [(s, t) for s, t in items if (not a.only or a.only in s)]
    print(f"  {len(todo)} item(s); {a.count} variation(s) each = {len(todo)*a.count} generation(s)")
    failed = []
    for i, (slug, title) in enumerate(todo, 1):
        subject = scene_for(slug, title)
        if a.dry_run:
            print(f"  [{i}/{len(todo)}] {slug}\n        {subject[:96]}")
            continue
        print(f"  [{i}/{len(todo)}] {slug}")
        try:
            gen(slug, subject, 'cloud', a.count, a.size)
        except Exception as e:
            failed.append(slug)
            print(f"      FAILED {slug}: {e}", file=sys.stderr)
    # Exit NON-ZERO when anything failed. The first run of this script swallowed all 66 exceptions
    # and exited 0 -- a clean exit code that meant nothing, which is exactly how a caller concludes
    # work happened when none did.
    if failed:
        print(f"\n  {len(failed)} of {len(todo)} FAILED", file=sys.stderr)
        sys.exit(1)
    print(f"\n  {len(todo)} generated into staging")

if __name__ == '__main__':
    main()
