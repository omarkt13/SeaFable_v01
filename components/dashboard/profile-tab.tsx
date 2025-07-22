// This component is now inlined in app/dashboard/page.tsx for simplicity.
// If it grows too large, it can be extracted back into its own file.
Update to use real data
Replacing
<old_str>
export function ProfileTab({ dashboardData }: ProfileTabProps) {
  const user = dashboardData?.user || mockUserData.user
</old_str>
with
<new_str>
export function ProfileTab({ dashboardData }: ProfileTabProps) {
  const user = dashboardData?.user || null
</new_str>