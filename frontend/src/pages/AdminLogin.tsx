import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and authentication state
      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('isAdminAuthenticated', 'true');
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container login-page">
      <div className="login-container glass">
        <div className="login-header">
          <div className="header-icon-box">
            <Lock className="header-icon" size={32} />
          </div>
          <h2 className="login-title">Admin <span className="gradient-text">Portal</span></h2>
          <p className="login-subtitle">Please sign in to access the dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? <Loader2 className="spin-icon" size={20} /> : <LogIn size={20} />}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
