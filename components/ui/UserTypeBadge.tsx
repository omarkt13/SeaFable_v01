import { Building, User } from "lucide-react"

interface UserTypeBadgeProps {
  userType: "customer" | "business"
  className?: string
}

export function UserTypeBadge({ userType, className = "" }: UserTypeBadgeProps) {
  if (userType === "business") {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ${className}`}
      >
        <Building className="w-3 h-3 mr-1" />
        Business
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}
    >
      <User className="w-3 h-3 mr-1" />
      Customer
    </span>
  )
}
