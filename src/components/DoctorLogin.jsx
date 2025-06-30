import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function DoctorLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    doctorId: ''
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
        if (userData.role === 'doctor') {
          setUser(userData);
          navigate('/doctor-dashboard');
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
          if (metadata.role === 'doctor') {
            setUser(user);
            navigate('/doctor-dashboard');
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
          if (metadata.role === 'doctor') {
            setUser(session.user);
            navigate('/doctor-dashboard');
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

    if (!formData.doctorId) {
      newErrors.doctorId = 'Doctor ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Demo doctor for testing
      if (formData.email === 'doctor@example.com' && formData.password === 'DoctorPass123' && formData.doctorId === 'DOC001') {
        const demoDoctor = {
          email: formData.email,
          name: 'Dr. Example',
          phone: '+91 9876543210',
          role: 'doctor',
          doctorId: formData.doctorId,
          id: 'demo-doctor-' + Math.random().toString(36).substring(2, 9)
        };
        
        localStorage.setItem('demoUser', JSON.stringify(demoDoctor));
        setUser(demoDoctor);
        
        navigate('/doctor-dashboard');
        return;
      }

      if (supabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) {
          setErrors({ submit: 'Invalid credentials or doctor ID' });
          setIsLoading(false);
        } else {
          // Store doctor role and ID in user metadata
          await supabase.auth.updateUser({
            data: { 
              role: 'doctor',
              doctorId: formData.doctorId
            }
          });
          
          setFormData({ email: '', password: '', doctorId: '' });
          setErrors({});
          
          // Set user state before navigation
          setUser(data.user);
          
          navigate('/doctor-dashboard');
        }
      } else {
        setErrors({ submit: 'Invalid credentials or doctor ID' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
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
              <h2>Welcome Back, Doctor!</h2>
            </div>
            
            <div className="user-info">
              <div className="user-avatar">👨‍⚕️</div>
              <p className="user-email">{user.email}</p>
              <p className="user-status">
                Logged in as doctor • ID: {user.doctorId || 'DOC001'}
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
            <h2>Doctor Login</h2>
            <p>Access your medical practice dashboard</p>
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

            <div className="form-group">
              <label htmlFor="doctorId">Doctor ID</label>
              <input
                type="text"
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                placeholder="Enter your doctor ID"
                className={`form-input ${errors.doctorId ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
            </div>

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
              {isLoading ? 'Signing In...' : 'Login as Doctor'}
            </button>
          </form>

          <div className="demo-accounts" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '15px', marginTop: '2rem' }}>
            <h4 style={{ color: '#333', marginBottom: '1rem', textAlign: 'center' }}>Demo Doctor Account</h4>
            <div className="demo-buttons">
              <button 
                type="button"
                onClick={() => setFormData({ email: 'doctor@example.com', password: 'DoctorPass123', doctorId: 'DOC001' })}
                className="demo-btn doctor-demo"
                style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px',
                  background: 'white',
                  color: '#8A2BE2',
                  border: '2px solid #8A2BE2',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  width: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                Demo Doctor (doctor@example.com / DOC001)
              </button>
            </div>
          </div>

          <div className="patient-login-link">
            <p>
              Are you a patient? <a href="/patient-login">Login here</a>
            </p>
          </div>

          <div className="security-note">
            <p>🔒 Your medical data is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;