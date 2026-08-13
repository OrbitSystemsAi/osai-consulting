export const CAMPAIGN_STEPS = ['Campaign details', 'Audience', 'Decision tree', 'Schedule', 'Review']

export const ACTIVITY_TYPES = ['Email', 'Phone', 'In-person visit', 'Instagram', 'Flyer', 'Mailer']

export const defaultCampaignWorkflow = () => ({
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      collapsed: false,
      activities: [
        { id: 'activity-email-intro', type: 'Email', title: 'Introduction', detail: 'A practical way to simplify intake and scheduling', automated: true },
        { id: 'activity-instagram-follow', type: 'Instagram', title: 'Follow company', detail: 'Engage with latest post', automated: false },
      ],
      decisions: [
        {
          id: 'decision-response',
          label: 'Response?',
          branches: [
            { id: 'branch-opted-out', label: 'Opted out', outcome: 'End campaign · Do Not Contact', tone: 'danger' },
            { id: 'branch-connected', label: 'Replied / Connected', outcome: 'Qualify', tone: 'success' },
            { id: 'branch-no-response', label: 'No response', outcome: 'Continue to Day 3', tone: 'neutral' },
          ],
        },
      ],
    },
    {
      id: 'day-3',
      dayNumber: 3,
      collapsed: true,
      activities: [{ id: 'activity-initial-call', type: 'Phone', title: 'Initial call', detail: 'Call main contact and record outcome', automated: false }],
      decisions: [{ id: 'decision-connected', label: 'Connected?', branches: [{ id: 'branch-connected-yes', label: 'Yes', outcome: 'Qualify', tone: 'success' }, { id: 'branch-connected-no', label: 'No', outcome: 'Continue to Day 5', tone: 'neutral' }] }],
    },
    {
      id: 'day-5',
      dayNumber: 5,
      collapsed: false,
      activities: [
        { id: 'activity-qualification-call', type: 'Phone', title: 'Qualification call', detail: 'Confirm fit, need, authority, timing, and next step', automated: false },
        { id: 'activity-drop-in', type: 'In-person visit', title: 'Drop-in introduction', detail: 'Leave a concise service overview', automated: false },
      ],
      decisions: [{ id: 'decision-qualified', label: 'Qualified?', branches: [{ id: 'branch-not-qualified', label: 'No', outcome: 'Nurture', tone: 'nurture' }, { id: 'branch-follow-up', label: 'Needs follow-up', outcome: 'Continue to Day 8', tone: 'neutral' }, { id: 'branch-qualified', label: 'Yes', outcome: 'Book appointment', tone: 'success' }] }],
    },
    {
      id: 'day-6',
      dayNumber: 6,
      collapsed: true,
      activities: [{ id: 'activity-confirmation', type: 'Email', title: 'Appointment confirmation', detail: 'Confirm the date, time, location, and attendees', automated: true }],
      decisions: [],
    },
    {
      id: 'day-8',
      dayNumber: 8,
      collapsed: true,
      activities: [{ id: 'activity-meeting-prep', type: 'Email', title: 'Meeting preparation', detail: 'Send agenda, materials, and preparation checklist', automated: true }],
      decisions: [],
    },
  ],
})

export const defaultCampaignAudience = () => ({
  count: 128,
  filters: ['Weston, FL', 'Health & Medicine'],
})

export const defaultCampaignSchedule = () => ({
  startDate: '2026-08-17',
  timezone: 'America/New_York',
  weekdaysOnly: true,
  sendWindowStart: '09:00',
  sendWindowEnd: '16:00',
  stopOnReply: true,
  skipDoNotContact: true,
})
