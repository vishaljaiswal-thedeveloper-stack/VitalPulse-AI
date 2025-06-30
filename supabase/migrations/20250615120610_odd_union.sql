/*
  # Insert stress relief content with actual URLs

  1. Content Addition
    - Insert stress relief content for English language
    - Use the provided Supabase Storage URLs
    - Include proper steps as JSON array

  2. Data
    - Video URL: https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos/pranayam-en.mp4
    - Audio URL: https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios/11L-Calming_birdsong_wit-1749984722520.mp3
*/

-- Insert stress relief content for English
INSERT INTO mental_health_relief (
  issue_type, 
  language, 
  title, 
  description, 
  video_url, 
  audio_url, 
  steps
) VALUES (
  'stress',
  'en',
  'Pranayama Breathing for Stress Relief',
  'Ancient breathing techniques proven to reduce cortisol levels and calm the nervous system.',
  'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/videos/pranayam-en.mp4',
  'https://zpwazjeviszgdjmfjhyj.supabase.co/storage/v1/object/public/audios/11L-Calming_birdsong_wit-1749984722520.mp3',
  '["Sit comfortably with spine straight", "Close your eyes and breathe naturally", "Inhale for 4 counts through nose", "Hold breath for 4 counts", "Exhale for 6 counts through mouth", "Repeat for 10-15 minutes daily"]'
) ON CONFLICT DO NOTHING;