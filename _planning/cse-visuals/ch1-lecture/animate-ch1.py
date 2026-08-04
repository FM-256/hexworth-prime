#!/usr/bin/env python3
"""
Animate the two CH1 slides whose lesson is temporal.

Only two. Motion that does not enact the slide's verb is banned (s15: no ambient
particles/glow/camera drift), so the other four stay still. These two move because
the movement IS the teaching point:
  01 control-plane        -- the fleet being CREATED, endlessly, from one call
  06 shared responsibility-- the boundary SLIDING while the green base does not

Pipeline per s8.2/s8.3: still -> Kling 1.6 Pro image-to-video -> mp4.
Kept as mp4 rather than GIF: same pattern as the house mascots
(<video autoplay loop muted playsinline>), far smaller than a GIF at this quality.
"""
import os, sys, requests, fal_client

JOBS = {
 'ch1-01-control-plane': (
   "The glowing cyan portal in the centre continuously emits a stream of small glowing "
   "server cubes that fly outward to the upper right and fade into the distance, one after "
   "another, endlessly. The lonely beige desktop computer on the left stays completely still "
   "and unchanged. The engineer characters stay still. Only the emitted cubes move. "
   "Smooth, steady, loopable motion. Fixed camera, no zoom, no pan."),
 'ch1-06-shared-responsibility': (
   "The bright horizontal band of light wrapped around the tower slides slowly and smoothly "
   "UPWARD along the tower, and as it rises the warm amber gold region below it grows taller "
   "while the cool blue region above it shrinks. The green foundation slab at the bottom and "
   "everything standing on it -- the badge, the crates, the control panel, the engineers -- "
   "remain completely fixed and unchanged, never moving. Fixed camera, no zoom, no pan."),
}

def main():
    if not os.environ.get('FAL_KEY'):
        sys.exit('FAL_KEY not in env')
    for slug, prompt in JOBS.items():
        src = slug + '.png'
        if not os.path.exists(src):
            sys.exit('missing still: ' + src)
        print('---', slug)
        url = fal_client.upload_file(src)
        print('   uploaded')
        res = fal_client.subscribe('fal-ai/kling-video/v1.6/pro/image-to-video', arguments={
            'prompt': prompt,
            'image_url': url,
            'duration': '5',
            'aspect_ratio': '16:9',
        })
        vurl = res['video']['url']
        out = slug + '.mp4'
        with open(out, 'wb') as f:
            f.write(requests.get(vurl, timeout=300).content)
        print('   saved %s  %d KB' % (out, os.path.getsize(out) // 1024))

main()
