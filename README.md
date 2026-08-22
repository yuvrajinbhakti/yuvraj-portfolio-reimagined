# Portfolio — Yuvraj Singh Nain

Personal site for [Yuvraj Singh Nain](https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/), Frontend Engineer at Razorpay.

**Live:** https://yuvraj-portfolio-reimagined.vercel.app

React 18 + Vite. One continuous scroll on the landing page, long-form case studies behind it, and a playground with a live code editor and an interactive terminal.

---

## Engineering notes

The parts of this build that involved an actual decision, rather than reaching for the default.

### Bundle: 443 kB → 158 kB gzip on first load

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

### SEO

Per-route `<title>`/description/canonical via a `useDocumentMeta` hook, Open Graph and
Twitter card tags, `Person` JSON-LD, sitemap and robots.

Known gap: nothing is prerendered, so link-preview scrapers that don't execute JS see the
homepage card on every route.

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
python3 scripts/make-covers.py
```

## Stack

React 18 · Vite 5 · React Router 6 · Tailwind CSS · framer-motion · GSAP ·
three.js / react-three-fiber / drei · EmailJS · deployed on Vercel

## License

MIT
