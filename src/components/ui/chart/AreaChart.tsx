import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../../libs/tailwind/merge-tailwind-classes";

type AreaChartSharedProps = {
  data: any[];
  dataKey: string;
  type?: string | any;
  className?: string;
  color?: string;
};

function AreaChartShared({
  data,
  dataKey,
  type = "monotone",
  className,
  color,
}: AreaChartSharedProps) {
  return (
    <div
      className={cn(" bg-white", className)}
      style={{ aspectRatio: "16 / 9" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type={type}
            dataKey={dataKey}
            stroke={color || "var(--chart-primary,#2d8ff7)"}
            fill={color || "var(--chart-primary, #2d8ff7)"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartShared;
