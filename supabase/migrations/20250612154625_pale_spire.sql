/*
  # Create chat messages table for ArogyaBot

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `message` (text, the chat message content)
      - `is_bot` (boolean, true if message is from bot)
      - `language` (text, language code: en, hi, ta)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policy for users to read/write their own messages
    - Add policy for authenticated users to insert messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_bot boolean DEFAULT false,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own chat messages
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own chat messages
CREATE POLICY "Users can insert own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own chat messages (if needed)
CREATE POLICY "Users can update own chat messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS chat_messages_user_id_created_at_idx 
  ON chat_messages(user_id, created_at DESC);

-- Create index for language filtering
CREATE INDEX IF NOT EXISTS chat_messages_language_idx 
  ON chat_messages(language);