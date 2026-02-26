import { getCurrentUser } from './jwt'
import { unauthorizedResponse } from './response'
import type { JWTPayload } from './jwt'

export async function requireAuth(): Promise<{ user: JWTPayload } | ReturnType<typeof unauthorizedResponse>> {
  const user = await getCurrentUser()
  if (!user) {
    return unauthorizedResponse('Please log in to access this resource')
  }
  return { user }
}

// Type guard
export function isAuthError(result: unknown): result is ReturnType<typeof unauthorizedResponse> {
  return result instanceof Response
}
