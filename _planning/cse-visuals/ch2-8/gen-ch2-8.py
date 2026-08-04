#!/usr/bin/env python3
import os, io, sys, requests, fal_client
from PIL import Image
from ch2_8_specs import SPECS, prompt_for

done = {f[:-5] for f in os.listdir('.') if f.endswith('.webp')}
todo = [s for s in SPECS if s not in done]
print(f'{len(SPECS)} specs, {len(todo)} to generate')
for i, slug in enumerate(todo, 1):
    try:
        res = fal_client.subscribe('fal-ai/imagen3', arguments={
            'prompt': prompt_for(slug), 'aspect_ratio': '16:9'})
        img = Image.open(io.BytesIO(requests.get(res['images'][0]['url'], timeout=180).content)).convert('RGB')
        img.save(slug + '.webp', 'webp', quality=92, method=6)
        img.save(slug + '.png')
        print(f'  [{i}/{len(todo)}] {slug}  {os.path.getsize(slug+".webp")//1024} KB')
    except Exception as e:
        print(f'  [{i}/{len(todo)}] {slug}  FAILED: {type(e).__name__}: {str(e)[:90]}')
