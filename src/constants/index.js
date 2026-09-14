import { amazon, razorpay } from "../assets/images";
import {
    realtimeCodeEditorIcon,
    fileSharingAppIcon,
    moneyzoldIcon,
    careCarRentalIcon,
    dockerNodeAppIcon,
    codeGenieIcon,
    otCoreIcon,
    contact,
    express,
    github,
    javascript,
    linkedin,
    mongodb,
    motion,
    nextjs,
    nodejs,
    react,
    redux,
    tailwindcss,
    typescript,
    golang,
    docker,
    kubernets,
    aws
} from "../assets/icons";

// Generated project covers. The raw icons are 200-612px with mismatched
// backgrounds (one had a transparency checkerboard baked in), and the card
// renders them ~840x900 on a 2x display — so they were being upscaled ~4x.
// These composite each mark at native size onto a consistent dark cover.
// Regenerate with scripts/make-covers.py if an icon changes.
import realtimeCodeEditorCover from "../assets/covers/realtime-code-editor.webp";
import fileSharingCover from "../assets/covers/file-sharing.webp";
import moneyzoldCover from "../assets/covers/moneyzold.webp";
import careCarRentalCover from "../assets/covers/care-car-rental.webp";
import dockerNodeCover from "../assets/covers/docker-node.webp";
import codeGenieCover from "../assets/covers/code-genie.webp";
import otCoreCover from "../assets/covers/ot-core.webp";
// `tone` marks icons that were drawn for a light background.
//
// Measured against the card surface: Express is pure black at zero saturation,
// so it rendered at 1.14:1 contrast — present in the DOM and invisible on the
// page. Next.js is near-neutral and sat at 1.54:1.
//
// 'invert' only for neutral marks. AWS, Redux and Motion are equally dark but
// carry brand colour, and inverting a brand colour misrepresents it — those get
// 'lift', which raises brightness without touching hue. Everything at or above
// roughly 4:1 is left alone.
export const skills = [
    {
        imageUrl: express,
        name: "Express",
        tone: "invert",
        type: "Backend",
    },
    {
        imageUrl: javascript,
        name: "JavaScript",
        type: "Frontend",
    },
    {
        imageUrl: mongodb,
        name: "MongoDB",
        type: "Database",
    },
    {
        imageUrl: motion,
        name: "Motion",
        type: "Animation",
    },
    {
        imageUrl: nextjs,
        name: "Next.js",
        tone: "invert",
        type: "Frontend",
    },
    {
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: react,
        name: "React",
        type: "Frontend",
    },
    {
        imageUrl: redux,
        name: "Redux",
        tone: "lift",
        type: "State Management",
    },
    {
        imageUrl: tailwindcss,
        name: "Tailwind CSS",
        type: "Frontend",
    },
    {
        imageUrl: typescript,
        name: "TypeScript",
        type: "Frontend",
    },
    {
        imageUrl: golang,
        name:"Go",
        type: "Backend",
    },
    {
        imageUrl: docker,
        name:"Docker",
        type: "Backend",
    },
    {
        imageUrl: kubernets,
        name:"Kubernetes",
        type: "Backend",
    },
    {
        imageUrl: aws,
        name:"AWS",
        tone: "lift",
        type: "Cloud",
    },
];


export const experiences = [
    // Two entries, not one. The single "July 2024 – Present" card had grown to
    // eight bullets, and it flattened the one thing the dates make legible on
    // their own: what an intern shipped, and what changed once the role was
    // full-time. The Impact Inventory (Sep 2026) already draws the line —
    // section D is the internship, A, B and E are the year after — so the
    // split follows it, and each figure keeps its row id in the comment.
    //
    // Kept to outcomes and publicly-known technology. Internal tool names,
    // system inventory counts and pipeline architecture are deliberately left
    // out — a portfolio is indexed permanently, unlike a CV sent to a named
    // recipient. Everything here is marked Measured in the inventory; the old
    // bullets' 25%, 40%, 70%, the A/B framework and the RBI Hackathon placing
    // appeared in no source and are gone.
    {
        title: "Frontend Engineer",
        company_name: "Razorpay",
        icon: razorpay,
        iconBg: "#f3f4f6",
        date: "July 2025 - Present",
        points: [
            // E1 + B6 — codeowner; field onboarding 4–5 days → 1 day, PRs 6 → 3–4 (Oct 2025).
            "Reporting codeowner across the merchant and admin dashboards. Rebuilt report onboarding as a config-driven admin UI, taking a new field from four or five days down to one and a new entity from six PRs to three.",
            // B8 + B7 — exports 95 days → 5 years; annual reports to 100% of India merchants (Apr 2026).
            "Extended report exports from 95 days to five years of history, and rolled annual reports out to 100% of India merchants behind feature-flag experiments.",
            // A1/A2 + A3 — zero data gaps, zero duplicate writes; spot reclaim killing the output committer, fleet fix shipped. Counts left out on purpose.
            "Migrated the team's Airflow estate from 2 to 3 with zero data gaps and zero duplicate writes, and root-caused a class of Spark/EMR failures written off as flakiness — spot reclaim killing the output committer — then shipped the fleet fix.",
            // B10 — HTTP-200-wrapped 500s the retry classifier never inspected; redeploy to 100% of merchants in IN/US/SG with zero incidents.
            "Brought a collapsed reporting end-to-end suite back to green — the failures were 500s wrapped in HTTP 200s that the retry classifier never inspected — and used it to gate a zero-incident redeploy across India, the US and Singapore.",
            // E3 — four people, named in the inventory.
            "Mentored four engineers through PR process, canary-gated merges and API testing.",
            // E4 — breadth, without the PR count (activity, not impact).
            "Built with React, TypeScript, Go, PHP, Spark, Terraform, Docker and Kubernetes."
        ],
    },
    {
        title: "Frontend Engineering Intern",
        company_name: "Razorpay",
        icon: razorpay,
        iconBg: "#f3f4f6",
        date: "July 2024 - July 2025",
        points: [
            // D1 — measured: "currently live for ~15k merchants".
            "Sole frontend engineer on the embedded-analytics product now live for ~15,000 merchants — a React micro-app scoping every query to the requesting merchant, shipped across three repositories.",
            // D2 — turnaround weeks → 24 hours (May 2025).
            "Shipped self-serve onboarding that replaced hand-raised PRs with a guided flow, cutting turnaround from weeks to 24 hours.",
            // D3 — the team's first attribution signal; product name left out.
            "Built a tracked growth campaign into the report emails behind a feature-flag experiment — the team's first attribution signal for its data-sync product.",
            "Converted to a full-time Frontend Engineer in July 2025."
        ],
    },
    {
        title: "Amazon Machine Learning Summer School",
        company_name: "Amazon",
        icon: amazon,
        iconBg: "#ffeedb",
        date: "July 2024",
        points: [
            "Selected from 91,000+ applicants — the top 0.2% — for Amazon's Machine Learning Summer School.",
            "Studied supervised and unsupervised learning, deep neural networks, reinforcement learning and generative AI.",
            "Applied machine learning models to real-world projects using Python, pandas and scikit-learn."
        ],
    },
];


// One source of truth for the resume. It was hardcoded in two places with two
// different file ids — the About page was serving the copy that CTA.jsx had
// explicitly commented out and replaced, so half the site handed out a stale CV.
export const RESUME_URL =
    'https://drive.google.com/uc?export=download&id=1HQLXSGKhlacfSghWZpHeRbGrJcDDLRLo';

export const socialLinks = [
    {
        name: 'Email',
        iconUrl: contact,
        link: 'mailto:yuvrajsinghnain03@gmail.com',
    },
    {
        name: 'GitHub',
        iconUrl: github,
        link: 'https://github.com/yuvrajinbhakti/',
    },
    {
        name: 'LinkedIn',
        iconUrl: linkedin,
        link: 'https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/',
    }
];


export const projects = [
    {
        id: 1,
        iconUrl: realtimeCodeEditorIcon, 
        image: realtimeCodeEditorCover,
        theme: 'btn-back-blue',
        name: 'Realtime Code Editor',
        description: 'Collaborative code editor on Socket.io and React, load-tested to 1,000 concurrent clients — and the merge logic was still wrong. The write-up is about how I found out.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Real-Time-Code-Editor-With-Database',
        demo_link: null, // Add demo link if available
        tags: ['React', 'Socket.io', 'Node.js', 'MongoDB', 'Real-time'],
        status: 'Completed',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        id: 7,
        iconUrl: otCoreIcon,
        image: otCoreCover,
        theme: 'btn-back-blue',
        name: 'ot-core',
        // The only entry here that other people can install, which is the
        // thing worth saying first.
        description: 'Published npm library. The Operational Transform engine from the code editor, property-tested until it stopped losing edits — 16% of concurrent pairs used to diverge.',
        source_code_link: 'https://github.com/yuvrajinbhakti/ot-core',
        demo_link: null,
        tags: ['JavaScript', 'Open Source', 'npm', 'Property Testing', 'Algorithms'],
        status: 'Published',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        id: 2,
        iconUrl: fileSharingAppIcon, 
        image: fileSharingCover,
        theme: 'btn-back-green',
        name: 'File Sharing App',
        description: 'Secure file sharing with encrypted storage and share links that expire on a schedule, so access ends instead of lasting forever.',
        source_code_link: 'https://github.com/yuvrajinbhakti/FileSharing',
        demo_link: null,
        tags: ['Node.js', 'Express', 'Multer', 'Security', 'File Upload'],
        status: 'Completed',
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        id: 3,
        iconUrl: moneyzoldIcon, 
        image: moneyzoldCover,
        theme: 'btn-back-yellow',
        name: 'MoneyZold — a CRED clone',
        description: 'A rebuild of the CRED interface in Flutter — custom clip paths, neumorphic surfaces and animation, over a local store that fakes network latency.',
        source_code_link: 'https://github.com/yuvrajinbhakti/MoneyZold_Flutter',
        demo_link: null,
        tags: ['Flutter', 'Dart', 'GetX', 'Mobile', 'UI'],
        status: 'Completed',
        gradient: 'from-yellow-500 to-orange-500'
    },
    {
        id: 4,
        iconUrl: careCarRentalIcon, 
        image: careCarRentalCover,
        theme: 'btn-back-red',
        name: 'Care Car Rental Website',
        description: 'Full rebuild and relaunch of the Care car rental site, rewriting the booking flow around fewer steps and a clearer interface.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Care-Car-Rental-Website',
        demo_link: null,
        // Checked against the repository rather than remembered. package.json
        // pins react 18.2, react-dom, react-router-dom 6.8 and react-scripts,
        // and the booking flow this description describes is react-datepicker;
        // the language split is JavaScript 65 kB and SCSS 40 kB against 1.4 kB
        // of HTML, which is just the Create React App shell.
        //
        // So "HTML, CSS, JavaScript" was not merely imprecise, it undersold the
        // project — it read as a static page when it is a routed React
        // application, which is the one thing on this card a reader would care
        // about. UI/UX went with it: every project here involves interface
        // work, so the tag separates nothing.
        tags: ['React', 'React Router', 'SCSS', 'Responsive'],
        status: 'Completed',
        gradient: 'from-red-500 to-pink-500'
    },
    {
        id: 5,
        iconUrl: dockerNodeAppIcon, 
        image: dockerNodeCover,
        theme: 'btn-back-black',
        name: 'Dockerized Node.js Application',
        description: 'Containerised Node.js service with a published DockerHub image, so deploying it is a pull and a run rather than a setup guide.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Hi-Docker-World',
        demo_link: null,
        tags: ['Docker', 'Node.js', 'DevOps', 'Containerization', 'CI/CD'],
        status: 'Completed',
        gradient: 'from-gray-700 to-gray-900'
    },
    {
        id: 6,
        iconUrl: codeGenieIcon, 
        image: codeGenieCover,
        theme: 'btn-back-purple',
        name: 'CodeGenie',
        description: 'Python code generator that scaffolds functions, classes, exceptions and ML/NLP components as PEP 8-compliant code.',
        source_code_link: 'https://github.com/yuvrajinbhakti/code_genie_automatic_code_generator',
        demo_link: null,
        tags: ['Python', 'Code Generation', 'AI', 'Automation', 'Machine Learning'],
        status: 'Completed',
        gradient: 'from-purple-500 to-indigo-500'
    }
];
