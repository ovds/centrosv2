import { createClient } from '@supabase/supabase-js'
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
  Application
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

export async function fetchAppointmentsForStudent(student_id: string): Promise<Appointment[]> {
  
  const { data, error } = await supabase
    .from('appointment')
    .select('*')
    .eq('student_id', student_id)
  if (error) throw error
  return data!
}

export async function fetchForumCategories(): Promise<ForumCategory[]> {
  
  const { data, error } = await supabase.from('forum_category').select('*')
  if (error) throw error
  return data!
}

export async function fetchDiscussions(category_id: string): Promise<Discussion[]> {
  
  const { data, error } = await supabase
    .from('discussion')
    .select('*')
    .eq('category_id', category_id)
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

export async function fetchResources(category_id: string): Promise<Resource[]> {
  
  const { data, error } = await supabase
    .from('resource')
    .select('*')
    .eq('category_id', category_id)
  if (error) throw error
  return data!
}

export async function fetchUniversities(): Promise<University[]> {
  
  const { data, error } = await supabase.from('university').select('*')
  if (error) throw error
  return data!
}

export async function fetchApplications(student_id: string): Promise<Application[]> {
  
  const { data, error } = await supabase
    .from('application')
    .select('*')
    .eq('student_id', student_id)
  if (error) throw error
  return data!
}
