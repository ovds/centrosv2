import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useToast } from '@/hooks/use-toast';

// Business hours configuration
const BUSINESS_START_HOUR = 8; // 8 AM
const BUSINESS_END_HOUR = 18; // 6 PM

// Types
interface TimeSlot {
    hour: number;
    minute: number;
}

export interface Appointment {
    id: number;
    title: string;
    studentName: string;
    studentEmail?: string;
    studentId?: string;
    day: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    counsellorId: string;
    counsellorName: string;
    type: string;
    notes: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    counsellorNotes?: string;
}

// Create time slots for the day based on business hours
const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    // Add early-morning 7:30 slot if needed
    slots.push({ hour: 7, minute: 30 });

    for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
        slots.push({ hour, minute: 0 });
        slots.push({ hour, minute: 30 });
    }

    return slots;
};

// Format time (e.g., "9:30 am")
const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute === 0 ? '00' : minute} ${period}`;
};

// Format time range
const formatTimeRange = (startHour: number, startMinute: number, endHour: number, endMinute: number): string => {
    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
};

interface AdminCalendarProps {
    appointments: Appointment[];
    onConfirmAppointment: (id: number, notes: string) => void;
    onCancelAppointment: (id: number, reason: string) => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({
    appointments,
    onConfirmAppointment,
    onCancelAppointment
}) => {
    // State
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    const [visibleDays, setVisibleDays] = useState<number>(7);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
    const [counsellorNotes, setCounsellorNotes] = useState<string>('');
    const [cancelReason, setCancelReason] = useState<string>('');
    
    const { counsellor } = useAdminAuth();
    const { toast } = useToast();
    
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

    // When on mobile, show only the current day
    useEffect(() => {
        setVisibleDays(isMobile ? 1 : isTablet ? 3 : 7);
    }, [isMobile, isTablet]);

    // Refs
    const calendarRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
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

    // Open appointment details
    const handleAppointmentClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
    };

    // Handle confirming an appointment
    const handleConfirmAppointment = () => {
        if (!selectedAppointment) return;
        
        onConfirmAppointment(selectedAppointment.id, counsellorNotes);
        
        toast({
            title: "Appointment Confirmed",
            description: `Appointment with ${selectedAppointment.studentName} has been confirmed`,
        });
        
        // Reset state
        setConfirmDialogOpen(false);
        setCounsellorNotes('');
        setSelectedAppointment(null);
    };

    // Handle cancelling an appointment
    const handleCancelAppointment = () => {
        if (!selectedAppointment) return;
        
        onCancelAppointment(selectedAppointment.id, cancelReason);
        
        toast({
            title: "Appointment Cancelled",
            description: `Appointment with ${selectedAppointment.studentName} has been cancelled`,
            variant: "destructive"
        });
        
        // Reset state
        setCancelDialogOpen(false);
        setCancelReason('');
        setSelectedAppointment(null);
    };

    // Calculate position for appointment on the grid
    const getAppointmentPosition = (appt: Appointment): {
        start: number,
        duration: number,
        dayIndex: number
    } => {
        const startTime = appt.startHour * 60 + appt.startMinute;
        const endTime = appt.endHour * 60 + appt.endMinute;
        const duration = endTime - startTime;
        
        // Starting from 7:30 AM (first slot)
        const startTimeSlot = 7 * 60 + 30; // 7:30 AM in minutes
        const diff = startTime - startTimeSlot; // Difference in minutes
        
        // Find day index
        const dayIndex = weekDays.findIndex(day => isSameDay(day, appt.day));

        return {
            start: diff / 30 * 3, // Each 30-min slot is 3rem tall
            duration: duration / 30, // Convert duration to number of slots
            dayIndex: dayIndex
        };
    };

    // Filter appointments for the counsellor
    const filteredAppointments = appointments.filter(
        appt => appt.counsellorId === counsellor?.id
    );

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
                        <span className="sr-only">Previous</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
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
                            isSameDay(day, new Date()) ? "bg-primary/5" : ""
                        )}
                    >
                        <div className="uppercase text-sm font-medium">
                            {format(day, 'EEE')}
                        </div>
                        <div className={cn(
                            "inline-flex items-center justify-center",
                            isSameDay(day, new Date())
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
                        isSameDay(weekDays[0], new Date()) ? "bg-primary/5" : ""
                    )}
                >
                    <div className="uppercase text-sm font-medium">
                        {format(weekDays[0], 'EEEE')}
                    </div>
                    <div className={cn(
                        "inline-flex items-center justify-center",
                        isSameDay(weekDays[0], new Date())
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
                            const isToday = isSameDay(day, new Date());
                            const cellKey = `${dayIndex}-${slot.hour}-${slot.minute}`;

                            return (
                                <div
                                    key={cellKey}
                                    className={cn(
                                        "border-b border-r relative",
                                        isToday ? "bg-blue-50 dark:bg-blue-950/20" : ""
                                    )}
                                    style={{
                                        gridColumn: isMobile ? 2 : dayIndex + 2,
                                        gridRow: slotIndex + 1
                                    }}
                                    ref={(el) => {
                                        if (el) {
                                            cellRefs.current.set(cellKey, el);
                                        }
                                    }}
                                >
                                    <div className="w-full h-full" />
                                </div>
                            );
                        })
                    ))}

                    {/* Appointments overlay */}
                    {filteredAppointments.map((appointment) => {
                        const { start, duration, dayIndex } = getAppointmentPosition(appointment);

                        // Skip if not in the visible range
                        if (dayIndex < 0 || dayIndex >= visibleDays) return null;

                        // Determine color based on status
                        const bgColorClass = appointment.status === 'confirmed' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-yellow-500 text-white";

                        return (
                            <div
                                key={`appointment-${appointment.id}`}
                                className={cn(
                                    "absolute rounded-md p-2 text-sm",
                                    "flex flex-col overflow-hidden hover:z-20 hover:shadow-lg transition-shadow cursor-pointer",
                                    "m-0.5",
                                    bgColorClass
                                )}
                                style={{
                                    top: `${start}rem`,
                                    left: isMobile
                                        ? '5rem'
                                        : `calc(5rem + ${dayIndex} * ((100% - 5rem) / ${visibleDays}))`,
                                    height: `${duration * 3 - 0.25}rem`,
                                    width: isMobile
                                        ? 'calc(100% - 5rem - 0.5rem)'
                                        : `calc((100% - 5rem) / ${visibleDays} - 0.5rem)`,
                                    zIndex: 10
                                }}
                                onClick={() => handleAppointmentClick(appointment)}
                            >
                                <div className="font-medium truncate">
                                    {appointment.title}
                                </div>
                                <div className="text-xs opacity-90">
                                    {formatTimeRange(
                                        appointment.startHour,
                                        appointment.startMinute,
                                        appointment.endHour,
                                        appointment.endMinute
                                    )}
                                </div>
                                <div className="text-xs mt-1 truncate">
                                    {appointment.studentName}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Appointment Details Dialog */}
            {selectedAppointment && (
                <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                    <DialogContent className="sm:max-w-[425px] mx-4">
                        <DialogHeader>
                            <DialogTitle>{selectedAppointment.title}</DialogTitle>
                            <DialogDescription>
                                Appointment details
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <div className="grid gap-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Student:</span>
                                    <span className="font-medium">{selectedAppointment.studentName}</span>
                                </div>

                                {selectedAppointment.studentEmail && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{selectedAppointment.studentEmail}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">{format(selectedAppointment.day, 'EEEE, MMMM d, yyyy')}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">
                                        {formatTimeRange(
                                            selectedAppointment.startHour,
                                            selectedAppointment.startMinute,
                                            selectedAppointment.endHour,
                                            selectedAppointment.endMinute
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="font-medium">{selectedAppointment.type}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={cn(
                                        "font-medium",
                                        selectedAppointment.status === 'confirmed' ? "text-green-600 dark:text-green-400" :
                                        selectedAppointment.status === 'pending' ? "text-yellow-600 dark:text-yellow-400" :
                                        "text-red-600 dark:text-red-400"
                                    )}>
                                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                                    </span>
                                </div>

                                {selectedAppointment.notes && (
                                    <div className="mt-2">
                                        <span className="text-sm text-muted-foreground">Student Notes:</span>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedAppointment.notes}</p>
                                    </div>
                                )}

                                {selectedAppointment.counsellorNotes && (
                                    <div className="mt-2">
                                        <span className="text-sm text-muted-foreground">Your Notes:</span>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedAppointment.counsellorNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedAppointment(null)}
                                className="sm:mr-2 w-full sm:w-auto"
                            >
                                Close
                            </Button>

                            {selectedAppointment.status === 'pending' && (
                                <>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setCancelDialogOpen(true);
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setConfirmDialogOpen(true);
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Confirm
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Confirm Appointment Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px] mx-4">
                    <DialogHeader>
                        <DialogTitle>Confirm Appointment</DialogTitle>
                        <DialogDescription>
                            Add any notes or instructions for the student
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Additional notes or instructions for the student..."
                            className="min-h-[100px]"
                            value={counsellorNotes}
                            onChange={(e) => setCounsellorNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialogOpen(false)}
                            className="sm:mr-2 w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAppointment}
                            className="w-full sm:w-auto"
                        >
                            Confirm Appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Appointment Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this appointment? Please provide a reason for cancellation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for cancellation..."
                            className="min-h-[100px]"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleCancelAppointment}
                            disabled={!cancelReason.trim()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Cancel Appointment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminCalendar;