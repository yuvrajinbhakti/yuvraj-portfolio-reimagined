# Portfolio — Yuvraj Singh Nain

Personal site for [Yuvraj Singh Nain](https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/), Frontend Engineer at Razorpay.

**Live:** https://yuvraj-portfolio-reimagined.vercel.app

React 18 + Vite. One continuous scroll on the landing page, long-form case studies behind it, and a playground with a live code editor and an interactive terminal.

---

## Engineering notes

The parts of this build that involved an actual decision, rather than reaching for the default.

### Bundle: 26 MB of images that nothing rendered

The original barrel file in `src/assets/images/index.js` imported every image in the
directory. Vite emits an asset for each `import x from './x.png'` regardless of whether
anything consumes the export, so the build was shipping 26 MB of images that nothing
rendered. Trimming the barrel to the two images actually used took `dist/` from 33 MB to
6.9 MB.

Routes are lazy-loaded per file rather than through `src/pages/index.js` — importing from
the barrel would pull every page back into the entry chunk. `manualChunks` lists only
libraries genuinely on the entry path, because the object form of that option wires a named
chunk into the entry's static graph, which silently undoes the lazy boundary you just drew.
That mattered most for the three.js chunk, which is gone now; the rule still holds for
whatever is largest next.

What that leaves, gzipped, from the current build:

| | |
|---|---|
| Shell — preloaded on every route | `react-vendor` 53.7 + `motion-vendor` 42.0 + `gsap-vendor` 27.7 + entry 35.8 + CSS 14.9 = **174.1 kB** |
| Shared chunk — star catalogue + route meta, on every page | 55.0 kB |
| `/` route chunk | 14.5 kB |

Known gap: nearly all of that shared chunk is the star catalogue — 5,044 positions and 519
names, stored as decimal text. It gzips well, but a delta-encoded binary form would do
better, and it is fetched on `/contact` as readily as on `/`.

### No WebGL at all

There is one `<canvas>` on the site and it is 2D. Getting there took three passes.

Service icons were three separate react-three-fiber canvases; they are now inline SVG with
CSS keyframe idle states, which look the same at 64 px and cost nothing. A near-identical
decorative canvas behind the CTA card was deleted outright — it duplicated the hero and
dragged the full three.js chunk onto `/about` and `/projects`, two pages with no 3D content
of their own.

The hero globe outlasted both, then went the same way. It was the largest thing on the
landing page by a wide margin — 225.5 kB gzip against a 173.7 kB shell — for a rotating
sphere sitting behind the headline, and it needed a four-stop dark gradient across the
whole viewport to keep that headline legible over it. That scrim was also dimming the sky
behind it. Removing the globe removed `three`, `@react-three/fiber` and `@react-three/drei`
(65 packages), the WebGL support-detection probe, the error boundary that existed to survive
a refused context, the `modulepreload` plugin that existed to pull its chunk forward, and
`assetsInclude: ['**/*.glb']` for a format the repo does not contain.

Two decorative skies were competing above the fold. Only one of them was real.

### Scroll-driven animation without a scroll listener

The featured-work card stack uses CSS `view-timeline` / `animation-timeline`, so scaling
runs on the compositor with no JS on the scroll path. It degrades in three tiers:
`animation-timeline` support gives stick + scale, sticky-only browsers still get the
stack, and reduced motion or a small viewport falls back to a plain grid.

The commonly-copied stacking formula (`1.1 - 0.1 × reverse-index`) quietly assumes about
four cards — at six it scales the first card to 0.5. The scale here is computed
independently of card count and clamped to 0.88–1.0.

### Motion has an off switch that actually works

`prefers-reduced-motion` is honoured across six independent layers — framer-motion
(`MotionConfig reducedMotion="user"`), GSAP timelines, CSS keyframes, the canvas starfield,
scroll-bound parallax, and `scrollTo` behaviour.

Parallax needed special handling: it is a scroll-bound *style binding*, not an animation, so
`MotionConfig` can't switch it off. The transform ranges are flattened to zero instead.
GSAP needed the opposite care — it sets `opacity: 0` before animating, so naively skipping
the animation leaves the page permanently blank. Both skip paths clear the initial state.

### Accessibility

Keyboard and screen-reader support is deliberate, not incidental:

- Skip link, and `<main>` scoped to the routed page rather than wrapping the nav and footer
- `:focus-visible` rings defined with `:where()` so they carry zero specificity and can't
  be accidentally overridden
- framer-motion wrappers with tap handlers are `tabIndex={-1}` — they become focusable
  otherwise, putting a role-less tab stop in front of every link
- Mobile menu is a real dialog: focus trap, Escape to dismiss, focus returned to the trigger
- Contact form status is an unconditionally-mounted `role="status"` region, because screen
  readers only announce changes to a region that already existed
- Pinch zoom is not blocked (`maximum-scale` removed — WCAG 1.4.4)
- The 404 page does not redirect on a timer

Verified: 22 distinct text styles, zero contrast failures against the page background; no
horizontal overflow from 375 px up.

### SEO: a real HTML file per route

Per-route `<title>`/description/canonical via a `useDocumentMeta` hook, Open Graph and
Twitter card tags, `Person` JSON-LD, sitemap and robots.

The hook alone was not enough. This is a single-page app, so the server returned the same
`index.html` for every URL and React filled in the rest — which means anything that does not
execute JavaScript (LinkedIn, WhatsApp, Slack, iMessage, the Twitter card fetcher) read that
file and stopped. Every link shared from the site showed the homepage's card, including links
to the case studies, which are the best writing on it.

A build-time plugin in `vite.config.js` now copies `dist/index.html` once per route and swaps
the tags, so `/about` is served from `dist/about/index.html` with About's own meta already in
the markup. Humans get the identical React app; the crawler gets the truth on the first
request.

It is deliberately meta-only. Rendering each route's *body* to static HTML needs a headless
browser, which is slow, adds a heavy dependency, and breaks whenever a component touches
`window` during render — and Google executes JS, so it already sees the content. The meta was
the part that was actually broken.

Routes and the sitemap come from one array (`src/constants/routeMeta.js`), which the hook and
the plugin both read, so a route cannot be prerendered and then forgotten in the sitemap —
which is exactly what had happened before.

### ⌘K: search, not just navigation

Five pages, six projects, two long case studies and three playground examples, and until
recently the only way to any of them was clicking through the nav bar. `Cmd/Ctrl-K` — or `/`
outside a text field — opens a palette over every one of them, plus each *section* of each
case study, which is the smallest unit anyone is actually looking for: "how did you handle
conflicts" is a heading, not a page, and linking to the heading puts the answer on screen.

The index (`src/constants/commandIndex.js`) is built from the data the pages already render,
so adding a case study gives it a palette entry with no further edits and renaming a project
cannot leave a result pointing at the old name.

It costs nothing until used: the component and the index are one lazy chunk (5.8 kB gzip), and
the import is warmed on the keydown of Cmd or Ctrl — which arrives before the K does, so the
first press opens it rather than showing a blank frame.

Results are one flat list in score order, deliberately ungrouped. Grouping looked tidier and
ranked worse: whichever group held the best match got drawn first *in its entirety*, so ten
passing mentions inside case-study prose pushed an exactly-named result below the fold.
The matcher (`src/utils/search.js`) scores a verbatim substring an order of magnitude above a
scattered one, and requires a scattered match to begin a word — the line between an
abbreviation and a coincidence, and the difference between "aes" finding the encryption
section and "aes" finding *C·a·re Car R·e·ntal Web·s·ite*.

### The background is the real sky

Not a random scatter. 5,044 real stars from the standard astronomical
catalogues, each at its true right ascension and declination, drawn at its true
visual magnitude and coloured by its actual B–V index — so Arcturus is orange
because Arcturus *is* orange, and Sirius is the brightest thing on the page
because it is the brightest thing in the sky.

They are placed for **Chandigarh, at your local time**. The conversion from
catalogue coordinates to what an observer sees runs through local sidereal time
(`src/utils/sky.js`), so the sky turns as the Earth does — about 61% of it
changes over twelve hours, and someone opening the site at 3am sees a genuinely
different one from someone opening it at 8pm. Constellation figures are drawn
underneath at the edge of visible.

The maths is checked against invariants rather than eyeballed: Polaris sits at
the observer's latitude at every hour (deviating by 0.74°, which is Polaris's
true distance from the pole), a star culminates at exactly 90° − |lat − dec|,
sidereal time gains 0.9856° a day on solar, and GMST at J2000.0 comes out at the
published 280.46°.

Star and constellation data from [d3-celestial](https://github.com/ofrohn/d3-celestial)
(BSD-3, Olaf Frohn), trimmed by `scripts/make-star-catalog.py` from 656 kB of
GeoJSON to a flat integer array.

#### Getting it to look like one

Correct positions are not the same thing as a sky, and the gap between them was
four measurable mistakes rather than a matter of taste.

The canvas was sized in **CSS pixels while the display had two device pixels per
one**, so the entire field was rendered at half resolution and bilinearly
upscaled — and most of a star catalogue is sub-pixel. That is the difference
between a point and a grey smudge. The floor on star size is now expressed in
*device* pixels and divided back out, because "the smallest mark the rasteriser
still draws as a point" is a property of the rasteriser, not of the layout.

**Scale was tied to viewport size**, holding the field of view constant, which
magnifies the same sky onto a bigger screen: 1,250 stars over 2.9× the area,
which reads as an empty one. Pinning it instead means a larger window shows more
sky, which is what a larger window does. Counted, at the same instant:

| | 1920×1080 | 1440×900 | 390×844 |
|---|---|---|---|
| field-locked | 1250 | 1379 | 1191 |
| scale-locked | **1867** | **1495** | 946 |

Stars are **added, not painted** — `globalCompositeOperation = 'lighter'`. Under
the default, a meteor's own faint trail erased every star it crossed, and dense
regions looked no denser than sparse ones because each star was replacing its
neighbour's glow instead of adding to it.

And the **camera tilt is derived, not chosen**. Everything below the horizon is
culled, correctly, but at a fixed elevation the horizon itself fell inside the
frame on every common viewport and left a starless band across the bottom fifth
of the page. Solving the stereographic relation for the frame's own half-height
gives the angle its bottom edge reaches; pointing six degrees above that keeps
the horizon out of shot at any aspect ratio. A tall phone sees far more vertical
sky than a laptop, so this is the one number that cannot be a constant.

What makes a bright star read as a light source rather than a large dot is a
white core inside a coloured halo, plus diffraction spikes — the core saturates
whatever is receiving it while the light spread into the wings keeps its hue,
which is also why Betelgeuse looks orange to the naked eye and a magnitude-5
star of the same temperature does not. Composed live that is two radial
gradients and four polygons per star, about a quarter of a million gradient
objects a second. Each distinct (brightness, colour) pair is instead drawn once
into its own small canvas and blitted, built on demand because the largest
sprites are also the rarest: there are four stars in the entire sky brighter
than magnitude zero. Spikes are rationed to about two dozen stars, which is what
keeps them meaning something.

Measured at 1440×900: 180 consecutive frames, median 16.7 ms, **zero over 20 ms**.

#### The sky only existed on the first screenful

The canvas is `position: fixed`, and a scroll handler was also writing
`translateY(scrollY)` onto it — so it slid out of the viewport at exactly the
rate the page scrolled. At scrollY 1215 its bounding box measured y=1215, fully
off screen. Everything written to make the descent mean something — the depth
gradient, the nebula thickening, the per-star parallax — was being computed
every frame for a surface nobody could see, and it went unnoticed because the
hero globe used to carry the rest of the page on its own. A fixed canvas needs
no scroll handling; deleting the one line was the whole fix.

Which then exposed a second thing: the bottom of that gradient was
`rgb(26, 16, 56)` — red above green, blue clear of both, which is violet — and
it turned the entire lower half of the page purple the moment it became visible.
Worst-case text contrast against the lightest 1% of the corrected sky is 6.6:1,
across all seven text colours the page actually renders.

#### The claim nobody could check

All of the above made a real sky, and a visitor had no way to know it was one —
it looked exactly like a particle field with a good palette. Every other claim
on this site has its evidence attached: the case studies carry measured numbers,
the OT write-up carries a button that runs the algorithm. This was the one
remarkable claim with no surface at all.

So the sky says what it is. Bottom-left of the hero, quietly:

```
Chandigarh · 05:22 pm IST
Arcturus, 70° above the south-west
```

and pointing at any of the 519 stars brighter than magnitude 4 names it —
`Vega · Lyra · 53° NE`. Both are either true against any sky app right now or
they are not.

The names come from the same source as the positions, joined on Hipparcos
number: `stars.6.json` carries an `id` per star and nothing else useful,
`starnames.json` is keyed by it. 304 have a proper name; the other 215 carry
their Bayer or Flamsteed designation, which is what a star chart prints —
most stars have no proper name and never did. Only to magnitude 4, and that is
an aiming decision rather than a size one: a magnitude 5 star is drawn under a
pixel wide, so shipping 5,044 names would be paying for a hover that cannot
fire. The readout draws from a smaller list still — the 49 proper-named stars
brighter than magnitude 2, because a Greek letter is a real identity but reads
as noise in a sentence.

The hit test costs nothing measurable: the nearest named star is found inside
the loop that is already computing every drawn position, and only for stars
that carry a name, so it is a property check before it is any arithmetic. With
the pointer moving every 16 ms: 180 frames, median 16.7 ms, zero over 20 ms.

### The footer met the sky badly

Two things, both measured at 1440×900.

**459 of 1216 px — 38% of the row — was gap.** `grid-cols-[1.4fr_1fr_auto]`
handed the brand column 595px to hold 310px of text and flung three 20px icons
into the far corner under a full-size section heading. It did not read as
whitespace; it read as three blocks that had failed to meet. Sizing the tracks
to their content does not fix it either — `auto` tracks absorb the leftover
space, so packing the content just moves the chasms. Two groups pushed to the
two edges does: one deliberate 503px gutter, zero trailing slack, and the brand
now sits above the copyright and the links above the email, so the row below is
anchored to the same two edges.

**The sky stopped dead at the top of it.** `backdrop-blur-lg bg-white/5` under a
1px border smeared the stars behind it into grey and lifted the black. Against a
flat background that glass read as a panel; against a real star field it read as
frosted glass taped over the window. A gradient replaces it — transparent at the
top, deepening under the type — and the field carries through.

One real defect fell out of looking: on a 390×844 phone scrolled to the very
end, the email link ran 38→352 at y 784–818 while the audio button (16→52) and
the cursor pill (343→374) both sat on top of it from 792 down. The primary way
to contact him was covered at both ends and half its tap target was
unreachable. The two controls occupy the bottom 52px; the footer now clears
them.

### Live cursors that are actually other people

The cursor layer draws two things: peers reading the same page right now, and a replay of the
visitor's own earlier pointer path. The ghost half exists because a portfolio is usually being
read by exactly one person, and it means nothing is ever faked — the page never stages a crowd
that does not exist.

The live half used to be BroadcastChannel only, which reaches the visitor's own tabs and
nothing else. `presence/` is the relay that makes it real: a Cloudflare Worker holding one
hibernating Durable Object, forwarding positions between people on the same route and storing
nothing. `src/utils/presenceTransport.js` fans identical messages over both pipes at once, so
the rest of the feature never learned there was a network.

**The site does not depend on it.** With `VITE_PRESENCE_URL` unset no socket is opened and the
layer is exactly the local-only feature it was — which is also the failure mode if the relay
is down. See [`presence/README.md`](presence/README.md) to deploy it.

Positions travel normalised — `x` against the viewport width, `y` against the full document
height — so a peer on a different window size and scroll position lands on the same paragraph
rather than the same pixel. Someone scrolled elsewhere is simply off-screen, which is the
honest answer.

---

## Running it

```bash
npm install
npm run dev
```

Dev server: http://localhost:5173

```bash
npm run build     # → dist/
npm run preview   # serve the production build
npm run lint
```

Requires Node 18+.

### Contact form

The form posts through EmailJS. Without these it renders and validates but won't send —
create a `.env` (gitignored):

```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

See [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) and [EMAILJS_SETUP.md](EMAILJS_SETUP.md).

### Cursor presence (optional)

```
VITE_PRESENCE_URL=wss://ysn-presence.<subdomain>.workers.dev/presence
```

Unset, the cursor layer falls back to BroadcastChannel and nothing is sent anywhere. Vite
inlines `VITE_` variables at build time, so setting this on the host needs a rebuild, not a
restart. `.env.example` lists both groups; [`presence/README.md`](presence/README.md) covers
deploying the relay.

---

## Layout

```
src/
├── Components/       Shared UI — cards, nav, footer, canvas layers, playground
├── assets/
│   ├── covers/       Project covers generated by scripts/make-covers.py
│   └── icons/        Tech + social icons
├── constants/
│   ├── index.js      Skills, experience, projects, social links
│   └── caseStudies.js  Long-form write-ups behind /work/:slug
├── hooks/
│   └── useDocumentMeta.js  Per-route document metadata
├── pages/            Home, About, Projects, CaseStudy, Interactive, Contact, NotFound
├── utils/            EmailJS client and form validation
└── index.css         Tailwind layers + scroll-driven animation, glass, focus, motion tokens
scripts/
└── make-covers.py    Regenerates src/assets/covers/ from the source icons
```

### Project covers

Source icons range from 200–612 px with mismatched backgrounds, and the cards render them
around 840×900 on a 2× display — roughly 4× upscaling. `scripts/make-covers.py` composites
each mark at native size onto a consistent dark tile at the real render resolution, and
normalises value so nothing blows out against the near-black card: neutral-light artwork is
inverted, saturated artwork only dimmed, since inverting a brand colour would misrepresent
it. Luminance spread across the six covers: 185 → 96.

Rerun after changing an icon:

```bash
python3 scripts/make-covers.py src/assets/icons src/assets/covers
```

Requires Pillow. The mark is sized by `tile_px` in that script rather than
padded in CSS — the card renders the cover full-bleed, so padding it at the
render layer leaves the cover's own background showing as a hard-edged square.

## Stack

React 18 · Vite 5 · React Router 6 · Tailwind CSS · framer-motion · GSAP ·
Canvas 2D · EmailJS · deployed on Vercel

## License

MIT
