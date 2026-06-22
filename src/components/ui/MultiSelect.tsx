import * as React from 'react'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './Button'

interface Option {
  value: string | number
  label: string | number
}

interface MultiSelectProps {
  options: Option[]
  value: (string | number)[]
  disabled?: boolean
  onChange: (value: (string | number)[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({ options, value, disabled, onChange, placeholder, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const toggleValue = (val: string | number) => {
    onChange(value.includes(val) ? value.filter(v => v !== val) : [...value, val])
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <Button
        type="button"
        variant={'default'}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm shadow-xs hover:bg-white"
      >
        <span className="text-black">
          {value.length
            ? options
                .filter(o => value.includes(o.value))
                .map(o => o.label)
                .join(', ')
            : placeholder}
        </span>

        <span>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover p-1 shadow-md">
          {options.map(option => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center  text-red gap-2 rounded-sm px-2 py-1.5"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggleValue(option.value)}
                className="accent-primary"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
