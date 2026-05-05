import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, UserPlus, LayoutDashboard, FileText, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <Trophy className="logo-icon" size={28} />
          <span className="logo-text">Duff<span className="gradient-text">Points</span></span>
        </Link>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            <Trophy size={18} />
            <span>Leaderboard</span>
          </Link>
          <Link to="/overview" className="nav-link" onClick={closeMenu}>
            <FileText size={18} />
            <span>Full Overview</span>
          </Link>
          <Link to="/register" className="nav-link" onClick={closeMenu}>
            <UserPlus size={18} />
            <span>Register Team</span>
          </Link>
          <Link to="/admin/login" className="nav-link admin-btn" onClick={closeMenu}>
            <LayoutDashboard size={18} />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
