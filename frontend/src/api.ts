export type Student = {
  id?: number
  name: string
  department?: string
  email?: string
  cgpa?: number
}

export type Department = {
  id: number
  name: string
}

export type Subject = {
  id: number
  name: string
  department?: string
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

export async function getDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/api/departments`)
  if (!res.ok) throw new Error('Failed to load departments')
  return res.json()
}

export async function getStudentById(id: number): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students/${id}`)
  if (res.status === 404) throw new Error('Student not found')
  if (!res.ok) throw new Error('Failed to load student')
  return res.json()
}

export async function getSubjectsByDepartment(department: string): Promise<Subject[]> {
  const res = await fetch(`${API_BASE}/api/subjects?department=${encodeURIComponent(department)}`)
  if (!res.ok) throw new Error('Failed to load subjects')
  return res.json()
}

export async function createSubject(name: string, department: string): Promise<Subject> {
  const res = await fetch(`${API_BASE}/api/subjects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, department }),
  })
  if (!res.ok) throw new Error('Failed to create subject')
  return res.json()
}

export async function deleteSubject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/subjects/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete subject')
}
