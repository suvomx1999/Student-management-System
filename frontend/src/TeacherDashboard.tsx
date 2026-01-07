import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { getNotices, getTeacherById, getSubjectsByDepartment, getStudents, type Notice, type Subject, type Student } from './api'
import { Users, BookOpen } from 'lucide-react'

export default function TeacherDashboard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teacherName, setTeacherName] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return

        const user = JSON.parse(storedUser)
        setTeacherName(user.name)

        // Load Notices
        const noticesData = await getNotices()
        setNotices(noticesData)

        // Load Teacher Details to get Department
        if (user.id) {
          const teacher = await getTeacherById(user.id)
          if (teacher.department) {
            setDepartment(teacher.department)
            
            // Load Subjects & Students for Department
            const [subjectsData, studentsData] = await Promise.all([
              getSubjectsByDepartment(teacher.department),
              getStudents(teacher.department)
            ])
            setSubjects(subjectsData)
            setStudents(studentsData)
          }
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      } finally {
        // setLoading(false)
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
    <Layout title="Teacher Dashboard">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome back, {teacherName}</h2>
          <p className="text-slate-600">
            {department ? `Department of ${department}` : 'Manage your classes and view student progress.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">My Subjects</p>
                <h3 className="text-2xl font-bold text-slate-900">{subjects.length}</h3>
              </div>
            </div>
            <div className="space-y-3">
              {subjects.slice(0, 5).map(sub => (
                <div key={sub.id} className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md">
                  {sub.name}
                </div>
              ))}
              {subjects.length > 5 && (
                <p className="text-xs text-slate-500 text-center">+ {subjects.length - 5} more</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Department Students</p>
                <h3 className="text-2xl font-bold text-slate-900">{students.length}</h3>
              </div>
            </div>
            <div className="space-y-3">
              {students.slice(0, 5).map(stu => (
                <div key={stu.id} className="flex justify-between items-center text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md">
                  <span>{stu.name}</span>
                  <span className="text-slate-400 text-xs">{stu.email}</span>
                </div>
              ))}
              {students.length > 5 && (
                <p className="text-xs text-slate-500 text-center">+ {students.length - 5} more</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Notices</h3>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-slate-500 text-sm">No notices available.</p>
            ) : (
              notices.slice(0, 3).map(notice => (
                <div key={notice.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(notice.date || Date.now()).toLocaleDateString()}
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
