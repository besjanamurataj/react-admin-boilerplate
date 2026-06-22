import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'

type DialogContextType = {
  open: boolean
  setOpen: (v: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogContext.Provider>
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)!
  return (
    <div onClick={() => ctx.setOpen(true)} className="inline-block">
      {children}
    </div>
  )
}

function DialogOverlay({ className }: { className?: string }) {
  const ctx = React.useContext(DialogContext)!
  if (!ctx.open) return null

  return (
    <div
      onClick={() => ctx.setOpen(false)}
      className={cn('fixed inset-0 z-50 bg-black/80 animate-in fade-in-0', className)}
    />
  )
}

function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)!

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') ctx.setOpen(false)
    }
    if (ctx.open) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ctx])

  if (!ctx.open) return null

  return (
    <>
      <DialogOverlay />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
          'grid gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
          'animate-in fade-in-0 zoom-in-95',
          className,
        )}
        onClick={e => e.stopPropagation()}
      >
        {children}

        <button
          onClick={() => ctx.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
