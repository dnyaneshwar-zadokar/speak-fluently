import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { levels } from './data/levels.js';

dotenv.config();

const initializeTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Create a test user for demonstration
    let testUser = await User.findOne({ username: 'testuser' });
    
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        completedLevels: [],
        currentLevel: 1,
        levelProgress: 0
      });
      
      testUser = await newUser.save();
      console.log('Created test user: testuser');
    } else {
      console.log('Test user already exists');
    }

    // Display level structure
    console.log('\n=== AI Communication Mentor Levels ===');
    console.log(`Total Levels: ${levels.length}`);
    
    console.log('\nLevel Structure:');
    console.log('Levels 1-10:  Beginner - Text-based learning');
    console.log('Levels 11-15: Intermediate - Text/Voice sentence formation');
    console.log('Levels 16-20: Advanced - Voice fluency');
    console.log('Levels 21-25: Professional - Advanced communication');
    
    console.log('\nSample Levels:');
    levels.slice(0, 3).forEach(level => {
      console.log(`Level ${level.id}: ${level.title}`);
      console.log(`  - Interaction: ${level.interaction}`);
      console.log(`  - XP Reward: ${level.xpReward}`);
      console.log(`  - Questions: ${level.questions.length}`);
    });

    mongoose.connection.close();
    console.log('\nInitialization complete!');
    
  } catch (error) {
    console.error('Error initializing test data:', error);
    process.exit(1);
  }
};

initializeTestUsers();