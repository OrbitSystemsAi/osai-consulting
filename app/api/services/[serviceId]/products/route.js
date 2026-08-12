import { db } from '../../../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../../../lib/api-auth'

export async function POST(request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const body = await readJson(request)
  const { serviceId } = await params
  if (!body?.name?.trim()) return Response.json({ error: 'Product name is required' }, { status: 400 })
  const [row] = await db()`INSERT INTO service_products (service_id, name, summary, includes, format, investment, position, created_by, updated_by) SELECT ${serviceId}, ${body.name.trim()}, ${body.summary || ''}, ${body.includes || []}, ${body.format || ''}, ${body.investment || ''}, COALESCE(MAX(position) + 1, 0), ${actor.userId}, ${actor.userId} FROM service_products WHERE service_id=${serviceId} RETURNING *`
  return Response.json({ id: Number(row.id), name: row.name, summary: row.summary, includes: row.includes, format: row.format, investment: row.investment, createdBy: row.created_by, updatedBy: row.updated_by }, { status: 201 })
}
