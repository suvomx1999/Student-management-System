import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { getStudentAttendance, type Attendance } from './api'
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 })

  useEffect(() => {
    async function load() {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (user.id) {
            const data = await getStudentAttendance(user.id)
            setAttendance(data)
            
            // Calculate stats
            const present = data.filter(a => a.status === 'present').length
            const absent = data.filter(a => a.status === 'absent').length
            const late = data.filter(a => a.status === 'late').length
            const total = data.length
            const percentage = total > 0 ? ((present + late) / total) * 100 : 0 // Counting late as present for percentage usually
            
            setStats({ present, absent, late, total, percentage })
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function getStatusColor(status: string) {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700'
      case 'absent': return 'bg-red-100 text-red-700'
      case 'late': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'present': return <CheckCircle2 className="w-4 h-4" />
      case 'absent': return <XCircle className="w-4 h-4" />
      case 'late': return <Clock className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <Layout title="My Attendance">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Attendance %</h3>
            <p className={`text-3xl font-bold ${stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Target: 75%</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Classes</h3>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Present</h3>
            <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Absent</h3>
            <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Attendance Log</h3>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading attendance...</div>
          ) : attendance.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
               No attendance records found.
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(record => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
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