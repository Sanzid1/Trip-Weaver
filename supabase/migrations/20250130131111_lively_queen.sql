/*
  # Create itineraries table

  1. New Tables
    - `itineraries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `destination` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `budget` (text)
      - `travel_style` (text)
      - `interests` (text[])
      - `created_at` (timestamptz)
      - `itinerary_data` (jsonb)

  2. Security
    - Enable RLS on `itineraries` table
    - Add policies for authenticated users to:
      - Read their own itineraries
      - Create new itineraries
      - Update their own itineraries
      - Delete their own itineraries
*/

CREATE TABLE itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget text NOT NULL,
  travel_style text NOT NULL,
  interests text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  itinerary_data jsonb NOT NULL
);

ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own itineraries
CREATE POLICY "Users can read own itineraries"
  ON itineraries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create itineraries
CREATE POLICY "Users can create itineraries"
  ON itineraries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own itineraries
CREATE POLICY "Users can update own itineraries"
  ON itineraries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own itineraries
CREATE POLICY "Users can delete own itineraries"
  ON itineraries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);