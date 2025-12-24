import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStudents, getSubjectsByDepartment, type Student, type Subject } from './api'
import { GraduationCap, Users, BookOpen, ArrowLeft } from 'lucide-react'

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
                  {dept && dept !== 'All' ? `${dept} Overview` : 'All Departments Overview'}
                </h1>
                <p className="text-sm text-gray-500">Students and subjects summary</p>
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
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading overview...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Students</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{students.length}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Subjects</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{subjects.length}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="w-5 h-5" />
                  <span className="font-medium">Average CGPA</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{avgCgpa ?? '-'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Students</h2>
              </div>
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
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.department || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.email || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.cgpa != null ? s.cgpa : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {dept && dept !== 'All' && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subjects.map((s) => (
                        <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default DepartmentOverview
