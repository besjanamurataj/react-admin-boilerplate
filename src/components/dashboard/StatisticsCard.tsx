import type { ReactNode } from "react";
import { Card } from "../ui/Card";

type StatisticsCardProps = {
  title: string;
  value: number;
  icon?: ReactNode;
  description?: string;
};

export const StatisticsCard = ({
  title,
  value,
  icon,
  description,
}: StatisticsCardProps) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>

          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatisticsCard;
