import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './MythBuster.css';

function MythBuster() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myths, setMyths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showMythForm, setShowMythForm] = useState(false);
  const [mythFormData, setMythFormData] = useState({
    myth_text: '',
    fact_text: '',
    category: 'mental_health',
    source_url: ''
  });

  // Myth categories with translations
  const mythCategories = {
    all: {
      en: 'All Categories'
    },
    mental_health: {
      en: 'Mental Health'
    },
    nutrition: {
      en: 'Nutrition & Diet'
    },
    pregnancy: {
      en: 'Pregnancy & Childbirth'
    },
    traditional_medicine: {
      en: 'Traditional Medicine'
    },
    general_health: {
      en: 'General Health'
    }
  };

  // Comprehensive sample myths for demonstration (30 myths for better variety)
  const sampleMyths = {
    en: [
      // Mental Health (6 myths)
      {
        myth: "Mental health problems are a sign of weakness",
        fact: "Mental health conditions are medical conditions, just like diabetes or heart disease. They are not a sign of weakness or personal failure. They require proper medical treatment and support.",
        category: "mental_health"
      },
      {
        myth: "Depression is just sadness that will go away on its own",
        fact: "Depression is a serious medical condition that affects brain chemistry and requires proper treatment. It's not just sadness and won't simply disappear without intervention.",
        category: "mental_health"
      },
      {
        myth: "Anxiety is just being nervous and everyone experiences it",
        fact: "Anxiety disorders are serious mental health conditions that significantly impact daily life and require professional treatment. They're different from normal nervousness.",
        category: "mental_health"
      },
      {
        myth: "People with mental illness are violent and dangerous",
        fact: "People with mental health conditions are more likely to be victims of violence than perpetrators. The vast majority are not violent and pose no danger to others.",
        category: "mental_health"
      },
      {
        myth: "Therapy is only for crazy people",
        fact: "Therapy is a valuable tool for anyone looking to improve their mental health, cope with stress, or work through life challenges. It's a sign of strength to seek help.",
        category: "mental_health"
      },
      {
        myth: "Children don't get depressed",
        fact: "Children and adolescents can experience depression and other mental health conditions. Early intervention is crucial for their development and well-being.",
        category: "mental_health"
      },
      
      // Nutrition & Diet (6 myths)
      {
        myth: "Eating rice at night causes weight gain",
        fact: "Weight gain depends on total caloric intake and expenditure, not the timing of specific foods. Rice can be part of a healthy dinner when consumed in appropriate portions.",
        category: "nutrition"
      },
      {
        myth: "Eating fat makes you fat",
        fact: "Healthy fats are essential for body function. Weight gain comes from consuming more calories than you burn, regardless of the macronutrient source.",
        category: "nutrition"
      },
      {
        myth: "Detox diets cleanse your body of toxins",
        fact: "Your liver and kidneys naturally detoxify your body. Commercial detox diets are unnecessary and can be harmful. A balanced diet supports natural detoxification.",
        category: "nutrition"
      },
      {
        myth: "Carbs are bad for you and should be avoided",
        fact: "Carbohydrates are an important energy source for your body. Complex carbs from whole grains, fruits, and vegetables are part of a healthy diet.",
        category: "nutrition"
      },
      {
        myth: "Eating late at night causes weight gain",
        fact: "Weight gain is about total calories consumed versus calories burned, not when you eat. However, late-night eating may lead to poor food choices.",
        category: "nutrition"
      },
      {
        myth: "All calories are equal",
        fact: "While calories matter for weight, the source matters for health. 100 calories from vegetables provide different nutrients than 100 calories from candy.",
        category: "nutrition"
      },
      
      // Pregnancy & Childbirth (6 myths)
      {
        myth: "Pregnant women should eat for two people",
        fact: "Pregnant women need only about 300 extra calories per day in the second and third trimesters, not double the food intake. Quality of nutrition matters more than quantity.",
        category: "pregnancy"
      },
      {
        myth: "Exercise during pregnancy is dangerous",
        fact: "Regular, moderate exercise during pregnancy is beneficial for both mother and baby when approved by healthcare providers. It can reduce complications and improve outcomes.",
        category: "pregnancy"
      },
      {
        myth: "Morning sickness means you're having a girl",
        fact: "Morning sickness severity has no correlation with baby's gender. It's caused by hormonal changes during pregnancy and varies greatly between individuals.",
        category: "pregnancy"
      },
      {
        myth: "You can't fly during pregnancy",
        fact: "Flying is generally safe during pregnancy, especially in the second trimester. Consult your doctor and take precautions like staying hydrated and moving regularly.",
        category: "pregnancy"
      },
      {
        myth: "Pregnant women can't eat fish",
        fact: "Fish is an excellent source of protein and omega-3 fatty acids. Pregnant women should avoid high-mercury fish but can safely eat low-mercury options like salmon.",
        category: "pregnancy"
      },
      {
        myth: "Heartburn during pregnancy means the baby will have lots of hair",
        fact: "Heartburn during pregnancy is caused by hormonal changes and the growing uterus pressing on the stomach. It has no relation to the baby's hair growth.",
        category: "pregnancy"
      },
      
      // Traditional Medicine (6 myths)
      {
        myth: "Herbal medicines are always safe because they're natural",
        fact: "Natural doesn't mean safe. Many herbs can interact with medications or cause side effects. Always consult healthcare providers before using herbal remedies.",
        category: "traditional_medicine"
      },
      {
        myth: "Turmeric can cure cancer",
        fact: "While turmeric has anti-inflammatory properties, there's no scientific evidence it can cure cancer. Cancer requires proper medical treatment from qualified oncologists.",
        category: "traditional_medicine"
      },
      {
        myth: "Neem leaves can cure diabetes",
        fact: "While neem may help manage blood sugar levels, it cannot cure diabetes. Diabetes requires proper medical management, medication, and lifestyle changes.",
        category: "traditional_medicine"
      },
      {
        myth: "Ayurvedic medicines have no side effects",
        fact: "Ayurvedic medicines can have side effects and interactions with other medications. Some may contain heavy metals or other harmful substances if not properly prepared.",
        category: "traditional_medicine"
      },
      {
        myth: "Homeopathy can treat serious diseases",
        fact: "There is no scientific evidence that homeopathy is effective for treating serious diseases. It should not replace conventional medical treatment for serious conditions.",
        category: "traditional_medicine"
      },
      {
        myth: "Traditional remedies are always better than modern medicine",
        fact: "Both traditional and modern medicine have their place. The best approach often combines evidence-based treatments from both systems under medical supervision.",
        category: "traditional_medicine"
      },
      
      // General Health (6 myths)
      {
        myth: "You only need to drink water when you feel thirsty",
        fact: "Thirst is a late indicator of dehydration. Regular water intake throughout the day is essential for optimal health, especially in hot climates.",
        category: "general_health"
      },
      {
        myth: "You can catch up on lost sleep during weekends",
        fact: "Sleep debt cannot be fully repaid. Consistent sleep schedule is more important than sleeping in on weekends. Chronic sleep loss has lasting health effects.",
        category: "general_health"
      },
      {
        myth: "Cracking knuckles causes arthritis",
        fact: "Studies show no link between knuckle cracking and arthritis. The sound comes from gas bubbles in joint fluid. However, excessive force could potentially cause injury.",
        category: "general_health"
      },
      {
        myth: "You need 8 glasses of water per day",
        fact: "Water needs vary by individual, activity level, climate, and overall health. Listen to your body and drink when thirsty, but don't force excessive water intake.",
        category: "general_health"
      },
      {
        myth: "Reading in dim light damages your eyes",
        fact: "Reading in poor light may cause eye strain and fatigue, but it doesn't cause permanent damage to your vision. However, good lighting is more comfortable.",
        category: "general_health"
      },
      {
        myth: "Cold weather makes you sick",
        fact: "Cold weather itself doesn't cause illness. Viruses cause colds and flu. However, cold weather may weaken immune response and people spend more time indoors together.",
        category: "general_health"
      }
    ]
  };

  useEffect(() => {
    // Check for user authentication
    const checkUser = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        return;
      }

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
    loadMyths();
  }, [selectedCategory, sortBy]);

  const loadMyths = async () => {
    setIsLoading(true);
    
    try {
      // Always use sample data for demonstration
      const sampleData = sampleMyths.en;
      const filteredData = selectedCategory === 'all' 
        ? sampleData 
        : sampleData.filter(myth => myth.category === selectedCategory);
      
      // Add mock data for demonstration with more realistic data
      const mythsWithMockData = filteredData.map((myth, index) => ({
        id: `sample-${index}`,
        myth_text: myth.myth,
        fact_text: myth.fact,
        category: myth.category,
        language: 'en',
        upvotes: Math.floor(Math.random() * 150) + 20, // 20-170 upvotes
        downvotes: Math.floor(Math.random() * 30) + 1, // 1-30 downvotes
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        user_email: [
          'dr.sharma@vitalpulse.ai',
          'health.expert@vitalpulse.ai',
          'medical.team@vitalpulse.ai',
          'community@vitalpulse.ai',
          'research@vitalpulse.ai'
        ][Math.floor(Math.random() * 5)],
        source_url: [
          'https://who.int',
          'https://mayoclinic.org',
          'https://webmd.com',
          'https://healthline.com',
          'https://medicalnewstoday.com'
        ][Math.floor(Math.random() * 5)],
        reddit_post_id: Math.random() > 0.5 ? `reddit_${Math.random().toString(36).substring(7)}` : null,
        reddit_upvotes: Math.floor(Math.random() * 100) + 10
      }));
      
      // Sort the myths based on sortBy
      const sortedMyths = [...mythsWithMockData].sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'oldest':
            return new Date(a.created_at) - new Date(b.created_at);
          case 'most_upvoted':
            return b.upvotes - a.upvotes;
          case 'controversial':
            return b.downvotes - a.downvotes;
          default:
            return new Date(b.created_at) - new Date(a.created_at);
        }
      });
      
      setMyths(sortedMyths);
    } catch (error) {
      console.error('Error loading myths:', error);
      // Fallback to empty array on error
      setMyths([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMythFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitMythToReddit = async (mythData) => {
    try {
      // Simulate Reddit API integration
      console.log('📝 Submitting to Reddit via simulated API...');
      
      // Simulate Reddit response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        reddit_post_id: 'mock_' + Math.random().toString(36).substring(7),
        reddit_url: 'https://reddit.com/r/HealthMyths/mock_post',
        reddit_upvotes: 1
      };
    } catch (error) {
      console.error('Reddit submission failed:', error);
      return null;
    }
  };

  const handleSubmitMyth = async (e) => {
    e.preventDefault();

    if (!mythFormData.myth_text || !mythFormData.fact_text) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Reddit first
      const redditData = await submitMythToReddit(mythFormData);
      
      const mythRecord = {
        user_id: user?.id || 'guest-' + Math.random().toString(36).substring(2, 9),
        user_email: user?.email || 'guest@vitalpulse.ai',
        myth_text: mythFormData.myth_text,
        fact_text: mythFormData.fact_text,
        category: mythFormData.category,
        language: 'en',
        source_url: mythFormData.source_url || null,
        upvotes: 1, // Initial upvote from creator
        downvotes: 0,
        reddit_post_id: redditData?.reddit_post_id || null,
        reddit_url: redditData?.reddit_url || null,
        reddit_upvotes: redditData?.reddit_upvotes || 0,
        created_at: new Date().toISOString()
      };

      // Add the new myth to the existing myths
      setMyths(prevMyths => [
        {
          ...mythRecord,
          id: `user-${Date.now()}`
        },
        ...prevMyths
      ]);

      // Reset form
      setMythFormData({
        myth_text: '',
        fact_text: '',
        category: 'mental_health',
        source_url: ''
      });
      setShowMythForm(false);
      
      alert('Myth submitted successfully and shared on Reddit!');

    } catch (error) {
      console.error('Error submitting myth:', error);
      alert('Failed to submit myth. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (mythId, voteType) => {
    // Simulate voting for demo
    setMyths(prev => prev.map(myth => {
      if (myth.id === mythId) {
        return {
          ...myth,
          upvotes: voteType === 'up' ? myth.upvotes + 1 : myth.upvotes,
          downvotes: voteType === 'down' ? myth.downvotes + 1 : myth.downvotes
        };
      }
      return myth;
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  const getVoteScore = (myth) => {
    return myth.upvotes - myth.downvotes;
  };

  const getVotePercentage = (myth) => {
    const total = myth.upvotes + myth.downvotes;
    if (total === 0) return 100;
    return Math.round((myth.upvotes / total) * 100);
  };

  return (
    <div className="mythbuster">
      <div className="mythbuster-container">
        {/* Main Content Section */}
        <div className="myths-section">
          <div className="myths-header">
            <h2>Health Myths & Facts</h2>
            <div className="myths-count">
              {isLoading ? 'Loading...' : `${myths.length} myths found`}
            </div>
          </div>

          {/* Controls Section */}
          <div className="mythbuster-controls">
            <div className="controls-row">
              <div className="category-filter">
                <label htmlFor="category">Filter by Category:</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(mythCategories).map(([key, translations]) => (
                    <option key={key} value={key}>
                      {translations.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sort-filter">
                <label htmlFor="sort">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most_upvoted">Most Upvoted</option>
                  <option value="controversial">Controversial</option>
                </select>
              </div>

              <button 
                className="add-myth-btn"
                onClick={() => setShowMythForm(!showMythForm)}
              >
                {showMythForm ? 'Cancel' : 'Add New Myth'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner-large"></div>
              <p>Loading health myths...</p>
            </div>
          ) : (
            <div className="myths-content">
              {myths.length === 0 ? (
                <div className="no-myths">
                  <div className="no-myths-icon">🔍</div>
                  <h3>No Myths Found</h3>
                  <p>Be the first to submit a health myth for this category and help educate your community!</p>
                  <button 
                    className="add-first-myth-btn"
                    onClick={() => setShowMythForm(true)}
                  >
                    Add First Myth
                  </button>
                </div>
              ) : (
                <div className="myths-grid">
                  {myths.map((myth) => (
                    <div key={myth.id} className="myth-card">
                      <div className="myth-header">
                        <div className="myth-category">
                          <span className="category-badge">
                            {mythCategories[myth.category]?.en || myth.category}
                          </span>
                          <span className="myth-date">{formatDate(myth.created_at)}</span>
                        </div>
                        
                        <div className="vote-section">
                          <button 
                            className="vote-btn upvote"
                            onClick={() => handleVote(myth.id, 'up')}
                            title="Upvote"
                          >
                            ⬆️
                          </button>
                          <span className="vote-score">{getVoteScore(myth)}</span>
                          <button 
                            className="vote-btn downvote"
                            onClick={() => handleVote(myth.id, 'down')}
                            title="Downvote"
                          >
                            ⬇️
                          </button>
                        </div>
                      </div>

                      <div className="myth-content">
                        <div className="myth-statement">
                          <h3>Myth:</h3>
                          <p className="myth-text">"{myth.myth_text}"</p>
                        </div>

                        <div className="fact-statement">
                          <h3>Fact:</h3>
                          <p className="fact-text">{myth.fact_text}</p>
                        </div>
                      </div>

                      <div className="myth-footer">
                        <div className="myth-stats">
                          <span className="upvote-percentage">
                            👍 {getVotePercentage(myth)}% helpful
                          </span>
                          <span className="total-votes">
                            ({myth.upvotes + myth.downvotes} votes)
                          </span>
                        </div>

                        <div className="myth-actions">
                          {myth.source_url && (
                            <a 
                              href={myth.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="source-link"
                            >
                              📚 View Source
                            </a>
                          )}
                          
                          {myth.reddit_post_id && (
                            <a 
                              href={myth.reddit_url || `https://reddit.com/comments/${myth.reddit_post_id}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="reddit-link"
                            >
                              🔗 View on Reddit ({myth.reddit_upvotes || 0})
                            </a>
                          )}
                        </div>

                        <div className="myth-author">
                          Submitted by: {myth.user_email?.split('@')[0] || 'Anonymous'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Myth Form */}
        {showMythForm && (
          <div className="myth-form-section">
            <div className="myth-form-card">
              <h2>Submit New Health Myth</h2>
              <form onSubmit={handleSubmitMyth} className="myth-form">
                <div className="form-group">
                  <label htmlFor="myth_text">Myth Statement *</label>
                  <textarea
                    id="myth_text"
                    name="myth_text"
                    value={mythFormData.myth_text}
                    onChange={handleInputChange}
                    placeholder="Enter the health myth you want to debunk (e.g., 'Mental health is weakness')"
                    className="form-textarea"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fact_text">Factual Correction *</label>
                  <textarea
                    id="fact_text"
                    name="fact_text"
                    value={mythFormData.fact_text}
                    onChange={handleInputChange}
                    placeholder="Provide the scientific fact that corrects this myth with evidence"
                    className="form-textarea"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={mythFormData.category}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {Object.entries(mythCategories).slice(1).map(([key, translations]) => (
                        <option key={key} value={key}>
                          {translations.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="source_url">Source URL</label>
                    <input
                      type="url"
                      id="source_url"
                      name="source_url"
                      value={mythFormData.source_url}
                      onChange={handleInputChange}
                      placeholder="https://who.int/article-link (optional)"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-myth-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        📝 Submit & Share on Reddit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <h2>Why Health Myth Busting Matters</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">🧠</div>
              <h3>Educate the Public</h3>
              <p>Combat dangerous health misinformation that affects rural communities across India.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🔬</div>
              <h3>Evidence-Based Facts</h3>
              <p>All corrections are backed by scientific research and trusted medical sources.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🌍</div>
              <h3>Community Driven</h3>
              <p>Healthcare professionals and educated citizens work together to fight myths.</p>
            </div>
            <div className="info-item">
              <div className="info-icon">📱</div>
              <h3>Social Sharing</h3>
              <p>Automatically share debunked myths on Reddit to reach wider audiences.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MythBuster;