import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/NewNavbar';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../components/GamificationSystem';

const AICommunicationMentor = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showAppreciation, setShowAppreciation] = useState(false);
  const [appreciationMessage, setAppreciationMessage] = useState('');
  const [earnedBadge, setEarnedBadge] = useState('');
  const [showMistakes, setShowMistakes] = useState(false);
  const [mistakeFeedback, setMistakeFeedback] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP, level: userLevel } = useGamification();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/levels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setLevels(response.data.levels);
      setUserProgress({
        currentLevel: response.data.currentLevel,
        completedLevels: response.data.completedLevels,
        totalLevels: response.data.totalLevels,
        progressPercentage: response.data.progressPercentage,
        xp: response.data.xp,
        level: response.data.level
      });
    } catch (error) {
      console.error('Failed to fetch levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLevel = async (level) => {
    if (!level.unlocked) {
      alert('Complete the previous level first!');
      return;
    }
    
    if (level.completed) {
      // Show level review mode
      setSelectedLevel(level);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/levels/${level.id}/start`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSelectedLevel(level);
      setCurrentLesson({
        currentIndex: 0,
        answers: [],
        score: 0
      });
    } catch (error) {
      console.error('Failed to start level:', error);
      alert('Failed to start level. Please try again.');
    }
  };

  const handleAnswerSubmit = async (answer) => {
    if (!selectedLevel || !currentLesson) return;

    const currentQuestion = selectedLevel.questions[currentLesson.currentIndex];
    const updatedAnswers = [...currentLesson.answers, { 
      question: currentQuestion.prompt,
      answer: answer,
      expected: currentQuestion.expected,
      correct: checkAnswer(answer, currentQuestion.expected)
    }];

    const isLastQuestion = currentLesson.currentIndex === selectedLevel.questions.length - 1;
    
    if (isLastQuestion) {
      // Complete the level
      await completeLevel(updatedAnswers);
    } else {
      // Move to next question
      setCurrentLesson({
        ...currentLesson,
        currentIndex: currentLesson.currentIndex + 1,
        answers: updatedAnswers
      });
    }
  };

  const checkAnswer = (userAnswer, expectedAnswer) => {
    // Simple answer checking - can be enhanced with fuzzy matching
    const userAnswerClean = userAnswer.trim().toLowerCase();
    const expectedAnswerClean = expectedAnswer.trim().toLowerCase();
    
    // For free response questions
    if (expectedAnswer === 'free_response' || expectedAnswer === 'conversation' || 
        expectedAnswer === 'story' || expectedAnswer === 'roleplay' ||
        expectedAnswer === 'complex_sentences' || expectedAnswer === 'confident_speech' ||
        expectedAnswer === 'professional_communication' || expectedAnswer === 'interview_response' ||
        expectedAnswer === 'code_switching' || expectedAnswer === 'extended_speech' ||
        expectedAnswer === 'random_topic_speech') {
      return userAnswerClean.length > 5; // Basic length check for free responses
    }
    
    return userAnswerClean === expectedAnswerClean;
  };

  const completeLevel = async (finalAnswers) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`/api/levels/${selectedLevel.id}/complete`, {
        answers: finalAnswers
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Handle response based on whether level was completed
      if (response.data.levelCompleted === false) {
        // Level not completed - show mistakes
        setMistakeFeedback(response.data);
        setShowMistakes(true);
        
        // Don't refresh levels yet - let user see mistakes first
        return;
      }

      // Level completed successfully
      // Update gamification
      addXP(response.data.xpEarned, 'level_completed');
      
      // Show appreciation
      setAppreciationMessage(response.data.appreciationMessage);
      setEarnedBadge(response.data.badgeEarned);
      setShowAppreciation(true);
      setShowMistakes(false);
      
      // Handle unlocked achievements
      if (response.data.unlockedAchievements && response.data.unlockedAchievements.length > 0) {
        setUnlockedAchievements(response.data.unlockedAchievements);
      }
      
      // Refresh levels data after celebration
      setTimeout(() => {
        fetchLevels();
        setShowAppreciation(false);
        setSelectedLevel(null);
        setCurrentLesson(null);
        setMistakeFeedback(null);
        setUnlockedAchievements([]);
      }, 4000);
      
    } catch (error) {
      console.error('Failed to complete level:', error);
      alert('Failed to complete level. Please try again.');
    }
  };

  const resetLevel = async (levelId) => {
    if (!window.confirm('Are you sure you want to reset this level progress?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/levels/${levelId}/reset`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchLevels();
      alert('Level progress reset successfully!');
    } catch (error) {
      console.error('Failed to reset level:', error);
      alert('Failed to reset level. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your learning journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showMistakes && mistakeFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Keep Trying!</h1>
            <p className="text-xl text-gray-600">{mistakeFeedback.message}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl mx-auto mb-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Results</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-600">{mistakeFeedback.score}%</div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div 
                  className="bg-red-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${mistakeFeedback.score}%` }}
                />
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg mb-6">
                <p className="text-orange-800 font-medium">Minimum required: {mistakeFeedback.minimumScore}%</p>
                <p className="text-orange-700 mt-1">{mistakeFeedback.encouragement}</p>
              </div>
            </div>
            
            {/* Detailed Mistake Feedback */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Your Answers</h3>
              <div className="space-y-4">
                {mistakeFeedback.validationResults?.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${
                      result.isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">{result.question}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium text-gray-600">Your answer:</span> 
                            <span className="ml-2 px-2 py-1 bg-white rounded text-gray-800">{result.userAnswer}</span>
                          </p>
                          {!result.isCorrect && (
                            <p className="text-sm">
                              <span className="font-medium text-gray-600">Expected:</span> 
                              <span className="ml-2 px-2 py-1 bg-white rounded text-green-700">{result.expectedAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-2xl">
                        {result.isCorrect ? '✅' : '❌'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setShowMistakes(false);
                  setMistakeFeedback(null);
                  // Reset current lesson to start over
                  setCurrentLesson({
                    currentIndex: 0,
                    answers: [],
                    score: 0
                  });
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setShowMistakes(false);
                  setMistakeFeedback(null);
                  setSelectedLevel(null);
                  setCurrentLesson(null);
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Back to Levels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAppreciation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Congratulations!</h1>
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
              <p className="text-xl text-gray-700 mb-6">{appreciationMessage}</p>
              {earnedBadge && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="text-2xl font-bold text-white">{earnedBadge}</h3>
                  <p className="text-yellow-100">Badge Earned!</p>
                </div>
              )}
              
              {/* Achievement Notifications */}
              {unlockedAchievements.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">New Achievements Unlocked! 🏆</h3>
                  {unlockedAchievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="text-left">
                          <h4 className="font-bold text-purple-800">{achievement.name}</h4>
                          <p className="text-purple-600 text-sm">{achievement.description}</p>
                          <p className="text-xs text-purple-500 mt-1">+{achievement.pointsAwarded} points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-gray-600 mt-6">Preparing your next challenge...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedLevel && currentLesson) {
    const currentQuestion = selectedLevel.questions[currentLesson.currentIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Level Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{selectedLevel.title}</h1>
                <p className="text-gray-600 mt-2">{selectedLevel.description}</p>
              </div>
              <div className="text-right">
                <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-medium">
                  Question {currentLesson.currentIndex + 1} of {selectedLevel.questions.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  XP Reward: {selectedLevel.xpReward}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentLesson.currentIndex) / selectedLevel.questions.length) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${((currentLesson.currentIndex + 1) / selectedLevel.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {selectedLevel.interaction.includes('Voice') ? '🎤' : '📝'}
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {currentQuestion.prompt}
              </h2>
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                {selectedLevel.interaction} Mode
              </div>
            </div>

            {/* Answer Input */}
            <div className="max-w-md mx-auto">
              {/* All levels now use text input */}
              <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Type your answer here..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAnswerSubmit(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]');
                      if (input.value.trim()) {
                        handleAnswerSubmit(input.value);
                        input.value = '';
                      }
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-medium text-lg transition-colors"
                  >
                    Submit Answer
                  </button>
              </div>
            </div>

            {/* Learning Words Display */}
            {selectedLevel.learning && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Words to Practice:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLevel.learning.map((word, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setSelectedLevel(null);
                setCurrentLesson(null);
              }}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            AI Communication Mentor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master English communication step-by-step from basic words to professional fluency
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{userProgress.completedLevels || 0}</div>
              <div className="text-gray-600">Levels Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{userProgress.totalLevels || 25}</div>
              <div className="text-gray-600">Total Levels</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600">{userProgress.xp || 0}</div>
              <div className="text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">Level {userLevel || 1}</div>
              <div className="text-gray-600">Your Level</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{userProgress.progressPercentage || 0}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${userProgress.progressPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div 
              key={level.id}
              className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                level.completed 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
                  : level.unlocked 
                    ? 'bg-white border-2 border-indigo-200 hover:border-indigo-300 cursor-pointer' 
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
              }`}
              onClick={() => level.unlocked && startLevel(level)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Level {level.id}: {level.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{level.description}</p>
                </div>
                <div className="ml-4 text-2xl">
                  {level.completed ? '✅' : level.unlocked ? '🔓' : '🔒'}
                </div>
              </div>

              {/* Level Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">Mode:</span>
                  <span className="font-medium">{level.interaction}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">AI Role:</span>
                  <span className="font-medium">{level.aiRole}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">XP:</span>
                  <span className="font-medium text-indigo-600">+{level.xpReward}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">Time:</span>
                  <span className="font-medium">{level.estimatedTime} min</span>
                </div>
              </div>

              {/* Progress for completed levels */}
              {level.completed && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-bold text-green-600">{level.userScore}%</span>
                  </div>
                  {level.badgeEarned && (
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block">
                      🏆 {level.badgeEarned}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {level.unlocked && !level.completed && (
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors">
                    Start Level
                  </button>
                )}
                {level.completed && (
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors">
                    Review
                  </button>
                )}
                {user?.isAdmin && level.completed && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      resetLevel(level.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Unlock requirement */}
              {!level.unlocked && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    🔒 {level.unlockCondition}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Achievement Section */}
        {userProgress.completedLevels > 0 && (
          <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Achievements</h2>
              <p className="text-gray-600">
                You've completed {userProgress.completedLevels} out of {userProgress.totalLevels} levels!
              </p>
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                {levels
                  .filter(level => level.completed && level.badgeEarned)
                  .slice(0, 8)
                  .map((level, index) => (
                    <div key={index} className="bg-white rounded-full p-3 shadow-md" title={level.badgeEarned}>
                      <div className="text-2xl">🏆</div>
                    </div>
                  ))}
                {userProgress.completedLevels > 8 && (
                  <div className="bg-white rounded-full p-3 shadow-md">
                    <div className="text-lg font-bold text-gray-700">+{userProgress.completedLevels - 8}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICommunicationMentor;