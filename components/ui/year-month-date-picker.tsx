import * as React from "react"
import { addYears, format, setYear, subMonths, subYears } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface YearMonthDatePickerProps {
  date: Date | null
  onSelect: (date: Date | null) => void
  className?: string
}

export function YearMonthDatePicker({
  date,
  onSelect,
  className,
}: YearMonthDatePickerProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  
  // Create array of years for selection (from current year - 100 to current year)
  const currentYear = new Date().getFullYear()
  const yearsRange = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i)

  const handleYearChange = (year: string) => {
    if (date) {
      const newDate = setYear(date, parseInt(year))
      onSelect(newDate)
    } else {
      const newDate = setYear(new Date(), parseInt(year))
      onSelect(newDate)
    }
  }

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Select date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto flex flex-col p-0" align="start">
        <div className="p-3 border-b">
          <Select 
            value={date ? date.getFullYear().toString() : currentYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {yearsRange.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(day) => onSelect(day || null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}