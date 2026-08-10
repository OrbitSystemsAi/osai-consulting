'use client'

import React, { useMemo, useState } from 'react'
import { SignInButton, SignOutButton, UserButton, useAuth, useUser } from '@clerk/nextjs'
import { leadProspects } from './leads'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
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
  UserRound,
  Users,
  Workflow,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Contacts', icon: Users, count: 128 },
  { label: 'Companies', icon: Building2 },
  { label: 'Clients', icon: Layers3, count: 48 },
  { label: 'Leads & Prospects', icon: Target, count: leadProspects.length },
  { label: 'Pipeline', icon: BriefcaseBusiness, count: 7 },
  { label: 'Calendar', icon: CalendarDays },
]

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

const clientSeed = [
  { id: 1, name: 'Lumon Industries', initials: 'L', vertical: 'Manufacturing', category: 'Industrial Equipment', subcategory: 'Automation', status: 'Active', owner: 'Earl Powery', website: 'lumonindustries.com', lastActivity: '12 min ago', primary: { name: 'Natalie K.', title: 'VP of Operations', email: 'natalie.k@lumonindustries.com', phone: '(312) 555-0187' }, contacts: ['Jon Diaz', 'Rachel Stone', 'Mina Wu', 'Alex Lee', 'Sam Ortiz'] },
  { id: 2, name: 'Northstar Labs', initials: 'N', vertical: 'Technology', category: 'Software', subcategory: 'Data Intelligence', status: 'Active', owner: 'Earl Powery', website: 'northstarlabs.ai', lastActivity: 'Today, 2:30 PM', primary: { name: 'Avery Chen', title: 'Head of Product', email: 'avery@northstarlabs.ai', phone: '(415) 555-0122' }, contacts: ['Nina Ross', 'Theo Grant', 'Lee Park'] },
  { id: 3, name: 'Cedar & Stone', initials: 'C', vertical: 'Consumer Products', category: 'Home Goods', subcategory: 'Premium', status: 'Prospect', owner: 'Earl Powery', website: 'cedarandstone.co', lastActivity: 'Yesterday', primary: { name: 'Maya Brooks', title: 'Founder', email: 'maya@cedarandstone.co', phone: '(646) 555-0164' }, contacts: ['Drew Cole', 'Sara Kim'] },
  { id: 4, name: 'Atlas Robotics', initials: 'A', vertical: 'Manufacturing', category: 'Robotics', subcategory: 'Systems Integration', status: 'Active', owner: 'Earl Powery', website: 'atlasrobotics.com', lastActivity: 'Jun 2, 2026', primary: { name: 'Jon Bell', title: 'Director of Sales', email: 'jon@atlasrobotics.com', phone: '(512) 555-0191' }, contacts: ['Ari Lane', 'Mo Chen', 'Tess Ford', 'Kai Reed'] },
  { id: 5, name: 'Greenfield Energy', initials: 'G', vertical: 'Energy', category: 'Renewable', subcategory: 'Solar', status: 'Inactive', owner: 'Earl Powery', website: 'greenfield.energy', lastActivity: 'May 28, 2026', primary: { name: 'Lucas Grant', title: 'CEO', email: 'lucas@greenfield.energy', phone: '(720) 555-0176' }, contacts: ['Priya Shah', 'Owen West'] },
  { id: 6, name: 'Pioneer Health', initials: 'P', vertical: 'Healthcare', category: 'Providers', subcategory: 'Outpatient', status: 'Active', owner: 'Earl Powery', website: 'pioneerhealth.org', lastActivity: 'May 26, 2026', primary: { name: 'Dr. Sarah Patel', title: 'COO', email: 'spatel@pioneerhealth.org', phone: '(617) 555-0138' }, contacts: ['Mara Hill', 'Eli Ford', 'June Park'] },
]

function Header({ onMenu, profile, onProfile }) {
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
            <span className="profile-copy"><strong>{displayName}</strong><small>Administrator</small></span>
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

function Sidebar({ active, setActive, open, close, configured }) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <aside className={`sidebar pane ${open ? 'open' : ''}`}>
      <div className="sidebar-inner">
        <div className="mobile-sidebar-head"><span>Navigation</span><button className="icon-button" onClick={close} aria-label="Close navigation"><X size={18} /></button></div>
        <p className="nav-label">Workspace</p>
        <nav aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); close() }}>
              <Icon size={18} />
              <span>{label}</span>
              {count && <em>{count}</em>}
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
        <div className={`settings-menu ${settingsOpen ? 'open' : ''}`}>
          <button
            className="nav-item settings"
            aria-expanded={settingsOpen}
            aria-controls="settings-actions"
            onClick={() => setSettingsOpen(value => !value)}
          >
            <Settings size={18} />
            <span>Settings</span>
            <ChevronDown className="settings-chevron" size={15} />
          </button>
          {settingsOpen && <div className="settings-actions" id="settings-actions"><button className="nav-item" onClick={() => { setActive('Profile'); close() }}><UserRound size={18} /><span>Profile</span></button><SignOutAction configured={configured} /></div>}
        </div>
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

function Dashboard({ active, firstName }) {
  const [filter, setFilter] = useState('All deals')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => opportunities.filter(item => item.company.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="content pane">
      <div className="content-inner">
        <section className="page-heading">
          <div><p className="eyebrow">{active}</p><h1>Good morning, {firstName || 'there'}.</h1><p>Here’s what’s moving across your business today.</p></div>
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

function LeadDetail({ lead }) {
  const address = [lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ')
  return <aside className="client-detail-pane"><header className="client-detail-head"><div className="company-cell"><span className="company-logo logo-1">{lead.name[0]}</span><span><strong>{lead.name}</strong><small>{lead.priority}</small></span></div><em className="client-status prospect">Prospect</em></header><div className="client-detail-actions">{lead.website && <a href={`https://${lead.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"><Globe2 size={14} /> Website</a>}{lead.phone && <a className="dark" href={`tel:${lead.phone}`}><Phone size={15} /> Call</a>}</div><section className="lead-offer"><small>Suggested wedge offer</small><strong>{lead.offer}</strong></section><section className="client-detail-section"><h3>Classification</h3><dl><div><dt>Industry vertical</dt><dd>{lead.vertical}</dd></div><div><dt>Category</dt><dd>{lead.category}</dd></div><div><dt>Subcategory</dt><dd>{lead.subcategory}</dd></div><div><dt>Priority</dt><dd>{lead.priority}</dd></div></dl></section><section className="client-detail-section"><h3>Contact details</h3><dl><div><dt><Building2 size={14} /> Address</dt><dd>{address || 'Not available'}</dd></div><div><dt><Phone size={14} /> Phone</dt><dd>{lead.phone || 'Not available'}</dd></div><div><dt><Globe2 size={14} /> Website</dt><dd>{lead.website || 'Not available'}</dd></div><div><dt>Source</dt><dd>{lead.source}</dd></div></dl></section><section className="client-detail-section"><h3>Research notes</h3><p className="lead-note">{lead.notes || 'No additional notes.'}</p></section></aside>
}

function LeadsModule() {
  const [query, setQuery] = useState('')
  const [vertical, setVertical] = useState('All')
  const [category, setCategory] = useState('All')
  const [priority, setPriority] = useState('All')
  const [selectedId, setSelectedId] = useState(leadProspects[0].id)
  const options = key => ['All', ...new Set(leadProspects.map(lead => lead[key]).filter(Boolean))]
  const visible = leadProspects.filter(lead => `${lead.name} ${lead.category} ${lead.subcategory} ${lead.city}`.toLowerCase().includes(query.toLowerCase()) && (vertical === 'All' || lead.vertical === vertical) && (category === 'All' || lead.category === category) && (priority === 'All' || lead.priority === priority))
  const selected = leadProspects.find(lead => lead.id === selectedId) || visible[0] || leadProspects[0]
  return <main className="content pane clients-content"><div className="clients-layout"><section className="clients-workspace"><header className="clients-heading"><div><p className="eyebrow">Business development</p><h1>Leads & Prospects</h1><p>Weston prospects ingested from the Google Drive research list.</p></div><span className="source-chip">Source · Google Drive</span></header><section className="client-summary" aria-label="Lead summary"><span><Target size={18} /><small>Total leads</small><strong>{leadProspects.length}</strong></span><span><ArrowUpRight size={18} /><small>Priority 1</small><strong>{leadProspects.filter(lead => lead.priority === 'Priority 1').length}</strong></span><span><Building2 size={18} /><small>Categories</small><strong>{new Set(leadProspects.map(lead => lead.category)).size}</strong></span><span><Globe2 size={18} /><small>With website</small><strong>{leadProspects.filter(lead => lead.website).length}</strong></span></section><section className="clients-table-panel"><div className="client-filters"><label className="client-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search leads..." aria-label="Search leads" /></label>{[['Industry vertical', vertical, setVertical, options('vertical')], ['Category', category, setCategory, options('category')], ['Priority', priority, setPriority, options('priority')]].map(([label, value, setter, choices]) => <label className="filter-select" key={label}><span>{label}</span><select value={value} onChange={event => setter(event.target.value)}>{choices.map(choice => <option key={choice}>{choice}</option>)}</select></label>)}<button className="filter-button" onClick={() => { setQuery(''); setVertical('All'); setCategory('All'); setPriority('All') }}><Filter size={14} /> Reset</button></div><div className="client-table"><div className="client-table-labels"><span>Company</span><span>Industry hierarchy</span><span>Location</span><span>Phone</span><span>Priority</span><span>Source</span></div>{visible.map((lead, index) => <button className={`client-row ${selected.id === lead.id ? 'selected' : ''}`} key={lead.id} onClick={() => setSelectedId(lead.id)}><span className="company-cell"><i className={`company-logo logo-${index % 4}`}>{lead.name[0]}</i><strong>{lead.name}</strong></span><span className="hierarchy-cell">{lead.vertical} <b>›</b> {lead.category} <b>›</b> {lead.subcategory}</span><span>{lead.city}, {lead.state}<small>{lead.zip}</small></span><span>{lead.phone || 'Not available'}</span><span><em className="lead-priority">{lead.priority}</em></span><span>{lead.source}</span></button>)}{visible.length === 0 && <div className="clients-empty">No prospects match these filters.</div>}</div><footer className="clients-table-footer">Showing {visible.length} of {leadProspects.length} leads and prospects</footer></section></section><LeadDetail lead={selected} /></div></main>
}

function ProfileForm({ profile, onSave }) {
  const [form, setForm] = useState(profile)
  const [status, setStatus] = useState('')
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async event => {
    event.preventDefault()
    setStatus('Saving…')
    try {
      await onSave({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email })
      setStatus('Profile saved')
    } catch {
      setStatus('Unable to save profile')
    }
  }
  return <main className="content pane profile-content"><section className="profile-module"><header><div><h1>Profile</h1><p>Manage the name connected to your OSAI workspace.</p></div><span className="profile-large-avatar">{`${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || 'OU'}</span></header><form onSubmit={submit}><div className="profile-form-grid"><label>First name<input required name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" /></label><label>Last name<input required name="lastName" value={form.lastName} onChange={update} autoComplete="family-name" /></label></div><label>Email address<input name="email" value={form.email} disabled aria-describedby="email-help" /></label><small id="email-help">Email is managed by your sign-in account.</small><footer><span role="status">{status}</span><button className="primary-button" type="submit">Save profile</button></footer></form></section></main>
}

function ClerkProfileModule({ profile, onSaved }) {
  const { user } = useUser()
  return <ProfileForm profile={profile} onSave={async next => { await user.update({ firstName: next.firstName, lastName: next.lastName }); onSaved(next) }} />
}

function ProfileModule({ configured, profile, onSaved }) {
  if (configured) return <ClerkProfileModule profile={profile} onSaved={onSaved} />
  return <ProfileForm profile={profile} onSave={async next => onSaved(next)} />
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
  const services = [{ icon: BrainCircuit, title: 'AI strategy', text: 'Find the right use cases and build a practical roadmap.' },{ icon: Workflow, title: 'Systems & workflow design', text: 'Replace friction with connected, scalable operations.' },{ icon: ArrowUpRight, title: 'Project delivery', text: 'Create momentum with clear ownership, cadence, and decisions.' }]
  return <section className="services-section" id="services"><h2>Strategy is only<br />valuable when it ships.</h2><div className="service-list">{services.map(({icon:Icon,title,text})=><article key={title}><span><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
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

export function AdminApp({ configured = false, initialProfile = { firstName: 'Earl', lastName: 'Powery', email: '' } }) {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  return (
    <div className="app-shell">
      <Header onMenu={() => setMenuOpen(true)} profile={profile} onProfile={() => setActive('Profile')} />
      <Sidebar active={active} setActive={setActive} open={menuOpen} close={() => setMenuOpen(false)} configured={configured} />
      {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      {active === 'Clients' ? <ClientsModule /> : active === 'Leads & Prospects' ? <LeadsModule /> : active === 'Profile' ? <ProfileModule configured={configured} profile={profile} onSaved={setProfile} /> : <Dashboard active={active} firstName={profile.firstName} />}
    </div>
  )
}
