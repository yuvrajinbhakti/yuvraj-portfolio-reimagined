"""
Generate consistent project cover images.

Why: the source icons are 200-612px squares with wildly different backgrounds
(black, cyan, white, and one with a transparency checkerboard baked in). The
card renders them at roughly 840x900 physical pixels on a 2x display, so the
small ones were being upscaled ~4x.

This composites each icon at its native size onto a generated 1000x1000 cover
tinted with that project's accent, so nothing is upscaled and every card gets
the same treatment.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance
import pathlib, sys, math

ICONS = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 1000
BASE = (9, 14, 30)          # matches the site background family

# accent per project, pulled from the `gradient` field already in constants
# Accents are all blue now, varied by value rather than hue. Six covers in six
# different colours were the loudest thing left on a site whose accent is a
# single blue — and stacked, they read as a rainbow. Value still tells them
# apart; the marks themselves carry whatever colour each project has.
PROJECTS = [
    ("realtime-code-editor", "realtimeCodeEditorIcon.png", (59, 130, 246), (37, 99, 235)),
    ("file-sharing",         "fileSharingAppIcon.jpeg",    (37, 99, 235),  (29, 78, 216)),
    ("moneyzold",            "moneyzoldIcon.jpeg",         (96, 165, 250), (59, 130, 246)),
    ("care-car-rental",      "careCarRentalIcon.jpg",      (29, 78, 216),  (30, 58, 138)),
    ("docker-node",          "dockerNodeAppIcon.png",      (56, 132, 255), (37, 99, 235)),
    ("code-genie",           "codeGenieIcon.png",          (79, 140, 245), (37, 99, 235)),
]


def strip_checkerboard(im):
    """Remove a baked-in transparency checkerboard.

    Flood-fills from the border across pixels matching either checker grey.
    Starting at the edges means white *inside* the artwork (the Docker logo has
    a white keyline) is never touched, because it isn't connected to the border.
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_checker(c):
        r, g, b, a = c
        if a == 0:
            return True
        # the two greys, with a little tolerance
        return (abs(r - 255) < 8 and abs(g - 255) < 8 and abs(b - 255) < 8) or (
            abs(r - 230) < 10 and abs(g - 231) < 10 and abs(b - 230) < 10
        )

    seen = bytearray(w * h)
    stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    stack += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_checker(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


def trim(im):
    """Crop away fully transparent margins so the icon fills its box."""
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def flatten_solid_bg(im):
    """Turn a solid-colour photo background into transparency.

    The jpegs have a flat black / cyan / white field around the mark; leaving it
    in would defeat the point of a consistent cover.
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    corner = px[1, 1][:3]
    # only worth doing if the corners agree — otherwise it's a real image
    corners = [px[1, 1][:3], px[w - 2, 1][:3], px[1, h - 2][:3], px[w - 2, h - 2][:3]]
    if max(max(abs(c[i] - corner[i]) for i in range(3)) for c in corners) > 12:
        return im

    seen = bytearray(w * h)
    stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    stack += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        c = px[x, y]
        if max(abs(c[j] - corner[j]) for j in range(3)) > 26:
            continue
        px[x, y] = (0, 0, 0, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


def make_background(a, b):
    """Dark base with a soft accent glow — reads as part of the site, not a sticker."""
    bg = Image.new("RGB", (SIZE, SIZE), BASE)
    glow = Image.new("RGB", (SIZE, SIZE), BASE)
    d = ImageDraw.Draw(glow)
    cx, cy, rmax = int(SIZE * 0.30), int(SIZE * 0.24), int(SIZE * 0.85)
    for r in range(rmax, 0, -6):
        t = 1 - (r / rmax)
        k = t ** 2.2 * 0.55
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  fill=tuple(int(BASE[i] + (a[i] - BASE[i]) * k) for i in range(3)))
    bg = Image.blend(bg, glow, 0.9)

    # second, cooler glow bottom-right for depth
    glow2 = bg.copy()
    d2 = ImageDraw.Draw(glow2)
    cx2, cy2, r2max = int(SIZE * 0.82), int(SIZE * 0.86), int(SIZE * 0.55)
    for r in range(r2max, 0, -6):
        t = 1 - (r / r2max)
        k = t ** 2.4 * 0.35
        base_px = bg.getpixel((min(cx2, SIZE - 1), min(cy2, SIZE - 1)))
        d2.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r],
                   fill=tuple(int(base_px[i] + (b[i] - base_px[i]) * k) for i in range(3)))
    bg = Image.blend(bg, glow2, 0.75)
    return bg.filter(ImageFilter.GaussianBlur(1.2))


def lerp(a, b, t):
    return a + (b - a) * t


def has_real_alpha(im):
    """True if transparency carries meaning (a cut-out mark, not a solid block)."""
    if im.mode not in ("RGBA", "LA", "P"):
        return False
    im = im.convert("RGBA")
    a = im.split()[3]
    lo, hi = a.getextrema()
    return lo < 250  # something is actually transparent


def rounded_mask(size, radius_ratio=0.235):
    """Antialiased squircle-ish mask, drawn 4x then downsampled."""
    S = size * 4
    m = Image.new("L", (S, S), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * radius_ratio), fill=255)
    return m.resize((size, size), Image.LANCZOS)


def normalise_tile(tile_rgb):
    """Bring a mark into the set's value range.

    Source icons are as often designed for light UIs as dark ones. Dropped onto
    a near-black card, a white-background icon becomes the brightest thing on the
    page — measured 225 mean luminance against a set average of 96, which is
    exactly why one card pulled all the attention.

    Neutral light artwork is inverted (dark plate, light mark), the conventional
    treatment. Saturated artwork is only dimmed, since inverting a brand colour
    would misrepresent it.
    """
    px = list(tile_rgb.getdata())
    n = len(px)
    lum = sum(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in px) / n
    sat = sum(max(c) - min(c) for c in px) / n

    if lum > 170 and sat < 40:
        return ImageOps.invert(tile_rgb), f"inverted (lum {lum:.0f}, neutral)"
    if lum > 140:
        f = 120.0 / lum
        return ImageEnhance.Brightness(tile_rgb).enhance(f), f"dimmed x{f:.2f} (lum {lum:.0f})"
    return tile_rgb, ""


def make_tile(icon, tile_px, accent):
    """One consistent treatment for every mark.

    The six source icons have black, cyan, white, greyscale and transparent
    backgrounds. Earlier passes tried to strip each background; that works for a
    flat field but not for the several that sit on a *gradient*, where a
    fixed-tolerance flood fill stops partway and leaves a lumpy halo.

    So instead of removing backgrounds, every mark gets the same rounded tile —
    honest (these are app icons) and uniform across the set.
    """
    tile = Image.new("RGBA", (tile_px, tile_px), (0, 0, 0, 0))

    if has_real_alpha(icon):
        # Cut-out mark: give it a surface to sit on.
        plate = Image.new("RGBA", (tile_px, tile_px), (0, 0, 0, 0))
        d = ImageDraw.Draw(plate)
        for y in range(tile_px):
            t = y / max(1, tile_px - 1)
            d.line([(0, y), (tile_px, y)], fill=(
                int(lerp(30, 12, t)), int(lerp(38, 18, t)), int(lerp(62, 34, t)), 255))
        tile = plate
        inner = int(tile_px * 0.70)
        icon = trim(icon)
        k = min(inner / icon.width, inner / icon.height)
        nw, nh = max(1, int(icon.width * k)), max(1, int(icon.height * k))
        icon = icon.resize((nw, nh), Image.LANCZOS)
        tile.paste(icon, ((tile_px - nw) // 2, (tile_px - nh) // 2), icon)
    else:
        # Opaque artwork: crop to the largest centred square and fill the tile.
        w, h = icon.size
        side = min(w, h)
        cropped = icon.convert("RGB").crop(
            ((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side)
        ).resize((tile_px, tile_px), Image.LANCZOS)
        cropped, note = normalise_tile(cropped)
        if note:
            print(f"      value-normalised: {note}")
        tile = cropped.convert("RGBA")

    tile.putalpha(rounded_mask(tile_px))

    # Hairline edge so the tile reads as a surface rather than a sticker.
    edge = Image.new("RGBA", (tile_px, tile_px), (0, 0, 0, 0))
    ImageDraw.Draw(edge).rounded_rectangle(
        [0, 0, tile_px - 1, tile_px - 1], radius=int(tile_px * 0.235),
        outline=(255, 255, 255, 46), width=2)
    return Image.alpha_composite(tile, edge)


for slug, filename, accent_a, accent_b in PROJECTS:
    src = ICONS / filename
    if not src.exists():
        print(f"  !! missing {filename}")
        continue

    icon = Image.open(src)
    if filename == "dockerNodeAppIcon.png":
        icon = strip_checkerboard(icon)

    # 34% of the canvas, not 52%. The card renders these full-bleed and crops
    # the square to a landscape panel, so the mark was arriving oversized and
    # crowding the panel edges. Shrinking it here rather than padding it in CSS
    # keeps the background full-bleed — an object-contain fallback turned the
    # cover into a visible square pasted onto the card.
    #
    # Geometry check: at a 511x376 panel, object-cover scales by width (0.511)
    # and keeps the middle 73.6% of the height — y from 13.2% to 86.8%. A 34%
    # tile centred spans 33% to 67%, so it clears the crop comfortably at both
    # the desktop and the 341x200 mobile panel. It renders ~174px.
    tile_px = int(SIZE * 0.34)
    tile = make_tile(icon, tile_px, accent_a)
    pos = ((SIZE - tile_px) // 2, (SIZE - tile_px) // 2)

    bg = make_background(accent_a, accent_b).convert("RGBA")

    # Accent glow behind the tile. Light, not a black drop shadow — a dark
    # shadow over a near-black cover reads as a smudge.
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle([pos[0], pos[1], pos[0] + tile_px, pos[1] + tile_px],
                         radius=int(tile_px * 0.235), fill=accent_a + (110,))
    glow = glow.filter(ImageFilter.GaussianBlur(46))
    bg = Image.alpha_composite(bg, glow)

    bg.paste(tile, pos, tile)

    out = OUT / f"{slug}.webp"
    bg.convert("RGB").save(out, "WEBP", quality=86, method=6)
    print(f"  {out.name:26s} {out.stat().st_size/1024:6.0f} kB   tile {tile_px}px")
