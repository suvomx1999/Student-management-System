import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStudent, getStudents, type Student } from './api'
import { ArrowLeft, UploadCloud, DownloadCloud, GraduationCap } from 'lucide-react'

function toCsv(rows: Student[]) {
  const header = ['name', 'department', 'email', 'cgpa']
  const lines = rows.map((s) =>
    [
      s.name ?? '',
      s.department ?? '',
      s.email ?? '',
      s.cgpa != null ? String(s.cgpa) : '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function parseCsv(text: string): Omit<Student, 'id'>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  const idx = {
    name: header.indexOf('name'),
    department: header.indexOf('department'),
    email: header.indexOf('email'),
    cgpa: header.indexOf('cgpa'),
  }
  const rows = lines.slice(1).map((line) => {
    const cols = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"')) ?? []
    const name = cols[idx.name] ?? ''
    const department = cols[idx.department] ?? ''
    const email = cols[idx.email] ?? ''
    const cgpaStr = cols[idx.cgpa] ?? ''
    const cgpa = cgpaStr === '' ? undefined : parseFloat(cgpaStr)
    return { name, department, email, cgpa }
  })
  return rows.filter((r) => r.name.trim().length > 0)
}

function Data() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState<number | null>(null)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getStudents()
        setStudents(data)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function exportCsv() {
    const csv = toCsv(students)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setUploadCount(null)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      let count = 0
      for (const r of rows) {
        await createStudent(r)
        count++
      }
      setUploadCount(count)
      const data = await getStudents()
      setStudents(data)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Import / Export
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
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-700">
                <DownloadCloud className="w-5 h-5" />
                <span className="font-medium">Export Students (CSV)</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Downloads current students as CSV with columns: name, department, email, cgpa.</p>
              <button
                onClick={exportCsv}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Download CSV
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-700">
                <UploadCloud className="w-5 h-5" />
                <span className="font-medium">Import Students (CSV)</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Upload a CSV with columns: name, department, email, cgpa. Missing columns are treated as empty.</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={importCsv}
                disabled={uploading}
                className="mt-3"
              />
              {uploading && <p className="mt-2 text-sm text-gray-600">Uploading...</p>}
              {uploadCount != null && <p className="mt-2 text-sm text-gray-600">Imported {uploadCount} students</p>}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.cgpa != null ? s.cgpa.toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Data
