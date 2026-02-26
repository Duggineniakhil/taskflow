import { clearAuthCookie } from '@/lib/jwt'
import { successResponse } from '@/lib/response'

export async function POST() {
  clearAuthCookie()
  return successResponse({ message: 'Logged out successfully' })
}
