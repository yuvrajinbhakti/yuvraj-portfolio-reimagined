import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import ScrollReveal from "./ScrollReveal";

const CTA = () => {

  // DYNAMIC RESUME DOWNLOAD - Automatically finds latest PDF from GitHub releases
  const handleResumeDownload = async () => {
    try {
      // Your GitHub repository details
      const owner = 'yuvrajinbhakti';
      const repo = 'yuvraj-portfolio-reimagined';
      
      // Add cache-busting parameters and headers
      const timestamp = Date.now();
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest?t=${timestamp}`;
      
      console.log('Fetching latest release from:', apiUrl);
      
      // Fetch latest release from GitHub API with cache-busting headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store' // Force no caching
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }
      
      const releaseData = await response.json();
      
      console.log('Release data:', {
        tag_name: releaseData.tag_name,
        published_at: releaseData.published_at,
        draft: releaseData.draft,
        prerelease: releaseData.prerelease,
        assets_count: releaseData.assets?.length || 0
      });
      
      // Check if this is a draft or prerelease
      if (releaseData.draft) {
        console.warn('Latest release is a draft');
        alert('The latest resume is still being prepared. Please try again shortly or contact me directly.');
        return;
      }
      
      // Find the first PDF file in the release assets
      const pdfAsset = releaseData.assets.find(asset => 
        asset.name.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfAsset) {
        console.log('Found PDF asset:', {
          name: pdfAsset.name,
          size: pdfAsset.size,
          download_count: pdfAsset.download_count,
          updated_at: pdfAsset.updated_at
        });
        
        // Add cache-busting to the download URL
        const downloadUrl = `${pdfAsset.browser_download_url}?t=${timestamp}&cb=${Math.random()}`;
        console.log('Opening download URL:', downloadUrl);
        
        // Open the PDF download URL with cache busting
        window.open(downloadUrl, '_blank');
        
        // Optional: Show success message
        console.log('Resume download initiated successfully');
        
      } else {
        console.warn('No PDF file found in release assets:', releaseData.assets?.map(asset => asset.name));
        alert('Resume file not found in the latest release. Please contact me directly for a copy.');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // More helpful error message
      alert(`Unable to download resume: ${error.message}. Please try refreshing the page or contact me directly.`);
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
