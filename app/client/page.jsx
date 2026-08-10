import { auth, currentUser } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { canAccessAdminWorkspace } from '../../lib/access'

export const dynamic = 'force-dynamic'

export default async function ClientPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const user = await currentUser()
  if (canAccessAdminWorkspace(user)) redirect('/admin')

  const name = user?.firstName || user?.fullName || 'Client'

  return (
    <main className="client-portal-shell">
      <section className="client-portal-card">
        <div className="client-portal-brand"><span>O</span><strong>OSAI Consulting</strong></div>
        <p className="eyebrow">Client workspace</p>
        <h1>Welcome, {name}.</h1>
        <p>Your OSAI project workspace is being prepared. Project plans, milestones, documents, and updates will appear here.</p>
        <div className="client-portal-actions">
          <a href="mailto:epowery@icloud.com">Contact OSAI</a>
          <SignOutButton redirectUrl="/"><button>Sign out</button></SignOutButton>
        </div>
      </section>
    </main>
  )
}
