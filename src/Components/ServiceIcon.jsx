import PropTypes from 'prop-types';

// Replaces the previous WebGL version. Each of the three service cards used to
// mount its own <Canvas>, so the home page ran four WebGL contexts (hero plus
// these three) to draw what are, in the end, decorative icons. These are plain
// SVG: same visual role, no GPU context, no three.js on the page.
//
// Motion is CSS-only, so the `prefers-reduced-motion` block in index.css
// already switches it off — no JS branch needed here.
//
// Each instance gets its own gradient id. Three icons render on the home page
// at once, and duplicate SVG ids would make every icon resolve url(#...) to
// whichever one mounted first.

const GRADIENTS = {
  frontend: ['#3b82f6', '#22d3ee'],
  backend: ['#8b5cf6', '#6366f1'],
  ml: ['#ec4899', '#f59e0b'],
};

const FrontendIcon = ({ gid }) => (
  <>
    {/* Browser window: what frontend work produces */}
    <rect x="18" y="26" width="84" height="62" rx="8" stroke={`url(#${gid})`} strokeWidth="3" fill="rgba(59,130,246,0.06)" />
    <path d="M18 42h84" stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round" />
    <circle cx="29" cy="34" r="3" fill={`url(#${gid})`} />
    <circle cx="40" cy="34" r="3" fill={`url(#${gid})`} opacity="0.6" />
    <circle cx="51" cy="34" r="3" fill={`url(#${gid})`} opacity="0.35" />
    <rect className="svc-bar" style={{ '--i': 0 }} x="30" y="54" width="34" height="5" rx="2.5" fill={`url(#${gid})`} />
    <rect className="svc-bar" style={{ '--i': 1 }} x="30" y="66" width="52" height="5" rx="2.5" fill={`url(#${gid})`} />
    <rect className="svc-bar" style={{ '--i': 2 }} x="30" y="78" width="24" height="5" rx="2.5" fill={`url(#${gid})`} />
  </>
);

const BackendIcon = ({ gid }) => (
  <>
    {/* Stacked database tiers */}
    {[30, 52, 74].map((y, i) => (
      <g key={y} className="svc-tier" style={{ '--i': i, opacity: 1 - i * 0.22 }}>
        <ellipse cx="60" cy={y} rx="32" ry="10" stroke={`url(#${gid})`} strokeWidth="3" fill="rgba(139,92,246,0.08)" />
        <path d={`M28 ${y} v14`} stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round" />
        <path d={`M92 ${y} v14`} stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round" />
      </g>
    ))}
    <ellipse cx="60" cy="88" rx="32" ry="10" stroke={`url(#${gid})`} strokeWidth="3" fill="rgba(139,92,246,0.08)" />
  </>
);

const MLIcon = ({ gid }) => (
  <>
    {/* Small neural network: two inputs, three hidden, one output */}
    <g stroke={`url(#${gid})`} strokeWidth="2" opacity="0.4">
      <path d="M34 38 L60 30 M34 38 L60 58 M34 38 L60 86" />
      <path d="M34 78 L60 30 M34 78 L60 58 M34 78 L60 86" />
      <path d="M60 30 L88 58 M60 58 L88 58 M60 86 L88 58" />
    </g>
    <circle className="svc-node" style={{ '--i': 0 }} cx="34" cy="38" r="8" fill="rgba(236,72,153,0.15)" stroke={`url(#${gid})`} strokeWidth="3" />
    <circle className="svc-node" style={{ '--i': 1 }} cx="34" cy="78" r="8" fill="rgba(236,72,153,0.15)" stroke={`url(#${gid})`} strokeWidth="3" />
    <circle className="svc-node" style={{ '--i': 2 }} cx="60" cy="30" r="7" fill="rgba(236,72,153,0.15)" stroke={`url(#${gid})`} strokeWidth="3" />
    <circle className="svc-node" style={{ '--i': 3 }} cx="60" cy="58" r="7" fill="rgba(236,72,153,0.15)" stroke={`url(#${gid})`} strokeWidth="3" />
    <circle className="svc-node" style={{ '--i': 4 }} cx="60" cy="86" r="7" fill="rgba(236,72,153,0.15)" stroke={`url(#${gid})`} strokeWidth="3" />
    <circle className="svc-node" style={{ '--i': 5 }} cx="88" cy="58" r="9" fill="rgba(236,72,153,0.2)" stroke={`url(#${gid})`} strokeWidth="3" />
  </>
);

const shapeProps = { gid: PropTypes.string.isRequired };
FrontendIcon.propTypes = shapeProps;
BackendIcon.propTypes = shapeProps;
MLIcon.propTypes = shapeProps;

const SHAPES = {
  frontend: FrontendIcon,
  backend: BackendIcon,
  ml: MLIcon,
};

const ServiceIcon = ({ type, isHovered = false }) => {
  const Shape = SHAPES[type] || FrontendIcon;
  const [from, to] = GRADIENTS[type] || GRADIENTS.frontend;
  const gid = `svc-grad-${type}`;

  return (
    <div className="w-full h-40 sm:h-48 relative flex items-center justify-center pointer-events-none">
      {/* Soft glow behind the mark, brightening on card hover */}
      <div
        className={`absolute w-28 h-28 rounded-full blur-2xl transition-opacity duration-500 ${
          isHovered ? 'opacity-40' : 'opacity-20'
        }`}
        style={{ background: `radial-gradient(circle, ${from}, transparent 70%)` }}
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 120 120"
        className={`relative w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-500 ease-out ${
          isHovered ? 'scale-110 -translate-y-1' : ''
        }`}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <Shape gid={gid} />
      </svg>
    </div>
  );
};

ServiceIcon.propTypes = {
  type: PropTypes.oneOf(['frontend', 'backend', 'ml']).isRequired,
  isHovered: PropTypes.bool,
};

export default ServiceIcon;
