import { API_BASE_URL } from "../config/api.config";
import { useState, useEffect } from 'react';
import { Trophy, Calendar, Medal, Loader2, CheckCircle2, Trash2, Edit, MapPin } from 'lucide-react';
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState('');
  const [editWinners, setEditWinners] = useState(initialWinnersState);
  const [editingResultStyle, setEditingResultStyle] = useState('Mixed');
  const [editingProgramName, setEditingProgramName] = useState('');

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
          // Refetch results to get populated data
          const resultsRes = await fetch(`${API_BASE_URL}/results`);
          setResults(await resultsRes.json());
          setMessage('Results assigned successfully!');
          setSelectedProgram('');
          setWinners(initialWinnersState);
        } else if (response.status === 401) {
          window.location.reload();
        } else {
          alert(data.message || 'Error assigning results');
        }
      } else if (teamFilterStyle === 'Separate') {
        let hasError = false;
        
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
        }

        if (!hasError) {
          // Refetch results to get populated data
          const resultsRes = await fetch(`${API_BASE_URL}/results`);
          setResults(await resultsRes.json());
          setMessage('Separate results assigned successfully!');
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

  const handleDeleteResult = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this result? Points will be removed from the teams.')) {
      return;
    }
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/results/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setResults(results.filter(r => (r as any)._id !== id));
        setMessage('Result deleted successfully!');
      } else if (response.status === 401) {
        window.location.reload();
      } else {
        alert('Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const handleOpenEditModal = (result: any) => {
    setEditingResultId(result._id);
    setEditingResultStyle(result.styleCategory);
    setEditingProgramName(result.programId?.name || 'Unknown Program');
    setEditWinners({
      firstPlace: result.firstPlace?._id || '',
      secondPlace: result.secondPlace?._id || '',
      thirdPlace: result.thirdPlace?._id || '',
      fourthPlace: result.fourthPlace?._id || '',
      fifthPlace: result.fifthPlace?._id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/results/${editingResultId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editWinners),
      });
      const data = await response.json();
      if (response.ok) {
        // Refetch all results to get updated populated fields
        const resultsRes = await fetch(`${API_BASE_URL}/results`);
        setResults(await resultsRes.json());
        setIsEditModalOpen(false);
        setMessage('Result updated successfully!');
      } else if (response.status === 401) {
        window.location.reload();
      } else {
        alert(data.message || 'Error updating result');
      }
    } catch (error) {
      console.error('Error updating result:', error);
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

      <div className="assigned-results-card glass" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px' }}>
        <h3 className="section-subtitle" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={20} />
          <span>Assigned Results</span>
        </h3>
        
        {results.length === 0 ? (
          <p className="text-muted">No results have been assigned yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="master-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Location</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Category</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>1st Place</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any) => (
                  <tr key={r._id}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
                        <MapPin size={16} color="var(--primary-color)" />
                        <span>{r.programId?.location || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
                      {r.styleCategory}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
                      {r.firstPlace?.name || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="action-btn"
                          style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleOpenEditModal(r)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn"
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleDeleteResult(r._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="sidebar-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'white' }}>Edit Results</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{editingProgramName} ({editingResultStyle})</p>
            <form onSubmit={handleEditSubmit}>
              {renderWinnerSelects('', editWinners, setEditWinners, editingResultStyle === 'Mixed' ? teams : teams.filter(t => t.style === editingResultStyle))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', background: 'var(--primary-color)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
