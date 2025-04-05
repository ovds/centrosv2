import React, { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, getHours, getMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
    day: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    counselorId: string;
    counselorName: string;
    type: string;
    notes: string;
}

interface NewAppointmentData {
    day: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    title: string;
    counselorId: string;
    type: string;
    notes: string;
}

// Session types
const sessionTypes = [
    'Academic Counselling',
    'Career Guidance',
    'Personal Development'
];

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

// Props interface for WeeklyCalendar
interface WeeklyCalendarProps {
    selectedCounselorId: string | null;
    appointments: Appointment[];
    counselors: { id: string; name: string }[];
    onSaveAppointment: (appointment: Appointment) => void;
    onDeleteAppointment: (id: number) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    selectedCounselorId,
    appointments,
    counselors,
    onSaveAppointment,
    onDeleteAppointment
}) => {
    // Media query hooks
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // State
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    const [visibleDays, setVisibleDays] = useState<number>(7);

    // Appointment creation state
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ day: Date, hour: number, minute: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ day: Date, hour: number, minute: number } | null>(null);
    const [showAppointmentDialog, setShowAppointmentDialog] = useState<boolean>(false);
    const [newAppointment, setNewAppointment] = useState<NewAppointmentData | null>(null);

    // Appointment viewing state
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

    // Calculate position for dragging based on time
    const timeToPosition = (hour: number, minute: number): number => {
        // Starting from 7:30 AM (first slot)
        const startTime = 7 * 60 + 30; // 7:30 AM in minutes
        const time = hour * 60 + minute; // Convert to minutes
        const diff = time - startTime; // Difference in minutes

        // Each 30-min slot is 3rem tall
        return diff / 30 * 3;
    };

    // Convert minutes to grid rows
    const minutesToGridRows = (minutes: number): number => {
        return minutes / 30;
    };

    // Get start and duration for appointment display
    const getAppointmentPosition = (appt: Appointment): {
        start: number,
        duration: number,
        dayIndex: number
    } => {
        const startTime = appt.startHour * 60 + appt.startMinute;
        const endTime = appt.endHour * 60 + appt.endMinute;
        const duration = endTime - startTime;

        // Find day index
        const dayIndex = weekDays.findIndex(day => isSameDay(day, appt.day));

        return {
            start: timeToPosition(appt.startHour, appt.startMinute),
            duration: minutesToGridRows(duration),
            dayIndex: dayIndex
        };
    };

    // Drag operation handlers
    const handleMouseDown = (day: Date, hour: number, minute: number, e: React.MouseEvent) => {
        // Don't trigger if no counselor is selected
        if (!selectedCounselorId) return;
        
        // Don't trigger for existing appointments
        const slotAppointments = getAppointmentsForTimeSlot(day, hour, minute);
        if (slotAppointments.length > 0) return;

        // Prevent default selection
        e.preventDefault();

        // Initialize drag operation
        setIsDragging(true);
        setDragStart({ day, hour, minute });
        setDragEnd({ day, hour, minute });
    };

    // Handle mouse move during drag operation
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !dragStart || !gridRef.current) return;

        // Get the position within the grid
        const gridRect = gridRef.current.getBoundingClientRect();
        const relativeY = e.clientY - gridRect.top;

        // Calculate which time slot this corresponds to
        const totalMinutes = Math.floor(relativeY / (gridRect.height / (timeSlots.length))) * 30 + 7 * 60 + 30;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60 - totalMinutes % 30; // Round to nearest 30 min

        // Only update if the time is valid
        if (hour >= 7 && hour < 18) {
            setDragEnd({
                day: dragStart.day,
                hour,
                minute
            });
        }
    };

    // Handle mouse up to end drag operation
    const handleMouseUp = () => {
        if (!isDragging || !dragStart || !dragEnd) {
            // Reset drag state
            setIsDragging(false);
            setDragStart(null);
            setDragEnd(null);
            return;
        }

        // Ensure drag start is before drag end
        let startHour = dragStart.hour;
        let startMinute = dragStart.minute;
        let endHour = dragEnd.hour;
        let endMinute = dragEnd.minute;

        // If drag is bottom to top, swap start and end
        if (startHour > endHour || (startHour === endHour && startMinute > endMinute)) {
            [startHour, endHour] = [endHour, startHour];
            [startMinute, endMinute] = [endMinute, startMinute];
        }

        // Add 30 minutes to end time (exclusive end)
        if (endMinute === 0) {
            endMinute = 30;
        } else {
            endHour += 1;
            endMinute = 0;
        }

        // Create new appointment with the selected counselor ID
        setNewAppointment({
            day: new Date(dragStart.day),
            startHour,
            startMinute,
            endHour,
            endMinute,
            title: '',
            counselorId: selectedCounselorId!, // Use the selected counselor
            type: '',
            notes: ''
        });

        // Show appointment creation dialog
        setShowAppointmentDialog(true);

        // Reset drag state
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    };

    // Set up event listeners
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, dragEnd, weekDays]);

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

    // Get appointments for a specific time slot on a specific day
    const getAppointmentsForTimeSlot = (day: Date, hour: number, minute: number): Appointment[] => {
        return appointments.filter(appt => {
            // Check if appointment is on this day
            if (!isSameDay(appt.day, day)) return false;

            // Convert to minutes for easier comparison
            const slotTime = hour * 60 + minute;
            const apptStart = appt.startHour * 60 + appt.startMinute;
            const apptEnd = appt.endHour * 60 + appt.endMinute;

            // Check if this slot falls within appointment time
            return slotTime >= apptStart && slotTime < apptEnd;
        });
    };

    // Handle click on an appointment
    const handleAppointmentClick = (appointment: Appointment, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedAppointment(appointment);
    };

    // Handle saving new appointment
    const handleSaveAppointment = () => {
        if (!newAppointment || !selectedCounselorId) return;

        // Find the counselor name based on the selected ID
        const selectedCounselor = counselors.find(c => c.id === selectedCounselorId);

        // Create the appointment with the parent's handler
        onSaveAppointment({
            ...newAppointment,
            id: Math.max(0, ...appointments.map(a => a.id)) + 1,
            counselorName: selectedCounselor?.name || 'Unknown'
        });

        // Reset state
        setNewAppointment(null);
        setShowAppointmentDialog(false);
    };

    // Handle deleting an appointment
    const handleDeleteAppointment = (id: number) => {
        onDeleteAppointment(id);
        setSelectedAppointment(null);
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
                                        isToday ? "bg-blue-50 dark:bg-blue-950/20" : "",
                                        isDragging && "cursor-grabbing"
                                    )}
                                    style={{
                                        gridColumn: isMobile ? 2 : dayIndex + 2,
                                        gridRow: slotIndex + 1
                                    }}
                                    onMouseDown={(e) => {
                                        const appointments = getAppointmentsForTimeSlot(day, slot.hour, slot.minute);
                                        if (appointments.length === 0) {
                                            handleMouseDown(day, slot.hour, slot.minute, e);
                                        }
                                    }}
                                    ref={(el) => {
                                        if (el) {
                                            cellRefs.current.set(cellKey, el);
                                        }
                                    }}
                                >
                                    <div className={cn(
                                        "w-full h-full",
                                        !isDragging && "hover:bg-primary/5",
                                        isDragging ? "cursor-grabbing" : "cursor-pointer"
                                    )} />
                                </div>
                            );
                        })
                    ))}

                    {/* Appointments overlay */}
                    {appointments.map((appointment) => {
                        const { start, duration, dayIndex } = getAppointmentPosition(appointment);

                        // Skip if not in the visible range
                        if (dayIndex < 0 || dayIndex >= visibleDays) return null;

                        return (
                            <div
                                key={`appointment-${appointment.id}`}
                                className={cn(
                                    "absolute rounded-md p-2 bg-primary text-primary-foreground text-sm",
                                    "flex flex-col overflow-hidden hover:z-20 hover:shadow-lg transition-shadow cursor-pointer",
                                    "m-0.5"
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
                                onClick={(e) => handleAppointmentClick(appointment, e)}
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
                            </div>
                        );
                    })}

                    {/* Drag preview overlay */}
                    {isDragging && dragStart && dragEnd && (
                        <div
                            className="absolute z-30 pointer-events-none rounded-md border-2 border-primary shadow-lg overflow-hidden flex flex-col m-0.5"
                            style={{
                                top: `${Math.min(
                                    timeToPosition(dragStart.hour, dragStart.minute),
                                    timeToPosition(dragEnd.hour, dragEnd.minute)
                                )}rem`,
                                left: isMobile
                                    ? '5rem'
                                    : `calc(5rem + ${weekDays.findIndex(d => isSameDay(d, dragStart.day))} * ((100% - 5rem) / ${visibleDays}))`,
                                height: `${Math.abs(
                                    timeToPosition(dragEnd.hour, dragEnd.minute) -
                                    timeToPosition(dragStart.hour, dragStart.minute)
                                ) + 3}rem`,
                                width: isMobile
                                    ? 'calc(100% - 5rem - 0.5rem)'
                                    : `calc((100% - 5rem) / ${visibleDays} - 0.5rem)`,
                                background: 'rgba(var(--primary), 0.15)'
                            }}
                        >
                            <div className="p-2 text-sm bg-primary text-primary-foreground font-medium flex items-center justify-between">
                                <span>New Appointment</span>
                                <Plus className="h-4 w-4" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment Details Dialog */}
            {selectedAppointment && (
                <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                    <DialogContent className="sm:max-w-[425px] mx-4">
                        <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <h3 className="text-xl font-semibold mb-2">{selectedAppointment.title}</h3>

                            <div className="grid gap-4">
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
                                    <span className="text-muted-foreground">Counselor:</span>
                                    <span className="font-medium">{selectedAppointment.counselorName}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="font-medium">{selectedAppointment.type}</span>
                                </div>

                                {selectedAppointment.notes && (
                                    <div className="mt-2">
                                        <span className="text-sm text-muted-foreground">Notes:</span>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedAppointment.notes}</p>
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
                            <Button
                                variant="destructive"
                                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                                className="w-full sm:w-auto"
                            >
                                Cancel Appointment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* New Appointment Dialog */}
            <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
                <DialogContent className="sm:max-w-[425px] mx-4">
                    <DialogHeader>
                        <DialogTitle>Create New Appointment</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={newAppointment?.title || ''}
                                onChange={(e) => setNewAppointment(prev => prev ? {...prev, title: e.target.value} : null)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Time</Label>
                                <div className="text-sm p-2 bg-muted rounded">
                                    {newAppointment && formatTime(newAppointment.startHour, newAppointment.startMinute)}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>End Time</Label>
                                <div className="text-sm p-2 bg-muted rounded">
                                    {newAppointment && formatTime(newAppointment.endHour, newAppointment.endMinute)}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Session Type</Label>
                            <Select
                                value={newAppointment?.type || ''}
                                onValueChange={(value) => setNewAppointment(prev => prev ? {...prev, type: value} : null)}
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
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={newAppointment?.notes || ''}
                                onChange={(e) => setNewAppointment(prev => prev ? {...prev, notes: e.target.value} : null)}
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
                            disabled={!newAppointment?.title || !newAppointment?.type}
                            className="w-full sm:w-auto"
                        >
                            Create Appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Custom hook for media queries
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQuery.addEventListener('change', handler);

        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, [query]);

    return matches;
}

export default WeeklyCalendar;