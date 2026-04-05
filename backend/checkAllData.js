import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PracticeSession from './models/PracticeSession.js';
import User from './models/User.js';

dotenv.config();

async function checkAllData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Check Practice Sessions
    const sessions = await PracticeSession.find();
    console.log('\n=== PRACTICE SESSIONS ===');
    console.log(`Total sessions: ${sessions.length}`);
    sessions.forEach(session => {
      console.log(`Session for user ${session.userId}:`);
      console.log(`  Duration: ${session.duration} seconds (${Math.round(session.duration/60)} minutes)`);
      console.log(`  Date: ${session.date}`);
      console.log('---');
    });
    
    // Check if there are any users with practice sessions but zero totalMinutes
    const users = await User.find();
    console.log('\n=== USERS WITH SESSIONS BUT ZERO TIME ===');
    for (const user of users) {
      const userSessions = sessions.filter(s => s.userId.toString() === user._id.toString());
      const totalTimeFromSessions = userSessions.reduce((sum, s) => sum + Math.floor(s.duration/60), 0);
      
      if (userSessions.length > 0 && user.totalMinutes === 0) {
        console.log(`User: ${user.username}`);
        console.log(`  Has ${userSessions.length} sessions totaling ${totalTimeFromSessions} minutes`);
        console.log(`  But totalMinutes = ${user.totalMinutes}`);
        console.log('---');
      }
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllData();