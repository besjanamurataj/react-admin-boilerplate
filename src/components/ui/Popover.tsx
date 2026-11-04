import * as React from "react";
import { cn } from "../../libs/tailwind/merge-tailwind-classes";

type PopoverContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextType | null>(null);

function Popover({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <PopoverContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext)!;
  return (
    <div
      onClick={() => ctx.setOpen(!ctx.open)}
      className="inline-block cursor-pointer"
    >
      {children}
    </div>
  );
}

function PopoverContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(PopoverContext)!;
  const ref = React.useRef<HTMLDivElement>(null);

  /* close on outside click */
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx.setOpen(false);
      }
    }

    if (ctx.open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ctx]);

  if (!ctx.open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-79 rounded-md border bg-background p-4 shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PopoverHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-2 flex flex-col space-y-1", className)} {...props} />
  );
}

function PopoverTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
