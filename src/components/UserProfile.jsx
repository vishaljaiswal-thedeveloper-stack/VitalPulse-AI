import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './UserProfile.css';

function UserProfile() {
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

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
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
        <h1>My Profile</h1>
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
            <button className="menu-item active">
              <span className="menu-icon">👤</span>
              <span>Personal Information</span>
            </button>
            <button className="menu-item">
              <span className="menu-icon">🔒</span>
              <span>Security</span>
            </button>
            <button className="menu-item">
              <span className="menu-icon">📋</span>
              <span>Health Records</span>
            </button>
            <button className="menu-item">
              <span className="menu-icon">⚙️</span>
              <span>Preferences</span>
            </button>
          </div>
        </div>

        <div className="profile-content">
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
          </div>

          <div className="health-disclaimer">
            <div className="disclaimer-icon">⚠️</div>
            <p>
              This information is stored securely and will only be shared with healthcare providers during consultations. 
              Providing accurate health information helps doctors provide better care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;