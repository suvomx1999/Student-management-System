import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Building2, 
  BookOpen, 
  Users, 
  BarChart3, 
  Search, 
  Database, 
  LogOut,
  GraduationCap,
  Menu,
  Moon,
  Sun,
  CalendarCheck,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'

type LayoutProps = {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

export default function Layout({ children, title, actions }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })
  const navigate = useNavigate()

  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
    
    // Get user role
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserRole(user.role)
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
  }, [theme])

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  function onLogout() {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  const allNavItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN'] },
    { to: '/my-profile', icon: Users, label: 'My Profile', roles: ['STUDENT'] },
    { to: '/results', icon: ClipboardList, label: 'Results', roles: ['ADMIN'] },
    { to: '/departments', icon: Building2, label: 'Departments', roles: ['ADMIN'] },
    { to: '/subjects', icon: BookOpen, label: 'Subjects', roles: ['ADMIN'] },
    { to: '/teachers', icon: Users, label: 'Faculty', roles: ['ADMIN'] },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['ADMIN'] },
    { to: '/notices', icon: FileText, label: 'Notices', roles: ['ADMIN', 'STUDENT'] },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['ADMIN'] },
    { to: '/search', icon: Search, label: 'Search', roles: ['ADMIN'] },
    { to: '/data', icon: Database, label: 'Data', roles: ['ADMIN'] },
  ]

  const navItems = allNavItems.filter(item => {
    if (!userRole) return false
    return item.roles.includes(userRole)
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Student CRM</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Management System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Mobile Only / Breadcrumbs) */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-semibold text-slate-900 dark:text-white">Student CRM</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            {(title || actions) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {title && (
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                )}
                {actions && (
                  <div className="flex items-center gap-3">
                    {actions}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
