import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import DoctorProfile from './DoctorProfile';
import './DoctorConsultation.css';

function DoctorSearch({ onDoctorSelect }) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Medical specialties with translations
  const specialties = {
    all: {
      en: 'All Specialties',
      hi: 'सभी विशेषताएं',
      ta: 'அனைத்து சிறப்புகள்'
    },
    general: {
      en: 'General Medicine',
      hi: 'सामान्य चिकित्सा',
      ta: 'பொது மருத்துவம்'
    },
    cardiology: {
      en: 'Cardiology',
      hi: 'हृदय रोग विशेषज्ञ',
      ta: 'இதய மருத்துவம்'
    },
    dermatology: {
      en: 'Dermatology',
      hi: 'त्वचा रोग विशेषज्ञ',
      ta: 'தோல் மருத்துவம்'
    },
    pediatrics: {
      en: 'Pediatrics',
      hi: 'बाल रोग विशेषज्ञ',
      ta: 'குழந்தை மருத்துவம்'
    },
    gynecology: {
      en: 'Gynecology',
      hi: 'स्त्री रोग विशेषज्ञ',
      ta: 'பெண்கள் மருத்துவம்'
    },
    orthopedics: {
      en: 'Orthopedics',
      hi: 'हड्डी रोग विशेषज्ञ',
      ta: 'எலும்பு மருத்துவம்'
    },
    psychiatry: {
      en: 'Psychiatry',
      hi: 'मानसिक रोग विशेषज्ञ',
      ta: 'மன மருத்துவம்'
    }
  };

  // Indian cities/regions
  const locations = {
    all: {
      en: 'All Locations',
      hi: 'सभी स्थान',
      ta: 'அனைத்து இடங்கள்'
    },
    mumbai: {
      en: 'Mumbai',
      hi: 'मुंबई',
      ta: 'மும்பை'
    },
    delhi: {
      en: 'Delhi',
      hi: 'दिल्ली',
      ta: 'டெல்லி'
    },
    bangalore: {
      en: 'Bangalore',
      hi: 'बैंगलोर',
      ta: 'பெங்களூர்'
    },
    chennai: {
      en: 'Chennai',
      hi: 'चेन्नई',
      ta: 'சென்னை'
    },
    kolkata: {
      en: 'Kolkata',
      hi: 'कोलकाता',
      ta: 'கொல்கத்தா'
    },
    hyderabad: {
      en: 'Hyderabad',
      hi: 'हैदराबाद',
      ta: 'ஹைதராபாத்'
    },
    pune: {
      en: 'Pune',
      hi: 'पुणे',
      ta: 'புனே'
    }
  };

  // Sample doctors data
  const sampleDoctors = [
    {
      id: 'dr1',
      name: 'Dr. Priya Sharma',
      specialty: 'general',
      location: 'mumbai',
      experience: 12,
      rating: 4.8,
      consultationFee: 500,
      languages: ['en', 'hi'],
      availability: 'Available Today',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD (Internal Medicine)',
      hospital: 'Apollo Hospital Mumbai'
    },
    {
      id: 'dr2',
      name: 'Dr. Rajesh Kumar',
      specialty: 'cardiology',
      location: 'delhi',
      experience: 18,
      rating: 4.9,
      consultationFee: 800,
      languages: ['en', 'hi'],
      availability: 'Available Tomorrow',
      image: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD, DM (Cardiology)',
      hospital: 'AIIMS Delhi'
    },
    {
      id: 'dr3',
      name: 'Dr. Meera Nair',
      specialty: 'pediatrics',
      location: 'bangalore',
      experience: 10,
      rating: 4.7,
      consultationFee: 600,
      languages: ['en', 'ta'],
      availability: 'Available Now',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD (Pediatrics)',
      hospital: 'Manipal Hospital Bangalore'
    },
    {
      id: 'dr4',
      name: 'Dr. Arjun Reddy',
      specialty: 'dermatology',
      location: 'hyderabad',
      experience: 8,
      rating: 4.6,
      consultationFee: 450,
      languages: ['en', 'hi', 'ta'],
      availability: 'Available Today',
      image: 'https://images.pexels.com/photos/6749777/pexels-photo-6749777.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD (Dermatology)',
      hospital: 'Care Hospital Hyderabad'
    },
    {
      id: 'dr5',
      name: 'Dr. Kavitha Menon',
      specialty: 'gynecology',
      location: 'chennai',
      experience: 15,
      rating: 4.8,
      consultationFee: 700,
      languages: ['en', 'ta'],
      availability: 'Available Tomorrow',
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MS (Obstetrics & Gynecology)',
      hospital: 'Apollo Hospital Chennai'
    },
    {
      id: 'dr6',
      name: 'Dr. Amit Patel',
      specialty: 'orthopedics',
      location: 'pune',
      experience: 20,
      rating: 4.9,
      consultationFee: 900,
      languages: ['en', 'hi'],
      availability: 'Available Now',
      image: 'https://images.pexels.com/photos/6749773/pexels-photo-6749773.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MS (Orthopedics)',
      hospital: 'Ruby Hall Clinic Pune'
    }
  ];

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      if (!isSupabaseConfigured()) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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
    searchDoctors();
  }, [selectedSpecialty, selectedLocation, i18n.language]);

  const searchDoctors = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredDoctors = sampleDoctors;
      
      // Filter by specialty
      if (selectedSpecialty !== 'all') {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.specialty === selectedSpecialty);
      }
      
      // Filter by location
      if (selectedLocation !== 'all') {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.location === selectedLocation);
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          specialties[doctor.specialty]?.[i18n.language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setDoctors(filteredDoctors);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDoctors();
  };

  const handleViewProfile = (doctorId) => {
    setSelectedDoctorId(doctorId);
  };

  const closeProfile = () => {
    setSelectedDoctorId(null);
  };

  const getAvailabilityColor = (availability) => {
    if (availability.includes('Now')) return '#138808';
    if (availability.includes('Today')) return '#FF9933';
    return '#666';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">⭐</span>);
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="doctor-search">
      <div className="search-container">
        {/* Search Form */}
        <div className="search-form-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by doctor name, specialty, or hospital..."
                  className="search-input"
                />
                <button type="submit" className="search-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    '🔍'
                  )}
                </button>
              </div>
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <label htmlFor="specialty">Specialty:</label>
                <select
                  id="specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(specialties).map(([key, translations]) => (
                    <option key={key} value={key}>
                      {translations[i18n.language]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="location">Location:</label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(locations).map(([key, translations]) => (
                    <option key={key} value={key}>
                      {translations[i18n.language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        <div className="search-results">
          <div className="results-header">
            <h2>Available Doctors</h2>
            <div className="results-count">
              {isLoading ? 'Searching...' : `${doctors.length} doctors found`}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner-large"></div>
              <p>Searching for doctors...</p>
            </div>
          ) : (
            <div className="doctors-list">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-header">
                    <div className="doctor-image">
                      <img src={doctor.image} alt={doctor.name} />
                      <div 
                        className="availability-badge"
                        style={{ backgroundColor: getAvailabilityColor(doctor.availability) }}
                      >
                        {doctor.availability}
                      </div>
                    </div>
                    
                    <div className="doctor-info">
                      <h3 className="doctor-name">{doctor.name}</h3>
                      <p className="doctor-specialty">
                        {specialties[doctor.specialty]?.[i18n.language]}
                      </p>
                      <p className="doctor-qualifications">{doctor.qualifications}</p>
                      <p className="doctor-hospital">🏥 {doctor.hospital}</p>
                    </div>
                  </div>

                  <div className="doctor-details">
                    <div className="detail-row">
                      <span className="detail-label">Experience:</span>
                      <span className="detail-value">{doctor.experience} years</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Rating:</span>
                      <div className="rating-display">
                        {renderStars(doctor.rating)}
                        <span className="rating-number">({doctor.rating})</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Consultation Fee:</span>
                      <span className="detail-value fee">₹{doctor.consultationFee}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Languages:</span>
                      <div className="languages-list">
                        {doctor.languages.map(lang => (
                          <span key={lang} className="language-badge">
                            {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'தமிழ்'}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        📍 {locations[doctor.location]?.[i18n.language]}
                      </span>
                    </div>
                  </div>

                  <div className="doctor-actions">
                    <button 
                      className="book-appointment-btn"
                      onClick={() => onDoctorSelect && onDoctorSelect(doctor)}
                    >
                      📅 Book Appointment
                    </button>
                    
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(doctor.id)}
                    >
                      👤 View Profile
                    </button>
                  </div>
                </div>
              ))}

              {doctors.length === 0 && !isLoading && (
                <div className="no-doctors">
                  <div className="no-doctors-icon">🔍</div>
                  <h3>No Doctors Found</h3>
                  <p>Try adjusting your search criteria or filters to find more doctors.</p>
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSelectedSpecialty('all');
                      setSelectedLocation('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctorId && (
        <DoctorProfile 
          doctorId={selectedDoctorId} 
          onClose={closeProfile}
        />
      )}
    </div>
  );
}

export default DoctorSearch;