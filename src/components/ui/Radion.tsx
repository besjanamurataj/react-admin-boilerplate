import * as React from 'react'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'

type RadioOption = {
  label: React.ReactNode
  value: string
  disabled?: boolean
}

type RadioGroupProps = {
  value: string
  onValueChange: (value: string) => void
  options: RadioOption[]
  name: string
  className?: string
  disabled?: boolean
}

export function RadioGroup({ value, onValueChange, options, name, className, disabled }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn('flex flex-col gap-3', className)}>
      {options.map(option => (
        <label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-center gap-3 text-sm',
            option.disabled && 'cursor-not-allowed opacity-50',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onValueChange(option.value)}
            className="peer sr-only"
          />

          <span
            className={cn(
              'flex h-5 w-5 items-center bg-white justify-center rounded-full border',
              'border-input peer-checked:border-primary',
              'peer-checked:[&>span]:opacity-100',
            )}
          >
            <span className="h-3 w-3 rounded-full bg-primary opacity-0 transition-opacity" />
          </span>

          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
