import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubject, deleteSubject, getDepartments, getSubjectsByDepartment, type Department, type Subject } from './api'
import { GraduationCap, Filter, ListPlus, Trash2, ArrowLeft } from 'lucide-react'

function Subjects() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [selected, setSelected] = useState<string>('All')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSubject, setNewSubject] = useState('')
  const navigate = useNavigate()

  async function loadDepartments() {
    try {
      const data = await getDepartments()
      setDepartments(data)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function loadSubjects(dept: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await getSubjectsByDepartment(dept)
      setSubjects(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    loadSubjects(selected)
  }, [selected])

  const deptOptions = useMemo(() => ['All', ...departments.map((d) => d.name).sort((a, b) => a.localeCompare(b))], [departments])

  async function onAddSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubject.trim() || selected === 'All') return
    try {
      await createSubject(newSubject.trim(), selected)
      setNewSubject('')
      await loadSubjects(selected)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onDeleteSubject(id: number) {
    try {
      await deleteSubject(id)
      await loadSubjects(selected)
    } catch (e) {
      setError((e as Error).message)
    }
  }

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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Department Subjects
                </h1>
                <p className="text-sm text-gray-500">Manage subjects for each department</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/app')}
              className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
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

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {deptOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {selected !== 'All' && (
            <form onSubmit={onAddSubject} className="p-6 flex items-center gap-3">
              <input
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="Add subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ListPlus className="w-4 h-4" />
                Add
              </button>
            </form>
          )}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 font-medium">No subjects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onDeleteSubject(s.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

export default Subjects
