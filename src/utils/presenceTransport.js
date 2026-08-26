/**
 * Where a cursor position goes, and where other people's come from.
 *
 * Two pipes carrying identical messages:
 *
 *   BroadcastChannel — this browser's other tabs and windows. Free, instant,
 *                      never touches the network, and works offline.
 *   WebSocket        — everyone else, relayed by the Worker in presence/.
 *
 * They are combined rather than chosen between, and the messages are byte-for-
 * byte the same shape on both, which is what makes this a transport swap and
 * not a rewrite: GhostCursors sends and receives exactly what it did before.
 *
 * Both carry the same sender id, and that matters. A visitor with two tabs open
 * is a BroadcastChannel peer of themselves *and* — because both tabs hold a
 * socket — a relayed peer of themselves. One id means the receiving map has one
 * entry either way, so a second tab shows up as one cursor rather than two.
 *
 * If VITE_PRESENCE_URL is unset the socket half simply does not exist and this
 * behaves exactly as the BroadcastChannel-only version did. That is deliberate:
 * the relay is a separate deployment, and the site should not depend on it
 * being up, reachable, or deployed at all.
 */

const CHANNEL_NAME = 'ysn-presence';

const RECONNECT_BASE_MS = 800;
const RECONNECT_MAX_MS = 30000;

const socketUrl = () => {
  const raw = import.meta.env.VITE_PRESENCE_URL;
  if (!raw) return null;
  if (!/^wss?:\/\//.test(raw)) {
    console.warn(
      `VITE_PRESENCE_URL must be a ws:// or wss:// URL; got "${raw}". Cursor presence will stay local to this browser.`
    );
    return null;
  }
  return raw;
};

/**
 * The socket half. Reconnects with exponential backoff and jitter, stays down
 * while the tab is hidden, and drops anything it is asked to send while it is
 * not open.
 *
 * Dropping rather than queuing is the right call for this payload: a cursor
 * position is worthless the moment it is superseded, so a buffer flushed on
 * reconnect would replay a stranger's pointer skating across the page through
 * a path it took thirty seconds ago.
 */
const createSocket = (url, { onMessage, hello }) => {
  let socket = null;
  let timer = null;
  let attempt = 0;
  let closed = false;

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const connect = () => {
    clearTimer();
    if (closed || socket || document.hidden) return;

    let next;
    try {
      next = new WebSocket(url);
    } catch {
      scheduleReconnect();
      return;
    }
    socket = next;

    next.onopen = () => {
      attempt = 0;
      // Re-announce on every open, not just the first. The relay keeps each
      // connection's route in that connection's state, so a socket that
      // dropped and came back is an unknown reader until it says otherwise —
      // and a visitor who has been sitting still on a page sends nothing that
      // would tell it.
      const greeting = hello?.();
      if (greeting) {
        try {
          next.send(JSON.stringify(greeting));
        } catch {
          // Opened and closed in the same tick. The close handler reconnects.
        }
      }
    };

    next.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message && typeof message === 'object') onMessage(message);
      } catch {
        // Not our protocol. There is nothing useful to do with it.
      }
    };

    next.onclose = () => {
      if (socket === next) socket = null;
      scheduleReconnect();
    };

    next.onerror = () => {
      // onerror is always followed by onclose, which owns the reconnect. Closing
      // here just makes sure that happens promptly rather than waiting out a
      // half-open connection's timeout.
      try {
        next.close();
      } catch {
        // Already closing.
      }
    };
  };

  const scheduleReconnect = () => {
    if (closed || timer !== null) return;
    attempt += 1;
    const backoff = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** (attempt - 1));
    // Jitter, so a relay restart does not bring every open tab back at the
    // same millisecond.
    timer = setTimeout(connect, backoff * (0.7 + Math.random() * 0.6));
  };

  // Nothing is broadcast while the tab is in the background — GhostCursors
  // already stops sending — so holding a socket open there is pure cost. It
  // comes back when the visitor does.
  const onVisibility = () => {
    if (document.hidden) {
      clearTimer();
      attempt = 0;
      if (socket) {
        const current = socket;
        socket = null;
        current.onclose = null;
        try {
          current.close();
        } catch {
          // Already gone.
        }
      }
    } else {
      connect();
    }
  };

  document.addEventListener('visibilitychange', onVisibility);
  connect();

  return {
    send(message) {
      if (socket?.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify(message));
        } catch {
          // Closing underneath us; the reconnect path handles it.
        }
      }
    },
    close() {
      closed = true;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibility);
      if (socket) {
        socket.onclose = null;
        try {
          socket.close();
        } catch {
          // Already gone.
        }
        socket = null;
      }
    },
  };
};

/**
 * @param {object} options
 * @param {(message: object) => void} options.onMessage  Called for every peer message from either pipe.
 * @param {() => object|null} [options.hello]  Identity + route to announce on each socket open.
 * @returns {{ send: (m: object) => void, close: () => void, hasNetwork: boolean }}
 */
export const createPresenceTransport = ({ onMessage, hello }) => {
  const pipes = [];

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data && typeof event.data === 'object') onMessage(event.data);
    };
    pipes.push({
      send: (message) => channel.postMessage(message),
      close: () => {
        channel.onmessage = null;
        channel.close();
      },
    });
  }

  const url = socketUrl();
  if (url) pipes.push(createSocket(url, { onMessage, hello }));

  return {
    send(message) {
      for (const pipe of pipes) pipe.send(message);
    },
    close() {
      for (const pipe of pipes) pipe.close();
    },
    // Lets the UI tell the truth about where the data goes, rather than
    // hardcoding a claim that stops being true when the relay is configured.
    hasNetwork: Boolean(url),
  };
};

/** Whether a relay is configured at all — for copy that has to be accurate. */
export const HAS_PRESENCE_RELAY = Boolean(socketUrl());

export default createPresenceTransport;
