/**
 * Ranked matching for the command palette, with the matched character
 * positions handed back so the caller can highlight them.
 *
 * Two kinds of match, deliberately scored an order of magnitude apart:
 *
 *   substring   — the query appears verbatim somewhere in the text. Typing
 *                 "trans" against "Operational Transform" is someone who knows
 *                 what they are looking for, and that should always outrank a
 *                 scattered match.
 *   subsequence — the query's characters appear in order but not together, so
 *                 "otr" still finds "Operational Transform". This is what makes
 *                 a palette feel fast to a keyboard user, and it is also what
 *                 produces junk if it is allowed to compete with the real hits.
 *
 * No dependency for this. fuse.js is 12 kB gzip and solves a harder problem
 * than eighty items with three fields each; the tuning below is the actual
 * work, and a library would not have saved any of it.
 */

// Anything that is not a letter or a digit begins a new word, so "real-time",
// "real time" and "real_time" all let a query match at the start of "time".
// Matching a word start is most of what separates a useful hit from a
// coincidental one.
const BOUNDARY = /[^a-z0-9]/;

/** Merge overlapping/adjacent [start, end) pairs, copying rather than aliasing. */
const mergeRanges = (ranges) => {
  if (ranges.length < 2) return ranges.map((r) => [...r]);
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out = [[...sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const [start, end] = sorted[i];
    // <= rather than <: two runs that merely touch are one run to a reader.
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else out.push([start, end]);
  }
  return out;
};

/**
 * Score one search term against one string. Returns null when the term does
 * not appear at all, which is what lets the caller require every term to land.
 */
export const matchTerm = (term, text) => {
  if (!term) return { score: 0, ranges: [] };
  if (!text) return null;

  const t = text.toLowerCase();
  const q = term.toLowerCase();

  const at = t.indexOf(q);
  if (at !== -1) {
    let score = 1000;
    if (at === 0) score += 500; // the text starts with what was typed
    else if (BOUNDARY.test(t[at - 1])) score += 300; // ...or a word inside it does
    score -= Math.min(at, 60) * 3; // a hit buried deep in a sentence is weaker
    // Coverage: "Contact" fully matched by "contact" beats a seven-character
    // hit inside a two-hundred-character description.
    score += Math.round((q.length / t.length) * 250);
    return { score, ranges: [[at, at + q.length]] };
  }

  // Greedy left-to-right subsequence. Not the optimal alignment — finding that
  // is quadratic and the difference is invisible at this scale — but the
  // bonuses below recover most of what greediness gives away.
  const hits = [];
  let from = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, from);
    if (found === -1) return null;
    hits.push(found);
    from = found + 1;
  }
  if (!hits.length) return { score: 0, ranges: [] };

  // A scattered match has to at least begin a word. This is the line between an
  // abbreviation and a coincidence: "ot" finding "Operational Transform" starts
  // on the O of a word and is what somebody meant, while "aes" finding
  // "C-a-re Car R-e-ntal Web-s-ite" starts mid-word and is three letters that
  // happened to appear in order. Without it every short query drags a tail of
  // unrelated rows behind the results that are actually right.
  if (hits[0] !== 0 && !BOUNDARY.test(t[hits[0] - 1])) return null;

  let score = 200;
  let run = 0;
  for (let i = 0; i < hits.length; i++) {
    const idx = hits[i];
    // Characters that landed next to each other are worth more than the same
    // characters scattered across the string.
    run = i > 0 && idx === hits[i - 1] + 1 ? run + 1 : 0;
    score += run * 15;
    if (idx === 0) score += 40;
    else if (BOUNDARY.test(t[idx - 1])) score += 30; // matched an initial
  }
  score -= Math.min(hits[0], 40) * 2; // starting late is worse than starting early
  score -= Math.min(t.length, 160) / 4; // between equal matches, prefer the shorter target

  return { score, ranges: mergeRanges(hits.map((i) => [i, i + 1])) };
};

/**
 * Score a whole item, given its searchable fields.
 *
 * `fields` is [{ text, weight, primary }]. Only `primary` fields contribute
 * highlight ranges, because the ranges are drawn on the title and an offset
 * taken from the description would land on the wrong characters.
 */
export const scoreFields = (query, fields) => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return { score: 0, ranges: [] };

  let total = 0;
  const ranges = [];

  for (const term of terms) {
    let best = null;
    for (const field of fields) {
      if (!field?.text) continue;
      const hit = matchTerm(term, field.text);
      if (!hit) continue;
      const weighted = hit.score * (field.weight ?? 1);
      if (!best || weighted > best.weighted) best = { weighted, hit, field };
    }
    // Every word typed has to land somewhere on this item. Without it, "code
    // editor" would rank everything matching just "code" alongside the one
    // thing that matches both words, which is the result you actually wanted.
    if (!best) return null;
    total += best.weighted;
    if (best.field.primary) ranges.push(...best.hit.ranges);
  }

  // Averaged, not summed: otherwise typing more words inflates the score of
  // every surviving item equally and the ranking stops meaning anything.
  return { score: total / terms.length, ranges: mergeRanges(ranges) };
};

/**
 * Split text into `{ text, match }` segments for rendering. Returned as data
 * rather than as markup so the caller decides how a match is drawn, and so
 * nothing here has to build HTML out of user input.
 */
export const highlight = (text, ranges) => {
  if (!ranges?.length) return [{ text, match: false }];
  const out = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) out.push({ text: text.slice(cursor, start), match: false });
    out.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), match: false });
  return out;
};
