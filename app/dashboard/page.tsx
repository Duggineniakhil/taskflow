'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type TaskStatus = 'todo' | 'in-progress' | 'done'

interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface User {
  id: string
  name: string
  email: string
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string; dot: string }> = {
  todo: { label: 'To Do', className: 'status-todo', dot: 'bg-ink-400' },
  'in-progress': { label: 'In Progress', className: 'status-in-progress', dot: 'bg-accent-soft' },
  done: { label: 'Done', className: 'status-done', dot: 'bg-lime-glow' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo' as TaskStatus })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) router.push('/login')
        else setUser(d.data)
      })
      .catch(() => router.push('/login'))
  }, [router])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '9',
        status: statusFilter,
        ...(search ? { search } : {}),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      if (data.success) {
        setTasks(data.data.tasks)
        setPagination(data.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    if (user) fetchTasks()
  }, [user, fetchTasks])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function openCreate() {
    setEditingTask(null)
    setTaskForm({ title: '', description: '', status: 'todo' })
    setFormError('')
    setShowModal(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setTaskForm({ title: task.title, description: task.description, status: task.status })
    setFormError('')
    setShowModal(true)
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      })
      const data = await res.json()

      if (!res.ok) {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(', ')
          : data.message || 'Something went wrong'
        setFormError(errMsg)
        return
      }

      setShowModal(false)
      fetchTasks()
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      fetchTasks()
    } catch {
      // handle error silently
    }
  }

  async function quickUpdateStatus(task: Task, newStatus: TaskStatus) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchTasks()
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const stats = {
    total: pagination?.total ?? 0,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div className="min-h-screen relative">
      <div className="noise-overlay" />

      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent opacity-[0.03] blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-lime-glow opacity-[0.02] blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-ink-700 relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-ink-50">TaskFlow</span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-ink-100 text-sm font-medium">{user.name}</p>
                  <p className="text-ink-400 text-xs">{user.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="btn-ghost text-xs px-4 py-2">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title & CTA */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-50 mb-1">
              My Tasks
            </h1>
            <p className="text-ink-400 text-sm">
              {pagination?.total ?? 0} task{pagination?.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-up stagger-1">
          {[
            { label: 'Total', value: stats.total, color: 'text-ink-300' },
            { label: 'To Do', value: stats.todo, color: 'text-ink-400' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-accent-soft' },
            { label: 'Done', value: stats.done, color: 'text-lime-glow' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4">
              <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up stagger-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-ghost px-4 py-3 text-xs">
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
                className="btn-ghost px-4 py-3 text-xs text-red-400 border-red-400/20"
              >
                Clear
              </button>
            )}
          </form>

          <div className="flex gap-2">
            {(['all', 'todo', 'in-progress', 'done'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  statusFilter === s
                    ? 'bg-accent text-white border-accent'
                    : 'glass border-ink-600 text-ink-400 hover:border-ink-400 hover:text-ink-200'
                }`}
              >
                {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-ink-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-ink-700 rounded w-full mb-2" />
                <div className="h-3 bg-ink-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-ink-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-ink-700">
              <svg className="w-8 h-8 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-display text-xl text-ink-400 mb-2">No tasks found</p>
            <p className="text-ink-500 text-sm mb-6">
              {search ? `No results for "${search}"` : 'Create your first task to get started'}
            </p>
            {!search && (
              <button onClick={openCreate} className="btn-primary">
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up stagger-3">
            {tasks.map((task) => {
              const cfg = STATUS_CONFIG[task.status]
              return (
                <div key={task.id} className="glass glass-hover rounded-xl p-5 flex flex-col group relative">
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(task)}
                        className="w-7 h-7 rounded-lg bg-ink-700 hover:bg-ink-600 transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(task.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`font-display text-base font-bold mb-2 leading-snug ${task.status === 'done' ? 'line-through text-ink-400' : 'text-ink-50'}`}>
                    {task.title}
                  </h3>

                  {/* Description */}
                  {task.description && (
                    <p className="text-ink-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-ink-700/50 flex items-center justify-between">
                    <span className="text-ink-500 text-xs font-mono">
                      {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {/* Quick status cycle */}
                    {task.status !== 'done' && (
                      <button
                        onClick={() => quickUpdateStatus(task, task.status === 'todo' ? 'in-progress' : 'done')}
                        className="text-xs text-ink-500 hover:text-accent-soft transition-colors"
                      >
                        {task.status === 'todo' ? '→ Start' : '→ Done'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev}
              className="btn-ghost px-4 py-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    p === pagination.page
                      ? 'bg-accent text-white'
                      : 'text-ink-400 hover:text-ink-200 hover:bg-ink-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="btn-ghost px-4 py-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md glow-accent animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-ink-50">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-ink-700 hover:bg-ink-600 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-ink-300 text-xs font-medium mb-2 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Task title..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-ink-300 text-xs font-medium mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className="input-field resize-none"
                  placeholder="Optional description..."
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-ink-300 text-xs font-medium mb-2 uppercase tracking-wider">
                  Status
                </label>
                <select
                  className="input-field"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={formLoading}>
                  {formLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-sm animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-ink-50 text-center mb-2">Delete Task</h3>
            <p className="text-ink-400 text-sm text-center mb-6">
              This action cannot be undone. Are you sure?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-all text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
