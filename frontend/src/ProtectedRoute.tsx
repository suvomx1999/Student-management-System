import { Navigate } from 'react-router-dom'

type Props = {
  children: React.ReactNode
}

function ProtectedRoute({ children }: Props) {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true'
  if (!isAuth) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default ProtectedRoute
