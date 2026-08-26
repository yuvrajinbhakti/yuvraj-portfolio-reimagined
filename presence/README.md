# Cursor presence relay

A Cloudflare Worker with one hibernating Durable Object. It forwards cursor
positions between people reading the same page of the portfolio, and does
nothing else — no database, no storage, no logging of anything it forwards.

The site works without it. If `VITE_PRESENCE_URL` is unset at build time the
client never opens a socket and the cursor layer falls back to BroadcastChannel,
which reaches the visitor's own other tabs and nothing more. That is the state
the site shipped in before this existed, and it is the state it degrades to if
this relay is down, undeployed, or removed.

## Deploying

```bash
cd presence && npm install && npx wrangler deploy
```

The first `deploy` will prompt you to log in and pick an account. It prints the
worker URL — something like `https://ysn-presence.<subdomain>.workers.dev`.

Then point the site at it. The client wants a **`wss://`** URL ending in
`/presence`, set as a Vercel environment variable and **rebuilt** — Vite inlines
`VITE_` variables at build time, so changing it in the dashboard does nothing
until the next deploy:

```
VITE_PRESENCE_URL = wss://ysn-presence.<subdomain>.workers.dev/presence
```

Finally, put the site's origin in `ALLOWED_ORIGINS` in `wrangler.toml` and
deploy again. Until that matches, the worker rejects the upgrade with a 403 —
which is the point: without an origin check the endpoint is a free WebSocket
relay for anyone who finds the URL.

## Checking it

```bash
curl https://ysn-presence.<subdomain>.workers.dev/health
```

`{"ok":true}` means the worker is up. That says nothing about whether the
Durable Object is reachable, so the real test is two browsers on the same page —
open the site in two different browsers (not two tabs of one, which
BroadcastChannel would handle on its own) and move the pointer in each.

`npx wrangler tail` streams live logs if it does not work.

## What it costs

Nothing, at this traffic. The Durable Object uses the WebSocket Hibernation API,
so the runtime may evict it from memory while sockets stay open and bills
duration only while a message is actually being handled. A room of people idling
on a page bills nothing. The free plan's limits are several orders of magnitude
above what a portfolio sees.

The consequence of hibernation is that no in-memory state survives between
messages, which is why every piece of per-connection state — the sender id, the
route, the rate-limit window — lives in the socket's attachment rather than in a
field on the object.

## The protocol

Identical to what the page already sent over BroadcastChannel, so the client
treats the two as one transport.

| direction | message | meaning |
|---|---|---|
| → relay | `{type:'hello', id, route}` | bind this connection's id, and set its route |
| → relay | `{type:'move', id, route, x, y}` | a position; also updates the route |
| → relay | `{type:'leave', id}` | leaving the page |
| relay → | `{type:'move', id, route, x, y}` | a peer on your route moved |
| relay → | `{type:'leave', id}` | a peer went away |

`x` and `y` are normalised — `x` against the viewport width, `y` against the
full document height — so a peer on a different window size and scroll position
lands on the same paragraph rather than the same pixel.

`hello` exists because the relay learns a connection's route from what that
connection sends, and somebody who arrives on a page and does not move their
mouse sends nothing. It is also re-sent on every reconnect, since a socket that
dropped and came back is an unknown reader until it says otherwise.

### What the relay refuses

- **A wrong origin.** 403 on the upgrade.
- **A second identity.** The id is bound on first use and every later message
  from that socket is attributed to it, so one connection cannot claim to be a
  crowd or take over somebody else's cursor. Ids are client-chosen on purpose —
  the same id travels over BroadcastChannel to the visitor's other tabs, and one
  id is what makes a second tab appear as one cursor instead of two.
- **More than 40 messages a second** from one connection. The client sends at
  most ~17.
- **Messages over 1 KB**, or positions that are not finite numbers near the unit
  square.
- **More than 120 concurrent connections**, as a ceiling on what a script
  pointed at the endpoint can hold open.

Forwarded messages are rebuilt from validated fields rather than passed through,
so nothing a client invents rides along to its peers.
