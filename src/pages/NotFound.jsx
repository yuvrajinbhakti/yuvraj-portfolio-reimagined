import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-4">
      <div className="text-center max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-blue-500 mb-4">404</h1>
          <div className="w-32 h-1 bg-blue-500 mx-auto mb-8 rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-semibold mb-4">Oops! Page Not Found</h2>
          <p className="text-gray-400 text-lg mb-2">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl font-medium"
          >
            Back to Home
          </Link>
          
          <div className="flex justify-center gap-4 mt-6">
            <Link
              to="/about"
              className="px-6 py-2 bg-transparent border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              About
            </Link>
            <Link
              to="/projects"
              className="px-6 py-2 bg-transparent border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Projects
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12"
        >
          <div className="flex justify-center">
            <svg
              className="w-64 h-64 text-blue-500/20"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 