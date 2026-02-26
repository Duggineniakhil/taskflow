import mongoose, { Document, Model, Schema } from 'mongoose'

export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  status: TaskStatus
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient user-specific queries with filtering
TaskSchema.index({ userId: 1, status: 1, createdAt: -1 })
TaskSchema.index({ userId: 1, title: 'text', description: 'text' })

const Task: Model<ITask> =
  mongoose.models.Task ?? mongoose.model<ITask>('Task', TaskSchema)

export default Task
