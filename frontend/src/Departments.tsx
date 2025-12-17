import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, type Student } from './api'
import { GraduationCap, Filter, Users, ArrowLeft } from 'lucide-react'

function Departments() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const departments = useMemo(() => {
    const names = Array.from(
      new Set(
        (students || [])
          .map((s) => s.department?.trim())
          .filter((d): d is string => !!d && d.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b))
    return ['All', ...names]
  }, [students])

  const filtered = useMemo(() => {
    if (selectedDept === 'All') return students
    return students.filter((s) => (s.department ?? '').trim() === selectedDept)
  }, [students, selectedDept])

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
                  Department Filter
                </h1>
                <p className="text-sm text-gray-500">View students by department</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">{filtered.length} Shown</span>
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
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 font-medium">No students in this department</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      CGPA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.cgpa != null ? s.cgpa.toFixed(2) : '-'}</td>
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

export default Departments
