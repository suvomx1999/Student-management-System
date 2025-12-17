export type Student = {
  id?: number
  name: string
  department?: string
  email?: string
  cgpa?: number
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const headers = {
  'Content-Type': 'application/json',
}

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/api/students`)
  if (!res.ok) throw new Error('Failed to load students')
  return res.json()
}

export async function createStudent(body: Omit<Student, 'id'>): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create student')
  return res.json()
}

export async function updateStudent(id: number, body: Omit<Student, 'id'>): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update student')
  return res.json()
}

export async function deleteStudent(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/students/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete student')
}

export async function updateCgpa(id: number, cgpa: number | null): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students/${id}/cgpa`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ cgpa }),
  })
  if (!res.ok) throw new Error('Failed to update CGPA')
  return res.json()
}
