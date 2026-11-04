import * as React from "react";
import { cn } from "../../libs/tailwind/merge-tailwind-classes";

interface TooltipProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> {
  content: React.ReactNode;
  side?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = "top", children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        onMouseEnter={() => setTimeout(() => setIsOpen(true))}
        onMouseLeave={() => setIsOpen(false)}
        {...props}
      >
        {children}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md whitespace-nowrap",
              "pointer-events-none",
              side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
              side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
              side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
            )}
          >
            {content}
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
