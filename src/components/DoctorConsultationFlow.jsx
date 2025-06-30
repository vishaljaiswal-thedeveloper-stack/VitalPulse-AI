import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DoctorSearch from './DoctorSearch';
import BookingForm from './BookingForm';
import Consultation from './Consultation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './DoctorConsultation.css';

function DoctorConsultationFlow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('search'); // search, booking, consultation
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep('booking');
  };

  const handleBookingComplete = (appointment) => {
    setAppointmentData(appointment);
    setCurrentStep('consultation');
  };

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedDoctor(null);
  };

  const handleConsultationEnd = (consultationResult) => {
    console.log('Consultation ended:', consultationResult);
    // Reset to search or show completion screen
    setCurrentStep('search');
    setSelectedDoctor(null);
    setAppointmentData(null);
    
    // Show success message
    alert('Consultation completed successfully!');
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner-large"></div>
        <p>Loading doctor consultation...</p>
      </div>
    );
  }

  return (
    <div className="doctor-consultation-flow">
      {currentStep === 'search' && (
        <DoctorSearch onDoctorSelect={handleDoctorSelect} />
      )}
      
      {currentStep === 'booking' && selectedDoctor && (
        <BookingForm 
          selectedDoctor={selectedDoctor}
          onBookingComplete={handleBookingComplete}
          onBack={handleBackToSearch}
        />
      )}
      
      {currentStep === 'consultation' && appointmentData && (
        <Consultation 
          appointmentData={appointmentData}
          onConsultationEnd={handleConsultationEnd}
        />
      )}
    </div>
  );
}

export default DoctorConsultationFlow;