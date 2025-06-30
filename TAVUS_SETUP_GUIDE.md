# VitalPulse Tavus HealthGuidePersona Integration Guide

## 🎯 Overview
Your VitalPulse project is now configured to use your specific Tavus HealthGuidePersona (pb7c51958b57) for real-time AI video conversations with automatic fallback to Supabase-hosted content.

## 🔧 Setup Instructions for Non-Coders

### Step 1: Get Your Tavus API Key
1. Go to your [Tavus Dashboard](https://app.tavus.io/)
2. Navigate to **API Keys** section
3. Copy your API key (it starts with `tavus_`)

### Step 2: Configure Environment Variables
1. Open the `.env` file in your project root
2. Replace `your_tavus_api_key_here` with your actual Tavus API key:
   ```
   VITE_TAVUS_API_KEY=tavus_your_actual_api_key_here
   ```
3. Save the file

### Step 3: Upload Fallback Content to Supabase (Optional)
If you want custom fallback videos when Tavus is unavailable:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** → **videos** bucket
3. Upload your videos with these exact names:
   - `stress-en.mp4`
   - `anxiety-en.mp4` 
   - `depression-en.mp4`
   - `sleep-en.mp4`
   - `general-health-en.mp4`

4. Navigate to **Storage** → **audios** bucket
5. Upload your audio files with these exact names:
   - `stress-en-audio.mp3`
   - `anxiety-en-audio.mp3`
   - `depression-en-audio.mp3`
   - `sleep-en-audio.mp3`
   - `general-health-en-audio.mp3`

## 🚀 How It Works

### Real-Time Tavus Integration
- Uses your HealthGuidePersona (pb7c51958b57, rbe2c395e725)
- Sends user messages to Tavus API v2
- Receives personalized video responses
- Includes closed captions for accessibility

### Automatic Fallback System
- If Tavus API is unavailable, automatically switches to offline mode
- Uses pre-uploaded Supabase videos/audio as backup
- Shows clear indicators when using fallback content
- Maintains conversation flow seamlessly

### Health-Focused Features
- All responses include medical disclaimers
- Specialized health topic recognition
- Encourages users to consult doctors for serious symptoms
- Supports stress, anxiety, sleep, and general health topics

## 🎮 User Experience

### For Patients
1. **Start Conversation**: Click on "Video Chat" in navigation
2. **Ask Health Questions**: Type or speak health concerns
3. **Receive AI Guidance**: Get personalized video responses from HealthGuidePersona
4. **Medical Safety**: All responses include appropriate medical disclaimers

### Visual Indicators
- **🎥 Real-time**: Shows "AI-powered video responses by Tavus"
- **📱 Offline**: Shows "Offline health guidance" when using fallback
- **⚠️ Notice**: Yellow banner explains when offline mode is active

## 🔧 Technical Details

### API Configuration
```javascript
// Your HealthGuidePersona settings
PERSONA_ID: pb7c51958b57
REPLICA_ID: rbe2c395e725
API_ENDPOINT: https://tavusapi.com/v2/conversations
LANGUAGE: en (English only)
CLOSED_CAPTIONS: enabled
```

### Fallback URLs
```javascript
// Supabase Storage structure
/videos/stress-en.mp4
/videos/anxiety-en.mp4
/audios/stress-en-audio.mp3
/audios/anxiety-en-audio.mp3
```

## 🛠️ Testing Your Setup

### Test Real-Time Tavus
1. Ensure your API key is configured
2. Go to `/tavus-conversation`
3. Type: "I'm feeling stressed"
4. Should receive Tavus-generated video response

### Test Fallback System
1. Temporarily use invalid API key
2. Type health question
3. Should automatically switch to offline mode
4. Should show fallback content from Supabase

## 🚨 Troubleshooting

### Common Issues

**"API key not configured"**
- Check `.env` file has correct `VITE_TAVUS_API_KEY`
- Restart development server after changing `.env`

**"Video temporarily unavailable"**
- Check Tavus API key is valid
- Verify internet connection
- System will automatically use fallback

**"Offline mode always active"**
- Verify Tavus API key format (starts with `tavus_`)
- Check Tavus dashboard for API usage limits
- Ensure persona IDs are correct

### Error Messages
- **Yellow Banner**: Temporary API issue, using offline mode
- **Red Error**: Configuration problem, check API key
- **Video Placeholder**: Normal when no video is playing

## 📊 Monitoring Usage

### Tavus Dashboard
- Monitor API calls and usage
- Check conversation success rates
- View generated video analytics

### Browser Console
- Look for "🎥 Creating Tavus conversation..." (success)
- Look for "❌ Tavus API failed..." (fallback triggered)
- Check network tab for API call details

## 🔒 Security & Privacy

### Data Protection
- API key stored securely in environment variables
- No health data stored permanently
- All conversations are ephemeral
- Medical disclaimers included in all responses

### HIPAA Considerations
- This is educational/informational tool only
- Not intended for medical diagnosis
- Users directed to consult real doctors
- No PHI (Protected Health Information) stored

## 🎯 Next Steps

### Enhance Your Setup
1. **Custom Videos**: Upload your own health education videos to Supabase
2. **Multiple Languages**: Extend to Hindi/Tamil if Tavus supports them
3. **Topic Expansion**: Add more health topics to fallback responses
4. **Analytics**: Track which topics users ask about most

### Production Deployment
1. **Environment Variables**: Ensure API key is set in production
2. **Error Monitoring**: Set up alerts for API failures
3. **Content Updates**: Regularly update fallback videos
4. **User Feedback**: Collect feedback on AI responses

## 📞 Support

### Getting Help
- **Tavus Issues**: Contact Tavus support with persona ID pb7c51958b57
- **Supabase Issues**: Check Supabase dashboard for storage access
- **Integration Issues**: Check browser console for error messages

### Success Indicators
- ✅ Users can start video conversations
- ✅ Tavus API responds with personalized videos
- ✅ Fallback works when Tavus is unavailable
- ✅ Medical disclaimers appear in all responses
- ✅ Health topics are recognized and handled appropriately

Your VitalPulse HealthGuidePersona is now ready to provide AI-powered health guidance with professional video responses!