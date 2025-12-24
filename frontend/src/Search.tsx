import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, type Student } from './api'
import { Filter, GraduationCap, ArrowLeft } from 'lucide-react'

function Search() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nameQuery, setNameQuery] = useState('')
  const [emailQuery, setEmailQuery] = useState('')
  const [dept, setDept] = useState('All')
  const [minCgpa, setMinCgpa] = useState<string>('')
  const [maxCgpa, setMaxCgpa] = useState<string>('')

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

  const departments = useMemo(() => {
    const names = Array.from(new Set((students || [])
      .map((s) => s.department?.trim())
      .filter((d): d is string => !!d && d.length > 0)))
      .sort((a, b) => a.localeCompare(b))
    return ['All', ...names]
  }, [students])

  const filtered = useMemo(() => {
    const nq = nameQuery.trim().toLowerCase()
    const eq = emailQuery.trim().toLowerCase()
    const min = minCgpa.trim() === '' ? null : parseFloat(minCgpa)
    const max = maxCgpa.trim() === '' ? null : parseFloat(maxCgpa)
    return students.filter((s) => {
      const nameOk = (s.name || '').toLowerCase().includes(nq)
      const emailOk = (s.email || '').toLowerCase().includes(eq)
      const deptOk = dept === 'All' || (s.department ?? '').trim() === dept
      const val = s.cgpa
      const cgpaOk =
        (min == null || (val != null && val >= min)) &&
        (max == null || (val != null && val <= max))
      return nameOk && emailOk && deptOk && cgpaOk
    })
  }, [students, nameQuery, emailQuery, dept, minCgpa, maxCgpa])

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
                  Advanced Search
                </h1>
                <p className="text-sm text-gray-500">Filter students with multiple criteria</p>
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
            <div className="flex flex-wrap gap-3 w-full">
              <input
                placeholder="Name contains"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                className="flex-1 min-w-[180px] rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
              <input
                placeholder="Email contains"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                className="flex-1 min-w-[180px] rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="Min CGPA"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="w-32 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="Max CGPA"
                value={maxCgpa}
                onChange={(e) => setMaxCgpa(e.target.value)}
                className="w-32 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 font-medium">No students match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
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
                      <td className="px-6 py-4 text-sm text-gray-600">{s.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.email || '-'}</td>
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

export default Search
