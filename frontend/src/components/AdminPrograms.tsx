import { API_BASE_URL } from "../config/api.config";
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Trash2, Loader2, ListChecks, Edit2, X, Check } from 'lucide-react';

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

const AdminPrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<string[]>([]);
  
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', location: '', date: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
        const [programsRes, resultsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/programs`),
          fetch(`${API_BASE_URL}/results`)
        ]);
        const programsData = await programsRes.json();
        const resultsData = await resultsRes.json();
        setPrograms(programsData);
        setResults(resultsData);
      } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/programs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newProgram = await response.json();
        setPrograms([...programs, newProgram]);
        setFormData({ ...formData, name: '', location: '' });
      } else if (response.status === 401) {
        window.location.reload(); // Let protected route handle it
      }
    } catch (error) {
      console.error('Error adding program:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setPrograms(programs.filter(p => p._id !== id));
      } else if (response.status === 401) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handleEditSubmit = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedProgram = await response.json();
        setPrograms(programs.map(p => p._id === id ? updatedProgram : p));
        setEditingProgramId(null);
      } else if (response.status === 401) {
        window.location.reload();
      } else {
        alert('Failed to update program');
      }
    } catch (error) {
      console.error('Error updating program:', error);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result? Points will be reverted.')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/results/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setResults(results.filter(r => r._id !== id));
      } else if (response.status === 401) {
        window.location.reload();
      } else {
        alert('Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedPrograms.includes(id)) {
      setExpandedPrograms(expandedPrograms.filter(pid => pid !== id));
    } else {
      setExpandedPrograms([...expandedPrograms, id]);
    }
  };

  // Group programs by date
  const groupedPrograms = programs.reduce((acc, program) => {
    if (!acc[program.date]) acc[program.date] = [];
    acc[program.date].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  const sortedDates = Object.keys(groupedPrograms).sort();

  return (
    <div className="programs-container">
      <div className="add-program-card glass">
        <h3 className="section-subtitle">
          <Plus size={20} />
          <span>Add New Program</span>
        </h3>
        <form onSubmit={handleAddProgram} className="program-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" 
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location / Place</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Main Stage"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Program Name</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g. Group Dance (Senior)"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="spin-icon" size={18} /> : <Plus size={18} />}
            <span>Add Program</span>
          </button>
        </form>
      </div>

      <div className="programs-list-section">
        <h3 className="section-subtitle">
          <ListChecks size={20} />
          <span>Scheduled Programs</span>
        </h3>
        
        {loading ? (
          <div className="loading-container">
            <Loader2 className="spin-icon" size={32} />
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="empty-state">No programs scheduled yet.</div>
        ) : (
          <div className="date-groups">
            {sortedDates.map(date => (
              <div key={date} className="date-group glass">
                <div className="date-header">
                  <Calendar size={18} />
                  <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="programs-sublist">
                  {groupedPrograms[date].map(program => {
                    const programResults = results.filter(r => (typeof r.programId === 'object' ? r.programId._id : r.programId) === program._id);
                    const isExpanded = expandedPrograms.includes(program._id);
                    
                    return (
                      <div key={program._id} className="program-item-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div className="program-item" style={{ marginBottom: isExpanded && programResults.length > 0 ? '0' : '0.5rem', borderBottomLeftRadius: isExpanded && programResults.length > 0 ? '0' : '8px', borderBottomRightRadius: isExpanded && programResults.length > 0 ? '0' : '8px' }}>
                          {editingProgramId === program._id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                              <input 
                                type="text" 
                                value={editFormData.name} 
                                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                                style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <input 
                                  type="text" 
                                  value={editFormData.location} 
                                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} 
                                  style={{ flex: '1 1 120px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
                                />
                                <input 
                                  type="date" 
                                  value={editFormData.date} 
                                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})} 
                                  style={{ flex: '1 1 120px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button onClick={() => setEditingProgramId(null)} style={{ background: 'transparent', color: 'white', border: '1px solid var(--border-color)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <X size={14} /> Cancel
                                </button>
                                <button onClick={() => handleEditSubmit(program._id)} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={14} /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="program-info">
                                <span className="p-name">{program.name}</span>
                                <div className="p-location">
                                  <MapPin size={14} />
                                  <span>{program.location}</span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {programResults.length > 0 && (
                                  <button 
                                    onClick={() => toggleExpand(program._id)}
                                    style={{ background: 'var(--glass-bg)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                  >
                                    {isExpanded ? 'Hide Results' : 'View Results'}
                                  </button>
                                )}
                                <button 
                                  className="edit-btn" 
                                  onClick={() => { setEditingProgramId(program._id); setEditFormData({ name: program.name, location: program.location, date: program.date }); }}
                                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(program._id)}>
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {isExpanded && programResults.length > 0 && (
                          <div className="admin-program-results glass" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '0.9rem' }}>Assigned Results</h4>
                            {programResults.map((r, idx) => (
                              <div key={r._id} style={{ marginBottom: idx < programResults.length - 1 ? '1.5rem' : '0', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.85rem' }}>Category: {r.styleCategory}</div>
                                  <button 
                                    onClick={() => handleDeleteResult(r._id)} 
                                    style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {r.firstPlace && <li style={{ color: 'white', fontSize: '0.85rem' }}><span style={{ color: '#ffd700', marginRight: '0.5rem' }}>1st:</span> {r.firstPlace.name}</li>}
                                  {r.secondPlace && <li style={{ color: 'white', fontSize: '0.85rem' }}><span style={{ color: '#c0c0c0', marginRight: '0.5rem' }}>2nd:</span> {r.secondPlace.name}</li>}
                                  {r.thirdPlace && <li style={{ color: 'white', fontSize: '0.85rem' }}><span style={{ color: '#cd7f32', marginRight: '0.5rem' }}>3rd:</span> {r.thirdPlace.name}</li>}
                                  {r.fourthPlace && <li style={{ color: 'white', fontSize: '0.85rem' }}><span style={{ color: '#64748b', marginRight: '0.5rem' }}>4th:</span> {r.fourthPlace.name}</li>}
                                  {r.fifthPlace && <li style={{ color: 'white', fontSize: '0.85rem' }}><span style={{ color: '#94a3b8', marginRight: '0.5rem' }}>5th:</span> {r.fifthPlace.name}</li>}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrograms;
