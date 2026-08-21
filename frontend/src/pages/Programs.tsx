import { API_BASE_URL } from "../config/api.config";
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowUp, Loader2, List } from 'lucide-react';
import './Programs.css';

interface Program {
  _id: string;
  name: string;
  location: string;
  date: string;
}

interface TeamRef {
  _id: string;
  name: string;
}

interface Result {
  _id: string;
  programId: string | any;
  styleCategory: string;
  firstPlace?: TeamRef;
  secondPlace?: TeamRef;
  thirdPlace?: TeamRef;
  fourthPlace?: TeamRef;
  fifthPlace?: TeamRef;
}

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const [programsRes, resultsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/programs`),
          fetch(`${API_BASE_URL}/results`)
        ]);
        const programsData = await programsRes.json();
        const resultsData = await resultsRes.json();
        
        // Sort by date and then by name
        const sorted = programsData.sort((a: Program, b: Program) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.name.localeCompare(b.name);
        });
        setPrograms(sorted);
        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const pastPrograms = programs.filter(p => p.date < today);
  const todayPrograms = programs.filter(p => p.date === today);
  const upcomingPrograms = programs.filter(p => p.date > today);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spin-icon" size={48} />
        <p>Loading festival schedule...</p>
      </div>
    );
  }

  return (
    <div className="container programs-page">
      <header className="programs-header">
        <h1 className="page-title">Festival <span className="gradient-text">Schedule</span></h1>
        <p className="page-subtitle">Don't miss out on any performances. Track all events here.</p>
      </header>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${view === 'upcoming' ? 'active' : ''}`}
          onClick={() => setView('upcoming')}
        >
          <Clock size={18} />
          <span>Upcoming</span>
        </button>
        <button 
          className={`filter-tab ${view === 'all' ? 'active' : ''}`}
          onClick={() => setView('all')}
        >
          <List size={18} />
          <span>All Programs</span>
        </button>
      </div>

      <div className="timeline">
        {view === 'all' && pastPrograms.length > 0 && (
          <div className="timeline-section">
            <h3 className="section-title">
              <Clock size={20} />
              <span>Previous Programs</span>
            </h3>
            {pastPrograms.map(program => (
              <ProgramCard key={program._id} program={program} status="finished" results={results.filter(r => (typeof r.programId === 'object' ? r.programId._id : r.programId) === program._id)} />
            ))}
          </div>
        )}

        {todayPrograms.length > 0 && (
          <div className="timeline-section">
            <h3 className="section-title today">
              <Clock size={20} />
              <span>Today's Highlights</span>
            </h3>
            {todayPrograms.map(program => (
              <ProgramCard key={program._id} program={program} status="live" results={results.filter(r => (typeof r.programId === 'object' ? r.programId._id : r.programId) === program._id)} />
            ))}
          </div>
        )}

        {upcomingPrograms.length > 0 && (
          <div className="timeline-section">
            <h3 className="section-title">
              <Calendar size={20} />
              <span>Upcoming Performances</span>
            </h3>
            {upcomingPrograms.map(program => (
              <ProgramCard key={program._id} program={program} status="upcoming" results={results.filter(r => (typeof r.programId === 'object' ? r.programId._id : r.programId) === program._id)} />
            ))}
          </div>
        )}

        {view === 'upcoming' && todayPrograms.length === 0 && upcomingPrograms.length === 0 && (
          <div className="empty-state glass">
            <Calendar className="empty-icon" size={48} />
            <p>No upcoming programs scheduled for now.</p>
            <button className="btn-secondary" style={{marginTop: '1rem'}} onClick={() => setView('all')}>
              View Full Schedule
            </button>
          </div>
        )}

        {view === 'all' && programs.length === 0 && (
          <div className="empty-state glass">
            <Calendar className="empty-icon" size={48} />
            <p>The schedule is currently empty.</p>
          </div>
        )}
      </div>

      {view === 'all' && (
        <div className="scroll-top-hint">
          <button className="btn-link" onClick={scrollToTop}>
            <ArrowUp size={16} />
            Back to Top
          </button>
        </div>
      )}
    </div>
  );
};

const ProgramCard = ({ program, status, results = [] }: { program: Program, status: 'live' | 'upcoming' | 'finished', results?: Result[] }) => {
  const [showResults, setShowResults] = useState(false);
  
  const formattedDate = new Date(program.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`timeline-item ${status === 'live' ? 'active' : status === 'finished' ? 'past' : ''}`}>
      <div className="timeline-dot"></div>
      <div className="program-card glass">
        <div className="program-main">
          <span className="program-name">{program.name}</span>
          <div className="program-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>{formattedDate}</span>
            </div>
            <div className="meta-item">
              <MapPin size={14} />
              <span>{program.location}</span>
            </div>
          </div>
        </div>
        <div className={`status-badge ${status}`}>
          {status === 'live' ? 'Today' : status === 'finished' ? 'Finished' : 'Upcoming'}
        </div>
      </div>
      
      {results.length > 0 && (
        <div className="program-results-toggle" style={{ marginTop: '0.5rem', textAlign: 'right' }}>
          <button 
            onClick={() => setShowResults(!showResults)} 
            style={{ background: 'var(--glass-bg)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            {showResults ? 'Hide Results' : 'View Results'}
          </button>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="program-results-content glass" style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1rem' }}>Program Results</h4>
          {results.map((r, idx) => (
            <div key={r._id} style={{ marginBottom: idx < results.length - 1 ? '1.5rem' : '0' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category: {r.styleCategory}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {r.firstPlace && <li style={{ color: 'white', fontSize: '0.9rem' }}><span style={{ color: '#ffd700', marginRight: '0.5rem', fontWeight: 'bold' }}>1st Place:</span> {r.firstPlace.name}</li>}
                {r.secondPlace && <li style={{ color: 'white', fontSize: '0.9rem' }}><span style={{ color: '#c0c0c0', marginRight: '0.5rem', fontWeight: 'bold' }}>2nd Place:</span> {r.secondPlace.name}</li>}
                {r.thirdPlace && <li style={{ color: 'white', fontSize: '0.9rem' }}><span style={{ color: '#cd7f32', marginRight: '0.5rem', fontWeight: 'bold' }}>3rd Place:</span> {r.thirdPlace.name}</li>}
                {r.fourthPlace && <li style={{ color: 'white', fontSize: '0.9rem' }}><span style={{ color: '#64748b', marginRight: '0.5rem', fontWeight: 'bold' }}>4th Place:</span> {r.fourthPlace.name}</li>}
                {r.fifthPlace && <li style={{ color: 'white', fontSize: '0.9rem' }}><span style={{ color: '#94a3b8', marginRight: '0.5rem', fontWeight: 'bold' }}>5th Place:</span> {r.fifthPlace.name}</li>}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs;
