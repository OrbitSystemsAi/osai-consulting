import { db } from '../../../../lib/db'
import { readJson, requireWorkspaceUser, unauthorized } from '../../../../lib/api-auth'
import { defaultCampaignAudience, defaultCampaignSchedule, defaultCampaignWorkflow } from '../../../../lib/campaign-workflow'

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

export async function GET(_request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const { campaignId } = await params
  const [row] = await db()`SELECT * FROM campaigns WHERE id=${campaignId}`
  return row ? Response.json(serialize(row)) : Response.json({ error: 'Campaign not found' }, { status: 404 })
}

export async function PATCH(request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const { campaignId } = await params
  const body = await readJson(request)
  if (!body?.title?.trim()) return Response.json({ error: 'Campaign name is required' }, { status: 400 })
  const workflow = body.workflow?.days ? body.workflow : defaultCampaignWorkflow()
  const audience = body.audience || defaultCampaignAudience()
  const schedule = body.schedule || defaultCampaignSchedule()
  const [row] = await db()`UPDATE campaigns SET title=${body.title.trim()}, category=${body.category || 'Planning'}, brief=${body.brief || body.objective || ''}, description=${body.description || body.objective || ''}, activities=${JSON.stringify(Array.isArray(body.activities) ? body.activities : [])}::jsonb, status=${body.status || 'draft'}, objective=${body.objective || ''}, owner_name=${body.ownerName || ''}, audience=${JSON.stringify(audience)}::jsonb, workflow=${JSON.stringify(workflow)}::jsonb, schedule=${JSON.stringify(schedule)}::jsonb, current_step=${Number(body.currentStep) || 1}, updated_by=${actor.userId}, updated_at=NOW() WHERE id=${campaignId} RETURNING *`
  return row ? Response.json(serialize(row)) : Response.json({ error: 'Campaign not found' }, { status: 404 })
}

export async function DELETE(_request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const { campaignId } = await params
  const rows = await db()`DELETE FROM campaigns WHERE id=${campaignId} RETURNING id`
  return rows.length ? new Response(null, { status: 204 }) : Response.json({ error: 'Campaign not found' }, { status: 404 })
}
