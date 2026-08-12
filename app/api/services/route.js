import { db } from '../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../lib/api-auth'

const serialize = row => ({ id: row.id, title: row.title, category: row.category, brief: row.brief, description: row.description, products: row.products || [], createdBy: row.created_by, updatedBy: row.updated_by })

export async function GET() {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const rows = await db()`SELECT s.*, COALESCE(json_agg(json_build_object('id', p.id, 'name', p.name, 'summary', p.summary, 'includes', p.includes, 'format', p.format, 'investment', p.investment, 'createdBy', p.created_by, 'updatedBy', p.updated_by) ORDER BY p.position, p.id) FILTER (WHERE p.id IS NOT NULL), '[]') AS products FROM services s LEFT JOIN service_products p ON p.service_id=s.id GROUP BY s.id ORDER BY s.created_at, s.title`
  return Response.json(rows.map(serialize))
}

export async function POST(request) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const body = await readJson(request)
  if (!body?.id || !body?.title?.trim() || !body?.brief?.trim() || !body?.description?.trim()) return Response.json({ error: 'Invalid service' }, { status: 400 })
  const id = `${body.id}-${Date.now()}`
  await db()`INSERT INTO services (id, title, category, brief, description, created_by, updated_by) VALUES (${id}, ${body.title.trim()}, ${body.category || 'Advisory'}, ${body.brief.trim()}, ${body.description.trim()}, ${actor.userId}, ${actor.userId})`
  const products = Array.isArray(body.products) ? body.products : []
  for (let position = 0; position < products.length; position += 1) {
    const product = products[position]
    await db()`INSERT INTO service_products (service_id, name, summary, includes, format, investment, position, created_by, updated_by) VALUES (${id}, ${product.name}, ${product.summary || ''}, ${product.includes || []}, ${product.format || ''}, ${product.investment || ''}, ${position}, ${actor.userId}, ${actor.userId})`
  }
  const [service] = await db()`SELECT * FROM services WHERE id=${id}`
  return Response.json(serialize({ ...service, products }), { status: 201 })
}
