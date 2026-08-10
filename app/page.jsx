import { Landing } from '../src/main'

export default function HomePage() {
  return <Landing configured={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} />
}
