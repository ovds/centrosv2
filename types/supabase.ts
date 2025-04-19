export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Users: {
        Row: {
          user_id: string
          email: string
          password_hash: string
          role: 'student' | 'counsellor' | 'admin'
          is_active: boolean
          email_verified: boolean
          reset_token: string | null
          reset_token_expires: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          user_id?: string
          email: string
          password_hash: string
          role: 'student' | 'counsellor' | 'admin'
          is_active?: boolean
          email_verified?: boolean
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          user_id?: string
          email?: string
          password_hash?: string
          role?: 'student' | 'counsellor' | 'admin'
          is_active?: boolean
          email_verified?: boolean
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      Student: {
        Row: {
          user_id: string
          name: string
          class: string | null
          graduation_year: number | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
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
        Insert: {
          user_id: string
          name: string
          class?: string | null
          graduation_year?: number | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          contact_number?: string | null
          address?: string | null
          parent_name?: string | null
          parent_email?: string | null
          parent_contact?: string | null
          profile_picture_url?: string | null
          bio?: string | null
          interests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          class?: string | null
          graduation_year?: number | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          contact_number?: string | null
          address?: string | null
          parent_name?: string | null
          parent_email?: string | null
          parent_contact?: string | null
          profile_picture_url?: string | null
          bio?: string | null
          interests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      Counsellor: {
        Row: {
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
          availability_schedule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          title?: string | null
          specialization?: string | null
          bio?: string | null
          experience_years?: number | null
          qualifications?: string | null
          office_location?: string | null
          contact_number?: string | null
          office_hours?: string | null
          profile_picture_url?: string | null
          availability_schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          title?: string | null
          specialization?: string | null
          bio?: string | null
          experience_years?: number | null
          qualifications?: string | null
          office_location?: string | null
          contact_number?: string | null
          office_hours?: string | null
          profile_picture_url?: string | null
          availability_schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      Major: {
        Row: {
          user_id: string
          major: string
          is_primary: boolean
        }
        Insert: {
          user_id: string
          major: string
          is_primary?: boolean
        }
        Update: {
          user_id?: string
          major?: string
          is_primary?: boolean
        }
      }
      Honour: {
        Row: {
          user_id: string
          honour: string
          year: number | null
          description: string | null
        }
        Insert: {
          user_id: string
          honour: string
          year?: number | null
          description?: string | null
        }
        Update: {
          user_id?: string
          honour?: string
          year?: number | null
          description?: string | null
        }
      }
      Appointment: {
        Row: {
          appointment_id: string
          counsellor_id: string
          student_id: string
          title: string
          start_time: string
          end_time: string
          description: string | null
          location: string | null
          appointment_type: 'academic' | 'career' | 'personal' | 'other'
          status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          cancellation_reason: string | null
          counsellor_notes: string | null
          student_notes: string | null
          is_recurring: boolean
          recurring_pattern: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string
          counsellor_id: string
          student_id: string
          title: string
          start_time: string
          end_time: string
          description?: string | null
          location?: string | null
          appointment_type: 'academic' | 'career' | 'personal' | 'other'
          status?: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          cancellation_reason?: string | null
          counsellor_notes?: string | null
          student_notes?: string | null
          is_recurring?: boolean
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          counsellor_id?: string
          student_id?: string
          title?: string
          start_time?: string
          end_time?: string
          description?: string | null
          location?: string | null
          appointment_type?: 'academic' | 'career' | 'personal' | 'other'
          status?: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          cancellation_reason?: string | null
          counsellor_notes?: string | null
          student_notes?: string | null
          is_recurring?: boolean
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      Forum_Category: {
        Row: {
          category_id: string
          name: string
          description: string | null
          icon: string | null
          display_order: number
          is_private: boolean
          created_at: string
        }
        Insert: {
          category_id?: string
          name: string
          description?: string | null
          icon?: string | null
          display_order?: number
          is_private?: boolean
          created_at?: string
        }
        Update: {
          category_id?: string
          name?: string
          description?: string | null
          icon?: string | null
          display_order?: number
          is_private?: boolean
          created_at?: string
        }
      }
    }
  }
}