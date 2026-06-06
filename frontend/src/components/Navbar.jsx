import {Link} from "react-router-dom";
import '../css/Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">LuLu Moviez</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/Favourite" className="nav-link">Favourite</Link>
        </div>
    </nav>
  );
}
export default Navbar;