// lib/types.ts

export type UserRole = 'student' | 'counsellor' | 'admin'
export type StudentGender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
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
export type NotificationType = 'appointment' | 'discussion' | 'resource' | 'application' | 'system'
export type NotificationPriority = 'low' | 'normal' | 'high'
export type ResourceType = 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio' | 'other'

export interface User {
  user_id: string
  email: string
  password_hash: string
  role: UserRole
  is_active: boolean
  email_verified: boolean
  reset_token: string | null
  reset_token_expires: string | null
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface Student {
  user_id: string
  name: string
  class: string | null
  graduation_year: number | null
  date_of_birth: string | null
  gender: StudentGender
  contact_number: string | null
  address: string | null
  parent_name: string | null
  parent_email: string | null
  parent_contact: string | null
  profile_picture_url: string | null
  bio: string | null
  interests: string | null
  created_at: string
  updated_at: string
}

export interface Counsellor {
  user_id: string
  name: string
  title: string | null
  specialization: string | null
  bio: string | null
  experience_years: number | null
  qualifications: string | null
  office_location: string | null
  contact_number: string | null
  office_hours: string | null
  profile_picture_url: string | null
  availability_schedule: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Major {
  user_id: string
  major: string
  is_primary: boolean
}

export interface Honour {
  user_id: string
  honour: string
  year: number | null
  description: string | null
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

export interface Notification {
  notification_id: string
  user_id: string
  title: string
  content: string
  notification_type: NotificationType
  related_id: string | null
  is_read: boolean
  is_email_sent: boolean
  priority: NotificationPriority
  created_at: string
}

export interface ActivityLog {
    log_id: string
    user_id: string | null
    action_type: string
    entity_type: string
    entity_id: string | null
    description: string | null
    previous_value: Record<string, any> | null
    new_value: Record<string, any> | null
    ip_address: string | null
    user_agent: string | null
    created_at: string
  }