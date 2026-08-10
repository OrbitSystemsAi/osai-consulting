import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminApp } from '../../src/main'
import { isAdminUser } from '../../lib/access'

export const dynamic = 'force-dynamic'

const validRoles = new Set(['Admin', 'OSAI-Admin', 'Client', 'Collaborator'])

function formatClerkUser(clerkUser) {
  const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || ''
  const metadataRole = clerkUser.publicMetadata?.role
  const role = email.toLowerCase() === 'epowery@icloud.com' ? 'Admin' : validRoles.has(metadataRole) ? metadataRole : 'Client'
  const assignments = Array.isArray(clerkUser.publicMetadata?.projectAssignments) ? clerkUser.publicMetadata.projectAssignments : []
  return {
    id: clerkUser.id,
    firstName: clerkUser.firstName || email.split('@')[0] || 'User',
    lastName: clerkUser.lastName || ' ',
    email,
    role,
    status: clerkUser.banned || clerkUser.locked ? 'Inactive' : 'Active',
    lastActive: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not yet signed in',
    assignments,
  }
}

export default async function AdminPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  if (!configured) return <AdminApp configured={false} initialProfile={{ firstName: 'Earl', lastName: 'Powery', email: 'epowery@icloud.com' }} />

  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  if (!isAdminUser(user)) redirect('/client')

  const client = await clerkClient()
  const { data: clerkUsers } = await client.users.getUserList({ limit: 100, orderBy: '-created_at' })
  const users = clerkUsers.length ? clerkUsers.map(formatClerkUser) : [formatClerkUser(user)]

  return <AdminApp configured initialProfile={{ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.primaryEmailAddress?.emailAddress || '' }} initialUsers={users} />
}
