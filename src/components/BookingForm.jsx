import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function BookingForm({ selectedDoctor, onBookingComplete, onBack }) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientDetails, setPatientDetails] = useState({
    patientName: '',
    age: '',
    gender: '',
    phone: '',
    symptoms: '',
    consultationType: 'video',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Time slots for appointments
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30'
  ];

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        setUser(userData);
        
        // Pre-fill user details if available
        setPatientDetails(prev => ({
          ...prev,
          patientName: userData.name || '',
          phone: userData.phone || ''
        }));
        return;
      }

      if (!isSupabaseConfigured()) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Pre-fill user details if available
        setPatientDetails(prev => ({
          ...prev,
          patientName: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || ''
        }));
      }
    };

    checkUser();

    // Listen for auth changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    // Set default date to tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    
    // Generate available slots
    generateAvailableSlots();
  }, [selectedDate]);

  const generateAvailableSlots = () => {
    // Simulate some slots being booked
    const bookedSlots = ['10:00', '14:30', '16:00', '18:30'];
    const available = timeSlots.filter(slot => !bookedSlots.includes(slot));
    setAvailableSlots(available);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !patientDetails.patientName || !patientDetails.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create appointment record
      const appointmentData = {
        user_id: user?.id || 'guest-' + Math.random().toString(36).substring(2, 9),
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        patient_name: patientDetails.patientName,
        patient_age: parseInt(patientDetails.age) || null,
        patient_gender: patientDetails.gender,
        patient_phone: patientDetails.phone,
        symptoms: patientDetails.symptoms,
        consultation_type: patientDetails.consultationType,
        urgency_level: patientDetails.urgency,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        consultation_fee: selectedDoctor.consultationFee,
        status: 'confirmed',
        language: i18n.language
      };

      if (isSupabaseConfigured() && user) {
        const { data, error } = await supabase
          .from('consultations')
          .insert({
            patient_id: user.id,
            doctor_id: selectedDoctor.id,
            time: `${selectedDate}T${selectedTime}:00`
          })
          .select()
          .single();

        if (error) throw error;
        
        console.log('✅ Appointment booked:', data);
      } else {
        // Simulate database save
        console.log('📝 Simulating appointment booking:', appointmentData);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Send confirmation (simulate)
      await sendConfirmation(appointmentData);
      
      setBookingSuccess(true);
      
      // Call completion callback after a delay
      setTimeout(() => {
        if (onBookingComplete) {
          onBookingComplete({
            ...appointmentData,
            doctor: selectedDoctor
          });
        }
      }, 3000);

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendConfirmation = async (appointmentData) => {
    // Simulate sending SMS/Email confirmation
    console.log('📧 Sending confirmation to:', appointmentData.patient_phone);
    console.log('📱 SMS: Your appointment with', appointmentData.doctor_name, 'is confirmed for', appointmentData.appointment_date, 'at', appointmentData.appointment_time);
    
    // In a real implementation, you would integrate with:
    // - SMS service (Twilio, AWS SNS)
    // - Email service (SendGrid, AWS SES)
    // - WhatsApp Business API
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
    return maxDate.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      i18n.language === 'hi' ? 'hi-IN' : 
      i18n.language === 'ta' ? 'ta-IN' : 'en-IN',
      { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
    );
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return '#dc3545';
      case 'high': return '#FF9933';
      case 'normal': return '#138808';
      default: return '#666';
    }
  };

  if (bookingSuccess) {
    return (
      <div className="booking-success">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Appointment Booked Successfully!</h2>
          <div className="booking-details">
            <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
            <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Patient:</strong> {patientDetails.patientName}</p>
            <p><strong>Type:</strong> {patientDetails.consultationType} consultation</p>
          </div>
          <div className="confirmation-message">
            <p>📱 Confirmation SMS sent to {patientDetails.phone}</p>
            <p>📧 Email confirmation sent</p>
            <p>🔔 You'll receive a reminder 30 minutes before your appointment</p>
          </div>
          <div className="success-actions">
            <button 
              className="start-consultation-btn"
              onClick={() => {
                // Navigate to consultation page
                window.location.href = '/doctor-consultation';
              }}
            >
              Start Video Consultation
            </button>
            <button 
              className="book-another-btn"
              onClick={onBack}
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form">
      <div className="booking-hero">
        <button className="back-btn" onClick={onBack}>
          ← Back to Search
        </button>
        <h1>Book Appointment</h1>
        <p>Schedule your consultation with our certified healthcare professionals</p>
      </div>

      <div className="booking-container">
        {/* Doctor Summary */}
        <div className="doctor-summary">
          <div className="doctor-summary-content">
            <img src={selectedDoctor.image} alt={selectedDoctor.name} className="doctor-image" />
            <div className="doctor-info">
              <h3>{selectedDoctor.name}</h3>
              <p className="specialty">{selectedDoctor.specialty}</p>
              <p className="hospital">🏥 {selectedDoctor.hospital}</p>
              <p className="fee">💰 ₹{selectedDoctor.consultationFee} Consultation Fee</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="booking-form-section">
          <form onSubmit={handleSubmit} className="appointment-form">
            {/* Date and Time Selection */}
            <div className="form-section">
              <h3>Select Date & Time</h3>
              
              <div className="datetime-selection">
                <div className="form-group">
                  <label htmlFor="date">Preferred Date *</label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="form-input"
                    required
                  />
                  {selectedDate && (
                    <p className="date-display">{formatDate(selectedDate)}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Available Time Slots *</label>
                  <div className="time-slots-grid">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && (
                    <p className="no-slots">No slots available for this date</p>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="form-section">
              <h3>Patient Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patientName">Patient Name *</label>
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    value={patientDetails.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient's full name"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={patientDetails.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                    className="form-input"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={patientDetails.gender}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={patientDetails.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="form-section">
              <h3>Consultation Details</h3>
              
              <div className="form-group">
                <label htmlFor="symptoms">Symptoms & Health Concerns</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={patientDetails.symptoms}
                  onChange={handleInputChange}
                  placeholder="Describe your symptoms or health concerns..."
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="consultationType">Consultation Type</label>
                  <select
                    id="consultationType"
                    name="consultationType"
                    value={patientDetails.consultationType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="video">Video Consultation</option>
                    <option value="audio">Audio Consultation</option>
                    <option value="chat">Chat Consultation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level</label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={patientDetails.urgency}
                    onChange={handleInputChange}
                    className="form-select"
                    style={{ borderColor: getUrgencyColor(patientDetails.urgency) }}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Doctor:</span>
                  <span>{selectedDoctor.name}</span>
                </div>
                <div className="summary-row">
                  <span>Date:</span>
                  <span>{selectedDate ? formatDate(selectedDate) : 'Not Selected'}</span>
                </div>
                <div className="summary-row">
                  <span>Time:</span>
                  <span>{selectedTime || 'Not Selected'}</span>
                </div>
                <div className="summary-row">
                  <span>Consultation Type:</span>
                  <span>{patientDetails.consultationType} Consultation</span>
                </div>
                <div className="summary-row total">
                  <span>Total Fee:</span>
                  <span>₹{selectedDoctor.consultationFee}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="book-btn"
                disabled={isSubmitting || !selectedDate || !selectedTime}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    📅 Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Important Notes */}
        <div className="booking-notes">
          <h3>Important Notes</h3>
          <ul>
            <li>Please join the consultation 5 minutes before your scheduled time</li>
            <li>Ensure you have a stable internet connection for video consultations</li>
            <li>Keep your medical reports and prescription history ready</li>
            <li>Consultation fees are non-refundable once the session begins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;