export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      Users: {
        Row: {
          user_id: string;
          email: string;
          password_hash: string;
          role: 'student' | 'counsellor' | 'admin';
          is_active: boolean;
          email_verified: boolean;
          reset_token: string | null;
          reset_token_expires: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          user_id?: string;
          email: string;
          password_hash: string;
          role: 'student' | 'counsellor' | 'admin';
          is_active?: boolean;
          email_verified?: boolean;
          reset_token?: string | null;
          reset_token_expires?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          user_id?: string;
          email?: string;
          password_hash?: string;
          role?: 'student' | 'counsellor' | 'admin';
          is_active?: boolean;
          email_verified?: boolean;
          reset_token?: string | null;
          reset_token_expires?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
      Student: {
        Row: {
          user_id: string;
          name: string;
          class: string | null;
          graduation_year: number | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
          contact_number: string | null;
          address: string | null;
          parent_name: string | null;
          parent_email: string | null;
          parent_contact: string | null;
          profile_picture_url: string | null;
          bio: string | null;
          interests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          class?: string | null;
          graduation_year?: number | null;
          date_of_birth?: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
          contact_number?: string | null;
          address?: string | null;
          parent_name?: string | null;
          parent_email?: string | null;
          parent_contact?: string | null;
          profile_picture_url?: string | null;
          bio?: string | null;
          interests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string;
          class?: string | null;
          graduation_year?: number | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
          contact_number?: string | null;
          address?: string | null;
          parent_name?: string | null;
          parent_email?: string | null;
          parent_contact?: string | null;
          profile_picture_url?: string | null;
          bio?: string | null;
          interests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Counsellor: {
        Row: {
          user_id: string;
          name: string;
          title: string | null;
          specialization: string | null;
          bio: string | null;
          experience_years: number | null;
          qualifications: string | null;
          office_location: string | null;
          contact_number: string | null;
          office_hours: string | null;
          profile_picture_url: string | null;
          availability_schedule: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          title?: string | null;
          specialization?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          qualifications?: string | null;
          office_location?: string | null;
          contact_number?: string | null;
          office_hours?: string | null;
          profile_picture_url?: string | null;
          availability_schedule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string;
          title?: string | null;
          specialization?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          qualifications?: string | null;
          office_location?: string | null;
          contact_number?: string | null;
          office_hours?: string | null;
          profile_picture_url?: string | null;
          availability_schedule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Appointment: {
        Row: {
          appointment_id: string;
          counsellor_id: string;
          student_id: string;
          title: string;
          start_time: string;
          end_time: string;
          description: string | null;
          location: string | null;
          appointment_type: 'academic' | 'career' | 'personal' | 'other';
          status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
          cancellation_reason: string | null;
          counsellor_notes: string | null;
          student_notes: string | null;
          is_recurring: boolean;
          recurring_pattern: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          appointment_id?: string;
          counsellor_id: string;
          student_id: string;
          title: string;
          start_time: string;
          end_time: string;
          description?: string | null;
          location?: string | null;
          appointment_type: 'academic' | 'career' | 'personal' | 'other';
          status?: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
          cancellation_reason?: string | null;
          counsellor_notes?: string | null;
          student_notes?: string | null;
          is_recurring?: boolean;
          recurring_pattern?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string;
          counsellor_id?: string;
          student_id?: string;
          title?: string;
          start_time?: string;
          end_time?: string;
          description?: string | null;
          location?: string | null;
          appointment_type?: 'academic' | 'career' | 'personal' | 'other';
          status?: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
          cancellation_reason?: string | null;
          counsellor_notes?: string | null;
          student_notes?: string | null;
          is_recurring?: boolean;
          recurring_pattern?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Forum_Category: {
        Row: {
          category_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          display_order: number;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category_id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      Discussion: {
        Row: {
          discussion_id: string;
          title: string;
          content: string;
          author_id: string;
          author_type: 'student' | 'counsellor' | 'admin';
          category_id: string;
          is_pinned: boolean;
          is_closed: boolean;
          is_anonymous: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          discussion_id?: string;
          title: string;
          content: string;
          author_id: string;
          author_type: 'student' | 'counsellor' | 'admin';
          category_id: string;
          is_pinned?: boolean;
          is_closed?: boolean;
          is_anonymous?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          discussion_id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          author_type?: 'student' | 'counsellor' | 'admin';
          category_id?: string;
          is_pinned?: boolean;
          is_closed?: boolean;
          is_anonymous?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      Discussion_Reply: {
        Row: {
          reply_id: string;
          discussion_id: string;
          content: string;
          author_id: string;
          author_type: 'student' | 'counsellor' | 'admin';
          parent_reply_id: string | null;
          is_anonymous: boolean;
          is_solution: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          reply_id?: string;
          discussion_id: string;
          content: string;
          author_id: string;
          author_type: 'student' | 'counsellor' | 'admin';
          parent_reply_id?: string | null;
          is_anonymous?: boolean;
          is_solution?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reply_id?: string;
          discussion_id?: string;
          content?: string;
          author_id?: string;
          author_type?: 'student' | 'counsellor' | 'admin';
          parent_reply_id?: string | null;
          is_anonymous?: boolean;
          is_solution?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      Resource_Category: {
        Row: {
          category_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category_id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      Resource: {
        Row: {
          resource_id: string;
          title: string;
          description: string | null;
          file_url: string | null;
          external_url: string | null;
          thumbnail_url: string | null;
          resource_type: 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio' | 'other';
          category_id: string;
          uploaded_by: string;
          is_featured: boolean;
          is_private: boolean;
          file_size: number | null;
          file_type: string | null;
          download_count: number;
          view_count: number;
          expiry_date: string | null;
          tags: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          resource_id?: string;
          title: string;
          description?: string | null;
          file_url?: string | null;
          external_url?: string | null;
          thumbnail_url?: string | null;
          resource_type: 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio' | 'other';
          category_id: string;
          uploaded_by: string;
          is_featured?: boolean;
          is_private?: boolean;
          file_size?: number | null;
          file_type?: string | null;
          download_count?: number;
          view_count?: number;
          expiry_date?: string | null;
          tags?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          resource_id?: string;
          title?: string;
          description?: string | null;
          file_url?: string | null;
          external_url?: string | null;
          thumbnail_url?: string | null;
          resource_type?: 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio' | 'other';
          category_id?: string;
          uploaded_by?: string;
          is_featured?: boolean;
          is_private?: boolean;
          file_size?: number | null;
          file_type?: string | null;
          download_count?: number;
          view_count?: number;
          expiry_date?: string | null;
          tags?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Major: {
        Row: {
          user_id: string;
          major: string;
          is_primary: boolean;
        };
        Insert: {
          user_id: string;
          major: string;
          is_primary?: boolean;
        };
        Update: {
          user_id?: string;
          major?: string;
          is_primary?: boolean;
        };
      };
      Honour: {
        Row: {
          user_id: string;
          honour: string;
          year: number | null;
          description: string | null;
        };
        Insert: {
          user_id: string;
          honour: string;
          year?: number | null;
          description?: string | null;
        };
        Update: {
          user_id?: string;
          honour?: string;
          year?: number | null;
          description?: string | null;
        };
      };
      Notification: {
        Row: {
          notification_id: string;
          user_id: string;
          title: string;
          content: string;
          notification_type: 'appointment' | 'discussion' | 'resource' | 'application' | 'system';
          related_id: string | null;
          is_read: boolean;
          is_email_sent: boolean;
          priority: 'low' | 'normal' | 'high';
          created_at: string;
        };
        Insert: {
          notification_id?: string;
          user_id: string;
          title: string;
          content: string;
          notification_type: 'appointment' | 'discussion' | 'resource' | 'application' | 'system';
          related_id?: string | null;
          is_read?: boolean;
          is_email_sent?: boolean;
          priority?: 'low' | 'normal' | 'high';
          created_at?: string;
        };
        Update: {
          notification_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          notification_type?: 'appointment' | 'discussion' | 'resource' | 'application' | 'system';
          related_id?: string | null;
          is_read?: boolean;
          is_email_sent?: boolean;
          priority?: 'low' | 'normal' | 'high';
          created_at?: string;
        };
      };
      University: {
        Row: {
          university_id: string;
          name: string;
          country: string;
          region: string | null;
          website: string | null;
          logo_url: string | null;
          description: string | null;
          acceptance_rate: number | null;
          average_gpa: number | null;
          ranking: number | null;
          notable_programs: string | null;
          application_tips: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          university_id?: string;
          name: string;
          country: string;
          region?: string | null;
          website?: string | null;
          logo_url?: string | null;
          description?: string | null;
          acceptance_rate?: number | null;
          average_gpa?: number | null;
          ranking?: number | null;
          notable_programs?: string | null;
          application_tips?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          university_id?: string;
          name?: string;
          country?: string;
          region?: string | null;
          website?: string | null;
          logo_url?: string | null;
          description?: string | null;
          acceptance_rate?: number | null;
          average_gpa?: number | null;
          ranking?: number | null;
          notable_programs?: string | null;
          application_tips?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Application: {
        Row: {
          application_id: string;
          student_id: string;
          university_id: string;
          program: string;
          degree_type: 'bachelor' | 'master' | 'phd' | 'other';
          application_status: 'planning' | 'in_progress' | 'submitted' | 'interview' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred' | 'enrolled';
          priority: 'high' | 'medium' | 'low';
          application_deadline: string | null;
          submission_date: string | null;
          result_date: string | null;
          counsellor_id: string | null;
          application_method: string | null;
          application_fee: number | null;
          scholarship_applied: boolean;
          scholarship_details: string | null;
          essay_topics: string | null;
          interview_notes: string | null;
          decision_letter_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          application_id?: string;
          student_id: string;
          university_id: string;
          program: string;
          degree_type: 'bachelor' | 'master' | 'phd' | 'other';
          application_status: 'planning' | 'in_progress' | 'submitted' | 'interview' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred' | 'enrolled';
          priority?: 'high' | 'medium' | 'low';
          application_deadline?: string | null;
          submission_date?: string | null;
          result_date?: string | null;
          counsellor_id?: string | null;
          application_method?: string | null;
          application_fee?: number | null;
          scholarship_applied?: boolean;
          scholarship_details?: string | null;
          essay_topics?: string | null;
          interview_notes?: string | null;
          decision_letter_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          student_id?: string;
          university_id?: string;
          program?: string;
          degree_type?: 'bachelor' | 'master' | 'phd' | 'other';
          application_status?: 'planning' | 'in_progress' | 'submitted' | 'interview' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred' | 'enrolled';
          priority?: 'high' | 'medium' | 'low';
          application_deadline?: string | null;
          submission_date?: string | null;
          result_date?: string | null;
          counsellor_id?: string | null;
          application_method?: string | null;
          application_fee?: number | null;
          scholarship_applied?: boolean;
          scholarship_details?: string | null;
          essay_topics?: string | null;
          interview_notes?: string | null;
          decision_letter_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Activity_Log: {
        Row: {
          log_id: string;
          user_id: string | null;
          action_type: string;
          entity_type: string;
          entity_id: string | null;
          description: string | null;
          previous_value: Json | null;
          new_value: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          log_id?: string;
          user_id?: string | null;
          action_type: string;
          entity_type: string;
          entity_id?: string | null;
          description?: string | null;
          previous_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          log_id?: string;
          user_id?: string | null;
          action_type?: string;
          entity_type?: string;
          entity_id?: string | null;
          description?: string | null;
          previous_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'student' | 'counsellor' | 'admin';
      student_gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
      appointment_type: 'academic' | 'career' | 'personal' | 'other';
      appointment_status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
      application_degree_type: 'bachelor' | 'master' | 'phd' | 'other';
      application_status: 'planning' | 'in_progress' | 'submitted' | 'interview' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred' | 'enrolled';
      application_priority: 'high' | 'medium' | 'low';
      notification_type: 'appointment' | 'discussion' | 'resource' | 'application' | 'system';
      notification_priority: 'low' | 'normal' | 'high';
      resource_type_enum: 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio' | 'other';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Custom types for use with the app
export type UserRole = Database['public']['Enums']['user_role'];
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type AppointmentType = Database['public']['Enums']['appointment_type'];
export type ResourceType = Database['public']['Enums']['resource_type_enum'];
export type NotificationType = Database['public']['Enums']['notification_type'];

// User profile types
export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
};

export type StudentProfile = UserProfile & {
  role: 'student';
  class?: string;
  graduation_year?: number;
  gender?: Database['public']['Enums']['student_gender'];
  contact_number?: string;
  parent_email?: string;
};

export type CounsellorProfile = UserProfile & {
  role: 'counsellor';
  title?: string;
  specialization?: string;
  office_location?: string;
  contact_number?: string;
  office_hours?: string;
};

// Appointment type for frontend use
export type AppointmentFrontend = {
  id: string;
  title: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  counsellor_id: string;
  counsellor_name: string;
  date: Date;
  start_time: string;
  end_time: string;
  type: AppointmentType;
  notes?: string;
  status: AppointmentStatus;
  counsellor_notes?: string;
  student_notes?: string;
  created_at: Date;
};

// Forum types for frontend use
export type ForumCategory = Database['public']['Tables']['Forum_Category']['Row'];
export type Discussion = Database['public']['Tables']['Discussion']['Row'] & {
  author_name?: string;
  category_name?: string;
  replies_count?: number;
};
export type DiscussionReply = Database['public']['Tables']['Discussion_Reply']['Row'] & {
  author_name?: string;
};

// Resource types for frontend use
export type ResourceCategory = Database['public']['Tables']['Resource_Category']['Row'];
export type Resource = Database['public']['Tables']['Resource']['Row'] & {
  uploader_name?: string;
  category_name?: string;
};

// Notification type for frontend use
export type Notification = Database['public']['Tables']['Notification']['Row'];
