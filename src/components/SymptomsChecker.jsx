import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SymptomsChecker.css';

function SymptomsChecker() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState({
    fever: false,
    cough: false,
    stress: false,
    anxiety: false,
    headache: false,
    fatigue: false,
    nausea: false,
    bodyache: false
  });
  const [showResults, setShowResults] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [showMedications, setShowMedications] = useState(false);

  // Enhanced symptom database with diagnosis logic
  const symptomDatabase = {
    fever_cough: {
      condition: "Common Cold/Flu",
      severity: "mild",
      description: "You may have a common cold or flu. These are viral infections that usually resolve on their own.",
      recommendations: [
        "Rest and stay hydrated",
        "Take paracetamol for fever (500mg every 6 hours)",
        "Drink warm liquids like tea or soup",
        "Use a humidifier or steam inhalation",
        "Avoid contact with others to prevent spread"
      ],
      whenToSeeDoctor: [
        "Fever above 102°F (39°C) for more than 3 days",
        "Difficulty breathing or chest pain",
        "Severe headache or neck stiffness",
        "Persistent vomiting"
      ]
    },
    stress_anxiety: {
      condition: "Stress and Anxiety",
      severity: "mild",
      description: "You're experiencing stress and anxiety symptoms. These are common and manageable with proper techniques.",
      recommendations: [
        "Practice deep breathing exercises",
        "Try meditation or mindfulness",
        "Regular exercise (30 minutes daily)",
        "Maintain a regular sleep schedule",
        "Limit caffeine and alcohol"
      ],
      whenToSeeDoctor: [
        "Symptoms interfere with daily activities",
        "Panic attacks or severe anxiety",
        "Thoughts of self-harm",
        "Symptoms persist for more than 2 weeks"
      ]
    },
    headache_fatigue: {
      condition: "Tension Headache/Fatigue",
      severity: "mild",
      description: "You may be experiencing tension headaches and fatigue, often caused by stress, dehydration, or lack of sleep.",
      recommendations: [
        "Ensure adequate sleep (7-8 hours)",
        "Stay well hydrated",
        "Take regular breaks from screen time",
        "Practice neck and shoulder stretches",
        "Consider over-the-counter pain relief if needed"
      ],
      whenToSeeDoctor: [
        "Severe or sudden onset headache",
        "Headache with fever and neck stiffness",
        "Changes in vision or speech",
        "Headaches becoming more frequent or severe"
      ]
    },
    general: {
      condition: "General Health Concern",
      severity: "monitor",
      description: "Based on your symptoms, it's important to monitor your condition and take general health measures.",
      recommendations: [
        "Monitor your symptoms closely",
        "Maintain good hygiene",
        "Eat a balanced diet",
        "Stay hydrated",
        "Get adequate rest"
      ],
      whenToSeeDoctor: [
        "Symptoms worsen or persist",
        "New symptoms develop",
        "You feel concerned about your health",
        "Any severe or unusual symptoms"
      ]
    }
  };

  // Common symptoms guide data
  const symptomsGuide = {
    fever: {
      description: "Body temperature above 100.4°F (38°C)",
      causes: ["Viral infections", "Bacterial infections", "Heat exhaustion", "Certain medications"],
      homeRemedies: ["Rest", "Fluids", "Cool compress", "Light clothing"],
      seeDoctor: "If fever is above 103°F or lasts more than 3 days"
    },
    cough: {
      description: "Reflex action to clear airways",
      causes: ["Common cold", "Allergies", "Asthma", "Acid reflux"],
      homeRemedies: ["Honey", "Warm liquids", "Humidifier", "Throat lozenges"],
      seeDoctor: "If cough persists more than 3 weeks or produces blood"
    },
    headache: {
      description: "Pain in head or neck region",
      causes: ["Tension", "Dehydration", "Stress", "Eye strain"],
      homeRemedies: ["Rest", "Hydration", "Cold/warm compress", "Gentle massage"],
      seeDoctor: "If sudden, severe, or with fever and neck stiffness"
    }
  };

  // Nearby hospitals data
  const nearbyHospitals = [
    {
      name: "Apollo Hospital",
      distance: "2.3 km",
      specialties: ["Emergency", "Cardiology", "Neurology"],
      phone: "+91-40-23607777",
      address: "Jubilee Hills, Hyderabad"
    },
    {
      name: "AIIMS Delhi",
      distance: "5.1 km",
      specialties: ["Emergency", "General Medicine", "Surgery"],
      phone: "+91-11-26588500",
      address: "Ansari Nagar, New Delhi"
    },
    {
      name: "Fortis Hospital",
      distance: "3.7 km",
      specialties: ["Emergency", "Orthopedics", "Pediatrics"],
      phone: "+91-124-4962200",
      address: "Sector 62, Noida"
    }
  ];

  // Medication information
  const medicationInfo = {
    paracetamol: {
      name: "Paracetamol (Acetaminophen)",
      uses: ["Fever", "Pain relief", "Headache"],
      dosage: "500mg every 6 hours (max 4g/day)",
      sideEffects: ["Rare when used correctly", "Liver damage if overdosed"],
      precautions: ["Don't exceed recommended dose", "Avoid alcohol"]
    },
    ibuprofen: {
      name: "Ibuprofen",
      uses: ["Pain", "Inflammation", "Fever"],
      dosage: "400mg every 6-8 hours (max 1.2g/day)",
      sideEffects: ["Stomach upset", "Increased bleeding risk"],
      precautions: ["Take with food", "Avoid if stomach ulcers"]
    },
    cetirizine: {
      name: "Cetirizine",
      uses: ["Allergies", "Hay fever", "Skin rash"],
      dosage: "10mg once daily",
      sideEffects: ["Drowsiness", "Dry mouth"],
      precautions: ["May cause drowsiness", "Avoid alcohol"]
    }
  };

  const handleSymptomChange = (symptom) => {
    setSymptoms(prev => ({
      ...prev,
      [symptom]: !prev[symptom]
    }));
  };

  const analyzeSymptoms = () => {
    const selectedSymptoms = Object.keys(symptoms).filter(key => symptoms[key]);
    
    if (selectedSymptoms.includes('fever') && selectedSymptoms.includes('cough')) {
      return symptomDatabase.fever_cough;
    } else if (selectedSymptoms.includes('stress') && selectedSymptoms.includes('anxiety')) {
      return symptomDatabase.stress_anxiety;
    } else if (selectedSymptoms.includes('headache') && selectedSymptoms.includes('fatigue')) {
      return symptomDatabase.headache_fatigue;
    } else {
      return symptomDatabase.general;
    }
  };

  const handleCheckSymptoms = () => {
    const selectedSymptoms = Object.keys(symptoms).filter(key => symptoms[key]);
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to continue.');
      return;
    }
    
    const diagnosisResult = analyzeSymptoms();
    setDiagnosis(diagnosisResult);
    setShowResults(true);
  };

  const getSelectedSymptomsCount = () => {
    return Object.values(symptoms).filter(Boolean).length;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return '#138808';
      case 'moderate': return '#FF9933';
      case 'severe': return '#dc3545';
      default: return '#666';
    }
  };

  return (
    <div className="symptoms-checker">
      {/* Hero Section */}
      <div className="symptoms-hero">
        <h1>AI Symptoms Checker</h1>
        <p>AI-powered symptom analysis for preliminary health assessment</p>
      </div>

      <div className="symptoms-container">
        <div className="symptoms-main-content">
          {/* Left Side - Symptoms Selection */}
          <div className="symptoms-form">
            <h2>Select Your Symptoms</h2>
            <div className="symptoms-underline"></div>
            <p className="symptoms-instruction">Check all symptoms you are currently experiencing:</p>

            <div className="symptoms-list">
              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.fever}
                    onChange={() => handleSymptomChange('fever')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">🌡️</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Fever</span>
                      <span className="symptom-translation">बुखार / காய்ச்சல்</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.cough}
                    onChange={() => handleSymptomChange('cough')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">😷</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Cough</span>
                      <span className="symptom-translation">खांसी / இருமல்</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.headache}
                    onChange={() => handleSymptomChange('headache')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">🤕</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Headache</span>
                      <span className="symptom-translation">सिरदर्द / தலைவலி</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.fatigue}
                    onChange={() => handleSymptomChange('fatigue')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">😴</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Fatigue</span>
                      <span className="symptom-translation">थकान / சோர்வு</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.stress}
                    onChange={() => handleSymptomChange('stress')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">😰</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Stress</span>
                      <span className="symptom-translation">तनाव / மன அழுத்தம்</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.anxiety}
                    onChange={() => handleSymptomChange('anxiety')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">😟</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Anxiety</span>
                      <span className="symptom-translation">चिंता / கவலை</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.nausea}
                    onChange={() => handleSymptomChange('nausea')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">🤢</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Nausea</span>
                      <span className="symptom-translation">मतली / குமட்டல்</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="symptom-item">
                <label className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={symptoms.bodyache}
                    onChange={() => handleSymptomChange('bodyache')}
                  />
                  <span className="checkmark"></span>
                  <div className="symptom-content">
                    <div className="symptom-icon">💪</div>
                    <div className="symptom-text">
                      <span className="symptom-name">Body Ache</span>
                      <span className="symptom-translation">शरीर में दर्द / உடல் வலி</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="symptoms-summary">
              <div className="selected-count">
                <span className="count-label">Selected Symptoms: </span>
                <span className="count-number">{getSelectedSymptomsCount()}</span>
              </div>
            </div>

            <button 
              className="check-symptoms-btn"
              onClick={handleCheckSymptoms}
            >
              Get Health Assessment
            </button>

            {showResults && diagnosis && (
              <div className="symptoms-results">
                <h3 style={{ color: getSeverityColor(diagnosis.severity) }}>
                  Possible Condition: {diagnosis.condition}
                </h3>
                <p>{diagnosis.description}</p>
                
                <div className="recommendations">
                  <h4>Recommended Self-Care:</h4>
                  <ul>
                    {diagnosis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="when-to-see-doctor">
                  <h4 style={{ color: '#dc3545' }}>See a Doctor If:</h4>
                  <ul>
                    {diagnosis.whenToSeeDoctor.map((condition, index) => (
                      <li key={index} style={{ color: '#dc3545' }}>{condition}</li>
                    ))}
                  </ul>
                </div>

                <div className="disclaimer" style={{ 
                  background: '#fff5f5', 
                  border: '1px solid #dc3545', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  marginTop: '1rem'
                }}>
                  <p style={{ color: '#721c24', margin: 0, fontSize: '0.9rem' }}>
                    <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only and does not replace professional medical advice. Always consult a healthcare provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Health Information */}
          <div className="health-info-section">
            <div className="health-info-card">
              <h3>Health Resources</h3>
              <div className="info-underline"></div>
              
              <div className="health-resources">
                <div className="resource-item">
                  <div className="resource-icon">📋</div>
                  <div className="resource-content">
                    <h4>Common Symptoms Guide</h4>
                    <p>Learn about common symptoms and what they might indicate.</p>
                    <button 
                      className="resource-btn"
                      onClick={() => setShowGuide(!showGuide)}
                    >
                      {showGuide ? 'Hide Guide' : 'View Guide'}
                    </button>
                  </div>
                </div>
                
                <div className="resource-item">
                  <div className="resource-icon">🏥</div>
                  <div className="resource-content">
                    <h4>Find Nearby Hospitals</h4>
                    <p>Locate healthcare facilities in your area for in-person consultations.</p>
                    <button 
                      className="resource-btn"
                      onClick={() => setShowHospitals(!showHospitals)}
                    >
                      {showHospitals ? 'Hide Hospitals' : 'Find Hospitals'}
                    </button>
                  </div>
                </div>
                
                <div className="resource-item">
                  <div className="resource-icon">💊</div>
                  <div className="resource-content">
                    <h4>Medication Information</h4>
                    <p>Information about common medications and their uses.</p>
                    <button 
                      className="resource-btn"
                      onClick={() => setShowMedications(!showMedications)}
                    >
                      {showMedications ? 'Hide Info' : 'Learn More'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Symptoms Guide Modal */}
              {showGuide && (
                <div className="guide-modal">
                  <h4>Common Symptoms Guide</h4>
                  {Object.entries(symptomsGuide).map(([symptom, info]) => (
                    <div key={symptom} className="guide-item">
                      <h5>{symptom.charAt(0).toUpperCase() + symptom.slice(1)}</h5>
                      <p><strong>Description:</strong> {info.description}</p>
                      <p><strong>Common Causes:</strong> {info.causes.join(', ')}</p>
                      <p><strong>Home Remedies:</strong> {info.homeRemedies.join(', ')}</p>
                      <p><strong>See Doctor:</strong> {info.seeDoctor}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hospitals Modal */}
              {showHospitals && (
                <div className="hospitals-modal">
                  <h4>Nearby Hospitals</h4>
                  {nearbyHospitals.map((hospital, index) => (
                    <div key={index} className="hospital-item">
                      <h5>{hospital.name}</h5>
                      <p><strong>Distance:</strong> {hospital.distance}</p>
                      <p><strong>Specialties:</strong> {hospital.specialties.join(', ')}</p>
                      <p><strong>Phone:</strong> {hospital.phone}</p>
                      <p><strong>Address:</strong> {hospital.address}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Medications Modal */}
              {showMedications && (
                <div className="medications-modal">
                  <h4>Common Medications</h4>
                  {Object.entries(medicationInfo).map(([key, med]) => (
                    <div key={key} className="medication-item">
                      <h5>{med.name}</h5>
                      <p><strong>Uses:</strong> {med.uses.join(', ')}</p>
                      <p><strong>Dosage:</strong> {med.dosage}</p>
                      <p><strong>Side Effects:</strong> {med.sideEffects.join(', ')}</p>
                      <p><strong>Precautions:</strong> {med.precautions.join(', ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="emergency-info-card">
              <h3>Emergency Information</h3>
              <div className="info-underline"></div>
              
              <div className="emergency-content">
                <div className="emergency-number">
                  <div className="number-icon">🚑</div>
                  <div className="number-details">
                    <h4>Ambulance</h4>
                    <p className="phone-number">108</p>
                  </div>
                </div>
                
                <div className="emergency-number">
                  <div className="number-icon">👮</div>
                  <div className="number-details">
                    <h4>Police</h4>
                    <p className="phone-number">100</p>
                  </div>
                </div>
                
                <div className="emergency-number">
                  <div className="number-icon">🔥</div>
                  <div className="number-details">
                    <h4>Fire</h4>
                    <p className="phone-number">101</p>
                  </div>
                </div>
                
                <div className="emergency-note">
                  <p>For medical emergencies, please call 108 immediately or visit your nearest emergency room.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SymptomsChecker;