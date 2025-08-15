import { NavLink } from 'react-router-dom';

function Navbar() {

  return (
    <div>
      <NavLink to ="/portfolio" className="nav-links nav-container" >GALLERY</NavLink>
      <p>Youtube</p>
      <p>Portfolio</p>
      <p>Photography</p>
      

    </div>
  );
}
export default Navbar;