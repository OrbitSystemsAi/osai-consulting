'use client'

import React, { useMemo, useState } from 'react'
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs'
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
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Settings,
  Sparkles,
  Target,
  Users,
  Workflow,
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
  return <div className="landing-user"><a className="landing-admin-link" href="/admin"><LayoutDashboard size={17} /> Open admin</a><UserButton /></div>
}

export function Landing({ configured }) {
  const goToPreview = () => { window.location.href = '/admin?preview=1' }
  const SignInAction = ({ secondary = false }) => configured ? <SignInButton mode="modal" fallbackRedirectUrl="/admin"><button className={secondary ? 'landing-admin-link' : 'landing-primary'}>{secondary && <LockKeyhole size={17} />}{secondary ? 'Client sign in' : 'Sign in'}</button></SignInButton> : <button className={secondary ? 'landing-admin-link' : 'landing-primary'} onClick={goToPreview}>{secondary && <LockKeyhole size={17} />}{secondary ? 'Client sign in' : 'Sign in'}</button>
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
