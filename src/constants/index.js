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
    // {
    //     imageUrl: sass,
    //     name: "Sass",
    //     type: "Frontend",
    // },
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

// export const experiences = [
//     {
//         title: "React.js Developer",
//         company_name: "Starbucks",
//         icon: starbucks,
//         iconBg: "#accbe1",
//         date: "March 2020 - April 2021",
//         points: [
//             "Developing and maintaining web applications using React.js and other related technologies.",
//             "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
//             "Implementing responsive design and ensuring cross-browser compatibility.",
//             "Participating in code reviews and providing constructive feedback to other developers.",
//         ],
//     },
//     {
//         title: "React Native Developer",
//         company_name: "Tesla",
//         icon: tesla,
//         iconBg: "#fbc3bc",
//         date: "Jan 2021 - Feb 2022",
//         points: [
//             "Developing and maintaining web applications using React.js and other related technologies.",
//             "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
//             "Implementing responsive design and ensuring cross-browser compatibility.",
//             "Participating in code reviews and providing constructive feedback to other developers.",
//         ],
//     },
//     {
//         title: "Web Developer",
//         company_name: "Shopify",
//         icon: shopify,
//         iconBg: "#b7e4c7",
//         date: "Jan 2022 - Jan 2023",
//         points: [
//             "Developing and maintaining web applications using React.js and other related technologies.",
//             "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
//             "Implementing responsive design and ensuring cross-browser compatibility.",
//             "Participating in code reviews and providing constructive feedback to other developers.",
//         ],
//     },
//     {
//         title: "Full stack Developer",
//         company_name: "Meta",
//         icon: meta,
//         iconBg: "#a2d2ff",
//         date: "Jan 2023 - Present",
//         points: [
//             "Developing and maintaining web applications using React.js and other related technologies.",
//             "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
//             "Implementing responsive design and ensuring cross-browser compatibility.",
//             "Participating in code reviews and providing constructive feedback to other developers.",
//         ],
//     },
// ];

export const experiences = [
    {
        title: "Frontend Engineering Intern",
        company_name: "Razorpay",
        icon: razorpay,
        iconBg: "#f3f4f6",
        date: "July 2023 - Present",
        points: [
            "Reduced database load by 30% by eliminating unnecessary API requests, improving system efficiency.",
            "Fixed multiple critical bugs, leading to a 20% improvement in overall system stability.",
            "Leveraged user-centric design principles to create intuitive features, boosting user satisfaction by 30%.",
            "Conducted A/B testing (split experimentation) and performed monitoring/instrumentation to enhance user experience based on merchant IDs.",
            "Collaborated with cross-functional teams to develop highly responsive web applications using React.js and TypeScript."
        ],
    },
    {
        title: "Amazon Machine Learning Summer School",
        company_name: "Amazon",
        icon: amazon,
        iconBg: "#ffeedb",
        date: "July 2024",
        points: [
            "Gained in-depth knowledge of supervised and unsupervised learning, deep neural networks, reinforcement learning, and generative AI.",
            "Worked on real-world projects to apply machine learning models using Python, pandas, and scikit-learn.",
            "Ranked in the top 5 percentile among 85,000 participants, demonstrating a strong understanding of machine learning concepts."
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

// export const projects = [

//     {
        // iconUrl: pricewise,
//         theme: 'btn-back-red',
//         name: 'Amazon Price Tracker',
//         description: 'Developed a web application that tracks and notifies users of price changes for products on Amazon, helping users find the best deals.',
//         link: 'https://github.com/adrianhajdin/pricewise',
//     },
//     {
//         iconUrl: threads,
//         theme: 'btn-back-green',
//         name: 'Full Stack Threads Clone',
//         description: 'Created a full-stack replica of the popular discussion platform "Threads," enabling users to post and engage in threaded conversations.',
//         link: 'https://github.com/adrianhajdin/threads',
//     },
//     {
//         iconUrl: car,
//         theme: 'btn-back-blue',
//         name: 'Car Finding App',
//         description: 'Designed and built a mobile app for finding and comparing cars on the market, streamlining the car-buying process.',
//         link: 'https://github.com/adrianhajdin/project_next13_car_showcase',
//     },
//     {
//         iconUrl: snapgram,
//         theme: 'btn-back-pink',
//         name: 'Full Stack Instagram Clone',
//         description: 'Built a complete clone of Instagram, allowing users to share photos and connect with friends in a familiar social media environment.',
//         link: 'https://github.com/adrianhajdin/social_media_app',
//     },
//     {
//         iconUrl: estate,
//         theme: 'btn-back-black',
//         name: 'Real-Estate Application',
//         description: 'Developed a web application for real estate listings, facilitating property searches and connecting buyers with sellers.',
//         link: 'https://github.com/adrianhajdin/projects_realestate',
//     },
//     {
//         iconUrl: summiz,
//         theme: 'btn-back-yellow',
//         name: 'AI Summarizer Application',
//         description: 'App that leverages AI to automatically generate concise & informative summaries from lengthy text content, or blogs.',
//         link: 'https://github.com/adrianhajdin/project_ai_summarizer',
//     }
// ];









export const projects = [
    {
        iconUrl: realtimeCodeEditorIcon, 
        theme: 'btn-back-blue',
        name: 'Realtime Code Editor',
        description: 'Developed a collaborative real-time code editor using Socket.io and React.js, enabling multiple users to write and edit code simultaneously.',
        link: 'https://github.com/yuvrajinbhakti/Real-Time-Code-Editor-With-Database', 
    },
    {
        iconUrl: fileSharingAppIcon, 
        theme: 'btn-back-green',
        name: 'File Sharing App',
        description: 'Built a secure file-sharing web app that allows users to upload and share files with an expiration time, ensuring privacy and security.',
        link: 'https://github.com/yuvrajinbhakti/FileSharing', 
    },
    {
        iconUrl: moneyzoldIcon, 
        theme: 'btn-back-yellow',
        name: 'MoneyZold Finance App',
        description: 'Developed a finance app using Flutter that tracks expenses and savings, offering users a simple and intuitive way to manage their finances.',
        link: 'https://github.com/yuvrajinbhakti/MoneyZold_Flutter', 
    },
    {
        iconUrl: careCarRentalIcon, 
        theme: 'btn-back-red',
        name: 'Care Car Rental Website',
        description: 'Overhauled and relaunched the Care car rental website, streamlining the booking process and improving user experience through an intuitive interface.',
        link: 'https://github.com/yuvrajinbhakti/Care-Car-Rental-Website', 
    },
    {
        iconUrl: dockerNodeAppIcon, 
        theme: 'btn-back-black',
        name: 'Dockerized Node.js Application',
        description: 'Created a Dockerized Node.js application, pushing the image to DockerHub for easy deployment, demonstrating skills in containerization.',
        link: 'https://github.com/yuvrajinbhakti/Hi-Docker-World', 
    },
    {
        iconUrl: codeGenieIcon, 
        theme: 'btn-back-purple',
        name: 'CodeGenie',
        description: 'Developed a Python code generation tool that automates the creation of functions, classes, exceptions, and machine learning/NLP components, ensuring well-structured, PEP 8-compliant code.',
        link: 'https://github.com/yuvrajinbhakti/code_genie_automatic_code_generator',
    }    
];
