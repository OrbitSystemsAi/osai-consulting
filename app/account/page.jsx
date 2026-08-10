import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountRouter() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  const isAdmin = user?.emailAddresses.some(({ emailAddress }) =>
    adminEmails.includes(emailAddress.toLowerCase())
  )

  redirect(isAdmin ? '/admin' : '/client')
}
