import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

// Gamification Context
const GamificationContext = createContext();

// Initial state for gamification
const initialState = {
  xp: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  achievements: [],
  badges: [],
  dailyGoals: {
    completed: 0,
    target: 3,
    completedToday: false
  },
  loading: true
};

// Action types
const actionTypes = {
  ADD_XP: 'ADD_XP',
  LEVEL_UP: 'LEVEL_UP',
  UPDATE_STREAK: 'UPDATE_STREAK',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  ADD_BADGE: 'ADD_BADGE',
  COMPLETE_DAILY_GOAL: 'COMPLETE_DAILY_GOAL',
  RESET_DAILY_GOALS: 'RESET_DAILY_GOALS',
  SET_LOADING: 'SET_LOADING',
  SYNC_DATA: 'SYNC_DATA'
};

// Reducer function
const gamificationReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_XP:
      const newXp = state.xp + action.payload.xp;
      const newLevel = Math.floor(newXp / 1000) + 1; // 1000 XP per level
      
      let updates = { xp: newXp };
      if (newLevel > state.level) {
        updates.level = newLevel;
        // Trigger level up notification
        console.log(`🎉 Level Up! You reached level ${newLevel}`);
      }
      
      return { ...state, ...updates };

    case actionTypes.UPDATE_STREAK:
      const newStreak = Math.max(0, state.streak + action.payload.amount);
      const maxStreak = Math.max(state.maxStreak, newStreak);
      
      return {
        ...state,
        streak: newStreak,
        maxStreak
      };

    case actionTypes.ADD_ACHIEVEMENT:
      if (!state.achievements.includes(action.payload.id)) {
        return {
          ...state,
          achievements: [...state.achievements, action.payload.id]
        };
      }
      return state;

    case actionTypes.ADD_BADGE:
      if (!state.badges.some(badge => badge.id === action.payload.id)) {
        return {
          ...state,
          badges: [...state.badges, action.payload]
        };
      }
      return state;

    case actionTypes.COMPLETE_DAILY_GOAL:
      return {
        ...state,
        dailyGoals: {
          ...state.dailyGoals,
          completed: state.dailyGoals.completed + 1,
          completedToday: state.dailyGoals.completed + 1 >= state.dailyGoals.target
        }
      };

    case actionTypes.RESET_DAILY_GOALS:
      return {
        ...state,
        dailyGoals: {
          completed: 0,
          target: 3,
          completedToday: false
        }
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case actionTypes.SYNC_DATA:
      return {
        ...state,
        xp: action.payload.xp || state.xp,
        level: action.payload.level || state.level,
        streak: action.payload.streak || state.streak,
        maxStreak: action.payload.maxStreak || state.maxStreak,
        achievements: action.payload.achievements || state.achievements,
        loading: false
      };

    default:
      return state;
  }
};

// Provider component
export const GamificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  
  // Load user data from backend on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/progress/update', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Sync data from backend
          dispatch({
            type: actionTypes.SYNC_DATA,
            payload: {
              streak: response.data.progress.streakDays,
              xp: response.data.progress.totalMinutes * 10, // Convert minutes to XP
              level: Math.floor((response.data.progress.totalMinutes * 10) / 1000) + 1
            }
          });
          
          // Also fetch achievements
          const achievementsResponse = await axios.get('/api/achievements/unlocked', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          dispatch({
            type: actionTypes.SYNC_DATA,
            payload: {
              achievements: achievementsResponse.data.achievements.map(a => a._id)
            }
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback: sync from localStorage if backend fails
        const savedData = {
          xp: parseInt(localStorage.getItem('xp')) || 0,
          level: parseInt(localStorage.getItem('level')) || 1,
          streak: parseInt(localStorage.getItem('streak')) || 0,
          maxStreak: parseInt(localStorage.getItem('maxStreak')) || 0,
          achievements: JSON.parse(localStorage.getItem('achievements')) || []
        };
        dispatch({ type: actionTypes.SYNC_DATA, payload: savedData });
      }
    };
    
    loadUserData();
  }, []);
  
  // Check for daily streak and sync with backend
  React.useEffect(() => {
    const checkDailyStreak = async () => {
      const lastActiveDate = localStorage.getItem('lastActiveDate');
      const today = new Date().toDateString();
      
      if (lastActiveDate) {
        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day - increase streak
          dispatch({ type: actionTypes.UPDATE_STREAK, payload: { amount: 1 } });
          
          // Update backend
          try {
            const token = localStorage.getItem('token');
            if (token) {
              await axios.post('/api/users/update-streak', { streak: state.streak + 1 }, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
            }
          } catch (error) {
            console.error('Failed to update streak on backend:', error);
          }
        } else if (diffDays > 1) {
          // Break in streak - reset to 0
          dispatch({ type: actionTypes.UPDATE_STREAK, payload: { amount: -state.streak } });
          
          // Update backend
          try {
            const token = localStorage.getItem('token');
            if (token) {
              await axios.post('/api/users/update-streak', { streak: 0 }, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
            }
          } catch (error) {
            console.error('Failed to reset streak on backend:', error);
          }
        }
        // If diffDays === 0, it's the same day, do nothing
      }
      
      // Update last active date
      localStorage.setItem('lastActiveDate', today);
    };
    
    checkDailyStreak();
    
    // Check every hour to update streak if needed
    const interval = setInterval(checkDailyStreak, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.streak]);

  // Actions
  const addXP = async (xp, reason = '') => {
    dispatch({ type: actionTypes.ADD_XP, payload: { xp, reason } });
    
    // Sync with backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/api/users/add-xp', { xp }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Failed to update XP on backend:', error);
    }
  };

  const updateStreak = async (amount) => {
    dispatch({ type: actionTypes.UPDATE_STREAK, payload: { amount } });
    
    // Calculate new streak value
    const newStreak = Math.max(0, state.streak + amount);
    
    // Sync with backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/api/users/update-streak', { streak: newStreak }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Failed to update streak on backend:', error);
    }
  };

  const addAchievement = async (achievement) => {
    dispatch({ type: actionTypes.ADD_ACHIEVEMENT, payload: achievement });
    
    // Unlock achievement on backend
    try {
      const token = localStorage.getItem('token');
      if (token && achievement._id) {
        await axios.post(`/api/achievements/unlock/${achievement._id}`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Failed to unlock achievement on backend:', error);
    }
  };

  const addBadge = (badge) => {
    dispatch({ type: actionTypes.ADD_BADGE, payload: badge });
  };

  const completeDailyGoal = () => {
    dispatch({ type: actionTypes.COMPLETE_DAILY_GOAL });
  };

  const resetDailyGoals = () => {
    dispatch({ type: actionTypes.RESET_DAILY_GOALS });
  };

  const value = {
    ...state,
    addXP,
    updateStreak,
    addAchievement,
    addBadge,
    completeDailyGoal,
    resetDailyGoals,
    xpToNextLevel: 1000 - (state.xp % 1000),
    progressToNextLevel: (state.xp % 1000) / 1000
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Custom hook
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// Gamification Components

// XP Bar Component
export const XPBar = ({ size = 'normal' }) => {
  const { xp, level, xpToNextLevel, progressToNextLevel } = useGamification();
  
  const sizes = {
    normal: { height: 'h-3', width: 'w-full' },
    small: { height: 'h-2', width: 'w-32' },
    large: { height: 'h-4', width: 'w-full' }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className="flex items-center gap-3">
      <div className={`${currentSize.width} ${currentSize.height} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${progressToNextLevel * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">
        Level {level} ({xp % 1000}/{xpToNextLevel} XP)
      </span>
    </div>
  );
};

// Streak Counter Component
export const StreakCounter = ({ size = 'normal' }) => {
  const { streak, maxStreak } = useGamification();
  
  const sizes = {
    normal: 'text-lg',
    small: 'text-sm',
    large: 'text-xl'
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
        <span className="text-amber-600">🔥</span>
      </div>
      <div>
        <p className={`${currentSize} font-bold text-amber-600`}>{streak} days</p>
        <p className="text-xs text-gray-500">Best: {maxStreak}</p>
      </div>
    </div>
  );
};

// Achievement Notification Component
export const AchievementNotification = ({ achievement }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-emerald-200 p-4 max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
          {achievement.icon || '🏆'}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Achievement Unlocked!</h4>
          <p className="font-semibold text-emerald-600">{achievement.name}</p>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};

// Daily Goals Tracker
export const DailyGoalsTracker = () => {
  const { dailyGoals, completeDailyGoal } = useGamification();
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200">
      <h4 className="font-semibold text-gray-900 mb-3">Daily Goals</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Lessons completed</span>
          <span className="text-sm font-medium text-gray-900">
            {dailyGoals.completed}/{dailyGoals.target}
          </span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(dailyGoals.completed / dailyGoals.target) * 100}%` }}
          />
        </div>
        {dailyGoals.completedToday && (
          <div className="text-xs text-emerald-600 font-medium">🎉 Daily goal completed!</div>
        )}
      </div>
    </div>
  );
};

// Badge Collection Component
export const BadgeCollection = ({ size = 'normal' }) => {
  const { badges } = useGamification();
  
  const sizes = {
    normal: 'w-12 h-12',
    small: 'w-8 h-8',
    large: 'w-16 h-16'
  };
  
  const currentSize = sizes[size];
  
  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No badges earned yet. Keep practicing!</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-4 gap-3">
      {badges.slice(0, 8).map((badge, index) => (
        <div key={index} className={`${currentSize} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl tooltip`} title={badge.name}>
          {badge.icon}
        </div>
      ))}
      {badges.length > 8 && (
        <div className={`${currentSize} rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600`}>
          +{badges.length - 8}
        </div>
      )}
    </div>
  );
};

// Leaderboard Position Component
export const LeaderboardPosition = ({ position = 1 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <span className="text-indigo-600 font-bold">#</span>
      </div>
      <div>
        <p className="font-bold text-gray-900">#{position}</p>
        <p className="text-xs text-gray-500">Global Rank</p>
      </div>
    </div>
  );
};

// Animated XP Gain Component
export const XPAnimation = ({ amount }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="animate-bounce text-4xl font-bold text-indigo-600">
        +{amount} XP!
      </div>
    </div>
  );
};

// Enhanced Gamification Summary Component
export const GamificationSummary = () => {
  const { xp, level, streak, achievements, badges } = useGamification();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-2xl font-bold text-indigo-600">{xp}</div>
        <div className="text-sm text-gray-600">Total XP</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-2xl font-bold text-purple-600">{level}</div>
        <div className="text-sm text-gray-600">Level</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-2xl font-bold text-amber-600">{streak}</div>
        <div className="text-sm text-gray-600">Day Streak</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-2xl font-bold text-emerald-600">{achievements.length}</div>
        <div className="text-sm text-gray-600">Achievements</div>
      </div>
    </div>
  );
};