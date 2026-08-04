import os, io, requests, fal_client
from PIL import Image
from ch2_8_specs import BASE, NOTEXT

# Third attempt at this one image. Attempts 1 and 2 both put cursive on PAPER: first the
# ledger ribbon, then -- after I blanked that ribbon -- a second receipt tape on a register
# terminal I had not asked for and did not check. Paper is the surface that invites writing,
# so this composition contains no paper of any kind. The audit instrument stamps into a METAL
# band. Nothing in the scene can be written on.
NOPAPER = ("\n\nThere is NO PAPER anywhere in this image: no paper, no ribbon of paper, no "
           "receipt, no till roll, no tape, no scroll, no sheet, no page, no card, no label, "
           "no notepad, no clipboard. There are also NO pens, pencils, quills, markers, brushes, "
           "signatures, handwriting or ink marks of any kind. Nothing in the scene is writable.")

PROMPT = BASE + (
  "Scene: three completely different instruments measuring one machine. EXACTLY THREE "
  "instruments, no others.\n\n"
  "One large glowing server machine stands in the centre. Around it, three instruments, each "
  "tended by one small robot:\n\n"
  "LEFT -- a heavy industrial stamping press pressing a row of identical SOLID GEOMETRIC SHAPES "
  "into a long unrolling METAL BAND: plain filled circles and squares punched into brushed steel, "
  "evenly spaced, like a machine-tooled strip. Metal only, never paper. Glowing emerald.\n\n"
  "CENTRE -- a wide firehose nozzle gushing an overwhelming torrent of tiny glowing droplets into "
  "an overflowing metal basin, far more than anyone could catch, splashing over the rim. "
  "Glowing cyan.\n\n"
  "RIGHT -- one single large clean circular gauge dial with one needle swinging hard into a red "
  "zone. The dial face carries plain tick marks only, no numerals. Glowing amber.\n\n"
  "No desks, no terminals, no registers, no counters, no screens. Only the server, the three "
  "instruments and the three robots, on empty dark ground."
) + NOTEXT + NOPAPER

res = fal_client.subscribe('fal-ai/imagen3', arguments={'prompt': PROMPT, 'aspect_ratio': '16:9'})
img = Image.open(io.BytesIO(requests.get(res['images'][0]['url'], timeout=180).content)).convert('RGB')
img.save('ch7-01-three-telemetry.webp', 'webp', quality=92, method=6)
print('regenerated', os.path.getsize('ch7-01-three-telemetry.webp')//1024, 'KB')

# Scan the WHOLE frame in quadrants at 2x -- not a crop of the surface I expect to be wrong.
# Checking only the previously-fixed element is precisely what let the second ribbon through.
im = Image.open('ch7-01-three-telemetry.webp').convert('RGB')
W, Hh = im.size
for i, box in enumerate([(0,0,W//2,Hh//2), (W//2,0,W,Hh//2), (0,Hh//2,W//2,Hh), (W//2,Hh//2,W,Hh)], 1):
    q = im.crop(box); q = q.resize((q.width*2, q.height*2), Image.LANCZOS)
    q.save(f'ch7q{i}.png')
print('quadrants ch7q1..4.png at 2x')
