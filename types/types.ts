// types/types.ts

export type UserRole = 'student' | 'counsellor' | 'admin'
export type StudentGender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type HouseType = 'fibonacci' | 'fleming' | 'faraday' | 'nobel'
export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type ApplicationStatus =
  | 'planning'
  | 'in_progress'
  | 'submitted'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'deferred'
  | 'enrolled'
export type ResourceType = 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio' | 'other'

export interface User {
  email: string
  role: UserRole
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface Student {
  email: string
  name: string
  class: string | null
  house: HouseType | null
  graduation_year: number | null
  date_of_birth: string | null
  gender: StudentGender
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Counsellor {
  email: string
  name: string
  title: string | null
  bio: string | null
  house: HouseType | null
  office_hours: string | null
  availability_schedule: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Major {
  email: string
  major: string
}

export interface Honour {
  email: string
  honour: string
}

export interface Appointment {
  appointment_id: string
  counsellor_email: string
  student_email: string
  title: string
  start_time: string
  end_time: string
  description: string | null
  status: AppointmentStatus
  cancellation_reason: string | null
  counsellor_notes: string | null
  student_notes: string | null
  created_at: string
  updated_at: string
}

export interface ForumCategory {
  forum_category_name: string
  description: string | null
}

export interface Discussion {
  discussion_id: string
  title: string
  content: string
  author_email: string
  author_type: UserRole
  forum_category_name: string
  is_pinned: boolean
  is_closed: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface DiscussionReply {
  reply_id: string
  discussion_id: string
  content: string
  author_email: string
  author_type: UserRole
  parent_reply_id: string | null
  is_solution: boolean
  created_at: string
  updated_at: string
}

export interface ResourceCategory {
  resource_category_name: string
  description: string | null
}

export interface Resource {
  resource_id: string
  title: string
  description: string | null
  file_url: string | null
  external_url: string | null
  resource_type: ResourceType
  resource_category_name: string
  uploaded_by: string
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface University {
  uni_name: string
  country: string
  region: string | null
  website: string | null
  logo_url: string | null
  description: string | null
  acceptance_rate: number | null
  average_gpa: number | null
  ranking: number | null
  notable_programs: string | null
  application_tips: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  application_id: string
  student_email: string
  uni_name: string
  program: string
  application_status: ApplicationStatus
  application_deadline: string | null
  submission_date: string | null
  result_date: string | null
  created_at: string
  updated_at: string
}