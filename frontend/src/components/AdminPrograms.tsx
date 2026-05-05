import { API_BASE_URL } from "../config/api.config";
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Trash2, Loader2, ListChecks } from 'lucide-react';

interface Program {
  _id: string;
  name: string;
  location: string;
  date: string;
}

const AdminPrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
      const response = await fetch(`${API_BASE_URL}/programs`);
      const data = await response.json();
      setPrograms(data);
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
                  {groupedPrograms[date].map(program => (
                    <div key={program._id} className="program-item">
                      <div className="program-info">
                        <span className="p-name">{program.name}</span>
                        <div className="p-location">
                          <MapPin size={14} />
                          <span>{program.location}</span>
                        </div>
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(program._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
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
