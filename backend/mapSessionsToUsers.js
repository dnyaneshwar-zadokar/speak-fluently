import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

async function mapSessionsToUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get all users
    const users = await User.find({}, 'username _id');
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.username;
    });
    
    // Get all sessions
    const sessions = await PracticeSession.find();
    
    console.log('=== SESSION TO USER MAPPING ===\n');
    sessions.forEach((session, index) => {
      const username = userMap[session.userId.toString()] || 'Unknown User';
      console.log(`Session ${index + 1}:`);
      console.log(`  User: ${username} (${session.userId})`);
      console.log(`  Duration: ${session.duration} seconds (${Math.floor(session.duration/60)} minutes)`);
      console.log(`  Date: ${session.date}`);
      console.log(`  Transcript: ${session.transcript.substring(0, 50)}...`);
      console.log('---');
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

mapSessionsToUsers();