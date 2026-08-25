import { useEffect } from 'react';
import { SITE_URL, OG_IMAGE, getRouteMeta } from '../constants/routeMeta';

export { SITE_URL };

/**
 * Keeps <title>, description, canonical and the OG/Twitter mirrors in sync with
 * the active route.
 *
 * This runs client-side, so it is not what fixes link previews — crawlers that
 * don't execute JS read the static tags in the prerendered file the build
 * writes for each route (see the plugin in vite.config.js). Both read the same
 * array in constants/routeMeta.js, so the two cannot disagree.
 *
 * What this covers is the part prerendering cannot: navigation. Moving between
 * routes in an already-loaded app never fetches a new document, so without this
 * the tab title, the history entry and a bookmark would all keep saying
 * whatever the first page said.
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

/**
 * Pass a `path` on its own and the title and description come from routeMeta,
 * which is the same array the build-time prerender uses. Passing them
 * explicitly still works, for the routes that are not in that list — the 404,
 * and a case study slug that does not resolve.
 */
const useDocumentMeta = ({ title, description, path = '' }) => {
  useEffect(() => {
    const fromRoutes = getRouteMeta(path);
    const finalTitle = title ?? fromRoutes?.title;
    const finalDescription = description ?? fromRoutes?.description;
    const url = `${SITE_URL}${path}`;

    if (finalTitle) document.title = finalTitle;

    meta('description')(finalDescription);
    meta('og:title', 'property')(finalTitle);
    meta('og:description', 'property')(finalDescription);
    meta('og:url', 'property')(url);
    meta('og:image', 'property')(OG_IMAGE);
    meta('twitter:title')(finalTitle);
    meta('twitter:description')(finalDescription);
    meta('twitter:image')(OG_IMAGE);

    upsert('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }, 'href', url);
  }, [title, description, path]);
};

export default useDocumentMeta;
