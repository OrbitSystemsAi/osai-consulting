import { auth } from '@clerk/nextjs/server'

export async function requireWorkspaceUser() {
  const { userId } = await auth()
  if (!userId) return null
  return { userId }
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function readJson(request) {
  try { return await request.json() } catch { return null }
}
