import { db } from '../../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../../lib/api-auth'

const statuses = new Set(['Not Contacted', 'Outreach', 'Connected', 'Follow-Up', 'Scheduled', 'Active', 'Nurture', 'Unresponsive', 'Closed'])
const dateValue = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10)
const serialize = row => ({ id: Number(row.id), type: row.status, title: row.title, date: dateValue(row.event_date), time: row.event_time ? String(row.event_time).slice(0, 5) : '', related: row.related_to, notes: row.notes, createdBy: row.created_by, updatedBy: row.updated_by, createdAt: row.created_at, updatedAt: row.updated_at })

export async function PATCH(request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const body = await readJson(request)
  const { id } = await params
  if (!body?.title?.trim() || !body?.date || !body?.related?.trim() || !statuses.has(body.type)) return Response.json({ error: 'Invalid calendar event' }, { status: 400 })
  const [row] = await db()`UPDATE calendar_events SET status=${body.type}, title=${body.title.trim()}, event_date=${body.date}, event_time=${body.time || null}, related_to=${body.related.trim()}, notes=${body.notes || ''}, updated_by=${actor.userId}, updated_at=NOW() WHERE id=${id} RETURNING *`
  return row ? Response.json(serialize(row)) : Response.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE(_request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const { id } = await params
  const rows = await db()`DELETE FROM calendar_events WHERE id=${id} RETURNING id`
  return rows.length ? new Response(null, { status: 204 }) : Response.json({ error: 'Not found' }, { status: 404 })
}
