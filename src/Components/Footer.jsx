import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseStudies } from '../constants/caseStudies';

// The nav links that used to live here duplicated a bar that is fixed to the
// top of every page — the visitor could already see them without scrolling. A
// footer earns its place by offering something the header cannot: here, the
// long-form write-ups, which are otherwise two clicks deep.

const footerSocials = [
  {
    name: 'Email',
    href: 'mailto:yuvrajsinghnain03@gmail.com',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/yuvrajinbhakti/',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const EMAIL = 'yuvrajsinghnain03@gmail.com';

// Always IST, whatever timezone the reader is in — the point is where
// he is, not where they are.
const formatIST = () =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  // Ticks on the minute rather than every second: a seconds display is a
  // moving element in the corner of every page, which is exactly the kind of
  // thing this site just spent a day removing.
  const [localTime, setLocalTime] = useState(() => formatIST());

  useEffect(() => {
    const tick = () => setLocalTime(formatIST());
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  // An email address in a footer is nearly always going to be copied rather
  // than clicked — mailto: opens whatever the OS thinks is a mail client, which
  // for a lot of people is nothing useful. Copying is the action people
  // actually want, so it gets to be the primary one.
  const copyEmail = useCallback(async (event) => {
    if (!navigator.clipboard) return;      // let the mailto: fall through
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);                    // clipboard blocked; mailto: still works
    }
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <footer className="relative border-t border-white/10">
      <div className="backdrop-blur-lg bg-white/5">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_auto] md:gap-12">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-block text-xl font-bold tracking-tight text-white hover:text-blue-300 transition-colors duration-200">
                YSN
              </Link>
              {/* A footer line is the last thing read, so it should leave
                  something rather than restate the header. The old one was a
                  business card — title, then stack, no turn in it. */}
              <p className="text-white/50 mt-2 text-sm leading-relaxed max-w-xs">
                Frontend by title. Distributed systems and ML by choice.
              </p>
              {/* Real, and true right now — which is the whole reason it earns a
                  place here rather than another line of copy. */}
              <p className="mt-4 text-white/35 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" aria-hidden="true" />
                India
                <span aria-hidden="true">&middot;</span>
                <time className="font-mono tabular-nums">{localTime}</time>
                <span className="text-white/25">local time</span>
              </p>
            </div>

            {/* Read next */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-label">Case studies</h3>
              <nav className="flex flex-col gap-2">
                {caseStudies.map((study) => (
                  <Link
                    key={study.slug}
                    to={`/work/${study.slug}`}
                    className="group relative inline-block w-fit text-white/50 hover:text-white transition-colors text-sm after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-blue-400 after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                  >
                    {study.title}
                  </Link>
                ))}
                <Link to="/projects" className="group relative inline-block w-fit text-white/50 hover:text-white transition-colors text-sm after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-blue-400 after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                  All projects
                </Link>
              </nav>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-label">Connect</h3>
              <div className="flex gap-5">
                {footerSocials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 -m-2 text-white/45 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between text-white/50 text-sm">
            <span>&copy; {currentYear} Yuvraj Singh Nain</span>
            <a
              href={`mailto:${EMAIL}`}
              onClick={copyEmail}
              className="group inline-flex items-center gap-2 hover:text-white transition-colors"
              title="Click to copy"
            >
              <span className="font-mono">{EMAIL}</span>
              {/* aria-live, so the confirmation is announced rather than only
                  seen — the whole point is feedback that the copy happened. */}
              {/* Hidden until hover, so it does not read as part of the
                  address. The copied state overrides that — confirmation has to
                  show even if the pointer has already moved away. */}
              <span
                aria-live="polite"
                className={`text-xs transition-opacity duration-200 ${
                  copied ? 'text-emerald-300 opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                }`}
              >
                {copied ? 'copied' : 'click to copy'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
