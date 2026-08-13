import { Receiver } from '@upstash/qstash'
import { db } from '../../../../../../lib/db'

function receiver() {
  return new Receiver({ currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY, nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY })
}

export async function POST(request, { params }) {
  const body = await request.text()
  const signature = request.headers.get('upstash-signature') || ''
  const valid = await receiver().verify({ signature, body, url: request.url }).catch(() => false)
  if (!valid) return Response.json({ error: 'Invalid scheduler signature' }, { status: 401 })
  const { campaignId } = await params
  const [campaign] = await db()`SELECT id, status, workflow, schedule FROM campaigns WHERE id=${campaignId}`
  if (!campaign || !['scheduled', 'active'].includes(campaign.status)) return Response.json({ skipped: true })
  await db()`UPDATE campaigns SET status='active', updated_at=NOW() WHERE id=${campaignId}`
  return Response.json({ accepted: true, campaignId, note: 'Recipient execution begins when campaign recipients are materialized from the selected audience.' })
}
