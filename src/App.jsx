import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import PatientLogin from './components/PatientLogin';
import DoctorLogin from './components/DoctorLogin';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import UserProfile from './components/UserProfile';
import PatientProfile from './components/PatientProfile';
import DoctorProfilePage from './components/DoctorProfilePage';
import SymptomsChecker from './components/SymptomsChecker';
import MentalIssueSolution from './components/MentalIssueSolution';
import DoctorConsultationFlow from './components/DoctorConsultationFlow';
import PrescriptionMint from './components/PrescriptionMint';
import MythBuster from './components/MythBuster';
import Price from './components/Price';
import Contact from './components/Contact';
import AboutUs from './components/AboutUs';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import './i18n';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setLoading(false);
      return;
    }

    // Then check Supabase user
    if (isSupabaseConfigured()) {
      const checkUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          setLoading(false);
        } catch (error) {
          console.error('Error checking user:', error);
          setLoading(false);
        }
      };
      checkUser();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #FF9933 0%, #138808 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading VitalPulse...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation changeLanguage={changeLanguage} />
        <main className="main-content">
          <Routes>
            {/* Public routes - no login required */}
            <Route path="/" element={<Home />} />
            <Route path="/patient-login" element={<PatientLogin />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/pricing" element={<Price />} />
            <Route path="/mythbuster" element={<MythBuster />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/symptoms" element={<SymptomsChecker />} />
            <Route path="/mental-health" element={<MentalIssueSolution />} />
            <Route path="/doctor-consultation" element={<DoctorConsultationFlow />} />
            
            {/* Protected routes - login required */}
            <Route path="/dashboard" element={
              user && user.role !== 'doctor' ? <Dashboard /> : <Navigate to="/patient-login" replace />
            } />
            <Route path="/doctor-dashboard" element={
              user && user.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/doctor-login" replace />
            } />
            <Route path="/profile" element={
              user ? (
                user.role === 'doctor' ? <DoctorProfilePage /> : <PatientProfile />
              ) : <Navigate to="/patient-login" replace />
            } />
            <Route path="/user-profile" element={
              user ? <UserProfile /> : <Navigate to="/patient-login" replace />
            } />
            <Route path="/doctor-profile" element={
              user && user.role === 'doctor' ? <DoctorProfilePage /> : <Navigate to="/doctor-login" replace />
            } />
            <Route path="/prescription-mint" element={<PrescriptionMint />} />
            
            {/* Redirect all other routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;