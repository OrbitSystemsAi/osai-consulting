import { db } from '../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../lib/api-auth'
import { defaultCampaignAudience, defaultCampaignSchedule, defaultCampaignWorkflow } from '../../../lib/campaign-workflow'

const serialize = row => ({
  id: row.id,
  title: row.title,
  category: row.category,
  brief: row.brief,
  description: row.description,
  activities: row.activities || [],
  status: row.status || 'draft',
  objective: row.objective || row.brief || '',
  ownerName: row.owner_name || 'Earl Powery',
  audience: Object.keys(row.audience || {}).length ? row.audience : defaultCampaignAudience(),
  workflow: row.workflow?.days?.length ? row.workflow : defaultCampaignWorkflow(),
  schedule: Object.keys(row.schedule || {}).length ? row.schedule : defaultCampaignSchedule(),
  currentStep: row.workflow?.days?.length ? (row.current_step || 3) : 3,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
})

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
  const workflow = body.workflow?.days ? body.workflow : defaultCampaignWorkflow()
  const audience = body.audience || defaultCampaignAudience()
  const schedule = body.schedule || defaultCampaignSchedule()
  const [row] = await db()`INSERT INTO campaigns (id, title, category, brief, description, activities, status, objective, owner_name, audience, workflow, schedule, current_step, created_by, updated_by) VALUES (${id}, ${body.title.trim()}, ${body.category || 'Planning'}, ${body.brief.trim()}, ${body.description.trim()}, ${JSON.stringify(Array.isArray(body.activities) ? body.activities : [])}::jsonb, ${body.status || 'draft'}, ${body.objective || body.brief.trim()}, ${body.ownerName || ''}, ${JSON.stringify(audience)}::jsonb, ${JSON.stringify(workflow)}::jsonb, ${JSON.stringify(schedule)}::jsonb, ${Number(body.currentStep) || 1}, ${actor.userId}, ${actor.userId}) RETURNING *`
  return Response.json(serialize(row), { status: 201 })
}
