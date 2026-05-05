import { useState } from 'react';
import { UserPlus, Upload, ShieldCheck, Info } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ teamName, logo });
    alert('Team submitted for review!');
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
          <div className="form-group">
            <label className="form-label">Team Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Alpha Warriors" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
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

          <button type="submit" className="btn-primary submit-btn">
            <ShieldCheck size={20} />
            <span>Submit for Review</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
