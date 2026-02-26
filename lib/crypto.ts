import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

if (!ENCRYPTION_KEY) {
  console.warn('WARNING: ENCRYPTION_KEY is not defined. Payload encryption will not work correctly.')
}

/**
 * Encrypts a string value using AES-256
 */
export function encrypt(value: string): string {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY environment variable is required')
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString()
}

/**
 * Decrypts an AES-encrypted string
 */
export function decrypt(encrypted: string): string {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY environment variable is required')
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Encrypts sensitive fields in an object
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(result as any)[field] = encrypt(result[field] as string)
    }
  }
  return result
}

/**
 * Decrypts sensitive fields in an object
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(result as any)[field] = decrypt(result[field] as string)
      } catch {
        // If decryption fails, keep original value
      }
    }
  }
  return result
}
