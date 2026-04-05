import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

async function fixTimeTrackingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');

    // Get all users
    const users = await User.find();
    
    console.log('=== FIXING TIME TRACKING DATA ===\n');
    
    for (const user of users) {
      console.log(`Processing user: ${user.username}`);
      
      // Get practice sessions for this user
      const sessions = await PracticeSession.find({ userId: user._id });
      const totalSessionMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
      const sessionCount = sessions.length;
      
      console.log(`  Sessions found: ${sessionCount}`);
      console.log(`  Total minutes from sessions: ${totalSessionMinutes}`);
      console.log(`  Current totalMinutes: ${user.totalMinutes}`);
      console.log(`  Current sessionCount: ${user.sessionCount}`);
      
      // Fix inconsistencies
      let updates = {};
      
      if (user.totalMinutes !== totalSessionMinutes) {
        updates.totalMinutes = totalSessionMinutes;
        console.log(`  ⚠️  Fixing totalMinutes: ${user.totalMinutes} → ${totalSessionMinutes}`);
      }
      
      if (user.sessionCount !== sessionCount) {
        updates.sessionCount = sessionCount;
        console.log(`  ⚠️  Fixing sessionCount: ${user.sessionCount} → ${sessionCount}`);
      }
      
      // Set lastActiveDate if user has sessions but no lastActiveDate
      if (sessionCount > 0 && !user.lastActiveDate) {
        const latestSession = sessions.reduce((latest, session) => 
          new Date(session.date) > new Date(latest.date) ? session : latest
        );
        updates.lastActiveDate = latestSession.date;
        console.log(`  ⚠️  Setting lastActiveDate to: ${latestSession.date}`);
      }
      
      // Calculate and set streak if needed
      if (user.lastActiveDate && (user.streak === 0 || !user.streak)) {
        const lastActive = new Date(user.lastActiveDate);
        const today = new Date();
        lastActive.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          updates.streak = diffDays === 1 ? 1 : 0;
          console.log(`  ⚠️  Setting streak: ${updates.streak}`);
        }
      }
      
      // Update max streak if current streak is higher
      if (user.streak > (user.maxStreak || 0)) {
        updates.maxStreak = user.streak;
        console.log(`  ⚠️  Updating maxStreak: ${user.maxStreak || 0} → ${user.streak}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        console.log(`  ✅ Updated user ${user.username}`);
      } else {
        console.log(`  ✅ No fixes needed for ${user.username}`);
      }
      
      console.log('---');
    }
    
    console.log('\n=== VERIFICATION ===');
    // Verify fixes
    const updatedUsers = await User.find().select('username totalMinutes sessionCount streak maxStreak lastActiveDate');
    
    console.log('\nUpdated user statistics:');
    updatedUsers.forEach(user => {
      console.log(`${user.username}: ${user.totalMinutes} minutes, ${user.sessionCount} sessions, streak: ${user.streak}/${user.maxStreak}, last active: ${user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'Never'}`);
    });
    
    await mongoose.connection.close();
    console.log('\nFix complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixTimeTrackingData();