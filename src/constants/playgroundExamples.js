/**
 * Examples loaded into the code playground.
 *
 * These used to be Hello World, a React counter, a CSS animation and a 900-line
 * arcade game — tutorial exercises, running inside a real editor. A playground
 * on an engineer's site should be loaded with that engineer's work, not with
 * the first three things anyone writes.
 *
 * Each one has to survive being dropped into a bare iframe, so: no build step,
 * no framework, no imports. That rules out the React and Node projects
 * directly, but not the ideas underneath them — the algorithm from the
 * collaborative editor and the formatting and state problems from payments work
 * all reduce to plain HTML, CSS and JS.
 *
 * Kept in their own module because a 900-line template literal inside a
 * component is not a reasonable place for content to live.
 */

// Base styling every example starts from, so the preview looks like it belongs
// to this site rather than to 1996. Composed into each example's CSS rather
// than injected behind the scenes: this is a playground, so what is in the CSS
// tab has to be exactly what runs — invisible styles the reader cannot see or
// edit would be the more confusing choice.
const BASE_CSS = `/* --- base --- */
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 28px;
  background: #0b1020;
  color: #e8ecf5;
  font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}
h2 { margin: 0 0 6px; font-size: 1.3rem; letter-spacing: -0.02em; font-weight: 650; }
.sub { margin: 0 0 22px; color: #93a1bd; font-size: 0.875rem; max-width: 52ch; }
.label {
  display: block; margin-bottom: 6px; font-size: 0.6875rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: #7c8aa8;
}
code, .mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; }
button {
  font: 500 0.8125rem ui-sans-serif, system-ui, sans-serif;
  padding: 8px 14px; border-radius: 8px; cursor: pointer;
  color: #e8ecf5; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  transition: background .15s ease, border-color .15s ease;
}
button:hover { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.3); }
button.primary { background: #2563eb; border-color: #2563eb; }
button.primary:hover { background: #1d4ed8; border-color: #1d4ed8; }
.row { display: flex; gap: 8px; flex-wrap: wrap; }
`;

const withBase = (css) => BASE_CSS + `
/* --- this example --- */` + css;

export const EXAMPLES = {
  'operational-transform': {
    name: 'Operational Transform',
    icon: '',
    category: 'Algorithms',
    description: 'How two people type in the same line without either losing a keystroke',
    difficulty: 'Advanced',
    tags: ['JS', 'Algorithms', 'Real-time'],
    code: {
      html: `<div class="ot">
  <h2>Operational Transform</h2>
  <p class="sub">Two people edit the same line at the same moment, both working
  from the same starting text. Run each strategy and compare what they end up with.</p>

  <span class="label">Starting document</span>
  <code class="doc" id="base">the quick fox</code>

  <div class="ops">
    <div class="op">
      <span class="who">Person A</span>
      <span class="what mono">insert "brown " at 10</span>
    </div>
    <div class="op">
      <span class="who">Person B</span>
      <span class="what mono">insert "lazy " at 10</span>
    </div>
  </div>

  <div class="row">
    <button onclick="runNaive()">Apply naively</button>
    <button class="primary" onclick="runOT()">Apply with transform</button>
    <button onclick="resetDemo()">Reset</button>
  </div>

  <div class="results">
    <div><span class="label">A's screen</span><code id="ra">&mdash;</code></div>
    <div><span class="label">B's screen</span><code id="rb">&mdash;</code></div>
  </div>
  <p class="verdict" id="verdict"></p>
</div>`,
      css: withBase(`.doc, .results code {
  display: block; padding: 10px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  font-size: 0.875rem;
}
.ops { display: grid; gap: 8px; margin: 18px 0; }
.op {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px;
  background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.25);
}
.who { font-weight: 600; font-size: 0.8125rem; }
.what { color: #93a1bd; font-size: 0.8125rem; }
.results { display: grid; gap: 12px; margin-top: 20px; }
.verdict { margin-top: 14px; font-size: 0.875rem; font-weight: 500; min-height: 1.4em; }
.verdict.ok { color: #6ee7b7; }
.verdict.bad { color: #fca5a5; }`),
      js: `// Operational Transform, which is the whole reason a collaborative editor
// can work. About thirty lines of it here.
//
// The trick is that an edit is sent as an OPERATION -- {type, pos, text} --
// and never as a snapshot of the document. Two operations written against the
// same version conflict: applied in one order they give one string, applied in
// the other they give a different one, and the two people silently drift apart.
//
// transform() rewrites an operation so it can be applied after one it never
// saw. Do that on both sides and they converge on the same text.

var BASE = 'the quick fox';
var opA = { type: 'insert', pos: 10, text: 'brown ' };
var opB = { type: 'insert', pos: 10, text: 'lazy ' };

function apply(doc, op) {
  if (op.type === 'insert') {
    return doc.slice(0, op.pos) + op.text + doc.slice(op.pos);
  }
  return doc.slice(0, op.pos) + doc.slice(op.pos + op.length);
}

// Rewrite \`op\` so it still means the same thing after \`other\` has landed.
// When both insert at the same index somebody has to go first, so the two
// sides agree in advance on a tie-break -- site id, in a real system.
function transform(op, other, goesFirst) {
  var shifted = { type: op.type, pos: op.pos, text: op.text, length: op.length };
  if (other.type === 'insert') {
    if (other.pos < op.pos || (other.pos === op.pos && goesFirst)) {
      shifted.pos = op.pos + other.text.length;
    }
  } else if (other.pos < op.pos) {
    shifted.pos = op.pos - other.length;
  }
  return shifted;
}

function render(a, b) {
  document.getElementById('ra').textContent = a;
  document.getElementById('rb').textContent = b;
  var v = document.getElementById('verdict');
  if (a === b) {
    v.textContent = 'Converged. Both people are looking at the same document.';
    v.className = 'verdict ok';
  } else {
    v.textContent = 'Diverged. Same edits, different results -- and neither person is told.';
    v.className = 'verdict bad';
  }
}

// Each side applies its own edit, then the other's, untouched.
function runNaive() {
  render(
    apply(apply(BASE, opA), opB),
    apply(apply(BASE, opB), opA)
  );
}

// Each side transforms the incoming edit against the one it already applied.
function runOT() {
  render(
    apply(apply(BASE, opA), transform(opB, opA, true)),
    apply(apply(BASE, opB), transform(opA, opB, false))
  );
}

function resetDemo() {
  document.getElementById('ra').innerHTML = '&mdash;';
  document.getElementById('rb').innerHTML = '&mdash;';
  document.getElementById('verdict').textContent = '';
}`,
    },
  },

  'rupee-input': {
    name: 'Rupee Input',
    icon: '',
    category: 'Payments',
    description: 'Lakh/crore grouping with the caret where you left it',
    difficulty: 'Intermediate',
    tags: ['JS', 'i18n', 'Forms'],
    code: {
      html: `<div class="amt">
  <h2>Indian amount input</h2>
  <p class="sub">Type a number. Grouping is 2-2-3 from the right, not 3-3-3 &mdash;
  and the caret has to stay where you put it.</p>

  <label class="label" for="amount">Amount</label>
  <div class="field">
    <span class="prefix">&#8377;</span>
    <input id="amount" inputmode="numeric" autocomplete="off" placeholder="0" />
  </div>

  <div class="readout">
    <div><span class="label">Grouped</span><code id="out">&#8377;0</code></div>
    <div><span class="label">In words</span><code id="words">zero</code></div>
  </div>

  <div class="row">
    <button onclick="setVal('100000')">1 lakh</button>
    <button onclick="setVal('10000000')">1 crore</button>
    <button onclick="setVal('123456789')">12,34,56,789</button>
  </div>
</div>`,
      css: withBase(`.field {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  transition: border-color 0.15s ease;
  max-width: 340px;
}
.field:focus-within { border-color: #60a5fa; }
.prefix { color: #93a1bd; font-size: 1.05rem; }
#amount {
  flex: 1; min-width: 0; background: none; border: 0; outline: none;
  color: #e8ecf5; font-size: 1.05rem;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
}
.readout { display: grid; gap: 12px; margin: 20px 0; }
.readout code {
  display: block; padding: 10px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
}`),
      js: `// The grouping is the easy half. The hard half is the caret.
//
// Reformatting on every keystroke means replacing the input's value, and that
// sends the caret to the end. Type "1234", get "1,234", and the cursor jumps
// past the 4 -- so editing anything in the middle of an amount is impossible.
// Nearly every hand-rolled money input in the wild has this bug.
//
// The fix: count DIGITS before the caret, not characters. Separators move
// around when the value is reformatted; digits do not.

var input = document.getElementById('amount');

function groupIndian(digits) {
  if (digits.length <= 3) return digits;
  var head = digits.slice(0, -3);
  var tail = digits.slice(-3);
  // every two digits from the right, in the head only
  return head.replace(/\\B(?=(\\d{2})+(?!\\d))/g, ',') + ',' + tail;
}

function digitsBefore(value, caret) {
  var n = 0;
  for (var i = 0; i < caret; i++) {
    if (value[i] >= '0' && value[i] <= '9') n++;
  }
  return n;
}

function caretAfterDigits(value, n) {
  if (n === 0) return 0;
  var seen = 0;
  for (var i = 0; i < value.length; i++) {
    if (value[i] >= '0' && value[i] <= '9') {
      seen++;
      if (seen === n) return i + 1;
    }
  }
  return value.length;
}

function inWords(digits) {
  var n = parseInt(digits || '0', 10);
  if (!n) return 'zero';
  if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\\.00$/, '') + ' crore';
  if (n >= 100000) return (n / 100000).toFixed(2).replace(/\\.00$/, '') + ' lakh';
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\\.00$/, '') + ' thousand';
  return String(n);
}

function format() {
  var before = digitsBefore(input.value, input.selectionStart);
  var digits = input.value.replace(/\\D/g, '').replace(/^0+(?=\\d)/, '');
  var grouped = groupIndian(digits);

  input.value = grouped;
  var caret = caretAfterDigits(grouped, before);
  input.setSelectionRange(caret, caret);

  document.getElementById('out').textContent = '\\u20B9' + (grouped || '0');
  document.getElementById('words').textContent = inWords(digits);
}

function setVal(v) {
  input.value = v;
  input.setSelectionRange(v.length, v.length);
  format();
  input.focus();
}

input.addEventListener('input', format);`,
    },
  },

  'payment-states': {
    name: 'Payment Lifecycle',
    icon: '',
    category: 'Payments',
    description: 'Authorised, captured, settled — and every way it goes wrong',
    difficulty: 'Intermediate',
    tags: ['JS', 'State machines', 'Payments'],
    code: {
      html: `<div class="pay">
  <h2>What happens after you tap Pay</h2>
  <p class="sub">A payment is not one event. It is a state machine, and most of
  the interesting work is in the paths that do not end at "settled".</p>

  <ol class="stages" id="stages">
    <li data-state="created">Created</li>
    <li data-state="authorized">Authorised</li>
    <li data-state="captured">Captured</li>
    <li data-state="settled">Settled</li>
  </ol>

  <div class="row">
    <button class="primary" onclick="start('happy')">Run</button>
    <button onclick="start('decline')">Issuer declines</button>
    <button onclick="start('timeout')">Network timeout</button>
    <button onclick="reset()">Reset</button>
  </div>

  <span class="label" style="margin-top:22px">Webhook log</span>
  <div class="log mono" id="log"><span class="dim">waiting&hellip;</span></div>
</div>`,
      css: withBase(`.stages {
  list-style: none; padding: 0; margin: 20px 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
.stages li {
  padding: 10px 8px; text-align: center; font-size: 0.8125rem; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: #7c8aa8; transition: all 0.3s ease;
}
.stages li.active {
  background: rgba(37,99,235,0.16); border-color: #3b82f6; color: #dbeafe;
}
.stages li.done { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }
.stages li.failed { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.45); color: #fca5a5; }
.log {
  padding: 12px; border-radius: 8px; min-height: 120px; font-size: 0.8125rem;
  background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08);
}
.log div { padding: 2px 0; }
.dim { color: #64748b; }
.ok { color: #6ee7b7; }
.err { color: #fca5a5; }`),
      js: `// Every stage is a separate network call that can fail on its own, which is
// why a payment needs a state machine rather than a boolean. The two failure
// buttons are the cases that actually generate support tickets: a decline
// leaves nothing to reverse, but a timeout after authorisation leaves money
// held on someone's card with no capture behind it.

var FLOWS = {
  happy:   ['created', 'authorized', 'captured', 'settled'],
  decline: ['created', 'failed:authorized'],
  timeout: ['created', 'authorized', 'timeout:captured']
};

var COPY = {
  created:    ['payment.created', 'Order created, awaiting authorisation'],
  authorized: ['payment.authorized', 'Issuer approved. Funds held, not yet moved'],
  captured:   ['payment.captured', 'Capture requested. Money leaves the customer'],
  settled:    ['payment.settled', 'Settled to the merchant account (T+2)'],
  failed:     ['payment.failed', 'Issuer declined. Nothing to reverse'],
  timeout:    ['payment.pending', 'No response. Funds still held -- reconcile or auto-void']
};

var timers = [];

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  var items = document.querySelectorAll('.stages li');
  for (var i = 0; i < items.length; i++) items[i].className = '';
  document.getElementById('log').innerHTML = '<span class="dim">waiting&hellip;</span>';
}

function line(text, kind) {
  var log = document.getElementById('log');
  if (log.querySelector('.dim')) log.innerHTML = '';
  var el = document.createElement('div');
  var stamp = new Date().toISOString().slice(11, 23);
  el.className = kind || '';
  el.textContent = stamp + '  ' + text;
  log.appendChild(el);
}

function start(flow) {
  reset();
  FLOWS[flow].forEach(function (step, i) {
    timers.push(setTimeout(function () {
      var parts = step.split(':');
      var outcome = parts.length > 1 ? parts[0] : step;
      var stage = parts.length > 1 ? parts[1] : step;
      var node = document.querySelector('[data-state="' + stage + '"]');
      var copy = COPY[outcome];

      if (outcome === 'failed' || outcome === 'timeout') {
        if (node) node.className = 'failed';
        line(copy[0] + '  ' + copy[1], 'err');
      } else {
        if (node) node.className = stage === 'settled' ? 'done' : 'active';
        var prev = document.querySelector('.stages li.active:not([data-state="' + stage + '"])');
        if (prev) prev.className = 'done';
        line(copy[0] + '  ' + copy[1], stage === 'settled' ? 'ok' : '');
      }
    }, i * 900));
  });
}`,
    },
  },
};

// A blank project starts from the same base, so "New Project" doesn't drop you
// onto a white page in Times New Roman.
export const BLANK_PROJECT = {
  html: '<div>\n  <h2>New project</h2>\n  <p class="sub">Everything here runs in a sandboxed iframe.</p>\n  <div class="row">\n    <button class="primary">A button</button>\n  </div>\n</div>',
  css: BASE_CSS,
  js: '// Ctrl+Enter to run.\nconsole.log("ready");',
};

export { BASE_CSS };
export default EXAMPLES;
