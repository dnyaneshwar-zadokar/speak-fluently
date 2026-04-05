import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/NewNavbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalMinutes: 0,
    sessionCount: 0,
    streakDays: 0,
    completedLessons: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/progress/update', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.progress) {
        setStats(response.data.progress);
        console.log('Dashboard stats loaded:', response.data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  const quickActions = [
    {
      title: 'AI Practice Studio',
      desc: 'Free-form speaking drills with real-time AI scoring and transcript insights.',
      href: '/ai-practice',
      gradient: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      title: 'Peer Arena',
      desc: 'Drop into anonymous prompts with peers, track fluency confidence in real-time.',
      href: '/peer-chat',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: 'AI Communication Mentor',
      desc: 'Structured 25-level English learning journey from basic words to professional fluency.',
      href: '/ai-communication-mentor',
      gradient: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 14l-4-2-4 2M12 14l4-2 4 2"
          />
        </svg>
      ),
    },
    {
      title: 'Micro Learning Pods',
      desc: 'Nano lessons curated to your weak spots. Complete, reflect, level up.',
      href: '/micro-learning',
      gradient: 'from-success-500 to-success-600',
      bgColor: 'bg-green-50',
      textColor: 'text-success-600',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ]

  const insightCards = [
    { 
      label: 'Total Minutes', 
      value: `${stats.totalMinutes}`, 
      unit: 'min',
      trend: '+12% this week',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    { 
      label: 'Sessions', 
      value: stats.sessionCount,
      unit: '',
      trend: '3 new sessions',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      label: 'Daily Streak', 
      value: `${stats.streakDays}`,
      unit: 'days',
      trend: '⚡ keep it up',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-warning-500',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Lessons', 
      value: stats.completedLessons,
      unit: '',
      trend: '2 new badges',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'text-success-600',
      bgColor: 'bg-green-50'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-sm text-gray-600 font-medium drop-shadow-sm">
              {new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
            </span>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-display font-bold text-gray-800 leading-tight mb-3 drop-shadow-sm">
                Welcome back, {user?.username?.split(' ')[0] || user?.name?.split(' ')[0] || 'Learner'} 👋
              </h1>
              <p className="text-lg text-gray-600 mb-6 font-medium drop-shadow-sm">
                Your session awaits. Keep up the momentum and unlock new achievements today.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/ai-practice"
                  className="dashboard-action-btn inline-flex items-center gap-2"
                >
                  Launch AI Studio
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/micro-learning"
                  className="dashboard-action-btn inline-flex items-center gap-2"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card, index) => (
            <div 
              key={card.label} 
              className="premium-card rounded-xl p-6 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide drop-shadow-sm">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-display font-bold text-gray-800 drop-shadow-sm">{card.value}</p>
                {card.unit && <span className="text-lg text-neutral-500 font-medium">{card.unit}</span>}
              </div>
              <p className="mt-2 text-sm text-success-600 font-medium drop-shadow-sm">{card.trend}</p>
            </div>
          ))}
        </section>

        {/* Streak and Next Badge Section */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 premium-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 drop-shadow-sm">Current Streak</p>
                <p className="text-3xl font-display font-bold text-gray-800 drop-shadow-sm">{stats.streakDays} days 🔥</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 drop-shadow-sm">Goal: 30 days</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                style={{ width: `${Math.min(stats.streakDays, 30) / 30 * 100}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-gray-600 drop-shadow-sm">
              {30 - Math.min(stats.streakDays, 30)} days to reach your goal
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200 shadow-premium">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-white rounded-xl shadow-premium">
                <svg className="h-6 w-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1 drop-shadow-sm">Next Badge</p>
                <p className="text-lg font-bold text-gray-800 mb-1 drop-shadow-sm">30 Minutes Mastery</p>
                <p className="text-sm text-gray-600 drop-shadow-sm">Practice {30 - (stats.totalMinutes % 30)} more minutes to unlock</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-display font-bold text-gray-800 mb-4 drop-shadow-sm">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="group premium-card rounded-xl p-6 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${action.bgColor} ${action.textColor} group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <svg className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 drop-shadow-sm">{action.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed drop-shadow-sm">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>


      </div>
    </div>
  )
}

export default Dashboard

