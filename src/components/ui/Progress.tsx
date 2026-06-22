import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'

const progressVariants = cva('h-full transition-[width] duration-300 rounded-full', {
  variants: {
    color: {
      red: 'bg-red-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      gray: 'bg-gray-100',
    },
    size: {
      sm: 'h-1',
      default: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    color: 'gray',
    size: 'default',
  },
})

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressVariants> {
  value?: number
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, color, size, showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max(value, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-full bg-gray-200 overflow-hidden',
          className,
          size && progressVariants({ size }),
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div className={cn(progressVariants({ color, size }))} style={{ width: `${percentage}%` }}>
          {showLabel && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
              {percentage}%
            </span>
          )}
        </div>
      </div>
    )
  },
)

Progress.displayName = 'Progress'

export { Progress, progressVariants }
