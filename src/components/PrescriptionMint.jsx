import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './PrescriptionMint.css';

function PrescriptionMint() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    patientName: '',
    doctorName: '',
    drug: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '5 days',
    instructions: 'Take after meals'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintedPrescriptions, setMintedPrescriptions] = useState([]);
  const [algorandWallet, setAlgorandWallet] = useState(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);

  // Common drugs list for dropdown
  const commonDrugs = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Azithromycin',
    'Metformin',
    'Amlodipine',
    'Omeprazole',
    'Cetirizine',
    'Aspirin',
    'Dolo 650'
  ];

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        setUser(userData);
        setIsDoctor(userData.role === 'doctor');
        
        // Load minted prescriptions for demo user
        loadDemoPrescriptions();
        return;
      }
      
      if (!isSupabaseConfigured()) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Check if user is a doctor
        setIsDoctor(user.user_metadata?.role === 'doctor');
        loadMintedPrescriptions();
      }
    };

    checkUser();

    // Listen for auth changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsDoctor(session.user.user_metadata?.role === 'doctor');
          loadMintedPrescriptions();
        }
      });

      return () => subscription.unsubscribe();
    }
    
    // Load sample prescriptions for all users
    loadDemoPrescriptions();
  }, []);

  const loadDemoPrescriptions = () => {
    // Sample prescriptions for demo users
    const demoPrescriptions = [
      {
        id: 'demo-1',
        patient_name: 'Demo Patient',
        doctor_name: 'Dr. Rajesh Kumar',
        drug: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals',
        language: 'en',
        algorand_asset_id: 123456789,
        algorand_tx_id: 'TXNDEMO123456789',
        wallet_address: 'ALGODEMO123456789',
        blockchain_status: 'minted',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-2',
        patient_name: 'Demo Patient',
        doctor_name: 'Dr. Priya Sharma',
        drug: 'Amoxicillin',
        dosage: '250mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with food',
        language: 'en',
        algorand_asset_id: 987654321,
        algorand_tx_id: 'TXNDEMO987654321',
        wallet_address: 'ALGODEMO987654321',
        blockchain_status: 'minted',
        created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
      }
    ];
    
    setMintedPrescriptions(demoPrescriptions);
  };

  const loadMintedPrescriptions = async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMintedPrescriptions(data || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const connectAlgorandWallet = async () => {
    setIsConnectingWallet(true);
    
    try {
      // Simulate Algorand wallet connection
      console.log('🔗 Connecting to Algorand wallet...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock wallet address
      const mockWalletAddress = 'ALGO' + Math.random().toString(36).substring(2, 15).toUpperCase();
      
      setAlgorandWallet({
        address: mockWalletAddress,
        balance: 1000, // Mock ALGO balance
        connected: true
      });
      
      console.log('✅ Algorand wallet connected:', mockWalletAddress);
      
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      alert('Wallet connection failed. Please try again.');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const mintPrescriptionNFT = async () => {
    if (!algorandWallet) {
      alert('Please connect your Algorand wallet first');
      return;
    }

    if (!prescriptionData.patientName || !prescriptionData.doctorName || !prescriptionData.drug) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if user is a doctor
    if (!isDoctor) {
      alert('Only doctors can create prescriptions');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🏥 Starting prescription NFT minting process...');
      
      // Step 1: Create prescription metadata
      const prescriptionMetadata = {
        name: `Prescription - ${prescriptionData.drug}`,
        description: `Medical prescription for ${prescriptionData.patientName}`,
        image: 'https://via.placeholder.com/400x400/FF9933/FFFFFF?text=Rx',
        properties: {
          patient_name: prescriptionData.patientName,
          doctor_name: prescriptionData.doctorName,
          drug: prescriptionData.drug,
          dosage: prescriptionData.dosage,
          frequency: prescriptionData.frequency,
          duration: prescriptionData.duration,
          instructions: prescriptionData.instructions,
          issued_date: new Date().toISOString(),
          language: i18n.language,
          platform: 'VitalPulse'
        }
      };

      console.log('📋 Prescription metadata:', prescriptionMetadata);

      // Step 2: Simulate Algorand NFT minting
      console.log('⛓️ Minting NFT on Algorand blockchain...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock transaction data
      const mockTransaction = {
        txId: 'TXN' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        assetId: Math.floor(Math.random() * 1000000) + 100000,
        blockNumber: Math.floor(Math.random() * 1000000) + 500000,
        timestamp: new Date().toISOString()
      };

      console.log('✅ NFT minted successfully:', mockTransaction);

      // Step 3: Store prescription data in Supabase
      const prescriptionRecord = {
        user_id: user?.id || 'guest-' + Math.random().toString(36).substring(2, 9),
        patient_name: prescriptionData.patientName,
        doctor_name: prescriptionData.doctorName,
        drug: prescriptionData.drug,
        dosage: prescriptionData.dosage,
        frequency: prescriptionData.frequency,
        duration: prescriptionData.duration,
        instructions: prescriptionData.instructions,
        language: i18n.language,
        algorand_asset_id: mockTransaction.assetId,
        algorand_tx_id: mockTransaction.txId,
        wallet_address: algorandWallet.address,
        metadata: prescriptionMetadata,
        blockchain_status: 'minted'
      };

      if (isSupabaseConfigured() && user && !user.id?.startsWith('demo-')) {
        const { data, error } = await supabase
          .from('prescriptions')
          .insert(prescriptionRecord)
          .select()
          .single();

        if (error) throw error;

        console.log('💾 Prescription saved to database:', data);
        
        // Update UI
        setMintedPrescriptions(prev => [data, ...prev]);
      } else {
        // For demo users, just update the UI
        const demoRecord = {
          ...prescriptionRecord,
          id: 'demo-' + Date.now(),
          created_at: new Date().toISOString()
        };
        
        console.log('📝 Demo prescription created:', demoRecord);
        setMintedPrescriptions(prev => [demoRecord, ...prev]);
      }
      
      // Reset form
      setPrescriptionData({
        patientName: '',
        doctorName: '',
        drug: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals'
      });

      alert('Prescription minted successfully!');

    } catch (error) {
      console.error('❌ Prescription minting failed:', error);
      alert('Prescription minting failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'ta' ? 'ta-IN' : 'en-IN');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // If not a doctor, show access denied message
  if (!isDoctor) {
    return (
      <div className="prescription-mint">
        <div className="prescription-hero">
          <h1>Prescription NFT Minting</h1>
          <p>Secure, verifiable, and immutable prescriptions on the Algorand blockchain</p>
        </div>

        <div className="prescription-container">
          <div className="access-denied">
            <div className="access-icon">🔒</div>
            <h2>Doctor Access Only</h2>
            <p>Only verified doctors can create and mint prescription NFTs. If you are a doctor, please log in with your doctor account.</p>
            <button 
              className="login-btn"
              onClick={() => window.location.href = '/doctor-login'}
            >
              Login as Doctor
            </button>
          </div>

          {mintedPrescriptions.length > 0 && (
            <div className="minted-prescriptions">
              <h2>Your Prescription Records</h2>
              <div className="prescriptions-grid">
                {mintedPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="prescription-card">
                    <div className="prescription-header">
                      <div className="prescription-icon">💊</div>
                      <div className="prescription-info">
                        <h3>{prescription.drug}</h3>
                        <p>for {prescription.patient_name}</p>
                      </div>
                      <div className="blockchain-badge">
                        <span>⛓️ NFT</span>
                      </div>
                    </div>
                    
                    <div className="prescription-details">
                      <div className="detail-row">
                        <span className="label">Doctor:</span>
                        <span className="value">{prescription.doctor_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Dosage:</span>
                        <span className="value">{prescription.dosage}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Frequency:</span>
                        <span className="value">{prescription.frequency}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Duration:</span>
                        <span className="value">{prescription.duration}</span>
                      </div>
                    </div>

                    <div className="blockchain-info">
                      <div className="blockchain-detail">
                        <span className="label">Asset ID:</span>
                        <code onClick={() => copyToClipboard(prescription.algorand_asset_id.toString())}>
                          {prescription.algorand_asset_id}
                        </code>
                      </div>
                      <div className="blockchain-detail">
                        <span className="label">TX ID:</span>
                        <code onClick={() => copyToClipboard(prescription.algorand_tx_id)}>
                          {prescription.algorand_tx_id.substring(0, 10)}...
                        </code>
                      </div>
                    </div>

                    <div className="prescription-footer">
                      <span className="date">{formatDate(prescription.created_at)}</span>
                      <div className="actions">
                        <button 
                          className="view-btn"
                          onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${prescription.algorand_asset_id}`, '_blank')}
                        >
                          View on Blockchain
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="prescription-mint">
      <div className="prescription-hero">
        <h1>Mint Prescription NFTs</h1>
        <p>Secure, verifiable, and immutable prescriptions on the Algorand blockchain</p>
      </div>

      <div className="prescription-container">
        {/* Wallet Connection Section */}
        <div className="wallet-section">
          <h2>Algorand Wallet</h2>
          {!algorandWallet ? (
            <div className="wallet-connect">
              <div className="wallet-info">
                <div className="wallet-icon">🔗</div>
                <h3>Connect Your Wallet</h3>
                <p>Connect your Algorand wallet to mint prescription NFTs and store them securely on the blockchain.</p>
              </div>
              <button 
                className="connect-wallet-btn"
                onClick={connectAlgorandWallet}
                disabled={isConnectingWallet}
              >
                {isConnectingWallet ? (
                  <>
                    <span className="loading-spinner"></span>
                    Connecting...
                  </>
                ) : (
                  'Connect Algorand Wallet'
                )}
              </button>
            </div>
          ) : (
            <div className="wallet-connected">
              <div className="wallet-status">
                <span className="status-indicator"></span>
                <span>Wallet Connected</span>
              </div>
              <div className="wallet-details">
                <div className="wallet-address">
                  <span>Address: </span>
                  <code onClick={() => copyToClipboard(algorandWallet.address)}>
                    {algorandWallet.address}
                  </code>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(algorandWallet.address)}
                  >
                    📋
                  </button>
                </div>
                <div className="wallet-balance">
                  <span>Balance: {algorandWallet.balance} ALGO</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prescription Form */}
        <div className="prescription-form-section">
          <h2>Create Prescription</h2>
          <form className="prescription-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientName">Patient Name *</label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={prescriptionData.patientName}
                  onChange={handleInputChange}
                  placeholder="Enter patient's full name"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="doctorName">Doctor Name *</label>
                <input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  value={prescriptionData.doctorName || (user?.name ? `Dr. ${user.name}` : '')}
                  onChange={handleInputChange}
                  placeholder="Enter prescribing doctor's name"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="drug">Medication *</label>
                <select
                  id="drug"
                  name="drug"
                  value={prescriptionData.drug}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {commonDrugs.map(drug => (
                    <option key={drug} value={drug}>{drug}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dosage">Dosage</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={prescriptionData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <input
                  type="text"
                  id="frequency"
                  name="frequency"
                  value={prescriptionData.frequency}
                  onChange={handleInputChange}
                  placeholder="e.g., Twice daily"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={prescriptionData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 days"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                value={prescriptionData.instructions}
                onChange={handleInputChange}
                placeholder="Additional instructions for the patient"
                className="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <button 
              type="button"
              className="mint-btn"
              onClick={mintPrescriptionNFT}
              disabled={isSubmitting || !algorandWallet}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Minting...
                </>
              ) : (
                <>
                  ⛓️ Mint Prescription NFT
                </>
              )}
            </button>
          </form>
        </div>

        {/* Minted Prescriptions */}
        {mintedPrescriptions.length > 0 && (
          <div className="minted-prescriptions">
            <h2>Your Minted Prescriptions</h2>
            <div className="prescriptions-grid">
              {mintedPrescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <div className="prescription-icon">💊</div>
                    <div className="prescription-info">
                      <h3>{prescription.drug}</h3>
                      <p>for {prescription.patient_name}</p>
                    </div>
                    <div className="blockchain-badge">
                      <span>⛓️ NFT</span>
                    </div>
                  </div>
                  
                  <div className="prescription-details">
                    <div className="detail-row">
                      <span className="label">Doctor:</span>
                      <span className="value">{prescription.doctor_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Dosage:</span>
                      <span className="value">{prescription.dosage}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Frequency:</span>
                      <span className="value">{prescription.frequency}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Duration:</span>
                      <span className="value">{prescription.duration}</span>
                    </div>
                  </div>

                  <div className="blockchain-info">
                    <div className="blockchain-detail">
                      <span className="label">Asset ID:</span>
                      <code onClick={() => copyToClipboard(prescription.algorand_asset_id.toString())}>
                        {prescription.algorand_asset_id}
                      </code>
                    </div>
                    <div className="blockchain-detail">
                      <span className="label">TX ID:</span>
                      <code onClick={() => copyToClipboard(prescription.algorand_tx_id)}>
                        {prescription.algorand_tx_id.substring(0, 10)}...
                      </code>
                    </div>
                  </div>

                  <div className="prescription-footer">
                    <span className="date">{formatDate(prescription.created_at)}</span>
                    <div className="actions">
                      <button 
                        className="view-btn"
                        onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${prescription.algorand_asset_id}`, '_blank')}
                      >
                        View on Blockchain
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <h2>Why Blockchain for Prescriptions?</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">🔒</div>
              <h3>Immutable Records</h3>
              <p>Once minted, prescriptions cannot be altered or tampered with, ensuring authenticity.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">✅</div>
              <h3>Verifiable Authenticity</h3>
              <p>Anyone can verify the authenticity of a prescription using the blockchain.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🌐</div>
              <h3>Global Access</h3>
              <p>Access your prescriptions from anywhere in the world with just your wallet.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🏥</div>
              <h3>Interoperability</h3>
              <p>Works with any healthcare system that supports blockchain verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionMint;