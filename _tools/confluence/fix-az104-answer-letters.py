#!/usr/bin/env python3
"""
fix-az104-answer-letters.py — repoint the AZ-104 solution pages at the shuffled options.

WHY
  `_tools/quiz/az104-shuffle.js` reordered every question's options to kill a degenerate
  answer key (az104-ch02 was all-B, so answering all-B scored 100%). Reordering does not
  change WHICH option is correct, but it does change the LETTER that option sits at. The
  Confluence solution pages state answers as both letter and text — "Correct Answer: B) The
  deployment and management layer..." — so 71 of 90 stated letters now point at the wrong
  box. An instructor cross-checking the manual ticks the wrong answer.

WHAT IT CHANGES
  The letter, and only the letter. The answer TEXT is already correct on every page and is
  left byte-for-byte alone. Verified before writing this: for ch01 q1-q3 the Confluence text
  matched the live option exactly, differing only in its letter.

THE ASSERTION THAT MAKES IT SAFE
  A blind letter substitution would silently corrupt any page whose questions are ordered
  differently from the HTML. So for every replacement the tool requires that the text
  Confluence prints after the letter matches the option now sitting at the key's index. Any
  mismatch aborts the entire page — nothing partial is ever published.

SOURCE OF TRUTH
  functions/quiz_keys.json (the same file pushed to Firestore, which gradeQuiz reads at
  submit time) plus the option order in the quiz HTML. If those two disagree the tool stops;
  it never guesses.

USAGE
  python3 _tools/confluence/fix-az104-answer-letters.py            # dry run, writes nothing
  python3 _tools/confluence/fix-az104-answer-letters.py --publish  # updates Confluence
"""
import json, base64, re, sys, urllib.request, html as H

PAGES = {'01': 3407881, '02': 2982980, '03': 3015392,
         '04': 2851885, '05': 2950389, '06': 3473409}
LETTERS = 'ABCD'
PUBLISH = '--publish' in sys.argv
REPO = '/home/eq/ai-content/hexworth-prime'

cred = json.load(open('/home/eq/.config/confluence/credentials.json'))
USER = cred.get('email') or cred.get('username')
TOKEN = cred.get('api_token') or cred.get('token')
BASE = (cred.get('base_url') or cred.get('url') or 'https://hexworth.atlassian.net/wiki').rstrip('/')
AUTH = base64.b64encode(f"{USER}:{TOKEN}".encode()).decode()
HDRS = {'Authorization': 'Basic ' + AUTH, 'Accept': 'application/json',
        'Content-Type': 'application/json'}


def get_page(pid):
    r = urllib.request.Request(f"{BASE}/rest/api/content/{pid}?expand=body.storage,version",
                               headers=HDRS)
    return json.load(urllib.request.urlopen(r, timeout=30))


def put_page(pid, title, body, version):
    payload = json.dumps({
        'id': str(pid), 'type': 'page', 'title': title,
        'version': {'number': version + 1,
                    'message': 'Repoint stated answer letters at the shuffled option order '
                               '(QUIZ-008). Answer text unchanged.'},
        'body': {'storage': {'value': body, 'representation': 'storage'}}
    }).encode()
    r = urllib.request.Request(f"{BASE}/rest/api/content/{pid}", data=payload,
                               headers=HDRS, method='PUT')
    return json.load(urllib.request.urlopen(r, timeout=60))


def html_options(path):
    src = open(path).read()
    return [re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(2))
            for m in re.finditer(
                r"question:\s*'((?:[^'\\]|\\.)*)'\s*,\s*options:\s*\[([\s\S]*?)\]\s*,", src)]


def norm(s):
    """Compare on visible text only: unescape entities, strip tags, collapse whitespace."""
    s = H.unescape(s)
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('\\"', '"').replace("\\'", "'")
    return re.sub(r'\s+', ' ', s).strip()


keys = json.load(open(f'{REPO}/functions/quiz_keys.json'))
print('DRY RUN — nothing will be written\n' if not PUBLISH else 'PUBLISHING\n')

total = changed = 0
aborted = []

for n, pid in sorted(PAGES.items()):
    qid = f'az104-ch{n}-quiz'
    entry = keys[qid]
    answers = entry if isinstance(entry, list) else entry['answers']
    options = html_options(f'{REPO}/_app/houses/cloud/az-104/quizzes/az104-ch{n}.quiz.html')

    if len(options) != len(answers):
        aborted.append(f'ch{n}: {len(options)} HTML questions vs {len(answers)} key entries')
        continue

    page = get_page(pid)
    body = page['body']['storage']['value']

    # Walk the "Correct Answer: X) text" occurrences in document order.
    hits = list(re.finditer(r'Correct Answer:\s*([A-D])\)\s*([^<]{0,300})', body))
    if len(hits) != len(answers):
        aborted.append(f'ch{n}: page states {len(hits)} answers, key has {len(answers)}')
        continue

    edits, page_changed, mismatch = [], 0, None
    for i, m in enumerate(hits):
        want_letter = LETTERS[answers[i]]
        want_text = options[i][answers[i]]
        # THE SAFETY CHECK: the text on the page must be the option the key points at.
        if norm(m.group(2))[:60] != norm(want_text)[:60]:
            mismatch = (i + 1, norm(m.group(2))[:70], norm(want_text)[:70])
            break
        if m.group(1) != want_letter:
            edits.append((m.start(1), m.end(1), want_letter))
            page_changed += 1

    if mismatch:
        aborted.append(f'ch{n} q{mismatch[0]}: page text does not match the keyed option\n'
                       f'      page: {mismatch[1]}\n      key : {mismatch[2]}')
        continue

    total += len(answers)
    changed += page_changed
    print(f'  ch{n} (page {pid}) v{page["version"]["number"]}: '
          f'{page_changed}/{len(answers)} letters to correct')

    if PUBLISH and page_changed:
        for s, e, ch in reversed(edits):          # back-to-front keeps offsets valid
            body = body[:s] + ch + body[e:]
        res = put_page(pid, page['title'], body, page['version']['number'])
        print(f'      published v{res["version"]["number"]}')

if aborted:
    print('\nABORTED — nothing was published for:')
    for a in aborted:
        print('  ! ' + a)
    sys.exit(1)

print(f'\n{changed} of {total} letters {"corrected" if PUBLISH else "would be corrected"}.')
if not PUBLISH:
    print('Re-run with --publish to apply.')
