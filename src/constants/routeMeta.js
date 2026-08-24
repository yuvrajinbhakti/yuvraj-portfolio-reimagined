/**
 * One description of every route, used twice.
 *
 * At runtime `useDocumentMeta` reads it to set the document title as you
 * navigate. At build time the prerender plugin in vite.config.js reads the same
 * array to write a real HTML file per route, with that route's tags already in
 * it, and to generate the sitemap.
 *
 * The point of a single source is that the two cannot drift. Previously each
 * page carried its own strings and the sitemap was maintained by hand, so a
 * page could be renamed and its sitemap entry would quietly go stale.
 *
 * IMPORTANT: this module is imported by vite.config.js, which runs in Node. It
 * must therefore never import anything Node cannot resolve — no images, no CSS,
 * no components. caseStudies.js is plain data, which is why it is safe here.
 */
import { caseStudies } from './caseStudies';

export const SITE_URL = 'https://yuvraj-portfolio-reimagined.vercel.app';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

const STATIC_ROUTES = [
  {
    path: '/',
    title: 'Yuvraj Singh Nain | Frontend Engineer',
    description:
      'Frontend Engineer at Razorpay. I build merchant-facing analytics dashboards in React and TypeScript, and real-time collaborative systems on the side.',
    priority: '1.0',
    changefreq: 'monthly',
  },
  {
    path: '/about',
    title: 'About | Yuvraj Singh Nain',
    description:
      'Frontend Engineer at Razorpay and Amazon ML Summer School alumnus. My experience, engineering background and the technologies I build with.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/projects',
    title: 'Projects | Yuvraj Singh Nain',
    description:
      'Selected engineering work — a real-time collaborative code editor, a secure file-sharing service, a Flutter finance app, and more. Source and case studies for each.',
    priority: '0.9',
    changefreq: 'monthly',
  },
  {
    path: '/playground',
    title: 'Playground | Yuvraj Singh Nain',
    description:
      'A live editor and an interactive terminal. Run Operational Transform, an Indian rupee input, and a payment state machine directly in the browser.',
    priority: '0.6',
    changefreq: 'monthly',
  },
  {
    path: '/contact',
    title: 'Contact | Yuvraj Singh Nain',
    description: 'Get in touch about roles or collaboration.',
    priority: '0.7',
    changefreq: 'yearly',
  },
];

// Case studies come from the same data the pages render, so adding one gives it
// a prerendered file and a sitemap entry with no further edits.
const CASE_STUDY_ROUTES = caseStudies.map((study) => ({
  path: `/work/${study.slug}`,
  title: `${study.title} | Yuvraj Singh Nain`,
  description: study.tagline,
  priority: '0.9',
  changefreq: 'monthly',
}));

export const ROUTES = [...STATIC_ROUTES, ...CASE_STUDY_ROUTES];

export const getRouteMeta = (path) => ROUTES.find((r) => r.path === path);

export default ROUTES;
