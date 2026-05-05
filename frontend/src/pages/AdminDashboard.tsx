import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, XCircle, LogOut, 
  LayoutDashboard, Settings, Search, Loader2, CalendarRange, Trophy, Ban, Unlock 
} from 'lucide-react';
import AdminPrograms from '../components/AdminPrograms';
import AdminResults from '../components/AdminResults';
import './AdminDashboard.css';

interface Team {
  _id: string;
  name: string;
  logoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  totalPoints: number;
  isBlocked: boolean;
}

const AdminDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'teams') {
      fetchTeams();
    }
  }, [activeTab]);

  const fetchTeams = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:3000/teams/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'verified' | 'rejected') => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:3000/teams/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setTeams(teams.map(t => t._id === id ? { ...t, status } : t));
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleToggleBlock = async (id: string, currentBlockedStatus: boolean) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:3000/teams/${id}/block`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: !currentBlockedStatus }),
      });

      if (response.ok) {
        setTeams(teams.map(t => t._id === id ? { ...t, isBlocked: !currentBlockedStatus } : t));
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'teams':
        return (
          <div className="teams-section glass">
            {loading ? (
              <div className="loading-container">
                <Loader2 className="spin-icon" size={48} />
                <p>Loading teams...</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Team Info</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team._id} className={team.isBlocked ? 'blocked-row' : ''}>
                      <td>
                        <div className="team-info-cell">
                          <img src={team.logoUrl} alt={team.name} className="team-avatar" />
                          <div className="team-name-group">
                            <span className="team-name">{team.name}</span>
                            {team.isBlocked && <span className="blocked-tag">BLOCKED</span>}
                          </div>
                        </div>
                      </td>
                      <td>{team.totalPoints}</td>
                      <td>
                        <span className={`status-tag ${team.status}`}>
                          {team.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {team.status === 'pending' && (
                            <>
                              <button 
                                className="action-btn approve"
                                onClick={() => handleUpdateStatus(team._id, 'verified')}
                              >
                                <CheckCircle size={18} />
                                <span>Approve</span>
                              </button>
                              <button 
                                className="action-btn reject"
                                onClick={() => handleUpdateStatus(team._id, 'rejected')}
                              >
                                <XCircle size={18} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {team.status === 'verified' && (
                            <button 
                              className={`action-btn ${team.isBlocked ? 'unblock' : 'block'}`}
                              onClick={() => handleToggleBlock(team._id, team.isBlocked)}
                            >
                              {team.isBlocked ? <Unlock size={18} /> : <Ban size={18} />}
                              <span>{team.isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>
                          )}
                          {team.status === 'rejected' && (
                            <span className="text-muted">Rejected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case 'programs':
        return <AdminPrograms />;
      case 'results':
        return <AdminResults />;
      default:
        return <div className="glass empty-state">Content for {activeTab} coming soon...</div>;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar glass">
        <div className="sidebar-header">
          <LayoutDashboard className="logo-icon" />
          <span className="sidebar-logo">AdminPanel</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <Users size={20} />
            <span>Manage Teams</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <CalendarRange size={20} />
            <span>Manage Programs</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <Trophy size={20} />
            <span>Add Points</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <header className="content-header">
          <h2 className="content-title">
            {activeTab === 'teams' ? 'Manage ' : activeTab === 'programs' ? 'Manage ' : activeTab === 'results' ? 'Assign ' : ''}
            <span className="gradient-text">
              {activeTab === 'teams' ? 'Teams' : activeTab === 'programs' ? 'Programs' : activeTab === 'results' ? 'Points' : activeTab}
            </span>
          </h2>
          <div className="header-actions">
            <div className="search-box glass">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
