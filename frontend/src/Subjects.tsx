import { useEffect, useMemo, useState } from 'react'
import { createSubject, deleteSubject, getDepartments, getSubjectsByDepartment, type Department, type Subject } from './api'
import Layout from './components/Layout'
import { Filter, ListPlus, Trash2, BookOpen } from 'lucide-react'

function Subjects() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [selected, setSelected] = useState<string>('All')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSubject, setNewSubject] = useState('')

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
    if (!confirm('Are you sure you want to delete this subject?')) return
    try {
      await deleteSubject(id)
      await loadSubjects(selected)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <Layout title="Department Subjects">
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
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

          {/* Filter Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
             <div className="relative w-full flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400 absolute left-3" />
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none bg-white"
              >
                {deptOptions.map((d) => (
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {selected !== 'All' && (
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <form onSubmit={onAddSubject} className="flex items-center gap-3">
                <input
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Add subject name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  <ListPlus className="w-4 h-4" />
                  Add
                </button>
              </form>
            </div>
          )}

          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No subjects found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                    {selected === 'All' && (
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    )}
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{s.name}</td>
                      {selected === 'All' && (
                        <td className="p-4 text-slate-600">{s.department || '-'}</td>
                      )}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteSubject(s.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </Layout>
  )
}

export default Subjects
