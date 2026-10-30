import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "../../../libs/tailwind/merge-tailwind-classes";

type PieChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  dataKey?: string;
  isAnimationActive?: boolean;
  defaultIndex?: number;
  color?: string;
  className?: string;
};

export function PieChartComponent<TData extends Record<string, unknown>>({
  data,
  dataKey = "value",
  color,
  isAnimationActive = true,
  defaultIndex,
  className,
}: PieChartProps<TData>) {
  return (
    <div className={cn("w-full h-[500px] bg-white", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            cx="50%"
            cy="50%"
            outerRadius="85%"
            fill={color || "var(--chart-primary, #2d8ff7)"}
            isAnimationActive={isAnimationActive}
          />
          <Tooltip defaultIndex={defaultIndex} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
