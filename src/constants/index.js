import { amazon, razorpay } from "../assets/images";
import {
    realtimeCodeEditorIcon,
    fileSharingAppIcon,
    moneyzoldIcon,
    careCarRentalIcon,
    dockerNodeAppIcon,
    codeGenieIcon,
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
export const skills = [
    {
        imageUrl: express,
        name: "Express",
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
        type: "Cloud",
    },
];


export const experiences = [
    {
        title: "Frontend Engineer",
        company_name: "Razorpay",
        icon: razorpay,
        iconBg: "#f3f4f6",
        date: "July 2024 - Present",
        // Kept to outcomes and publicly-known technology. Internal tool names,
        // system inventory counts and pipeline architecture are deliberately
        // left out — a portfolio is indexed permanently, unlike a CV sent to a
        // named recipient.
        points: [
            "Joined as a Frontend Engineering Intern (July 2024 – July 2025) and converted to a full-time Frontend Engineer in July 2025.",
            "Built merchant-facing analytics and reporting dashboards, driving a 25% increase in platform adoption through real-time data visualisation.",
            "Replaced a legacy reporting stack with a modern operations platform, cutting report generation time by 40% across business units.",
            "Built a self-serve data onboarding pipeline using change-data-capture, reducing setup from two weeks to 24 hours and engineering effort by 70%.",
            "Architected an ML-powered fraud detection system that placed in the Top 30 of 500+ teams at the RBI Hackathon.",
            "Shipped an A/B testing framework with client-side caching and user segmentation, improving user satisfaction by 20% and tripling deployment speed.",
            "Built with React, TypeScript, REST APIs, Docker and Kubernetes."
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
        description: 'Collaborative code editor on Socket.io and React. Several people edit the same file at once, with live cursors.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Real-Time-Code-Editor-With-Database',
        demo_link: null, // Add demo link if available
        tags: ['React', 'Socket.io', 'Node.js', 'MongoDB', 'Real-time'],
        status: 'Completed',
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
        name: 'MoneyZold Finance App',
        description: 'Flutter app for tracking expenses and savings, with charts and analytics that make where the money went obvious at a glance.',
        source_code_link: 'https://github.com/yuvrajinbhakti/MoneyZold_Flutter',
        demo_link: null,
        tags: ['Flutter', 'Dart', 'Finance', 'Mobile', 'Charts'],
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
        tags: ['HTML', 'CSS', 'JavaScript', 'Responsive', 'UI/UX'],
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
