import React from "react";
import { cn } from "../../libs/tailwind/merge-tailwind-classes";
import { Input } from "./Input";

export type SearchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
};

export const Search: React.FC<SearchProps> = ({
  onSearch,
  fullWidth = true,
  placeholder = "Search...",
  onKeyDown,
  className,
  ...rest
}) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    onKeyDown?.(event);

    if (event.key === "Enter") {
      onSearch?.((event.target as HTMLInputElement).value);
    }
  };

  return (
    <Input
      type="search"
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      className={cn(fullWidth ? "w-full" : undefined, className)}
      {...rest}
    />
  );
};
