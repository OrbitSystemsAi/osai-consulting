import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminApp } from '../../src/main'
import { isAdminUser } from '../../lib/access'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  if (!configured) return <AdminApp configured={false} initialProfile={{ firstName: 'Earl', lastName: 'Powery', email: 'epowery@icloud.com' }} />

  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  if (!isAdminUser(user)) redirect('/client')

  return <AdminApp configured initialProfile={{ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.primaryEmailAddress?.emailAddress || '' }} />
}
