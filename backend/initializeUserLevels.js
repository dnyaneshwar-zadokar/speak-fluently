import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speak-better')
  .then(async () => {
    console.log('Connected to database');
    
    // Find all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    let updatedCount = 0;
    
    // Update each user's level based on their points
    for (const user of users) {
      const correctLevel = Math.max(1, Math.floor(user.totalPoints / 100) + 1);
      
      if (user.level !== correctLevel) {
        await User.findByIdAndUpdate(user._id, { level: correctLevel });
        console.log(`Updated ${user.username} from level ${user.level} to ${correctLevel}`);
        updatedCount++;
      }
    }
    
    console.log(`Updated levels for ${updatedCount} users`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });