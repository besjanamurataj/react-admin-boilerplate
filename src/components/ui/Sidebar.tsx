import * as React from 'react'
import { cn } from '../../libs/tailwind/merge-tailwind-classes'
import { Button } from '../ui/Button'

export type SideMenuItem = {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  active?: boolean
}

type SideMenuProps = {
  title?: string
  items: SideMenuItem[]
  width?: number
  className?: string
}

export function SideMenu({ title, items, width = 250, className }: SideMenuProps) {
  return (
    <aside className={cn('flex h-full flex-col border-r border-border bg-background', className)} style={{ width }}>
      {title && <div className="flex h-14 items-center px-4 font-semibold border-b border-border">{title}</div>}
      <nav className="flex-1 overflow-auto p-2">
        <ul className="flex flex-col gap-1">
          {items.map(item => (
            <li key={item.id}>
              <Button
                onClick={item.onClick}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-muted',
                  item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                <span>{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
