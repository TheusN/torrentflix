import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm, RegisterForm } from '../components/auth';
import { useAuth } from '../context/AuthContext';

type AuthView = 'login' | 'register';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AuthView>('login');

  // Redirect if already authenticated
  const from = (location.state as any)?.from?.pathname || '/app/inicio';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleRegisterSuccess = () => {
    setView('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-900 to-dark-900" />

      <div className="relative z-10">
        {view === 'login' ? (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => setView('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onLoginClick={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
}

export default LoginPage;
