import { getCurrentUser } from '@/lib/jwt'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/response'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) return unauthorizedResponse()

    await connectDB()
    const user = await User.findById(payload.userId).select('-password')
    if (!user) return unauthorizedResponse()

    return successResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error('[Me Error]:', error)
    return serverErrorResponse()
  }
}
