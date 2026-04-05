import { useState } from 'react'
import { Link } from 'react-router-dom'
import LandingNavbar from '../components/NewLandingNavbar'

const featureCards = [
  {
    title: 'AI Speaking Coach',
    desc: 'Instant pronunciation, pacing, and clarity feedback powered by our voice models.',
  },
  {
    title: 'Peer Practice Rooms',
    desc: 'Anonymous, moderated audio chat pods to rehearse with fellow learners worldwide.',
  },
  {
    title: 'Micro-Learning Pods',
    desc: 'Five-minute story-driven lessons that sharpen grammar, tone, and vocabulary daily.',
  },
]

const testimonials = [
  {
    quote: 'Speak Better helped me go from shy to confident in weekly standups.',
    name: 'Priya Desai',
    role: 'Product Manager, Dubai',
  },
  {
    quote: 'Daily AI feedback + streak engine kept me motivated to practice every day.',
    name: 'Carlos Mendes',
    role: 'Design Lead, São Paulo',
  },
  {
    quote: 'Peer chat rooms made me feel like I was practicing with real teammates.',
    name: 'Hannah Lee',
    role: 'University Student, Seoul',
  },
]

const quizQuestion = {
  prompt: 'Choose the sentence with correct grammar:',
  options: [
    'She don’t like to speak in front of people.',
    'She doesn’t likes to speak in front of people.',
    'She doesn’t like to speak in front of people.',
    'She not likes to speak in front of people.',
  ],
  answerIndex: 2,
  explanation: '“Doesn’t” already carries the negative verb, so the base form “like” must follow.',
}

const Home = () => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleQuizSubmit = (optionIndex) => {
    setSelectedOption(optionIndex)
    setSubmitted(true)
  }

  const isCorrect = submitted && selectedOption === quizQuestion.answerIndex

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">

      <LandingNavbar />
      <main className="relative z-10">
        <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-[1.2fr,0.8fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-300 mb-4">
              <span className="text-xl">🎓</span>
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Speak Fluently</span>
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight text-slate-800">
              Become a confident English speaker with AI, peers, and micro-learning.
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              50,000+ learners already trust Speak Better to sharpen interviews, presentations, and everyday conversation.
              Practice daily, track streaks, and level up with our fluency OS.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="px-6 py-3.5 rounded-xl bg-success-500 text-white font-bold hover:bg-success-600 shadow-sm transition-all"
              >
                Start practicing free
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl border-2 border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-100 transition-all"
              >
                I already have an account
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">✓ No card needed • ✓ Cancel anytime • ✓ Community-led practice</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-card">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-100 border border-success-300 mb-3">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-semibold text-success-700 uppercase tracking-wide">Live Counter</span>
            </div>
            <p className="text-4xl font-display font-bold text-slate-800 mt-3">50,000+</p>
            <p className="text-slate-600 mt-1">speakers already improving their English communication.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-primary-50 border border-primary-200">
                <p className="text-slate-600 uppercase tracking-wide text-xs font-semibold">Average streak</p>
                <p className="text-2xl font-bold mt-2 text-slate-800">18 days</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <p className="text-slate-600 uppercase tracking-wide text-xs font-semibold">AI sessions / day</p>
                <p className="text-2xl font-bold mt-2 text-slate-800">7,200+</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <div key={card.title} className="bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-hover transition-shadow">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Feature</p>
                <h3 className="text-xl font-display font-semibold text-slate-800 mt-2">{card.title}</h3>
                <p className="text-slate-600 mt-3 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="grammar" className="relative max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-card">
            <p className="text-sm uppercase tracking-wide text-slate-600 font-semibold">English Grammar Quiz</p>
            <h2 className="text-3xl font-display font-bold text-slate-800 mt-3">Try a daily grammar micro challenge</h2>
            <p className="mt-3 text-slate-600 text-sm">
              Strengthen grammar muscle memory with 60-second checkpoints. Every answer adapts to your level.
            </p>
            <div className="mt-6 space-y-4">
              <p className="font-semibold text-slate-800">{quizQuestion.prompt}</p>
              {quizQuestion.options.map((option, idx) => {
                const isChosen = selectedOption === idx
                const correct = quizQuestion.answerIndex === idx
                return (
                  <button
                    key={option}
                    onClick={() => handleQuizSubmit(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition font-medium ${
                      submitted
                        ? correct
                          ? 'border-success-500 bg-success-50 text-success-700'
                          : isChosen
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-neutral-200 text-neutral-600 bg-neutral-50'
                        : isChosen
                        ? 'border-primary-500 text-neutral-800 bg-primary-50'
                        : 'border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
              {submitted && (
                <div className={`rounded-xl p-4 border-2 font-medium ${
                  isCorrect 
                    ? 'border-success-500 text-success-700 bg-success-50' 
                    : 'border-red-400 text-red-700 bg-red-50'
                }`}>
                  {isCorrect ? '✅ Nice! You chose the correct sentence.' : '❌ Not quite. Review the rule:'} {quizQuestion.explanation}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-card space-y-6">
            <p className="text-sm uppercase tracking-wide text-slate-600 font-semibold">How Speak Better works</p>
            <div className="space-y-5 text-sm text-slate-600">
              <div>
                <p className="font-bold text-slate-800">1. Diagnose</p>
                <p>AI voice scan and grammar quiz map your strengths + growth areas.</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">2. Drill</p>
                <p>Practice with AI studio, micro pods, and peer arena every day.</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">3. Track</p>
                <p>Live dashboard keeps streaks, badges, and time practiced in one place.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-purple-50 p-5">
              <p className="text-slate-600 text-sm font-semibold">Motivation</p>
              <p className="text-2xl font-display font-semibold text-slate-800 mt-2">“The fastest way to speak confidently is to practice daily.”</p>
            </div>
          </div>
        </section>

        <section id="stories" className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-sm uppercase tracking-wide text-slate-600 text-center font-semibold">Community voices</p>
          <h2 className="text-3xl font-display font-bold text-slate-800 text-center mt-3">Learners who already speak better</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-card hover:shadow-hover transition-shadow">
                <p className="text-slate-800 text-lg font-medium">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm text-slate-600">
                  {t.name} · {t.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="bg-gradient-to-br from-success-50 to-primary-50 border border-success-200 rounded-3xl p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-300 mb-4">
              <span className="text-xl">✨</span>
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Join Today</span>
            </div>
            <h3 className="text-3xl font-display font-bold text-slate-800 mt-4">Ready to speak confidently?</h3>
            <p className="mt-3 text-slate-600 text-lg">
              Tap into AI coaching, grammar drills, and peer accountability to transform your voice.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="px-6 py-3.5 rounded-xl bg-success-500 text-white font-bold hover:bg-success-600 shadow-sm transition-all">
                Create free account
              </Link>
              <Link to="/dashboard" className="px-6 py-3.5 rounded-xl border-2 border-neutral-300 text-neutral-700 font-semibold hover:bg-white transition-all">
                See dashboard preview
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home

