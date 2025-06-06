import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div>
        <header className="header">
<NavLink to="/" className="w-10 h-10 rounded-lg bg-white items-center justify-center flex font-bold shadow-md" >
<p className="blue-gradient_text" >YSN</p>
</NavLink>
<nav className="flex text-lg gap-7 font-medium">
  <NavLink to="/about" className={({isActive})=>isActive?'text-blue-500':'text-white hover:text-blue-300 transition-colors duration-300'}>
  About
  </NavLink>

  <NavLink to="/projects" className={({isActive})=>isActive?'text-blue-500':'text-white hover:text-blue-300 transition-colors duration-300'}>
  Projects
  </NavLink>

  <NavLink to="/contact" className={({isActive})=>isActive?'text-blue-500':'text-white hover:text-blue-300 transition-colors duration-300'}>
  Contact
  </NavLink>

</nav>
        </header>
    </div>
  )
}

export default Navbar
