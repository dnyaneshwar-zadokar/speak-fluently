import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    // Calculate the start of the current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    
    // Adjust to get Monday as the start of the week
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    console.log('Start of week:', startOfWeek);
    
    // Check practice sessions
    console.log('\nRecent practice sessions:');
    const recentSessions = await PracticeSession.find({
      date: { $gte: startOfWeek }
    }).populate('userId', 'username');
    
    recentSessions.forEach(session => {
      console.log(`${session.userId?.username || 'Unknown'}: ${session.duration} seconds (${Math.floor(session.duration / 60)} minutes), Score: ${session.score}`);
    });
    
    // Get all users
    const users = await User.find()
      .select('username completedMicroLessons totalPoints');
    
    console.log('\nUser activity this week (using decimal minutes):');
    
    // Calculate metrics for each user
    const userMetrics = [];
    
    for (const user of users) {
      // Get practice sessions for the current week
      const weeklySessions = await PracticeSession.find({
        userId: user._id,
        date: { $gte: startOfWeek }
      }).select('duration date');
      
      // Calculate total minutes for the week (using decimal minutes)
      const totalMinutes = weeklySessions.reduce((sum, session) => {
        return sum + (session.duration / 60);
      }, 0);
      
      // Count completed micro-lessons for the week
      const weeklyLessons = user.completedMicroLessons.filter(lesson => {
        return new Date(lesson.completedAt) >= startOfWeek;
      }).length;
      
      if (weeklySessions.length > 0 || weeklyLessons > 0) {
        console.log(`${user.username}: ${Math.round(totalMinutes * 100) / 100} minutes from ${weeklySessions.length} sessions, ${weeklyLessons} lessons`);
        weeklySessions.forEach(session => {
          console.log(`  - ${session.duration} seconds (${Math.round((session.duration / 60) * 100) / 100} minutes) on ${session.date}`);
        });
      }
      
      // Only include users with activity
      if (totalMinutes > 0 || weeklyLessons > 0) {
        userMetrics.push({
          userId: user._id,
          username: user.username,
          minutes: Math.round(totalMinutes * 100) / 100, // Round to 2 decimal places
          lessons: weeklyLessons
        });
      }
    }
    
    console.log('\nUsers with activity this week:', userMetrics.length);
    
    if (userMetrics.length > 0) {
      // Sort by minutes
      const sortedByMinutes = userMetrics.sort((a, b) => b.minutes - a.minutes);
      console.log('\nLeaderboard by minutes:');
      sortedByMinutes.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} - ${user.minutes} minutes`);
      });
      
      // Sort by lessons
      const sortedByLessons = userMetrics.sort((a, b) => b.lessons - a.lessons);
      console.log('\nLeaderboard by lessons:');
      sortedByLessons.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} - ${user.lessons} lessons`);
      });
    } else {
      console.log('No users with activity this week');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });