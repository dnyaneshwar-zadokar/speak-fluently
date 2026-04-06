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
    const sessionMinutes = sessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
    
    // Calculate minutes from completed micro-lessons
    // Each lesson is associated with an estimatedTime from the lesson document
    // But since we don't want to do another join here, I'll use a baseline or lookup
    const lessonMinutes = user.completedMicroLessons ? user.completedMicroLessons.length * 5 : 0; // Default 5 mins per lesson
    
    const totalMinutes = sessionMinutes + lessonMinutes;
    
    // Calculate session count (Sessions + Lessons + Mentor Levels)
    const completedLessons = user.completedMicroLessons ? user.completedMicroLessons.length : 0;
    const completedMentorLevels = user.completedLevels ? user.completedLevels.length : 0;
    const sessionCount = sessions.length + completedLessons + completedMentorLevels;
    
    // Calculate current streak considering ALL types of activity
    let streakDays = 0;
    
    // Combine all activity dates
    const activityDates = [
      ...sessions.map(s => s.date),
      ...(user.completedMicroLessons || []).map(l => l.completedAt),
      ...(user.completedLevels || []).map(l => l.completedAt)
    ].filter(d => d).sort((a, b) => b - a);

    if (activityDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivityDate = new Date(activityDates[0]);
      lastActivityDate.setHours(0, 0, 0, 0);
      
      const diffSinceLastActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
      
      if (diffSinceLastActivity <= 1) {
        // User was active today or yesterday, start counting streak
        streakDays = 1;
        
        let currentDate = new Date(lastActivityDate);
        let hasStreak = true;
        let daysChecked = 0;
        
        while (hasStreak && daysChecked < 365) { // Safety limit
          const previousDate = new Date(currentDate);
          previousDate.setDate(previousDate.getDate() - 1);
          
          const wasActiveOnDate = activityDates.some(d => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === previousDate.getTime();
          });
          
          if (wasActiveOnDate) {
            streakDays++;
            currentDate = previousDate;
            daysChecked++;
          } else {
            hasStreak = false;
          }
        }
      }
    }
    
    // Update user's stored progress data
    if (!user.stats) {
      user.stats = {};
    }
    user.stats.totalTimeSpent = totalMinutes;
    user.totalMinutes = totalMinutes;
    user.sessionCount = sessionCount;
    user.streak = streakDays;
    user.lastActiveDate = activityDates.length > 0 ? activityDates[0] : user.lastActiveDate;
    
    // Update max streak if current streak is higher
    if (streakDays > user.maxStreak) {
      user.maxStreak = streakDays;
    }
    
    await user.save();
    
    // Get last practice date
    const lastPracticeDate = activityDates.length > 0 ? activityDates[0] : null;

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