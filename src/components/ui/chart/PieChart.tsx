import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '../../../libs/tailwind/merge-tailwind-classes'

type PieChartProps = {
  data: any[]
  dataKey?: string
  isAnimationActive?: boolean
  defaultIndex?: number
  color?: string
  className?: string
}

export const PieChartComponent = ({
  data,
  dataKey = 'value',
  color,
  isAnimationActive = true,
  defaultIndex,
  className,
}: PieChartProps) => {
  return (
    <div className={cn('w-full h-[500px] bg-white', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            cx="50%"
            cy="50%"
            outerRadius="85%"
            fill={color || 'var(--chart-primary, #2d8ff7)'}
            isAnimationActive={isAnimationActive}
          />
          <Tooltip defaultIndex={defaultIndex} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
