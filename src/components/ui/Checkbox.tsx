import * as React from "react";
import { cn } from "../../libs/tailwind/merge-tailwind-classes";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange"
> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, className, onCheckedChange, ...props }, ref) => {
    const defaultRef = React.useRef<HTMLInputElement>(null);
    const resolvedRef =
      (ref as React.RefObject<HTMLInputElement>) || defaultRef;

    React.useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = checked === "indeterminate";
      }
    }, [resolvedRef, checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        checked={checked === true}
        onChange={handleChange}
        className={cn(
          `
    h-5 w-5
    appearance-none
    rounded
    border border-gray-300
    bg-white
    cursor-pointer
    transition
    hover:border-blue-500
    checked:bg-blue-500
    checked:border-blue-500
    checked:before:content-['✓']
    checked:before:text-white
    checked:before:flex
    checked:before:items-center
    checked:before:justify-center
    checked:before:h-full
    checked:before:w-full

    `,
          className,
        )}
        {...props}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
