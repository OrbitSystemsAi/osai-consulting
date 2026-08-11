import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const inputPath = process.argv[2]
if (!inputPath) {
  throw new Error('Usage: node scripts/ingest_leads.mjs <leads.csv>')
}

function parseCsv(source) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted && character === '"' && source[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some(value => value.length)) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [headers, ...records] = rows
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])))
}

function normalize(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')
}

function offerFor(vertical, category) {
  const label = `${vertical} ${category}`.toLowerCase()
  if (label.includes('medical') || label.includes('health') || label.includes('dental') || label.includes('doctor')) return 'Quick Win: intake & scheduling agent'
  if (label.includes('real estate')) return 'Quick Win: lead-qualification agent'
  if (label.includes('property management')) return 'Quick Win: resident and tenant inquiry agent'
  if (label.includes('legal') || label.includes('law')) return 'Growth Build: client intake agent'
  if (label.includes('financial') || label.includes('account')) return 'Growth Build: client onboarding agent'
  return 'Strategic Partner: operations and technology roadmap'
}

const outputPath = resolve('src/leads.js')
const existingModule = await import(`${pathToFileURL(outputPath).href}?updated=${Date.now()}`)
const existingByName = new Map(existingModule.leadProspects.map(lead => [normalize(lead.name), lead]))
const records = parseCsv(await readFile(resolve(inputPath), 'utf8'))
const seen = new Set()

const leads = records.flatMap(record => {
  const name = record.company_name.trim()
  const key = normalize(name)
  if (!name || seen.has(key)) return []
  seen.add(key)
  const existing = existingByName.get(key)
  const vertical = record.industry_vertical.trim() || 'Unclassified'
  const category = record.category.trim() || 'Unclassified'

  return [{
    id: seen.size,
    name,
    vertical,
    category,
    subcategory: record.sub_category.trim() || 'Unclassified',
    address: record.address.trim(),
    city: record.city.trim(),
    state: record.state.trim(),
    zip: record.zip.trim(),
    phone: record.phone.trim() || existing?.phone || existing?.companyPhone || '',
    website: record.website.trim() || existing?.website || existing?.companyUrl || '',
    companyEmail: record.company_email?.trim() || record.email?.trim() || existing?.companyEmail || '',
    offer: existing?.offer || offerFor(vertical, category),
    notes: record.notes.trim() || existing?.notes || '',
    source: record.source.trim() || existing?.source || 'Google Drive',
    ...(existing?.contactSource ? { contactSource: existing.contactSource } : {}),
    ...(existing?.contactSourceUrl ? { contactSourceUrl: existing.contactSourceUrl } : {}),
    ...(existing?.contactConfidence !== undefined ? { contactConfidence: existing.contactConfidence } : {}),
  }]
})

await writeFile(outputPath, `export const leadProspects = ${JSON.stringify(leads, null, 2)}\n`)
console.log(`Ingested ${leads.length} unique leads from ${inputPath}`)
