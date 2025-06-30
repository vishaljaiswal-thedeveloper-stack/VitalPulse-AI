import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const { t } = useTranslation();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleVideoMouseEnter = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.volume = 0.5; // Set volume to medium (50%)
      videoElement.play();
      setIsVideoPlaying(true);
    }
  };

  const handleVideoMouseLeave = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
      setIsVideoPlaying(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">{t('welcome')}</h1>
        <p className="hero-subtitle">{t('subtitle')}</p>
        
        <div className="cta-buttons">
          <Link to="/symptoms" className="cta-btn">
            Start Health Check
          </Link>
          <Link to="/doctor-consultation" className="cta-btn secondary">
            Find Doctor
          </Link>
        </div>
      </section>

      {/* Welcome Video Section */}
      <section className="welcome-video-section">
        <div 
          className="video-container"
          onMouseEnter={handleVideoMouseEnter}
          onMouseLeave={handleVideoMouseLeave}
          style={{ 
            boxShadow: 'none', 
            border: 'none',
            margin: '0 auto'
          }}
        >
          <video 
            ref={videoRef}
            id="welcome-video"
            src="https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos//Welcome-Home%20page.mp4"
            muted={false}
            playsInline
            preload="metadata"
            className={isVideoPlaying ? "playing" : ""}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3 className="feature-title">{t('symptomsChecker')}</h3>
            <p className="feature-description">{t('symptomsDesc')}</p>
            <Link to="/symptoms">
              <button className="feature-button">
                Start Diagnosis
              </button>
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">{t('mentalHealth')}</h3>
            <p className="feature-description">{t('mentalDesc')}</p>
            <Link to="/mental-health">
              <button className="feature-button">
                Get Support
              </button>
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">{t('telemedicine')}</h3>
            <p className="feature-description">{t('telemedicineDesc')}</p>
            <Link to="/doctor-consultation">
              <button className="feature-button">
                Book Consultation
              </button>
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3 className="feature-title">{t('emergency')}</h3>
            <p className="feature-description">{t('emergencyDesc')}</p>
            <Link to="/contact">
              <button className="feature-button">
                Emergency Call
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;