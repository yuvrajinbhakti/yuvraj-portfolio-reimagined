// Long-form write-ups for the projects worth reading about in depth.
//
// Every number here comes from resume.tex. The connecting prose frames those
// facts as a narrative — if any framing misstates a decision you actually made,
// edit the `body` text; the metrics are the load-bearing part.
//
// `slug` drives the /work/:slug route. `projectId` links back to an entry in
// `projects` (constants/index.js) so cards can deep-link into the write-up.

export const caseStudies = [
  {
    slug: 'real-time-code-editor',
    projectId: 1,
    title: 'Real-Time Collaborative Code Editor',
    tagline: 'Several people typing in the same file, without overwriting each other.',
    role: 'Solo project — design, build, deploy',
    stack: ['React', 'Node.js', 'Socket.IO', 'Redis', 'Docker', 'Nginx', 'Bull', 'Prometheus', 'Grafana'],
    links: {
      // Verified answering: 200 in ~450ms across four spaced probes.
      //
      // Worth knowing that this host sleeps. It was measured completely
      // unresponsive once — 65 seconds, no reply — and came back on its own
      // minutes later, so the first visitor after a quiet spell may wait
      // through a cold start of half a minute or more while the free tier
      // wakes the container. That is not a broken link, but it is the reason
      // the second button below exists: something that answers instantly and
      // cannot sleep.
      demo: 'https://real-time-code-editor-codebuddy.onrender.com/',
      code: 'https://github.com/yuvrajinbhakti/Real-Time-Collaborative-Code-Editor',
    },
    // Alongside the demo rather than instead of it.
    //
    // A live demo of a *collaborative* editor, opened by one person, shows
    // nothing — two cursors converging on one line is the whole point, and a
    // single visitor cannot produce that. The playground runs this project's
    // actual algorithm, interactively, with both edits applied side by side.
    // It loads instantly, never sleeps, and demonstrates the part the write-up
    // is actually about.
    //
    // Deliberately not labelled "live demo": it is the algorithm, not the
    // deployed application, and saying otherwise would be an overclaim.
    tryIt: {
      to: '/playground?example=operational-transform#code-playground',
      label: 'Run the algorithm',
    },
    // Each of these is a load-test result and is labelled as one. "99.95%
    // verified uptime" was the one number here that could not survive the
    // question "verified how, over what window?" — and it sat directly above a
    // demo link that did not answer. Error rate under load is measured, from
    // the same test as the rest, and defensible in a room.
    metrics: [
      { value: '1000+', label: 'concurrent clients, load-tested' },
      { value: '75ms', label: 'P95 latency' },
      { value: '<0.5%', label: 'error rate at peak load' },
      { value: '10,000/s', label: 'operations processed' },
    ],
    sections: [
      {
        heading: 'The problem',
        body: 'Two people editing the same line at the same time is the hard part of collaborative editing. Naive approaches lose keystrokes: the last write wins and the other person\'s work quietly disappears. Getting this right means every client has to converge on the same document, no matter what order the edits arrive in.',
      },
      {
        heading: 'Operational Transform',
        body: 'Edits are sent as operations rather than as whole-document snapshots, and each operation is transformed against any concurrent operations it did not see before being applied. That means two people can type in the same place and both edits survive, with every client ending up at the same result. Redis clustering keeps that shared state consistent across server instances rather than trapping a session on one box.',
      },
      {
        heading: 'Scaling past one server',
        body: 'WebSocket connections are stateful, which makes horizontal scaling awkward — a client is pinned to whichever server it connected to. The deployment runs multiple containers behind Nginx load balancing, with Bull message queues carrying work between them, so servers can communicate and the system scales out instead of up.',
      },
      {
        heading: 'Proving it actually holds',
        body: 'The claims above are only worth something if they are measured, so the stack ships with Prometheus and Grafana and was put under sustained load testing. At 1,000 concurrent clients it processed over 10,000 operations per second at 75ms P95, with an error rate below 0.5%, and instrumentation surfaces an incident in under 30 seconds rather than leaving it to be discovered by users.',
      },
    ],
    takeaway:
      'The interesting work was not the editor UI — it was accepting that concurrent edits are a distributed-systems problem and building the conflict resolution, shared state and monitoring to match.',
  },
  {
    slug: 'secure-file-sharing',
    projectId: 2,
    title: 'Enterprise File Sharing Platform',
    tagline: 'Sharing sensitive documents without handing over permanent access.',
    role: 'Solo project — design, build, deploy',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'JWT', 'AES-256-GCM', 'Docker'],
    links: {
      demo: 'https://file-sharing-eight-wheat.vercel.app/',
      code: 'https://github.com/yuvrajinbhakti/FileSharing',
    },
    metrics: [
      { value: 'AES-256', label: 'GCM encryption at rest' },
      { value: '<100ms', label: 'API response time' },
      { value: '99.5%', label: 'uptime' },
      { value: '80%', label: 'less manual security review' },
    ],
    sections: [
      {
        heading: 'The problem',
        body: 'Most quick file-sharing tools trade security for convenience: links never expire, files sit unencrypted, and nobody can tell you afterwards who opened what. That is fine for a holiday photo and unacceptable for a signed contract.',
      },
      {
        heading: 'Encryption and access',
        body: 'Files are encrypted with AES-256-GCM, which authenticates the ciphertext as well as hiding it — tampering is detected rather than silently decrypted. Access sits behind JWT authentication with TOTP two-factor, and role-based access control decides who can see what. Share links are encrypted and carry an expiry, so access ends on a schedule instead of lasting forever.',
      },
      {
        heading: 'Making it auditable',
        body: 'Every access is written to an audit log in MongoDB automatically, and rate limiting middleware blunts brute-force and scraping attempts. The point was to make the system answerable: being able to say exactly who touched a document and when is the difference between a file host and something you would send a signed contract through, and it cut manual security monitoring by about 80%.',
      },
      {
        heading: 'Keeping it fast',
        body: 'Encryption and auditing both add work on the critical path, so Redis caching keeps API responses under 100ms. Bulk file operations and real-time upload tracking round out the day-to-day usage, and the whole thing is containerised with Docker, running at 99.5% uptime.',
      },
    ],
    takeaway:
      'Security features are easy to list and hard to make usable. The constraint that shaped this build was keeping responses under 100ms while still encrypting, authenticating and logging every single request.',
  },
  {
    slug: 'ot-core',
    projectId: 7,
    title: 'ot-core',
    tagline: 'I property-tested the algorithm I had already shipped, and 16% of concurrent edits diverged.',
    role: 'Solo — published to npm',
    stack: ['JavaScript', 'Node.js', 'Property testing', 'GitHub Actions', 'npm'],
    links: {
      demo: 'https://www.npmjs.com/package/ot-core',
      demoLabel: 'View on npm',
      code: 'https://github.com/yuvrajinbhakti/ot-core',
    },
    // The algorithm this library is, running in the browser. Same demo the
    // editor's write-up points at, because it is the same code.
    tryIt: {
      to: '/playground?example=operational-transform#code-playground',
      label: 'Run the algorithm',
    },
    metrics: [
      { value: '16.2%', label: 'of concurrent edits diverged, before' },
      { value: '0', label: 'divergences across 420,000 checks, after' },
      { value: '0', label: 'runtime dependencies' },
      { value: '9.5 kB', label: 'published package' },
    ],
    sections: [
      {
        heading: 'The claim I could not actually support',
        body: 'The collaborative editor above says that two people can type in the same place and both edits survive, with every client ending at the same result. I had load-tested it to 1,000 concurrent clients at 75ms P95 and it held, so I believed it. What I had never done was check the one thing Operational Transform exists to guarantee — and load testing cannot check it, because a load test measures whether the server keeps up, not whether the answer is right.',
      },
      {
        heading: 'What a property test found',
        body: 'The guarantee has a name, TP1: for two operations written against the same document, applying yours then theirs must produce exactly what applying theirs then yours produces. That is checkable without knowing the right answer in advance — generate two random concurrent edits, run both orders, compare. Against short documents and a small alphabet, so that edits collide often, 16.2% of 20,000 pairs came back different. Two people editing at once were ending up with different documents, in every category of edit: delete against delete worst at 1,530 failures, then insert against insert, then the mixed cases.',
      },
      {
        heading: 'Three bugs',
        body: 'There was no tie-breaker. When two people insert at the same index something has to decide who goes first, and my transform returned both operations unchanged — so each client kept its own position and the result depended on which message arrived first. Delete against delete double-counted characters the other delete had already removed, on nested and partially overlapping ranges. And an insert landing inside a concurrently deleted range left the two sides disagreeing about whether the inserted text survived. Each one is a few lines. None of them would ever show up in manual testing, because they only fire when two edits genuinely overlap.',
      },
      {
        heading: 'The trade-off I could not engineer away',
        body: 'Fixing the third bug forced a choice. If you type into text somebody else is deleting at that exact moment, preserving your character would require splitting their delete into two pieces around it — and an operation in this model is one position and one length, which cannot express that. The alternative is to model operations as sequences of retain, insert and delete components, the way Quill Delta and ShareDB do: strictly more capable, considerably more machinery. I kept the simple model, documented that the character is dropped, and said why. An honest limitation in the README is worth more than a subtle one in the code.',
      },
      {
        heading: 'Making the claim checkable',
        body: 'The fixed transform runs 420,000 fuzzed pairs with zero divergences — short documents, long ones, and emoji, since positions count code points rather than UTF-16 units. Reviewing my own suite then found a hole in it: the generator only ever inserted a single character, and a one-character insert shifts a position by one whether or not the code consulted its length, so the length arithmetic in three of four branches was barely exercised. CI runs the lot on Node 18, 20 and 22 — and caught a broken test script on the first push that nothing local would have shown.',
      },
    ],
    takeaway:
      'The gap between "it works" and "I can show you it works" was the entire project. The algorithm was 85% right, which is the most dangerous kind of wrong: good enough that every test I knew how to run came back green.',
  },
];

/**
 * The DOM id for a section heading, derived from the heading text.
 *
 * Lives here rather than in either of the two places that need it — the case
 * study page, which writes the ids, and the command palette, which links to
 * them — because an anchor is only worth having if both halves agree on it.
 * Two independent slugify functions is exactly how you end up shipping a
 * "Jump to section" result that lands at the top of the page.
 *
 * Headings are authored in this file, so this only has to handle the prose that
 * appears above: no transliteration, no collision suffixes. A duplicate heading
 * within one study would produce a duplicate id, which is invalid HTML and
 * would be visible immediately in the outline.
 */
export const sectionId = (heading) =>
  `s-${heading
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;

export const getCaseStudy = (slug) => caseStudies.find((c) => c.slug === slug);

export const caseStudyForProject = (projectId) =>
  caseStudies.find((c) => c.projectId === projectId);

export default caseStudies;
