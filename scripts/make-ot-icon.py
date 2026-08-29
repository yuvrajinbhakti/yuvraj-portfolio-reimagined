"""
The ot-core mark: two writers, one document.

Two people edit at once — the pair of dots, and the arms converging from them —
and what they produce is a single agreed document, the lines underneath.

The first version of this was just the arms and a stem, which drew a passable
letter Y and said nothing. A reader saw a monogram. Adding the document turns
the same convergence into a sentence: *these two, into that*. It is also what
separates the mark from every other Y in a grid of app icons.

Two lines below rather than three. A third makes the block heavier than the
pair above it, and the eye then reads the paragraph as the subject with the
arms as decoration — which inverts the point.

Strokes are painted as runs of overlapping discs rather than with
ImageDraw.line(width=...), whose mitred joints shed visible barbs along an
angle. A disc brush gives clean round caps and joins for free. Drawn at 4x and
downsampled, since PIL antialiases nothing on its own.

    python3 scripts/make-ot-icon.py

Then regenerate the cover:

    python3 scripts/make-covers.py src/assets/icons src/assets/covers
"""
from PIL import Image, ImageDraw
import pathlib

S, SS = 512, 4
N = S * SS
WHITE = (255, 255, 255, 255)

img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
d = ImageDraw.Draw(img)


def disc(x, y, r):
    d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)


def stroke(p0, p1, r, steps=340):
    for i in range(steps + 1):
        t = i / steps
        disc(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, r)


def bar(cx, y, w, r):
    stroke((cx - w / 2, y), (cx + w / 2, y), r)


R = N * 0.027
mid = N * 0.5
top, meet = N * 0.185, N * 0.455

# The two writers, and their edits arriving at the same place. Steep rather
# than shallow: a wide V reads as a chevron pointing down, a narrow one reads
# as two things converging.
for x in (N * 0.285, N * 0.715):
    stroke((x, top), (mid, meet), R)
    disc(x, top, N * 0.048)

# What they agree on.
bar(mid, N * 0.645, N * 0.44, R)
bar(mid, N * 0.760, N * 0.30, R)

out = pathlib.Path(__file__).resolve().parent.parent / "src/assets/icons/otCoreIcon.png"
img.resize((S, S), Image.LANCZOS).save(out)
print(f"  {out.name}  {out.stat().st_size / 1024:.0f} kB")
