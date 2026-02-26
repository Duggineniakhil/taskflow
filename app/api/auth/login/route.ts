import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { loginSchema } from '@/lib/validations'
import { signToken, setAuthCookie } from '@/lib/jwt'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { email, password } = parsed.data

    await connectDB()
    console.log('Login attempt for:', email)

    // Use select('+password') to include the hashed password field
    const user = await User.findOne({ email }).select('+password')
    console.log('User found:', user ? 'Yes' : 'No')
    if (!user) {
      // Use generic message to prevent user enumeration
      console.log('Login failed: User not found')
      return errorResponse('Invalid email or password', 401)
    }

    const isPasswordValid = await user.comparePassword(password)
    console.log('Password valid:', isPasswordValid)
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password')
      return errorResponse('Invalid email or password', 401)
    }

    const token = await signToken({ userId: user._id.toString(), email: user.email })
    setAuthCookie(token)

    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      message: 'Logged in successfully',
    })
  } catch (error) {
    console.error('[Login Error]:', error)
    return serverErrorResponse()
  }
}
