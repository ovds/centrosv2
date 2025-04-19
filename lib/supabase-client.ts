import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// Create the client with our custom Database type
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Custom interface for user data with profiles
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'counsellor' | 'admin';
  avatar_url?: string;
  created_at: string;
}

// Convenience function to get the current authenticated user with profile data
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }
    
    // Check the user role to determine which profile table to query
    const { data: userData, error: profileError } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (profileError || !userData) {
      console.error('Profile error:', profileError);
      return null;
    }
    
    let profileData: any = null;
    
    // Get additional profile data based on role
    if (userData.role === 'student') {
      const { data, error } = await supabase
        .from('Student')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        profileData = data;
      }
    } else if (userData.role === 'counsellor') {
      const { data, error } = await supabase
        .from('Counsellor')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        profileData = data;
      }
    }
    
    // Construct the user profile response
    return {
      id: user.id,
      email: user.email || userData.email,
      name: profileData?.name || 'User',
      role: userData.role,
      avatar_url: profileData?.profile_picture_url,
      created_at: userData.created_at
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Utility function to sign out
export async function signOut() {
  return supabase.auth.signOut();
}

// Get all counsellors
export async function getAllCounsellors() {
  try {
    const { data, error } = await supabase
      .from('Counsellor')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching counsellors:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching counsellors:', error);
    return [];
  }
}

// Get a specific counsellor by ID
export async function getCounsellor(id: string) {
  try {
    const { data, error } = await supabase
      .from('Counsellor')
      .select('*')
      .eq('user_id', id)
      .single();
      
    if (error) {
      console.error('Error fetching counsellor:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching counsellor:', error);
    return null;
  }
}

// Register a new user
export async function registerUser(
  email: string, 
  password: string, 
  role: 'student' | 'counsellor' | 'admin',
  userData: { name: string; [key: string]: any }
) {
  try {
    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name: userData.name
        }
      }
    });
    
    if (authError || !authData.user) {
      console.error('Auth error during registration:', authError);
      return { success: false, error: authError?.message || 'Registration failed' };
    }
    
    // Create the user record in the appropriate table
    const userId = authData.user.id;
    
    // First create entry in Users table
    const { error: userError } = await supabase
      .from('Users')
      .insert([{
        user_id: userId,
        email,
        password_hash: '**********', // We don't store the actual password, just a placeholder
        role,
        is_active: true,
        email_verified: false
      }]);
      
    if (userError) {
      console.error('Error creating user record:', userError);
      return { success: false, error: userError.message };
    }
    
    // Then create profile based on role
    let profileError = null;
    
    if (role === 'student') {
      const { error } = await supabase
        .from('Student')
        .insert([{
          user_id: userId,
          name: userData.name,
          ...userData
        }]);
      profileError = error;
    } else if (role === 'counsellor') {
      const { error } = await supabase
        .from('Counsellor')
        .insert([{
          user_id: userId,
          name: userData.name,
          ...userData
        }]);
      profileError = error;
    }
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
      return { success: false, error: profileError.message };
    }
    
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Unexpected error during registration:', error);
    return { success: false, error: error.message };
  }
}