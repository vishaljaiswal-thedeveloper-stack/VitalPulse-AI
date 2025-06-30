import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './Price.css';

function Price() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [consultationsUsed, setConsultationsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingsCount, setBookingsCount] = useState(0);
  const [hasShownPaywall, setHasShownPaywall] = useState(false);

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        setUser(userData);
        setUserPlan(userData.plan || 'free');
        
        // Set usage based on user plan
        if (userData.email === 'freeuser@example.com') {
          setConsultationsUsed(1);
          setBookingsCount(1);
        } else if (userData.email === 'premiumuser@example.com') {
          setUserPlan('premium');
          setConsultationsUsed(5);
          setBookingsCount(5);
        }
        
        return;
      }

      if (!isSupabaseConfigured()) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user plan from Supabase
        try {
          const { data: userPlanData, error } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error) throw error;
          
          if (userPlanData) {
            setUserPlan(userPlanData.plan_type);
          }
          
          // Fetch usage data
          const currentDate = new Date();
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          weekStart.setHours(0, 0, 0, 0);
          
          const { data: usageData, error: usageError } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', user.id)
            .gte('week_start', weekStart.toISOString().split('T')[0])
            .single();
          
          if (usageError && usageError.code !== 'PGRST116') throw usageError;
          
          if (usageData) {
            setConsultationsUsed(usageData.sessions_count);
          }
          
          // Fetch total bookings count
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('consultations')
            .select('id')
            .eq('patient_id', user.id);
            
          if (bookingsError) throw bookingsError;
          
          if (bookingsData) {
            setBookingsCount(bookingsData.length);
            
            // Show paywall after 2 bookings for free users
            if (bookingsData.length >= 2 && userPlanData?.plan_type === 'free' && !hasShownPaywall) {
              setShowPaywall(true);
              setHasShownPaywall(true);
            }
          }
          
        } catch (error) {
          console.error('Error fetching user plan:', error);
          // Default to free plan if error
          setUserPlan('free');
        }
      }
    };

    checkUser();

    // Listen for auth changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, [hasShownPaywall]);

  const handleRevenueCatPurchase = async () => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    
    setShowPaywall(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    setPaymentMethod(method);
    setIsLoading(true);
    
    try {
      // Simulate RevenueCat API call
      console.log('🛒 RevenueCat purchase initiated...', method);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user plan in Supabase
      if (user) {
        // For demo users, update localStorage
        if (user.id?.startsWith('demo-')) {
          const demoUser = JSON.parse(localStorage.getItem('demoUser'));
          if (demoUser) {
            demoUser.plan = 'premium';
            localStorage.setItem('demoUser', JSON.stringify(demoUser));
          }
        } else if (isSupabaseConfigured()) {
          // Update Supabase
          const { error } = await supabase
            .from('user_plans')
            .upsert({
              user_id: user.id,
              plan_type: 'premium',
              weekly_minutes_limit: 999, // Unlimited
              sessions_per_week_limit: 999 // Unlimited
            });
            
          if (error) {
            console.error('Error updating plan:', error);
            throw new Error('Failed to update subscription');
          }
          
          // Log purchase in a new subscriptions table
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              plan_type: 'premium',
              payment_method: method,
              amount: 399,
              currency: 'INR',
              subscription_start: new Date().toISOString(),
              subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              status: 'active'
            });
            
          if (subscriptionError) {
            console.error('Error logging subscription:', subscriptionError);
          }
        }
        
        setUserPlan('premium');
      }
      
      alert(t('purchaseSuccess'));
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(t('purchaseError'));
    } finally {
      setIsLoading(false);
      setShowPaywall(false);
    }
  };

  const handleFreeTrial = () => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    
    alert(t('freeTrialStarted'));
  };

  const getRemainingConsultations = () => {
    if (userPlan === 'premium') return '∞';
    return Math.max(0, 2 - consultationsUsed);
  };

  const closePaywall = () => {
    setShowPaywall(false);
    setPaymentMethod('');
    setIsLoading(false);
  };

  return (
    <div className="price-page">
      <div className="price-hero">
        <h1>Choose Your Healthcare Plan</h1>
        <p>Affordable healthcare for everyone - Start free, upgrade when you need more</p>
      </div>

      <div className="pricing-container">
        {/* Free Plan Card */}
        <div className="pricing-card free-plan">
          <div className="plan-header">
            <div className="plan-icon">🆓</div>
            <h2>Free Plan</h2>
            <div className="plan-price">
              <span className="currency">₹</span>
              <span className="amount">0</span>
              <span className="period">/month</span>
            </div>
          </div>

          <div className="plan-features">
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>2 AI consultations per month</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Basic symptoms checker</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Mental health resources</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Emergency contact access</span>
            </div>
            <div className="feature-item limited">
              <span className="feature-icon limited">✕</span>
              <span>Limited specialist access</span>
            </div>
          </div>

          {user && userPlan === 'free' && (
            <div className="usage-tracker">
              <div className="usage-info">
                <span>Consultations Used: {consultationsUsed}/2</span>
                <span>Remaining: {getRemainingConsultations()}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ width: `${(consultationsUsed / 2) * 100}%` }}
                ></div>
              </div>
              
              <div className="usage-info" style={{ marginTop: '1rem' }}>
                <span>Total Bookings: {bookingsCount}</span>
                {bookingsCount >= 2 && (
                  <span style={{ color: '#dc3545' }}>Limit reached</span>
                )}
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ 
                    width: `${Math.min(bookingsCount / 2, 1) * 100}%`,
                    background: bookingsCount >= 2 ? '#dc3545' : undefined
                  }}
                ></div>
              </div>
            </div>
          )}

          <button 
            className="plan-button free-button"
            onClick={handleFreeTrial}
            disabled={user && userPlan === 'free'}
          >
            {user && userPlan === 'free' ? 'Current Plan' : 'Start Free'}
          </button>
        </div>

        {/* Premium Plan Card */}
        <div className="pricing-card premium-plan">
          <div className="popular-badge">Most Popular</div>
          
          <div className="plan-header">
            <div className="plan-icon">👑</div>
            <h2>Premium Plan</h2>
            <div className="plan-price">
              <span className="currency">₹</span>
              <span className="amount">399</span>
              <span className="period">/month</span>
            </div>
            <div className="savings-badge">Save ₹1,200 annually</div>
          </div>

          <div className="plan-features">
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Unlimited AI consultations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Priority doctor booking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>24/7 specialist access</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Advanced health analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Personalized health plans</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Family health management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon check">✓</span>
              <span>Premium mental health support</span>
            </div>
          </div>

          <button 
            className="plan-button premium-button"
            onClick={handleRevenueCatPurchase}
            disabled={isLoading || (user && userPlan === 'premium')}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : user && userPlan === 'premium' ? (
              'Current Plan'
            ) : (
              'Upgrade to Premium'
            )}
          </button>

          {userPlan === 'premium' && (
            <div className="premium-status">
              <span className="status-icon">🎉</span>
              <span>Premium Plan Active</span>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>What's included in the free plan?</h3>
            <p>The free plan includes 2 AI consultations per month, basic symptoms checker, mental health resources, and emergency contact access.</p>
          </div>
          <div className="faq-item">
            <h3>Can I cancel my premium subscription anytime?</h3>
            <p>Yes, you can cancel your premium subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h3>Are the doctors certified?</h3>
            <p>Yes, all doctors on our platform are certified medical professionals with valid licenses and extensive experience.</p>
          </div>
          <div className="faq-item">
            <h3>Is my health data secure?</h3>
            <p>Absolutely. We use bank-level encryption and comply with all healthcare data protection regulations to keep your information secure.</p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="trust-section">
        <h2>Why Choose VitalPulse?</h2>
        <div className="trust-indicators">
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>All payments are processed securely with bank-level encryption</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">↩️</div>
            <h3>30-Day Money Back</h3>
            <p>Not satisfied? Get a full refund within 30 days</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🏥</div>
            <h3>Certified Doctors</h3>
            <p>All our doctors are licensed and verified medical professionals</p>
          </div>
        </div>
      </div>

      {/* RevenueCat Paywall Modal */}
      {showPaywall && (
        <div className="paywall-modal">
          <div className="paywall-content">
            <div className="paywall-header">
              <h2>Upgrade to Premium</h2>
              <button className="close-btn" onClick={closePaywall}>✕</button>
            </div>
            <div className="paywall-body">
              <div className="paywall-icon">👑</div>
              <h3>VitalPulse Premium</h3>
              <div className="paywall-price">₹399/month</div>
              
              <div className="paywall-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Unlimited AI consultations</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Priority doctor booking</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>24/7 specialist access</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Family health management</span>
                </div>
              </div>
              
              <div className="payment-options">
                <button 
                  className="payment-btn upi"
                  onClick={() => handlePaymentMethodSelect('upi')}
                  disabled={isLoading}
                >
                  {isLoading && paymentMethod === 'upi' ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    'Pay with UPI'
                  )}
                </button>
                <button 
                  className="payment-btn card"
                  onClick={() => handlePaymentMethodSelect('card')}
                  disabled={isLoading}
                >
                  {isLoading && paymentMethod === 'card' ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    'Pay with Card'
                  )}
                </button>
                <button 
                  className="payment-btn wallet"
                  onClick={() => handlePaymentMethodSelect('wallet')}
                  disabled={isLoading}
                >
                  {isLoading && paymentMethod === 'wallet' ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    'Pay with Wallet'
                  )}
                </button>
              </div>
              
              <div className="payment-security">
                <span className="security-icon">🔒</span>
                <span>Secure payment processed by RevenueCat</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Price;