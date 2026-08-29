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
the barrel would pull every page, and three.js with them, back into the entry chunk.
`manualChunks` deliberately does **not** name the three.js chunk: the object form of that
option wires a chunk into the entry's static graph, which silently undoes the lazy
boundary you just drew.

What that leaves, gzipped, from the current build:

| | |
|---|---|
| Shell — preloaded on every route | `react-vendor` 53.5 + `motion-vendor` 42.0 + `gsap-vendor` 27.7 + entry 32.0 + CSS 14.3 = **169.5 kB** |
| `/` route chunk | 14.0 kB |
| Hero globe (three.js), lazy inside Home | 225.5 kB |

Known gap: the globe is above the fold but sits three requests deep — entry, then `Home`,
then `HeroAnimation` — so the largest thing on the landing page is also the last one asked
for. Preloading that chunk, or holding it behind an idle callback with a static poster,
would decouple the two.

### One WebGL context, not four

The hero globe is the only `<canvas>` on the site. Service icons were three separate
react-three-fiber canvases; they are now inline SVG with CSS keyframe idle states, which
look the same at 64 px and cost nothing. A near-identical decorative canvas behind the
CTA card was deleted outright — it duplicated the hero and dragged the full 218 kB three.js
chunk onto `/about` and `/projects`, two pages with no 3D content of their own.

### Scroll-driven animation without a scroll listener

The featured-work card stack uses CSS `view-timeline` / `animation-timeline`, so scaling
runs on the compositor with no JS on the scroll path. It degrades in three tiers:
`animation-timeline` support gives stick + scale, sticky-only browsers still get the
stack, and reduced motion or a small viewport falls back to a plain grid.

The commonly-copied stacking formula (`1.1 - 0.1 × reverse-index`) quietly assumes about
four cards — at six it scales the first card to 0.5. The scale here is computed
independently of card count and clamped to 0.88–1.0.

### The globe is `sticky`, not `fixed`

It shrinks and settles into the lower right as the hero exits, then persists for the rest
of the page. `position: fixed` cannot do this: the page-transition wrapper is a
`motion.div` carrying a transform, and a transformed ancestor becomes the containing block
for fixed descendants, so the globe scrolled away with the page. `sticky` is unaffected.

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
three.js / react-three-fiber / drei · EmailJS · deployed on Vercel

## License

MIT
