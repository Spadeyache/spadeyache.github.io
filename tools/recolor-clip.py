#!/usr/bin/env python3
"""Recolour a simulation clip so it sits on the site's beige background.

The sim renders on a light grey floor and wall, which shows as a pale box on
the page. This maps neutral greys onto tones of the page beige (the floor
becomes exactly --bg), keeps saturated colours (cube, ball) as they are, and
tags the output as BT.709 so browsers convert its colours consistently.

Usage:
  python3 tools/recolor-clip.py IN.mp4 OUT.mp4 [--strip-top 540]

--strip-top is the first row of a beige caption strip baked into the bottom
of the clip (0 if there is none). The strip is nudged to --bg rather than
tone-mapped, and the rows where floor meets strip, plus the rows under the
caption text, are painted solid --bg so no seam shows.

Needs ffmpeg and ffprobe on PATH. After replacing a clip, bump its ?v= in the
HTML so browsers fetch the new file.
"""
import argparse
import os
import subprocess
import tempfile

BG = (233, 223, 201)         # --bg in simple.css
TARGET = (234, 224, 202)     # one step above --bg: YUV rounding lands it on --bg
FLOOR_L = 208.5              # luminance of the sim floor
# Luminance in -> luminance out. The floor lands on the beige; the wall (176)
# and shadows land a few steps darker, so they stay visible but quiet.
TONE = [(0, 0), (60, 56), (176, 225), (FLOOR_L, 234), (255, 255)]


def tone(lum):
    for (a, fa), (b, fb) in zip(TONE, TONE[1:]):
        if lum <= b:
            return fa + (fb - fa) * (lum - a) / (b - a)
    return 255


def write_lut(path, size=33):
    lines = [f'LUT_3D_SIZE {size}']
    for bi in range(size):
        for gi in range(size):
            for ri in range(size):
                rgb = [c * 255 / (size - 1) for c in (ri, gi, bi)]
                lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
                hi, lo = max(rgb), min(rgb)
                sat = 0 if hi == 0 else (hi - lo) / hi
                keep = max(0.0, min(1.0, (sat - 0.08) / 0.17))  # 0 = grey, 1 = colour
                scale = tone(lum) / TARGET[0]
                beige = [min(255, c * scale) for c in TARGET]
                out = [beige[k] * (1 - keep) + rgb[k] * keep for k in range(3)]
                lines.append(' '.join(f'{v / 255:.5f}' for v in out))
    with open(path, 'w') as f:
        f.write('\n'.join(lines) + '\n')


def probe_size(path):
    out = subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path,
    ], text=True)
    w, h = out.strip().split(',')
    return int(w), int(h)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('input')
    parser.add_argument('output')
    parser.add_argument('--strip-top', type=int, default=540,
                        help='first row of the baked-in caption strip, 0 if none (default 540)')
    parser.add_argument('--text-bottom', type=int, default=584,
                        help='first row below the caption text; painted solid to the bottom (default 584)')
    args = parser.parse_args()

    w, h = probe_size(args.input)
    hex_bg = '0x%02X%02X%02X' % TARGET
    with tempfile.TemporaryDirectory() as tmp:
        lut = os.path.join(tmp, 'beige.cube')
        write_lut(lut)
        lut_filter = f"lut3d=file='{lut}':interp=tetrahedral"
        if args.strip_top:
            s = args.strip_top
            nudge = "lutrgb=r='val*%d/232':g='val*%d/222':b='val*%d/200'" % TARGET
            graph = (
                f'[0:v]split[a][b];'
                f'[a]crop={w}:{s}:0:0,{lut_filter}[top];'
                f'[b]crop={w}:{h - s}:0:{s},{nudge}[bot];'
                f'[top][bot]vstack,'
                f'drawbox=x=0:y={s - 2}:w={w}:h=8:color={hex_bg}:t=fill,'
                f'drawbox=x=0:y={args.text_bottom}:w={w}:h={h - args.text_bottom}:color={hex_bg}:t=fill,'
            )
        else:
            graph = f'[0:v]{lut_filter},'
        graph += 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p'

        subprocess.check_call([
            'ffmpeg', '-v', 'error', '-y', '-i', args.input,
            '-filter_complex', graph,
            '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow',
            '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
            '-an', '-movflags', '+faststart', args.output,
        ])
    print(f'wrote {args.output}')


if __name__ == '__main__':
    main()
