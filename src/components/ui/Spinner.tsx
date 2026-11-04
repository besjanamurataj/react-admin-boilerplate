import { cn } from "../../libs/tailwind/merge-tailwind-classes";
import * as React from "react";

export type SpinnerProps = {
  variant?: "indeterminate" | "determinate";
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  description?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({
  variant = "indeterminate",
  value = 0,
  size = 40,
  strokeWidth = 4,
  className,
  color,
  description,
}) => {
  if (variant === "indeterminate") {
    return (
      <div
        role="status"
        aria-label="Loading"
        className={cn(
          "h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary",
          className,
        )}
      />
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className={cn("transform -rotate-90", className)}
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-sm text-gray-500 text-center">{description}</span>
      </div>
    </div>
  );
};
