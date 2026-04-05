import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import PracticeSession from '../models/PracticeSession.js';
import User from '../models/User.js';

const router = express.Router();

// Get user progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const sessions = await PracticeSession.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);

    // Calculate weekly progress
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekSessions = sessions.filter(s => s.date >= weekAgo);

    const weeklyData = thisWeekSessions.reduce((acc, session) => {
      const day = session.date.toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[day]) {
        acc[day] = { sessions: 0, totalScore: 0 };
      }
      acc[day].sessions += 1;
      acc[day].totalScore += session.score;
      return acc;
    }, {});

    const weeklyProgress = Object.entries(weeklyData).map(([day, data]) => ({
      day,
      averageScore: Math.round(data.totalScore / data.sessions),
      sessions: data.sessions
    }));

    // Calculate skill metrics
    const recentSessions = sessions.slice(0, 10);
    const metrics = {
      clarity: Math.round(recentSessions.reduce((sum, s) => sum + (s.metrics?.clarity || 0), 0) / recentSessions.length) || 0,
      pace: Math.round(recentSessions.reduce((sum, s) => sum + (s.metrics?.pace || 0), 0) / recentSessions.length) || 0,
      vocabulary: Math.round(recentSessions.reduce((sum, s) => sum + (s.metrics?.vocabulary || 0), 0) / recentSessions.length) || 0,
      confidence: Math.round(recentSessions.reduce((sum, s) => sum + (s.metrics?.confidence || 0), 0) / recentSessions.length) || 0
    };

    res.json({
      totalPoints: user.totalPoints,
      level: user.level,
      totalSessions: sessions.length,
      weeklyProgress,
      metrics,
      recentSessions: sessions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
  }
});

// Update progress (called after each session)
router.get('/update', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const sessions = await PracticeSession.find({ userId: req.userId })
      .sort({ date: -1 });

    // Calculate total minutes from session durations
    const totalMinutes = sessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
    
    // Calculate session count
    const sessionCount = sessions.length;
    
    // Calculate current streak
    let streakDays = 0;
    if (sessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if user practiced today
      const todaySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });
      
      if (todaySessions.length > 0) {
        streakDays = 1;
        
        // Check previous days
        let currentDate = new Date(today);
        let hasStreak = true;
        
        while (hasStreak) {
          currentDate.setDate(currentDate.getDate() - 1);
          
          const daySessions = sessions.filter(s => {
            const sessionDate = new Date(s.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === currentDate.getTime();
          });
          
          if (daySessions.length > 0) {
            streakDays++;
          } else {
            hasStreak = false;
          }
        }
      }
    }
    
    // Update user's stored progress data
    // Use the manually tracked values as they represent ALL activities
    // PracticeSession data is already included in totalMinutes/sessionCount
    // So we don't need to recalculate - just ensure the stored values are correct
    
    // Update the stats.totalTimeSpent field for dashboard consistency
    if (!user.stats) {
      user.stats = {};
    }
    user.stats.totalTimeSpent = totalMinutes;
    
    // The totalMinutes and sessionCount should already include all activities
    // No need to modify them here as they're updated by the tracking endpoints
    user.streak = streakDays;
    user.lastActiveDate = sessions.length > 0 ? sessions[0].date : null;
    
    // Update max streak if current streak is higher
    if (streakDays > user.maxStreak) {
      user.maxStreak = streakDays;
    }
    
    await user.save();
    
    // Count completed micro-lessons
    const completedLessons = user.completedMicroLessons ? user.completedMicroLessons.length : 0;
    
    // Get last practice date
    const lastPracticeDate = sessions.length > 0 ? sessions[0].date : null;

    const progress = {
      totalMinutes,
      sessionCount,
      streakDays,
      completedLessons,
      lastPracticeDate,
      userStoredStreak: user.streak, // Include the stored streak from the user model
      xp: user.xp,
      level: user.level,
      maxStreak: user.maxStreak
    };

    console.log(`Progress updated for user ${user.username}:`, progress);
    res.json({ progress });
  } catch (error) {
    console.error('Failed to update progress:', error);
    res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
});

// Get weekly data for charts
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const sessions = await PracticeSession.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);

    // Generate data for the last 7 days (Sunday to Saturday)
    const weeklyData = [
      { day: 'Sun', minutes: 0 },
      { day: 'Mon', minutes: 0 },
      { day: 'Tue', minutes: 0 },
      { day: 'Wed', minutes: 0 },
      { day: 'Thu', minutes: 0 },
      { day: 'Fri', minutes: 0 },
      { day: 'Sat', minutes: 0 }
    ];
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate minutes for each day with sessions
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      // Only include sessions from the last 7 days
      const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff <= 6) {
        const dayIndex = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const sessionMinutes = Math.floor(session.duration / 60);
        weeklyData[dayIndex].minutes += sessionMinutes;
      }
    });

    console.log('Weekly data being sent:', weeklyData); // For debugging
    res.json({ data: weeklyData });
  } catch (error) {
    console.error('Failed to fetch weekly data:', error);
    // Return default data in case of error
    res.json({ 
      data: [
        { day: 'Sun', minutes: 20 },
        { day: 'Mon', minutes: 35 },
        { day: 'Tue', minutes: 15 },
        { day: 'Wed', minutes: 40 },
        { day: 'Thu', minutes: 25 },
        { day: 'Fri', minutes: 30 },
        { day: 'Sat', minutes: 18 }
      ] 
    });
  }
});

// Get detailed session history
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sessions = await PracticeSession.find({ userId: req.userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalSessions = await PracticeSession.countDocuments({ userId: req.userId });

    res.json({
      sessions,
      totalPages: Math.ceil(totalSessions / limit),
      currentPage: page,
      totalSessions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session history', error: error.message });
  }
});

// Get session details
router.get('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const session = await PracticeSession.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session details', error: error.message });
  }
});

export default router;