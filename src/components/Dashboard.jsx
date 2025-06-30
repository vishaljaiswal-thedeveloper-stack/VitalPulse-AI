import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './Dashboard.css';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [consultationsUsed, setConsultationsUsed] = useState(0);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Sample data for demonstration
  const sampleAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Priya Sharma',
      specialty: 'General Medicine',
      time: '10:00 AM',
      date: '2024-01-20',
      type: 'Video Consultation',
      status: 'Confirmed'
    },
    {
      id: 2,
      doctorName: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      time: '2:30 PM',
      date: '2024-01-25',
      type: 'Audio Consultation',
      status: 'Pending'
    }
  ];

  const sampleConsultationHistory = [
    {
      id: 1,
      doctorName: 'Dr. Meera Nair',
      specialty: 'Pediatrics',
      date: '2024-01-10',
      duration: '15 minutes',
      type: 'Video Consultation',
      notes: 'Prescribed antibiotics for throat infection'
    },
    {
      id: 2,
      doctorName: 'Dr. Amit Patel',
      specialty: 'Dermatology',
      date: '2024-01-05',
      duration: '20 minutes',
      type: 'Video Consultation',
      notes: 'Follow-up for skin condition, showing improvement'
    }
  ];

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      if (userData.role === 'doctor') {
        navigate('/doctor-dashboard');
        return;
      }
      
      setUser(userData);
      setUserPlan(userData.plan || 'free');
      
      // Set usage based on user plan
      if (userData.email === 'freeuser@example.com') {
        setConsultationsUsed(1);
        setMinutesUsed(3);
      } else if (userData.email === 'premiumuser@example.com') {
        setUserPlan('premium');
        setConsultationsUsed(5);
        setMinutesUsed(15);
      }
      
      // Load sample data
      setAppointments(sampleAppointments);
      setConsultationHistory(sampleConsultationHistory);
      setIsLoading(false);
      return;
    }

    // Check for Supabase user
    const checkUser = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user is a doctor
        const metadata = user.user_metadata || {};
        if (metadata.role === 'doctor') {
          navigate('/doctor-dashboard');
          return;
        }
        
        setUser(user);
        
        // Fetch user plan from Supabase
        try {
          const { data: userPlanData, error } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error) throw error;
          
          if (userPlanData) {
            setUserPlan(userPlanData.plan_type);
          }
          
          // Fetch usage data
          const currentDate = new Date();
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          weekStart.setHours(0, 0, 0, 0);
          
          const { data: usageData, error: usageError } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', user.id)
            .gte('week_start', weekStart.toISOString().split('T')[0])
            .single();
          
          if (usageError && usageError.code !== 'PGRST116') throw usageError;
          
          if (usageData) {
            setConsultationsUsed(usageData.sessions_count);
            setMinutesUsed(usageData.minutes_used);
          }
          
          // Fetch appointments
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('consultations')
            .select('*')
            .eq('patient_id', user.id)
            .order('time', { ascending: true });
          
          if (appointmentsError) throw appointmentsError;
          
          if (appointmentsData && appointmentsData.length > 0) {
            setAppointments(appointmentsData);
          } else {
            setAppointments(sampleAppointments);
          }
          
          // For consultation history, we'll use sample data for now
          setConsultationHistory(sampleConsultationHistory);
          
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Default to free plan if error
          setUserPlan('free');
          setAppointments(sampleAppointments);
          setConsultationHistory(sampleConsultationHistory);
        }
      }
      
      setIsLoading(false);
    };

    checkUser();

    // Listen for auth changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          if (metadata.role === 'doctor') {
            navigate('/doctor-dashboard');
          } else {
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [navigate]);

  const getRemainingConsultations = () => {
    if (userPlan === 'premium') return '∞';
    return Math.max(0, 2 - consultationsUsed);
  };

  const getRemainingMinutes = () => {
    if (userPlan === 'premium') return '∞';
    return Math.max(0, 5 - minutesUsed);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#138808';
      case 'Pending': return '#FF9933';
      case 'Cancelled': return '#dc3545';
      default: return '#666';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="login-required">
          <div className="login-card">
            <div className="login-icon">🔒</div>
            <h2>Login Required</h2>
            <p>Please log in to access your dashboard and health records.</p>
            <button 
              className="login-btn"
              onClick={() => navigate('/patient-login')}
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to VitalPulse</h1>
        <p>Your personal healthcare dashboard</p>
        
        <div className="plan-info">
          <div className="plan-stat">
            <div className="plan-stat-value">{userPlan === 'premium' ? 'Premium' : 'Free'}</div>
            <div className="plan-stat-label">Current Plan</div>
          </div>
          <div className="plan-stat">
            <div className="plan-stat-value">{consultationsUsed}</div>
            <div className="plan-stat-label">Consultations Used</div>
          </div>
          <div className="plan-stat">
            <div className="plan-stat-value">{getRemainingConsultations()}</div>
            <div className="plan-stat-label">Remaining</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📝 Consultation History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 My Profile
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="usage-tracker">
              <h3>Weekly Usage</h3>
              <div className="usage-info">
                <span>Consultations: {consultationsUsed}/{userPlan === 'premium' ? '∞' : '2'}</span>
                <span>Remaining: {getRemainingConsultations()}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ width: userPlan === 'premium' ? '100%' : `${(consultationsUsed / 2) * 100}%` }}
                ></div>
              </div>
              
              <div className="usage-info" style={{ marginTop: '1rem' }}>
                <span>Minutes Used: {minutesUsed}/{userPlan === 'premium' ? '∞' : '5'}</span>
                <span>Remaining: {getRemainingMinutes()}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ width: userPlan === 'premium' ? '100%' : `${(minutesUsed / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => navigate('/doctor-consultation')}>
                  👨‍⚕️ Find Doctor
                </button>
                <button className="action-btn" onClick={() => navigate('/symptoms')}>
                  🩺 Check Symptoms
                </button>
                <button className="action-btn" onClick={() => navigate('/mental-health')}>
                  🧠 Mental Health
                </button>
                <button className="action-btn" onClick={() => navigate('/mythbuster')}>
                  📚 Health Myths
                </button>
              </div>
            </div>

            <div className="upcoming-appointments">
              <div className="section-header">
                <h3>Upcoming Appointments</h3>
                <button className="view-all-btn" onClick={() => setActiveTab('appointments')}>
                  View All
                </button>
              </div>
              
              <div className="appointments-preview">
                {appointments.length > 0 ? (
                  appointments.slice(0, 2).map(appointment => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-header">
                        <h4>{appointment.doctorName}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-details">
                        <p><strong>Date:</strong> {appointment.date}</p>
                        <p><strong>Time:</strong> {appointment.time}</p>
                        <p><strong>Type:</strong> {appointment.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No upcoming appointments</p>
                    <button 
                      className="book-now-btn"
                      onClick={() => navigate('/doctor-consultation')}
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <div className="section-header">
              <h3>Your Appointments</h3>
              <button 
                className="book-appointment-btn"
                onClick={() => navigate('/doctor-consultation')}
              >
                + Book New Appointment
              </button>
            </div>
            
            <div className="appointments-list">
              {appointments.length > 0 ? (
                appointments.map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <h4>{appointment.doctorName}</h4>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <p><strong>Specialty:</strong> {appointment.specialty}</p>
                      <p><strong>Date:</strong> {appointment.date}</p>
                      <p><strong>Time:</strong> {appointment.time}</p>
                      <p><strong>Type:</strong> {appointment.type}</p>
                    </div>
                    <div className="appointment-actions">
                      <button className="action-btn primary">Join Consultation</button>
                      <button className="action-btn secondary">Reschedule</button>
                      <button className="action-btn danger">Cancel</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-large">
                  <div className="no-data-icon">📅</div>
                  <h4>No Appointments Scheduled</h4>
                  <p>You don't have any upcoming appointments. Book a consultation with one of our doctors.</p>
                  <button 
                    className="book-now-btn"
                    onClick={() => navigate('/doctor-consultation')}
                  >
                    Find a Doctor
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="section-header">
              <h3>Consultation History</h3>
            </div>
            
            <div className="history-list">
              {consultationHistory.length > 0 ? (
                consultationHistory.map(consultation => (
                  <div key={consultation.id} className="history-card">
                    <div className="history-header">
                      <h4>{consultation.doctorName}</h4>
                      <span className="history-date">{consultation.date}</span>
                    </div>
                    <div className="history-details">
                      <p><strong>Specialty:</strong> {consultation.specialty}</p>
                      <p><strong>Duration:</strong> {consultation.duration}</p>
                      <p><strong>Type:</strong> {consultation.type}</p>
                      <p><strong>Notes:</strong> {consultation.notes}</p>
                    </div>
                    <div className="history-actions">
                      <button className="action-btn primary">View Details</button>
                      <button className="action-btn secondary">Download Report</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-large">
                  <div className="no-data-icon">📝</div>
                  <h4>No Consultation History</h4>
                  <p>You haven't had any consultations yet. Book your first appointment with one of our doctors.</p>
                  <button 
                    className="book-now-btn"
                    onClick={() => navigate('/doctor-consultation')}
                  >
                    Book Consultation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h3>My Profile</h3>
              <button className="edit-profile-btn">
                Edit Profile
              </button>
            </div>
            
            <div className="profile-details">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {user.email?.charAt(0).toUpperCase() || '👤'}
                </div>
              </div>
              
              <div className="profile-info">
                <div className="info-row">
                  <div className="info-label">Name</div>
                  <div className="info-value">{user.name || user.email?.split('@')[0] || 'User'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Email</div>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Plan</div>
                  <div className="info-value plan-badge">
                    {userPlan === 'premium' ? 'Premium' : 'Free'}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'January 2024'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                className="upgrade-btn"
                onClick={() => navigate('/pricing')}
                disabled={userPlan === 'premium'}
              >
                {userPlan === 'premium' ? 'Premium Plan Active' : 'Upgrade to Premium'}
              </button>
              <button className="change-password-btn">
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;