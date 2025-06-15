import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided as environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your schema
export interface Actor {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  notes?: string;
  username: string;
  created_at?: string;
}

export interface Director {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  director_type?: string;
  email: string;
  username: string;
  auth_user_id?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  director_id: string;
  actor_id: string;
  message_type: 'text' | 'audio' | 'image' | 'video';
  content?: string;
  scheduled_at: string;
  created_at?: string;
}