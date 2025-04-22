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
  const { data, error } = await supabase
    .from('appointment')
    .select('*')
    .eq('student_email', student_email)
  if (error) throw error
  return data!
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
  const { data, error } = await supabase
    .from('appointment')
    .select('*')
    .eq('counsellor_email', counsellor_email)
  if (error) throw error
  return data!
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
  return data!
}

export async function fetchDiscussions(forum_category_name: string): Promise<Discussion[]> {
  const { data, error } = await supabase
    .from('discussion')
    .select('*')
    .eq('forum_category_name', forum_category_name)
  if (error) throw error
  return data!
}

export async function fetchReplies(discussion_id: string): Promise<DiscussionReply[]> {
  const { data, error } = await supabase
    .from('discussion_reply')
    .select('*')
    .eq('discussion_id', discussion_id)
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
  // Generate UUID for appointment_id
  const appointment_id = generateUUID();
  
  const { data, error } = await supabase
    .from('appointment')
    .insert({
      appointment_id,
      ...appointment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAppointment(appointment_id: string): Promise<void> {
  const { error } = await supabase
    .from('appointment')
    .delete()
    .eq('appointment_id', appointment_id)
  
  if (error) throw error
}
