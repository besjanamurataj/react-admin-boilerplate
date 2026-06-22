'use client'
import * as React from 'react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'
import { Button } from './Button'
import { Select } from './Select'

type CalendarSelectProps = {
  value?: Date | null
  onChange?: (date: Date | null) => void
  label?: string
  placeholder?: string
  className?: string
  yearRange?: { from: number; to: number }
  disabled?: boolean
}

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const DatePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  className,
  yearRange = { from: 1970, to: new Date().getFullYear() + 10 },
  disabled = false,
}: CalendarSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const today = new Date()

  const [month, setMonth] = React.useState(
    new Date(value?.getFullYear() ?? today.getFullYear(), value?.getMonth() ?? today.getMonth(), 1),
  )

  // keep calendar in sync with selected value
  React.useEffect(() => {
    if (value) {
      setMonth(new Date(value.getFullYear(), value.getMonth(), 1))
    }
  }, [value])

  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const firstDayOfMonth = new Date(year, monthIndex, 1)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const formatDate = (date: Date) => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  }

  return (
    <div ref={wrapperRef} className={cn('flex flex-col gap-2', className)}>
      {label && <label className="px-1 text-sm font-medium">{label}</label>}

      {/* Input box */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-disabled={disabled}
        tabIndex={0}
        onClick={() => !disabled && setOpen(o => !o)}
        className={cn(
          'flex h-10 items-center justify-between rounded-md px-3 text-sm border bg-gray-100',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer border-gray-300',
        )}
      >
        <span>{value ? formatDate(value) : placeholder}</span>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </div>

      {/* Calendar dropdown */}
      {open && !disabled && (
        <div className="relative">
          <div className="absolute z-50 mt-1 w-72 rounded-md border bg-white p-3 shadow-md">
            {/* Header: month + year + navigation */}
            <div className="mb-3 flex gap-2 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
                disabled={disabled}
              >
                <ChevronLeftIcon className="h-4 w-4 opacity-50" />
              </Button>

              <Select
                value={monthIndex}
                onChange={e => setMonth(new Date(year, Number(e.target.value), 1))}
                className="h-8 flex-1 rounded-md border px-2 text-sm"
                options={MONTHS.map((m, i) => ({ label: m, value: i }))}
                disabled={disabled}
              />

              <Select
                value={year}
                onChange={e => setMonth(new Date(Number(e.target.value), monthIndex, 1))}
                className="h-8 w-24 rounded-md border px-2 text-sm"
                disabled={disabled}
                options={Array.from({ length: yearRange.to - yearRange.from + 1 }, (_, i) => yearRange.from + i).map(
                  y => ({ label: String(y), value: y }),
                )}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
                disabled={disabled}
              >
                <ChevronRightIcon className="h-4 w-4 opacity-50" />
              </Button>
            </div>

            {/* Week days */}
            <div className="mb-1 grid grid-cols-7 text-center text-xs text-gray-500">
              {WEEK_DAYS.map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={i} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = new Date(year, monthIndex, i + 1)
                const selected = value?.toDateString() === day.toDateString()

                return (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={() => {
                      if (disabled) return
                      onChange?.(day)
                      setOpen(false)
                    }}
                    className={cn(
                      'h-8 rounded-md text-sm hover:bg-gray-200',
                      selected && 'bg-black text-white',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                    disabled={disabled}
                  >
                    {i + 1}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
