import { useState, useEffect } from 'react'
import Navbar from '../components/NewNavbar'
import axios from 'axios'

const Progress = () => {
  const [progress, setProgress] = useState({
    totalMinutes: 0,
    sessionCount: 0,
    streakDays: 0,
    completedLessons: 0,
    lastPracticeDate: null,
  })
  const [weeklyData, setWeeklyData] = useState([])
  const [sessionHistory, setSessionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProgress()
    fetchWeeklyData()
    fetchSessionHistory()
  }, [currentPage])

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/progress/update')
      if (response.data.progress) {
        setProgress(response.data.progress)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const fetchWeeklyData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/progress/weekly')
      if (response.data.data) {
        setWeeklyData(response.data.data)
      } else {
        setWeeklyData([
          { day: 'Mon', minutes: 15 },
          { day: 'Tue', minutes: 20 },
          { day: 'Wed', minutes: 10 },
          { day: 'Thu', minutes: 25 },
          { day: 'Fri', minutes: 30 },
          { day: 'Sat', minutes: 18 },
          { day: 'Sun', minutes: 22 },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch weekly data:', error)
      setWeeklyData([
        { day: 'Mon', minutes: 15 },
        { day: 'Tue', minutes: 20 },
        { day: 'Wed', minutes: 10 },
        { day: 'Thu', minutes: 25 },
        { day: 'Fri', minutes: 30 },
        { day: 'Sat', minutes: 18 },
        { day: 'Sun', minutes: 22 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionHistory = async () => {
    try {
      setSessionsLoading(true)
      const response = await axios.get(`/api/progress/sessions?page=${currentPage}&limit=5`)
      if (response.data.sessions) {
        setSessionHistory(response.data.sessions)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch session history:', error)
    } finally {
      setSessionsLoading(false)
    }
  }

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      
      <div className="absolute inset-0 overflow-hidden">
        {/* Instagram gradient base */}
        <div className="instagram-gradient"></div>
        
        {/* Floating orbs */}
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        
        {/* Pattern overlay */}
        <div className="pattern-overlay"></div>
        
        {/* Sparkle effects */}
        <div className="sparkle sparkle-1"></div>
        <div className="sparkle sparkle-2"></div>
        <div className="sparkle sparkle-3"></div>
        <div className="sparkle sparkle-4"></div>
        <div className="sparkle sparkle-5"></div>
      </div>
      
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10">
        <header>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-400/20 border border-primary-300/50 mb-4">
            <span className="text-xl">📊</span>
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Progress Intelligence</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-800">Streaks, sessions, and signal</h1>
          <p className="mt-3 text-gray-600 max-w-2xl font-medium">
            Track your growth with daily streaks, practice minutes, and lesson completion metrics. The dashboard updates
            in real-time post session.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Minutes', value: progress.totalMinutes + ' min', detail: '+12% week over week', icon: '⏱' },
            { label: 'Sessions', value: progress.sessionCount, detail: '3 new sessions', icon: '💬' },
            { label: 'Current Streak', value: progress.streakDays + ' days', detail: 'Keep it glowing', icon: '🔥' },
            { label: 'Lessons', value: progress.completedLessons, detail: 'Consistency unlocks badges', icon: '📚' },
          ].map((card) => (
            <div key={card.label} className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{card.icon}</span>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{card.label}</p>
              </div>
              <p className="mt-3 text-3xl font-display font-bold text-gray-800">{card.value}</p>
              <p className="mt-2 text-sm text-success-600 font-medium">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Weekly Activity</p>
              <h2 className="text-2xl font-display font-semibold text-gray-800 mt-1">Minutes practiced</h2>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Peak day: {weeklyData.length > 0 ? weeklyData.reduce((max, day) => day.minutes > max.minutes ? day : max, weeklyData[0])?.day || '—' : '—'}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-7 gap-2 h-48">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex flex-col items-center">
                <div className="text-xs font-medium text-gray-600 mb-1">{data.minutes}m</div>
                <div className="flex items-end justify-center w-full h-32 bg-gray-100/30 rounded-t-lg">
                  <div
                    className="w-3/4 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-700 ease-out"
                    style={{ 
                      height: `${weeklyData.length > 0 ? Math.max((data.minutes / maxMinutes) * 100, data.minutes > 0 ? 10 : 0) : 0}%`,
                      minHeight: data.minutes > 0 ? '4px' : '0px'
                    }}
                  />
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mt-2">{data.day}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-semibold text-gray-800">Recent Practice Sessions</h2>
            <a href="/ai-practice" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Start New Session →
            </a>
          </div>

          {sessionsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary-500"></div>
            </div>
          ) : sessionHistory.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No practice sessions yet. Start your first session to track your progress!</p>
              <a 
                href="/ai-practice" 
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
              >
                Begin Practice
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sessionHistory.map((session) => (
                  <div key={session._id} className="border border-white/30 rounded-xl p-5 hover:border-white/40 transition-all duration-300 bg-white/70 hover:bg-white/80">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">Practice Session</h3>
                        <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-800">{formatDuration(session.duration)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-semibold text-gray-800">{session.score || '—'}</p>
                        </div>
                      </div>
                    </div>
                    {session.feedback && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-primary-50/40 to-purple-50/40 rounded-lg border border-primary-100/50">
                        <p className="text-sm text-gray-700 line-clamp-2">{session.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary-600 hover:bg-primary-50/30'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary-600 hover:bg-primary-50/30'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {progress.lastPracticeDate && (
          <section className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-200/30 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold">Last practice</p>
            <h2 className="text-2xl font-display font-semibold text-gray-800 mt-2">
              {new Date(progress.lastPracticeDate).toLocaleString()}
            </h2>
            <p className="text-gray-700 mt-2 text-sm font-medium">Keep the streak alive — micro sessions count too.</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default Progress