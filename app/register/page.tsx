'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setGlobalError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else setGlobalError(data.message || 'Registration failed')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setGlobalError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function fieldError(field: string) {
    return errors[field]?.[0]
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-accent opacity-5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-lime-glow opacity-3 blur-3xl" />
      </div>
      <div className="noise-overlay" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-ink-50">TaskFlow</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-50 mb-2">Create account</h1>
          <p className="text-ink-400 text-sm">Start managing your tasks with clarity</p>
        </div>

        <div className="glass rounded-2xl p-8 glow-accent animate-fade-up stagger-1">
          {globalError && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-ink-300 text-xs font-medium mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
              />
              {fieldError('name') && (
                <p className="mt-1 text-red-400 text-xs">{fieldError('name')}</p>
              )}
            </div>

            <div>
              <label className="block text-ink-300 text-xs font-medium mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
              {fieldError('email') && (
                <p className="mt-1 text-red-400 text-xs">{fieldError('email')}</p>
              )}
            </div>

            <div>
              <label className="block text-ink-300 text-xs font-medium mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
              />
              {fieldError('password') && (
                <p className="mt-1 text-red-400 text-xs">{fieldError('password')}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-ink-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent-soft transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
