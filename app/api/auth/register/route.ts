import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { registerSchema } from '@/lib/validations'
import { signToken, setAuthCookie } from '@/lib/jwt'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { name, email, password } = parsed.data

    await connectDB()
    console.log('Registering user:', email)

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    console.log('Existing user found:', !!existingUser)
    if (existingUser) {
      return errorResponse('An account with this email already exists', 409)
    }

    // Create user (password hashed via pre-save hook)
    console.log('Creating user...')
    const user = await User.create({ name, email, password })
    console.log('User created:', user._id)

    // Generate JWT and set HttpOnly cookie
    const token = await signToken({ userId: user._id.toString(), email: user.email })
    setAuthCookie(token)

    return successResponse(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        message: 'Account created successfully',
      },
      201
    )
  } catch (error) {
    console.error('[Register Error]:', error)
    return serverErrorResponse()
  }
}
