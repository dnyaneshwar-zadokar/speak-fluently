import { useState, useEffect } from 'react'
import Navbar from '../components/NewNavbar'
import axios from 'axios'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('minutes')

  useEffect(() => {
    fetchLeaderboard()
  }, [filter])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/leaderboard/week', {
        params: { type: filter },
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.data.leaderboard) {
        setLeaderboard(response.data.leaderboard)
      } else {
        setLeaderboard([])
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const getBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-amber-400 via-yellow-300 to-amber-500'
      case 2:
        return 'from-neutral-300 via-neutral-200 to-neutral-400'
      case 3:
        return 'from-orange-400 via-orange-300 to-orange-500'
      default:
        return 'from-neutral-200 via-neutral-100 to-neutral-300'
    }
  }

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-100 border border-warning-300 mb-4">
            <span className="text-xl">🏆</span>
            <span className="text-xs font-semibold text-warning-700 uppercase tracking-wide drop-shadow-sm">Leaderboard</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-800 drop-shadow-sm">Top learners of the week</h1>
          <p className="mt-3 text-gray-600 font-medium drop-shadow-sm">
            Ranked by {filter === 'minutes' ? 'minutes practiced' : 'lessons completed'} for the current week window.
          </p>
        </div>

        <div className="mb-8 inline-flex rounded-full border-2 border-slate-200 p-1 bg-white/90 backdrop-blur-sm shadow-sm">
          {['minutes', 'lessons'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === option ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:text-neutral-900'
              }`}
            >
              {option === 'minutes' ? 'Practice Time' : 'Lessons'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.rank}
                  className="rounded-2xl border-2 border-white/30 bg-white/90 backdrop-blur-sm p-4 flex items-center justify-between gap-4 hover:border-primary-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getBadgeColor(
                        entry.rank,
                      )} flex flex-col items-center justify-center text-neutral-900 font-display text-xl shadow-sm`}
                    >
                      {getMedalIcon(entry.rank)}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-lg font-semibold text-slate-700">
                      {entry.avatar || entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-800">{entry.username}</p>
                      <p className="text-sm text-slate-600 font-medium">
                        {filter === 'minutes'
                          ? `${entry.lessons} lessons completed`
                          : `${entry.minutes} minutes practiced`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-slate-800">
                      {filter === 'minutes' ? entry.minutes : entry.lessons}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                      {filter === 'minutes' ? 'MINUTES' : 'LESSONS'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-100 border border-warning-300 mb-4">
                  <span className="text-xl">📊</span>
                  <span className="text-xs font-semibold text-warning-700 uppercase tracking-wide drop-shadow-sm">No Data</span>
                </div>
                <p className="text-gray-700 font-medium drop-shadow-sm max-w-md mx-auto">
                  No leaderboard data available yet. Start practicing to appear on the leaderboard!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard