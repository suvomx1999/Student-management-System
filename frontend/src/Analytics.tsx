import { useEffect, useMemo, useState } from 'react'
import { getStudents, type Student } from './api'
import Layout from './components/Layout'
import { BarChart3, Users, Calculator } from 'lucide-react'

function Analytics() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const overallAvg = useMemo(() => {
    if (students.length === 0) return 0
    const total = students.reduce((acc, s) => acc + (s.cgpa || 0), 0)
    return (total / students.length).toFixed(2)
  }, [students])

  return (
    <Layout title="Results Analytics">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <h3 className="text-2xl font-bold text-slate-900">{students.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Average CGPA</p>
                <h3 className="text-2xl font-bold text-slate-900">{overallAvg}</h3>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading analytics...</div>
        ) : (
          <>
            {/* Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">CGPA Distribution</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-5 gap-4 h-48 items-end">
                  {dist.map((b) => {
                    const maxCount = Math.max(...dist.map(d => d.count))
                    const height = maxCount > 0 ? (b.count / maxCount) * 100 : 0
                    return (
                      <div key={b.label} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="relative w-full max-w-[60px]">
                          <div 
                            className="w-full bg-indigo-100 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-200"
                            style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                          />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            {b.count}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-slate-500">{b.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Department Averages */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Average CGPA by Department</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg CGPA</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptAvg.map((row) => (
                      <tr key={row.dept} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{row.dept}</td>
                        <td className="p-4">
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${(row.avg || 0) >= 3.5 ? 'bg-green-100 text-green-800' : 
                              (row.avg || 0) >= 3.0 ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}
                          `}>
                            {row.avg ?? '-'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Analytics
