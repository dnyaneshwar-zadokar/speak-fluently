import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import User from '../models/User.js';
import PracticeSession from '../models/PracticeSession.js';
import Achievement from '../models/Achievement.js';

const router = express.Router();

// Get all users statistics
router.get('/users/stats', adminMiddleware, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get users registered in last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    // Get users registered in last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: last7Days }
    });

    // Get total practice sessions
    const totalSessions = await PracticeSession.countDocuments();

    // Get total achievements unlocked
    const totalAchievements = await Achievement.countDocuments();

    // Get all users with their activity (excluding email for security)
    const users = await User.find()
      .select('username totalPoints level createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      statistics: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        totalSessions,
        totalAchievements
      },
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
  }
});

// Get analytics overview
router.get('/analytics/overview', adminMiddleware, async (req, res) => {
  try {
    // Get top users by points (excluding email for security)
    const topUsers = await User.find()
      .select('username totalPoints level')
      .sort({ totalPoints: -1 })
      .limit(10);

    // Get recent practice sessions
    const recentSessions = await PracticeSession.find()
      .populate('userId', 'username') // Only populate username, not email
      .sort({ date: -1 })
      .limit(30); // Increased from 10 to 30 to show more diverse activity

    res.json({
      topUsers,
      recentSessions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Get recent activity
router.get('/activity/recent', adminMiddleware, async (req, res) => {
  try {
    // Get recent practice sessions with user info (excluding email for security)
    const recentSessions = await PracticeSession.find()
      .populate('userId', 'username') // Only populate username, not email
      .sort({ date: -1 })
      .limit(50); // Increased from 20 to 50 to show more diverse activity

    res.json({
      recentSessions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent activity', error: error.message });
  }
});

// Clear leaderboard cache
router.post('/leaderboard/clear-cache', adminMiddleware, async (req, res) => {
  try {
    // Import the leaderboard cache and clear it
    const { leaderboardCache } = await import('../routes/leaderboard.js');
    leaderboardCache.clear();
    
    res.json({ message: 'Leaderboard cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear leaderboard cache', error: error.message });
  }
});

// Make user an admin (for development/testing purposes)
router.post('/make-admin', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    
    // Check if the current user is tejas@gmail.com
    if (req.user.email !== 'tejas@gmail.com') {
      return res.status(403).json({ message: 'Access denied. Only tejas@gmail.com can grant admin privileges.' });
    }
    
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Make the user an admin
    user.isAdmin = true;
    await user.save();
    
    res.json({ message: `${user.username} is now an admin` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to make user admin', error: error.message });
  }
});

// Remove admin privileges from user
router.post('/remove-admin', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    
    // Check if the current user is tejas@gmail.com
    if (req.user.email !== 'tejas@gmail.com') {
      return res.status(403).json({ message: 'Access denied. Only tejas@gmail.com can revoke admin privileges.' });
    }
    
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove admin privileges
    user.isAdmin = false;
    await user.save();
    
    res.json({ message: `${user.username} is no longer an admin` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove admin privileges', error: error.message });
  }
});

export default router;