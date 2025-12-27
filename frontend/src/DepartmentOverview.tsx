import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStudents, getSubjectsByDepartment, type Student, type Subject } from './api'
import { Users, BookOpen, ArrowLeft, Calculator } from 'lucide-react'
import Layout from './components/Layout'

function DepartmentOverview() {
  const { name } = useParams()
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const dept = (name || '').trim()

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const all = await getStudents()
        const filtered = dept ? all.filter((s) => (s.department ?? '').trim() === dept) : all
        setStudents(filtered)
        if (dept && dept !== 'All') {
          const subs = await getSubjectsByDepartment(dept)
          setSubjects(subs)
        } else {
          setSubjects([])
        }
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dept])

  const avgCgpa = useMemo(() => {
    const vals = students.map((s) => s.cgpa).filter((v): v is number => v != null)
    if (vals.length === 0) return null
    const sum = vals.reduce((a, b) => a + b, 0)
    return Number((sum / vals.length).toFixed(2))
  }, [students])

  return (
    <Layout
      title={dept && dept !== 'All' ? `${dept} Overview` : 'All Departments Overview'}
      actions={
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading overview...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Subjects</p>
                    <h3 className="text-2xl font-bold text-slate-900">{subjects.length}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Average CGPA</p>
                    <h3 className="text-2xl font-bold text-slate-900">{avgCgpa ?? '-'}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Students</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{s.name}</td>
                        <td className="p-4 text-slate-600">{s.department || '-'}</td>
                        <td className="p-4 text-slate-600">{s.email || '-'}</td>
                        <td className="p-4 font-medium text-slate-900">{s.cgpa != null ? s.cgpa : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subjects List */}
            {dept && dept !== 'All' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-semibold text-slate-900">Subjects</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-medium text-slate-900">{s.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}


export default DepartmentOverview
