/**
 * What each playground example is, separated from the example itself.
 *
 * playgroundExamples.js is 16 kB of HTML, CSS and JavaScript source held in
 * template literals, and the command palette needs six words per example to
 * make them searchable. Importing the examples to get at their names would put
 * all three programs into a shared chunk that the palette then has to download
 * on ⌘K — roughly 6 kB gzip to render three list rows.
 *
 * So the metadata lives here and the code imports it, rather than the other way
 * round. One source of truth, and the palette pays for the part it uses.
 */

export const PLAYGROUND_CATALOG = [
  {
    key: 'operational-transform',
    name: 'Operational Transform',
    category: 'Algorithms',
    description: 'How two people type in the same line without either losing a keystroke',
    difficulty: 'Advanced',
    tags: ['JS', 'Algorithms', 'Real-time'],
  },
  {
    key: 'rupee-input',
    name: 'Rupee Input',
    category: 'Payments',
    description: 'Lakh/crore grouping with the caret where you left it',
    difficulty: 'Intermediate',
    tags: ['JS', 'i18n', 'Forms'],
  },
  {
    key: 'payment-states',
    name: 'Payment Lifecycle',
    category: 'Payments',
    description: 'Authorised, captured, settled — and every way it goes wrong',
    difficulty: 'Intermediate',
    tags: ['JS', 'State machines', 'Payments'],
  },
];

export const catalogFor = (key) => PLAYGROUND_CATALOG.find((e) => e.key === key);

export default PLAYGROUND_CATALOG;
