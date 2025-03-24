import React, { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, getHours, getMinutes, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Mock data for appointments - in a real app, this would come from an API
const mockAppointments = [
    {
        id: 1,
        title: 'CHRISTOPHER ANDREW WEST',
        start: '2025-03-04T07:30:00',
        end: '2025-03-04T08:30:00',
        counselorId: 1,
    },
    {
        id: 2,
        title: 'LOOK SIZE HING',
        start: '2025-03-04T08:00:00',
        end: '2025-03-04T08:30:00',
        counselorId: 2,
    },
    {
        id: 3,
        title: 'LOOK SIZE HING',
        start: '2025-03-04T08:30:00',
        end: '2025-03-04T09:00:00',
        counselorId: 2,
    },
    {
        id: 4,
        title: 'ELINA KAUR DEV',
        start: '2025-03-03T09:00:00',
        end: '2025-03-03T10:00:00',
        counselorId: 3,
    },
    {
        id: 5,
        title: 'ZHU YANCUN',
        start: '2025-03-04T09:00:00',
        end: '2025-03-04T10:00:00',
        counselorId: 4,
    },
    {
        id: 6,
        title: 'SHARMA SAATVIK',
        start: '2025-03-05T09:00:00',
        end: '2025-03-05T10:00:00',
        counselorId: 5,
    },
    {
        id: 7,
        title: 'RUHAN TASNEEM SHAFA',
        start: '2025-03-07T08:30:00',
        end: '2025-03-07T09:00:00',
        counselorId: 6,
    },
    {
        id: 8,
        title: 'HU ZIKANG',
        start: '2025-03-04T10:00:00',
        end: '2025-03-04T11:00:00',
        counselorId: 7,
    },
    {
        id: 9,
        title: 'CHRISTOPHER ANDREW WEST',
        start: '2025-03-04T11:00:00',
        end: '2025-03-04T12:00:00',
        counselorId: 1,
    },
    {
        id: 10,
        title: 'CHRISTOPHER ANDREW WEST',
        start: '2025-03-05T07:30:00',
        end: '2025-03-05T08:30:00',
        counselorId: 1,
    },
    {
        id: 11,
        title: 'CHRISTOPHER ANDREW WEST',
        start: '2025-03-06T07:30:00',
        end: '2025-03-06T08:30:00',
        counselorId: 1,
    },
    {
        id: 12,
        title: 'CHRISTOPHER ANDREW WEST',
        start: '2025-03-07T07:30:00',
        end: '2025-03-07T08:30:00',
        counselorId: 1,
    }
];

// Constants for time display
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => i * 30); // 30 min intervals in minutes

// Format a date object to display time (e.g., "9:30 AM")
const formatTime = (hour, minutes) => {
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minutes);
    return format(date, 'h:mm a').toLowerCase();
};

const WeeklyCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Calculate the start date of the week (Sunday)
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });

    // Create array of dates for the week
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    // Handle navigation
    const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Handler for date picker
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setCurrentDate(date);
        setCalendarOpen(false);
    };

    // Get appointments for a specific day and time slot
    const getAppointmentsForTimeSlot = (day, hour, minute) => {
        const dayStr = format(day, 'yyyy-MM-dd');

        return mockAppointments.filter(appointment => {
            const appointmentDate = format(parseISO(appointment.start), 'yyyy-MM-dd');
            const startHour = getHours(parseISO(appointment.start));
            const startMinute = getMinutes(parseISO(appointment.start));
            const endHour = getHours(parseISO(appointment.end));
            const endMinute = getMinutes(parseISO(appointment.end));

            // Check if appointment is on this day
            if (appointmentDate !== dayStr) return false;

            // Convert hour and minute to total minutes for easier comparison
            const slotStart = hour * 60 + minute;
            const apptStart = startHour * 60 + startMinute;
            const apptEnd = endHour * 60 + endMinute;

            // Check if this slot falls within appointment time
            return slotStart >= apptStart && slotStart < apptEnd;
        });
    };

    // Gets all appointments for a specific time slot
    const getAllAppointmentsForTimeSlot = (hour, minute) => {
        return weekDays.map(day => {
            return getAppointmentsForTimeSlot(day, hour, minute);
        });
    };

    // Create UI for time slots grid
    const renderTimeSlots = () => {
        return TIME_SLOTS.map((minute, minuteIndex) => {
            const hour = Math.floor(minute / 60) + 8; // Starting from 8 AM
            const minutes = minute % 60;

            // Only show time labels for hour starts and half hours
            const showTimeLabel = minutes === 0 || minutes === 30;

            const appointmentsForSlot = getAllAppointmentsForTimeSlot(hour, minutes);

            return (
                <tr key={`${hour}-${minutes}`} className="h-12">
                    {/* Time indicator column */}
                    <td className="w-20 text-xs text-right pr-2 text-muted-foreground border-r">
                        {showTimeLabel && formatTime(hour, minutes)}
                    </td>

                    {/* Days of the week */}
                    {weekDays.map((day, index) => {
                        const appointments = appointmentsForSlot[index];

                        return (
                            <td
                                key={`${day}-${hour}-${minutes}`}
                                className={cn(
                                    "border-t relative px-1",
                                    index === 6 ? "border-r" : "", // Add right border for Saturday
                                )}
                            >
                                {appointments.length > 0 ? (
                                    <div
                                        className="absolute inset-1 bg-green-500 rounded text-white text-xs p-1 overflow-hidden hover:z-10 hover:shadow-lg transition-shadow"
                                    >
                                        {appointments[0].title.length > 20
                                            ? `${appointments[0].title.slice(0, 20)}...`
                                            : appointments[0].title}
                                    </div>
                                ) : (
                                    <div className="h-full w-full hover:bg-muted/30 cursor-pointer rounded"></div>
                                )}
                            </td>
                        );
                    })}
                </tr>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-md border shadow-sm">
            {/* Calendar header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>

                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2 h-8">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>Select Date</span>
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
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b">
                <div className="h-16 border-r"></div>
                {weekDays.map((day, index) => (
                    <div
                        key={`header-${day}`}
                        className={cn(
                            "flex flex-col items-center justify-center h-16 border-r",
                            format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-primary/5" : ""
                        )}
                    >
                        <div className="text-sm font-medium uppercase">
                            {format(day, 'EEE')}
                        </div>
                        <div className={cn(
                            "text-2xl font-bold",
                            format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "text-primary" : ""
                        )}>
                            {format(day, 'd')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar body */}
            <div className="overflow-auto flex-1">
                <table className="w-full border-collapse">
                    <tbody>
                    {renderTimeSlots()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeeklyCalendar;