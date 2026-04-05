import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    // Check users
    const userCount = await User.countDocuments();
    console.log('Total users:', userCount);
    
    if (userCount > 0) {
      const users = await User.find().select('username totalPoints level isAdmin');
      console.log('Users:');
      users.forEach(user => {
        console.log(`- ${user.username}: ${user.totalPoints} points, level ${user.level}, admin: ${user.isAdmin}`);
      });
    }
    
    // Check practice sessions
    const sessionCount = await PracticeSession.countDocuments();
    console.log('Total practice sessions:', sessionCount);
    
    if (sessionCount > 0) {
      const sessions = await PracticeSession.find().populate('userId', 'username').limit(5);
      console.log('Recent sessions:');
      sessions.forEach(session => {
        console.log(`- ${session.userId?.username || 'Unknown'}: ${session.score}/100, ${Math.floor(session.duration/60)} minutes`);
      });
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });