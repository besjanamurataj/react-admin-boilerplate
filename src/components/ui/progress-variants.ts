import { cva } from "class-variance-authority";

const progressVariants = cva(
  "h-full transition-[width] duration-300 rounded-full",
  {
    variants: {
      color: {
        red: "bg-red-500",
        green: "bg-green-500",
        blue: "bg-blue-500",
        orange: "bg-orange-500",
        gray: "bg-gray-100",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      color: "gray",
      size: "default",
    },
  },
);
export { progressVariants };
