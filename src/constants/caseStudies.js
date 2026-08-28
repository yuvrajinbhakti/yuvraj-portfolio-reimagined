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
