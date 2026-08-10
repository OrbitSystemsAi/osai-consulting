'use client'

import React, { useMemo, useState } from 'react'
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs'
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Contacts', icon: Users, count: 128 },
  { label: 'Companies', icon: Building2 },
  { label: 'Pipeline', icon: BriefcaseBusiness, count: 7 },
  { label: 'Calendar', icon: CalendarDays },
]

const opportunities = [
  { company: 'Lumon Industries', contact: 'Natalie K.', value: '$18,500', stage: 'Proposal', tone: 'violet' },
  { company: 'Northstar Labs', contact: 'Avery Chen', value: '$12,000', stage: 'Discovery', tone: 'blue' },
  { company: 'Cedar & Stone', contact: 'Maya Brooks', value: '$8,750', stage: 'Review', tone: 'amber' },
  { company: 'Atlas Robotics', contact: 'Jon Bell', value: '$24,000', stage: 'Qualified', tone: 'green' },
]

const activity = [
  { icon: CheckCircle2, text: 'Proposal sent to Lumon Industries', time: '12 min ago', color: 'mint' },
  { icon: CalendarDays, text: 'Discovery call with Northstar Labs', time: 'Today, 2:30 PM', color: 'violet' },
  { icon: Users, text: 'Maya Brooks added as a new contact', time: 'Yesterday', color: 'gold' },
]

function Header({ onMenu }) {
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
          <button className="profile-button">
            <span className="avatar">EP</span>
            <span className="profile-copy"><strong>Earl Powery</strong><small>Administrator</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}

function Sidebar({ active, setActive, open, close }) {
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
        <button className="nav-item settings"><Settings size={18} /><span>Settings</span></button>
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

function Dashboard({ active }) {
  const [filter, setFilter] = useState('All deals')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => opportunities.filter(item => item.company.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="content pane">
      <div className="content-inner">
        <section className="page-heading">
          <div><p className="eyebrow">{active}</p><h1>Good morning, Earl.</h1><p>Here’s what’s moving across your business today.</p></div>
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

function Brand({ dark = false }) {
  return <div className={`brand ${dark ? '' : 'brand-light'}`}><div className="brand-mark" aria-hidden="true"><span>O</span></div><div><strong>OSAI</strong><small>CONSULTING</small></div></div>
}

function AdminPreview() {
  return (
    <div className="landing-preview" aria-label="Preview of the OSAI admin workspace">
      <div className="preview-top"><Brand dark /><div className="preview-search"><Search size={11} /> Search contacts, companies, deals...</div><span className="preview-user">EP</span></div>
      <div className="preview-layout">
        <div className="preview-nav"><span className="preview-label">Workspace</span><strong><LayoutDashboard size={11} /> Overview</strong><span><Users size={11} /> Contacts</span><span><Building2 size={11} /> Companies</span><span><BriefcaseBusiness size={11} /> Pipeline</span></div>
        <div className="preview-body">
          <div className="preview-heading"><div><small>Overview</small><h3>Good morning, Earl.</h3></div><b>+ Add opportunity</b></div>
          <div className="preview-metrics"><span><small>Active pipeline</small><strong>$63,250</strong></span><span><small>Open opportunities</small><strong>7</strong></span><span><small>Upcoming meetings</small><strong>5</strong></span></div>
          <div className="preview-panels"><div><strong>Opportunity pipeline</strong>{opportunities.slice(0, 3).map(item => <span key={item.company}><i>{item.company[0]}</i>{item.company}<small>{item.value}</small></span>)}</div><div><strong>Recent activity</strong>{activity.slice(0, 2).map(item => <span key={item.text}>{item.text}</span>)}</div></div>
        </div>
      </div>
    </div>
  )
}

function SignedStatus({ configured, signedOut }) {
  if (!configured) return signedOut
  return <AuthenticatedStatus signedOut={signedOut} />
}

function AuthenticatedStatus({ signedOut }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded || !isSignedIn) return signedOut
  return <div className="landing-user"><a className="landing-admin-link" href="/admin"><LayoutDashboard size={17} /> Open admin</a><UserButton /></div>
}

export function Landing({ configured }) {
  const goToPreview = () => { window.location.href = '/admin?preview=1' }
  const SignInAction = ({ secondary = false }) => configured ? <SignInButton mode="modal" fallbackRedirectUrl="/admin"><button className={secondary ? 'landing-admin-link' : 'landing-primary'}>{secondary && <LockKeyhole size={17} />}{secondary ? 'Admin access' : 'Sign in'}</button></SignInButton> : <button className={secondary ? 'landing-admin-link' : 'landing-primary'} onClick={goToPreview}>{secondary && <LockKeyhole size={17} />}{secondary ? 'Admin access' : 'Sign in'}</button>
  return (
    <div className="landing-page">
      <header className="landing-header"><Brand /><nav aria-label="Public navigation"><a href="#approach">Approach</a><a href="#capabilities">Capabilities</a><a href="mailto:hello@osai-consulting.com">Contact</a></nav><SignedStatus configured={configured} signedOut={<SignInAction secondary />} /></header>
      <main className="landing-main">
        <section className="landing-copy" id="approach"><h1>Clarity for every<br />client relationship.</h1><p>One secure workspace for opportunities, relationships, and the work that moves your business forward.</p><div className="landing-actions"><SignInAction /><a className="landing-secondary" href="mailto:hello@osai-consulting.com?subject=OSAI%20CRM%20access%20request">Request access</a></div>{!configured && <p className="preview-note"><ShieldCheck size={14} /> Local preview mode · Connect Clerk to enable live sign-in</p>}</section>
        <section className="landing-visual" id="capabilities"><AdminPreview /></section>
      </main>
      <footer className="landing-footer"><LockKeyhole size={15} /> Private workspace <span>·</span> Protected access</footer>
    </div>
  )
}

export function AdminApp() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="app-shell">
      <Header onMenu={() => setMenuOpen(true)} />
      <Sidebar active={active} setActive={setActive} open={menuOpen} close={() => setMenuOpen(false)} />
      {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <Dashboard active={active} />
    </div>
  )
}
