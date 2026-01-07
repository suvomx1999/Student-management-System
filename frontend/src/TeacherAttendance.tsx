import { useState, useEffect } from 'react'
import { getStudents, getAttendanceByDate, saveAttendance as apiSaveAttendance, getTeacherById, type Student } from './api'
import Layout from './components/Layout'
import { Calendar, Save, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'late'

type AttendanceRecord = {
  [studentId: number]: AttendanceStatus
}

export default function TeacherAttendance() {
  const [students, setStudents] = useState<Student[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<AttendanceRecord>({})
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
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
              loadStudents(teacher.department)
            }
          }
        }
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    async function load() {
      if (!department) return
      try {
        // This gets ALL attendance for the date, we will filter by our students in render or here
        // Ideally backend should support filtering by department, but for now we can filter client side
        // since we only display our department students anyway.
        const data = await getAttendanceByDate(date)
        const newAttendance: AttendanceRecord = {}
        data.forEach(r => {
          newAttendance[r.studentId] = r.status
        })
        setAttendance(newAttendance)
      } catch (e) {
        console.error(e)
      }
    }
    load()
    setSaved(false)
  }, [date, department])

  async function loadStudents(dept: string) {
    try {
      const data = await getStudents(dept)
      setStudents(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleStatusChange(studentId: number, status: AttendanceStatus) {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
    setSaved(false)
  }

  async function saveAttendance() {
    try {
      // Only save attendance for students in my department
      const attendanceToSave: AttendanceRecord = {}
      students.forEach(s => {
        if (s.id && attendance[s.id]) {
          attendanceToSave[s.id] = attendance[s.id]
        }
      })
      
      await apiSaveAttendance(date, attendanceToSave)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
      alert('Failed to save attendance')
    }
  }

  function markAll(status: AttendanceStatus) {
    const newAttendance: AttendanceRecord = { ...attendance }
    students.forEach(s => {
      if (s.id) newAttendance[s.id] = status
    })
    setAttendance(newAttendance)
    setSaved(false)
  }

  const stats = {
    present: students.filter(s => s.id && attendance[s.id] === 'present').length,
    absent: students.filter(s => s.id && attendance[s.id] === 'absent').length,
    late: students.filter(s => s.id && attendance[s.id] === 'late').length,
    total: students.length
  }

  return (
    <Layout title={`Attendance - ${department}`} actions={
      <div className="flex items-center gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          onClick={saveAttendance}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Attendance'}
        </button>
      </div>
    }>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Present</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.present}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Absent</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.absent}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Late</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.late}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => markAll('present')}
            className="text-sm px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-medium transition-colors"
          >
            Mark All Present
          </button>
          <button 
            onClick={() => markAll('absent')}
            className="text-sm px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-medium transition-colors"
          >
            Mark All Absent
          </button>
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No students found in {department} department.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{student.email}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => student.id && handleStatusChange(student.id, 'present')}
                            className={`p-2 rounded-lg transition-all ${
                              attendance[student.id!] === 'present'
                                ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title="Present"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => student.id && handleStatusChange(student.id, 'absent')}
                            className={`p-2 rounded-lg transition-all ${
                              attendance[student.id!] === 'absent'
                                ? 'bg-red-100 text-red-700 ring-2 ring-red-500/20'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title="Absent"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => student.id && handleStatusChange(student.id, 'late')}
                            className={`p-2 rounded-lg transition-all ${
                              attendance[student.id!] === 'late'
                                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500/20'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title="Late"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        </div>
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