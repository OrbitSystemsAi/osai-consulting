import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { canAccessAdminWorkspace } from '../../lib/access'

export const dynamic = 'force-dynamic'

export default async function AccountRouter() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  redirect(canAccessAdminWorkspace(user) ? '/admin' : '/client')
}
