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

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/programs`);
        const data = await response.json();
        // Sort by date and then by name
        const sorted = data.sort((a: Program, b: Program) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.name.localeCompare(b.name);
        });
        setPrograms(sorted);
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
              <ProgramCard key={program._id} program={program} status="finished" />
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
              <ProgramCard key={program._id} program={program} status="live" />
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
              <ProgramCard key={program._id} program={program} status="upcoming" />
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

const ProgramCard = ({ program, status }: { program: Program, status: 'live' | 'upcoming' | 'finished' }) => {
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
    </div>
  );
};

export default Programs;
