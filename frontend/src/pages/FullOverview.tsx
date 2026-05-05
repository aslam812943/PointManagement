import { useEffect, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import './FullOverview.css';

interface Team {
  _id: string;
  name: string;
  logoUrl: string;
}

interface Program {
  _id: string;
  name: string;
  date: string;
}

interface Result {
  programId: string | any;
  firstPlace: string | any;
  secondPlace: string | any;
  thirdPlace: string | any;
}

const FullOverview = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, programsRes, resultsRes] = await Promise.all([
        fetch('http://localhost:3000/teams/leaderboard'),
        fetch('http://localhost:3000/programs'),
        fetch('http://localhost:3000/results')
      ]);

      setTeams(await teamsRes.json());
      setPrograms(await programsRes.json());
      setResults(await resultsRes.json());
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPoints = (teamId: string, programId: string) => {
    const result = results.find(r => 
      (typeof r.programId === 'object' ? r.programId._id : r.programId) === programId
    );

    if (!result) return 0;

    const firstId = typeof result.firstPlace === 'object' ? result.firstPlace?._id : result.firstPlace;
    const secondId = typeof result.secondPlace === 'object' ? result.secondPlace?._id : result.secondPlace;
    const thirdId = typeof result.thirdPlace === 'object' ? result.thirdPlace?._id : result.thirdPlace;

    if (firstId === teamId) return 10;
    if (secondId === teamId) return 5;
    if (thirdId === teamId) return 3;
    return 0;
  };

  // Group programs by date for headers
  const sortedPrograms = [...programs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spin-icon" size={48} />
        <p>Generating full festival report...</p>
      </div>
    );
  }

  return (
    <div className="container overview-page">
      <header className="page-header">
        <div className="title-area">
          <FileText className="header-icon" />
          <h1 className="page-title">Festival <span className="gradient-text">Full Overview</span></h1>
        </div>
        <p className="page-subtitle">Master scoring sheet for all teams across all programs.</p>
      </header>

      <div className="overview-card glass">
        <div className="table-wrapper">
          <table className="master-table">
            <thead>
              <tr className="main-header">
                <th className="sticky-col team-col">Team / Programs</th>
                {sortedPrograms.map(p => (
                  <th key={p._id} className="program-header">
                    <span className="p-date">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="p-name">{p.name}</span>
                  </th>
                ))}
                <th className="total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => {
                let teamTotal = 0;
                return (
                  <tr key={team._id}>
                    <td className="sticky-col team-cell">
                      <div className="team-cell-content">
                        <img src={team.logoUrl} alt={team.name} className="team-mini-logo" />
                        <span>{team.name}</span>
                      </div>
                    </td>
                    {sortedPrograms.map(p => {
                      const pts = getPoints(team._id, p._id);
                      teamTotal += pts;
                      return (
                        <td key={p._id} className={`pts-cell ${pts > 0 ? 'won' : ''}`}>
                          {pts > 0 ? `+${pts}` : '0'}
                        </td>
                      );
                    })}
                    <td className="total-cell">{teamTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FullOverview;
