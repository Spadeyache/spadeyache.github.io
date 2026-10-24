#!/usr/bin/env python3
"""Write sitemap.xml: the home page, the notes page, and every published note.

Notes come from notes/notes.json. A note is left out while it is a draft
(`draft: true`) or when it only links elsewhere (`link:`), matching what the
notes page links to. Run after publishing a note:

  python3 tools/make-sitemap.py
"""
import json
import pathlib
import re

SITE = 'https://spadeyache.github.io'
ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ['/', '/notes.html']


def front_matter(text):
    match = re.match(r'^---\r?\n(.*?)\r?\n---', text, re.S)
    meta = {}
    for line in (match.group(1).splitlines() if match else []):
        key, sep, value = line.partition(':')
        if sep:
            meta[key.strip()] = value.split('#')[0].strip().strip('"')
    return meta


def main():
    urls = [SITE + page for page in PAGES]
    for slug in json.loads((ROOT / 'notes' / 'notes.json').read_text()):
        meta = front_matter((ROOT / 'notes' / slug / 'note.md').read_text())
        if meta.get('draft') == 'true' or meta.get('link'):
            continue
        urls.append(f'{SITE}/note.html?n={slug}')

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    lines += [f'  <url><loc>{url}</loc></url>' for url in urls]
    lines.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(lines) + '\n')
    print('\n'.join(urls))


if __name__ == '__main__':
    main()
