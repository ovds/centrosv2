import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User types matching Supabase Auth schema with additional fields
export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'counsellor' | 'admin';
  avatar_url?: string;
  created_at: string;
};

// Utility functions for common operations
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get additional profile information
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error || !data) return null;
  
  return {
    id: user.id,
    email: user.email,
    ...data
  } as UserProfile;
}

export async function signOut() {
  return supabase.auth.signOut();
}
