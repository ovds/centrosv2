import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, X, ChevronsUpDown } from "lucide-react"
import { HouseType } from "@/types/types"

export interface MultiSelectHousesProps {
  houses: HouseType[]
  onChange: (value: HouseType[]) => void
  placeholder?: string
}

export function MultiSelectHouses({
  houses,
  onChange,
  placeholder = "Select houses",
}: MultiSelectHousesProps) {
  const [open, setOpen] = React.useState(false)

  const houseOptions: { label: string; value: HouseType }[] = [
    { label: "Fibonacci", value: "fibonacci" },
    { label: "Fleming", value: "fleming" },
    { label: "Faraday", value: "faraday" },
    { label: "Nobel", value: "nobel" }
  ]

  const handleSelect = (house: HouseType) => {
    const isSelected = houses.includes(house)
    let newValue: HouseType[]

    if (isSelected) {
      newValue = houses.filter((item) => item !== house)
    } else {
      newValue = [...houses, house]
    }

    onChange(newValue)
  }

  const handleRemove = (house: HouseType) => {
    const newValue = houses.filter((item) => item !== house)
    onChange(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-h-10 w-full justify-between"
        >
          {houses.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {houses.map((house) => (
                <Badge
                  key={house}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {houseOptions.find(option => option.value === house)?.label || house}
                  <span
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(house)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleRemove(house)}
                    role="button"
                    tabIndex={0}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No houses found.</CommandEmpty>
            <CommandGroup>
              {houseOptions.map((option) => {
                const isSelected = houses.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}