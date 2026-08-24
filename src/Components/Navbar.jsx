import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import DrawnUnderline from './DrawnUnderline'

const navItems = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/playground', label: 'Playground' },
  { to: '/contact', label: 'Contact' }
]

// Declared at module scope, not inside Navbar. Defining a component inside
// another component gives it a new type on every render, so React unmounts and
// remounts the whole nav on each state change — which restarts animations and,
// critically here, throws away keyboard focus and breaks the focus trap.
// Plain links, not buttons. Four bordered, filled, drop-shadowed pills in a row
// read as a toolbar — they compete with each other and with the page, and they
// make navigation look like the most important thing on screen. A nav is a
// signpost. Text, with the current page marked, and a rule that draws in on
// hover: the affordance without the furniture.
const NavItem = ({ to, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      relative py-2 block text-center md:text-left transition-colors duration-200
      ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}
      after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px
      after:bg-blue-400 after:origin-left after:transition-transform after:duration-300
      ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
    `}
  >
    {label}
  </NavLink>
)

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Drives the wordmark's underline; focus counts, so it is not pointer-only.
  const [markHovered, setMarkHovered] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

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

  // Close the menu if the viewport grows past the mobile breakpoint while it is
  // open — otherwise state stays open behind a hidden panel and the next
  // hamburger press appears to do nothing.
  useEffect(() => {
    if (!isMobile && isMenuOpen) closeMenu()
  }, [isMobile, isMenuOpen, closeMenu])

  // Modal behaviour: Escape to dismiss, focus moved into the panel on open and
  // returned to the hamburger on close, and Tab cycled within the panel so
  // keyboard users can't wander into the inert page behind it.
  useEffect(() => {
    if (!isMenuOpen || !isMobile) return

    const panel = menuRef.current
    if (!panel) return

    const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const firstLink = panel.querySelector(FOCUSABLE)
    if (firstLink) firstLink.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE))
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Send focus back to the control that opened the panel.
      if (triggerRef.current) triggerRef.current.focus()
    }
  }, [isMenuOpen, isMobile, closeMenu])

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      // The frosted panel, the border and the shadow belong on this full-width
      // wrapper, not on <header>. `.header` is max-w-5xl, so putting them there
      // painted a 1024px bar floating in the middle of a wider window — hard
      // vertical edges, and a bottom rule that stopped a couple of hundred
      // pixels short of each side. The bar now spans the viewport; the content
      // inside it stays constrained.
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/5 border-b border-white/10 shadow-lg shadow-black/20"
    >
      <header className="header">
        {/* The wordmark, not a boxed tile. A bordered, shadowed, gradient-filled
            square is a lot of chrome around three letters, and it matched the
            four pills it sat next to — the whole bar read as buttons.

            No motion wrapper either: scaling a wordmark on hover is a tell, and
            dropping it also removes the stray tab stop the wrapper introduced,
            so the tabIndex={-1} workaround is no longer needed. */}
        {/* The initials unpack into the full name on hover — each letter stays
            put and the rest of its word grows out of it. Initials are opaque by
            nature, so this is the rare hover that adds information rather than
            decoration; that is the only reason it survives on a site that just
            had its effects stripped out.

            aria-label carries the full name at all times, so the accessible
            name never depends on a pointer being present. */}
        {/* The underline only exists while the name is unpacked, which is the
            thing that makes it work here. At rest the wordmark is 42px and a
            hand-drawn line across it reads as a stub — that was the earlier
            attempt. Hovered, it is 180px, which is wider than the About heading
            and plenty of room for the full curve.

            So it uses the heading's path, not the flattened one: at 180px that
            path lands around 0.020 vertical travel over width, against the
            heading's 0.026. It draws after the name has finished unpacking and
            retracts when the pointer leaves. */}
        <NavLink
          to="/"
          aria-label="Yuvraj Singh Nain — home"
          onMouseEnter={() => setMarkHovered(true)}
          onMouseLeave={() => setMarkHovered(false)}
          onFocus={() => setMarkHovered(true)}
          onBlur={() => setMarkHovered(false)}
          className="wordmark relative inline-block text-xl font-bold text-white hover:text-blue-300 transition-colors duration-200"
        >
          <DrawnUnderline
            drawOnMount={false}
            active={markHovered}
            strokeWidth={2}
            delay={0.18}
            className="-bottom-1.5 h-2.5"
          />
          <span aria-hidden="true">
            Y<span className="wordmark__rest">uvraj </span>
            S<span className="wordmark__rest">ingh </span>
            N<span className="wordmark__rest">ain</span>

          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex text-sm gap-7 font-medium">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <motion.button
          ref={triggerRef}
          // Matches the rest of the bar now that the pills are gone — a
          // gradient-filled, bordered, drop-shadowed tile was the last piece of
          // furniture left up here. Still 44px, so it stays a comfortable
          // target.
          className="hamburger-button md:hidden w-11 h-11 -mr-2 rounded-lg items-center justify-center flex text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.95 }}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
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
              className="absolute w-5 h-0.5 bg-current rounded-full"
            />
            <motion.span
              animate={isMenuOpen 
                ? { opacity: 0 } 
                : { opacity: 1 }
              }
              transition={{ duration: 0.3 }}
              className="absolute w-5 h-0.5 bg-current rounded-full"
            />
            <motion.span
              animate={isMenuOpen 
                ? { rotate: -45, y: 0, opacity: 1 } 
                : { rotate: 0, y: 6, opacity: 1 }
              }
              transition={{ duration: 0.3 }}
              className="absolute w-5 h-0.5 bg-current rounded-full"
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
              onClick={closeMenu}
              aria-hidden="true"
            />
            
            {/* Mobile Menu */}
            <motion.div
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-heading"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mobile-menu fixed top-[80px] right-0 w-80 max-w-[90vw] h-[calc(100vh-80px)] bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="text-center mb-8">
                  <h2 id="mobile-menu-heading" className="text-xl font-bold text-white mb-2">Navigation</h2>
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
                    Tap outside or press Esc to close
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
