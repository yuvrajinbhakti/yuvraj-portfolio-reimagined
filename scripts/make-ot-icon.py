"""
The ot-core mark: two edit streams converging into one.

Two people write independently — the two dots and the two arms — and the
algorithm brings them to one agreed document, the trunk. The whole library in
one glyph, and it survives being shrunk to 24px in a list.

Strokes are painted as a run of overlapping discs rather than with
ImageDraw.line(width=...), whose mitred joints shed visible barbs along a
curve. A disc brush gives clean round caps and joins for free. Drawn at 4x and
downsampled, since PIL antialiases nothing on its own.
"""
from PIL import Image, ImageDraw

S, SS = 512, 4
N = S * SS
WHITE = (255, 255, 255, 255)

img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

def disc(x, y, r):
    d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)

def stroke(p0, p1, r, steps=260):
    for i in range(steps + 1):
        t = i / steps
        disc(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, r)

R = N * 0.030                      # stroke radius
top, meet, foot = N * 0.255, N * 0.560, N * 0.800
left, right, mid = N * 0.235, N * 0.765, N * 0.500

stroke((left,  top),  (mid, meet), R)     # one writer
stroke((right, top),  (mid, meet), R)     # the other
stroke((mid,   meet), (mid, foot), R)     # the document they agree on

for x in (left, right):                   # the writers themselves
    disc(x, top, N * 0.062)

img.resize((S, S), Image.LANCZOS).save("src/assets/icons/otCoreIcon.png")

# Preview on the plate colour the cover script uses.
im = Image.open("src/assets/icons/otCoreIcon.png").convert("RGBA")
bg = Image.new("RGBA", im.size, (13, 20, 42, 255))
Image.alpha_composite(bg, im).convert("RGB").save("/tmp/icon-preview.png")
print("wrote icon + preview")
