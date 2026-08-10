const PRIMARY_ADMIN_EMAIL = 'epowery@icloud.com'

export function isAdminUser(user) {
  const configuredEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  const adminEmails = new Set([PRIMARY_ADMIN_EMAIL, ...configuredEmails])

  return Boolean(user?.emailAddresses.some(({ emailAddress }) =>
    adminEmails.has(emailAddress.trim().toLowerCase())
  ))
}
