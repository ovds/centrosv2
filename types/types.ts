// lib/types.ts

export type UserRole = 'student' | 'counsellor' | 'admin'
export type StudentGender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type HouseType = 'fibonacci' | 'fleming' | 'faraday' | 'nobel' | string
export type AppointmentType = 'academic' | 'career' | 'personal' | 'other'
export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type DegreeType = 'bachelor' | 'master' | 'phd' | 'other'
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
export type Priority = 'high' | 'medium' | 'low'
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
  houses: HouseType
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
  counsellor_id: string
  student_id: string
  title: string
  start_time: string
  end_time: string
  description: string | null
  location: string | null
  appointment_type: AppointmentType
  status: AppointmentStatus
  cancellation_reason: string | null
  counsellor_notes: string | null
  student_notes: string | null
  is_recurring: boolean
  recurring_pattern: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface ForumCategory {
  category_id: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface Discussion {
  discussion_id: string
  title: string
  content: string
  author_id: string
  author_type: UserRole
  category_id: string
  is_pinned: boolean
  is_closed: boolean
  is_anonymous: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface DiscussionReply {
  reply_id: string
  discussion_id: string
  content: string
  author_id: string
  author_type: UserRole
  parent_reply_id: string | null
  is_anonymous: boolean
  is_solution: boolean
  created_at: string
  updated_at: string
}

export interface ResourceCategory {
  category_id: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface Resource {
  resource_id: string
  title: string
  description: string | null
  file_url: string | null
  external_url: string | null
  thumbnail_url: string | null
  resource_type: ResourceType
  category_id: string
  uploaded_by: string
  is_featured: boolean
  is_private: boolean
  file_size: number | null
  file_type: string | null
  download_count: number
  view_count: number
  expiry_date: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface University {
  university_id: string
  name: string
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
  student_id: string
  university_id: string
  program: string
  degree_type: DegreeType
  application_status: ApplicationStatus
  priority: Priority
  application_deadline: string | null
  submission_date: string | null
  result_date: string | null
  counsellor_id: string | null
  application_method: string | null
  application_fee: number | null
  scholarship_applied: boolean
  scholarship_details: string | null
  essay_topics: string | null
  interview_notes: string | null
  decision_letter_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}