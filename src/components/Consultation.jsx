import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function Consultation({ appointmentData, onConsultationEnd }) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [consultationStatus, setConsultationStatus] = useState('waiting'); // waiting, connecting, active, ended
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [consultationTime, setConsultationTime] = useState(0);
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Positive affirmations in multiple languages
  const affirmations = {
    en: [
      "You're brave for seeking help! 💪",
      "Your health matters and you're taking the right steps! 🌟",
      "You're stronger than you think! 💚",
      "Taking care of yourself is an act of courage! 🦋",
      "You're not alone in this journey! 🤝",
      "Every step towards health is a victory! 🏆",
      "You're doing great by prioritizing your wellbeing! ✨",
      "Your commitment to health is inspiring! 🌈"
    ],
    hi: [
      "मदद मांगने के लिए आप बहादुर हैं! 💪",
      "आपका स्वास्थ्य महत्वपूर्ण है और आप सही कदम उठा रहे हैं! 🌟",
      "आप अपने विचार से कहीं अधिक मजबूत हैं! 💚",
      "अपना ख्याल रखना साहस का काम है! 🦋",
      "इस यात्रा में आप अकेले नहीं हैं! 🤝",
      "स्वास्थ्य की दिशा में हर कदम एक जीत है! 🏆",
      "अपनी भलाई को प्राथमिकता देकर आप बहुत अच्छा कर रहे हैं! ✨",
      "स्वास्थ्य के प्रति आपकी प्रतिबद्धता प्रेरणादायक है! 🌈"
    ],
    ta: [
      "உதவி கேட்பதற்கு நீங்கள் தைரியசாலி! 💪",
      "உங்கள் ஆரோக்கியம் முக்கியம், நீங்கள் சரியான படிகளை எடுக்கிறீர்கள்! 🌟",
      "நீங்கள் நினைப்பதை விட வலிமையானவர்! 💚",
      "உங்களை கவனித்துக்கொள்வது தைரியமான செயல்! 🦋",
      "இந்த பயணத்தில் நீங்கள் தனியாக இல்லை! 🤝",
      "ஆரோக்கியத்தை நோக்கிய ஒவ்வொரு அடியும் வெற்றி! 🏆",
      "உங்கள் நல்வாழ்வுக்கு முன்னுரிமை கொடுப்பதில் நீங்கள் சிறப்பாக செயல்படுகிறீர்கள்! ✨",
      "ஆரோக்கியத்திற்கான உங்கள் அர்ப்பணிப்பு ஊக்கமளிக்கிறது! 🌈"
    ]
  };

  // Sample chat messages for demonstration
  const initialMessages = [
    {
      id: 1,
      sender: 'doctor',
      message: 'Hello! I can see you\'ve joined the consultation. How are you feeling today?',
      timestamp: new Date()
    },
    {
      id: 2,
      sender: 'system',
      message: 'Dr. ' + (appointmentData?.doctor?.name || 'Doctor') + ' has joined the consultation',
      timestamp: new Date()
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

    // Initialize consultation
    initializeConsultation();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Show affirmations periodically during consultation
    if (consultationStatus === 'active') {
      const affirmationInterval = setInterval(() => {
        setShowAffirmations(true);
        setCurrentAffirmation(prev => 
          (prev + 1) % affirmations[i18n.language].length
        );
        
        // Hide affirmation after 3 seconds
        setTimeout(() => setShowAffirmations(false), 3000);
      }, 30000); // Show every 30 seconds

      return () => clearInterval(affirmationInterval);
    }
  }, [consultationStatus, i18n.language]);

  const initializeConsultation = async () => {
    try {
      // Simulate connection process
      setConsultationStatus('connecting');
      
      // Initialize chat with welcome messages
      setChatMessages(initialMessages);
      
      // Simulate doctor joining after 3 seconds
      setTimeout(() => {
        setConsultationStatus('active');
        startConsultationTimer();
        
        // Add doctor's welcome message
        const welcomeMessage = {
          id: Date.now(),
          sender: 'doctor',
          message: getWelcomeMessage(),
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, welcomeMessage]);
        
        // Show first affirmation
        setTimeout(() => {
          setShowAffirmations(true);
          setTimeout(() => setShowAffirmations(false), 3000);
        }, 5000);
        
      }, 3000);
      
    } catch (error) {
      console.error('Error initializing consultation:', error);
    }
  };

  const getWelcomeMessage = () => {
    const messages = {
      en: "Welcome to your consultation! I'm here to help you with your health concerns. Please feel free to share what's bothering you.",
      hi: "आपके परामर्श में आपका स्वागत है! मैं आपकी स्वास्थ्य संबंधी चिंताओं में आपकी मदद करने के लिए यहाँ हूँ। कृपया बेझिझक बताएं कि आपको क्या परेशान कर रहा है।",
      ta: "உங்கள் ஆலோசனைக்கு வரவேற்கிறோம்! உங்கள் சுகாதார கவலைகளில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். உங்களை என்ன தொந்தரவு செய்கிறது என்பதை தயங்காமல் பகிர்ந்து கொள்ளுங்கள்."
    };
    return messages[i18n.language] || messages.en;
  };

  const startConsultationTimer = () => {
    timerRef.current = setInterval(() => {
      setConsultationTime(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In a real implementation, this would control the actual video stream
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In a real implementation, this would control the actual audio stream
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'patient',
      message: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // Simulate doctor response after a delay
    setTimeout(() => {
      const responses = {
        en: [
          "I understand your concern. Can you tell me more about when this started?",
          "Thank you for sharing that. Let me ask you a few more questions.",
          "That's helpful information. Have you experienced this before?",
          "I see. Let's discuss some treatment options that might help you.",
          "Based on what you've told me, I'd like to recommend..."
        ],
        hi: [
          "मैं आपकी चिंता समझता हूं। क्या आप मुझे बता सकते हैं कि यह कब शुरू हुआ?",
          "इसे साझा करने के लिए धन्यवाद। मुझे आपसे कुछ और प्रश्न पूछने दें।",
          "यह उपयोगी जानकारी है। क्या आपने इसे पहले भी अनुभव किया है?",
          "मैं समझ गया। आइए कुछ उपचार विकल्पों पर चर्चा करते हैं जो आपकी मदद कर सकते हैं।",
          "आपने जो बताया है उसके आधार पर, मैं सुझाना चाहूंगा..."
        ],
        ta: [
          "உங்கள் கவலையை நான் புரிந்துகொள்கிறேன். இது எப்போது தொடங்கியது என்று என்னிடம் சொல்ல முடியுமா?",
          "அதைப் பகிர்ந்ததற்கு நன்றி. நான் உங்களிடம் இன்னும் சில கேள்விகள் கேட்கட்டும்.",
          "அது பயனுள்ள தகவல். நீங்கள் இதை முன்பு அனுபவித்திருக்கிறீர்களா?",
          "நான் பார்க்கிறேன். உங்களுக்கு உதவக்கூடிய சில சிகிச்சை விருப்பங்களைப் பற்றி விவாதிப்போம்.",
          "நீங்கள் என்னிடம் சொன்னதன் அடிப்படையில், நான் பரிந்துரைக்க விரும்புகிறேன்..."
        ]
      };

      const doctorResponses = responses[i18n.language] || responses.en;
      const randomResponse = doctorResponses[Math.floor(Math.random() * doctorResponses.length)];

      const doctorMessage = {
        id: Date.now() + 1,
        sender: 'doctor',
        message: randomResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, doctorMessage]);
    }, 2000);
  };

  const endConsultation = () => {
    setConsultationStatus('ended');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Save consultation record
    saveConsultationRecord();

    // Show completion message
    setTimeout(() => {
      if (onConsultationEnd) {
        onConsultationEnd({
          duration: consultationTime,
          status: 'completed'
        });
      }
    }, 3000);
  };

  const saveConsultationRecord = async () => {
    try {
      const consultationRecord = {
        user_id: user?.id,
        doctor_id: appointmentData?.doctor?.id,
        duration_minutes: Math.floor(consultationTime / 60),
        consultation_type: appointmentData?.consultationType || 'video',
        status: 'completed',
        language: i18n.language,
        notes: chatMessages.filter(msg => msg.sender === 'patient').map(msg => msg.message).join('; ')
      };

      if (isSupabaseConfigured()) {
        // In a real implementation, you would save to a consultations table
        console.log('💾 Saving consultation record:', consultationRecord);
      } else {
        console.log('📝 Simulating consultation save:', consultationRecord);
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
    }
  };

  const getStatusMessage = () => {
    const messages = {
      waiting: {
        en: 'Waiting for doctor to join...',
        hi: 'डॉक्टर के शामिल होने का इंतज़ार...',
        ta: 'மருத்துவர் சேருவதற்காக காத்திருக்கிறது...'
      },
      connecting: {
        en: 'Connecting to consultation...',
        hi: 'परामर्श से जुड़ रहे हैं...',
        ta: 'ஆலோசனையுடன் இணைக்கிறது...'
      },
      active: {
        en: 'Consultation in progress',
        hi: 'परामर्श चल रहा है',
        ta: 'ஆலோசனை நடைபெற்று வருகிறது'
      },
      ended: {
        en: 'Consultation completed',
        hi: 'परामर्श पूरा हुआ',
        ta: 'ஆலோசனை முடிந்தது'
      }
    };

    return messages[consultationStatus][i18n.language] || messages[consultationStatus].en;
  };

  return (
    <div className="consultation">
      {/* Consultation Header */}
      <div className="consultation-header">
        <div className="consultation-info">
          <h2>{t('videoConsultation')}</h2>
          <div className="consultation-details">
            <span className="doctor-name">
              👨‍⚕️ Dr. {appointmentData?.doctor?.name || 'Doctor'}
            </span>
            <span className="consultation-status" data-status={consultationStatus}>
              {getStatusMessage()}
            </span>
            {consultationStatus === 'active' && (
              <span className="consultation-timer">
                ⏱️ {formatTime(consultationTime)}
              </span>
            )}
          </div>
        </div>

        {consultationStatus === 'active' && (
          <button className="end-consultation-btn" onClick={endConsultation}>
            📞 {t('endConsultation')}
          </button>
        )}
      </div>

      <div className="consultation-container">
        {/* Video Section */}
        <div className="video-section">
          <div className="video-container">
            {/* Doctor Video (Tavus Placeholder) */}
            <div className="doctor-video">
              <div className="tavus-video-placeholder">
                {consultationStatus === 'active' ? (
                  <div className="video-active">
                    <img 
                      src={appointmentData?.doctor?.image || 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                      alt="Doctor"
                      className="doctor-video-feed"
                    />
                    <div className="video-overlay">
                      <span className="doctor-name-overlay">
                        Dr. {appointmentData?.doctor?.name || 'Doctor'}
                      </span>
                      <div className="video-quality">🔴 HD</div>
                    </div>
                  </div>
                ) : (
                  <div className="video-waiting">
                    <div className="video-placeholder-content">
                      <div className="video-icon">📹</div>
                      <h4>{t('tavusVideoIntegration')}</h4>
                      <p>{t('waitingForDoctor')}</p>
                      {consultationStatus === 'connecting' && (
                        <div className="loading-spinner-large"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Video */}
            <div className="patient-video">
              <div className="patient-video-container">
                {isVideoEnabled ? (
                  <div className="video-placeholder patient-feed">
                    <div className="patient-avatar">👤</div>
                    <span className="video-label">{t('you')}</span>
                  </div>
                ) : (
                  <div className="video-disabled">
                    <div className="video-disabled-icon">📷</div>
                    <span>{t('videoOff')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Controls */}
          {consultationStatus === 'active' && (
            <div className="video-controls">
              <button 
                className={`control-btn ${isVideoEnabled ? 'active' : 'disabled'}`}
                onClick={toggleVideo}
                title={t('toggleVideo')}
              >
                {isVideoEnabled ? '📹' : '📷'}
              </button>
              
              <button 
                className={`control-btn ${isAudioEnabled ? 'active' : 'disabled'}`}
                onClick={toggleAudio}
                title={t('toggleAudio')}
              >
                {isAudioEnabled ? '🎤' : '🔇'}
              </button>
              
              <button className="control-btn" title={t('settings')}>
                ⚙️
              </button>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="chat-section">
          <div className="chat-header">
            <h3>{t('consultationChat')}</h3>
            <span className="chat-status">
              {consultationStatus === 'active' ? '🟢 Active' : '🟡 Waiting'}
            </span>
          </div>

          <div className="chat-messages">
            {chatMessages.map((message) => (
              <div 
                key={message.id} 
                className={`chat-message ${message.sender}`}
              >
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">
                      {message.sender === 'doctor' ? 
                        `Dr. ${appointmentData?.doctor?.name || 'Doctor'}` : 
                        message.sender === 'patient' ? t('you') : t('system')
                      }
                    </span>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="message-text">{message.message}</div>
                </div>
              </div>
            ))}
          </div>

          {consultationStatus === 'active' && (
            <div className="chat-input-section">
              <div className="chat-input-container">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder={t('typeMessage')}
                  className="chat-input"
                />
                <button 
                  className="send-message-btn"
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                >
                  📤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Affirmations Overlay */}
      {showAffirmations && consultationStatus === 'active' && (
        <div className="affirmations-overlay">
          <div className="affirmation-card">
            <div className="affirmation-text">
              {affirmations[i18n.language][currentAffirmation]}
            </div>
          </div>
        </div>
      )}

      {/* Consultation Ended Screen */}
      {consultationStatus === 'ended' && (
        <div className="consultation-ended">
          <div className="ended-content">
            <div className="ended-icon">✅</div>
            <h2>{t('consultationCompleted')}</h2>
            <p>{t('consultationCompletedMessage')}</p>
            <div className="consultation-summary">
              <div className="summary-item">
                <span>{t('duration')}:</span>
                <span>{formatTime(consultationTime)}</span>
              </div>
              <div className="summary-item">
                <span>{t('doctor')}:</span>
                <span>Dr. {appointmentData?.doctor?.name}</span>
              </div>
            </div>
            <div className="ended-actions">
              <button className="download-report-btn">
                📄 {t('downloadReport')}
              </button>
              <button className="book-followup-btn">
                📅 {t('bookFollowup')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Consultation;