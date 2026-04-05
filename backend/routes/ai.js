import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import PracticeSession from '../models/PracticeSession.js';
import User from '../models/User.js';
import aiService from '../services/aiService.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

const router = express.Router();

// Get user's practice sessions
router.get('/practice', authMiddleware, async (req, res) => {
  try {
    const sessions = await PracticeSession.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(20);

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
});

// Create new practice session with AI feedback
router.post('/practice', authMiddleware, async (req, res) => {
  try {
    const { transcript, duration } = req.body;

    if (!transcript || !duration) {
      return res.status(400).json({ message: 'Transcript and duration are required' });
    }

    // Get AI analysis
    const analysis = await aiService.analyzeSpeech(transcript, duration);

    // Create practice session
    const session = new PracticeSession({
      userId: req.userId,
      transcript,
      duration,
      score: analysis.score,
      feedback: analysis.feedback,
      metrics: {
        clarity: analysis.clarity,
        pace: analysis.pace,
        vocabulary: analysis.vocabulary,
        confidence: analysis.confidence,
        fillerWords: analysis.fillerWords
      }
    });

    await session.save();

    // Update user points
    const pointsEarned = Math.round(analysis.score / 10);
    const xpEarned = pointsEarned * 10; // Convert points to XP
    
    // Update user statistics for time tracking and streaks
    const updatedUser = await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        totalPoints: pointsEarned,
        xp: xpEarned,
        totalMinutes: Math.floor(duration / 60),
        sessionCount: 1
      },
      $set: {
        lastActiveDate: new Date()
      }
    }, { new: true });
    
    // Check for achievements
    const unlockedAchievements = await checkAndUnlockAchievements(req.userId, 'practice_session', {
      score: analysis.score,
      duration: duration
    });
    
    // Update streak logic
    if (updatedUser.lastActiveDate) {
      const lastActive = new Date(updatedUser.lastActiveDate);
      const today = new Date();
      lastActive.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = updatedUser.streak || 0;
      if (diffDays <= 1) {
        // Consecutive day or same day
        newStreak = newStreak + (diffDays === 1 ? 1 : 0);
      } else {
        // Break in streak
        newStreak = 1; // Reset to 1 (today)
      }
      
      // Update streak and max streak
      await User.findByIdAndUpdate(req.userId, {
        $set: {
          streak: newStreak,
          maxStreak: Math.max(newStreak, updatedUser.maxStreak || 0)
        }
      });
    }
    
    // Level progression system based on XP (1000 XP per level)
    const currentLevel = updatedUser.level;
    const newLevel = Math.floor(updatedUser.xp / 1000) + 1;
    let leveledUp = false;
    
    if (newLevel > currentLevel) {
      // User leveled up!
      await User.findByIdAndUpdate(req.userId, {
        level: newLevel
      });
      leveledUp = true;
    }

    res.status(201).json({
      session,
      feedback: analysis.feedback,
      suggestions: analysis.suggestions,
      pointsEarned,
      xp: xpEarned,
      level: leveledUp ? newLevel : undefined, // Only send level if it increased
      leveledUp: leveledUp,
      unlockedAchievements: unlockedAchievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
});

// Comprehensive feedback endpoint
router.post('/comprehensive-feedback', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Get comprehensive AI feedback
    const feedback = await aiService.getComprehensiveFeedback(text);
    
    // Award XP for getting comprehensive feedback
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $inc: { xp: 5, totalPoints: 5 },
        $set: { lastActiveDate: new Date() }
      },
      { new: true }
    );
    
    // Check for achievements
    const unlockedAchievements = await checkAndUnlockAchievements(req.userId, 'comprehensive_feedback', {
      textLength: text.length
    });
    
    // Update streak logic for comprehensive feedback
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const today = new Date();
      lastActive.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = user.streak || 0;
      if (diffDays <= 1) {
        // Consecutive day or same day
        newStreak = newStreak + (diffDays === 1 ? 1 : 0);
      } else {
        // Break in streak
        newStreak = 1; // Reset to 1 (today)
      }
      
      // Update streak and max streak
      await User.findByIdAndUpdate(req.userId, {
        $set: {
          streak: newStreak,
          maxStreak: Math.max(newStreak, user.maxStreak || 0)
        }
      });
    }
    
    // Calculate and update level based on XP
    const currentLevel = user.level;
    const newLevel = Math.floor(user.xp / 1000) + 1;
    let leveledUp = false;
    
    if (newLevel > currentLevel) {
      // User leveled up!
      await User.findByIdAndUpdate(req.userId, {
        level: newLevel
      });
      leveledUp = true;
    }

    res.json({ 
      feedback, 
      xp: 5, 
      level: leveledUp ? newLevel : user.level,
      leveledUp: leveledUp,
      unlockedAchievements: unlockedAchievements
    });
  } catch (error) {
    console.error('Comprehensive feedback error:', error);
    res.status(500).json({ message: 'Failed to get comprehensive feedback', error: error.message });
  }
});

// Get practice topic suggestion
router.get('/topic', authMiddleware, async (req, res) => {
  try {
    const topic = await aiService.generatePracticeTopic();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate topic', error: error.message });
  }
});

// Get session analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const sessions = await PracticeSession.find({ userId: req.userId });

    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        averageScore: 0,
        totalTime: 0,
        progress: []
      });
    }

    const totalSessions = sessions.length;
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    const progress = sessions.slice(-7).map(s => ({
      date: s.date,
      score: s.score
    }));

    res.json({
      totalSessions,
      averageScore: Math.round(averageScore),
      totalTime,
      progress
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// AI Chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log('AI chat request received:', { message, historyLength: history?.length || 0 });

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get AI chat response
    const reply = await aiService.getChatResponse(message, history || []);
    console.log('AI chat response generated:', reply.substring(0, 100) + '...');

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to get chat response', error: error.message });
  }
});

export default router;