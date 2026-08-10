const PRIMARY_ADMIN_EMAIL = 'epowery@icloud.com'

export function getUserRole(user) {
  const configuredEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  const adminEmails = new Set([PRIMARY_ADMIN_EMAIL, ...configuredEmails])

  const isPrimaryAdmin = Boolean(user?.emailAddresses.some(({ emailAddress }) =>
    adminEmails.has(emailAddress.trim().toLowerCase())
  ))
  if (isPrimaryAdmin) return 'Admin'

  const metadataRole = user?.publicMetadata?.role
  return ['Admin', 'OSAI-Admin', 'Client', 'Collaborator'].includes(metadataRole) ? metadataRole : 'Client'
}

export function isAdminUser(user) {
  return getUserRole(user) === 'Admin'
}

export function canAccessAdminWorkspace(user) {
  return ['Admin', 'OSAI-Admin'].includes(getUserRole(user))
}
