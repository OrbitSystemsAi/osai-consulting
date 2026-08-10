import { neon } from '@neondatabase/serverless'

export const runtime = 'nodejs'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ status: 'setup-required', database: 'not-configured' }, { status: 503 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    await sql`SELECT 1`
    return Response.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Database health check failed', error)
    return Response.json({ status: 'error', database: 'unavailable' }, { status: 503 })
  }
}
