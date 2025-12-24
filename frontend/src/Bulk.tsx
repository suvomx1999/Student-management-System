import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, deleteStudent, type Student } from './api'
import { GraduationCap, ArrowLeft, Trash2, CheckSquare, Square } from 'lucide-react'

function Bulk() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
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
    load()
  }, [])

  const allIds = useMemo(() => new Set((students || []).map((s) => s.id).filter((id): id is number => id != null)), [students])
  const allSelected = useMemo(() => allIds.size > 0 && Array.from(allIds).every((id) => selectedIds.has(id)), [allIds, selectedIds])

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }

  function toggleOne(id: number) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) return
    setLoading(true)
    setError(null)
    try {
      for (const id of selectedIds) {
        await deleteStudent(id)
      }
      setSelectedIds(new Set())
      const data = await getStudents()
      setStudents(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bulk Actions
            </h1>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={toggleAll}
            className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
          >
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Unselect All' : 'Select All'}
          </button>
          <button
            onClick={deleteSelected}
            disabled={selectedIds.size === 0 || loading}
            className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 font-medium">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Select</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                      <td className="px-6 py-4">
                        {s.id != null && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(s.id)}
                            onChange={() => toggleOne(s.id!)}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.email || '-'}</td>
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

export default Bulk
