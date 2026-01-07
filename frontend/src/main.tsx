import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import ProtectedRoute from './ProtectedRoute'
import Results from './Results'
import Departments from './Departments'
import Subjects from './Subjects'
import StudentProfile from './StudentProfile'
import DepartmentOverview from './DepartmentOverview'
import Analytics from './Analytics'
import Search from './Search'
import Data from './Data'
import Teachers from './Teachers'
import TeacherDashboard from './TeacherDashboard'
import TeacherAttendance from './TeacherAttendance'
import TeacherResults from './TeacherResults'
import StudentDashboard from './StudentDashboard'
import StudentResults from './StudentResults'
import StudentAttendance from './StudentAttendance'
import StudentFees from './StudentFees'
import Attendance from './Attendance'
import Notices from './Notices'
import AdminFees from './AdminFees'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-attendance"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-results"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/my-results" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResults /></ProtectedRoute>} />
        <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAttendance /></ProtectedRoute>} />
        <Route path="/my-fees" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentFees /></ProtectedRoute>} />
        <Route
          path="/fees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview/:name"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Data />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT', 'TEACHER']}>
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
