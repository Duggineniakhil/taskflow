import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import Task from '@/lib/models/Task'
import { createTaskSchema, taskQuerySchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/jwt'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/response'
import mongoose from 'mongoose'

// GET /api/tasks - List tasks with pagination, filter, search
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(req.url)
    const queryObj: Record<string, string> = {}
    searchParams.forEach((value, key) => { queryObj[key] = value })

    const parsed = taskQuerySchema.safeParse(queryObj)
    if (!parsed.success) {
      return errorResponse('Invalid query parameters', 400, parsed.error.flatten().fieldErrors)
    }

    const { page, limit, status, search, sortBy, sortOrder } = parsed.data

    await connectDB()

    // Build MongoDB query - user scoped (critical for authorization)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(user.userId),
    }

    if (status !== 'all') {
      query.status = status
    }

    if (search && search.trim()) {
      // Use regex for title search (safe - not user-controlled in query operators)
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.title = { $regex: escapedSearch, $options: 'i' }
    }

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ])

    return successResponse({
      tasks: tasks.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('[Tasks GET Error]:', error)
    return serverErrorResponse()
  }
}

// POST /api/tasks - Create a task
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorizedResponse()

    const body = await req.json()

    const parsed = createTaskSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    await connectDB()

    const task = await Task.create({
      ...parsed.data,
      userId: new mongoose.Types.ObjectId(user.userId),
    })

    return successResponse(
      {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
      201
    )
  } catch (error) {
    console.error('[Tasks POST Error]:', error)
    return serverErrorResponse()
  }
}
