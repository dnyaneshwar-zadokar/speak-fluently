import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const kundan = await User.findOne({username: 'kundan'});
  console.log('Kundan user ID:', kundan?._id);
  
  const sessions = await PracticeSession.find({userId: kundan?._id});
  console.log('Kundan practice sessions count:', sessions.length);
  
  if (sessions.length > 0) {
    console.log('Session durations:', sessions.map(s => s.duration));
    console.log('Session dates:', sessions.map(s => s.date));
  } else {
    console.log('No practice sessions found for kundan');
  }
  
  mongoose.connection.close();
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}