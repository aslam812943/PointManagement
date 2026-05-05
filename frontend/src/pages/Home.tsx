import { Trophy, TrendingUp, Users } from 'lucide-react';
import './Home.css';

const Home = () => {
  // Mock data for UI
  const teams = [
    { rank: 1, name: 'Cyber Warriors', points: 150, logo: 'https://via.placeholder.com/40' },
    { rank: 2, name: 'Tech Titans', points: 135, logo: 'https://via.placeholder.com/40' },
    { rank: 3, name: 'Alpha Squad', points: 120, logo: 'https://via.placeholder.com/40' },
    { rank: 4, name: 'Nexus Force', points: 95, logo: 'https://via.placeholder.com/40' },
    { rank: 5, name: 'Quantum Leap', points: 80, logo: 'https://via.placeholder.com/40' },
  ];

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
            <span className="stat-value">Cyber Warriors</span>
          </div>
        </div>
        <div className="stat-card glass">
          <Users className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Total Teams</span>
            <span className="stat-value">24 Verified</span>
          </div>
        </div>
        <div className="stat-card glass">
          <TrendingUp className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Active Programs</span>
            <span className="stat-value">12 Upcoming</span>
          </div>
        </div>
      </div>

      <div className="leaderboard-section glass">
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
            {teams.map((team) => (
              <tr key={team.rank} className="table-row">
                <td className="rank-cell">
                  <span className={`rank-badge rank-${team.rank}`}>
                    {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                  </span>
                </td>
                <td className="team-cell">
                  <div className="team-info">
                    <img src={team.logo} alt={team.name} className="team-logo-small" />
                    <span className="team-name">{team.name}</span>
                  </div>
                </td>
                <td className="points-cell">
                  <span className="points-value">{team.points}</span>
                </td>
                <td>
                  <span className="status-badge verified">Verified</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
