import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Achievement from '../models/Achievement.js';
import User from '../models/User.js';

const router = express.Router();

// Get all achievements with user progress
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const allAchievements = await Achievement.find();
    const user = await User.findById(req.userId);
    
    // Populate user achievements with full achievement data
    await user.populate('achievements.achievementId');

    const achievementsWithStatus = allAchievements.map(achievement => {
      const userAchievement = user.achievements.find(a => 
        a.achievementId && a.achievementId._id.toString() === achievement._id.toString()
      );
      
      return {
        ...achievement.toObject(),
        unlocked: !!userAchievement,
        unlockedAt: userAchievement ? userAchievement.unlockedAt : null
      };
    });

    res.json({ achievements: achievementsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch achievements', error: error.message });
  }
});

// Initialize default achievements
router.post('/init', async (req, res) => {
  try {
    const defaultAchievements = [
      // Basic Achievements
      { 
        name: 'First Steps', 
        description: 'Complete your first practice session', 
        icon: '🎯', 
        points: 10, 
        category: 'milestone' 
      },
      { 
        name: 'Week Warrior', 
        description: 'Practice 7 days in a row', 
        icon: '🔥', 
        points: 50, 
        category: 'streak' 
      },
      { 
        name: 'Perfect Score', 
        description: 'Get a score of 95 or higher', 
        icon: '⭐', 
        points: 30, 
        category: 'mastery' 
      },
      { 
        name: 'Social Butterfly', 
        description: 'Chat with 5 different peers', 
        icon: '💬', 
        points: 20, 
        category: 'social' 
      },
      { 
        name: 'Century Club', 
        description: 'Earn 100 total points', 
        icon: '💯', 
        points: 25, 
        category: 'milestone' 
      },
      
      // AI Communication Mentor Achievements
      { 
        name: 'Level 1 Master', 
        description: 'Complete your first AI Communication level', 
        icon: '⭐', 
        points: 20, 
        category: 'milestone' 
      },
      { 
        name: 'Conversation Starter', 
        description: 'Complete 5 AI Communication levels', 
        icon: '🗣️', 
        points: 50, 
        category: 'milestone' 
      },
      { 
        name: 'Sentence Builder', 
        description: 'Complete 10 AI Communication levels', 
        icon: '🔤', 
        points: 75, 
        category: 'mastery' 
      },
      { 
        name: 'Fluency Champion', 
        description: 'Complete 15 AI Communication levels', 
        icon: '🎤', 
        points: 100, 
        category: 'mastery' 
      },
      { 
        name: 'Communication Master', 
        description: 'Complete all 25 AI Communication levels', 
        icon: '🏆', 
        points: 200, 
        category: 'mastery' 
      },
      
      // Practice Achievements
      { 
        name: 'Master Speaker', 
        description: 'Complete 50 practice sessions', 
        icon: '🏆', 
        points: 100, 
        category: 'mastery' 
      },
      { 
        name: 'Quick Learner', 
        description: 'Complete 10 micro-lessons', 
        icon: '🚀', 
        points: 40, 
        category: 'milestone' 
      },
      { 
        name: 'Consistency King', 
        description: 'Maintain a 30-day practice streak', 
        icon: '👑', 
        points: 150, 
        category: 'streak' 
      },
      { 
        name: 'Top Performer', 
        description: 'Reach the top 5 on the leaderboard', 
        icon: '🏅', 
        points: 75, 
        category: 'mastery' 
      }
    ];

    await Achievement.insertMany(defaultAchievements);
    res.json({ message: 'Achievements initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize achievements', error: error.message });
  }
});

// Get user's unlocked achievements
router.get('/unlocked', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    await user.populate('achievements.achievementId');
    
    const unlockedAchievements = user.achievements.map(item => ({
      ...item.achievementId.toObject(),
      unlockedAt: item.unlockedAt
    }));
    
    res.json({ achievements: unlockedAchievements });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unlocked achievements', error: error.message });
  }
});

// Get achievement statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const allAchievements = await Achievement.countDocuments();
    const user = await User.findById(req.userId);
    const unlockedCount = user.achievements.length;
    
    res.json({
      total: allAchievements,
      unlocked: unlockedCount,
      locked: allAchievements - unlockedCount,
      percentage: allAchievements > 0 ? Math.round((unlockedCount / allAchievements) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch achievement stats', error: error.message });
  }
});

// Unlock an achievement for a user
router.post('/unlock/:achievementId', authMiddleware, async (req, res) => {
  try {
    const { achievementId } = req.params;
    const userId = req.userId;
    
    // Check if achievement exists
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check if user already has this achievement
    const user = await User.findById(userId);
    const alreadyUnlocked = user.achievements.some(item => 
      item.achievementId && item.achievementId.toString() === achievementId
    );
    
    if (alreadyUnlocked) {
      return res.status(400).json({ message: 'Achievement already unlocked' });
    }
    
    // Add achievement to user
    user.achievements.push({
      achievementId: achievementId,
      unlockedAt: new Date()
    });
    
    // Add points to user's total
    user.totalPoints += achievement.points;
    
    await user.save();
    
    res.json({ 
      message: 'Achievement unlocked successfully',
      pointsAwarded: achievement.points,
      totalPoints: user.totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlock achievement', error: error.message });
  }
});

export default router;