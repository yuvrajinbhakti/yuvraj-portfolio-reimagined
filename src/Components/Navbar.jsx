import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = () => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <header className="header backdrop-blur-lg bg-white/5 border-b border-white/10 shadow-lg shadow-black/20">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <NavLink 
            to="/" 
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 items-center justify-center flex font-bold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:border-blue-400/50 group" 
          >
            <p className="blue-gradient_text text-lg group-hover:scale-110 transition-transform duration-300">YSN</p>
          </NavLink>
        </motion.div>

        <nav className="flex text-lg gap-8 font-medium">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink 
              to="/about" 
              className={({isActive}) => `
                px-4 py-2 rounded-lg backdrop-blur-sm border border-transparent transition-all duration-300 relative overflow-hidden group
                ${isActive 
                  ? 'text-blue-400 bg-blue-500/20 border-blue-400/30 shadow-lg shadow-blue-500/25' 
                  : 'text-white hover:text-blue-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10'
                }
              `}
            >
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink 
              to="/projects" 
              className={({isActive}) => `
                px-4 py-2 rounded-lg backdrop-blur-sm border border-transparent transition-all duration-300 relative overflow-hidden group
                ${isActive 
                  ? 'text-blue-400 bg-blue-500/20 border-blue-400/30 shadow-lg shadow-blue-500/25' 
                  : 'text-white hover:text-blue-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10'
                }
              `}
            >
              <span className="relative z-10">Projects</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink 
              to="/contact" 
              className={({isActive}) => `
                px-4 py-2 rounded-lg backdrop-blur-sm border border-transparent transition-all duration-300 relative overflow-hidden group
                ${isActive 
                  ? 'text-blue-400 bg-blue-500/20 border-blue-400/30 shadow-lg shadow-blue-500/25' 
                  : 'text-white hover:text-blue-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10'
                }
              `}
            >
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/20 to-green-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
          </motion.div>
        </nav>
      </header>
    </motion.div>
  )
}

export default Navbar
