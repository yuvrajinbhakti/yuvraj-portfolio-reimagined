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
    tagline: 'It held a thousand concurrent clients. When I finally read the sync code, there was no merge logic to be wrong.',
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
    // The load-test numbers moved into the prose below, where the section
    // explaining why they proved nothing about correctness can sit next to
    // them. They also measured a sync layer that no longer exists, so leaving
    // them here as the headline figures for the current code would be the same
    // kind of overclaim this page is about.
    metrics: [
      { value: '16.2%', label: 'of concurrent edit pairs diverged' },
      { value: '0', label: 'imports of the OT library already in package.json' },
      { value: '6', label: 'bugs found by running it, not by reading it' },
      { value: '157', label: 'tests behind the merge logic now' },
    ],
    sections: [
      {
        heading: 'The problem',
        body: 'Two people editing the same line at the same time is the hard part of collaborative editing. Naive approaches lose keystrokes: the last write wins and the other person\'s work quietly disappears. Getting this right means every client has to converge on the same document, no matter what order the edits arrive in.',
      },
      {
        heading: 'Operational Transform, and the sentence I should not have written',
        body: 'Edits are sent as operations rather than whole-document snapshots, and each operation is transformed against any concurrent operations it did not see before being applied. Redis clustering keeps that shared state consistent across server instances rather than trapping a session on one box. This section used to end by saying that two people can type in the same place and both edits survive, with every client ending up at the same result. That is what Operational Transform is for and it is what I believed I had built — but it was a description of the intention, not a report of a measurement, and when I finally measured it the answer was no. The paragraph stayed here, wrong, for as long as it took me to think of testing it.',
      },
      {
        heading: 'Scaling past one server',
        body: 'WebSocket connections are stateful, which makes horizontal scaling awkward — a client is pinned to whichever server it connected to. The deployment runs multiple containers behind Nginx load balancing, with Bull message queues carrying work between them, so servers can communicate and the system scales out instead of up.',
      },
      {
        heading: 'What the load test proved, and what it could not',
        body: 'The stack ships with Prometheus and Grafana and was put under sustained load. At 1,000 concurrent clients it processed over 10,000 operations per second at 75ms P95, with an error rate below 0.5%, and instrumentation surfaces an incident in under 30 seconds rather than leaving it for a user to find. Every one of those numbers is real and every one of them is about throughput. A load test asks whether the server keeps up; it cannot ask whether the answer is right, because it has no idea what the right answer is. Two clients ending a session holding different documents is not an error, a timeout or a dropped connection — it is two successful requests. The graphs were green the entire time the merge logic was wrong. Those numbers also measured the sync layer as it was then, not the one described below. And the monitoring was less real than this section implied: prometheus.yml had been scraping /metrics every fifteen seconds since it was written, the load test hit the same path, prom-client was installed — and no route ever served it. The scrape target did not exist. It does now, reporting operations by outcome, how long each takes to order, and how much history each room is holding.',
      },
      {
        heading: 'How I found out',
        body: 'Operational Transform has exactly one law, called TP1: for two edits written against the same document, applying yours then theirs must give the same text as applying theirs then yours. That is checkable without knowing the right answer in advance — generate two random concurrent edits, run both orders, compare. Against short documents and a small alphabet, so that edits collide often, 16.2% of 20,000 pairs came back different. Delete against delete was worst, then insert against insert, then the mixed cases. Every one of those pairs is two people losing each other\'s work, and none of them would ever appear in manual testing, because they only fire when two edits genuinely overlap.',
      },
      {
        heading: 'Going back to fix it, and what I found instead',
        body:
          'The corrected transform, the convergence tests, a client state machine, a server and editor bindings all live in ot-core, which is published to npm and has its own write-up next to this one. Extracting it forced the part that mattered: an algorithm inside an application can hide behind the application, and one in a library with a test suite cannot. Then I came back to wire the library into the application, which meant reading the sync code properly for the first time in a long while. Every keystroke emitted the entire file. Every arriving message replaced the entire file. The server held no document at all — it rebroadcast whatever it was handed, and a new joiner was brought up to date by asking another client to mail them its text. So the sentence at the top of this page was too generous to itself. I had called the merge logic wrong; there was no merge logic. Two people typing within a round trip of each other did not merge badly, the later message won the whole file and the other person\'s work was gone. And sharedb — a complete Operational Transform implementation — had been sitting in package.json the entire time, imported by exactly zero lines.',
      },
      {
        heading: 'What it took to actually land it',
        body:
          'The application now holds an ot-core client per editor and the server holds one authority per room: clients send operations, the server orders them and rebases late ones against everything that landed while they were in flight. Remote cursors move with the text rather than being redrawn from stale offsets, and undo undoes only your own edits — the editor\'s own stack would undo everybody\'s, because from its point of view somebody else\'s operation is just another change to the document. Two bugs turned up that no amount of reading would have found. The server sent the document both on join and in reply to the client\'s request, so every client initialised twice, and the second initialisation replaced the document while the collaborative binding was already attached — which reported replacing the document as an edit and emptied the room for everyone in it. That one also changed the library: a whole-document replacement is never translated into an operation now, because something that can wipe a document when it is used slightly wrong should not depend on the application being careful. Verified with two browsers in one room, typing at the same position: both edits survived, both tabs agreed, and each saw the other\'s caret.',
      },
      {
        heading: 'Right code is not a working demo',
        body:
          'The editing was correct and the site was still broken, which took four more failures to sort out — and every one of them was found by running the thing rather than reading it. Two people joining a room saw a phantom third with no name, because the server cleared a departing socket\'s username before it had left the room and the client only ever removes people on an explicit goodbye. A metrics gauge counting connected sockets climbed and never came down, because Engine.IO has not decremented its count yet at the moment the disconnect event fires. The Docker image built cleanly and died on startup, because the Dockerfile listed the files to copy by hand and nobody had added the two new modules to that list — then the next build failed outright on a directory in that same list that does not exist, so the list is gone and the image copies the repository. And the deployed page told every visitor\'s browser to open a socket to their own machine, because the bundle fell back to localhost when a build-time variable was unset, which under a Docker build it always is. The server had been correct and unreachable for hours. It connects to the origin serving the page now, which needs no configuration to be right.',
      },
    ],
    takeaway:
      'I built the monitoring, ran the load test, read the graphs and concluded it worked. All of that was real and none of it was evidence for the claim I was actually making. The thing I would do differently is not "test more" — it is noticing when a sentence I have written is a description of what I intended rather than a report of something I checked. Twice, as it turned out: first the claim that edits converged, and then the claim that the merge logic was merely wrong. I wrote the second one on this page while the code did not merge at all, because I was describing the design I remembered instead of the file I could have opened.',
  },
  {
    slug: 'secure-file-sharing',
    projectId: 2,
    title: 'Enterprise File Sharing Platform',
    tagline: 'Every file it stored was in plaintext, and the dashboard said otherwise.',
    role: 'Solo project — design, build, deploy',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'JWT', 'AES-256-GCM', 'Docker'],
    links: {
      demo: 'https://file-sharing-eight-wheat.vercel.app/',
      code: 'https://github.com/yuvrajinbhakti/FileSharing',
    },
    metrics: [
      { value: '0', label: 'files that were actually encrypted, before' },
      { value: '4', label: 'calls to a Node function that does not exist' },
      { value: '1', label: 'fallback that turned the failure into success' },
      { value: '5', label: 'properties the encryption is now checked against' },
    ],
    sections: [
      {
        heading: 'The problem',
        body:
          'Most quick file-sharing tools trade security for convenience: links never expire, files sit unencrypted, and nobody can tell you afterwards who opened what. That is fine for a holiday photo and unacceptable for a signed contract.',
      },
      {
        heading: 'What it was supposed to do',
        body:
          'Encrypt every file at rest with AES-256-GCM, which authenticates the ciphertext as well as hiding it, so tampering is detected rather than silently decrypted. Put access behind JWT authentication with TOTP two-factor and role-based control. Write every access to an audit log in MongoDB, so the system can say exactly who touched a document and when. Give share links an expiry, so access ends on a schedule instead of lasting forever. All of that is implemented, and all of it was true except the first clause.',
      },
      {
        heading: 'It stored everything in plaintext',
        body:
          'I went looking for numbers on this page I could not defend, and found something worse than a soft metric. The encryption module calls crypto.createCipherGCM. There is no such function in Node — the API is createCipheriv, and the GCM part comes from the algorithm string. Every call threw. All four sites had it, both directions. That alone would have been loud, an upload failing visibly. What made it quiet was the next fifteen lines: the upload controller caught the error and fell back to storing the file unencrypted, assembling what the code itself called a \u201cfake encryption result\u201d so the rest of the pipeline would accept it. So the failure was not merely silent, it was converted into apparent success. Meanwhile the dashboard told every user \u201cyour files will be encrypted with AES-256 before storage\u201d. Every file this application ever stored was written to disk in the clear.',
      },
      {
        heading: 'Why nothing caught it',
        body:
          'Everything around the mistake was right, which is exactly why it survived. A fresh IV per file, getAuthTag on the way out, setAuthTag on the way back in, the algorithm string correct at the top of the file — the whole shape of a careful GCM implementation, with one function name in the middle that does not exist. It reads correctly. It passes review. Uploads succeeded, downloads returned the right bytes, and the audit log filled up, because a plaintext file round-trips perfectly. Nothing in the product could tell the difference between working encryption and none at all, and nothing was checking. The fix is four characters, four times.',
      },
      {
        heading: 'What it is checked against now',
        body:
          'Five properties, because the round trip alone would have passed on plaintext. The file and text round trips match. The bytes on disk are not the plaintext. A single flipped byte in the ciphertext is rejected. Decryption with the wrong key is rejected. Those last two are the entire point of GCM over plain AES, and neither could have passed before. The fallback is gone as well: an upload that cannot be encrypted is now refused and the temporary file deleted, because a tool whose whole premise is secure sharing must not silently downgrade the one guarantee it makes. Failing loudly costs an upload. Succeeding quietly costs the guarantee, and the user cannot tell which they got.',
      },
      {
        heading: 'The numbers that used to be here',
        body:
          'This page claimed responses under 100ms, 99.5% uptime, and an 80% reduction in manual security review. The repository contains no load test, no timing instrumentation, and nothing that measures uptime or review effort, so none of the three had a source. They are gone rather than softened. Redis caching, database indexes and connection pooling are real and worth doing; what they achieve under load is unknown until somebody measures it. Uptime is observed over months, not built, and an 80% reduction needs a baseline that never existed.',
      },
    ],
    takeaway:
      'I audited this page expecting to delete a few soft percentages, and found that its flagship claim was not soft but false. The lesson is not that I should have tested the encryption, though I should have. It is that the code looked exactly like working encryption, the product behaved exactly like working encryption, and the only way to tell the difference was to encrypt a file and check that the bytes on disk were not the ones I put in. Every security feature has a version of that check, and it is never the one the feature makes convenient to run.',
  },
  {
    slug: 'moneyzold',
    projectId: 3,
    title: 'MoneyZold',
    tagline: 'A rebuild of CRED\'s interface, down to the curves. Everything behind it is a lie.',
    role: 'Solo — a study, not a product',
    stack: ['Flutter', 'Dart', 'GetX', 'flutter_neumorphic'],
    links: {
      code: 'https://github.com/yuvrajinbhakti/MoneyZold_Flutter',
    },
    // Numbers a reader can check against the repository in under a minute,
    // including the two that are not flattering. A write-up about a study is
    // worth reading only if it is clear that it is one.
    metrics: [
      { value: '0', label: 'network calls — every screen is fed by a fake' },
      { value: '4s', label: 'the longest delay the fake API adds on purpose' },
      { value: '6', label: 'clippers and painters drawn by hand, in 4 files' },
      { value: '1', label: 'test, and it is the generated one' },
    ],
    sections: [
      {
        heading: 'What it actually is',
        body: 'A reimplementation of CRED\'s mobile interface in Flutter. The repository is called MoneyZold and the Dart package inside it is called cred, which is the more honest of the two names — every import in the project reads package:cred/. It is not a finance app and it does not track anything: there is no backend, no account, no persistence, and the two data models are a credit card and a home-screen advertisement. What it is, is an attempt to hit a commercial app\'s visual standard with nothing to hide behind, which is a specific and unglamorous skill that a to-do list does not exercise.',
      },
      {
        heading: 'The interesting part is the shapes',
        body: 'CRED\'s interface is built out of curves that no standard widget gives you, so four of the seven files in lib/core exist to draw them: WaveClipper, ShapeClipper, BottomBarClipper and RadialGradientMask. The wave is the one worth opening — a loop of ten quadratic Bézier segments, alternating their control points above and below the baseline to produce a scalloped edge that stretches with the widget rather than being a fixed image. That is the whole reason to build something like this. You can copy a layout from a screenshot; you cannot copy a path that has to be correct at every width.',
      },
      {
        heading: 'An API that lies on purpose',
        body: 'lib/data/api/FakeApisImpl.dart returns its lists through Future.delayed — four seconds for the home advertisements, three for the cards. Reading it as a mistake is the wrong instinct. Loading states are the part of an interface that never gets built when the data is a local array, because there is no moment in which anything is missing: the skeletons, the spinners and the empty states all get skipped, and the app looks finished until it meets a real network. Putting the delay in first makes those screens compulsory. It is the same instinct as the latency slider on the ot-core playground, arrived at three years earlier and for a much smaller reason.',
      },
      {
        heading: 'Layered as though the backend existed',
        body: 'lib/ splits into core, data, models and ui, the data layer splits again into api, repo and fakedata, and every page carries a GetX binding that constructs its controller — CardsPageBinding, HomePageBinding, MoneyPageBinding and the rest. None of that structure is load-bearing for an app with two models and no server; it is there because swapping FakeApisImpl for something real should be a one-line change, and building the seam before you need it is the only time it is cheap. Whether that patience would have survived contact with an actual API is not something this repository can tell you, because it never got one.',
      },
      {
        heading: 'What it is not',
        body: 'Four commits, three of which edit the README, between March and July 2023, and nothing since. The Dart is pinned to an SDK older than null safety. The single file in test/ is the counter test Flutter generates when it scaffolds a project — it references a widget this app does not have and would fail if anyone ran it. Set against ot-core two write-ups away, which exists because I could not support a claim I had made, this one is here on different terms: it is an exercise in making something look right, kept because that is a real part of the job and because the clip paths are still the best thing in it.',
      },
    ],
    takeaway:
      'The habit worth keeping from this is the fake four-second delay. Everything else here is a 2023 study — but building the loading state before the loading exists is the only way it gets built at all, and I have been putting artificial latency in front of myself ever since.',
  },
  {
    slug: 'ot-core',
    projectId: 7,
    title: 'ot-core',
    tagline: 'I property-tested the algorithm I had already shipped, and 16% of concurrent edits diverged.',
    role: 'Solo — published to npm',
    stack: ['JavaScript', 'Node.js', 'Property testing', 'GitHub Actions', 'npm'],
    links: {
      // This used to be the npm page, carrying a `demoLabel` of "npm" so that
      // no button would say "Demo" and land somewhere you cannot demo
      // anything. There is a real one now: three clients, a server, and a
      // network you can break — so the label goes back to the truth and npm
      // moves to a slot of its own.
      demo: 'https://yuvrajinbhakti.github.io/ot-core/demo/',
      package: 'https://www.npmjs.com/package/ot-core',
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
      { value: '0', label: 'divergences across 920,000 checks, after' },
      { value: '0', label: 'runtime dependencies' },
      { value: '9', label: 'bugs found above the algebra, none in it' },
    ],
    sections: [
      {
        heading: 'The claim I could not actually support',
        body: 'The write-up for the collaborative editor used to say, as a plain statement of fact, that two people can type in the same place and both edits survive with every client ending at the same result. It says something rather different now. I had load-tested it to 1,000 concurrent clients at 75ms P95 and it held, so I believed it. What I had never done was check the one thing Operational Transform exists to guarantee — and load testing cannot check it, because a load test measures whether the server keeps up, not whether the answer is right.',
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
        body: 'The fixed transform runs 920,000 fuzzed checks with zero divergences — short documents, long ones, and emoji, since positions count code points rather than UTF-16 units. Reviewing my own suite then found a hole in it: the generator only ever inserted a single character, and a one-character insert shifts a position by one whether or not the code consulted its length, so the length arithmetic in three of four branches was barely exercised. CI runs the lot on Node 18, 20 and 22 — and caught a broken test script on the first push that nothing local would have shown. It also refuses to let a test skip: the six that need a real WebSocket skip themselves when the one devDependency is absent, which is right for a fresh clone and wrong on CI, where a suite quietly ceasing to test what it was written for is worse than one that is simply missing.',
      },
      {
        heading: '785 downloads, and what that number is not',
        body:
          'The package shows 785 downloads in its first two days, and it would be easy to put that on this page as a sign somebody wanted it. The daily breakdown says otherwise. Every one of them landed on the two days I published: 148 on the day 1.0.0 went up, 637 on the day four more versions did, and zero on every other day. Downloads that track the publish button and stop the moment it does are npm\'s mirrors, corporate registry proxies and the security scanners that fetch every new tarball within minutes of it appearing. The count is real. It is not evidence that anyone installed this. I cannot prove that from outside — npm publishes totals, not user agents — but a number that only moves when I move it is not measuring the thing the number appears to measure, which is the entire subject of this write-up. The first honest signal will be a download on a day I did not publish.',
      },
      {
        heading: 'The line in the README that was wrong',
        body: 'Every test above checks a pair of operations. Nobody runs a pair — they run several people against a server, and it is not obvious that a property about two edits survives five clients, twenty rounds and acknowledgements arriving late. So I built the session as a simulation: 20,000 of them, all converging, and at every acknowledgement the client\'s own rebase of its pending edit has to equal the server\'s. That last assertion is the invariant the whole protocol rests on, and nothing had ever checked it. Writing the simulation wrong twice first is what made it worth having — both times it looked like the library was broken, and both times the bug was in my model of the protocol.',
      },
      {
        heading: 'Building the demo found two more bugs',
        body: 'The playground is three real clients and a real server over a wire whose latency, jitter, duplicate rate and connection failures are all sliders. It exists to make the argument in one click — the same three concurrent edits converge with a server and land on two different documents without one — and it paid for itself twice before that. The room was acknowledging the author before broadcasting to everyone else, and because the author releases its next buffered edit the instant it is acknowledged, that edit reached the server and went out first: every other client saw revision N+1 arrive before N and discarded N as a duplicate. One operation lost per collision, silently, in code that had passed 55,000 simulated sessions. The other was that the room dropped history the moment somebody left, so a client whose socket died came back to be told it was too far behind and was resynced from a snapshot that quietly threw away everything it had typed offline. Both are the kind of thing you only find by running the thing rather than testing it.',
      },
      {
        heading: 'And then a real socket found three more',
        body: 'Every test to that point drove a socket I had written, and mine were synchronous. A real one delivers on a later turn of the event loop, hands the server a Buffer where a browser hands a string, and can close between a write and its delivery — none of which anything had exercised. Six tests against an actual WebSocket server found three bugs in code that had already survived 55,000 simulated sessions. The room forgot a client when its socket closed, discarding the sequence number used to recognise a resend at the exact moment it was about to matter, so the client came back, resent, and the text was inserted twice. A client applied its own operation when it arrived as history on a rejoin, because the path that handled that correctly was the one taking an explicit array, not the one where the same operations arrive as messages. And an acknowledgement could advance a client past operations it had never seen, after which its next buffered edit was sent claiming a baseline it never had and the server rebased it from the wrong place — one character, one position early, and nothing complained.',
      },
      {
        heading: 'What that pattern is actually telling me',
        body: 'Nine bugs now, and not one of them in the transform function. Every single one lived in the layer above it: the state machine, the fan-out, the reconnect. The algebra was the part I was afraid of and the part that turned out to be provable, because a property test can generate a million cases and check each one against a law. The protocol around it has no such law — its correctness is a story about timing, and the only way to check a story about timing is to build the thing that has the timing. Each layer needed a harness the layer below could not provide: property tests for the pair, simulated sessions for the protocol, a playground for the fan-out, a real socket for everything asynchronous. I keep expecting to be finished and keep finding the next harness.',
      },
      {
        heading: 'What a server is actually for',
        body: 'The README used to say peer-to-peer "needs a side per originating peer", which implies a careful tie-break is enough. It is not. Convergence over a pair is TP1; convergence when different participants transform in different orders is TP2, which this model does not have and almost no operational transform does. An exhaustive search found the smallest counterexample there is — a two-character document, three edits — where six peers receiving the same three edits in the six possible orders land on two different documents, at a rate of about 3.6% across random triples. Impose one order and it is zero across 200,000. That is now asserted as a test rather than described as a caveat: a limitation somebody can trip over in production should fail the build if it ever changes.',
      },
    ],
    takeaway:
      'The gap between "it works" and "I can show you it works" was the entire project. The algorithm was 85% right, which is the most dangerous kind of wrong: good enough that every test I knew how to run came back green. Then the documentation turned out to have the same problem — the sentence about peer-to-peer sounded careful and was false — and then the protocol above the algorithm turned out to have it too, nine times. The lesson was not that I write buggy code. It was that every layer needs a harness the layer below cannot provide, and that I stop building harnesses the moment one of them goes quiet.',
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
