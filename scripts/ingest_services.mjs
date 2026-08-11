import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const inputPath = process.argv[2]
if (!inputPath) throw new Error('Usage: node scripts/ingest_services.mjs <service-offerings.md>')

const source = await readFile(resolve(inputPath), 'utf8')
const blocks = source.split(/^## \d+\. /m).slice(1)

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const services = blocks.map(block => {
  const [titleLine, ...lines] = block.split('\n')
  const category = block.match(/^\*\*Category:\*\*\s*(.+)$/m)?.[1]?.trim() || ''
  const brief = block.match(/^\*\*Brief:\*\*\s*(.+)$/m)?.[1]?.trim() || ''
  const description = block.match(/\*\*Description:\*\*\s*\n([\s\S]*?)\n\n\*\*Products:\*\*/)?.[1]?.trim().replace(/\n+/g, ' ') || ''
  const productsSection = block.split('**Products:**')[1]?.split(/^---$/m)[0] || ''
  const productBlocks = productsSection.split(/^\*\*(.+)\*\*$/m).slice(1)
  const products = []

  for (let index = 0; index < productBlocks.length; index += 2) {
    const name = productBlocks[index]?.trim()
    const details = productBlocks[index + 1] || ''
    if (!name) continue
    products.push({
      name,
      summary: details.match(/^\*([^*]+)\*$/m)?.[1]?.trim() || '',
      includes: details.match(/^- Includes:\s*(.+)$/m)?.[1]?.split(',').map(item => item.trim()) || [],
      format: details.match(/^- Format:\s*(.+)$/m)?.[1]?.trim() || '',
      investment: details.match(/^- Investment:\s*(.+)$/m)?.[1]?.trim() || '',
    })
  }

  const title = titleLine.trim()
  return { id: slugify(title), title, category, brief, description, products }
})

await writeFile(resolve('src/services.js'), `export const serviceCatalog = ${JSON.stringify(services, null, 2)}\n`)
console.log(`Ingested ${services.length} services and ${services.reduce((count, service) => count + service.products.length, 0)} products`)
