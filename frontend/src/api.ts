export type Student = {
  id?: number
  name: string
  department?: string
  email?: string
  password?: string
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

export type Teacher = {
  id?: number
  name: string
  department?: string
  email?: string
  password?: string
  designation?: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const headers = {
  'Content-Type': 'application/json',
}

export async function getStudents(department?: string): Promise<Student[]> {
  const url = department 
    ? `${API_BASE}/api/students?department=${encodeURIComponent(department)}`
    : `${API_BASE}/api/students`
  const res = await fetch(url)
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

export async function createPaymentIntent(amount: number, feeId: number): Promise<{ clientSecret: string }> {
  const res = await fetch(`${API_BASE}/api/payment/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, feeId }),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to create payment intent')
  }
  return res.json()
}

export interface Result {
  id: number
  student: Student
  subject: Subject
  marks: number
}

export interface Fee {
  id: number
  amount: number
  description: string
  status: 'PENDING' | 'PAID'
  dueDate?: string
  paymentDate?: string
  transactionId?: string
  studentName?: string
}

export interface Notice {
  id?: number
  title: string
  content: string
  date?: string
  priority: 'high' | 'normal' | 'low'
}

export async function getStudentFees(studentId: number): Promise<Fee[]> {
  const res = await fetch(`${API_BASE}/api/fees/student/${studentId}`)
  if (!res.ok) throw new Error('Failed to load fees')
  return res.json()
}

export async function getAllFees(): Promise<Fee[]> {
  const res = await fetch(`${API_BASE}/api/fees`)
  if (!res.ok) throw new Error('Failed to load all fees')
  return res.json()
}

export async function payFee(feeId: number): Promise<Fee> {
  const res = await fetch(`${API_BASE}/api/fees/pay/${feeId}`, {
    method: 'POST',
    headers,
  })
  if (!res.ok) throw new Error('Payment failed')
  return res.json()
}

export async function getStudentResults(studentId: number): Promise<Result[]> {
  const res = await fetch(`${API_BASE}/api/results/student/${studentId}`)
  if (!res.ok) throw new Error('Failed to load results')
  return res.json()
}

export async function saveResult(studentId: number, subjectId: number, marks: number): Promise<Result> {
  const res = await fetch(`${API_BASE}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, subjectId, marks })
  })
  if (!res.ok) throw new Error('Failed to save result')
  return res.json()
}

export async function getDepartmentResults(departmentName: string): Promise<Result[]> {
  const res = await fetch(`${API_BASE}/api/results/department/${encodeURIComponent(departmentName)}`)
  if (!res.ok) throw new Error('Failed to load department results')
  return res.json()
}

export async function getNotices(): Promise<Notice[]> {
  const res = await fetch(`${API_BASE}/api/notices`)
  if (!res.ok) throw new Error('Failed to load notices')
  return res.json()
}

export async function createNotice(notice: Omit<Notice, 'id' | 'date'>): Promise<Notice> {
  const res = await fetch(`${API_BASE}/api/notices`, {
    method: 'POST',
    headers,
    body: JSON.stringify(notice),
  })
  if (!res.ok) throw new Error('Failed to create notice')
  return res.json()
}

export async function deleteNotice(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/notices/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete notice')
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

export async function getTeachers(): Promise<Teacher[]> {
  const res = await fetch(`${API_BASE}/api/teachers`)
  if (!res.ok) throw new Error('Failed to load teachers')
  return res.json()
}

export async function getTeacherById(id: number): Promise<Teacher> {
  const res = await fetch(`${API_BASE}/api/teachers/${id}`)
  if (!res.ok) throw new Error('Failed to load teacher')
  return res.json()
}

export async function createTeacher(body: Omit<Teacher, 'id'>): Promise<Teacher> {
  const res = await fetch(`${API_BASE}/api/teachers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create teacher')
  return res.json()
}

export async function updateTeacher(id: number, body: Omit<Teacher, 'id'>): Promise<Teacher> {
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update teacher')
  return res.json()
}

export async function deleteTeacher(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete teacher')
}

export async function login(email: string, password: string): Promise<{ id: number; name: string; role: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json()
}

export type Attendance = {
  id?: number
  studentId: number
  studentName?: string
  date: string
  status: 'present' | 'absent' | 'late'
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  const res = await fetch(`${API_BASE}/api/attendance?date=${date}`)
  if (!res.ok) throw new Error('Failed to load attendance')
  return res.json()
}

export async function saveAttendance(date: string, attendance: Record<number, string>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/attendance?date=${date}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(attendance),
  })
  if (!res.ok) throw new Error('Failed to save attendance')
}

export async function getStudentAttendance(studentId: number): Promise<Attendance[]> {
  const res = await fetch(`${API_BASE}/api/attendance/student/${studentId}`)
  if (!res.ok) throw new Error('Failed to load student attendance')
  return res.json()
}
