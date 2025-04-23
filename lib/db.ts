import { createClient } from '@supabase/supabase-js'
import { generateUUID } from './utils'
import type {
  User,
  Student,
  Counsellor,
  Major,
  Honour,
  Appointment,
  ForumCategory,
  Discussion,
  DiscussionReply,
  ResourceCategory,
  Resource,
  University,
  Application,
  AppointmentStatus
} from '@/types/types'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
  return data!
}

export async function fetchStudentById(user_id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('student')
    .select('*')
    .eq('user_id', user_id)
    .single()
  if (error) throw error
  return data
}

export async function fetchCounsellorById(user_id: string): Promise<Counsellor | null> {
  const { data, error } = await supabase
    .from('counsellor')
    .select('*')
    .eq('user_id', user_id)
    .single()
  if (error) throw error
  return data
}

export async function fetchAppointmentsForStudent(student_email: string): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointment')
      .select('*')
      .eq('student_email', student_email);
    
    if (error) {
      console.error("Error fetching student appointments:", error);
      throw error;
    }
    
    console.log("Fetched student appointments:", data);
    return data || [];
  } catch (error) {
    console.error("Error in fetchAppointmentsForStudent:", error);
    throw error;
  }
}

export async function fetchAllStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('student')
      .select('*')

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}

export async function fetchAllCounsellors(): Promise<Counsellor[]> {
  const { data, error } = await supabase
    .from('counsellor')
    .select('*')
  if (error) throw error
  return data!
}

export async function fetchAllAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointment')
    .select('*')
  if (error) throw error
  return data!
}

export async function fetchAppointmentsForCounsellor(counsellor_email: string): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointment')
      .select('*')
      .eq('counsellor_email', counsellor_email);
    
    if (error) {
      console.error("Error fetching counsellor appointments:", error);
      throw error;
    }
    
    console.log("Fetched counsellor appointments:", data);
    return data || [];
  } catch (error) {
    console.error("Error in fetchAppointmentsForCounsellor:", error);
    throw error;
  }
}

export async function updateAppointmentStatus(
  appointment_id: string, 
  status: AppointmentStatus,
  counsellor_notes?: string,
  cancellation_reason?: string
): Promise<void> {
  const updateData: Partial<Appointment> = { 
    status,
    updated_at: new Date().toISOString()
  }
  
  if (counsellor_notes) {
    updateData.counsellor_notes = counsellor_notes
  }
  
  if (cancellation_reason) {
    updateData.cancellation_reason = cancellation_reason
  }
  
  const { error } = await supabase
    .from('appointment')
    .update(updateData)
    .eq('appointment_id', appointment_id)
    
  if (error) throw error
}

export async function fetchForumCategories(): Promise<ForumCategory[]> {
  const { data, error } = await supabase.from('forum_category').select('*')
  if (error) throw error
  
  // Add "All" category for UI filtering
  const allCategory = {
    category_id: "all",
    name: "All Topics",
    description: "All forum discussions",
    icon: null,
    display_order: 0,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return [allCategory, ...data];
}

export async function fetchDiscussions(category_id?: string): Promise<Discussion[]> {
  let query = supabase.from('discussion').select('*')
  
  // If category is specified and not 'all', filter by category
  if (category_id && category_id !== 'all') {
    query = query.eq('forum_category_name', category_id)
  }
  
  // Order by creation date (newest first) and pinned posts
  query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
  
  const { data, error } = await query
  if (error) throw error
  return data!
}

export async function fetchReplies(discussion_id: string): Promise<DiscussionReply[]> {
  const { data, error } = await supabase
    .from('discussion_reply')
    .select('*')
    .eq('discussion_id', discussion_id)
    .order('created_at', { ascending: true }) // Order by creation date
  
  if (error) throw error
  return data!
}

export async function fetchResourceCategories(): Promise<ResourceCategory[]> {
  const { data, error } = await supabase.from('resource_category').select('*')
  if (error) throw error
  return data!
}

export async function fetchResources(resource_category_name: string): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resource')
    .select('*')
    .eq('resource_category_name', resource_category_name)
  if (error) throw error
  return data!
}

// Keeping your local university-related functions
export async function fetchUniversities(): Promise<University[]> {
  const { data, error } = await supabase.from('university').select('*')
  if (error) throw error
  return data!
}

export async function fetchApplications(student_email: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('application')
    .select('*')
    .eq('student_email', student_email)
  if (error) throw error
  return data!
}

export async function createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
  try {
    // Generate UUID for appointment_id
    const appointment_id = generateUUID();
    
    // Ensure all required fields are present
    const appointmentData = {
      appointment_id,
      ...appointment,
      title: appointment.title || "Appointment", // Ensure title is never empty
      description: appointment.description || "General Appointment", // Ensure description is never empty
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log("Creating appointment with data:", appointmentData);
    
    const { data, error } = await supabase
      .from('appointment')
      .insert(appointmentData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
    
    if (!data) {
      console.error("No data returned from appointment creation");
      throw new Error("Failed to create appointment: No data returned");
    }
    
    console.log("Successfully created appointment:", data);
    return data;
  } catch (error) {
    console.error("Error in createAppointment function:", error);
    throw error;
  }
}

export async function deleteAppointment(appointment_id: string): Promise<void> {
  const { error } = await supabase
    .from('appointment')
    .delete()
    .eq('appointment_id', appointment_id)
  
  if (error) throw error
}

export async function createApplication(application: Partial<Application>): Promise<Application> {
  // Generate UUID for application_id
  const application_id = generateUUID();
  
  const { data, error } = await supabase
    .from('application')
    .insert({
      application_id,
      ...application,
      created_at: application.created_at || new Date().toISOString(),
      updated_at: application.updated_at || new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateApplication(
  application_id: string,
  updates: Partial<Application>
): Promise<Application> {
  const { data, error } = await supabase
    .from('application')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('application_id', application_id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function fetchAllApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('application')
    .select('*')
  if (error) throw error
  return data!
}

// This function filters applications based on the application year
export async function fetchApplicationsByYear(year: number): Promise<Application[]> {
  // We'll filter based on created_at field to get applications from a specific year
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`
  
  const { data, error } = await supabase
    .from('application')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
  
  if (error) throw error
  return data!
}

// Forum functions for creating, updating, and deleting content
export async function createDiscussion(discussion: Partial<Discussion>): Promise<Discussion> {
  const discussion_id = generateUUID();
  
  const { data, error } = await supabase
    .from('discussion')
    .insert({
      discussion_id,
      ...discussion,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      upvotes: 0,
      views: 0,
      is_pinned: discussion.is_pinned || false,
      is_closed: discussion.is_closed || false
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateDiscussion(discussion_id: string, updates: Partial<Discussion>): Promise<void> {
  const { error } = await supabase
    .from('discussion')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('discussion_id', discussion_id)
  
  if (error) throw error
}

export async function deleteDiscussion(discussion_id: string): Promise<void> {
  // First delete all replies to this discussion
  const { error: replyError } = await supabase
    .from('discussion_reply')
    .delete()
    .eq('discussion_id', discussion_id)
  
  if (replyError) throw replyError
  
  // Then delete the discussion itself
  const { error } = await supabase
    .from('discussion')
    .delete()
    .eq('discussion_id', discussion_id)
  
  if (error) throw error
}

export async function createReply(reply: Partial<DiscussionReply>): Promise<DiscussionReply> {
  const reply_id = generateUUID();
  
  const { data, error } = await supabase
    .from('discussion_reply')
    .insert({
      reply_id,
      ...reply,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      upvotes: 0
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Update the discussion's updated_at timestamp when a new reply is added
  await supabase
    .from('discussion')
    .update({ updated_at: new Date().toISOString() })
    .eq('discussion_id', reply.discussion_id);
    
  return data
}

export async function updateReply(reply_id: string, updates: Partial<DiscussionReply>): Promise<void> {
  const { error } = await supabase
    .from('discussion_reply')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('reply_id', reply_id)
  
  if (error) throw error
}

export async function deleteReply(reply_id: string): Promise<void> {
  const { error } = await supabase
    .from('discussion_reply')
    .delete()
    .eq('reply_id', reply_id)
  
  if (error) throw error
}

export async function incrementViewCount(discussion_id: string): Promise<void> {
  try {
    // First, get the current view count
    const { data: currentData, error: fetchError } = await supabase
      .from('discussion')
      .select('view_count')
      .eq('discussion_id', discussion_id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching current view count:", fetchError);
      return;
    }
    
    // Increment the view count
    const newViewCount = (currentData?.view_count || 0) + 1;
    
    // Update with the new view count
    const { error: updateError } = await supabase
      .from('discussion')
      .update({ view_count: newViewCount, updated_at: new Date().toISOString() })
      .eq('discussion_id', discussion_id);
    
    if (updateError) {
      console.error("Error updating view count:", updateError);
    }
  } catch (error) {
    console.error("Error in incrementViewCount:", error);
  }
}

export async function getDiscussionWithReplies(discussion_id: string): Promise<{ discussion: Discussion, replies: DiscussionReply[] }> {
  // Fetch the discussion
  const { data: discussion, error: discussionError } = await supabase
    .from('discussion')
    .select('*, forum_category:forum_category_name(*)')
    .eq('discussion_id', discussion_id)
    .single()
  
  if (discussionError) throw discussionError
  
  // Fetch the replies
  const { data: replies, error: repliesError } = await supabase
    .from('discussion_reply')
    .select('*')
    .eq('discussion_id', discussion_id)
    .order('created_at', { ascending: true })
  
  if (repliesError) throw repliesError
  
  return { discussion, replies: replies || [] }
}

// Alternative name for incrementViewCount to support both formats
export async function incrementDiscussionViews(discussion_id: string): Promise<void> {
  return incrementViewCount(discussion_id);
}

// Alternative name for createReply to support both formats
export async function createDiscussionReply(reply: Partial<DiscussionReply>): Promise<DiscussionReply> {
  return createReply(reply);
}