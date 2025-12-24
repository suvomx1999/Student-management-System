import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, updateCgpa, createStudent, deleteStudent, type Student } from './api'
import { Users, ArrowLeft, Edit2, Trash2, Plus, LogOut } from 'lucide-react'

function Results() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [cgpaInput, setCgpaInput] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCgpa, setNewCgpa] = useState<string>('')
  const navigate = useNavigate()
  function onLogout() {
    localStorage.removeItem('isAuthenticated')
    navigate('/', { replace: true })
  }

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
      cgpa: cgpaVal === '' ? undefined : parseFloat(cgpaVal),
    }
    try {
      await createStudent(payload)
      setNewName('')
      setNewCgpa('')
      setShowAddForm(false)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onDeleteStudent(id: number) {
    try {
      await deleteStudent(id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Student Results
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Close' : 'Add Student'}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={() => navigate('/app')}
              className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {showAddForm && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add New Student</h2>
            </div>
            <form onSubmit={onAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  value={newCgpa}
                  onChange={(e) => setNewCgpa(e.target.value)}
                  placeholder="Enter CGPA (0-10)"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Student
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewName(''); setNewCgpa('') }}
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
              <p className="mt-4 text-gray-600">Loading results...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No students found</p>
              <p className="text-sm text-gray-400 mt-1">Add students from the App page</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">CGPA</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <button
                          onClick={() => s.id != null && navigate(`/students/${s.id}`)}
                          className="hover:underline"
                          title="View Profile"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {editingId === s.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              className="w-32 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                              value={cgpaInput}
                              onChange={(e) => setCgpaInput(e.target.value)}
                            />
                            <button onClick={saveCgpa} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">Save</button>
                            <button onClick={cancelEdit} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                          </div>
                        ) : (
                          s.cgpa != null ? s.cgpa.toFixed(2) : '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditCgpa(s)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="Edit CGPA">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {s.id != null && (
                            <button onClick={() => onDeleteStudent(s.id!)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Delete Student">
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

export default Results
