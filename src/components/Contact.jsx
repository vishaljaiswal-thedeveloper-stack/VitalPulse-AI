import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      alert(t('fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert(t('messageSubmitted'));
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <div className="contact">
      <div className="contact-hero">
        <h1>{t('contactUs')}</h1>
        <p>{t('contactSubtitle')}</p>
      </div>

      <div className="contact-container">
        <div className="contact-form-section">
          <div className="contact-form-card">
            <h2>{t('sendMessage')}</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">{t('fullName')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('namePlaceholder')}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('emailAddress')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('emailPlaceholder')}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('message')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('messagePlaceholder')}
                  className="form-textarea"
                  rows="5"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('submitting') : t('submitMessage')}
              </button>
            </form>
          </div>

          <div className="contact-info-card">
            <h3>{t('getInTouch')}</h3>
            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-icon">📧</div>
                <div>
                  <h4>{t('email')}</h4>
                  <p>info@vitalpulse.ai</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>{t('phone')}</h4>
                  <p>+91-1800-HEALTH</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-icon">🕒</div>
                <div>
                  <h4>{t('availability')}</h4>
                  <p>{t('availabilityHours')}</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-icon">🏥</div>
                <div>
                  <h4>{t('emergencyServices')}</h4>
                  <p>{t('emergencyAvailable')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="chatbot-section">
          <div className="chatbot-card">
            <h3>{t('aiAssistant')}</h3>
            <div className="chatbot-placeholder">
              {!showChatbot ? (
                <div className="chatbot-intro">
                  <div className="chatbot-icon">🤖</div>
                  <h4>{t('chatbotTitle')}</h4>
                  <p>{t('chatbotDesc')}</p>
                  <button className="start-chat-btn" onClick={toggleChatbot}>
                    {t('startChat')}
                  </button>
                </div>
              ) : (
                <div className="chatbot-interface">
                  <div className="chatbot-header">
                    <div className="chatbot-status">
                      <div className="status-indicator"></div>
                      <span>{t('aiAssistantOnline')}</span>
                    </div>
                    <button className="close-chat-btn" onClick={toggleChatbot}>
                      ✕
                    </button>
                  </div>
                  
                  <div className="chatbot-messages">
                    <div className="bot-message">
                      <div className="message-avatar">🤖</div>
                      <div className="message-content">
                        <p>{t('welcomeMessage')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="chatbot-input">
                    <input 
                      type="text" 
                      placeholder={t('typeMessage')}
                      className="chat-input"
                    />
                    <button className="send-btn">
                      📤
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;