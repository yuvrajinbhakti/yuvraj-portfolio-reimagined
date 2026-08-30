import PropTypes from 'prop-types';

/**
 * A mark and a diagram for each case study.
 *
 * Inline SVG rather than image files, for the same reason the rest of this site
 * avoids them: no request, no asset to keep in step with the writing, correct at
 * every size, and it inherits the page's colours instead of carrying its own
 * background into a dark layout.
 *
 * The marks are isometric — a 30-degree skew, a lit face, a shaded face, one
 * soft shadow — which is the drawn version of the rendered-3D look rather than
 * an actual render. Saying so matters: they are hand-authored geometry, and if
 * you look closely that is what you will find.
 *
 * The diagrams are the part worth having. Each one is drawn from something real
 * in the project it belongs to — the client's actual state machine, the actual
 * order of a rebase, the actual Bézier loop out of WaveClipper.dart — so they
 * carry information rather than filling space above the prose.
 */

/* ------------------------------------------------------------------ marks */

const Iso = ({ children, title }) => (
  <svg viewBox="0 0 120 120" role="img" aria-label={title} className="w-full h-full">
    <defs>
      <linearGradient id="lit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="warmSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="greenSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="url(#glow)" />
    {children}
    {/* The ground shadow. One ellipse is enough to sit a shape on a surface. */}
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity="0.35" />
  </svg>
);
Iso.propTypes = { children: PropTypes.node, title: PropTypes.string };

/** Two documents merging into one — concurrent edits reaching one answer. */
const OtCoreMark = () => (
  <Iso title="Two documents converging into one">
    <g>
      <path d="M30 46 L60 30 L90 46 L60 62 Z" fill="url(#lit)" />
      <path d="M30 46 L60 62 L60 78 L30 62 Z" fill="url(#side)" />
      <path d="M90 46 L60 62 L60 78 L90 62 Z" fill="#1e40af" />
    </g>
    <g opacity="0.55">
      <path d="M30 66 L60 50 L90 66 L60 82 Z" fill="url(#lit)" />
      <path d="M30 66 L60 82 L60 96 L30 80 Z" fill="url(#side)" />
      <path d="M90 66 L60 82 L60 96 L90 80 Z" fill="#1e40af" />
    </g>
    <circle cx="60" cy="46" r="5" fill="#e0f2fe" />
  </Iso>
);

/** A server slab with two clients above it. */
const EditorMark = () => (
  <Iso title="Two clients above one server">
    <g>
      <path d="M26 74 L60 56 L94 74 L60 92 Z" fill="url(#lit)" />
      <path d="M26 74 L60 92 L60 100 L26 82 Z" fill="url(#side)" />
      <path d="M94 74 L60 92 L60 100 L94 82 Z" fill="#1e40af" />
    </g>
    <g>
      <path d="M22 44 L40 34 L58 44 L40 54 Z" fill="#bfdbfe" />
      <path d="M22 44 L40 54 L40 62 L22 52 Z" fill="#2563eb" />
      <path d="M58 44 L40 54 L40 62 L58 52 Z" fill="#1d4ed8" />
    </g>
    <g>
      <path d="M62 44 L80 34 L98 44 L80 54 Z" fill="#bfdbfe" />
      <path d="M62 44 L80 54 L80 62 L62 52 Z" fill="#2563eb" />
      <path d="M98 44 L80 54 L80 62 L98 52 Z" fill="#1d4ed8" />
    </g>
    <path d="M40 62 L60 72 M80 62 L60 72" stroke="#93c5fd" strokeWidth="1.5" opacity="0.7" />
  </Iso>
);

/** A sealed slab with a keyhole — encrypted, and it expires. */
const FileMark = () => (
  <Iso title="A sealed document">
    <g>
      <path d="M32 56 L60 40 L88 56 L60 72 Z" fill="url(#green)" />
      <path d="M32 56 L60 72 L60 92 L32 76 Z" fill="url(#greenSide)" />
      <path d="M88 56 L60 72 L60 92 L88 76 Z" fill="#065f46" />
    </g>
    <path d="M52 50 a8 8 0 0 1 16 0" fill="none" stroke="#d1fae5" strokeWidth="3" strokeLinecap="round" />
    <circle cx="60" cy="56" r="4" fill="#022c22" />
  </Iso>
);

/** A phone with the scalloped edge the app is actually about. */
const MoneyZoldMark = () => (
  <Iso title="A phone with a scalloped panel">
    <g>
      {/* Top face, then the two sides — a slab lying back, read as a handset. */}
      <path d="M38 40 L66 24 L94 40 L66 56 Z" fill="url(#warm)" />
      <path d="M38 40 L66 56 L66 98 L38 82 Z" fill="url(#warmSide)" />
      <path d="M94 40 L66 56 L66 98 L94 82 Z" fill="#92400e" />
      {/* The scallop, on the lit side, in the mark as well as the diagram. */}
      <path
        d="M68 62 Q76 56 84 63 Q88 66 92 63 L92 71 Q88 74 84 71 Q76 64 68 70 Z"
        fill="#fffbeb"
        opacity="0.92"
      />
      <rect x="70" y="80" width="18" height="2.4" rx="1.2" fill="#fde68a" opacity="0.55" />
      <rect x="70" y="86" width="12" height="2.4" rx="1.2" fill="#fde68a" opacity="0.4" />
    </g>
  </Iso>
);

/* --------------------------------------------------------------- diagrams */

const frame = 'w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-6';
const caption = 'mt-3 text-[11px] leading-relaxed text-white/45';
const label = 'fill-white/45 text-[9px]';
const stroke = 'stroke-white/25';

/**
 * The client's three states, and what moves between them. Straight out of the
 * comment at the top of src/client.js.
 */
const OtCoreDiagram = () => (
  <svg viewBox="0 26 520 106" role="img" aria-label="The client state machine: synchronized, awaiting, and awaiting with buffer" className="w-full min-w-[460px]">
    <defs>
      <marker id="tip" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0 0 L7 3.5 L0 7 z" className="fill-white/35" />
      </marker>
    </defs>
    {[
      { x: 16, w: 138, name: 'synchronized', note: 'nothing in flight', tone: 'stroke-emerald-400/50' },
      { x: 190, w: 118, name: 'awaiting', note: 'one on the wire', tone: 'stroke-amber-400/50' },
      { x: 344, w: 160, name: 'awaiting + buffer', note: 'and more behind it', tone: 'stroke-amber-400/50' },
    ].map((s) => (
      <g key={s.name}>
        <rect x={s.x} y="34" width={s.w} height="44" rx="9" className={`fill-white/[0.04] ${s.tone}`} strokeWidth="1" />
        <text x={s.x + s.w / 2} y="54" textAnchor="middle" className="fill-white/85 text-[11px] font-medium">{s.name}</text>
        <text x={s.x + s.w / 2} y="68" textAnchor="middle" className={label}>{s.note}</text>
      </g>
    ))}
    <path d="M154 48 L188 48" className={stroke} strokeWidth="1.2" markerEnd="url(#tip)" />
    <text x="171" y="42" textAnchor="middle" className={label}>edit</text>
    <path d="M308 48 L342 48" className={stroke} strokeWidth="1.2" markerEnd="url(#tip)" />
    <text x="325" y="42" textAnchor="middle" className={label}>edit</text>
    <path d="M249 82 C249 108, 85 108, 85 82" className={stroke} strokeWidth="1.2" fill="none" markerEnd="url(#tip)" />
    <text x="167" y="120" textAnchor="middle" className={label}>ack</text>
    <path d="M424 82 C424 96, 249 96, 249 82" className={stroke} strokeWidth="1.2" fill="none" markerEnd="url(#tip)" />
    <text x="336" y="104" textAnchor="middle" className={label}>ack — the next buffered edit goes</text>
  </svg>
);

/** Two edits at the same index, and what the server does about it. */
const EditorDiagram = () => (
  <svg viewBox="0 24 520 126" role="img" aria-label="Two concurrent edits, transformed, converging" className="w-full min-w-[460px]">
    <g>
      <rect x="16" y="30" width="150" height="34" rx="8" className="fill-blue-500/10 stroke-blue-400/40" strokeWidth="1" />
      <text x="91" y="51" textAnchor="middle" className="fill-blue-200 text-[11px] font-mono">insert(4, &quot;big &quot;)</text>
      <rect x="354" y="30" width="150" height="34" rx="8" className="fill-emerald-500/10 stroke-emerald-400/40" strokeWidth="1" />
      <text x="429" y="51" textAnchor="middle" className="fill-emerald-200 text-[11px] font-mono">remove(4, 4)</text>
    </g>
    <path d="M91 66 L091 86" className={stroke} strokeWidth="1.2" markerEnd="url(#tip)" />
    <path d="M429 66 L429 86" className={stroke} strokeWidth="1.2" markerEnd="url(#tip)" />
    <g>
      <rect x="176" y="86" width="168" height="34" rx="8" className="fill-white/[0.05] stroke-white/25" strokeWidth="1" />
      <text x="260" y="107" textAnchor="middle" className="fill-white/85 text-[11px] font-mono">transform(a, b, side)</text>
    </g>
    <path d="M91 86 C91 103, 172 103, 176 103" className={stroke} strokeWidth="1.2" fill="none" />
    <path d="M429 86 C429 103, 348 103, 344 103" className={stroke} strokeWidth="1.2" fill="none" />
    <path d="M260 120 L260 132" className={stroke} strokeWidth="1.2" markerEnd="url(#tip)" />
    <text x="260" y="146" textAnchor="middle" className="fill-white/70 text-[11px] font-mono">&quot;the big sat&quot; — on both</text>
  </svg>
);

/** Encrypt, log, expire. */
const FileDiagram = () => (
  <svg viewBox="0 24 520 84" role="img" aria-label="Encrypt, audit, expire" className="w-full min-w-[460px]">
    {[
      { x: 16, t: 'AES-256-GCM', n: 'tampering is detected,\nnot silently decrypted' },
      { x: 186, t: 'audit log', n: 'who opened what,\nand when' },
      { x: 356, t: 'expiry', n: 'the link stops working\nwithout anyone acting' },
    ].map((s, i) => (
      <g key={s.t}>
        <rect x={s.x} y="30" width="148" height="60" rx="9" className="fill-emerald-500/[0.07] stroke-emerald-400/30" strokeWidth="1" />
        <text x={s.x + 74} y="50" textAnchor="middle" className="fill-emerald-100 text-[11px] font-medium">{s.t}</text>
        {s.n.split('\n').map((line, k) => (
          <text key={line} x={s.x + 74} y={64 + k * 12} textAnchor="middle" className={label}>{line}</text>
        ))}
        {i < 2 && <path d={`M${s.x + 150} 60 L${s.x + 184} 60`} className={stroke} strokeWidth="1.2" markerEnd="url(#tip)" />}
      </g>
    ))}
  </svg>
);

/**
 * WaveClipper, drawn by the same rule the Dart does it.
 *
 * Ten segments across the width, control points alternating high and low, which
 * is why the edge scallops instead of undulating. The path below is generated
 * from that loop rather than traced by eye, so it is the shape the app draws.
 */
const MoneyZoldDiagram = () => {
  const width = 480;
  const height = 74;
  const segments = 10;
  // The Dart builds a *clip region*, so it closes down the sides and along the
  // bottom. Translating that literally left a stray vertical tail hanging off
  // the left edge of the diagram — correct as a clip, wrong as a picture. The
  // scalloped edge is the interesting half, so the path starts at the right,
  // runs the same loop leftwards, and closes across the bottom.
  let d = `M${width} ${height} L${width} 24`;
  for (let i = 0; i < segments; i++) {
    const cx = width - width / (segments * 2) - (i * width) / segments;
    const cy = i % 2 !== 0 ? 4 : height - 22;
    const x = width - ((i + 1) * width) / segments;
    d += ` Q${cx.toFixed(1)} ${cy} ${x.toFixed(1)} 24`;
  }
  d += ` L0 ${height} Z`;

  return (
    <svg viewBox="0 24 520 84" role="img" aria-label="The ten-segment Bézier scallop from WaveClipper" className="w-full min-w-[460px]">
      <defs>
        <linearGradient id="scallop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <g transform="translate(20, 26)">
        <path d={d} fill="url(#scallop)" stroke="#fbbf24" strokeOpacity="0.7" strokeWidth="1.2" />
        {Array.from({ length: segments + 1 }, (_, i) => (
          <circle key={i} cx={(width * i) / segments} cy="24" r="1.8" className="fill-amber-200/70" />
        ))}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------- api */

const ART = {
  'ot-core': {
    Mark: OtCoreMark,
    Diagram: OtCoreDiagram,
    caption: 'One operation on the wire at a time; the rest are composed while they wait.',
  },
  'real-time-code-editor': {
    Mark: EditorMark,
    Diagram: EditorDiagram,
    caption: 'Both edits were written against "the cat sat", neither having seen the other.',
  },
  'secure-file-sharing': {
    Mark: FileMark,
    Diagram: FileDiagram,
    caption: 'Every access answerable, and access that ends on a schedule.',
  },
  moneyzold: {
    Mark: MoneyZoldMark,
    Diagram: MoneyZoldDiagram,
    caption:
      'Ten quadratic Bézier segments, control points alternating high and low — drawn here by the same rule as WaveClipper.dart.',
  },
};

/** The isometric mark for a case study, or nothing if it has none. */
export const CaseStudyMark = ({ slug, className = '' }) => {
  const art = ART[slug];
  if (!art) return null;
  return (
    <div className={className} aria-hidden="false">
      <art.Mark />
    </div>
  );
};
CaseStudyMark.propTypes = { slug: PropTypes.string.isRequired, className: PropTypes.string };

/** The diagram for a case study, or nothing if it has none. */
export const CaseStudyDiagram = ({ slug }) => {
  const art = ART[slug];
  if (!art) return null;
  return (
    <figure className={frame}>
      {/* A floor on the width, and a scroller under it. Squeezing a 520-unit
          drawing into a 326px phone column shrinks its labels along with it,
          and an illegible diagram is worse than none. */}
      <div className="overflow-x-auto">
        <art.Diagram />
      </div>
      <figcaption className={caption}>{art.caption}</figcaption>
    </figure>
  );
};
CaseStudyDiagram.propTypes = { slug: PropTypes.string.isRequired };

export default CaseStudyMark;
