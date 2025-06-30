import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './DoctorDashboard.css';

function DoctorDashboard() {
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
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    drug: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '5 days',
    instructions: 'Take after meals'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sample data for demonstration
  const sampleAppointments = [
    {
      id: 1,
      patientName: 'Rajesh Kumar',
      time: '10:00 AM',
      date: '2024-01-20',
      type: 'Video Consultation',
      status: 'Confirmed',
      symptoms: 'Chest pain, shortness of breath'
    },
    {
      id: 2,
      patientName: 'Priya Sharma',
      time: '2:30 PM',
      date: '2024-01-20',
      type: 'Audio Consultation',
      status: 'Pending',
      symptoms: 'Headache, fatigue'
    },
    {
      id: 3,
      patientName: 'Amit Patel',
      time: '4:00 PM',
      date: '2024-01-21',
      type: 'Video Consultation',
      status: 'Confirmed',
      symptoms: 'Skin rash, itching'
    }
  ];

  const samplePrescriptions = [
    {
      id: 1,
      patientName: 'Rajesh Kumar',
      drug: 'Aspirin',
      dosage: '75mg',
      frequency: 'Once daily',
      duration: '30 days',
      date: '2024-01-18',
      status: 'Minted'
    },
    {
      id: 2,
      patientName: 'Priya Sharma',
      drug: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '5 days',
      date: '2024-01-17',
      status: 'Pending'
    }
  ];

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

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'bn', label: 'Bengali' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' }
  ];

  const consultationTypeOptions = [
    'Video Call',
    'Audio Call',
    'Chat',
    'In-Person'
  ];

  const timeSlotOptions = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
  ];

  // Common drugs list for dropdown
  const commonDrugs = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Azithromycin',
    'Metformin',
    'Amlodipine',
    'Omeprazole',
    'Cetirizine',
    'Aspirin',
    'Dolo 650'
  ];

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        if (userData.role === 'doctor') {
          setUser(userData);
          loadDoctorProfile(userData);
          setAppointments(sampleAppointments);
          setPrescriptions(samplePrescriptions);
          setIsLoading(false);
        } else {
          navigate('/patient-login');
        }
        return;
      }

      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.role === 'doctor') {
        setUser(user);
        loadDoctorProfile(user);
        
        // Fetch appointments and prescriptions from Supabase
        try {
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('consultations')
            .select('*')
            .eq('doctor_id', user.id)
            .order('time', { ascending: true });
          
          if (appointmentsError) throw appointmentsError;
          
          if (appointmentsData && appointmentsData.length > 0) {
            setAppointments(appointmentsData);
          } else {
            setAppointments(sampleAppointments);
          }
          
          const { data: prescriptionsData, error: prescriptionsError } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('doctor_name', user.user_metadata?.name || user.email)
            .order('created_at', { ascending: false });
          
          if (prescriptionsError) throw prescriptionsError;
          
          if (prescriptionsData && prescriptionsData.length > 0) {
            setPrescriptions(prescriptionsData);
          } else {
            setPrescriptions(samplePrescriptions);
          }
          
        } catch (error) {
          console.error('Error fetching doctor data:', error);
          setAppointments(sampleAppointments);
          setPrescriptions(samplePrescriptions);
        }
        
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

  const handlePrescriptionChange = (field, value) => {
    setNewPrescription(prev => ({
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

  const handleCreatePrescription = async () => {
    if (!newPrescription.patientName || !newPrescription.drug) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Create new prescription
      const prescriptionData = {
        ...newPrescription,
        doctor_name: doctorProfile.name || user.name || 'Dr. Unknown',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      
      // Add to local state
      setPrescriptions(prev => [
        {
          id: Date.now(),
          patientName: prescriptionData.patientName,
          drug: prescriptionData.drug,
          dosage: prescriptionData.dosage,
          frequency: prescriptionData.frequency,
          duration: prescriptionData.duration,
          date: prescriptionData.date,
          status: prescriptionData.status
        },
        ...prev
      ]);
      
      // Reset form
      setNewPrescription({
        patientName: '',
        drug: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals'
      });
      
      setIsCreatingPrescription(false);
      alert('Prescription created successfully! You can now mint it as an NFT.');
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to create prescription. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#138808';
      case 'Pending': return '#FF9933';
      case 'Cancelled': return '#dc3545';
      case 'Minted': return '#138808';
      default: return '#666';
    }
  };

  const handleStartConsultation = (appointmentId) => {
    navigate('/doctor-consultation');
  };

  const handleMintPrescription = (prescriptionId) => {
    navigate('/prescription-mint');
  };

  if (isLoading) {
    return (
      <div className="doctor-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return (
      <div className="doctor-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This page is only accessible to doctors. Please log in with a doctor account.</p>
          <button 
            className="login-btn"
            onClick={() => navigate('/doctor-login')}
          >
            Login as Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, {doctorProfile.name || user.name || 'Doctor'}</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          💊 Prescriptions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👥 Patients
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Doctor Profile</h2>
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
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <div className="section-header">
              <h2>Upcoming Appointments</h2>
              <div className="appointment-stats">
                <span className="stat-badge">Today: {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</span>
                <span className="stat-badge">Total: {appointments.length}</span>
              </div>
            </div>

            <div className="appointments-list">
              {appointments.length > 0 ? (
                appointments.map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <h3>{appointment.patientName}</h3>
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
                      <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                    </div>
                    
                    <div className="appointment-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleStartConsultation(appointment.id)}
                      >
                        Start Consultation
                      </button>
                      <button className="action-btn secondary">Reschedule</button>
                      <button className="action-btn danger">Cancel</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-large">
                  <div className="no-data-icon">📅</div>
                  <h4>No Upcoming Appointments</h4>
                  <p>You don't have any appointments scheduled at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="prescriptions-section">
            <div className="section-header">
              <h2>Prescriptions</h2>
              <button 
                className="create-btn"
                onClick={() => setIsCreatingPrescription(!isCreatingPrescription)}
              >
                {isCreatingPrescription ? 'Cancel' : '+ New Prescription'}
              </button>
            </div>

            {isCreatingPrescription && (
              <div className="prescription-form-section">
                <h3>Create New Prescription</h3>
                <form className="prescription-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="patientName">Patient Name *</label>
                      <input
                        type="text"
                        id="patientName"
                        name="patientName"
                        value={newPrescription.patientName}
                        onChange={(e) => handlePrescriptionChange('patientName', e.target.value)}
                        placeholder="Enter patient's full name"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="drug">Medication *</label>
                      <select
                        id="drug"
                        name="drug"
                        value={newPrescription.drug}
                        onChange={(e) => handlePrescriptionChange('drug', e.target.value)}
                        className="form-select"
                        required
                      >
                        {commonDrugs.map(drug => (
                          <option key={drug} value={drug}>{drug}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dosage">Dosage</label>
                      <input
                        type="text"
                        id="dosage"
                        name="dosage"
                        value={newPrescription.dosage}
                        onChange={(e) => handlePrescriptionChange('dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="frequency">Frequency</label>
                      <input
                        type="text"
                        id="frequency"
                        name="frequency"
                        value={newPrescription.frequency}
                        onChange={(e) => handlePrescriptionChange('frequency', e.target.value)}
                        placeholder="e.g., Twice daily"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="duration">Duration</label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={newPrescription.duration}
                        onChange={(e) => handlePrescriptionChange('duration', e.target.value)}
                        placeholder="e.g., 5 days"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="instructions">Instructions</label>
                      <input
                        type="text"
                        id="instructions"
                        name="instructions"
                        value={newPrescription.instructions}
                        onChange={(e) => handlePrescriptionChange('instructions', e.target.value)}
                        placeholder="e.g., Take after meals"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      className="create-prescription-btn"
                      onClick={handleCreatePrescription}
                    >
                      Create Prescription
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="recent-prescriptions">
              <h3>Recent Prescriptions</h3>
              <div className="prescriptions-list">
                {prescriptions.length > 0 ? (
                  prescriptions.map(prescription => (
                    <div key={prescription.id} className="prescription-card">
                      <div className="prescription-header">
                        <h4>{prescription.patientName}</h4>
                        <span className="prescription-date">{prescription.date}</span>
                      </div>
                      
                      <div className="prescription-details">
                        <p><strong>Drug:</strong> {prescription.drug}</p>
                        <p><strong>Dosage:</strong> {prescription.dosage}</p>
                        <p><strong>Frequency:</strong> {prescription.frequency}</p>
                        <p><strong>Duration:</strong> {prescription.duration}</p>
                        <p><strong>Status:</strong> <span style={{ 
                          color: prescription.status === 'Minted' ? '#138808' : '#FF9933',
                          fontWeight: 'bold'
                        }}>{prescription.status}</span></p>
                      </div>
                      
                      <div className="prescription-actions">
                        <button className="action-btn primary">View Full</button>
                        {prescription.status !== 'Minted' && (
                          <button 
                            className="action-btn secondary"
                            onClick={() => handleMintPrescription(prescription.id)}
                          >
                            Mint NFT
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-large">
                    <div className="no-data-icon">💊</div>
                    <h4>No Prescriptions</h4>
                    <p>You haven't created any prescriptions yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="patients-section">
            <div className="section-header">
              <h2>Your Patients</h2>
              <div className="patient-stats">
                <span className="stat-badge">Total: {appointments.length}</span>
                <span className="stat-badge">Active: {appointments.filter(a => a.status === 'Confirmed').length}</span>
              </div>
            </div>

            <div className="patients-list">
              {appointments.length > 0 ? (
                // Create a unique list of patients from appointments
                [...new Map(appointments.map(item => [item.patientName, item])).values()].map((patient, index) => (
                  <div key={index} className="patient-card">
                    <div className="patient-header">
                      <div className="patient-avatar">
                        {patient.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-info">
                        <h3>{patient.patientName}</h3>
                        <p>Last visit: {patient.date}</p>
                      </div>
                    </div>
                    
                    <div className="patient-details">
                      <p><strong>Consultation Type:</strong> {patient.type}</p>
                      <p><strong>Symptoms:</strong> {patient.symptoms}</p>
                    </div>
                    
                    <div className="patient-actions">
                      <button className="action-btn primary">View History</button>
                      <button 
                        className="action-btn secondary"
                        onClick={() => {
                          setIsCreatingPrescription(true);
                          setNewPrescription(prev => ({
                            ...prev,
                            patientName: patient.patientName
                          }));
                          setActiveTab('prescriptions');
                        }}
                      >
                        Create Prescription
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-large">
                  <div className="no-data-icon">👥</div>
                  <h4>No Patients</h4>
                  <p>You don't have any patients yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;