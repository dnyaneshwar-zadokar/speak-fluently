import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filter links based on user role
  const filteredLinks = links.filter(link => {
    if (link.to === '/admin') {
      return user?.isAdmin;
    }
    return true;
  });

  return (
    <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              SB
            </div>
            <div>
              <p className="text-base font-display font-semibold text-neutral-800 leading-tight">
                Speak Better
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {filteredLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-neutral-800">{user?.username || user?.name || 'Learner'}</p>
              <p className="text-xs text-neutral-500">Level {user?.level ?? 1}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {(user?.username || user?.name || 'L').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/ai-practice', label: 'AI Practice' },
  { to: '/peer-chat', label: 'Peer Chat' },
  { to: '/micro-learning', label: 'Micro Learning' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/leaderboard', label: 'Time Leaderboard' },
  { to: '/learning-leaderboard', label: 'Learning Leaderboard' },
  { to: '/admin', label: 'Admin' },
]

export default Navbar