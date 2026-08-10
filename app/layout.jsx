import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  title: 'OSAI Consulting CRM',
  description: 'A secure client relationship workspace for OSAI Consulting.',
}

export default function RootLayout({ children }) {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  const document = <html lang="en"><body>{children}</body></html>
  return configured ? <ClerkProvider afterSignOutUrl="/">{document}</ClerkProvider> : document
}
