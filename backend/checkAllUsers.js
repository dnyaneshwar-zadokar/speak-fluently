import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({ completedLevels: { $exists: true } });
    
    console.log('=== ALL USERS WITH COMPLETED LEVELS ===\n');
    
    users.forEach(user => {
      const count = user.completedLevels?.length || 0;
      console.log(`${user.username}: ${count} levels completed`);
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllUsers();