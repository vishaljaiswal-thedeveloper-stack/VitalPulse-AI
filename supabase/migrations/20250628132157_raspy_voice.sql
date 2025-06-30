/*
  # Create user plans and usage tracking

  1. New Tables
    - `user_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_type` (text: free, basic, premium)
      - `weekly_minutes_limit` (integer)
      - `sessions_per_week_limit` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `usage_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `week_start` (date)
      - `minutes_used` (integer)
      - `sessions_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own data
*/

-- Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')) DEFAULT 'free',
  weekly_minutes_limit integer NOT NULL DEFAULT 5,
  sessions_per_week_limit integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  minutes_used integer DEFAULT 0,
  sessions_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for user_plans
CREATE POLICY "Users can read own plan"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own plan"
  ON user_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for usage_tracking
CREATE POLICY "Users can read own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_week_idx ON usage_tracking(user_id, week_start);

-- Function to create default plan for new users
CREATE OR REPLACE FUNCTION create_default_user_plan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_plans (user_id, plan_type, weekly_minutes_limit, sessions_per_week_limit)
  VALUES (NEW.id, 'free', 5, 1);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default plan for new users
CREATE TRIGGER create_user_plan_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_plan();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_plans_updated_at 
  BEFORE UPDATE ON user_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at 
  BEFORE UPDATE ON usage_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();