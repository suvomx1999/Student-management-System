import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { getStudentResults, type Result } from './api'
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react'

export default function StudentResults() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [cgpa, setCgpa] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (user.id) {
            const data = await getStudentResults(user.id)
            setResults(data)
            
            // Calculate CGPA (simple average for now)
            if (data.length > 0) {
              const total = data.reduce((sum, r) => sum + r.marks, 0)
              setCgpa(total / data.length / 10) // Assuming marks out of 100, CGPA out of 10
            }
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

  function getGrade(marks: number) {
    if (marks >= 90) return 'O'
    if (marks >= 80) return 'E'
    if (marks >= 70) return 'A'
    if (marks >= 60) return 'B'
    if (marks >= 50) return 'C'
    if (marks >= 40) return 'D'
    return 'F'
  }

  function getGradeColor(grade: string) {
    if (grade === 'O' || grade === 'E') return 'text-green-600 bg-green-50'
    if (grade === 'A' || grade === 'B') return 'text-blue-600 bg-blue-50'
    if (grade === 'C' || grade === 'D') return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <Layout title="My Results">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-slate-500">CGPA</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{cgpa ? cgpa.toFixed(2) : 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-1">Cumulative Grade Point Average</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-slate-500">Subjects Cleared</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {results.filter(r => r.marks >= 40).length} / {results.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Based on passing marks (40)</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Subject Wise Performance</h3>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading results...</div>
          ) : results.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
               No results found.
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Marks</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map(result => {
                    const grade = getGrade(result.marks)
                    return (
                      <tr key={result.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{result.subject.name}</td>
                        <td className="px-6 py-4 text-slate-500">{result.subject.department}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">{result.marks}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${getGradeColor(grade)}`}>
                            {grade}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}