import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './ArogyaBot.css';

function ArogyaBot({ isMinimized = false, onToggle }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [isSearchingDoctors, setIsSearchingDoctors] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Predefined responses based on user queries
  const predefinedResponses = {
    en: {
      'book doctor': 'I\'ll help you find a doctor. Here are some available doctors:',
      'find doctor': 'I\'ll help you find a doctor. Here are some available doctors:',
      'doctor appointment': 'Let me help you book an appointment. Here are some available doctors:',
      'symptoms': 'I can help you check your symptoms. Would you like to use our AI symptoms checker?',
      'fever': 'Fever can be concerning. I recommend checking your temperature and consulting with a doctor if it persists.',
      'cough': 'For persistent cough, please consider consulting a healthcare professional. Stay hydrated and rest.',
      'emergency': 'For medical emergencies, please call 108 immediately or visit the nearest hospital.',
      'mental health': 'Mental health is important. We offer counseling services. Would you like me to connect you?',
      'hello': 'Hello! I\'m VitalBot, your AI health assistant. How can I help you today?',
      'hi': 'Hi there! I\'m here to help with your health questions. What can I assist you with?',
      'help': 'I can help you with: finding doctors, checking symptoms, booking appointments, mental health support, and emergency services.',
      'language': 'I can communicate in Hindi (हिंदी), Tamil (தமிழ்), and English. Which language would you prefer?'
    },
    hi: {
      'डॉक्टर बुक करें': 'मैं आपको डॉक्टर खोजने में मदद करूंगा। यहां कुछ उपलब्ध डॉक्टर हैं:',
      'डॉक्टर खोजें': 'मैं आपको डॉक्टर खोजने में मदद करूंगा। यहां कुछ उपलब्ध डॉक्टर हैं:',
      'डॉक्टर अपॉइंटमेंट': 'मैं आपको अपॉइंटमेंट बुक करने में मदद करूंगा। यहां कुछ उपलब्ध डॉक्टर हैं:',
      'लक्षण': 'मैं आपके लक्षणों की जांच में मदद कर सकता हूं। क्या आप हमारे AI लक्षण जांचकर्ता का उपयोग करना चाहेंगे?',
      'बुखार': 'बुखार चिंताजनक हो सकता है। मैं तापमान जांचने और यदि यह बना रहे तो डॉक्टर से सलाह लेने की सलाह देता हूं।',
      'खांसी': 'लगातार खांसी के लिए, कृपया स्वास्थ्य पेशेवर से सलाह लेने पर विचार करें। हाइड्रेटेड रहें और आराम करें।',
      'आपातकाल': 'चिकित्सा आपातकाल के लिए, कृपया तुरंत 108 पर कॉल करें या निकटतम अस्पताल जाएं।',
      'मानसिक स्वास्थ्य': 'मानसिक स्वास्थ्य महत्वपूर्ण है। हम परामर्श सेवाएं प्रदान करते हैं। क्या आप चाहेंगे कि मैं आपको जोड़ूं?',
      'नमस्ते': 'नमस्ते! मैं VitalBot हूं, आपका AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकता हूं?',
      'हैलो': 'हैलो! मैं यहां आपके स्वास्थ्य प्रश्नों में मदद के लिए हूं। मैं आपकी किस चीज में सहायता कर सकता हूं?',
      'मदद': 'मैं इनमें आपकी मदद कर सकता हूं: डॉक्टर खोजना, लक्षण जांचना, अपॉइंटमेंट बुक करना, मानसिक स्वास्थ्य सहायता, और आपातकालीन सेवाएं।'
    },
    ta: {
      'மருத்துவர் பதிவு': 'நான் உங்களுக்கு மருத்துவரைக் கண்டறிய உதவுவேன். இங்கே சில கிடைக்கக்கூடிய மருத்துவர்கள் உள்ளனர்:',
      'மருத்துவர் கண்டறி': 'நான் உங்களுக்கு மருத்துவரைக் கண்டறிய உதவுவேன். இங்கே சில கிடைக்கக்கூடிய மருத்துவர்கள் உள்ளனர்:',
      'மருத்துவர் நியமனம்': 'நான் உங்களுக்கு நியமனம் பதிவு செய்ய உதவுவேன். இங்கே சில கிடைக்கக்கூடிய மருத்துவர்கள் உள்ளனர்:',
      'அறிகுறிகள்': 'நான் உங்கள் அறிகுறிகளைச் சரிபார்க்க உதவ முடியும். எங்கள் AI அறிகுறி பரிசோதனையைப் பயன்படுத்த விரும்புகிறீர்களா?',
      'காய்ச்சல்': 'காய்ச்சல் கவலைக்குரியதாக இருக்கலாம். வெப்பநிலையைச் சரிபார்த்து, அது தொடர்ந்தால் மருத்துவரை அணுக பரிந்துரைக்கிறேன்.',
      'இருமல்': 'தொடர்ச்சியான இருமலுக்கு, சுகாதார நிபுணரை அணுகுவதைக் கருத்தில் கொள்ளுங்கள். நீரேற்றத்துடன் இருங்கள் மற்றும் ஓய்வு எடுங்கள்.',
      'அவசரநிலை': 'மருத்துவ அவசரநிலைகளுக்கு, தயவுசெய்து உடனடியாக 108 ஐ அழைக்கவும் அல்லது அருகிலுள்ள மருத்துவமனைக்குச் செல்லவும்.',
      'மன சுகாதாரம்': 'மன சுகாதாரம் முக்கியம். நாங்கள் ஆலோசனை சேவைகளை வழங்குகிறோம். நான் உங்களை இணைக்க விரும்புகிறீர்களா?',
      'வணக்கம்': 'வணக்கம்! நான் VitalBot, உங்கள் AI சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
      'ஹலோ': 'ஹலோ! நான் உங்கள் சுகாதார கேள்விகளுக்கு உதவ இங்கே இருக்கிறேன். நான் எதில் உங்களுக்கு உதவ முடியும்?',
      'உதவி': 'நான் இவற்றில் உங்களுக்கு உதவ முடியும்: மருத்துவர்களைக் கண்டறிதல், அறிகுறிகளைச் சரிபார்த்தல், நியமனங்களைப் பதிவு செய்தல், மன சுகாதார ஆதரவு, மற்றும் அவசர சேவைகள்.'
    }
  };

  // Sample doctors data
  const sampleDoctors = [
    {
      id: 'dr1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Medicine',
      location: 'Mumbai',
      experience: 12,
      rating: 4.8,
      consultationFee: 500,
      languages: ['en', 'hi'],
      availability: 'Available Today',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 'dr2',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      location: 'Delhi',
      experience: 18,
      rating: 4.9,
      consultationFee: 800,
      languages: ['en', 'hi'],
      availability: 'Available Tomorrow',
      image: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 'dr3',
      name: 'Dr. Meera Nair',
      specialty: 'Pediatrics',
      location: 'Bangalore',
      experience: 10,
      rating: 4.7,
      consultationFee: 600,
      languages: ['en', 'ta'],
      availability: 'Available Now',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300'
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
    // Load chat history for authenticated users
    if (user && isSupabaseConfigured()) {
      loadChatHistory();
    } else {
      // Show welcome message for non-authenticated users
      setMessages([{
        id: Date.now(),
        text: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [user, i18n.language]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on current i18n language
      const langMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN'
      };
      recognitionRef.current.lang = langMap[i18n.language] || 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [i18n.language]);

  const getWelcomeMessage = () => {
    const welcomeMessages = {
      en: "Hello! I'm VitalBot, your AI health assistant. I can help you find doctors, check symptoms, and answer health questions. How can I assist you today?",
      hi: "नमस्ते! मैं VitalBot हूं, आपका AI स्वास्थ्य सहायक। मैं आपको डॉक्टर खोजने, लक्षण जांचने और स्वास्थ्य प्रश्नों के उत्तर देने में मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      ta: "வணக்கம்! நான் VitalBot, உங்கள் AI சுகாதார உதவியாளர். நான் உங்களுக்கு மருத்துவர்களைக் கண்டறிய, அறிகுறிகளைச் சரிபார்க்க மற்றும் சுகாதார கேள்விகளுக்கு பதிலளிக்க உதவ முடியும். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
    };
    return welcomeMessages[i18n.language] || welcomeMessages.en;
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.message,
          isBot: msg.is_bot,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      } else {
        // No history, show welcome message
        setMessages([{
          id: Date.now(),
          text: getWelcomeMessage(),
          isBot: true,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([{
        id: Date.now(),
        text: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date()
      }]);
    }
  };

  const saveMessageToSupabase = async (message, isBot = false) => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: message,
          is_bot: isBot,
          language: i18n.language
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const fetchDoctorsFromSupabase = async () => {
    setIsSearchingDoctors(true);
    
    try {
      if (isSupabaseConfigured()) {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'doctor')
          .limit(3);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data;
        }
      }
      
      // Fallback to sample data
      return sampleDoctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return sampleDoctors;
    } finally {
      setIsSearchingDoctors(false);
    }
  };

  const formatDoctorResponse = (doctors) => {
    let response = "Here are some available doctors:\n\n";
    
    doctors.forEach((doctor, index) => {
      response += `${index + 1}. **${doctor.name}** - ${doctor.specialty}\n`;
      response += `   💰 Consultation Fee: ₹${doctor.consultationFee}\n`;
      response += `   ⭐ Rating: ${doctor.rating}/5\n`;
      response += `   🏥 ${doctor.availability}\n\n`;
    });
    
    response += "Would you like to book an appointment with any of these doctors? Just type the doctor's name or number.";
    
    return response;
  };

  const handleDoctorBooking = (doctorInfo) => {
    // Navigate to doctor booking page with selected doctor
    navigate('/doctor-consultation', { state: { selectedDoctor: doctorInfo } });
  };

  const checkForDoctorBooking = (message) => {
    // Check if user is trying to book with a specific doctor
    const lowerMessage = message.toLowerCase();
    
    // Check for doctor number (e.g., "book doctor 1" or "1")
    const numberMatch = lowerMessage.match(/book\s+doctor\s+(\d+)|book\s+(\d+)|doctor\s+(\d+)|^(\d+)$/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1] || numberMatch[2] || numberMatch[3] || numberMatch[4]);
      if (number > 0 && number <= doctors.length) {
        return doctors[number - 1];
      }
    }
    
    // Check for doctor name (e.g., "book Dr. Sharma" or "Dr. Priya")
    for (const doctor of doctors) {
      const doctorLastName = doctor.name.split(' ').pop();
      const doctorFirstName = doctor.name.split(' ')[1];
      
      if (lowerMessage.includes(doctor.name.toLowerCase()) || 
          lowerMessage.includes(doctorLastName.toLowerCase()) ||
          (doctorFirstName && lowerMessage.includes(doctorFirstName.toLowerCase()))) {
        return doctor;
      }
    }
    
    return null;
  };

  const getBotResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    const responses = predefinedResponses[i18n.language] || predefinedResponses.en;
    
    // Check for doctor booking intent
    if (message.includes('book doctor') || 
        message.includes('find doctor') || 
        message.includes('doctor appointment') ||
        message.includes('डॉक्टर बुक') ||
        message.includes('डॉक्टर खोज') ||
        message.includes('மருத்துவர் பதிவு') ||
        message.includes('மருத்துவர் கண்டறி')) {
      
      // Fetch doctors
      const fetchedDoctors = await fetchDoctorsFromSupabase();
      setDoctors(fetchedDoctors);
      
      // Return formatted doctor list
      return formatDoctorResponse(fetchedDoctors);
    }
    
    // Check if user is selecting a doctor from the list
    const selectedDoctor = checkForDoctorBooking(message);
    if (selectedDoctor) {
      // Handle doctor booking
      setTimeout(() => {
        handleDoctorBooking(selectedDoctor);
      }, 1000);
      
      return `Great choice! I'll redirect you to book an appointment with ${selectedDoctor.name}. Please wait a moment...`;
    }
    
    // Check for symptoms checker intent
    if (message.includes('symptoms') || 
        message.includes('लक्षण') || 
        message.includes('அறிகுறிகள்')) {
      
      setTimeout(() => {
        navigate('/symptoms');
      }, 1000);
      
      return "I'll redirect you to our AI symptoms checker where you can get a preliminary assessment. Please wait a moment...";
    }
    
    // Check for mental health intent
    if (message.includes('mental health') || 
        message.includes('stress') || 
        message.includes('anxiety') ||
        message.includes('मानसिक स्वास्थ्य') ||
        message.includes('तनाव') ||
        message.includes('மன சுகாதாரம்')) {
      
      setTimeout(() => {
        navigate('/mental-health');
      }, 1000);
      
      return "I'll redirect you to our mental health support page where you can get personalized guidance. Please wait a moment...";
    }
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key.toLowerCase())) {
        return response;
      }
    }

    // Default responses based on language
    const defaultResponses = {
      en: "I understand you're asking about health-related concerns. For specific medical advice, I recommend consulting with one of our qualified doctors. Would you like me to help you find a doctor or check our symptoms checker?",
      hi: "मैं समझता हूं कि आप स्वास्थ्य संबंधी चिंताओं के बारे में पूछ रहे हैं। विशिष्ट चिकित्सा सलाह के लिए, मैं हमारे योग्य डॉक्टरों में से किसी एक से सलाह लेने की सिफारिश करता हूं। क्या आप चाहेंगे कि मैं आपको डॉक्टर खोजने या हमारे लक्षण जांचकर्ता की जांच करने में मदद करूं?",
      ta: "நீங்கள் சுகாதாரம் தொடர்பான கவலைகளைப் பற்றி கேட்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். குறிப்பிட்ட மருத்துவ ஆலோசனைக்கு, எங்கள் தகுதிவாய்ந்த மருத்துவர்களில் ஒருவரை அணுக பரிந்துரைக்கிறேன். நான் உங்களுக்கு மருத்துவரைக் கண்டறிய அல்லது எங்கள் அறிகுறி பரிசோதனையைச் சரிபார்க்க உதவ விரும்புகிறீர்களா?"
    };

    return defaultResponses[i18n.language] || defaultResponses.en;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    await saveMessageToSupabase(userMessage, false);

    // Get bot response
    try {
      const botResponse = await getBotResponse(userMessage);
      
      // Add bot message
      const botMsg = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      await saveMessageToSupabase(botResponse, true);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Add error message
      const errorMsg = {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error. Please try again.",
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="arogyabot-minimized" onClick={onToggle}>
        <div className="bot-icon">🤖</div>
        <span className="bot-text">AI Assistant</span>
        {messages.length > 1 && (
          <div className="notification-badge">{messages.length - 1}</div>
        )}
      </div>
    );
  }

  return (
    <div className="arogyabot-container">
      <div className="arogyabot-header">
        <div className="bot-info">
          <div className="bot-avatar">🤖</div>
          <div className="bot-details">
            <h3>VitalBot</h3>
            <span className="bot-status">
              <div className="status-indicator"></div>
              AI Assistant Online
            </span>
          </div>
        </div>
        <div className="bot-controls">
          <button className="minimize-btn" onClick={onToggle} title="Minimize">
            ➖
          </button>
        </div>
      </div>

      <div className="arogyabot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
          >
            {message.isBot && (
              <div className="message-avatar">🤖</div>
            )}
            <div className="message-content">
              <p dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}></p>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
            {!message.isBot && (
              <div className="message-avatar user-avatar">👤</div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {isSearchingDoctors && (
          <div className="message bot-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <p>Searching for available doctors...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="arogyabot-input">
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your health question here..."
            className="message-input"
            rows="1"
            disabled={isLoading}
          />
          
          <div className="input-actions">
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <button
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={startVoiceInput}
                disabled={isLoading || isListening}
                title="Voice Input"
              >
                {isListening ? '🔴' : '🎤'}
              </button>
            )}
            
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              📤
            </button>
          </div>
        </div>
        
        <div className="bot-features">
          <span className="feature-tag">🩺 Symptoms Checker</span>
          <span className="feature-tag">👨‍⚕️ Find Doctors</span>
          <span className="feature-tag">🚨 Emergency</span>
          <span className="feature-tag">🧠 Mental Health</span>
        </div>
      </div>
    </div>
  );
}

export default ArogyaBot;