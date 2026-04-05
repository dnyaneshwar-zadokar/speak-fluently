import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Update user XP
router.post('/add-xp', authMiddleware, async (req, res) => {
  try {
    const { xp } = req.body;
    if (!xp || xp <= 0) {
      return res.status(400).json({ message: 'Invalid XP value' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update XP and calculate level
    user.xp += xp;
    user.totalPoints += xp; // Also update total points
    user.level = Math.floor(user.xp / 1000) + 1;

    await user.save();

    res.json({
      message: 'XP added successfully',
      xp: user.xp,
      level: user.level,
      totalPoints: user.totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add XP', error: error.message });
  }
});

// Update user streak
router.post('/update-streak', authMiddleware, async (req, res) => {
  try {
    const { streak, amount } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If amount is provided, update streak relatively
    if (amount !== undefined) {
      user.streak = Math.max(0, user.streak + amount);
    } else if (streak !== undefined) {
      // Otherwise update streak absolutely
      user.streak = streak;
    }

    // Update max streak if current streak is higher
    if (user.streak > user.maxStreak) {
      user.maxStreak = user.streak;
    }

    await user.save();

    res.json({
      message: 'Streak updated successfully',
      streak: user.streak,
      maxStreak: user.maxStreak
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update streak', error: error.message });
  }
});

// Get user profile with gamification data
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        maxStreak: user.maxStreak,
        totalPoints: user.totalPoints,
        achievements: user.achievements,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
});

// Track user activity for time and session tracking
router.post('/track-activity', authMiddleware, async (req, res) => {
  try {
    const { activityType, duration } = req.body;
    if (!activityType || !duration) {
      return res.status(400).json({ message: 'Activity type and duration are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user stats based on activity
    user.totalMinutes += duration;
    user.sessionCount += 1;

    // Update last active date
    user.lastActiveDate = new Date();

    await user.save();

    res.json({
      message: 'Activity tracked successfully',
      totalMinutes: user.totalMinutes,
      sessionCount: user.sessionCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track activity', error: error.message });
  }
});

// Track peer chat session
router.post('/track-peer-session', authMiddleware, async (req, res) => {
  try {
    const { duration } = req.body;
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Duration is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user stats
    user.totalMinutes += duration;
    user.sessionCount += 1;
    user.lastActiveDate = new Date();

    await user.save();

    res.json({
      message: 'Peer session tracked successfully',
      totalMinutes: user.totalMinutes,
      sessionCount: user.sessionCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track peer session', error: error.message });
  }
});

// Update user level (when leveling up)
router.post('/update-level', authMiddleware, async (req, res) => {
  try {
    const { level } = req.body;
    if (!level || level <= 0) {
      return res.status(400).json({ message: 'Invalid level value' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.level = level;
    await user.save();

    res.json({
      message: 'Level updated successfully',
      level: user.level
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update level', error: error.message });
  }
});

export default router;