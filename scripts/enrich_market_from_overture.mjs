import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const inputPath = process.argv[2]
const dryRun = process.argv.includes('--dry-run')
if (!inputPath) {
  throw new Error('Usage: node scripts/enrich_market_from_overture.mjs <overture-places.json> [--dry-run]')
}

const release = '2026-06-17.0'
const sourceName = `Overture Maps ${release}`
const sourceUrl = 'https://docs.overturemaps.org/guides/places/'

function normalize(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/\b(incorporated|corporation|company|limited|inc|corp|co|llc|ltd|pllc|pa)\b/g, ' ')
    .replace(/\band\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokens(value = '') {
  return new Set(normalize(value).split(' ').filter(token => token.length > 1))
}

function similarity(left, right) {
  const a = tokens(left)
  const b = tokens(right)
  if (!a.size || !b.size) return 0
  const overlap = [...a].filter(token => b.has(token)).length
  return overlap / Math.max(a.size, b.size)
}

function houseNumber(value = '') {
  return String(value || '').match(/^\s*(\d+[a-z]?)/i)?.[1]?.toLowerCase() || ''
}

function addressFor(place) {
  return place.addresses?.[0] || {}
}

function scoreAddress(lead, place) {
  const address = addressFor(place)
  const sameCity = normalize(address.locality) === normalize(lead.city)
  const sameZip = String(address.postcode || '').slice(0, 5) === String(lead.zip || '').slice(0, 5)
  const leadNumber = houseNumber(lead.address)
  const placeNumber = houseNumber(address.freeform)
  const sameNumber = Boolean(leadNumber && placeNumber && leadNumber === placeNumber)
  const streetSimilarity = similarity(lead.address, address.freeform)
  return { sameCity, sameZip, sameNumber, streetSimilarity }
}

function isSafeMatch(lead, place) {
  const leadName = normalize(lead.name)
  const placeName = normalize(place.name)
  if (!leadName || !placeName) return false
  const exactName = leadName === placeName
  const address = scoreAddress(lead, place)

  if (exactName) {
    return address.sameNumber || (address.sameCity && address.sameZip && address.streetSimilarity >= 0.45)
  }
  return false
}

const outputPath = resolve('src/leads.js')
const currentModule = await import(`${pathToFileURL(outputPath).href}?updated=${Date.now()}`)
const places = JSON.parse(await readFile(resolve(inputPath), 'utf8'))
const placesByName = new Map()

for (const place of places) {
  const key = normalize(place.name)
  if (!key) continue
  const bucket = placesByName.get(key) || []
  bucket.push(place)
  placesByName.set(key, bucket)
}

let matched = 0
let websiteCount = 0
let phoneCount = 0
let emailCount = 0
const review = []

const leads = currentModule.leadProspects.map(lead => {
  const leadName = normalize(lead.name)
  const exactCandidates = placesByName.get(leadName) || []
  const candidates = exactCandidates

  const safeCandidates = candidates
    .filter(place => isSafeMatch(lead, place))
    .sort((left, right) => {
      const a = scoreAddress(lead, left)
      const b = scoreAddress(lead, right)
      const aScore = Number(a.sameNumber) * 4 + Number(a.sameZip) * 2 + Number(a.sameCity) + a.streetSimilarity
      const bScore = Number(b.sameNumber) * 4 + Number(b.sameZip) * 2 + Number(b.sameCity) + b.streetSimilarity
      return bScore - aScore || Number(right.confidence || 0) - Number(left.confidence || 0)
    })

  const match = safeCandidates[0]
  if (!match) return lead
  matched += 1
  const website = lead.website || match.websites?.[0] || ''
  const phone = lead.phone || match.phones?.[0] || ''
  const companyEmail = lead.companyEmail || match.emails?.[0] || ''
  if (website) websiteCount += 1
  if (phone) phoneCount += 1
  if (companyEmail) emailCount += 1
  if (normalize(lead.name) !== normalize(match.name)) {
    review.push(`${lead.name} -> ${match.name} @ ${addressFor(match).freeform || 'unknown address'}`)
  }

  return {
    ...lead,
    phone,
    website,
    companyEmail,
    contactSource: sourceName,
    contactSourceUrl: sourceUrl,
    contactConfidence: match.confidence ?? null,
  }
})

console.log(`Matched ${matched} of ${leads.length} companies`)
console.log(`Matched records with website: ${websiteCount}`)
console.log(`Matched records with phone: ${phoneCount}`)
console.log(`Matched records with email: ${emailCount}`)
console.log(`Non-exact name matches requiring review: ${review.length}`)
for (const item of review.slice(0, 50)) console.log(`  ${item}`)

if (!dryRun) {
  await writeFile(outputPath, `export const leadProspects = ${JSON.stringify(leads, null, 2)}\n`)
  console.log(`Updated ${outputPath}`)
}
