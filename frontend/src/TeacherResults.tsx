import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { getTeacherById, getSubjectsByDepartment, getStudents, getDepartmentResults, saveResult, type Subject, type Student, type Result } from './api'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function TeacherResults() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [marks, setMarks] = useState<{[studentId: number]: string}>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [department, setDepartment] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (user.id) {
            const teacher = await getTeacherById(user.id)
            if (teacher.department) {
              setDepartment(teacher.department)
              
              const [subs, studs, res] = await Promise.all([
                getSubjectsByDepartment(teacher.department),
                getStudents(teacher.department),
                getDepartmentResults(teacher.department)
              ])
              
              setSubjects(subs)
              setStudents(studs)
              setResults(res)
              
              if (subs.length > 0) {
                setSelectedSubject(subs[0].id)
              }
            }
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Update marks state when subject changes or results load
  useEffect(() => {
    if (!selectedSubject) return

    const currentMarks: {[key: number]: string} = {}
    
    // Pre-fill with existing results
    results.forEach(r => {
      if (r.subject.id === selectedSubject && r.student.id) {
        currentMarks[r.student.id] = String(r.marks)
      }
    })
    
    setMarks(currentMarks)
  }, [selectedSubject, results])

  async function handleSave(studentId: number) {
    if (!selectedSubject) return
    const markValue = marks[studentId]
    if (!markValue || isNaN(parseFloat(markValue))) return

    setSaving(true)
    try {
      await saveResult(studentId, selectedSubject, parseFloat(markValue))
      
      // Update local results state
      const updatedResults = await getDepartmentResults(department)
      setResults(updatedResults)
      
      // Show success feedback (could be a toast, simple alert for now)
      // alert('Saved!') 
    } catch (e) {
      console.error(e)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="Enter Results">
      <div className="space-y-6">
        {/* Subject Selector */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Subject</label>
          <select
            value={selectedSubject || ''}
            onChange={e => setSelectedSubject(Number(e.target.value))}
            className="w-full md:w-1/3 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading data...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No / Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase w-48">Marks (0-100)</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                      <td className="px-6 py-4 text-slate-500">{student.email}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={marks[student.id!] || ''}
                          onChange={e => setMarks({...marks, [student.id!]: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Enter marks"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => student.id && handleSave(student.id)}
                          disabled={saving}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
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