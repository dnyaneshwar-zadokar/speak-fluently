import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Prevent form submission on Enter key in mobile to avoid accidental submissions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Don't submit on Enter in mobile to prevent accidental submissions
      if (window.innerWidth <= 768) {
        return;
      }
      handleSubmit(e);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)
    const result = await login(email.trim(), password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  // Add onTouchStart to buttons to fix mobile click issues
  const handleTouchStart = (e) => {
    e.currentTarget.classList.add('touch-active')
  }

  const handleTouchEnd = (e) => {
    e.currentTarget.classList.remove('touch-active')
  }

  // Handle form submission with explicit button click only
  const handleLoginClick = (e) => {
    e.preventDefault()
    handleSubmit(e)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col lg:flex-row items-center gap-8 sm:gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-300 mb-4">
            <span className="text-lg">💬</span>
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Global Community</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-800 leading-tight">
            Practice with <span className="text-primary-600">real people,</span> <br />from anywhere.
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-xl">
            Join 50,000+ learners in anonymous voice chat rooms. No pressure, just natural conversation practice.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md">
            {[
              { value: '24/7', label: 'Availability' },
              { value: '50k+', label: 'Learners' },
              { value: '98%', label: 'Satisfaction' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-premium border border-blue-100">
            <div className="text-center">
              <h2 className="text-2xl sm:text-2xl font-display font-semibold text-slate-800">Welcome Back</h2>
              <p className="text-slate-600 mt-2 text-sm">Log in to continue your streak</p>
            </div>

            <form className="mt-6 sm:mt-10 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-blue-400 text-slate-800 font-medium transition-all"
                      placeholder="alex@speakbetter.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-blue-400 text-slate-800 font-medium transition-all"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button" // Changed to button type to prevent form auto-submit
                onClick={handleLoginClick}
                disabled={loading}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full py-3.5 rounded-xl font-bold text-white btn-premium hover:shadow-lg transition-all disabled:opacity-60 text-base"
              >
                {loading ? 'Signing in...' : 'CONTINUE'}
              </button>

              <p className="text-center text-sm text-slate-600">
                New to Speak Better?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary-600 font-semibold hover:text-primary-700"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

