import os, io, requests, fal_client
from PIL import Image
from ch2_8_specs import BASE, NOTEXT

# The floating "UI panel" furniture Imagen adds by default is where the garbled words keep
# appearing (EASY / ESY PART, WAT WHO). Banning the panels themselves works better than banning
# the text on them.
NOPANELS = ("\n\nDo NOT include any floating user-interface panels, dashboards, holographic "
            "screens, charts, graphs or monitor rectangles anywhere in the scene. No UI furniture "
            "at all. Only the physical objects described above, on an empty dark background.")

JOBS = {
 "ch3-01-authn-vs-authz": (
   "Scene: one traveller, two completely different barriers, one after the other.\n\n"
   "A single traveller character in a blue jacket walks left to right along a plain path.\n\n"
   "FIRST barrier (left): a tall smooth archway that projects a bright cyan scanning beam down onto "
   "the traveller's face. Floating beside the arch, a large portrait medallion of that same face, "
   "glowing, being compared to them. Nothing else. This barrier is about identity.\n\n"
   "SECOND barrier (right): a completely different heavy amber door, its whole surface covered in a "
   "regular grid of many small keyholes. Almost every keyhole is dark and plated over; exactly TWO "
   "glow open. A small robot stands before it holding up a plain metal tag with two notches cut in "
   "it -- no writing on the tag, just two notches.\n\n"
   "The traveller has passed the cyan arch and is stopped at the amber door with one hand raised."),

 "ch4-02-encryption-checkbox": (
   "Scene: two objects, absurdly out of proportion, and nothing else.\n\n"
   "In the FOREGROUND, tiny: a small wooden tick-box on a low stand with a bright green check mark "
   "already painted in it. A small human engineer's hand rests on it, having just finished. It is "
   "trivially small.\n\n"
   "Behind it, filling almost the entire frame and towering over everything, a COLOSSAL monolithic "
   "stone slab with an enormous KEYHOLE cut through it, glowing warm amber from deep inside. The "
   "keyhole alone is many times the height of a person.\n\n"
   "One tiny human engineer stands at the base of the monolith, head tilted right back, looking up "
   "at the keyhole.\n\n"
   "Only three things exist in this picture: the little tick-box, the giant keyhole monolith, and "
   "the small figure. Empty dark ground everywhere else."),

 "ch8-03-audit-boundary": (
   "Scene: an inspector standing exactly on a dividing line.\n\n"
   "ONE tall isometric tower stands in the centre of the frame, built of stacked blocks. A THICK "
   "GLOWING WHITE HORIZONTAL BAND cuts straight across the tower at its middle, wrapping right "
   "around it, unmistakable.\n\n"
   "Everything BELOW the band is warm AMBER GOLD, sealed and finished, with small amber robots "
   "tending it and a neat stack of closed folders beside it.\n\n"
   "Everything ABOVE the band is COOL BLUE and open, with scaffolding and a human engineer in a "
   "blue jacket working on it, and an EMPTY tray beside it, conspicuously bare.\n\n"
   "Standing directly ON TOP OF the glowing band itself, balanced on the line, a tall INSPECTOR "
   "character in a long formal coat and hat holds a large plain clipboard. One arm points DOWN at "
   "the amber half, the other arm points UP at the blue half. The inspector is the focal point and "
   "is clearly standing on the boundary, not on the ground.\n\n"
   "The folders below are neatly stacked; the tray above is empty."),
}

for slug, body in JOBS.items():
    res = fal_client.subscribe('fal-ai/imagen3', arguments={
        'prompt': BASE + body + NOTEXT + NOPANELS, 'aspect_ratio': '16:9'})
    img = Image.open(io.BytesIO(requests.get(res['images'][0]['url'], timeout=180).content)).convert('RGB')
    img.save(slug + '.webp', 'webp', quality=92, method=6)
    print(' regenerated', slug, os.path.getsize(slug + '.webp')//1024, 'KB')
