import { TestInterface } from '../components/SimpleVisionTest/TestInterface'

// Hardcoded for this deliverable; a real app would pull this from auth/session.
const DEMO_USER_ID = 'user_123'

export function SimpleVisionTestPage() {
  return <TestInterface userId={DEMO_USER_ID} showTimer />
}
