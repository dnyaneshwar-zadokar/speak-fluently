import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Check kundan user data
  const kundanUser = await User.findOne({ username: 'kundan' });
  console.log('=== Kundan User Data ===');
  console.log('Username:', kundanUser?.username);
  console.log('Total Time Spent (user field):', kundanUser?.totalTimeSpent);
  console.log('Stats Total Time Spent:', kundanUser?.stats?.totalTimeSpent);
  console.log('Practice Sessions Count:', kundanUser?.practiceSessions?.length || 0);
  console.log('Completed Lessons Count:', kundanUser?.stats?.completedLessons?.length || 0);
  
  if (kundanUser?.practiceSessions?.length > 0) {
    console.log('\nPractice Sessions:');
    kundanUser.practiceSessions.forEach((session, index) => {
      console.log(`  ${index + 1}. Topic: ${session.topic}, Time: ${session.timeSpent} minutes, Completed: ${session.completed}`);
    });
  }
  
  // Check leaderboard
  console.log('\n=== Leaderboard Data ===');
  const leaderboard = await User.find({ 'stats.totalTimeSpent': { $gt: 0 } })
    .sort({ 'stats.totalTimeSpent': -1 })
    .limit(10)
    .select('username stats.totalTimeSpent');
    
  leaderboard.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} - ${user.stats.totalTimeSpent} minutes`);
  });
  
  mongoose.connection.close();
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}