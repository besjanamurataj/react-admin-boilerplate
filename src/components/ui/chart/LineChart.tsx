import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "../../../libs/tailwind/merge-tailwind-classes";
import type { CurveType } from "recharts/types/shape/Curve";

type LineChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  dataKey: string;
  children?: React.ReactNode;
  type?: CurveType;
  className?: string;
  color?: string;
};

export function LineChartComponent<TData extends Record<string, unknown>>({
  data,
  dataKey,
  children,
  className,
}: LineChartProps<TData>) {
  return (
    <LineChart
      className={cn("w-full rounded-md border bg-background", className)}
      responsive
      data={data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      {children}
    </LineChart>
  );
}
