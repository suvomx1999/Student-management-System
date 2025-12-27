import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
  allowedRoles?: string[]
}

function ProtectedRoute({ children, allowedRoles }: Props) {
  const navigate = useNavigate()
  const isAuth = localStorage.getItem('isAuthenticated') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!isAuth) return
    let timeout: number | undefined
    let lastActive = Date.now()
    const limitMs = 15 * 60 * 1000
    const reset = () => {
      lastActive = Date.now()
      if (timeout) window.clearTimeout(timeout)
      timeout = window.setTimeout(check, limitMs)
    }
    const check = () => {
      const now = Date.now()
      if (now - lastActive >= limitMs) {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('user')
        navigate('/', { replace: true })
      } else {
        reset()
      }
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    reset()
    return () => {
      if (timeout) window.clearTimeout(timeout)
      events.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [navigate, isAuth])

  if (!isAuth) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If student tries to access admin route, send to profile
    if (user.role === 'STUDENT') {
      return <Navigate to="/my-profile" replace />
    }
    // Otherwise send to home/login
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
