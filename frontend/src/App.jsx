import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GamificationProvider } from './components/GamificationSystem'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import AIPractice from './pages/NewAIPractice'
import PeerChat from './pages/PeerChat'
import MicroLearning from './pages/MicroLearning'

import AICommunicationMentor from './pages/AICommunicationMentor'

import Achievements from './pages/Achievements'
import Leaderboard from './pages/Leaderboard'
import LearningLeaderboard from './pages/LearningLeaderboard'
import Admin from './pages/Admin'
import TestEnv from './pages/TestEnv'

// 404 Page Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl font-bold text-neutral-300 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-neutral-800 mb-2">Page not found</h1>
        <p className="text-neutral-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <a 
          href="/" 
          className="inline-block bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/test-env" element={<TestEnv />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-practice"
            element={
              <ProtectedRoute>
                <AIPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/peer-chat"
            element={
              <ProtectedRoute>
                <PeerChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/micro-learning"
            element={
              <ProtectedRoute>
                <MicroLearning />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-communication-mentor"
            element={
              <ProtectedRoute>
                <AICommunicationMentor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-leaderboard"
            element={
              <ProtectedRoute>
                <LearningLeaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          {/* 404 route - should be the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GamificationProvider>
  </AuthProvider>
  )
}

export default App