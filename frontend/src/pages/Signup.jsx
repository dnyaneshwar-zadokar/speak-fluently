import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
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
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const result = await signup(name.trim(), email.trim(), password)
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
  const handleSignupClick = (e) => {
    e.preventDefault()
    handleSubmit(e)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-12">
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-hover border border-slate-200">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 border border-success-300">
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-semibold text-success-700 uppercase tracking-wide">Start Today</span>
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-display font-semibold text-slate-800">Create your account</h2>
              <p className="text-slate-600 mt-2 text-sm">Join thousands learning English confidently</p>
            </div>

            <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:ring-2 focus:ring-success-500 focus:border-success-500 outline-none placeholder:text-slate-400 text-slate-800 font-medium transition-all"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:ring-2 focus:ring-success-500 focus:border-success-500 outline-none placeholder:text-slate-400 text-slate-800 font-medium transition-all"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:ring-2 focus:ring-success-500 focus:border-success-500 outline-none placeholder:text-slate-400 text-slate-800 font-medium transition-all"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:ring-2 focus:ring-success-500 focus:border-success-500 outline-none placeholder:text-slate-400 text-slate-800 font-medium transition-all"
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button" // Changed to button type to prevent form auto-submit
                onClick={handleSignupClick}
                disabled={loading}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-success-500 hover:bg-success-600 hover:shadow-lg hover:shadow-success-500/30 transition-all disabled:opacity-60 text-base touch-active:bg-success-600"
              >
                {loading ? 'Creating account...' : 'GET STARTED'}
              </button>

              <p className="text-center text-sm text-slate-600">
                Already practicing?{' '}
                <Link 
                  to="/login" 
                  className="text-success-600 font-semibold hover:text-success-700"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  Sign in instead
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success-100 border border-success-300">
            <span className="text-xl">🚀</span>
            <span className="text-xs font-semibold text-success-700 uppercase tracking-wide">Micro Learning</span>
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight text-slate-800">
            Build unstoppable <span className="text-success-600">speaking momentum.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-xl">
            Daily habits, AI coaching, and real humans in the loop — engineered to keep your streaks
            glowing and your confidence compounding.
          </p>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'AI Practice', desc: 'Voice + text feedback with instant scoring', emoji: '🎤' },
              { title: 'Peer Arena', desc: 'Anonymous real-time conversation rooms', emoji: '👥' },
              { title: 'Micro Lessons', desc: '5-min story-based learning loops', emoji: '📚' },
              { title: 'Streak Engine', desc: 'Rewards that grow with your consistency', emoji: '🔥' },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">{item.title}</p>
                </div>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Trust Badge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-slate-500 text-center">
          ✨ Join 50,000+ learners • Free to start • No credit card required
        </p>
      </div>
    </div>
  )
}

export default Signup

