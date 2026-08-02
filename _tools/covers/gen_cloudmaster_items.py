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
    #
    # ── Wave 2 (2026-08-02): MS-102 / MS-900 / PL-300 / Server+ vocabulary. Without these,
    #    the generic component keywords below (presentation/quiz/lab) matched first and the
    #    dry run produced 24 identical lecture halls. Topic-specific entries must sit ABOVE
    #    the generic tail because first match in list order wins. ──
    ('tenant',        "an administrator raising a master switch inside an empty glass control room as an entire dark campus lights up floor by floor beyond the window"),
    ('users and gro', "a marshal on a gantry sorting streams of glowing figures into separate lit channels below, each channel converging toward its own gate"),
    ('roles and acc', "a keeper at a wall of numbered vault doors handing a single glowing key to a waiting silhouette, the other doors sealed dark down the corridor"),
    ('entra',         "a figure stepping through a scanning archway that paints them in light, a second gate ahead staying dark until the first confirms"),
    ('exchange',      "a night mail hall of luminous parcels routing themselves along suspended tracks overhead, a clerk below redirecting one glowing parcel with a gesture"),
    ('sharepoint',    "workers around a circular table of glowing documents that lift and file themselves onto shelves rising into darkness"),
    ('teams',         "a dark round chamber where seated silhouettes face a ring of lit panels, threads of light crossing the table between them"),
    ('complian',      "an inspector walking a catwalk with a glowing ledger, stamping seals of light onto crates that pass on a belt below"),
    ('licens',        "a clerk at a tall counter sliding glowing tokens across to a queue of silhouettes, shelves of sealed permits lit behind"),
    ('pricing',       "a clerk at a tall counter sliding glowing tokens across to a queue of silhouettes, shelves of sealed permits lit behind"),
    ('prepare the d', "a worker at a sluice gate guiding a rushing stream of luminous fragments through filters that leave the stream running clean"),
    ('model the dat', "an artisan suspending glowing panes in midair and drawing threads between them until a lattice takes shape overhead"),
    ('visualiz',      "a figure before a towering dark wall where raw streams of light bloom into charts and shapes wherever they touch the surface"),
    ('dax',           "a mathematician at a slate of floating luminous formulae, one expression flaring bright as its pieces lock into order"),
    ('deploy and ma', "an engineer on a maintenance walkway tightening a luminous coupling as a long machine spine hums back to life section by section"),
    ('hyper-v',       "an engineer in a hall of mirrored glass chambers, each chamber running its own miniature glowing machine room"),
    ('virtualiza',    "an engineer in a hall of mirrored glass chambers, each chamber running its own miniature glowing machine room"),
    ('cluster',       "twin server towers on a dark floor, one going dim as arcs of light leap across to its partner which brightens without pause"),
    ('dns',           "a switchboard operator at a vast wall of labeled sockets, tracing one glowing cord to its distant named port"),
    ('dhcp',          "a dispatcher at a tollgate handing each arriving dark vehicle a glowing numbered plate before waving it into the grid"),
    ('group policy',  "a broadcast tower atop a control hall pulsing rings of light outward, rows of distant terminals adjusting in unison as each ring passes"),
    ('iis',           "a night harbor master on a pier of glowing berths, streams of arriving lights docking and departing in ordered lanes"),
    ('remote deskt',  "a figure at a dark desk reaching into a life-size projection of a distant control room, their hands working controls that exist miles away"),
    ('certificate',   "a sealmaster in a vaulted chamber pressing a ring into molten light, chains of archived seals hanging away into the dark"),
    ('replication',   "two distant lit citadels on a dark plain exchanging synchronized pulses along a single bright causeway"),
    ('firewall',      "a warden before a wall of flame-colored light, opening one narrow gate as queued shapes pass and others are turned away"),
    ('powershell',    "a scribe typing at a raised console as lines of light run out across the floor and machines execute each line in sequence down the hall"),
    ('troubleshoot',  "an engineer kneeling in a half-lit aisle tracing a broken run of light back along a cable to a dark junction, toolkit open"),
    ('failsafe',      "a lone operator sealed in a drill chamber as the room reconfigures around them, warning lights cycling from red toward green"),
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
