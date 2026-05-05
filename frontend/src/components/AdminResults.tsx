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
}

interface Result {
  programId: string | any;
}

const AdminResults = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [winners, setWinners] = useState({
    firstPlace: '',
    secondPlace: '',
    thirdPlace: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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
  const assignedProgramIds = results.map(r => 
    typeof r.programId === 'object' ? r.programId._id : r.programId
  );
  
  const filteredPrograms = programs.filter(p => 
    p.date === date && !assignedProgramIds.includes(p._id)
  );

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !winners.firstPlace) {
      alert('Please select a program and at least the 1st place winner.');
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem('adminToken');
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          programId: selectedProgram,
          ...winners
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Results assigned successfully!');
        // Update results list locally to hide the program
        setResults([...results, { programId: selectedProgram }]);
        setSelectedProgram('');
        setWinners({ firstPlace: '', secondPlace: '', thirdPlace: '' });
      } else if (response.status === 401) {
        window.location.reload();
      } else {
        alert(data.message || 'Error assigning results');
      }
    } catch (error) {
      console.error('Error submitting results:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProgramName = programs.find(p => p._id === selectedProgram)?.name;

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
          </div>

          <div className="winners-selection">
            <div className="winner-input-group">
              <div className="winner-label first">
                <Medal size={20} color="#ffd700" />
                <span>1st Place (10 pts)</span>
              </div>
              <select 
                className="form-input"
                value={winners.firstPlace}
                onChange={(e) => setWinners({...winners, firstPlace: e.target.value})}
                required
              >
                <option value="">-- Select Team --</option>
                {teams.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="winner-input-group">
              <div className="winner-label second">
                <Medal size={20} color="#c0c0c0" />
                <span>2nd Place (5 pts)</span>
              </div>
              <select 
                className="form-input"
                value={winners.secondPlace}
                onChange={(e) => setWinners({...winners, secondPlace: e.target.value})}
              >
                <option value="">-- Select Team --</option>
                {teams.filter(t => t._id !== winners.firstPlace).map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="winner-input-group">
              <div className="winner-label third">
                <Medal size={20} color="#cd7f32" />
                <span>3rd Place (3 pts)</span>
              </div>
              <select 
                className="form-input"
                value={winners.thirdPlace}
                onChange={(e) => setWinners({...winners, thirdPlace: e.target.value})}
              >
                <option value="">-- Select Team --</option>
                {teams.filter(t => t._id !== winners.firstPlace && t._id !== winners.secondPlace).map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <div className="status-message success">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}

          <button type="submit" className="btn-primary submit-results-btn" disabled={submitting || !selectedProgram}>
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
