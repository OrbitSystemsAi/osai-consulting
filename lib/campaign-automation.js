import { Client as QStashClient } from '@upstash/qstash'
import { Resend } from 'resend'

export function automationReadiness() {
  return {
    qstash: Boolean(process.env.QSTASH_TOKEN && process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY),
    resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL),
  }
}

export function campaignAutomationConfigured() {
  return Object.values(automationReadiness()).every(Boolean)
}

function applicationUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (!raw) throw new Error('Application URL is not configured')
  return raw.startsWith('http') ? raw.replace(/\/$/, '') : `https://${raw.replace(/\/$/, '')}`
}

export async function enqueueCampaign(campaignId) {
  const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN })
  return qstash.publishJSON({ url: `${applicationUrl()}/api/automation/campaigns/${encodeURIComponent(campaignId)}/execute`, body: { campaignId }, retries: 3 })
}

export async function sendCampaignEmail({ to, subject, html, idempotencyKey }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to, subject, html }, { headers: { 'Idempotency-Key': idempotencyKey } })
  if (error) throw new Error(error.message || 'Email provider rejected the message')
  return data
}
