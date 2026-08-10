import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminApp } from '../../src/main'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  if (!configured) return <AdminApp configured={false} initialProfile={{ firstName: 'Earl', lastName: 'Powery', email: 'epowery@icloud.com' }} />

  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  const isAllowedEmail = user?.emailAddresses.some(({ emailAddress }) => allowedEmails.includes(emailAddress.toLowerCase()))
  const isAdmin = isAllowedEmail

  if (!isAdmin) redirect('/client')

  return <AdminApp configured initialProfile={{ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.primaryEmailAddress?.emailAddress || '' }} />
}
