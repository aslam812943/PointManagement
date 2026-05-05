import { API_BASE_URL } from "../config/api.config";
import { useState } from 'react';
import { UserPlus, Upload, ShieldCheck, Info, Loader2 } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logo) {
      alert('Please upload a team logo');
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('name', teamName);
    formData.append('logo', logo);

    try {
      const response = await fetch(`${API_BASE_URL}/teams/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setMessage({ type: 'success', text: 'Team registered successfully! Pending admin review.' });
      setTeamName('');
      setLogo(null);
      setPreview(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container register-page">
      <div className="register-container glass">
        <div className="register-header">
          <div className="header-icon-box">
            <UserPlus className="header-icon" size={32} />
          </div>
          <h2 className="register-title">Register Your <span className="gradient-text">Team</span></h2>
          <p className="register-subtitle">Submit your team details for the upcoming festival season.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {message && (
            <div className={`status-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Team Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Alpha Warriors" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Team Logo</label>
            <div className="file-upload-wrapper">
              <input 
                type="file" 
                id="logo-upload" 
                className="file-input-hidden" 
                onChange={handleFileChange}
                accept="image/*"
                disabled={loading}
              />
              <label htmlFor="logo-upload" className="file-upload-box">
                {preview ? (
                  <img src={preview} alt="Logo Preview" className="logo-preview-img" />
                ) : (
                  <>
                    <Upload className="upload-icon" size={32} />
                    <span className="upload-text">Click to upload or drag & drop</span>
                    <span className="upload-hint">PNG, JPG or SVG (max. 2MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="info-box">
            <Info className="info-icon" size={20} />
            <p className="info-text">
              After submission, your team will be reviewed by the administrators. 
              You will be notified once verified.
            </p>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? <Loader2 className="spin-icon" size={20} /> : <ShieldCheck size={20} />}
            <span>{loading ? 'Registering...' : 'Submit for Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
