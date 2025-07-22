
import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconWithBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
}

const IconWithBackground = React.forwardRef<HTMLDivElement, IconWithBackgroundProps>(
  ({ className, icon, variant = "default", size = "md", ...props }, ref) => {
    const variantClasses = {
      default: "bg-gray-100 text-gray-600",
      primary: "bg-blue-100 text-blue-600",
      secondary: "bg-gray-100 text-gray-600",
      success: "bg-green-100 text-green-600",
      warning: "bg-yellow-100 text-yellow-600",
      danger: "bg-red-100 text-red-600",
    }

    const sizeClasses = {
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon}
      </div>
    )
  }
)
IconWithBackground.displayName = "IconWithBackground"

export { IconWithBackground }
