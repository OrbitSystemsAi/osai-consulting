import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { getUserRole } from '../../../../../lib/access'

const allowedRoles = new Set(['Admin', 'OSAI-Admin', 'Client', 'Collaborator'])

export async function PATCH(request, { params }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const actingUser = await currentUser()
  if (getUserRole(actingUser) !== 'Admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { userId: targetUserId } = await params
  const body = await request.json()
  if (!allowedRoles.has(body.role) || !Array.isArray(body.assignments)) {
    return Response.json({ error: 'Invalid role or project assignments' }, { status: 400 })
  }

  const client = await clerkClient()
  const targetUser = await client.users.getUser(targetUserId)
  const targetEmail = targetUser.primaryEmailAddress?.emailAddress?.toLowerCase()
  if (targetEmail === 'epowery@icloud.com' && body.role !== 'Admin') {
    return Response.json({ error: 'The primary administrator role cannot be changed' }, { status: 400 })
  }

  const updated = await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role: body.role,
      projectAssignments: body.assignments,
    },
  })

  return Response.json({
    role: getUserRole(updated),
    assignments: Array.isArray(updated.publicMetadata?.projectAssignments) ? updated.publicMetadata.projectAssignments : [],
  })
}
