import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function Login() {
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

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseConfigured) {
      console.warn('Supabase is not properly configured. Please check your environment variables.');
      setInitialCheckDone(true);
      return;
    }

    // Check for existing session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Add a small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 200);
      } else {
        setInitialCheckDone(true);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Add a small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 200);
      } else {
        setUser(null);
        setInitialCheckDone(true);
      }
    });

    return () => subscription.unsubscribe();
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
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('confirmPasswordRequired');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('passwordsDoNotMatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!supabaseConfigured) {
      setErrors({ submit: 'Supabase is not configured. Please check your environment variables.' });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
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
          
          // Add a small delay to ensure state is updated before navigation
          setTimeout(() => {
            navigate('/dashboard');
          }, 200);
        }
      }
    } catch (error) {
      setErrors({ submit: t('unexpectedError') });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabaseConfigured) return;
    
    await supabase.auth.signOut();
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

  // Show configuration error if Supabase is not set up
  if (!supabaseConfigured) {
    return (
      <div className="login">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>🏥 VitalPulse</h1>
              <h2>Configuration Required</h2>
            </div>
            
            <div style={{ 
              padding: '2rem', 
              background: '#fff5f5', 
              border: '1px solid #dc3545', 
              borderRadius: '10px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Supabase Configuration Missing</h3>
              <p style={{ marginBottom: '1rem' }}>To use authentication, please:</p>
              <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                <li>Create a Supabase account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FF9933' }}>supabase.com</a></li>
                <li>Create a new project</li>
                <li>Get your Project URL and API Key from Settings → API</li>
                <li>Create a <code style={{ background: '#f8f9fa', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>.env</code> file in your project root</li>
                <li>Add your credentials:
                  <pre style={{ 
                    background: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '4px', 
                    marginTop: '0.5rem',
                    fontSize: '0.9rem',
                    overflow: 'auto'
                  }}>
{`VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here`}
                  </pre>
                </li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show user info if logged in
  if (user) {
    return (
      <div className="login">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>🏥 VitalPulse</h1>
              <h2>{t('welcomeBack')}</h2>
            </div>
            
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <p className="user-email">{user.email}</p>
              <p className="user-status">{t('loggedInAs')} {user.email}</p>
              
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                {t('logout')}
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
            <h2>{isSignUp ? t('signup') : t('login')}</h2>
            <p>{isSignUp ? t('signupSubtitle') : t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">{t('emailAddress')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('emailPlaceholder')}
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('passwordPlaceholder')}
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('confirmPasswordPlaceholder')}
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
              {isLoading ? t('processing') : (isSignUp ? t('signupButton') : t('loginButton'))}
            </button>

            <div className="divider">
              <span>{t('orContinueWith')}</span>
            </div>

            <button 
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              🔍 {t('continueWithGoogle')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isSignUp ? t('haveAccount') : t('noAccount')}
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
                {isSignUp ? t('loginLink') : t('signupLink')}
              </button>
            </p>
          </div>

          <div className="security-note">
            <p>🔒 {t('healthcareNote')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;