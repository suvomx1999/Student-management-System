import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, type Student } from './api'
import Layout from './components/Layout'
import { Filter, Search as SearchIcon, Mail, Building2, GraduationCap } from 'lucide-react'

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
    <Layout title="Advanced Search">
      <div className="space-y-6">
        {/* Filter Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-500 font-medium">
            <Filter className="w-5 h-5" />
            <h3>Filters</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Name contains..."
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Email contains..."
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="Min CGPA"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="Max CGPA"
                value={maxCgpa}
                onChange={(e) => setMaxCgpa(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No students match your filters</div>
          ) : (
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
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <button
                          onClick={() => s.id != null && navigate(`/students/${s.id}`)}
                          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="p-4 text-slate-600">{s.department || '-'}</td>
                      <td className="p-4 text-slate-600">{s.email || '-'}</td>
                      <td className="p-4">
                        <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${(s.cgpa || 0) >= 3.5 ? 'bg-green-100 text-green-800' : 
                              (s.cgpa || 0) >= 3.0 ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}
                          `}>
                            {s.cgpa != null ? s.cgpa.toFixed(2) : '-'}
                        </span>
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

export default Search
