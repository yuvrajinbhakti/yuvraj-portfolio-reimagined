"""
Turn the public star and constellation catalogues into something small enough
to ship.

Source: https://github.com/ofrohn/d3-celestial (BSD-3, Olaf Frohn), which
packages the standard astronomical catalogues as GeoJSON. Stars carry a real
right ascension, declination, visual magnitude and B-V colour index; the
constellation file carries the conventional stick figures.

The raw star file is 656 kB of JSON objects. Nothing here needs that: four
numbers per star, scaled to integers and flattened into one array, is the same
information in a fifth of the space and parses faster besides.

    python3 scripts/make-star-catalog.py

Cut at the file's own limit, magnitude 6.0 — the naked-eye limit under a
genuinely dark sky. 5.5 was tried first and is the more defensible number for
an average night, but it puts only ~610 stars in frame, and a real sky at that
depth is visibly thinner than the stylised field it replaced. The extra half
magnitude nearly doubles the count for about 40 kB.
"""
import json, pathlib, urllib.request

STARS = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/stars.6.json"
LINES = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json"
NAMES = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/starnames.json"
MAG_LIMIT = 6.0

# Only stars this bright get a label. Not a data-size decision — an aiming one.
# A magnitude 5 star is drawn under a pixel wide, so nobody points at one on
# purpose, and shipping 5,044 names to serve a hover that will always land on a
# bright star is paying for a feature that cannot fire.
LABEL_MAG_LIMIT = 4.0

# The subset the hero readout can name in a sentence.
NOTABLE_MAG_LIMIT = 2.0

# The IAU three-letter abbreviations, which is all the source carries. Stored
# once and referenced by key rather than repeated per star: "Canis Major" is 11
# bytes and there are 90 stars in it.
CONSTELLATIONS = {
    "And": "Andromeda", "Ant": "Antlia", "Aps": "Apus", "Aqr": "Aquarius",
    "Aql": "Aquila", "Ara": "Ara", "Ari": "Aries", "Aur": "Auriga",
    "Boo": "Boötes", "Cae": "Caelum", "Cam": "Camelopardalis", "Cnc": "Cancer",
    "CVn": "Canes Venatici", "CMa": "Canis Major", "CMi": "Canis Minor",
    "Cap": "Capricornus", "Car": "Carina", "Cas": "Cassiopeia", "Cen": "Centaurus",
    "Cep": "Cepheus", "Cet": "Cetus", "Cha": "Chamaeleon", "Cir": "Circinus",
    "Col": "Columba", "Com": "Coma Berenices", "CrA": "Corona Australis",
    "CrB": "Corona Borealis", "Crv": "Corvus", "Crt": "Crater", "Cru": "Crux",
    "Cyg": "Cygnus", "Del": "Delphinus", "Dor": "Dorado", "Dra": "Draco",
    "Equ": "Equuleus", "Eri": "Eridanus", "For": "Fornax", "Gem": "Gemini",
    "Gru": "Grus", "Her": "Hercules", "Hor": "Horologium", "Hya": "Hydra",
    "Hyi": "Hydrus", "Ind": "Indus", "Lac": "Lacerta", "Leo": "Leo",
    "LMi": "Leo Minor", "Lep": "Lepus", "Lib": "Libra", "Lup": "Lupus",
    "Lyn": "Lynx", "Lyr": "Lyra", "Men": "Mensa", "Mic": "Microscopium",
    "Mon": "Monoceros", "Mus": "Musca", "Nor": "Norma", "Oct": "Octans",
    "Oph": "Ophiuchus", "Ori": "Orion", "Pav": "Pavo", "Peg": "Pegasus",
    "Per": "Perseus", "Phe": "Phoenix", "Pic": "Pictor", "Psc": "Pisces",
    "PsA": "Piscis Austrinus", "Pup": "Puppis", "Pyx": "Pyxis", "Ret": "Reticulum",
    "Sge": "Sagitta", "Sgr": "Sagittarius", "Sco": "Scorpius", "Scl": "Sculptor",
    "Sct": "Scutum", "Ser": "Serpens", "Sex": "Sextans", "Tau": "Taurus",
    "Tel": "Telescopium", "Tri": "Triangulum", "TrA": "Triangulum Australe",
    "Tuc": "Tucana", "UMa": "Ursa Major", "UMi": "Ursa Minor", "Vel": "Vela",
    "Vir": "Virgo", "Vol": "Volans", "Vul": "Vulpecula",
}

root = pathlib.Path(__file__).resolve().parent.parent
out = root / "src/constants/starCatalog.js"


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)


def wrap(ra):
    """The source stores right ascension as -180..180; 0..360 is easier to reason about."""
    return ra + 360 if ra < 0 else ra


stars = fetch(STARS)
# Keyed by Hipparcos number, which is the `id` on each star feature. The
# positions file carries nothing but magnitude and colour, so this is the only
# way to get from a dot on screen to something you can look up.
starnames = fetch(NAMES)

flat = []
labels = {}
used_constellations = set()
notable = []
unnamed_but_labelled = 0

for f in stars["features"]:
    mag = f["properties"].get("mag")
    if not isinstance(mag, (int, float)) or mag > MAG_LIMIT:
        continue
    ra, dec = f["geometry"]["coordinates"]
    try:
        bv = float(f["properties"].get("bv"))
    except (TypeError, ValueError):
        bv = 0.65  # roughly solar; the safe default for a star with no colour recorded

    index = len(flat) // 4
    # Hundredths throughout. 0.01 degrees is 36 arcseconds, far finer than a
    # pixel at any sane zoom, and integers compress better than decimals.
    flat += [
        round(wrap(ra) * 100),
        round(dec * 100),
        round(mag * 100),
        round(max(-0.4, min(2.0, bv)) * 100),
    ]

    if mag > LABEL_MAG_LIMIT:
        continue
    entry = starnames.get(str(f.get("id")), {})
    # A proper name if it has one; otherwise the Bayer or Flamsteed designation,
    # which is what a star chart prints and is a real identity rather than a
    # placeholder. Most stars have no proper name and never did.
    name = entry.get("name") or entry.get("desig") or ""
    con = entry.get("c") or ""
    if not name:
        continue
    if not entry.get("name"):
        unnamed_but_labelled += 1
    elif mag <= NOTABLE_MAG_LIMIT:
        # For the readout, which names one star in a sentence. A Greek letter
        # is a real identity but it reads as noise in prose, so that line only
        # ever draws from stars with a proper name and a reputation.
        notable.append(index)
    if con in CONSTELLATIONS:
        used_constellations.add(con)
    else:
        con = ""
    labels[index] = [name, con]

lines = fetch(LINES)
figures = []
for f in lines["features"]:
    for segment in f["geometry"]["coordinates"]:
        # Tenths are plenty for a stick figure, and it halves the digits.
        figures.append([[round(wrap(ra) * 10), round(dec * 10)] for ra, dec in segment])

used_names = {k: v for k, v in CONSTELLATIONS.items() if k in used_constellations}
# Brightest first — the readout scans in order and takes the first star that
# is actually up.
notable.sort(key=lambda i: flat[i * 4 + 2])

body = f"""// GENERATED by scripts/make-star-catalog.py — do not edit by hand.
//
// Real stars. Positions, magnitudes and colours come from the standard
// astronomical catalogues, packaged by d3-celestial (BSD-3, Olaf Frohn):
// https://github.com/ofrohn/d3-celestial
//
// STARS is flat and scaled to integers: [ra, dec, mag, bv] per star, every
// value multiplied by 100. Objects would be five times the size for the same
// four numbers, and this parses as one array rather than {len(flat) // 4}
// allocations.
//
//   ra   0..36000     right ascension, hundredths of a degree
//   dec  -9000..9000  declination
//   mag  -144..600    visual magnitude. Lower is brighter: Sirius is -144.
//   bv   -40..200     B-V colour index. Negative is blue-hot, positive is red-cool.
//
// Cut at magnitude 6.0 — the naked-eye limit under a dark sky. {len(flat) // 4} stars.
// Int32, not Int16. Right ascension in hundredths reaches 36000 and Int16
// stops at 32767, so 222 stars near the end of the sky silently wrapped to
// negative and landed on the opposite side of it.
export const STARS = Int32Array.from([{",".join(str(v) for v in flat)}]);

export const STAR_STRIDE = 4;
export const STAR_COUNT = {len(flat) // 4};

// Star index -> [name, constellation abbreviation], for the {len(labels)} stars
// brighter than magnitude {LABEL_MAG_LIMIT}. Only that far, because a fainter star is drawn
// under a pixel wide and nobody points at one on purpose.
//
// {len(labels) - unnamed_but_labelled} carry a proper name; the other {unnamed_but_labelled} carry their Bayer or
// Flamsteed designation, which is what a star chart prints. Most stars have no
// proper name and never did.
export const STAR_LABELS = {json.dumps(labels, separators=(",", ":"), ensure_ascii=False)};

// Star indices for the brightest proper-named stars, which is what the hero
// readout draws from. Sorted brightest first, so picking the best one
// currently above the horizon is a scan that stops at the first hit.
export const NOTABLE = Int32Array.from([{','.join(str(i) for i in notable)}]);

// Referenced by key rather than repeated per star: "Canis Major" is eleven
// bytes and there are a lot of stars in it.
export const CONSTELLATION_NAMES = {json.dumps(used_names, separators=(",", ":"), ensure_ascii=False)};

// The conventional constellation figures, in tenths of a degree. Each entry is
// one unbroken run of points; a constellation is usually several.
export const CONSTELLATION_LINES = {json.dumps(figures, separators=(",", ":"))};
"""

out.write_text(body)
print(f"  {out.relative_to(root)}")
print(f"  {len(flat) // 4} stars, {len(figures)} constellation segments, {out.stat().st_size / 1024:.0f} kB raw")
print(f"  {len(labels)} labelled ({len(labels) - unnamed_but_labelled} proper names, "
      f"{unnamed_but_labelled} designations) across {len(used_constellations)} constellations")
print(f"  {len(notable)} notable enough to name in the readout")
