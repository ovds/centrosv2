import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types/supabase';

// Type for appointment data that matches our Supabase schema
export type AppointmentData = Database['public']['Tables']['Appointment']['Row'];

// Type for the appointment interface used in the UI components
export interface Appointment {
  id: string;
  title: string;
  studentName?: string;
  studentEmail?: string;
  studentId?: string;
  day: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  counsellorId: string;
  counsellorName?: string;
  type: 'academic' | 'career' | 'personal' | 'other';
  notes?: string;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  counsellorNotes?: string;
  location?: string;
}

// Convert database appointment to UI appointment
export function dbAppointmentToUIAppointment(dbAppointment: AppointmentData, studentName?: string, counsellorName?: string): Appointment {
  // Parse the start and end times
  const startTime = new Date(dbAppointment.start_time);
  const endTime = new Date(dbAppointment.end_time);
  
  return {
    id: dbAppointment.appointment_id,
    title: dbAppointment.title,
    studentId: dbAppointment.student_id,
    studentName: studentName || '',
    day: startTime,
    startHour: startTime.getHours(),
    startMinute: startTime.getMinutes(),
    endHour: endTime.getHours(),
    endMinute: endTime.getMinutes(),
    counsellorId: dbAppointment.counsellor_id,
    counsellorName: counsellorName || '',
    type: dbAppointment.appointment_type,
    notes: dbAppointment.description || '',
    status: dbAppointment.status,
    counsellorNotes: dbAppointment.counsellor_notes || '',
    location: dbAppointment.location || '',
  };
}

// Convert UI appointment to database appointment
export function uiAppointmentToDbAppointment(uiAppointment: Appointment): Omit<AppointmentData, 'created_at' | 'updated_at'> {
  // Create Date objects for start and end times
  const day = new Date(uiAppointment.day);
  
  // Set hours and minutes
  const startTime = new Date(day);
  startTime.setHours(uiAppointment.startHour, uiAppointment.startMinute, 0, 0);
  
  const endTime = new Date(day);
  endTime.setHours(uiAppointment.endHour, uiAppointment.endMinute, 0, 0);
  
  return {
    appointment_id: uiAppointment.id || uuidv4(),
    counsellor_id: uiAppointment.counsellorId,
    student_id: uiAppointment.studentId || '',
    title: uiAppointment.title,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    description: uiAppointment.notes || null,
    location: uiAppointment.location || null,
    appointment_type: uiAppointment.type,
    status: uiAppointment.status,
    cancellation_reason: null,
    counsellor_notes: uiAppointment.counsellorNotes || null,
    student_notes: null,
    is_recurring: false,
    recurring_pattern: null,
  };
}

// Fetch appointments for a counsellor
export async function getCounsellorAppointments(counsellorId: string): Promise<Appointment[]> {
  try {
    // Get appointments from the database
    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select('*, Student(name)')
      .eq('counsellor_id', counsellorId);

    if (error) {
      console.error('Error fetching counsellor appointments:', error);
      return [];
    }

    // Get counsellor name
    const { data: counsellor } = await supabase
      .from('Counsellor')
      .select('name')
      .eq('user_id', counsellorId)
      .single();

    // Convert to UI appointments
    return appointments.map(appointment => dbAppointmentToUIAppointment(
      appointment, 
      appointment.Student?.name, 
      counsellor?.name
    ));
  } catch (error) {
    console.error('Unexpected error fetching counsellor appointments:', error);
    return [];
  }
}

// Fetch appointments for a student
export async function getStudentAppointments(studentId: string): Promise<Appointment[]> {
  try {
    // Get appointments from the database
    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select('*, Counsellor(name)')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student appointments:', error);
      return [];
    }

    // Get student name
    const { data: student } = await supabase
      .from('Student')
      .select('name')
      .eq('user_id', studentId)
      .single();

    // Convert to UI appointments
    return appointments.map(appointment => dbAppointmentToUIAppointment(
      appointment, 
      student?.name, 
      appointment.Counsellor?.name
    ));
  } catch (error) {
    console.error('Unexpected error fetching student appointments:', error);
    return [];
  }
}

// Create a new appointment
export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> {
  try {
    const newAppointmentId = uuidv4();
    const dbAppointment = uiAppointmentToDbAppointment({
      ...appointment,
      id: newAppointmentId,
    });

    const { data, error } = await supabase
      .from('Appointment')
      .insert(dbAppointment)
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return null;
    }

    return dbAppointmentToUIAppointment(data);
  } catch (error) {
    console.error('Unexpected error creating appointment:', error);
    return null;
  }
}

// Update an appointment
export async function updateAppointment(appointment: Appointment): Promise<Appointment | null> {
  try {
    const dbAppointment = uiAppointmentToDbAppointment(appointment);

    const { data, error } = await supabase
      .from('Appointment')
      .update(dbAppointment)
      .eq('appointment_id', appointment.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return null;
    }

    return dbAppointmentToUIAppointment(data);
  } catch (error) {
    console.error('Unexpected error updating appointment:', error);
    return null;
  }
}

// Confirm an appointment
export async function confirmAppointment(appointmentId: string, notes?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Appointment')
      .update({
        status: 'confirmed',
        counsellor_notes: notes || null,
      })
      .eq('appointment_id', appointmentId);

    if (error) {
      console.error('Error confirming appointment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error confirming appointment:', error);
    return false;
  }
}

// Cancel an appointment
export async function cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Appointment')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || null,
      })
      .eq('appointment_id', appointmentId);

    if (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error cancelling appointment:', error);
    return false;
  }
}

// Delete an appointment
export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Appointment')
      .delete()
      .eq('appointment_id', appointmentId);

    if (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting appointment:', error);
    return false;
  }
}