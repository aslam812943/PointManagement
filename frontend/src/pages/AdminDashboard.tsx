import { API_BASE_URL } from "../config/api.config";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, XCircle, LogOut, Menu,
  LayoutDashboard, Loader2, CalendarRange, Trophy, Ban, Unlock 
} from 'lucide-react';
import AdminPrograms from '../components/AdminPrograms';
import AdminResults from '../components/AdminResults';
import './AdminDashboard.css';

interface Team {
  _id: string;
  name: string;
  logoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  style: string;
  totalPoints: number;
  isBlocked: boolean;
}

const AdminDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [teamStyleFilter, setTeamStyleFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamStyle, setNewTeamStyle] = useState('Style 1');
  const [newTeamLogo, setNewTeamLogo] = useState<File | null>(null);
  const [addingTeam, setAddingTeam] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'teams') {
      fetchTeams();
    }
    setIsSidebarOpen(false);
  }, [activeTab]);

  const fetchTeams = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/teams/all`, {
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
      const response = await fetch(`${API_BASE_URL}/teams/${id}/status`, {
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
      const response = await fetch(`${API_BASE_URL}/teams/${id}/block`, {
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

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTeam(true);
    const formData = new FormData();
    formData.append('name', newTeamName);
    formData.append('style', newTeamStyle);
    if (newTeamLogo) {
      formData.append('logo', newTeamLogo);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/teams/register`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Team added successfully! You can now verify it.');
        setIsAddTeamModalOpen(false);
        setNewTeamName('');
        setNewTeamStyle('Style 1');
        setNewTeamLogo(null);
        fetchTeams();
      } else {
        const data = await response.json();
        alert(data.message || 'Error adding team');
      }
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Something went wrong');
    } finally {
      setAddingTeam(false);
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
        const filteredTeams = teamStyleFilter === 'All' 
          ? teams 
          : teams.filter(t => t.style === teamStyleFilter);
        
        return (
          <div className="teams-section glass">
            {loading ? (
              <div className="loading-container">
                <Loader2 className="spin-icon" size={48} />
                <p>Loading teams...</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
                  <button 
                    onClick={() => setIsAddTeamModalOpen(true)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Add Team
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setTeamStyleFilter('All')}
                      style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: teamStyleFilter === 'All' ? 'var(--primary-color)' : 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
                    >All</button>
                    <button 
                      onClick={() => setTeamStyleFilter('Style 1')}
                      style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: teamStyleFilter === 'Style 1' ? 'var(--primary-color)' : 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
                    >Style 1</button>
                    <button 
                      onClick={() => setTeamStyleFilter('Style 2')}
                      style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: teamStyleFilter === 'Style 2' ? 'var(--primary-color)' : 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
                    >Style 2</button>
                  </div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Team Info</th>
                      <th>Style</th>
                      <th>Points</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
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
                        <td>{team.style || '---'}</td>
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
              </div>
            )}
            
            {isAddTeamModalOpen && (
              <div className="sidebar-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsAddTeamModalOpen(false); }}>
                <div className="glass" style={{ padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'white' }}>Add New Team</h3>
                  <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Team Name</label>
                      <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Team Style</label>
                      <select value={newTeamStyle} onChange={e => setNewTeamStyle(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}>
                        <option value="Style 1" style={{color: 'black'}}>Style 1</option>
                        <option value="Style 2" style={{color: 'black'}}>Style 2</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Team Logo</label>
                      <input type="file" accept="image/*" onChange={e => setNewTeamLogo(e.target.files?.[0] || null)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setIsAddTeamModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" disabled={addingTeam} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', background: 'var(--primary-color)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                        {addingTeam ? 'Adding...' : 'Add Team'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'programs':
        return <AdminPrograms />;
      case 'results':
        return <AdminResults />;
      case 'dashboard': {
        const verifiedTeams = teams.filter(t => t.status === 'verified');
        const styles = Array.from(new Set(verifiedTeams.map(t => t.style).filter(Boolean))).sort();
        
        return (
          <div className="dashboard-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {styles.length === 0 ? (
              <div className="empty-state glass" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                <Trophy size={48} className="empty-icon" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No verified teams available to show the leaderboard yet.</p>
              </div>
            ) : (
              styles.map(style => {
                const styleTeams = verifiedTeams
                  .filter(t => t.style === style)
                  .sort((a, b) => b.totalPoints - a.totalPoints);
                
                return (
                  <div key={style} className="style-leaderboard glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                      <Trophy size={20} color="var(--primary-color)" />
                      {style} Leaderboard
                    </h3>
                    
                    {styleTeams.length === 0 ? (
                      <p className="text-muted">No teams in this category.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="master-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '60px', color: '#94a3b8' }}>Rank</th>
                              <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Team Name</th>
                              <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right', color: '#94a3b8' }}>Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {styleTeams.map((team, idx) => (
                              <tr key={team._id}>
                                <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'white' }}>
                                  #{idx + 1}
                                </td>
                                <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <img src={team.logoUrl} alt={team.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', background: 'white' }} />
                                  <span style={{ fontWeight: '500', color: 'white' }}>{team.name}</span>
                                </td>
                                <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', textAlign: 'right', color: 'var(--primary-color)' }}>
                                  {team.totalPoints}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      }
      default:
        return <div className="glass empty-state">Content for {activeTab} coming soon...</div>;
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <div className="mobile-logo">
          <LayoutDashboard className="logo-icon" size={24} />
          <span>AdminPanel</span>
        </div>
        <button 
          className="mobile-sidebar-toggle-top"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={28} />
        </button>
      </header>

      {/* Sidebar Toggle for Mobile (FAB) - Optional, keeping for convenience or removing if redundant. I'll keep it but style it better. */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar glass ${isSidebarOpen ? 'mobile-open' : ''}`}>
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
          </div>
        </header>

        {renderContent()}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
