# Notes

Each note is a folder: `notes/<slug>/note.md`, plus any images or videos it uses.

## Add a note

1. Copy `slope-line-following/` and rename the folder (the folder name is the URL: `note.html?n=<folder>`).
2. Edit the metadata and text in `note.md`.
3. Add the folder name to `notes.json`. Order there is the order on the Notes page.

## Investigations vs. building

The Notes page has two sections:

- **Investigations (top):** the deep write-ups. Add `pinned: true` and a one-sentence `summary`.
- **Building (below):** frequent, shorter build posts. Leave `pinned` out.
  Put new build posts at the top of their part of `notes.json` so the newest shows first.
  To point a build post at Instagram or a video instead of a full note, add `link: <url>`.

## Metadata (top of note.md)

```
---
title: Following a path on slopes, where the robot slips
date: "2026-03"
kind: hardcoded            # hardcoded (orange) or learned (green)
pinned: true               # optional, puts the note under Investigations
summary: One sentence.     # shown under an investigation's title
link: https://...          # optional, the row links here instead of a note page
project: RoboCupJunior Rescue
keywords: [line following, PID, wheel slip]
video: clip.mp4            # optional lead media: video or image
poster: clip-first.png     # optional, for video
caption: One line under the lead media.
x: https://x.com/...       # optional, the "Discuss on X" link
draft: true                # optional, listed as "Writing" and not linked
---
```

Paths are relative to the note's folder (`clip.mp4` = `notes/<slug>/clip.mp4`).

## Body

Use `## Problem`, `## What I did`, `## Result`, `## Still hardcoded`.
The `Still hardcoded` section is drawn as a box.

Supported: paragraphs, `- ` lists, **bold**, *italic*, `code`, [links](url),
and a figure on its own line: `![alt text](photo.jpg "Caption")`.
A `.mp4` in that syntax becomes a video.

## Preview locally

Notes load with fetch, so double-clicking the HTML file won't show them.
Run `python3 -m http.server` in the site folder and open http://localhost:8000.
