import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Loader2 } from 'lucide-react';
import './Home.css';

interface Team {
  _id: string;
  name: string;
  logoUrl: string;
  totalPoints: number;
}

const Home = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:3000/teams/leaderboard');
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="container home-page">
      <header className="page-header">
        <h1 className="page-title">Season <span className="gradient-text">Leaderboard</span></h1>
        <p className="page-subtitle">Track the top performing teams and their current rankings.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <Trophy className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Top Team</span>
            <span className="stat-value">{teams[0]?.name || '---'}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <Users className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Total Teams</span>
            <span className="stat-value">{teams.length} Verified</span>
          </div>
        </div>
        <div className="stat-card glass">
          <TrendingUp className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Active Programs</span>
            <span className="stat-value">Ongoing</span>
          </div>
        </div>
      </div>

      <div className="leaderboard-section glass">
        {loading ? (
          <div className="loading-container">
            <Loader2 className="spin-icon" size={48} />
            <p>Loading leaderboard...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <p>No verified teams yet. Stay tuned!</p>
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Total Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={team._id} className="table-row">
                  <td className="rank-cell">
                    <span className={`rank-badge rank-${index + 1}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                  </td>
                  <td className="team-cell">
                    <Link to={`/team/${team._id}`} className="team-link">
                      <div className="team-info">
                        <img src={team.logoUrl} alt={team.name} className="team-logo-small" />
                        <span className="team-name">{team.name}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="points-cell">
                    <span className="points-value">{team.totalPoints}</span>
                  </td>
                  <td>
                    <span className="status-badge verified">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;
