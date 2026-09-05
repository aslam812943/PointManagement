import { API_BASE_URL } from "../config/api.config";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Calendar, Medal, ArrowLeft, Loader2, MapPin, Award } from 'lucide-react';
import './TeamPerformance.css';

interface Team {
  _id: string;
  name: string;
  logoUrl: string;
  totalPoints: number;
}

interface Program {
  _id: string;
  name: string;
  location: string;
  date: string;
}

interface Result {
  _id: string;
  programId: string | any;
  firstPlace: string | any;
  secondPlace: string | any;
  thirdPlace: string | any;
  fourthPlace?: string | any;
  fifthPlace?: string | any;
}

const TeamPerformance = () => {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [teamRes, programsRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/teams/${id}`),
        fetch(`${API_BASE_URL}/programs`),
        fetch(`${API_BASE_URL}/results`)
      ]);

      setTeam(await teamRes.json());
      setPrograms(await programsRes.json());
      setResults(await resultsRes.json());
    } catch (error) {
      console.error('Error fetching team detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spin-icon" size={48} />
        <p>Loading team performance...</p>
      </div>
    );
  }

  if (!team) return <div>Team not found</div>;

  // Group programs by date
  const groupedPrograms = programs.reduce((acc, program) => {
    if (!acc[program.date]) acc[program.date] = [];
    acc[program.date].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  const sortedDates = Object.keys(groupedPrograms).sort();

  const getPointsForProgram = (programId: string) => {
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

      if (firstId === id) totalPts += 10;
      else if (secondId === id) totalPts += 7;
      else if (thirdId === id) totalPts += 5;
      else if (fourthId === id) totalPts += 3;
      else if (fifthId === id) totalPts += 2;
    });

    return totalPts;
  };

  const getPositionText = (programId: string) => {
    const pts = getPointsForProgram(programId);
    if (pts === 10) return { text: '1st Place', class: 'first' };
    if (pts === 7) return { text: '2nd Place', class: 'second' };
    if (pts === 5) return { text: '3rd Place', class: 'third' };
    if (pts === 3) return { text: '4th Place', class: 'fourth' };
    if (pts === 2) return { text: '5th Place', class: 'fifth' };
    return { text: 'No Rank', class: 'none' };
  };

  const currentTeamId = team?._id || id;

  const positionSummary = results.reduce(
    (acc, result) => {
      const firstId = typeof result.firstPlace === 'object' ? result.firstPlace?._id : result.firstPlace;
      const secondId = typeof result.secondPlace === 'object' ? result.secondPlace?._id : result.secondPlace;
      const thirdId = typeof result.thirdPlace === 'object' ? result.thirdPlace?._id : result.thirdPlace;
      const fourthId = typeof result.fourthPlace === 'object' ? result.fourthPlace?._id : result.fourthPlace;
      const fifthId = typeof result.fifthPlace === 'object' ? result.fifthPlace?._id : result.fifthPlace;

      if (firstId && (firstId === id || firstId === currentTeamId || String(firstId) === String(id))) acc.first++;
      if (secondId && (secondId === id || secondId === currentTeamId || String(secondId) === String(id))) acc.second++;
      if (thirdId && (thirdId === id || thirdId === currentTeamId || String(thirdId) === String(id))) acc.third++;
      if (fourthId && (fourthId === id || fourthId === currentTeamId || String(fourthId) === String(id))) acc.fourth++;
      if (fifthId && (fifthId === id || fifthId === currentTeamId || String(fifthId) === String(id))) acc.fifth++;

      return acc;
    },
    { first: 0, second: 0, third: 0, fourth: 0, fifth: 0 }
  );

  const totalPrizes =
    positionSummary.first +
    positionSummary.second +
    positionSummary.third +
    positionSummary.fourth +
    positionSummary.fifth;

  const summaryItems = [
    { label: '1st Place', count: positionSummary.first, key: 'first', icon: Trophy, colorClass: 'first' },
    { label: '2nd Place', count: positionSummary.second, key: 'second', icon: Medal, colorClass: 'second' },
    { label: '3rd Place', count: positionSummary.third, key: 'third', icon: Medal, colorClass: 'third' },
    { label: '4th Place', count: positionSummary.fourth, key: 'fourth', icon: Award, colorClass: 'fourth' },
    { label: '5th Place', count: positionSummary.fifth, key: 'fifth', icon: Award, colorClass: 'fifth' },
    { label: 'Total Prizes', count: totalPrizes, key: 'total', icon: Trophy, colorClass: 'total' },
  ];

  return (
    <div className="container team-detail-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Leaderboard</span>
      </Link>

      <div className="team-header-card glass">
        <div className="team-main-info">
          <img src={team.logoUrl} alt={team.name} className="team-large-logo" />
          <div className="team-text">
            <h1 className="team-name-title">{team.name}</h1>
            <p className="team-status-label">Verified Competition Team</p>
          </div>
        </div>
        <div className="team-score-card">
          <Trophy className="trophy-icon" size={32} />
          <div className="score-details">
            <span className="score-label">Total Season Points</span>
            <span className="score-value">{team.totalPoints}</span>
          </div>
        </div>
      </div>

      <div className="position-summary-section">
        <h2 className="section-title">Position <span className="gradient-text">Summary</span></h2>
        <div className="position-summary-grid">
          {summaryItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.key} className={`position-stat-card glass ${item.colorClass}`}>
                <div className="position-stat-icon-wrapper">
                  <Icon size={22} />
                </div>
                <div className="position-stat-content">
                  <span className="position-stat-label">{item.label}</span>
                  <span className="position-stat-value">{item.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="performance-section">
        <h2 className="section-title">Program-wise <span className="gradient-text">Breakdown</span></h2>
        
        <div className="timeline">
          {sortedDates.map(date => (
            <div key={date} className="timeline-date-group">
              <div className="timeline-date-header">
                <Calendar size={18} />
                <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              
              <div className="timeline-programs">
                {groupedPrograms[date].map(program => {
                  const pos = getPositionText(program._id);
                  const points = getPointsForProgram(program._id);
                  
                  return (
                    <div key={program._id} className="program-detail-card glass">
                      <div className="program-meta">
                        <h3 className="p-title">{program.name}</h3>
                        <div className="p-loc">
                          <MapPin size={14} />
                          <span>{program.location}</span>
                        </div>
                      </div>
                      
                      <div className={`program-result-tag ${pos.class}`}>
                        <div className="result-info">
                          <Medal size={18} />
                          <span className="pos-text">{pos.text}</span>
                        </div>
                        <div className="points-badge">
                          +{points} Pts
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPerformance;
