import { db } from '../../../../../lib/db'
import { requireWorkspaceUser, unauthorized } from '../../../../../lib/api-auth'
import { automationReadiness, campaignAutomationConfigured, enqueueCampaign } from '../../../../../lib/campaign-automation'

export async function POST(_request, { params }) {
  const actor = await requireWorkspaceUser()
  if (!actor) return unauthorized()
  const { campaignId } = await params
  const [campaign] = await db()`SELECT * FROM campaigns WHERE id=${campaignId}`
  if (!campaign) return Response.json({ error: 'Campaign not found' }, { status: 404 })
  if (!campaignAutomationConfigured()) return Response.json({ error: 'Email automation is not configured yet.', readiness: automationReadiness() }, { status: 409 })
  if (!campaign.workflow?.days?.length) return Response.json({ error: 'Add at least one campaign day before scheduling.' }, { status: 400 })
  await enqueueCampaign(campaignId)
  const [updated] = await db()`UPDATE campaigns SET status='scheduled', updated_by=${actor.userId}, updated_at=NOW() WHERE id=${campaignId} RETURNING *`
  return Response.json({ id: updated.id, status: updated.status })
}
