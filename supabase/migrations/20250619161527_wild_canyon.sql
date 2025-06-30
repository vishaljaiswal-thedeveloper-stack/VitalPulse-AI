/*
  # Create health myths and voting system

  1. New Tables
    - `health_myths`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_email` (text, user's email for display)
      - `myth_text` (text, the health myth)
      - `fact_text` (text, the factual correction)
      - `category` (text, myth category)
      - `language` (text, language code: en, hi, ta)
      - `source_url` (text, optional source URL)
      - `upvotes` (integer, upvote count)
      - `downvotes` (integer, downvote count)
      - `reddit_post_id` (text, Reddit post ID)
      - `reddit_url` (text, Reddit post URL)
      - `reddit_upvotes` (integer, Reddit upvotes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `myth_votes`
      - `id` (uuid, primary key)
      - `myth_id` (uuid, foreign key to health_myths)
      - `user_id` (uuid, foreign key to auth.users)
      - `vote_type` (text, 'up' or 'down')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for myths and votes
    - Authenticated users can manage their own content
    - Voting system with user tracking

  3. Functions
    - Auto-update timestamp trigger
    - Vote increment function for performance
*/

-- Create health_myths table
CREATE TABLE IF NOT EXISTS health_myths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  myth_text text NOT NULL,
  fact_text text NOT NULL,
  category text NOT NULL CHECK (category IN ('mental_health', 'nutrition', 'pregnancy', 'traditional_medicine', 'general_health')),
  language text NOT NULL CHECK (language IN ('en', 'hi', 'ta')),
  source_url text,
  upvotes integer DEFAULT 1,
  downvotes integer DEFAULT 0,
  reddit_post_id text,
  reddit_url text,
  reddit_upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create myth_votes table
CREATE TABLE IF NOT EXISTS myth_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  myth_id uuid REFERENCES health_myths(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(myth_id, user_id)
);

-- Enable RLS
ALTER TABLE health_myths ENABLE ROW LEVEL SECURITY;
ALTER TABLE myth_votes ENABLE ROW LEVEL SECURITY;

-- Policies for health_myths
CREATE POLICY "Anyone can read health myths"
  ON health_myths
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert health myths"
  ON health_myths
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health myths"
  ON health_myths
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health myths"
  ON health_myths
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for myth_votes
CREATE POLICY "Anyone can read myth votes"
  ON myth_votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert myth votes"
  ON myth_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own myth votes"
  ON myth_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own myth votes"
  ON myth_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS health_myths_category_language_idx 
  ON health_myths(category, language);

CREATE INDEX IF NOT EXISTS health_myths_language_idx 
  ON health_myths(language);

CREATE INDEX IF NOT EXISTS health_myths_created_at_idx 
  ON health_myths(created_at DESC);

CREATE INDEX IF NOT EXISTS health_myths_upvotes_idx 
  ON health_myths(upvotes DESC);

CREATE INDEX IF NOT EXISTS health_myths_user_id_idx 
  ON health_myths(user_id);

CREATE INDEX IF NOT EXISTS myth_votes_myth_id_idx 
  ON myth_votes(myth_id);

CREATE INDEX IF NOT EXISTS myth_votes_user_id_idx 
  ON myth_votes(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_health_myths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_myths_updated_at 
  BEFORE UPDATE ON health_myths 
  FOR EACH ROW EXECUTE FUNCTION update_health_myths_updated_at();

-- Create function to increment myth votes
CREATE OR REPLACE FUNCTION increment_myth_votes(myth_id uuid, vote_field text)
RETURNS void AS $$
BEGIN
  IF vote_field = 'upvotes' THEN
    UPDATE health_myths 
    SET upvotes = upvotes + 1, updated_at = now()
    WHERE id = myth_id;
  ELSIF vote_field = 'downvotes' THEN
    UPDATE health_myths 
    SET downvotes = downvotes + 1, updated_at = now()
    WHERE id = myth_id;
  END IF;
END;
$$ language 'plpgsql';