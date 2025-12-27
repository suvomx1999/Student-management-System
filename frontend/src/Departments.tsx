import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, type Student } from './api'
import Layout from './components/Layout'
import { Filter, Users, LayoutDashboard } from 'lucide-react'

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
    <Layout
      title="Department Filter"
      actions={
        <button
          onClick={() => navigate(`/overview/${selectedDept}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>
      }
    >
      <div className="space-y-6">
        {/* Stats / Filter Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Students Shown</p>
                <h3 className="text-2xl font-bold text-slate-900">{filtered.length}</h3>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <div className="relative w-full flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400 absolute left-3" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No students found in this department.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <button
                          onClick={() => s.id && navigate(`/students/${s.id}`)}
                          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="p-4 text-slate-600">{s.department || '-'}</td>
                      <td className="p-4 text-slate-600 font-medium">
                        {s.cgpa != null ? s.cgpa.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Departments
