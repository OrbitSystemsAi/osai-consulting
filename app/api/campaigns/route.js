import { db } from '../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../lib/api-auth'

const serialize = row => ({ id: row.id, title: row.title, category: row.category, brief: row.brief, description: row.description, activities: row.activities || [], createdBy: row.created_by, updatedBy: row.updated_by })

export async function GET() {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const rows = await db()`SELECT * FROM campaigns ORDER BY created_at, title`
  return Response.json(rows.map(serialize))
}

export async function POST(request) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const body = await readJson(request)
  if (!body?.id || !body?.title?.trim() || !body?.brief?.trim() || !body?.description?.trim()) return Response.json({ error: 'Invalid campaign' }, { status: 400 })
  const id = `${body.id}-${Date.now()}`
  const [row] = await db()`INSERT INTO campaigns (id, title, category, brief, description, activities, created_by, updated_by) VALUES (${id}, ${body.title.trim()}, ${body.category || 'Planning'}, ${body.brief.trim()}, ${body.description.trim()}, ${JSON.stringify(Array.isArray(body.activities) ? body.activities : [])}::jsonb, ${actor.userId}, ${actor.userId}) RETURNING *`
  return Response.json(serialize(row), { status: 201 })
}
