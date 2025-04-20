import { createClient } from '@supabase/supabase-js';
import { Database, UserProfile, StudentProfile, CounsellorProfile } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

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

// Convenience function to get the current authenticated user with profile data
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }
    
    // Check if there's a profile in the Users table
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (userError) {
      console.error('User error:', userError);
      return null;
    }
    
    let profileData = null;
    let name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';
    let avatar_url = user.user_metadata?.avatar_url;
    
    // Get additional profile data based on role
    if (userData.role === 'student') {
      const { data, error } = await supabase
        .from('Student')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        profileData = data;
        name = data.name;
        avatar_url = data.profile_picture_url;
      }
    } else if (userData.role === 'counsellor' || userData.role === 'admin') {
      const { data, error } = await supabase
        .from('Counsellor')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        profileData = data;
        name = data.name;
        avatar_url = data.profile_picture_url;
      }
    }
    
    // Construct the user profile response
    return {
      id: user.id,
      email: user.email || userData.email,
      name,
      role: userData.role,
      avatar_url,
      created_at: userData.created_at
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get student profile with extra details
export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userError || !userData || userData.role !== 'student') {
      return null;
    }
    
    const { data: studentData, error: studentError } = await supabase
      .from('Student')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (studentError || !studentData) {
      return null;
    }
    
    return {
      id: userId,
      email: userData.email,
      name: studentData.name,
      role: 'student' as const,
      avatar_url: studentData.profile_picture_url || undefined,
      created_at: userData.created_at,
      class: studentData.class || undefined,
      graduation_year: studentData.graduation_year || undefined,
      gender: studentData.gender,
      contact_number: studentData.contact_number || undefined,
      parent_email: studentData.parent_email || undefined
    };
  } catch (error) {
    console.error('Error getting student profile:', error);
    return null;
  }
}

// Get counsellor profile with extra details
export async function getCounsellorProfile(userId: string): Promise<CounsellorProfile | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userError || !userData || userData.role !== 'counsellor') {
      return null;
    }
    
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('Counsellor')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (counsellorError || !counsellorData) {
      return null;
    }
    
    return {
      id: userId,
      email: userData.email,
      name: counsellorData.name,
      role: 'counsellor' as const,
      avatar_url: counsellorData.profile_picture_url || undefined,
      created_at: userData.created_at,
      title: counsellorData.title || undefined,
      specialization: counsellorData.specialization || undefined,
      office_location: counsellorData.office_location || undefined,
      contact_number: counsellorData.contact_number || undefined,
      office_hours: counsellorData.office_hours || undefined
    };
  } catch (error) {
    console.error('Error getting counsellor profile:', error);
    return null;
  }
}

// Get all counsellors
export async function getAllCounsellors(): Promise<CounsellorProfile[]> {
  try {
    const { data: counsellors, error } = await supabase
      .from('Counsellor')
      .select(`
        user_id,
        name,
        title,
        specialization,
        office_location,
        contact_number,
        office_hours,
        profile_picture_url,
        created_at,
        Users!inner(email, role, created_at)
      `)
      .eq('Users.role', 'counsellor');
      
    if (error || !counsellors) {
      console.error('Error fetching counsellors:', error);
      return [];
    }
    
    return counsellors.map(c => ({
      id: c.user_id,
      email: c.Users.email,
      name: c.name,
      role: 'counsellor' as const,
      avatar_url: c.profile_picture_url || undefined,
      created_at: c.Users.created_at,
      title: c.title || undefined,
      specialization: c.specialization || undefined,
      office_location: c.office_location || undefined,
      contact_number: c.contact_number || undefined,
      office_hours: c.office_hours || undefined
    }));
  } catch (error) {
    console.error('Unexpected error fetching counsellors:', error);
    return [];
  }
}

// Register a new user
export async function registerUser(
  email: string, 
  password: string, 
  role: 'student' | 'counsellor' | 'admin',
  userData: { name: string; [key: string]: any }
): Promise<{ success: boolean, error?: string, userId?: string }> {
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
          gender: userData.gender || 'prefer_not_to_say',
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
    
    return { success: true, userId };
  } catch (error: any) {
    console.error('Unexpected error during registration:', error);
    return { success: false, error: error.message };
  }
}

// Utility function to sign out
export async function signOut() {
  return supabase.auth.signOut();
}

// Reset password
export async function resetPassword(email: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error in resetPassword:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  role: 'student' | 'counsellor' | 'admin',
  data: Partial<StudentProfile | CounsellorProfile>
): Promise<{ success: boolean, error?: string }> {
  try {
    if (role === 'student') {
      const { error } = await supabase
        .from('Student')
        .update({
          name: data.name,
          profile_picture_url: data.avatar_url,
          // Add other fields specific to student profile
          ...(data as Partial<StudentProfile>)
        })
        .eq('user_id', userId);
        
      if (error) {
        return { success: false, error: error.message };
      }
    } else if (role === 'counsellor' || role === 'admin') {
      const { error } = await supabase
        .from('Counsellor')
        .update({
          name: data.name,
          profile_picture_url: data.avatar_url,
          // Add other fields specific to counsellor profile
          ...(data as Partial<CounsellorProfile>)
        })
        .eq('user_id', userId);
        
      if (error) {
        return { success: false, error: error.message };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}