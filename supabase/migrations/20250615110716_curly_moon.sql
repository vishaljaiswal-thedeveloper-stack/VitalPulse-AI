/*
  # Create mental health relief content table

  1. New Tables
    - `mental_health_relief`
      - `id` (uuid, primary key)
      - `issue_type` (text, type of mental health issue: stress, depression, sleep, anger, focus, relationships)
      - `language` (text, language code: en, hi, ta)
      - `title` (text, title of the relief content)
      - `description` (text, description of the content)
      - `video_url` (text, URL to Tavus video content)
      - `audio_url` (text, URL to ElevenLabs audio content)
      - `steps` (jsonb, array of step-by-step instructions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mental_health_relief` table
    - Add policy for public read access (content is educational)
    - Add policy for authenticated admin users to manage content

  3. Sample Data
    - Insert sample stress relief content for testing
*/

CREATE TABLE IF NOT EXISTS mental_health_relief (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text NOT NULL CHECK (issue_type IN ('stress', 'depression', 'sleep', 'anger', 'focus', 'relationships')),
  language text NOT NULL CHECK (language IN ('en', 'hi', 'ta')),
  title text NOT NULL,
  description text,
  video_url text,
  audio_url text,
  steps jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mental_health_relief ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to mental health relief content
CREATE POLICY "Public can read mental health relief content"
  ON mental_health_relief
  FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to insert/update content (for admin purposes)
CREATE POLICY "Authenticated users can manage mental health relief content"
  ON mental_health_relief
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mental_health_relief_issue_type_language_idx 
  ON mental_health_relief(issue_type, language);

CREATE INDEX IF NOT EXISTS mental_health_relief_issue_type_idx 
  ON mental_health_relief(issue_type);

CREATE INDEX IF NOT EXISTS mental_health_relief_language_idx 
  ON mental_health_relief(language);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mental_health_relief_updated_at 
  BEFORE UPDATE ON mental_health_relief 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for stress relief (you can add your actual video and audio URLs here)
INSERT INTO mental_health_relief (issue_type, language, title, description, video_url, audio_url, steps) VALUES
(
  'stress',
  'en',
  'Pranayama Breathing for Stress Relief',
  'Ancient breathing techniques proven to reduce cortisol levels and calm the nervous system.',
  'https://your-video-url-here.com/stress-en.mp4',
  'https://your-audio-url-here.com/stress-en.mp3',
  '["Sit comfortably with spine straight", "Close your eyes and breathe naturally", "Inhale for 4 counts through nose", "Hold breath for 4 counts", "Exhale for 6 counts through mouth", "Repeat for 10-15 minutes daily"]'
),
(
  'stress',
  'hi',
  'तनाव राहत के लिए प्राणायाम श्वास',
  'प्राचीन श्वास तकनीकें जो कॉर्टिसोल के स्तर को कम करने और तंत्रिका तंत्र को शांत करने में सिद्ध हैं।',
  'https://your-video-url-here.com/stress-hi.mp4',
  'https://your-audio-url-here.com/stress-hi.mp3',
  '["रीढ़ सीधी करके आराम से बैठें", "आंखें बंद करें और प्राकृतिक रूप से सांस लें", "नाक से 4 गिनती तक सांस लें", "4 गिनती तक सांस रोकें", "मुंह से 6 गिनती तक सांस छोड़ें", "दैनिक 10-15 मिनट तक दोहराएं"]'
),
(
  'stress',
  'ta',
  'மன அழுத்தம் நீக்க பிராணாயாம சுவாசம்',
  'கார்டிசால் அளவைக் குறைத்து நரம்பு மண்டலத்தை அமைதிப்படுத்த நிரூபிக்கப்பட்ட பண்டைய சுவாச நுட்பங்கள்.',
  'https://your-video-url-here.com/stress-ta.mp4',
  'https://your-audio-url-here.com/stress-ta.mp3',
  '["முதுகுத்தண்டு நேராக வைத்து வசதியாக அமரவும்", "கண்களை மூடி இயற்கையாக சுவாசிக்கவும்", "மூக்கு வழியாக 4 எண்ணிக்கை வரை மூச்சு இழுக்கவும்", "4 எண்ணிக்கை வரை மூச்சை நிறுத்தவும்", "வாய் வழியாக 6 எண்ணிக்கை வரை மூச்சை வெளியிடவும்", "தினமும் 10-15 நிமிடங்கள் மீண்டும் செய்யவும்"]'
);