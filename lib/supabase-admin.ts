import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Counsellor {
  id: string;
  user_id: string;
  name: string;
  title?: string;
  specialization?: string;
  bio?: string;
  experience_years?: number;
  qualifications?: string;
  office_location?: string;
  contact_number?: string;
  office_hours?: string;
  profile_picture_url?: string;
  availability_schedule?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Get the authenticated counsellor data
 */
export async function getCounsellor(userId: string): Promise<Counsellor | null> {
  try {
    const { data, error } = await supabase
      .from('Counsellor')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching counsellor:', error);
      return null;
    }
    
    return data as Counsellor;
  } catch (error) {
    console.error('Unexpected error fetching counsellor:', error);
    return null;
  }
}

/**
 * Get the current authenticated user and their counsellor data
 */
export async function getCurrentCounsellor(): Promise<{user: User, counsellor: Counsellor} | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting authenticated user:', userError);
      return null;
    }
    
    const counsellor = await getCounsellor(user.id);
    
    if (!counsellor) {
      return null;
    }
    
    return { user, counsellor };
  } catch (error) {
    console.error('Unexpected error getting current counsellor:', error);
    return null;
  }
}

/**
 * Get all counsellors
 */
export async function getAllCounsellors(): Promise<Counsellor[]> {
  try {
    const { data, error } = await supabase
      .from('Counsellor')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching all counsellors:', error);
      return [];
    }
    
    return data as Counsellor[];
  } catch (error) {
    console.error('Unexpected error fetching all counsellors:', error);
    return [];
  }
}

/**
 * Update counsellor availability schedule
 */
export async function updateCounsellorAvailability(
  counsellorId: string, 
  availabilitySchedule: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Counsellor')
      .update({ 
        availability_schedule: availabilitySchedule,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', counsellorId);
    
    if (error) {
      console.error('Error updating counsellor availability:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating counsellor availability:', error);
    return false;
  }
}

/**
 * Update counsellor profile information
 */
export async function updateCounsellorProfile(
  counsellorId: string,
  profileData: Partial<Counsellor>
): Promise<boolean> {
  try {
    // Ensure we can't update critical fields
    delete profileData.id;
    delete profileData.user_id;
    delete profileData.created_at;
    
    // Add updated timestamp
    profileData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('Counsellor')
      .update(profileData)
      .eq('user_id', counsellorId);
    
    if (error) {
      console.error('Error updating counsellor profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating counsellor profile:', error);
    return false;
  }
}
