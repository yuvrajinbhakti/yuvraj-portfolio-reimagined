import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import ScrollReveal from "./ScrollReveal";

const CTA = () => {

  // SIMPLE GOOGLE DRIVE RESUME DOWNLOAD - Easy to update, no caching issues!
  const handleResumeDownload = () => {
    try {
      // 🔗 SETUP INSTRUCTIONS:
      // 1. Upload your resume to Google Drive
      // 2. Right-click → Share → "Anyone with the link can view"
      // 3. Copy the sharing link (looks like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
      // 4. Extract the FILE_ID from the URL
      // 5. Replace YOUR_FILE_ID below with your actual file ID
      
             // 📝 Your Google Drive file ID (extracted from the sharing link)
       const GOOGLE_DRIVE_FILE_ID = '1_dzEZhGuwzkkuKOPu-0xiafFrqLfB2Wg'; 
      
      // 🚀 Direct download URL format
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;
      
      console.log('Opening resume download:', downloadUrl);
      
      // Open download in new tab
      window.open(downloadUrl, '_blank');
      
      // Optional: Show success message
      console.log('Resume download initiated successfully');
      
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Unable to download resume at the moment. Please contact me directly for a copy.');
    }
  };

  // Enhanced Contact Icon Component
  const ContactIcon = () => (
    <motion.svg 
      className="w-5 h-5 flex-shrink-0" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.3 }
      }}
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Animated dots */}
      <motion.circle
        cx="8"
        cy="12"
        r="1"
        fill="currentColor"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          delay: 0
        }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="1"
        fill="currentColor"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          delay: 0.3
        }}
      />
      <motion.circle
        cx="16"
        cy="12"
        r="1"
        fill="currentColor"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          delay: 0.6
        }}
      />
    </motion.svg>
  );

  // Enhanced Download Icon Component
  const DownloadIcon = () => (
    <motion.svg 
      className="w-5 h-5 flex-shrink-0" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      whileHover={{ 
        scale: 1.1,
        y: [0, -2, 0],
        transition: { duration: 0.3 }
      }}
    >
      {/* Document outline */}
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Animated download arrow */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 8v8m0 0l3-3m-3 3l-3-3"
          stroke="currentColor"
          animate={{
            y: [0, 2, 0],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.g>
      
      {/* Document corner fold */}
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 3L18 8H13V3z"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />
    </motion.svg>
  );

  // ALTERNATIVE METHODS (Replace above function with any of these):

  // 1. Local File
  // - Put resume.pdf in public/assets/ folder
  // - Use: const resumePath = "/assets/resume.pdf"; (then download logic)

  // 2. AWS S3 CloudFront (Professional)
  // - Upload to S3 bucket → Enable CloudFront → Get CDN URL
  // - Use: window.open("https://d1234567890.cloudfront.net/resume.pdf", '_blank');

  // 3. Google Drive (Quick & Easy)
  // - Upload to Drive → Share → Get shareable link → Convert to direct download
  // - Use: window.open("https://drive.google.com/uc?id=FILE_ID&export=download", '_blank');

  // 4. Dynamic Resume (Most Impressive)
  // - Create /resume route that generates PDF from your data using react-pdf or jsPDF
  // - Use: window.open('/resume-preview', '_blank');

  // 5. Vercel/Netlify Static Files
  // - Put resume.pdf in public folder → Deploy → Use direct URL
  // - Use: window.open("https://yoursite.vercel.app/resume.pdf", '_blank');

  return (
    <ScrollReveal animation="fade">
      <GlassCard className="p-8 text-center">
        <motion.h2 
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Let&apos;s Work <span className="text-blue-400">Together</span>
        </motion.h2>
        <motion.p 
          className="text-gray-300 mb-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          I&apos;m currently available for freelance work or full-time opportunities.
          If you&apos;re looking for a developer who can bring your ideas to life, let&apos;s talk!
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl hover:shadow-blue-500/25 relative overflow-hidden group min-w-[180px] font-medium"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ContactIcon />
                <span>Contact Me</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleResumeDownload}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/30 backdrop-blur-sm text-white rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl hover:shadow-white/10 relative overflow-hidden group min-w-[180px] font-medium"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <DownloadIcon />
                <span>Download Resume</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </motion.div>
        </motion.div>
        
      </GlassCard>
    </ScrollReveal>
  );
};

export default CTA;
