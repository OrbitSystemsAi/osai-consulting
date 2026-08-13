'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  AtSign,
  CalendarCheck2,
  ChevronDown,
  ChevronRight,
  Camera,
  GitBranch,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Save,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react'
import { ACTIVITY_TYPES, CAMPAIGN_STEPS } from '../lib/campaign-workflow'

const activityIcons = {
  Email: Mail,
  Phone,
  'In-person visit': MapPin,
  Instagram: Camera,
  Flyer: Package,
  Mailer: AtSign,
}

const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function Field({ label, children }) {
  return <label className="campaign-field"><span>{label}</span>{children}</label>
}

function Stepper({ current, onChange }) {
  return <nav className="campaign-stepper" aria-label="Campaign creation steps">
    {CAMPAIGN_STEPS.map((label, index) => <React.Fragment key={label}>
      <button className={current === index + 1 ? 'active' : current > index + 1 ? 'complete' : ''} onClick={() => onChange(index + 1)}><i>{index + 1}</i>{label}</button>
      {index < CAMPAIGN_STEPS.length - 1 ? <span /> : null}
    </React.Fragment>)}
  </nav>
}

function ActivityRow({ activity, onSelect, onDelete }) {
  const Icon = activityIcons[activity.type] || CalendarCheck2
  return <article className={`campaign-activity ${activity.automated ? 'automated' : 'manual'}`} onClick={onSelect}>
    <Icon size={16} />
    <div><strong>{activity.type} <small>—</small> {activity.title}</strong><span>{activity.detail || 'Add activity details'}</span></div>
    <button onClick={event => { event.stopPropagation(); onDelete() }} aria-label={`Delete ${activity.title}`}><Trash2 size={13} /></button>
  </article>
}

function DecisionView({ decision, onSelect }) {
  return <div className="campaign-decision" onClick={onSelect}>
    <button className="decision-diamond"><span>{decision.label}</span></button>
    <div className="decision-branches">
      {decision.branches.map(branch => <div key={branch.id}><small>{branch.label}</small><span className={`branch-outcome ${branch.tone || 'neutral'}`}>{branch.outcome}</span></div>)}
    </div>
  </div>
}

function DayCard({ day, onToggle, onAddActivity, onAddDecision, onEditDay, onDeleteDay, onSelectActivity, onSelectDecision, onDeleteActivity }) {
  const summary = [day.activities[0]?.type && `${day.activities[0].type}${day.activities[0]?.title ? ` · ${day.activities[0].title}` : ''}`, day.decisions[0]?.label].filter(Boolean).join(' · ')
  return <section className={`campaign-day ${day.collapsed ? 'collapsed' : ''}`}>
    <header onClick={onToggle}>
      <button className="day-toggle" aria-label={`${day.collapsed ? 'Expand' : 'Collapse'} day ${day.dayNumber}`}>{day.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}</button>
      <strong>DAY {day.dayNumber}</strong>
      {day.collapsed ? <p>{summary || 'No activities yet'}</p> : <p>{day.activities.length} activit{day.activities.length === 1 ? 'y' : 'ies'} · {day.decisions.length} decision{day.decisions.length === 1 ? '' : 's'}</p>}
      <div className="day-actions">
        <button onClick={event => { event.stopPropagation(); onAddActivity() }}><Plus size={13} /> Add activity</button>
        <button onClick={event => { event.stopPropagation(); onEditDay() }}><Pencil size={13} /> Edit day</button>
        <button onClick={event => { event.stopPropagation(); onDeleteDay() }}><Trash2 size={13} /> Delete day</button>
      </div>
    </header>
    {!day.collapsed ? <div className="day-body">
      <div className="day-activities"><h4>Activities</h4>{day.activities.map(activity => <ActivityRow key={activity.id} activity={activity} onSelect={() => onSelectActivity(activity.id)} onDelete={() => onDeleteActivity(activity.id)} />)}<button className="inline-add" onClick={onAddActivity}><Plus size={13} /> Activity</button></div>
      <div className="day-decisions"><h4>Decisions</h4>{day.decisions.map(decision => <DecisionView key={decision.id} decision={decision} onSelect={() => onSelectDecision(decision.id)} />)}<button className="inline-add" onClick={onAddDecision}><Plus size={13} /> Decision</button></div>
    </div> : null}
  </section>
}

function DetailsStep({ draft, update }) {
  return <section className="campaign-step-form"><h2>Campaign details</h2><p>Define the purpose and ownership of this campaign.</p><div className="campaign-form-grid">
    <Field label="Campaign name"><input value={draft.title} onChange={event => update({ title: event.target.value })} /></Field>
    <Field label="Owner"><input value={draft.ownerName} onChange={event => update({ ownerName: event.target.value })} placeholder="Campaign owner" /></Field>
    <Field label="Objective"><textarea value={draft.objective} onChange={event => update({ objective: event.target.value })} /></Field>
    <Field label="Internal description"><textarea value={draft.description} onChange={event => update({ description: event.target.value })} /></Field>
  </div></section>
}

function AudienceStep({ draft, update }) {
  const filters = draft.audience?.filters || []
  return <section className="campaign-step-form"><h2>Audience</h2><p>Choose who will enter this campaign. The selection is saved as a shared audience snapshot.</p><div className="campaign-form-grid">
    <Field label="Estimated recipients"><input type="number" min="0" value={draft.audience?.count || 0} onChange={event => update({ audience: { ...draft.audience, count: Number(event.target.value) } })} /></Field>
    <Field label="Audience filters"><input value={filters.join(', ')} onChange={event => update({ audience: { ...draft.audience, filters: event.target.value.split(',').map(item => item.trim()).filter(Boolean) } })} placeholder="Location, industry, stage" /></Field>
  </div><div className="audience-preview"><strong>{draft.audience?.count || 0} recipients</strong><div>{filters.map(filter => <span key={filter}>{filter}</span>)}</div></div></section>
}

function ScheduleStep({ draft, update }) {
  const schedule = draft.schedule || {}
  const setSchedule = values => update({ schedule: { ...schedule, ...values } })
  return <section className="campaign-step-form"><h2>Schedule</h2><p>Set the operating window used to calculate each recipient’s campaign days.</p><div className="campaign-form-grid schedule-grid">
    <Field label="Start date"><input type="date" value={schedule.startDate || ''} onChange={event => setSchedule({ startDate: event.target.value })} /></Field>
    <Field label="Time zone"><input value={schedule.timezone || ''} onChange={event => setSchedule({ timezone: event.target.value })} /></Field>
    <Field label="Send window starts"><input type="time" value={schedule.sendWindowStart || ''} onChange={event => setSchedule({ sendWindowStart: event.target.value })} /></Field>
    <Field label="Send window ends"><input type="time" value={schedule.sendWindowEnd || ''} onChange={event => setSchedule({ sendWindowEnd: event.target.value })} /></Field>
  </div><div className="campaign-checks"><label><input type="checkbox" checked={Boolean(schedule.weekdaysOnly)} onChange={event => setSchedule({ weekdaysOnly: event.target.checked })} /> Run on weekdays</label><label><input type="checkbox" checked={Boolean(schedule.stopOnReply)} onChange={event => setSchedule({ stopOnReply: event.target.checked })} /> Stop automated outreach when a recipient replies</label><label><input type="checkbox" checked={Boolean(schedule.skipDoNotContact)} onChange={event => setSchedule({ skipDoNotContact: event.target.checked })} /> Skip contacts marked Do Not Contact</label></div></section>
}

function ReviewStep({ draft }) {
  const days = draft.workflow?.days || []
  const activities = days.reduce((total, day) => total + day.activities.length, 0)
  const decisions = days.reduce((total, day) => total + day.decisions.length, 0)
  return <section className="campaign-step-form campaign-review"><h2>Review campaign</h2><p>Confirm the audience, decision paths, and schedule before activation.</p><div><span><small>Audience</small><strong>{draft.audience?.count || 0} recipients</strong></span><span><small>Plan</small><strong>{days.length} days · {activities} activities</strong></span><span><small>Logic</small><strong>{decisions} decisions</strong></span><span><small>Starts</small><strong>{draft.schedule?.startDate || 'Not scheduled'}</strong></span></div><p className="review-note">Qualification occurs before appointment booking. Automated email delivery remains inactive until the sending provider and scheduler credentials are configured.</p></section>
}

export function CampaignBuilder({ campaign, onBack, onSaved }) {
  const [draft, setDraft] = useState(campaign)
  const [step, setStep] = useState(campaign.currentStep || 3)
  const [selection, setSelection] = useState({ dayId: campaign.workflow?.days?.find(day => !day.collapsed)?.id || campaign.workflow?.days?.[0]?.id, type: 'day' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const days = draft.workflow?.days || []
  const selectedDay = days.find(day => day.id === selection.dayId) || days[0]
  const selectedActivity = selection.type === 'activity' ? selectedDay?.activities.find(item => item.id === selection.itemId) : null
  const selectedDecision = selection.type === 'decision' ? selectedDay?.decisions.find(item => item.id === selection.itemId) : null
  const channelCounts = useMemo(() => days.flatMap(day => day.activities).reduce((counts, item) => ({ ...counts, [item.type]: (counts[item.type] || 0) + 1 }), {}), [days])

  useEffect(() => {
    const requestedStep = Number(new URLSearchParams(window.location.search).get('step'))
    if (requestedStep >= 1 && requestedStep <= CAMPAIGN_STEPS.length) setStep(requestedStep)
  }, [])

  const update = values => setDraft(current => ({ ...current, ...values }))
  const setDays = updater => setDraft(current => ({ ...current, workflow: { ...current.workflow, days: typeof updater === 'function' ? updater(current.workflow.days) : updater } }))
  const patchDay = (dayId, updater) => setDays(current => current.map(day => day.id === dayId ? (typeof updater === 'function' ? updater(day) : { ...day, ...updater }) : day).toSorted((a, b) => a.dayNumber - b.dayNumber))
  const addDay = afterIndex => {
    const prior = Number.isInteger(afterIndex) ? days[afterIndex] : days[days.length - 1]
    const nextNumber = (prior?.dayNumber || 0) + 1
    const day = { id: uid('day'), dayNumber: nextNumber, collapsed: false, activities: [], decisions: [] }
    setDays(current => [...current, day].toSorted((a, b) => a.dayNumber - b.dayNumber)); setSelection({ dayId: day.id, type: 'day' })
  }
  const deleteDay = dayId => { if (!window.confirm('Delete this day and its activities and decisions?')) return; setDays(current => current.filter(day => day.id !== dayId)); setSelection({ dayId: days.find(day => day.id !== dayId)?.id, type: 'day' }) }
  const addActivity = dayId => {
    const activity = { id: uid('activity'), type: 'Phone', title: 'New activity', detail: '', automated: false }
    patchDay(dayId, day => ({ ...day, collapsed: false, activities: [...day.activities, activity] })); setSelection({ dayId, type: 'activity', itemId: activity.id })
  }
  const addDecision = dayId => {
    const decision = { id: uid('decision'), label: 'Decision?', branches: [{ id: uid('branch'), label: 'Yes', outcome: 'Next step', tone: 'success' }, { id: uid('branch'), label: 'No', outcome: 'Continue', tone: 'neutral' }] }
    patchDay(dayId, day => ({ ...day, collapsed: false, decisions: [...day.decisions, decision] })); setSelection({ dayId, type: 'decision', itemId: decision.id })
  }
  const patchActivity = values => patchDay(selectedDay.id, day => ({ ...day, activities: day.activities.map(item => item.id === selectedActivity.id ? { ...item, ...values } : item) }))
  const patchDecision = values => patchDay(selectedDay.id, day => ({ ...day, decisions: day.decisions.map(item => item.id === selectedDecision.id ? { ...item, ...values } : item) }))
  const save = async status => {
    setSaving(true); setMessage('')
    try {
      const next = { ...draft, status: status === 'scheduled' ? draft.status : (status || draft.status), currentStep: step }
      const saved = await fetch(`/api/campaigns/${encodeURIComponent(draft.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).then(async response => { if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Unable to save campaign'); return response.json() })
      if (status === 'scheduled') {
        const scheduled = await fetch(`/api/campaigns/${encodeURIComponent(draft.id)}/schedule`, { method: 'POST' }).then(async response => { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || 'Unable to schedule campaign'); return payload })
        saved.status = scheduled.status
      }
      setDraft(saved); onSaved(saved); setMessage(status === 'scheduled' ? 'Campaign scheduled.' : 'Draft saved.')
    } catch (reason) { setMessage(reason.message) } finally { setSaving(false) }
  }

  return <main className="content pane campaign-builder"><div className="campaign-builder-shell">
    <div className="campaign-builder-main">
      <header className="campaign-builder-heading"><div><button onClick={onBack}><ChevronRight size={14} /> Campaigns</button><h1>{step === 3 ? 'Campaign decision tree' : 'Create campaign'} <em>{draft.status || 'draft'}</em></h1></div>{step === 3 ? <button className="outline-action" onClick={() => addDay()}><Plus size={15} /> Add day</button> : null}</header>
      <Stepper current={step} onChange={setStep} />
      {step === 1 ? <DetailsStep draft={draft} update={update} /> : null}
      {step === 2 ? <AudienceStep draft={draft} update={update} /> : null}
      {step === 3 ? <>
        <div className="campaign-tree-toolbar"><span><button onClick={() => selectedDay && addActivity(selectedDay.id)}><Plus size={13} /> Activity</button><button onClick={() => selectedDay && addDecision(selectedDay.id)}><Plus size={13} /> Decision</button><button><Plus size={13} /> Delay</button><button><Plus size={13} /> End state</button></span><span className="campaign-legend"><i /> Automated <i /> Manual task</span></div>
        <div className="campaign-days">{days.map((day, index) => <React.Fragment key={day.id}><DayCard day={day} onToggle={() => patchDay(day.id, { collapsed: !day.collapsed })} onAddActivity={() => addActivity(day.id)} onAddDecision={() => addDecision(day.id)} onEditDay={() => setSelection({ dayId: day.id, type: 'day' })} onDeleteDay={() => deleteDay(day.id)} onSelectActivity={itemId => setSelection({ dayId: day.id, type: 'activity', itemId })} onSelectDecision={itemId => setSelection({ dayId: day.id, type: 'decision', itemId })} onDeleteActivity={itemId => patchDay(day.id, current => ({ ...current, activities: current.activities.filter(item => item.id !== itemId) }))} />{index === 1 ? <button className="insert-day" onClick={() => addDay(index)}><Plus size={13} /> Add day</button> : null}</React.Fragment>)}</div>
      </> : null}
      {step === 4 ? <ScheduleStep draft={draft} update={update} /> : null}
      {step === 5 ? <ReviewStep draft={draft} /> : null}
    </div>
    <aside className="campaign-inspector">
      <section><h3>Campaign details</h3><dl><div><dt>Campaign name</dt><dd>{draft.title}</dd></div><div><dt>Owner</dt><dd>{draft.ownerName || 'Unassigned'}</dd></div></dl></section>
      <section><h3>Audience summary</h3><strong className="audience-count"><UserRound size={17} /> {draft.audience?.count || 0} recipients</strong><div className="audience-tags">{(draft.audience?.filters || []).map(filter => <span key={filter}>{filter}</span>)}</div><button onClick={() => setStep(2)}>Edit audience <ChevronRight size={15} /></button></section>
      {step === 3 && selectedDay ? <section className="selected-editor">
        {selection.type === 'day' ? <><h3>Day {selectedDay.dayNumber} settings</h3><Field label="Campaign day"><input type="number" min="1" value={selectedDay.dayNumber} onChange={event => patchDay(selectedDay.id, { dayNumber: Number(event.target.value) })} /></Field><p>Runs on the campaign schedule and uses the selected business-day rules.</p></> : null}
        {selectedActivity ? <><h3>Edit activity</h3><Field label="Channel"><select value={selectedActivity.type} onChange={event => patchActivity({ type: event.target.value, automated: event.target.value === 'Email' })}>{ACTIVITY_TYPES.map(type => <option key={type}>{type}</option>)}</select></Field><Field label="Title"><input value={selectedActivity.title} onChange={event => patchActivity({ title: event.target.value })} /></Field><Field label="Details"><textarea value={selectedActivity.detail} onChange={event => patchActivity({ detail: event.target.value })} /></Field><label className="check-row"><input type="checkbox" checked={selectedActivity.automated} onChange={event => patchActivity({ automated: event.target.checked })} /> Automated activity</label></> : null}
        {selectedDecision ? <><h3>Edit decision</h3><Field label="Question"><input value={selectedDecision.label} onChange={event => patchDecision({ label: event.target.value })} /></Field>{selectedDecision.branches.map(branch => <div className="branch-editor" key={branch.id}><input aria-label="Branch label" value={branch.label} onChange={event => patchDecision({ branches: selectedDecision.branches.map(item => item.id === branch.id ? { ...item, label: event.target.value } : item) })} /><input aria-label="Branch outcome" value={branch.outcome} onChange={event => patchDecision({ branches: selectedDecision.branches.map(item => item.id === branch.id ? { ...item, outcome: event.target.value } : item) })} /></div>)}<button className="inline-add" onClick={() => patchDecision({ branches: [...selectedDecision.branches, { id: uid('branch'), label: 'Outcome', outcome: 'Next step', tone: 'neutral' }] })}><Plus size={13} /> Branch</button></> : null}
      </section> : null}
      {step === 3 ? <section><h3>Channel summary</h3><div className="channel-summary">{Object.entries(channelCounts).map(([type, count]) => <span key={type}>{count} {type}</span>)}</div></section> : null}
    </aside>
    <footer className="campaign-builder-footer"><span>{message}</span><button onClick={() => setStep(5)}><GitBranch size={15} /> Preview paths</button><button onClick={() => save()} disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save draft'}</button><button className="primary" onClick={() => save('scheduled')} disabled={saving}><Send size={15} /> Schedule campaign</button></footer>
  </div></main>
}
