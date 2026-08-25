import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCursorPresence } from '../contexts/cursorPresence';

/**
 * Two kinds of cursor, drawn the same way and meaning different things.
 *
 *   live  — someone else with this page open right now, over BroadcastChannel.
 *           Real, and same-origin only: the browser routes these between tabs
 *           and windows on this machine and nothing touches the network.
 *   ghost — a path this visitor's own pointer took, replayed back at them.
 *
 * The ghost half is what makes the feature work on a portfolio, which is a
 * site that is usually being read by exactly one person. It also means there
 * is nothing to fake: within about twenty seconds of arriving you have moved
 * enough for your own trail to start replaying, so the page is never staging a
 * crowd that does not exist. Previous visits are kept in localStorage, so a
 * second visit starts populated.
 *
 * Positions travel normalised — x against the viewport width, y against the
 * full document height — so a peer on a different window size and scroll
 * position still lands on the same paragraph rather than the same pixel. A
 * cursor whose owner is scrolled somewhere else is simply off-screen, which is
 * the honest answer.
 */

const CHANNEL_NAME = 'ysn-presence';
const TRAILS_KEY = 'ysn:trails';

const SEND_INTERVAL = 60;        // ms between broadcasts
const SAMPLE_INTERVAL = 90;      // ms between recorded trail points
const PEER_IDLE_MS = 8000;       // a quiet peer fades
const PEER_DROP_MS = 12000;      // ...then goes
const SELF_IDLE_MS = 30000;      // stop broadcasting a pointer that has parked
const STILL_MS = 1200;           // no movement this recently means no path to record
const HEARTBEAT_MS = 3000;       // keep-alive for a stationary pointer, well under PEER_IDLE_MS
const MIN_STEP = 0.004;          // normalised; ignores jitter that would flatten a trail
const GHOST_GAP_MS = 2600;       // pause between replays of a trail
const MIN_TRAIL_POINTS = 22;     // shorter than this is a twitch, not a path
const MAX_TRAIL_POINTS = 200;
const MAX_STORED_TRAILS = 3;
const LERP = 0.18;

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `p-${Math.random().toString(36).slice(2, 10)}`;

// Kept inside the site's blue band rather than spread across the wheel. The
// palette pass that got this site down to one accent should not be undone by a
// feature that hands every visitor a random hue.
const hueFor = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return 196 + (Math.abs(hash) % 42);
};

const docHeight = () =>
  Math.max(document.documentElement.scrollHeight, window.innerHeight);

const readTrails = (route) => {
  try {
    const raw = window.localStorage.getItem(TRAILS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.[route]) ? parsed[route] : [];
  } catch {
    return [];
  }
};

const writeTrail = (route, points) => {
  if (points.length < MIN_TRAIL_POINTS) return;
  try {
    const raw = window.localStorage.getItem(TRAILS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(parsed[route]) ? parsed[route] : [];
    // Rounded to three places before it is stored. Sub-pixel precision on a
    // normalised coordinate is noise, and it triples the size of the entry.
    const trimmed = points
      .slice(-MAX_TRAIL_POINTS)
      .map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
    parsed[route] = [...existing, trimmed].slice(-MAX_STORED_TRAILS);
    window.localStorage.setItem(TRAILS_KEY, JSON.stringify(parsed));
  } catch {
    // Quota or private mode. The trail is lost, the session still replays it.
  }
};

const CursorLayer = () => {
  const { setEnabled } = useCursorPresence();
  const { pathname } = useLocation();

  // Everything that changes every frame lives in refs. Only the set of cursor
  // ids is React state, so a pointer moving at 60Hz repaints two transforms
  // instead of re-rendering the tree.
  const cursors = useRef(new Map());
  const nodes = useRef(new Map());
  const [ids, setIds] = useState([]);
  const [liveCount, setLiveCount] = useState(0);

  const selfId = useRef(uid());
  const channel = useRef(null);
  const trail = useRef([]);
  const lastSample = useRef(0);
  const lastSend = useRef(0);
  const lastMove = useRef(0);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });

  const syncIds = useCallback(() => {
    const next = [...cursors.current.keys()];
    setIds((prev) =>
      prev.length === next.length && prev.every((id, i) => id === next[i]) ? prev : next
    );
    let live = 0;
    cursors.current.forEach((c) => {
      if (c.kind === 'live') live += 1;
    });
    setLiveCount((prev) => (prev === live ? prev : live));
  }, []);

  // Route change resets everything: a trail recorded on /about means nothing
  // on /contact, and a peer reading a different page should not appear here.
  useEffect(() => {
    cursors.current.clear();
    nodes.current.clear();
    trail.current = [];
    syncIds();

    readTrails(pathname).forEach((points, i) => {
      cursors.current.set(`ghost-stored-${i}`, {
        kind: 'ghost',
        points,
        index: 0,
        clock: 0,
        gap: i * 1200,
        hue: 210,
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        seeded: false,
      });
    });
    syncIds();
  }, [pathname, syncIds]);

  // Pointer capture + broadcast.
  useEffect(() => {
    const onMove = (event) => {
      const height = docHeight();
      pointer.current = {
        x: event.clientX / window.innerWidth,
        y: (event.clientY + window.scrollY) / height,
        active: true,
      };
      lastMove.current = performance.now();
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // Live peers. BroadcastChannel is same-origin and same-browser — it reaches
  // other tabs and windows, and nothing else. If it is missing, ghosts still
  // run; there is no fallback worth adding, because every alternative involves
  // sending a stranger's pointer position to a server.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const bc = new BroadcastChannel(CHANNEL_NAME);
    channel.current = bc;
    const me = selfId.current;

    bc.onmessage = (event) => {
      const msg = event.data;
      if (!msg || msg.id === me) return;
      if (msg.type === 'leave') {
        if (cursors.current.delete(msg.id)) syncIds();
        return;
      }
      if (msg.type !== 'move' || msg.route !== pathname) {
        // A peer that navigated away stops being relevant here.
        if (cursors.current.delete(msg.id)) syncIds();
        return;
      }
      const existing = cursors.current.get(msg.id);
      if (existing) {
        existing.tx = msg.x;
        existing.ty = msg.y;
        existing.seen = performance.now();
      } else {
        cursors.current.set(msg.id, {
          kind: 'live',
          x: msg.x,
          y: msg.y,
          tx: msg.x,
          ty: msg.y,
          hue: hueFor(msg.id),
          seen: performance.now(),
          seeded: true,
        });
        syncIds();
      }
    };

    const leave = () => bc.postMessage({ type: 'leave', id: me });
    // pagehide rather than unload: unload is ignored on iOS and blocks the
    // back/forward cache everywhere else.
    window.addEventListener('pagehide', leave);
    return () => {
      leave();
      window.removeEventListener('pagehide', leave);
      bc.close();
      channel.current = null;
    };
  }, [pathname, syncIds]);

  // Nothing goes out while the tab is in the background, and peers are told so
  // rather than being left to time out.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) channel.current?.postMessage({ type: 'leave', id: selfId.current });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Record on unmount, so the next visit has something to replay.
  useEffect(() => {
    const route = pathname;
    return () => writeTrail(route, trail.current);
  }, [pathname]);

  useEffect(() => {
    const save = () => writeTrail(pathname, trail.current);
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, [pathname]);

  // The single frame loop: sample, broadcast, advance ghosts, ease, paint.
  useEffect(() => {
    let frame;
    let prev = performance.now();

    const step = (now) => {
      const dt = Math.min(now - prev, 100);
      prev = now;
      const idle = now - lastMove.current > SELF_IDLE_MS;
      const height = docHeight();
      const width = window.innerWidth;
      const scroll = window.scrollY;

      // A pointer resting on the page is not producing a path. Without this,
      // parking the mouse recorded the same coordinate every 90ms for the next
      // half minute, and the replay walked a long tail of identical points —
      // a ghost that appeared, held still, and faded, which is the one thing
      // it must not do.
      const moving = now - lastMove.current < STILL_MS;

      if (pointer.current.active && !idle && !document.hidden) {
        // Peers keep the last position they were sent, so a stationary pointer
        // only needs an occasional heartbeat to stay alive rather than sixteen
        // identical messages a second.
        const due = moving ? SEND_INTERVAL : HEARTBEAT_MS;
        if (now - lastSend.current > due) {
          lastSend.current = now;
          channel.current?.postMessage({
            type: 'move',
            id: selfId.current,
            route: pathname,
            x: pointer.current.x,
            y: pointer.current.y,
          });
        }
        if (moving && now - lastSample.current > SAMPLE_INTERVAL) {
          const last = trail.current[trail.current.length - 1];
          const far =
            !last || Math.hypot(pointer.current.x - last[0], pointer.current.y - last[1]) > MIN_STEP;
          if (far) {
            lastSample.current = now;
            trail.current.push([pointer.current.x, pointer.current.y]);
            if (trail.current.length > MAX_TRAIL_POINTS) trail.current.shift();
            // Once this session has produced a real path, it starts replaying
            // alongside the stored ones. This is the moment the feature works on
            // a first visit with nobody else around.
            if (
              trail.current.length === MIN_TRAIL_POINTS &&
              !cursors.current.has('ghost-live')
            ) {
              cursors.current.set('ghost-live', {
                kind: 'ghost',
                live: true,
                // A copy, not the live array. Sharing the reference meant every
                // point recorded during playback was appended to the thing
                // being played, and the shift() at the cap slid the whole
                // recording out from under the index.
                points: trail.current.slice(),
                index: 0,
                clock: 0,
                gap: GHOST_GAP_MS,
                hue: 210,
                x: 0,
                y: 0,
                tx: 0,
                ty: 0,
                seeded: false,
              });
              syncIds();
            }
          }
        }
      }

      let dropped = false;
      cursors.current.forEach((c, id) => {
        if (c.kind === 'live') {
          const age = now - c.seen;
          if (age > PEER_DROP_MS) {
            cursors.current.delete(id);
            nodes.current.delete(id);
            dropped = true;
            return;
          }
          c.opacity = age > PEER_IDLE_MS ? 1 - (age - PEER_IDLE_MS) / (PEER_DROP_MS - PEER_IDLE_MS) : 1;
        } else {
          if (c.gap > 0) {
            c.gap -= dt;
            c.opacity = 0;
          } else {
            c.clock += dt;
            while (c.clock >= SAMPLE_INTERVAL) {
              c.clock -= SAMPLE_INTERVAL;
              c.index += 1;
            }
            if (c.index >= c.points.length - 1) {
              c.index = 0;
              c.gap = GHOST_GAP_MS;
              c.seeded = false;
              // Re-snapshot between loops rather than during one, so the
              // replay stays recent without the recording shifting under a
              // playhead that is already walking it.
              if (c.live && trail.current.length >= MIN_TRAIL_POINTS) {
                c.points = trail.current.slice();
              }
            }
            const point = c.points[c.index];
            if (point) {
              c.tx = point[0];
              c.ty = point[1];
              if (!c.seeded) {
                c.x = c.tx;
                c.y = c.ty;
                c.seeded = true;
              }
            }
            // Eased at both ends of the replay so a trail arrives and leaves
            // instead of blinking into existence mid-page.
            const progress = c.index / Math.max(c.points.length - 1, 1);
            c.opacity = 0.42 * Math.min(1, progress * 8) * Math.min(1, (1 - progress) * 8);
          }
        }

        c.x += (c.tx - c.x) * LERP;
        c.y += (c.ty - c.y) * LERP;

        const node = nodes.current.get(id);
        if (!node) return;
        const px = c.x * width;
        const py = c.y * height - scroll;
        const offscreen = py < -60 || py > window.innerHeight + 60;
        node.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        node.style.opacity = offscreen ? 0 : `${c.opacity ?? 1}`;
      });
      if (dropped) syncIds();

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [pathname, syncIds]);

  const register = useCallback((id) => (node) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);

  return (
    <>
      {/* aria-hidden throughout: this is ambience. A screen reader announcing
          a second pointer it cannot act on is noise, and the control below is
          the part that actually needs to be reachable. */}
      <div className="cursor-layer" aria-hidden="true">
        {ids.map((id) => {
          const cursor = cursors.current.get(id);
          if (!cursor) return null;
          return (
            <span
              key={id}
              ref={register(id)}
              className={`cursor-mark ${cursor.kind === 'ghost' ? 'cursor-mark--ghost' : ''}`}
              style={{ '--cursor-hue': cursor.hue }}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                <path
                  d="M1 1l5.2 12.4 2-4.9 4.9-2L1 1z"
                  fill="currentColor"
                  stroke="rgba(2,6,23,0.55)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          );
        })}
      </div>
      <CursorPill liveCount={liveCount} onHide={() => setEnabled(false)} />
    </>
  );
};

/**
 * The control that matters: it appears next to the thing it controls, at the
 * moment that thing is on screen. A setting buried in a footer is the wrong
 * answer on its own — someone who wants a moving cursor gone wants it gone
 * now, not after a scroll and a hunt. The footer switch exists too, because
 * hiding must not be a one-way door.
 *
 * It expands on hover and collapses to a dot otherwise, so the off switch is
 * always one click away without a permanent label sitting in the corner.
 */
const CursorPill = ({ liveCount, onHide }) => (
  <div className="cursor-pill">
    <span className="cursor-pill__dot" aria-hidden="true" />
    <span className="cursor-pill__body">
      <span className="cursor-pill__label">
        {liveCount > 0
          ? `${liveCount} other${liveCount === 1 ? '' : 's'} here now`
          : 'you, a moment ago'}
      </span>
      <button type="button" onClick={onHide} className="cursor-pill__hide">
        Hide
      </button>
    </span>
  </div>
);

CursorPill.propTypes = {
  liveCount: PropTypes.number.isRequired,
  onHide: PropTypes.func.isRequired,
};

const GhostCursors = () => {
  const { enabled, supported } = useCursorPresence();
  if (!supported || !enabled) return null;
  return <CursorLayer />;
};

export default GhostCursors;
