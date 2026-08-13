import { auth, clerkClient } from '@clerk/nextjs/server'

function clean(value, limit = 100) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : ''
}

export async function PUT(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const firstName = clean(body?.firstName)
  const lastName = clean(body?.lastName)
  const nickname = clean(body?.nickname)
  if (!firstName || !lastName) return Response.json({ error: 'First and last name are required' }, { status: 400 })

  try {
    const client = await clerkClient()
    const current = await client.users.getUser(userId)
    const user = await client.users.updateUser(userId, {
      firstName,
      lastName,
      unsafeMetadata: { ...current.unsafeMetadata, nickname },
    })
    return Response.json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      nickname: typeof user.unsafeMetadata?.nickname === 'string' ? user.unsafeMetadata.nickname : '',
      email: user.primaryEmailAddress?.emailAddress || '',
    })
  } catch (error) {
    console.error('Unable to save profile', error)
    return Response.json({ error: 'Unable to save profile' }, { status: 500 })
  }
}
