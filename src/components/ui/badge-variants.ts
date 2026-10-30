import { cva } from "class-variance-authority";

const badgeVariants = cva('inline-flex items-center justify-center rounded-full px-2 py-1 text-sm font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-none',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:bg-none',
      secondary: 'bg-blue-500 text-white dark:bg-blue-600 hover:bg-none',
      destructive: 'bg-red-500 text-white hover:bg-none',
      link: 'text-primary underline-offset-4 hover:bg-none',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
export default badgeVariants