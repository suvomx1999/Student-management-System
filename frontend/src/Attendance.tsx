import { useState, useEffect } from 'react'
import { getStudents, getAttendanceByDate, saveAttendance as apiSaveAttendance, type Student } from './api'
import Layout from './components/Layout'
import { Calendar, Save, CheckCircle2, XCircle, Clock } from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'late'

type AttendanceRecord = {
  [studentId: number]: AttendanceStatus
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<AttendanceRecord>({})
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    async function load() {
      try {
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
  }, [date])

  async function loadStudents() {
    try {
      const data = await getStudents()
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
      await apiSaveAttendance(date, attendance)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
      alert('Failed to save attendance')
    }
  }

  function markAll(status: AttendanceStatus) {
    const newAttendance: AttendanceRecord = {}
    students.forEach(s => {
      if (s.id) newAttendance[s.id] = status
    })
    setAttendance(newAttendance)
    setSaved(false)
  }

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    late: Object.values(attendance).filter(s => s === 'late').length,
    total: students.length
  }

  return (
    <Layout title="Attendance" actions={
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Present</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.present}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Absent</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.absent}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Late</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.late}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            Mark All Present
          </button>
          <button onClick={() => markAll('absent')} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            Mark All Absent
          </button>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">Loading students...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">No students found.</td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{student.department}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => student.id && handleStatusChange(student.id, 'present')}
                            className={`p-2 rounded-lg transition-all ${
                              attendance[student.id!] === 'present'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500/20'
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
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500/20'
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
                                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 ring-2 ring-yellow-500/20'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title="Late"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
