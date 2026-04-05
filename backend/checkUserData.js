import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUserData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Find all users to check their data
    const users = await User.find();
    console.log('\n=== USER DATA CHECK ===');
    users.forEach(user => {
      console.log(`User: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  totalMinutes: ${user.totalMinutes}`);
      console.log(`  sessionCount: ${user.sessionCount}`);
      console.log(`  completedMicroLessons: ${user.completedMicroLessons?.length || 0}`);
      console.log(`  streak: ${user.streak}`);
      console.log(`  lastActiveDate: ${user.lastActiveDate}`);
      console.log('---');
    });
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserData();