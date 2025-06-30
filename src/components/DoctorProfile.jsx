import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './DoctorProfile.css';

function DoctorProfile({ doctorId, onClose }) {
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileRef = useRef(null);

  // Sample doctor data with detailed profiles
  const doctorProfiles = {
    'dr1': {
      id: 'dr1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Medicine',
      location: 'Mumbai',
      experience: 12,
      rating: 4.8,
      consultationFee: 500,
      languages: ['English', 'Hindi'],
      availability: 'Available Today',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD (Internal Medicine)',
      hospital: 'Apollo Hospital Mumbai',
      about: 'Dr. Priya Sharma is a dedicated general physician with over 12 years of experience in treating a wide range of medical conditions. She specializes in preventive care, chronic disease management, and patient education.',
      education: [
        'MBBS - King Edward Memorial Hospital, Mumbai (2010)',
        'MD Internal Medicine - All India Institute of Medical Sciences, Delhi (2013)',
        'Fellowship in Preventive Medicine - Johns Hopkins University (2015)'
      ],
      specializations: [
        'Diabetes Management',
        'Hypertension Treatment',
        'Preventive Healthcare',
        'Women\'s Health',
        'Geriatric Care'
      ],
      awards: [
        'Best Young Doctor Award - Indian Medical Association (2018)',
        'Excellence in Patient Care - Apollo Hospitals (2020)',
        'Community Health Champion - Mumbai Medical Council (2022)'
      ],
      consultationTypes: ['Video Call', 'Audio Call', 'Chat'],
      timeSlots: ['9:00 AM', '10:30 AM', '2:00 PM', '4:30 PM', '6:00 PM'],
      reviews: [
        {
          patient: 'Rajesh K.',
          rating: 5,
          comment: 'Very caring and knowledgeable doctor. Explained everything clearly.',
          date: '2024-01-15'
        },
        {
          patient: 'Meera S.',
          rating: 5,
          comment: 'Excellent consultation. Dr. Sharma is very patient and thorough.',
          date: '2024-01-10'
        }
      ]
    },
    'dr2': {
      id: 'dr2',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      location: 'Delhi',
      experience: 18,
      rating: 4.9,
      consultationFee: 800,
      languages: ['English', 'Hindi'],
      availability: 'Available Tomorrow',
      image: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD, DM (Cardiology)',
      hospital: 'AIIMS Delhi',
      about: 'Dr. Rajesh Kumar is a renowned cardiologist with extensive experience in interventional cardiology and heart disease prevention. He has performed over 5000 cardiac procedures.',
      education: [
        'MBBS - All India Institute of Medical Sciences, Delhi (2004)',
        'MD Internal Medicine - AIIMS Delhi (2007)',
        'DM Cardiology - AIIMS Delhi (2010)',
        'Fellowship in Interventional Cardiology - Harvard Medical School (2012)'
      ],
      specializations: [
        'Interventional Cardiology',
        'Heart Attack Treatment',
        'Angioplasty',
        'Cardiac Catheterization',
        'Heart Failure Management'
      ],
      awards: [
        'Padma Shri Award for Medical Excellence (2020)',
        'Best Cardiologist - Delhi Medical Association (2019)',
        'Research Excellence Award - Indian Heart Association (2021)'
      ],
      consultationTypes: ['Video Call', 'In-Person'],
      timeSlots: ['10:00 AM', '11:30 AM', '3:00 PM', '5:00 PM'],
      reviews: [
        {
          patient: 'Amit P.',
          rating: 5,
          comment: 'Dr. Kumar saved my life. Excellent surgeon and very compassionate.',
          date: '2024-01-12'
        },
        {
          patient: 'Sunita M.',
          rating: 5,
          comment: 'World-class treatment. Highly recommend for heart problems.',
          date: '2024-01-08'
        }
      ]
    },
    'dr3': {
      id: 'dr3',
      name: 'Dr. Meera Nair',
      specialty: 'Pediatrics',
      location: 'Bangalore',
      experience: 10,
      rating: 4.7,
      consultationFee: 600,
      languages: ['English', 'Tamil'],
      availability: 'Available Now',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300',
      qualifications: 'MBBS, MD (Pediatrics)',
      hospital: 'Manipal Hospital Bangalore',
      about: 'Dr. Meera Nair is a compassionate pediatrician who specializes in child development, vaccination, and treating common childhood illnesses. She is known for her gentle approach with children.',
      education: [
        'MBBS - Christian Medical College, Vellore (2012)',
        'MD Pediatrics - Manipal University (2015)',
        'Fellowship in Pediatric Nutrition - Boston Children\'s Hospital (2017)'
      ],
      specializations: [
        'Child Development',
        'Vaccination Programs',
        'Pediatric Nutrition',
        'Newborn Care',
        'Childhood Infections'
      ],
      awards: [
        'Best Pediatrician - Bangalore Medical Council (2021)',
        'Child Care Excellence Award - Manipal Hospitals (2020)',
        'Community Health Service Award (2022)'
      ],
      consultationTypes: ['Video Call', 'Audio Call', 'Chat', 'In-Person'],
      timeSlots: ['9:30 AM', '11:00 AM', '2:30 PM', '4:00 PM', '5:30 PM'],
      reviews: [
        {
          patient: 'Priya R.',
          rating: 5,
          comment: 'My daughter loves Dr. Meera. Very patient and caring with children.',
          date: '2024-01-14'
        },
        {
          patient: 'Karthik S.',
          rating: 4,
          comment: 'Good doctor, explained everything about my son\'s condition clearly.',
          date: '2024-01-11'
        }
      ]
    }
  };

  useEffect(() => {
    if (doctorId && doctorProfiles[doctorId]) {
      setDoctor(doctorProfiles[doctorId]);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [doctorId]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">⭐</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">⭐</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="doctor-profile-modal">
        <div className="profile-content" ref={profileRef}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-profile-modal">
        <div className="profile-content" ref={profileRef}>
          <div className="profile-header">
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="error-state">
            <h3>Doctor Profile Not Found</h3>
            <p>Sorry, we couldn't find the doctor's profile information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-modal">
      <div className="profile-content" ref={profileRef}>
        <div className="profile-header">
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="profile-main">
          {/* Doctor Basic Info */}
          <div className="doctor-basic-info">
            <div className="doctor-image-section">
              <img src={doctor.image} alt={doctor.name} className="doctor-profile-image" />
              <div className="availability-status" style={{ 
                backgroundColor: doctor.availability.includes('Now') ? '#138808' : '#FF9933' 
              }}>
                {doctor.availability}
              </div>
            </div>
            
            <div className="doctor-details">
              <h2>{doctor.name}</h2>
              <p className="specialty">{doctor.specialty}</p>
              <p className="qualifications">{doctor.qualifications}</p>
              <p className="hospital">🏥 {doctor.hospital}</p>
              <p className="location">📍 {doctor.location}</p>
              
              <div className="rating-section">
                <div className="rating-display">
                  {renderStars(doctor.rating)}
                  <span className="rating-number">({doctor.rating})</span>
                </div>
                <p className="experience">{doctor.experience} years experience</p>
              </div>
              
              <div className="consultation-fee">
                <span className="fee-label">Consultation Fee:</span>
                <span className="fee-amount">₹{doctor.consultationFee}</span>
              </div>
              
              <div className="languages">
                <span className="languages-label">Languages:</span>
                <div className="language-tags">
                  {doctor.languages.map(lang => (
                    <span key={lang} className="language-tag">{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="profile-section">
            <h3>About Dr. {doctor.name.split(' ')[1]}</h3>
            <p>{doctor.about}</p>
          </div>

          {/* Education Section */}
          <div className="profile-section">
            <h3>Education & Training</h3>
            <ul className="education-list">
              {doctor.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
          </div>

          {/* Specializations */}
          <div className="profile-section">
            <h3>Specializations</h3>
            <div className="specializations-grid">
              {doctor.specializations.map((spec, index) => (
                <span key={index} className="specialization-tag">{spec}</span>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="profile-section">
            <h3>Awards & Recognition</h3>
            <ul className="awards-list">
              {doctor.awards.map((award, index) => (
                <li key={index}>🏆 {award}</li>
              ))}
            </ul>
          </div>

          {/* Consultation Options */}
          <div className="profile-section">
            <h3>Consultation Options</h3>
            <div className="consultation-options">
              {doctor.consultationTypes.map((type, index) => (
                <span key={index} className="consultation-type">{type}</span>
              ))}
            </div>
          </div>

          {/* Available Time Slots */}
          <div className="profile-section">
            <h3>Available Time Slots Today</h3>
            <div className="time-slots">
              {doctor.timeSlots.map((slot, index) => (
                <span key={index} className="time-slot">{slot}</span>
              ))}
            </div>
          </div>

          {/* Patient Reviews */}
          <div className="profile-section">
            <h3>Patient Reviews</h3>
            <div className="reviews-list">
              {doctor.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <span className="patient-name">{review.patient}</span>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="book-appointment-btn">
              📅 Book Appointment
            </button>
            <button className="start-consultation-btn">
              💬 Start Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;