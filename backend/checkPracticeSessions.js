import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

async function checkPracticeSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get user Tejas
    const user = await User.findOne({ username: 'Tejas' });
    if (!user) {
      console.log('User Tejas not found');
      return;
    }
    
    console.log('=== CHECKING PRACTICE SESSIONS ===\n');
    
    // Find practice sessions for this user
    const sessions = await PracticeSession.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${sessions.length} practice sessions for ${user.username}`);
    
    if (sessions.length > 0) {
      console.log('\nRecent sessions:');
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. ${session.createdAt.toLocaleDateString()} - Score: ${session.score || 'N/A'} - Duration: ${session.duration || 'N/A'}`);
      });
      
      // Count total sessions
      const totalSessions = await PracticeSession.countDocuments({ userId: user._id });
      console.log(`\nTotal practice sessions: ${totalSessions}`);
      
      // Check for streak calculation
      console.log('\n=== STREAK ANALYSIS ===');
      const sessionDates = sessions.map(s => s.createdAt.toDateString()).sort();
      const uniqueDates = [...new Set(sessionDates)];
      console.log(`Unique practice days: ${uniqueDates.length}`);
      
      // Update user session count if needed
      if (totalSessions > 0 && (!user.sessionCount || user.sessionCount === 0)) {
        user.sessionCount = totalSessions;
        console.log(`✅ Updated session count to: ${user.sessionCount}`);
        
        // Check if First Steps should unlock
        const achievement = await mongoose.model('Achievement').findOne({ name: 'First Steps' });
        if (achievement && totalSessions >= 1) {
          const userAchievementNames = user.achievements?.map(a => a.achievementId?.toString()) || [];
          const allAchievements = await mongoose.model('Achievement').find();
          const userAchievementIds = userAchievementNames.map(name => {
            const ach = allAchievements.find(a => a.name === name);
            return ach ? ach._id.toString() : null;
          }).filter(Boolean);
          
          if (!userAchievementIds.includes(achievement._id.toString())) {
            user.achievements.push({
              achievementId: achievement._id,
              unlockedAt: new Date()
            });
            user.totalPoints = (user.totalPoints || 0) + achievement.points;
            console.log(`✅ Added First Steps achievement (+${achievement.points} pts)`);
          }
        }
        
        await user.save();
        console.log('💾 User data updated');
      }
    } else {
      console.log('No practice sessions found for this user');
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPracticeSessions();