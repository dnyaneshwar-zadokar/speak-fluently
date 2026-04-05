import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import PracticeSession from '../models/PracticeSession.js';

const router = express.Router();

// Simple in-memory cache for leaderboard data
export const leaderboardCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get cached data or undefined if expired/missing
function getCachedData(key) {
  const cached = leaderboardCache.get(key);
  if (!cached) return undefined;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    leaderboardCache.delete(key);
    return undefined;
  }
  
  return cached.data;
}

// Function to set cached data
function setCachedData(key, data) {
  leaderboardCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Get weekly leaderboard - optimized version with caching
router.get('/week', authMiddleware, async (req, res) => {
  try {
    const { type = 'minutes' } = req.query;
    const cacheKey = `weekly_${type}`;
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.json({ leaderboard: cachedData });
    }
    
    // Calculate the start of the current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    
    // Adjust to get Monday as the start of the week
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Optimize by limiting the number of users we process
    const users = await User.find()
      .select('username completedMicroLessons totalMinutes sessionCount stats.totalTimeSpent')
      .limit(100); // Limit to top 100 users to prevent performance issues
    
    // Calculate metrics for each user
    const userMetrics = [];
    
    // Process users in smaller batches to avoid blocking the event loop
    for (const user of users) {
      // Use the accumulated totalMinutes from all activities
      let totalMinutes = user.totalMinutes || 0;
      
      // Also include stats.totalTimeSpent if available (for dashboard consistency)
      if (user.stats?.totalTimeSpent) {
        totalMinutes = Math.max(totalMinutes, user.stats.totalTimeSpent);
      }
      
      // For weekly leaderboard, we could adjust this to be weekly time
      // But for now, let's use total accumulated time
      
      // Count completed micro-lessons for the week
      const weeklyLessons = user.completedMicroLessons.filter(lesson => {
        return new Date(lesson.completedAt) >= startOfWeek;
      }).length;
      
      // Only include users with actual time spent (greater than 0)
      if (totalMinutes > 0) {
        userMetrics.push({
          userId: user._id,
          username: user.username,
          minutes: Math.round(totalMinutes * 100) / 100, // Round to 2 decimal places
          lessons: weeklyLessons
        });
      }
    }
    
    // Sort by the requested type and limit results
    let sortedMetrics;
    if (type === 'lessons') {
      sortedMetrics = userMetrics.sort((a, b) => b.lessons - a.lessons);
    } else {
      sortedMetrics = userMetrics.sort((a, b) => b.minutes - a.minutes);
    }
    
    // Limit to top 50 users
    sortedMetrics = sortedMetrics.slice(0, 50);
    
    // Add ranks
    const leaderboard = sortedMetrics.map((user, index) => ({
      ...user,
      rank: index + 1,
      avatar: user.username.charAt(0).toUpperCase()
    }));
    
    // Cache the result
    setCachedData(cacheKey, leaderboard);
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Failed to fetch weekly leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

// Get overall leaderboard based on total points - optimized version with caching
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check cache first
    const cachedData = getCachedData('overall');
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Limit to top 50 users for performance
    const topUsers = await User.find()
      .select('username totalPoints level')
      .sort({ totalPoints: -1 })
      .limit(50);

    const currentUser = await User.findById(req.userId)
      .select('username totalPoints level');

    // Find current user's rank more efficiently
    const userCount = await User.countDocuments({ totalPoints: { $gt: currentUser.totalPoints } });
    const userRank = userCount + 1;

    const result = {
      leaderboard: topUsers.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        points: user.totalPoints,
        level: user.level,
        avatar: user.username.charAt(0).toUpperCase()
      })),
      currentUser: {
        rank: userRank,
        username: currentUser.username,
        points: currentUser.totalPoints,
        level: currentUser.level
      }
    };
    
    // Cache the result
    setCachedData('overall', result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

// Clear cache endpoint (for admin use or when data changes)
router.post('/clear-cache', authMiddleware, (req, res) => {
  leaderboardCache.clear();
  res.json({ message: 'Leaderboard cache cleared' });
});

export default router;