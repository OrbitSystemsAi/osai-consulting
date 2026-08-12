import { db } from '../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../lib/api-auth'

const statuses = new Set(['Not Contacted', 'Outreach', 'Connected', 'Follow-Up', 'Scheduled', 'Active', 'Nurture', 'Unresponsive', 'Closed'])
const dateValue = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10)
const serialize = row => ({ id: Number(row.id), type: row.status, title: row.title, date: dateValue(row.event_date), time: row.event_time ? String(row.event_time).slice(0, 5) : '', related: row.related_to, notes: row.notes, createdBy: row.created_by, updatedBy: row.updated_by, createdAt: row.created_at, updatedAt: row.updated_at })

export async function GET() {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const rows = await db()`SELECT * FROM calendar_events ORDER BY event_date, event_time NULLS FIRST, id`
  return Response.json(rows.map(serialize))
}

export async function POST(request) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const body = await readJson(request)
  if (!body?.title?.trim() || !body?.date || !body?.related?.trim() || !statuses.has(body.type)) return Response.json({ error: 'Invalid calendar event' }, { status: 400 })
  const [row] = await db()`INSERT INTO calendar_events (status, title, event_date, event_time, related_to, notes, created_by, updated_by) VALUES (${body.type}, ${body.title.trim()}, ${body.date}, ${body.time || null}, ${body.related.trim()}, ${body.notes || ''}, ${actor.userId}, ${actor.userId}) RETURNING *`
  return Response.json(serialize(row), { status: 201 })
}
