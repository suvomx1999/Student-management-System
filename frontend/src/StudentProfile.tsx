import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStudentById, updateStudent, getStudentAttendance, type Student, type Attendance } from './api'
import { ArrowLeft, User2, Mail, Building2, GraduationCap, Calendar, CheckCircle2, XCircle, Clock, KeyRound } from 'lucide-react'
import Layout from './components/Layout'

function StudentProfile() {
  const { id } = useParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      // Determine ID: either from URL param or from logged-in user context
      let targetId = id ? Number(id) : null
      
      if (!targetId) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (user.role === 'STUDENT') {
            targetId = user.id
          }
        }
      }

      if (!targetId) {
        setError("No student ID provided")
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await getStudentById(targetId)
        setStudent(data)
        
        // Load attendance
        const attData = await getStudentAttendance(targetId)
        setAttendance(attData)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handlePasswordChange() {
    if (!student?.id || !newPassword) return
    try {
      await updateStudent(student.id, { 
        name: student.name,
        department: student.department,
        email: student.email,
        password: newPassword 
      })
      setPasswordMessage('Password updated successfully')
      setNewPassword('')
      setShowPasswordForm(false)
      setTimeout(() => setPasswordMessage(''), 3000)
    } catch (e) {
      setPasswordMessage('Failed to update password')
    }
  }

  const attStats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    total: attendance.length
  }

  return (
    <Layout
      title="Student Profile"
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
          <div className="p-12 text-center text-slate-500">Loading student...</div>
        ) : !student ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-medium">No student found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                <User2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{student.name}</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Department</div>
                  <div className="mt-1 text-slate-900 font-medium">{student.department || '-'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="mt-1 text-slate-900 font-medium">{student.email || '-'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">CGPA</div>
                  <div className="mt-1 text-slate-900 font-medium">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold
                      ${(student.cgpa || 0) >= 3.5 ? 'bg-green-100 text-green-800' : 
                        (student.cgpa || 0) >= 3.0 ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}
                    `}>
                      {student.cgpa != null ? student.cgpa : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Attendance Overview */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Attendance Overview</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">{attStats.present}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-700">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">{attStats.absent}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{attStats.late}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {attendance.length === 0 ? (
                  <p className="text-slate-500 text-sm">No attendance records found.</p>
                ) : (
                  attendance.slice(0, 5).map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{att.date}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${
                        att.status === 'present' ? 'bg-green-100 text-green-700' :
                        att.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Account Settings / Password */}
            <div className="p-6 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Account Settings</h3>
              </div>
              
              {passwordMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMessage.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {passwordMessage}
                </div>
              )}

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline"
                >
                  Change Password
                </button>
              ) : (
                <div className="max-w-md bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-50"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={handlePasswordChange}
                      disabled={!newPassword}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => { setShowPasswordForm(false); setNewPassword('') }}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}


export default StudentProfile
