
import * as React from "react"
import { cn } from "@/lib/utils"

export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  items?: Array<{
    label: string
    onClick?: () => void
    icon?: React.ReactNode
  }>
}

const SettingsMenu = React.forwardRef<HTMLDivElement, SettingsMenuProps>(
  ({ className, title = "Settings", items = [], ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      >
        {title && (
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="p-4 space-y-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="flex items-center gap-3 w-full p-2 text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
)
SettingsMenu.displayName = "SettingsMenu"

export { SettingsMenu }
