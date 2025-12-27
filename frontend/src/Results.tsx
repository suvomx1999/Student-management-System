import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, updateCgpa, createStudent, deleteStudent, type Student } from './api'
import { Users, Edit2, Trash2, Plus } from 'lucide-react'
import Layout from './components/Layout'

function Results() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [cgpaInput, setCgpaInput] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newCgpa, setNewCgpa] = useState<string>('')
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startEditCgpa(s: Student) {
    setEditingId(s.id!)
    setCgpaInput(s.cgpa != null ? String(s.cgpa) : '')
  }

  async function saveCgpa() {
    if (editingId == null) return
    const value = cgpaInput.trim()
    const parsed = value === '' ? null : parseFloat(value)
    try {
      await updateCgpa(editingId, parsed)
      setEditingId(null)
      setCgpaInput('')
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setCgpaInput('')
  }


  async function onAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cgpaVal = newCgpa.trim()
    const payload: Omit<Student, 'id'> = {
      name: newName,
      email: newEmail,
      password: newPassword,
      cgpa: cgpaVal === '' ? undefined : parseFloat(cgpaVal),
    }
    try {
      await createStudent(payload)
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setNewCgpa('')
      setShowAddForm(false)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onDeleteStudent(id: number) {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await deleteStudent(id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <Layout
      title="Student Results"
      actions={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close' : 'Add Student'}
        </button>
      }
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}
      
      {showAddForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Add New Student</h2>
          </div>
          <form onSubmit={onAddSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  value={newCgpa}
                  onChange={(e) => setNewCgpa(e.target.value)}
                  placeholder="Enter CGPA (0-10)"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all"
              >
                Save Student
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewName(''); setNewEmail(''); setNewPassword(''); setNewCgpa('') }}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500">Loading results...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-900 font-medium text-lg">No students found</p>
            <p className="text-slate-500 mt-1">Add students from the App page</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">CGPA</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <button
                        onClick={() => s.id != null && navigate(`/students/${s.id}`)}
                        className="hover:text-indigo-600 transition-colors"
                        title="View Profile"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {editingId === s.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            value={cgpaInput}
                            onChange={(e) => setCgpaInput(e.target.value)}
                            autoFocus
                          />
                          <button onClick={saveCgpa} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Save</button>
                          <button onClick={cancelEdit} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (s.cgpa || 0) >= 8 ? 'bg-green-100 text-green-800' :
                          (s.cgpa || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {s.cgpa != null ? s.cgpa.toFixed(2) : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditCgpa(s)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit CGPA">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {s.id != null && (
                          <button onClick={() => onDeleteStudent(s.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Student">
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
    </Layout>
  )
}

export default Results
