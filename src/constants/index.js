import { amazon, razorpay } from "../assets/images";
import {
    realtimeCodeEditorIcon,
    fileSharingAppIcon,
    moneyzoldIcon,
    careCarRentalIcon,
    dockerNodeAppIcon,
    codeGenieIcon,
    contact,
    css,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    motion,
    mui,
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
export const skills = [
    {
        imageUrl: css,
        name: "CSS",
        type: "Frontend",
    },
    {
        imageUrl: express,
        name: "Express",
        type: "Backend",
    },
    {
        imageUrl: git,
        name: "Git",
        type: "Version Control",
    },
    {
        imageUrl: github,
        name: "GitHub",
        type: "Version Control",
    },
    {
        imageUrl: html,
        name: "HTML",
        type: "Frontend",
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
        imageUrl: mui,
        name: "Material-UI",
        type: "Frontend",
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
        name:"GoLang",
        type: "Backend",
    },
    {
        imageUrl: docker,
        name:"Docker",
        type: "Backend",
    },
    {
        imageUrl: kubernets,
        name:"Kubernets",
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
        image: realtimeCodeEditorIcon, // Using icon as image for now
        theme: 'btn-back-blue',
        name: 'Realtime Code Editor',
        description: 'Developed a collaborative real-time code editor using Socket.io and React.js, enabling multiple users to write and edit code simultaneously with live cursor tracking and syntax highlighting.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Real-Time-Code-Editor-With-Database',
        demo_link: null, // Add demo link if available
        tags: ['React', 'Socket.io', 'Node.js', 'MongoDB', 'Real-time'],
        status: 'Completed',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        id: 2,
        iconUrl: fileSharingAppIcon, 
        image: fileSharingAppIcon,
        theme: 'btn-back-green',
        name: 'File Sharing App',
        description: 'Built a secure file-sharing web app that allows users to upload and share files with an expiration time, ensuring privacy and security with encrypted file storage.',
        source_code_link: 'https://github.com/yuvrajinbhakti/FileSharing',
        demo_link: null,
        tags: ['Node.js', 'Express', 'Multer', 'Security', 'File Upload'],
        status: 'Completed',
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        id: 3,
        iconUrl: moneyzoldIcon, 
        image: moneyzoldIcon,
        theme: 'btn-back-yellow',
        name: 'MoneyZold Finance App',
        description: 'Developed a finance app using Flutter that tracks expenses and savings, offering users a simple and intuitive way to manage their finances with beautiful charts and analytics.',
        source_code_link: 'https://github.com/yuvrajinbhakti/MoneyZold_Flutter',
        demo_link: null,
        tags: ['Flutter', 'Dart', 'Finance', 'Mobile', 'Charts'],
        status: 'Completed',
        gradient: 'from-yellow-500 to-orange-500'
    },
    {
        id: 4,
        iconUrl: careCarRentalIcon, 
        image: careCarRentalIcon,
        theme: 'btn-back-red',
        name: 'Care Car Rental Website',
        description: 'Overhauled and relaunched the Care car rental website, streamlining the booking process and improving user experience through an intuitive interface with modern design.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Care-Car-Rental-Website',
        demo_link: null,
        tags: ['HTML', 'CSS', 'JavaScript', 'Responsive', 'UI/UX'],
        status: 'Completed',
        gradient: 'from-red-500 to-pink-500'
    },
    {
        id: 5,
        iconUrl: dockerNodeAppIcon, 
        image: dockerNodeAppIcon,
        theme: 'btn-back-black',
        name: 'Dockerized Node.js Application',
        description: 'Created a Dockerized Node.js application, pushing the image to DockerHub for easy deployment, demonstrating skills in containerization and DevOps practices.',
        source_code_link: 'https://github.com/yuvrajinbhakti/Hi-Docker-World',
        demo_link: null,
        tags: ['Docker', 'Node.js', 'DevOps', 'Containerization', 'CI/CD'],
        status: 'Completed',
        gradient: 'from-gray-700 to-gray-900'
    },
    {
        id: 6,
        iconUrl: codeGenieIcon, 
        image: codeGenieIcon,
        theme: 'btn-back-purple',
        name: 'CodeGenie',
        description: 'Developed a Python code generation tool that automates the creation of functions, classes, exceptions, and machine learning/NLP components, ensuring well-structured, PEP 8-compliant code.',
        source_code_link: 'https://github.com/yuvrajinbhakti/code_genie_automatic_code_generator',
        demo_link: null,
        tags: ['Python', 'Code Generation', 'AI', 'Automation', 'Machine Learning'],
        status: 'Completed',
        gradient: 'from-purple-500 to-indigo-500'
    }    
];
