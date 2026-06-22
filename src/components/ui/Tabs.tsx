import * as React from 'react'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'

type TabsContextType = {
  active: string
  setActive: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [active, setActive] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex bg-gray-200 border-border', className)}>{children}</div>
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(TabsContext)!
  const isActive = ctx.active === value

  return (
    <button
      onClick={() => ctx.setActive(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors my-1',
        isActive ? 'bg-white border-none rounded-lg ml-2' : 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(TabsContext)!
  if (ctx.active !== value) return null

  return <div className={cn('mt-4', className)}>{children}</div>
}
