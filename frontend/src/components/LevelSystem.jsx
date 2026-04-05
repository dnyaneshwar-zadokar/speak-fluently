import React from 'react';

const LevelSystem = () => {
  // Structured learning levels like Duolingo
  const levels = [
    {
      id: 1,
      title: 'Level 1: Basic Words',
      description: 'Learn fundamental English words and their meanings',
      topics: ['Greetings', 'Numbers', 'Colors', 'Basic Objects'],
      completed: true,
      unlocked: true,
      progress: 100,
      color: 'from-green-400 to-emerald-500',
      icon: '🔤'
    },
    {
      id: 2,
      title: 'Level 2: Word Recognition',
      description: 'Identify and understand common English words in context',
      topics: ['Family Words', 'Food Items', 'Body Parts', 'Animals'],
      completed: true,
      unlocked: true,
      progress: 85,
      color: 'from-blue-400 to-cyan-500',
      icon: '👁️'
    },
    {
      id: 3,
      title: 'Level 3: Reading Words',
      description: 'Practice reading and pronouncing basic English words',
      topics: ['Phonics', 'Pronunciation', 'Word Sounds', 'Reading Practice'],
      completed: false,
      unlocked: true,
      progress: 45,
      color: 'from-purple-400 to-violet-500',
      icon: '📖'
    },
    {
      id: 4,
      title: 'Level 4: Simple Sentences',
      description: 'Learn to construct basic sentences using learned words',
      topics: ['Subject-Verb', 'Basic Grammar', 'Sentence Structure', 'Word Order'],
      completed: false,
      unlocked: false,
      progress: 0,
      color: 'from-orange-400 to-amber-500',
      icon: '📝'
    },
    {
      id: 5,
      title: 'Level 5: Sentence Building',
      description: 'Create proper sentences with correct grammar and structure',
      topics: ['Articles', 'Prepositions', 'Basic Verbs', 'Sentence Formation'],
      completed: false,
      unlocked: false,
      progress: 0,
      color: 'from-rose-400 to-pink-500',
      icon: '🏗️'
    },
    {
      id: 6,
      title: 'Level 6: Basic Conversations',
      description: 'Engage in simple English conversations with common phrases',
      topics: ['Greetings', 'Introductions', 'Daily Questions', 'Common Responses'],
      completed: false,
      unlocked: false,
      progress: 0,
      color: 'from-indigo-400 to-purple-500',
      icon: '💬'
    },
    {
      id: 7,
      title: 'Level 7: Predefined Formats',
      description: 'Practice standard English formats and responses',
      topics: ['How are you?', 'What is your name?', 'Where are you from?', 'Common Dialogues'],
      completed: false,
      unlocked: false,
      progress: 0,
      color: 'from-teal-400 to-cyan-500',
      icon: '🎯'
    },
    {
      id: 8,
      title: 'Level 8: Advanced Practice',
      description: 'Handle complex conversations and correct mistakes',
      topics: ['Error Correction', 'Advanced Grammar', 'Fluency Practice', 'Real-world Scenarios'],
      completed: false,
      unlocked: false,
      progress: 0,
      color: 'from-yellow-400 to-orange-500',
      icon: '🏆'
    }
  ];

  const currentLevel = levels.find(level => !level.completed) || levels[levels.length - 1];
  const completedLevels = levels.filter(level => level.completed).length;
  const unlockedLevels = levels.filter(level => level.unlocked).length;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-display font-semibold text-slate-800 mb-6">Learning Path</h2>
      
      {/* Progress Overview */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-slate-600">Current Level</p>
            <p className="text-xl font-display font-bold text-slate-800">{currentLevel.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600">Progress</p>
            <p className="text-xl font-display font-bold text-slate-800">{completedLevels} / {levels.length} Levels</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((completedLevels / levels.length) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${(completedLevels / levels.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="text-sm text-slate-600">
          {unlockedLevels - completedLevels} levels in progress, {levels.length - unlockedLevels} levels locked
        </div>
      </div>

      {/* Level Progression */}
      <div className="space-y-4">
        {levels.map((level, index) => (
          <div
            key={level.id}
            className={`premium-card rounded-xl p-6 transition-all ${
              level.unlocked 
                ? level.completed 
                  ? 'ring-2 ring-green-200 bg-green-50/30' 
                  : 'ring-2 ring-purple-200 bg-white/80'
                : 'bg-slate-50/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Level Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white text-2xl flex-shrink-0`}>
                {level.icon}
              </div>
              
              {/* Level Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-lg">{level.title}</h3>
                  <div className="flex items-center gap-2">
                    {level.completed && (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-500">Level {level.id}</span>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-3">{level.description}</p>
                
                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {level.topics.map((topic, topicIndex) => (
                    <span 
                      key={topicIndex}
                      className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-slate-700 border border-slate-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-800">{level.progress}%</span>
                  </div>
                  
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all duration-500`}
                      style={{ width: `${level.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex-shrink-0">
                {level.completed ? (
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                    Completed
                  </div>
                ) : level.unlocked ? (
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
                    Continue
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-medium text-sm">
                    Locked
                  </div>
                )}
              </div>
            </div>
            
            {/* Unlock Requirements */}
            {!level.unlocked && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  🔒 Complete Level {level.id - 1} to unlock this level
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default LevelSystem;