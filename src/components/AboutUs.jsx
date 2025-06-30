import { useTranslation } from 'react-i18next';

function AboutUs() {
  const { t } = useTranslation();

  return (
    <div className="about">
      <div className="about-hero">
        <h1>VitalPulse</h1>
        <p>Healthcare for Rural India - Connecting 900 Million Lives</p>
      </div>

      <div className="section">
        <h2>Our Mission</h2>
        <p>To provide accessible, affordable healthcare to 900 million rural Indians through AI-powered telemedicine solutions.</p>
        <p>
          We believe that every Indian, regardless of their location, deserves access to quality healthcare. 
          Our platform bridges the gap between urban medical expertise and rural healthcare needs through 
          cutting-edge AI technology and telemedicine solutions.
        </p>
      </div>

      <div className="section">
        <h2>Built with Bolt.ai</h2>
        <p>This platform is powered by advanced AI technology from Bolt.ai, enabling seamless healthcare delivery to remote areas.</p>
        <p>
          By leveraging Bolt.ai's capabilities, we've created an intelligent healthcare assistant that can 
          understand symptoms, provide preliminary diagnoses, and connect patients with appropriate medical 
          professionals - all in multiple Indian languages.
        </p>
      </div>

      <div className="section">
        <h2>Our Team</h2>
        <p>Meet our dedicated team of healthcare professionals, AI engineers, and rural development specialists working to bridge the healthcare gap in India.</p>
        <p>
          Our multidisciplinary team combines years of experience in healthcare delivery, artificial 
          intelligence, and rural development. We are committed to making healthcare accessible, 
          affordable, and effective for every Indian citizen.
        </p>
      </div>

      <div className="section">
        <h2>Contact Us</h2>
        <div className="contact-info">
          <div className="contact-item">
            <h4>📧 Email</h4>
            <p>info@vitalpulse.ai</p>
          </div>
          <div className="contact-item">
            <h4>📞 Phone</h4>
            <p>+91-1800-HEALTH</p>
          </div>
        </div>
        <p style={{ marginTop: '2rem', textAlign: 'center' }}>
          Available 24/7 for emergency consultations and support
        </p>
      </div>
    </div>
  );
}

export default AboutUs;