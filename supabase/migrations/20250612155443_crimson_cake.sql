/*
  # Create mental health sessions table

  1. New Tables
    - `mental_health_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `issue_type` (text, type of mental health issue)
      - `suggestion_title` (text, AI suggestion title)
      - `language` (text, language code: en, hi, ta)
      - `video_url` (text, Tavus video URL)
      - `audio_url` (text, ElevenLabs audio URL)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `mental_health_sessions` table
    - Add policy for users to read/write their own sessions
*/

CREATE TABLE IF NOT EXISTS mental_health_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_type text NOT NULL,
  suggestion_title text NOT NULL,
  language text DEFAULT 'en',
  video_url text,
  audio_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mental_health_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own mental health sessions
CREATE POLICY "Users can read own mental health sessions"
  ON mental_health_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own mental health sessions
CREATE POLICY "Users can insert own mental health sessions"
  ON mental_health_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own mental health sessions
CREATE POLICY "Users can update own mental health sessions"
  ON mental_health_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS mental_health_sessions_user_id_created_at_idx 
  ON mental_health_sessions(user_id, created_at DESC);

-- Create index for issue type filtering
CREATE INDEX IF NOT EXISTS mental_health_sessions_issue_type_idx 
  ON mental_health_sessions(issue_type);

-- Create index for language filtering
CREATE INDEX IF NOT EXISTS mental_health_sessions_language_idx 
  ON mental_health_sessions(language);