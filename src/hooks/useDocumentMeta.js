import { useEffect } from 'react';

export const SITE_URL = 'https://yuvraj-portfolio-reimagined.vercel.app';

const OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Keeps <title>, description, canonical and the OG/Twitter mirrors in sync with
 * the active route.
 *
 * Note this runs client-side, so it does not help crawlers that don't execute
 * JS — those read the static tags in index.html. The real per-route SEO fix is
 * prerendering the app. This exists so browser tabs, history entries and
 * bookmarks are meaningful, and so link previews are right for the crawlers
 * that do run JS.
 */
const upsert = (selector, create, attr, value) => {
  if (!value) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const meta = (key, kind = 'name') => (value) =>
  upsert(`meta[${kind}="${key}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute(kind, key);
    return el;
  }, 'content', value);

const useDocumentMeta = ({ title, description, path = '' }) => {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    if (title) document.title = title;

    meta('description')(description);
    meta('og:title', 'property')(title);
    meta('og:description', 'property')(description);
    meta('og:url', 'property')(url);
    meta('og:image', 'property')(OG_IMAGE);
    meta('twitter:title')(title);
    meta('twitter:description')(description);
    meta('twitter:image')(OG_IMAGE);

    upsert('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }, 'href', url);
  }, [title, description, path]);
};

export default useDocumentMeta;
