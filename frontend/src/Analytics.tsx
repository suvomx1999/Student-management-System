import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, type Student } from './api'
import { BarChart3, ArrowLeft, GraduationCap } from 'lucide-react'

function Analytics() {
  const [students, setStudents] = useState<Student[]>([])
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

  const deptAvg = useMemo(() => {
    const groups = new Map<string, number[]>()
    for (const s of students) {
      const dept = (s.department || 'Unassigned').trim()
      if (!groups.has(dept)) groups.set(dept, [])
      if (s.cgpa != null) groups.get(dept)!.push(s.cgpa)
    }
    return Array.from(groups.entries()).map(([dept, vals]) => {
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
      return { dept, avg: avg != null ? Number(avg.toFixed(2)) : null, count: vals.length }
    }).sort((a, b) => a.dept.localeCompare(b.dept))
  }, [students])

  const dist = useMemo(() => {
    // Buckets: 0–2, 2–4, 4–6, 6–8, 8–10
    const buckets = [
      { label: '0–2', min: 0, max: 2 },
      { label: '2–4', min: 2, max: 4 },
      { label: '4–6', min: 4, max: 6 },
      { label: '6–8', min: 6, max: 8 },
      { label: '8–10', min: 8, max: 10.01 },
    ]
    const counts = buckets.map(() => 0)
    for (const s of students) {
      const v = s.cgpa
      if (v == null) continue
      const idx = buckets.findIndex((b) => v >= b.min && v < b.max)
      if (idx !== -1) counts[idx]++
    }
    return buckets.map((b, i) => ({ label: b.label, count: counts[i] }))
  }, [students])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Results Analytics
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
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">CGPA Distribution</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
                {dist.map((b) => (
                  <div key={b.label} className="text-center">
                    <div className="text-sm text-gray-600">{b.label}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">{b.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Average CGPA by Department</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Department</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Avg CGPA</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deptAvg.map((row) => (
                      <tr key={row.dept} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{row.dept}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.avg ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Analytics
