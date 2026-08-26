/**
 * The relay that makes the cursor layer real.
 *
 * Until now "live" cursors were BroadcastChannel only — other tabs of the same
 * browser on the same machine, which is honest but is not other people. This is
 * the smallest server that turns it into other people: it accepts WebSocket
 * connections, remembers which route each one is reading, and forwards a
 * position message to everyone else on that same route. It stores nothing, it
 * has no database, and it never sees anything but a random per-session id and
 * two normalised floats.
 *
 * One Durable Object holds every connection, rather than one per route.
 * Portfolio traffic is small enough that a single object is never the
 * bottleneck, and it means a visitor moving between pages sends one `route`
 * message instead of tearing down a socket and opening another.
 *
 * WebSocket Hibernation is the reason this is affordable. With
 * `acceptWebSocket` the runtime may evict the object from memory while its
 * sockets stay open, and bills duration only while a message is actually being
 * handled. A room with four people idling on a page costs nothing. The price is
 * that no in-memory state survives, so everything per-connection lives in the
 * socket's attachment — which is also why the rate limiter below counts inside
 * a window it stores rather than holding a timer.
 */

// Matches the client: it sends at most one position per SEND_INTERVAL (60ms),
// so ~17/s, plus heartbeats. This is roughly double that — enough headroom for
// a burst after a stall, low enough that a tab cannot flood the room.
const RATE_LIMIT = 40; // messages per window
const RATE_WINDOW_MS = 1000;

// A position message is about 90 bytes. Anything approaching this is not one.
const MAX_MESSAGE_BYTES = 1024;

// Past this the room stops accepting connections. Not a capacity limit — it is
// far beyond any traffic this site will see — but an upper bound on what a
// script pointed at the endpoint can hold open.
const MAX_CONNECTIONS = 120;

const ROUTE_MAX_LENGTH = 256;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Normalised coordinates only: finite, and inside the unit square. */
const validPosition = (value) => typeof value === 'number' && Number.isFinite(value) && value >= -1 && value <= 2;

export class PresenceRoom {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected a websocket upgrade', { status: 426 });
    }

    if (this.state.getWebSockets().length >= MAX_CONNECTIONS) {
      return new Response('room full', { status: 503 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // acceptWebSocket, not server.accept(): this is what opts the object into
    // hibernation. The handlers below are called as methods on the class
    // instead of as event listeners, precisely because the instance they run on
    // may have been reconstructed since the socket was opened.
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ id: null, route: null, windowStart: 0, count: 0 });

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > MAX_MESSAGE_BYTES) return;

    const session = ws.deserializeAttachment() ?? { id: null, route: null, windowStart: 0, count: 0 };

    // Fixed-window counter rather than a token bucket. It is coarser, but it is
    // two numbers instead of a float that has to be aged against a clock, and
    // the attachment is rewritten on every message either way.
    const now = Date.now();
    if (now - session.windowStart > RATE_WINDOW_MS) {
      session.windowStart = now;
      session.count = 0;
    }
    session.count += 1;
    if (session.count > RATE_LIMIT) {
      ws.serializeAttachment(session);
      return;
    }

    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      ws.serializeAttachment(session);
      return;
    }
    if (!message || typeof message !== 'object') {
      ws.serializeAttachment(session);
      return;
    }

    // The id is bound to the connection on first use and cannot be changed
    // afterwards. The client picks it — that is deliberate, because the same id
    // travels over BroadcastChannel to the visitor's other tabs, and both
    // transports arriving under one id is what stops a second tab appearing as
    // a second person. Pinning it here removes the obvious abuse: one socket
    // cannot claim to be several people, or take over somebody else's cursor
    // mid-session.
    if (typeof message.id === 'string' && message.id.length > 0 && message.id.length <= 64) {
      if (session.id === null) session.id = message.id;
    }
    if (session.id === null) {
      ws.serializeAttachment(session);
      return;
    }

    if (typeof message.route === 'string' && message.route.length <= ROUTE_MAX_LENGTH) {
      session.route = message.route;
    }

    ws.serializeAttachment(session);

    if (message.type === 'leave') {
      this.broadcast(ws, { type: 'leave', id: session.id }, session.route);
      return;
    }

    if (message.type !== 'move') return;
    if (!validPosition(message.x) || !validPosition(message.y)) return;
    if (session.route === null) return;

    // Rebuilt from validated fields rather than forwarded as received, so
    // nothing a client invented rides along to its peers.
    this.broadcast(
      ws,
      { type: 'move', id: session.id, route: session.route, x: message.x, y: message.y },
      session.route
    );
  }

  webSocketClose(ws) {
    this.announceDeparture(ws);
  }

  webSocketError(ws) {
    this.announceDeparture(ws);
  }

  announceDeparture(ws) {
    let session;
    try {
      session = ws.deserializeAttachment();
    } catch {
      return;
    }
    if (!session?.id) return;
    // Peers would drop this cursor on their own after PEER_DROP_MS, but twelve
    // seconds of a stranger's pointer parked on the page after they have gone
    // is exactly the stale-crowd effect the whole feature avoids.
    this.broadcast(ws, { type: 'leave', id: session.id }, session.route);
  }

  broadcast(from, payload, route) {
    if (route === null || route === undefined) return;
    const data = JSON.stringify(payload);
    for (const socket of this.state.getWebSockets()) {
      if (socket === from) continue;
      let session;
      try {
        session = socket.deserializeAttachment();
      } catch {
        continue;
      }
      // Route-scoped: someone reading a case study should not see a cursor
      // being moved around the contact form.
      if (session?.route !== route) continue;
      try {
        socket.send(data);
      } catch {
        // A socket that has gone away between getWebSockets() and here. The
        // close handler will deal with it.
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ ok: true });
    }

    if (url.pathname !== '/presence') {
      return new Response('not found', { status: 404 });
    }

    // Only the site may open a socket. Without this the endpoint is a free
    // WebSocket relay for anyone who finds it. ALLOWED_ORIGINS is a
    // comma-separated list set in wrangler.toml.
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (allowed.length > 0 && (!origin || !allowed.includes(origin))) {
      return new Response('forbidden origin', { status: 403 });
    }

    // A single named object. idFromName is deterministic, so every request
    // reaches the same instance without anything being stored to find it.
    const id = env.PRESENCE_ROOM.idFromName('global');
    return env.PRESENCE_ROOM.get(id).fetch(request);
  },
};
