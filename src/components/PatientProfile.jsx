import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './UserProfile.css';

function PatientProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        if (userData.role !== 'patient') {
          navigate('/doctor-login');
          return;
        }
        
        setUser(userData);
        
        // Set profile data
        setUserProfile(prev => ({
          ...prev,
          name: userData.name || userData.email?.split('@')[0] || 'User',
          phone: userData.phone || '+91 9876543210'
        }));
        
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata || {};
        if (metadata.role !== 'patient') {
          navigate('/doctor-login');
          return;
        }
        
        setUser(user);
        
        // Load profile data from Supabase
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          
          if (data) {
            setUserProfile(data);
          } else {
            // Set defaults from user metadata
            setUserProfile(prev => ({
              ...prev,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              phone: user.user_metadata?.phone || ''
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Set defaults from user metadata
          setUserProfile(prev => ({
            ...prev,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            phone: user.user_metadata?.phone || ''
          }));
        }
        
        setIsLoading(false);
      } else {
        navigate('/patient-login');
      }
    };

    checkUser();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // For demo users, save to localStorage
      if (user.id?.startsWith('demo-')) {
        const demoUser = JSON.parse(localStorage.getItem('demoUser'));
        if (demoUser) {
          demoUser.name = userProfile.name;
          demoUser.phone = userProfile.phone;
          localStorage.setItem('demoUser', JSON.stringify(demoUser));
        }
      } else if (isSupabaseConfigured()) {
        // Save to Supabase
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            ...userProfile
          });
        
        if (error) throw error;
        
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            name: userProfile.name,
            phone: userProfile.phone
          }
        });
      }
      
      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="user-profile">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="login-required">
          <div className="login-card">
            <div className="login-icon">🔒</div>
            <h2>Login Required</h2>
            <p>Please log in to access your profile.</p>
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
    <div className="user-profile">
      <div className="profile-header">
        <h1>Patient Profile</h1>
        <p>Manage your personal information and health details</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {userProfile.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '👤'}
            </div>
            <h2>{userProfile.name || user.email?.split('@')[0] || 'User'}</h2>
            <p className="user-email">{user.email}</p>
          </div>
          
          <div className="profile-menu">
            <button 
              className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <span className="menu-icon">👤</span>
              <span>Personal Information</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'medical' ? 'active' : ''}`}
              onClick={() => setActiveTab('medical')}
            >
              <span className="menu-icon">🏥</span>
              <span>Medical History</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="menu-icon">🔒</span>
              <span>Security</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <span className="menu-icon">⚙️</span>
              <span>Preferences</span>
            </button>
          </div>
        </div>

        <div className="profile-content">
          {activeTab === 'personal' && (
            <>
              <div className="content-header">
                <h2>Personal Information</h2>
                <button 
                  className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? '💾 Save Profile' : '✏️ Edit Profile'}
                </button>
              </div>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Your age"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={userProfile.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={userProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="3"
                    placeholder="Your full address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Emergency Contact</label>
                    <input
                      type="tel"
                      value={userProfile.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Emergency contact number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      value={userProfile.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      disabled={!isEditing}
                      className="form-select"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'medical' && (
            <>
              <div className="content-header">
                <h2>Medical History</h2>
                <button 
                  className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? '💾 Save Information' : '✏️ Edit Information'}
                </button>
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Allergies</label>
                  <textarea
                    value={userProfile.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="2"
                    placeholder="List any allergies (e.g., penicillin, peanuts)"
                  />
                </div>

                <div className="form-group">
                  <label>Chronic Conditions</label>
                  <textarea
                    value={userProfile.chronicConditions}
                    onChange={(e) => handleInputChange('chronicConditions', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="2"
                    placeholder="List any chronic conditions (e.g., diabetes, hypertension)"
                  />
                </div>

                <div className="form-group">
                  <label>Current Medications</label>
                  <textarea
                    value={userProfile.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="2"
                    placeholder="List any medications you're currently taking"
                  />
                </div>

                <div className="form-group">
                  <label>Past Surgeries</label>
                  <textarea
                    value={userProfile.pastSurgeries}
                    onChange={(e) => handleInputChange('pastSurgeries', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="2"
                    placeholder="List any past surgeries with dates"
                  />
                </div>

                <div className="form-group">
                  <label>Family Medical History</label>
                  <textarea
                    value={userProfile.familyHistory}
                    onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="2"
                    placeholder="List any relevant family medical history"
                  />
                </div>
              </div>

              <div className="health-disclaimer">
                <div className="disclaimer-icon">⚠️</div>
                <p>
                  This information is stored securely and will only be shared with healthcare providers during consultations. 
                  Providing accurate health information helps doctors provide better care.
                </p>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div className="content-header">
                <h2>Security Settings</h2>
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled={true}
                    className="form-input"
                  />
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    Your email address is used for login and important notifications.
                  </p>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="password"
                      value="••••••••"
                      disabled={true}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button 
                      className="edit-btn edit"
                      style={{ padding: '0.8rem 1rem' }}
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Two-Factor Authentication</label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>✕</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600' }}>Not Enabled</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                        Enable two-factor authentication for additional security.
                      </p>
                    </div>
                    <button 
                      className="edit-btn"
                      style={{ marginLeft: 'auto', padding: '0.8rem 1rem' }}
                    >
                      Enable
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Login History</label>
                  <div style={{ 
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      <span>Today, 10:45 AM</span>
                      <span>Mumbai, India</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      <span>Yesterday, 6:30 PM</span>
                      <span>Mumbai, India</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '0.5rem 0'
                    }}>
                      <span>Jan 15, 2024, 9:15 AM</span>
                      <span>Mumbai, India</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="health-disclaimer" style={{ background: '#e8f5e8', border: '1px solid #138808' }}>
                <div className="disclaimer-icon" style={{ color: '#138808' }}>🔒</div>
                <p style={{ color: '#155724' }}>
                  Your account is protected with industry-standard security measures. We recommend enabling two-factor authentication for additional security.
                </p>
              </div>
            </>
          )}

          {activeTab === 'preferences' && (
            <>
              <div className="content-header">
                <h2>Preferences</h2>
                <button 
                  className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? '💾 Save Preferences' : '✏️ Edit Preferences'}
                </button>
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Language Preference</label>
                  <select
                    value={userProfile.languagePreference || 'en'}
                    onChange={(e) => handleInputChange('languagePreference', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notification Preferences</label>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <input 
                        type="checkbox" 
                        id="emailNotif" 
                        checked={userProfile.emailNotifications !== false}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor="emailNotif" style={{ margin: 0 }}>Email Notifications</label>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <input 
                        type="checkbox" 
                        id="smsNotif" 
                        checked={userProfile.smsNotifications !== false}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor="smsNotif" style={{ margin: 0 }}>SMS Notifications</label>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <input 
                        type="checkbox" 
                        id="reminderNotif" 
                        checked={userProfile.appointmentReminders !== false}
                        onChange={(e) => handleInputChange('appointmentReminders', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor="reminderNotif" style={{ margin: 0 }}>Appointment Reminders</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Zone</label>
                  <select
                    value={userProfile.timeZone || 'Asia/Kolkata'}
                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="Asia/Kolkata">India (GMT+5:30)</option>
                    <option value="Asia/Dubai">Dubai (GMT+4:00)</option>
                    <option value="Europe/London">London (GMT+0:00)</option>
                    <option value="America/New_York">New York (GMT-5:00)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8:00)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Consultation Preferences</label>
                  <select
                    value={userProfile.preferredConsultationType || 'video'}
                    onChange={(e) => handleInputChange('preferredConsultationType', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="video">Video Call (Preferred)</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat Only</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;