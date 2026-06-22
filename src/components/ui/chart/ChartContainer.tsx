import * as React from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '../../../libs/tailwind/merge-tailwind-classes'

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn('w-full rounded-md border bg-background p-4', className)}
      style={
        Object.fromEntries(
          Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
        ) as React.CSSProperties
      }
      {...props}
    >
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export { ChartContainer }
