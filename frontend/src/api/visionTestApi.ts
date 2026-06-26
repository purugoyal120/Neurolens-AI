import type {
  SubmitVisionTestRequest,
  SubmitVisionTestResponse,
  VisionProfile,
  VisionTestConfig,
} from '../types/visionTest'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {
      // not JSON, fall back to statusText
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

export const visionTestApi = {
  startTest: () => request<VisionTestConfig>('/api/vision-test/start', { method: 'POST' }),

  submitTest: (payload: SubmitVisionTestRequest) =>
    request<SubmitVisionTestResponse>('/api/vision-test/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: (userId: string) =>
    request<VisionProfile>(`/api/vision-profile/${encodeURIComponent(userId)}`),
}

export { ApiError }
