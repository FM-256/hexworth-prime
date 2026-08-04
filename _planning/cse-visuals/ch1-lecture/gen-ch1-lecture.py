#!/usr/bin/env python3
"""
CH1 lecture-deck visuals -- 6 slides.

These are PROJECTION aids, not reading aids. The professor talks; the slide shows.
That changes the routing from the earlier reading-deck build: precision stops being
the constraint (nobody studies a projected diagram mid-lecture) and legibility at
distance plus motion start being the constraint.

Text-free throughout. The deck supplies the title and beats as DOM text, so nothing
here needs in-image labels -- which is also what keeps Imagen 3 from garbling.
"""
import os, io, sys, requests, fal_client
from PIL import Image

BASE = ("Educational infographic illustration in the style of Dan Nanni / Cyber Edition "
        "cybersecurity educators on social media. Richly illustrated isometric scene, warm "
        "and characterful. BOLD, HIGH CONTRAST, few large elements -- this is projected on a "
        "classroom wall and must read from the back row. Dark navy background (#0b1220), "
        "faint technical grid floor, soft cyan rim light. Generous empty margins.\n\n")

NOTEXT = ("\n\nABSOLUTELY NO TEXT. No words, letters, numbers, labels, captions, legends, "
          "signage or lettering anywhere. No writing on any screen, crate, sign or badge. "
          "Completely free of written characters. Pure illustration. 16:9 landscape.")

JOBS = {
 # 1 -- "Someone else's computer, and why that answer fails"   [ANIMATE]
 'ch1-01-control-plane': BASE + (
   "Scene: a joke on the left, the reality on the right, with a hard size contrast.\n\n"
   "LEFT, small and mundane: a single ordinary beige desktop computer sitting alone on a "
   "plain desk, dimly lit, with a small padlock on it. It looks unremarkable and lonely.\n\n"
   "RIGHT, dominating the frame: one glowing cyan hexagonal API portal floating upright like "
   "a gateway, and BURSTING outward from it in a wide radiating fan, dozens upon dozens of "
   "small glowing server cubes streaming into the distance -- an army of machines being born "
   "from the portal in one motion. The stream is dense, energetic, and clearly endless.\n\n"
   "A small human engineer character stands calmly at a floating control podium in front of "
   "the portal with one hand raised, having just triggered the burst. The scale difference "
   "between the one desktop and the exploding fleet must be dramatic.\n\n"
   "Colour: dim grey-beige for the lonely desktop, brilliant cyan and white energy for the "
   "portal and the server swarm." + NOTEXT),

 # 2 -- "The NIST definition, one clause at a time"
 'ch1-02-self-service': BASE + (
   "Scene: a self-service vending wall with nobody minding it.\n\n"
   "A huge isometric vending machine wall of glowing compute resources -- rows of illuminated "
   "cyan server cubes, storage drums and network nodes behind glass, like stock in a machine.\n\n"
   "In FRONT of it, one human engineer character simply reaching out and taking a glowing cube "
   "directly off the shelf, unhindered. Beside them, an EMPTY service desk with an unoccupied "
   "chair, a dark unlit lamp and a small closed service bell -- conspicuously nobody there to "
   "approve anything. A thin cyan queue rope hangs slack and unused.\n\n"
   "To one side, two other small figures are taking cubes at the same time from the same wall, "
   "showing the pool is shared between strangers.\n\n"
   "Colour: cyan for available resource, warm amber glow on the taken cube, cold grey on the "
   "abandoned approval desk." + NOTEXT),

 # 3 -- "Five essential characteristics"
 'ch1-03-five-characteristics': BASE + (
   "Scene: five large distinct illustrated pedestals in a row, four of them cracked, one solid.\n\n"
   "Five chunky isometric pedestals stand side by side, evenly spaced, each carrying a single "
   "large clear object:\n"
   "1. a self-service push button on a stand\n"
   "2. a glowing globe wrapped in signal rings\n"
   "3. two identical adjacent boxes sharing one floor slab\n"
   "4. a stack of cubes visibly multiplying upward\n"
   "5. a large clean gauge dial with a needle\n\n"
   "The FIRST FOUR pedestals are lit in warm AMBER and each has a visible red crack running "
   "through its base, faintly unstable. The FIFTH pedestal, with the gauge, is lit in strong "
   "EMERALD GREEN, solid, uncracked, with a small shield resting against it.\n\n"
   "The contrast between four cracked amber and one solid green must be immediate." + NOTEXT),

 # 4 -- "Service models are a division of labour"
 'ch1-04-service-models': BASE + (
   "Scene: three kitchens side by side, showing how much work is left to you.\n\n"
   "Three isometric kitchen counters in a row, equal size, evenly spaced.\n\n"
   "LEFT counter: raw ingredients everywhere -- sacks, vegetables, an unlit stove, tools "
   "scattered. A human engineer character in a blue apron works hard here, sleeves up, busy, "
   "surrounded by unfinished work.\n\n"
   "MIDDLE counter: a lit stove and prepared components ready in bowls. The same engineer "
   "stands here doing less, just assembling, more relaxed.\n\n"
   "RIGHT counter: a finished covered dish under a cloche, plated and ready. The engineer here "
   "stands with hands in pockets, doing nothing at all -- but still holding a single glowing "
   "key and an ID badge close to their chest.\n\n"
   "Amber robot staff do the work not being done by the human: almost none on the left, some "
   "in the middle, swarming on the right.\n\n"
   "Colour: BLUE for the human's own labour, AMBER for the provider's robots, and the key and "
   "badge on the right glow EMERALD -- the part never handed over." + NOTEXT),

 # 5 -- "Deployment models, and the seam"
 'ch1-05-deployment-seam': BASE + (
   "Scene: two very different territories bolted together, with a glowing crack at the join.\n\n"
   "LEFT: a vast open public plaza of identical glowing cyan server towers stretching to the "
   "horizon, busy with many tiny figures moving between them -- clearly shared and enormous.\n\n"
   "RIGHT: a single walled private compound with a heavy stone perimeter, containing only a few "
   "server towers and one lone figure. Smaller, enclosed, quieter.\n\n"
   "BETWEEN THEM, running vertically down the centre of the image, a narrow BRIDGE SEAM where "
   "the two territories are bolted together with visible rivets and clamps. The seam GLOWS "
   "HOT RED-ORANGE, and a thin crack of red light runs down it. A few small shadowy figures "
   "are gathered right at the seam, probing it, while nobody watches either side.\n\n"
   "The eye must be drawn to the seam, not to either territory." + NOTEXT),

 # 6 -- "Shared responsibility"                                [ANIMATE]
 'ch1-06-shared-responsibility': BASE + (
   "Scene: one tall tower with a glowing dividing line, and an unbreakable foundation.\n\n"
   "ONE single large isometric tower stands in the centre of the frame, built of four chunky "
   "stacked layers: a heavy vault block at the bottom, a server rack, a glowing runtime module, "
   "and a small shop-front with an awning at the top.\n\n"
   "A THICK GLOWING HORIZONTAL DIVIDING BAND cuts across the tower near its MIDDLE, bright and "
   "unmistakable, like a band of light wrapped around the building. Below the band the tower is "
   "warm AMBER GOLD, sealed and finished, with small closed padlocks and tiny amber robot "
   "caretakers tending it. Above the band the tower is COOL BLUE, open, with scaffolding and a "
   "human engineer character actively working on it.\n\n"
   "Beneath the whole tower, spanning the full width of the image as one unbroken EMERALD GREEN "
   "vault slab, sits the foundation. Standing on the green slab: a glowing ID badge with a "
   "keyhole, a stack of sealed data crates, and a control panel with dials. A second human "
   "engineer character stands among them with arms spread protectively.\n\n"
   "Colour: AMBER below the band = handled for you. BLUE above = your work. GREEN foundation = "
   "yours always." + NOTEXT),
}


def main():
    if not os.environ.get('FAL_KEY'):
        sys.exit('FAL_KEY not in env')
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for slug, prompt in JOBS.items():
        if only and only != slug:
            continue
        print('---', slug)
        res = fal_client.subscribe('fal-ai/imagen3', arguments={
            'prompt': prompt, 'aspect_ratio': '16:9'})
        url = res['images'][0]['url']
        img = Image.open(io.BytesIO(requests.get(url, timeout=180).content)).convert('RGB')
        out = slug + '.webp'
        img.save(out, 'webp', quality=92, method=6)
        print('   saved %s  %dx%d  %d KB' % (out, img.size[0], img.size[1],
                                             os.path.getsize(out) // 1024))
        # keep the PNG-quality original around for the animation step
        img.save(slug + '.png')


main()
