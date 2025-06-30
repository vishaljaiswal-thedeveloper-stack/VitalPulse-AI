/*
  # Create prescriptions table for blockchain-minted prescriptions

  1. New Tables
    - `prescriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `patient_name` (text, patient's name)
      - `doctor_name` (text, prescribing doctor's name)
      - `drug` (text, prescribed medication)
      - `dosage` (text, medication dosage)
      - `frequency` (text, how often to take)
      - `duration` (text, treatment duration)
      - `instructions` (text, additional instructions)
      - `language` (text, language code: en, hi, ta)
      - `algorand_asset_id` (bigint, Algorand NFT asset ID)
      - `algorand_tx_id` (text, Algorand transaction ID)
      - `wallet_address` (text, user's Algorand wallet address)
      - `metadata` (jsonb, NFT metadata)
      - `blockchain_status` (text, minting status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `prescriptions` table
    - Add policy for users to read/write their own prescriptions
    - Add policy for healthcare providers to read prescriptions
*/

CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  doctor_name text NOT NULL,
  drug text NOT NULL,
  dosage text DEFAULT '500mg',
  frequency text DEFAULT 'Twice daily',
  duration text DEFAULT '5 days',
  instructions text DEFAULT 'Take after meals',
  language text DEFAULT 'en' CHECK (language IN ('en', 'hi', 'ta')),
  algorand_asset_id bigint,
  algorand_tx_id text,
  wallet_address text,
  metadata jsonb,
  blockchain_status text DEFAULT 'pending' CHECK (blockchain_status IN ('pending', 'minting', 'minted', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own prescriptions
CREATE POLICY "Users can read own prescriptions"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own prescriptions
CREATE POLICY "Users can insert own prescriptions"
  ON prescriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own prescriptions
CREATE POLICY "Users can update own prescriptions"
  ON prescriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS prescriptions_user_id_created_at_idx 
  ON prescriptions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS prescriptions_drug_idx 
  ON prescriptions(drug);

CREATE INDEX IF NOT EXISTS prescriptions_algorand_asset_id_idx 
  ON prescriptions(algorand_asset_id);

CREATE INDEX IF NOT EXISTS prescriptions_blockchain_status_idx 
  ON prescriptions(blockchain_status);

CREATE INDEX IF NOT EXISTS prescriptions_language_idx 
  ON prescriptions(language);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prescriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prescriptions_updated_at 
  BEFORE UPDATE ON prescriptions 
  FOR EACH ROW EXECUTE FUNCTION update_prescriptions_updated_at();