import { Link } from 'react-router-dom'

const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            SB
          </div>
          <div>
            <p className="text-neutral-800 font-display font-semibold text-base">Speak Better</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600 font-medium">
          <a href="#features" className="hover:text-neutral-900 transition">Features</a>
          <a href="#grammar" className="hover:text-neutral-900 transition">Grammar Quiz</a>
          <a href="#stories" className="hover:text-neutral-900 transition">Stories</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-neutral-700 hover:text-neutral-900 text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-success-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-success-600 transition shadow-sm"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  )
}

export default LandingNavbar

