import { VisionTest } from '../components/VisionTest/VisionTest'

// In a real app this would come from auth/session context.
// Hardcoded here since the deliverable is the test module itself.
const DEMO_USER_ID = 'puru'

export function VisionTestPage() {
  return <VisionTest userId={DEMO_USER_ID} />
}
