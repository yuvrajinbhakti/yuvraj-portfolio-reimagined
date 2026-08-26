/**
 * Everything the command palette can find, built from the data the pages
 * already render.
 *
 * The rule here is that nothing is retyped. Case studies come from
 * caseStudies.js, projects and social links from constants/index.js, playground
 * examples from playgroundCatalog.js — so adding a case study gives it a
 * palette entry, a prerendered file and a sitemap row with no further edits,
 * and renaming a project cannot leave a search result pointing at the old name.
 *
 * `run` is data, not a callback: `{ kind, ... }` describing what should happen,
 * interpreted by the palette. That keeps this module free of navigation and
 * clipboard concerns, which is what lets it stay a plain data import.
 *
 * `keywords` is searched but never displayed. It is where the words someone
 * would actually type go — "cv" for the About page, "AES" for the encryption
 * section — which is most of the difference between a search box and a search.
 */
import { caseStudies, sectionId } from './caseStudies';
import { PLAYGROUND_CATALOG } from './playgroundCatalog';
import { projects, skills, socialLinks, RESUME_URL } from './index';

const EMAIL = socialLinks.find((l) => l.name === 'Email')?.link.replace('mailto:', '') ?? '';
const GITHUB = socialLinks.find((l) => l.name === 'GitHub')?.link ?? '';
const LINKEDIN = socialLinks.find((l) => l.name === 'LinkedIn')?.link ?? '';

const REPO_URL = 'https://github.com/yuvrajinbhakti/yuvraj-portfolio-reimagined';

// Headings for the untyped state, in this order. Search results are a flat
// relevance-ordered list rather than grouped — see CommandPalette — so once
// something has been typed this array's only remaining job is to break ties
// between items that scored the same. Pages first, because a palette is a
// navigation tool before it is anything else.
export const GROUPS = ['Pages', 'Case studies', 'Sections', 'Projects', 'Playground', 'Actions'];

const PAGES = [
  {
    id: 'page:/',
    title: 'Home',
    subtitle: 'Frontend Engineer at Razorpay',
    keywords: 'start index landing globe intro',
    to: '/',
  },
  {
    id: 'page:/about',
    title: 'About',
    subtitle: 'Experience, background and what I build with',
    // The skill names go here so "kubernetes" or "typescript" finds the page
    // that lists them, without needing a searchable entry per technology.
    keywords: `resume cv bio career experience razorpay amazon timeline ${skills
      .map((s) => s.name)
      .join(' ')}`,
    to: '/about',
  },
  {
    id: 'page:/projects',
    title: 'Projects',
    subtitle: 'Selected engineering work, with case studies',
    keywords: 'work portfolio builds repos github side projects',
    to: '/projects',
  },
  {
    id: 'page:/playground',
    title: 'Playground',
    subtitle: 'A live code editor and an interactive terminal',
    keywords: 'demo sandbox repl editor terminal shell try run interactive',
    to: '/playground',
  },
  {
    id: 'page:/contact',
    title: 'Contact',
    subtitle: 'Get in touch about roles or collaboration',
    keywords: 'email hire reach out message availability roles job',
    to: '/contact',
  },
].map((p) => ({ ...p, type: 'page', group: 'Pages', hint: 'Page', run: { kind: 'navigate', to: p.to } }));

const CASE_STUDIES = caseStudies.map((study) => ({
  id: `study:${study.slug}`,
  type: 'case-study',
  group: 'Case studies',
  title: study.title,
  subtitle: study.tagline,
  keywords: `case study writeup ${study.stack.join(' ')} ${study.metrics
    .map((m) => m.label)
    .join(' ')}`,
  hint: 'Case study',
  run: { kind: 'navigate', to: `/work/${study.slug}` },
}));

// The single highest-value entries in here. A section is the smallest unit
// somebody is actually looking for — "how did you handle conflicts", "what was
// the encryption" — and linking to the heading means the answer is on screen
// rather than somewhere in a page they now have to read.
const SECTIONS = caseStudies.flatMap((study) =>
  study.sections.map((section) => ({
    id: `section:${study.slug}:${sectionId(section.heading)}`,
    type: 'section',
    group: 'Sections',
    title: section.heading,
    subtitle: study.title,
    // The prose itself is searchable. It is the reason typing "redis" or
    // "AES-256" lands on the paragraph that discusses it.
    keywords: section.body,
    hint: 'Section',
    run: { kind: 'navigate', to: `/work/${study.slug}#${sectionId(section.heading)}` },
  }))
);

const studyForProject = (id) => caseStudies.find((c) => c.projectId === id);

const PROJECTS = projects.map((project) => {
  const study = studyForProject(project.id);
  return {
    id: `project:${project.id}`,
    type: 'project',
    group: 'Projects',
    title: project.name,
    subtitle: project.description,
    keywords: `${project.tags.join(' ')} ${project.status} source code repository`,
    // Names what the row *is*, except when following it leaves the site, which
    // is the one thing worth saying instead.
    hint: study ? 'Project' : 'GitHub',
    // A project with a write-up opens the write-up; one without has nothing on
    // this site to show, so it goes straight to the source.
    run: study
      ? { kind: 'navigate', to: `/work/${study.slug}` }
      : { kind: 'external', href: project.source_code_link },
  };
});

// The fragment matters as much as the query string here. The editor sits well
// below the fold on /playground, so loading an example without also scrolling
// to it drops you at the top of a page and leaves you to go find the thing you
// just asked to run.
const PLAYGROUND = [
  ...PLAYGROUND_CATALOG.map((example) => ({
    id: `example:${example.key}`,
    type: 'playground',
    group: 'Playground',
    title: example.name,
    subtitle: example.description,
    keywords: `${example.category} ${example.difficulty} ${example.tags.join(' ')} run example editor code`,
    hint: 'Playground',
    run: { kind: 'navigate', to: `/playground?example=${example.key}#code-playground` },
  })),
  {
    id: 'example:terminal',
    type: 'playground',
    group: 'Playground',
    title: 'Interactive Terminal',
    subtitle: 'A shell that answers questions about my background',
    keywords: 'shell cli console ask help commands bash prompt',
    hint: 'Playground',
    run: { kind: 'navigate', to: '/playground#interactive-terminal' },
  },
];

const ACTIONS = [
  {
    id: 'action:copy-email',
    title: 'Copy email address',
    subtitle: EMAIL,
    keywords: 'clipboard contact mail address',
    run: { kind: 'copy', value: EMAIL },
  },
  {
    id: 'action:email',
    title: 'Send me an email',
    subtitle: EMAIL,
    keywords: 'mailto contact write message hire',
    run: { kind: 'external', href: `mailto:${EMAIL}` },
  },
  {
    id: 'action:resume',
    title: 'Download resume',
    subtitle: 'PDF, opens in Google Drive',
    keywords: 'cv curriculum vitae pdf download hire',
    run: { kind: 'external', href: RESUME_URL },
  },
  {
    id: 'action:github',
    title: 'Open GitHub profile',
    subtitle: 'github.com/yuvrajinbhakti',
    keywords: 'code repos source open source',
    run: { kind: 'external', href: GITHUB },
  },
  {
    id: 'action:linkedin',
    title: 'Open LinkedIn profile',
    subtitle: 'Work history and recommendations',
    keywords: 'connect network professional',
    run: { kind: 'external', href: LINKEDIN },
  },
  {
    // The kind of thing an engineer looking at a portfolio actually wants, and
    // the site has nothing to hide: the prerender plugin, the WebGL fallback
    // and the presence layer are all more interesting read than described.
    id: 'action:source',
    title: 'View the source of this site',
    subtitle: 'React, Vite, three.js — the whole repository',
    keywords: 'github repo code how built stack open source',
    run: { kind: 'external', href: REPO_URL },
  },
].map((a) => ({ ...a, type: 'action', group: 'Actions', hint: a.hint ?? 'Action' }));

export const COMMAND_ITEMS = [
  ...PAGES,
  ...CASE_STUDIES,
  ...SECTIONS,
  ...PROJECTS,
  ...PLAYGROUND,
  ...ACTIONS,
];

// Shown before anything has been typed. Not the whole index — an empty palette
// listing eighty rows is a wall, not a starting point. Pages are where most
// people are going, and the three actions below them are the ones worth a
// keystroke.
export const DEFAULT_ITEMS = [
  ...PAGES,
  ...ACTIONS.filter((a) => ['action:copy-email', 'action:resume', 'action:source'].includes(a.id)),
];

export const itemById = (id) => COMMAND_ITEMS.find((i) => i.id === id);

export default COMMAND_ITEMS;
