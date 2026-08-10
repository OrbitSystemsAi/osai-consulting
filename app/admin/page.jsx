import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminApp } from '../../src/main'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  if (!configured) return <AdminApp />

  const { userId, has } = await auth()
  if (!userId) redirect('/')

  const requiresAdminRole = process.env.REQUIRE_ADMIN_ROLE === 'true'
  if (requiresAdminRole && !has({ role: 'org:admin' })) {
    return <main className="access-denied"><h1>Admin access required</h1><p>Your account is signed in, but it has not been assigned the OSAI administrator role.</p><a href="/">Return home</a></main>
  }

  return <AdminApp />
}
