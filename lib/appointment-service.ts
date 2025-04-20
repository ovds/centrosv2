import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentFrontend, AppointmentStatus, AppointmentType, NotificationType } from '@/types/supabase';

// Convert database appointment to UI-friendly appointment format
export function mapDatabaseToAppointment(dbAppointment: any, studentName?: string, counsellorName?: string): AppointmentFrontend {
  // Parse the date
  const appointmentDate = new Date(dbAppointment.start_time);
  
  // Extract time from start_time and end_time
  const getTimeFromISOString = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const start_time = getTimeFromISOString(dbAppointment.start_time);
  const end_time = getTimeFromISOString(dbAppointment.end_time);
  
  return {
    id: dbAppointment.appointment_id,
    title: dbAppointment.title,
    student_id: dbAppointment.student_id,
    student_name: studentName || dbAppointment.Student?.name || '',
    student_email: dbAppointment.Student?.email,
    counsellor_id: dbAppointment.counsellor_id,
    counsellor_name: counsellorName || dbAppointment.Counsellor?.name || '',
    date: appointmentDate,
    start_time,
    end_time,
    type: dbAppointment.appointment_type,
    notes: dbAppointment.description,
    status: dbAppointment.status,
    counsellor_notes: dbAppointment.counsellor_notes,
    student_notes: dbAppointment.student_notes,
    created_at: new Date(dbAppointment.created_at)
  };
}

// Convert UI appointment to database-friendly format
export function mapAppointmentToDatabase(appointment: Partial<AppointmentFrontend>): any {
  // Format date for database - ensures correct timezone handling
  const formatDateTimeForDb = (date: Date, timeString: string): string => {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    
    // Create new date object with correct time
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    
    return dateTime.toISOString();
  };
  
  // Only proceed if we have the necessary date and time information
  if (!appointment.date || !appointment.start_time || !appointment.end_time) {
    throw new Error("Appointment must include date, start_time, and end_time");
  }
  
  const start_time = formatDateTimeForDb(appointment.date, appointment.start_time);
  const end_time = formatDateTimeForDb(appointment.date, appointment.end_time);
  
  // Prepare the appointment data for database
  return {
    appointment_id: appointment.id || uuidv4(),
    counsellor_id: appointment.counsellor_id,
    student_id: appointment.student_id,
    title: appointment.title,
    start_time,
    end_time,
    description: appointment.notes || null,
    location: null, // Not currently used in UI
    appointment_type: appointment.type,
    status: appointment.status || 'requested',
    counsellor_notes: appointment.counsellor_notes || null,
    student_notes: appointment.student_notes || null,
    is_recurring: false, // Not currently used in UI
    recurring_pattern: null, // Not currently used in UI
  };
}

// Fetch appointments for a student
export async function getStudentAppointments(studentId: string): Promise<AppointmentFrontend[]> {
  try {
    // Get appointments from the database
    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select(`
        *,
        Counsellor(name)
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student appointments:', error);
      return [];
    }

    // Convert to UI format
    return appointments.map(appointment => 
      mapDatabaseToAppointment(appointment, undefined, appointment.Counsellor?.name)
    );
  } catch (error) {
    console.error('Unexpected error fetching student appointments:', error);
    return [];
  }
}

// Fetch appointments for a counsellor
export async function getCounsellorAppointments(counsellorId: string): Promise<AppointmentFrontend[]> {
  try {
    // Get appointments from the database
    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select(`
        *,
        Student(name, email)
      `)
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

    // Convert to UI format
    return appointments.map(appointment => 
      mapDatabaseToAppointment(
        appointment, 
        appointment.Student?.name, 
        counsellor?.name
      )
    );
  } catch (error) {
    console.error('Unexpected error fetching counsellor appointments:', error);
    return [];
  }
}

// Create a new appointment
export async function createAppointment(appointment: Omit<AppointmentFrontend, 'id' | 'created_at'>): Promise<AppointmentFrontend | null> {
  try {
    const dbAppointment = mapAppointmentToDatabase(appointment);

    const { data, error } = await supabase
      .from('Appointment')
      .insert(dbAppointment)
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return null;
    }

    // Create notification for counsellor
    await createNotification({
      user_id: appointment.counsellor_id,
      title: 'New Appointment Request',
      content: `You have a new appointment request from ${appointment.student_name} for ${appointment.type} counselling on ${appointment.date.toLocaleDateString()}.`,
      notification_type: 'appointment',
      related_id: data.appointment_id
    });

    return mapDatabaseToAppointment(data);
  } catch (error) {
    console.error('Unexpected error creating appointment:', error);
    return null;
  }
}

// Get a specific appointment by ID
export async function getAppointmentById(appointmentId: string): Promise<AppointmentFrontend | null> {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .select(`
        *,
        Student(name, email),
        Counsellor(name)
      `)
      .eq('appointment_id', appointmentId)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }

    return mapDatabaseToAppointment(
      data, 
      data.Student?.name, 
      data.Counsellor?.name
    );
  } catch (error) {
    console.error('Unexpected error fetching appointment:', error);
    return null;
  }
}

// Update an appointment
export async function updateAppointment(appointment: AppointmentFrontend): Promise<AppointmentFrontend | null> {
  try {
    const dbAppointment = mapAppointmentToDatabase(appointment);

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

    return mapDatabaseToAppointment(data);
  } catch (error) {
    console.error('Unexpected error updating appointment:', error);
    return null;
  }
}

// Change appointment status
export async function updateAppointmentStatus(
  appointmentId: string, 
  status: AppointmentStatus, 
  notes?: string
): Promise<boolean> {
  try {
    // Get the appointment first to get details for notifications
    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
      return false;
    }

    const updates: any = { status };
    
    // Add notes based on which party is updating and the new status
    if (status === 'confirmed' || status === 'cancelled') {
      updates.counsellor_notes = notes || null;
    } else if (status === 'completed') {
      updates.student_notes = notes || null;
    }

    const { error } = await supabase
      .from('Appointment')
      .update(updates)
      .eq('appointment_id', appointmentId);

    if (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }

    // Create notifications based on status change
    if (status === 'confirmed') {
      // Notify student
      await createNotification({
        user_id: appointment.student_id,
        title: 'Appointment Confirmed',
        content: `Your appointment for ${appointment.type} counselling on ${appointment.date.toLocaleDateString()} has been confirmed.`,
        notification_type: 'appointment',
        related_id: appointmentId
      });
    } else if (status === 'cancelled') {
      // Determine who to notify based on who cancelled
      const recipientId = notes ? appointment.student_id : appointment.counsellor_id;
      const message = notes 
        ? `Your appointment on ${appointment.date.toLocaleDateString()} has been cancelled by the counsellor.`
        : `An appointment on ${appointment.date.toLocaleDateString()} has been cancelled by the student.`;
      
      await createNotification({
        user_id: recipientId,
        title: 'Appointment Cancelled',
        content: message,
        notification_type: 'appointment',
        related_id: appointmentId
      });
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating appointment status:', error);
    return false;
  }
}

// Confirm an appointment (counsellor action)
export async function confirmAppointment(appointmentId: string, notes?: string): Promise<boolean> {
  return updateAppointmentStatus(appointmentId, 'confirmed', notes);
}

// Cancel an appointment
export async function cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
  return updateAppointmentStatus(appointmentId, 'cancelled', reason);
}

// Complete an appointment (counsellor action)
export async function completeAppointment(appointmentId: string, notes?: string): Promise<boolean> {
  return updateAppointmentStatus(appointmentId, 'completed', notes);
}

// Submit feedback for a completed appointment (student action)
export async function submitAppointmentFeedback(appointmentId: string, feedback: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Appointment')
      .update({ student_notes: feedback })
      .eq('appointment_id', appointmentId);

    if (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error submitting feedback:', error);
    return false;
  }
}

// Helper function to create a notification
export async function createNotification({
  user_id, 
  title, 
  content, 
  notification_type,
  related_id = null,
  priority = 'normal'
}: {
  user_id: string;
  title: string;
  content: string;
  notification_type: NotificationType;
  related_id?: string | null;
  priority?: 'low' | 'normal' | 'high';
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Notification')
      .insert({
        notification_id: uuidv4(),
        user_id,
        title,
        content,
        notification_type,
        related_id,
        is_read: false,
        is_email_sent: false,
        priority
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return false;
  }
}
