import { useEffect, useState } from 'react'
import './App.css'
import { createStudent, deleteStudent, getStudents, updateStudent, type Student } from './api'
import { Users, Plus, Edit2, Trash2, X, Search, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function App() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [form, setForm] = useState<Omit<Student, 'id'>>({ name: '', department: '', email: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getStudents()
      setStudents(data)
      setFilteredStudents(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const q = searchQuery.toLowerCase()
    const filtered = students.filter((s) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
    setFilteredStudents(filtered)
  }, [searchQuery, students])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId != null) {
        await updateStudent(editingId, form)
      } else {
        await createStudent(form)
      }
      setForm({ name: '', department: '', email: '' })
      setEditingId(null)
      setShowForm(false)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function onEdit(s: Student) {
    setEditingId(s.id!)
    setForm({ name: s.name, department: s.department ?? '', email: s.email ?? '' })
    setShowForm(true)
  }

  async function onDelete(id: number) {
    try {
      await deleteStudent(id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function onCancel() {
    setEditingId(null)
    setForm({ name: '', department: '', email: '' })
    setShowForm(false)
  }

  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SRM Student Management</h1>
                <p className="text-sm text-gray-500">Manage your student records</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">{students.length} Students</span>
              </div>
              <button
                onClick={() => navigate('/results')}
                className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400"
              >
                Results
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <div className="flex-1 text-sm text-red-800">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Close' : 'Add Student'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editingId != null ? 'Edit Student' : 'Add New Student'}</h2>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  value={form.department ?? ''}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  value={form.email ?? ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId != null ? 'Update Student' : 'Save Student'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No students found</p>
              <p className="text-sm text-gray-400 mt-1">{searchQuery ? 'Try adjusting your search' : 'Add your first student to get started'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                    
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(s.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.email || '-'}</td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onEdit(s)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {s.id != null && (
                            <button onClick={() => onDelete(s.id!)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
