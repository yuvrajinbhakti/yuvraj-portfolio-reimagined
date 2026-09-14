import { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * The one claim on this site a visitor can check themselves.
 *
 * Everything else here is assertion. "Built a collaborative editor" is a
 * sentence; so is "operational transformation"; so is every number in every
 * case study. A reader can believe them or not, and has no way to tell which
 * they should do — which is the ordinary condition of reading a portfolio, and
 * the reason most of them are skimmed rather than read.
 *
 * This runs the correctness proof for ot-core in the reader's own browser, on
 * their own machine, against a seed they can change. Ten thousand pairs of
 * concurrent edits, each applied in both orders, each pair checked for landing
 * on the same string. It is not a recording and it is not a claim about a test
 * suite that ran somewhere else once.
 *
 * The "break it" control matters as much as the pass. A test that cannot fail
 * proves nothing, and a green counter with no red counterpart is exactly what
 * a fabricated one would look like. ot-core ships an identity transform for
 * this — a transform that returns operations untouched — and swapping it in
 * diverges roughly half the pairs. Being able to watch it go red is what makes
 * the green mean anything.
 *
 * The library is imported on click, not on mount: nobody who does not press
 * the button pays a byte for it.
 */

const PAIRS = 10_000;

/** Rendered for a divergence, which only the broken transform produces. */
const Example = ({ example }) => {
  if (!example) return null;
  const { doc, a, b, left, right } = example;
  const op = (o) =>
    o.type === 'insert'
      ? `insert ${JSON.stringify(o.content)} at ${o.position}`
      : `delete ${o.length} at ${o.position}`;

  return (
    <div className="mt-4 rounded-lg border border-rose-400/25 bg-rose-950/25 p-3 sm:p-4 text-left font-mono text-[11px] sm:text-xs leading-relaxed">
      <div className="text-white/45">document</div>
      <div className="text-white/90 break-all">{JSON.stringify(doc)}</div>
      <div className="mt-2 text-white/45">the two edits, made at the same moment</div>
      <div className="text-white/80">you · {op(a)}</div>
      <div className="text-white/80">them · {op(b)}</div>
      <div className="mt-2 text-white/45">and where each of you ended up</div>
      <div className="text-rose-300 break-all">yours · {JSON.stringify(left)}</div>
      <div className="text-rose-300 break-all">theirs · {JSON.stringify(right)}</div>
    </div>
  );
};

const opShape = PropTypes.shape({
  type: PropTypes.string,
  position: PropTypes.number,
  content: PropTypes.string,
  length: PropTypes.number,
});

Example.propTypes = {
  example: PropTypes.shape({
    doc: PropTypes.string,
    a: opShape,
    b: opShape,
    left: PropTypes.string,
    right: PropTypes.string,
  }),
};

const ConvergenceProof = () => {
  const reduce = useReducedMotion();
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(42);
  const fuzz = useRef(null);

  // One dynamic import, cached. The module is a few kilobytes and it is the
  // real published package — the same code the demo and the library's own test
  // run against, not a copy written to look convincing in a portfolio.
  const load = useCallback(async () => {
    if (!fuzz.current) fuzz.current = await import('ot-core/fuzz');
    return fuzz.current;
  }, []);

  const run = useCallback(
    async (broken) => {
      setRunning(true);
      try {
        const { checkConvergence, identityTransform } = await load();
        // A frame, so the button's pressed state paints before the main thread
        // is taken. The work itself is tens of milliseconds; the point of
        // yielding is honesty about which part is slow, not the speed.
        await new Promise((r) => requestAnimationFrame(() => r()));
        const out = checkConvergence({
          pairs: PAIRS,
          seed,
          ...(broken ? { transform: identityTransform } : {}),
        });
        setResult({ ...out, broken, seed });
      } catch (err) {
        setResult({ error: err?.message || 'could not load ot-core' });
      } finally {
        setRunning(false);
      }
    },
    [load, seed]
  );

  const passed = result && !result.error && result.divergences === 0;
  const failed = result && !result.error && result.divergences > 0;

  return (
    <div className="text-left max-w-2xl mx-auto">
      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
        Two people edit the same text at the same moment, and their edits reach
        each other in opposite orders. Left alone, they end up with different
        documents — permanently. Operational transformation rewrites each edit
        against the other so both sides land on the same string. That property
        is called <span className="text-white">convergence</span>, and it is the
        whole job.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3 sm:p-4 font-mono text-[11px] sm:text-xs leading-relaxed">
        <div className="text-white/45">both of you start from</div>
        <div className="text-white/90">&quot;cat&quot;</div>
        <div className="mt-2 text-white/80">you · insert &quot;s&quot; at 3</div>
        <div className="text-white/80">them · delete 1 at 0</div>
        <div className="mt-2 text-white/45">either order has to give</div>
        <div className="text-emerald-300">&quot;ats&quot;</div>
      </div>

      <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed">
        Below runs that check {PAIRS.toLocaleString()} times against randomly
        generated edits, in your browser, right now. Change the seed and it
        generates a different {PAIRS.toLocaleString()}.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          onClick={() => run(false)}
          disabled={running}
          whileHover={reduce || running ? undefined : { scale: 1.02 }}
          whileTap={reduce || running ? undefined : { scale: 0.98 }}
          className="min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-wait transition-colors cursor-pointer"
        >
          {running ? 'Running…' : `Run ${PAIRS.toLocaleString()} concurrent edits`}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => run(true)}
          disabled={running}
          whileHover={reduce || running ? undefined : { scale: 1.02 }}
          whileTap={reduce || running ? undefined : { scale: 0.98 }}
          className="min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/5 text-white/70 border border-white/15 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors cursor-pointer"
        >
          Now break it
        </motion.button>

        <label className="flex items-center gap-2 text-sm text-white/50">
          seed
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value) || 0)}
            className="w-24 min-h-[44px] px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-white/90 font-mono text-sm focus:outline-none focus:border-blue-400/50"
            aria-label="Random seed"
          />
        </label>
      </div>

      {/* aria-live, because the entire point is the result, and a screen
          reader user pressing the button should be told what happened rather
          than having to go looking for it. */}
      <div aria-live="polite" className="mt-4 min-h-[2rem]">
        {result?.error && (
          <p className="text-rose-300 text-sm">{result.error}</p>
        )}

        {passed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-emerald-400/25 bg-emerald-950/25 p-3 sm:p-4"
          >
            <p className="font-mono text-xs sm:text-sm text-emerald-200">
              {result.pairs.toLocaleString()} pairs · 0 divergences ·{' '}
              {result.ms}ms · seed {result.seed}
            </p>
            <p className="mt-1.5 text-white/55 text-xs sm:text-sm">
              Every pair landed on the same string in both orders.
            </p>
          </motion.div>
        )}

        {failed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-lg border border-rose-400/25 bg-rose-950/25 p-3 sm:p-4">
              <p className="font-mono text-xs sm:text-sm text-rose-200">
                {result.pairs.toLocaleString()} pairs ·{' '}
                {result.divergences.toLocaleString()} divergences · {result.ms}ms
                · seed {result.seed}
              </p>
              <p className="mt-1.5 text-white/55 text-xs sm:text-sm">
                {result.broken
                  ? 'That run used a transform that returns both edits untouched — what you get without operational transformation. The check can fail, which is what makes it worth passing.'
                  : 'A real divergence. This should not happen; the seed above reproduces it exactly.'}
              </p>
            </div>
            <Example example={result.examples?.[0]} />
          </motion.div>
        )}
      </div>

      <p className="mt-4 text-white/40 text-xs leading-relaxed">
        Runs the published{' '}
        <a
          href="https://www.npmjs.com/package/ot-core"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 underline underline-offset-2 hover:text-white"
        >
          ot-core
        </a>{' '}
        package, not a reimplementation — the same code the library ships.
      </p>
    </div>
  );
};

export default ConvergenceProof;
