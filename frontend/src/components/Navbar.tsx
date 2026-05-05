import { Link } from 'react-router-dom';
import { Trophy, UserPlus, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <Trophy className="logo-icon" size={28} />
          <span className="logo-text">Festiva<span className="gradient-text">Points</span></span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Trophy size={18} />
            <span>Leaderboard</span>
          </Link>
          <Link to="/register" className="nav-link">
            <UserPlus size={18} />
            <span>Register Team</span>
          </Link>
          <Link to="/admin/login" className="nav-link admin-btn">
            <LayoutDashboard size={18} />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
