import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { getNotices, getStudentResults, getStudentAttendance, type Notice, type Result, type Attendance } from './api'
import { Bell, Trophy, CalendarCheck, BookOpen } from 'lucide-react'

export default function StudentDashboard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [studentName, setStudentName] = useState('')
  const [cgpa, setCgpa] = useState<number | null>(null)
  const [attendancePercent, setAttendancePercent] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setStudentName(user.name)

          if (user.id) {
            const [noticesData, resultsData, attData] = await Promise.all([
              getNotices(),
              getStudentResults(user.id),
              getStudentAttendance(user.id)
            ])
            
            setNotices(noticesData)
            
            // Calculate CGPA
            if (resultsData.length > 0) {
              const total = resultsData.reduce((sum, r) => sum + r.marks, 0)
              setCgpa(total / resultsData.length / 10)
            }
            
            // Calculate Attendance
            const present = attData.filter(a => a.status === 'present' || a.status === 'late').length
            const totalAtt = attData.length
            setAttendancePercent(totalAtt > 0 ? (present / totalAtt) * 100 : 0)
          }
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'low': return 'bg-slate-100 text-slate-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back, {studentName}</h2>
          <p className="text-slate-600">Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-slate-500">My CGPA</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{cgpa ? cgpa.toFixed(2) : 'N/A'}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-slate-500">Attendance</h3>
            </div>
            <p className={`text-3xl font-bold ${attendancePercent >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {attendancePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <Bell className="w-5 h-5 text-indigo-600" />
             <h3 className="text-lg font-semibold text-slate-900">Notice Board</h3>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading notices...</p>
            ) : notices.length === 0 ? (
              <p className="text-slate-500 text-sm">No notices available.</p>
            ) : (
              notices.slice(0, 5).map(notice => (
                <div key={notice.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                      <span className="text-xs text-slate-500">
                        {notice.date ? new Date(notice.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900">{notice.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notice.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}