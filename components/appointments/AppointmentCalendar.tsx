import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, isAfter, isBefore, addMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Counsellor, Appointment } from '@/app/appointments/page';

// Business hours configuration
const BUSINESS_START_HOUR = 8; // 8 AM
const BUSINESS_END_HOUR = 18; // 6 PM

// Types
interface TimeSlot {
  hour: number;
  minute: number;
}

interface NewAppointmentData {
  date: Date;
  start_time: string;
  end_time: string;
  title: string;
  counsellor_id: string;
  counsellor_name: string;
  type: string;
  notes: string;
}

// Session types
const sessionTypes = [
  'Academic Counselling',
  'Career Guidance',
  'Personal Development',
  'University Applications',
  'Scholarship Guidance'
];

// Create time slots for the day based on business hours
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
    slots.push({ hour, minute: 0 });
    slots.push({ hour, minute: 30 });
  }

  return slots;
};

// Format time (e.g., "9:30 AM")
const formatTime = (hour: number, minute: number): string => {
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Convert time string to hours and minutes
const parseTimeString = (timeString: string): { hour: number, minute: number } => {
  const [time, period] = timeString.split(' ');
  let [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  // Convert to 24-hour format
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return { hour, minute };
};

interface AppointmentCalendarProps {
  counsellor: Counsellor | undefined;
  appointments: Appointment[];
  onSaveAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  counsellor,
  appointments,
  onSaveAppointment
}) => {
  // Media query hooks
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  // Set up media queries
  useEffect(() => {
    const checkMediaQueries = () => {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
      setIsTablet(window.matchMedia('(max-width: 1024px)').matches);
    };

    checkMediaQueries();
    window.addEventListener('resize', checkMediaQueries);
    
    return () => {
      window.removeEventListener('resize', checkMediaQueries);
    };
  }, []);

  const { toast } = useToast();

  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [visibleDays, setVisibleDays] = useState<number>(7);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    day: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  } | null>(null);
  const [newAppointment, setNewAppointment] = useState<Partial<NewAppointmentData>>({
    title: '',
    type: '',
    notes: ''
  });

  // When on mobile, show only the current day
  useEffect(() => {
    setVisibleDays(isMobile ? 1 : isTablet ? 3 : 7);
  }, [isMobile, isTablet]);

  // Refs
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate time slots based on business hours
  const timeSlots = generateTimeSlots();

  // Calculate week dates
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from(
    { length: visibleDays },
    (_, i) => addDays(startDate, isMobile ? new Date().getDay() : i)
  );

  // Navigation handlers
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Date picker handler
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
      setCalendarOpen(false);
    }
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (day: Date, hour: number, minute: number): boolean => {
    // Don't allow past dates
    const now = new Date();
    const slotTime = new Date(day);
    slotTime.setHours(hour, minute);
    
    if (isBefore(slotTime, now)) {
      return false;
    }

    // Check if the slot overlaps with existing appointments
    return !appointments.some(appointment => {
      if (appointment.status === 'cancelled') return false;
      
      const appointmentDate = new Date(appointment.date);
      if (!isSameDay(appointmentDate, day)) return false;
      
      const startTime = parseTimeString(appointment.start_time);
      const endTime = parseTimeString(appointment.end_time);
      
      const appointmentStart = new Date(appointmentDate);
      appointmentStart.setHours(startTime.hour, startTime.minute);
      
      const appointmentEnd = new Date(appointmentDate);
      appointmentEnd.setHours(endTime.hour, endTime.minute);
      
      const slotStart = new Date(day);
      slotStart.setHours(hour, minute);
      
      const slotEnd = addMinutes(slotStart, 30);
      
      // Check for overlap
      return (
        (isAfter(slotStart, appointmentStart) && isBefore(slotStart, appointmentEnd)) ||
        (isAfter(slotEnd, appointmentStart) && isBefore(slotEnd, appointmentEnd)) ||
        (isBefore(slotStart, appointmentStart) && isAfter(slotEnd, appointmentEnd))
      );
    });
  };

  // Handle time slot click
  const handleTimeSlotClick = (day: Date, hour: number, minute: number) => {
    if (!counsellor) {
      toast({
        title: "No counsellor selected",
        description: "Please select a counsellor first",
        variant: "destructive"
      });
      return;
    }

    if (!isTimeSlotAvailable(day, hour, minute)) {
      return;
    }

    // Set the selected time slot
    setSelectedTimeSlot({
      day,
      startHour: hour,
      startMinute: minute,
      endHour: minute === 30 ? hour + 1 : hour,
      endMinute: minute === 30 ? 0 : 30
    });

    // Initialize new appointment data
    setNewAppointment({
      title: '',
      counsellor_id: counsellor.id,
      counsellor_name: counsellor.name,
      type: '',
      notes: ''
    });

    // Open the appointment dialog
    setShowAppointmentDialog(true);
  };

  // Handle saving new appointment
  const handleSaveAppointment = () => {
    if (!selectedTimeSlot || !counsellor || !newAppointment.title || !newAppointment.type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { day, startHour, startMinute, endHour, endMinute } = selectedTimeSlot;

    const appointment = {
      title: newAppointment.title || '',
      status: 'requested' as const,
      student_id: '', // Will be set in the parent component
      student_name: '', // Will be set in the parent component
      counsellor_id: counsellor.id,
      counsellor_name: counsellor.name,
      date: day,
      start_time: formatTime(startHour, startMinute),
      end_time: formatTime(endHour, endMinute),
      type: newAppointment.type || '',
      notes: newAppointment.notes || '',
      created_at: new Date()
    };

    onSaveAppointment(appointment);

    // Close the dialog and reset state
    setShowAppointmentDialog(false);
    setSelectedTimeSlot(null);
    setNewAppointment({
      title: '',
      type: '',
      notes: ''
    });
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-md border shadow-sm">
      {/* Calendar header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {isMobile ? format(weekDays[0], 'EEE, MMM d') : format(currentDate, 'MMMM yyyy')}
          </h2>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2 h-8">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Select Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="hidden sm:grid"
         style={{
           gridTemplateColumns: `5rem repeat(${visibleDays}, 1fr)`,
           position: 'sticky',
           top: 0,
           zIndex: 10,
           backgroundColor: 'var(--background)',
           borderBottom: '1px solid var(--border)'
         }}>
        <div></div>
        {weekDays.map((day, index) => (
          <div
            key={`header-${index}`}
            className={cn(
              "flex flex-col items-center justify-center py-3",
              isToday(day) ? "bg-primary/5" : ""
            )}
          >
            <div className="uppercase text-sm font-medium">
              {format(day, 'EEE')}
            </div>
            <div className={cn(
              "inline-flex items-center justify-center",
              isToday(day)
                ? "bg-primary/20 text-primary font-bold rounded-full w-8 h-8 mt-1"
                : "font-bold text-lg mt-1"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile day header */}
      <div className="sm:hidden border-b">
        <div
          className={cn(
            "flex flex-col items-center justify-center py-3",
            isToday(weekDays[0]) ? "bg-primary/5" : ""
          )}
        >
          <div className="uppercase text-sm font-medium">
            {format(weekDays[0], 'EEEE')}
          </div>
          <div className={cn(
            "inline-flex items-center justify-center",
            isToday(weekDays[0])
              ? "bg-primary/20 text-primary font-bold rounded-full w-8 h-8 mt-1"
              : "font-bold text-lg mt-1"
          )}>
            {format(weekDays[0], 'd')}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-auto flex-1 relative scrollbar-hidden">
        <div
          ref={gridRef}
          className="grid relative"
          style={{
            gridTemplateColumns: isMobile
              ? '5rem 1fr'
              : `5rem repeat(${visibleDays}, 1fr)`,
            gridTemplateRows: `repeat(${timeSlots.length}, 3rem)`,
            minWidth: isMobile ? 'auto' : visibleDays === 7 ? '768px' : 'auto'
          }}
        >
          {/* Time labels */}
          {timeSlots.map((slot, slotIndex) => (
            <div
              key={`time-${slotIndex}`}
              className="text-xs text-right pr-2 text-muted-foreground border-r border-b flex items-center justify-end"
              style={{
                gridColumn: 1,
                gridRow: slotIndex + 1
              }}
            >
              {formatTime(slot.hour, slot.minute)}
            </div>
          ))}

          {/* Time grid cells */}
          {weekDays.map((day, dayIndex) => (
            timeSlots.map((slot, slotIndex) => {
              const isAvailable = isTimeSlotAvailable(day, slot.hour, slot.minute);
              
              return (
                <div
                  key={`${dayIndex}-${slot.hour}-${slot.minute}`}
                  className={cn(
                    "border-b border-r relative",
                    isToday(day) ? "bg-blue-50 dark:bg-blue-950/20" : "",
                    !isAvailable ? "bg-gray-100 dark:bg-gray-800/50" : "",
                    !counsellor ? "cursor-not-allowed" : isAvailable ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                  style={{
                    gridColumn: isMobile ? 2 : dayIndex + 2,
                    gridRow: slotIndex + 1
                  }}
                  onClick={() => {
                    if (isAvailable && counsellor) {
                      handleTimeSlotClick(day, slot.hour, slot.minute);
                    }
                  }}
                >
                  <div className={cn(
                    "w-full h-full",
                    isAvailable && counsellor ? "hover:bg-primary/5" : ""
                  )} />
                </div>
              );
            })
          ))}

          {/* Appointments overlay */}
          {appointments.map((appointment) => {
            if (appointment.status === 'cancelled') return null;
            
            const appointmentDate = new Date(appointment.date);
            const dayIndex = weekDays.findIndex(day => isSameDay(day, appointmentDate));
            
            // Skip if not in the visible range
            if (dayIndex < 0 || dayIndex >= visibleDays) return null;
            
            const startTime = parseTimeString(appointment.start_time);
            const endTime = parseTimeString(appointment.end_time);
            
            // Find the slot index for the start and end times
            const startSlotIndex = timeSlots.findIndex(
              slot => slot.hour === startTime.hour && slot.minute === startTime.minute
            );
            
            const endSlotIndex = timeSlots.findIndex(
              slot => slot.hour === endTime.hour && slot.minute === endTime.minute
            );
            
            // Calculate duration in slots
            const duration = endSlotIndex - startSlotIndex || 1;
            
            // Determine color based on status
            const bgColorClass = appointment.status === 'confirmed' 
              ? "bg-primary text-primary-foreground" 
              : appointment.status === 'completed'
                ? "bg-green-500 text-white" 
                : "bg-yellow-500 text-white";
                
            return (
              <div
                key={`appointment-${appointment.id}`}
                className={cn(
                  "absolute rounded-md p-2 text-sm",
                  "flex flex-col overflow-hidden z-10 shadow-sm",
                  "m-0.5",
                  bgColorClass
                )}
                style={{
                  top: `${startSlotIndex * 3}rem`,
                  left: isMobile
                    ? '5rem'
                    : `calc(5rem + ${dayIndex} * ((100% - 5rem) / ${visibleDays}))`,
                  height: `${duration * 3 - 0.25}rem`,
                  width: isMobile
                    ? 'calc(100% - 5rem - 0.5rem)'
                    : `calc((100% - 5rem) / ${visibleDays} - 0.5rem)`,
                }}
              >
                <div className="font-medium truncate">
                  {appointment.title}
                </div>
                <div className="text-xs opacity-90">
                  {appointment.start_time} - {appointment.end_time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Appointment Title</Label>
              <Input
                id="title"
                value={newAppointment.title || ''}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Career Counselling Session"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <div className="text-sm p-2 bg-muted rounded">
                  {selectedTimeSlot ? format(selectedTimeSlot.day, 'EEEE, MMMM d, yyyy') : ''}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Time</Label>
                <div className="text-sm p-2 bg-muted rounded">
                  {selectedTimeSlot
                    ? `${formatTime(selectedTimeSlot.startHour, selectedTimeSlot.startMinute)} - ${formatTime(selectedTimeSlot.endHour, selectedTimeSlot.endMinute)}`
                    : ''}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="counsellor">Counsellor</Label>
              <div className="text-sm p-2 bg-muted rounded">
                {counsellor?.name}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Session Type</Label>
              <Select
                value={newAppointment.type || ''}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes || ''}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific topics you'd like to discuss..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAppointmentDialog(false)}
              className="sm:mr-2 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAppointment}
              disabled={!newAppointment.title || !newAppointment.type}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
