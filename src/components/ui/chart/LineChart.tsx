import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { cn } from '../../../libs/tailwind/merge-tailwind-classes'

type LineChartProps = {
  data: any[]
  dataKey: string
  children?: React.ReactNode
  type?: string | any
  className?: string
  color?: string
}

export const LineChartComponent = ({ data, dataKey, children, className }: LineChartProps) => {
  return (
    <LineChart className={cn('w-full rounded-md border bg-background', className)} responsive data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      {children}
    </LineChart>
  )
}
