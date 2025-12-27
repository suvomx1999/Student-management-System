import { useEffect, useRef, useState } from 'react'
import { createStudent, getStudents, type Student } from './api'
import Layout from './components/Layout'
import { UploadCloud, DownloadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react'

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
    <Layout title="Import / Export">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Export Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Export Data</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Download all student records as a CSV file. The file will include name, department, email, and CGPA.
            </p>
            <button
              onClick={exportCsv}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm"
            >
              Download CSV
            </button>
          </div>

          {/* Import Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Import Data</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Upload a CSV file to add multiple students at once. Required columns: name, department, email, cgpa.
            </p>
            <div className="relative">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={importCsv}
                disabled={uploading}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className={`
                  w-full py-2.5 flex items-center justify-center gap-2 rounded-lg font-medium shadow-sm cursor-pointer transition-all
                  ${uploading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }
                `}
              >
                {uploading ? 'Importing...' : 'Select CSV File'}
              </label>
            </div>
            {uploadCount != null && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Successfully imported {uploadCount} students
              </div>
            )}
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900">Current Data Preview</h3>
          </div>
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{s.name}</td>
                      <td className="p-4 text-slate-600">{s.department || '-'}</td>
                      <td className="p-4 text-slate-600">{s.email || '-'}</td>
                      <td className="p-4 text-slate-600">{s.cgpa != null ? s.cgpa.toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                  {students.length > 5 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-sm text-slate-500 bg-slate-50/30">
                        ... and {students.length - 5} more records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Data
