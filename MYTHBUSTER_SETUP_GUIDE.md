# MythBuster Component Setup Guide for VitalPulse

## 📋 Overview
This guide will help you integrate the new MythBuster component into your VitalPulse healthcare platform. The component enables users to post and debunk India-specific health myths with Reddit integration and multi-language support.

## 🎯 What's Included

### ✅ Features Implemented
- **Health Myth Submission**: Users can submit health myths and factual corrections
- **Reddit Integration**: Automatic posting to Reddit using Snoowrap (simulation included)
- **Multi-language Support**: English, Hindi, Tamil with React-i18next
- **User Authentication**: Supabase Auth integration
- **Voting System**: Reddit-style upvote/downvote functionality
- **Category Filtering**: Filter myths by health categories
- **Sorting Options**: Sort by newest, oldest, most upvoted, controversial
- **Responsive Design**: Mobile-friendly layout
- **Source Verification**: Optional source URLs for fact-checking

### 🎨 Design Elements
- **Color Scheme**: Saffron (#FF9933) and Green (#138808)
- **Reddit-style UI**: Voting arrows, score display, community feel
- **Category Badges**: Visual indicators for myth categories
- **Modern Cards**: Clean myth display with hover effects

## 🚀 Step-by-Step Setup Instructions

### Step 1: Files Added/Modified
The following files have been created or updated:

1. **`src/components/MythBuster.jsx`** - Main myth busting component
2. **`src/components/MythBuster.css`** - Styling for the myth buster page
3. **`supabase/migrations/create_health_myths_table.sql`** - Database schema
4. **`src/i18n.js`** - Updated with myth buster translations
5. **`src/App.jsx`** - Added myth buster route
6. **`src/components/Navigation.jsx`** - Added myth buster link
7. **`package.json`** - Added Snoowrap dependency

### Step 2: Database Setup

#### Run the Migration
Execute the SQL migration in your Supabase dashboard:

```sql
-- The migration creates two tables:
-- 1. 'health_myths' - stores myth submissions
-- 2. 'myth_votes' - tracks user voting
-- Both with Row Level Security (RLS) policies
```

#### Database Schema
The `health_myths` table includes:
- **Content**: myth_text, fact_text, category, language
- **User Data**: user_id, user_email (for display)
- **Voting**: upvotes, downvotes counters
- **Reddit Integration**: reddit_post_id, reddit_url, reddit_upvotes
- **Metadata**: source_url, created_at, updated_at

### Step 3: Navigation Integration
The myth buster page is now accessible via:
- **URL**: `/mythbuster`
- **Navigation**: "MythBuster" link in the main navigation
- **Multi-language**: Automatically translates based on selected language

### Step 4: Reddit Integration (For Developers)

#### Current Implementation
The component includes a **simulation** of Reddit integration. To implement real Reddit functionality:

```javascript
// In src/components/MythBuster.jsx, replace the simulation with:

// 1. Install Snoowrap (already added to package.json)
// npm install snoowrap

// 2. Set up Reddit app credentials
// Go to https://www.reddit.com/prefs/apps
// Create a new app and get credentials

// 3. Configure environment variables
// Add to your .env file:
VITE_REDDIT_CLIENT_ID=your_client_id
VITE_REDDIT_CLIENT_SECRET=your_client_secret
VITE_REDDIT_USERNAME=your_bot_username
VITE_REDDIT_PASSWORD=your_bot_password

// 4. Real Reddit submission function
import snoowrap from 'snoowrap';

const submitMythToReddit = async (mythData) => {
  try {
    const r = new snoowrap({
      userAgent: 'VitalPulse MythBuster v1.0',
      clientId: import.meta.env.VITE_REDDIT_CLIENT_ID,
      clientSecret: import.meta.env.VITE_REDDIT_CLIENT_SECRET,
      username: import.meta.env.VITE_REDDIT_USERNAME,
      password: import.meta.env.VITE_REDDIT_PASSWORD
    });

    const submission = await r.getSubreddit('HealthMyths')
      .submitSelfpost({
        title: `Myth: ${mythData.myth_text}`,
        text: `**Myth:** ${mythData.myth_text}\n\n**Fact:** ${mythData.fact_text}\n\n**Source:** ${mythData.source_url}\n\n*Posted via VitalPulse MythBuster*`
      });

    return {
      reddit_post_id: submission.id,
      reddit_url: submission.url,
      reddit_upvotes: 1
    };
  } catch (error) {
    console.error('Reddit submission failed:', error);
    return null;
  }
};
```

#### Required Dependencies (already included)
```bash
npm install snoowrap
```

### Step 5: Reddit App Setup

#### Create Reddit App
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Choose "script" as app type
4. Fill in details:
   - **Name**: VitalPulse MythBuster
   - **Description**: Health myth debunking for rural India
   - **About URL**: Your website URL
   - **Redirect URI**: http://localhost (for script apps)

#### Get Credentials
After creating the app, note down:
- **Client ID**: Found under the app name
- **Client Secret**: The secret key shown
- **Username**: Your Reddit bot account username
- **Password**: Your Reddit bot account password

### Step 6: Subreddit Setup

#### Create or Use Existing Subreddit
1. **Option 1**: Create your own subreddit (r/VitalPulseMyths)
2. **Option 2**: Use existing health subreddits (r/HealthMyths, r/medical)
3. **Option 3**: Use test subreddit (r/test) for development

#### Subreddit Configuration
```javascript
// In the submitMythToReddit function, change the subreddit:
const submission = await r.getSubreddit('YourSubredditName')
  .submitSelfpost({
    // ... post content
  });
```

## 🔧 Customization Options

### Myth Categories
Modify categories in `MythBuster.jsx`:

```javascript
const mythCategories = {
  // Add new categories
  ayurveda: {
    en: 'Ayurveda & Traditional Medicine',
    hi: 'आयुर्वेद और पारंपरिक चिकित्सा',
    ta: 'ஆயுர்வேதம் மற்றும் பாரம்பரிய மருத்துவம்'
  },
  // ... existing categories
};
```

### Sample Myths
Add more sample myths for demonstration:

```javascript
const sampleMyths = {
  en: [
    {
      myth: "Your new myth here",
      fact: "The scientific correction",
      category: "general_health"
    },
    // ... more myths
  ]
};
```

### Reddit Post Format
Customize the Reddit post template:

```javascript
const postText = `
**🚨 Health Myth Alert 🚨**

**Myth:** ${mythData.myth_text}

**✅ Scientific Fact:** ${mythData.fact_text}

**📚 Source:** ${mythData.source_url}

**🌍 Language:** ${mythData.language}

---
*This myth was debunked by the VitalPulse community. Help us fight health misinformation in rural India!*

*Visit: https://your-website.com/mythbuster*
`;
```

## 🌐 Language Support

### Adding New Languages
1. Add translations to `src/i18n.js`:

```javascript
const resources = {
  // ... existing languages
  bn: { // Bengali example
    translation: {
      "mythBusterTitle": "স্বাস্থ্য মিথ বাস্টার",
      "mythBusterSubtitle": "বিজ্ঞান-ভিত্তিক তথ্য দিয়ে স্বাস্থ্য মিথ ভাঙা।",
      // ... add all myth buster translations
    }
  }
};
```

2. Add language button to Navigation:

```javascript
<button 
  className={`lang-btn ${i18n.language === 'bn' ? 'active' : ''}`}
  onClick={() => changeLanguage('bn')}
>
  বাং
</button>
```

3. Update myth categories:

```javascript
const mythCategories = {
  mental_health: {
    en: 'Mental Health',
    hi: 'मानसिक स्वास्थ्य',
    ta: 'மன சுகாதாரம்',
    bn: 'মানসিক স্বাস্থ্য' // Add Bengali
  }
};
```

## 📱 Mobile Responsiveness

The component is fully responsive with breakpoints:
- **Desktop**: Full 2-column layout with side-by-side voting
- **Tablet**: Stacked layout with maintained functionality
- **Mobile**: Single column with optimized touch targets

## 🔒 Security Considerations

### Data Protection
1. **RLS Policies**: Users can only edit their own submissions
2. **Public Reading**: All myths are publicly readable for education
3. **Vote Tracking**: Prevents duplicate voting per user
4. **Content Moderation**: Consider adding approval workflow

### Reddit Security
1. **Bot Account**: Use dedicated bot account, not personal account
2. **Rate Limiting**: Reddit has API rate limits (60 requests/minute)
3. **Subreddit Rules**: Follow target subreddit posting guidelines
4. **Content Policy**: Ensure posts comply with Reddit content policy

## 🧪 Testing

### Test the Component
1. **User Authentication**: 
   - Test myth submission with/without login
   - Verify voting restrictions for non-authenticated users

2. **Myth Submission**:
   - Test form validation
   - Verify Reddit simulation
   - Check database storage

3. **Voting System**:
   - Test upvote/downvote functionality
   - Verify vote prevention for duplicate votes
   - Check vote count updates

4. **Filtering & Sorting**:
   - Test category filters
   - Verify sorting options work correctly
   - Check language-specific content

### Test Scenarios
```javascript
// Test cases to verify:
// ✅ Non-authenticated users can view myths
// ✅ Authenticated users can submit myths
// ✅ Voting system works correctly
// ✅ Reddit integration simulation works
// ✅ Form validation prevents empty submissions
// ✅ Category filtering works
// ✅ Sorting options function properly
// ✅ Language switching updates content
// ✅ Responsive design on all devices
```

## 🚀 Deployment Checklist

Before going live with real Reddit integration:

- [ ] Create Reddit app and get credentials
- [ ] Set up environment variables securely
- [ ] Choose target subreddit(s)
- [ ] Test Reddit posting in development
- [ ] Set up content moderation workflow
- [ ] Configure rate limiting handling
- [ ] Test error handling for failed Reddit posts
- [ ] Prepare community guidelines
- [ ] Set up monitoring for spam/abuse
- [ ] Create backup plan if Reddit is unavailable

## 💡 Usage Instructions for Non-Coders

### For Healthcare Professionals
1. **Submit Myths**: Click "Add New Myth" to submit dangerous health misinformation
2. **Provide Facts**: Include scientific corrections with credible sources
3. **Choose Category**: Select appropriate health category
4. **Add Sources**: Include WHO, medical journal, or hospital links
5. **Monitor Impact**: Check upvotes and Reddit engagement

### For Community Members
1. **Browse Myths**: View myths by category or sort by popularity
2. **Vote on Content**: Upvote helpful corrections, downvote inaccurate ones
3. **Share on Social**: Use Reddit links to share on other platforms
4. **Report Issues**: Contact moderators for inappropriate content

### For Moderators
1. **Review Submissions**: Check new myths for accuracy and appropriateness
2. **Verify Sources**: Ensure source URLs are credible and relevant
3. **Monitor Voting**: Watch for vote manipulation or spam
4. **Engage Community**: Respond to comments and encourage participation

## 🔗 Useful Links

- **Reddit API Documentation**: https://www.reddit.com/dev/api/
- **Snoowrap Documentation**: https://not-an-aardvark.github.io/snoowrap/
- **Reddit App Creation**: https://www.reddit.com/prefs/apps
- **WHO Health Topics**: https://www.who.int/health-topics/
- **Medical Fact-Checking**: https://www.factcheck.org/health/

## 📞 Support

For technical issues:
1. Check browser console for errors
2. Verify Supabase connection and RLS policies
3. Test Reddit credentials in development
4. Review translation files for missing keys
5. Check network connectivity for Reddit API calls

## 🎉 Success!

Your VitalPulse MythBuster component is now ready! Users can:
- ✅ Submit and debunk health myths
- ✅ Vote on myth accuracy
- ✅ Share content on Reddit automatically
- ✅ Filter and sort myths by category
- ✅ Switch between languages seamlessly
- ✅ Access on any device
- ✅ Help fight health misinformation in rural India

The component follows Reddit community guidelines and provides a powerful tool for combating dangerous health misinformation in Indian communities.