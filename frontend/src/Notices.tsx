import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import { Plus, Bell, Trash2, Calendar, AlertCircle, Info, CheckCircle2, X } from 'lucide-react'
import { getNotices, createNotice, deleteNotice as apiDeleteNotice, type Notice } from './api'

type Priority = 'high' | 'normal' | 'low'

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Notice, 'id' | 'date'>>({
    title: '',
    content: '',
    priority: 'normal'
  })
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadNotices() {
    try {
      setLoading(true)
      const data = await getNotices()
      setNotices(data)
    } catch (e) {
      console.error('Failed to load notices', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserRole(user.role)
      } catch (e) {
        // ignore
      }
    }
    loadNotices()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createNotice(form)
      setForm({ title: '', content: '', priority: 'normal' })
      setShowForm(false)
      await loadNotices()
    } catch (e) {
      console.error('Failed to create notice', e)
      alert('Failed to create notice')
    }
  }

  async function deleteNotice(id: number) {
    if (!confirm('Are you sure you want to delete this notice?')) return
    try {
      await apiDeleteNotice(id)
      await loadNotices()
    } catch (e) {
      console.error('Failed to delete notice', e)
      alert('Failed to delete notice')
    }
  }

  function getPriorityColor(priority: Priority) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }
  }

  function getPriorityIcon(priority: Priority) {
    switch (priority) {
      case 'high': return <AlertCircle className="w-5 h-5" />
      case 'normal': return <Info className="w-5 h-5" />
      case 'low': return <CheckCircle2 className="w-5 h-5" />
    }
  }

  return (
    <Layout 
      title="Notices & Announcements" 
      actions={
        ['ADMIN', 'TEACHER'].includes(userRole || '') ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Post New Notice
        </button>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Post New Notice</h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g., Semester Schedule Update"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    placeholder="Write the full notice content here..."
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
                  >
                    Post Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notices Grid */}
        <div className="grid gap-4">
          {notices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No notices yet</h3>
              <p className="text-slate-500 dark:text-slate-400">Create a new notice to inform students and faculty.</p>
            </div>
          ) : (
            notices.map(notice => (
              <div 
                key={notice.id} 
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getPriorityColor(notice.priority)}`}>
                        {getPriorityIcon(notice.priority)}
                        {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)} Priority
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.date || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{notice.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                  </div>
                  {userRole === 'ADMIN' && (
                  <button
                    onClick={() => notice.id && deleteNotice(notice.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
