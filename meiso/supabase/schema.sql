-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  preferences JSONB DEFAULT '{
    "defaultScript": "basic-breathing",
    "audioEnabled": true,
    "volume": 0.8,
    "notifications": false,
    "theme": "auto"
  }'::jsonb,
  statistics JSONB DEFAULT '{
    "totalSessions": 0,
    "totalDuration": 0,
    "currentStreak": 0,
    "longestStreak": 0,
    "favoriteScripts": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  duration INTEGER, -- duration in seconds
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_start_time ON meditation_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_script_id ON meditation_sessions(script_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_completed ON meditation_sessions(completed);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Meditation sessions policies
CREATE POLICY "Users can view own sessions" ON meditation_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow anonymous sessions
    );

CREATE POLICY "Users can insert own sessions" ON meditation_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow anonymous sessions
    );

CREATE POLICY "Users can update own sessions" ON meditation_sessions
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow anonymous sessions
    );

CREATE POLICY "Users can delete own sessions" ON meditation_sessions
    FOR DELETE USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow anonymous sessions
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();