import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/lib/models/Task'
import { updateTaskSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/jwt'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id)
}

// GET /api/tasks/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorizedResponse()

    if (!isValidObjectId(params.id)) return notFoundResponse('Task not found')

    await connectDB()
    const task = await Task.findById(params.id).lean()

    if (!task) return notFoundResponse('Task not found')

    // Authorization: ensure task belongs to requesting user
    if (task.userId.toString() !== user.userId) return forbiddenResponse()

    return successResponse({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  } catch (error) {
    console.error('[Task GET Error]:', error)
    return serverErrorResponse()
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorizedResponse()

    if (!isValidObjectId(params.id)) return notFoundResponse('Task not found')

    const body = await req.json()
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    await connectDB()

    // Find task and verify ownership in single atomic query
    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId: new mongoose.Types.ObjectId(user.userId) },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean()

    if (!task) return notFoundResponse('Task not found')

    return successResponse({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  } catch (error) {
    console.error('[Task PATCH Error]:', error)
    return serverErrorResponse()
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorizedResponse()

    if (!isValidObjectId(params.id)) return notFoundResponse('Task not found')

    await connectDB()

    // Atomic ownership-checked delete
    const task = await Task.findOneAndDelete({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.userId),
    })

    if (!task) return notFoundResponse('Task not found')

    return successResponse({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('[Task DELETE Error]:', error)
    return serverErrorResponse()
  }
}
