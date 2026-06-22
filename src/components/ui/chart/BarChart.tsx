import { ChartContainer, type ChartConfig } from './ChartContainer'
import { Bar, BarChart, CartesianGrid } from 'recharts'

type BarChartProps = {
  data: any[]
  chartConfig: ChartConfig
  isAnimationActive?: boolean
  defaultIndex?: number
  className?: string
}

export function BarChartComponent({ data, chartConfig, isAnimationActive = false, className, defaultIndex }: BarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[100px] ">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} horizontal={false} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        
      </BarChart>
    </ChartContainer>
  )
}
