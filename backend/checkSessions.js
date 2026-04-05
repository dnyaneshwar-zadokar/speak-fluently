import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PracticeSession from './models/PracticeSession.js';
import User from './models/User.js';

dotenv.config();

async function checkSessionOwners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const sessions = await PracticeSession.find();
    console.log('Practice Sessions:');
    for (const session of sessions) {
      const user = await User.findById(session.userId);
      console.log('Session by ' + (user?.username || 'Unknown') + ': ' + Math.floor(session.duration/60) + ' minutes');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSessionOwners();