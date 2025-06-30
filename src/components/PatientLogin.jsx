import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function PatientLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const userData = JSON.parse(demoUser);
        if (userData.role !== 'doctor') {
          setUser(userData);
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error parsing demo user:', error);
        localStorage.removeItem('demoUser');
      }
    }

    if (!supabaseConfigured) {
      console.warn('Supabase is not properly configured. Using demo mode.');
      setInitialCheckDone(true);
      return;
    }

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: { user } } = await supabase.auth.getUser();
          const metadata = user?.user_metadata || {};
          if (metadata.role !== 'doctor') {
            setUser(user);
            navigate('/dashboard');
            return;
          }
        }
        setInitialCheckDone(true);
      } catch (error) {
        console.error('Error checking user session:', error);
        setInitialCheckDone(true);
      }
    };

    checkUser();

    // Listen for auth changes
    if (supabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          if (metadata.role !== 'doctor') {
            setUser(session.user);
            navigate('/dashboard');
          }
        } else {
          setUser(null);
          setInitialCheckDone(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [supabaseConfigured, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Demo users for testing
      const demoUsers = {
        'freeuser@example.com': { password: 'FreePass123', plan: 'free', role: 'patient' },
        'premiumuser@example.com': { password: 'PremiumPass123', plan: 'premium', role: 'patient' }
      };

      if (demoUsers[formData.email] && demoUsers[formData.email].password === formData.password) {
        // Demo login successful
        const demoUser = demoUsers[formData.email];
        
        const userData = {
          email: formData.email,
          name: formData.email.split('@')[0],
          phone: '+91 9876543210',
          plan: demoUser.plan,
          role: 'patient',
          id: 'demo-' + Math.random().toString(36).substr(2, 9)
        };
        
        localStorage.setItem('demoUser', JSON.stringify(userData));
        setUser(userData);
        
        navigate('/dashboard');
        return;
      }

      if (supabaseConfigured) {
        let result;
        
        if (isSignUp) {
          result = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                role: 'patient'
              }
            }
          });
          
          if (result.error) {
            setErrors({ submit: result.error.message });
            setIsLoading(false);
          } else {
            // Show success message for signup
            alert(t('signupSuccess'));
            setIsSignUp(false);
            setFormData({ email: formData.email, password: '', confirmPassword: '' });
            setIsLoading(false);
          }
        } else {
          result = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          
          if (result.error) {
            setErrors({ submit: t('invalidCredentials') });
            setIsLoading(false);
          } else {
            // Store user role in user metadata
            await supabase.auth.updateUser({
              data: { role: 'patient' }
            });
            
            setFormData({ email: '', password: '', confirmPassword: '' });
            setErrors({});
            
            // Set user state before navigation
            setUser(result.data.user);
            
            navigate('/dashboard');
          }
        }
      } else {
        setErrors({ submit: 'Invalid credentials or doctor ID' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: t('unexpectedError') });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('demoUser');
    setUser(null);
  };

  const handleGoogleLogin = async () => {
    if (!supabaseConfigured) {
      setErrors({ submit: 'Supabase is not configured. Please check your environment variables.' });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          data: {
            role: 'patient'
          }
        }
      });
      
      if (error) {
        setErrors({ submit: error.message });
      }
    } catch (error) {
      setErrors({ submit: t('unexpectedError') });
    }
  };

  const quickLogin = (email, password) => {
    setFormData({ email, password, confirmPassword: '' });
  };

  // Show loading state until initial check is done
  if (!initialCheckDone && !user) {
    return (
      <div className="login" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏥</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="login">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>🏥 VitalPulse</h1>
              <h2>Welcome Back!</h2>
            </div>
            
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <p className="user-email">{user.email}</p>
              <p className="user-status">
                Logged in as patient • {user.plan || 'free'} plan
              </p>
              
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🏥 VitalPulse</h1>
            <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
            <p>{isSignUp ? 'Join VitalPulse healthcare platform' : 'Access your healthcare dashboard'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            {errors.submit && (
              <div className="submit-error">
                {errors.submit}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <button 
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              🔍 Continue with Google
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button"
                className="toggle-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                  setFormData({ email: '', password: '', confirmPassword: '' });
                }}
                disabled={isLoading}
              >
                {isSignUp ? 'Sign in here' : 'Sign up here'}
              </button>
            </p>
          </div>

          {!isSignUp && (
            <div className="demo-accounts" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '15px', marginTop: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', textAlign: 'center' }}>Demo Accounts</h4>
              <div className="demo-buttons">
                <button 
                  type="button"
                  onClick={() => quickLogin('freeuser@example.com', 'FreePass123')}
                  className="demo-btn free-demo"
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '10px',
                    background: 'white',
                    color: '#138808',
                    border: '2px solid #138808',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    marginBottom: '0.75rem',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Free User (2 consultations/month)
                </button>
                <button 
                  type="button"
                  onClick={() => quickLogin('premiumuser@example.com', 'PremiumPass123')}
                  className="demo-btn premium-demo"
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '10px',
                    background: 'white',
                    color: '#FF9933',
                    border: '2px solid #FF9933',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Premium User (Unlimited consultations)
                </button>
              </div>
            </div>
          )}

          <div className="doctor-login-link">
            <p>
              Are you a doctor? <a href="/doctor-login">Login here</a>
            </p>
          </div>

          <div className="security-note">
            <p>🔒 Your health data is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;