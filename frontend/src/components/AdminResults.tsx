import { API_BASE_URL } from "../config/api.config";
import { useState, useEffect } from 'react';
import { Trophy, Calendar, Medal, Loader2, CheckCircle2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface Program {
  _id: string;
  name: string;
  date: string;
  location: string;
}

interface Team {
  _id: string;
  name: string;
  style: string;
}

interface Result {
  programId: string | any;
  styleCategory: string;
}

const AdminResults = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  
  const initialWinnersState = { firstPlace: '', secondPlace: '', thirdPlace: '', fourthPlace: '', fifthPlace: '' };
  
  const [winners, setWinners] = useState(initialWinnersState);
  const [style1Winners, setStyle1Winners] = useState(initialWinnersState);
  const [style2Winners, setStyle2Winners] = useState(initialWinnersState);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [teamFilterStyle, setTeamFilterStyle] = useState('Mixed');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [programsRes, teamsRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/programs`),
        fetch(`${API_BASE_URL}/teams/leaderboard`),
        fetch(`${API_BASE_URL}/results`)
      ]);
      setPrograms(await programsRes.json());
      setTeams(await teamsRes.json());
      setResults(await resultsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Filter out programs that already have results assigned
  const assignedProgramIds = results.map(r => {
    const pId = typeof r.programId === 'object' ? r.programId._id : r.programId;
    return pId; // Any result means we should probably hide it since they are assigning all at once now
  }).filter(Boolean);
  
  const filteredPrograms = programs.filter(p => 
    p.date === date && !assignedProgramIds.includes(p._id)
  );

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) {
      alert('Please select a program.');
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem('adminToken');
    setShowConfirm(false);
    setSubmitting(true);
    setMessage('');
    
    try {
      if (teamFilterStyle === 'Mixed') {
        const response = await fetch(`${API_BASE_URL}/results`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            programId: selectedProgram,
            styleCategory: 'Mixed',
            ...winners
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage('Results assigned successfully!');
          setResults([...results, data]);
          setSelectedProgram('');
          setWinners(initialWinnersState);
        } else if (response.status === 401) {
          window.location.reload();
        } else {
          alert(data.message || 'Error assigning results');
        }
      } else if (teamFilterStyle === 'Separate') {
        let hasError = false;
        let newResults = [...results];
        
        // Submit Style 1
        const res1 = await fetch(`${API_BASE_URL}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ programId: selectedProgram, styleCategory: 'Style 1', ...style1Winners }),
        });
        const data1 = await res1.json();
        
        if (res1.status === 401) {
          window.location.reload();
          return;
        } else if (!res1.ok) {
          alert(data1.message || 'Error assigning Style 1 results');
          hasError = true;
        } else {
          newResults.push(data1);
        }

        // Submit Style 2
        const res2 = await fetch(`${API_BASE_URL}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ programId: selectedProgram, styleCategory: 'Style 2', ...style2Winners }),
        });
        const data2 = await res2.json();
        
        if (res2.status === 401) {
          window.location.reload();
          return;
        } else if (!res2.ok) {
          alert(data2.message || 'Error assigning Style 2 results');
          hasError = true;
        } else {
          newResults.push(data2);
        }

        if (!hasError) {
          setMessage('Separate results assigned successfully!');
          setResults(newResults);
          setSelectedProgram('');
          setStyle1Winners(initialWinnersState);
          setStyle2Winners(initialWinnersState);
        }
      }
    } catch (error) {
      console.error('Error submitting results:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProgramName = programs.find(p => p._id === selectedProgram)?.name;

  const renderWinnerSelects = (
    title: string,
    state: any,
    setState: any,
    teamsToFilter: Team[]
  ) => {
    return (
      <div className="winners-section" style={{ marginTop: '20px' }}>
        {title && <h4 style={{ color: '#fff', marginBottom: '15px' }}>{title}</h4>}
        <div className="winners-selection">
          <div className="winner-input-group">
            <div className="winner-label first">
              <Medal size={20} color="#ffd700" />
              <span>1st Place (10 pts) (Optional)</span>
            </div>
            <select 
              className="form-input"
              value={state.firstPlace}
              onChange={(e) => setState({...state, firstPlace: e.target.value})}
            >
              <option value="">-- Select Team --</option>
              {teamsToFilter.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="winner-input-group">
            <div className="winner-label second">
              <Medal size={20} color="#c0c0c0" />
              <span>2nd Place (7 pts) (Optional)</span>
            </div>
            <select 
              className="form-input"
              value={state.secondPlace}
              onChange={(e) => setState({...state, secondPlace: e.target.value})}
            >
              <option value="">-- Select Team --</option>
              {teamsToFilter.filter(t => t._id !== state.firstPlace).map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="winner-input-group">
            <div className="winner-label third">
              <Medal size={20} color="#cd7f32" />
              <span>3rd Place (5 pts) (Optional)</span>
            </div>
            <select 
              className="form-input"
              value={state.thirdPlace}
              onChange={(e) => setState({...state, thirdPlace: e.target.value})}
            >
              <option value="">-- Select Team --</option>
              {teamsToFilter.filter(t => t._id !== state.firstPlace && t._id !== state.secondPlace).map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="winner-input-group">
            <div className="winner-label fourth">
              <Medal size={20} color="#64748b" />
              <span>4th Place (3 pts) (Optional)</span>
            </div>
            <select 
              className="form-input"
              value={state.fourthPlace}
              onChange={(e) => setState({...state, fourthPlace: e.target.value})}
            >
              <option value="">-- Select Team --</option>
              {teamsToFilter.filter(t => t._id !== state.firstPlace && t._id !== state.secondPlace && t._id !== state.thirdPlace).map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="winner-input-group">
            <div className="winner-label fifth">
              <Medal size={20} color="#94a3b8" />
              <span>5th Place (2 pts) (Optional)</span>
            </div>
            <select 
              className="form-input"
              value={state.fifthPlace}
              onChange={(e) => setState({...state, fifthPlace: e.target.value})}
            >
              <option value="">-- Select Team --</option>
              {teamsToFilter.filter(t => t._id !== state.firstPlace && t._id !== state.secondPlace && t._id !== state.thirdPlace && t._id !== state.fourthPlace).map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="results-container">
      <div className="add-points-card glass">
        <h3 className="section-subtitle">
          <Trophy size={20} />
          <span>Assign Program Winners</span>
        </h3>

        <form onSubmit={handleOpenConfirm} className="results-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Step 1: Select Date</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" 
                  className="form-input"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedProgram('');
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Step 2: Select Program</label>
              <select 
                className="form-input"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                required
              >
                <option value="">-- Select Program --</option>
                {filteredPrograms.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.location})</option>
                ))}
              </select>
              {filteredPrograms.length === 0 && <span className="input-hint">No pending programs found for this date.</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Step 3: Program Category</label>
              <select 
                className="form-input"
                value={teamFilterStyle}
                onChange={(e) => {
                  setTeamFilterStyle(e.target.value);
                  setWinners(initialWinnersState);
                  setStyle1Winners(initialWinnersState);
                  setStyle2Winners(initialWinnersState);
                }}
              >
                <option value="Mixed">Mixed (All Styles)</option>
                <option value="Separate">Separate Styles (Style 1 & Style 2)</option>
              </select>
            </div>
          </div>

          {teamFilterStyle === 'Mixed' ? (
            renderWinnerSelects('', winners, setWinners, teams)
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {renderWinnerSelects('Style 1 Winners', style1Winners, setStyle1Winners, teams.filter(t => t.style === 'Style 1'))}
              {renderWinnerSelects('Style 2 Winners', style2Winners, setStyle2Winners, teams.filter(t => t.style === 'Style 2'))}
            </div>
          )}

          {message && (
            <div className="status-message success" style={{ marginTop: '20px' }}>
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}

          <button type="submit" className="btn-primary submit-results-btn" disabled={submitting || !selectedProgram} style={{ marginTop: '20px' }}>
            {submitting ? <Loader2 className="spin-icon" size={20} /> : <Trophy size={20} />}
            <span>Assign Points</span>
          </button>
        </form>
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalSubmit}
        title="Confirm Results"
        message={`Are you sure you want to assign points for "${selectedProgramName}"? Please re-check the winning teams carefully.`}
        confirmText="Yes, Save Results"
      />
    </div>
  );
};

export default AdminResults;
