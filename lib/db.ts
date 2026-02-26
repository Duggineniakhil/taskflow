import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const obfuscatedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@')
    console.log('Connecting to MongoDB:', obfuscatedUri)
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    }).then((m) => {
      console.log('MongoDB Connected Successfully')
      return m
    }).catch((err) => {
      console.error('MongoDB Connection Error:', err)
      cached.promise = null // Reset promise on error
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    console.error('Failed to await MongoDB connection:', err)
    throw err
  }
  return cached.conn
}
