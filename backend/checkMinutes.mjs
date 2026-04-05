import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Check users with totalMinutes > 0
  const users = await User.find({totalMinutes: {$gt: 0}})
    .select('username totalMinutes')
    .sort({totalMinutes: -1})
    .limit(10);
    
  console.log('Users with totalMinutes > 0:');
  users.forEach((u, i) => {
    console.log(`${i+1}. ${u.username}: ${u.totalMinutes} minutes`);
  });
  
  // Check if kundan is in this list
  const kundanInList = users.find(u => u.username === 'kundan');
  console.log(`\nKundan in leaderboard list: ${!!kundanInList}`);
  if (kundanInList) {
    console.log(`Kundan's position: ${users.findIndex(u => u.username === 'kundan') + 1}`);
  }
  
  mongoose.connection.close();
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}