# Supabase Database Setup for NUS High Counselling Platform

## Overview

This document provides instructions for setting up the Supabase database schema required for the counselling platform aligned with the existing schema. The platform includes authentication for users, counselors, student profiles, appointments and more.

## Authentication Setup

1. **Set up Email Auth**:
   - In the Supabase dashboard, go to Authentication > Providers
   - Enable Email provider
   - Configure settings as needed (password length, etc.)

2. **Set up Microsoft OAuth** (for counselor login):
   - In the Supabase dashboard, go to Authentication > Providers > Microsoft
   - Enable Microsoft OAuth
   - Set up OAuth credentials:
     - Register an application in the Microsoft Azure Portal
     - Set the redirect URI to: `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - Configure scopes to include: `email`, `profile`, `User.Read`
   - Add the Client ID and Client Secret to Supabase

## Database Schema

Your database schema is already defined with the following structure:

### User Authentication & Profiles
- `Users` - Main user table with authentication details
- `Student` - Student profiles linked to users
- `Counsellor` - Counsellor profiles linked to users
- `Major` - Student majors (many-to-many)
- `Honour` - Student honors and achievements

### Appointments
- `Appointment` - Appointment records between students and counsellors

### Forums & Resources
- `Forum_Category` - Categories for discussion forums
- `Discussion` - Forum discussion threads
- `Discussion_Reply` - Replies to discussions
- `Resource_Category` - Categories for resources
- `Resource` - Educational resources

### Applications & Notifications
- `University` - University information
- `Application` - University application tracking
- `Notification` - User notifications
- `Activity_Log` - System activity logs

## Database Integration

To integrate Supabase with this schema, you must:

1. Ensure the admin auth context connects to the `Counsellor` table using proper fields
2. Update your appointment service to format dates correctly (your schema uses DATE not TIMESTAMP)
3. Make sure all IDs are properly formatted as VARCHAR(36) instead of UUIDs

## Row Level Security (RLS) Policies

To secure your data, set up RLS policies for each table:

### Counsellor Table Policies

```sql
-- Allow counsellors to read their own data
CREATE POLICY "Counsellors can view own data" 
ON "Counsellor" FOR SELECT 
USING (auth.uid()::text = user_id);

-- Allow counsellors to update their own data
CREATE POLICY "Counsellors can update own data" 
ON "Counsellor" FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Allow admin to read all counsellor data
CREATE POLICY "Admins can view all counsellors" 
ON "Counsellor" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "Users"
    WHERE "Users".user_id = auth.uid()::text
    AND "Users".role = 'admin'
  )
);
```

### Appointment Table Policies

```sql
-- Allow counsellors to view their appointments
CREATE POLICY "Counsellors can view own appointments" 
ON "Appointment" FOR SELECT 
USING (
  counsellor_id = (
    SELECT user_id FROM "Counsellor"
    WHERE user_id = auth.uid()::text
  )
);

-- Allow counsellors to update their appointments
CREATE POLICY "Counsellors can update own appointments" 
ON "Appointment" FOR UPDATE 
USING (
  counsellor_id = (
    SELECT user_id FROM "Counsellor"
    WHERE user_id = auth.uid()::text
  )
);

-- Allow students to view their appointments
CREATE POLICY "Students can view own appointments" 
ON "Appointment" FOR SELECT 
USING (
  student_id = (
    SELECT user_id FROM "Student"
    WHERE user_id = auth.uid()::text
  )
);
```

## User Registration and Mapping

For counsellor accounts, ensure that when they register, their data is properly inserted into both the `Users` table and the `Counsellor` table. This can be accomplished through:

1. Database triggers
2. Backend API functions
3. Client-side registration flow that handles the dual-table insertion

## Important Notes

1. Ensure Supabase auth users match with the `Users` table IDs
2. Convert UUID formats to VARCHAR(36) when needed
3. Pay attention to date formats in the `Appointment` table
4. For Microsoft OAuth integration, map the user data correctly to your schema

## Deployment Checklist

- [ ] Set up authentication providers
- [ ] Configure RLS policies
- [ ] Test counsellor login
- [ ] Verify appointment creation with correct date formats
- [ ] Test API integrations between frontend and Supabase