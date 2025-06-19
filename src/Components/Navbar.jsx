import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when clicking outside or on link
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.hamburger-button')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen, isMobile])

  const navItems = [
    { to: '/about', label: 'About', gradient: 'from-blue-600/0 via-blue-600/20 to-blue-600/0' },
    { to: '/projects', label: 'Projects', gradient: 'from-purple-600/0 via-purple-600/20 to-purple-600/0' },
    { to: '/playground', label: 'Playground', gradient: 'from-pink-600/0 via-pink-600/20 to-pink-600/0' },
    { to: '/contact', label: 'Contact', gradient: 'from-green-600/0 via-green-600/20 to-green-600/0' }
  ]

  const NavItem = ({ to, label, gradient, onClick }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <NavLink 
        to={to}
        onClick={onClick}
        className={({isActive}) => `
          px-4 py-3 md:py-2 rounded-lg backdrop-blur-sm border border-transparent transition-all duration-300 relative overflow-hidden group block text-center md:text-left
          ${isActive 
            ? 'text-blue-400 bg-blue-500/20 border-blue-400/30 shadow-lg shadow-blue-500/25' 
            : 'text-white hover:text-blue-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10'
          }
        `}
      >
        <span className="relative z-10">{label}</span>
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </NavLink>
    </motion.div>
  )

  NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    gradient: PropTypes.string.isRequired,
    onClick: PropTypes.func
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <header className="header backdrop-blur-lg bg-white/5 border-b border-white/10 shadow-lg shadow-black/20">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex text-lg gap-8 font-medium">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <motion.button
          className="hamburger-button md:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 items-center justify-center flex font-bold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:border-blue-400/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle mobile menu"
        >
          <motion.div
            animate={isMenuOpen ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-6 h-6 flex flex-col justify-center items-center"
          >
            <motion.span
              animate={isMenuOpen 
                ? { rotate: 45, y: 0, opacity: 1 } 
                : { rotate: 0, y: -6, opacity: 1 }
              }
              transition={{ duration: 0.3 }}
              className="absolute w-5 h-0.5 bg-white rounded-full"
            />
            <motion.span
              animate={isMenuOpen 
                ? { opacity: 0 } 
                : { opacity: 1 }
              }
              transition={{ duration: 0.3 }}
              className="absolute w-5 h-0.5 bg-white rounded-full"
            />
            <motion.span
              animate={isMenuOpen 
                ? { rotate: -45, y: 0, opacity: 1 } 
                : { rotate: 0, y: 6, opacity: 1 }
              }
              transition={{ duration: 0.3 }}
              className="absolute w-5 h-0.5 bg-white rounded-full"
            />
          </motion.div>
        </motion.button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mobile-menu fixed top-[80px] right-0 w-80 max-w-[90vw] h-[calc(100vh-80px)] bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">Navigation</h2>
                  <div className="w-12 h-0.5 bg-blue-500 mx-auto rounded-full"></div>
                </div>
                
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <NavItem 
                      {...item} 
                      onClick={() => setIsMenuOpen(false)}
                    />
                  </motion.div>
                ))}
                
                {/* Mobile Menu Footer */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="pt-8 mt-8 border-t border-white/10"
                >
                  <p className="text-center text-sm text-white/60">
                    Swipe right or tap outside to close
                  </p>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-400/30 hover:bg-blue-600/30 transition-colors duration-300"
                    >
                      Close Menu
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Navbar
