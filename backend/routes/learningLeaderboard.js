import express from 'express';
import { authMiddleware as auth } from '../middleware/auth.js';
import {
  getLessonsLeaderboard,
  getAchievementsLeaderboard,
  getStreaksLeaderboard,
  getOverallProgressLeaderboard,
  getUserLeaderboardPositions
} from '../services/learningLeaderboardService.js';

const router = express.Router();

// Get all learning leaderboards data
router.get('/learning', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const [lessons, achievements, streaks, progress] = await Promise.all([
      getLessonsLeaderboard(limit),
      getAchievementsLeaderboard(limit),
      getStreaksLeaderboard(limit),
      getOverallProgressLeaderboard(limit)
    ]);
    
    const userPositions = await getUserLeaderboardPositions(req.userId);
    
    res.json({
      success: true,
      data: {
        lessons,
        achievements,
        streaks,
        overallProgress: progress,
        userPositions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get lessons leaderboard
router.get('/learning/lessons', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getLessonsLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard,
      category: 'lessons',
      title: 'Lesson Masters'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get achievements leaderboard
router.get('/learning/achievements', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getAchievementsLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard,
      category: 'achievements',
      title: 'Achievement Hunters'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get streaks leaderboard
router.get('/learning/streaks', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getStreaksLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard,
      category: 'streaks',
      title: 'Streak Champions'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get overall progress leaderboard
router.get('/learning/progress', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getOverallProgressLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard,
      category: 'progress',
      title: 'Learning Progress'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's position in all leaderboards
router.get('/learning/user-position', auth, async (req, res) => {
  try {
    const positions = await getUserLeaderboardPositions(req.userId);
    
    if (!positions) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get top 3 users for each category (for dashboard display)
router.get('/learning/top3', auth, async (req, res) => {
  try {
    const [lessons, achievements, streaks, progress] = await Promise.all([
      getLessonsLeaderboard(3),
      getAchievementsLeaderboard(3),
      getStreaksLeaderboard(3),
      getOverallProgressLeaderboard(3)
    ]);
    
    res.json({
      success: true,
      data: {
        lessons: lessons.slice(0, 3),
        achievements: achievements.slice(0, 3),
        streaks: streaks.slice(0, 3),
        overall: progress.slice(0, 3)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;