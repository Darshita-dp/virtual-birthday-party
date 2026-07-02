"""
Edge-based background removal for the avatar PNGs.

Reads each avatar-NN.png (RGB, solid-white bg), floods only the near-white
region connected to the image border, sets those pixels' alpha to 0, and writes
back RGBA. Interior whites (highlights, eyes, sparkles, teeth, shoes) are
preserved because they are not border-connected.

Usage:
  python scripts/avatars-remove-bg.py
"""

from __future__ import annotations

import os
import sys
import time
from collections import deque

import numpy as np
from PIL import Image

SRC = "apps/web/public/assets/avatars"
BACKUP = "apps/web/public/assets/avatars_original_white_bg"
THRESH = 235  # a pixel is "near-white" if R,G,B are ALL >= THRESH


def clean_one(src_path: str, dst_path: str) -> tuple[int, int, int]:
    im = Image.open(src_path).convert("RGBA")
    arr = np.array(im, dtype=np.uint8)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3]

    # Near-white mask (only candidate background pixels).
    nw = (rgb[:, :, 0] >= THRESH) & (rgb[:, :, 1] >= THRESH) & (rgb[:, :, 2] >= THRESH)

    # BFS from every border pixel that is near-white. Interior whites can only
    # become transparent if a path of near-white pixels connects them to a
    # border — for a closed character silhouette that path does not exist.
    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if nw[y, x] and not visited[y, x]:
            visited[y, x] = True
            q.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)

    while q:
        y, x = q.popleft()
        if y + 1 < h and not visited[y + 1, x] and nw[y + 1, x]:
            visited[y + 1, x] = True
            q.append((y + 1, x))
        if y > 0 and not visited[y - 1, x] and nw[y - 1, x]:
            visited[y - 1, x] = True
            q.append((y - 1, x))
        if x + 1 < w and not visited[y, x + 1] and nw[y, x + 1]:
            visited[y, x + 1] = True
            q.append((y, x + 1))
        if x > 0 and not visited[y, x - 1] and nw[y, x - 1]:
            visited[y, x - 1] = True
            q.append((y, x - 1))

    removed = int(visited.sum())
    arr[visited, 3] = 0
    Image.fromarray(arr, "RGBA").save(dst_path, "PNG")
    return removed, w, h


def main() -> int:
    if not os.path.isdir(SRC):
        print(f"missing source dir: {SRC}", file=sys.stderr)
        return 2
    if not os.path.isdir(BACKUP):
        print(f"missing backup dir: {BACKUP} — please back up first.", file=sys.stderr)
        return 2

    ok = 0
    print(f"{'file':13} {'dims':10} {'removed_pct':>12}  {'time':>6}")
    for i in range(1, 16):
        name = f"avatar-{i:02d}.png"
        src = os.path.join(SRC, name)
        if not os.path.exists(src):
            print(f"{name:13} MISSING")
            continue
        t0 = time.time()
        removed, w, h = clean_one(src, src)  # overwrite in place; backup already exists
        dt = time.time() - t0
        pct = 100.0 * removed / (w * h)
        print(f"{name:13} {w}x{h:<5} {pct:11.1f}%  {dt:5.1f}s")
        ok += 1
    print(f"cleaned {ok}/15")
    return 0


if __name__ == "__main__":
    sys.exit(main())
