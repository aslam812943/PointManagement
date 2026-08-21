import { API_BASE_URL } from "../config/api.config";
import { useEffect, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import './FullOverview.css';

interface Team {
  _id: string;
  name: string;
  logoUrl: string;
  style: string;
}

interface Program {
  _id: string;
  name: string;
  date: string;
  location: string;
}

interface Result {
  programId: string | any;
  firstPlace: string | any;
  secondPlace: string | any;
  thirdPlace: string | any;
  fourthPlace?: string | any;
  fifthPlace?: string | any;
}

const FullOverview = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStyleTab, setActiveStyleTab] = useState('Style 1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, programsRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/teams/leaderboard`),
        fetch(`${API_BASE_URL}/programs`),
        fetch(`${API_BASE_URL}/results`)
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
    const programResults = results.filter(r => 
      (typeof r.programId === 'object' ? r.programId._id : r.programId) === programId
    );

    let totalPts = 0;

    programResults.forEach(result => {
      const firstId = typeof result.firstPlace === 'object' ? result.firstPlace?._id : result.firstPlace;
      const secondId = typeof result.secondPlace === 'object' ? result.secondPlace?._id : result.secondPlace;
      const thirdId = typeof result.thirdPlace === 'object' ? result.thirdPlace?._id : result.thirdPlace;
      const fourthId = typeof result.fourthPlace === 'object' ? result.fourthPlace?._id : result.fourthPlace;
      const fifthId = typeof result.fifthPlace === 'object' ? result.fifthPlace?._id : result.fifthPlace;

      if (firstId === teamId) totalPts += 10;
      else if (secondId === teamId) totalPts += 7;
      else if (thirdId === teamId) totalPts += 5;
      else if (fourthId === teamId) totalPts += 3;
      else if (fifthId === teamId) totalPts += 2;
    });

    return totalPts;
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

      <div className="style-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveStyleTab('Style 1')}
          style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeStyleTab === 'Style 1' ? 'var(--primary-color)' : 'var(--glass-bg)', color: 'white', fontWeight: 'bold' }}
        >
          Style 1
        </button>
        <button 
          onClick={() => setActiveStyleTab('Style 2')}
          style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeStyleTab === 'Style 2' ? 'var(--primary-color)' : 'var(--glass-bg)', color: 'white', fontWeight: 'bold' }}
        >
          Style 2
        </button>
      </div>

      <div className="overview-card glass">
        <div className="table-wrapper">
          <table className="master-table">
            <thead>
              <tr className="main-header">
                <th className="sticky-col team-col">Team / Programs</th>
                {sortedPrograms.map(p => (
                  <th key={p._id} className="program-header">
                    <span className="p-date">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {p.location}</span>
                    <span className="p-name">{p.name}</span>
                  </th>
                ))}
                <th className="total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {teams.filter(t => t.style === activeStyleTab).map(team => {
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
