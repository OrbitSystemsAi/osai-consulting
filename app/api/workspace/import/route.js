import { db } from '../../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../../lib/api-auth'

const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export async function POST(request) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const body = await readJson(request)
  if (!body) return Response.json({ error: 'Invalid import' }, { status: 400 })
  const importKey = `browser-v1:${actor.userId}`
  const prior = await db()`SELECT import_key FROM workspace_imports WHERE import_key=${importKey}`
  if (prior.length) return Response.json({ imported: false })

  const services = Array.isArray(body['osai-custom-services-v1']) ? body['osai-custom-services-v1'] : []
  const productOverrides = body['osai-service-products-v1'] && typeof body['osai-service-products-v1'] === 'object' ? body['osai-service-products-v1'] : {}
  for (const service of services) {
    const id = service.id || `${slug(service.title)}-${Date.now()}`
    await db()`INSERT INTO services (id, title, category, brief, description, created_by, updated_by) VALUES (${id}, ${service.title}, ${service.category || 'Advisory'}, ${service.brief || ''}, ${service.description || ''}, ${actor.userId}, ${actor.userId}) ON CONFLICT (id) DO NOTHING`
    const products = service.products || []
    for (let position = 0; position < products.length; position += 1) {
      const product = products[position]
      await db()`INSERT INTO service_products (service_id, name, summary, includes, format, investment, position, created_by, updated_by) VALUES (${id}, ${product.name}, ${product.summary || ''}, ${product.includes || []}, ${product.format || ''}, ${product.investment || ''}, ${position}, ${actor.userId}, ${actor.userId}) ON CONFLICT (service_id, name) DO NOTHING`
    }
  }
  for (const [serviceId, products] of Object.entries(productOverrides)) {
    if (!Array.isArray(products)) continue
    for (let position = 0; position < products.length; position += 1) {
      const product = products[position]
      await db()`INSERT INTO service_products (service_id, name, summary, includes, format, investment, position, created_by, updated_by) VALUES (${serviceId}, ${product.name}, ${product.summary || ''}, ${product.includes || []}, ${product.format || ''}, ${product.investment || ''}, ${position}, ${actor.userId}, ${actor.userId}) ON CONFLICT (service_id, name) DO NOTHING`
    }
  }

  const campaigns = Array.isArray(body['osai-custom-campaigns-v1']) ? body['osai-custom-campaigns-v1'] : []
  for (const campaign of campaigns) {
    const id = campaign.id || `${slug(campaign.title)}-${Date.now()}`
    await db()`INSERT INTO campaigns (id, title, category, brief, description, activities, created_by, updated_by) VALUES (${id}, ${campaign.title}, ${campaign.category || 'Planning'}, ${campaign.brief || ''}, ${campaign.description || ''}, ${JSON.stringify(campaign.activities || [])}::jsonb, ${actor.userId}, ${actor.userId}) ON CONFLICT (id) DO NOTHING`
  }

  const events = Array.isArray(body['osai-calendar-items']) ? body['osai-calendar-items'] : []
  for (const event of events) {
    if (!event.title || !event.date || !event.related) continue
    await db()`INSERT INTO calendar_events (status, title, event_date, event_time, related_to, notes, created_by, updated_by) VALUES (${event.type || 'Not Contacted'}, ${event.title}, ${event.date}, ${event.time || null}, ${event.related}, ${event.notes || ''}, ${actor.userId}, ${actor.userId}) ON CONFLICT DO NOTHING`
  }
  await db()`INSERT INTO workspace_imports (import_key, imported_by) VALUES (${importKey}, ${actor.userId})`
  return Response.json({ imported: true })
}
