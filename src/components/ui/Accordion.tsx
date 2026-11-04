import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../libs/tailwind/merge-tailwind-classes";

type AccordionProps = {
  className?: string;
  children: React.ReactNode;
};

export function Accordion({ className, children }: AccordionProps) {
  return (
    <div className={cn("w-full divide-y rounded-md border", className)}>
      {children}
    </div>
  );
}

type AccordionItemProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  return (
    <details open={defaultOpen} className={cn("group", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 px-4 text-sm font-medium hover:bg-muted transition">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>

      <div className="px-4 pb-4 text-sm text-muted-foreground">{children}</div>
    </details>
  );
}
