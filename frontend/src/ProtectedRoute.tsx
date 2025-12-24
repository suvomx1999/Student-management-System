import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}

function ProtectedRoute({ children }: Props) {
  const navigate = useNavigate()
  const isAuth = localStorage.getItem('isAuthenticated') === 'true'
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
  return <>{children}</>
}

export default ProtectedRoute
