#!/usr/bin/env python3
"""
Visual specs for CSE lecture chapters 2-8 (27 slides).

Lessons already paid for, applied here from the start:
  * TEXT-FREE, enumerated. A blanket "no text" is ignored; naming the surfaces that must
    stay blank is what worked. Every word on screen is DOM text, so nothing can garble.
  * NO SIGN-IMPLYING NOUNS. "shop", "kitchen", "vending machine", "storefront" all invited
    signage and produced "SERVIICE" / "DIVODIN EIERY" in the CH1 first pass.
  * BOLD AND FEW. This is projected on a classroom wall behind a talking professor and has
    to read from the back row -- not studied up close.
  * The picture must teach the point ALONE (Clause A). Where a scene could read as its own
    opposite -- a staffed desk where the point is that nobody is there -- say the negative
    explicitly and loudly.
  * Three visuals are REUSED from the already-reviewed set rather than regenerated: the
    identity census, the wide-open door, and the supply-chain pile.
"""

BASE = ("Educational infographic illustration in the style of Dan Nanni / Cyber Edition "
        "cybersecurity educators on social media. Richly illustrated isometric scene, warm and "
        "characterful. BOLD, HIGH CONTRAST, FEW LARGE ELEMENTS -- projected on a classroom wall, "
        "must read from the back row. Dark navy background (#0b1220), faint technical grid floor, "
        "soft cyan rim light. Generous empty margins.\n\n")

NOTEXT = ("\n\nCRITICAL -- NO WRITING ANYWHERE IN THE IMAGE. No words, letters, numbers, labels, "
          "captions, signs, signboards, name plates, banners, posters, price tags, screen text, "
          "book text, speech bubbles, logos, watermarks, and no fake or nonsense lettering. Every "
          "screen and panel is blank or shows only abstract coloured shapes. Pure wordless "
          "illustration. 16:9 landscape.")

# slug -> (prompt_body, [beats], animate_prompt or None)
SPECS = {
# ─────────────────────────── CH2 · Cloud Security Fundamentals ───────────────────────────
"ch2-01-perimeter-dissolves": (
  "Scene: an old defence failing while a new one holds.\n\n"
  "On the LEFT, a huge ancient stone castle wall, cracked and CRUMBLING, its blocks falling away "
  "and dissolving into dust at the base. It guards nothing -- the ground behind it is open and "
  "empty. A tiny confused guard stands beside it with a spear, facing the wrong way.\n\n"
  "On the RIGHT, standing alone with no wall at all, a single enormous glowing EMERALD GREEN ID "
  "badge with a keyhole, upright like a monolith, with a bright beam of light scanning each small "
  "figure that approaches it. Some figures pass through the beam; one is stopped by it and turned "
  "back. The badge is clearly the real gate now.\n\n"
  "Colour: dead grey for the crumbling wall, brilliant emerald and cyan for the identity gate.",
  ["The wall stopped being the control", "Identity is the new perimeter", "Every request is checked, not just the edge"], None),

"ch2-02-speed-symmetry": (
  "Scene: how fast the whole world can be searched.\n\n"
  "A large glowing globe of the planet floats in the centre, wrapped in a fine grid. From a small "
  "dark spot on its surface, a bright RED SWEEPING BEAM fans out and rakes across the entire globe "
  "like a radar sweep, and everywhere the beam touches, tiny server nodes light up -- hundreds of "
  "them, in an instant, all over the planet.\n\n"
  "A handful of the lit nodes flash a brighter alarm red and have a small open padlock beside them: "
  "the exposed ones the sweep just found.\n\n"
  "In the far corner, one small human defender character sits at a single console, dwarfed by the "
  "scale of the sweep, working on one node at a time.\n\n"
  "The contrast between the instant global sweep and the one slow defender must be obvious.",
  ["Same attackers, new terrain", "They scan the whole internet in minutes", "You defend one estate, by hand"], None),

"ch2-03-misconfiguration": (
  "Scene: nobody had to break in.\n\n"
  "A colossal armoured bank vault door dominates the frame -- thick steel, heavy hinges, a huge "
  "spoked wheel, deep bolt holes. It is INTACT and UNDAMAGED, its lock mechanism perfect and "
  "untouched, gleaming. But the door STANDS WIDE OPEN, swung fully back, and warm light spills out "
  "of the open doorway.\n\n"
  "On the ground in the foreground, a crowbar, a drill and a set of lock picks lie abandoned in the "
  "dust, clearly unused, with a faint cobweb between them.\n\n"
  "A single small shadowy figure simply strolls in through the open door with hands in pockets, "
  "completely relaxed. No forcing, no struggle, no alarm.\n\n"
  "Colour: cold steel for the perfect lock, warm amber spilling from the open doorway, dull grey "
  "for the discarded tools.",
  ["Not exotic exploits", "A default nobody changed", "The lock was never the weak part"], None),

"ch2-04-cia-triad": (
  "Scene: three heavy pillars, each protecting something different.\n\n"
  "Three large isometric stone pillars stand side by side, equal height, evenly spaced, each with a "
  "single clear object resting on top:\n"
  "LEFT -- a sealed crate wrapped in chains with a heavy closed padlock, glowing cool blue.\n"
  "CENTRE -- a crate with an intact wax seal and a delicate glass dome over it, glowing amber; a "
  "tiny robot inspects the seal with a magnifier.\n"
  "RIGHT -- a crate with THREE separate glowing cables running to it from three different "
  "directions, one of which is visibly cut and sparking while the other two still carry light, "
  "glowing emerald green.\n\n"
  "Each pillar casts its own coloured light pool on the grid floor.",
  ["Confidentiality: who can read it", "Integrity: has it been altered", "Availability: can you still reach it"], None),

# ─────────────────────────── CH3 · Identity and Access ───────────────────────────
"ch3-01-authn-vs-authz": (
  "Scene: two completely different gates, one after the other.\n\n"
  "A traveller character in a blue jacket walks a path from left to right through TWO separate "
  "checkpoints, clearly distinct.\n\n"
  "FIRST gate (nearer, left): a tall arch with a glowing face-scanning beam and a large ID badge "
  "symbol above it. The traveller's face is lit by the scan. This gate only compares the person to "
  "a portrait held beside it -- it is about WHO.\n\n"
  "SECOND gate (further, right): a completely different heavy door with many separate small "
  "keyholes in a grid across it, most of them blanked out and dark, only two glowing open. A small "
  "robot clerk holds up a punched permission card with only a few holes in it. This gate is about "
  "WHAT MAY BE DONE.\n\n"
  "The traveller has cleared the first gate and is being stopped at the second, one hand raised.\n\n"
  "Colour: cyan for the identity gate, amber for the permission gate.",
  ["Authentication: who are you", "Authorisation: what may you do", "Passing the first is not passing the second"], None),

"ch3-03-least-privilege": (
  "Scene: cutting a huge keyring down to almost nothing.\n\n"
  "On the LEFT, an enormous overloaded keyring bristling with dozens and dozens of glowing amber "
  "keys of every size, so heavy that the small human engineer holding it is bent double under the "
  "weight, straining.\n\n"
  "An arrow of motion leads to the RIGHT, where the SAME engineer stands upright, relaxed and "
  "confident, holding a small ring with just TWO keys on it, glowing bright emerald green.\n\n"
  "Between them, a grinding wheel throws sparks as discarded keys are destroyed, and a large pile "
  "of removed dull-grey keys heaps on the floor beneath it.\n\n"
  "The size contrast between the two keyrings must be dramatic.",
  ["Start at zero, not at convenient", "Add a permission only on evidence", "Every key you keep is a key that can leak"], None),

"ch3-04-iam-failures": (
  "Scene: a wall of locks, and the few that were never really locked.\n\n"
  "A vast wall fills the frame, covered in a regular grid of many small keyholes, most of them dark, "
  "closed and quiet.\n\n"
  "But scattered across the wall, FOUR keyholes stand out, each glowing hot alarm RED with a key "
  "LEFT PERMANENTLY IN IT, hanging there abandoned:\n"
  "- one key is furred with dust and cobwebs, clearly untouched for years\n"
  "- one keyhole is enormous compared to the others, a gaping oversized opening a whole arm could "
  "pass through\n"
  "- one has a small cracked shield lying broken on the floor beneath it\n"
  "- one has a bright trail of light leading away from it into the dark, as if something already "
  "walked out\n\n"
  "A small shadowy figure reaches toward the oversized keyhole.",
  ["Long-lived keys nobody rotates", "Wildcard permissions", "Admin accounts without MFA", "A leaked key IS the breach"], None),

# ─────────────────────────── CH4 · Data Protection ───────────────────────────
"ch4-01-three-states": (
  "Scene: the same object, protected three different ways.\n\n"
  "THREE identical glowing data crates, evenly spaced left to right, each in a completely different "
  "situation:\n\n"
  "LEFT -- the crate sits deep inside a heavy sealed vault with a thick closed door, still and "
  "silent, lit cool blue.\n\n"
  "CENTRE -- the same crate travels along a moving conveyor inside a transparent armoured tube that "
  "glows amber, with motion streaks behind it; two small robots escort it along the tube.\n\n"
  "RIGHT -- the same crate sits OPEN on a workbench under a fragile glass dome, its contents glowing "
  "bright and exposed, while a human engineer works on it with tools. The dome is visibly thin and "
  "cracked in one place.\n\n"
  "The right crate must look the most vulnerable of the three.",
  ["At rest: in the vault", "In transit: on the move", "In use: open on the bench — the hard one"], None),

"ch4-02-encryption-checkbox": (
  "Scene: the easy part and the real part, wildly out of proportion.\n\n"
  "In the FOREGROUND, small and almost trivial, a single tick-box on a little stand with a bright "
  "green check already marked in it, and a tiny hand just lifting away from it. It looks effortless.\n\n"
  "Looming BEHIND it and dwarfing it completely, an ENORMOUS keyhole carved into a monolithic stone "
  "slab that fills most of the frame, glowing amber from within, far taller than the human figure "
  "standing at its base looking up at it.\n\n"
  "A tiny human engineer stands between the little tick-box and the giant keyhole, having finished "
  "the easy thing and now facing the huge one.\n\n"
  "The proportion is the whole picture: trivial box, monumental keyhole.",
  ["Ticking the box is easy", "The real question is who holds the key", "Encrypted by whom, from whom"], None),

"ch4-03-key-custody": (
  "Scene: one key that everything else hangs from.\n\n"
  "In the centre, inside a heavy glowing vault chamber with thick walls, ONE large master key floats "
  "upright, glowing brilliant amber. Thick chains of light run outward from it, and each chain ends "
  "at a smaller data crate outside the chamber -- a dozen crates arranged around it, all clearly "
  "held by those chains.\n\n"
  "A human engineer stands OUTSIDE the vault chamber at a control lever, hand resting on it. The "
  "lever is unmistakably connected to the chamber.\n\n"
  "On a few of the outer crates, the light in the chains has already gone dark and those crates have "
  "turned cold grey and sealed shut -- showing what happens when the chain stops glowing.\n\n"
  "The master key never leaves its chamber; only the chains reach out.",
  ["The key service holds it, not you", "Whoever can disable the key can dark every copy", "Key custody is data custody"],
  "The chains of light running from the central key to the outer crates pulse and flow outward "
  "steadily. One by one, a few of the outer crates lose their glow and turn dark grey as their chain "
  "goes out. The central key and the engineer stay still. Fixed camera, no zoom, no pan."),

"ch4-04-classification-lifecycle": (
  "Scene: sorting, then an ending.\n\n"
  "A wide conveyor system dominates the frame. Data crates arrive from the left and are sorted by a "
  "robot arm into THREE clearly different lanes, each glowing a different colour and stacked to a "
  "different height: a tall emerald lane, a medium amber lane, and a short red lane with the fewest "
  "but most heavily chained crates.\n\n"
  "At the FAR RIGHT, the conveyor runs into a bright furnace opening, and old dusty crates tip into "
  "it and burn away to nothing. A large mechanical timer dial with a single hand is mounted above "
  "the furnace, clearly driving it.\n\n"
  "One human engineer oversees the sorting arm; a robot tends the furnace.",
  ["Not all data is equal — say which is which", "Retention is a decision, not a default", "Deleting on schedule is a control"], None),

# ─────────────────────────── CH5 · Network Security ───────────────────────────
"ch5-01-blast-radius": (
  "Scene: an explosion that goes nowhere.\n\n"
  "A large grid of many separate walled cells seen from above at an isometric angle, like a "
  "honeycomb of thick-walled compounds, each containing a few small glowing servers.\n\n"
  "In ONE cell near the centre, a violent orange EXPLOSION is happening -- flames, debris, the "
  "servers inside blackened and destroyed. But the thick walls of that single cell are holding: the "
  "blast is completely contained, and scorch marks stop dead at the wall line.\n\n"
  "Every SURROUNDING cell is calm, intact and glowing peaceful cyan, its servers running normally, "
  "small robots working undisturbed just on the other side of the wall.\n\n"
  "In one corner of the frame, for contrast, a small area where the walls are MISSING between cells "
  "and the scorching has spread across three of them.",
  ["Assume something inside will fall over", "Segment so it cannot spread", "The question is how far, not whether"], None),

"ch5-02-sg-vs-nacl": (
  "Scene: two rings of defence at two different distances.\n\n"
  "In the exact centre, one single glowing server machine.\n\n"
  "Wrapped TIGHTLY around that machine, hugging it closely like a fitted collar, a bright EMERALD "
  "GREEN ring gate with a small guard robot standing in its only opening. It is clearly attached to "
  "the machine itself and would move with it.\n\n"
  "Much FURTHER OUT, a large AMBER perimeter wall encircling a wide area of ground that contains "
  "the machine and several other machines besides. It is clearly a boundary of the LAND, not of any "
  "one machine, with its own separate gatehouse.\n\n"
  "A packet of light travels inward: it passes the outer amber gate, then the inner green collar, "
  "and reaches the machine. A RETURN packet travels back outward, passes the green collar easily, "
  "and is STOPPED DEAD at the outer amber gate with a red barrier dropping in front of it.\n\n"
  "The difference in distance and in what each one surrounds must be obvious.",
  ["One rides on the machine", "One sits on the land around it", "Stateless means you must allow the way back"], None),

"ch5-04-private-path": (
  "Scene: two ways across, only one of them exposed.\n\n"
  "The frame is split by a wide, dark, storm-lashed sea full of small shadowy figures swimming and "
  "circling in the water, waves and lightning above it. This is the dangerous open crossing.\n\n"
  "ABOVE the water, a fragile exposed rope bridge crosses the sea, and a lone data crate being "
  "carried across it is watched hungrily by the figures below, several of them reaching up.\n\n"
  "BENEATH the sea floor, a sealed armoured TUNNEL runs straight between the two shores, glowing "
  "calm emerald green, completely enclosed, with data crates gliding through it smoothly and "
  "untouched. The shadowy figures in the water above are entirely unaware of it -- none of them look "
  "down.\n\n"
  "Both routes connect the same two shores.",
  ["The default route is public, even when encrypted", "A private path removes the audience", "Unreachable beats defended"], None),

# ─────────────────────────── CH6 · Application Security ───────────────────────────
"ch6-01-three-rs": (
  "Scene: three machines doing three different maintenance jobs on identical servers.\n\n"
  "Three work bays side by side, each with one glowing server and one robot doing something clearly "
  "different:\n\n"
  "LEFT bay -- the robot pulls an old dull key out of the server and pushes a fresh bright key in; a "
  "small heap of discarded old keys lies beside it.\n\n"
  "CENTRE bay -- the robot lifts the ENTIRE server away with a crane and lowers a brand-new "
  "identical one into the empty space; the old one is being carried off to a scrap pile, not "
  "repaired.\n\n"
  "RIGHT bay -- the robot welds a glowing patch plate over a visible crack in the server's casing, "
  "sparks flying.\n\n"
  "Each bay is lit a different colour: emerald, cyan, amber.",
  ["Rotate the secrets", "Repave the machine — rebuild, don't clean", "Repair the code", "Short-lived beats well-guarded"], None),

"ch6-02-testing-blindness": (
  "Scene: several inspectors examining the same building, each unable to see something.\n\n"
  "One large glowing building stands in the centre, cut away so both its INSIDE and OUTSIDE are "
  "visible at once. There is a visible crack in an interior wall and a separate visible crack on the "
  "exterior facade, and a third crack in the foundation underground.\n\n"
  "THREE inspector characters examine it, each clearly limited:\n"
  "- one stands INSIDE reading the interior walls closely, with a blindfold on, unable to see the "
  "outside at all\n"
  "- one stands OUTSIDE circling the facade with a magnifier, with a wall between them and the "
  "interior\n"
  "- one crouches at ground level, unable to reach the foundation crack below\n\n"
  "Each inspector has found ONE crack and glows where they are looking; the cracks nobody is looking "
  "at glow angry red and unattended.",
  ["Static reads the code, not the running thing", "Dynamic pokes the running thing, not the code", "Every method is blind somewhere"], None),

"ch6-03-shift-left": (
  "Scene: the same small flaw getting catastrophically more expensive.\n\n"
  "A wide descending staircase of FOUR large steps runs from upper left to lower right. On each step "
  "stands the SAME small red bug creature, identical each time -- but what it costs grows "
  "monstrously:\n\n"
  "STEP 1 (highest) -- the bug sits next to a single small coin, and one engineer flicks it away "
  "with a finger, casually.\n"
  "STEP 2 -- the bug beside a small stack of coins; two engineers work on it.\n"
  "STEP 3 -- the bug beside a heavy chest of coins; a whole team surrounds it with tools.\n"
  "STEP 4 (lowest) -- the SAME small bug beside an ENORMOUS mountain of coins that towers over the "
  "entire scene, with a crowd of tiny exhausted figures at its base and warning lights flashing.\n\n"
  "The bug never changes size. Only the cost does, and the final one must be absurdly, comically huge.",
  ["The same flaw, found later", "Cost is not linear — it explodes", "Shift left is an economics argument, not a virtue"], None),

# ─────────────────────────── CH7 · Monitoring and Incident Response ───────────────────────────
"ch7-01-three-telemetry": (
  "Scene: three very different instruments reading one machine.\n\n"
  "One large glowing server machine stands in the centre. Three completely different instruments are "
  "attached to it, each held by its own small robot, each producing a different kind of output:\n\n"
  "LEFT -- a heavy ledger-stamping machine that punches a row of identical stamped marks onto a long "
  "unrolling ribbon of paper; every action leaves one mark. Glowing emerald.\n\n"
  "CENTRE -- a firehose nozzle gushing an overwhelming torrent of tiny glowing droplets into an "
  "overflowing basin, far more than anyone could catch. Glowing cyan.\n\n"
  "RIGHT -- a single large clean gauge dial with one needle, currently swinging sharply into a red "
  "zone. Glowing amber.\n\n"
  "The three outputs must look nothing like each other.",
  ["Audit: who did what", "Logs: what happened inside — and there is too much", "Metrics: a spike is often the first signal"], None),

"ch7-02-acronym-fog": (
  "Scene: fog lifting off a row of tools.\n\n"
  "A thick grey-blue FOG BANK fills the left half of the frame, dense and formless, with vague "
  "confusing shapes barely visible inside it.\n\n"
  "Moving to the RIGHT, the fog thins and lifts, revealing a clean lit shelf on which FIVE clearly "
  "distinct tools stand in a row, each a different obvious shape and each glowing its own colour: a "
  "magnifying lens over a stack of ribbons, a mechanical arm mid-action, a clipboard-and-checklist "
  "frame, a shield over a running machine, and a wide net drawn over all of them.\n\n"
  "A human engineer stands at the boundary between fog and clarity, reaching in and lifting the last "
  "of the fog away like a sheet.\n\n"
  "The left must feel like confusion and the right like relief.",
  ["Different tools, different jobs", "Most overlap less than the marketing suggests", "Name the job, then the acronym"], None),

"ch7-03-ephemeral-evidence": (
  "Scene: the evidence is disappearing while you look at it.\n\n"
  "In the centre, one glowing server machine is visibly EVAPORATING -- its lower half still solid, "
  "its upper half breaking apart into rising motes of light that fade into the dark. It is "
  "vanishing, not exploding.\n\n"
  "A detective character with a camera stands close, urgently photographing it, and a bright frozen "
  "SNAPSHOT of the machine -- a solid, complete, glowing copy inside a heavy frame -- already stands "
  "safely beside them on a plinth, captured in time.\n\n"
  "Behind them, a robot's hand hovers over a large red terminate lever, about to pull it.\n\n"
  "The contrast is between the machine dissolving and the snapshot standing solid and preserved.",
  ["The instance can vanish in seconds", "Snapshot before you terminate", "Containment is an API call — so is destroying the evidence"], None),

# ─────────────────────────── CH8 · Risk and Governance ───────────────────────────
"ch8-01-risk-sentence": (
  "Scene: parts assembling into one thing, and a colour falling out at the end.\n\n"
  "FOUR distinct illustrated blocks float on the left, each a clearly different object: a small "
  "shadowy figure, a cracked shield, a treasure chest, and a pair of scales. They are being drawn "
  "together along glowing tracks toward the centre.\n\n"
  "In the CENTRE they lock together into ONE solid assembled bar of light, complete and whole.\n\n"
  "Only at the FAR RIGHT, at the very end of that assembled bar, a single small coloured chip drops "
  "out of a slot like a coin from a machine and lands in a tray -- an OUTPUT, small and last.\n\n"
  "The four blocks and the assembled bar are large and dominant; the coloured chip at the end is "
  "small. The direction of flow is unmistakably left to right.",
  ["Threat, weakness, asset, likelihood", "The rating is the output — never the input", "Accept is a real answer, if someone owns it"], None),

"ch8-02-compliance-is-not-security": (
  "Scene: a certificate on the wall and an open door beside it.\n\n"
  "On the LEFT, mounted proudly on a wall in an ornate gilt frame with a ribbon and a wax seal, a "
  "blank certificate, brightly spot-lit, immaculate. A small figure stands admiring it with hands "
  "clasped.\n\n"
  "Immediately to the RIGHT of that same wall, barely a step away, a doorway STANDS WIDE OPEN with "
  "no door in it at all, and a dark corridor beyond. A shadowy figure is stepping through it, "
  "completely ignored, passing within arm's reach of the admiring figure.\n\n"
  "Nobody is looking at the doorway. All the light is on the certificate.\n\n"
  "The certificate must be blank -- no writing, no seal text, no lettering of any kind.",
  ["A certificate is a point in time", "It proves a control existed, not that it works", "And you still need it — just do not confuse the two"], None),

"ch8-03-audit-boundary": (
  "Scene: the same dividing line from chapter one, now with an inspector standing on it.\n\n"
  "One tall isometric tower stands in the centre, divided by a THICK GLOWING HORIZONTAL BAND across "
  "its middle. Everything BELOW the band is warm amber gold and sealed, tended by small robots. "
  "Everything ABOVE the band is cool blue and open, with a human engineer working on it.\n\n"
  "Standing directly ON the glowing band itself, balanced right at the dividing line, an INSPECTOR "
  "character in a formal coat holds a large clipboard and points with one hand DOWN at the amber "
  "half and with the other hand UP at the blue half -- asking about both.\n\n"
  "Beside the amber half, a neat stack of sealed folders is being handed up by a robot. Beside the "
  "blue half, an empty tray waits, conspicuously unfilled, with the human engineer looking at it "
  "with concern.\n\n"
  "The inspector standing exactly on the line is the focal point.",
  ["The provider's evidence you inherit", "Your half you must produce yourself", "The line moves the paperwork too"], None),

"ch8-04-guardrails": (
  "Scene: what actually stops the vehicle.\n\n"
  "On the LEFT, a towering, teetering stack of dusty binders and paper folders, far taller than the "
  "small human beside it, leaning dangerously. A vehicle drives straight PAST the stack without "
  "slowing, and one binder topples off unnoticed. The paperwork changes nothing.\n\n"
  "On the RIGHT, the same vehicle meets a set of solid, heavy, glowing EMERALD GREEN physical "
  "GUARDRAILS along a curve of road. The vehicle is firmly deflected back onto the road by them, "
  "sparks where it touched, unable to leave the path. The rails are strong and obviously effective.\n\n"
  "Same road, same vehicle, two very different outcomes.",
  ["A policy nobody can violate beats a policy nobody reads", "Make the wrong thing impossible", "Guardrails are code, not paper"], None),
}

REUSED = {
  "ch3-02-identity-census":     ("/assets/images/cse-visuals/ch3/identity-census.webp",
     ["Machines outnumber people many times over", "They hold most of the privilege", "None of them can carry MFA"]),
  "ch5-03-open-to-the-world":   ("/assets/images/cse-visuals/ch5/open-to-the-world.webp",
     ["One narrow door, one open to everyone", "It succeeds silently — no warning", "Every rule answers two questions: port AND source"]),
  "ch6-04-supply-chain":        ("/assets/images/cse-visuals/ch6/supply-chain-iceberg.webp",
     ["Most of what you ship, strangers wrote", "The base image is the bulk of it", "Known flaws are already inside the pile"]),
}

def prompt_for(slug):
    return BASE + SPECS[slug][0] + NOTEXT
