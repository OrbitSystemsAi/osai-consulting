'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { SignInButton, SignOutButton, UserButton, useAuth } from '@clerk/nextjs'
import { leadProspects } from './leads'
import { serviceCatalog } from './services'
import { CampaignBuilder } from './campaign-builder'
import { defaultCampaignAudience, defaultCampaignSchedule, defaultCampaignWorkflow } from '../lib/campaign-workflow'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleDollarSign,
  CircleCheck,
  Clock3,
  Filter,
  Globe2,
  LayoutDashboard,
  Layers3,
  LockKeyhole,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Settings,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  UserCog,
  Users,
  Workflow,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Market', icon: Target, count: leadProspects.length },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Campaign', icon: Megaphone, count: 3 },
  { label: 'Services', icon: Sparkles, count: serviceCatalog.length },
  { label: 'Pipeline', icon: BriefcaseBusiness, count: 7 },
  { label: 'Users', icon: UserCog, count: 5 },
]

const serviceIcons = { Advisory: BrainCircuit, Transformation: Workflow, Delivery: ArrowUpRight }
async function workspaceRequest(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || `Request failed (${response.status})`)
  }
  return response.status === 204 ? null : response.json()
}

function serviceSlug(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseUploadedService(source, fileName) {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(source)
    const service = Array.isArray(parsed) ? parsed[0] : parsed
    if (!service?.title || !service?.brief || !service?.description) throw new Error('JSON requires title, brief, and description fields.')
    return { ...service, id: service.id || serviceSlug(service.title), products: service.products || [] }
  }

  const title = source.match(/^##(?:\s+\d+\.)?\s+(.+)$/m)?.[1]?.trim() || source.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const category = source.match(/^\*\*Category:\*\*\s*(.+)$/m)?.[1]?.trim()
  const brief = source.match(/^\*\*Brief:\*\*\s*(.+)$/m)?.[1]?.trim()
  const description = source.match(/\*\*Description:\*\*\s*\n([\s\S]*?)(?=\n\n\*\*Products:\*\*|$)/)?.[1]?.trim().replace(/\n+/g, ' ')
  const productsSection = source.split('**Products:**')[1] || ''
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
  if (!title || !category || !brief || !description) throw new Error('The document needs a title, Category, Brief, Description, and Products section.')
  return { id: serviceSlug(title), title, category, brief, description, products }
}

function parseUploadedProduct(source, fileName) {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(source)
    const product = Array.isArray(parsed) ? parsed[0] : parsed
    if (!product?.name) throw new Error('JSON requires a product name.')
    return { name: product.name, summary: product.summary || '', includes: product.includes || [], format: product.format || '', investment: product.investment || '' }
  }
  const name = source.match(/^\*\*(.+)\*\*$/m)?.[1]?.trim() || source.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim()
  const summary = source.match(/^\*([^*]+)\*$/m)?.[1]?.trim() || ''
  const includes = source.match(/^- Includes:\s*(.+)$/m)?.[1]?.split(',').map(item => item.trim()) || []
  const format = source.match(/^- Format:\s*(.+)$/m)?.[1]?.trim() || ''
  const investment = source.match(/^- Investment:\s*(.+)$/m)?.[1]?.trim() || ''
  if (!name) throw new Error('The document needs a product name as a heading.')
  return { name, summary, includes, format, investment }
}

function parseUploadedCampaign(source, fileName) {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(source)
    const campaign = Array.isArray(parsed) ? parsed[0] : parsed
    if (!campaign?.title || !campaign?.brief || !campaign?.description) throw new Error('JSON requires title, brief, and description fields.')
    return { ...campaign, id: campaign.id || serviceSlug(campaign.title), category: campaign.category || campaign.status || 'Planning', activities: campaign.activities || [] }
  }
  const title = source.match(/^##(?:\s+\d+\.)?\s+(.+)$/m)?.[1]?.trim() || source.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const category = source.match(/^\*\*(?:Status|Category):\*\*\s*(.+)$/m)?.[1]?.trim() || 'Planning'
  const brief = source.match(/^\*\*Brief:\*\*\s*(.+)$/m)?.[1]?.trim()
  const description = source.match(/\*\*Description:\*\*\s*\n([\s\S]*?)(?=\n\n\*\*(?:Activities|Products):\*\*|$)/)?.[1]?.trim().replace(/\n+/g, ' ')
  const activitiesSection = source.split(/\*\*(?:Activities|Products):\*\*/)[1] || ''
  const activityBlocks = activitiesSection.split(/^\*\*(.+)\*\*$/m).slice(1)
  const activities = []
  for (let index = 0; index < activityBlocks.length; index += 2) {
    const name = activityBlocks[index]?.trim()
    const details = activityBlocks[index + 1] || ''
    if (!name) continue
    activities.push({ name, summary: details.match(/^\*([^*]+)\*$/m)?.[1]?.trim() || '', includes: details.match(/^- Includes:\s*(.+)$/m)?.[1]?.split(',').map(item => item.trim()) || [] })
  }
  if (!title || !brief || !description) throw new Error('The document needs a title, Brief, Description, and Activities section.')
  return { id: serviceSlug(title), title, category, brief, description, activities }
}

const opportunities = [
  { company: 'Weston Family Medicine', contact: 'Family Medicine', value: 'Priority 1', stage: 'Qualified', tone: 'green' },
  { company: 'AssociatesMD - Weston', contact: 'Urgent Care & Walk-in', value: 'Priority 1', stage: 'Research', tone: 'blue' },
  { company: 'Weston Dental Care', contact: 'Cosmetic & Implant Dentistry', value: 'Priority 1', stage: 'Qualified', tone: 'violet' },
  { company: 'Sage Dental of Weston', contact: 'General & Multi-Specialty', value: 'Priority 1', stage: 'Research', tone: 'amber' },
]

const activity = [
  { icon: CheckCircle2, text: 'Weston Family Medicine qualified', time: 'Imported lead', color: 'mint' },
  { icon: CalendarDays, text: 'AssociatesMD intake opportunity identified', time: 'Imported lead', color: 'violet' },
  { icon: Users, text: `${leadProspects.length} Weston prospects ingested`, time: 'Google Drive', color: 'gold' },
]

export const campaignCatalog = [
  {
    id: 'weston-healthcare-outreach',
    title: 'Weston Healthcare Outreach',
    category: 'Active',
    brief: 'Introduce OSAI intake and scheduling solutions to qualified healthcare targets across Weston.',
    description: 'A focused market-development campaign designed to move high-fit healthcare targets from initial outreach into discovery conversations around intake, scheduling, and operational workflow improvements.',
    activities: [
      { name: 'Target list', summary: 'Build and qualify the priority healthcare audience.', includes: ['Review market fit', 'Confirm decision-maker roles', 'Prioritize outreach order'] },
      { name: 'Outreach sequence', summary: 'Run a coordinated introduction across email and direct follow-up.', includes: ['Initial introduction', 'Value-led follow-up', 'Discovery invitation'] },
      { name: 'Campaign review', summary: 'Evaluate responses and advance qualified relationships.', includes: ['Response review', 'Status updates', 'Next-step assignments'] },
    ],
  },
  {
    id: 'business-services-development',
    title: 'Business Services Development',
    category: 'Planning',
    brief: 'Identify operationally complex service businesses that can benefit from connected workflows and automation.',
    description: 'A market-development campaign focused on business-service organizations with visible workflow friction, manual handoffs, or opportunities for better client intake and operational coordination.',
    activities: [
      { name: 'Segment refinement', summary: 'Narrow the market to the highest-potential categories.', includes: ['Category review', 'Fit criteria', 'Priority segment selection'] },
      { name: 'Message development', summary: 'Create an outreach message grounded in operational value.', includes: ['Problem framing', 'Offer alignment', 'Call-to-action design'] },
    ],
  },
  {
    id: 'technology-advisory-nurture',
    title: 'Technology Advisory Nurture',
    category: 'Nurture',
    brief: 'Maintain useful contact with organizations considering technology planning, AI adoption, or modernization.',
    description: 'A long-term nurture campaign for companies that are not ready to buy today but have an emerging need for technology planning, AI readiness, or modernization guidance.',
    activities: [
      { name: 'Insight series', summary: 'Share concise guidance that builds trust over time.', includes: ['Technology readiness insight', 'AI planning perspective', 'Roadmap example'] },
      { name: 'Readiness check-in', summary: 'Create a natural opportunity to reassess timing and priorities.', includes: ['Quarterly check-in', 'Priority review', 'Advisory invitation'] },
    ],
  },
]

const clientSeed = [
  { id: 1, name: 'Lumon Industries', initials: 'L', vertical: 'Manufacturing', category: 'Industrial Equipment', subcategory: 'Automation', status: 'Active', owner: 'Earl Powery', website: 'lumonindustries.com', lastActivity: '12 min ago', primary: { name: 'Natalie K.', title: 'VP of Operations', email: 'natalie.k@lumonindustries.com', phone: '(312) 555-0187' }, contacts: ['Jon Diaz', 'Rachel Stone', 'Mina Wu', 'Alex Lee', 'Sam Ortiz'] },
  { id: 2, name: 'Northstar Labs', initials: 'N', vertical: 'Technology', category: 'Software', subcategory: 'Data Intelligence', status: 'Active', owner: 'Earl Powery', website: 'northstarlabs.ai', lastActivity: 'Today, 2:30 PM', primary: { name: 'Avery Chen', title: 'Head of Product', email: 'avery@northstarlabs.ai', phone: '(415) 555-0122' }, contacts: ['Nina Ross', 'Theo Grant', 'Lee Park'] },
  { id: 3, name: 'Cedar & Stone', initials: 'C', vertical: 'Consumer Products', category: 'Home Goods', subcategory: 'Premium', status: 'Prospect', owner: 'Earl Powery', website: 'cedarandstone.co', lastActivity: 'Yesterday', primary: { name: 'Maya Brooks', title: 'Founder', email: 'maya@cedarandstone.co', phone: '(646) 555-0164' }, contacts: ['Drew Cole', 'Sara Kim'] },
  { id: 4, name: 'Atlas Robotics', initials: 'A', vertical: 'Manufacturing', category: 'Robotics', subcategory: 'Systems Integration', status: 'Active', owner: 'Earl Powery', website: 'atlasrobotics.com', lastActivity: 'Jun 2, 2026', primary: { name: 'Jon Bell', title: 'Director of Sales', email: 'jon@atlasrobotics.com', phone: '(512) 555-0191' }, contacts: ['Ari Lane', 'Mo Chen', 'Tess Ford', 'Kai Reed'] },
  { id: 5, name: 'Greenfield Energy', initials: 'G', vertical: 'Energy', category: 'Renewable', subcategory: 'Solar', status: 'Inactive', owner: 'Earl Powery', website: 'greenfield.energy', lastActivity: 'May 28, 2026', primary: { name: 'Lucas Grant', title: 'CEO', email: 'lucas@greenfield.energy', phone: '(720) 555-0176' }, contacts: ['Priya Shah', 'Owen West'] },
  { id: 6, name: 'Pioneer Health', initials: 'P', vertical: 'Healthcare', category: 'Providers', subcategory: 'Outpatient', status: 'Active', owner: 'Earl Powery', website: 'pioneerhealth.org', lastActivity: 'May 26, 2026', primary: { name: 'Dr. Sarah Patel', title: 'COO', email: 'spatel@pioneerhealth.org', phone: '(617) 555-0138' }, contacts: ['Mara Hill', 'Eli Ford', 'June Park'] },
]

const projectCatalog = ['Client Operations Transformation', 'Weston Growth Program', 'OSAI Website Launch', 'CRM Implementation']
const projectParts = ['Overview', 'Plan', 'Work', 'Decisions', 'Risks', 'Documents']
const userSeed = [
  { id: 1, firstName: 'Earl', lastName: 'Powery', email: 'epowery@icloud.com', role: 'Admin', status: 'Active', lastActive: 'Today, 12:46 PM', assignments: [{ project: 'Client Operations Transformation', scope: 'Entire project', parts: projectParts }] },
  { id: 2, firstName: 'nawlunz', lastName: ' ', email: 'nawlunz@me.com', role: 'Client', status: 'Active', lastActive: 'Current account', assignments: [] },
]

function Header({ onMenu, profile, onProfile, userRole }) {
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'OSAI User'
  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'OU'
  return (
    <header className="app-header pane">
      <div className="header-inner">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={19} /></button>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span>O</span></div>
          <div><strong>OSAI</strong><small>CONSULTING</small></div>
        </div>
        <div className="header-search">
          <Search size={16} />
          <input aria-label="Search CRM" placeholder="Search contacts, companies, deals..." />
          <kbd>⌘ K</kbd>
        </div>
        <div className="header-actions">
          <button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
          <button className="profile-button" onClick={onProfile} aria-label={`Open profile for ${displayName}`}>
            <span className="avatar">{initials}</span>
            <span className="profile-copy"><strong>{displayName}</strong><small>{userRole}</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}

function SignOutAction({ configured }) {
  if (!configured) return <button className="nav-item sign-out" onClick={() => { window.location.href = '/' }}><LogOut size={18} /><span>Sign out</span></button>
  return <SignOutButton redirectUrl="/"><button className="nav-item sign-out"><LogOut size={18} /><span>Sign out</span></button></SignOutButton>
}

function Sidebar({ active, setActive, open, close, campaignCount, configured, serviceCount, userCount, userRole }) {
  const availableNavItems = navItems.filter(item => userRole === 'Admin' || item.label !== 'Users')

  return (
    <aside className={`sidebar pane ${open ? 'open' : ''}`}>
      <div className="sidebar-inner">
        <div className="mobile-sidebar-head"><span>Navigation</span><button className="icon-button" onClick={close} aria-label="Close navigation"><X size={18} /></button></div>
        <p className="nav-label">Workspace</p>
        <nav aria-label="Main navigation">
          {availableNavItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); close() }}>
              <Icon size={18} />
              <span>{label}</span>
              {(label === 'Users' ? userCount : label === 'Services' ? serviceCount : label === 'Campaign' ? campaignCount : count) ? <em>{label === 'Users' ? userCount : label === 'Services' ? serviceCount : label === 'Campaign' ? campaignCount : count}</em> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="insight-card">
          <span className="insight-icon"><Sparkles size={15} /></span>
          <strong>OSAI Insight</strong>
          <p>Your proposal follow-ups are converting 18% faster this month.</p>
          <button>View insight <ArrowRight size={14} /></button>
        </div>
        <div className="settings-menu"><button className={`nav-item settings ${active === 'Settings' ? 'active' : ''}`} onClick={() => { setActive('Settings'); close() }}><Settings size={18} /><span>Settings</span></button></div>
        <div className="system-status"><span /> All systems operational</div>
      </div>
    </aside>
  )
}

function MetricCard({ label, value, note, icon: Icon, accent }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${accent}`}><Icon size={19} /></div>
      <div><p>{label}</p><strong>{value}</strong><small>{note}</small></div>
    </article>
  )
}

function Dashboard({ active, greetingName }) {
  const [filter, setFilter] = useState('All deals')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => opportunities.filter(item => item.company.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="content pane">
      <div className="content-inner">
        <section className="page-heading">
          <div><p className="eyebrow">{active}</p><h1>Good morning, {greetingName || 'there'}.</h1><p>Here’s what’s moving across your business today.</p></div>
          <button className="primary-button"><Plus size={17} /> Add opportunity</button>
        </section>

        <section className="metrics" aria-label="Business metrics">
          <MetricCard label="Active pipeline" value="$63,250" note="↑ 12.4% this month" icon={CircleDollarSign} accent="mint" />
          <MetricCard label="Open opportunities" value="7" note="3 need attention" icon={BriefcaseBusiness} accent="violet" />
          <MetricCard label="Upcoming meetings" value="5" note="Next: Today at 2:30" icon={CalendarDays} accent="gold" />
        </section>

        <section className="dashboard-grid">
          <article className="panel pipeline-panel">
            <div className="panel-head">
              <div><h2>Opportunity pipeline</h2><p>Current deals and next steps</p></div>
              <button className="quiet-button" onClick={() => setFilter(filter === 'All deals' ? 'Priority' : 'All deals')}>{filter} <ChevronDown size={14} /></button>
            </div>
            <div className="table-search"><Search size={15} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find an opportunity" aria-label="Find an opportunity" /></div>
            <div className="deal-list">
              <div className="deal-row table-labels"><span>Company</span><span>Stage</span><span>Value</span><span /></div>
              {visible.map((deal, index) => (
                <div className="deal-row" key={deal.company}>
                  <div className="company-cell"><span className={`company-logo logo-${index}`}>{deal.company[0]}</span><span><strong>{deal.company}</strong><small>{deal.contact}</small></span></div>
                  <span><em className={`stage ${deal.tone}`}>{deal.stage}</em></span>
                  <strong className="deal-value">{deal.value}</strong>
                  <button className="row-menu" aria-label={`More options for ${deal.company}`}><MoreHorizontal size={18} /></button>
                </div>
              ))}
            </div>
            <button className="view-all">View full pipeline <ArrowRight size={15} /></button>
          </article>

          <article className="panel activity-panel">
            <div className="panel-head"><div><h2>Recent activity</h2><p>Latest updates from your workspace</p></div></div>
            <div className="activity-list">
              {activity.map(({ icon: Icon, text, time, color }) => (
                <div className="activity-row" key={text}>
                  <span className={`activity-icon ${color}`}><Icon size={16} /></span>
                  <span><strong>{text}</strong><small><Clock3 size={12} /> {time}</small></span>
                </div>
              ))}
            </div>
            <button className="view-all">View all activity <ArrowRight size={15} /></button>
          </article>
        </section>
      </div>
    </main>
  )
}

function ClientForm({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', vertical: '', category: '', subcategory: '', contact: '', email: '' })
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const submit = event => {
    event.preventDefault()
    if (!form.name.trim() || !form.contact.trim()) return
    onCreate(form)
  }
  return <div className="crm-modal-backdrop" role="presentation"><section className="crm-modal" role="dialog" aria-modal="true" aria-labelledby="new-client-title"><header><div><h2 id="new-client-title">New client</h2><p>Create the company and its primary contact.</p></div><button className="row-menu" onClick={onClose} aria-label="Close new client form"><X size={18} /></button></header><form onSubmit={submit}><label>Company name<input required name="name" value={form.name} onChange={update} placeholder="Company name" /></label><div className="form-pair"><label>Industry vertical<input name="vertical" value={form.vertical} onChange={update} placeholder="Technology" /></label><label>Category<input name="category" value={form.category} onChange={update} placeholder="Software" /></label></div><label>Subcategory<input name="subcategory" value={form.subcategory} onChange={update} placeholder="Data intelligence" /></label><div className="form-pair"><label>Primary contact<input required name="contact" value={form.contact} onChange={update} placeholder="Full name" /></label><label>Email<input type="email" name="email" value={form.email} onChange={update} placeholder="name@company.com" /></label></div><footer><button type="button" className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Create client</button></footer></form></section></div>
}

function AddContactForm({ onCancel, onAdd }) {
  const [contact, setContact] = useState({ name: '', title: '', email: '' })
  const update = event => setContact(current => ({ ...current, [event.target.name]: event.target.value }))
  return <form className="add-contact-form" onSubmit={event => { event.preventDefault(); if (contact.name.trim()) onAdd(contact) }}><strong>Add contact</strong><input required name="name" value={contact.name} onChange={update} placeholder="Full name" /><input name="title" value={contact.title} onChange={update} placeholder="Title" /><input type="email" name="email" value={contact.email} onChange={update} placeholder="Email" /><div><button type="button" onClick={onCancel}>Cancel</button><button type="submit">Add</button></div></form>
}

function ClientDetail({ client, onAddContact }) {
  const [addingContact, setAddingContact] = useState(false)
  return <aside className="client-detail-pane"><header className="client-detail-head"><div className="company-cell"><span className="company-logo logo-0">{client.initials}</span><span><strong>{client.name}</strong><small>Client relationship</small></span></div><em className={`client-status ${client.status.toLowerCase()}`}>{client.status}</em></header><div className="client-detail-actions"><button><Pencil size={14} /> Edit company</button><button className="dark" onClick={() => setAddingContact(value => !value)}><Plus size={15} /> Add contact</button></div>{addingContact && <AddContactForm onCancel={() => setAddingContact(false)} onAdd={contact => { onAddContact(contact); setAddingContact(false) }} />}<section className="client-detail-section"><h3>Overview</h3><dl><div><dt><Globe2 size={14} /> Website</dt><dd>{client.website}</dd></div><div><dt><Building2 size={14} /> Industry vertical</dt><dd>{client.vertical}</dd></div><div><dt>Category</dt><dd>{client.category}</dd></div><div><dt>Subcategory</dt><dd>{client.subcategory}</dd></div><div><dt>Status</dt><dd><span className="status-dot" /> {client.status}</dd></div><div><dt><Users size={14} /> Relationship owner</dt><dd><i className="owner-avatar">EP</i>{client.owner}</dd></div></dl></section><section className="client-detail-section"><h3>Primary contact</h3><div className="primary-contact"><span>{client.primary.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><div><strong>{client.primary.name}</strong><small>{client.primary.title}</small><a href={`mailto:${client.primary.email}`}><Mail size={12} /> {client.primary.email}</a><a href={`tel:${client.primary.phone}`}><Phone size={12} /> {client.primary.phone}</a></div></div></section><section className="client-detail-section"><div className="section-title-row"><h3>Additional contacts ({client.contacts.length})</h3><button>View all</button></div><div className="contact-stack">{client.contacts.slice(0, 5).map(name => <span title={name} key={name}>{name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span>)}</div></section><section className="client-detail-section"><h3>Recent activity</h3><div className="mini-activity"><span><CheckCircle2 size={15} /></span><div><strong>Client record reviewed</strong><small>{client.lastActivity} by {client.owner}</small></div></div><div className="mini-activity"><span className="violet"><CalendarDays size={15} /></span><div><strong>Relationship check-in</strong><small>Next action assigned</small></div></div></section></aside>
}

function ClientsModule() {
  const [clients, setClients] = useState(clientSeed)
  const [selectedId, setSelectedId] = useState(clientSeed[0].id)
  const [query, setQuery] = useState('')
  const [vertical, setVertical] = useState('All')
  const [category, setCategory] = useState('All')
  const [subcategory, setSubcategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const values = key => ['All', ...new Set(clients.map(client => client[key]))]
  const visibleClients = clients.filter(client => {
    const matchesQuery = `${client.name} ${client.primary.name}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (vertical === 'All' || client.vertical === vertical) && (category === 'All' || client.category === category) && (subcategory === 'All' || client.subcategory === subcategory) && (status === 'All' || client.status === status)
  })
  const selected = clients.find(client => client.id === selectedId) || visibleClients[0] || clients[0]
  const createClient = form => {
    const next = { id: Date.now(), name: form.name.trim(), initials: form.name.trim()[0].toUpperCase(), vertical: form.vertical || 'Unassigned', category: form.category || 'Unassigned', subcategory: form.subcategory || 'Unassigned', status: 'Prospect', owner: 'Earl Powery', website: 'Website not added', lastActivity: 'Just now', primary: { name: form.contact.trim(), title: 'Primary contact', email: form.email || 'Email not added', phone: 'Phone not added' }, contacts: [] }
    setClients(current => [next, ...current]); setSelectedId(next.id); setShowForm(false)
  }
  const addContact = contact => setClients(current => current.map(client => client.id === selected.id ? { ...client, contacts: [...client.contacts, contact.name] } : client))
  return <main className="content pane clients-content"><div className="clients-layout"><section className="clients-workspace"><header className="clients-heading"><div><p className="eyebrow">Clients</p><h1>Clients</h1><p>Manage client organizations and relationships.</p></div><button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> New client</button></header><section className="client-summary" aria-label="Client summary"><span><Building2 size={18} /><small>Total clients</small><strong>{clients.length}</strong></span><span><CircleCheck size={18} /><small>Active</small><strong>{clients.filter(client => client.status === 'Active').length}</strong></span><span><Clock3 size={18} /><small>Prospects</small><strong>{clients.filter(client => client.status === 'Prospect').length}</strong></span><span><CircleCheck size={18} /><small>Inactive</small><strong>{clients.filter(client => client.status === 'Inactive').length}</strong></span></section><section className="clients-table-panel"><div className="client-filters"><label className="client-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search clients..." aria-label="Search clients" /></label>{[['Industry vertical', vertical, setVertical, values('vertical')], ['Category', category, setCategory, values('category')], ['Subcategory', subcategory, setSubcategory, values('subcategory')], ['Status', status, setStatus, ['All', 'Active', 'Prospect', 'Inactive']]].map(([label, value, setter, options]) => <label className="filter-select" key={label}><span>{label}</span><select value={value} onChange={event => setter(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}<button className="filter-button" onClick={() => { setVertical('All'); setCategory('All'); setSubcategory('All'); setStatus('All') }}><Filter size={14} /> Reset</button></div><div className="client-table"><div className="client-table-labels"><span>Company</span><span>Industry hierarchy</span><span>Primary contact</span><span>Contacts</span><span>Status</span><span>Last activity</span></div>{visibleClients.map((client, index) => <button className={`client-row ${selected.id === client.id ? 'selected' : ''}`} key={client.id} onClick={() => setSelectedId(client.id)}><span className="company-cell"><i className={`company-logo logo-${index % 4}`}>{client.initials}</i><strong>{client.name}</strong></span><span className="hierarchy-cell">{client.vertical} <b>›</b> {client.category} <b>›</b> {client.subcategory}</span><span><strong>{client.primary.name}</strong><small>{client.primary.title}</small></span><span>{client.contacts.length + 1} <Users size={13} /></span><span><em className={`client-status ${client.status.toLowerCase()}`}>{client.status}</em></span><span>{client.lastActivity}</span></button>)}{visibleClients.length === 0 && <div className="clients-empty">No clients match these filters.</div>}</div><footer className="clients-table-footer">Showing {visibleClients.length} of {clients.length} clients</footer></section></section><ClientDetail client={selected} onAddContact={addContact} /></div>{showForm && <ClientForm onClose={() => setShowForm(false)} onCreate={createClient} />}</main>
}

function CompanyEventSelector({ value, onSelect }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [customTargets, setCustomTargets] = useState([])
  useEffect(() => {
    const saved = window.localStorage.getItem('osai-custom-targets')
    if (saved) { try { setCustomTargets(JSON.parse(saved)) } catch {} }
  }, [])
  useEffect(() => { setQuery(value || '') }, [value])
  const companies = [...leadProspects, ...customTargets]
  const normalized = query.trim().toLowerCase()
  const matches = normalized ? companies.filter(company => company.name.toLowerCase().includes(normalized)).slice(0, 6) : companies.slice(0, 6)
  const suggestion = normalized ? companies.find(company => company.name.toLowerCase().startsWith(normalized)) || matches[0] : null
  const selected = companies.find(company => company.name.toLowerCase() === (value || '').toLowerCase())
  const choose = company => { setQuery(company.name); onSelect(company.name); setOpen(false) }
  const createTarget = () => {
    const name = query.trim()
    if (!name || !window.confirm(`Create New Target?\n\n${name}`)) return
    const target = { id: `custom-${Date.now()}`, name, vertical: 'Unassigned', category: 'Unassigned', subcategory: 'Unassigned', address: '', city: '', state: '', zip: '', stage: 'Target', offer: 'Offer not assigned', notes: '' }
    const next = [...customTargets, target]
    setCustomTargets(next)
    window.localStorage.setItem('osai-custom-targets', JSON.stringify(next))
    choose(target)
  }
  const confirmed = companies.some(company => company.name.toLowerCase() === normalized)
  return <div className="company-event-selector">
    <label>Company
      <span className="company-autocomplete">
        {suggestion && suggestion.name.toLowerCase().startsWith(normalized) && normalized && <span className="company-ghost"><b>{query}</b>{suggestion.name.slice(query.length)}</span>}
        <input value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); onSelect(''); setOpen(true) }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); if (suggestion) choose(suggestion); else createTarget() } }} placeholder="Company Name" autoComplete="off" />
      </span>
    </label>
    {open && query.trim() && <div className="company-suggestions">{matches.map(company => <button type="button" key={company.id} onMouseDown={event => event.preventDefault()} onClick={() => choose(company)}><strong>{company.name}</strong><small>{company.category || 'Unassigned'} · {[company.city, company.state].filter(Boolean).join(', ') || 'Location not available'}</small></button>)}{!confirmed && !matches.length && <button type="button" className="create-target-option" onMouseDown={event => event.preventDefault()} onClick={createTarget}><Plus size={13} /> Create New Target?</button>}</div>}
    {selected && <div className="selected-company-details"><strong>{selected.name}</strong><span>{selected.category || 'Unassigned'}</span><small>{[selected.address, selected.city, selected.state].filter(Boolean).join(', ') || 'Address not available'}</small></div>}
  </div>
}

function LeadDetail({ lead, onNotesChange, calendarItems, onSaveCalendarItem, onDeleteCalendarItem }) {
  const [tab, setTab] = useState('Main')
  const [editingCalendarItem, setEditingCalendarItem] = useState(null)
  const [contactsByCompany, setContactsByCompany] = useState({})
  const [editingContact, setEditingContact] = useState(null)
  useEffect(() => {
    const savedContacts = window.localStorage.getItem('osai-market-contacts')
    if (savedContacts) { try { setContactsByCompany(JSON.parse(savedContacts)) } catch {} }
  }, [])
  const headerAddress = [lead.address, lead.city].filter(Boolean).join(', ')
  const mainContact = [lead.mainContactFirstName, lead.mainContactLastName].filter(Boolean).join(' ')
  const companyUrl = lead.companyUrl || lead.website
  const companyPhone = lead.companyPhone || lead.phone
  const storedContacts = contactsByCompany[lead.id] || []
  const seedMainContact = mainContact ? [{ id: `seed-${lead.id}`, firstName: lead.mainContactFirstName, lastName: lead.mainContactLastName, email: lead.mainEmail || '', phone: lead.mainPhone || '', isMain: true, assignment: 'Company', project: '' }] : []
  const companyContacts = Object.hasOwn(contactsByCompany, lead.id) ? storedContacts : seedMainContact
  const companyName = lead.name.toLowerCase()
  const relatedCalendarItems = calendarItems
    .filter(item => {
      const related = (item.related || '').toLowerCase()
      return related && (related === companyName || companyName.includes(related) || related.includes(companyName))
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const tabs = ['Main', 'Contacts', 'Calendar', 'Campaigns', 'Offers']
  const saveCalendarItem = async event => {
    event.preventDefault()
    try {
      await onSaveCalendarItem(editingCalendarItem)
      setEditingCalendarItem(null)
    } catch (reason) { window.alert(reason.message) }
  }
  const deleteCalendarItem = async id => {
    try {
      await onDeleteCalendarItem(id)
      setEditingCalendarItem(null)
    } catch (reason) { window.alert(reason.message) }
  }
  const saveContact = event => {
    event.preventDefault()
    setContactsByCompany(current => {
      let contacts = current[lead.id] || seedMainContact
      if (editingContact.isMain) contacts = contacts.map(contact => ({ ...contact, isMain: false }))
      contacts = editingContact.id ? contacts.map(contact => contact.id === editingContact.id ? editingContact : contact) : [...contacts, { ...editingContact, id: Date.now() }]
      const next = { ...current, [lead.id]: contacts }
      window.localStorage.setItem('osai-market-contacts', JSON.stringify(next))
      return next
    })
    setEditingContact(null)
  }
  const deleteContact = id => {
    setContactsByCompany(current => {
      const next = { ...current, [lead.id]: (current[lead.id] || seedMainContact).filter(contact => contact.id !== id) }
      window.localStorage.setItem('osai-market-contacts', JSON.stringify(next))
      return next
    })
    setEditingContact(null)
  }
  return (
    <aside className="client-detail-pane market-company-rail">
      <header className="client-detail-head">
        <div className="company-rail-heading">
          <strong>{lead.name}</strong>
          <small>{lead.category}</small>
          <small className="company-rail-address">{headerAddress || 'Address not available'}</small>
        </div>
        <em className={`client-status stage-${lead.stage.toLowerCase()}`}>{lead.stage}</em>
      </header>
      <nav className="company-rail-nav" aria-label="Company details">
        {tabs.map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}
      </nav>
      {tab === 'Main' && <>
        <section className="client-detail-section">
          <h3>Classification</h3>
          <dl>
            <div><dt>Industry</dt><dd>{lead.vertical}</dd></div>
            <div><dt>Category</dt><dd>{lead.category}</dd></div>
            <div><dt>Subcategory</dt><dd>{lead.subcategory}</dd></div>
            <div><dt>Stage</dt><dd>{lead.stage}</dd></div>
          </dl>
        </section>
        <section className="client-detail-section">
          <h3>Company details</h3>
          <dl>
            <div><dt>Company URL</dt><dd>{companyUrl ? <a href={`https://${companyUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">{companyUrl}</a> : 'Not available'}</dd></div>
            <div><dt>Company email</dt><dd>{lead.companyEmail ? <a href={`mailto:${lead.companyEmail}`}>{lead.companyEmail}</a> : 'Not available'}</dd></div>
            <div><dt>Company phone</dt><dd>{companyPhone || 'Not available'}</dd></div>
          </dl>
        </section>
        <section className="client-detail-section">
          <h3>Notes</h3>
          <textarea className="lead-notes-editor" aria-label="Notes" value={lead.notes || ''} onChange={event => onNotesChange(event.target.value)} placeholder="Add notes about this company..." />
        </section>
      </>}
      {tab === 'Contacts' && <section className="client-detail-section company-contacts-list">
        {!editingContact ? <>
          <div className="company-tab-heading"><h3>Contacts</h3><button onClick={() => setEditingContact({ id: null, firstName: '', lastName: '', email: '', phone: '', isMain: companyContacts.length === 0, assignment: 'Company', project: '' })}><Plus size={12} /> Add</button></div>
          {companyContacts.length ? companyContacts.map(contact => <article key={contact.id} onClick={() => setEditingContact(contact)}><div><strong>{[contact.firstName, contact.lastName].filter(Boolean).join(' ')}</strong><small>{contact.isMain ? 'Main contact' : contact.assignment === 'Project' ? `Project contact · ${contact.project || 'Unassigned project'}` : 'Company contact'}</small><a href={`mailto:${contact.email}`}>{contact.email || 'Email not available'}</a><span>{contact.phone || 'Phone not available'}</span></div>{contact.isMain && <em>Main</em>}</article>) : <div className="company-tab-empty"><Users size={22} /><strong>No contacts</strong><span>Add the first contact for this company.</span></div>}
        </> : <form className="company-calendar-editor company-contact-editor" onSubmit={saveContact}>
          <div className="company-tab-heading"><h3>{editingContact.id ? 'Edit contact' : 'Add contact'}</h3>{editingContact.id && <button type="button" className="danger" onClick={() => deleteContact(editingContact.id)}>Delete</button>}</div>
          <div className="company-editor-pair"><label>First name<input required autoFocus value={editingContact.firstName} onChange={event => setEditingContact({ ...editingContact, firstName: event.target.value })} /></label><label>Last name<input required value={editingContact.lastName} onChange={event => setEditingContact({ ...editingContact, lastName: event.target.value })} /></label></div>
          <label>Email<input type="email" value={editingContact.email} onChange={event => setEditingContact({ ...editingContact, email: event.target.value })} /></label>
          <label>Phone<input value={editingContact.phone} onChange={event => setEditingContact({ ...editingContact, phone: event.target.value })} /></label>
          <label>Contact assignment<select value={editingContact.assignment} onChange={event => setEditingContact({ ...editingContact, assignment: event.target.value, project: event.target.value === 'Project' ? editingContact.project : '' })}><option>Company</option><option>Project</option></select></label>
          {editingContact.assignment === 'Project' && <label>Project<input required value={editingContact.project} onChange={event => setEditingContact({ ...editingContact, project: event.target.value })} placeholder="Project name" /></label>}
          <label className="main-contact-toggle"><input type="checkbox" checked={editingContact.isMain} onChange={event => setEditingContact({ ...editingContact, isMain: event.target.checked })} /> Main company contact</label>
          <footer><button type="button" onClick={() => setEditingContact(null)}>Cancel</button><button className="dark" type="submit">Save contact</button></footer>
        </form>}
      </section>}
      {tab === 'Calendar' && <section className="client-detail-section company-calendar-list">
        {!editingCalendarItem ? <>
          <div className="company-tab-heading"><h3>Calendar</h3><button onClick={() => setEditingCalendarItem({ id: null, type: 'Outreach', title: '', date: dateKey(new Date()), time: '', related: lead.name, notes: '' })}><Plus size={12} /> Add</button></div>
          {relatedCalendarItems.length ? relatedCalendarItems.map(item => <article className="company-calendar-item" key={item.id} onClick={() => setEditingCalendarItem(item)}>
            <div><strong>{item.title}</strong><small>{parseDateKey(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {formatTime(item.time)}</small><em>{calendarTypes[item.type]?.label || item.type}</em></div>
            <span className="company-calendar-actions"><button onClick={event => { event.stopPropagation(); setEditingCalendarItem(item) }}>Edit</button><i /> <button onClick={event => { event.stopPropagation(); deleteCalendarItem(item.id) }}>Delete</button></span>
          </article>) : <div className="company-tab-empty"><CalendarDays size={22} /><strong>No calendar items</strong><span>Schedule activity from this company or the Calendar module.</span></div>}
        </> : <form className="company-calendar-editor" onSubmit={saveCalendarItem}>
          <div className="company-tab-heading"><h3>{editingCalendarItem.id ? 'Edit event' : 'Add event'}</h3>{editingCalendarItem.id && <button type="button" className="danger" onClick={() => deleteCalendarItem(editingCalendarItem.id)}>Delete</button>}</div>
          <label>Status<select value={editingCalendarItem.type} onChange={event => setEditingCalendarItem({ ...editingCalendarItem, type: event.target.value })}>{Object.keys(calendarTypes).map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Title<input required autoFocus value={editingCalendarItem.title} onChange={event => setEditingCalendarItem({ ...editingCalendarItem, title: event.target.value })} /></label>
          <div className="company-editor-pair"><label>Date<input required type="date" value={editingCalendarItem.date} onChange={event => setEditingCalendarItem({ ...editingCalendarItem, date: event.target.value })} /></label><label>Time<input type="time" value={editingCalendarItem.time} onChange={event => setEditingCalendarItem({ ...editingCalendarItem, time: event.target.value })} /></label></div>
          <label>Company<input value={lead.name} readOnly aria-readonly="true" /></label>
          <label>Notes<textarea value={editingCalendarItem.notes || ''} onChange={event => setEditingCalendarItem({ ...editingCalendarItem, notes: event.target.value })} /></label>
          <footer><button type="button" onClick={() => setEditingCalendarItem(null)}>Cancel</button><button className="dark" type="submit">Save event</button></footer>
        </form>}
      </section>}
      {tab === 'Campaigns' && <section className="client-detail-section company-campaign-panel">
        <div className="company-tab-heading"><h3>Campaigns</h3></div>
        <div className="company-tab-empty"><Megaphone size={22} /><strong>No campaigns</strong><span>Create or assign a campaign for this company.</span></div>
      </section>}
      {tab === 'Offers' && <section className="client-detail-section company-offer-panel">
        <h3>Offers</h3>
        {lead.offer ? <article><small>Recommended offer</small><strong>{lead.offer}</strong><p>Use this offer as the starting point for outreach and qualification.</p></article> : <div className="company-tab-empty"><BriefcaseBusiness size={22} /><strong>No offer assigned</strong><span>Add an offer when this target is qualified.</span></div>}
      </section>}
    </aside>
  )
}
function LeadsModule() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [vertical, setVertical] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [stage, setStage] = useState('')
  const [notesById, setNotesById] = useState({})
  const [marketCalendarItems, setMarketCalendarItems] = useState([])
  const [customTargets, setCustomTargets] = useState([])
  const [selectedId, setSelectedId] = useState(leadProspects[0].id)
  useEffect(() => {
    workspaceRequest('/api/calendar-events').then(items => setMarketCalendarItems(normalizeCalendarItems(items))).catch(() => setMarketCalendarItems([]))
    const savedTargets = window.localStorage.getItem('osai-custom-targets')
    if (savedTargets) { try { setCustomTargets(JSON.parse(savedTargets)) } catch {} }
  }, [])
  const marketLeads = useMemo(() => [...leadProspects, ...customTargets].map(lead => ({ ...lead, stage: lead.stage || 'Target', location: [lead.city, lead.state].filter(Boolean).join(', ') })), [customTargets])
  const activeFilters = { location, vertical, category, subcategory, stage }
  const matchesQuery = lead => `${lead.name} ${lead.category} ${lead.subcategory} ${lead.city}`.toLowerCase().includes(query.toLowerCase())
  const optionsFor = key => [...new Set(marketLeads.filter(lead => matchesQuery(lead) && Object.entries(activeFilters).every(([filterKey, value]) => filterKey === key || !value || lead[filterKey] === value)).map(lead => lead[key]).filter(Boolean))].sort()
  const visible = marketLeads.filter(lead => `${lead.name} ${lead.category} ${lead.subcategory} ${lead.city}`.toLowerCase().includes(query.toLowerCase()) && (!location || lead.location === location) && (!vertical || lead.vertical === vertical) && (!category || lead.category === category) && (!subcategory || lead.subcategory === subcategory) && (!stage || lead.stage === stage))
  const selectedRecord = visible.find(lead => lead.id === selectedId) || visible[0] || marketLeads[0]
  const selected = { ...selectedRecord, notes: notesById[selectedRecord.id] ?? selectedRecord.notes }
  const marketFilters = [['Location', location, setLocation, optionsFor('location')], ['Industry', vertical, setVertical, optionsFor('vertical')], ['Category', category, setCategory, optionsFor('category')], ['Subcategory', subcategory, setSubcategory, optionsFor('subcategory')], ['Stage', stage, setStage, optionsFor('stage')]]
  const stageMetrics = [
    { label: 'Target', icon: Target },
    { label: 'Prospect', icon: UserRound },
    { label: 'Lead', icon: Users },
    { label: 'Opportunity', icon: BriefcaseBusiness },
  ]
  const marketStatusFor = lead => {
    const company = lead.name.toLowerCase()
    return marketCalendarItems
      .filter(item => item.related.toLowerCase() === company || company.includes(item.related.toLowerCase()) || item.related.toLowerCase().includes(company))
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))[0]?.type || 'Not Contacted'
  }
  const saveMarketCalendarItem = async item => {
    const saved = await workspaceRequest(item.id ? `/api/calendar-events/${item.id}` : '/api/calendar-events', { method: item.id ? 'PATCH' : 'POST', body: JSON.stringify(item) })
    setMarketCalendarItems(current => item.id ? current.map(existing => existing.id === item.id ? saved : existing) : [...current, saved])
  }
  const deleteMarketCalendarItem = async id => {
    await workspaceRequest(`/api/calendar-events/${id}`, { method: 'DELETE' })
    setMarketCalendarItems(current => current.filter(item => item.id !== id))
  }
  const resetFilters = () => { setQuery(''); setLocation(''); setVertical(''); setCategory(''); setSubcategory(''); setStage('') }
  return <main className="content pane clients-content"><div className="clients-layout"><section className="clients-workspace"><header className="clients-heading market-heading"><div><h1>Market Development</h1><p>Search and refine your market to identify the right targets, qualify opportunities, and advance relationships through the development stages from prospect to client. Build a focused pipeline that turns market potential into actionable business opportunities.</p></div><label className="client-search market-heading-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search market..." aria-label="Search market" /></label></header><section className="market-lifecycle" aria-label="Market development stages">{stageMetrics.map(({ label, icon: Icon }, index) => <React.Fragment key={label}><span className={index === 0 ? 'current' : ''}><i><Icon aria-hidden="true" size={16} /></i><span><strong>{label}</strong><small>{marketLeads.filter(lead => lead.stage === label).length.toLocaleString()}</small></span></span>{index < stageMetrics.length - 1 && <ArrowRight aria-hidden="true" size={18} />}</React.Fragment>)}</section><section className="market-filter-panel"><div className="market-filters">{marketFilters.map(([label, value, setter, choices]) => <label className={`market-filter ${value ? 'editing' : ''}`} key={label}><select aria-label={label} value={value} onChange={event => setter(event.target.value)}><option value="">{label}</option>{choices.map(choice => <option key={choice} value={choice}>{choice}</option>)}</select><ChevronDown aria-hidden="true" size={13} /></label>)}<span className="market-reset-divider" aria-hidden="true" /><button className="filter-button" onClick={resetFilters}>Reset</button></div></section><section className="clients-table-panel market-grid-panel"><div className="client-table market-table"><div className="client-table-labels"><span>Company</span><span>Industry hierarchy</span><span>Offer</span><span>Stage</span><span>Status</span></div>{visible.map((lead, index) => <button className={`client-row ${selected.id === lead.id ? 'selected' : ''}`} key={lead.id} onClick={() => setSelectedId(lead.id)}><span className="company-cell"><i className={`company-logo logo-${index % 4}`}>{lead.name[0]}</i><strong>{lead.name}</strong></span><span className="hierarchy-cell">{lead.vertical} <b>›</b> {lead.category} <b>›</b> {lead.subcategory}</span><span className="market-offer">{lead.offer}</span><span className="market-stage-cell"><em className="lead-priority">{lead.stage}</em></span><span className={`market-status status-${marketStatusFor(lead).toLowerCase().replace(/[^a-z]/g, '')}`}>{marketStatusFor(lead)}</span></button>)}{visible.length === 0 && <div className="clients-empty">No market records match these filters.</div>}</div><footer className="clients-table-footer">Showing {visible.length} of {marketLeads.length} market records</footer></section></section><LeadDetail lead={selected} onNotesChange={notes => setNotesById(current => ({ ...current, [selected.id]: notes }))} calendarItems={marketCalendarItems} onSaveCalendarItem={saveMarketCalendarItem} onDeleteCalendarItem={deleteMarketCalendarItem} /></div></main>
}

const calendarTypes = {
  'Not Contacted': { label: 'Not Contacted', icon: Target },
  Outreach: { label: 'Outreach', icon: Megaphone },
  Connected: { label: 'Connected', icon: Users },
  'Follow-Up': { label: 'Follow-Up', icon: ArrowRight },
  Scheduled: { label: 'Scheduled', icon: CalendarCheck2 },
  Active: { label: 'Active', icon: CheckCircle2 },
  Nurture: { label: 'Nurture', icon: Sparkles },
  Unresponsive: { label: 'Unresponsive', icon: Clock3 },
  Closed: { label: 'Closed', icon: CircleCheck },
}

const normalizeCalendarStatus = status => ({ Goal: 'Active', Appointment: 'Scheduled', 'Follow-up': 'Follow-Up' })[status] || (calendarTypes[status] ? status : 'Not Contacted')
const normalizeCalendarItems = items => items.map(item => ({ ...item, type: normalizeCalendarStatus(item.type) }))

const calendarSeed = [
  { id: 1, type: 'Active', title: 'Weekly pipeline goal', date: '2026-08-03', time: '', related: 'Market Development', notes: 'Qualify five new prospects.' },
  { id: 2, type: 'Outreach', title: 'Weston intro emails', date: '2026-08-04', time: '10:00', related: 'Weston targets', notes: 'Send the first outreach sequence.' },
  { id: 3, type: 'Scheduled', title: 'Discovery call', date: '2026-08-06', time: '14:30', related: 'Movac Hearing', notes: 'Review intake and scheduling needs.' },
  { id: 4, type: 'Follow-Up', title: 'Send proposal recap', date: '2026-08-07', time: '09:00', related: 'Weston Eye Care Center', notes: 'Confirm decision timeline and next step.' },
  { id: 5, type: 'Outreach', title: 'LinkedIn outreach', date: '2026-08-11', time: '11:30', related: 'Health & Medicine prospects', notes: '' },
  { id: 6, type: 'Scheduled', title: 'Project working session', date: '2026-08-13', time: '13:00', related: 'Client Operations Transformation', notes: 'Review milestone status.' },
  { id: 7, type: 'Active', title: 'Review monthly targets', date: '2026-08-17', time: '', related: 'OSAI Consulting', notes: '' },
  { id: 8, type: 'Follow-Up', title: 'Check in with decision maker', date: '2026-08-19', time: '15:00', related: 'Building New Pathways', notes: '' },
  { id: 9, type: 'Scheduled', title: 'Solution review', date: '2026-08-25', time: '10:30', related: 'Pediatric Associates', notes: '' },
]

const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const parseDateKey = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day) }
const formatTime = value => value ? new Date(`2000-01-01T${value}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'All day'

function CalendarModule() {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(dateKey(today))
  const [view, setView] = useState('Month')
  const [dragOver, setDragOver] = useState('')
  const [events, setEvents] = useState([])
  const [calendarError, setCalendarError] = useState('')
  const [editing, setEditing] = useState(null)
  useEffect(() => {
    workspaceRequest('/api/calendar-events').then(items => setEvents(normalizeCalendarItems(items))).catch(reason => setCalendarError(reason.message))
  }, [])
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = new Date(monthStart); gridStart.setDate(1 - monthStart.getDay())
  const monthDays = Array.from({ length: 42 }, (_, index) => { const date = new Date(gridStart); date.setDate(gridStart.getDate() + index); return date })
  const selectedDateObject = parseDateKey(selectedDate)
  const weekStart = new Date(selectedDateObject); weekStart.setDate(selectedDateObject.getDate() - selectedDateObject.getDay())
  const visibleDays = view === 'Month' ? monthDays : Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + index); return date })
  const selectedEvents = events.filter(item => item.date === selectedDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  const openNew = date => setEditing({ id: null, type: 'Not Contacted', title: '', date: date || selectedDate, time: '', related: '', notes: '' })
  const saveItem = async event => {
    event.preventDefault()
    if (!editing.related) { window.alert('Select a company or create a new target before saving.'); return }
    try {
      const saved = await workspaceRequest(editing.id ? `/api/calendar-events/${editing.id}` : '/api/calendar-events', { method: editing.id ? 'PATCH' : 'POST', body: JSON.stringify(editing) })
      setEvents(current => editing.id ? current.map(item => item.id === editing.id ? saved : item) : [...current, saved])
      setSelectedDate(saved.date)
      setEditing(null)
      setCalendarError('')
    } catch (reason) { setCalendarError(reason.message) }
  }
  const removeItem = async id => {
    try { await workspaceRequest(`/api/calendar-events/${id}`, { method: 'DELETE' }); setEvents(current => current.filter(item => item.id !== id)); setEditing(null); setCalendarError('') }
    catch (reason) { setCalendarError(reason.message) }
  }
  const moveItem = async (id, date) => {
    const item = events.find(event => event.id === id)
    if (!item) return
    try { const saved = await workspaceRequest(`/api/calendar-events/${id}`, { method: 'PATCH', body: JSON.stringify({ ...item, date }) }); setEvents(current => current.map(event => event.id === id ? saved : event)); setCalendarError('') }
    catch (reason) { setCalendarError(reason.message) }
  }
  const moveCursor = direction => setCursor(current => new Date(current.getFullYear(), current.getMonth() + direction, 1))
  const goToday = () => { const now = new Date(); setCursor(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(dateKey(now)) }
  return <main className="content pane calendar-content"><div className="calendar-shell"><section className="calendar-workspace"><header className="calendar-heading"><div><h1>Calendar</h1><p>Plan goals, outreach, appointments, and follow-ups.</p></div><button className="primary-button" onClick={() => openNew()}><Plus size={16} /> Add item</button></header><div className="calendar-toolbar"><div className="calendar-period"><button aria-label="Previous month" onClick={() => moveCursor(-1)}><ChevronLeft size={16} /></button><button aria-label="Next month" onClick={() => moveCursor(1)}><ChevronRight size={16} /></button><strong>{cursor.toLocaleDateString([], { month: 'long', year: 'numeric' })}</strong><button className="today-button" onClick={goToday}>Today</button></div><div className="calendar-legend">{Object.entries(calendarTypes).map(([type, meta]) => <span className={`calendar-type type-${type.toLowerCase().replace(/[^a-z]/g, '')}`} key={type}><i />{meta.label}</span>)}</div><div className="calendar-view-toggle"><button className={view === 'Month' ? 'active' : ''} onClick={() => setView('Month')}>Month</button><button className={view === 'Week' ? 'active' : ''} onClick={() => setView('Week')}>Week</button></div></div><section className={`calendar-grid view-${view.toLowerCase()}`}><div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{visibleDays.map(day => { const key = dateKey(day); const dayEvents = events.filter(item => item.date === key); const outside = view === 'Month' && day.getMonth() !== cursor.getMonth(); return <div className={`calendar-day ${outside ? 'outside' : ''} ${selectedDate === key ? 'selected' : ''} ${dragOver === key ? 'drop-target' : ''}`} key={key} onClick={() => setSelectedDate(key)} onDoubleClick={() => openNew(key)} onDragOver={event => { event.preventDefault(); setDragOver(key) }} onDragLeave={() => setDragOver('')} onDrop={event => { event.preventDefault(); moveItem(Number(event.dataTransfer.getData('text/plain')), key); setSelectedDate(key); setDragOver('') }}><button className="calendar-day-number" onClick={() => setSelectedDate(key)}>{day.getDate()}</button><div className="calendar-event-stack">{dayEvents.map(item => { const Icon = calendarTypes[item.type].icon; return <button draggable className={`calendar-event type-${item.type.toLowerCase().replace(/[^a-z]/g, '')}`} key={item.id} onDragStart={event => { event.dataTransfer.setData('text/plain', item.id); event.dataTransfer.effectAllowed = 'move' }} onClick={event => { event.stopPropagation(); setSelectedDate(key); setEditing(item) }}><Icon size={11} /><span>{item.time && <small>{formatTime(item.time)}</small>}{item.title}</span></button> })}</div>{dragOver === key && <span className="drop-copy">Drop here</span>}</div>})}</div></section></section><aside className="calendar-agenda">
        {editing ? <>
          <header><div><small>{editing.id ? 'Calendar item' : 'New calendar item'}</small><h2>{editing.id ? 'Edit event' : 'Add event'}</h2></div><button aria-label="Close editor" onClick={() => setEditing(null)}><X size={17} /></button></header>
          <section><form className="calendar-rail-editor company-calendar-editor" onSubmit={saveItem}>
            <label>Status<select value={editing.type} onChange={event => setEditing({ ...editing, type: event.target.value })}>{Object.keys(calendarTypes).map(type => <option key={type}>{type}</option>)}</select></label>
            <label>Title<input required autoFocus value={editing.title} onChange={event => setEditing({ ...editing, title: event.target.value })} placeholder="What needs to happen?" /></label>
            <div className="company-editor-pair"><label>Date<input required type="date" value={editing.date} onChange={event => setEditing({ ...editing, date: event.target.value })} /></label><label>Time<input type="time" value={editing.time} onChange={event => setEditing({ ...editing, time: event.target.value })} /></label></div>
            <CompanyEventSelector value={editing.related} onSelect={company => setEditing({ ...editing, related: company })} />
            <label>Notes<textarea value={editing.notes} onChange={event => setEditing({ ...editing, notes: event.target.value })} placeholder="Add context or next steps" /></label>
            <footer>{editing.id && <button type="button" className="delete-button" onClick={() => removeItem(editing.id)}><Trash2 size={13} /> Delete</button>}<button type="button" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="dark">Save event</button></footer>
          </form></section>
        </> : <>
          <header><div><small>{selectedDateObject.toLocaleDateString([], { weekday: 'long' })}</small><h2>{selectedDateObject.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</h2></div><button aria-label="Add item to selected day" onClick={() => openNew(selectedDate)}><Plus size={17} /></button></header>
          <section><h3>Schedule</h3>{selectedEvents.length ? selectedEvents.map(item => { const Icon = calendarTypes[item.type].icon; return <button className={`agenda-item type-${item.type.toLowerCase().replace(/[^a-z]/g, '')}`} key={item.id} onClick={() => setEditing(item)}><i><Icon size={14} /></i><span><small>{formatTime(item.time)} · {calendarTypes[item.type].label}</small><strong>{item.title}</strong><em>{item.related || 'No relationship added'}</em></span></button> }) : <div className="calendar-empty"><CalendarDays size={24} /><strong>No items scheduled</strong><span>Double-click a date or add an item.</span></div>}</section>
        </>}
      </aside></div></main>
}

function ServicesModule({ onCountChange }) {
  const [selectedId, setSelectedId] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [productAddOpen, setProductAddOpen] = useState(false)
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    workspaceRequest('/api/services').then(items => { setServices(items); onCountChange(items.length) }).catch(reason => setError(reason.message))
  }, [onCountChange])
  const selected = services.find(service => service.id === selectedId)
  const addService = async service => {
    try {
      const created = await workspaceRequest('/api/services', { method: 'POST', body: JSON.stringify(service) })
      setServices(current => [...current, created]); onCountChange(services.length + 1); setAddOpen(false); setSelectedId(created.id); setError('')
    } catch (reason) { setError(reason.message) }
  }
  const addProduct = async product => {
    try {
      const created = await workspaceRequest(`/api/services/${encodeURIComponent(selected.id)}/products`, { method: 'POST', body: JSON.stringify(product) })
      setServices(current => current.map(service => service.id === selected.id ? { ...service, products: [...service.products, created] } : service)); setProductAddOpen(false); setError('')
    } catch (reason) { setError(reason.message) }
  }

  if (selected) {
    return <main className="content pane services-content"><div className="content-inner service-detail">
      <button className="service-back" onClick={() => setSelectedId(null)}><ChevronLeft size={16} /> Services</button>
      <header className="service-detail-heading"><div className="service-detail-title"><div><h1>{selected.title}</h1><em>{selected.category}</em></div><button className="service-add" onClick={() => setProductAddOpen(true)}><Plus size={15} /> Add</button></div><p>{selected.description}</p></header>
      <section className="service-product-grid" aria-label={`${selected.title} products`}>
        {selected.products.map(product => <article key={product.name}>
          <h2>{product.name}</h2>
          <p>{product.summary}</p>
          <div><strong>Includes</strong><ul>{product.includes.map(item => <li key={item}>{item}</li>)}</ul></div>
          <footer><span><small>Format</small>{product.format}</span><span><small>Investment</small>{product.investment}</span></footer>
        </article>)}
      </section>{productAddOpen && <AddProductDialog serviceTitle={selected.title} onClose={() => setProductAddOpen(false)} onAdd={addProduct} />}
    </div></main>
  }

  return <main className="content pane services-content"><div className="content-inner"><header className="page-heading services-heading"><div><h1>Services</h1><p>Define, package, and manage the services OSAI brings to market.</p>{error && <small className="service-upload-error" role="alert">{error}</small>}</div><button className="service-add" onClick={() => setAddOpen(true)}><Plus size={15} /> Add</button></header><section className="workspace-services">{services.map(service => <article className="service-card" key={service.id} role="link" tabIndex={0} aria-label={`View ${service.title}`} onClick={() => setSelectedId(service.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(service.id) } }}><h2>{service.title}</h2><em>{service.category}</em><p>{service.brief}</p><div className="service-card-products"><strong>Products</strong><ul>{service.products.map(product => <li key={product.name}>{product.name}</li>)}</ul></div></article>)}</section>{addOpen && <AddServiceDialog onClose={() => setAddOpen(false)} onAdd={addService} />}</div></main>
}

function CampaignModule({ onCountChange }) {
  const [selectedId, setSelectedId] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    workspaceRequest('/api/campaigns').then(items => { setCampaigns(items); onCountChange(items.length) }).catch(reason => setError(reason.message))
  }, [onCountChange])
  useEffect(() => {
    if (!campaigns.length) return
    const requested = new URLSearchParams(window.location.search).get('campaign')
    if (requested && campaigns.some(campaign => campaign.id === requested)) setSelectedId(requested)
  }, [campaigns])
  const selected = campaigns.find(campaign => campaign.id === selectedId)
  const addCampaign = async campaign => {
    try {
      const created = await workspaceRequest('/api/campaigns', { method: 'POST', body: JSON.stringify(campaign) })
      setCampaigns(current => [...current, created]); onCountChange(campaigns.length + 1); setAddOpen(false); setSelectedId(created.id); setError('')
    } catch (reason) { setError(reason.message) }
  }
  if (selected) {
    return <CampaignBuilder campaign={selected} onBack={() => setSelectedId(null)} onSaved={saved => setCampaigns(current => current.map(item => item.id === saved.id ? saved : item))} />
  }
  return <main className="content pane services-content"><div className="content-inner"><header className="page-heading services-heading"><div><h1>Campaign</h1><p>Plan and manage focused activity that moves relationships through the market-development lifecycle.</p>{error && <small className="service-upload-error" role="alert">{error}</small>}</div><button className="service-add" onClick={() => setAddOpen(true)}><Plus size={15} /> Add</button></header><section className="workspace-services workspace-campaigns">{campaigns.map(campaign => <article className="service-card" key={campaign.id} role="link" tabIndex={0} aria-label={`View ${campaign.title}`} onClick={() => setSelectedId(campaign.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(campaign.id) } }}><h2>{campaign.title}</h2><em>{campaign.category}</em><p>{campaign.brief}</p><div className="service-card-products"><strong>Activities</strong><ul>{campaign.activities.map(item => <li key={item.name}>{item.name}</li>)}</ul></div></article>)}</section>{addOpen && <AddCampaignDialog onClose={() => setAddOpen(false)} onAdd={addCampaign} />}</div></main>
}

function AddCampaignDialog({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', objective: '', ownerName: 'Earl Powery' })
  const create = () => onAdd({ id: serviceSlug(form.title), title: form.title, category: 'Draft', brief: form.objective, description: form.objective, objective: form.objective, ownerName: form.ownerName, status: 'draft', activities: [], audience: defaultCampaignAudience(), workflow: defaultCampaignWorkflow(), schedule: defaultCampaignSchedule(), currentStep: 1 })
  return <div className="crm-modal-backdrop"><section className="crm-modal campaign-create-dialog" role="dialog" aria-modal="true" aria-labelledby="add-campaign-title"><header><div><h2 id="add-campaign-title">Create campaign</h2><p>Start with the campaign’s purpose and owner. Audience and outreach logic come next.</p></div><button className="row-menu" onClick={onClose} aria-label="Close campaign creation"><X size={18} /></button></header><div className="campaign-create-body"><label><span>Campaign name</span><input autoFocus value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="Campaign name" /></label><label><span>Objective</span><textarea value={form.objective} onChange={event => setForm(current => ({ ...current, objective: event.target.value }))} placeholder="What should this campaign accomplish?" /></label><label><span>Owner</span><input value={form.ownerName} onChange={event => setForm(current => ({ ...current, ownerName: event.target.value }))} /></label></div><footer><button type="button" className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!form.title.trim() || !form.objective.trim()} onClick={create}>Continue to audience</button></footer></section></div>
}

function AddServiceDialog({ onClose, onAdd }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const chooseFile = async event => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    setFile(nextFile)
    setError('')
    try { setPreview(parseUploadedService(await nextFile.text(), nextFile.name)) }
    catch (reason) { setPreview(null); setError(reason.message || 'Unable to read this document.') }
  }
  return <div className="crm-modal-backdrop"><section className="crm-modal service-upload-dialog" role="dialog" aria-modal="true" aria-labelledby="add-service-title"><header><div><h2 id="add-service-title">Add service</h2><p>Upload a structured service document to create its card and detail page.</p></div><button className="row-menu" onClick={onClose} aria-label="Close service upload"><X size={18} /></button></header><div className="service-upload-body"><label className="service-file-picker"><input type="file" accept=".md,.txt,.json,text/markdown,text/plain,application/json" onChange={chooseFile} /><span><Plus size={18} /><strong>{file ? file.name : 'Choose service document'}</strong><small>Markdown, plain text, or JSON</small></span></label>{error && <p className="service-upload-error" role="alert">{error}</p>}{preview && <article className="service-upload-preview"><small>Preview</small><h3>{preview.title}</h3><em>{preview.category}</em><p>{preview.brief}</p><span>{preview.products.length} product{preview.products.length === 1 ? '' : 's'}</span></article>}</div><footer><button type="button" className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!preview} onClick={() => onAdd(preview)}>Add service</button></footer></section></div>
}

function AddProductDialog({ serviceTitle, onClose, onAdd }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const chooseFile = async event => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    setFile(nextFile)
    setError('')
    try { setPreview(parseUploadedProduct(await nextFile.text(), nextFile.name)) }
    catch (reason) { setPreview(null); setError(reason.message || 'Unable to read this document.') }
  }
  return <div className="crm-modal-backdrop"><section className="crm-modal service-upload-dialog" role="dialog" aria-modal="true" aria-labelledby="add-product-title"><header><div><h2 id="add-product-title">Add product</h2><p>Upload a product document for {serviceTitle}.</p></div><button className="row-menu" onClick={onClose} aria-label="Close product upload"><X size={18} /></button></header><div className="service-upload-body"><label className="service-file-picker"><input type="file" accept=".md,.txt,.json,text/markdown,text/plain,application/json" onChange={chooseFile} /><span><Plus size={18} /><strong>{file ? file.name : 'Choose product document'}</strong><small>Markdown, plain text, or JSON</small></span></label>{error && <p className="service-upload-error" role="alert">{error}</p>}{preview && <article className="service-upload-preview"><small>Preview</small><h3>{preview.name}</h3><p>{preview.summary || 'No product summary provided.'}</p><span>{preview.includes.length} included item{preview.includes.length === 1 ? '' : 's'}</span></article>}</div><footer><button type="button" className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!preview} onClick={() => onAdd(preview)}>Add product</button></footer></section></div>
}

function UserAccessDetail({ user, onChange }) {
  const [role, setRole] = useState(user.role)
  const [project, setProject] = useState(user.assignments[0]?.project || projectCatalog[0])
  const [scope, setScope] = useState(user.assignments[0]?.scope || 'Entire project')
  const [parts, setParts] = useState(user.assignments[0]?.parts || projectParts)
  const [saved, setSaved] = useState('')
  const assignedProjects = new Set(user.assignments.map(item => item.project))
  const togglePart = part => setParts(current => current.includes(part) ? current.filter(item => item !== part) : [...current, part])
  const save = async () => {
    const assignments = [{ project, scope, parts: scope === 'Entire project' ? projectParts : parts }]
    setSaved('Saving…')
    try {
      await onChange({ ...user, role, assignments })
      setSaved('Access saved')
    } catch (error) {
      setSaved(error.message || 'Unable to save access')
    }
  }
  return <aside className="user-access-pane"><header><div className="user-identity"><span>{user.firstName[0]}{user.lastName[0]}</span><div><strong>{user.firstName} {user.lastName}</strong><small>{user.email}</small></div></div><em className={`user-status ${user.status.toLowerCase()}`}>{user.status}</em></header><section><label>Role<select value={role} onChange={event => setRole(event.target.value)}><option>Admin</option><option>OSAI-Admin</option><option>Client</option><option>Collaborator</option></select></label></section><section><h3>Assigned projects</h3><div className="project-checklist">{projectCatalog.map(item => <label key={item}><input type="checkbox" checked={item === project || assignedProjects.has(item)} onChange={() => setProject(item)} /><span>{item}</span></label>)}</div></section><section><h3>Project access</h3><label>Configure project<select value={project} onChange={event => setProject(event.target.value)}>{projectCatalog.map(item => <option key={item}>{item}</option>)}</select></label><div className="scope-options"><label><input type="radio" name="scope" checked={scope === 'Entire project'} onChange={() => setScope('Entire project')} /> Entire project</label><label><input type="radio" name="scope" checked={scope === 'Selected parts'} onChange={() => setScope('Selected parts')} /> Selected project parts</label></div>{scope === 'Selected parts' && <div className="part-grid">{projectParts.map(part => <label key={part}><input type="checkbox" checked={parts.includes(part)} onChange={() => togglePart(part)} /> {part}</label>)}</div>}</section><footer><span role="status">{saved}</span><button onClick={save}>Save access</button></footer></aside>
}

function InviteUserForm({ onClose, onInvite }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'Client' })
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  return <div className="crm-modal-backdrop"><section className="crm-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title"><header><div><h2 id="invite-title">Invite user</h2><p>Add a person and choose their initial workspace role.</p></div><button className="row-menu" onClick={onClose} aria-label="Close invite form"><X size={18} /></button></header><form onSubmit={event => { event.preventDefault(); onInvite(form) }}><div className="form-pair"><label>First name<input required name="firstName" value={form.firstName} onChange={update} /></label><label>Last name<input required name="lastName" value={form.lastName} onChange={update} /></label></div><label>Email<input required type="email" name="email" value={form.email} onChange={update} /></label><label>Role<select name="role" value={form.role} onChange={update}><option>Admin</option><option>OSAI-Admin</option><option>Client</option><option>Collaborator</option></select></label><footer><button type="button" className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button">Send invitation</button></footer></form></section></div>
}

function UsersModule({ initialUsers, configured }) {
  const sourceUsers = initialUsers.length ? initialUsers : userSeed
  const [usersState, setUsersState] = useState(sourceUsers)
  const [selectedId, setSelectedId] = useState(sourceUsers[0].id)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All')
  const [inviteOpen, setInviteOpen] = useState(false)
  const visible = usersState.filter(user => `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(query.toLowerCase()) && (role === 'All' || user.role === role))
  const selected = usersState.find(user => user.id === selectedId) || usersState[0]
  const updateUser = async next => {
    if (!configured) {
      setUsersState(current => current.map(user => user.id === next.id ? next : user))
      return
    }
    const response = await fetch(`/api/admin/users/${encodeURIComponent(next.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: next.role, assignments: next.assignments }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to save access')
    setUsersState(current => current.map(user => user.id === next.id ? { ...next, role: result.role, assignments: result.assignments } : user))
  }
  const invite = form => { const next = { id: Date.now(), ...form, status: 'Invited', lastActive: 'Invitation pending', assignments: [] }; setUsersState(current => [...current, next]); setSelectedId(next.id); setInviteOpen(false) }
  return <main className="content pane users-content"><div className="users-layout"><section className="users-workspace"><header className="clients-heading"><div><h1>Users</h1><p>Manage workspace access and project assignments.</p></div><button className="primary-button" onClick={() => setInviteOpen(true)}><Plus size={17} /> Invite user</button></header><section className="user-summary"><span><Users size={18} /><small>Total users</small><strong>{usersState.length}</strong></span><span><ShieldCheck size={18} /><small>Administrators</small><strong>{usersState.filter(user => ['Admin', 'OSAI-Admin'].includes(user.role)).length}</strong></span><span><UserRound size={18} /><small>Clients</small><strong>{usersState.filter(user => user.role === 'Client').length}</strong></span><span><UserCog size={18} /><small>Collaborators</small><strong>{usersState.filter(user => user.role === 'Collaborator').length}</strong></span></section><section className="users-table-panel"><div className="user-filters"><label className="client-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search users..." aria-label="Search users" /></label><label className="filter-select"><span>Role</span><select value={role} onChange={event => setRole(event.target.value)}><option>All</option><option>Admin</option><option>OSAI-Admin</option><option>Client</option><option>Collaborator</option></select></label></div><div className="user-table"><div className="user-table-labels"><span>User</span><span>Email</span><span>Role</span><span>Project access</span><span>Status</span><span>Last active</span></div>{visible.map(user => <button key={user.id} className={`user-row ${selected.id === user.id ? 'selected' : ''}`} onClick={() => setSelectedId(user.id)}><span className="user-identity"><i>{user.firstName[0]}{user.lastName[0]}</i><strong>{user.firstName} {user.lastName}</strong></span><span>{user.email}</span><span><em className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</em></span><span>{user.assignments.length} {user.assignments.length === 1 ? 'project' : 'projects'}</span><span><em className={`user-status ${user.status.toLowerCase()}`}>{user.status}</em></span><span>{user.lastActive}</span></button>)}</div><footer className="clients-table-footer">Showing {visible.length} of {usersState.length} users</footer></section></section><UserAccessDetail key={selected.id} user={selected} onChange={updateUser} /></div>{inviteOpen && <InviteUserForm onClose={() => setInviteOpen(false)} onInvite={invite} />}</main>
}

function ProfileForm({ profile, onSave, settings = false, configured = false }) {
  const [form, setForm] = useState(profile)
  const [status, setStatus] = useState('')
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async event => {
    event.preventDefault()
    setStatus('Saving…')
    try {
      await onSave({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), nickname: (form.nickname || '').trim(), email: form.email })
      setStatus('Profile saved')
    } catch (error) {
      setStatus(error.message || 'Unable to save profile')
    }
  }
  return <main className="content pane profile-content"><div className="settings-body"><section className="profile-module"><header><div><h1>{settings ? 'Settings' : 'Profile'}</h1><p>Manage your profile and OSAI workspace preferences.</p></div><span className="profile-large-avatar">{`${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || 'OU'}</span></header><form onSubmit={submit}><div className="profile-form-grid"><label>Nickname<input name="nickname" value={form.nickname} onChange={update} autoComplete="nickname" placeholder="Welcome name" /></label><label>First name<input required name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" /></label><label>Last name<input required name="lastName" value={form.lastName} onChange={update} autoComplete="family-name" /></label></div><label>Email address<input name="email" value={form.email} disabled aria-describedby="email-help" /></label><small id="email-help">Email is managed by your sign-in account.</small><footer><span role="status">{status}</span><button className="primary-button" type="submit">Save profile</button></footer></form></section>{settings && <section className="settings-account-section"><div><h2>Account</h2><p>End your current OSAI workspace session.</p></div><SignOutAction configured={configured} /></section>}</div></main>
}

function ClerkProfileModule({ profile, onSaved, settings, configured }) {
  return <ProfileForm profile={profile} settings={settings} configured={configured} onSave={async next => {
    const response = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to save profile')
    onSaved(result)
  }} />
}

function ProfileModule({ configured, profile, onSaved, settings = false }) {
  if (configured) return <ClerkProfileModule profile={profile} onSaved={onSaved} settings={settings} configured={configured} />
  return <ProfileForm profile={profile} settings={settings} configured={configured} onSave={async next => onSaved(next)} />
}


function Brand({ dark = false }) {
  return <div className={`brand ${dark ? '' : 'brand-light'}`}><div className="brand-mark" aria-hidden="true"><span>O</span></div><div><strong>OSAI</strong><small>CONSULTING</small></div></div>
}

const phases = [
  { name: 'Discover & align', owner: 'Earl Powery', initials: 'EP', date: 'Mar 18 – Mar 28', status: 'Complete', detail: 'Clarify goals, constraints, and success metrics.', deliverables: ['Project charter', 'Stakeholder map', 'Success metrics'] },
  { name: 'Design the system', owner: 'Nadia Khan', initials: 'NK', date: 'Mar 29 – Apr 21', status: 'Complete', detail: 'Define future state, workflows, and solution approach.', deliverables: ['Future state model', 'Workflow design', 'Implementation plan'] },
  { name: 'Build & validate', owner: 'Jon Diaz', initials: 'JD', date: 'Apr 22 – May 13', status: 'In progress', detail: 'Configure, develop, and test the solution in real conditions.', deliverables: ['Working solution', 'Test results', 'Validation report'] },
  { name: 'Launch & enable', owner: 'Sara Kim', initials: 'SK', date: 'May 14 – Jun 24', status: 'Upcoming', detail: 'Go live, support adoption, and hand over.', deliverables: ['Go-live checklist', 'Training & enablement', 'Support plan'] },
]

function ProjectHero() {
  return <div className="project-hero" aria-label="Project delivery workspace preview"><aside><Brand dark /><strong><LayoutDashboard size={14} /> Overview</strong><span><Workflow size={14} /> Plan</span><span><CheckCircle2 size={14} /> Work</span><span><CircleCheck size={14} /> Decisions</span><span><ShieldCheck size={14} /> Risks</span></aside><div className="project-hero-body"><div className="project-title"><div><small>Project</small><h3>Client Operations Transformation</h3><p>Unify systems, automate key workflows, and enable data-driven decisions.</p></div><b>68%<small>Complete</small></b></div><div className="phase-summary"><span><small>Current phase</small><strong>Build & validate</strong><em>● In progress</em></span><span><small>Phase progress</small><strong>68% complete</strong><i><b /></i></span></div><div className="milestone-line">{['Discover & align','Define & plan','Design solution','Build & validate','Pilot','Launch'].map((label,index)=><span className={index < 4 ? 'done' : ''} key={label}><i>{index < 3 ? '✓' : ''}</i><small>{label}</small></span>)}</div><div className="hero-project-footer"><span><strong>Owners</strong><small><i>EP</i> Earl Powery · Executive sponsor</small><small><i>NK</i> Nadia Khan · Project lead</small></span><span><strong>Top risk</strong><small>Legacy system dependency may impact integration timeline.</small><em>Mitigation · Sandbox in progress</em></span></div></div></div>
}

function ServicesSection() {
  return <section className="services-section" id="services"><h2>Strategy is only<br />valuable when it ships.</h2><div className="service-list">{serviceCatalog.map(service => { const Icon = serviceIcons[service.category] || Sparkles; return <article key={service.id}><span><Icon size={21} /></span><h3>{service.title}</h3><p>{service.brief}</p></article> })}</div></section>
}

function ProjectShowcase() {
  const [view, setView] = useState('Roadmap')
  const views = ['Roadmap', 'Weekly view', 'Decisions', 'Risks']
  return <section className="project-showcase" id="project-view"><div className="showcase-heading"><h2>See how your project stays on track.</h2><p>A shared operating view keeps scope, ownership, decisions, risks, and outcomes visible from kickoff through launch.</p></div><div className="view-tabs" role="tablist">{views.map(item=><button role="tab" aria-selected={view===item} className={view===item?'active':''} onClick={()=>setView(item)} key={item}>{item}</button>)}</div>{view==='Roadmap'?<RoadmapView />:<AlternateProjectView view={view} />}</section>
}

function RoadmapView() {
  return <div className="roadmap-layout"><div className="roadmap-table"><header><div><span className="roadmap-mark">O</span><span><strong>Client Operations Transformation</strong><small>Project roadmap</small></span></div><div className="roadmap-progress"><small>Overall progress</small><i><b /></i><strong>68%</strong></div></header><div className="roadmap-labels"><span>Phase</span><span>Owner</span><span>Date</span><span>Status</span><span>Deliverables</span></div>{phases.map((phase,index)=><div className={`phase-row ${phase.status==='In progress'?'selected':''}`} key={phase.name}><span className="phase-cell"><i className={`phase-node node-${index}`}>{index<2?'✓':''}</i><span><strong>{phase.name}</strong><small>{phase.detail}</small></span></span><span className="owner-cell"><i>{phase.initials}</i><span>{phase.owner}<small>{index===0?'Executive sponsor':index===1?'Project lead':index===2?'Delivery lead':'Change lead'}</small></span></span><span>{phase.date}</span><span className={`status-text status-${index}`}>● {phase.status}</span><span className="deliverables">{phase.deliverables.map(item=><small key={item}>• {item}</small>)}</span></div>)}</div><ProjectDetail /></div>
}

function ProjectDetail() {
  return <aside className="project-detail"><header><h3>Build & validate</h3><em>In progress</em></header><section><span><Target size={16} /></span><div><strong>Outcome</strong><p>A validated solution that meets user needs and operational requirements.</p></div></section><section><span><CalendarDays size={16} /></span><div><strong>This week</strong><ul><li>Complete workflow configuration</li><li>Execute end-to-end test scenarios</li><li>Prepare stakeholder review</li></ul></div></section><section><span><CircleCheck size={16} /></span><div><strong>Decision needed</strong><p>Confirm automation scope for Phase 2.</p></div></section><section className="risk"><span>!</span><div><strong>Top risk</strong><p>Integration complexity may delay validation.</p><small>Mitigation · Run integration tests early.</small></div></section></aside>
}

function AlternateProjectView({ view }) {
  const copy={ 'Weekly view':['This week’s delivery focus','Three workstreams are moving through validation with clear owners and Friday decision points.'], Decisions:['Decision log','Every material choice includes an owner, deadline, context, and impact on scope.'], Risks:['Risk register','Risks are surfaced early, scored by impact, and paired with a named mitigation owner.'] }
  return <div className="alternate-view"><span><Target size={28} /></span><h3>{copy[view][0]}</h3><p>{copy[view][1]}</p><button onClick={()=>{}}>Open {view.toLowerCase()}</button></div>
}

function SignedStatus({ configured, signedOut }) {
  if (!configured) return signedOut
  return <AuthenticatedStatus signedOut={signedOut} />
}

function AuthenticatedStatus({ signedOut }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded || !isSignedIn) return signedOut
  return <div className="landing-user"><a className="landing-admin-link" href="/account"><LayoutDashboard size={17} /> Open workspace</a><UserButton /></div>
}

export function Landing({ configured }) {
  const goToPreview = () => { window.location.href = '/admin?preview=1' }
  const SignInAction = ({ secondary = false }) => configured ? <SignInButton mode="modal" fallbackRedirectUrl="/account"><button className={secondary ? 'landing-admin-link' : 'landing-primary'}>{secondary && <LockKeyhole size={17} />}{secondary ? 'Client sign in' : 'Sign in'}</button></SignInButton> : <button className={secondary ? 'landing-admin-link' : 'landing-primary'} onClick={goToPreview}>{secondary && <LockKeyhole size={17} />}{secondary ? 'Client sign in' : 'Sign in'}</button>
  return (
    <div className="landing-page">
      <header className="landing-header"><Brand /><nav aria-label="Public navigation"><a href="#services">Services</a><a href="#how-we-work">How we work</a><a href="#project-view">Project view</a><a href="mailto:hello@osai-consulting.com">Contact</a></nav><SignedStatus configured={configured} signedOut={<SignInAction secondary />} /></header>
      <main>
        <section className="services-hero" id="how-we-work"><div className="services-hero-copy"><h1>Turn complex work<br />into clear forward motion.</h1><p>OSAI Consulting brings AI strategy, operational systems, and hands-on project leadership together—so your most important initiatives move from idea to measurable outcome.</p><div className="landing-actions"><a className="landing-primary" href="mailto:hello@osai-consulting.com?subject=Start%20an%20OSAI%20conversation">Start a conversation</a><a className="landing-secondary" href="#project-view">See how we deliver</a></div></div><div className="services-hero-visual"><ProjectHero /></div></section>
        <ServicesSection />
        <ProjectShowcase />
        <section className="consulting-cta"><Brand dark /><div><h2>Bring structure to the work that matters.</h2><p>Let’s turn your next initiative into a clear, accountable delivery plan.</p></div><a href="mailto:hello@osai-consulting.com?subject=Plan%20a%20working%20session">Plan a working session</a><SignedStatus configured={configured} signedOut={<SignInAction secondary />} /></section>
      </main>
      <footer className="landing-footer"><Brand /><span>AI strategy · Systems design · Project delivery</span><a href="mailto:hello@osai-consulting.com">hello@osai-consulting.com</a></footer>
    </div>
  )
}

export function AdminApp({ configured = false, userRole = 'Admin', initialProfile = { firstName: 'Earl', lastName: 'Powery', nickname: '', email: '' }, initialUsers = [] }) {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const [campaignCount, setCampaignCount] = useState(campaignCatalog.length)
  const [serviceCount, setServiceCount] = useState(serviceCatalog.length)
  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view')
    const allowedViews = [...navItems.filter(item => userRole === 'Admin' || item.label !== 'Users').map(item => item.label), 'Settings']
    if (requestedView && allowedViews.includes(requestedView)) setActive(requestedView)
  }, [userRole])
  useEffect(() => {
    if (!configured) return
    const keys = ['osai-calendar-items', 'osai-custom-services-v1', 'osai-service-products-v1', 'osai-custom-campaigns-v1']
    const payload = Object.fromEntries(keys.map(key => {
      try { return [key, JSON.parse(window.localStorage.getItem(key) || 'null')] } catch { return [key, null] }
    }))
    if (!keys.some(key => payload[key] && Object.keys(payload[key]).length)) return
    workspaceRequest('/api/workspace/import', { method: 'POST', body: JSON.stringify(payload) }).then(result => {
      if (!result.imported) return
      keys.forEach(key => window.localStorage.removeItem(key))
      window.location.reload()
    }).catch(() => {})
  }, [configured])
  return (
    <div className="app-shell">
      <Header onMenu={() => setMenuOpen(true)} profile={profile} onProfile={() => setActive('Settings')} userRole={userRole} />
      <Sidebar active={active} setActive={setActive} open={menuOpen} close={() => setMenuOpen(false)} campaignCount={campaignCount} configured={configured} serviceCount={serviceCount} userCount={initialUsers.length || userSeed.length} userRole={userRole} />
      {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      {active === 'Market' ? <LeadsModule /> : active === 'Campaign' ? <CampaignModule onCountChange={setCampaignCount} /> : active === 'Services' ? <ServicesModule onCountChange={setServiceCount} /> : active === 'Calendar' ? <CalendarModule /> : active === 'Users' && userRole === 'Admin' ? <UsersModule initialUsers={initialUsers} configured={configured} /> : active === 'Settings' ? <ProfileModule configured={configured} profile={profile} onSaved={setProfile} settings /> : <Dashboard active={active === 'Users' ? 'Overview' : active} greetingName={profile.nickname || profile.firstName} />}
    </div>
  )
}
