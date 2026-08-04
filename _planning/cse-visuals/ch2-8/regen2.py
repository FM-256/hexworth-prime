import os, io, requests, fal_client
from PIL import Image
from ch2_8_specs import BASE, NOTEXT

# Both failures put CURSIVE SCRAWL on a paper surface -- a ledger ribbon and a sheet on a
# binder stack. Paper is the surface that most strongly implies writing, so the fix is the
# same as the UI-panel one: describe the surface as explicitly blank and give it a
# non-letterform alternative to carry, rather than restating "no text" harder.
NOSCRAWL = ("\n\nEVERY sheet of paper, ribbon, page, label and document in this image is "
            "COMPLETELY BLANK -- no handwriting, no cursive, no scrawl, no wavy lines "
            "imitating writing, no rows of text, no letterforms of any kind. Paper surfaces "
            "are plain empty colour.")

JOBS = {
 "ch7-01-three-telemetry": (
   "Scene: three very different instruments reading one machine.\n\n"
   "One large glowing server machine stands in the centre. Three completely different "
   "instruments are attached to it, each tended by its own small robot:\n\n"
   "LEFT -- a heavy mechanical stamping press punching a row of identical small SOLID GEOMETRIC "
   "SHAPES onto a long unrolling blank ribbon: plain filled circles and squares only, evenly "
   "spaced like a punch-card, absolutely not writing. The ribbon is otherwise completely blank. "
   "Glowing emerald.\n\n"
   "CENTRE -- a firehose nozzle gushing an overwhelming torrent of tiny glowing droplets into an "
   "overflowing basin, far more than anyone could catch. Glowing cyan.\n\n"
   "RIGHT -- a single large clean gauge dial with one needle swinging sharply into a red zone. "
   "The dial face has plain tick marks and no numbers. Glowing amber.\n\n"
   "The three outputs must look nothing like each other."),

 "ch8-04-guardrails": (
   "Scene: what actually stops the vehicle.\n\n"
   "On the LEFT, a towering teetering stack of dusty BLANK binders and plain closed folders, far "
   "taller than the small human beside it, leaning dangerously. Every binder is shut and its "
   "cover is plain unmarked colour. No loose papers, no open pages, no sheets on top. A vehicle "
   "drives straight PAST the stack without slowing and one binder topples off unnoticed.\n\n"
   "On the RIGHT, the same vehicle meets solid, heavy, glowing EMERALD GREEN physical GUARDRAILS "
   "along a curve of road. The vehicle is firmly deflected back onto the road, sparks where it "
   "touched, unable to leave the path. The rails are strong and obviously effective.\n\n"
   "Same road, same vehicle, two very different outcomes."),
}

for slug, body in JOBS.items():
    res = fal_client.subscribe('fal-ai/imagen3', arguments={
        'prompt': BASE + body + NOTEXT + NOSCRAWL, 'aspect_ratio': '16:9'})
    img = Image.open(io.BytesIO(requests.get(res['images'][0]['url'], timeout=180).content)).convert('RGB')
    img.save(slug + '.webp', 'webp', quality=92, method=6)
    print(' regenerated', slug, os.path.getsize(slug+'.webp')//1024, 'KB')
