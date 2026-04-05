import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

async function diagnoseTimeTracking() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');

    // Check all users with their time tracking data
    const users = await User.find().select('username totalMinutes sessionCount streak lastActiveDate xp level maxStreak completedLevels');
    
    console.log('=== USER TIME TRACKING DIAGNOSIS ===\n');
    
    for (const user of users) {
      console.log(`User: ${user.username}`);
      console.log(`  Total Minutes: ${user.totalMinutes}`);
      console.log(`  Session Count: ${user.sessionCount}`);
      console.log(`  Current Streak: ${user.streak}`);
      console.log(`  Max Streak: ${user.maxStreak}`);
      console.log(`  Last Active: ${user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'Never'}`);
      console.log(`  XP: ${user.xp}`);
      console.log(`  Level: ${user.level}`);
      console.log(`  Completed Levels: ${user.completedLevels?.length || 0}`);
      
      // Check practice sessions for this user
      const sessions = await PracticeSession.find({ userId: user._id });
      const totalSessionMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
      
      console.log(`  Practice Sessions: ${sessions.length}`);
      console.log(`  Total Minutes from Sessions: ${totalSessionMinutes}`);
      
      if (sessions.length > 0) {
        console.log('  Recent Sessions:');
        sessions.slice(-3).forEach(session => {
          console.log(`    - ${new Date(session.date).toLocaleDateString()}: ${Math.floor(session.duration/60)} minutes, Score: ${session.score}`);
        });
      }
      
      // Check for inconsistencies
      if (user.totalMinutes === 0 && sessions.length > 0) {
        console.log(`  ⚠️  INCONSISTENCY: Has ${sessions.length} sessions but totalMinutes = 0`);
      }
      
      if (user.sessionCount === 0 && sessions.length > 0) {
        console.log(`  ⚠️  INCONSISTENCY: Has ${sessions.length} sessions but sessionCount = 0`);
      }
      
      console.log('---');
    }
    
    // Check streak calculation logic
    console.log('\n=== STREAK CALCULATION CHECK ===');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const user of users) {
      if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`${user.username}:`);
        console.log(`  Last active: ${lastActive.toLocaleDateString()}`);
        console.log(`  Today: ${today.toLocaleDateString()}`);
        console.log(`  Days difference: ${diffDays}`);
        console.log(`  Stored streak: ${user.streak}`);
        console.log(`  Should streak be: ${diffDays <= 1 ? 'maintained/increased' : 'reset to 0'}`);
        console.log('---');
      }
    }
    
    await mongoose.connection.close();
    console.log('\nDiagnosis complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

diagnoseTimeTracking();