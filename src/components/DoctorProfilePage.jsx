import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './UserProfile.css';

function DoctorProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState({
    name: '',
    specialty: '',
    qualifications: '',
    experience: '',
    hospital: '',
    location: '',
    consultationFee: '',
    languages: [],
    about: '',
    education: [''],
    specializations: [''],
    awards: [''],
    consultationTypes: [],
    timeSlots: [],
    profileImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Medical specialties
  const specialtyOptions = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Gynecology',
    'Orthopedics',
    'Psychiatry',
    'Neurology',
    'Oncology',
    'Endocrinology'
  ];

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'bn', label: 'Bengali' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' }
  ];

  // Consultation types
  const consultationTypeOptions = [
    'Video Call',
    'Audio Call',
    'Chat',
    'In-Person'
  ];

  // Time slots
  const timeSlotOptions = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
  ];

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        if (userData.role !== 'doctor') {
          navigate('/doctor-login');
          return;
        }
        
        setUser(userData);
        loadDoctorProfile(userData);
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
        if (metadata.role !== 'doctor') {
          navigate('/doctor-login');
          return;
        }
        
        setUser(user);
        loadDoctorProfile(user);
        setIsLoading(false);
      } else {
        navigate('/doctor-login');
      }
    };

    checkUser();
  }, [navigate]);

  const loadDoctorProfile = (userData) => {
    // Load existing profile or set defaults
    const savedProfile = localStorage.getItem(`doctorProfile_${userData.id}`);
    if (savedProfile) {
      setDoctorProfile(JSON.parse(savedProfile));
    } else {
      // Set default values for new doctor
      setDoctorProfile(prev => ({
        ...prev,
        name: userData.name || 'Dr. ' + (userData.email?.split('@')[0] || 'Doctor'),
        languages: ['en'],
        consultationTypes: ['Video Call'],
        timeSlots: ['10:00 AM', '2:00 PM', '4:00 PM']
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage for demo
      localStorage.setItem(`doctorProfile_${user.id}`, JSON.stringify(doctorProfile));
      
      // In a real app, save to Supabase
      if (isSupabaseConfigured() && user && !user.id?.startsWith('demo-')) {
        // Save to database
        console.log('Saving doctor profile to database:', doctorProfile);
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
              onClick={() => navigate('/doctor-login')}
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
        <h1>Doctor Profile</h1>
        <p>Manage your professional information and practice details</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {doctorProfile.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '👨‍⚕️'}
            </div>
            <h2>{doctorProfile.name || user.email?.split('@')[0] || 'Doctor'}</h2>
            <p className="user-email">{user.email}</p>
          </div>
          
          <div className="profile-menu">
            <button 
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="menu-icon">👤</span>
              <span>Professional Profile</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <span className="menu-icon">📅</span>
              <span>Schedule & Availability</span>
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
          {activeTab === 'profile' && (
            <>
              <div className="content-header">
                <h2>Professional Information</h2>
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
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={doctorProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Specialty *</label>
                    <select
                      value={doctorProfile.specialty}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                      disabled={!isEditing}
                      className="form-select"
                    >
                      <option value="">Select Specialty</option>
                      {specialtyOptions.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Qualifications *</label>
                    <input
                      type="text"
                      value={doctorProfile.qualifications}
                      onChange={(e) => handleInputChange('qualifications', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="MBBS, MD, DM"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Experience (Years) *</label>
                    <input
                      type="number"
                      value={doctorProfile.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hospital/Clinic *</label>
                    <input
                      type="text"
                      value={doctorProfile.hospital}
                      onChange={(e) => handleInputChange('hospital', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Apollo Hospital"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={doctorProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Mumbai, Maharashtra"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    value={doctorProfile.consultationFee}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                    placeholder="500"
                  />
                </div>

                <div className="form-group">
                  <label>About</label>
                  <textarea
                    value={doctorProfile.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    disabled={!isEditing}
                    className="form-textarea"
                    rows="4"
                    placeholder="Brief description about yourself and your practice..."
                  />
                </div>

                <div className="form-group">
                  <label>Languages</label>
                  <div className="checkbox-group">
                    {languageOptions.map(lang => (
                      <label key={lang.value} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={doctorProfile.languages.includes(lang.value)}
                          onChange={(e) => handleCheckboxChange('languages', lang.value, e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span>{lang.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Consultation Types</label>
                  <div className="checkbox-group">
                    {consultationTypeOptions.map(type => (
                      <label key={type} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={doctorProfile.consultationTypes.includes(type)}
                          onChange={(e) => handleCheckboxChange('consultationTypes', type, e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dynamic Arrays */}
                <div className="form-group">
                  <label>Education</label>
                  {doctorProfile.education.map((edu, index) => (
                    <div key={index} className="array-item">
                      <input
                        type="text"
                        value={edu}
                        onChange={(e) => handleArrayChange('education', index, e.target.value)}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="MBBS - Medical College (Year)"
                      />
                      {isEditing && (
                        <button 
                          type="button"
                          onClick={() => removeArrayItem('education', index)}
                          className="remove-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => addArrayItem('education')}
                      className="add-btn"
                    >
                      + Add Education
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Specializations</label>
                  {doctorProfile.specializations.map((spec, index) => (
                    <div key={index} className="array-item">
                      <input
                        type="text"
                        value={spec}
                        onChange={(e) => handleArrayChange('specializations', index, e.target.value)}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="Heart Surgery, Diabetes Management"
                      />
                      {isEditing && (
                        <button 
                          type="button"
                          onClick={() => removeArrayItem('specializations', index)}
                          className="remove-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => addArrayItem('specializations')}
                      className="add-btn"
                    >
                      + Add Specialization
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Awards & Recognition</label>
                  {doctorProfile.awards.map((award, index) => (
                    <div key={index} className="array-item">
                      <input
                        type="text"
                        value={award}
                        onChange={(e) => handleArrayChange('awards', index, e.target.value)}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="Best Doctor Award - Medical Association (Year)"
                      />
                      {isEditing && (
                        <button 
                          type="button"
                          onClick={() => removeArrayItem('awards', index)}
                          className="remove-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => addArrayItem('awards')}
                      className="add-btn"
                    >
                      + Add Award
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'schedule' && (
            <>
              <div className="content-header">
                <h2>Schedule & Availability</h2>
                <button 
                  className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? '💾 Save Schedule' : '✏️ Edit Schedule'}
                </button>
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Available Time Slots</label>
                  <div className="checkbox-group">
                    {timeSlotOptions.map(slot => (
                      <label key={slot} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={doctorProfile.timeSlots.includes(slot)}
                          onChange={(e) => handleCheckboxChange('timeSlots', slot, e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span>{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Working Days</label>
                  <div className="checkbox-group">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={doctorProfile.workingDays?.includes(day) || day !== 'Sunday'}
                          onChange={(e) => handleCheckboxChange('workingDays', day, e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Consultation Duration (minutes)</label>
                  <select
                    value={doctorProfile.consultationDuration || '30'}
                    onChange={(e) => handleInputChange('consultationDuration', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Break Time</label>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Start</label>
                      <select
                        value={doctorProfile.breakStart || '13:00'}
                        onChange={(e) => handleInputChange('breakStart', e.target.value)}
                        disabled={!isEditing}
                        className="form-select"
                      >
                        <option value="12:00">12:00 PM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>End</label>
                      <select
                        value={doctorProfile.breakEnd || '14:00'}
                        onChange={(e) => handleInputChange('breakEnd', e.target.value)}
                        disabled={!isEditing}
                        className="form-select"
                      >
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="14:30">2:30 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Vacation/Leave Dates</label>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {(doctorProfile.leaveDates || []).map((leave, index) => (
                      <div key={index} className="array-item">
                        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                          <input
                            type="date"
                            value={leave.start}
                            onChange={(e) => {
                              const updatedLeaves = [...(doctorProfile.leaveDates || [])];
                              updatedLeaves[index] = { ...leave, start: e.target.value };
                              handleInputChange('leaveDates', updatedLeaves);
                            }}
                            disabled={!isEditing}
                            className="form-input"
                            style={{ flex: 1 }}
                          />
                          <span style={{ alignSelf: 'center' }}>to</span>
                          <input
                            type="date"
                            value={leave.end}
                            onChange={(e) => {
                              const updatedLeaves = [...(doctorProfile.leaveDates || [])];
                              updatedLeaves[index] = { ...leave, end: e.target.value };
                              handleInputChange('leaveDates', updatedLeaves);
                            }}
                            disabled={!isEditing}
                            className="form-input"
                            style={{ flex: 1 }}
                          />
                        </div>
                        {isEditing && (
                          <button 
                            type="button"
                            onClick={() => {
                              const updatedLeaves = [...(doctorProfile.leaveDates || [])];
                              updatedLeaves.splice(index, 1);
                              handleInputChange('leaveDates', updatedLeaves);
                            }}
                            className="remove-btn"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button 
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          
                          handleInputChange('leaveDates', [
                            ...(doctorProfile.leaveDates || []),
                            { start: today, end: tomorrow.toISOString().split('T')[0] }
                          ]);
                        }}
                        className="add-btn"
                      >
                        + Add Leave Dates
                      </button>
                    )}
                  </div>
                </div>
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
                  <label>Doctor ID</label>
                  <input
                    type="text"
                    value={user.doctorId || 'DOC001'}
                    disabled={true}
                    className="form-input"
                  />
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    Your unique doctor ID is used for verification and cannot be changed.
                  </p>
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
              </div>

              <div className="health-disclaimer" style={{ background: '#e8f5e8', border: '1px solid #138808' }}>
                <div className="disclaimer-icon" style={{ color: '#138808' }}>🔒</div>
                <p style={{ color: '#155724' }}>
                  As a healthcare provider, your account security is critical. We recommend enabling two-factor authentication to protect patient data and comply with healthcare regulations.
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
                    value={doctorProfile.languagePreference || 'en'}
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
                        checked={doctorProfile.emailNotifications !== false}
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
                        checked={doctorProfile.smsNotifications !== false}
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
                        id="appointmentNotif" 
                        checked={doctorProfile.appointmentNotifications !== false}
                        onChange={(e) => handleInputChange('appointmentNotifications', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor="appointmentNotif" style={{ margin: 0 }}>Appointment Notifications</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Prescription Settings</label>
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
                        id="autoMint" 
                        checked={doctorProfile.autoMintPrescriptions !== false}
                        onChange={(e) => handleInputChange('autoMintPrescriptions', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor="autoMint" style={{ margin: 0 }}>Auto-mint prescriptions on blockchain</label>
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
                        id="digitalSignature" 
                        checked={doctorProfile.useDigitalSignature !== false}
                        onChange={(e) => handleInputChange('useDigitalSignature', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <label htmlFor="digitalSignature" style={{ margin: 0 }}>Use digital signature on prescriptions</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Default Consultation Type</label>
                  <select
                    value={doctorProfile.defaultConsultationType || 'video'}
                    onChange={(e) => handleInputChange('defaultConsultationType', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat</option>
                    <option value="in-person">In-Person</option>
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

export default DoctorProfilePage;