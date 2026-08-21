import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api.config';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('adminToken');
      const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

      if (!token || !isAuthenticated) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsValid(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('adminToken');
          localStorage.removeItem('isAdminAuthenticated');
          setIsValid(false);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 className="spin-icon" size={48} color="var(--primary-color)" />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
