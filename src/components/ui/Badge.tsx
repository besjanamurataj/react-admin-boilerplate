import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../libs/tailwind/merge-tailwind-classes";
import badgeVariants from "./badge-variants";

export interface BadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      ></div>
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
