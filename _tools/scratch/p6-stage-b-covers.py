import re, os, glob
PROJ='projects'
# Load registry difficulty per id + the new tier labels (registry-driven, per Nancy).
pd=open(os.path.join(PROJ,'ProjectsData.js')).read()
labels={'recruit':'Recruit','operative':'Operative','operator':'Operator','specialist':'Specialist','expert':'Expert','master':'Master'}
diffById={}
for mo in re.finditer(r"id: '([^']+)'[\s\S]{0,1400}?difficulty: '([a-z]+)'", pd):
    diffById.setdefault(mo.group(1), mo.group(2))
STD={'Beginner','Journeyman','Advanced','Pro','Intermediate','Adept'}  # standard tier words to replace
changed, skipped_special, skipped_nopage = [], [], []
for pid,newkey in diffById.items():
    f=os.path.join(PROJ,pid+'.html')
    if not os.path.exists(f): skipped_nopage.append(pid); continue
    h=open(f,encoding='utf-8').read()
    m=re.search(r'(<span class="cf-badge cf-badge-diff">)([^<]*)(</span>)', h)
    if not m: continue
    cur=m.group(2).strip()
    # Leave AI-series special badges (Adaptive · L1–5 / Capstone · L1–5) and anything non-standard.
    if cur not in STD:
        skipped_special.append(pid+':'+cur); continue
    new=labels[newkey]
    if new==cur: continue
    h2=h[:m.start(2)]+new+h[m.end(2):]
    open(f,'w').write(h2); changed.append(pid+' '+cur+'->'+new)
print('covers updated:', len(changed))
print('skipped (special/non-tier badge, left as-is):', skipped_special)
print('registry ids with no page:', len(skipped_nopage))
