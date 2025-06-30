import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './MentalIssueSolution.css';

function MentalIssueSolution() {
  const { t, i18n } = useTranslation();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef(null);

  // Mental health issues with translations and emojis
  const mentalIssues = {
    stress: {
      en: 'Stress & Anxiety',
      hi: 'तनाव और चिंता',
      ta: 'மன அழுத்தம் மற்றும் கவலை',
      emoji: '😰'
    },
    depression: {
      en: 'Depression & Sadness',
      hi: 'अवसाद और उदासी',
      ta: 'மனச்சோர்வு மற்றும் துக்கம்',
      emoji: '😔'
    },
    sleep: {
      en: 'Sleep Disorders',
      hi: 'नींद की समस्याएं',
      ta: 'தூக்கமின்மை பிரச்சினைகள்',
      emoji: '😴'
    },
    anger: {
      en: 'Anger Management',
      hi: 'गुस्से पर नियंत्रण',
      ta: 'கோப மேலாண்மை',
      emoji: '😠'
    },
    focus: {
      en: 'Concentration Issues',
      hi: 'एकाग्रता की समस्या',
      ta: 'கவனம் செலுத்துவதில் சிக்கல்',
      emoji: '🧠'
    },
    relationships: {
      en: 'Relationship Problems',
      hi: 'रिश्तों की समस्याएं',
      ta: 'உறவு பிரச்சினைகள்',
      emoji: '💔'
    }
  };

  // Direct video URLs from Supabase
  const videoUrls = {
    stress: 'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos//Stressed.mp4',
    depression: 'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos//Depressed%20(1).mp4',
    sleep: 'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos//Sleep%20Disorder.mp4',
    anger: 'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos//Anger%20managment%20(1).mp4',
    focus: 'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos//Concentration.mp4'
  };

  // Audio URLs from Supabase
  const audioUrls = [
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-birds_singing_with_b-1751215633449.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Bright,_Glistening_S-1751214343447.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Calming_birdsong_wit-1749984722520.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Consistent_Rainfall_-1751214597901.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Flowing_River_with_S-1751214011911.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Lively_Forest_Birdso-1751214061708.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Lively_Forest_Birdso-1751214067636.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Lively_Forest_Birdso-1751214071378.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Sleep_Inducing_Guide-1751214037132.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Subtle,_Intermittent-1751214766949.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Subtle,_Intermittent-1751214775080.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-Theta_Waves_(4-8_Hz)-1751213827684.mp3',
    'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios//11L-waterfall_at_the_sil-1751215522565.mp3'
  ];

  // MindMeld AI suggestions with multimedia content
  const mindMeldSuggestions = {
    stress: {
      en: {
        title: 'Pranayama Breathing for Stress Relief',
        description: 'Ancient breathing techniques proven to reduce cortisol levels and calm the nervous system.',
        steps: [
          'Sit comfortably with spine straight',
          'Close your eyes and breathe naturally',
          'Inhale for 4 counts through nose',
          'Hold breath for 4 counts',
          'Exhale for 6 counts through mouth',
          'Repeat for 10-15 minutes daily'
        ],
        videoTitle: 'Guided Stress Relief Session',
        audioTitle: 'Calming Nature Sounds for Meditation'
      },
      hi: {
        title: 'तनाव राहत के लिए प्राणायाम श्वास',
        description: 'प्राचीन श्वास तकनीकें जो कॉर्टिसोल के स्तर को कम करने और तंत्रिका तंत्र को शांत करने में सिद्ध हैं।',
        steps: [
          'रीढ़ सीधी करके आराम से बैठें',
          'आंखें बंद करें और प्राकृतिक रूप से सांस लें',
          'नाक से 4 गिनती तक सांस लें',
          '4 गिनती तक सांस रोकें',
          'मुंह से 6 गिनती तक सांस छोड़ें',
          'दैनिक 10-15 मिनट तक दोहराएं'
        ],
        videoTitle: 'निर्देशित प्राणायाम सत्र',
        audioTitle: 'ध्यान के लिए शांत प्राकृतिक ध्वनियां'
      },
      ta: {
        title: 'மன அழுத்தம் நீக்க பிராணாயாம சுவாசம்',
        description: 'கார்டிசால் அளவைக் குறைத்து நரம்பு மண்டலத்தை அமைதிப்படுத்த நிரூபிக்கப்பட்ட பண்டைய சுவாச நுட்பங்கள்.',
        steps: [
          'முதுகுத்தண்டு நேராக வைத்து வசதியாக அமரவும்',
          'கண்களை மூடி இயற்கையாக சுவாசிக்கவும்',
          'மூக்கு வழியாக 4 எண்ணிக்கை வரை மூச்சு இழுக்கவும்',
          '4 எண்ணிக்கை வரை மூச்சை நிறுத்தவும்',
          'வாய் வழியாக 6 எண்ணிக்கை வரை மூச்சை வெளியிடவும்',
          'தினமும் 10-15 நிமிடங்கள் மீண்டும் செய்யவும்'
        ],
        videoTitle: 'வழிகாட்டப்பட்ட பிராணாயாம அமர்வு',
        audioTitle: 'தியானத்திற்கான அமைதியான இயற்கை ஒலிகள்'
      }
    },
    depression: {
      en: {
        title: 'Surya Namaskara (Sun Salutation) for Mood Enhancement',
        description: 'Dynamic yoga sequence that boosts serotonin and endorphin production naturally.',
        steps: [
          'Start in Mountain Pose (Tadasana)',
          'Raise arms overhead (Urdhva Hastasana)',
          'Forward fold (Uttanasana)',
          'Half lift (Ardha Uttanasana)',
          'Low push-up (Chaturanga)',
          'Upward facing dog (Urdhva Mukha)',
          'Downward facing dog (Adho Mukha)',
          'Return to standing'
        ],
        videoTitle: 'Guided Depression Relief Session',
        audioTitle: 'Uplifting Mantras for Positive Energy'
      },
      hi: {
        title: 'मूड बेहतर बनाने के लिए सूर्य नमस्कार',
        description: 'गतिशील योग अनुक्रम जो प्राकृतिक रूप से सेरोटोनिन और एंडोर्फिन उत्पादन को बढ़ाता है।',
        steps: [
          'पर्वत मुद्रा (ताड़ासन) में शुरू करें',
          'हाथों को ऊपर उठाएं (ऊर्ध्व हस्तासन)',
          'आगे की ओर झुकें (उत्तानासन)',
          'आधा उठाव (अर्ध उत्तानासन)',
          'नीचा पुश-अप (चतुरंग)',
          'ऊपर की ओर मुंह वाला कुत्ता (ऊर्ध्व मुख)',
          'नीचे की ओर मुंह वाला कुत्ता (अधो मुख)',
          'खड़े होने की स्थिति में वापस आएं'
        ],
        videoTitle: 'सुबह का सूर्य नमस्कार प्रवाह',
        audioTitle: 'सकारात्मक ऊर्जा के लिए उत्थानकारी मंत्र'
      },
      ta: {
        title: 'மனநிலை மேம்பாட்டிற்கான சூர்ய நமஸ்காரம்',
        description: 'செரோடோனின் மற்றும் எண்டோர்பின் உற்பத்தியை இயற்கையாக அதிகரிக்கும் ஆற்றல்மிக்க யோகா வரிசை.',
        steps: [
          'மலை போஸில் (தாடாசனம்) தொடங்கவும்',
          'கைகளை மேல் நோக்கி உயர்த்தவும் (ஊர்த்வ ஹஸ்தாசனம்)',
          'முன்னோக்கி மடிக்கவும் (உத்தானாசனம்)',
          'அரை உயர்த்தல் (அர்த்த உத்தானாசனம்)',
          'தாழ்வான புஷ்-அப் (சதுரங்கம்)',
          'மேல்நோக்கிய நாய் (ஊர்த்வ முகம்)',
          'கீழ்நோக்கிய நாய் (அதோ முகம்)',
          'நிற்கும் நிலைக்கு திரும்பவும்'
        ],
        videoTitle: 'காலை சூர்ய நமஸ்கார ஓட்டம்',
        audioTitle: 'நேர்மறை ஆற்றலுக்கான உற்சாகமூட்டும் மந்திரங்கள்'
      }
    },
    sleep: {
      en: {
        title: 'Yoga Nidra for Deep Sleep',
        description: 'Guided body scan meditation that activates the parasympathetic nervous system for restful sleep.',
        steps: [
          'Lie down in Savasana (corpse pose)',
          'Close eyes and breathe naturally',
          'Scan body from toes to head',
          'Release tension in each body part',
          'Visualize peaceful imagery',
          'Set positive sleep intentions',
          'Allow natural drift into sleep'
        ],
        videoTitle: 'Sleep Disorder Relief Session',
        audioTitle: 'Sleep-Inducing Binaural Beats'
      },
      hi: {
        title: 'गहरी नींद के लिए योग निद्रा',
        description: 'निर्देशित शरीर स्कैन ध्यान जो आरामदायक नींद के लिए पैरासिम्पैथेटिक तंत्रिका तंत्र को सक्रिय करता है।',
        steps: [
          'शवासन (शव मुद्रा) में लेट जाएं',
          'आंखें बंद करें और प्राकृतिक रूप से सांस लें',
          'पैर की उंगलियों से सिर तक शरीर को स्कैन करें',
          'शरीर के हर हिस्से में तनाव छोड़ें',
          'शांतिपूर्ण चित्रों की कल्पना करें',
          'सकारात्मक नींद के इरादे सेट करें',
          'प्राकृतिक रूप से नींद में जाने दें'
        ],
        videoTitle: 'सोने के समय योग निद्रा सत्र',
        audioTitle: 'नींद लाने वाली बाइनॉरल बीट्स'
      },
      ta: {
        title: 'ஆழ்ந்த தூக்கத்திற்கான யோக நித்ரா',
        description: 'அமைதியான தூக்கத்திற்கான பாராசிம்பதெடிக் நரம்பு மண்டலத்தை செயல்படுத்தும் வழிகாட்டப்பட்ட உடல் ஸ்கேன் தியானம்.',
        steps: [
          'சவாசனத்தில் (பிணம் போஸ்) படுக்கவும்',
          'கண்களை மூடி இயற்கையாக சுவாசிக்கவும்',
          'கால் விரல்களிலிருந்து தலை வரை உடலை ஸ்கேன் செய்யவும்',
          'உடலின் ஒவ்வொரு பகுதியிலும் பதற்றத்தை விடுவிக்கவும்',
          'அமைதியான படங்களை கற்பனை செய்யவும்',
          'நேர்மறை தூக்க நோக்கங்களை அமைக்கவும்',
          'இயற்கையாக தூக்கத்தில் செல்ல அனுமதிக்கவும்'
        ],
        videoTitle: 'படுக்கை நேர யோக நித்ரா அமர்வு',
        audioTitle: 'தூக்கத்தை தூண்டும் பைனாரல் பீட்ஸ்'
      }
    },
    anger: {
      en: {
        title: 'Cooling Pranayama (Sheetali) for Anger Management',
        description: 'Cooling breath technique that reduces body heat and calms aggressive emotions.',
        steps: [
          'Sit in comfortable meditation pose',
          'Curl tongue into tube shape',
          'Inhale slowly through curled tongue',
          'Close mouth and hold breath briefly',
          'Exhale slowly through nose',
          'Feel cooling sensation throughout body',
          'Practice for 5-10 minutes when angry'
        ],
        videoTitle: 'Anger Management Session',
        audioTitle: 'Peaceful Water Sounds for Cooling'
      },
      hi: {
        title: 'गुस्से के प्रबंधन के लिए शीतली प्राणायाम',
        description: 'शीतलन श्वास तकनीक जो शरीर की गर्मी को कम करती है और आक्रामक भावनाओं को शांत करती है।',
        steps: [
          'आरामदायक ध्यान मुद्रा में बैठें',
          'जीभ को ट्यूब के आकार में मोड़ें',
          'मुड़ी हुई जीभ से धीरे-धीरे सांस लें',
          'मुंह बंद करें और थोड़ी देर सांस रोकें',
          'नाक से धीरे-धीरे सांस छोड़ें',
          'पूरे शरीर में ठंडक की अनुभूति करें',
          'गुस्से के समय 5-10 मिनट तक अभ्यास करें'
        ],
        videoTitle: 'गुस्सा प्रबंधन योग प्रवाह',
        audioTitle: 'ठंडक के लिए शांतिपूर्ण पानी की आवाज़ें'
      },
      ta: {
        title: 'கோப மேலாண்மைக்கான குளிர்ச்சி பிராணாயாமம் (சீதலி)',
        description: 'உடல் வெப்பத்தை குறைத்து ஆக்கிரமிப்பு உணர்வுகளை அமைதிப்படுத்தும் குளிர்ச்சி சுவாச நுட்பம்.',
        steps: [
          'வசதியான தியான நிலையில் அமரவும்',
          'நாக்கை குழாய் வடிவில் சுருட்டவும்',
          'சுருட்டிய நாக்கு வழியாக மெதுவாக மூச்சு இழுக்கவும்',
          'வாயை மூடி சிறிது நேரம் மூச்சை நிறுத்தவும்',
          'மூக்கு வழியாக மெதுவாக மூச்சை வெளியிடவும்',
          'உடல் முழுவதும் குளிர்ச்சி உணர்வை உணரவும்',
          'கோபமான போது 5-10 நிமிடங்கள் பயிற்சி செய்யவும்'
        ],
        videoTitle: 'கோப மேலாண்மை யோகா ஓட்டம்',
        audioTitle: 'குளிர்ச்சிக்கான அமைதியான நீர் ஒலிகள்'
      }
    },
    focus: {
      en: {
        title: 'Trataka (Candle Gazing) for Enhanced Concentration',
        description: 'Ancient meditation technique that strengthens focus and improves mental clarity.',
        steps: [
          'Light a candle 3 feet away',
          'Sit comfortably with spine straight',
          'Gaze at flame without blinking',
          'When eyes water, close them',
          'Visualize flame in mind\'s eye',
          'Open eyes and repeat process',
          'Practice for 10-20 minutes daily'
        ],
        videoTitle: 'Concentration Enhancement Session',
        audioTitle: 'Focus-Enhancing Binaural Frequencies'
      },
      hi: {
        title: 'बेहतर एकाग्रता के लिए त्राटक (मोमबत्ती देखना)',
        description: 'प्राचीन ध्यान तकनीक जो फोकस को मजबूत करती है और मानसिक स्पष्टता में सुधार करती है।',
        steps: [
          '3 फीट दूर मोमबत्ती जलाएं',
          'रीढ़ सीधी करके आराम से बैठें',
          'बिना पलक झपकाए लौ को देखें',
          'जब आंखों में पानी आए तो उन्हें बंद करें',
          'मन की आंख में लौ की कल्पना करें',
          'आंखें खोलें और प्रक्रिया दोहराएं',
          'दैनिक 10-20 मिनट तक अभ्यास करें'
        ],
        videoTitle: 'एकाग्रता वृद्धि ध्यान',
        audioTitle: 'फोकस बढ़ाने वाली बाइनॉरल आवृत्तियां'
      },
      ta: {
        title: 'மேம்பட்ட கவனத்திற்கான திராடகம் (மெழுகுவர்த்தி பார்த்தல்)',
        description: 'கவனத்தை வலுப்படுத்தி மன தெளிவை மேம்படுத்தும் பண்டைய தியான நுட்பம்.',
        steps: [
          '3 அடி தூரத்தில் மெழுகுவர்த்தி ஏற்றவும்',
          'முதுகுத்தண்டு நேராக வைத்து வசதியாக அமரவும்',
          'கண் சிமிட்டாமல் சுடரைப் பாருங்கள்',
          'கண்களில் நீர் வரும்போது அவற்றை மூடவும்',
          'மனக் கண்ணில் சுடரை கற்பனை செய்யவும்',
          'கண்களைத் திறந்து செயல்முறையை மீண்டும் செய்யவும்',
          'தினமும் 10-20 நிமிடங்கள் பயிற்சி செய்யவும்'
        ],
        videoTitle: 'கவன மேம்பாட்டு தியானம்',
        audioTitle: 'கவனத்தை மேம்படுத்தும் பைனாரல் அதிர்வெண்கள்'
      }
    },
    relationships: {
      en: {
        title: 'Loving-Kindness Meditation for Better Relationships',
        description: 'Heart-opening practice that cultivates compassion and improves interpersonal connections.',
        steps: [
          'Sit quietly and close your eyes',
          'Place hand on heart center',
          'Send love to yourself first',
          'Extend love to loved ones',
          'Include difficult people',
          'Embrace all beings with compassion',
          'Feel universal connection and peace'
        ],
        videoTitle: 'Relationship Healing Session',
        audioTitle: 'Healing Heart Chakra Frequencies'
      },
      hi: {
        title: 'बेहतर रिश्तों के लिए प्रेम-दया ध्यान',
        description: 'हृदय खोलने वाला अभ्यास जो करुणा विकसित करता है और पारस्परिक संबंधों में सुधार करता है।',
        steps: [
          'चुपचाप बैठें और आंखें बंद करें',
          'हृदय केंद्र पर हाथ रखें',
          'पहले अपने लिए प्रेम भेजें',
          'प्रियजनों तक प्रेम बढ़ाएं',
          'कठिन लोगों को शामिल करें',
          'सभी प्राणियों को करुणा से गले लगाएं',
          'सार्वभौमिक संबंध और शांति महसूस करें'
        ],
        videoTitle: 'रिश्तों के लिए हृदय खोलने वाला योग',
        audioTitle: 'हृदय चक्र चिकित्सा आवृत्तियां'
      },
      ta: {
        title: 'சிறந்த உறவுகளுக்கான அன்பு-கருணை தியானம்',
        description: 'இரக்கத்தை வளர்த்து தனிநபர் தொடர்புகளை மேம்படுத்தும் இதய திறக்கும் பயிற்சி.',
        steps: [
          'அமைதியாக அமர்ந்து கண்களை மூடவும்',
          'இதய மையத்தில் கையை வைக்கவும்',
          'முதலில் உங்களுக்கு அன்பு அனுப்பவும்',
          'அன்புக்குரியவர்களுக்கு அன்பை நீட்டவும்',
          'கடினமான மக்களை சேர்க்கவும்',
          'அனைத்து உயிரினங்களையும் இரக்கத்துடன் அணைக்கவும்',
          'உலகளாவிய தொடர்பு மற்றும் அமைதியை உணரவும்'
        ],
        videoTitle: 'உறவுகளுக்கான இதய திறக்கும் யோகா',
        audioTitle: 'குணப்படுத்தும் இதய சக்ர அதிர்வெண்கள்'
      }
    }
  };

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
    // Load saved sessions for authenticated users
    if (user && isSupabaseConfigured()) {
      loadSavedSessions();
    }
  }, [user]);

  const loadSavedSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mental_health_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedSessions(data || []);
    } catch (error) {
      console.error('Error loading saved sessions:', error);
    }
  };

  // Helper function to clean and validate URLs
  const cleanUrl = (url) => {
    if (!url) return '';
    
    // Remove double slashes except after protocol
    const cleaned = url.replace(/([^:]\/)\/+/g, '$1');
    
    console.log('🧹 URL cleaning:', {
      original: url,
      cleaned: cleaned
    });
    
    return cleaned;
  };

  const fetchMediaContent = async (issueType, language) => {
    if (!isSupabaseConfigured()) return null;

    setIsMediaLoading(true);
    try {
      console.log(`🔍 Fetching media for issue: "${issueType}", language: "${language}"`);
      console.log('📊 Database query details:', {
        table: 'mental_health_relief',
        filters: {
          issue_type: issueType,
          language: language
        }
      });
      
      // First, let's check what data exists in the table
      const { data: allData, error: allError } = await supabase
        .from('mental_health_relief')
        .select('*');
      
      if (allError) {
        console.error('❌ Error fetching all data:', allError);
      } else {
        console.log('📋 All available data in mental_health_relief table:', allData);
        console.log('🔢 Total records found:', allData?.length || 0);
        
        if (allData && allData.length > 0) {
          console.log('📝 Available issue types:', [...new Set(allData.map(item => item.issue_type))]);
          console.log('🌐 Available languages:', [...new Set(allData.map(item => item.language))]);
        }
      }

      // Now try to fetch the specific record - modified to handle multiple rows
      const { data, error } = await supabase
        .from('mental_health_relief')
        .select('*')
        .eq('issue_type', issueType)
        .eq('language', language);

      if (error) {
        console.error('❌ Error fetching specific media content:', error);
        console.log('🔍 Query that failed:', {
          issue_type: issueType,
          language: language
        });
        return null;
      }

      console.log('✅ Query result for specific content:', data);
      
      // Handle the case where data is an array
      let selectedData = null;
      if (data && Array.isArray(data) && data.length > 0) {
        // Use the first matching record if multiple exist
        selectedData = data[0];
        
        if (data.length > 1) {
          console.warn(`⚠️ Multiple records found for issue_type: "${issueType}" and language: "${language}". Using the first one. Consider removing duplicates from the database.`);
          console.log('🔢 Number of duplicate records:', data.length);
        }
        
        console.log('🎥 Video URL from database:', selectedData.video_url);
        console.log('🎵 Audio URL from database:', selectedData.audio_url);
        console.log('📝 Title from database:', selectedData.title);
        console.log('📄 Description from database:', selectedData.description);
        console.log('📋 Steps from database:', selectedData.steps);
        
        // Clean the URLs
        if (selectedData.video_url) {
          selectedData.video_url = cleanUrl(selectedData.video_url);
          console.log('🧹 Cleaned video URL:', selectedData.video_url);
        }
        if (selectedData.audio_url) {
          selectedData.audio_url = cleanUrl(selectedData.audio_url);
          console.log('🧹 Cleaned audio URL:', selectedData.audio_url);
        }
      } else {
        console.log('⚠️ No content found for this issue type and language combination');
        console.log('💡 Suggestion: Check if the enum values match exactly');
      }
      
      return selectedData;
    } catch (error) {
      console.error('💥 Unexpected error fetching media content:', error);
      return null;
    } finally {
      setIsMediaLoading(false);
    }
  };

  const saveSession = async (issue, suggestion) => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      await supabase
        .from('mental_health_sessions')
        .insert({
          user_id: user.id,
          issue_type: issue,
          suggestion_title: suggestion.title,
          language: i18n.language,
          video_url: currentVideoUrl,
          audio_url: currentAudioUrl
        });
      
      loadSavedSessions();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleIssueSelect = async (issue) => {
    console.log(`🎯 Selected issue: "${issue}" in language: "${i18n.language}"`);
    
    setSelectedIssue(issue);
    setIsLoading(true);
    setMediaContent(null);
    setCurrentVideoUrl('');
    setCurrentAudioUrl('');
    setVideoError('');
    setAudioError('');

    // Set the direct video URL from Supabase
    if (videoUrls[issue]) {
      setCurrentVideoUrl(videoUrls[issue]);
      console.log('🎥 Setting direct video URL:', videoUrls[issue]);
    }

    // Select a random audio URL from the available options
    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
    setCurrentAudioUrl(randomAudioUrl);
    console.log('🎵 Setting random audio URL:', randomAudioUrl);

    // Fetch media content from Supabase
    const media = await fetchMediaContent(issue, i18n.language);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const suggestion = mindMeldSuggestions[issue][i18n.language];
      setAiSuggestion(suggestion);
      
      // Use Supabase media URLs if available
      if (media && media.video_url && !videoUrls[issue]) {
        console.log('🎥 Setting video URL from database:', media.video_url);
        setCurrentVideoUrl(media.video_url);
      }
      
      if (media && media.audio_url) {
        console.log('🎵 Setting audio URL from database:', media.audio_url);
        setCurrentAudioUrl(media.audio_url);
      }
      
      setMediaContent(media);
      setIsLoading(false);

      // Save session if user is authenticated
      if (user) {
        saveSession(issue, suggestion);
      }
    }, 2000);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        console.log('🎵 Attempting to play audio:', currentAudioUrl);
        audioRef.current.play().catch(error => {
          console.error('❌ Audio play failed:', error);
          setAudioError('Failed to play audio. Please check the audio file.');
        });
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const resetSession = () => {
    setSelectedIssue('');
    setAiSuggestion(null);
    setCurrentVideoUrl('');
    setCurrentAudioUrl('');
    setIsPlayingAudio(false);
    setMediaContent(null);
    setIsMediaLoading(false);
    setVideoError('');
    setAudioError('');
  };

  const handleVideoError = (e) => {
    console.error('❌ Video failed to load:', e);
    console.log('🎥 Video URL that failed:', currentVideoUrl);
    setVideoError('Failed to load video. Please check the video file format and URL.');
  };

  const handleAudioError = (e) => {
    console.error('❌ Audio failed to load:', e);
    console.log('🎵 Audio URL that failed:', currentAudioUrl);
    setAudioError('Failed to load audio. Please check the audio file format and URL.');
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully:', currentVideoUrl);
    setVideoError('');
  };

  const handleAudioLoad = () => {
    console.log('✅ Audio loaded successfully:', currentAudioUrl);
    setAudioError('');
  };

  return (
    <div className="mental-issue-solution">
      <div className="mental-container">
        {!selectedIssue ? (
          <div className="issue-selection">
            <h1 className="main-title">What's troubling your mind today?</h1>
            <div className="title-underline"></div>
            <p className="selection-instruction">
              Select the mental health concern you're experiencing, and our MindMeld AI will provide personalized solutions:
            </p>
            
            <div className="issues-grid">
              {Object.entries(mentalIssues).map(([key, issue]) => (
                <button
                  key={key}
                  className="issue-card"
                  onClick={() => handleIssueSelect(key)}
                >
                  <div className="issue-emoji">{issue.emoji}</div>
                  <span className="issue-text">{issue[i18n.language]}</span>
                </button>
              ))}
            </div>

            {savedSessions.length > 0 && user && (
              <div className="saved-sessions">
                <h3>{t('recentSessions')}</h3>
                <div className="sessions-list">
                  {savedSessions.map((session) => (
                    <div key={session.id} className="session-item">
                      <span className="session-title">{session.suggestion_title}</span>
                      <span className="session-date">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="solution-display">
            {isLoading ? (
              <div className="loading-state">
                <div className="mindmeld-logo">🧠✨</div>
                <h3>{t('mindMeldAnalyzing')}</h3>
                <div className="loading-spinner"></div>
                <p>{t('analyzingMentalState')}</p>
                {isMediaLoading && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                    🔍 Loading personalized content from database...
                  </p>
                )}
              </div>
            ) : (
              aiSuggestion && (
                <div className="ai-suggestion">
                  <div className="suggestion-header">
                    <div className="mindmeld-branding">
                      <span className="mindmeld-logo">🧠✨</span>
                      <span className="mindmeld-text">MindMeld AI</span>
                    </div>
                    <button className="reset-btn" onClick={resetSession}>
                      {t('tryAnother')}
                    </button>
                  </div>

                  <div className="suggestion-content">
                    <h2>{mediaContent?.title || aiSuggestion.title}</h2>
                    <p className="suggestion-description">
                      {mediaContent?.description || aiSuggestion.description}
                    </p>

                    <div className="media-section">
                      <div className="video-section">
                        <h3>{t('guidedVideo')}</h3>
                        <div className="tavus-video-container">
                          {currentVideoUrl ? (
                            <div>
                              <video 
                                width="100%" 
                                height="315"
                                controls
                                onError={handleVideoError}
                                onLoadedData={handleVideoLoad}
                                style={{ borderRadius: '10px' }}
                                preload="metadata"
                                crossOrigin="anonymous"
                              >
                                <source src={currentVideoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              {!videoError && (
                                <p style={{ fontSize: '0.9rem', color: '#138808', marginTop: '0.5rem' }}>
                                  ✅ Personalized video content loaded successfully
                                </p>
                              )}
                              {videoError && (
                                <p style={{ fontSize: '0.9rem', color: '#dc3545', marginTop: '0.5rem' }}>
                                  ❌ {videoError}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="video-placeholder">
                              <div className="video-placeholder-content">
                                <div className="video-icon">📹</div>
                                <h4>{aiSuggestion.videoTitle}</h4>
                                <p>
                                  {mediaContent 
                                    ? 'Video content not available for this language yet' 
                                    : 'Loading video content...'
                                  }
                                </p>
                                <button className="play-video-btn" disabled>
                                  ▶️ {t('playVideo')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="audio-section">
                        <h3>{t('healingAudio')}</h3>
                        <div className="elevenlabs-audio-container">
                          <div className="audio-player">
                            <div className="audio-info">
                              <span className="audio-title">{aiSuggestion.audioTitle}</span>
                              <span className="elevenlabs-badge">🎵 Healing Sounds</span>
                            </div>
                            <button 
                              className={`audio-control-btn ${isPlayingAudio ? 'playing' : ''}`}
                              onClick={toggleAudio}
                              disabled={!currentAudioUrl}
                            >
                              {isPlayingAudio ? '⏸️' : '▶️'}
                            </button>
                          </div>
                          {currentAudioUrl ? (
                            <div>
                              <audio 
                                ref={audioRef}
                                onEnded={() => setIsPlayingAudio(false)}
                                onError={handleAudioError}
                                onLoadedData={handleAudioLoad}
                                preload="metadata"
                                crossOrigin="anonymous"
                                loop
                              >
                                <source src={currentAudioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                              {!audioError && (
                                <p style={{ fontSize: '0.9rem', color: '#138808', marginTop: '0.5rem' }}>
                                  ✅ Healing audio content loaded successfully
                                </p>
                              )}
                              {audioError && (
                                <p style={{ fontSize: '0.9rem', color: '#dc3545', marginTop: '0.5rem' }}>
                                  ❌ {audioError}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                              {mediaContent 
                                ? 'Audio content not available for this language yet' 
                                : 'Audio content loading...'
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="steps-section">
                      <h3>{t('stepByStepGuide')}</h3>
                      <ol className="steps-list">
                        {(mediaContent?.steps ? JSON.parse(mediaContent.steps) : aiSuggestion.steps).map((step, index) => (
                          <li key={index} className="step-item">
                            <span className="step-number">{index + 1}</span>
                            <span className="step-text">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="action-buttons">
                      <button className="primary-btn" onClick={() => saveSession(selectedIssue, aiSuggestion)}>
                        💾 {t('saveSession')}
                      </button>
                      <button className="secondary-btn" onClick={resetSession}>
                        🔄 {t('tryAnother')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MentalIssueSolution;