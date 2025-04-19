export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: 'student' | 'counsellor' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile extends Profile {
  role: 'student';
  student_id?: string;
  grade_level?: string;
  parent_email?: string;
  parent_phone?: string;
}

export interface CounsellorProfile extends Profile {
  role: 'counsellor';
  specialization?: string;
  bio?: string;
  office_hours?: string;
  phone?: string;
}

export interface Appointment {
  id: number;
  student_id: string;
  counsellor_id: string;
  title: string;
  type: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  counsellor_notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  is_anonymous: boolean;
  slug: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  discussion_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link' | 'other';
  url: string;
  file_size?: string;
  duration?: string;
  category: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  download_count: number;
  is_featured: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'discussion' | 'resource' | 'system';
  read: boolean;
  related_id?: string;
  created_at: string;
}

export interface UniversityApplication {
  id: string;
  student_id: string;
  university_name: string;
  program: string;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted';
  notes?: string;
  created_at: string;
  updated_at: string;
}
