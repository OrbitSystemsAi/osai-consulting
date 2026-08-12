import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'
import { serviceCatalog } from '../src/services.js'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const sql = neon(process.env.DATABASE_URL)
const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8')
for (const statement of schema.split(';').map(value => value.trim()).filter(Boolean)) await sql.query(statement)

const system = 'system-seed'
for (const service of serviceCatalog) {
  await sql`INSERT INTO services (id, title, category, brief, description, created_by, updated_by) VALUES (${service.id}, ${service.title}, ${service.category}, ${service.brief}, ${service.description}, ${system}, ${system}) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category, brief=EXCLUDED.brief, description=EXCLUDED.description, updated_by=EXCLUDED.updated_by, updated_at=NOW()`
  for (let position = 0; position < service.products.length; position += 1) {
    const product = service.products[position]
    await sql`INSERT INTO service_products (service_id, name, summary, includes, format, investment, position, created_by, updated_by) VALUES (${service.id}, ${product.name}, ${product.summary || ''}, ${product.includes || []}, ${product.format || ''}, ${product.investment || ''}, ${position}, ${system}, ${system}) ON CONFLICT (service_id, name) DO UPDATE SET summary=EXCLUDED.summary, includes=EXCLUDED.includes, format=EXCLUDED.format, investment=EXCLUDED.investment, position=EXCLUDED.position, updated_by=EXCLUDED.updated_by, updated_at=NOW()`
  }
}

const campaigns = [
  ['weston-healthcare-outreach', 'Weston Healthcare Outreach', 'Active', 'Introduce OSAI intake and scheduling solutions to qualified healthcare targets across Weston.', 'A focused market-development campaign designed to move high-fit healthcare targets from initial outreach into discovery conversations around intake, scheduling, and operational workflow improvements.', [{ name: 'Target list', summary: 'Build and qualify the priority healthcare audience.', includes: ['Review market fit', 'Confirm decision-maker roles', 'Prioritize outreach order'] }, { name: 'Outreach sequence', summary: 'Run a coordinated introduction across email and direct follow-up.', includes: ['Initial introduction', 'Value-led follow-up', 'Discovery invitation'] }, { name: 'Campaign review', summary: 'Evaluate responses and advance qualified relationships.', includes: ['Response review', 'Status updates', 'Next-step assignments'] }]],
  ['business-services-development', 'Business Services Development', 'Planning', 'Identify operationally complex service businesses that can benefit from connected workflows and automation.', 'A market-development campaign focused on business-service organizations with visible workflow friction, manual handoffs, or opportunities for better client intake and operational coordination.', [{ name: 'Segment refinement', summary: 'Narrow the market to the highest-potential categories.', includes: ['Category review', 'Fit criteria', 'Priority segment selection'] }, { name: 'Message development', summary: 'Create an outreach message grounded in operational value.', includes: ['Problem framing', 'Offer alignment', 'Call-to-action design'] }]],
  ['technology-advisory-nurture', 'Technology Advisory Nurture', 'Nurture', 'Maintain useful contact with organizations considering technology planning, AI adoption, or modernization.', 'A long-term nurture campaign for companies that are not ready to buy today but have an emerging need for technology planning, AI readiness, or modernization guidance.', [{ name: 'Insight series', summary: 'Share concise guidance that builds trust over time.', includes: ['Technology readiness insight', 'AI planning perspective', 'Roadmap example'] }, { name: 'Readiness check-in', summary: 'Create a natural opportunity to reassess timing and priorities.', includes: ['Quarterly check-in', 'Priority review', 'Advisory invitation'] }]],
]
for (const [id, title, category, brief, description, activities] of campaigns) await sql`INSERT INTO campaigns (id, title, category, brief, description, activities, created_by, updated_by) VALUES (${id}, ${title}, ${category}, ${brief}, ${description}, ${JSON.stringify(activities)}::jsonb, ${system}, ${system}) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category, brief=EXCLUDED.brief, description=EXCLUDED.description, activities=EXCLUDED.activities, updated_by=EXCLUDED.updated_by, updated_at=NOW()`

console.log(`Shared workspace ready: ${serviceCatalog.length} services and ${campaigns.length} campaigns seeded.`)
