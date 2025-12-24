import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStudentById, type Student } from './api'
import { ArrowLeft, GraduationCap, User2 } from 'lucide-react'

function StudentProfile() {
  const { id } = useParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await getStudentById(Number(id))
        setStudent(data)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Student Profile
            </h1>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
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
            <p className="mt-4 text-gray-600">Loading student...</p>
          </div>
        ) : !student ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 font-medium">No student found</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <User2 className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Department</div>
                <div className="text-gray-900 font-medium">{student.department || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 font-medium">{student.email || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">CGPA</div>
                <div className="text-gray-900 font-medium">{student.cgpa != null ? student.cgpa : '-'}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default StudentProfile
