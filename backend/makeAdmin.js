import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '.env') });

// Get username from command line arguments
const args = process.argv.slice(2);
const targetUsername = args[0];

// Add more logging
console.log('Connecting to database...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    if (targetUsername) {
      // Make specific user an admin
      console.log(`Looking for user with username: ${targetUsername}`);
      const user = await User.findOne({ username: targetUsername });
      if (!user) {
        console.log(`No user found with username: ${targetUsername}`);
        mongoose.connection.close();
        return;
      }
      
      console.log(`Making user ${user.username} (${user.email}) an admin...`);
      user.isAdmin = true;
      await user.save();
      console.log(`User ${user.username} (${user.email}) is now an admin`);
    } else {
      // List all users and their admin status
      console.log('Listing all users in the database:');
      const allUsers = await User.find();
      console.log(`Found ${allUsers.length} users in the database`);
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - isAdmin: ${user.isAdmin ? 'YES' : 'NO'}`);
      });
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });