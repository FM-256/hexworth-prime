#!/usr/bin/env python3
"""
Re-render the three CH1 stills Chris blocked on.

02  rendered "SERVIICE" and garbled shelf labels, AND drew a STAFFED approval desk --
    the opposite of the slide's point (nobody approves it). Root cause of the text:
    words like "vending machine", "shop", "counter" invite signage. Removed every noun
    that implies a sign, and made the empty desk the loudest thing in the frame.
02/04 also falsify my "text-free" claim, which is the v2 failure this platform's
    standard exists to ban. Prompts now enumerate the specific surfaces that must stay
    blank rather than issuing one blanket instruction the model ignores.
06  is regenerated WITHOUT the dividing band. Kling would not move the band (measured:
    ~24px of drift over 5s, imperceptible), so the band becomes a DOM element that
    slides -- geometry I control and can measure, same reasoning as the .ov-band titles.
"""
import os, io, sys, requests, fal_client
from PIL import Image

BASE = ("Educational infographic illustration in the style of Dan Nanni / Cyber Edition "
        "cybersecurity educators on social media. Richly illustrated isometric scene, warm "
        "and characterful. BOLD, HIGH CONTRAST, few large elements -- projected on a "
        "classroom wall, must read from the back row. Dark navy background (#0b1220), faint "
        "technical grid floor, soft cyan rim light. Generous empty margins.\n\n")

NOTEXT = ("\n\nCRITICAL -- THE IMAGE MUST CONTAIN NO WRITING OF ANY KIND. No words, no "
          "letters, no numbers, no labels, no captions, no signs, no signboards, no name "
          "plates, no banners, no posters, no menus, no price tags, no screen text, no "
          "keyboard letters, no book text, no speech bubbles, no logos, no watermark, no "
          "decorative lettering, no fake or nonsense lettering. Every screen is blank or "
          "shows only abstract coloured shapes. Every panel, box, sign and surface is "
          "completely blank. Pure wordless illustration. 16:9 landscape.")

JOBS = {
 # slide 3 -- NIST / self-service. The EMPTY desk is the teaching point.
 'ch1-02-self-service': BASE + (
   "Scene: anyone may simply take what they want, and the post that should stop them is "
   "abandoned.\n\n"
   "On the RIGHT, a tall open storage rack of glowing cyan cubes on plain shelves, standing "
   "open with no doors and no barrier. THREE separate human figures are each reaching in and "
   "lifting a glowing cube straight off a shelf at the same time, unhindered and casual. They "
   "do not look at each other -- they are strangers taking from the same rack.\n\n"
   "On the LEFT, and this must be unmistakable, an ABANDONED checkpoint: a plain desk with an "
   "EMPTY swivel chair turned away at an angle, NOBODY sitting at it and NOBODY standing near "
   "it. The desk surface is bare. A small unlit lamp sits dark on it. A velvet rope barrier in "
   "front of the desk hangs UNHOOKED and slack, one post fallen over on the floor, so the path "
   "past the desk is wide open. A thin layer of dust and a cobweb on the chair. Absolutely no "
   "person anywhere near this desk.\n\n"
   "Colour: cold dead grey and deep shadow on the abandoned desk, bright cyan on the rack and "
   "the cubes being taken." + NOTEXT),

 # slide 5 -- service models
 'ch1-04-service-models': BASE + (
   "Scene: three work benches in a row, showing how much work is left to the person.\n\n"
   "Three plain isometric work benches, equal size, evenly spaced, no signs and no boards "
   "anywhere.\n\n"
   "LEFT bench: covered in raw unprocessed materials -- sacks, loose parts, an unlit burner, "
   "tools scattered everywhere. One human engineer in a blue jacket works hard here, sleeves "
   "rolled up, clearly busy, surrounded by unfinished work. No robots help.\n\n"
   "MIDDLE bench: half-prepared components sit tidily in plain bowls, a burner is lit. The "
   "same human engineer stands here doing much less, simply assembling. Two amber robots do "
   "the rest.\n\n"
   "RIGHT bench: one finished covered dish under a plain metal dome, complete. The human "
   "engineer here stands upright with hands relaxed, doing no work at all -- but holds a "
   "single large glowing EMERALD GREEN key in one hand and a glowing EMERALD GREEN ID card in "
   "the other, held close to the chest. Six amber robots do everything around them.\n\n"
   "Colour: BLUE for the human's own labour, AMBER for the robots, and the key and card glow "
   "EMERALD GREEN -- the part never handed over." + NOTEXT),

 # slide 7 -- shared responsibility, NO BAND (the band is added as a moving DOM element)
 'ch1-06-tower-nobands': BASE + (
   "Scene: one tall tower standing on an unbroken foundation.\n\n"
   "ONE single large isometric tower stands in the exact centre of the frame, built of four "
   "chunky stacked layers of equal height: a heavy vault block at the bottom, a server rack "
   "above it, a machinery module above that, and a small plain awninged storefront at the top. "
   "The tower is UNIFORM WARM AMBER GOLD from top to bottom -- one single colour, evenly lit. "
   "There is NO horizontal stripe, NO band of light, NO glowing line and NO dividing mark "
   "anywhere on the tower. Its surface is clean and unbroken.\n\n"
   "Small amber robot caretakers tend the lower half and a small human engineer in a blue "
   "jacket works on scaffolding at the upper half.\n\n"
   "Beneath the tower, spanning the FULL WIDTH of the image as one single continuous EMERALD "
   "GREEN vault slab, sits the foundation -- visibly one unbroken slab, never divided. "
   "Standing on the green slab, evenly spaced and clearly separated: a glowing ID badge with a "
   "keyhole, a stack of sealed crates with closed padlocks, and a control panel with dials. A "
   "human engineer in a blue jacket stands among them with arms spread protectively.\n\n"
   "Leave clear empty dark space to the left and right of the tower." + NOTEXT),
}

def main():
    if not os.environ.get('FAL_KEY'):
        sys.exit('FAL_KEY not in env')
    for slug, prompt in JOBS.items():
        print('---', slug)
        res = fal_client.subscribe('fal-ai/imagen3', arguments={
            'prompt': prompt, 'aspect_ratio': '16:9'})
        img = Image.open(io.BytesIO(requests.get(res['images'][0]['url'], timeout=180).content)).convert('RGB')
        img.save(slug + '.webp', 'webp', quality=92, method=6)
        print('   %s  %dx%d  %d KB' % (slug, img.size[0], img.size[1],
                                       os.path.getsize(slug + '.webp') // 1024))
main()
