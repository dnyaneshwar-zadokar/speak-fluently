import User from '../models/User.js';
import Achievement from '../models/Achievement.js';

// Weighted scoring system for different learning activities
const SCORING_SYSTEM = {
  // Lesson completion weights
  BASIC_LEVEL: 10,
  ADVANCED_LEVEL: 20,
  EXPERT_LEVEL: 30,
  
  // Achievement weights
  BASIC_ACHIEVEMENT: 5,
  INTERMEDIATE_ACHIEVEMENT: 15,
  ADVANCED_ACHIEVEMENT: 30,
  SPECIAL_ACHIEVEMENT: 50,
  
  // Streak bonuses
  DAILY_STREAK: 2,
  WEEK_STREAK_BONUS: 20,    // Additional for 7+ days
  MONTH_STREAK_BONUS: 50,   // Additional for 30+ days
  
  // Progression bonuses
  CURRICULUM_TIER_BONUS: 25
};

// Determine level difficulty for scoring
const getLevelDifficulty = (levelNumber) => {
  if (levelNumber <= 8) return 'BASIC';
  if (levelNumber <= 16) return 'ADVANCED';
  return 'EXPERT';
};

// Determine achievement difficulty for scoring
const getAchievementDifficulty = (achievement) => {
  const points = achievement.points;
  if (points <= 10) return 'BASIC';
  if (points <= 30) return 'INTERMEDIATE';
  if (points <= 75) return 'ADVANCED';
  return 'SPECIAL';
};

// Calculate lesson completion score
const calculateLessonScore = (completedLevels) => {
  if (!completedLevels || completedLevels.length === 0) return 0;
  
  return completedLevels.reduce((total, levelId) => {
    const levelNumber = parseInt(levelId) + 1; // Convert to 1-based indexing
    const difficulty = getLevelDifficulty(levelNumber);
    
    switch (difficulty) {
      case 'BASIC': return total + SCORING_SYSTEM.BASIC_LEVEL;
      case 'ADVANCED': return total + SCORING_SYSTEM.ADVANCED_LEVEL;
      case 'EXPERT': return total + SCORING_SYSTEM.EXPERT_LEVEL;
      default: return total;
    }
  }, 0);
};

// Calculate achievement score
const calculateAchievementScore = async (userAchievements) => {
  if (!userAchievements || userAchievements.length === 0) return 0;
  
  const allAchievements = await Achievement.find();
  let totalScore = 0;
  
  for (const userAchievement of userAchievements) {
    const achievement = allAchievements.find(a => 
      a._id.toString() === userAchievement.achievementId?.toString()
    );
    
    if (achievement) {
      const difficulty = getAchievementDifficulty(achievement);
      switch (difficulty) {
        case 'BASIC': totalScore += SCORING_SYSTEM.BASIC_ACHIEVEMENT; break;
        case 'INTERMEDIATE': totalScore += SCORING_SYSTEM.INTERMEDIATE_ACHIEVEMENT; break;
        case 'ADVANCED': totalScore += SCORING_SYSTEM.ADVANCED_ACHIEVEMENT; break;
        case 'SPECIAL': totalScore += SCORING_SYSTEM.SPECIAL_ACHIEVEMENT; break;
      }
    }
  }
  
  return totalScore;
};

// Calculate streak score with bonuses
const calculateStreakScore = (streak, maxStreak) => {
  if (!streak) return 0;
  
  let score = streak * SCORING_SYSTEM.DAILY_STREAK;
  
  // Add bonuses for milestone streaks
  if (streak >= 7) score += SCORING_SYSTEM.WEEK_STREAK_BONUS;
  if (streak >= 30) score += SCORING_SYSTEM.MONTH_STREAK_BONUS;
  
  return score;
};

// Calculate curriculum progression bonus
const calculateProgressionBonus = (completedLevels) => {
  if (!completedLevels || completedLevels.length === 0) return 0;
  
  const highestLevel = Math.max(...completedLevels.map(id => parseInt(id))) + 1;
  const tiersCompleted = Math.floor(highestLevel / 8); // Every 8 levels is a tier
  
  return tiersCompleted * SCORING_SYSTEM.CURRICULUM_TIER_BONUS;
};

// Main service functions
export const getLessonsLeaderboard = async (limit = 10) => {
  try {
    const users = await User.find({ 
      completedLevels: { $exists: true, $not: { $size: 0 } }
    })
    .select('username completedLevels totalPoints')
    .sort({ 'completedLevels.length': -1, totalPoints: -1 })
    .limit(limit);
    
    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const lessonScore = calculateLessonScore(user.completedLevels);
      return {
        rank: index + 1,
        userId: user._id,
        username: user.username,
        completedLevels: user.completedLevels?.length || 0,
        lessonScore: lessonScore,
        totalPoints: user.totalPoints || 0
      };
    }));
    
    return leaderboard;
  } catch (error) {
    throw new Error('Failed to fetch lessons leaderboard: ' + error.message);
  }
};

export const getAchievementsLeaderboard = async (limit = 10) => {
  try {
    const users = await User.find({
      achievements: { $exists: true, $not: { $size: 0 } }
    })
    .select('username achievements totalPoints')
    .sort({ 'achievements.length': -1, totalPoints: -1 })
    .limit(limit);
    
    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const achievementScore = await calculateAchievementScore(user.achievements);
      return {
        rank: index + 1,
        userId: user._id,
        username: user.username,
        achievementsCount: user.achievements?.length || 0,
        achievementScore: achievementScore,
        totalPoints: user.totalPoints || 0
      };
    }));
    
    return leaderboard;
  } catch (error) {
    throw new Error('Failed to fetch achievements leaderboard: ' + error.message);
  }
};

export const getStreaksLeaderboard = async (limit = 10) => {
  try {
    const users = await User.find({
      streak: { $exists: true, $gt: 0 }
    })
    .select('username streak maxStreak totalPoints')
    .sort({ streak: -1, maxStreak: -1, totalPoints: -1 })
    .limit(limit);
    
    const leaderboard = users.map((user, index) => {
      const streakScore = calculateStreakScore(user.streak, user.maxStreak);
      return {
        rank: index + 1,
        userId: user._id,
        username: user.username,
        currentStreak: user.streak || 0,
        maxStreak: user.maxStreak || 0,
        streakScore: streakScore,
        totalPoints: user.totalPoints || 0
      };
    });
    
    return leaderboard;
  } catch (error) {
    throw new Error('Failed to fetch streaks leaderboard: ' + error.message);
  }
};

export const getOverallProgressLeaderboard = async (limit = 10) => {
  try {
    // Get all users with any learning activity
    const users = await User.find({
      $or: [
        { completedLevels: { $exists: true, $not: { $size: 0 } } },
        { achievements: { $exists: true, $not: { $size: 0 } } },
        { streak: { $exists: true, $gt: 0 } }
      ]
    })
    .select('username completedLevels achievements streak maxStreak totalPoints')
    .limit(100); // Get more users to ensure good ranking
    
    const scoredUsers = await Promise.all(users.map(async (user) => {
      const lessonScore = calculateLessonScore(user.completedLevels);
      const achievementScore = await calculateAchievementScore(user.achievements);
      const streakScore = calculateStreakScore(user.streak, user.maxStreak);
      const progressionBonus = calculateProgressionBonus(user.completedLevels);
      
      const totalLearningScore = lessonScore + achievementScore + streakScore + progressionBonus;
      
      return {
        userId: user._id,
        username: user.username,
        completedLevels: user.completedLevels?.length || 0,
        achievementsCount: user.achievements?.length || 0,
        currentStreak: user.streak || 0,
        maxStreak: user.maxStreak || 0,
        lessonScore,
        achievementScore,
        streakScore,
        progressionBonus,
        totalLearningScore,
        totalPoints: user.totalPoints || 0
      };
    }));
    
    // Sort by total learning score and take top users
    const leaderboard = scoredUsers
      .sort((a, b) => b.totalLearningScore - a.totalLearningScore)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    
    return leaderboard;
  } catch (error) {
    throw new Error('Failed to fetch overall progress leaderboard: ' + error.message);
  }
};

// Get user's position in all leaderboards
export const getUserLeaderboardPositions = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Get all leaderboards
    const lessonsBoard = await getLessonsLeaderboard(100);
    const achievementsBoard = await getAchievementsLeaderboard(100);
    const streaksBoard = await getStreaksLeaderboard(100);
    const progressBoard = await getOverallProgressLeaderboard(100);
    
    // Find user's position in each
    const positions = {
      lessons: lessonsBoard.findIndex(u => u.userId.toString() === userId.toString()) + 1,
      achievements: achievementsBoard.findIndex(u => u.userId.toString() === userId.toString()) + 1,
      streaks: streaksBoard.findIndex(u => u.userId.toString() === userId.toString()) + 1,
      overall: progressBoard.findIndex(u => u.userId.toString() === userId.toString()) + 1
    };
    
    return {
      username: user.username,
      positions,
      totalCategories: 4
    };
  } catch (error) {
    throw new Error('Failed to fetch user leaderboard positions: ' + error.message);
  }
};