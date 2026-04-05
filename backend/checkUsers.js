import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    const users = await User.find();
    console.log('Total users:', users.length);
    
    const activeUsers = users.filter(u => u.totalPoints > 0);
    console.log('Active users (with points):', activeUsers.length);
    
    // Show top users
    console.log('\nTop 5 users by points:');
    const topUsers = await User.find().sort({ totalPoints: -1 }).limit(5);
    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.totalPoints} points`);
    });
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });