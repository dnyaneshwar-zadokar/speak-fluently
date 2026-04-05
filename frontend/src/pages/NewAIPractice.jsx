import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/NewNavbar'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useGamification } from '../components/GamificationSystem'

const NewAIPractice = () => {
  const { user, updateUserLevel } = useAuth()
  const { addXP, updateStreak, addAchievement, completeDailyGoal } = useGamification()
  const [input, setInput] = useState('')
  const [sessions, setSessions] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('practice') // 'practice' or 'chat'
  // Comprehensive feedback states
  const [comprehensiveFeedback, setComprehensiveFeedback] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const recognitionRef = useRef(null)

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/ai/practice', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.data.sessions) {
          setSessions(response.data.sessions)
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      }
    }
    
    fetchSessions()
  }, [])

  // Initialize Speech Recognition
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' '
          } else {
            interimTranscript += transcriptPiece
          }
        }

        setTranscript(prev => prev + finalTranscript)
        setInput(prev => prev + finalTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          recognitionRef.current.start()
        }
      }
    }
  }

  // Check comprehensive feedback function
  const checkComprehensiveFeedback = async () => {
    if (!input.trim()) return
    
    setIsAnalyzing(true)
    setComprehensiveFeedback(null)
    setShowLevelUp(false)
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/ai/comprehensive-feedback', {
        text: input
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.feedback) {
        setComprehensiveFeedback(response.data.feedback)
      }
      
      // Check if user leveled up
      if (response.data.leveledUp) {
        setNewLevel(response.data.level)
        setShowLevelUp(true)
        // Update the user level in the context
        updateUserLevel(response.data.level)
        
        // Award XP and check for achievements
        addXP(response.data.xp || 10, 'practice_session')
        
        // Hide level up notification after 5 seconds
        setTimeout(() => {
          setShowLevelUp(false)
        }, 5000)
      } else {
        // Award XP for completing a practice session
        addXP(response.data.xp || 5, 'practice_session')
      }
    } catch (error) {
      console.error('Comprehensive feedback error:', error)
      setComprehensiveFeedback({
        pronunciation: ["Unable to analyze at the moment"],
        fluency: ["Unable to analyze at the moment"],
        tone: ["Unable to analyze at the moment"],
        grammar: ["Unable to analyze at the moment"],
        vocabulary: ["Unable to analyze at the moment"],
        fillers: ["Unable to analyze at the moment"],
        accent: ["Unable to analyze at the moment"],
        clarity: ["Unable to analyze at the moment"],
        score: 0,
        suggestions: ["Please try again later"]
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition()
    }
    
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }
    
    try {
      setIsRecording(true)
      setTranscript('')
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      setIsRecording(false)
    }
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false)
      recognitionRef.current.stop()
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = { role: 'user', content: chatInput, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/ai/chat', {
        message: chatInput,
        history: chatMessages.slice(-5) // Send last 5 messages for context
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const aiMessage = { 
        role: 'assistant', 
        content: response.data.reply || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date() 
      }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble responding right now. Please try again.',
        timestamp: new Date() 
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  // Render comprehensive feedback
  const renderComprehensiveFeedback = () => {
    if (!comprehensiveFeedback) return null

    const feedbackItems = [
      { 
        title: "Pronunciation", 
        icon: "👄", 
        items: comprehensiveFeedback.pronunciation,
        color: "text-purple-600"
      },
      { 
        title: "Fluency & Speed", 
        icon: "🌊", 
        items: comprehensiveFeedback.fluency,
        color: "text-blue-600"
      },
      { 
        title: "Tone / Confidence", 
        icon: "🎭", 
        items: comprehensiveFeedback.tone,
        color: "text-green-600"
      },
      { 
        title: "Grammar Corrections", 
        icon: "✏️", 
        items: comprehensiveFeedback.grammar,
        color: "text-red-600"
      },
      { 
        title: "Vocabulary Improvement", 
        icon: "📚", 
        items: comprehensiveFeedback.vocabulary,
        color: "text-yellow-600"
      },
      { 
        title: "Fillers & Clarity", 
        icon: "🔇", 
        items: comprehensiveFeedback.fillers,
        color: "text-indigo-600"
      },
      { 
        title: "Accent Errors", 
        icon: "🌍", 
        items: comprehensiveFeedback.accent,
        color: "text-pink-600"
      },
      { 
        title: "Clarity & Articulation", 
        icon: "🔊", 
        items: comprehensiveFeedback.clarity,
        color: "text-teal-600"
      }
    ]

    return (
      <div className="rounded-2xl border-2 border-info-300 bg-info-50 p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wide text-info-700 font-semibold">
            Real-Time AI Feedback
          </p>
          {isAnalyzing && (
            <span className="flex items-center text-xs text-info-600">
              <span className="h-2 w-2 rounded-full bg-info-500 animate-pulse mr-2"></span>
              Analyzing...
            </span>
          )}
        </div>
        
        {/* Progress Score */}
        <div className="mb-5 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-premium">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-success-800">Overall Score</h3>
            <span className="text-2xl font-bold text-success-600">{comprehensiveFeedback.score}/100</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div 
              className="bg-success-600 h-2.5 rounded-full" 
              style={{ width: `${comprehensiveFeedback.score}%` }}
            ></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {comprehensiveFeedback.score >= 90 
              ? "Excellent! Near-native proficiency" 
              : comprehensiveFeedback.score >= 70 
                ? "Good! Keep practicing to improve" 
                : "Needs improvement. Focus on suggestions below"}
          </p>
        </div>
        
        {/* Feedback Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackItems.map((category, index) => (
            <div key={index} className="premium-card rounded-xl p-4">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">{category.icon}</span>
                <h4 className={`font-semibold ${category.color}`}>{category.title}</h4>
              </div>
              <ul className="text-neutral-700 text-sm space-y-1">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-success-500 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Personalized Suggestions */}
        {comprehensiveFeedback.suggestions && comprehensiveFeedback.suggestions.length > 0 && (
          <div className="mt-5 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-200 shadow-premium">
            <h4 className="font-semibold text-primary-800 mb-2">Personalized Practice Suggestions</h4>
            <ul className="text-primary-700 space-y-1">
              {comprehensiveFeedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      
      <Navbar />
      {showLevelUp && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span>Level Up! You're now Level {newLevel}</span>
          </div>
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-300 mb-3">
              <span className="text-xl">🎤</span>
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">AI Speaking Coach</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-800">
              Real-time <span className="text-primary-600">Speaking Analysis</span>
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl">
              Get instant AI-powered feedback on pronunciation, fluency, grammar, and more as you practice speaking English.
            </p>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-3 bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl p-1.5 shadow-premium">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'practice' 
                ? 'bg-primary-500 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Speaking Practice
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'chat' 
                ? 'bg-primary-500 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            AI Chatbot
          </button>
        </div>

        {activeTab === 'practice' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="premium-card rounded-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Practice Area</p>
              <h2 className="text-2xl font-display font-semibold text-slate-800">Speak or Type Below</h2>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak any sentence here..."
              className="w-full min-h-[150px] rounded-2xl bg-slate-50 border-2 border-slate-200 px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium transition-all"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isRecording 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-600 shadow-lg animate-pulse' 
                    : 'bg-gradient-to-r from-success-500 to-success-600 text-white border-2 border-success-600 hover:from-success-600 hover:to-success-700 shadow-md'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="h-3 w-3 rounded-full bg-white animate-pulse" />
                    <span>🎙️ Stop Recording</span>
                  </>
                ) : (
                  <>
                    <span>🎤 Start Voice Practice</span>
                  </>
                )}
              </button>
              
              <button
                onClick={checkComprehensiveFeedback}
                disabled={isAnalyzing || !input.trim()}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-60 shadow-sm flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                    Analyzing...
                  </>
                ) : (
                  '🔍 Get AI Feedback'
                )}
              </button>
            </div>

            {/* Comprehensive feedback display */}
            {renderComprehensiveFeedback()}
          </section>

          <section className="space-y-5">
            <div className="premium-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Tips for High Scores</p>
              <h3 className="text-xl font-display font-semibold text-slate-800 mt-2">Achieving 90+ Scores</h3>
              <ul className="mt-4 space-y-3 text-slate-700 text-sm">
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">•</span>
                  <span>Speak clearly with proper pronunciation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">•</span>
                  <span>Maintain steady pace without rushing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">•</span>
                  <span>Use varied vocabulary and correct grammar</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">•</span>
                  <span>Avoid filler words like "um", "uh", "like"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success-500 mr-2">•</span>
                  <span>Speak with confidence and clear tone</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-success-50 rounded-lg border border-success-200">
                <p className="text-success-800 text-sm">
                  <span className="font-semibold">Example high-scoring sentence:</span> "I enjoy learning new languages because it helps me connect with people from different cultures."
                </p>
              </div>
            </div>
          </section>
        </div>
        ) : (
        <div className="grid grid-cols-1 gap-6">
          <section className="premium-card rounded-2xl p-6 h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">AI Communication Coach</p>
                <h2 className="text-2xl font-display font-semibold text-slate-800">Chat with AI</h2>
              </div>
              <button
                onClick={() => setChatMessages([])}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-all"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-center">
                  <div>
                    <p className="text-2xl mb-2">💬</p>
                    <p className="font-semibold text-slate-700">Start a conversation with your AI coach!</p>
                    <p className="text-sm mt-2">Ask questions, practice conversations, or get speaking tips.</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 border-2 border-slate-200 text-black'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap font-medium">{msg.content}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl px-5 py-3">
                    <p className="text-slate-600 font-medium">AI is typing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 rounded-xl bg-slate-50 border-2 border-slate-200 px-5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium transition-all"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-6 py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60 shadow-sm transition-all"
              >
                Send
              </button>
            </form>
          </section>
        </div>
        )}
      </div>
    </div>
  )
}

export default NewAIPractice