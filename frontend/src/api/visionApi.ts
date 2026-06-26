import type { ProfileSummaryOut, SubmitTestIn, TestBatteryOut, VisionMapOut } from '../types/vision'

const API_BASE = '/api/v1'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {
      // response wasn't JSON; fall back to statusText
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

export const visionApi = {
  getTestBattery: () => request<TestBatteryOut>('/profile/test-battery'),

  submitTestResults: (payload: SubmitTestIn) =>
    request<ProfileSummaryOut>('/profile/test-results', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getVisionMap: (userId: string) =>
    request<VisionMapOut>(`/profile/${encodeURIComponent(userId)}/vision-map`),

  deleteProfile: (userId: string) =>
    request<{ status: string; user_id: string }>(`/profile/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }),
}

export { ApiError }
