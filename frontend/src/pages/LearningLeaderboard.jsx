import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LearningLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const tabs = [
    { id: 'overall', label: 'Overall Progress', icon: '🏆' },
    { id: 'lessons', label: 'Lesson Masters', icon: '📚' },
    { id: 'achievements', label: 'Achievement Hunters', icon: '⭐' },
    { id: 'streaks', label: 'Streak Champions', icon: '🔥' }
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leaderboard/learning', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      setLeaderboardData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActiveData = () => {
    if (!leaderboardData) return [];
    
    switch (activeTab) {
      case 'lessons': return leaderboardData.lessons;
      case 'achievements': return leaderboardData.achievements;
      case 'streaks': return leaderboardData.streaks;
      case 'overall': return leaderboardData.overallProgress;
      default: return [];
    }
  };

  const getUserPosition = () => {
    if (!leaderboardData?.userPositions) return null;
    return leaderboardData.userPositions.positions[activeTab] || 
           leaderboardData.userPositions.positions[activeTab === 'overall' ? 'progress' : activeTab];
  };

  const renderLeaderboardItem = (user, index) => {
    const isCurrentUser = user.username === user?.username;
    const position = index + 1;
    
    let valueDisplay = '';
    let subtitle = '';
    
    switch (activeTab) {
      case 'lessons':
        valueDisplay = `${user.completedLevels} levels`;
        subtitle = `${user.lessonScore} pts`;
        break;
      case 'achievements':
        valueDisplay = `${user.achievementsCount} badges`;
        subtitle = `${user.achievementScore} pts`;
        break;
      case 'streaks':
        valueDisplay = `${user.currentStreak} days`;
        subtitle = `Max: ${user.maxStreak} days`;
        break;
      case 'overall':
        valueDisplay = `${user.totalLearningScore} pts`;
        subtitle = `${user.completedLevels}L • ${user.achievementsCount}A • ${user.currentStreak}S`;
        break;
    }

    return (
      <div 
        key={user.userId} 
        className={`flex items-center p-4 rounded-xl mb-3 transition-all duration-200 ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md' 
            : 'bg-white hover:bg-gray-50 border border-gray-200'
        }`}
      >
        {/* Rank */}
        <div className="flex-shrink-0 w-12 text-center">
          {position <= 3 ? (
            <div className={`text-2xl font-bold ${
              position === 1 ? 'text-yellow-500' : 
              position === 2 ? 'text-gray-400' : 'text-amber-700'
            }`}>
              {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
            </div>
          ) : (
            <div className="text-lg font-semibold text-gray-500">#{position}</div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className={`font-semibold ${
                isCurrentUser ? 'text-blue-800' : 'text-gray-800'
              }`}>
                {user.username}
                {isCurrentUser && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="text-right">
          <div className={`text-xl font-bold ${
            isCurrentUser ? 'text-blue-600' : 'text-gray-800'
          }`}>
            {valueDisplay}
          </div>
          {activeTab === 'overall' && (
            <div className="text-sm text-gray-500">
              {user.totalPoints} total pts
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStatsSummary = () => {
    if (!leaderboardData?.userPositions) return null;
    
    const positions = leaderboardData.userPositions.positions;
    const totalCategories = leaderboardData.userPositions.totalCategories;
    
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Your Rankings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              #{positions.overall || '—'}
            </div>
            <div className="text-xs text-gray-600">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              #{positions.lessons || '—'}
            </div>
            <div className="text-xs text-gray-600">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              #{positions.achievements || '—'}
            </div>
            <div className="text-xs text-gray-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              #{positions.streaks || '—'}
            </div>
            <div className="text-xs text-gray-600">Streaks</div>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-gray-600">
          Ranked in {totalCategories} categories
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Leaderboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 Learning Leaderboard
          </h1>
          <p className="text-gray-600">
            Celebrating learning achievements and progress
          </p>
        </div>

        {/* User Stats Summary */}
        {renderStatsSummary()}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="text-sm text-gray-500">
              Top {getActiveData().length} learners
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-3">
            {getActiveData().length > 0 ? (
              getActiveData().map((user, index) => renderLeaderboardItem(user, index))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No data available
                </h3>
                <p className="text-gray-500">
                  Start learning to appear on the leaderboard!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Rankings update in real-time as you learn and achieve
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningLeaderboard;