#!/usr/bin/env python3
"""
Publish a markdown solution document to Confluence.

Usage:
    publish-solution.py find <query>            # search for a page by title or text
    publish-solution.py space-tree              # show top-level pages in each space
    publish-solution.py publish <md-file> --parent <pageId> --title <title>

Reads creds from ~/.config/confluence/credentials.json.
Converts markdown -> Confluence storage XHTML using a minimal converter
(headings, paragraphs, code blocks, lists, bold/italic, links, tables).
"""

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import base64

CRED_PATH = os.path.expanduser("~/.config/confluence/credentials.json")


def load_creds():
    with open(CRED_PATH) as f:
        return json.load(f)


def req(creds, path, method="GET", body=None, params=None):
    url = creds["site"].rstrip("/") + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    auth = base64.b64encode(f"{creds['email']}:{creds['token']}".encode()).decode()
    headers = {"Authorization": f"Basic {auth}", "Accept": "application/json"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def cmd_find(creds, query):
    # Use CQL: search title OR text
    cql = f'(title ~ "{query}" OR text ~ "{query}")'
    res = req(creds, "/wiki/rest/api/content/search",
              params={"cql": cql, "limit": 20, "expand": "ancestors,space"})
    for r in res.get("results", []):
        ancestors = " > ".join(a["title"] for a in r.get("ancestors", []))
        space = r.get("space", {}).get("key", "?")
        print(f"  [{space}] {r['id']:>10s}  {ancestors} > {r['title']}")
    print(f"({res.get('size', 0)} hits)")


def cmd_space_tree(creds):
    spaces = req(creds, "/wiki/rest/api/space", params={"limit": 25})
    for sp in spaces.get("results", []):
        key = sp["key"]
        name = sp["name"]
        print(f"\n=== {key} — {name} ===")
        roots = req(creds, "/wiki/rest/api/content",
                    params={"spaceKey": key, "type": "page",
                            "limit": 50, "expand": "ancestors"})
        # Show only pages with NO ancestors (true roots)
        for p in roots.get("results", []):
            if not p.get("ancestors"):
                print(f"  ROOT {p['id']:>10s}  {p['title']}")


def md_to_storage(md):
    """Minimal Markdown -> Confluence storage XHTML converter."""
    out = []
    in_code = False
    code_buf = []
    code_lang = ""
    in_list = False
    list_type = None  # 'ul' or 'ol'
    in_table = False
    table_buf = []
    paragraph_buf = []

    def flush_para():
        nonlocal paragraph_buf
        if paragraph_buf:
            text = " ".join(paragraph_buf).strip()
            if text:
                out.append("<p>" + inline_md(text) + "</p>")
            paragraph_buf = []

    def flush_list():
        nonlocal in_list, list_type
        if in_list:
            out.append(f"</{list_type}>")
            in_list = False
            list_type = None

    def flush_table():
        nonlocal in_table, table_buf
        if in_table:
            out.append(render_table(table_buf))
            in_table = False
            table_buf = []

    def render_table(rows):
        if len(rows) < 2:
            return ""
        # First row = header, second is separator, rest are data
        header_cells = [c.strip() for c in rows[0].strip("|").split("|")]
        body_rows = []
        for r in rows[2:]:
            cells = [c.strip() for c in r.strip("|").split("|")]
            body_rows.append(cells)
        html = ["<table><tbody>"]
        html.append("<tr>" + "".join(f"<th>{inline_md(c)}</th>" for c in header_cells) + "</tr>")
        for row in body_rows:
            html.append("<tr>" + "".join(f"<td>{inline_md(c)}</td>" for c in row) + "</tr>")
        html.append("</tbody></table>")
        return "".join(html)

    def inline_md(s):
        # Escape XML special chars first (but preserve already-encoded entities)
        s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        # Inline code: `code`
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        # Bold: **text**
        s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
        # Italic: *text* (lazy — match single asterisk pairs)
        s = re.sub(r"(?<![*])\*([^*\n]+)\*(?![*])", r"<em>\1</em>", s)
        # Links: [text](url)
        s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
        return s

    for line in md.split("\n"):
        # Code fence
        m = re.match(r"^```(\w*)$", line)
        if m:
            if not in_code:
                flush_para()
                flush_list()
                flush_table()
                in_code = True
                code_lang = m.group(1) or ""
                code_buf = []
            else:
                # End of code block — emit Confluence code macro
                body = "\n".join(code_buf)
                body_esc = body.replace("]]>", "]]]]><![CDATA[>")
                macro = (
                    f'<ac:structured-macro ac:name="code">'
                    f'<ac:parameter ac:name="language">{code_lang or "text"}</ac:parameter>'
                    f'<ac:plain-text-body><![CDATA[{body_esc}]]></ac:plain-text-body>'
                    f'</ac:structured-macro>'
                )
                out.append(macro)
                in_code = False
            continue
        if in_code:
            code_buf.append(line)
            continue

        # Tables (pipe-delimited rows with at least one |)
        if line.lstrip().startswith("|") and "|" in line[1:]:
            if not in_table:
                flush_para()
                flush_list()
                in_table = True
                table_buf = []
            table_buf.append(line)
            continue
        elif in_table:
            flush_table()

        # Headings
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            flush_para(); flush_list(); flush_table()
            level = len(m.group(1))
            out.append(f"<h{level}>{inline_md(m.group(2).strip())}</h{level}>")
            continue

        # Horizontal rule
        if re.match(r"^---+\s*$", line):
            flush_para(); flush_list(); flush_table()
            out.append("<hr/>")
            continue

        # Unordered list item
        m = re.match(r"^[\-\*]\s+(.*)$", line)
        if m:
            flush_para()
            if in_table:
                flush_table()
            if not in_list or list_type != "ul":
                flush_list()
                out.append("<ul>")
                in_list = True
                list_type = "ul"
            out.append("<li>" + inline_md(m.group(1).strip()) + "</li>")
            continue

        # Ordered list item
        m = re.match(r"^\d+\.\s+(.*)$", line)
        if m:
            flush_para()
            if in_table:
                flush_table()
            if not in_list or list_type != "ol":
                flush_list()
                out.append("<ol>")
                in_list = True
                list_type = "ol"
            out.append("<li>" + inline_md(m.group(1).strip()) + "</li>")
            continue

        # Blank line — flush paragraph
        if line.strip() == "":
            flush_para()
            flush_list()
            continue

        # Default: accumulate into paragraph
        if in_list:
            # Indented continuation of last list item
            out[-1] = out[-1][:-5] + " " + inline_md(line.strip()) + "</li>"
        else:
            paragraph_buf.append(line.strip())

    flush_para()
    flush_list()
    flush_table()
    if in_code:
        # Unterminated code block — emit what we have
        body = "\n".join(code_buf)
        out.append(f'<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[{body}]]></ac:plain-text-body></ac:structured-macro>')

    return "".join(out)


def cmd_publish(creds, md_file, parent_id, title):
    with open(md_file) as f:
        md = f.read()
    storage = md_to_storage(md)
    # Determine spaceKey from parent
    parent = req(creds, f"/wiki/rest/api/content/{parent_id}", params={"expand": "space"})
    space_key = parent["space"]["key"]

    body = {
        "type": "page",
        "title": title,
        "space": {"key": space_key},
        "ancestors": [{"id": str(parent_id)}],
        "body": {
            "storage": {
                "value": storage,
                "representation": "storage"
            }
        }
    }
    result = req(creds, "/wiki/rest/api/content", method="POST", body=body)
    print(f"Created page id={result['id']} title={result['title']}")
    print(f"URL: {creds['site']}/wiki{result['_links']['webui']}")
    return result


def cmd_update(creds, page_id, md_file, title=None):
    """Update an existing Confluence page in place. Bumps version by 1.

    Title is optional — keep the existing title if omitted. The space
    is derived from the existing page (cannot be moved here)."""
    with open(md_file) as f:
        md = f.read()
    storage = md_to_storage(md)
    current = req(creds, f"/wiki/rest/api/content/{page_id}",
                  params={"expand": "version,space"})
    new_version = current["version"]["number"] + 1
    new_title = title or current["title"]
    body = {
        "id": page_id,
        "type": "page",
        "title": new_title,
        "space": {"key": current["space"]["key"]},
        "version": {"number": new_version},
        "body": {
            "storage": {
                "value": storage,
                "representation": "storage"
            }
        }
    }
    result = req(creds, f"/wiki/rest/api/content/{page_id}",
                 method="PUT", body=body)
    print(f"Updated page id={result['id']} title={result['title']} version={new_version}")
    print(f"URL: {creds['site']}/wiki{result['_links']['webui']}")
    return result


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    fp = sub.add_parser("find"); fp.add_argument("query")
    sub.add_parser("space-tree")
    pp = sub.add_parser("publish")
    pp.add_argument("md_file")
    pp.add_argument("--parent", required=True)
    pp.add_argument("--title", required=True)
    up = sub.add_parser("update")
    up.add_argument("page_id")
    up.add_argument("md_file")
    up.add_argument("--title", required=False,
                    help="Optional new title — keeps existing if omitted")

    args = parser.parse_args()
    creds = load_creds()

    if args.cmd == "find":
        cmd_find(creds, args.query)
    elif args.cmd == "space-tree":
        cmd_space_tree(creds)
    elif args.cmd == "publish":
        cmd_publish(creds, args.md_file, args.parent, args.title)
    elif args.cmd == "update":
        cmd_update(creds, args.page_id, args.md_file, args.title)


if __name__ == "__main__":
    main()
