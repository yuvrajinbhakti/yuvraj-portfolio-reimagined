import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { ROUTES, SITE_URL, OG_IMAGE } from './src/constants/routeMeta.js'

/**
 * Writes a real HTML file for every route, and regenerates the sitemap.
 *
 * The problem it solves: this is a single-page app, so the server returns the
 * same index.html for every URL and React fills in the rest. Anything that does
 * not execute JavaScript — LinkedIn, WhatsApp, Slack, iMessage, the Twitter
 * card fetcher — reads that file and stops. Every link shared from this site
 * therefore showed the homepage's title and description, including links to the
 * case studies, which are the best writing on it.
 *
 * So: after the bundle is built, copy dist/index.html once per route and swap
 * the tags. /about is served from dist/about/index.html with About's own meta
 * already in the markup. Humans still get the identical React app; the crawler
 * gets the truth on the first request.
 *
 * Deliberately meta-only. Rendering each route's *body* to static HTML needs a
 * headless browser, which is slow, adds a heavy dependency, and breaks whenever
 * a component touches window during render. Google executes JS and already sees
 * the content, so the body buys little; the meta is the part that is actually
 * broken.
 */
// A PRELOAD_BY_ROUTE map used to live here, emitting a <link rel="modulepreload">
// so the hero globe's 226 kB chunk was requested alongside the entry instead of
// three round trips behind it. The globe is gone and nothing else on any route
// is large enough to be worth pulling forward, so the map and the code reading
// it went with it rather than staying as an empty object.

// Values are interpolated into markup, so they get escaped on the way in. None
// of the current strings contain a quote or an ampersand, which is exactly why
// it is worth doing now — the first description with an "&" in it would
// otherwise produce invalid markup that nothing would flag.
const escapeText = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escapeAttr = (value) => escapeText(value).replace(/"/g, '&quot;')

const prerenderRoutes = () => ({
  name: 'prerender-routes',
  apply: 'build',
  // writeBundle rather than closeBundle: it runs once dist/index.html is on
  // disk.
  writeBundle() {
    const outDir = resolve(process.cwd(), 'dist')
    const shell = readFileSync(resolve(outDir, 'index.html'), 'utf-8')

    // Anchored to the attribute that identifies each tag, so swapping og:title
    // cannot accidentally match twitter:title or the <title> element.
    //
    // Every replacement is a function. A string replacement would treat `$&`,
    // `$1` and `$'` inside a title or description as backreferences and splice
    // parts of the match back into the output.
    const swap = (html, { title, description, url }) =>
      html
        .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeText(title)}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, (_m, a, b) => `${a}${escapeAttr(description)}${b}`)
        .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, (_m, a, b) => `${a}${escapeAttr(url)}${b}`)
        .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, (_m, a, b) => `${a}${escapeAttr(url)}${b}`)
        .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, (_m, a, b) => `${a}${escapeAttr(title)}${b}`)
        .replace(/(<meta\s+property="og:description"\s*\n?\s*content=")[\s\S]*?(")/, (_m, a, b) => `${a}${escapeAttr(description)}${b}`)
        .replace(/(<meta\s+name="twitter:title"\s+content=")[\s\S]*?(")/, (_m, a, b) => `${a}${escapeAttr(title)}${b}`)
        .replace(/(<meta\s+name="twitter:description"\s*\n?\s*content=")[\s\S]*?(")/, (_m, a, b) => `${a}${escapeAttr(description)}${b}`)

    let written = 0
    for (const route of ROUTES) {
      const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
      const html = swap(shell, { title: route.title, description: route.description, url })

      // "/" is dist/index.html itself; everything else becomes a directory with
      // an index.html, which is what static hosts serve for a clean URL.
      const file =
        route.path === '/'
          ? resolve(outDir, 'index.html')
          : resolve(outDir, `.${route.path}`, 'index.html')

      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, html)
      written++
    }

    // Sitemap from the same array, so a new route cannot be prerendered and
    // then forgotten here — which is exactly what had happened before.
    const today = new Date().toISOString().slice(0, 10)
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
).join('\n')}
</urlset>
`
    writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap)

    console.log(`\n  prerendered ${written} routes + sitemap (og image: ${OG_IMAGE})`)
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), prerenderRoutes()],
  // `assetsInclude: ['**/*.glb']` went with three.js. There is not a single
  // .glb in the repo and there has not been for some time.
  build: {
    rollupOptions: {
      output: {
        // Only libraries that are genuinely on the entry path are listed here —
        // naming a chunk in this object makes Rollup wire it into the entry's
        // static graph, so listing three here would get it preloaded on every
        // page even though it is reached exclusively through lazy(). Left
        // unlisted, Rollup emits it as its own chunk behind the dynamic import.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['framer-motion'],
          'gsap-vendor': ['gsap'],
        },
      },
    },
  },
})
