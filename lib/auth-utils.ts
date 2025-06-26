import { auth } from "@/auth"
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getUserSession(): Promise<UserProfile | null> {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return session.user as UserProfile
}

export async function getBusinessSession(): Promise<BusinessProfile | null> {
  const session = await auth()

  if (!session?.business) {
    return null
  }

  return session.business as BusinessProfile
}
