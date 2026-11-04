import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTranslation } from "react-i18next";

import { Card } from "../ui/Card";

export type RoleUsageData = {
  role: string;
  usersCount: number;
};

type RoleSummaryProps = {
  data: RoleUsageData[];
  isLoading?: boolean;
};

const RoleSummary = ({ data, isLoading = false }: RoleSummaryProps) => {
  const { t } = useTranslation();
  const sortedData = [...data].sort(
    (firstRole, secondRole) => secondRole.usersCount - firstRole.usersCount,
  );

  const chartHeight = Math.max(280, sortedData.length * 55);

  return (
    <Card className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {t("roleUsage.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("roleUsage.description")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t("roleUsage.loading")}
          </p>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t("roleUsage.noData")}
          </p>
        </div>
      ) : (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{
                top: 5,
                right: 40,
                bottom: 5,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />

              <XAxis
                type="number"
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
              />

              <YAxis
                type="category"
                dataKey="role"
                width={110}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                formatter={(value) => [Number(value), t("roleUsage.users")]}
                labelFormatter={(label) => `Role: ${label}`}
              />

              <Bar
                dataKey="usersCount"
                name={t("roleUsage.users")}
                fill="#16a34a"
                radius={[0, 6, 6, 0]}
                maxBarSize={32}
              >
                <LabelList dataKey="usersCount" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default RoleSummary;
