import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        CALEB LYKKEN
      </div>
      <div className="nav-links-container">
        <NavLink to="/" className="nav-links">
          Home
        </NavLink>
        <NavLink to="/portfolio" className="nav-links">
          Work
        </NavLink>
        <NavLink to="/about" className="nav-links">
          About
        </NavLink>
        <NavLink to="/contact" className="nav-links">
          Contact
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;